import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.session_store import session_store


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
async def _clear_sessions():
    yield
    session_store._sessions.clear()  # type: ignore[attr-defined]
