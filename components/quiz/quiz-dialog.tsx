'use client';
import { FC, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuizRunner } from "./quiz-runner";

interface QuizDialogProps {
  open: boolean;
  title: string;
  topicId: string;
  quizId?: string;
  questions: any[];
  // bump to remount the runner with a fresh shuffle
  sessionKey: number;
  onClose: () => void;
}

// Shared quiz modal: hosts QuizRunner and guards against losing an
// in-progress attempt — closing (X, Esc, outside click) with unsaved answers
// asks for confirmation first.
export const QuizDialog: FC<QuizDialogProps> = (props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  // ref, not state: updated on every answer click without re-rendering the dialog
  const dirtyRef = useRef(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      return;
    }
    if (dirtyRef.current) {
      setConfirmOpen(true);
    } else {
      props.onClose();
    }
  };

  const discardQuiz = () => {
    setConfirmOpen(false);
    dirtyRef.current = false;
    props.onClose();
  };

  return (
    <>
      <Dialog open={props.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px] w-11/12 rounded-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
          </DialogHeader>
          {props.open && (
            <QuizRunner
              key={props.sessionKey}
              topicId={props.topicId}
              quizId={props.quizId}
              questions={props.questions}
              onDirtyChange={(dirty) => { dirtyRef.current = dirty; }}
              onClose={() => { dirtyRef.current = false; props.onClose(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="sm:max-w-[400px] w-11/12 rounded-md">
          <DialogHeader>
            <DialogTitle>Leave quiz?</DialogTitle>
            <DialogDescription>
              Your answers haven&apos;t been submitted — leaving now discards this attempt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Keep Taking</Button>
            <Button variant="destructive" onClick={discardQuiz}>Discard Attempt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
