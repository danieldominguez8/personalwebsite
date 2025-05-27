import React from 'react';
import './App.css'; // Ensure your CSS is updated to style new classes/structure
import dannyProfileImage from './assets/images/danny.png'; // Confirm path
import resumePdf from "./assets/files/danny_dominguez_resume.pdf"; // Ensure this is the LATEST resume
import { skillCategories, projectDataList } from './assets/helpers'; // Updated import

// MUI Chip for skills and project tags (if you want to keep using it)
import Chip from "@mui/material/Chip"; 
// MUI Card for projects (if you want to keep using it)
import Card from '@mui/material/Card'; // You might need to adjust styling if using Card

function App() {
  return (
    <div className="body-container">
      {/* --- HERO/ABOUT ME SECTION --- */}
      <header className="hero-section split-section"> {/* Use <header> for semantic HTML */}
        <div className="picture-container">
          <img className="biography-picture" alt="Danny Dominguez, Software Engineer" src={dannyProfileImage} />
        </div>
        <div className="about-me-container">
          <h1 className="main-header">Hello, I'm Danny Dominguez</h1>
          <h2 className="biography-subheader">.NET Software Engineer II</h2>
          
          <h3 className="biography-section-header">About Me</h3>
          <p className="about-me-text">
            I am an enthusiastic Mid Level Software Engineer with a passion for challenging myself and striving for excellence. 
            I leverage my skills in <strong>C#, .NET Core, ASP.NET, and Azure</strong> to deliver high-quality, scalable software solutions. 
            My M.S. in Software Engineering from Drexel University (2022) solidified my foundation in software design, 
            architecture, and modern development practices, including applying robust design principles to build maintainable and efficient applications. 
            I also have hands-on experience with JavaScript frameworks like <strong>React Native and ReactJS</strong> for frontend development.
          </p>
          <h3 className="biography-section-header">Hobbies</h3>
          <p className="about-me-text">
            As a lifelong learner, my interests span from technology to the health sector. 
            Coding isn't just my job—it's also a hobby of mine; I enjoy finding solutions to everyday tasks through software. 
            Beyond work, I love to travel, stay active, and spend quality time with family, friends, and my dog, Todd.
          </p>
        </div>
      </header>

      {/* --- SKILLS SECTION --- */}
      <section className="skills-section-wrapper"> {/* Use <section> for semantic HTML */}
        <h2 className="section-header">My Skills</h2>
        <div className="skills-narrative">
          <p className="about-me-text">
            Throughout my professional journey and personal projects, I've gained hands-on experience in delivering robust software solutions. 
            This has allowed me to develop strong proficiency in the <strong>.NET ecosystem (including .NET Core and ASP.NET Core for building APIs and applications)</strong>, 
            cloud platforms like <strong>Azure (leveraging services such as Azure DevOps, App Services, and Functions)</strong>, 
            and various JavaScript frameworks for frontend development. 
            I place a strong emphasis on writing clean, testable code (utilizing <strong>NUnit and Moq</strong>) and ensuring software reliability. 
            Collaboration is key to my approach; working within <strong>Agile teams using Scrum and Kanban</strong>, 
            I've contributed to successful project completions. 
            Explore my skills below or view my <a href={resumePdf} target="_blank" rel="noreferrer" download className="resume-link">resume</a> for more details.
          </p>
        </div>
        <div className="skills-categories-container">
          {skillCategories.map((categoryObj) => (
            <div key={categoryObj.categoryName} className="skill-category">
              <h3 className="skill-category-name">{categoryObj.categoryName}</h3>
              <div className="skill-items-container"> {/* Changed from ul/li to div for Chip compatibility */}
                {categoryObj.skills.map((skill) => (
                  <Chip key={skill.name} label={skill.name} className="skill-chip" variant="outlined" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* --- EXPERIENCE SNAPSHOT SECTION (NEW) --- */}
      <section className="experience-section-wrapper">
        <h2 className="section-header">Career Highlights</h2>
        <div className="experience-entry">
            <h4>Software Engineer II | Invoice Cloud, Inc.</h4>
            <p className="experience-dates">December 2023 – Present <em>(Please verify date)</em></p>
            <ul className="experience-highlights">
                <li>Architected and led .NET system migrations and API development, improving transaction processing speed by 25%.</li>
                 <li>Engineered and maintained robust ASP.NET Core Web APIs and WCF services, processing over 1 million transactions monthly with 99.99% uptime.</li>
            </ul>
        </div>
        <div className="experience-entry">
            <h4>Software Engineer I | Invoice Cloud, Inc.</h4>
            <p className="experience-dates">August 2022 – November 2023</p>
            <ul className="experience-highlights">
                <li>Automated critical tasks using C#/Azure Functions, saving 2+ hours daily for the engineering team.</li>
                <li>Engineered tools reducing client migration time by 50% and contributing to revenue growth by up to 20%.</li>
            </ul>
        </div>
      </section>

      {/* --- MY WORK (PROJECTS) SECTION --- */}
      <section className="work-section-wrapper">
        <h2 className="section-header">My Work</h2>
        <div className="project-grid-container">
          {projectDataList.map((project) => (

            <div key={project.id} className="project-card"> {/* Or <Card key={project.id} className="project-card"> */}
              {project.imageUrl && (
                <img src={project.imageUrl} alt={`${project.title} screenshot`} className="project-image" />
              )}
              <div className="project-card-content">
                <h3 className="project-title">{project.title}</h3>
                {project.company && <p className="project-company">{project.company}</p>}
                <p className="project-description">{project.description}</p>
                
                <div className="project-technologies">
                  <strong>Technologies:</strong>
                  <div className="tags-container">
                    {project.technologies.map((tech) => (
                      <Chip key={tech} label={tech} size="small" className="tech-chip" />
                    ))}
                  </div>
                </div>

                <ul className="project-highlights-list">
                  {project.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
                
                <div className="project-links">
                  {project.liveLinks && project.liveLinks.map(link => (
                    link.url ? (
                      <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="project-link-button">
                        {link.name}
                      </a>
                    ) : null
                  ))}
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="project-link-button">
                      View Code
                    </a>
                  )}
                </div>
              </div>
            </div> 
          ))}
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <footer className="contact-section help-container"> {/* Use <footer> for semantic HTML */}
        <h2 className="section-header">Have a Project or Opportunity?</h2>
        <h3 className="biography-subheader">Let's Build it Together.</h3>
        <p className="about-me-text contact-text">
          I'm always excited to discuss new projects, innovative ideas, or potential full-time .NET roles. 
          Feel free to reach out if you need a dedicated developer or have any questions. <br />
          Email me at <a href="mailto:dominguezdanieldev@gmail.com" className="contact-link"><strong>dominguezdanieldev@gmail.com</strong></a> 
          or connect with me on <a href="[Your LinkedIn Profile URL]" target="_blank" rel="noreferrer" className="contact-link"><strong>LinkedIn</strong></a>.
        </p>
      </footer>
    </div>
  );
}

export default App;