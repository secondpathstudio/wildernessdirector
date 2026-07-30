'use client';
import { FC, useState } from "react";
import { useFirestore, useFirestoreCollectionData, useFirestoreDoc } from "reactfire";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ObjectiveTable from "./objective-table";
import { QuestionDetail, questionStatus, statusLabel } from "../topic-overview/question-detail";
import { FieldReportDetail } from "../topic-overview/field-report-detail";
import { TopicProgress, completedObjectiveCount, progressDocRef } from "@/lib/progress";
import { REQUIRED_APPROVED_QUESTIONS } from "@/lib/CONSTANTS";

interface AdminTopicDetailProps {
  userId: string;
  topicId: string;
}

export const AdminTopicDetail: FC<AdminTopicDetailProps> = (props) => {
  const firestore = useFirestore();

  const { data: topicSnap } = useFirestoreDoc(doc(firestore, "topics", props.topicId));
  const topic = topicSnap?.data();

  const { data: progressSnap } = useFirestoreDoc(
    progressDocRef(firestore, props.userId, props.topicId)
  );
  const objectivesDone = completedObjectiveCount(progressSnap?.data() as TopicProgress | undefined);

  const attemptsQuery = query(
    collection(firestore, `users/${props.userId}/quizAttempts`),
    where('topicId', '==', props.topicId),
  );
  const { data: attempts } = useFirestoreCollectionData(attemptsQuery, { idField: 'id' });
  const sortedAttempts = [...(attempts ?? [])]
    .sort((a: any, b: any) => b.completedAt?.seconds - a.completedAt?.seconds);

  const quizzesQuery = query(
    collection(firestore, "quizzes"),
    where('topicId', '==', props.topicId),
  );
  const { data: quizzes } = useFirestoreCollectionData(quizzesQuery, { idField: 'id' });
  const quizTitleById = new Map(quizzes?.map((quiz: any) => [quiz.id, quiz.title]) ?? []);

  const reportsQuery = query(
    collection(firestore, "fieldReports"),
    orderBy('activityDate', 'desc'),
    where('topicId', '==', props.topicId),
    where('authorId', '==', props.userId),
  );
  const { data: reports } = useFirestoreCollectionData(reportsQuery, { idField: 'id' });

  const questionsQuery = query(
    collection(firestore, "questions"),
    where('topicId', '==', props.topicId),
    where('authorId', '==', props.userId),
  );
  const { data: questions } = useFirestoreCollectionData(questionsQuery, { idField: 'id' });
  const sortedQuestions = [...(questions ?? [])]
    .sort((a: any, b: any) => b.createdAt?.seconds - a.createdAt?.seconds);
  const approvedQuestions = sortedQuestions.filter((question: any) => question.approved).length;

  const [viewReport, setViewReport] = useState<any | null>(null);
  const [viewQuestion, setViewQuestion] = useState<any | null>(null);

  const truncate = (text: string) =>
    text.length > 45 ? text.substring(0, 45) + '...' : text;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{topic?.topicName ?? "Loading..."}</h3>
        <p className="text-sm text-muted-foreground">
          {objectivesDone} / {topic?.objectiveCount ?? "?"} objectives
          {" · "}{approvedQuestions} / {REQUIRED_APPROVED_QUESTIONS} questions approved
          {" · "}{reports?.length ?? 0} field report{(reports?.length ?? 0) === 1 ? "" : "s"}
          {" · "}{sortedAttempts.length} quiz attempt{sortedAttempts.length === 1 ? "" : "s"}
        </p>
      </div>

      <Tabs defaultValue="objectives">
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="reports">Field Reports</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="pt-2">
          <ObjectiveTable currentTopicId={props.topicId} currentUserId={props.userId} />
          {topic?.objectiveCount === 0 && (
            <p className="text-sm text-muted-foreground">No objectives for this topic.</p>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="pt-2">
        {sortedAttempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttempts.map((attempt: any) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.completedAt?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>
                    {attempt.quizId
                      ? quizTitleById.get(attempt.quizId) ?? "Deleted quiz"
                      : "Practice quiz"}
                  </TableCell>
                  <TableCell>
                    {attempt.correct} / {attempt.total} ({Math.round((attempt.correct / attempt.total) * 100)}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </TabsContent>

        <TabsContent value="reports" className="pt-2">
        {(reports?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No field reports yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports!.map((report: any) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer"
                  onClick={() => setViewReport(report)}
                >
                  <TableCell>{report.activityDate?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{truncate(report.reportTitle ?? "")}</TableCell>
                  <TableCell>{report.activity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </TabsContent>

        <TabsContent value="questions" className="pt-2">
        {sortedQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions written yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Question</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((question: any) => (
                <TableRow
                  key={question.id}
                  className="cursor-pointer"
                  onClick={() => setViewQuestion(question)}
                >
                  <TableCell>{statusLabel[questionStatus(question)]}</TableCell>
                  <TableCell>{question.createdAt?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{truncate(question.questionText)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </TabsContent>
      </Tabs>

      <Dialog open={viewReport !== null} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="sm:max-w-[500px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          {viewReport && <FieldReportDetail report={viewReport} />}
        </DialogContent>
      </Dialog>

      <Dialog open={viewQuestion !== null} onOpenChange={(open) => !open && setViewQuestion(null)}>
        <DialogContent className="sm:max-w-[425px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          {viewQuestion && <QuestionDetail question={viewQuestion} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
