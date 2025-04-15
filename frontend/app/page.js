'use client';

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Card from './components/card';
import Image from 'next/image';

const HomePage = () => {
  return (
    <>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-400 flex flex-col justify-center items-center text-center px-4">
        <div className="my-20 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Level Up Your Coding Skills
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto">
            Unlock your potential through personalized challenges, badges, and social coding.
          </p>
        </div>

        {/* Carousel */}
        <div className="w-full max-w-5xl rounded-xl overflow-hidden shadow-lg bg-white">
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={3000}>
            <div>
              <img src="/image1.jpg" alt="Gamified Slide 1" className="w-full h-80 object-cover" />
            </div>
            <div>
              <img src="/image2.jpg" alt="Gamified Slide 2" className="w-full h-80 object-cover" />
            </div>
            <div>
              <img src="/image3.jpg" alt="Gamified Slide 3" className="w-full h-80 object-cover" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-bold text-blue-900 leading-snug">
              Your Personalized Coding Dashboard
            </h2>
            <p className="text-indigo-900 text-base">
              Visualize your growth, explore contests, and stay inspired through engaging features designed to elevate your journey.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cardsData.map((card, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg shadow-md transition-transform hover:scale-105 bg-slate-100"
              >
                <h3 className="text-xl font-semibold text-blue-800">{card.title}</h3>
                <p className="text-slate-600 mt-2">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const cardsData = [
  {
    title: 'Personalised Challenges',
    description: 'Get recommended problems tailored to your skill and history.',
  },
  {
    title: 'Upcoming Contests',
    description: 'Stay prepared and never miss a contest with timely reminders.',
  },
  {
    title: 'Top Friends',
    description: 'See what your peers are solving and get motivated.',
  },
  {
    title: 'Profile Insights',
    description: 'Track your growth with XP, badges, and performance insights.',
  },
];

export default HomePage;
