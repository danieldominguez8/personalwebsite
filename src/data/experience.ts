import { educationSchema, experienceSchema } from "./schema";

export const companies = experienceSchema.parse([
  {
    company: "Invoice Cloud",
    start: "2022-08",
    end: "present",
    roles: [
      {
        title: "Software Engineer II",
        start: "2024-12",
        end: "present",
        bullets: [
          "Built a machine-learning fraud and abuse detection service, saving about $90K a month in third-party vendor costs.",
          "Delivered payment APIs, a ledger service, and onboarding for a payment-facilitator platform, cutting processing costs about 50% for participating customers.",
          "Led migration of legacy services to modern .NET, raising transaction throughput 25%.",
          "Built a reusable AI skill that takes work items from grooming to ready-for-testing.",
        ],
      },
      {
        title: "Software Engineer I",
        start: "2022-08",
        end: "2024-11",
        bullets: [
          "Automated on-call diagnostics, cutting time-to-resolution for priority-one incidents 30%.",
          "Improved Azure DevOps CI/CD pipelines, reducing failed deployments 45%.",
          "Refactored legacy Visual Basic and C# applications for testability with NUnit, Moq, and Playwright.",
          "Supported payment and batch systems serving 3,000+ customer organizations.",
        ],
      },
    ],
  },
]);

export const education = educationSchema.parse([
  {
    school: "Drexel University",
    degree: "M.S., Software Engineering",
    start: "2020",
    end: "2022",
  },
]);
