import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          ?
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">In a trauma evaluation, the primary survey consists of all of the following except:</p>
          <p className="text-sm text-muted-foreground">
            Physical Exam
          </p>
          <p className="text-sm text-muted-foreground">
            POCUS
          </p>
          <p className="text-sm text-muted-foreground">
            History
          </p>
          <p className="text-sm text-muted-foreground">
            CT Scan
            <span className="ml-1">✅</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          ?
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Based on current standards, how long is a tourniquet ok to be placed?</p>
          <p className="text-sm text-muted-foreground">
            Never place a tourniquet.
          </p>
          <p className="text-sm text-muted-foreground">
            20 minutes
          </p>
          <p className="text-sm text-muted-foreground">
            6 hours
            <span className="ml-1">✅</span>
          </p>
          <p className="text-sm text-muted-foreground">
            No time limit.
          </p>
        </div>
      </div>
    </div>
  )
}
