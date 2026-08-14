from groq import Groq

from app.core.config import settings


client = Groq(
    api_key=settings.groq_api_key
)


class QueryRewriterService:

    @staticmethod
    def rewrite(
        conversation_history: str,
        query: str,
    ) -> str:

        original_query = (
            query or ""
        ).strip()

        if not original_query:
            return original_query

        prompt = f"""
You are the query-rewriting component of Dasaiko,
an AI-powered research assistant.

Your ONLY task is to transform the user's CURRENT QUESTION
into the best standalone search query for retrieving relevant
passages from research documents.

You MUST NOT answer the question.

==================================================
CORE PRINCIPLE
==================================================

Rewrite ONLY when doing so improves retrieval.

If the current question is already clear and standalone,
return it unchanged or make only a minimal clarification.

Do not rewrite a query merely because you can make it longer.

The rewritten query must preserve the user's original intent.

==================================================
CONVERSATION HISTORY
==================================================

{conversation_history}

==================================================
CURRENT QUESTION
==================================================

{original_query}

==================================================
REFERENCE RESOLUTION
==================================================

Use the conversation history to resolve references such as:

- it
- this
- that
- they
- them
- its
- their
- this paper
- the paper
- this model
- the model
- this method
- the method
- this approach
- the approach
- this architecture
- the architecture
- this technique
- the technique

When resolving a reference, prefer the most recent relevant
user/assistant exchange.

Example:

Previous:
User: What is Dense Passage Retrieval?
Assistant: DPR is a dense retrieval method for open-domain QA.

Current:
How does it work?

Rewrite:
How does Dense Passage Retrieval work?

==================================================
DO NOT CONTAMINATE STANDALONE QUESTIONS
==================================================

A standalone question must remain independent from previous
conversation unless the question clearly contains a reference
that requires resolution.

Example:

Previous:
User: What is Dense Passage Retrieval?

Current:
What is BM25?

Correct:
What is BM25?

Incorrect:
What is BM25 compared with Dense Passage Retrieval?

Do NOT inject the previous topic into a new standalone question.

==================================================
PRESERVE USER INTENT
==================================================

Do not:

- change the question's meaning
- broaden the question
- narrow the question
- add comparisons
- add requested constraints that were not present
- remove important constraints
- invent entities
- invent papers
- invent methods
- invent results
- answer the question

If the user asks:

"What are the limitations?"

and the conversation clearly establishes that "its" refers
to Dense Passage Retrieval, rewrite it as:

"What are the limitations of Dense Passage Retrieval?"

Do NOT add:

"compared with BM25"

unless the user explicitly asks for that comparison.

==================================================
SELECTED-PAPER LANGUAGE
==================================================

When the conversation clearly establishes that the user is
discussing a specific research paper, phrases such as:

- this paper
- the paper
- this study
- this work
- this method

may refer to that paper or its proposed method.

Resolve the reference when necessary for retrieval.

However, do NOT automatically insert the paper title into
every query.

Only add the specific entity when it is necessary to resolve
an otherwise ambiguous reference.

==================================================
QUESTION TYPES
==================================================

### Standalone factual question

User:
What is BM25?

Output:
What is BM25?

--------------------------------------------------

### Follow-up question

Conversation:
User: What is Dense Passage Retrieval?
Assistant: Dense Passage Retrieval is a neural retrieval method.

Current:
How does it work?

Output:
How does Dense Passage Retrieval work?

--------------------------------------------------

### Follow-up with pronoun

Conversation:
User: What is DPR?
Assistant: DPR uses dense vector representations.

Current:
What are its limitations?

Output:
What are the limitations of Dense Passage Retrieval?

--------------------------------------------------

### Follow-up with demonstrative

Conversation:
User: What problem does the paper address?
Assistant: It addresses retrieval quality in open-domain QA.

Current:
Why is this difficult?

Output:
Why is retrieval difficult in open-domain question answering?

--------------------------------------------------

### Explicit topic change

Conversation:
User: Explain DPR.

Current:
What is the capital of France?

Output:
What is the capital of France?

--------------------------------------------------

### Explicit comparison

Conversation:
User: What is DPR?

Current:
How does it compare with BM25?

Output:
How does Dense Passage Retrieval compare with BM25?

--------------------------------------------------

### No unnecessary rewriting

Conversation:
User: What are the advantages of BM25?

Current:
What are the advantages of BM25?

Output:
What are the advantages of BM25?

==================================================
RETRIEVAL QUALITY
==================================================

The output should be a natural-language search query.

Preserve important technical terminology from the user's
question.

Prefer precise terminology over vague substitutions.

For example:

"How does it work?"

should become a query containing the actual established
concept, such as:

"How does Dense Passage Retrieval work?"

Do not turn the query into a keyword list.

Do not add search-engine syntax.

Do not add quotation marks.

Do not add metadata such as "search query:".

==================================================
CONVERSATION PRIORITY
==================================================

When resolving references, use this priority:

1. The current question.
2. The most recent relevant user message.
3. The most recent relevant assistant response.
4. Older conversation only when necessary.

Do not let an older topic override a newer explicit topic.

If the current question is ambiguous and the conversation
does not provide enough information to resolve it safely,
return the original question rather than guessing.

==================================================
OUTPUT RULES
==================================================

1. Return exactly ONE search query.

2. Return ONLY the rewritten query.

3. Do NOT answer the question.

4. Do NOT explain the rewriting.

5. Do NOT include prefixes such as:
   "Rewritten query:"
   "Query:"
   "Search query:"

6. Do NOT wrap the query in quotation marks.

7. Do NOT use Markdown.

8. Do NOT add multiple alternatives.

9. Do NOT add commentary before or after the query.

==================================================
FINAL REQUIREMENT
==================================================

Return exactly one standalone search query.

Nothing else.

Rewritten query:
"""

        try:

            response = (
                client
                .chat
                .completions
                .create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    temperature=0,
                )
            )

            rewritten_query = (
                response
                .choices[0]
                .message
                .content
                .strip()
            )

            # ----------------------------------------
            # Safety fallback
            # ----------------------------------------

            if not rewritten_query:
                return original_query

            # ----------------------------------------
            # Remove accidental wrapping quotation marks
            # ----------------------------------------

            if (
                len(rewritten_query) >= 2
                and (
                    (
                        rewritten_query[0] == '"'
                        and rewritten_query[-1] == '"'
                    )
                    or
                    (
                        rewritten_query[0] == "'"
                        and rewritten_query[-1] == "'"
                    )
                )
            ):

                rewritten_query = (
                    rewritten_query[1:-1]
                    .strip()
                )

            # ----------------------------------------
            # Defensive cleanup
            # ----------------------------------------

            prefixes = (
                "rewritten query:",
                "rewritten_query:",
                "search query:",
                "query:",
            )

            lowered = (
                rewritten_query.lower()
            )

            for prefix in prefixes:

                if lowered.startswith(prefix):

                    rewritten_query = (
                        rewritten_query[
                            len(prefix):
                        ]
                        .strip()
                    )

                    break

            # ----------------------------------------
            # Reject obviously invalid multi-line output.
            #
            # The rewriter must return exactly one query.
            # If the model accidentally returns commentary,
            # falling back to the original query is safer
            # than sending polluted text into retrieval.
            # ----------------------------------------

            if not rewritten_query:
                return original_query

            if "\n" in rewritten_query:
                lines = [
                    line.strip()
                    for line in rewritten_query.splitlines()
                    if line.strip()
                ]

                if len(lines) != 1:
                    return original_query

                rewritten_query = lines[0]

            return rewritten_query

        except Exception as e:

            print(
                "⚠ Query rewriting failed."
            )

            print(e)

            # ----------------------------------------
            # Retrieval must never fail simply because
            # the optional query-rewriting step failed.
            # ----------------------------------------

            return original_query
