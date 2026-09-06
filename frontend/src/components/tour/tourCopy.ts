export const RESEARCH_TOUR_COPY = {
  preferences: {
    eyebrow: "1 of 7",
    title: "What are you researching?",
    description: "Pick a few areas. We’ll use them to make the first paper feel relevant.",
  },
  question: {
    eyebrow: "2 of 7",
    title: "Start with a paper.",
    description: "Pick the source that feels most relevant to your interests. We’ll keep your research question tied to it.",
  },
  paper: {
    eyebrow: "3 of 7",
    title: "Now ask the paper.",
    description: "We’ll prepare a useful starting question. Edit it if you want, then ask it against the paper you just opened.",
  },
  viewer: {
    eyebrow: "4 of 7",
    title: "Keep the paper in context.",
    description: "The source stays beside your research conversation, so you can move between the paper, question, and answer without losing context.",
  },
  inference: {
    eyebrow: "5 of 7",
    title: "Trace the answer back.",
    description: "Your answer is grounded in the selected research. Follow the evidence trail instead of treating the model as the source of truth.",
  },
  evidence: {
    eyebrow: "6 of 7",
    title: "Inspect the evidence.",
    description: "These sources are the trail behind the answer. Open one to jump back into the relevant part of the paper.",
  },
  complete: {
    eyebrow: "7 of 7",
    title: "You’re ready to research.",
    description: "Choose a source, ask a question, and trace the answer back to evidence.",
  },
} as const;
