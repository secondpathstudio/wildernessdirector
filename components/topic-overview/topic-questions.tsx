'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { QuestionCreator } from "./question-creator";
import { QuestionDetail, questionStatus, statusLabel } from "./question-detail";
import { QuestionEditDialog } from "./question-edit-dialog";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, deleteDoc, doc, orderBy, query, where } from "firebase/firestore";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { REQUIRED_APPROVED_QUESTIONS } from "@/lib/CONSTANTS";

interface TopicQuestionsProps {
  topicId: string;
}

export const TopicQuestions: FC<TopicQuestionsProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const questionsQuery = query(questionsCollection,
    orderBy('createdAt', 'desc'),
    where('topicId', '==', props.topicId),
    where('authorId', '==', auth.currentUser?.uid));
  const { status, data: questions } = useFirestoreCollectionData(questionsQuery, {
    idField: 'id',
  });

  const [viewQuestion, setViewQuestion] = useState<any | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<any | null>(null);

  const approvedCount = questions?.filter((question: any) => question.approved).length ?? 0;

  const handleQuestionDelete = async () => {
    if (deleteQuestion === null) {
      return;
    }
    try {
      await deleteDoc(doc(questionsCollection, deleteQuestion.id));
      toast({ title: "Question deleted" });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to delete question", description: `${error}` });
    }
    setDeleteQuestion(null);
  }

  const truncateQuestion = (questionText: string) => {
    return questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText;
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                {status === "success" && (
                  <CardDescription>
                    {approvedCount} / {REQUIRED_APPROVED_QUESTIONS} approved for this topic
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading questions...</p>}
                {status === "error" && <p>Error loading questions!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Question Text</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>No questions yet — use the creator to add your first one.</TableCell>
                      </TableRow>
                    )
                    :
                    questions.map((question: any) => (
                      <TableRow key={question.id}>
                        <TableCell title={question.reviewComment ?? undefined}>
                          {statusLabel[questionStatus(question)]}
                        </TableCell>
                        <TableCell>{question.createdAt.toDate().toLocaleDateString()}</TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => setViewQuestion(question)}
                        >
                          {truncateQuestion(question.questionText)}
                        </TableCell>
                        <TableCell>{question.questionType}</TableCell>
                        <TableCell>
                          {/* approved questions are locked; ask an admin for fixes */}
                          {!question.approved && (
                            <Button variant="outline" size="sm" onClick={() => setEditQuestion(question)}>
                              Edit
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteQuestion(question)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
            <QuestionCreator topicId={props.topicId} />
          </div>
        </div>

        <Dialog open={viewQuestion !== null} onOpenChange={(open) => !open && setViewQuestion(null)}>
          <DialogContent className="sm:max-w-[425px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
            {viewQuestion && <QuestionDetail question={viewQuestion} />}
          </DialogContent>
        </Dialog>

        <QuestionEditDialog
          question={editQuestion}
          onOpenChange={(open) => !open && setEditQuestion(null)}
        />

        <Dialog open={deleteQuestion !== null} onOpenChange={(open) => !open && setDeleteQuestion(null)}>
          <DialogContent className="sm:max-w-[425px] w-11/12 rounded-md">
            <DialogHeader>
              <DialogTitle>Delete this question?</DialogTitle>
              <DialogDescription>
                {deleteQuestion && truncateQuestion(deleteQuestion.questionText)}
              </DialogDescription>
              <DialogDescription>
                This cannot be undone{deleteQuestion?.approved ? ", and it will lower your approved count for this topic" : ""}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteQuestion(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleQuestionDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
};
