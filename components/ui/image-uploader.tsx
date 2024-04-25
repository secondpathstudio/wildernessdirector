"use client";

import React, { useState } from "react";
import { useCallback } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import 'firebase/storage';
import { StorageProvider, useAuth, useFirebaseApp, useStorage, useStorageDownloadURL, useStorageTask } from "reactfire";
import { ref, uploadBytesResumable, getStorage, getDownloadURL } from "firebase/storage";
import type { UploadTaskSnapshot, UploadTask, StorageReference } from "firebase/storage";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";

import RadialProgress from "./radial-progress";
import { Upload, UploadCloud } from "lucide-react";

export default function ImageUploader(props: any) {
  const auth = useAuth();
  const storage = useStorage();
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | undefined>();
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null
  );

  const onUploadProgress = (progressEvent: any) => {
    const percentage = Math.round(
      (progressEvent.bytesTransferred / progressEvent.totalBytes) * 100
    );
    setProgress(percentage);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      // dispatch(setSelectedImage(event.target.files[0]));
      const selectedImage = event.target.files[0];
      setSelectedImage(selectedImage);
      handleImageUpload(selectedImage);
    }
  };

  const removeSelectedImage = () => {
    setLoading(false);
    setUploadedImagePath(null)
    setSelectedImage(null)
  };

  const handleImageUpload = async (image: File) => {
    if (!image || auth.currentUser === null) return;
    setLoading(true);
    const fileToUpload = image;
    const fileName = fileToUpload.name;
    const storageRef = ref(storage, `images/${auth.currentUser.uid}/${fileName}`);
    
    //TODO upload image to firebase storage
    try {
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on("state_changed", (snapshot) => {
        onUploadProgress(snapshot);
      });

      uploadTask.then((snapshot) => {
        console.log("Uploaded a blob or file!", snapshot);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadedImagePath(downloadURL);
        });
        setUploadTask(undefined);
        setLoading(false);
      });
      setUploadTask(uploadTask);
    } catch (error) {
      console.error("Error uploading file", error);
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedImage = acceptedFiles[0];
      setSelectedImage(selectedImage)
      handleImageUpload(selectedImage);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Dialog>
      <DialogTrigger>
        <div className=" bg-black text-white flex items-center py-2 px-3 rounded-md hover:bg-opacity-80">
          <Upload />
          <span className=" ml-2 text-sm">Upload Image</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className=" mb-3">Upload Image</DialogTitle>

          <div
            {...getRootProps()}
            className=" flex items-center justify-center w-full"
          >
            <label
              htmlFor="dropzone-file"
              className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              {loading && (
                <div className=" text-center max-w-md  ">
                  <RadialProgress progress={progress} />
                  <p className=" text-sm font-semibold">Uploading Picture</p>
                  <p className=" text-xs text-gray-400">
                    Do not refresh or perform any other action while the picture
                    is being upload
                  </p>
                </div>
              )}

              {!loading && !uploadedImagePath && (
                <div className=" text-center">
                  <div className=" border p-2 rounded-md max-w-min mx-auto">
                    <UploadCloud />
                  </div>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Drag an image</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-400">
                    Click to upload &#40; image must be under 10
                    MB &#41;
                  </p>
                </div>
              )}

              {uploadedImagePath && !loading && (
                <div className="text-center">
                  <Image
                    width={1000}
                    height={1000}
                    src={uploadedImagePath}
                    className=" w-full object-contain max-h-16 mx-auto mt-2 mb-3 opacity-70"
                    alt="uploaded image"
                  />
                  <p className=" text-sm font-semibold">Picture Uploaded</p>
                  <p className=" text-xs text-gray-400">
                    Click submit to upload the picture
                  </p>
                </div>
              )}
            </label>

            <Input
              {...getInputProps()}
              id="dropzone-file"
              accept="image/png, image/jpeg"
              type="file"
              className="hidden"
              disabled={loading || uploadedImagePath !== null}
              onChange={handleImageChange}
            />
          </div>
        </DialogHeader>

        <DialogFooter className=" flex items-center justify-end gap-x-2">
          <DialogClose asChild>
            <Button
              onClick={removeSelectedImage}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              onClick={() => {
                props.addImageToReport(uploadedImagePath)
                setUploadedImagePath(null)
                setSelectedImage(null)
              }}
              disabled={!selectedImage || loading}
              size={"sm"}
              className=" text-sm"
            >
              {loading ? "Uploading..." : "Confirm"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}