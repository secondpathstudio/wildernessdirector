import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "reactfire";

export default function Fellowship() {

  return (
    <>
      <div className="grow flex flex-col items-center justify-start mt-10">
        <h1 className="text-4xl">RUHS Wilderness Medicine Fellowship</h1>
        <p>One-year Wilderness Medicine Fellowship (starts July 1st, 2024)</p>

        <div className="flex flex-col mt-10 text-center items-center w-full bg-secondary text-primary-foreground">
          <h3 className="text-2xl">Welcome<br/>2024 Wilderness Medicine Fellow</h3>
          <Image className="rounded-full" alt="fellow picture" src={"/evers.jpg"} width={250} height={250}/>
          <p className="text-xl italic font-bold">Marisa Evers, MD</p>
        </div>

        <div className="flex flex-col mt-10">
          <div className="text-center">
            <h2 className="text-2xl">Fellowship Curriculum</h2>
            <p>One-year curriculum focuses on a broad, practical exposure to wilderness medicine knowledge and applications</p>
            <div className="grid grid-cols-3 gap-6 max-w-4xl text-center mt-3">
              <div className="flex-col">
                <div className="flex justify-center items-center">
                  <Image className="rounded-full" alt="marine picture" src={"/scuba.jpg"} width={250} height={250}/>
                </div>
                <h3 className="text-xl">Marine</h3>
                <p>Extensive exposure to diving and marine medicine through collaboration with NOAA including a comprehensive 3 week SCUBA certification course, physician dive medicine training, as well as swift water rescue. Optional deployment as part of medical team on oceanic dive missions (TBD).</p>
              </div>
              <div className="flex-col">
                <div className="flex justify-center items-center">
                  <Image className="rounded-full" alt="mountain picture" src={"/mountain.webp"} width={250} height={250}/>
                </div>
                <h3 className="text-xl">Mountain</h3>
                <p>Learn and apply search and rescue techniques from Riverside Mountain Rescue team as a formal member, participating in annual trainings and assistance in SAR calls. Learn and utilize technical SAR skills among the mountains of Southern California both in the fall and the winter.</p>
              </div>
              <div className="flex-col">
                <div className="flex justify-center items-center">
                  <Image className="rounded-full" alt="desert picture" src={"/jtree.png"} width={250} height={250}/>
                </div>
                <h3 className="text-xl">Desert</h3>
                <p>Leveraging the expansive & beautiful Joshua Tree National Park's location nearby, fellow will get exposure rock climbing techniques as well as austere operations, tracking, and providing medical care in a desert through collaboration with Joshua Tree SAR.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
