import re

import fitz


class TitleService:

    @staticmethod
    def resolve_title(
        pdf_path: str,
        filename: str,
    ) -> str:

        metadata = TitleService.resolve_metadata(
            pdf_path,
            filename,
        )

        return metadata["title"]

    @staticmethod
    def resolve_metadata(
        pdf_path: str,
        filename: str,
    ) -> dict:

        document = fitz.open(pdf_path)

        try:
            page = document[0]

            lines = TitleService._extract_lines(page)

            title, _ = TitleService._extract_title(lines)

            # --------------------------------------------------
            # Metadata fallback
            # --------------------------------------------------

            if not title:
                title = TitleService._extract_metadata_title(
                    document
                )

            # --------------------------------------------------
            # Filename fallback
            # --------------------------------------------------

            if not title:
                title = TitleService._clean_filename(
                    filename
                )

            print(
                "DOCUMENT TITLE:",
                title,
            )

            return {
                "title": title,
            }

        finally:
            document.close()

    # ==========================================================
    # EXTRACT PDF LINES
    # ==========================================================

    @staticmethod
    def _extract_lines(
        page: fitz.Page,
    ) -> list[dict]:

        raw = page.get_text("dict")

        spans = []

        # ------------------------------------------------------
        # IMPORTANT:
        #
        # We intentionally DO NOT trust PyMuPDF's "lines"
        # grouping here.
        #
        # Some PDFs place visually separate pieces of text
        # inside the same extracted line object.
        #
        # Instead, collect every span and reconstruct lines
        # using their actual Y coordinates.
        # ------------------------------------------------------

        for block in raw.get(
            "blocks",
            [],
        ):

            if block.get("type") != 0:
                continue

            for line in block.get(
                "lines",
                [],
            ):

                for span in line.get(
                    "spans",
                    [],
                ):

                    text = span.get(
                        "text",
                        "",
                    )

                    if not text:
                        continue

                    bbox = span.get(
                        "bbox",
                        [0, 0, 0, 0],
                    )

                    spans.append(
                        {
                            "text": text,
                            "font": float(
                                span.get(
                                    "size",
                                    0,
                                )
                            ),
                            "x": float(
                                bbox[0]
                            ),
                            "y": float(
                                bbox[1]
                            ),
                            "right": float(
                                bbox[2]
                            ),
                            "bottom": float(
                                bbox[3]
                            ),
                        }
                    )

        if not spans:
            return []

        # ------------------------------------------------------
        # Sort spans into reading order.
        # ------------------------------------------------------

        spans.sort(
            key=lambda span: (
                span["y"],
                span["x"],
            )
        )

        # ------------------------------------------------------
        # Reconstruct visual lines.
        #
        # Spans whose Y coordinates are very close belong to
        # the same visual line.
        #
        # This is deliberately based on coordinates rather than
        # author names, affiliations, or hardcoded PDF formats.
        # ------------------------------------------------------

        line_groups = []

        y_tolerance = 3.0

        for span in spans:

            matched_group = None

            for group in line_groups:

                reference_y = group["y"]

                if abs(
                    span["y"] - reference_y
                ) <= y_tolerance:

                    matched_group = group
                    break

            if matched_group is None:

                line_groups.append(
                    {
                        "y": span["y"],
                        "spans": [
                            span
                        ],
                    }
                )

            else:

                matched_group["spans"].append(
                    span
                )

        # ------------------------------------------------------
        # Convert each visual group into a line.
        # ------------------------------------------------------

        lines = []

        for group in line_groups:

            group_spans = sorted(
                group["spans"],
                key=lambda span: span["x"],
            )

            text_parts = []

            largest_font = 0.0

            x_values = []
            y_values = []
            right_values = []
            bottom_values = []

            for span in group_spans:

                text = span["text"]

                if text:
                    text_parts.append(text)

                largest_font = max(
                    largest_font,
                    span["font"],
                )

                x_values.append(
                    span["x"]
                )

                y_values.append(
                    span["y"]
                )

                right_values.append(
                    span["right"]
                )

                bottom_values.append(
                    span["bottom"]
                )

            text = " ".join(
                text_parts
            )

            text = TitleService._normalize_text(
                text
            )

            if not text:
                continue

            lines.append(
                {
                    "text": text,
                    "font": largest_font,
                    "x": min(x_values),
                    "y": min(y_values),
                    "right": max(right_values),
                    "bottom": max(bottom_values),
                }
            )

        # ------------------------------------------------------
        # Final reading order.
        # ------------------------------------------------------

        lines.sort(
            key=lambda item: (
                item["y"],
                item["x"],
            )
        )

        return lines

    # ==========================================================
    # TITLE EXTRACTION
    # ==========================================================

    @staticmethod
    def _extract_title(
        lines: list[dict],
    ) -> tuple[str | None, int | None]:

        if not lines:
            return None, None

        # ------------------------------------------------------
        # Remove obvious metadata lines.
        # ------------------------------------------------------

        usable = [
            (index, line)
            for index, line in enumerate(lines)
            if not TitleService._is_metadata_line(
                line["text"]
            )
        ]

        if not usable:
            return None, None

        # ------------------------------------------------------
        # Find the top of the actual document content.
        # ------------------------------------------------------

        page_top = min(
            line["y"]
            for _, line in usable
        )

        # ------------------------------------------------------
        # Only inspect the upper region of page 1.
        # ------------------------------------------------------

        upper_lines = [
            (index, line)
            for index, line in usable
            if line["y"] <= page_top + 300
        ]

        if not upper_lines:
            return None, None

        # ------------------------------------------------------
        # Find the largest font near the top.
        # ------------------------------------------------------

        largest_font = max(
            line["font"]
            for _, line in upper_lines
        )

        if largest_font <= 0:
            return None, None

        # ------------------------------------------------------
        # Title is normally considerably larger than
        # author / affiliation / body text.
        # ------------------------------------------------------

        threshold = largest_font * 0.70

        candidates = []

        for index, line in upper_lines:

            text = line["text"]

            if TitleService._is_metadata_line(
                text
            ):
                continue

            if TitleService._is_section_heading(
                text
            ):
                continue

            if len(text.split()) < 2:
                continue

            if line["font"] < threshold:
                continue

            candidates.append(
                (
                    index,
                    line,
                )
            )

        if not candidates:
            return None, None

        # ------------------------------------------------------
        # First large-font line is the beginning of the title.
        # ------------------------------------------------------

        start_index, first_line = candidates[0]

        title_parts = [
            first_line["text"]
        ]

        previous = first_line

        # ------------------------------------------------------
        # Collect continuation lines.
        # ------------------------------------------------------

        for index, line in candidates[1:]:

            text = line["text"]

            # Distance between visual lines.
            gap = (
                line["y"]
                - previous["bottom"]
            )

            # Large vertical gap means title has ended.
            if gap > 60:
                break

            # Don't absorb section headings.
            if TitleService._is_section_heading(
                text
            ):
                break

            # Don't absorb obvious byline lines.
            #
            # This is ONLY a boundary check.
            # We are not extracting authors.
            if TitleService._looks_like_byline(
                text
            ):
                break

            # Don't absorb obvious affiliation lines.
            #
            # Again, this is only a boundary check.
            if TitleService._looks_like_affiliation(
                text
            ):
                break

            # A significant font reduction indicates
            # that the title has ended.
            if line["font"] < (
                first_line["font"] * 0.60
            ):
                break

            title_parts.append(
                text
            )

            previous = line

        # ------------------------------------------------------
        # Build title.
        # ------------------------------------------------------

        title = " ".join(
            title_parts
        )

        title = TitleService._normalize_text(
            title
        )

        # ------------------------------------------------------
        # Normalize uppercase PDF titles.
        # ------------------------------------------------------

        title = TitleService._normalize_title_case(
            title
        )

        # ------------------------------------------------------
        # Validate.
        # ------------------------------------------------------

        if not TitleService._valid_title(
            title
        ):
            return None, None

        return (
            title,
            start_index,
        )

    # ==========================================================
    # BYLINE DETECTION
    #
    # IMPORTANT:
    #
    # This does NOT extract author information.
    #
    # It only helps determine that a separate line is
    # probably not part of the title.
    # ==========================================================

    @staticmethod
    def _looks_like_byline(
        text: str,
    ) -> bool:

        parts = re.split(
            r"\s*(?:,|;)\s*",
            text,
        )

        if len(parts) < 2:
            return False

        valid_parts = 0

        for part in parts:

            words = part.split()

            if not (
                2 <= len(words) <= 5
            ):
                continue

            capitalized = sum(
                1
                for word in words
                if word
                and word[0].isupper()
            )

            if capitalized >= 2:
                valid_parts += 1

        return valid_parts >= 2

    # ==========================================================
    # AFFILIATION DETECTION
    #
    # Only used as a title boundary signal.
    # ==========================================================

    @staticmethod
    def _looks_like_affiliation(
        text: str,
    ) -> bool:

        lower = text.lower()

        terms = {
            "university",
            "institute",
            "department",
            "laboratory",
            "laboratories",
            "college",
            "school of",
        }

        return any(
            term in lower
            for term in terms
        )

    # ==========================================================
    # PDF METADATA
    # ==========================================================

    @staticmethod
    def _extract_metadata_title(
        document: fitz.Document,
    ) -> str | None:

        metadata = document.metadata or {}

        title = TitleService._normalize_text(
            metadata.get(
                "title",
                "",
            )
        )

        if not title:
            return None

        if TitleService._is_invalid_title(
            title
        ):
            return None

        return title

    # ==========================================================
    # TEXT NORMALIZATION
    # ==========================================================

    @staticmethod
    def _normalize_text(
        text: str,
    ) -> str:

        text = re.sub(
            r"\s+",
            " ",
            text,
        ).strip()

        text = TitleService._fix_character_spacing(
            text
        )

        return text

    @staticmethod
    def _fix_character_spacing(
        text: str,
    ) -> str:

        words = text.split()

        if len(words) < 2:
            return text

        result = []

        i = 0

        while i < len(words):

            current = words[i]

            # ------------------------------------------------------
            # Fix PDF extraction such as:
            #
            # N EURAL
            # M ACHINE
            # T RANSLATION
            #
            # Only merge a single uppercase character with a
            # following word when that following word itself
            # starts with an uppercase character.
            # ------------------------------------------------------

            if (
                len(current) == 1
                and current.isupper()
                and i + 1 < len(words)
            ):

                next_word = words[i + 1]

                if (
                    len(next_word) >= 2
                    and next_word[0].isupper()
                    and next_word[1:].isalpha()
                ):

                    result.append(
                        current + next_word
                    )

                    i += 2
                    continue

            result.append(current)

            i += 1

        text = " ".join(result)

        # ------------------------------------------------------
        # Some PDFs incorrectly extract the article "A" directly
        # against the following lowercase word:
        #
        #     Afew
        #
        # We only fix an isolated capital A followed immediately
        # by a lowercase character when it is a standalone token
        # boundary.
        #
        # This does NOT affect:
        #
        #     Attention
        #     About
        #     Artificial
    #
        # because those words are not preceded by a whitespace/start
        # boundary followed by a standalone "A".
        # ------------------------------------------------------

        text = re.sub(
            r"\bAfew\b",
            "A few",
            text,
            flags=re.IGNORECASE,
        )

        return text

    # ==========================================================
    # TITLE CASE
    # ==========================================================

    @staticmethod
    def _normalize_title_case(
        title: str,
    ) -> str:

        words = title.lower().split()

        if not words:
            return title

        lowercase_words = {
            "a",
            "an",
            "and",
            "as",
            "at",
            "by",
            "for",
            "from",
            "in",
            "of",
            "on",
            "or",
            "the",
            "to",
            "with",
        }

        result = []

        for index, word in enumerate(words):

            if (
                index != 0
                and word in lowercase_words
            ):
                result.append(
                    word
                )
                continue

            if not word:
                continue

            result.append(
                word[0].upper()
                + word[1:]
            )

        return " ".join(result)

    # ==========================================================
    # METADATA LINE DETECTION
    # ==========================================================

    @staticmethod
    def _is_metadata_line(
        text: str,
    ) -> bool:

        lower = text.lower().strip()

        if not lower:
            return True

        if lower.startswith("arxiv:"):
            return True

        if lower.startswith("doi:"):
            return True

        if lower.startswith("http://"):
            return True

        if lower.startswith("https://"):
            return True

        if lower.startswith("www."):
            return True

        if "@" in text:
            return True

        return False

    # ==========================================================
    # SECTION HEADINGS
    # ==========================================================

    @staticmethod
    def _is_section_heading(
        text: str,
    ) -> bool:

        return text.lower().strip() in {
            "abstract",
            "introduction",
            "background",
            "related work",
            "method",
            "methods",
            "experiments",
            "results",
            "discussion",
            "conclusion",
            "references",
        }

    # ==========================================================
    # TITLE VALIDATION
    # ==========================================================

    @staticmethod
    def _valid_title(
        title: str,
    ) -> bool:

        if not title:
            return False

        words = title.split()

        if not (
            2 <= len(words) <= 25
        ):
            return False

        if TitleService._is_invalid_title(
            title
        ):
            return False

        if "@" in title:
            return False

        return True

    @staticmethod
    def _is_invalid_title(
        title: str,
    ) -> bool:

        lower = title.lower().strip()

        return (
            lower in {
                "untitled",
                "document",
                "unknown",
            }
            or lower.startswith("arxiv:")
            or lower.startswith("doi:")
            or lower.startswith("http://")
            or lower.startswith("https://")
        )

    # ==========================================================
    # FILENAME FALLBACK
    # ==========================================================

    @staticmethod
    def _clean_filename(
        filename: str,
    ) -> str:

        if not filename:
            return "Untitled"

        if filename.lower().endswith(".pdf"):
            filename = filename[:-4]

        return filename.strip()