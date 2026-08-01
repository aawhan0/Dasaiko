from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.search_service import SearchService


client = Groq(
    api_key=settings.groq_api_key,
)


class ChatService:

    @staticmethod
    def chat(
        db: Session,
        query: str,
    ) -> str:

        results = SearchService.search(
            db=db,
            query=query,
            limit=5,
        )

        context = "\n\n".join(
            chunk.content
            for chunk, _ in results
        )

        print("\n" + "=" * 100)
        print("QUESTION:")
        print(query)
        print("=" * 100)
        print("CONTEXT SENT TO LLM:")
        print(context)
        print("=" * 100 + "\n")

        prompt = f"""
You are an expert research assistant.

Use ONLY the context below to answer the user's question.

If the answer can be inferred from the context, answer it clearly.

If the answer is truly missing from the context, reply exactly:
"I don't have enough information in the uploaded documents."

Context:
{context}

Question:
{query}

Answer:
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You answer questions strictly from the provided context. "
                        "If the answer exists in the context, summarize it in your own words."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )

        answer = response.choices[0].message.content

        print("\n" + "=" * 100)
        print("LLM ANSWER:")
        print(answer)
        print("=" * 100 + "\n")

        return answer