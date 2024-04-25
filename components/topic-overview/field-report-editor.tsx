'use client';
import { FC, useState } from "react";
import { MainNav } from "@/components/dashboard/main-nav";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  LinkCard,
} from "@/components/ui/card";
import { CreateMCQuestionForm }  from "./create-mc-question-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreateTFQuestionForm } from "./create-tf-question-form";
import { DatePicker } from "../ui/datepicker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useAuth, useFirestore } from "reactfire";
import { toast } from "../ui/use-toast";
import { Timestamp, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import ImageUploader from "../ui/image-uploader";
import Image from "next/image";
import { Trash } from "lucide-react";

export type FieldReport = {
  id: string | null,
  reportText: string,
  reportTitle: string,
  activity: string,
  activityDate: Timestamp,
  images: string[],
}

interface FieldReportEditorProps {
    editingFieldReport: FieldReport;
    setEditingFieldReport: (fieldReport: FieldReport | null) => void;
}

export const FieldReportEditor: FC<FieldReportEditorProps> = (props) => {
  const firestore = useFirestore();
  const fieldReportsCollection = collection(firestore, "fieldReports");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldReport, setFieldReport] = useState(props.editingFieldReport)

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (props.editingFieldReport.id === null) {
      return;
    }

    if (auth.currentUser === null) {
      toast({
        title: "You need to be logged in to create a field report.",
      })
      setIsLoading(false);
      return;
    }

    //replace existing field report with updated field report
    try {
      const reportDoc = doc(firestore, "fieldReports", props.editingFieldReport.id);
      await updateDoc(reportDoc, {
        ...fieldReport,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "NoName",
        createdAt: Timestamp.now(),
      });
      toast({
        title: "Report updated successfully!",
        description: `Field report created successfully! ID: ${fieldReport.id}`,
      });

    } catch (error : any) {
      //TODO use toast
      console.log(error)
    }

    //reset question
    props.setEditingFieldReport(null);

    setIsLoading(false);
  }

  const handleAddImageToReport = (url: string) => {
    setFieldReport({...fieldReport, images: [...fieldReport.images, url]});
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="pb-2">Field Report Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-col gap-10">
      <form onSubmit={handleSubmit}>
      <fieldset disabled={isLoading} className="space-y-4">
        {/* Date of Field report */}
        <DatePicker
          selectedDate={fieldReport.activityDate.toDate()}
          onSelect={(date) => setFieldReport({...fieldReport, activityDate: Timestamp.fromDate(date)})}
        />

        {/* Type of activity */}
        <Select 
          onValueChange={(v) => setFieldReport({...fieldReport, activity: v})}
          value={fieldReport.activity}
          >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="SAR">Search and Rescue</SelectItem>
              <SelectItem value="Didactics">Didactics</SelectItem>
              <SelectItem value="Diving">Diving</SelectItem>
              <SelectItem value="Hiking">Hiking</SelectItem>
              <SelectItem value="Camping">Camping</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Title of report */}
        <Input 
          placeholder="Title of Report" 
          onChange={(e) => setFieldReport({...fieldReport, reportTitle: e.target.value})}
          value={fieldReport.reportTitle}
          />

        {/* body of report */}
        <Textarea 
          placeholder="Body of Report" 
          onChange={(e) => setFieldReport({...fieldReport, reportText: e.target.value})}
          value={fieldReport.reportText}
          />

        <div>
          {fieldReport.images.length > 0 ? (
            <div>
              <h2>Image</h2>
              <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Image src={fieldReport.images[0]} alt="field report image" height={250} width={250}/>
                    <Button variant="destructive" className="mt-2" onClick={() => setFieldReport({...fieldReport, images: []})}><Trash />Remove Image</Button>
                  </div>
              </div>
            </div>
          ) : 
            <ImageUploader addImageToReport={handleAddImageToReport}/>
          }
        </div>

        {/* Submit button */}
        <Button>Update Report</Button>
        <Button variant="destructive" onClick={() => props.setEditingFieldReport(null)}>Cancel</Button>
        </fieldset>
        </form>
      </CardContent>
    </Card>
  );
};