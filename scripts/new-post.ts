import { mkdir, writeFile } from "node:fs/promises";

const postsDir = new URL("../src/content/posts/", import.meta.url);

type Options = {
  date: string;
  draft: boolean;
  pinned: boolean;
  slug?: string;
  tags: string[];
  title: string;
};

function usage() {
  return [
    "Usage:",
    '  bun run new:post "Post Title"',
    "",
    "Options:",
    "  --slug <slug>        Use a custom filename slug",
    "  --date <YYYY-MM-DD>  Use a custom publish date",
    "  --tag <tag>          Add a tag. Can be repeated",
    '  --tags "A, B"        Add comma-separated tags',
    "  --pinned            Mark as pinned",
    "  --publish           Create as draft: false",
    "  --help              Show this message",
  ].join("\n");
}

function localDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseArgs(args: string[]): Options {
  const positional: string[] = [];
  const tags: string[] = [];
  let date = localDate();
  let draft = true;
  let pinned = false;
  let slug: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--publish") {
      draft = false;
      continue;
    }

    if (arg === "--pinned") {
      pinned = true;
      continue;
    }

    if (arg === "--date") {
      date = readOptionValue(args, index, "--date");
      index += 1;
      continue;
    }

    if (arg === "--slug") {
      slug = readOptionValue(args, index, "--slug");
      index += 1;
      continue;
    }

    if (arg === "--tag") {
      tags.push(readOptionValue(args, index, "--tag"));
      index += 1;
      continue;
    }

    if (arg === "--tags") {
      tags.push(...splitTags(readOptionValue(args, index, "--tags")));
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
    }

    positional.push(arg);
  }

  const title = positional.join(" ").trim();

  if (!title) {
    throw new Error(`Missing post title.\n\n${usage()}`);
  }

  assertDate(date);

  return {
    date,
    draft,
    pinned,
    slug,
    tags: dedupe(tags.map((tag) => tag.trim()).filter(Boolean)),
    title,
  };
}

function readOptionValue(args: string[], index: number, option: string) {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}.\n\n${usage()}`);
  }

  return value;
}

function splitTags(value: string) {
  return value.split(",").map((tag) => tag.trim());
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function assertDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date: ${value}. Expected YYYY-MM-DD.`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid date: ${value}.`);
  }
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function assertSlug(value: string) {
  if (!/^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/.test(value)) {
    throw new Error(
      `Invalid slug: ${value}. Use lowercase letters, numbers, Korean characters, and hyphens.`,
    );
  }
}

function toMarkdown(options: Options) {
  const title = JSON.stringify(options.title);
  const tags = options.tags.map((tag) => JSON.stringify(tag)).join(", ");

  return [
    "---",
    `title: ${title}`,
    `date: ${options.date}`,
    `tags: [${tags}]`,
    `pinned: ${options.pinned}`,
    `draft: ${options.draft}`,
    "---",
    "",
    "Write here.",
    "",
  ].join("\n");
}

function isFileError(error: unknown): error is Error & { code?: string } {
  return error instanceof Error && "code" in error;
}

async function createPost() {
  const options = parseArgs(process.argv.slice(2));
  const slug = options.slug ?? slugify(options.title);
  const safeSlug = slug || `post-${options.date}`;
  const filename = `${safeSlug}.md`;
  const file = new URL(filename, postsDir);

  assertSlug(safeSlug);
  await mkdir(postsDir, { recursive: true });

  try {
    await writeFile(file, toMarkdown(options), { flag: "wx" });
  } catch (error) {
    if (isFileError(error) && error.code === "EEXIST") {
      throw new Error(`Post already exists: src/content/posts/${filename}`);
    }

    throw error;
  }

  console.log(`Created src/content/posts/${filename}`);

  if (options.draft) {
    console.log(`Publish with: bun run publish:post ${safeSlug}`);
  }
}

createPost().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
