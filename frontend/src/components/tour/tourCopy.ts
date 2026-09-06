export const RESEARCH_TOUR_COPY = {
  preferences: {
    eyebrow: "1 of 6",
    title: "What are you researching?",
    description: "Pick a few areas. We’ll use them to make the first paper feel relevant.",
  },
  paper: {
    eyebrow: "2 of 6",
    title: "Start with a paper.",
    description: "Pick the highlighted paper that best matches your interests. We’ll keep your first question tied to it.",
  },
  question: {
    eyebrow: "3 of 6",
    title: "Ask your first question.",
    description: "We prepared a useful starting question from the paper. Edit it if you want, then send it.",
  },
  inference: {
    eyebrow: "4 of 6",
    title: "See the grounded answer.",
    description: "Dasaiko answers from the research context instead of asking you to trust a standalone model response.",
  },
  evidence: {
    eyebrow: "5 of 6",
    title: "Trace it back to evidence.",
    description: "Inspect the sources behind the answer and jump back into the relevant part of the paper.",
  },
  complete: {
    eyebrow: "6 of 6",
    title: "You’re ready to research.",
    description: "Choose a source, ask a question, and trace the answer back to evidence.",
  },
} as const;
