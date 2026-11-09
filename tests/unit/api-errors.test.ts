import { describe, it, expect } from "vitest";
import { ApiError, getFieldErrors } from "@/lib/api/errors";

describe("Frontend API Error Handling", () => {
  it("should create ApiError with status and isOperational flag", () => {
    const error400 = new ApiError("Bad Request", 400);
    expect(error400.status).toBe(400);
    expect(error400.isOperational).toBe(true);

    const error500 = new ApiError("Server Error", 500);
    expect(error500.status).toBe(500);
    expect(error500.isOperational).toBe(false);
  });

  it("should extract field-level errors correctly using getFieldErrors", () => {
    const apiError = new ApiError("Validation Error", 400, {
      error: [
        {
          key: "body",
          issues: [
            { message: "Password is too short", path: ["password"] },
            { message: "Invalid email address", path: ["email"] },
          ],
        },
      ],
    });

    const fieldErrors = getFieldErrors(apiError);
    expect(fieldErrors).toEqual({
      password: "Password is too short",
      email: "Invalid email address",
    });
  });

  it("should return empty object when no field errors exist", () => {
    const plainError = new Error("Generic error");
    expect(getFieldErrors(plainError)).toEqual({});
  });
});

