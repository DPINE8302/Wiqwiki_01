import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { create, insertMultiple, save } from "@orama/orama";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const outputDir = join(projectRoot, "public");
const outputFile = join(outputDir, "search-index.json");
const manifestFile = join(outputDir, "search-manifest.json");

async function loadJson(relativePath) {
  const filePath = join(projectRoot, relativePath);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

const [identity, about, fields, languages, education, awards, repositories, presence, videos] =
  await Promise.all([
    loadJson("data/identity.json"),
    loadJson("data/about.json"),
    loadJson("data/fields.json"),
    loadJson("data/languages.json"),
    loadJson("data/education.json"),
    loadJson("data/awards.json"),
    loadJson("data/repositories.json"),
    loadJson("data/presence.json"),
    loadJson("data/videos.json")
  ]);

const documents = [];
const keywords = (...values) => values.filter(Boolean).map(String);

documents.push({
  id: "identity",
  type: "Identity",
  title: identity.fullName,
  description: `${identity.location} · ${identity.pronouns} · Born ${identity.birthDate}`,
  route: "/bio",
  badges: ["Bio"],
  keywords: keywords(identity.preferredName, identity.motto, identity.location, identity.pronouns)
});

documents.push({
  id: "motto",
  type: "Motto",
  title: identity.motto,
  description: about.headline,
  route: "/",
  badges: ["Quote"],
  keywords: keywords(identity.fullName, identity.location, "motto")
});

about.paragraphs.forEach((paragraph, index) => {
  documents.push({
    id: `about-${index}`,
    type: "About",
    title: about.headline,
    description: paragraph,
    route: "/bio",
    badges: ["About"],
    keywords: keywords(...about.identityFocus)
  });
});

fields.forEach((field) => {
  documents.push({
    id: `field-${field.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    type: "Field",
    title: field,
    description: `Area of focus: ${field}`,
    route: "/projects",
    badges: ["Focus"],
    keywords: keywords(field, "interest")
  });
});

languages.forEach((language) => {
  documents.push({
    id: `language-${language.language.toLowerCase()}`,
    type: "Language",
    title: `${language.language} · ${language.proficiency}`,
    description: language.notes,
    route: "/bio",
    badges: ["Language"],
    keywords: keywords(language.language, language.proficiency, language.notes)
  });
});

education.forEach((entry) => {
  documents.push({
    id: `education-${entry.years}`,
    type: "Education",
    title: entry.institution,
    description: `${entry.stage} · ${entry.years}`,
    route: "/bio",
    badges: ["Education"],
    keywords: keywords(entry.stage, entry.notes, entry.years)
  });
});

awards.forEach((award) => {
  documents.push({
    id: `award-${award.year}-${award.field}-${award.title}`,
    type: "Award",
    title: `${award.title} · ${award.field}`,
    description: `${award.detail} (${award.year})`,
    route: "/awards",
    badges: ["Award"],
    keywords: keywords(award.field, award.detail, award.year)
  });
});

repositories.forEach((repo) => {
  documents.push({
    id: `repo-${repo.slug}`,
    type: "Repository",
    title: repo.name,
    description: repo.summary || `GitHub repo ${repo.repo}`,
    route: `/repos#${repo.slug}`,
    badges: ["Repo"],
    keywords: keywords(repo.repo, ...(repo.topics || []))
  });
});

videos.forEach((video) => {
  documents.push({
    id: `video-${video.slug}`,
    type: "Media",
    title: video.title,
    description: `YouTube ID ${video.videoId}`,
    route: "/media",
    badges: ["Video"],
    keywords: keywords(video.platform, video.videoId)
  });
});

documents.push({
  id: "presence-github",
  type: "Presence",
  title: `GitHub · @${presence.github.handle}`,
  description: presence.github.url,
  route: "/repos",
  badges: ["Presence"],
  keywords: keywords("GitHub", presence.github.handle)
});

presence.instagram.forEach((account) => {
  documents.push({
    id: `presence-instagram-${account.handle}`,
    type: "Presence",
    title: `Instagram · @${account.handle}`,
    description: account.url,
    route: "/media",
    badges: ["Presence"],
    keywords: keywords("Instagram", account.handle)
  });
});

documents.push({
  id: "presence-youtube",
  type: "Presence",
  title: `YouTube · ${presence.youtube.handle}`,
  description: presence.youtube.url,
  route: "/media",
  badges: ["Presence"],
  keywords: keywords("YouTube", presence.youtube.handle)
});

async function buildIndex() {
  const db = await create({
    schema: {
      id: "string",
      type: "string",
      title: "string",
      description: "string",
      route: "string",
      badges: "string[]",
      keywords: "string[]"
    }
  });

  await insertMultiple(db, documents);

  const serialized = await save(db);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, JSON.stringify(serialized));
  await writeFile(
    manifestFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        documents: documents.length
      },
      null,
      2
    )
  );
}

buildIndex()
  .then(() => {
    console.log(`Search index generated with ${documents.length} documents.`);
  })
  .catch((error) => {
    console.error("Failed to build search index", error);
    process.exitCode = 1;
  });
