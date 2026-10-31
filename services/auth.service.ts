import { api } from "@/lib/api/client"
import {
  ConfirmEmailDto,
  ForgotPasswordDto,
  IUser,
  LoginConfirmDto,
  LoginDto,
  LoginResponseData,
  ResetPasswordDto,
  SignupDto,
  VerifyOtpDto,
} from "@/lib/types"

export const authService = {
  login: (data: LoginDto) =>
    api<LoginResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginConfirm: (data: LoginConfirmDto) =>
    api<LoginResponseData>("/auth/login-confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signup: (data: SignupDto) =>
    api<IUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signupWithGoogle: (idToken: string) =>
    api<LoginResponseData>("/auth/signup/gmail", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  confirmEmail: (data: ConfirmEmailDto) =>
    api<void>("/auth/confirm-email", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  resendConfirmEmail: (email: string) =>
    api<void>("/auth/resend-confirm-email", {
      method: "PATCH",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (data: ForgotPasswordDto) =>
    api<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: VerifyOtpDto) =>
    api<{ resetToken: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyMagicLink: (token: string) =>
    api<{ resetToken: string }>("/auth/verify-link", {
      method: "GET",
      params: { token },
    }),

  resetPassword: (data: ResetPasswordDto) =>
    api<{ user: Partial<IUser> }>("/auth/reset-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  request2fa: () =>
    api<void>("/auth/request-2fa", {
      method: "PATCH",
    }),

  enable2fa: (otp: string) =>
    api<void>("/auth/enable-2fa", {
      method: "PATCH",
      body: JSON.stringify({ otp }),
    }),

  disable2fa: (otp: string) =>
    api<void>("/auth/disable-2fa", {
      method: "PATCH",
      body: JSON.stringify({ otp }),
    }),

  logout: (flag: "current" | "all" = "current") =>
    api<void>("/user/logout", {
      method: "POST",
      body: JSON.stringify({ flag }),
    }),
}
