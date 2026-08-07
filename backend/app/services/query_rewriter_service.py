from groq import Groq

from app.core.config import settings

client = Groq(api_key=settings.groq_api_key)


class QueryRewriterService:

    @staticmethod
    def rewrite(
        conversation_history: str,
        query: str,
    ) -> str:

        prompt = f"""
Conversation:

{conversation_history}

Current Question:
{query}

Rewrite ONLY the current question into a standalone search query.

Rules:
- Preserve the user's intent.
- Resolve pronouns like it, this, that, paper, model, architecture.
- Do not answer.
- Return ONLY the rewritten query.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )

        return response.choices[0].message.content.strip()