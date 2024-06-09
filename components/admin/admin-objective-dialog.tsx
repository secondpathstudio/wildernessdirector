import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFirestore } from 'reactfire'
import { doc, setDoc } from 'firebase/firestore'
import { Loader } from 'lucide-react'

type Props = {
    topicObjective: any;
    handleObjectiveDelete: (index: string) => void;
    closeDialog: () => void;
}

const AdminObjectiveDialog = (props: Props) => {
    const [editedObjective, setEditedObjective] = React.useState(props.topicObjective)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isUpdating, setIsUpdating] = React.useState(false)
    const firestore = useFirestore()

    const handleSaveEdits = async () => {
        // save editedObjective to firestore

        //check for reference length
        if (editedObjective.reference.length < 3) {
            editedObjective.reference = editedObjective.reference.padStart(3, '0')
        }

        setIsUpdating(true)
        const updatedObjective = {
            ...editedObjective,
            lastUpdated: new Date()
        }

        const objectiveRef = doc(firestore, `topics/${props.topicObjective.topicId}/objectives/${props.topicObjective.id}`)
        try {
            await setDoc(objectiveRef, updatedObjective, { merge: true })
        } catch (error) {
            console.error(error)
        }

        setEditedObjective(props.topicObjective)

        setIsUpdating(false)
        setIsEditing(false)
    }

  if (!isEditing) return (
    <DialogContent className="max-h-screen overflow-scroll">
        <DialogHeader>
        <DialogTitle>Objective Details</DialogTitle>
        <DialogDescription>{props.topicObjective.objectiveText}</DialogDescription>
        {props.topicObjective.reference && (
            <>
            <DialogTitle>Reference</DialogTitle>
            <DialogDescription>{props.topicObjective.reference}</DialogDescription>
            </>
        )}
        </DialogHeader>
        
        <DialogTitle>Objective Type</DialogTitle>
        <DialogDescription>{props.topicObjective.objectiveType}</DialogDescription>
        <DialogFooter>
            <Button onClick={() => {
                setIsEditing(true)
                setEditedObjective(props.topicObjective)
                }}>Edit</Button>
            <Button onClick={() => props.handleObjectiveDelete(props.topicObjective.id)}>Delete</Button>
        <DialogDescription className="italic text-sm opacity-30">Created on {props.topicObjective.createdAt.toDate().toLocaleDateString()}</DialogDescription>
        </DialogFooter>
    </DialogContent>
  )

  if (isEditing) return (
    <DialogContent className="max-h-screen overflow-scroll">
        <DialogHeader>
        <DialogTitle>Objective Details</DialogTitle>
        <DialogDescription>
            <Textarea 
                value={editedObjective.objectiveText}
                onChange={(e) => setEditedObjective({...editedObjective, objectiveText: e.target.value})}
            />
        </DialogDescription>
        {editedObjective.reference && (
            <>
            <DialogTitle>Reference</DialogTitle>
            <DialogDescription>
                <Input 
                    value={editedObjective.reference}
                    onChange={(e) => setEditedObjective({...editedObjective, reference: e.target.value})}
                />
            </DialogDescription>
            </>
        )}
        </DialogHeader>
        
        <DialogTitle>Objective Type</DialogTitle>
        <DialogDescription>
            {/* Type of objective */}
            <Select 
            onValueChange={(v) => setEditedObjective({...editedObjective, objectiveType: v})}
            value={editedObjective.objectiveType}
            >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Objective Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Skills">Skills</SelectItem>
                </SelectGroup>
            </SelectContent>
            </Select>
        </DialogDescription>
        <DialogFooter>
            {isUpdating ? 
                <DialogDescription className="text-primary flex gap-2 items-center">
                    Updating <Loader className='animate-spin'/>
                </DialogDescription>
            : (
            <>
                <Button onClick={handleSaveEdits}>Save</Button>
                <Button variant="destructive" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={() => props.handleObjectiveDelete(props.topicObjective.id)}>Delete</Button>
            </>
            )}
        <DialogDescription className="italic text-sm opacity-30">Created on {props.topicObjective.createdAt.toDate().toLocaleDateString()}</DialogDescription>
        </DialogFooter>
    </DialogContent>
  )
}

export default AdminObjectiveDialog