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
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, deleteDoc, doc, getDoc, increment, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useUserStore } from "@/lib/store";
import { Button } from "../ui/button";

//create props to accept topicId string
interface AdminQuestionsProps {
  userId: string | undefined;
}


export const AdminTopicQuestions: FC<AdminQuestionsProps> = (props) => {
  const auth = useAuth();
  const userRole = useUserStore((state) => state.role);
  const firestore = useFirestore();
  const questionsCollection = collection(firestore, "questions");
  const topicsCollection = collection(firestore, "topics");
  const [isAscending, setIsAscending] = useState(false);
  const questionsQuery = query(questionsCollection, 
    orderBy('createdAt', isAscending ? 'asc' : 'desc'),
    where('authorId', '==', props.userId),
  );
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

  const handleQuestionApprove = async (
    questionId: string,
    topicId: string,
    authorId: string
  ) => {
    //update question to approved
    try {
      await updateDoc(doc(questionsCollection, questionId), {
        approved: true,
      });
    } catch (error : any) {
      console.error(error)
    }

    //increment approved question count for topic
    const topicDoc = doc(topicsCollection, topicId);
    let newUserProgressArray: any[] = [];
    try {
      await getDoc(topicDoc).then((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data) {
            let userProgressArray = data.userProgress;
            if (userProgressArray.length > 0) {
              newUserProgressArray = userProgressArray.map((user: any) => {
                if (user.userId === authorId) {
                  console.log('found user', user);
                  const currentApprovedQuestionCount = user.approvedQuestionCount ? user.approvedQuestionCount : 0;
                  return {
                    ...user,
                    approvedQuestionCount: currentApprovedQuestionCount + 1,
                    lastUpdated: new Date(),
                  }
                } else {
                  return {
                    ...user,
                    lastUpdated: new Date(),
                  }
                }
              });

              console.log('userProgressArray', newUserProgressArray)
              updateDoc(topicDoc, {
                userProgress: newUserProgressArray,
              });
            }
          }
        }
      });
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
            <Card className="col-span-full">
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
                      <TableHead>Author</TableHead>
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
                          <TableCell>{question.authorName}</TableCell>
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
                          {userRole === 'admin' && (
                            <Button 
                              type="button" 
                              onClick={() => handleQuestionApprove(question.id, question.topicId, question.authorId)}
                              disabled={question.approved}
                              >
                                {question.approved ? "Approved ✅" : "Approve"}
                              </Button>
                          )}
                        </DialogContent>
                      </Dialog>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
};
