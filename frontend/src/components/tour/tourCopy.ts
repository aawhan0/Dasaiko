export const RESEARCH_TOUR_COPY = {
  preferences: {
    eyebrow: "1 of 7",
    title: "What are you researching?",
    description: "Pick a few areas. We’ll use them to make the first paper feel relevant.",
  },
  question: {
    eyebrow: "2 of 7",
    title: "Start with a question.",
    description: "Ask Dasaiko about the research you want to understand. We’ll guide the next step from here.",
  },
  paper: {
    eyebrow: "3 of 7",
    title: "Pick the source you want to explore.",
    description: "Choose a paper from your workspace. Dasaiko keeps the question tied to the evidence you are reading.",
  },
  viewer: {
    eyebrow: "4 of 7",
    title: "Keep the paper in context.",
    description: "The paper stays beside your research conversation. Ask your question, then inspect the retrieved evidence behind the answer.",
  },
  inference: {
    eyebrow: "5 of 7",
    title: "Now ask the paper.",
    description: "Edit the prepared question if you want, then ask. The response is grounded in the selected research.",
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
