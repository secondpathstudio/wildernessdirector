'use client';
import { FC } from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Derives the review state shown to fellows and admins. A question with a
// reviewComment has been sent back for revision; editing clears the comment.
export type QuestionStatus = "approved" | "needs-revision" | "pending";

export const questionStatus = (question: any): QuestionStatus => {
  if (question.approved) return "approved";
  if (question.reviewComment) return "needs-revision";
  return "pending";
};

export const statusLabel: Record<QuestionStatus, string> = {
  approved: "✅ Approved",
  "needs-revision": "🔁 Needs revision",
  pending: "⏳ Pending review",
};

// Full read-only question body, rendered inside a Dialog by both the fellow
// and admin question tables.
export const QuestionDetail: FC<{ question: any }> = ({ question }) => {
  return (
    <>
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
                <DialogDescription className={`${answerChoice.correct && 'font-bold text-primary'}`}>
                  {answerChoice.text}
                </DialogDescription>
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
      <DialogHeader>
        <DialogTitle>Explanation</DialogTitle>
        <DialogDescription>{question.explanation}</DialogDescription>
        <DialogTitle>Reference</DialogTitle>
        <DialogDescription>{question.reference}</DialogDescription>
      </DialogHeader>
      {question.reviewComment && (
        <DialogHeader>
          <DialogTitle>Revision requested</DialogTitle>
          <DialogDescription>{question.reviewComment}</DialogDescription>
        </DialogHeader>
      )}
      <DialogDescription className="italic text-sm opacity-30">
        Created on {question.createdAt.toDate().toLocaleDateString()}
      </DialogDescription>
    </>
  );
};
