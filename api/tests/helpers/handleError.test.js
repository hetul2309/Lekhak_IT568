import { handleError } from "../../helpers/handleError.js";

describe("handleError", () => {
  test("creates an Error with statusCode and message", () => {
    const error = handleError(404, "Missing");

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Missing");
  });
});
