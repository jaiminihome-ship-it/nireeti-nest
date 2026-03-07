import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// Create transporter
const createTransporter = () => {
  // If no email credentials, return null (will use console logging)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  
  return nodemailer.createTransport(emailConfig);
};

// Email templates
const getEmailTemplate = (type: 'otp' | 'welcome' | 'reset-password' | 'order-confirm' | 'contact-notification' | 'contact-auto-reply', data: Record<string, string>) => {
  const siteName = 'The Nireeti Nest';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  switch (type) {
    case 'otp':
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
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; padding: 15px 25px; background: linear-gradient(135deg, #b45309 0%, #92400e 100%); border-radius: 12px;">
                  <span style="color: white; font-size: 24px; font-weight: bold;">${siteName}</span>
                </div>
              </div>
              
              <!-- Content Card -->
              <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Verification Code</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  Hello ${data.name || 'there'},<br>
                  Please use the following code to verify your email address:
                </p>
                
                <!-- OTP Code -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 42px; font-weight: bold; color: #92400e; letter-spacing: 8px;">${data.otp}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  This code will expire in <strong>10 minutes</strong>.<br>
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="${siteUrl}" style="color: #b45309; text-decoration: none;">Visit our store</a>
                </p>
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
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Welcome Aboard!</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  Hello ${data.name || 'there'},<br><br>
                  Thank you for creating an account with us! We're excited to have you as part of the ${siteName} family.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${siteUrl}/shop" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #b45309 0%, #92400e 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Start Shopping
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Discover our curated collection of premium home decor items.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to ${siteName}! Thank you for creating an account. Start shopping at ${siteUrl}/shop`,
      };
      
    case 'reset-password':
      return {
        subject: `Reset Your Password - ${siteName}`,
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
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Reset Your Password</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  Hello ${data.name || 'there'},<br>
                  We received a request to reset your password. Use the code below to proceed:
                </p>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 42px; font-weight: bold; color: #92400e; letter-spacing: 8px;">${data.otp}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  This code will expire in <strong>10 minutes</strong>.<br>
                  If you didn't request this, please ignore this email.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Your password reset code is: ${data.otp}. This code will expire in 10 minutes. - ${siteName}`,
      };
      
    case 'order-confirm':
      return {
        subject: `Order Confirmation - ${siteName}`,
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
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Order Confirmed!</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 30px;">
                  Hello ${data.name || 'there'},<br>
                  Thank you for your order! Your order number is:
                </p>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 24px; font-weight: bold; color: #92400e;">${data.orderNumber}</span>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  We'll send you another email when your order ships.<br>
                  Total: <strong>₹${data.total}</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Order Confirmed! Your order number is: ${data.orderNumber}. Total: ₹${data.total}. Thank you for shopping with ${siteName}!`,
      };
      
    case 'contact-notification':
      // Email sent to admin when someone contacts
      return {
        subject: `📬 New Contact Form Submission - ${siteName}`,
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
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">New Contact Form Submission</h1>
                
                <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                  <p style="margin: 0 0 12px; color: #374151;"><strong>👤 Name:</strong> ${data.name}</p>
                  <p style="margin: 0 0 12px; color: #374151;"><strong>📧 Email:</strong> <a href="mailto:${data.email}" style="color: #b45309;">${data.email}</a></p>
                  <p style="margin: 0 0 12px; color: #374151;"><strong>📱 Phone:</strong> ${data.phone || 'Not provided'}</p>
                  <p style="margin: 0 0 12px; color: #374151;"><strong>📋 Subject:</strong> ${data.subject}</p>
                </div>
                
                <div style="background: #fef3c7; border-radius: 12px; padding: 24px;">
                  <p style="margin: 0 0 8px; color: #92400e; font-weight: bold;">💬 Message:</p>
                  <p style="margin: 0; color: #374151; white-space: pre-wrap;">${data.message}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 24px;">
                  📅 Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nSubject: ${data.subject}\n\nMessage:\n${data.message}\n\nReceived on: ${new Date().toLocaleString()}`,
      };
      
    case 'contact-auto-reply':
      // Auto-reply to the person who contacted
      return {
        subject: `Thank you for contacting ${siteName}`,
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
                <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; text-align: center;">Thank You for Reaching Out!</h1>
                <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 20px;">
                  Hello ${data.name || 'there'},<br><br>
                  We have received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you within 24-48 hours.
                </p>
                
                <div style="background: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <p style="margin: 0 0 8px; color: #92400e; font-weight: bold;">Your Message Summary:</p>
                  <p style="margin: 0; color: #374151;"><strong>Subject:</strong> ${data.subject}</p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  In the meantime, feel free to browse our collection of premium home decor items!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${siteUrl}/shop" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #b45309 0%, #92400e 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Visit Our Store
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
                <p style="margin-top: 10px;">
                  <a href="${siteUrl}/contact" style="color: #b45309; text-decoration: none;">Contact us again</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Thank you for contacting ${siteName}!\n\nHello ${data.name || 'there'},\n\nWe have received your message and will get back to you within 24-48 hours.\n\nYour Subject: ${data.subject}\n\nVisit our store: ${siteUrl}/shop\n\n© ${new Date().getFullYear()} ${siteName}`,
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
    const from = process.env.EMAIL_FROM || 'The Nireeti Nest <support@thenireetinest.com>';
    
    // If no transporter (no email credentials), log and return demo mode
    if (!transporter) {
      console.log('\n========================================');
      console.log('📧 EMAIL (DEVELOPMENT MODE)');
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
    
    console.log('Email sent:', info.messageId);
    
    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Email error:', error);
    
    // Fallback to demo mode on error
    return {
      success: true,
      message: 'Email service unavailable - showing OTP on screen',
      demoOtp: data.otp,
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
