"""Export a user's uploaded research corpus for answerability annotation.

Run from backend/ with the same environment/database used by Dasaiko.
The export contains chunk text and provenance, but deliberately creates no
questions, labels, or gold answers: those require human annotation.
"""
import argparse
import json
from pathlib import Path

from app.db.session import SessionLocal
from app.models.chunk import Chunk
from app.models.document import Document


def export_corpus(user_id: int, output: Path) -> dict:
    db = SessionLocal()
    try:
        documents = (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.id.asc())
            .all()
        )
        rows = []
        for document in documents:
            chunks = (
                db.query(Chunk)
                .filter(Chunk.document_id == document.id)
                .order_by(Chunk.page_number.asc(), Chunk.chunk_index.asc())
                .all()
            )
            for chunk in chunks:
                rows.append({
                    "source_id": f"chunk:{chunk.id}",
                    "document_id": document.id,
                    "document_title": document.title,
                    "chunk_id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                    "text": chunk.content,
                })
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            json.dumps(rows, ensure_ascii=False, indent=2) + "\\n",
            encoding="utf-8",
        )
        return {"document_count": len(documents), "chunk_count": len(rows)}
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--user-id", type=int, required=True)
    parser.add_argument("--output", type=Path, default=Path("artifacts/rag_corpus.json"))
    args = parser.parse_args()
    summary = export_corpus(args.user_id, args.output)
    print(f"Exported {summary['chunk_count']} chunks from {summary['document_count']} documents.")
    print(f"Corpus written to {args.output}. Review access controls before sharing this file.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
