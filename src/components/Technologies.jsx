import React from 'react';
import Reveal from './Reveal';
import '../assets/Technologies.css';

import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiHtml5, SiCss3, SiSass,
  SiVite, SiFlutter, SiNodedotjs, SiPython, SiMongodb, SiPostgresql,
  SiFirebase, SiPhp, SiArduino, SiGit, SiFigma, SiJavascript, SiMysql,
} from 'react-icons/si';

const technologies = [
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#ffffff' },
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Tailwind', icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'HTML5', icon: SiHtml5, color: '#E34F26' },
  { name: 'CSS3', icon: SiCss3, color: '#1572B6' },
  { name: 'Sass', icon: SiSass, color: '#CC6699' },
  { name: 'Flutter', icon: SiFlutter, color: '#02569B' },
  { name: 'Vite', icon: SiVite, color: '#646CFF' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Git', icon: SiGit, color: '#F05032' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'PHP', icon: SiPhp, color: '#777BB4' },
  { name: 'SQL', icon: SiMysql, color: '#4479A1' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
  { name: 'Arduino', icon: SiArduino, color: '#00979D' },
];

function Technologies() {
  return (
    <section id="technologies" className="tech wb-section wb-section--ink">
      <div className="wb-container">
        <div className="tech__header">
          <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Stack tecnológico</Reveal>
          <Reveal as="h2" className="wb-h2 tech__title" delay="d1">
            Nuestro arsenal <em>técnico</em>.
          </Reveal>
          <Reveal as="p" className="tech__sub" delay="d2">
            Elegimos la herramienta correcta para cada problema. Estas son algunas
            con las que construimos todos los días.
          </Reveal>
        </div>

        <Reveal className="tech__grid">
          {technologies.map((tech) => (
            <div className="tech__card" key={tech.name} style={{ '--hover-color': tech.color }}>
              <span className="tech__icon-wrap">
                <tech.icon className="tech__icon" />
              </span>
              <span className="tech__name">{tech.name}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Technologies;
