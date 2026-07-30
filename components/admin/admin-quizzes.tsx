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
import { collection, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { QuizEditor } from "./quiz-editor";

export const AdminQuizzes: FC = () => {
  const firestore = useFirestore();
  const quizzesQuery = query(collection(firestore, "quizzes"), orderBy('createdAt', 'desc'));
  const { status, data: quizzes } = useFirestoreCollectionData(quizzesQuery, { idField: 'id' });

  const topicsQuery = query(collection(firestore, "topics"), orderBy('topicNumber', 'asc'));
  const { data: topics } = useFirestoreCollectionData(topicsQuery, { idField: 'id' });
  const topicNameById = new Map(topics?.map((topic: any) => [topic.id, topic.topicName]) ?? []);

  // editorQuiz: undefined = closed, null = creating new, object = editing
  const [editorQuiz, setEditorQuiz] = useState<any | null | undefined>(undefined);
  const [deleteQuiz, setDeleteQuiz] = useState<any | null>(null);

  const handleQuizDelete = async () => {
    if (deleteQuiz === null) {
      return;
    }
    try {
      await deleteDoc(doc(firestore, "quizzes", deleteQuiz.id));
      toast({ title: "Quiz deleted" });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to delete quiz", description: `${error}` });
    }
    setDeleteQuiz(null);
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quizzes</CardTitle>
                    <CardDescription>
                      Curated question sets fellows see on their topic page.
                    </CardDescription>
                  </div>
                  <Button onClick={() => setEditorQuiz(null)}>New Quiz</Button>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading quizzes...</p>}
                {status === "error" && <p>Error loading quizzes!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>No quizzes yet — create the first one.</TableCell>
                      </TableRow>
                    )
                    :
                    quizzes.map((quiz: any) => (
                      <TableRow key={quiz.id}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{topicNameById.get(quiz.topicId) ?? "—"}</TableCell>
                        <TableCell>{quiz.questionIds?.length ?? 0}</TableCell>
                        <TableCell>{quiz.createdAt?.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setEditorQuiz(quiz)}>
                            Edit
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteQuiz(quiz)}>
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

        <Dialog open={editorQuiz !== undefined} onOpenChange={(open) => !open && setEditorQuiz(undefined)}>
          <DialogContent className="sm:max-w-[550px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editorQuiz ? "Edit Quiz" : "New Quiz"}</DialogTitle>
            </DialogHeader>
            {editorQuiz !== undefined && (
              <QuizEditor
                key={editorQuiz?.id ?? "new"}
                existingQuiz={editorQuiz}
                onSaved={() => setEditorQuiz(undefined)}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={deleteQuiz !== null} onOpenChange={(open) => !open && setDeleteQuiz(null)}>
          <DialogContent className="sm:max-w-[425px] w-11/12 rounded-md">
            <DialogHeader>
              <DialogTitle>Delete this quiz?</DialogTitle>
              <DialogDescription>
                {deleteQuiz && `"${deleteQuiz.title}" (${deleteQuiz.questionIds?.length ?? 0} questions)`}
              </DialogDescription>
              <DialogDescription>
                Fellows will no longer see it. The questions themselves are not deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteQuiz(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleQuizDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
};
