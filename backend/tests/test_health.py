from fastapi.testclient import TestClient
from backend.src.main import app
from backend.src.core.config import Settings

client = TestClient(app)


def test_root_health_endpoint():
    """
    Verifies Phase 1 acceptance criteria:
    GET /health returns {'status': 'ok', 'version': '0.1.0'} with HTTP 200.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok", "version": "0.1.0"}


def test_api_v1_health_endpoint():
    """
    Verifies detailed diagnostic health endpoint at /api/v1/health.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert data["app_name"] == "PackDrashiti"
    assert "subsystems" in data
    assert data["subsystems"]["database"] == "configured"
    assert data["subsystems"]["redis"] == "configured"


def test_root_index_endpoint():
    """
    Verifies root index endpoint / returns service information.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "PackDrashiti"
    assert data["version"] == "0.1.0"
    assert data["status"] == "operational"


def test_settings_cors_parsing():
    """
    Verifies that CORS origins are parsed correctly into a list.
    """
    test_settings = Settings(CORS_ORIGINS="http://localhost:5173,http://example.com")
    assert isinstance(test_settings.CORS_ORIGINS, list)
    assert "http://localhost:5173" in test_settings.CORS_ORIGINS
    assert "http://example.com" in test_settings.CORS_ORIGINS
