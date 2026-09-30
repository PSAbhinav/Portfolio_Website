import { z } from "zod";

// Content model v2. Everything the public site renders comes through this
// schema, whether from the bundled defaults or from the database, so a bad
// row can never reach a component.
const text = z.string().max(6000);
const short = z.string().min(1).max(200);
const optional = z.string().max(200);
const https = z
  .string()
  .max(2000)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use an https:// URL");
const optionalHttps = z.union([https, z.literal("")]);
// Images are served through next/image, which only knows this site's own
// paths and the studio's uploads; remote URLs would break the optimizer.
const image = z
  .string()
  .max(2000)
  .regex(/^\/(?!\/)[a-zA-Z0-9/_ .%()-]+$/, "Use an uploaded image or a path under /public, e.g. /projects/name.png");
// Year-month ("2026-08") or empty for "present".
const yearMonth = z.union([z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), z.literal("")]);

export const highlightSchema = z
  .object({ label: short, metric: short, detail: text })
  .strict();

export const experienceSchema = z
  .object({
    company: short,
    title: short,
    team: optional,
    location: optional,
    start: yearMonth,
    end: yearMonth,
    summary: text,
    highlights: z.array(highlightSchema).max(6),
  })
  .strict();

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]{2,60}$/, "Use lowercase letters, digits and hyphens"),
    title: short,
    summary: z.string().max(200),
    description: text,
    image,
    github: https,
    demo: optionalHttps,
    tags: z.array(short).max(12),
    featured: z.boolean(),
    year: z.string().max(20),
  })
  .strict();

export const skillGroupSchema = z
  .object({
    title: short,
    skills: z.array(z.object({ name: short, note: optional }).strict()).min(1).max(30),
  })
  .strict();

export const certificationSchema = z
  .object({
    title: short,
    issuer: short,
    date: yearMonth,
    url: optionalHttps,
    score: optional,
  })
  .strict();

export const educationSchema = z
  .object({ title: short, place: short, date: short, description: text })
  .strict();

export const contentSchema = z
  .object({
    profile: z
      .object({
        name: short,
        image,
        role: short,
        company: short,
        location: short,
        availability: optional,
        tagline: text,
        metadataTitle: short,
        metadataDescription: z.string().max(400),
        github: https,
        linkedin: https,
      })
      .strict(),
    contactEmail: z.string().email().max(254),
    biography: z.array(text).min(1).max(12),
    experience: z.array(experienceSchema).max(10),
    projects: z
      .array(projectSchema)
      .min(1)
      .max(60)
      .superRefine((projects, context) => {
        const seen = new Set<string>();
        projects.forEach((project, index) => {
          if (seen.has(project.slug)) {
            context.addIssue({ code: z.ZodIssueCode.custom, path: [index, "slug"], message: `Slug "${project.slug}" is used twice` });
          }
          seen.add(project.slug);
        });
      }),
    skillGroups: z.array(skillGroupSchema).min(1).max(10),
    certifications: z.array(certificationSchema).max(30),
    education: z.array(educationSchema).max(30),
    copy: z.record(z.string().max(100), z.string().max(3000)),
  })
  .strict();

export type PortfolioContent = z.infer<typeof contentSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Highlight = z.infer<typeof highlightSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Education = z.infer<typeof educationSchema>;
