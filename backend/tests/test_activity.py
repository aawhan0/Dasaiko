import pytest
from pydantic import ValidationError

from app.schemas.activity import ResearchActivityCreate


def test_research_activity_accepts_supported_event_types():
    request = ResearchActivityCreate(
        paper_id="paper-1",
        event_type="paper_revisited",
    )

    assert request.event_type == "paper_revisited"


def test_research_activity_rejects_unknown_event_type():
    with pytest.raises(ValidationError):
        ResearchActivityCreate(
            paper_id="paper-1",
            event_type="paper_liked",
        )
