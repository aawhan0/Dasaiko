export interface StarterPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  topics: string[];
  difficulty: "Foundational" | "Accessible" | "Intermediate";
  starterPriority: "best" | "great" | "good";
  reason: string;
  matchedInterests?: string[];
  starterQuestion: string;
}

export const STARTER_PAPERS: StarterPaper[] = [
  {
    id: "attention-is-all-you-need",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: 2017,
    topics: ["Deep Learning", "Natural Language Processing", "Generative AI", "Multimodal AI"],
    difficulty: "Foundational",
    starterPriority: "best",
    reason: "A landmark paper behind the Transformer architecture and modern generative AI.",
    starterQuestion: "Why did the authors replace recurrence with self-attention in the Transformer?",
  },
  {
    id: "deep-residual-learning",
    title: "Deep Residual Learning for Image Recognition",
    authors: "He et al.",
    year: 2015,
    topics: ["Computer Vision", "Deep Learning", "Machine Learning"],
    difficulty: "Foundational",
    starterPriority: "great",
    reason: "A widely known milestone in deep learning and the foundation of ResNet.",
    starterQuestion: "What problem do residual connections solve when training very deep networks?",
  },
  {
    id: "retrieval-augmented-generation",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: "Lewis et al.",
    year: 2020,
    topics: ["Generative AI", "Natural Language Processing", "Machine Learning"],
    difficulty: "Accessible",
    starterPriority: "great",
    reason: "A practical introduction to combining retrieval with language generation.",
    starterQuestion: "Why does RAG retrieve external documents instead of relying only on the language model?",
  },
  {
    id: "bert",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin et al.",
    year: 2018,
    topics: ["Natural Language Processing", "Deep Learning", "Machine Learning"],
    difficulty: "Foundational",
    starterPriority: "great",
    reason: "One of the most recognizable papers for understanding modern NLP pre-training.",
    starterQuestion: "How does BERT's bidirectional pre-training help it understand language context?",
  },
  {
    id: "alexnet",
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    authors: "Krizhevsky et al.",
    year: 2012,
    topics: ["Computer Vision", "Deep Learning", "Machine Learning"],
    difficulty: "Accessible",
    starterPriority: "best",
    reason: "A landmark paper for the deep-learning revolution in computer vision.",
    starterQuestion: "What made AlexNet effective enough to dramatically improve ImageNet performance?",
  },
  {
    id: "dqn",
    title: "Human-level Control through Deep Reinforcement Learning",
    authors: "Mnih et al.",
    year: 2015,
    topics: ["Reinforcement Learning", "Deep Learning", "Machine Learning"],
    difficulty: "Accessible",
    starterPriority: "best",
    reason: "A famous starting point for understanding deep reinforcement learning.",
    starterQuestion: "How does DQN use a neural network to estimate which action should be taken?",
  },
  {
    id: "vision-transformer",
    title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    authors: "Dosovitskiy et al.",
    year: 2020,
    topics: ["Computer Vision", "Deep Learning", "Multimodal AI"],
    difficulty: "Accessible",
    starterPriority: "great",
    reason: "A clear bridge between the Transformer idea and modern vision models.",
    starterQuestion: "How does Vision Transformer turn an image into a sequence that a Transformer can process?",
  },
  {
    id: "gpt3",
    title: "Language Models are Few-Shot Learners",
    authors: "Brown et al.",
    year: 2020,
    topics: ["Generative AI", "Natural Language Processing", "Deep Learning"],
    difficulty: "Accessible",
    starterPriority: "great",
    reason: "A highly recognizable paper for understanding scaling and few-shot language models.",
    starterQuestion: "What does GPT-3 demonstrate about scaling language models for few-shot learning?",
  },
];

export function recommendStarterPapers(interests: string[], limit = 3): StarterPaper[] {
  const normalized = interests.map((interest) => interest.trim().toLowerCase()).filter(Boolean);

  const ranked = STARTER_PAPERS
    .map((paper, index) => {
      const matches = paper.topics.filter((topic) =>
        normalized.some((interest) => interest === topic.toLowerCase()),
      ).length;

      const priorityBonus =
        paper.starterPriority === "best" ? 2 : paper.starterPriority === "great" ? 1 : 0;

      return {
        paper: { ...paper, matchedInterests: paper.topics.filter((topic) => normalized.includes(topic.toLowerCase())) },
        score: matches * 10 + priorityBonus,
        index,
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const picked: StarterPaper[] = [];
  const usedTopics = new Set<string>();
  for (const candidate of ranked) {
    const addsNewTopic = candidate.paper.topics.some((topic) => normalized.includes(topic.toLowerCase()) && !usedTopics.has(topic));
    if (addsNewTopic || picked.length < 1) {
      picked.push(candidate.paper);
      candidate.paper.topics.forEach((topic) => usedTopics.add(topic));
    }
    if (picked.length === limit) break;
  }
  return picked.length === limit ? picked : ranked.slice(0, limit).map(({ paper }) => paper);
}
