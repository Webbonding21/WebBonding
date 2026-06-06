import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Work from '../components/Work';
import Process from '../components/Process';
import Plans from '../components/Plans';
import Technologies from '../components/Technologies';
import CTA from '../components/CTA';

function Home() {
  return (
    <>
      <Helmet>
        <title>Web Bonding | Estudio de software, apps e IoT</title>
        <meta
          name="description"
          content="Estudio venezolano de producto digital: apps móviles, plataformas web, e-commerce y automatización IoT. Diseño e ingeniería a medida para Venezuela y Latam."
        />
        <link rel="canonical" href="https://webbonding-sasj.onrender.com/" />
      </Helmet>
      <main>
        <Hero />
        <About />
        <Services />
        <Work />
        <Process />
        <Plans />
        <Technologies />
        <CTA />
      </main>
    </>
  );
}

export default Home;
