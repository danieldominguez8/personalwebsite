import dannyDominguezDevImg from './images/danny_dominguez_dev.png';
import loteriaImg from './images/loteria_ios.png'; // Using one image for the combined Loteria project
import conversationalAgentImg from './images/conversational_agent.png';

// --- SKILLS DATA ---
export const skillCategories = [
  {
    categoryName: "Backend & .NET",
    skills: [
      { name: "C# (.NET 8/7/6, .NET Core)" },
      { name: "ASP.NET Core (Web API, MVC)" },
      { name: "Entity Framework Core & LINQ" },
      { name: ".NET Framework (Legacy Support)" },
      { name: "RESTful APIs & SOAP Services" },
      { name: "NUnit, xUnit, Moq (Testing)" },
    ],
  },
  {
    categoryName: "Cloud & DevOps (Azure)",
    skills: [
      { name: "Azure DevOps (Pipelines, Repos, Boards)" },
      { name: "Azure App Services & Azure Functions" },
      { name: "Azure Key Vault" },
      { name: "Azure SQL Database / MS SQL Server" },
      { name: "Azure Storage (Blob)" },
      { name: "CI/CD Implementation" },
    ],
  },
  {
    categoryName: "Cloud (AWS)",
    skills: [
        { name: "AWS Amplify (Deployment & Hosting)" },
        // Add other AWS services if applicable: e.g., { name: "EC2" }, { name: "S3" }
    ],
  },
  {
    categoryName: "Frontend",
    skills: [
      { name: "React & React Native" },
      { name: "JavaScript (ES6+) & TypeScript" },
      { name: "HTML5 & CSS3" },
      { name: "Angular" }, // Keep if you have significant, recent experience
    ],
  },
  {
    categoryName: "Databases",
    skills: [
      { name: "MS SQL Server (T-SQL, Stored Procedures)" },
      { name: "Firebase (Firestore, Realtime Database)" },
      { name: "NoSQL Concepts" },
      // Add other NoSQL like MongoDB if applicable
    ],
  },
  {
    categoryName: "Tools & Methodologies",
    skills: [
      { name: "Git & GitHub (Version Control)" },
      { name: "Agile & Scrum Methodologies" },
      { name: "TDD (Test-Driven Development)" },
      { name: "Jira (Project Management)" },
      { name: "Python (Scripting & Data Processing)" },
      { name: "Visual Basic" }, // Keep if relevant to recent work
      // Add Docker, Kubernetes if applicable
    ],
  },
];

// --- PROJECTS DATA ---
export const projectDataList = [ // Renamed to avoid confusion with the old projectList variable
  {
    id: "loteria",
    title: "Loteria Tradicional (iOS & Android)",
    imageUrl: loteriaImg,
    description:
      "A cross-platform mobile application bringing the traditional Latin bingo game, Loteria, to iOS and Android devices with a modern, engaging user experience.",
    technologies: [
      "React Native",
      "Firebase (Firestore, Realtime Database)",
      "JavaScript",
      "Swift (native modules, if any)", // Add if you wrote native code
      "Java (native modules, if any)",  // Add if you wrote native code
    ],
    highlights: [
      "Successfully achieved over 30,000+ unique downloads across platforms.",
      "Designed and implemented core game logic, multiple game modes, and real-time features.",
      "Published on Apple App Store and Google Play Store.",
    ],
    liveLinks: [ // Array for multiple store links
        { name: "iOS App Store", url: "https://apps.apple.com/us/app/loter%C3%ADa-tradicional/id1612279702?platform=iphone" },
        { name: "Android Play Store", url: "https://play.google.com/store/apps/details?id=com.loteriadominguez&hl=en&gl=US" },
    ],
    githubLink: null, // Add link if public, e.g., "https://github.com/youruser/loteria"
  },
  {
    id: "portfolio",
    title: "dannydominguez.dev (Personal Portfolio)",
    imageUrl: dannyDominguezDevImg,
    description:
      "My personal portfolio website built to showcase projects, skills, and professional background, deployed with a CI/CD pipeline on AWS.",
    technologies: ["React", "JavaScript", "HTML5", "CSS3", "AWS Amplify", "GitHub Pages (if used)"],
    highlights: [
      "Designed and developed a dynamic and responsive user interface from scratch.",
      "Leveraged AWS Amplify for continuous integration, deployment, and hosting.",
    ],
    liveLinks: [{ name: "View Live", url: "https://dannydominguez.dev" }], // Assuming this is your live URL
    githubLink: "https://github.com/danieldominguez8/personalwebsite",
  },
  {
    id: "chatbot",
    title: "Conversational Agent (AI Chatbot)",
    company: "Drexel University Project",
    imageUrl: conversationalAgentImg,
    description:
      "Prototyped an educational AI chatbot for underprivileged youth to provide accessible mentorship through engaging, AI-driven conversations about historical figures.",
    technologies: [
      "React Native",
      "Google Dialogflow API",
      "Firebase (Firestore)",
      "Python (for web scraping & data processing)",
      "JavaScript",
    ],
    highlights: [
      "Engineered a Python web scraper to collect and transform biographical data, significantly enhancing the chatbot's educational content.",
      "Integrated multiple third-party APIs and managed data flow in a NoSQL environment.",
      "Developed for iOS platform as part of university coursework.",
    ],
    liveLinks: null, // If no live demo
    githubLink: "https://github.com/shaquille-hall/se691-conversational-agent",
  },
];
