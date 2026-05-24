import { readFile, writeFile } from "node:fs/promises";

const postsDir = new URL("../src/content/posts/", import.meta.url);

type Options = {
  allowPlaceholder: boolean;
  date?: string;
  pinned?: boolean;
  slug: string;
};

function usage() {
  return [
    "Usage:",
    "  bun run publish:post <slug>",
    "",
    "Options:",
    "  --date <YYYY-MM-DD>     Set publish date",
    "  --today                 Set publish date to today",
    "  --pinned                Mark as pinned",
    "  --unpinned              Mark as not pinned",
    "  --allow-placeholder     Publish even if body is still the default placeholder",
    "  --help                  Show this message",
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
  let allowPlaceholder = false;
  let date: string | undefined;
  let pinned: boolean | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--allow-placeholder") {
      allowPlaceholder = true;
      continue;
    }

    if (arg === "--today") {
      date = localDate();
      continue;
    }

    if (arg === "--date") {
      date = readOptionValue(args, index, "--date");
      index += 1;
      continue;
    }

    if (arg === "--pinned") {
      pinned = true;
      continue;
    }

    if (arg === "--unpinned") {
      pinned = false;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
    }

    positional.push(arg);
  }

  if (positional.length !== 1) {
    throw new Error(`Expected one post slug.\n\n${usage()}`);
  }

  if (date) {
    assertDate(date);
  }

  const slug = positional[0].replace(/\.md$/, "");
  assertSlug(slug);

  return { allowPlaceholder, date, pinned, slug };
}

function readOptionValue(args: string[], index: number, option: string) {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}.\n\n${usage()}`);
  }

  return value;
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

function assertSlug(value: string) {
  if (!/^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/.test(value)) {
    throw new Error(
      `Invalid slug: ${value}. Use lowercase letters, numbers, Korean characters, and hyphens.`,
    );
  }
}

function parseMarkdown(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);

  if (!match) {
    throw new Error("Missing frontmatter.");
  }

  return {
    body: markdown.slice(match[0].length),
    frontmatter: match[1],
  };
}

function assertPublishableBody(body: string, allowPlaceholder: boolean) {
  const normalized = body.trim();

  if (allowPlaceholder) {
    return;
  }

  if (!normalized || normalized === "Write here.") {
    throw new Error(
      "Post body still looks empty. Write the post first, or pass --allow-placeholder.",
    );
  }
}

function upsertField(frontmatter: string, key: string, value: string) {
  const line = `${key}: ${value}`;
  const field = new RegExp(`^${key}:\\s*.*$`, "m");

  if (field.test(frontmatter)) {
    return frontmatter.replace(field, line);
  }

  return `${frontmatter.trimEnd()}\n${line}`;
}

function isFileError(error: unknown): error is Error & { code?: string } {
  return error instanceof Error && "code" in error;
}

async function publishPost() {
  const options = parseArgs(process.argv.slice(2));
  const filename = `${options.slug}.md`;
  const file = new URL(filename, postsDir);
  let markdown: string;

  try {
    markdown = await readFile(file, "utf8");
  } catch (error) {
    if (isFileError(error) && error.code === "ENOENT") {
      throw new Error(`Post not found: src/content/posts/${filename}`);
    }

    throw error;
  }

  const { frontmatter, body } = parseMarkdown(markdown);
  assertPublishableBody(body, options.allowPlaceholder);

  let nextFrontmatter = upsertField(frontmatter, "draft", "false");

  if (options.date) {
    nextFrontmatter = upsertField(nextFrontmatter, "date", options.date);
  }

  if (options.pinned !== undefined) {
    nextFrontmatter = upsertField(
      nextFrontmatter,
      "pinned",
      String(options.pinned),
    );
  }

  await writeFile(file, `---\n${nextFrontmatter}\n---\n${body}`);
  console.log(`Published src/content/posts/${filename}`);
}

publishPost().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
