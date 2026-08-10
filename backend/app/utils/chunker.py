from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)


splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)


def split_text(text: str) -> list[str]:
    return splitter.split_text(text)


def _normalize_text(text: str) -> str:
    return " ".join(
        (text or "").split()
    ).strip()


def _find_chunk_bboxes(
    chunk_text: str,
    lines: list[dict],
) -> list[list[float]]:

    normalized_chunk = _normalize_text(
        chunk_text
    )

    if not normalized_chunk:
        return []

    normalized_lines = [
        (
            _normalize_text(line["text"]),
            line["bbox"],
        )
        for line in lines
        if _normalize_text(line["text"])
    ]

    if not normalized_lines:
        return []

    chunk_words = normalized_chunk.split()

    best_start = None
    best_end = None
    best_match_count = 0

    for start_index in range(
        len(normalized_lines)
    ):

        collected_words = []

        for end_index in range(
            start_index,
            len(normalized_lines),
        ):

            collected_words.extend(
                normalized_lines[end_index][0].split()
            )

            match_count = 0

            max_words = min(
                len(chunk_words),
                len(collected_words),
            )

            for word_index in range(
                max_words
            ):

                if (
                    collected_words[word_index].lower()
                    == chunk_words[word_index].lower()
                ):
                    match_count += 1
                else:
                    break

            if match_count > best_match_count:
                best_match_count = match_count
                best_start = start_index
                best_end = end_index

            if (
                match_count
                >= len(chunk_words)
            ):
                break

    if (
        best_start is None
        or best_end is None
        or best_match_count == 0
    ):
        return []

    return [
        normalized_lines[index][1]
        for index in range(
            best_start,
            best_end + 1,
        )
    ]


def split_page(page: dict):

    chunks = []

    for block in page["blocks"]:

        block_chunks = splitter.split_text(
            block["text"]
        )

        for content in block_chunks:

            bboxes = _find_chunk_bboxes(
                content,
                block["lines"],
            )

            # ----------------------------------------
            # Safety fallback.
            #
            # If exact line matching fails, retain
            # the block bbox rather than creating
            # invalid highlight coordinates.
            # ----------------------------------------

            if not bboxes:
                bboxes = [
                    block["bbox"]
                ]

            chunks.append(
                {
                    "content": content,

                    "page_number": page[
                        "page_number"
                    ],

                    "page_width": page[
                        "page_width"
                    ],

                    "page_height": page[
                        "page_height"
                    ],

                    "chunk_index": len(
                        chunks
                    ),

                    "bboxes": bboxes,
                }
            )

    return chunks