import fitz


class TitleService:

    @staticmethod
    def resolve_title(
        pdf_path: str,
        filename: str,
    ) -> str:

        title = TitleService._extract_metadata(
            pdf_path
        )

        if title:
            return title

        title = TitleService._extract_first_page_title(
            pdf_path
        )

        if title:
            return title

        return filename.replace(".pdf", "")

    @staticmethod
    def _extract_metadata(
        pdf_path: str,
    ) -> str | None:

        document = fitz.open(pdf_path)

        try:
            metadata = document.metadata or {}
            # raise Exception(f"PDF Metadata: {metadata}")
            # DEBUG
            

            title = (
                metadata.get("title", "")
                .strip()
            )

            if not title:
                return None

            if title.lower() in {
                "untitled",
                "document",
            }:
                return None

            return title

        finally:
            document.close()
        
    @staticmethod
    def _extract_first_page_title(
        pdf_path: str,
    ) -> str | None:

        document = fitz.open(pdf_path)

        try:

            page = document[0]

            raw = page.get_text("dict")

            candidates = []

            for block in raw["blocks"]:

                if block["type"] != 0:
                    continue

                text = ""
                largest_font = 0

                for line in block["lines"]:
                    for span in line["spans"]:

                        text += span["text"]

                        largest_font = max(
                            largest_font,
                            span["size"],
                        )

                    text += " "

                text = text.strip()

                if not text:
                    continue

                lower = text.lower()

                # Ignore obvious metadata blocks
                if (
                    "arxiv:" in lower
                    or "doi" in lower
                    or "http://" in lower
                    or "https://" in lower
                    or "www." in lower
                    or "@" in lower
                ):
                    continue

                candidates.append(
                    {
                        "text": text,
                        "font": largest_font,
                    }
                )
            if not candidates:
                return None

            title = max(
                candidates,
                key=lambda c: c["font"],
            )["text"]

            return title



        finally:
            document.close()