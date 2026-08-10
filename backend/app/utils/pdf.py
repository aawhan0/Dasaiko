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

        blocks = []

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
                    lines.append(
                        {
                            "text": clean_text(line_text),
                            "bbox": [
                                float(value)
                                for value in line["bbox"]
                            ],
                        }
                    )

            if not lines:
                continue

            block_text = "\n".join(
                line["text"]
                for line in lines
            ).strip()

            if not block_text:
                continue

            blocks.append(
                {
                    "text": block_text,
                    "bbox": [
                        float(value)
                        for value in block["bbox"]
                    ],
                    "lines": lines,
                }
            )

        pages.append(
            {
                "page_number": page_index + 1,
                "page_width": float(page.rect.width),
                "page_height": float(page.rect.height),
                "text": "\n\n".join(
                    block["text"]
                    for block in blocks
                ),
                "blocks": blocks,
            }
        )

    document.close()

    return pages