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
          <h1 className="biography-header">Hello, my name is Danny Dominguez and I'm a Software Engineer</h1>
          <h3 className="biography-section-header">About Me</h3>
          <p className="about-me-text">
            I am an enthusiastic individual with a passion for challenging myself and striving for excellence.
            I currently hold the position of Associate Software Engineer, where I harness my skills in .NET Framework to deliver high-quality software solutions.
            I earned my M.S. in Software Engineering from Drexel University in 2022, an achievement that underpins my technical skills and dedication to my field.
            At Drexel, I studied in-depth about software design, architecture, and requirements and have had experience working with JavaScript frameworks (ReactNative and ReactJS).

          </p>
          <h3 className="biography-section-header">Hobbies</h3>
          <p className="about-me-text">
            As a lifelong learner, my interests span from technology to the health sector.
            Coding isn't just my job—it's also a hobby of mine, I enjoy finding solutions to my everyday tasks.
            Beyond work, I love to travel and stay active and spend as much time with family and friends and my dog named Todd.
          </p>
        </div>
      </div>

      <div className="split-section">
        <div className="skills-container">
          <h1 className="biography-header">Skills</h1>
          <p className="about-me-text">
            In my professional journey, I've had the privilege of working on real-world software solutions, which has allowed me to hone my proficiency in both the .NET Framework and various JavaScript frameworks.
            I place a strong emphasis on testing all software to ensure reliability and maintain a clean code base.
            Collaboration has been an integral part of my professional development. Working under the mentorship of gifted managers and collaborating with dedicated colleagues on various projects has helped me to enhance my teamwork skills, contributing significantly to successful project completions. Our teams often employed agile methodologies such as scrum and kanban, fostering a dynamic and effective work environment.
            In my spare time, I enjoy further developing my skillset by creating applications and websites, experimenting with multiple languages, frameworks, and tools.
            If you're interested in learning more about my skills and projects, feel free to explore the 'My Work' section below or take a look at my  <a href={resume} target="_blank" rel="noreferrer" download>resume</a>.
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