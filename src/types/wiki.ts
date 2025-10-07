import type { z } from "zod";

import {
  aboutSchema,
  awardSchema,
  educationEntrySchema,
  footerSchema,
  identitySchema,
  languageSchema,
  presenceSchema,
  repositorySchema,
  videoSchema,
  wikiDataSchema
} from "../data/schema";

export type Identity = z.infer<typeof identitySchema>;
export type About = z.infer<typeof aboutSchema>;
export type Language = z.infer<typeof languageSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type Award = z.infer<typeof awardSchema>;
export type RepositoryMeta = z.infer<typeof repositorySchema>;
export type Presence = z.infer<typeof presenceSchema>;
export type SocialHandle = Presence["github"];
export type FeatureVideo = z.infer<typeof videoSchema>;
export type FooterCopy = z.infer<typeof footerSchema>;
export type WikiData = z.infer<typeof wikiDataSchema>;
