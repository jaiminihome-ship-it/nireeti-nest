import nodemailer from 'nodemailer';

// Email configuration - supports both SMTP_* and EMAIL_* env variables
const emailConfig = {
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '',
  },
};

// Create transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  
  // If no email credentials, return null (will use console logging)
  if (!user || !pass) {
    console.log('Email: No credentials found, using demo mode');
    return null;
  }
  
  console.log('Email: Creating transporter for', user);
  return nodemailer.createTransport(emailConfig);
};

// Email templates
const getEmailTemplate = (type: 'otp' | 'welcome' | 'reset-password' | 'order-confirm' | 'contact-notification' | 'contact-auto-reply', data: Record<string, string>) => {
  const siteName = 'The Nireeti Nest';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nireeti-nest.vercel.app';
  
  switch (type) {
    case 'otp':
    case 'reset-password':
      return {
        subject: `Your OTP Code - ${siteName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f5f0; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; padding: 15px 25px; background: linear-gradient(135deg, #b45309 0%, #92400e 100%); border-radius: 12px;">
                  <span style="color: white; font-size: 24px; font-weight: bold;">${siteName}</span>
                </div>
              </div>
              
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Verification Code</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  Hello ${data.name || 'there'},<br>
                  Please use the following code:
                </p>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 42px; font-weight: bold; color: #92400e; letter-spacing: 8px;">${data.otp}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  This code will expire in <strong>10 minutes</strong>.<br>
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Your verification code is: ${data.otp}. This code will expire in 10 minutes. - ${siteName}`,
      };
      
    case 'welcome':
      return {
        subject: `Welcome to ${siteName}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f5f0; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
              <h1 style="color: #b45309;">Welcome to ${siteName}!</h1>
              <p style="color: #6b7280;">Hello ${data.name || 'there'},</p>
              <p style="color: #6b7280;">Thank you for creating an account with us!</p>
              <a href="${siteUrl}/shop" style="display: inline-block; margin-top: 20px; padding: 15px 40px; background: #b45309; color: white; text-decoration: none; border-radius: 8px;">Start Shopping</a>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to ${siteName}! Thank you for creating an account.`,
      };

    case 'order-confirm':
      return {
        subject: `Order Confirmation - ${siteName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f5f0; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
              <h1 style="color: #b45309;">Order Confirmed!</h1>
              <p style="color: #6b7280;">Hello ${data.name || 'there'},</p>
              <p style="color: #6b7280;">Your order number is: <strong>${data.orderNumber}</strong></p>
              <p style="color: #6b7280;">Total: <strong>₹${data.total}</strong></p>
            </div>
          </body>
          </html>
        `,
        text: `Order Confirmed! Your order number is: ${data.orderNumber}. Total: ₹${data.total}`,
      };

    case 'contact-notification':
      return {
        subject: `New Contact Form - ${siteName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f5f0; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong> ${data.message}</p>
            </div>
          </body>
          </html>
        `,
        text: `New Contact Form\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nSubject: ${data.subject}\nMessage: ${data.message}`,
      };

    case 'contact-auto-reply':
      return {
        subject: `Thank you for contacting ${siteName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', sans-serif; background-color: #f9f5f0; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
              <h2 style="color: #b45309;">Thank You!</h2>
              <p style="color: #6b7280;">Hello ${data.name || 'there'},</p>
              <p style="color: #6b7280;">We have received your message and will get back to you within 24-48 hours.</p>
            </div>
          </body>
          </html>
        `,
        text: `Thank you for contacting ${siteName}! We will get back to you within 24-48 hours.`,
      };
      
    default:
      return {
        subject: `Message from ${siteName}`,
        html: `<p>${data.message || ''}</p>`,
        text: data.message || '',
      };
  }
};

// Send email function
export async function sendEmail(
  to: string,
  type: 'otp' | 'welcome' | 'reset-password' | 'order-confirm' | 'contact-notification' | 'contact-auto-reply',
  data: Record<string, string>
): Promise<{ success: boolean; message: string; demoOtp?: string }> {
  try {
    const transporter = createTransporter();
    const template = getEmailTemplate(type, data);
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'support@thenireetinest.com';
    const from = `The Nireeti Nest <${fromEmail}>`;
    
    // If no transporter (no email credentials), log and return demo mode
    if (!transporter) {
      console.log('\n========================================');
      console.log('📧 EMAIL (DEVELOPMENT MODE - NO SMTP)');
      console.log('========================================');
      console.log(`To: ${to}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Type: ${type}`);
      if (data.otp) {
        console.log(`OTP Code: ${data.otp}`);
      }
      console.log('========================================\n');
      
      return {
        success: true,
        message: 'Email logged to console (development mode)',
        demoOtp: data.otp, // Return OTP for demo purposes
      };
    }
    
    // Send actual email
    const info = await transporter.sendMail({
      from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
    
    // Fallback to demo mode on error - STILL RETURN OTP!
    return {
      success: true,
      message: 'Email service unavailable - showing OTP on screen',
      demoOtp: data.otp, // IMPORTANT: Always return OTP so user can login
    };
  }
}

// Generate OTP
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
