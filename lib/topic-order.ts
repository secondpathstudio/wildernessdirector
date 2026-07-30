// Per-fellow curriculum ordering. users/{uid}.topicOrder is an optional,
// admin-written array of topic doc ids; when absent the canonical
// topicNumber order applies everywhere.

const isTopicOrder = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((id) => typeof id === "string");

// Sorts topics by the fellow's saved order. `topics` must already be in
// canonical (topicNumber asc) order. Ids in topicOrder that match no topic
// are ignored; topics missing from topicOrder are appended at the end in
// canonical order, so the list survives topics being added or deleted
// after an order was saved.
export function sortTopicsByOrder<T extends { id: string }>(
  topics: T[],
  topicOrder?: unknown
): T[] {
  if (!isTopicOrder(topicOrder)) {
    return [...topics];
  }

  const orderIndex = new Map<string, number>();
  topicOrder.forEach((id, i) => {
    if (!orderIndex.has(id)) {
      orderIndex.set(id, i);
    }
  });

  const inOrder = topics
    .filter((topic) => orderIndex.has(topic.id))
    .sort((a, b) => orderIndex.get(a.id)! - orderIndex.get(b.id)!);
  const leftovers = topics.filter((topic) => !orderIndex.has(topic.id));

  return [...inOrder, ...leftovers];
}

// Academic month index (0 = July) a fellow should see for a topic: its
// position in their order, else the canonical topicNumber. A topic added
// after an order was saved keeps its canonical month until an admin
// re-saves the order.
export function effectiveMonthIndex(
  topicId: string,
  topicNumber: number,
  topicOrder?: unknown
): number {
  if (isTopicOrder(topicOrder)) {
    const index = topicOrder.indexOf(topicId);
    if (index !== -1) {
      return index;
    }
  }
  return topicNumber;
}

// Cleans an order before writing: drops ids that aren't current topics and
// dedupes, preserving order.
export function sanitizeTopicOrder(order: string[], validIds: string[]): string[] {
  const valid = new Set(validIds);
  const seen = new Set<string>();
  return order.filter((id) => {
    if (!valid.has(id) || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}
