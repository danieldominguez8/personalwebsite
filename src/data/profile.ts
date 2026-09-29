import { profileSchema } from "./schema";

export const profile = profileSchema.parse({
  name: "Danny Dominguez",
  title: "Software Engineer II at Invoice Cloud",
  location: "McAllen, TX",
  headline: "I build reliable payment platforms and backend services in .NET and Azure.",
  intro:
    "Four years shipping payment APIs, modernizing legacy .NET services, and building AI-assisted tooling that speeds up how my team works.",
  availability: "Open to new roles.",
  email: "dominguezdanieldev@gmail.com",
  github: "https://github.com/danieldominguez8",
  linkedin: "https://www.linkedin.com/in/dannyddominguez/",
  resume: "/resume.pdf",
  headshot: {
    src: "/images/headshot.jpg",
    alt: "Portrait of Danny Dominguez",
    width: 240,
    height: 240,
  },
  photo: {
    src: "/images/danny.jpg",
    alt: "Danny Dominguez at the Hoover Dam",
    width: 1096,
    height: 1500,
  },
  about: [
    "I'm based in McAllen, Texas. Coding is my job and also a hobby: I like finding software fixes for everyday problems.",
    "Outside of work I travel, stay active, and spend time with family, friends, and my dog, Todd.",
  ],
  contactNote: "I'm open to new roles, and happy to hear about freelance projects.",
});
