import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { useFirestore, useFirestoreCollection, useFirestoreDoc, useFirestoreDocData, useFirestoreDocDataOnce } from 'reactfire';
import { Timestamp, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { stat } from 'fs';

type Props = {
    currentTopicId: string;
    currentUserId: string;
}

const ObjectiveTable = (props: Props) => {
    const firestore = useFirestore();
    const objectivesCollection = collection(firestore, `topics/${props.currentTopicId}/objectives`);
    const { status, data: objectives } = useFirestoreCollection(objectivesCollection, {
        idField: 'id',
      });

    const toggleCompleted = async (objectiveId: string) => {
        const objectiveRef = doc(firestore, `topics/${props.currentTopicId}/objectives/${objectiveId}`);
        const objectiveDoc = await getDoc(objectiveRef);

        if (!objectiveDoc.exists()) {
            console.log('Could not find objective document for ID: ', objectiveId);
            return;
        }

        const completedBy = [...objectiveDoc.data().completedBy] || [];
        const userIndex = completedBy.findIndex((entry: any) => entry.userId === props.currentUserId);
        if (userIndex === -1) {
            completedBy.push({
                userId: props.currentUserId,
                completedAt: Timestamp.now()
            });
        } else {
            completedBy.splice(userIndex, 1);
        }

        await updateDoc(objectiveRef, {
            completedBy
        });
    }

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
                <TableRow key={objective.id}>
                <TableCell>{objective.data().objectiveType}</TableCell>
                <TableCell>{objective.data().objectiveText}</TableCell>
                <TableCell>{objective.data().reference}</TableCell>
                <TableCell className='text-2xl'>
                    <button onClick={() => toggleCompleted(objective.id)}>
                    {objective.data().completedBy?.find((entry: any) => entry.userId === props.currentUserId) ? '✅' : '🚫'}
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