import { access } from "node:fs/promises";

const fontDir = new URL("../public/fonts/goga/", import.meta.url);
const requiredFonts = [
  "GogaTest-Regular.otf",
  "GogaTest-Medium.otf",
  "GogaTest-Semibold.otf",
  "GogaTest-Bold.otf",
];

const missing: string[] = [];

for (const font of requiredFonts) {
  try {
    await access(new URL(font, fontDir));
  } catch {
    missing.push(`public/fonts/goga/${font}`);
  }
}

if (missing.length > 0) {
  throw new Error(
    [
      "Missing private font files:",
      ...missing.map((font) => `- ${font}`),
      "",
      "Restore them locally from the private font package before building.",
      "In GitHub Actions, the deploy workflow restores them from PRIVATE_FONTS_REPOSITORY.",
    ].join("\n"),
  );
}

console.log(`Verified private fonts: ${requiredFonts.length}`);
