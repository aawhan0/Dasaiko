from sqlalchemy.orm import sessionmaker

from app.db.database import engine
from app.services.chat_service import ChatService
from app.services.conversation_service import ConversationService


SessionLocal = sessionmaker(bind=engine)


# ============================================================
# TEST QUERIES
# ============================================================

TEST_QUERIES = [
    (
        "TEST 1 - SKIP-GRAM",
        "How does the Skip-gram model learn word representations?",
    ),
    (
        "TEST 2 - GLOVE",
        "What is the main idea behind GloVe?",
    ),
    (
        "TEST 3 - CBOW VS SKIP-GRAM",
        "Compare CBOW and Skip-gram.",
    ),
]


# ============================================================
# RUN TESTS
# ============================================================

db = SessionLocal()

try:

    for test_name, query in TEST_QUERIES:

        print()
        print()
        print("=" * 120)
        print(test_name)
        print("=" * 120)

        print()
        print("QUERY:")
        print(query)

        # ----------------------------------------------------
        # Create fresh conversation
        # ----------------------------------------------------

        conversation = (
            ConversationService.create_conversation(
                db=db,
                user_id=1,
                title="RAG Evaluation",
            )
        )

        print()
        print(
            "CONVERSATION:",
            conversation.id,
        )

        # ----------------------------------------------------
        # Run ChatService
        # ----------------------------------------------------

        try:

            answer, evidence, extra = (
                ChatService.chat(
                    db=db,
                    conversation_id=conversation.id,
                    user_id=1,
                    query=query,
                )
            )

        except Exception as exc:

            print()
            print("=" * 120)
            print("TEST FAILED")
            print("=" * 120)

            print(
                type(exc).__name__,
                ":",
                exc,
            )

            print(
                "=" * 120
            )

            continue

        # ----------------------------------------------------
        # FINAL ANSWER
        # ----------------------------------------------------

        print()
        print("=" * 120)
        print("FINAL ANSWER")
        print("=" * 120)

        print(
            answer
        )

        # ----------------------------------------------------
        # EVIDENCE
        # ----------------------------------------------------

        print()
        print("=" * 120)
        print("EVIDENCE")
        print("=" * 120)

        if not evidence:

            print(
                "NO EVIDENCE RETURNED"
            )

        else:

            for index, item in enumerate(
                evidence,
                start=1,
            ):

                print(
                    f"{index}. "
                    f"Chunk={item['id']} | "
                    f"Doc={item['document_name']} | "
                    f"Page={item['page_number']} | "
                    f"Score={item['score']}"
                )

        # ----------------------------------------------------
        # CITATION DIAGNOSTICS
        # ----------------------------------------------------

        print()
        print("=" * 120)
        print("CITATION DIAGNOSTICS")
        print("=" * 120)

        import re

        citations = re.findall(
            r"\[SOURCE_(\d+)\]",
            answer or "",
        )

        if citations:

            print(
                "Citations found:",
                ", ".join(
                    f"SOURCE_{number}"
                    for number in citations
                ),
            )

            evidence_count = (
                len(evidence)
                if evidence
                else 0
            )

            invalid_citations = [
                number
                for number in citations
                if int(number) < 1
                or int(number) > evidence_count
            ]

            if invalid_citations:

                print(
                    "INVALID CITATIONS:",
                    ", ".join(
                        f"SOURCE_{number}"
                        for number in invalid_citations
                    ),
                )

            else:

                print(
                    "Citation IDs are valid."
                )

        else:

            print(
                "NO SOURCE CITATIONS FOUND"
            )

        # ----------------------------------------------------
        # TEST END
        # ----------------------------------------------------

        print()
        print("=" * 120)
        print(
            f"{test_name} COMPLETE"
        )
        print("=" * 120)


finally:

    db.close()


print()
print()
print("=" * 120)
print("ALL THREE RAG TESTS COMPLETE")
print("=" * 120)