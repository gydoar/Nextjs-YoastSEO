# Next.js + WordPress Yoast SEO Metadata

This module helps you **map Yoast SEO metadata** (exposed by WordPress in `yoast_head_json`) into the `Metadata` type supported by **Next.js 13+ App Router**.  



> [!NOTE]
> (a specific post by ID) `https://yoast.com/wp-json/wp/v2/posts/607 (a specific post by ID)`    [Yoast API](https://developer.yoast.com/customization/apis/rest-api/#1-get-seo-metadata-as-part-of-wordpress-native-wp-rest-api-responses)

It allows you to leverage all the SEO configuration you set up in WordPress directly inside your Next.js pages.

---

## ✨ Features

- Converts **Yoast SEO fields** (`yoast_head_json`) into Next.js `Metadata`.
- Supports:
  - Title, description, and canonical URLs.
  - Robots directives (`index`, `follow`, `googleBot`).
  - Open Graph tags (Facebook, LinkedIn).
  - Twitter Cards.
  - Authors.
  - Article metadata (published/modified time).
  - Extra metadata like `twitter:labelX`.

---

## 📂 Project Structure
lib/  
├── wordpress.ts # WordPress fetch utilities  
└── yoast.ts # Yoast types + metadata transformer  
components/   
└── yoastSEO.tsx # YoastSEO component  
app/  
└── posts/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [slug]/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── page.tsx # Post page for the single WP posts  


---

## 🛠️ Usage

### 1. Define Yoast Types

We define TypeScript interfaces for Yoast SEO metadata, including OpenGraph and Twitter:

```ts
// lib/yoast.d.ts

export interface YoastSeo {
  title?: string;
  description?: string;
  canonical?: string;

  robots?: {
    index?: string;
    follow?: string;
    'max-snippet'?: string;
    'max-image-preview'?: string;
    'max-video-preview'?: string;
  };

  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  og_image?: YoastSeoImage[];

  article_published_time?: string;
  article_modified_time?: string;
  author?: string;

  twitter_card?: string;
  twitter_misc?: Record<string, string>;

  schema?: Record<string, any>;
}

export interface YoastSeoImage {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}
```

### 2. Transform Yoast → Next.js Metadata

```tsx
// components/yoastSEO.tsx
import type { Metadata } from "next";
import { YoastSeo } from "../lib/yoast";

export function yoastMetadata(
  yoast: YoastSeo,
  fallback: { title?: string; description?: string } = {}
): Metadata {
  const validTwitterCards = ["summary", "summary_large_image", "player", "app"] as const;

  const twitterCard = validTwitterCards.includes(yoast.twitter_card as any)
    ? (yoast.twitter_card as (typeof validTwitterCards)[number])
    : "summary";

  return {
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
        type: img.type,
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

    other: {
      ...(yoast.article_published_time
        ? { "article:published_time": yoast.article_published_time }
        : {}),
      ...(yoast.article_modified_time
        ? { "article:modified_time": yoast.article_modified_time }
        : {}),
      ...(yoast.twitter_misc || {}),
    },
  };
}
```

### 3. Fetch WordPress Posts (Optional)

I used a custom fetcher called `getPostBySlug` to query the WordPress REST API, but you feel free to keep using your own fetcher.

```tsx
export async function getPostBySlug(slug: string): Promise<Post> {
  return wordpressFetch<Post[]>("/wp-json/wp/v2/posts", { slug }).then(
    (posts) => posts[0]
  );
}
```

This ensures we can request posts dynamically by their slug instead of just ID.

### 4. Example in a Next.js Dynamic Page

```tsx
// app/posts/[slug]/page.tsx

import { getPostBySlug } from "@/lib/wordpress";
import { yoastMetadata } from "@/lib/yoast";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return yoastMetadata(post.yoast_head_json, {
    title: post.title.rendered,
    description: post.excerpt?.rendered,
  });
}

```
#### Benefits

- Centralized SEO metadata handling.

- Full compatibility with Yoast SEO plugin in WordPress.

- Better SEO performance for Next.js App Router projects.

- Extensible: easily add categories, tags, or custom schema fields.

#### Notes

- Next.js [Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) type doesn’t officially support all Yoast fields.
That’s why some values are placed in other.

- Ensure your WordPress REST API exposes `yoast_head_json`.
This requires Yoast SEO plugin v16+.

#### Next Steps

- Add support for categories/tags metadata.

- Extend with custom JSON-LD schema.  

- Generate Open Graph images dynamically with Next.js.
