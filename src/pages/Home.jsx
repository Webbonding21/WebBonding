import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Plans from '../components/Plans';
import Technologies from '../components/Technologies';

function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Plans />
      <Technologies />
    </main>
  );
}

export default Home;
