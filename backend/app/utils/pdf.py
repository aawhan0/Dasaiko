import fitz


def clean_text(text: str) -> str:
    """
    Remove null characters from extracted PDF text.
    """

    return (
        text
        .replace("\x00", "")
        .replace("\u0000", "")
    )


def extract_pages_from_pdf(file_path: str):
    """
    Extract PDF content lazily, one page at a time.

    This intentionally uses a generator so that we do not
    keep the entire PDF's page structure in memory.

    Each yielded page contains:
    - page number
    - page dimensions
    - text
    - text blocks
    - line bounding boxes
    """

    document = fitz.open(file_path)

    try:
        for page_index, page in enumerate(document):

            blocks = []

            page_dict = page.get_text("dict")

            for block in page_dict.get(
                "blocks",
                [],
            ):

                if block.get("type") != 0:
                    continue

                lines = []

                for line in block.get(
                    "lines",
                    [],
                ):

                    line_text = "".join(
                        span.get("text", "")
                        for span in line.get(
                            "spans",
                            [],
                        )
                    )

                    if not line_text:
                        continue

                    lines.append(
                        {
                            "text": clean_text(
                                line_text
                            ),
                            "bbox": [
                                float(value)
                                for value in line.get(
                                    "bbox",
                                    [],
                                )
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
                            for value in block.get(
                                "bbox",
                                [],
                            )
                        ],
                        "lines": lines,
                    }
                )

            yield {
                "page_number": (
                    page_index + 1
                ),
                "page_width": float(
                    page.rect.width
                ),
                "page_height": float(
                    page.rect.height
                ),
                "text": "\n\n".join(
                    block["text"]
                    for block in blocks
                ),
                "blocks": blocks,
            }

    finally:
        document.close()