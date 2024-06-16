import HeroPath from "@/components/home/hero-path";
import React from "react";

export default function Home() {
  return (
    <>
      <section className="grow flex flex-col justify-center items-center">
        <div className="grid md:grid-cols-2 grid-cols-1 text-5xl font-bold md:tracking-widest md:ml-16 text-secondary md:order-last mx-4">
          <div className="flex items-center">
            <h2 className="md:text-right text-center">An innovative approach to Wilderness Medicine fellowship training</h2>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <HeroPath />
          </div>
        </div>
      </section>
    </>
  );
}
