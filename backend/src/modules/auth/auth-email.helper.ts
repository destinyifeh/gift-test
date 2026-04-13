import { Injectable } from '@nestjs/common';

export type SendEmailFn = (params: { to: string; userName: string; resetUrl: string }) => Promise<any>;
export type SendVerifyFn = (params: { to: string; userName: string; verificationUrl: string }) => Promise<any>;

@Injectable()
export class AuthEmailHelper {
  private static sendResetEmailFn: SendEmailFn;
  private static sendVerifyEmailFn: SendVerifyFn;

  static registerReset(fn: SendEmailFn) {
    this.sendResetEmailFn = fn;
  }

  static registerVerify(fn: SendVerifyFn) {
    this.sendVerifyEmailFn = fn;
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
}
