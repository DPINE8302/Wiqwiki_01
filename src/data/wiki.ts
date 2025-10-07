import identity from "../../data/identity.json";
import about from "../../data/about.json";
import fields from "../../data/fields.json";
import languages from "../../data/languages.json";
import education from "../../data/education.json";
import awards from "../../data/awards.json";
import repositories from "../../data/repositories.json";
import presence from "../../data/presence.json";
import videos from "../../data/videos.json";
import footer from "../../data/footer.json";

import { ZodError } from "zod";
import { wikiDataSchema } from "./schema";

const rawData = {
  identity,
  about,
  fields,
  languages,
  education,
  awards,
  repositories,
  presence,
  videos,
  footer
};

export const wikiData = (() => {
  try {
    return wikiDataSchema.parse(rawData);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Invalid wiki data", JSON.stringify(error.issues, null, 2));
    }
    throw error;
  }
})();

export type WikiDataKeys = keyof typeof wikiData;
