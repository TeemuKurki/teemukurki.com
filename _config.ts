import lume from "lume/mod.ts";

import nunjucks from "lume/plugins/nunjucks.ts";
import code_highlight from "lume/plugins/code_highlight.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import nav from "lume/plugins/nav.ts";
import metas from "lume/plugins/metas.ts";
import picture from "lume/plugins/picture.ts";
import transform_images from "lume/plugins/transform_images.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import type { Options } from "lume/plugins/markdown.ts";

const webappUrl = Deno.env.get("WEBAPP_URL");

const markdown: Options = {
  rules: {
    "image": (tokens, idx, _options, _env, slf) => {
      const token = tokens[idx];
      const attributes = token.attrs || [];
      if (
        attributes.some((attribute: [string, string]) => {
          return attribute[0] === "transform-images";
        })
      ) {
        return `<img alt="${token.content}" ${slf.renderAttrs(token)} />`;
      }
      return `<img alt="${token.content}" ${slf.renderAttrs(token)} transform-images="avif jpeg" />`;
    },
  },
};

const site = lume({
  location: webappUrl ? new URL(webappUrl) : undefined,
  src: "./src",
  dest: "_site",
  includes: "_includes",
  components: {
    variable: "comp",
  },
}, { markdown });

site.use(nunjucks());
site.use(code_highlight());
site.use(sass());
site.use(sitemap());
site.use(slugify_urls());
site.use(nav());
site.use(metas());
site.use(resolveUrls());
site.use(picture());
site.use(transform_images());

site.filter("log", (value) => console.log(value));

site.remoteFile(
  "_includes/styles/generated-code-highlight.scss",
  "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/a11y-light.min.css",
);

export default site;
