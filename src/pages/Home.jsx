import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Work from '../components/Work';
import Process from '../components/Process';
import Plans from '../components/Plans';
import Technologies from '../components/Technologies';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

function Home() {
  return (
    <>
      <Helmet>
        <html lang="es-VE" />
        <title>
          Web Bonding | Agencia de Desarrollo Web, Apps & IoT en Acarigua–Araure,
          Portuguesa
        </title>
        <meta
          name="description"
          content="Web Bonding es la agencia de desarrollo de software, apps móviles, e-commerce y automatización IoT con sede en Acarigua–Araure, Portuguesa. Diseño y programación a medida para empresas de Venezuela y Latinoamérica."
        />
        <meta
          name="keywords"
          content="desarrollo web Acarigua, agencia digital Araure, programadores Portuguesa, software a medida Venezuela, apps móviles Acarigua, ecommerce Araure, diseño web Portuguesa, automatización industrial Venezuela, IoT Acarigua, transformación digital Portuguesa, agencia de software Venezuela"
        />
        <link rel="canonical" href="https://webbonding-sasj.onrender.com/" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Web Bonding | Software, Apps & IoT a medida — Acarigua–Araure, Venezuela"
        />
        <meta
          property="og:description"
          content="Agencia venezolana de desarrollo de software, aplicaciones móviles, e-commerce y automatización IoT. Diseño e ingeniería bajo un mismo techo, desde Acarigua–Araure para toda Latinoamérica."
        />
        <meta property="og:url" content="https://webbonding-sasj.onrender.com/" />
        <meta property="og:type" content="business.business" />

        {/* Twitter */}
        <meta
          name="twitter:title"
          content="Web Bonding · Software, Apps & IoT en Acarigua–Araure"
        />
        <meta
          name="twitter:description"
          content="Agencia venezolana de desarrollo de software, apps móviles y automatización IoT."
        />
      </Helmet>

      <main>
        <Hero />
        <About />
        <Services />
        <Work />
        <Process />
        <Plans />
        <Technologies />
        <FAQ />
        <CTA />
      </main>
    </>
  );
}

export default Home;
