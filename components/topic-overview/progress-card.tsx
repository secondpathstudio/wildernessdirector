import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BookOpen, FileQuestion, ListChecks } from 'lucide-react'

type Props = {
    topicData: any
    auth: any
    titleText: string
    fieldReportStatus?: string
    fieldReports?: any
    questionStatus?: string
    questions?: any
}

const ProgressCard = (props: Props) => {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center md:justify-between justify-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium hidden md:flex justify-between w-full">
            {props.titleText}
            {props.titleText === "Objectives Completed" && (<ListChecks />)}
            {props.titleText === "Field Reports" && (<BookOpen />)}
            {props.titleText === "Questions Approved" && (<FileQuestion />)}
        </CardTitle>
        </CardHeader>
        {props.titleText === "Objectives Completed" && (
            <CardContent className="flex flex-col justify-center md:justify-start items-center md:items-start">
                {props.topicData?.userProgress?.length > 0 ? (
                    <div className="text-xl md:text-2xl font-bold flex items-center gap-1">
                        <span className="md:hidden">
                            <ListChecks />
                        </span>
                        {props.topicData.userProgress.find((u: any) => (u.userId === props.auth.currentUser?.uid))?.completedObjectives}
                    </div>
                ) :
                    <div className="text-xl md:text-2xl font-bold flex items-center gap-1">
                        <span className='md:hidden'><ListChecks /></span>
                        0
                    </div>
                }
            <div className="flex justify-center items-center md:hidden">
                <CardTitle className="text-sm font-medium text-center">
                {props.titleText}
                </CardTitle>
            </div>
            </CardContent>
        )}
        {props.fieldReportStatus && (
        <CardContent className='flex flex-col justify-center md:justify-start items-center md:items-start'>
            {props.fieldReportStatus === "loading" && (
                <div className="text-2xl font-bold">...</div>
            )}
            {props.fieldReportStatus === "error" && (
                <div className="text-2xl font-bold">Error loading reports...</div>
            )}
            {props.fieldReportStatus === "success" && (
                <div className="text-xl md:text-2xl font-bold flex items-center gap-1">
                    <span className="md:hidden">
                        <BookOpen />
                    </span>
                    {props.fieldReports.length}
                </div>
            )}
            <div className="flex justify-center items-center md:hidden">
                <CardTitle className="text-sm font-medium text-center">
                {props.titleText}
                </CardTitle>
            </div>
        </CardContent>
        )}
        {props.questionStatus && (              
        <CardContent className='flex flex-col justify-center md:justify-start items-center md:items-start'>
            {props.questionStatus === "loading" && (
                <div className="text-2xl font-bold">...</div>
            )}
            {props.questionStatus === "error" && (
                <div className="text-2xl font-bold">!</div>
            )}
            {props.questionStatus === "success" && (
                <div className="text-xl md:text-2xl font-bold flex items-center gap-1">
                    <span className="md:hidden">
                        <FileQuestion />
                    </span>
                    {props.questions.filter((q: any) => q.approved).length} <span className='text-sm font-medium'>({props.questions.length - props.questions.filter((q: any) => q.approved).length} pending)</span>
                </div>
            )}
            <div className="flex justify-center items-center md:hidden">
                <CardTitle className="text-sm font-medium text-center">
                {props.titleText}
                </CardTitle>
            </div>
        </CardContent>
        )}
    </Card>
  )
}

export default ProgressCard