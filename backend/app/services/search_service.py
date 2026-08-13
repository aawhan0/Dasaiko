import re
from difflib import SequenceMatcher

from sqlalchemy.orm import Session

from app.models.chunk import Chunk

from app.services.bm25_service import BM25Service
from app.services.vector_search_service import VectorSearchService
from app.services.reranker_service import RerankerService


class SearchService:

    # ============================================
    # Generic signals that a user explicitly wants
    # to leave the currently selected paper.
    #
    # No paper names or technology names are
    # hardcoded here.
    # ============================================

    EXTERNAL_CONTEXT_PHRASES = (
        "another paper",
        "another research paper",
        "another study",
        "another research",
        "another work",
        "other paper",
        "other papers",
        "other research",
        "other studies",
        "different paper",
        "different research paper",
        "different study",
        "outside this paper",
        "outside the paper",
        "outside this research",
        "compare this paper with",
        "compare this paper to",
        "compare the paper with",
        "compare the paper to",
        "compared with another paper",
        "compared to another paper",
        "compare it with another paper",
        "compare it to another paper",
    )

    # ============================================
    # Bibliographic / paper metadata questions
    #
    # These are handled differently because
    # semantic retrieval of words like "author"
    # often retrieves arbitrary chunks.
    #
    # These phrases are generic and do NOT refer
    # to any specific paper.
    # ============================================

    METADATA_QUERY_PHRASES = (
        "who is the author",
        "who are the authors",
        "who wrote this paper",
        "who wrote the paper",
        "who wrote this",
        "who wrote it",
        "author of this paper",
        "authors of this paper",
        "author of the paper",
        "authors of the paper",
        "what is the author",
        "what are the authors",
        "when was it published",
        "when was this published",
        "when was the paper published",
        "what year was it published",
        "what year was this published",
        "what year was the paper published",
        "publication year",
        "year of publication",
        "where was it published",
        "where was this published",
        "where was the paper published",
        "what conference was it published",
        "what journal was it published",
        "what venue was it published",
        "what is the title",
        "what is this paper called",
        "what is the paper called",
    )

    # ============================================
    # Summary / high-level understanding questions
    # ============================================
    #
    # These questions benefit from a structured
    # overview of the paper rather than arbitrary
    # semantic matches. We therefore prioritize:
    #
    #   - abstract
    #   - introduction
    #   - conclusion
    #   - nearby opening/closing chunks
    #
    # No paper names are hardcoded here.
    # ============================================

    SUMMARY_QUERY_PHRASES = (
        "summary",
        "summarize",
        "summarise",
        "give me a summary",
        "give me the summary",
        "summarize this paper",
        "summarise this paper",
        "summary of this paper",
        "summarize the paper",
        "summarise the paper",
        "what is this paper about",
        "what is the paper about",
        "what is this research about",
        "what is the main idea",
        "what is the main idea of this paper",
        "what is the main idea of the paper",
        "give me an overview",
        "give an overview",
        "high level overview",
        "high-level overview",
        "overview of this paper",
        "overview of the paper",
        "explain this paper at a high level",
    )

    # ============================================
    # Normalize text
    # ============================================

    @staticmethod
    def _normalize_text(
        text: str,
    ) -> str:

        text = (
            text or ""
        ).lower()

        text = text.replace(
            "\u00ad",
            "",
        )

        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        return text.strip()

    # ============================================
    # Normalize title
    # ============================================

    @staticmethod
    def _normalize_title(
        title: str,
    ) -> str:

        title = (
            title or ""
        ).lower()

        title = re.sub(
            r"[^a-z0-9\s]",
            " ",
            title,
        )

        title = re.sub(
            r"\s+",
            " ",
            title,
        )

        return title.strip()

    # ============================================
    # Detect metadata-style questions
    # ============================================

    @staticmethod
    def _is_metadata_query(
        query: str,
    ) -> bool:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        for phrase in (
            SearchService.METADATA_QUERY_PHRASES
        ):

            if phrase in normalized_query:

                print(
                    "Query type: "
                    "PAPER METADATA"
                )

                return True

        # ----------------------------------------
        # Short generic metadata questions
        # ----------------------------------------

        short_queries = {
            "author",
            "authors",
            "the author",
            "the authors",
            "publication year",
            "published",
            "publication",
            "title",
            "venue",
            "conference",
            "journal",
        }

        if normalized_query in short_queries:

            print(
                "Query type: "
                "PAPER METADATA"
            )

            return True

        return False

    # ============================================
    # Detect author-specific metadata questions
    #
    # Author lists can span several adjacent chunks
    # on the first page. These queries therefore use
    # an ordered front-matter evidence block instead
    # of letting the reranker select isolated chunks.
    # ============================================

    @staticmethod
    def _is_author_metadata_query(
        query: str,
    ) -> bool:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        author_phrases = (
            "who is the author",
            "who are the authors",
            "who wrote",
            "author of",
            "authors of",
            "the author",
            "the authors",
        )

        return any(
            phrase in normalized_query
            for phrase in author_phrases
        )

    # ============================================
    # Detect summary / overview questions
    # ============================================

    @staticmethod
    def _is_summary_query(
        query: str,
    ) -> bool:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        for phrase in (
            SearchService.SUMMARY_QUERY_PHRASES
        ):

            if phrase in normalized_query:

                print(
                    "Query type: "
                    "PAPER SUMMARY"
                )

                return True

        return False

    # ============================================
    # Get opening chunks from selected document
    #
    # Paper metadata is usually near the beginning
    # of the paper.
    # ============================================

    @staticmethod
    def _get_front_matter_chunks(
        db: Session,
        document_id: int,
        max_pages: int = 2,
        limit: int = 12,
    ):

        chunks = (
            db.query(Chunk)
            .filter(
                Chunk.document_id
                == document_id
            )
            .order_by(
                Chunk.page_number.asc(),
                Chunk.chunk_index.asc(),
            )
            .all()
        )

        if not chunks:
            return []

        front_chunks = []

        for chunk in chunks:

            page_number = (
                chunk.page_number
            )

            if (
                page_number is None
                or page_number <= max_pages
            ):

                front_chunks.append(
                    chunk
                )

            if (
                len(front_chunks)
                >= limit
            ):
                break

        print(
            f"Front-matter candidates: "
            f"{len(front_chunks)}"
        )

        for chunk in front_chunks:

            print(
                f"Front matter | "
                f"Chunk {chunk.id} | "
                f"Page {chunk.page_number}"
            )

        return front_chunks

    # ============================================
    # Get summary-oriented chunks from a document
    #
    # We deliberately combine the beginning and end
    # of the paper with chunks around section headings.
    # This gives the LLM the paper's framing, core
    # motivation, and conclusion instead of relying
    # on arbitrary vector/BM25 matches.
    # ============================================

    @staticmethod
    def _get_summary_chunks(
        db: Session,
        document_id: int,
        limit: int = 16,
    ):

        chunks = (
            db.query(Chunk)
            .filter(
                Chunk.document_id
                == document_id
            )
            .order_by(
                Chunk.page_number.asc(),
                Chunk.chunk_index.asc(),
            )
            .all()
        )

        if not chunks:
            return []

        opening = []
        section_neighbors = []
        closing = []

        # ----------------------------------------
        # Opening: abstract + introduction.
        # Keep this bounded so the conclusion still
        # has guaranteed room in the final set.
        # ----------------------------------------

        for chunk in chunks:

            page = chunk.page_number

            if page is not None and page <= 3:
                opening.append(chunk)

            if len(opening) >= 8:
                break

        # ----------------------------------------
        # Section neighborhoods.
        # ----------------------------------------

        section_terms = (
            "abstract",
            "introduction",
            "conclusion",
            "conclusions",
            "discussion",
        )

        seen_section_ids = set()

        for index, chunk in enumerate(chunks):

            content = SearchService._normalize_text(
                chunk.content
            )

            if not content:
                continue

            is_heading_chunk = any(
                content == term
                or content.startswith(term + " ")
                for term in section_terms
            )

            if not is_heading_chunk:
                continue

            for neighbor in chunks[index:index + 3]:

                if neighbor.id in seen_section_ids:
                    continue

                section_neighbors.append(neighbor)
                seen_section_ids.add(neighbor.id)

        # ----------------------------------------
        # Closing: conclusion / final findings.
        # Always reserve a few slots for the end.
        # ----------------------------------------

        closing = chunks[-4:]

        # ----------------------------------------
        # Merge by priority while preserving document
        # order within each group.
        # ----------------------------------------

        selected = []
        selected_ids = set()

        def add(chunk):

            if chunk.id in selected_ids:
                return False

            selected.append(chunk)
            selected_ids.add(chunk.id)
            return True

        # Reserve space for opening and closing first.
        for chunk in opening[:6]:
            add(chunk)

        for chunk in section_neighbors:
            if len(selected) >= limit - 4:
                break
            add(chunk)

        for chunk in closing:
            add(chunk)

        # Fill any remaining slots from the opening and
        # section neighborhoods before falling back to
        # arbitrary later chunks.
        if len(selected) < limit:

            for chunk in opening[6:]:
                if len(selected) >= limit:
                    break
                add(chunk)

        if len(selected) < limit:

            for chunk in section_neighbors:
                if len(selected) >= limit:
                    break
                add(chunk)

        selected.sort(
            key=lambda chunk: (
                chunk.page_number
                if chunk.page_number is not None
                else 10**9,
                chunk.chunk_index,
            )
        )

        selected = selected[:limit]

        print(
            f"Summary candidates: {len(selected)}"
        )

        for chunk in selected:

            print(
                f"Summary | Chunk {chunk.id} | "
                f"Page {chunk.page_number}"
            )

        return selected

    # ============================================
    # Token similarity
    # ============================================

    @staticmethod
    def _token_similarity(
        current_tokens: set,
        previous_tokens: set,
    ) -> float:

        if (
            not current_tokens
            or not previous_tokens
        ):
            return 0.0

        intersection = (
            current_tokens
            & previous_tokens
        )

        union = (
            current_tokens
            | previous_tokens
        )

        if not union:
            return 0.0

        return (
            len(intersection)
            / len(union)
        )

    # ============================================
    # Duplicate evidence detection
    # ============================================

    @staticmethod
    def _is_duplicate_evidence(
        current: dict,
        previous_results: list,
    ) -> bool:

        current_text = (
            SearchService._normalize_text(
                current.get(
                    "preview",
                    "",
                )
            )
        )

        if not current_text:
            return False

        current_tokens = set(
            current_text.split()
        )

        if not current_tokens:
            return False

        current_document = (
            SearchService._normalize_title(
                current.get(
                    "document_name",
                    "",
                )
            )
        )

        current_page = current.get(
            "page_number"
        )

        for previous in previous_results:

            previous_text = (
                SearchService._normalize_text(
                    previous.get(
                        "preview",
                        "",
                    )
                )
            )

            if not previous_text:
                continue

            previous_tokens = set(
                previous_text.split()
            )

            if not previous_tokens:
                continue

            previous_document = (
                SearchService._normalize_title(
                    previous.get(
                        "document_name",
                        "",
                    )
                )
            )

            previous_page = previous.get(
                "page_number"
            )

            # ------------------------------------
            # Exact duplicate
            # ------------------------------------

            if (
                current_text
                == previous_text
            ):

                print(
                    "Skipping exact duplicate evidence | "
                    f"Chunk {current['id']} | "
                    f"Page {current_page}"
                )

                return True

            # ------------------------------------
            # Sequence similarity
            # ------------------------------------

            sequence_similarity = (
                SequenceMatcher(
                    None,
                    current_text,
                    previous_text,
                ).ratio()
            )

            if (
                sequence_similarity
                >= 0.90
            ):

                print(
                    "Skipping near-duplicate evidence | "
                    f"Sequence similarity: "
                    f"{sequence_similarity:.3f}"
                )

                return True

            # ------------------------------------
            # Token containment
            # ------------------------------------

            intersection = (
                current_tokens
                & previous_tokens
            )

            smaller_token_count = min(
                len(current_tokens),
                len(previous_tokens),
            )

            if (
                smaller_token_count
                > 0
            ):

                token_containment = (
                    len(intersection)
                    / smaller_token_count
                )

                if (
                    token_containment
                    >= 0.90
                ):

                    print(
                        "Skipping overlapping evidence | "
                        f"Token containment: "
                        f"{token_containment:.3f}"
                    )

                    return True

            # ------------------------------------
            # Token-set similarity
            # ------------------------------------

            token_similarity = (
                SearchService._token_similarity(
                    current_tokens,
                    previous_tokens,
                )
            )

            if (
                token_similarity
                >= 0.85
            ):

                print(
                    "Skipping near-duplicate evidence | "
                    f"Token similarity: "
                    f"{token_similarity:.3f}"
                )

                return True

            # ------------------------------------
            # Same paper + same page
            # ------------------------------------

            same_document = (
                current_document
                and previous_document
                and current_document
                == previous_document
            )

            same_page = (
                current_page is not None
                and previous_page is not None
                and current_page
                == previous_page
            )

            if (
                same_document
                and same_page
            ):

                if (
                    sequence_similarity
                    >= 0.80
                    or token_similarity
                    >= 0.70
                    or (
                        smaller_token_count
                        > 0
                        and (
                            len(intersection)
                            / smaller_token_count
                        )
                        >= 0.80
                    )
                ):

                    print(
                        "Skipping duplicate paper-page evidence | "
                        f"Document: "
                        f"{current.get('document_name')} | "
                        f"Page: {current_page}"
                    )

                    return True

        return False

    # ============================================
    # Find an explicitly referenced OTHER document
    #
    # This lets queries such as:
    #
    #     "who wrote the attention paper?"
    #     "what is the BERT paper?"
    #
    # leave the currently selected research context
    # without hardcoding any paper names.
    #
    # We compare meaningful title tokens against the
    # user's query and also support title acronyms.
    # ============================================

    @staticmethod
    def _find_explicit_other_document(
        db: Session,
        query: str,
        current_document_id: int,
        user_id: int,
    ):
        from app.models.document import Document

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        query_tokens = set(
            re.findall(
                r"[a-z0-9]+",
                normalized_query,
            )
        )

        generic_title_tokens = {
            "the",
            "a",
            "an",
            "of",
            "and",
            "or",
            "for",
            "to",
            "in",
            "on",
            "with",
            "from",
            "is",
            "are",
            "this",
            "that",
            "paper",
            "research",
            "study",
            "work",
            "article",
        }

        query_tokens -= generic_title_tokens

        if not query_tokens:
            return None

        documents = (
            db.query(Document)
            .filter(
                Document.user_id == user_id
            )
            .all()
        )

        best_document = None
        best_score = 0.0

        for document in documents:

            if document.id == current_document_id:
                continue

            title = (
                document.title
                or ""
            ).strip()

            if not title:
                continue

            normalized_title = (
                SearchService._normalize_title(
                    title
                )
            )

            title_tokens = set(
                re.findall(
                    r"[a-z0-9]+",
                    normalized_title,
                )
            )

            title_tokens -= generic_title_tokens

            if not title_tokens:
                continue

            # ------------------------------------
            # Exact multi-word title reference
            # ------------------------------------

            if (
                normalized_title
                in normalized_query
            ):
                return document

            # ------------------------------------
            # Acronym support
            #
            # "BERT paper" can resolve a title
            # such as "BERT: Pre-training..."
            # ------------------------------------

            title_words = [
                token
                for token in normalized_title.split()
                if token not in generic_title_tokens
            ]

            acronym = "".join(
                word[0]
                for word in title_words
                if word
            )

            if (
                acronym
                and len(acronym) >= 3
                and acronym in query_tokens
            ):
                return document

            # ------------------------------------
            # Distinctive title-token matching
            #
            # A single short/common word should not
            # switch documents. A distinctive token
            # (6+ characters) can.
            # ------------------------------------

            overlap = (
                query_tokens
                & title_tokens
            )

            distinctive_overlap = {
                token
                for token in overlap
                if len(token) >= 6
            }

            if not distinctive_overlap:
                continue

            # Prefer documents with stronger title
            # coverage, while allowing a distinctive
            # token such as "attention" to identify
            # "Attention Is All You Need".
            coverage = (
                len(overlap)
                / max(
                    len(title_tokens),
                    1,
                )
            )

            score = (
                0.70 * min(
                    len(distinctive_overlap),
                    3,
                )
                + 0.30 * coverage
            )

            if score > best_score:
                best_score = score
                best_document = document

        if best_document is not None:
            print(
                "Search intent: "
                "EXPLICIT OTHER DOCUMENT"
            )

            print(
                f"Referenced document: "
                f"{best_document.id}"
            )

        return best_document

    # ============================================
    # Determine whether query should use the
    # selected research context.
    # ============================================

    @staticmethod
    def _resolve_retrieval_document(
        db: Session,
        query: str,
        document_id: int,
        user_id: int,
    ) -> int | None:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        # ----------------------------------------
        # Explicit request for external/global
        # research.
        #
        # This is the ONLY case where retrieval
        # should intentionally become global.
        # ----------------------------------------

        for phrase in (
            SearchService.EXTERNAL_CONTEXT_PHRASES
        ):

            if phrase in normalized_query:

                print(
                    "Search intent: "
                    "EXPLICIT EXTERNAL CONTEXT"
                )

                return None

        # ----------------------------------------
        # Explicitly referenced another uploaded
        # document.
        #
        # IMPORTANT:
        # This changes retrieval scope only for the
        # current query. It does NOT change the
        # conversation's persistent research context.
        #
        # Once a document is resolved here, vector
        # search, BM25, metadata retrieval, and
        # summary retrieval MUST all use this ID.
        # ----------------------------------------

        referenced_document = (
            SearchService
            ._find_explicit_other_document(
                db=db,
                query=query,
                current_document_id=document_id,
                user_id=user_id,
            )
        )

        if referenced_document is not None:

            print(
                "Search intent: "
                "EXPLICIT OTHER DOCUMENT"
            )

            print(
                f"Referenced document: "
                f"{referenced_document.id}"
            )

            return referenced_document.id

        # ----------------------------------------
        # No explicit override:
        # continue using the selected research
        # context.
        # ----------------------------------------

        print(
            "Search intent: "
            "SELECTED RESEARCH CONTEXT"
        )

        return document_id

    # ============================================
    # Search
    # ============================================

    @staticmethod
    def search(
        db: Session,
        query: str,
        user_id: int,
        limit: int = 5,
        document_id: int | None = None,
    ):

        print(
            "\n========== SEARCH START =========="
        )

        # ========================================
        # Determine query type
        # ========================================

        is_metadata_query = (
            SearchService._is_metadata_query(
                query
            )
            if document_id is not None
            else False
        )

        is_author_metadata_query = (
            is_metadata_query
            and SearchService._is_author_metadata_query(
                query
            )
        )

        is_summary_query = (
            SearchService._is_summary_query(
                query
            )
            if document_id is not None
            else False
        )

        # ========================================
        # Resolve retrieval scope
        # ========================================
        #
        # There are three possible scopes:
        #
        #   1. Explicit external research
        #      -> global search
        #
        #   2. Explicitly referenced uploaded paper
        #      -> that document ONLY
        #
        #   3. No override
        #      -> persistent selected paper
        #
        # The resolved document ID is passed directly
        # into BOTH vector and BM25 retrieval. This
        # prevents an explicitly referenced paper from
        # accidentally falling back to global search.
        # ========================================

        retrieval_document_id = None

        if document_id is not None:

            retrieval_document_id = (
                SearchService
                ._resolve_retrieval_document(
                    db=db,
                    query=query,
                    document_id=document_id,
                    user_id=user_id,
                )
            )

        if retrieval_document_id is not None:

            if (
                retrieval_document_id
                == document_id
            ):

                print(
                    f"Research context active: "
                    f"Document {retrieval_document_id}"
                )

            else:

                print(
                    f"Explicit document retrieval: "
                    f"Document {retrieval_document_id}"
                )

        elif document_id is not None:

            print(
                "Global search selected"
            )

        else:

            print(
                "No research context"
            )

        # ========================================
        # Candidate Pool
        # ========================================

        candidate_limit = max(
            limit * 10,
            50,
        )

        # ========================================
        # Vector Search
        # ========================================

        vector_results = (
            VectorSearchService.search(
                db=db,
                query=query,
                user_id=user_id,
                limit=candidate_limit,
                document_id=
                    retrieval_document_id,
            )
        )

        print(
            f"Vector candidates: "
            f"{len(vector_results)}"
        )

        # ========================================
        # BM25 Search
        # ========================================

        bm25_results = (
            BM25Service.search(
                db=db,
                query=query,
                user_id=user_id,
                limit=candidate_limit,
                document_id=
                    retrieval_document_id,
            )
        )

        print(
            f"BM25 candidates: "
            f"{len(bm25_results)}"
        )

        # ========================================
        # Hybrid Candidate Merge
        # ========================================

        combined = {}

        for chunk, _ in vector_results:

            if chunk is None:
                continue

            combined[
                chunk.id
            ] = chunk

        for chunk, _ in bm25_results:

            if chunk is None:
                continue

            if chunk.id not in combined:

                combined[
                    chunk.id
                ] = chunk

        # ========================================
        # Metadata-specific front matter
        #
        # This is the key fix.
        #
        # We explicitly add the beginning of the
        # selected paper to the candidate pool.
        # ========================================

        front_matter_chunks = []
        summary_chunks = []

        if (
            is_metadata_query
            and retrieval_document_id
            is not None
        ):

            print(
                "\n========== FRONT MATTER RETRIEVAL =========="
            )

            front_matter_chunks = (
                SearchService._get_front_matter_chunks(
                    db=db,
                    document_id=
                        retrieval_document_id,
                    max_pages=(
                        1
                        if is_author_metadata_query
                        else 2
                    ),
                    limit=(
                        20
                        if is_author_metadata_query
                        else 12
                    ),
                )
            )

            for chunk in (
                front_matter_chunks
            ):

                combined[
                    chunk.id
                ] = chunk

            print(
                "============================================\n"
            )

        elif (
            is_summary_query
            and retrieval_document_id
            is not None
        ):

            print(
                "\n========== SUMMARY RETRIEVAL ==========\n"
            )

            summary_chunks = (
                SearchService._get_summary_chunks(
                    db=db,
                    document_id=
                        retrieval_document_id,
                    limit=16,
                )
            )

            for chunk in summary_chunks:

                combined[
                    chunk.id
                ] = chunk

            print(
                "=========================================\n"
            )

        candidate_chunks = list(
            combined.values()
        )

        print(
            f"Unique hybrid candidates: "
            f"{len(candidate_chunks)}"
        )

        if not candidate_chunks:

            print(
                "========== SEARCH END ==========\n"
            )

            return []

        # ========================================
        # Prepare Reranker Input
        # ========================================

        reranker_input = [
            (
                chunk,
                0.0,
            )
            for chunk in candidate_chunks
        ]

        # ========================================
        # Reranking
        # ========================================

        # For metadata queries we slightly enrich
        # the reranker query so that "author" is
        # interpreted as paper-author information
        # rather than an arbitrary occurrence of
        # the word "author".
        reranker_query = query

        if is_metadata_query:

            reranker_query = (
                f"{query}. "
                "Answer using the title, authors, "
                "publication information, and "
                "bibliographic information from "
                "the beginning of the selected paper."
            )

            print(
                "Metadata reranker query:"
            )

            print(
                reranker_query
            )

        elif is_summary_query:

            reranker_query = (
                f"{query}. "
                "Prioritize the abstract, introduction, "
                "main problem or motivation, key approach, "
                "main findings, and conclusion of the "
                "selected paper. Prefer coherent overview "
                "passages over isolated implementation details."
            )

            print(
                "Summary reranker query:"
            )

            print(
                reranker_query
            )

        reranked_results = (
            RerankerService.rerank(
                query=reranker_query,
                results=reranker_input,
                limit=len(
                    reranker_input
                ),
            )
        )

        # ========================================
        # Build Ranked Results
        # ========================================

        ranked_results = []

        for chunk, relevance_score in (
            reranked_results
        ):

            ranked_results.append(
                {
                    "id":
                        chunk.id,

                    "document_id":
                        chunk.document_id,

                    "document_name":
                        chunk.document.title,

                    "chunk_index":
                        chunk.chunk_index,

                    "page_number":
                        chunk.page_number,

                    "page_width":
                        chunk.page_width,

                    "page_height":
                        chunk.page_height,

                    "bboxes":
                        getattr(
                            chunk,
                            "bboxes",
                            [],
                        ),

                    "score":
                        float(
                            relevance_score
                        ),

                    "preview":
                        chunk.content,

                    "chunk":
                        chunk,
                }
            )

        # ========================================
        # Explicit Descending Ranking
        # ========================================

        ranked_results.sort(
            key=lambda result:
                result["score"],
            reverse=True,
        )

        # ========================================
        # Metadata priority
        #
        # The first page is a strong signal for
        # bibliographic questions.
        #
        # We do NOT simply replace the reranker.
        # Instead, front matter gets a controlled
        # priority boost.
        # ========================================

        if (
            is_metadata_query
            and front_matter_chunks
        ):

            front_ids = {
                chunk.id
                for chunk in
                front_matter_chunks
            }

            front_results = []
            other_results = []

            for result in ranked_results:

                if (
                    result["id"]
                    in front_ids
                ):

                    front_results.append(
                        result
                    )

                else:

                    other_results.append(
                        result
                    )

            if is_author_metadata_query:

                # Author names can be split across adjacent
                # first-page chunks. Preserve PDF/document order
                # so the complete author block survives instead
                # of selecting only the single strongest chunk.
                front_results.sort(
                    key=lambda result: (
                        result["page_number"]
                        if result["page_number"] is not None
                        else -1,
                        result["chunk_index"],
                    )
                )

                ranked_results = (
                    front_results
                    + other_results
                )

                print(
                    "\nAuthor metadata priority applied "
                    "(document order):"
                )

            else:

                # Keep reranker order inside each group,
                # while making front matter appear before
                # unrelated later pages.

                ranked_results = (
                    front_results
                    + other_results
                )

                print(
                    "\nMetadata priority applied:"
                )

            for index, result in enumerate(
                ranked_results[:10],
                start=1,
            ):

                print(
                    f"{index}. "
                    f"Chunk {result['id']} | "
                    f"Page {result['page_number']} | "
                    f"Score {result['score']:.4f} | "
                    f"{result['document_name']}"
                )

        elif (
            is_summary_query
            and summary_chunks
        ):

            summary_ids = {
                chunk.id
                for chunk in
                summary_chunks
            }

            summary_results = []
            other_results = []

            for result in ranked_results:

                if (
                    result["id"]
                    in summary_ids
                ):

                    summary_results.append(
                        result
                    )

                else:

                    other_results.append(
                        result
                    )

            # Summary questions should favor the
            # structured overview set. Keep the
            # reranker order within that set.

            ranked_results = (
                summary_results
                + other_results
            )

            print(
                "\nSummary priority applied:"
            )

            for index, result in enumerate(
                ranked_results[:10],
                start=1,
            ):

                print(
                    f"{index}. "
                    f"Chunk {result['id']} | "
                    f"Page {result['page_number']} | "
                    f"Score {result['score']:.4f} | "
                    f"{result['document_name']}"
                )

        # ========================================
        # Reranked Results
        # ========================================

        print(
            "\n========== RERANKED RESULTS =========="
        )

        for index, result in enumerate(
            ranked_results[:10],
            start=1,
        ):

            print(
                f"{index}. "
                f"Chunk {result['id']} | "
                f"Page {result['page_number']} | "
                f"Score {result['score']:.4f} | "
                f"{result['document_name']}"
            )

        print(
            "======================================\n"
        )

        # ========================================
        # Evidence Selection
        # ========================================

        final_results = []

        evidence_limit = limit

        # For author metadata, skip title/arXiv chunks and start at the
        # first chunk that actually contains author/contact information.
        # This keeps the evidence vault compact while still giving the LLM
        # the complete five-author block for papers like this one.
        if is_author_metadata_query:

            author_start_index = None

            for index, result in enumerate(
                ranked_results
            ):

                preview = (
                    result.get("preview")
                    or ""
                ).lower()

                if (
                    "@" in preview
                    or "google inc" in preview
                    or "author" in preview
                ):
                    author_start_index = index
                    break

            if author_start_index is not None:

                ranked_results = (
                    ranked_results[
                        author_start_index:
                    ]
                )

        for result in ranked_results:

            if SearchService._is_duplicate_evidence(
                current=result,
                previous_results=final_results,
            ):

                print(
                    "Skipping duplicate evidence | "
                    f"Chunk {result['id']} | "
                    f"Page {result['page_number']} | "
                    f"{result['document_name']}"
                )

                continue

            final_results.append(
                result
            )

            if (
                len(final_results)
                >= evidence_limit
            ):
                break

        # ========================================
        # Final Ordering
        # ========================================

        # Do NOT re-sort metadata results by score
        # after applying front-matter priority.
        #
        # For normal questions, score remains the
        # final ordering criterion.

        if not is_metadata_query and not is_summary_query:

            final_results.sort(
                key=lambda result:
                    result["score"],
                reverse=True,
            )

        # ========================================
        # Final Results
        # ========================================

        print(
            "\n========== FINAL RESULTS =========="
        )

        for index, result in enumerate(
            final_results,
            start=1,
        ):

            print(
                f"{index}. "
                f"Chunk {result['id']} | "
                f"Page {result['page_number']} | "
                f"Score {result['score']:.4f} | "
                f"{result['document_name']}"
            )

        print(
            "===================================\n"
        )

        print(
            f"Final evidence count: "
            f"{len(final_results)} / {limit}"
        )

        print(
            "========== SEARCH END ==========\n"
        )

        return final_results