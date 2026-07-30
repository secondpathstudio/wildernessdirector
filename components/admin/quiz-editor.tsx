'use client';
import { FC, useState } from "react";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { Timestamp, addDoc, collection, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "../ui/use-toast";
import { getMonth } from "@/lib/CONSTANTS";

const ALL_TOPICS = "__all__";

interface QuizEditorProps {
  // the quiz being edited, or null when creating a new one
  existingQuiz: any | null;
  onSaved: () => void;
}

export const QuizEditor: FC<QuizEditorProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const existing = props.existingQuiz;
  const [title, setTitle] = useState<string>(existing?.title ?? "");
  const [topicId, setTopicId] = useState<string>(existing?.topicId ?? "");
  const [questionIds, setQuestionIds] = useState<string[]>(existing?.questionIds ?? []);
  const [pickerTopic, setPickerTopic] = useState<string>(existing?.topicId ?? ALL_TOPICS);
  const [isSaving, setIsSaving] = useState(false);

  const topicsQuery = query(collection(firestore, "topics"), orderBy('topicNumber', 'asc'));
  const { data: topics } = useFirestoreCollectionData(topicsQuery, { idField: 'id' });
  const topicNameById = new Map(topics?.map((topic: any) => [topic.id, topic.topicName]) ?? []);

  // the whole approved bank; the picker filters it client-side by topic
  const bankQuery = query(collection(firestore, "questions"), where('approved', '==', true));
  const { status: bankStatus, data: bank } = useFirestoreCollectionData(bankQuery, { idField: 'id' });

  const pickerQuestions = (bank ?? []).filter(
    (question: any) => pickerTopic === ALL_TOPICS || question.topicId === pickerTopic
  );

  const toggleQuestion = (questionId: string, checked: boolean) => {
    if (checked) {
      setQuestionIds([...questionIds, questionId]);
    } else {
      setQuestionIds(questionIds.filter((id) => id !== questionId));
    }
  };

  const handleAssignedTopicChange = (newTopicId: string) => {
    // keep the picker following the assigned topic until the admin
    // deliberately filters elsewhere
    if (pickerTopic === topicId || pickerTopic === ALL_TOPICS) {
      setPickerTopic(newTopicId);
    }
    setTopicId(newTopicId);
  };

  const handleSave = async () => {
    if (title.trim() === "") {
      toast({ title: "Quiz incomplete", description: "Give the quiz a title." });
      return;
    }
    if (topicId === "") {
      toast({ title: "Quiz incomplete", description: "Assign the quiz to a topic." });
      return;
    }
    // drop ids that no longer exist in the approved bank
    const validIds = new Set((bank ?? []).map((question: any) => question.id));
    const cleanIds = questionIds.filter((id) => validIds.has(id));
    if (cleanIds.length === 0) {
      toast({ title: "Quiz incomplete", description: "Select at least one question." });
      return;
    }

    setIsSaving(true);
    try {
      if (existing) {
        await updateDoc(doc(firestore, "quizzes", existing.id), {
          title: title.trim(),
          topicId,
          questionIds: cleanIds,
          updatedAt: Timestamp.now(),
        });
        toast({ title: "Quiz updated" });
      } else {
        await addDoc(collection(firestore, "quizzes"), {
          title: title.trim(),
          topicId,
          questionIds: cleanIds,
          createdBy: auth.currentUser?.uid ?? "unknown",
          createdAt: Timestamp.now(),
        });
        toast({ title: "Quiz created", description: "Fellows will see it on the topic page." });
      }
      props.onSaved();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to save quiz", description: `${error}` });
    }
    setIsSaving(false);
  };

  const truncate = (text: string) =>
    text.length > 60 ? text.substring(0, 60) + '...' : text;

  return (
    <fieldset disabled={isSaving} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          placeholder="e.g. December Review Quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Assigned topic</label>
        <Select value={topicId} onValueChange={handleAssignedTopicChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose the topic this quiz appears under" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {topics?.map((topic: any, i: number) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {getMonth(topic.topicNumber)} — {topic.topicName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Questions ({questionIds.length} selected)
          </label>
          <Select value={pickerTopic} onValueChange={setPickerTopic}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ALL_TOPICS}>All topics</SelectItem>
                {topics?.map((topic: any) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.topicName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y rounded-md border">
          {bankStatus === "loading" && <p className="p-3 text-sm">Loading approved questions...</p>}
          {bankStatus === "success" && pickerQuestions.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">
              No approved questions {pickerTopic === ALL_TOPICS ? "yet" : "for this topic"}.
            </p>
          )}
          {pickerQuestions.map((question: any) => (
            <label key={question.id} className="flex items-start gap-2 px-3 py-2 cursor-pointer">
              <Checkbox
                checked={questionIds.includes(question.id)}
                onCheckedChange={(checked) => toggleQuestion(question.id, checked as boolean)}
                className="mt-0.5"
              />
              <span className="text-sm">
                {truncate(question.questionText)}
                <span className="block text-xs text-muted-foreground">
                  {question.questionType} · {topicNameById.get(question.topicId) ?? "Unknown topic"}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        {existing ? "Save Changes" : "Create Quiz"}
      </Button>
    </fieldset>
  );
};
