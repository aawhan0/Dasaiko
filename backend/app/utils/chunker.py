from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)


def split_text(text: str) -> list[str]:
    return splitter.split_text(text)


def split_page(page: dict):
    chunks = []

    chunk_index = 0

    current_text = ""
    current_boxes = []

    for block in page["blocks"]:

        block_text = block["text"]

        # If adding this block exceeds the chunk size,
        # flush the current chunk.
        if (
            current_text
            and len(current_text) + len(block_text)
            > 1000
        ):
            chunks.append(
                {
                    "content": current_text.strip(),
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                    "bboxes": current_boxes,
                }
            )

            chunk_index += 1
            current_text = ""
            current_boxes = []

        current_text += block_text + "\n"
        current_boxes.append(block["bbox"])

    # Flush final chunk
    if current_text.strip():
        chunks.append(
            {
                "content": current_text.strip(),
                "page_number": page["page_number"],
                "chunk_index": chunk_index,
                "bboxes": current_boxes,
            }
        )

    return chunks