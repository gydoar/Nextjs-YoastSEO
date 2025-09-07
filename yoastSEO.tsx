import type { Metadata } from "next";
import { YoastSeo } from "../lib/yoast";

export function yoastMetadata(
    yoast: YoastSeo,
    fallback: { title?: string; description?: string } = {}
): Metadata{

    const validTwitterCards = [
        "summary",
        "summary_large_image",
        "player",
        "app",
    ] as const;

    const twitterCard = validTwitterCards.includes(
        yoast.twitter_card as any
    )
    ?(yoast.twitter_card as (typeof validTwitterCards)[number]) : "summary";


    return{
        title: yoast.title || fallback.title,
        description: yoast.description || fallback.description,

        alternates: {
            canonical: yoast.canonical,
        },

        robots: yoast.robots
      ? {
          index: yoast.robots.index !== "noindex",
          follow: yoast.robots.follow !== "nofollow",
          googleBot: {
            index: yoast.robots.index !== "noindex",
            follow: yoast.robots.follow !== "nofollow",
          },
        }
      : undefined,

      openGraph: {
        type: (yoast.og_type as any) || "article",
        locale: yoast.og_locale,
        url: yoast.og_url,
        siteName: yoast.og_site_name,
        title: yoast.og_title,
        description: yoast.og_description,
        images: yoast.og_image?.map((img) => ({
            url: img.url,
            width: img.width,
            height: img.height,
            typpe: img.type,
        })),
      },

      twitter: {
        card: twitterCard,
        title: yoast.og_title || yoast.title,
        description: yoast.og_description || yoast.description,
        images: yoast.og_image?.map((img) => img.url),
        creator: yoast.author,
      },

      authors: yoast.author ? [{ name: yoast.author }] : undefined,

      // These metadata are not officially supported by Nextjs, that's why they are in others.
      other: {
        ...(yoast.article_published_time !== undefined
          ? { "article:published_time": yoast.article_published_time }
          : {}),
        ...(yoast.article_modified_time !== undefined
          ? { "article:modified_time": yoast.article_modified_time }
          : {}),
        ...(yoast.twitter_misc || {})
        },
    };
}
