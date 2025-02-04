import React from 'react';
import '../assets/Home.css';

const technologies = [
  { img: "/html.webp", name: "HTML" },
  { img: "/css.png", name: "CSS" },
  { img: "/tailwind.webp", name: "Tailwind CSS" },
  { img: "/sass.png", name: "Sass" },
  { img: "/javascript.png", name: "JavaScript" },
  { img: "/sql.png", name: "SQL" },
  { img: "/react.png", name: "React" },
  { img: "/nodejs.png", name: "Node.js" },
  { img: "/express.png", name: "Express" },
  { img: "/mongodb.png", name: "MongoDB" },
  { img: "/php.svg", name: "PHP" },
  { img: "/flask.webp", name: "Flask" },
  { img: "/python.png", name: "Python" },
  { img: "/typescript.png", name: "TypeScript" },
  { img: "/wordpress.jpg", name: "WordPress" },
  { img: "/vite.png", name: "Vite" }
];

function Technologies() {
  return (
    <section id="technologies" className="technologies">
      <h2 className='TecnologiasTxt'>Tecnologías que Usamos</h2>
      <div className="tech-list">
        {technologies.map((tech, index) => (
          <div className="tech-item" key={index}>
            <img src={tech.img} alt={tech.name} className="tech-logo" />
            <h3>{tech.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Technologies;
