import React from 'react';
import '../assets/Technologies.css';

// Importamos los iconos desde 'react-icons/si' (Simple Icons)
import { 
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiHtml5, SiCss3, SiSass, 
  SiVite, SiFlutter, SiNodedotjs, SiPython, SiMongodb, SiPostgresql, 
  SiFirebase, SiPhp, SiArduino, SiGit, SiFigma, SiJavascript, SiMysql 
} from "react-icons/si";

const technologies = [
  // --- Frontend ---
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" }, // Blanco para dark mode
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", icon: SiCss3, color: "#1572B6" },
  { name: "Sass", icon: SiSass, color: "#CC6699" },
  
  // --- Mobile & Tools ---
  { name: "Flutter", icon: SiFlutter, color: "#02569B" },
  { name: "Vite", icon: SiVite, color: "#646CFF" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E" },
  { name: "Git", icon: SiGit, color: "#F05032" },

  // --- Backend & Data ---
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "PHP", icon: SiPhp, color: "#777BB4" },
  { name: "SQL", icon: SiMysql, color: "#4479A1" }, // Usando MySQL como ref de SQL
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
  
  // --- Enterprise & IoT ---

  { name: "Arduino", icon: SiArduino, color: "#00979D" },
];

function Technologies() {
  return (
    <section id="technologies" className="tech-section">
      <div className="tech-container">
        <div className="tech-header">
          <h2 className='tech-title'>Nuestro Arsenal <span className="text-gradient">Tecnológico</span></h2>
          <p className="tech-subtitle">
            Dominamos las herramientas más potentes del mercado para construir soluciones escalables.
          </p>
        </div>
        
        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <div 
              className="tech-card" 
              key={index}
              // Pasamos el color como variable CSS inline para usarlo en el hover
              style={{ '--hover-color': tech.color }} 
            >
              <div className="icon-wrapper">
                {/* Renderizamos el componente del icono */}
                <tech.icon className="tech-icon" />
              </div>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Technologies;