import Site from "lume/core/site.ts";
import { createHash } from "node:crypto";

/**
 * Automatically generate hashes for inline scripts
 */
export default function () {
  return (site: Site) => {
    site.process([".html"], (pages) => {
      for (const page of pages) {
        for (const src of page.document.querySelectorAll("script")) {
          const data = src.innerHTML;
          const hash = createHash("sha256").update(data).digest("base64");
          const identifier = `sha256-${hash}`;
          src.setAttribute("integrity", identifier);
          const head = page.document.getElementsByTagName("meta");
          for (const meta of head) {
            if (meta.getAttribute("http-equiv") === "Content-Security-Policy") {
              const content = meta.getAttribute("content");
              if (content) {
                const parts = content.split(";").map((p) => p.trim());
                const i = parts.findIndex((p) => p.startsWith("script-src"));

                parts[i] = parts[i].concat(` '${identifier}'`);

                meta.setAttribute("content", parts.join(";"));
              }
            }
          }
        }
      }
    });
  };
}
