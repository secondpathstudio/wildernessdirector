'use client';
import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateMCQuestionForm } from "./create-mc-question-form";
import { CreateTFQuestionForm } from "./create-tf-question-form";

interface QuestionEditDialogProps {
  // the question to edit, or null when closed
  question: any | null;
  onOpenChange: (open: boolean) => void;
}

export const QuestionEditDialog: FC<QuestionEditDialogProps> = ({ question, onOpenChange }) => {
  return (
    <Dialog open={question !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>
        {question && question.questionType === 'Multiple Choice' && (
          <CreateMCQuestionForm
            key={question.id}
            topicId={question.topicId}
            existingQuestion={question}
            onSaved={() => onOpenChange(false)}
          />
        )}
        {question && question.questionType === 'True/False' && (
          <CreateTFQuestionForm
            key={question.id}
            topicId={question.topicId}
            existingQuestion={question}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
