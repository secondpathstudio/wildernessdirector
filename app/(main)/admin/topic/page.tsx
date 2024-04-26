import { AdminContainer } from "@/components/admin/admin-container";
import { AdminTopicObjectives } from "@/components/admin/admin-topic-objectives";
import { TopicContainer } from "@/components/topic-overview/topic-container";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

const AdminTopicPage = () => {
  return (
    <Suspense>
      <AdminTopicObjectives />
      <Toaster />
    </Suspense>
  );
};
export default AdminTopicPage;

//TODO  REMOVE THIS PAGE