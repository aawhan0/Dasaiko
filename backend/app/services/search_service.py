import os
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
        "what is the title of this",
        "what is the title of this paper",
        "what is the title of the paper",
        "what's the title",
        "what is this paper called",
        "what is the paper called",
        "title of this paper",
        "title of the paper",
        "paper title",
        "title of this",
    )

    # ============================================
    # Summary / high-level understanding questions
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

                print(
                    f"Metadata phrase matched: "
                    f"{phrase!r}"
                )

                return True

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

            print(
                "Metadata short-query match"
            )

            return True

        metadata_patterns = (
            r"\btitle\b.*\bpaper\b",
            r"\bpaper\b.*\btitle\b",
            r"\btitle\b.*\bthis\b",
            r"\bthis\b.*\bpaper\b.*\bcalled\b",
            r"\bwho\b.*\b(author|authors)\b",
            r"\b(author|authors)\b.*\bpaper\b",
            r"\bpublication\b.*\b(year|venue|conference|journal)\b",
            r"\bwhen\b.*\bpublished\b",
            r"\bwhere\b.*\bpublished\b",
        )

        for pattern in metadata_patterns:

            if re.search(
                pattern,
                normalized_query,
            ):

                print(
                    "Query type: "
                    "PAPER METADATA"
                )

                print(
                    f"Metadata pattern matched: "
                    f"{pattern!r}"
                )

                return True

        print(
            "Query type: "
            "NORMAL / NON-METADATA"
        )

        return False

    # ============================================
    # Detect author-specific metadata questions
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
    # Detect title metadata questions
    # ============================================

    @staticmethod
    def _is_title_metadata_query(
        query: str,
    ) -> bool:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        return any(
            phrase in normalized_query
            for phrase in (
                "what is the title",
                "what is the title of this",
                "what is the title of this paper",
                "what is the title of the paper",
                "what's the title",
                "what is this paper called",
                "what is the paper called",
                "title of this paper",
                "title of the paper",
                "paper title",
                "title of this",
            )
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
    # Detect comparison questions
    #
    # IMPORTANT:
    # Comparison questions often need multiple
    # complementary chunks. Aggressive duplicate
    # filtering can incorrectly remove useful
    # evidence because two chunks discuss the
    # same terminology.
    # ============================================

    @staticmethod
    def _is_comparison_query(
        query: str,
    ) -> bool:

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        comparison_patterns = (
            "compare",
            "comparison",
            "difference between",
            "differences between",
            "different between",
            "versus",
            " vs ",
            "better than",
            "similarities and differences",
            "how does x differ",
            "how do they differ",
        )

        return any(
            pattern in normalized_query
            for pattern in comparison_patterns
        )

    # ============================================
    # Get opening chunks from selected document
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
    # Get summary-oriented chunks
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

        for chunk in chunks:

            page = chunk.page_number

            if page is not None and page <= 3:
                opening.append(chunk)

            if len(opening) >= 8:
                break

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

        closing = chunks[-4:]

        selected = []
        selected_ids = set()

        def add(chunk):

            if chunk.id in selected_ids:
                return False

            selected.append(chunk)
            selected_ids.add(chunk.id)

            return True

        for chunk in opening[:6]:
            add(chunk)

        for chunk in section_neighbors:

            if len(selected) >= limit - 4:
                break

            add(chunk)

        for chunk in closing:
            add(chunk)

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

            if current_text == previous_text:

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

            if sequence_similarity >= 0.90:

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

            if smaller_token_count > 0:

                token_containment = (
                    len(intersection)
                    / smaller_token_count
                )

                if token_containment >= 0.90:

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

            if token_similarity >= 0.85:

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

            if same_document and same_page:

                if (
                    sequence_similarity >= 0.80
                    or token_similarity >= 0.70
                    or (
                        smaller_token_count > 0
                        and (
                            len(intersection)
                            / smaller_token_count
                        ) >= 0.80
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
    # Find explicitly referenced OTHER document
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
            "document",
            "publication",
        }

        meaningful_query_tokens = (
            query_tokens
            - generic_title_tokens
        )

        if not meaningful_query_tokens:
            return None

        document_reference_phrases = (
            "paper",
            "research paper",
            "study",
            "research study",
            "article",
            "document",
            "work",
            "publication",
            "paper about",
            "paper on",
            "study about",
            "study on",
            "research about",
            "research on",
        )

        has_explicit_document_reference = any(
            phrase in normalized_query
            for phrase in document_reference_phrases
        )

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
                document.title or ""
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

            if (
                len(title_tokens) >= 2
                and normalized_title
                in normalized_query
            ):

                print(
                    f"Explicit full-title match: "
                    f"{document.id}"
                )

                return document

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
                and acronym
                in meaningful_query_tokens
                and has_explicit_document_reference
            ):

                print(
                    f"Explicit acronym document match: "
                    f"{document.id}"
                )

                return document

            overlap = (
                meaningful_query_tokens
                & title_tokens
            )

            distinctive_overlap = {
                token
                for token in overlap
                if len(token) >= 6
            }

            if not distinctive_overlap:
                continue

            if (
                len(distinctive_overlap) < 2
                and not has_explicit_document_reference
            ):
                continue

            coverage = (
                len(overlap)
                / max(len(title_tokens), 1)
            )

            score = (
                0.70
                * min(
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
    # Determine retrieval document
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

        for phrase in (
            SearchService.EXTERNAL_CONTEXT_PHRASES
        ):

            if phrase in normalized_query:

                print(
                    "Search intent: "
                    "EXPLICIT EXTERNAL CONTEXT"
                )

                return None

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

        print(
            "Search intent: "
            "SELECTED RESEARCH CONTEXT"
        )

        return document_id

    # ============================================
    # Infer document from query
    # ============================================

    @staticmethod
    def _infer_document_from_query(
        db: Session,
        query: str,
        user_id: int,
    ):

        from app.models.document import Document

        normalized_query = (
            SearchService._normalize_text(
                query
            )
        )

        routing_signals = {
            "skipgram": {
                "skipgram",
                "skip-gram",
                "word2vec",
            },
            "glove": {
                "glove",
            },
            "attention": {
                "scaled dot product attention",
                "multi head attention",
                "multihead attention",
                "transformer",
                "attention is all you need",
            },
            "seq2seq": {
                "seq2seq",
                "sequence to sequence",
                "sequence-to-sequence",
                "beam search",
                "lstm encoder decoder",
            },
            "dpr": {
                "dense passage retrieval",
                "dense passage retriever",
                "dpr",
            },
        }

        matched_family = None
        matched_signal = None

        for family, signals in routing_signals.items():

            for signal in sorted(
                signals,
                key=len,
                reverse=True,
            ):

                normalized_signal = (
                    SearchService._normalize_text(
                        signal
                    )
                )

                if (
                    normalized_signal
                    in normalized_query
                ):

                    matched_family = family
                    matched_signal = signal
                    break

            if matched_family is not None:
                break

        if matched_family is None:
            return None

        documents = (
            db.query(Document)
            .filter(
                Document.user_id == user_id
            )
            .all()
        )

        family_aliases = {
            "skipgram": {
                "word2vec",
                "word2 vec",
                "skip gram",
                "skipgram",
            },
            "glove": {
                "glove",
            },
            "attention": {
                "attention",
                "transformer",
                "attention is all you need",
            },
            "seq2seq": {
                "seq2seq",
                "sequence to sequence",
                "sequence to sequence learning",
            },
            "dpr": {
                "dpr",
                "dense passage retrieval",
            },
        }

        aliases = family_aliases[
            matched_family
        ]

        best_document = None
        best_score = 0

        for document in documents:

            title = SearchService._normalize_title(
                document.title or ""
            )

            if not title:
                continue

            score = 0

            for alias in aliases:

                normalized_alias = (
                    SearchService._normalize_text(
                        alias
                    )
                )

                if normalized_alias in title:
                    score += 2

            title_tokens = set(
                re.findall(
                    r"[a-z0-9]+",
                    title,
                )
            )

            query_tokens = set(
                re.findall(
                    r"[a-z0-9]+",
                    normalized_query,
                )
            )

            meaningful_overlap = {
                token
                for token in (
                    title_tokens
                    & query_tokens
                )
                if len(token) >= 5
            }

            score += min(
                len(meaningful_overlap),
                2,
            )

            if score > best_score:

                best_score = score
                best_document = document

        if (
            best_document is None
            or best_score < 2
        ):
            return None

        print(
            "Query routing: "
            f"'{matched_signal}' -> "
            f"Document {best_document.id} "
            f"({best_document.title})"
        )

        return best_document.id

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

        is_title_metadata_query = (
            is_metadata_query
            and SearchService._is_title_metadata_query(
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

        # NEW
        is_comparison_query = (
            SearchService._is_comparison_query(
                query
            )
        )

        print(
            "Metadata flags: "
            f"metadata={is_metadata_query}, "
            f"author={is_author_metadata_query}, "
            f"title={is_title_metadata_query}, "
            f"summary={is_summary_query}"
        )

        print(
            f"Comparison query: "
            f"{is_comparison_query}"
        )

        # ========================================
        # Resolve retrieval scope
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

        else:

            retrieval_document_id = (
                SearchService._infer_document_from_query(
                    db=db,
                    query=query,
                    user_id=user_id,
                )
            )

        if retrieval_document_id is not None:

            if document_id is None:

                print(
                    f"Query-routed document retrieval: "
                    f"Document {retrieval_document_id}"
                )

            elif (
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
                document_id=retrieval_document_id,
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
                document_id=retrieval_document_id,
            )
        )

        print(
            f"BM25 candidates: "
            f"{len(bm25_results)}"
        )

        # ========================================
        # Reciprocal Rank Fusion
        # ========================================

        RRF_K = 60

        RRF_CANDIDATE_LIMIT = int(
            os.getenv(
                "DASAIKO_RRF_CANDIDATE_LIMIT",
                str(
                    max(
                        limit * 5,
                        50,
                    )
                ),
            )
        )

        rrf_scores = {}
        chunks_by_id = {}

        for rank, item in enumerate(
            vector_results,
            start=1,
        ):

            chunk = item[0]

            if chunk is None:
                continue

            chunks_by_id[chunk.id] = chunk

            rrf_scores.setdefault(
                chunk.id,
                0.0,
            )

            rrf_scores[chunk.id] += (
                1.0
                / (RRF_K + rank)
            )

        for rank, item in enumerate(
            bm25_results,
            start=1,
        ):

            chunk = item[0]

            if chunk is None:
                continue

            chunks_by_id[chunk.id] = chunk

            rrf_scores.setdefault(
                chunk.id,
                0.0,
            )

            rrf_scores[chunk.id] += (
                1.0
                / (RRF_K + rank)
            )

        hybrid_candidates = sorted(
            rrf_scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        hybrid_candidates = (
            hybrid_candidates[
                :RRF_CANDIDATE_LIMIT
            ]
        )

        rrf_candidate_scores = {
            chunk_id: score
            for chunk_id, score
            in hybrid_candidates
        }

        rrf_candidate_ranks = {
            chunk_id: rank
            for rank, (chunk_id, _)
            in enumerate(
                hybrid_candidates,
                start=1,
            )
        }

        candidate_chunks = [
            chunks_by_id[chunk_id]
            for chunk_id, _
            in hybrid_candidates
            if chunk_id in chunks_by_id
        ]

        candidate_chunks_by_id = {
            chunk.id: chunk
            for chunk in candidate_chunks
        }

        candidate_chunks = list(
            candidate_chunks_by_id.values()
        )

        print(
            f"Unique hybrid candidates: "
            f"{len(rrf_scores)}"
        )

        print(
            f"RRF candidate pool: "
            f"{len(candidate_chunks)}"
        )

        print(
            "\n========== RRF HYBRID RESULTS =========="
        )

        for index, (
            chunk_id,
            rrf_score,
        ) in enumerate(
            hybrid_candidates[:10],
            start=1,
        ):

            chunk = chunks_by_id[
                chunk_id
            ]

            print(
                f"{index}. "
                f"Chunk {chunk.id} | "
                f"Page {chunk.page_number} | "
                f"RRF={rrf_score:.6f} | "
                f"{chunk.document.title}"
            )

        print(
            "========================================\n"
        )

        # ========================================
        # Metadata / Summary retrieval
        # ========================================

        front_matter_chunks = []
        summary_chunks = []

        if (
            is_metadata_query
            and retrieval_document_id is not None
        ):

            print(
                "\n========== FRONT MATTER RETRIEVAL =========="
            )

            front_matter_chunks = (
                SearchService._get_front_matter_chunks(
                    db=db,
                    document_id=retrieval_document_id,
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

            for chunk in front_matter_chunks:

                candidate_chunks_by_id[
                    chunk.id
                ] = chunk

            print(
                "============================================\n"
            )

        elif (
            is_summary_query
            and retrieval_document_id is not None
        ):

            print(
                "\n========== SUMMARY RETRIEVAL ==========\n"
            )

            summary_chunks = (
                SearchService._get_summary_chunks(
                    db=db,
                    document_id=retrieval_document_id,
                    limit=16,
                )
            )

            for chunk in summary_chunks:

                candidate_chunks_by_id[
                    chunk.id
                ] = chunk

            print(
                "=========================================\n"
            )

        candidate_chunks = list(
            candidate_chunks_by_id.values()
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

        print(
            "\n========== RERANKER DIAGNOSTICS =========="
        )

        print(
            f"Candidates sent to BGE: "
            f"{len(reranker_input)}"
        )

        print(
            "==========================================\n"
        )

        # ========================================
        # Reranking
        # ========================================

        reranker_query = query

        if is_metadata_query:

            reranker_query = (
                f"{query}. "
                "For title questions, use the exact title "
                "from the earliest front-matter chunk. "
                "For author/publication questions, use the "
                "corresponding bibliographic information "
                "from the beginning of the selected paper. "
                "Do not infer the title from the filename."
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

        elif is_comparison_query:

            reranker_query = (
                f"{query}. "
                "Retrieve complementary evidence for each "
                "side of the comparison. Preserve passages "
                "that explain the distinct mechanisms, "
                "objectives, training procedures, strengths, "
                "limitations, or outcomes of the concepts "
                "being compared."
            )

            print(
                "Comparison reranker query:"
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
        # RRF -> BGE diagnostics
        # ========================================

        print(
            "\n========== RELEVANT RANKING DIAGNOSTICS =========="
        )

        for bge_rank, item in enumerate(
            reranked_results,
            start=1,
        ):

            chunk, relevance_score = item

            rrf_rank = rrf_candidate_ranks.get(
                chunk.id
            )

            if rrf_rank is not None:

                print(
                    f"BGE rank={bge_rank:02d} | "
                    f"RRF rank={rrf_rank:02d} | "
                    f"Chunk={chunk.id} | "
                    f"BGE={float(relevance_score):.6f}"
                )

        print(
            "===================================================\n"
        )

        print(
            "\n========== BGE RANKING DIAGNOSTICS =========="
        )

        for bge_rank, item in enumerate(
            reranked_results,
            start=1,
        ):

            chunk, relevance_score = item

            rrf_rank = rrf_candidate_ranks.get(
                chunk.id
            )

            print(
                f"BGE rank={bge_rank:02d} | "
                f"RRF rank="
                f"{rrf_rank if rrf_rank is not None else '-':>2} | "
                f"Chunk={chunk.id} | "
                f"score={float(relevance_score):.6f} | "
                f"page={chunk.page_number} | "
                f"document={chunk.document.title}"
            )

        print(
            "=============================================\n"
        )

        # ========================================
        # Combine RRF + BGE
        # ========================================

        if reranked_results:

            bge_scores = [
                float(item[1])
                for item in reranked_results
            ]

            bge_min = min(bge_scores)
            bge_max = max(bge_scores)
            bge_range = (
                bge_max - bge_min
            )

            if bge_range > 0:

                bge_normalized = {
                    item[0].id: (
                        (
                            float(item[1])
                            - bge_min
                        )
                        / bge_range
                    )
                    for item in reranked_results
                }

            else:

                bge_normalized = {
                    item[0].id: 1.0
                    for item in reranked_results
                }

            candidate_rrf_scores = [
                rrf_candidate_scores.get(
                    item[0].id,
                    0.0,
                )
                for item in reranked_results
            ]

            rrf_min = min(
                candidate_rrf_scores
            )

            rrf_max = max(
                candidate_rrf_scores
            )

            rrf_range = (
                rrf_max - rrf_min
            )

            if rrf_range > 0:

                rrf_normalized = {
                    item[0].id: (
                        (
                            rrf_candidate_scores.get(
                                item[0].id,
                                0.0,
                            )
                            - rrf_min
                        )
                        / rrf_range
                    )
                    for item in reranked_results
                }

            else:

                rrf_normalized = {
                    item[0].id: 1.0
                    for item in reranked_results
                }

            BGE_WEIGHT = float(
                os.getenv(
                    "DASAIKO_BGE_WEIGHT",
                    "0.50",
                )
            )

            RRF_WEIGHT = float(
                os.getenv(
                    "DASAIKO_RRF_WEIGHT",
                    "0.50",
                )
            )

            combined_results = []

            for (
                chunk,
                bge_raw_score,
            ) in reranked_results:

                bge_score = (
                    bge_normalized.get(
                        chunk.id,
                        0.0,
                    )
                )

                rrf_score = (
                    rrf_normalized.get(
                        chunk.id,
                        0.0,
                    )
                )

                combined_score = (
                    BGE_WEIGHT * bge_score
                    + RRF_WEIGHT * rrf_score
                )

                combined_results.append(
                    (
                        chunk,
                        combined_score,
                        float(bge_raw_score),
                        rrf_candidate_scores.get(
                            chunk.id,
                            0.0,
                        ),
                    )
                )

            combined_results.sort(
                key=lambda item: item[1],
                reverse=True,
            )

        else:

            combined_results = []

        print(
            "\n========== RRF + BGE RESULTS =========="
        )

        print(
            f"Weights: RRF={RRF_WEIGHT:.2f} | "
            f"BGE={BGE_WEIGHT:.2f}"
        )

        for rank, (
            chunk,
            combined_score,
            bge_raw_score,
            rrf_raw_score,
        ) in enumerate(
            combined_results[:10],
            start=1,
        ):

            print(
                f"{rank}. "
                f"Chunk {chunk.id} | "
                f"Combined={combined_score:.6f} | "
                f"BGE={bge_raw_score:.6f} | "
                f"RRF={rrf_raw_score:.6f} | "
                f"RRF-rank="
                f"{rrf_candidate_ranks.get(chunk.id, '-')}"
                f" | Page={chunk.page_number} | "
                f"{chunk.document.title}"
            )

        print(
            "=======================================\n"
        )

        # ========================================
        # Build Ranked Results
        # ========================================

        ranked_results = []

        for (
            chunk,
            combined_score,
            bge_raw_score,
            rrf_raw_score,
        ) in combined_results:

            ranked_results.append(
                {
                    "id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_name": chunk.document.title,
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                    "page_width": chunk.page_width,
                    "page_height": chunk.page_height,
                    "bboxes": getattr(
                        chunk,
                        "bboxes",
                        [],
                    ),
                    "score": float(
                        combined_score
                    ),
                    "bge_score": float(
                        bge_raw_score
                    ),
                    "rrf_score": float(
                        rrf_raw_score
                    ),
                    "rrf_rank": rrf_candidate_ranks.get(
                        chunk.id
                    ),
                    "preview": chunk.content,
                    "chunk": chunk,
                }
            )

        ranked_results.sort(
            key=lambda result:
                result["score"],
            reverse=True,
        )

        # ========================================
        # Metadata priority
        # ========================================

        if (
            is_metadata_query
            and front_matter_chunks
        ):

            front_ids = {
                chunk.id
                for chunk in front_matter_chunks
            }

            front_results = []
            other_results = []

            for result in ranked_results:

                if result["id"] in front_ids:

                    front_results.append(
                        result
                    )

                else:

                    other_results.append(
                        result
                    )

            if (
                is_author_metadata_query
                or is_title_metadata_query
            ):

                front_results.sort(
                    key=lambda result: (
                        result["page_number"]
                        if result["page_number"]
                        is not None
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
                for chunk in summary_chunks
            }

            summary_results = []
            other_results = []

            for result in ranked_results:

                if result["id"] in summary_ids:

                    summary_results.append(
                        result
                    )

                else:

                    other_results.append(
                        result
                    )

            def summary_content_priority(
                result,
            ):

                preview = (
                    result.get("preview")
                    or ""
                ).strip()

                is_content_bearing = (
                    len(preview) >= 100
                )

                return (
                    1
                    if is_content_bearing
                    else 0,
                    result["score"],
                )

            summary_results.sort(
                key=summary_content_priority,
                reverse=True,
            )

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

        # ========================================
        # Author metadata
        # ========================================

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
                    or "author" in preview
                    or "university" in preview
                    or "inc" in preview
                ):

                    author_start_index = index
                    break

            if author_start_index is not None:

                ranked_results = (
                    ranked_results[
                        author_start_index:
                    ]
                )

        # ========================================
        # Title metadata
        # ========================================

        elif is_title_metadata_query:

            ranked_results = sorted(
                ranked_results,
                key=lambda result: (
                    result["page_number"]
                    if result["page_number"]
                    is not None
                    else 10**9,
                    result["chunk_index"],
                ),
            )

        # ========================================
        # Final evidence selection
        #
        # IMPORTANT CHANGE:
        #
        # Comparison queries bypass the aggressive
        # semantic duplicate detector.
        #
        # We still prevent the same chunk ID from
        # appearing twice.
        # ========================================

        existing_ids = set()

        for result in ranked_results:

            # ------------------------------------
            # Comparison query
            # ------------------------------------

            if is_comparison_query:

                if result["id"] in existing_ids:

                    print(
                        "Skipping exact duplicate "
                        f"chunk ID | "
                        f"Chunk {result['id']}"
                    )

                    continue

                final_results.append(
                    result
                )

                existing_ids.add(
                    result["id"]
                )

            # ------------------------------------
            # Normal query
            # ------------------------------------

            else:

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

                existing_ids.add(
                    result["id"]
                )

            if (
                len(final_results)
                >= evidence_limit
            ):
                break

        # ========================================
        # Final Ordering
        # ========================================

        if (
            not is_metadata_query
            and not is_summary_query
        ):

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