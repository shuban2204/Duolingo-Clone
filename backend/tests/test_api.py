from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed import seed_database


def make_client(tmp_path: Path) -> TestClient:
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as db:
        seed_database(db)

    def override_db():
        with factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_db
    return TestClient(app)


def test_path_has_full_seed_and_no_answers(tmp_path: Path):
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/courses/1/path", headers={"X-Demo-User-Id": "1"})
        assert response.status_code == 200
        payload = response.json()
        assert len(payload["units"]) == 3
        assert sum(len(unit["skills"]) for unit in payload["units"]) == 9
        lesson = client.get("/api/v1/lessons/1", headers={"X-Demo-User-Id": "1"}).json()
        assert len(lesson["exercises"]) == 5
        assert "accepted_answers" not in str(lesson)
        assert "canonical_answer" not in str(lesson)


def test_locked_lesson_is_rejected(tmp_path: Path):
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/lessons/27", headers={"X-Demo-User-Id": "1"})
        assert response.status_code == 403
        assert response.json()["code"] == "skill_locked"


def test_wrong_answer_costs_a_heart(tmp_path: Path):
    with make_client(tmp_path) as client:
        headers = {"X-Demo-User-Id": "1"}
        attempt = client.post("/api/v1/attempts", headers=headers, json={"lesson_id": 1, "mode": "STANDARD"}).json()
        result = client.post(f"/api/v1/attempts/{attempt['id']}/answers", headers=headers, json={"exercise_id": attempt["exercises"][0]["id"], "answer": "definitely wrong"})
        assert result.status_code == 200
        assert result.json()["hearts"] == 3
