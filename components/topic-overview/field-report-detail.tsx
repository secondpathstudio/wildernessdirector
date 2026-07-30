'use client';
import { FC } from "react";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Read-only field report body, rendered inside a DialogContent — same
// pattern as QuestionDetail.
export const FieldReportDetail: FC<{ report: any }> = ({ report }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{report.reportTitle}</DialogTitle>
        <DialogDescription>
          {report.activity} · {report.activityDate?.toDate().toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      <DialogHeader>
        <DialogTitle>Report</DialogTitle>
        <DialogDescription className="whitespace-pre-wrap">{report.reportText}</DialogDescription>
      </DialogHeader>
      {report.images?.length > 0 && (
        <div className="space-y-2">
          {report.images.map((image: string, i: number) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={image} alt={`${report.reportTitle} image ${i + 1}`} className="rounded-md max-w-full" />
          ))}
        </div>
      )}
      <DialogDescription className="italic text-sm opacity-30">
        Created on {report.createdAt?.toDate().toLocaleDateString()}
      </DialogDescription>
    </>
  );
};
