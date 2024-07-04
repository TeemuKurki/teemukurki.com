// deno-lint-ignore-file ban-ts-comment
import { assertEquals } from "jsr:@std/assert@0.226.0";
import { stub } from "jsr:@std/testing@0.225.3/mock";
import { Catalog, ReleaseCollection } from "./Catalog.ts";
import DigestClient from "digest-fetch";
import { mockFetchJson } from "../../test/utils.ts";
import { RateLimiter } from "@teemukurki/rate-limiter";

const testCollection: ReleaseCollection = {
  "release-count": 0,
  "release-offset": 0,
  releases: [{
    "artist-credit": [{
      artist: {
        "sort-name": "",
        "type-id": "",
        disambiguation: "",
        id: "",
        name: "",
        type: "",
      },
      joinphrase: "",
      name: "test-artist",
    }],
    "cover-art-archive": {
      artwork: false,
      back: false,
      count: 0,
      darkened: false,
      front: false,
    },
    "packaging-id": "",
    "release-events": [],
    "release-group": {
      "artist-credit": [],
      "first-release-date": "",
      "primary-type": "",
      "primary-type-id": "",
      "secondary-type-ids": [],
      "secondary-types": [],
      disambiguation: "",
      id: "release-group-id",
      title: "",
    },
    "status-id": "",
    "text-representation": {
      language: "",
      script: "",
    },
    asin: null,
    barcode: "",
    country: "",
    date: "",
    disambiguation: "",
    id: "release-id",
    packaging: "",
    quality: "",
    status: "",
    title: "",
  }],
};

Deno.test("Catalog tests", async (t) => {
  Deno.env.set("MUSICBRAINZ_USER_AGENT", "test-user-agent");
  stub(RateLimiter.prototype, "removeTokens", () => {
    return Promise.resolve(1);
  });
  const digestFetchStub = stub(DigestClient.prototype, "fetch", mockFetchJson(true, testCollection));
  const testCatalog = new Catalog("user", "pass");
  const result = await testCatalog.getCollection("id");

  await t.step("Call correct musicbrainz endpoint", () => {
    const call = digestFetchStub.calls[0];
    assertEquals(
      call.args[0],
      "https://musicbrainz.org/ws/2/release?collection=id&inc=artist-credits%2Brelease-groups&fmt=json&offset=0",
    );
    //@ts-ignore
    assertEquals(call.args[1]["headers"].get("user-agent"), "test-user-agent");
  });

  await t.step("Call correct with useragent", () => {
    const call = digestFetchStub.calls[0];
    //@ts-ignore
    assertEquals(call.args[1]["headers"].get("user-agent"), "test-user-agent");
  });
  await t.step("Set username and password to digest client", () => {
    const call = digestFetchStub.calls[0];
    assertEquals(call.self?.user, "user");
    assertEquals(call.self?.password, "pass");
  });
  await t.step("Return one album", () => {
    assertEquals(result.data.length, 1);
  });
  await t.step("Create coverarth thunbnail links", () => {
    const releaseLink = "https://coverartarchive.org/release/release-id/front-250";
    const releaseGroupLink = "https://coverartarchive.org/release-group/release-group-id/front-250";
    assertEquals(result.data[0].img, `${releaseLink};${releaseGroupLink}`);
  });
});
