export function buildResearchTourPrompt(documentTitle: string): string {
  const title = documentTitle.trim();

  if (!title) {
    return "What are the main contributions of this paper, and what evidence supports them?";
  }

  return `What are the main contributions of "${title}" and what evidence supports them?`;
}

export function buildTopicPrompt(topic: string): string {
  const normalizedTopic = topic.trim();

  if (!normalizedTopic) {
    return "What should I understand first about this research area?";
  }

  return `What are the key ideas I should understand first about ${normalizedTopic}?`;
}
