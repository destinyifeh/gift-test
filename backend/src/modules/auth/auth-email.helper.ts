import { Injectable } from '@nestjs/common';

export type SendEmailFn = (params: { to: string; userName: string; resetUrl: string }) => Promise<any>;
export type SendVerifyFn = (params: { to: string; userName: string; verificationUrl: string }) => Promise<any>;
export type SendOTPFn = (params: { to: string; userName: string; otp: string }) => Promise<any>;

@Injectable()
export class AuthEmailHelper {
  private static sendResetEmailFn: SendEmailFn;
  private static sendVerifyEmailFn: SendVerifyFn;
  private static sendOTPEmailFn: SendOTPFn;

  static registerReset(fn: SendEmailFn) {
    this.sendResetEmailFn = fn;
  }

  static registerVerify(fn: SendVerifyFn) {
    this.sendVerifyEmailFn = fn;
  }

  static registerOTP(fn: SendOTPFn) {
    this.sendOTPEmailFn = fn;
  }

  static async sendResetEmail(params: { to: string; userName: string; resetUrl: string }) {
    if (this.sendResetEmailFn) {
      return this.sendResetEmailFn(params);
    }
    console.warn('AuthEmailHelper: No reset email function registered!');
  }

  static async sendVerifyEmail(params: { to: string; userName: string; verificationUrl: string }) {
    if (this.sendVerifyEmailFn) {
      return this.sendVerifyEmailFn(params);
    }
    console.warn('AuthEmailHelper: No verification email function registered!');
  }

  static async sendOTP(params: { to: string; userName: string; otp: string }) {
    if (this.sendOTPEmailFn) {
      return this.sendOTPEmailFn(params);
    }
    console.warn('AuthEmailHelper: No OTP email function registered!');
  }
}
