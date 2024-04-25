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
import { collection, deleteDoc, doc, orderBy, query, where } from "firebase/firestore";
import { Camera } from "lucide-react";

//create props to accept topicId string
interface AdminFieldReportsProps {
  
}


export const AdminFieldReports: FC<AdminFieldReportsProps> = (props) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const fieldReportsCollection = collection(firestore, "fieldReports");
  const [isAscending, setIsAscending] = useState(false);
  const fieldReportsQuery = query(fieldReportsCollection, 
    orderBy('activityDate', isAscending ? 'asc' : 'desc'));
  const { status, data: fieldReports } = useFirestoreCollectionData(fieldReportsQuery, {
    idField: 'id',
  });

  const handleFieldReportDelete = async (fieldReportId: string) => {
    try {
      await deleteDoc(doc(fieldReportsCollection, fieldReportId));
    } catch (error : any) {
      console.error(error);
    }
  }

  //TODO how to make this responsive rather than fixed?
  const truncateText = (text: string) => {
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  return (
    <>
        <div className="flex-1 space-y-4 pt-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Field Reports</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {status === "loading" && <p>Loading Field Reports...</p>}
                {status === "error" && <p>Error loading Field Reports!</p>}
                {status === "success" && (
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Date</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Report Title</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Image</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>No questions found</TableCell>
                      </TableRow>
                    )
                    :
                    fieldReports.map((report: any) => (
                      <Dialog>
                        
                        <TableRow key={report.id}>
                          <TableCell>{report.activityDate.toDate().toLocaleDateString()}</TableCell>
                          <TableCell>{report.authorName}</TableCell>
                          <TableCell>
                            <DialogTrigger>
                              {report.reportTitle}
                            </DialogTrigger>
                          </TableCell>
                          <TableCell>{report.activity}</TableCell>
                          <TableCell>{report.images?.length > 0 ? <Camera /> : ""}</TableCell>
                          <TableCell className={'cursor-pointer hover:bg-red-500'} onClick={() => handleFieldReportDelete(report.id)}>Delete</TableCell>
                        </TableRow>
                        <DialogContent className="max-h-screen overflow-scroll">
                          <DialogHeader>
                            <DialogTitle>Field Report</DialogTitle>
                            <DialogDescription>{report.reportTitle}</DialogDescription>
                          </DialogHeader>
                            
                          <DialogTitle>Activity</DialogTitle>
                          <DialogDescription>{report.activity}</DialogDescription>

                          <DialogTitle>Report</DialogTitle>
                          <DialogDescription>{report.reportText}</DialogDescription>
                          <DialogFooter>
                            <DialogDescription className="italic text-sm opacity-30">Created on {report.createdAt.toDate().toLocaleDateString()}</DialogDescription>
                          </DialogFooter>
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
