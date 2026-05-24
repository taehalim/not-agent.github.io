import { readdir, readFile } from "node:fs/promises";
import { basename } from "node:path";

import { siteConfig } from "../src/config/site";

const siteUrl = siteConfig.url;
const distDir = new URL("../dist/", import.meta.url);
const postsDir = new URL("../src/content/posts/", import.meta.url);

const staticPaths = ["/", "/about/", "/now/", "/posts/"];

function toUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function parseDraft(frontmatter: string) {
  const draft = frontmatter.match(/^draft:\s*(true|false)\s*$/m);

  return draft?.[1] === "true";
}

function parseFrontmatter(markdown: string) {
  return markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
}

async function readSitemapUrls() {
  const files = await readdir(distDir);
  const sitemapFiles = files.filter((file) => /^sitemap-\d+\.xml$/.test(file));

  if (sitemapFiles.length === 0) {
    throw new Error("No generated sitemap chunks found in dist/.");
  }

  const urls = new Set<string>();

  for (const file of sitemapFiles) {
    const xml = await readFile(new URL(file, distDir), "utf8");

    for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      urls.add(match[1]);
    }
  }

  return urls;
}

async function readPostUrls() {
  const files = (await readdir(postsDir)).filter((file) =>
    file.endsWith(".md"),
  );
  const published: string[] = [];
  const drafts: string[] = [];

  for (const file of files) {
    const markdown = await readFile(new URL(file, postsDir), "utf8");
    const slug = basename(file, ".md");
    const postUrl = toUrl(`/posts/${slug}/`);

    if (parseDraft(parseFrontmatter(markdown))) {
      drafts.push(postUrl);
    } else {
      published.push(postUrl);
    }
  }

  return { published, drafts };
}

const sitemapUrls = await readSitemapUrls();
const { published, drafts } = await readPostUrls();
const expectedUrls = [...staticPaths.map(toUrl), ...published];
const failures: string[] = [];

for (const url of expectedUrls) {
  if (!sitemapUrls.has(url)) {
    failures.push(`Missing from sitemap: ${url}`);
  }
}

for (const url of drafts) {
  if (sitemapUrls.has(url)) {
    failures.push(`Draft included in sitemap: ${url}`);
  }
}

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

console.log(`Verified sitemap URLs: ${sitemapUrls.size}`);
