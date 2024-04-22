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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

  //TODO how to make this responsive rather than fixed?
  const truncateQuestion = (questionText: string) => {
    return questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText;
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
                      <TableHead>Type</TableHead>
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
                      <Dialog>
                        
                        <TableRow key={question.id}>
                          <TableCell>{question.createdAt.toDate().toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DialogTrigger>
                              {truncateQuestion(question.questionText)}
                            </DialogTrigger>
                          </TableCell>
                          <TableCell>{question.questionType}</TableCell>
                          <TableCell className={'cursor-pointer hover:bg-red-500'} onClick={() => handleQuestionDelete(question.id)}>Delete</TableCell>
                        </TableRow>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Question</DialogTitle>
                            <DialogDescription>{question.questionText}</DialogDescription>
                          </DialogHeader>
                            {question.questionType === 'Multiple Choice' && (
                              <DialogHeader>
                                <DialogTitle>Answers</DialogTitle>
                                <ul>
                                  {question.answers.map((answerChoice: any, index: number) => (
                                    <li key={index}>
                                      <DialogDescription className={`${answerChoice.correct && 'font-bold text-primary'}`}>{answerChoice.text}</DialogDescription>
                                    </li>
                                  ))}
                                </ul>
                              </DialogHeader>
                            )}
                            {question.questionType === 'True/False' && (
                              <DialogHeader>
                                <DialogTitle>Answer</DialogTitle>
                                <DialogDescription>{question.answer.toString()}</DialogDescription>
                              </DialogHeader>
                            )}
                          <DialogTitle>Explanation</DialogTitle>
                          <DialogDescription>{question.explanation}</DialogDescription>
                          <DialogTitle>Reference</DialogTitle>
                            <DialogDescription>{question.reference}</DialogDescription>
                          <DialogFooter>
                            <DialogDescription className="italic text-sm opacity-30">Created on {question.createdAt.toDate().toLocaleDateString()}</DialogDescription>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
