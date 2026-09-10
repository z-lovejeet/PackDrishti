import uuid
from dataclasses import dataclass
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from backend.src.core.config import settings
from backend.src.core.cache import cache_manager
import bcrypt
from backend.src.models.user import UserRole

# Bearer token HTTP scheme
security_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: uuid.UUID
    email: str
    role: UserRole
    badge_number: Optional[str] = None
    zone: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    to_encode = data.copy()
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_supabase_token(token: str) -> dict:
    """
    Decodes and validates a Supabase Auth JWT token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> CurrentUser:
    """
    Dependency that extracts, verifies, and validates the current caller from the Supabase JWT.
    Checks the in-memory token denylist to reject revoked sessions immediately.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_supabase_token(token)

    # Check token denylist
    jti = payload.get("jti")
    if jti and cache_manager.is_token_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract subject identifier (user id)
    user_id_raw = payload.get("sub")
    if not user_id_raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier (sub).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(user_id_raw)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid subject identifier format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("email", "")

    # Resolve user role from Supabase metadata or top-level role claim
    app_metadata = payload.get("app_metadata", {})
    user_metadata = payload.get("user_metadata", {})
    raw_role = app_metadata.get("role") or user_metadata.get("role") or payload.get("role", "consumer")

    try:
        user_role = UserRole(raw_role)
    except ValueError:
        user_role = UserRole.CONSUMER

    badge_number = user_metadata.get("badge_number") or payload.get("badge_number")
    zone = user_metadata.get("zone") or payload.get("zone")

    return CurrentUser(
        id=user_id,
        email=email,
        role=user_role,
        badge_number=badge_number,
        zone=zone,
    )


def require_consumer_role(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Allows all authenticated roles (consumer, officer, admin).
    """
    return current_user


def require_officer_role(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Restricts access strictly to verified enforcement officers and admins.
    """
    if current_user.role not in (UserRole.OFFICER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Legal Metrology Enforcement Officers.",
        )
    return current_user


def require_admin_role(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Restricts access strictly to system administrators.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires system administrator privileges.",
        )
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[CurrentUser]:
    """
    Optional authentication dependency.
    Returns CurrentUser if valid bearer credentials are provided, else None.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
