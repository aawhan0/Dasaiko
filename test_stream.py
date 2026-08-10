import json
import time
import requests


BASE_URL = "http://127.0.0.1:8000"


# ============================================================
# STEP 1 — FIND REAL CONVERSATIONS
# ============================================================

print("=" * 60)
print("Dasaiko Streaming Diagnostic")
print("=" * 60)

print("\nFetching conversations...")

try:
    conversations_response = requests.get(
        f"{BASE_URL}/conversations",
        timeout=30,
    )

    print(
        "Conversation API status:",
        conversations_response.status_code,
    )

    conversations_response.raise_for_status()

    conversations_payload = (
        conversations_response.json()
    )

    print(
        json.dumps(
            conversations_payload,
            indent=2,
        )
    )

except Exception as error:

    print("\nCould not fetch conversations:")
    print(error)

    raise SystemExit(1)


# ============================================================
# EXTRACT CONVERSATIONS
# ============================================================

data = conversations_payload.get(
    "data",
    [],
)

if not data:

    print()
    print(
        "No conversations were returned."
    )

    raise SystemExit(1)


print()
print("=" * 60)
print("AVAILABLE CONVERSATIONS")
print("=" * 60)

for conversation in data:

    print(
        f"ID: {conversation.get('id')} | "
        f"Title: {conversation.get('title', 'Untitled')}"
    )


# ============================================================
# CHOOSE CONVERSATION
# ============================================================

conversation_id = int(
    input(
        "\nEnter the conversation ID to test: "
    )
)


# ============================================================
# DOCUMENT
# ============================================================

document_id_input = input(
    "Enter selected document ID "
    "(press Enter for none): "
).strip()

selected_document_id = (
    int(document_id_input)
    if document_id_input
    else None
)


# ============================================================
# QUERY
# ============================================================

query = (
    "Explain the main ideas of this paper "
    "in detail"
)


payload = {
    "conversation_id":
        conversation_id,

    "query":
        query,

    "selected_document_id":
        selected_document_id,
}


print()
print("=" * 60)
print("STREAMING TEST")
print("=" * 60)

print(
    "Payload:"
)

print(
    json.dumps(
        payload,
        indent=2,
    )
)

print()
print("Connecting...")


# ============================================================
# STREAM
# ============================================================

start = time.perf_counter()

try:

    response = requests.post(
        f"{BASE_URL}/chat/stream",

        json=payload,

        headers={
            "Accept":
                "text/event-stream",

            "Cache-Control":
                "no-cache",
        },

        stream=True,

        timeout=120,
    )

    print(
        f"\nHTTP Status: "
        f"{response.status_code}"
    )

    if response.status_code != 200:

        print()
        print("ERROR:")
        print(
            response.text
        )

        raise SystemExit(1)

    print()
    print(
        "STREAM STARTED"
    )

    print("=" * 60)

    for line in response.iter_lines(
        decode_unicode=True
    ):

        if not line:
            continue

        elapsed = (
            time.perf_counter()
            - start
        )

        print(
            f"[{elapsed:7.2f}s] "
            f"{line}"
        )

except requests.exceptions.RequestException as error:

    print()
    print("=" * 60)
    print("REQUEST FAILED")
    print("=" * 60)
    print(error)