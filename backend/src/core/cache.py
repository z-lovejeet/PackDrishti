import time
import threading
from typing import Any, Optional, Dict
from cachetools import TTLCache
from backend.src.core.config import settings


class InMemoryCacheManager:
    """
    Thread-safe, zero-manual-step in-memory cache manager.
    Eliminates external Redis dependencies for token denylisting,
    statutory rule lookup tables, and sliding-window rate limiting.
    """

    def __init__(self, default_ttl: int = 3600, max_entries: int = 1000):
        self._lock = threading.Lock()
        self._default_ttl = default_ttl
        self._max_entries = max_entries

        # TTLCache automatically purges expired entries on access
        self._token_denylist: TTLCache = TTLCache(maxsize=max_entries, ttl=86400)
        self._rule_cache: TTLCache = TTLCache(maxsize=max_entries, ttl=default_ttl)
        self._rate_limit_windows: Dict[str, list] = {}

    def is_token_revoked(self, jti: str) -> bool:
        """
        Returns True if the JWT ID (jti) has been marked as revoked/consumed.
        """
        with self._lock:
            return jti in self._token_denylist

    def revoke_token(self, jti: str, ttl_seconds: Optional[int] = None) -> None:
        """
        Denylists a JWT ID (jti) to prevent replay or after logout.
        """
        with self._lock:
            self._token_denylist[jti] = time.time()

    def get_cached_rule(self, key: str) -> Optional[Any]:
        """
        Retrieves a cached statutory rule or calibration lookup table.
        """
        with self._lock:
            return self._rule_cache.get(key)

    def set_cached_rule(self, key: str, data: Any, ttl_seconds: Optional[int] = None) -> None:
        """
        Caches a statutory rule or lookup table in-memory.
        """
        with self._lock:
            self._rule_cache[key] = data

    def check_rate_limit(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """
        Sliding-window rate limiter.
        Returns True if the request is permitted, False if the rate limit is exceeded.
        """
        now = time.time()
        cutoff = now - window_seconds

        with self._lock:
            timestamps = self._rate_limit_windows.get(key, [])
            # Filter timestamps within the current sliding window
            timestamps = [t for t in timestamps if t > cutoff]

            if len(timestamps) >= max_requests:
                self._rate_limit_windows[key] = timestamps
                return False

            timestamps.append(now)
            self._rate_limit_windows[key] = timestamps
            return True

    def clear(self) -> None:
        """
        Flushes all in-memory caches (useful for automated test isolation).
        """
        with self._lock:
            self._token_denylist.clear()
            self._rule_cache.clear()
            self._rate_limit_windows.clear()


# Global in-memory cache instance initialized with settings
cache_manager = InMemoryCacheManager(
    default_ttl=settings.CACHE_TTL_SECONDS,
    max_entries=settings.CACHE_MAX_ITEMS,
)
