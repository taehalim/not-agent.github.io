import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

import { siteConfig } from "../config/site";

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection("posts"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${siteConfig.name} Posts`,
    description: siteConfig.meta.posts.description,
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/posts/${post.id}/`,
    })),
    customData: "<language>en</language>",
  });
}
