import { load } from "@std/dotenv";
import { Catalog } from "../utils/Catalog.ts";
import type { Album } from "../utils/Catalog.ts";

await load({ export: true });

/**
 * Loads music collection from Musicbrainz and pass data to _includes/layout/collection.njk
 */

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

const resolveData = async () => {
  const user = Deno.env.get("MUSICBRAINZ_API_USER");
  const pass = Deno.env.get("MUSICBRAINZ_API_PASS");
  if (!user || !pass) {
    throw Error("Musicbrainz credentials not provided");
  }
  const collectionId = Deno.env.get("MUSICBRAINZ_COLLECTION_ID");
  if (!collectionId) {
    throw Error("Musicbrainz collection id not povided");
  }

  let collections: Album[] = [];
  const client = new Catalog(
    user,
    pass,
  );
  try {
    collections = await client.getEntireCollection(
      collectionId,
    );
  } catch (error) {
    console.error("Failed to fetch music collection", error);
  }

  const groupByArtist = (albums: Album[]): Record<string, Album[]> => {
    return sortAlbums(albums).reduce((acc, album) => {
      if (!acc[album.artist]) {
        acc[album.artist] = [];
      }
      acc[album.artist].push(album);
      return acc;
    }, {} as Record<string, Album[]>);
  };

  const groupedByArtist = groupByArtist(collections);
  const result = Object.entries(groupedByArtist).map(([artist, albums]) => {
    return {
      artist: artist,
      albums: albums,
    };
  });
  return {
    artists: result,
  };
};

const data = await resolveData();
const artists = data.artists;

export { artists };
