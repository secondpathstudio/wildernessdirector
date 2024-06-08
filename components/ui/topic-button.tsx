"use client";

import Link from "next/link";
import { Check, Crown, Star, TreePine } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import "react-circular-progressbar/dist/styles.css";
import { DuoButton } from "./button-duo";

type Props = {
  id: string;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  topicName: string;
};

export const TopicButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  topicName
}: Props) => {
  const cycleLength = 16;
  const cycleAmplitude = -200; //-200
  const cycleIndex = index % cycleLength;
  const firstVerticalMargin = 60; //60
  const defaultVerticalMargin = 24; //24

  let indentationLevel;

  if (cycleIndex <= 4) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 8) {
    indentationLevel = 8 - cycleIndex;
  } else if (cycleIndex <= 12) {
    indentationLevel = cycleIndex - 8;
  } else {
    indentationLevel = 16 - cycleIndex;
  }

  const rightPosition = indentationLevel * cycleAmplitude / 4;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : TreePine;

  const href=`/home/topic?topicId=${id}`;

  return (
    <Link 
      href={locked ? "#" : href} 
      aria-disabled={locked} 
      className={`group w-fit ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className="relative w-min"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? firstVerticalMargin : defaultVerticalMargin,
        }}
      >
          <div className="relative h-[102px] w-[102px]">
          {current && (
            <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-primary bg-white rounded-xl animate-bounce tracking-wide z-10">
              Start
              <div
                className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2"
              />
            </div>
          )}
            <CircularProgressbarWithChildren
              value={Number.isNaN(percentage) ? 0 : percentage}
              styles={{
                path: {
                  stroke: "#4ade80",
                },
                trail: {
                  stroke: "#e5e7eb",
                },
              }}
            >
              <DuoButton
                size="rounded"
                variant={locked ? "locked" : "secondary"}
                style={{ pointerEvents: locked ? "none" : "auto" }}
                className="h-[70px] w-[70px] border-b-8"
              >
                <Icon
                  className={cn(
                    "h-10 w-10",
                    locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                    isCompleted && "fill-none stroke-[4]"
                  )}
                />
              </DuoButton>
              <div className={`group-hover:visible invisible ${current ? "bg-primary text-white" : "bg-gray-300 text-gray-600"} w-max absolute top-8 left-28 rounded-md p-2`}>
                <h3 className="text-sm font-bold text-center">{topicName}</h3>
              </div>
            </CircularProgressbarWithChildren>
          </div>
      </div>
    </Link>
  );
};
