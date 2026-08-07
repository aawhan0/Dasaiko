from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

paragraph_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=0,
)


def split_text(text: str) -> list[str]:
    return splitter.split_text(text)


def split_paragraph(text: str) -> list[str]:
    return paragraph_splitter.split_text(text)


def split_page(page: dict):
    chunks = []

    for paragraph in page["paragraphs"]:
        paragraph_chunks = split_paragraph(paragraph["text"])

        for content in paragraph_chunks:
            chunks.append(
                {
                    "content": content,
                    "page_number": page["page_number"],
                    "page_width": page["page_width"],
                    "page_height": page["page_height"],
                    "chunk_index": len(chunks),
                    "bboxes": [paragraph["bbox"]],
                }
            )

    return chunks
