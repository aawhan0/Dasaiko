import fitz


class TitleService:

    @staticmethod
    def resolve_title(
        pdf_path: str,
        filename: str,
    ) -> str:

        return filename.replace(".pdf", "")