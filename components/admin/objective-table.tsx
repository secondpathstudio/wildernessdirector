import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { useAuth, useFirestore, useFirestoreCollection, useFirestoreDoc } from 'reactfire';
import { collection } from 'firebase/firestore';
import { TopicProgress, getCompletion, progressDocRef, setObjectiveCompletion } from '@/lib/progress';

type Props = {
    currentTopicId: string;
    currentUserId: string;
}

const ObjectiveTable = (props: Props) => {
    const auth = useAuth();
    const firestore = useFirestore();
    const objectivesCollection = collection(firestore, `topics/${props.currentTopicId}/objectives`);
    const { status, data: objectives } = useFirestoreCollection(objectivesCollection, {
        idField: 'id',
      });
    const progressRef = progressDocRef(firestore, props.currentUserId, props.currentTopicId);
    const { status: progressStatus, data: progressSnap } = useFirestoreDoc(progressRef);
    const progress = progressSnap?.data() as TopicProgress | undefined;

    const toggleCompleted = async (objectiveId: string) => {
        await setObjectiveCompletion(firestore, {
            userId: props.currentUserId,
            topicId: props.currentTopicId,
            objectiveId,
            completed: getCompletion(progress, objectiveId) === undefined,
            signedOffBy: auth.currentUser?.uid,
        });
    }

    if (status === 'loading' || progressStatus === 'loading') {
        return <p>Loading...</p>
    }

    if (status === 'error' || progressStatus === 'error') {
        return <p>Error</p>
    }

    if (status === 'success' && objectives.docs.length > 0) {
        return (
            <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Objective Type</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Completed</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {objectives.docs.map((objective: any) => (
                <TableRow key={objective.id}>
                <TableCell>{objective.data().objectiveType}</TableCell>
                <TableCell>{objective.data().objectiveText}</TableCell>
                <TableCell>{objective.data().reference}</TableCell>
                <TableCell className='text-2xl'>
                    <button onClick={() => toggleCompleted(objective.id)}>
                    {getCompletion(progress, objective.id) ? '✅' : '🚫'}
                    </button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        )
    }
}

export default ObjectiveTable;
