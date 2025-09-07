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