import DigestClient from "npm:digest-fetch";
import { RateLimiter } from "@teemukurki/rate-limiter";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

export type Album = {
  img: string;
  artist: string;
  title: string;
  releaseDate: string;
  id: string;
};

interface ReleaseCollection {
  "release-count": number;
  "release-offset": number;
  releases: Release[];
}

interface Release {
  "artist-credit": ArtistCredit[];
  asin: string | null;
  barcode: string;
  country: string;
  "cover-art-archive": CoverArtArchive;
  date: string;
  disambiguation: string;
  id: string;
  packaging: string;
  "packaging-id": string;
  quality: string;
  "release-events": Event[];
  "release-group": ReleaseGroup;
  status: string;
  "status-id": string;
  "text-representation": TextRepresentation;
  title: string;
}

interface ArtistCredit {
  artist: Artist;
  joinphrase: string;
  name: string;
}

interface Artist {
  disambiguation: string;
  id: string;
  name: string;
  "sort-name": string;
  type: string;
  "type-id": string;
}

interface CoverArtArchive {
  artwork: boolean;
  back: boolean;
  count: number;
  darkened: boolean;
  front: boolean;
}

interface Event {
  area: Area;
  date: string;
}

interface Area {
  disambiguation: string;
  id: string;
  "iso-3166-1-codes": string[];
  name: string;
  "sort-name": string;
  type: any;
  "type-id": any;
}

interface ReleaseGroup {
  "artist-credit": ArtistCredit[];
  disambiguation: string;
  "first-release-date": string;
  id: string;
  "primary-type": string;
  "primary-type-id": string;
  "secondary-type-ids": any[];
  "secondary-types": any[];
  title: string;
}

interface TextRepresentation {
  language: string;
  script: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw data;
  }
};

const createQuery = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    searchParams.set(key, val);
  });
  return `?${searchParams}`;
};

const addHeader = (): HeadersInit => {
  const headers = new Headers();
  const ua = Deno.env.get("MUSICBRAINZ_USER_AGENT");
  if (ua) {
    headers.set("User-Agent", ua);
  }

  return headers;
};

export class Catalog {
  #user: string;
  #pass: string;
  #base_uri: string;
  constructor(user: string, pass: string) {
    this.#user = user;
    this.#pass = pass;
    this.#base_uri = "https://musicbrainz.org/ws/2";
  }

  async getCollection(
    collectionId: string,
    offset = 0,
  ): Promise<{ data: Album[]; next: boolean; pointer: number }> {
    const client = new DigestClient(this.#user, this.#pass);
    const path = `/release`;
    const queryString = createQuery({
      "collection": collectionId,
      "inc": "artist-credits+release-groups",
      "fmt": "json",
      "offset": `${offset}`,
    });

    const url = this.#base_uri + path + queryString;
    await limiter.removeTokens(1);
    const response = await client.fetch(url, { headers: addHeader() });
    const collections = await handleResponse<ReleaseCollection>(response);
    const albums: Album[] = collections.releases.map((release) => {
      const artist = release["artist-credit"].map((artist) => artist.name)
        .join(", ");

      let img = `https://coverartarchive.org/release/${release.id}/front-250`;
      if (release["release-group"].id) {
        img += `;https://coverartarchive.org/release-group/${
          release["release-group"].id
        }/front-250`;
      }

      const title = release.title;
      return {
        img: img,
        artist: artist,
        title: title,
        releaseDate: release.date,
        id: release.id,
      };
    });
    const pointer = collections.releases.length + offset;
    return {
      data: albums,
      next: collections["release-count"] > pointer,
      pointer: pointer,
    };
  }

  async getEntireCollection(collectionId: string) {
    let remaining = true;
    let offset = 0;
    const albums: Album[] = [];
    while (remaining) {
      const { data, next, pointer } = await this.getCollection(
        collectionId,
        offset,
      );
      remaining = next;
      offset = pointer;
      albums.push(...data);
    }
    return albums;
  }
}
