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
          <p className="about-me-text">I am a passionate Software Engineer with high aspirations.
            I am en route to earning my M.S. in Software Engineering at Drexel University by the end of the summer quarter.
            I have studied under amazing professors and worked alongside great classmates on various projects.
            I have learned in-depth about software design, architecture, and requirements and have had experience working with JavaScript frameworks (ReactNative and ReactJS).
          </p>
          <h3 className="biography-section-header">Hobbies</h3>
          <p className="about-me-text">
            I love learning, coding, traveling, staying active, and spending time with my family and friends.
          </p>
        </div>
      </div>

      <div className="split-section">
        <div className="skills-container">
          <h1 className="biography-header">Skills</h1>
          <p className="about-me-text">
            While studying to be a Software Engineer at Drexel University, I have gained a solid foundation on the principles of software design, reliability, and testing.
            I developed code using test driven development and an agile software development process.
            I had the opportunity to collaborate in multiple group projects with classmates to complete projects and tasks on schedule.
            In my free time, I have developed applications and websites to hone my skills across multiple languages, frameworks, and tools.
            If you would like to know more about my skills and projects, you may continue scrolling down to My Work or take a look at my <a href={resume} target="_blank" rel="noreferrer" download>resume</a>.
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