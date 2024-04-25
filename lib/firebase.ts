// export const uploadToFirebaseStorage = async (
//     file: File,
//     onUploadProgress: (progressEvent: any) => void
//     ) => {
//     const storageRef = firebase.storage().ref();
//     const imageRef = storageRef.child(`images/${file.name}`);
//     const uploadTask = imageRef.put(file);
    
//     uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//         onUploadProgress(snapshot);
//         },
//         (error) => {
//         console.log(error);
//         }
//     );
    
//     return uploadTask;
//     }