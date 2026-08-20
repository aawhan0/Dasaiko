from __future__ import annotations

import json
from pathlib import Path

from dotenv import load_dotenv

# Load .env BEFORE importing services that depend on environment variables.
load_dotenv()

from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.models.chunk import Chunk
from app.models.document import Document
from app.services.search_service import SearchService


# ============================================================
# CONFIGURATION
# ============================================================

SessionLocal = sessionmaker(bind=engine)

USER_ID = 1

TOP_K = 10

OUTPUT_FILE = (
    Path(__file__).parent
    / "datasets"
    / "retrieval_cases_current.json"
)


# ============================================================
# EVALUATION QUERIES
# ============================================================

EVALUATION_CASES = [

    # ========================================================
    # ATTENTION IS ALL YOU NEED
    # ========================================================

    {
        "id": "attn_01",
        "query": "How does scaled dot-product attention work?",
        "expected_document_id": 3,
        "category": "direct",
    },

    {
        "id": "attn_02",
        "query": "Why does the Transformer use multi-head attention?",
        "expected_document_id": 3,
        "category": "direct",
    },

    {
        "id": "attn_03",
        "query": "Why does the Transformer remove recurrence?",
        "expected_document_id": 3,
        "category": "multi_chunk",
    },

    {
        "id": "attn_04",
        "query": (
            "What advantage does the Transformer gain "
            "from removing recurrence?"
        ),
        "expected_document_id": 3,
        "category": "multi_chunk",
    },

    {
        "id": "attn_05",
        "query": (
            "What translation performance does "
            "the Transformer achieve?"
        ),
        "expected_document_id": 3,
        "category": "direct",
    },


    # ========================================================
    # NEURAL MACHINE TRANSLATION
    # ========================================================

    {
        "id": "nmt_01",
        "query": (
            "What problem does attention solve "
            "in neural machine translation?"
        ),
        "expected_document_id": 4,
        "category": "direct",
    },

    {
        "id": "nmt_02",
        "query": (
            "How does the attention model "
            "compute the context vector?"
        ),
        "expected_document_id": 4,
        "category": "multi_chunk",
    },

    {
        "id": "nmt_03",
        "query": (
            "Why does attention help the encoder-decoder "
            "translate long sentences?"
        ),
        "expected_document_id": 4,
        "category": "multi_chunk",
    },

    {
        "id": "nmt_04",
        "query": (
            "Why is soft alignment useful "
            "for translating phrases?"
        ),
        "expected_document_id": 4,
        "category": "direct",
    },


    # ========================================================
    # WORD2VEC
    # ========================================================

    {
        "id": "w2v_01",
        "query": (
            "How does the Skip-gram model "
            "learn word representations?"
        ),
        "expected_document_id": 2,
        "category": "direct",
    },

    {
        "id": "w2v_02",
        "query": (
            "How does hierarchical softmax reduce "
            "the computational cost of softmax?"
        ),
        "expected_document_id": 2,
        "category": "direct",
    },

    {
        "id": "w2v_03",
        "query": (
            "Why does the Skip-gram paper "
            "use a Huffman tree?"
        ),
        "expected_document_id": 2,
        "category": "direct",
    },

    {
        "id": "w2v_04",
        "query": (
            "What do the phrase analogy experiments "
            "demonstrate about Skip-gram representations?"
        ),
        "expected_document_id": 2,
        "category": "multi_chunk",
    },


    # ========================================================
    # GLOVE
    # ========================================================

    {
        "id": "glove_01",
        "query": "What is the main idea behind GloVe?",
        "expected_document_id": 5,
        "category": "direct",
    },

    {
        "id": "glove_02",
        "query": (
            "How does GloVe use "
            "word co-occurrence statistics?"
        ),
        "expected_document_id": 5,
        "category": "multi_chunk",
    },

    {
        "id": "glove_03",
        "query": (
            "How does GloVe relate to prediction-based "
            "word-vector models such as skip-gram?"
        ),
        "expected_document_id": 5,
        "category": "multi_chunk",
    },

    {
        "id": "glove_04",
        "query": (
            "What happens to GloVe performance "
            "when the training corpus becomes much larger?"
        ),
        "expected_document_id": 5,
        "category": "multi_chunk",
    },


    # ========================================================
    # SEQUENCE TO SEQUENCE
    # ========================================================

    {
        "id": "seq_01",
        "query": (
            "Why are sequences challenging for "
            "standard feedforward neural networks?"
        ),
        "expected_document_id": 1,
        "category": "direct",
    },

    {
        "id": "seq_02",
        "query": (
            "How does the LSTM encoder-decoder model "
            "represent an input sequence?"
        ),
        "expected_document_id": 1,
        "category": "direct",
    },

    {
        "id": "seq_03",
        "query": (
            "How does beam search generate translations "
            "in the sequence-to-sequence model?"
        ),
        "expected_document_id": 1,
        "category": "direct",
    },
]


# ============================================================
# DATABASE HELPERS
# ============================================================

def get_chunk(db, chunk_id: int):

    return (
        db.query(Chunk)
        .filter(
            Chunk.id == chunk_id
        )
        .first()
    )


def get_document(db, document_id: int):

    return (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )


# ============================================================
# DISPLAY
# ============================================================

def display_candidate(
    rank: int,
    result: dict,
    chunk,
    document,
):
    print()
    print("=" * 100)

    print(
        f"[{rank}] "
        f"Chunk ID={chunk.id} | "
        f"Chunk Index={chunk.chunk_index} | "
        f"Page={chunk.page_number}"
    )

    print(
        f"Document ID={document.id} | "
        f"Document={document.title}"
    )

    print(
        f"Score={result.get('score', 0):.6f}"
    )

    print("=" * 100)

    # IMPORTANT:
    # Print the COMPLETE chunk.
    # No [:500], [:700], etc.
    print(chunk.content)

    print("=" * 100)


# ============================================================
# USER ANNOTATION
# ============================================================

def ask_for_relevant_chunks(candidates):

    print()
    print(
        "Which retrieved chunks actually contain "
        "evidence needed to answer the query?"
    )

    print()
    print(
        "Enter ranks separated by commas."
    )

    print(
        "Example: 1,3"
    )

    print(
        "Enter 'none' if none are relevant."
    )

    while True:

        value = input(
            "\nRelevant chunks: "
        ).strip()

        if value.lower() == "none":

            return []

        try:

            ranks = [
                int(value.strip())
                for value in value.split(",")
                if value.strip()
            ]

            ranks = list(
                dict.fromkeys(ranks)
            )

            if not ranks:

                print(
                    "Please enter at least one rank."
                )

                continue

            invalid = [
                rank
                for rank in ranks
                if rank < 1
                or rank > len(candidates)
            ]

            if invalid:

                print(
                    f"Invalid ranks: {invalid}"
                )

                continue

            return [
                candidates[rank - 1]
                for rank in ranks
            ]

        except ValueError:

            print(
                "Invalid input."
            )

            print(
                "Example: 1,3"
            )


# ============================================================
# MAIN
# ============================================================

def main():

    db = SessionLocal()

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    dataset = []

    try:

        print()
        print("=" * 100)
        print("DASAIKO RETRIEVAL DATASET ANNOTATION")
        print("=" * 100)

        print()
        print(
            f"User ID: {USER_ID}"
        )

        print(
            f"Top-K candidates: {TOP_K}"
        )

        print()
        print(
            "Retrieval pipeline:"
        )

        print(
            "SearchService"
            " -> Vector + BM25"
            " -> Hybrid"
            " -> BGE Reranker"
        )

        print("=" * 100)

        # ----------------------------------------------------
        # Verify documents
        # ----------------------------------------------------

        print()
        print(
            "CURRENT DOCUMENTS"
        )

        print("-" * 100)

        documents = (
            db.query(Document)
            .filter(
                Document.user_id == USER_ID
            )
            .order_by(
                Document.id
            )
            .all()
        )

        for document in documents:

            chunk_count = (
                db.query(Chunk)
                .filter(
                    Chunk.document_id
                    == document.id
                )
                .count()
            )

            print(
                f"{document.id} | "
                f"{document.title} | "
                f"{chunk_count} chunks"
            )

        print("=" * 100)

        # ----------------------------------------------------
        # Process every evaluation case
        # ----------------------------------------------------

        for case_number, case in enumerate(
            EVALUATION_CASES,
            start=1,
        ):

            print()
            print()
            print("#" * 100)

            print(
                f"CASE {case_number}/"
                f"{len(EVALUATION_CASES)}"
            )

            print(
                f"ID: {case['id']}"
            )

            print(
                f"QUERY: {case['query']}"
            )

            expected_document = get_document(
                db,
                case["expected_document_id"],
            )

            if expected_document:

                print(
                    f"Expected document: "
                    f"{expected_document.title}"
                )

            print("#" * 100)

            # ------------------------------------------------
            # REAL PRODUCTION SEARCH
            # ------------------------------------------------

            print()
            print(
                "Running SearchService..."
            )

            results = SearchService.search(
                db=db,
                query=case["query"],
                user_id=USER_ID,
                limit=TOP_K,
                document_id=None,
            )

            # ------------------------------------------------
            # Handle no results
            # ------------------------------------------------

            if not results:

                print()
                print(
                    "NO RESULTS RETURNED."
                )

                annotation = {
                    "id": case["id"],
                    "query": case["query"],
                    "expected_document_id": (
                        case["expected_document_id"]
                    ),
                    "expected_document_title": (
                        expected_document.title
                        if expected_document
                        else None
                    ),
                    "relevant_chunk_ids": [],
                    "retrieved_chunk_ids": [],
                    "retrieved_document_ids": [],
                    "category": case["category"],
                }

                dataset.append(
                    annotation
                )

                save_dataset(
                    dataset
                )

                continue

            # ------------------------------------------------
            # Resolve returned chunks
            # ------------------------------------------------

            candidates = []

            for result in results:

                chunk_id = result.get(
                    "id"
                )

                if chunk_id is None:

                    chunk_id = result.get(
                        "chunk_id"
                    )

                if chunk_id is None:

                    continue

                chunk = get_chunk(
                    db,
                    chunk_id,
                )

                if chunk is None:

                    continue

                document = get_document(
                    db,
                    chunk.document_id,
                )

                if document is None:

                    continue

                candidates.append(
                    {
                        "result": result,
                        "chunk": chunk,
                        "document": document,
                    }
                )

            if not candidates:

                print(
                    "Search returned results, "
                    "but no chunks could be resolved."
                )

                continue

            # ------------------------------------------------
            # Display retrieved candidates
            # ------------------------------------------------

            print()
            print(
                "=" * 100
            )

            print(
                "RETRIEVED CANDIDATES"
            )

            print(
                "=" * 100
            )

            for rank, candidate in enumerate(
                candidates,
                start=1,
            ):

                display_candidate(
                    rank=rank,
                    result=candidate["result"],
                    chunk=candidate["chunk"],
                    document=candidate["document"],
                )

            # ------------------------------------------------
            # Human annotation
            # ------------------------------------------------

            relevant = ask_for_relevant_chunks(
                candidates
            )

            relevant_chunk_ids = [
                item["chunk"].id
                for item in relevant
            ]

            retrieved_chunk_ids = [
                item["chunk"].id
                for item in candidates
            ]

            retrieved_document_ids = list(
                dict.fromkeys(
                    item["chunk"].document_id
                    for item in candidates
                )
            )

            # ------------------------------------------------
            # Create annotation record
            # ------------------------------------------------

            annotation = {
                "id": case["id"],
                "query": case["query"],
                "expected_document_id": (
                    case["expected_document_id"]
                ),
                "expected_document_title": (
                    expected_document.title
                    if expected_document
                    else None
                ),
                "relevant_chunk_ids": (
                    relevant_chunk_ids
                ),
                "retrieved_chunk_ids": (
                    retrieved_chunk_ids
                ),
                "retrieved_document_ids": (
                    retrieved_document_ids
                ),
                "category": case["category"],
            }

            dataset.append(
                annotation
            )

            # ------------------------------------------------
            # Save after EVERY query
            # ------------------------------------------------

            save_dataset(
                dataset
            )

            print()
            print(
                "ANNOTATION SAVED"
            )

            print(
                json.dumps(
                    annotation,
                    indent=2,
                )
            )

        # ----------------------------------------------------
        # Finished
        # ----------------------------------------------------

        print()
        print("=" * 100)
        print("ANNOTATION COMPLETE")
        print("=" * 100)

        print(
            f"Cases completed: "
            f"{len(dataset)}/"
            f"{len(EVALUATION_CASES)}"
        )

        print()
        print(
            f"Saved to:"
        )

        print(
            OUTPUT_FILE
        )

    finally:

        db.close()


# ============================================================
# SAVE DATASET
# ============================================================

def save_dataset(dataset):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            dataset,
            file,
            indent=4,
            ensure_ascii=False,
        )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()