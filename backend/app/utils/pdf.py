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

        raw_dict = page.get_text("dict")
        blocks = []
        for block in raw_dict["blocks"]:

            if block["type"] != 0:
                continue

            text = ""
            max_size = 0

            for line in block["lines"]:
                for span in line["spans"]:

                    text += span["text"]

                    if span["size"] > max_size:
                        max_size = span["size"]

                text += "\n"

            cleaned = clean_text(text).strip()

            if cleaned:

                blocks.append({
                    "bbox": block["bbox"],
                    "text": cleaned,
                    "font_size": max_size,
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
