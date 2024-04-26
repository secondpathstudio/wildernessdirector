import { AdminContainer } from "@/components/admin/admin-container";
import { AdminTopicObjectives } from "@/components/admin/admin-topic-objectives";
import { TopicContainer } from "@/components/topic-overview/topic-container";
import { Toaster } from "@/components/ui/toaster";

const AdminTopicPage = () => {
  return (
    <>
      <AdminTopicObjectives />
      <Toaster />
    </>
  );
};
export default AdminTopicPage;

//TODO  REMOVE THIS PAGE