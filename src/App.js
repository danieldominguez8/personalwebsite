import React from 'react';
import './App.css';
import danny from './assets/danny.png';

function App() {
  return (
    <div className="body-container">
      <div className="biography-section">
        <div className="picture-container">
          <img className="biography-picture" src={danny} />
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

      <div className="biography-section">
        <div className="about-me-container">
          <h1 className="biography-header">Skills</h1>
          <p className="about-me-text">
            While studying to be a Software Engineer at Drexel University, I have gained a solid foundation on the principles of software design, reliability, and testing.
            I wrote code using test driven development and an agile software development process.
          </p>
        </div>

        <div className="about-me-container">


        </div>
      </div>

    </div>
  );
}

export default App;