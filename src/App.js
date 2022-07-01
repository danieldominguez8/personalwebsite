import React from 'react';
import './App.css';
import danny from './assets/danny.png';

function App() {
  return (
    <div className="Body">
      <div className="splitScreen">
        <div className="leftPane">
          <img className="bioPic" src={danny} />
        </div>
        <div className="rightPane">
          <h1 className="bioTitle">Hello, my name is Danny Dominguez and I'm a Software Engineer</h1>
          <h3 className="bioH3">About Me</h3>
          <p className="bioText">I am a passionate Software Engineer with high aspirations.
            I am en route to earning my M.S. in Software Engineering at Drexel University by the end of the summer quarter.
            I have studied under amazing professors and worked alongside great classmates on various projects.
            I have learned in-depth about software design, architecture, and requirements and have had experience working with JavaScript frameworks (ReactNative and ReactJS).
          </p>
          <h3 className="bioH3">Hobbies</h3>
          <p className="bioText">
            I love learning, coding, traveling, staying active, and spending time with my family and friends.
          </p>
        </div>
      </div>


    </div>
  );
}

export default App;