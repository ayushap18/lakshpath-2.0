import nodemailer from 'nodemailer';
import env from '@config/env';
import { AppError } from '@middleware/errorHandler';

// Email configuration - lazy initialization to prevent startup failures
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  try {
    // For development: use ethereal (fake SMTP) or console logging
    if (env.NODE_ENV !== 'production' || !env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: env.SMTP_USER || 'test@ethereal.email',
          pass: env.SMTP_PASS || 'test123',
        },
      });
    } else {
      // For production: use real SMTP
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587'),
        secure: env.SMTP_SECURE === 'true',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const emailService = {
  async sendEmail(options: EmailOptions) {
    try {
      const transporter = getTransporter();
      
      if (!transporter) {
        console.warn('Email transporter not available - email not sent');
        return { success: false, messageId: null };
      }
      
      const info = await transporter.sendMail({
        from: `"LakshPath" <${env.SMTP_FROM || 'noreply@lakshpath.ai'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log('Email sent:', info.messageId);
      
      // For development with ethereal, show preview URL
      if (env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email', 500, error);
    }
  },

  async sendWelcomeEmail(userName: string, userEmail: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to LakshPath!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We're thrilled to have you join LakshPath - your personal AI-powered career guidance platform!</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>📝 Complete your career assessment</li>
              <li>🎯 Discover personalized career matches</li>
              <li>📚 Get a custom learning roadmap</li>
              <li>💼 Compare job opportunities</li>
              <li>📈 Track your progress and growth</li>
            </ul>
            <p>Ready to start your journey?</p>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email - we're here to help!</p>
            <p>© 2025 LakshPath. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to LakshPath, ${userName}!
      
      We're thrilled to have you join us. LakshPath is your personal AI-powered career guidance platform.
      
      Here's what you can do:
      - Complete your career assessment
      - Discover personalized career matches
      - Get a custom learning roadmap
      - Compare job opportunities
      - Track your progress and growth
      
      Get started: ${env.FRONTEND_URL || 'http://localhost:3000'}
      
      Questions? Reply to this email - we're here to help!
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🎉 Welcome to LakshPath - Your Career Journey Starts Now!',
      text,
      html,
    });
  },

  async sendLoginAlert(userName: string, userEmail: string, loginInfo: { method: string; ipAddress?: string; timestamp: Date }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
          .warning { color: #ff9800; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 New Login to Your LakshPath Account</h2>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We detected a new login to your LakshPath account:</p>
            <div class="info-box">
              <p><strong>Login Method:</strong> ${loginInfo.method}</p>
              <p><strong>Time:</strong> ${loginInfo.timestamp.toLocaleString()}</p>
              ${loginInfo.ipAddress ? `<p><strong>IP Address:</strong> ${loginInfo.ipAddress}</p>` : ''}
            </div>
            <p>If this was you, you can safely ignore this email.</p>
            <p class="warning">⚠️ If you didn't log in, please secure your account immediately and contact us.</p>
          </div>
          <div class="footer">
            <p>This is an automated security alert from LakshPath.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Login to Your LakshPath Account
      
      Hi ${userName},
      
      We detected a new login to your LakshPath account:
      - Login Method: ${loginInfo.method}
      - Time: ${loginInfo.timestamp.toLocaleString()}
      ${loginInfo.ipAddress ? `- IP Address: ${loginInfo.ipAddress}` : ''}
      
      If this was you, you can safely ignore this email.
      If you didn't log in, please secure your account immediately.
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🔐 New Login Alert - LakshPath',
      text,
      html,
    });
  },

  async sendPasswordResetEmail(userName: string, userEmail: string, resetUrl: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔑 Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your LakshPath password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">This link expires in 15 minutes. If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 LakshPath. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request

      Hi ${userName},

      We received a request to reset your LakshPath password.
      Click here to reset: ${resetUrl}

      This link expires in 15 minutes.
      If you didn't request this, please ignore this email.
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🔑 Reset Your LakshPath Password',
      text,
      html,
    });
  },

  async sendProgressUpdate(userName: string, userEmail: string, milestone: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .milestone { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #4CAF50; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Congratulations, ${userName}!</h1>
          </div>
          <div class="content">
            <p>You've reached a new milestone in your learning journey!</p>
            <div class="milestone">
              <h3>✅ ${milestone}</h3>
              <p>Keep up the amazing work! Every step forward is progress.</p>
            </div>
            <p>Continue your momentum and tackle the next challenge:</p>
            <a href="${env.FRONTEND_URL || 'http://localhost:3000'}" class="button">View Your Dashboard</a>
          </div>
          <div class="footer">
            <p>You're doing great! Keep learning and growing.</p>
            <p>© 2025 LakshPath</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `🎊 Milestone Achieved: ${milestone}`,
      html,
    });
  },
};
