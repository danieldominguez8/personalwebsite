import React from 'react';
import './App.css';
import danny from './assets/images/danny.png';
import resume from "./assets/files/danny_dominguez_resume.pdf";
import { skillList, projectList } from './assets/helpers';

function App() {
  return (
    <div className="body-container">
      <div className="split-section">
        <div className="picture-container">
          <img className="biography-picture" alt="danny" src={danny} />
        </div>
        <div className="about-me-container">
          <h1 className="main-header">Hello, I'm Danny Dominguez</h1>
          <h2 className="biography-subheader">Mid Level .NET Software Engineer</h2>
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
      </div>

      <div className="split-section">
        <div className="skills-container">
          <h1 className="biography-header">Skills</h1>
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
        <div className="skills-boxes-container">
          {skillList}
        </div>
      </div>

      <h1 className="work-header">My Work</h1>
      <div className="split-section">
        <div className="work-container">

          <div className="project-container">
            {projectList}
          </div>
        </div>
      </div>


      <div className="help-container">
        <h1 className="biography-header">Have a Project? Let's Build it.</h1>
        <p className="about-me-text">
          Feel free to reach out if you in need a developer or have any questions.
          Website? Web app? Mobile App? Trying to fill a full-time position? Email me at <a href="mailto:dominguezdanieldev@gmail.com"> dominguezdanieldev@gmail.com</a></p>
      </div>


    </div>
  );
}

export default App;