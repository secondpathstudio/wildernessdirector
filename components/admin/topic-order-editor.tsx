'use client';
import { FC, useEffect, useState } from "react";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, deleteField, doc, orderBy, query, updateDoc } from "firebase/firestore";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { getMonth } from "@/lib/CONSTANTS";
import { sanitizeTopicOrder, sortTopicsByOrder } from "@/lib/topic-order";

interface TopicOrderEditorProps {
  userId: string;
  savedTopicOrder: unknown;
  // when provided, rows are clickable and the matching row is highlighted
  selectedTopicId?: string | null;
  onTopicSelect?: (topicId: string) => void;
}

export const TopicOrderEditor: FC<TopicOrderEditorProps> = (props) => {
  const firestore = useFirestore();
  const topicsQuery = query(collection(firestore, "topics"), orderBy('topicNumber', 'asc'));
  const { status, data: topics } = useFirestoreCollectionData(topicsQuery, {
    idField: 'id',
  });
  // null = no unsaved edits
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);

  // discard unsaved edits when a different user is selected
  useEffect(() => {
    setDraftOrder(null);
  }, [props.userId]);

  if (status !== "success" || !topics || topics.length === 0) {
    return null;
  }

  const topicById = new Map(topics.map((topic: any) => [topic.id, topic]));
  const savedOrderIds = sortTopicsByOrder(topics as { id: string }[], props.savedTopicOrder)
    .map((topic) => topic.id);
  const orderedIds = draftOrder ?? savedOrderIds;
  const isDirty = draftOrder !== null
    && draftOrder.join('\n') !== savedOrderIds.join('\n');
  const hasSavedOrder = Array.isArray(props.savedTopicOrder) && props.savedTopicOrder.length > 0;

  const moveTopic = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= orderedIds.length) {
      return;
    }
    const next = [...orderedIds];
    [next[index], next[target]] = [next[target], next[index]];
    setDraftOrder(next);
  };

  const saveOrder = async () => {
    if (draftOrder === null || props.userId === "") {
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${props.userId}`), {
        topicOrder: sanitizeTopicOrder(draftOrder, topics.map((topic: any) => topic.id)),
      });
      toast({
        title: "Topic order saved",
        description: "This fellow's curriculum now follows the custom order.",
      });
      setDraftOrder(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save topic order", description: `${e}` });
    }
  };

  const resetOrder = async () => {
    if (props.userId === "") {
      return;
    }

    try {
      await updateDoc(doc(firestore, `users/${props.userId}`), {
        topicOrder: deleteField(),
      });
      toast({
        title: "Topic order reset",
        description: "This fellow follows the default curriculum order.",
      });
      setDraftOrder(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to reset topic order", description: `${e}` });
    }
  };

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3">
        <h4 className="text-sm font-semibold">Topic order</h4>
        {isDirty && (
          <>
            <Button size="sm" onClick={saveOrder}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setDraftOrder(null)}>Cancel</Button>
          </>
        )}
        {!isDirty && hasSavedOrder && (
          <Button size="sm" variant="outline" onClick={resetOrder}>Reset to default</Button>
        )}
      </div>
      <div className="mt-2 divide-y rounded-md border">
        {orderedIds.map((topicId, i) => {
          const topic: any = topicById.get(topicId);
          const isSelected = props.selectedTopicId === topicId;
          return (
            <div
              key={topicId}
              className={`flex items-center gap-2 px-3 py-1.5 ${isSelected ? 'bg-muted' : ''}`}
            >
              <button
                type="button"
                className={`flex flex-1 items-center gap-2 text-left ${props.onTopicSelect ? 'cursor-pointer hover:text-primary' : ''}`}
                onClick={() => props.onTopicSelect?.(topicId)}
                disabled={!props.onTopicSelect}
              >
                <span className="w-24 text-sm text-muted-foreground">{getMonth(i)}</span>
                <span className={`flex-1 text-sm ${isSelected ? 'font-semibold' : ''}`}>{topic?.topicName}</span>
              </button>
              <Button
                size="sm"
                variant="ghost"
                disabled={i === 0}
                onClick={() => moveTopic(i, -1)}
                aria-label={`Move ${topic?.topicName} earlier`}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={i === orderedIds.length - 1}
                onClick={() => moveTopic(i, 1)}
                aria-label={`Move ${topic?.topicName} later`}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
