import { z } from "zod";

export const identitySchema = z.object({
  fullName: z.string(),
  preferredName: z.string(),
  location: z.string(),
  birthDate: z.string(),
  pronouns: z.string(),
  motto: z.string()
});

export const aboutSchema = z.object({
  headline: z.string(),
  paragraphs: z.array(z.string()),
  identityFocus: z.array(z.string())
});

export const languageSchema = z.object({
  language: z.string(),
  proficiency: z.string(),
  notes: z.string()
});

export const educationEntrySchema = z.object({
  stage: z.string(),
  institution: z.string(),
  years: z.string(),
  notes: z.string()
});

export const awardSchema = z.object({
  year: z.number(),
  field: z.string(),
  title: z.string(),
  detail: z.string()
});

export const repositorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  repo: z.string(),
  summary: z.string(),
  stack: z.array(z.string()),
  topics: z.array(z.string()),
  stars: z.number().nullable(),
  lastUpdated: z.string().nullable(),
  previewUrl: z.string().nullable()
});

export const socialHandleSchema = z.object({
  handle: z.string(),
  url: z.string().url(),
  title: z.string().optional()
});

export const presenceSchema = z.object({
  github: socialHandleSchema,
  youtube: socialHandleSchema,
  instagram: z.array(socialHandleSchema),
  wikipediaDraft: socialHandleSchema
});

export const videoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  platform: z.literal("YouTube"),
  videoId: z.string(),
  url: z.string().url()
});

export const footerSchema = z.object({
  text: z.string(),
  wikiFooter: z.string()
});

export const wikiDataSchema = z.object({
  identity: identitySchema,
  about: aboutSchema,
  fields: z.array(z.string()),
  languages: z.array(languageSchema),
  education: z.array(educationEntrySchema),
  awards: z.array(awardSchema),
  repositories: z.array(repositorySchema),
  presence: presenceSchema,
  videos: z.array(videoSchema),
  footer: footerSchema
});
