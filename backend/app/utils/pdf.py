import fitz


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text.
    """

    text = text.replace("\x00", "")
    text = text.replace("\u0000", "")

    return text


def extract_text_from_pdf(file_path: str) -> str:

    document = fitz.open(file_path)

    pages = []

    for page in document:
        pages.append(
            clean_text(page.get_text())
        )

    document.close()

    return "\n".join(pages)