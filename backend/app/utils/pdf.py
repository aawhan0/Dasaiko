import fitz


def clean_text(text: str) -> str:
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


def extract_pages_from_pdf(file_path: str):
    document = fitz.open(file_path)

    pages = []

    for page_index, page in enumerate(document):

        paragraphs = []

        page_dict = page.get_text("dict")

        for block in page_dict["blocks"]:

            if block["type"] != 0:
                continue

            lines = []

            for line in block["lines"]:
                line_text = "".join(
                    span["text"]
                    for span in line["spans"]
                )

                if line_text:
                    lines.append(line_text)

            paragraph_text = clean_text(
                "\n".join(lines)
            ).strip()

            if not paragraph_text:
                continue

            paragraphs.append(
                {
                    "text": paragraph_text,
                    "bbox": [
                        float(coordinate)
                        for coordinate in block["bbox"]
                    ],
                }
            )

        pages.append(
            {
                "page_number": page_index + 1,
                "page_width": float(page.rect.width),
                "page_height": float(page.rect.height),
                "text": "\n\n".join(
                    paragraph["text"]
                    for paragraph in paragraphs
                ),
                "paragraphs": paragraphs,
            }
        )

    document.close()

    return pages
