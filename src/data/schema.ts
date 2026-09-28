import { z } from "zod";
import { DATE_PATTERN } from "../lib/dates";

const date = z.string().regex(DATE_PATTERN, "YYYY or YYYY-MM");
const dateOrPresent = z.union([date, z.literal("present")]);
const httpsUrl = z.url().refine((u) => u.startsWith("https://"), "must be https");
const text = z.string().trim().min(1);

export const imageSchema = z.object({
  src: z.string().startsWith("/images/"),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const profileSchema = z.object({
  name: text,
  title: text,
  location: text,
  headline: text,
  intro: text,
  availability: text,
  email: z.email(),
  github: httpsUrl,
  linkedin: httpsUrl,
  resume: z.literal("/resume.pdf"),
  headshot: imageSchema,
  photo: imageSchema,
  about: z.array(text).min(1),
  contactNote: text,
});

export const roleSchema = z.object({
  title: text,
  start: date,
  end: dateOrPresent,
  bullets: z.array(text).min(1),
});

export const companySchema = z.object({
  company: text,
  start: date,
  end: dateOrPresent,
  roles: z.array(roleSchema).min(1),
});
export const experienceSchema = z.array(companySchema).min(1);

export const educationSchema = z.array(
  z.object({ school: text, degree: text, start: date, end: date }),
);

export const projectSchema = z.object({
  name: text,
  role: text,
  start: date,
  end: dateOrPresent.optional(),
  description: text,
  stack: z.array(text).min(1),
  figure: text.optional(),
  image: imageSchema.optional(),
  layout: z.enum(["card", "row"]),
  links: z.array(z.object({ label: text, url: httpsUrl })),
});
export const projectsSchema = z.array(projectSchema).min(1);

export const skillsSchema = z.array(z.object({ group: text, items: z.array(text).min(1) })).min(1);

export type ImageRef = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Company = z.infer<typeof companySchema>;
export type Education = z.infer<typeof educationSchema>[number];
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillsSchema>[number];
