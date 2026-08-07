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

        text = ""

        blocks = []

        page_dict = page.get_text("dict")

        for block in page_dict["blocks"]:

            if block["type"] != 0:
                continue

            block_text = ""

            for line in block["lines"]:
                for span in line["spans"]:
                    block_text += span["text"]

                block_text += "\n"

            block_text = clean_text(block_text)

            if not block_text.strip():
                continue

            text += block_text + "\n"

            blocks.append(
                {
                    "text": block_text,
                    "bbox": block["bbox"],
                }
            )

        pages.append(
            {
                "page_number": page_index + 1,
                "text": text,
                "blocks": blocks,
            }
        )

    document.close()

    return pages