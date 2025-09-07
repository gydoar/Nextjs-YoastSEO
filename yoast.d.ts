// Common types fot Yoast SEO metadata
export interface YoastSeo{
    title?: string;
    description?: string;
    canonical?: string;

    //Robots
    robots?: {
        index?: string;
        follow?: string;
        'max-snippet'?: string;
        'max-image-preview'?: string;
        'max-video-preview'?: string;
    };

    //OpenGraph
    og_locale?: string;
    og_type?: string;
    og_title?: string;
    og_description?: string;
    og_url?: string;
    og_site_name?:string;
    og_image?: YoastSeoImage[];

    //Article timing metadata
    article_published_time?: string;
    article_modified_time?: string;

    //Author metadata
    author?: string;

    //Twitter Card
    twitter_card?: string;
    twitter_misc?: Record<string, string> ;

    //Schema
    schema?: Record<string, any>;
}

// Yoast Og image type
export interface YoastSeoImage {
    url: string;
    width?: number;
    height?: number;
    type?: string
}
