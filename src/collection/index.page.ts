import { load } from "https://deno.land/std@0.200.0/dotenv/mod.ts";
import { Catalog } from "../utils/Catalog.ts";
import type { Album } from "../utils/Catalog.ts";

await load({ export: true });

const isRunningInDev = (): boolean => {
  return Deno.args.includes("-d");
};

const sortAlbums = (list: Album[]): Album[] => {
  return list.sort((a, b) => {
    const compare = a.artist.localeCompare(b.artist);
    if (compare === 0) {
      const aDate = new Date(a.releaseDate).getTime();
      const bDate = new Date(b.releaseDate).getTime();
      return aDate - bDate;
    }
    return compare;
  });
};

const makePages = (list: Album[]): Album[][] => {
  const pages: Album[][] = [];
  const pageSize = 20;
  for (let index = 0; index < list.length; index += pageSize) {
    const chunk = list.slice(index, index + pageSize);
    pages.push(chunk);
  }
  return pages;
};

export default async function* () {
  const user = Deno.env.get("MUSICBRAINZ_API_USER");
  const pass = Deno.env.get("MUSICBRAINZ_API_PASS");
  if (!user || !pass) {
    throw Error("Musicbrainz credentials not provided");
  }
  const collectionId = Deno.env.get("MUSICBRAINZ_COLLECTION_ID");
  if (!collectionId) {
    throw Error("Musicbrainz collection id no povided");
  }

  let collections: Album[] = [];
  const client = new Catalog(
    user,
    pass,
  );
  if (!isRunningInDev() || !localStorage.getItem("cd-collection")) {
    try {
      collections = await client.getEntireCollection(
        collectionId,
      );
      localStorage.setItem("cd-collection", JSON.stringify(collections));
    } catch (error) {
      console.error(error);
    }
  } else {
    collections = JSON.parse(localStorage.getItem("cd-collection")!);
  }

  sortAlbums(collections);
  const pages = makePages(collections);

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const currentPage = index + 1;
    yield {
      url: `./collection/${currentPage}`,
      layout: "layouts/collection.njk",
      currentPage: currentPage,
      allPages: pages.length,
      albums: page.map((album) => {
        const [img, altImg] = album.img.split(";")
        return {
          img: img,
          altImg: altImg, 
          artist: album.artist,
          title: album.title,
          id: album.id,
        }
      }),
    };
  }
}
