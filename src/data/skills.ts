import { skillsSchema } from "./schema";

export const skills = skillsSchema.parse([
  {
    group: "Backend & APIs",
    items: [".NET 8", ".NET Framework", "ASP.NET Core", "WCF", "REST", "SOAP"],
  },
  {
    group: "Payments",
    items: [
      "Datacap",
      "Chase Orbital Gateway",
      "J.P. Morgan Commerce Platform",
      "Cybersource",
      "Bluefin",
    ],
  },
  { group: "Languages", items: ["C#", "SQL", "Python", "JavaScript", "Visual Basic"] },
  {
    group: "AI & automation",
    items: ["Claude", "OpenAI Codex", "Cursor", "reusable AI skills", "workflow automation"],
  },
  {
    group: "Cloud & delivery",
    items: [
      "Azure App Service",
      "Functions",
      "Key Vault",
      "Azure DevOps",
      "CI/CD",
      "Git",
      "GitHub",
    ],
  },
  { group: "Databases", items: ["SQL Server", "Oracle", "MySQL"] },
  { group: "Testing", items: ["NUnit", "Moq", "Playwright"] },
]);
