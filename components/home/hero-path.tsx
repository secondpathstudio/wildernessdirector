'use client'
import React, { useEffect, useRef, useState } from 'react'
import { DuoButton } from '../ui/button-duo'
import { cn } from '@/lib/utils'
import { TreePine } from 'lucide-react'
import path from 'path'

type Props = {}

const HeroPath = (props: Props) => {
    const [progress, setProgress] = useState(0);  // Progress as a percentage
    const pathRef = useRef<SVGPathElement>(null);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 120) return 0;  // Reset after reaching 100%
          return oldProgress + 10;  // Increment progress
        });
      }, 200);
  
      return () => clearInterval(interval);
    }, []);

    const strokeDasharray = pathRef.current ? pathRef.current.getTotalLength() : 0;
    const strokeDashoffset = Math.min(Math.max(((100 - progress) / 100), 0), 100) * strokeDasharray;
  

  return (
<div style={{ position: 'relative', height: '400px', width: '200px'}}>
    <DuoButton
        size="rounded"
        variant={"secondary"}
        className="z-20 h-[70px] w-[70px] border-b-8 absolute top-[30px] left-[65px] hover:bg-primary hover:cursor-default"
        >
            <TreePine
            className={cn(
            "h-10 w-10 fill-primary-foreground text-primary-foreground",
            )}
            />
    </DuoButton>
      <svg style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
        {/* Background Path */}
        <path
            className="stroke-neutral-200"
            d="M 100 70 Q 110 110 100 150"
            strokeWidth="8"
            fill="none"
        />
        {/* Animated Path */}
        <path 
            ref={pathRef}
            d="M 100 70 Q 110 110 100 150" 
            stroke={`hsl(${progress} 38% 15%)`} 
            stroke-width="8" 
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <DuoButton
        size="rounded"
        variant={progress >= 100 ? "secondary" : "locked"}
        className="z-20 h-[70px] w-[70px] border-b-8 absolute top-[140px] left-[60px] hover:bg-neutral-200 hover:cursor-default"
        >
            <TreePine
            className={cn(
            "h-10 w-10 fill-primary-foreground text-primary-foreground",
            )}
            />
    </DuoButton>
      <svg style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
        <path className='stroke-neutral-200' d="M 100 190 Q 90 230 100 270" stroke-width="8" fill="none"/>
      </svg>
      <DuoButton
        size="rounded"
        variant={"locked"}
        className="z-20 h-[70px] w-[70px] border-b-8 absolute top-[260px] left-[65px] hover:bg-neutral-200 hover:cursor-default"
        >
            <TreePine
            className={cn(
            "h-10 w-10 fill-primary-foreground text-primary-foreground",
            )}
            />
    </DuoButton>
    </div>

  )
}

export default HeroPath