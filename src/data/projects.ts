import { projectsSchema } from "./schema";

export const projects = projectsSchema.parse([
  {
    name: "Lotería Tradicional",
    role: "Personal project",
    start: "2020",
    end: "present",
    figure: "30,000+ downloads",
    description:
      "The app is the caller for Lotería, the traditional Mexican bingo game. I first built it in React Native, then rewrote it natively in SwiftUI and Kotlin, adding custom voice profiles you can record and share.",
    stack: ["SwiftUI", "Kotlin", "Jetpack Compose", "React Native"],
    image: {
      src: "/images/loteria.jpg",
      alt: "Lotería home screen with the El Gallo card and Jugar, Tabla, and Voces buttons",
      width: 646,
      height: 1400,
    },
    layout: "card",
    links: [
      {
        label: "App Store",
        url: "https://apps.apple.com/us/app/loter%C3%ADa-tradicional/id1612279702",
      },
    ],
  },
  {
    name: "FreeTogether",
    role: "Personal project",
    start: "2026",
    description:
      "An iOS app for small groups to mark their availability and rank the best dates for trips, reunions, and shared plans.",
    stack: ["SwiftUI", "Firebase", "Cloud Functions"],
    image: {
      src: "/images/freetogether.jpg",
      alt: "FreeTogether group calendar showing each member's availability as colored dots",
      width: 647,
      height: 1400,
    },
    layout: "card",
    links: [
      { label: "App Store", url: "https://apps.apple.com/us/app/free-together/id6760777597" },
    ],
  },
  {
    name: "Rally Competitions",
    role: "Founder",
    start: "2026",
    description:
      "A platform for functional-fitness competitions: public event pages and organizer tools on the web, a mobile app for athletes and spectators, and one typed API behind both.",
    stack: ["Next.js", "Expo / React Native", "FastAPI", "PostgreSQL", "Docker", "GitLab CI/CD"],
    layout: "row",
    links: [{ label: "Website", url: "https://www.rallycompetitions.com" }],
  },
  {
    name: "dannydominguez.dev",
    role: "Personal project",
    start: "2022",
    end: "present",
    description:
      "This site: a static Astro build with automated accessibility, visual, and performance checks, deployed on AWS Amplify.",
    stack: ["Astro", "AWS Amplify", "Route 53", "Playwright"],
    layout: "row",
    links: [
      { label: "Website", url: "https://www.dannydominguez.dev" },
      { label: "GitHub", url: "https://github.com/danieldominguez8/personalwebsite" },
    ],
  },
  {
    name: "Conversational Agent",
    role: "M.S. capstone, Drexel",
    start: "2021",
    end: "2022",
    description:
      "A chatbot that lets students talk with historical role models, trained on first-person narratives from a custom web scraper.",
    stack: ["React Native", "Dialogflow", "Firebase", "Python"],
    image: {
      src: "/images/conversational-agent.png",
      alt: "Role Model Chatbot sign-in and home screens",
      width: 458,
      height: 334,
    },
    layout: "row",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/shaquille-hall/se691-conversational-agent",
      },
    ],
  },
]);
