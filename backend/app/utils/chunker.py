from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

# Configurable constants for paragraph merging
VERTICAL_MERGE_THRESHOLD = 12.0  # Max vertical distance (in points) to merge blocks
HORIZONTAL_MERGE_THRESHOLD = 50.0  # Max horizontal shift (in points) to merge blocks

# Configurable constants for chunking
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)


def split_text(text: str) -> list[str]:
    return splitter.split_text(text)


def split_page(page: dict):
    # 1. Merge adjacent blocks into logical paragraphs
    paragraphs = []

    for block in page["blocks"]:
        bbox = block["bbox"]
        block_text = block["text"]

        # Check if we should merge with the last paragraph
        merged = False
        if paragraphs:
            last_para = paragraphs[-1]
            last_block = last_para["blocks"][-1]

            # Calculate gaps
            y_gap = bbox[1] - last_block["bbox"][3]  # next_y0 - last_y1
            x_gap = abs(bbox[0] - last_block["bbox"][0])  # abs(next_x0 - last_x0)

            # Merge if within vertical and horizontal thresholds
            if abs(y_gap) <= VERTICAL_MERGE_THRESHOLD and x_gap <= HORIZONTAL_MERGE_THRESHOLD:
                # Add spacing to text
                last_para["text"] += "\n" + block_text

                # Record start/end char indices
                start_char = len(last_para["text"]) - len(block_text)
                end_char = len(last_para["text"])

                last_para["blocks"].append({
                    "bbox": bbox,
                    "start": start_char,
                    "end": end_char
                })
                merged = True

        if not merged:
            # Create a new paragraph
            paragraphs.append({
                "text": block_text,
                "blocks": [{
                    "bbox": bbox,
                    "start": 0,
                    "end": len(block_text)
                }]
            })

    # 2. Split paragraphs that exceed CHUNK_SIZE
    chunks = []
    chunk_index = 0

    for para in paragraphs:
        para_text = para["text"]

        if len(para_text) <= CHUNK_SIZE:
            # Small paragraph, fits in one chunk
            chunks.append({
                "content": para_text,
                "page_number": page["page_number"],
                "page_width": page["page_width"],
                "page_height": page["page_height"],
                "chunk_index": chunk_index,
                "bboxes": [b["bbox"] for b in para["blocks"]],
            })
            chunk_index += 1
        else:
            # Paragraph exceeds chunk size, split it
            sub_texts = splitter.split_text(para_text)
            last_search_idx = 0

            for sub_text in sub_texts:
                # Locate character range of sub_text in para_text
                chunk_start = para_text.find(sub_text, last_search_idx)
                if chunk_start == -1:
                    chunk_start = last_search_idx
                chunk_end = chunk_start + len(sub_text)
                last_search_idx = chunk_start

                # Inherit bboxes from overlapping blocks
                chunk_bboxes = []
                for b in para["blocks"]:
                    # Overlap if max(start1, start2) < min(end1, end2)
                    if max(b["start"], chunk_start) < min(b["end"], chunk_end):
                        chunk_bboxes.append(b["bbox"])

                chunks.append({
                    "content": sub_text,
                    "page_number": page["page_number"],
                    "page_width": page["page_width"],
                    "page_height": page["page_height"],
                    "chunk_index": chunk_index,
                    "bboxes": chunk_bboxes,
                })
                chunk_index += 1

    return chunks