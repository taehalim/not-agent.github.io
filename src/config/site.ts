export const siteConfig = {
  url: "https://taeha.ultra.engineer",
  name: "Taeha's personal website",
  personName: "Taeha Lim",
  handle: "not-agent",
  role: "AI Eng. @Marker-Inc-Korea",
  location: "Seoul",
  avatarUrl: "https://avatars.githubusercontent.com/u/127670089?v=4",
  description:
    "Personal website for taeha, an AI engineer in Seoul building tools around agentic workflows.",
  links: {
    home: "/",
    github: "https://github.com/not-agent",
    x: "https://x.com/aetaeha",
    company: "https://github.com/Marker-Inc-Korea",
  },
  licenses: {
    content: {
      label: "Content CC BY 4.0",
      href: "https://creativecommons.org/licenses/by/4.0/",
    },
    code: {
      label: "Code MIT",
      href: "https://opensource.org/license/mit",
    },
  },
  subscribe: {
    endpoint: import.meta.env.PUBLIC_SUBSCRIBE_ENDPOINT ?? "",
  },
  turnstile: {
    siteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "",
  },
  meta: {
    home: {
      title: "Taeha Lim",
      description:
        "Posts and notes by Taeha Lim on AI agents, developer workflows, and software.",
    },
    now: {
      title: "Now - Taeha Lim",
      description: "What Taeha Lim is focused on now.",
    },
    about: {
      title: "About - Taeha Lim",
      description: "About Taeha Lim.",
    },
    posts: {
      title: "Posts - Taeha Lim",
      description: "Posts by Taeha Lim.",
    },
    notFound: {
      title: "Page not found - Taeha Lim",
      description: "The requested page could not be found.",
    },
  },
} as const;

export const navLinks = [
  {
    href: "/now/",
    label: "Now",
  },
  {
    href: "/about/",
    label: "About",
  },
  {
    href: "/posts/",
    label: "Posts",
  },
] as const;
