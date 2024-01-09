import lume from "lume/mod.ts";
import nunjucks from "lume/plugins/nunjucks.ts";
import code_highlight from "lume/plugins/code_highlight.ts";
import remark from "lume/plugins/remark.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import nav from "lume/plugins/nav.ts";

const webappUrl = Deno.env.get("WEBAPP_URL");

const site = lume({
  location: webappUrl ? new URL(webappUrl) : undefined,
  src: "./src",
  dest: "_site",
  includes: "_includes",
  components: {
    variable: "comp",
  },
});
site.use(nunjucks())
site.use(code_highlight());
site.use(remark());
site.use(sass());
site.use(sitemap());
site.use(slugify_urls());
site.use(nav());

site.filter("log", (value) => console.log(value));

site.remoteFile(
  "_includes/styles/generated-code-highlight.scss",
  "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/a11y-light.min.css",
);

export default site;
