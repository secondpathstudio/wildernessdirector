import HeroPath from "@/components/home/hero-path";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <section className="grow flex flex-col justify-center items-center">
        <div className="grid md:grid-cols-3 grid-cols-1 font-bold md:tracking-widest md:ml-16 text-secondary mx-4">
          <div className="flex items-center col-span-2">
            <div className="flex flex-col md:text-right text-center max-w-2xl md:text-5xl text-3xl md:gap-3">
              <span className="md:text-4xl text-xl">A mobile companion for your</span>
              <span className="text-nowrap">Wilderness Medicine</span>
              <span className="md:text-4xl text-xl">fellowship</span>
              <div className="md:mt-4 mt-6">
                <Link href={"/login"}>
                  <Button>Try a Demo</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <HeroPath />
          </div>
        </div>

      </section>
    </>
  );
}
