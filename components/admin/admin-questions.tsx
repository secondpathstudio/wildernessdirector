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
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, deleteDoc, deleteField, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { QuestionDetail, questionStatus, statusLabel } from "../topic-overview/question-detail";
import { QuestionEditDialog } from "../topic-overview/question-edit-dialog";

interface AdminQuestionsProps {
  userId: string | undefined;
}

type StatusFilter = "pending" | "approved" | "all";

export const AdminTopicQuestions: FC<AdminQuestionsProps> = (props) => {
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  // "" (nothing selected) and "All" both mean the whole cohort
  const authorFilter = props.userId && props.userId !== "All" ? props.userId : null;
  const questionsQuery = authorFilter
    ? query(questionsCollection, orderBy('createdAt', 'desc'), where('authorId', '==', authorFilter))
    : query(questionsCollection, orderBy('createdAt', 'desc'));
  const { status, data: questions } = useFirestoreCollectionData(questionsQuery, {
    idField: 'id',
  });

  const topicsQuery = query(collection(firestore, "topics"), orderBy('topicNumber', 'asc'));
  const { data: topics } = useFirestoreCollectionData(topicsQuery, { idField: 'id' });
  const topicNameById = new Map(topics?.map((topic: any) => [topic.id, topic.topicName]) ?? []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [viewQuestion, setViewQuestion] = useState<any | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const filteredQuestions = questions?.filter((question: any) => {
    if (statusFilter === "pending") return !question.approved;
    if (statusFilter === "approved") return question.approved;
    return true;
  }) ?? [];

  const handleQuestionApprove = async (question: any) => {
    try {
      await updateDoc(doc(questionsCollection, question.id), {
        approved: true,
        reviewComment: deleteField(),
      });
      toast({ title: "Question approved" });
      setViewQuestion(null);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to approve question", description: `${error}` });
    }
  }

  const handleRequestRevision = async (question: any) => {
    if (reviewComment.trim() === "") {
      toast({ title: "Add a comment", description: "Tell the fellow what needs to change." });
      return;
    }
    try {
      await updateDoc(doc(questionsCollection, question.id), {
        approved: false,
        reviewComment: reviewComment.trim(),
      });
      toast({ title: "Revision requested", description: "The fellow will see your comment on the question." });
      setReviewComment("");
      setViewQuestion(null);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to request revision", description: `${error}` });
    }
  }

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Question Review</CardTitle>
                <CardDescription>
                  {authorFilter ? "Questions by the selected fellow" : "Questions from all fellows"}
                </CardDescription>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <TabsList>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading questions...</p>}
                {status === "error" && <p>Error loading questions!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Question Text</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9}>
                          {statusFilter === "pending" ? "No questions waiting for review." : "No questions found."}
                        </TableCell>
                      </TableRow>
                    )
                    :
                    filteredQuestions.map((question: any) => (
                      <TableRow key={question.id}>
                        <TableCell>{question.createdAt.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{question.authorName}</TableCell>
                        <TableCell>{topicNameById.get(question.topicId) ?? "—"}</TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => { setReviewComment(""); setViewQuestion(question); }}
                        >
                          {truncateQuestion(question.questionText)}
                        </TableCell>
                        <TableCell>{question.questionType}</TableCell>
                        <TableCell>{statusLabel[questionStatus(question)]}</TableCell>
                        <TableCell>
                          {!question.approved && (
                            <Button size="sm" onClick={() => handleQuestionApprove(question)}>
                              Approve
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setEditQuestion(question)}>
                            Edit
                          </Button>
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
          </div>
        </div>

        <Dialog open={viewQuestion !== null} onOpenChange={(open) => !open && setViewQuestion(null)}>
          <DialogContent className="sm:max-w-[500px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
            {viewQuestion && (
              <>
                <QuestionDetail question={viewQuestion} />
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    type="button"
                    onClick={() => handleQuestionApprove(viewQuestion)}
                    disabled={viewQuestion.approved}
                  >
                    {viewQuestion.approved ? "Approved ✅" : "Approve"}
                  </Button>
                  {!viewQuestion.approved && (
                    <div className="w-full space-y-2">
                      <Textarea
                        placeholder="What needs to change before this can be approved?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleRequestRevision(viewQuestion)}
                      >
                        Request Revision
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </>
            )}
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
                {deleteQuestion && `${deleteQuestion.authorName}: ${truncateQuestion(deleteQuestion.questionText)}`}
              </DialogDescription>
              <DialogDescription>
                This permanently removes the fellow&apos;s work. Consider requesting a revision instead.
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
