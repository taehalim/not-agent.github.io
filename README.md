# not-agent.github.io

Personal website for taeha, built with the same core stack as `omnic-www`.

## Stack

- Astro static site
- Bun
- Tailwind CSS v4
- Goga Test and Geist Mono
- Prettier with `prettier-plugin-astro`
- GitHub Pages via GitHub Actions

## Local Development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun run dev
```

Run checks:

```bash
bun run format:check
bun run check
bun run verify:fonts
bun run build
```

Create a draft post:

```bash
bun run new:post "Post Title"
```

Optional flags:

```bash
bun run new:post "Post Title" --tag Tools --tag Agents # Add tags to the post frontmatter.
bun run new:post "Post Title" --slug custom-slug --date 2026-05-22 # Set filename slug and publish date.
bun run new:post "Post Title" --publish # Create as published instead of draft.
```

Publish a draft post:

```bash
bun run publish:post post-title
```

Optional publish flags:

```bash
bun run publish:post post-title --today # Set the post date to today while publishing.
bun run publish:post post-title --date 2026-05-22 --pinned # Set publish date and pin the post.
```

Format files:

```bash
bun run format
```

## GitHub Pages

This project is configured for the user site repository:

```text
not-agent/not-agent.github.io
```

That repository name publishes at:

```text
https://taeha.ultra.engineer/
```

Deployment uses `.github/workflows/deploy.yml`. In the GitHub repository, set
Settings -> Pages -> Build and deployment -> Source to `GitHub Actions`.
The GitHub Pages custom domain is `taeha.ultra.engineer`, backed by a DNS CNAME
record that points to `not-agent.github.io`.

The home page subscribe form reads `PUBLIC_SUBSCRIBE_ENDPOINT` and
`PUBLIC_TURNSTILE_SITE_KEY` during the static build. Set those repository
variables when email subscriptions are ready. The subscription API is managed
outside this public static-site repository.

Goga Test font binaries are not committed to this public repository. Deployment
restores them from a private font repository before building. Configure:

```text
PRIVATE_FONTS_REPOSITORY=not-agent/<private-font-repo>
PRIVATE_FONTS_DEPLOY_KEY=<read-only deploy key for the private font repo>
```

The private font repository should contain:

```text
goga/GogaTest-Regular.otf
goga/GogaTest-Medium.otf
goga/GogaTest-Semibold.otf
goga/GogaTest-Bold.otf
```

If this site is moved to a project repository with another name, add a matching
`base` value in `astro.config.ts`, for example:

```ts
export default defineConfig({
  site: "https://not-agent.github.io",
  base: "/repo-name",
});
```

## Font License

Goga Test is used by the deployed personal site, but the font binaries are
excluded from the public source repository. The source package license is
personal use only. Do not use this font for company, client, product,
commercial, monetized, or other non-personal purposes unless the author grants
the appropriate license.

## License

- Original written content: CC BY 4.0. See `LICENSE-CONTENT.md`.
- Source code: MIT. See `LICENSE-CODE.md`.
- Fonts and third-party assets are excluded from both licenses and remain under
  their own licenses.
