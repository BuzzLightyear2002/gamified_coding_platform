'use client';

import { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Card from "./components/card";

const HomePage = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-slate-400">
        <div className=" p-16 items-center justify-center">
          <div className="my-16">
            <h1 className="text-4xl font-bold text-white">Gamified Coding</h1>
            <h1 className="text-4xl font-bold text-white">Platform</h1>
          </div>
        </div>
        <div className=" h-64 m-16 bg-white">
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
            <div>
              <img
                src="/image1.jpg"
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="/image2.jpg"
                alt="Slide 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="/image3.jpg"
                alt="Slide 3"
                className="w-full h-full object-cover"
              />
            </div>
          </Carousel>
        </div>
      </div>
      <div className="min-h-screen flex flex-col bg-slate-400">
        <div className=" p-16 items-center justify-center">
          <div className="my-16">
            <h1 className="text-4xl font-bold text-white">
              This is the Homepage
            </h1>
            <h1 className="text-4xl font-bold text-white">For the Gamified</h1>
            <h1 className="text-4xl font-bold text-white">Coding Platform</h1>
          </div>
        </div>
        <div className=" h-64 m-16 bg-white">
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
            <div>
              <img
                src="/image1.jpg"
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="/image2.jpg"
                alt="Slide 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <img
                src="/image3.jpg"
                alt="Slide 3"
                className="w-full h-full object-cover"
              />
            </div>
          </Carousel>
        </div>
      </div>
      <div className="min-h-screen flex flex-col bg-white">
        <div className=" p-16 items-center flex ">
          <div className="my-16 grow">
            <h1 className="text-4xl font-bold text-blue-900">
              A modern, user-friendly
            </h1>
            <h1 className="text-4xl font-bold text-blue-900">
              dashboard for a Gamified
            </h1>
            <h1 className="text-4xl font-bold text-blue-900">
              Coding Platform
            </h1>
          </div>
          <div className="text-indigo-900 px-16">
            The top section features a circular progress tracker displaying user
            achievements and experience points.
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-16">
          {cardsData.map((card, index) => (
            <Card key={index} title={card.title} description={card.description} />
          ))}
        </div>
      </div>
    </>
  );
};

const cardsData = [
  { title: "Personalised Challenges", description: "Description of feature 1." },
  { title: "Upcoming Contests", description: "Description of feature 2." },
  { title: "Top Friends", description: "Description of feature 3." },
  { title: "Profile", description: "Description of feature 4." },

];

export default HomePage;
