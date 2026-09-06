from app.data.paper_catalog import PAPER_CATALOG

class ResearchPathService:
    @staticmethod
    def build(topic: str, limit: int = 5):
        normalized = topic.strip().casefold()
        matches = [p for p in PAPER_CATALOG if normalized in {t.casefold() for t in p.topics}]
        matches.sort(key=lambda p: ({"Foundational": 0, "Accessible": 1, "Intermediate": 2}.get(p.difficulty, 1), -p.importance, p.id))
        stages = ["Foundation", "Core", "Bridge", "Deep Dive", "Next Step"]
        return [(p, stages[min(i, len(stages)-1)]) for i, p in enumerate(matches[:max(1, min(limit, 10))])]
