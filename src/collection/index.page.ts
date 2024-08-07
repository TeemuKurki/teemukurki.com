import { load } from "@std/dotenv";
import { Catalog } from "../utils/Catalog.ts";
import type { Album } from "../utils/Catalog.ts";

await load({ export: true });

/**
 * Loads music collection from Musicbrainz and pass data to _includes/layout/collection.njk
 */

/**
 * Check if currently running in development mode
 * @returns {boolean} True if running in development mode
 */
const isRunningInDev = (): boolean => {
  return Deno.args.includes("-d");
};

/**
 * Sort albums based on artist name and release date
 * @param list Albums
 * @returns Sorted Albums list
 */
const sortAlbums = (list: Album[]): Album[] => {
  return list.toSorted((a, b) => {
    const compare = a.artist.localeCompare(b.artist);
    if (compare === 0) {
      const aDate = new Date(a.releaseDate).getTime();
      const bDate = new Date(b.releaseDate).getTime();
      return aDate - bDate;
    }
    return compare;
  });
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

  const sortedAlbums = sortAlbums(collections);
  yield {
    layout: "layouts/collection.njk",
    albums: sortedAlbums.map((album) => {
      const [img, altImg] = album.img.split(";");
      return {
        img: img,
        altImg: altImg,
        artist: album.artist,
        title: album.title,
        id: album.id,
      };
    }),
  };
}
