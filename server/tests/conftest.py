"""
Pytest loads this file before tests. TESTING + SQLite must be set before `app` imports `database`.
"""
import os

import pytest

os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["PUBLIC_API_BASE"] = "http://testserver"

from fastapi.testclient import TestClient

from app.main import app
from app.demo_seed import run_demo_seed

run_demo_seed(public_base="http://testserver")


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
