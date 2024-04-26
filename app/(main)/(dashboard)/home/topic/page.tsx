import { TopicContainer } from "@/components/topic-overview/topic-container";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

const TopicPage = () => {
  return (
    <Suspense>
      <TopicContainer />
      <Toaster />
    </Suspense>
  );
};
export default TopicPage;
