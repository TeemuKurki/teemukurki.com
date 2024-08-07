// deno-lint-ignore-file require-await
export const mockFetchJson = <T extends object>(ok: boolean, result: T) => {
  return async () => {
    return {
      ok,
      json: async () => result,
    };
  };
};
