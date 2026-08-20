EVALUATION_CASES = [

    # ============================================================
    # ATTENTION IS ALL YOU NEED
    # ============================================================

    {
        "id": "attn_01",
        "query": "How does scaled dot-product attention work?",
        "document_titles": [
            "NIPS-2017-attention-is-all-you-need-Paper"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "attn_02",
        "query": "Why does the Transformer use multi-head attention?",
        "document_titles": [
            "NIPS-2017-attention-is-all-you-need-Paper"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "attn_03",
        "query": "Why does the Transformer remove recurrence?",
        "document_titles": [
            "NIPS-2017-attention-is-all-you-need-Paper"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "attn_04",
        "query": "What advantage does the Transformer gain from removing recurrence?",
        "document_titles": [
            "NIPS-2017-attention-is-all-you-need-Paper"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "attn_05",
        "query": "What translation performance does the Transformer achieve?",
        "document_titles": [
            "NIPS-2017-attention-is-all-you-need-Paper"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },


    # ============================================================
    # NEURAL MACHINE TRANSLATION
    # ============================================================

    {
        "id": "nmt_01",
        "query": "What problem does attention solve in neural machine translation?",
        "document_titles": [
            "neural_mt_1409.0473v7"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "nmt_02",
        "query": "How does the attention model compute the context vector?",
        "document_titles": [
            "neural_mt_1409.0473v7"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "nmt_03",
        "query": "Why does attention help the encoder-decoder translate long sentences?",
        "document_titles": [
            "neural_mt_1409.0473v7"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "nmt_04",
        "query": "Why is soft alignment useful for translating phrases?",
        "document_titles": [
            "neural_mt_1409.0473v7"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },


    # ============================================================
    # WORD2VEC
    # ============================================================

    {
        "id": "w2v_01",
        "query": "How does the Skip-gram model learn word representations?",
        "document_titles": [
            "word2vec"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "w2v_02",
        "query": "How does hierarchical softmax reduce the computational cost of softmax?",
        "document_titles": [
            "word2vec"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "w2v_03",
        "query": "Why does the Skip-gram paper use a Huffman tree?",
        "document_titles": [
            "word2vec"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "w2v_04",
        "query": "What do the phrase analogy experiments demonstrate about Skip-gram representations?",
        "document_titles": [
            "word2vec"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },


    # ============================================================
    # GLOVE
    # ============================================================

    {
        "id": "glove_01",
        "query": "What is the main idea behind GloVe?",
        "document_titles": [
            "glove"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "glove_02",
        "query": "How does GloVe use word co-occurrence statistics?",
        "document_titles": [
            "glove"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "glove_03",
        "query": "How does GloVe relate to prediction-based word-vector models such as skip-gram?",
        "document_titles": [
            "glove"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },

    {
        "id": "glove_04",
        "query": "What happens to GloVe performance when the training corpus becomes much larger?",
        "document_titles": [
            "glove"
        ],
        "relevant_chunk_ids": [],
        "category": "multi_chunk",
    },


    # ============================================================
    # SEQUENCE TO SEQUENCE
    # ============================================================

    {
        "id": "seq_01",
        "query": "Why are sequences challenging for standard feedforward neural networks?",
        "document_titles": [
            "seq2seq"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "seq_02",
        "query": "How does the LSTM encoder-decoder model represent an input sequence?",
        "document_titles": [
            "seq2seq"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

    {
        "id": "seq_03",
        "query": "How does beam search generate translations in the sequence-to-sequence model?",
        "document_titles": [
            "seq2seq"
        ],
        "relevant_chunk_ids": [],
        "category": "direct",
    },

]