import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { useFirestore, useFirestoreCollection, useFirestoreDoc } from 'reactfire';
import { collection, doc } from 'firebase/firestore';
import { stat } from 'fs';

type Props = {
    currentTopicId: string;
    currentUserId: string;
}

const ObjectiveTable = (props: Props) => {
    const firestore = useFirestore();
    const objectivesCollection = collection(firestore, `topics/${props.currentTopicId}/objectives`);
    const { status, data: objectives } = useFirestoreCollection(objectivesCollection);

    if (status === 'loading') {
        return <p>Loading...</p>
    }

    if (status === 'error') {
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
                <TableRow key={objective.data().id}>
                <TableCell>{objective.data().objectiveType}</TableCell>
                <TableCell>{objective.data().objectiveText}</TableCell>
                <TableCell>{objective.data().reference}</TableCell>
                <TableCell className='text-2xl'>{objective.data().completedBy?.find((entry: any) => entry.userId === props.currentUserId) ? '✅' : '🚫'}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        )
    }
}

export default ObjectiveTable;