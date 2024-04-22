'use client';
import { FC, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QuestionCreator } from "./question-creator";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, deleteDoc, doc, orderBy, query, where } from "firebase/firestore";

//create props to accept topicId string
interface TopicQuestionsProps {
  topicId: string;
}


export const TopicQuestions: FC<TopicQuestionsProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const [isAscending, setIsAscending] = useState(false);
  const questionsQuery = query(questionsCollection, 
    orderBy('createdAt', isAscending ? 'asc' : 'desc'),
    where('topicId', '==', props.topicId),
    where('authorId', '==', auth.currentUser?.uid));
  const { status, data: questions } = useFirestoreCollectionData(questionsQuery, {
    idField: 'id',
  });

  const handleQuestionDelete = async (questionId: string) => {
    try {
      await deleteDoc(doc(questionsCollection, questionId));
    } catch (error : any) {
      console.error(error);
    }
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading questions...</p>}
                {status === "error" && <p>Error loading questions!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Date Added</TableHead>
                      <TableHead>Question Text</TableHead>
                      <TableHead>Answer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>No questions found</TableCell>
                      </TableRow>
                    )
                    :
                    questions.map((question: any) => (
                      <TableRow key={question.id}>
                        <TableCell>{question.createdAt.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{question.questionText}</TableCell>
                        <TableCell>{question.answer ? "True" : "False"}</TableCell>
                        <TableCell className={'cursor-pointer hover:bg-red-500'} onClick={() => handleQuestionDelete(question.id)}>Delete</TableCell>
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
    </>
  );
};
