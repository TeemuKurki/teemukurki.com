import { load } from "https://deno.land/std@0.200.0/dotenv/mod.ts";

await load({ export: true });

type ContentfulLink = {
  sys: ContentfulSys;
};

type Asset = {
  sys: ContentfulSys;
  metadata: {
    tags: unknown[];
  };
  fields: {
    title: string;
    description?: string;
    file: {
      url: string;
      details: { size: number };
      fileName: string;
      contentType: string;
    };
  };
};
type ContentfulSys = {
  type: string;
  linkType?: string;
  id?: string;
  space?: ContentfulLink;
  environment?: ContentfulLink;
  revision?: number;
  createdAt?: string;
  updatedAt?: string;
  locale?: string;
};

type ContentfulRecource<T> = {
  metadata: {
    tags: unknown[];
  };
  sys: ContentfulSys;
  fields: T;
};
type ContentfulRecourceList<T> = {
  sys: ContentfulSys;
  total: number;
  skip: number;
  limit: number;
  items: ContentfulRecource<T>[];
  includes: {
    Asset: Asset[];
  };
};

type BlogPost = {
  title: string;
  blog: string;
  image: any;
  leadText: string;
};

const space = Deno.env.get("CTFL_SPACE_ID");
const host = Deno.env.get("CTFL_HOST");

const CONTENTFUL_HOST = `https://${host}/spaces/${space}/environments/master`;
const BLOG_POSTS_PATH = "/entries?content_type=blogPost";

const contentful = async <T>(path: string) => {
  const response = await fetch(`${CONTENTFUL_HOST + path}`, {
    headers: {
      Authorization: `Bearer ${Deno.env.get("CTFL_ACCESS_TOKEN")}`,
    },
  });
  const data = await response.json();
  return data as T;
};

export default async function* () {
  const data = await contentful<ContentfulRecourceList<BlogPost>>(
    BLOG_POSTS_PATH,
  );
  const blogPosts = data.items.map((item) => item.fields);
  for (const post of blogPosts) {
    yield {
      url: `./${post.title}/`,
      layout: "layouts/blog.njk",
      title: `Teemu Kurki - ${post.title}`,
      body: post.blog,
      leadText: post.leadText,
      image: data.includes?.Asset[0].fields,
    };
  }
}
