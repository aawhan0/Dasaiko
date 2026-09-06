from dataclasses import dataclass


@dataclass(frozen=True)
class PaperCatalogEntry:
    id: str
    title: str
    authors: str
    year: int
    topics: tuple[str, ...]
    difficulty: str
    importance: float
    reason: str
    starter_question: str
    tags: tuple[str, ...]
    prerequisites: tuple[str, ...] = ()


PAPER_CATALOG: tuple[PaperCatalogEntry, ...] = (
    PaperCatalogEntry(
        id="attention-is-all-you-need", title="Attention Is All You Need", authors="Vaswani et al.", year=2017,
        topics=("Deep Learning", "Natural Language Processing", "Generative AI", "Multimodal AI"), difficulty="Foundational", importance=0.99,
        reason="A landmark paper behind the Transformer architecture and modern generative AI.", starter_question="Why did the authors replace recurrence with self-attention in the Transformer?", tags=("transformer", "attention", "foundation"), prerequisites=(),
    ),
    PaperCatalogEntry(
        id="deep-residual-learning", title="Deep Residual Learning for Image Recognition", authors="He et al.", year=2015,
        topics=("Computer Vision", "Deep Learning", "Machine Learning"), difficulty="Foundational", importance=0.98,
        reason="A widely known milestone in deep learning and the foundation of ResNet.", starter_question="What problem do residual connections solve when training very deep networks?", tags=("resnet", "cnn", "foundation"), prerequisites=("convolution",),
    ),
    PaperCatalogEntry(
        id="retrieval-augmented-generation", title="Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", authors="Lewis et al.", year=2020,
        topics=("Generative AI", "Natural Language Processing", "Machine Learning"), difficulty="Accessible", importance=0.95,
        reason="A practical introduction to combining retrieval with language generation.", starter_question="Why does RAG retrieve external documents instead of relying only on the language model?", tags=("rag", "retrieval", "foundation"), prerequisites=("transformer", "retrieval"),
    ),
    PaperCatalogEntry(
        id="bert", title="BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", authors="Devlin et al.", year=2018,
        topics=("Natural Language Processing", "Deep Learning", "Machine Learning"), difficulty="Foundational", importance=0.97,
        reason="One of the most recognizable papers for understanding modern NLP pre-training.", starter_question="How does BERT's bidirectional pre-training help it understand language context?", tags=("bert", "pretraining", "foundation"),
    ),
    PaperCatalogEntry(
        id="alexnet", title="ImageNet Classification with Deep Convolutional Neural Networks", authors="Krizhevsky et al.", year=2012,
        topics=("Computer Vision", "Deep Learning", "Machine Learning"), difficulty="Accessible", importance=0.97,
        reason="A landmark paper for the deep-learning revolution in computer vision.", starter_question="What made AlexNet effective enough to dramatically improve ImageNet performance?", tags=("alexnet", "imagenet", "cnn"),
    ),
    PaperCatalogEntry(
        id="dqn", title="Human-level Control through Deep Reinforcement Learning", authors="Mnih et al.", year=2015,
        topics=("Reinforcement Learning", "Deep Learning", "Machine Learning"), difficulty="Accessible", importance=0.96,
        reason="A famous starting point for understanding deep reinforcement learning.", starter_question="How does DQN use a neural network to estimate which action should be taken?", tags=("dqn", "q-learning", "foundation"),
    ),
    PaperCatalogEntry(
        id="vision-transformer", title="An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale", authors="Dosovitskiy et al.", year=2020,
        topics=("Computer Vision", "Deep Learning", "Multimodal AI"), difficulty="Accessible", importance=0.94,
        reason="A clear bridge between the Transformer idea and modern vision models.", starter_question="How does Vision Transformer turn an image into a sequence that a Transformer can process?", tags=("vit", "transformer", "vision"),
    ),
    PaperCatalogEntry(
        id="gpt3", title="Language Models are Few-Shot Learners", authors="Brown et al.", year=2020,
        topics=("Generative AI", "Natural Language Processing", "Deep Learning"), difficulty="Accessible", importance=0.95,
        reason="A highly recognizable paper for understanding scaling and few-shot language models.", starter_question="What does GPT-3 demonstrate about scaling language models for few-shot learning?", tags=("gpt", "few-shot", "scaling"),
    ),
)
