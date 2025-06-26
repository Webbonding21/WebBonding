import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Plans from '../components/Plans';
import Technologies from '../components/Technologies';
import { Helmet } from 'react-helmet-async';

function Home() {
  return (
    <>
    <Helmet>
        <title>Inicio | Web Bonding</title>
        <meta
          name="description"
          content="Desarrollo web, apps móviles y marketing para tu negocio."
        />
        <link rel="canonical" href="https://webbonding.onrender.com/" />
      </Helmet>
    <main>
      <Hero />
      <About />
      <Services />
      <Plans />
      <Technologies />
    </main>
    </>
  );
}

export default Home;
