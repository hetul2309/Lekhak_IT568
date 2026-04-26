import { jest } from "@jest/globals";

process.env.OTP_EXPIRY_MINUTES = "5";
process.env.OTP_RESEND_INTERVAL_MINUTES = "1";

const findOneMock = jest.fn();
const deleteManyMock = jest.fn();
const saveMock = jest.fn();

const OtpCodeMock = jest.fn(function OtpCode(data) {
  Object.assign(this, data);
  this.save = saveMock.mockResolvedValue(this);
});

OtpCodeMock.findOne = findOneMock;
OtpCodeMock.deleteMany = deleteManyMock;

jest.unstable_mockModule("../../models/OtpCode.model.js", () => ({
  default: OtpCodeMock,
}));

const {
  generateOtp,
  createAndSendOtp,
  canResendOtp,
  resendOtp,
  verifyOtp,
} = await import("../../utils/Otp.js");

describe("OTP utils", () => {
  beforeEach(() => {
    findOneMock.mockReset();
    deleteManyMock.mockReset();
    saveMock.mockReset();
    OtpCodeMock.mockClear();
    jest.restoreAllMocks();
  });

  test("generates a six digit OTP string", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  test("createAndSendOtp validates required fields", async () => {
    await expect(createAndSendOtp({ pendingUser: {} })).rejects.toThrow(
      "Email is required to create OTP."
    );
    await expect(createAndSendOtp({ email: "test@example.com" })).rejects.toThrow(
      "Pending user payload is required to create OTP."
    );
  });

  test("createAndSendOtp creates a new OTP document and sends email", async () => {
    const sendEmailFn = jest.fn().mockResolvedValue(undefined);
    const pendingUser = { email: "test@example.com", name: "Test User" };

    findOneMock.mockResolvedValue(null);
    jest.spyOn(Math, "random").mockReturnValue(0);

    const otpDoc = await createAndSendOtp({
      email: "test@example.com",
      pendingUser,
      sendEmailFn,
    });

    expect(OtpCodeMock).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(otpDoc.code).toBe("100000");
    expect(otpDoc.pendingUser).toEqual(pendingUser);
    expect(saveMock).toHaveBeenCalled();
    expect(sendEmailFn).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        code: "100000",
      })
    );
  });

  test("canResendOtp enforces the resend interval", () => {
    expect(canResendOtp(null)).toBe(true);
    expect(canResendOtp({ lastSentAt: new Date(Date.now() - 70_000) })).toBe(true);
    expect(canResendOtp({ lastSentAt: new Date(Date.now() - 5_000) })).toBe(false);
  });

  test("resendOtp throws when no pending OTP exists", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(resendOtp({ email: "test@example.com" })).rejects.toMatchObject({
      code: "OTP_NOT_FOUND",
    });
  });

  test("resendOtp throws when the resend window has not passed", async () => {
    findOneMock.mockResolvedValue({
      lastSentAt: new Date(),
    });

    await expect(resendOtp({ email: "test@example.com" })).rejects.toMatchObject({
      code: "RESEND_TOO_SOON",
    });
  });

  test("resendOtp refreshes the OTP and increments resendCount", async () => {
    const sendEmailFn = jest.fn().mockResolvedValue(undefined);
    const otpDoc = {
      email: "test@example.com",
      lastSentAt: new Date(Date.now() - 70_000),
      resendCount: 1,
      save: jest.fn().mockResolvedValue(undefined),
    };

    findOneMock.mockResolvedValue(otpDoc);
    jest.spyOn(Math, "random").mockReturnValue(0);

    const result = await resendOtp({ email: "test@example.com", sendEmailFn });

    expect(result.code).toBe("100000");
    expect(result.resendCount).toBe(2);
    expect(otpDoc.save).toHaveBeenCalled();
    expect(sendEmailFn).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        code: "100000",
      })
    );
  });

  test("verifyOtp rejects missing OTP records", async () => {
    findOneMock.mockResolvedValue(null);

    await expect(verifyOtp({ email: "test@example.com", code: "123456" })).rejects.toMatchObject({
      code: "OTP_NOT_FOUND",
    });
  });

  test("verifyOtp deletes expired OTP records", async () => {
    findOneMock.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1_000),
    });

    await expect(verifyOtp({ email: "test@example.com", code: "123456" })).rejects.toMatchObject({
      code: "OTP_EXPIRED",
    });
    expect(deleteManyMock).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  test("verifyOtp increments attempts for invalid codes", async () => {
    const otpDoc = {
      code: "123456",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };
    findOneMock.mockResolvedValue(otpDoc);

    await expect(verifyOtp({ email: "test@example.com", code: "654321" })).rejects.toMatchObject({
      code: "INVALID_OTP",
    });
    expect(otpDoc.attempts).toBe(1);
    expect(otpDoc.save).toHaveBeenCalled();
  });

  test("verifyOtp returns pending user and clears the OTP for valid codes", async () => {
    const pendingUser = { id: "user-1", email: "test@example.com" };
    findOneMock.mockResolvedValue({
      code: "123456",
      expiresAt: new Date(Date.now() + 60_000),
      pendingUser,
    });

    await expect(verifyOtp({ email: "test@example.com", code: "123456" })).resolves.toEqual(
      pendingUser
    );
    expect(deleteManyMock).toHaveBeenCalledWith({ email: "test@example.com" });
  });
});
