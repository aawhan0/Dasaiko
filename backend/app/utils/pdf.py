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
        rect = page.rect
        page_width = rect.width
        page_height = rect.height

        raw_blocks = page.get_text("blocks")
        blocks = []
        for b in raw_blocks:
            x0, y0, x1, y1, text, block_no, block_type = b
            if block_type == 0:  # Text block
                cleaned = clean_text(text).strip()
                if cleaned:
                    blocks.append({
                        "bbox": [x0, y0, x1, y1],
                        "text": cleaned,
                    })

        pages.append(
            {
                "page_number": page_index + 1,
                "text": clean_text(page.get_text()),
                "page_width": float(page_width),
                "page_height": float(page_height),
                "blocks": blocks,
            }
        )

    document.close()

    return pages