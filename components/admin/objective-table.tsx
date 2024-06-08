import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { useFirestore, useFirestoreCollection, useFirestoreDoc, useFirestoreDocData, useFirestoreDocDataOnce } from 'reactfire';
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

        var markObjectiveCompleted;
        const completedBy = [...objectiveDoc.data().completedBy] || [];
        const userIndex = completedBy.findIndex((entry: any) => entry.userId === props.currentUserId);
        if (userIndex === -1) {
            completedBy.push({
                userId: props.currentUserId,
                completedAt: Timestamp.now()
            });
            markObjectiveCompleted = true;
        } else {
            completedBy.splice(userIndex, 1);
            markObjectiveCompleted = false;
        }

        await updateDoc(objectiveRef, {
            completedBy
        });

        //TODO track user progress for main dashboard progress
        const topicRef = doc(firestore, `topics/${props.currentTopicId}`);
        const topicDoc = await getDoc(topicRef);

        if (!topicDoc.exists()) {
            console.log('Could not find topic document for ID: ', props.currentTopicId);
            return;
        }

        var topicProgress = topicDoc?.data()?.userProgress;
        if (topicProgress === undefined) {
            topicProgress = [];
        }

        if (topicProgress.find((user: any) => user.userId === props.currentUserId) !== undefined){
            //found user entry - update user progress
            if (markObjectiveCompleted) {
                topicProgress.find((user: any) => user.userId === props.currentUserId).completedObjectives += 1;
            } else {
                topicProgress.find((user: any) => user.userId === props.currentUserId).completedObjectives -= 1;
            }
            
            topicProgress.find((user: any) => user.userId === props.currentUserId).lastUpdated = Timestamp.now();
        } else {
            //new user entry - add user progress
            topicProgress.push({
                userId: props.currentUserId,
                completedObjectives: markObjectiveCompleted ? 1 : 0,
                lastUpdated: Timestamp.now(),
            });
        }

        await setDoc(topicRef, {
        userProgress: topicProgress,
        }, { merge: true });

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