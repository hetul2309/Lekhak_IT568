import { jest } from "@jest/globals";

const existsMock = jest.fn();

jest.unstable_mockModule("../../models/user.model.js", () => ({
  USERNAME_REGEX: /^[a-z0-9_]{3,20}$/,
  default: {
    exists: existsMock,
  },
}));

const {
  USERNAME_REQUIREMENTS_MESSAGE,
  normalizeUsername,
  stripToAllowedCharacters,
  isValidUsername,
  isUsernameAvailable,
  buildBaseFromSeed,
  ensureValidLength,
  generateUsernameSuggestion,
} = await import("../../utils/username.js");

describe("username utils", () => {
  beforeEach(() => {
    existsMock.mockReset();
    jest.restoreAllMocks();
  });

  test("exports the requirements message", () => {
    expect(USERNAME_REQUIREMENTS_MESSAGE).toContain("3-20");
  });

  test("normalizes and strips unsupported characters", () => {
    expect(normalizeUsername("  Ab.C-12_3  ")).toBe("abc12_3");
    expect(stripToAllowedCharacters("  __Ab C__  ")).toBe("__abc__");
  });

  test("validates usernames against the regex", () => {
    expect(isValidUsername("abc_123")).toBe(true);
    expect(isValidUsername("Abc")).toBe(false);
    expect(isValidUsername("ab")).toBe(false);
  });

  test("returns false for empty username availability checks", async () => {
    await expect(isUsernameAvailable("")).resolves.toBe(false);
    expect(existsMock).not.toHaveBeenCalled();
  });

  test("checks username availability with and without excluded user id", async () => {
    existsMock.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: "taken" });

    await expect(isUsernameAvailable("free_name")).resolves.toBe(true);
    expect(existsMock).toHaveBeenNthCalledWith(1, { username: "free_name" });

    await expect(isUsernameAvailable("busy_name", "user-1")).resolves.toBe(false);
    expect(existsMock).toHaveBeenNthCalledWith(2, {
      username: "busy_name",
      _id: { $ne: "user-1" },
    });
  });

  test("builds a cleaned base from sufficiently long seeds", () => {
    expect(buildBaseFromSeed("  __Hello---World__  ")).toBe("helloworld");
    expect(buildBaseFromSeed("averyveryveryverylongusername")).toBe("averyveryveryverylon");
  });

  test("falls back to a random user seed when the cleaned seed is too short", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);

    expect(buildBaseFromSeed("!!")).toBe("user04fzzz");
  });

  test("preserves suffixes while enforcing the maximum length", () => {
    expect(ensureValidLength("abcdefghijklmnopqrst", "99")).toBe("abcdefghijklmnopqr99");
    expect(ensureValidLength("abc", "")).toBe("abc");
  });

  test("generates the first available candidate", async () => {
    existsMock.mockResolvedValueOnce({ _id: "taken" }).mockResolvedValueOnce(null);

    await expect(generateUsernameSuggestion("Writer Name")).resolves.toBe("writername1");
  });

  test("throws when no candidate becomes available within the retry limit", async () => {
    existsMock.mockResolvedValue({ _id: "taken" });

    await expect(generateUsernameSuggestion("writer")).rejects.toThrow(
      "Unable to generate an available username."
    );
    expect(existsMock).toHaveBeenCalledTimes(1000);
  });
});
