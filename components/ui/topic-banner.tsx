import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
};

export const TopicBanner = ({
  title,
  description,
}: Props) => {
  return (
    <div className="w-full rounded-xl bg-primary p-5 text-background flex items-center justify-between my-2">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">
          {title}
        </h3>
        <p className="text-lg">
          Chapters: {description}
        </p>
      </div>
      <Link href="/lesson">
        <Button
          size="lg"
          variant="secondary"
          className="hidden xl:flex border-2 border-b-4 active:border-b-2"
        >
          Continue
        </Button>
      </Link>
    </div>
  );
};
