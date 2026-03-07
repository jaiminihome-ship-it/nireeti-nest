/**
 * SMS Service - Unified SMS sending for India (MSG91) and Global (Twilio)
 * 
 * Setup Instructions:
 * 
 * FOR INDIA (MSG91):
 * 1. Go to https://msg91.com and create account
 * 2. Get your Auth Key from Dashboard
 * 3. Register DLT Template ID (required for India)
 * 4. Add environment variables:
 *    - MSG91_AUTH_KEY=your_auth_key
 *    - MSG91_SENDER_ID=NIREET (max 6 chars)
 *    - MSG91_OTP_TEMPLATE_ID=your_dlt_template_id
 *    - MSG91_ORDER_TEMPLATE_ID=your_order_template_id
 * 
 * FOR GLOBAL (Twilio):
 * 1. Go to https://twilio.com and create account
 * 2. Get Account SID and Auth Token from Dashboard
 * 3. Buy a Twilio phone number
 * 4. Add environment variables:
 *    - TWILIO_ACCOUNT_SID=your_account_sid
 *    - TWILIO_AUTH_TOKEN=your_auth_token
 *    - TWILIO_PHONE_NUMBER=+1234567890
 */

// SMS Configuration
interface SMSConfig {
  enabled: boolean;
  provider: 'msg91' | 'twilio' | null;
}

// Check if phone is Indian number (+91 or starts with 91)
function isIndianNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return cleanPhone.startsWith('+91') || cleanPhone.startsWith('91') || 
         (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone));
}

// Format phone number to international format
function formatPhoneNumber(phone: string, forIndia: boolean = false): string {
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (forIndia) {
    // For MSG91: Remove +91 or 91 prefix, keep only 10 digits
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2);
    }
    return cleanPhone;
  } else {
    // For Twilio: Ensure + prefix
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        // Assume Indian number if 10 digits without prefix
        cleanPhone = '+91' + cleanPhone;
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }
    return cleanPhone;
  }
}

// Get SMS configuration status
export function getSMSConfig(): SMSConfig {
  const msg91Key = process.env.MSG91_AUTH_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (msg91Key) {
    return { enabled: true, provider: 'msg91' };
  }
  
  if (twilioSid && twilioToken) {
    return { enabled: true, provider: 'twilio' };
  }
  
  return { enabled: false, provider: null };
}

// MSG91 SMS sending (for India)
async function sendMSG91SMS(phone: string, message: string, templateId?: string): Promise<{ success: boolean; message: string }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'NIREET';
  
  if (!authKey) {
    console.log('MSG91 Auth Key not configured');
    return { success: false, message: 'MSG91 not configured' };
  }
  
  const formattedPhone = formatPhoneNumber(phone, true);
  
  try {
    const url = 'https://api.msg91.com/api/v2/sendsms';
    
    const body: Record<string, unknown> = {
      sender: senderId,
      route: '4', // Transactional route
      country: '91',
      sms: [{
        message: message,
        to: [formattedPhone]
      }]
    };
    
    // Add DLT template ID if provided (required for India)
    if (templateId) {
      body['DLT_TE_ID'] = templateId;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (result.type === 'success' || result.type === 'error' && result.message === 'SMS sent successfully') {
      console.log('MSG91 SMS sent successfully to:', formattedPhone);
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('MSG91 error:', result);
      return { success: false, message: result.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('MSG91 error:', error);
    return { success: false, message: 'Failed to send SMS via MSG91' };
  }
}

// MSG91 OTP SMS (uses flow API for OTP)
async function sendMSG91OTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  
  if (!authKey) {
    console.log('MSG91 Auth Key not configured');
    return { success: false, message: 'MSG91 not configured' };
  }
  
  const formattedPhone = formatPhoneNumber(phone, true);
  
  try {
    // If DLT template ID is available, use template-based OTP
    if (templateId) {
      // Use MSG91 OTP API with DLT template
      const url = `https://api.msg91.com/api/v5/otp?authkey=${authKey}&mobile=91${formattedPhone}&template_id=${templateId}&OTP=${otp}`;
      
      const response = await fetch(url, {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (result.type === 'success') {
        console.log('MSG91 OTP sent successfully to:', formattedPhone);
        return { success: true, message: 'OTP sent successfully' };
      } else {
        console.error('MSG91 OTP error:', result);
        // Fallback to regular SMS
        const message = `Your OTP for The Nireeti Nest is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
        return sendMSG91SMS(phone, message, templateId);
      }
    } else {
      // Without DLT template, send regular SMS
      const message = `Your OTP for The Nireeti Nest is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
      return sendMSG91SMS(phone, message);
    }
  } catch (error) {
    console.error('MSG91 OTP error:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

// Twilio SMS sending (for Global)
async function sendTwilioSMS(phone: string, message: string): Promise<{ success: boolean; message: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  
  if (!accountSid || !authToken || !twilioPhone) {
    console.log('Twilio not configured');
    return { success: false, message: 'Twilio not configured' };
  }
  
  const formattedPhone = formatPhoneNumber(phone);
  
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('From', twilioPhone);
    formData.append('To', formattedPhone);
    formData.append('Body', message);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.status === 'queued' || result.status === 'sent') {
      console.log('Twilio SMS sent successfully to:', formattedPhone);
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('Twilio error:', result);
      return { success: false, message: result.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, message: 'Failed to send SMS via Twilio' };
  }
}

// Twilio Verify API for OTP (better for international OTP)
async function sendTwilioVerifyOTP(phone: string): Promise<{ success: boolean; message: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  if (!accountSid || !authToken) {
    console.log('Twilio not configured');
    return { success: false, message: 'Twilio not configured' };
  }
  
  const formattedPhone = formatPhoneNumber(phone);
  
  try {
    // If Verify Service SID is available, use Twilio Verify
    if (verifyServiceSid) {
      const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
      
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      const formData = new URLSearchParams();
      formData.append('To', formattedPhone);
      formData.append('Channel', 'sms');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.status === 'pending') {
        console.log('Twilio Verify OTP sent to:', formattedPhone);
        return { success: true, message: 'OTP sent via Twilio Verify' };
      } else {
        console.error('Twilio Verify error:', result);
        return { success: false, message: result.message || 'Failed to send OTP' };
      }
    } else {
      // Fallback to regular SMS with OTP
      const otp = generateOTP();
      const message = `Your The Nireeti Nest verification code is: ${otp}. Valid for 10 minutes.`;
      const result = await sendTwilioSMS(phone, message);
      
      if (result.success) {
        // Store OTP somewhere for verification (you'll need to implement this)
        return { success: true, message: 'OTP sent', otp };
      }
      return result;
    }
  } catch (error) {
    console.error('Twilio Verify error:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Main SMS sending function - auto-detects India vs Global
export async function sendSMS(
  phone: string,
  type: 'otp' | 'order-confirmation' | 'order-shipped' | 'delivery-update',
  data: { otp?: string; orderNumber?: string; total?: string; trackingUrl?: string }
): Promise<{ success: boolean; message: string; otp?: string; demoOtp?: string }> {
  const isIndia = isIndianNumber(phone);
  const config = getSMSConfig();
  
  // Development/Demo mode - return OTP on screen
  if (!config.enabled) {
    const otp = data.otp || generateOTP();
    console.log('\n========================================');
    console.log('📱 SMS (DEVELOPMENT MODE)');
    console.log('========================================');
    console.log(`To: ${phone} (${isIndia ? 'India' : 'Global'})`);
    console.log(`Type: ${type}`);
    
    if (type === 'otp') {
      console.log(`OTP Code: ${otp}`);
    } else if (type === 'order-confirmation') {
      console.log(`Order: ${data.orderNumber}`);
      console.log(`Total: ₹${data.total}`);
    }
    console.log('========================================\n');
    
    return {
      success: true,
      message: 'SMS logged to console (development mode - configure MSG91/Twilio)',
      demoOtp: type === 'otp' ? otp : undefined
    };
  }
  
  // Send via appropriate provider
  if (isIndia && config.provider === 'msg91') {
    // Use MSG91 for India
    if (type === 'otp') {
      const otp = data.otp || generateOTP();
      const result = await sendMSG91OTP(phone, otp);
      return { ...result, otp };
    } else if (type === 'order-confirmation') {
      const message = `Order Confirmed! Your order #${data.orderNumber} of ₹${data.total} has been placed. Track at The Nireeti Nest. Thank you!`;
      const result = await sendMSG91SMS(phone, message, process.env.MSG91_ORDER_TEMPLATE_ID);
      return result;
    } else if (type === 'order-shipped') {
      const message = `Your order #${data.orderNumber} has been shipped! Track: ${data.trackingUrl || 'Check your email'}`;
      return sendMSG91SMS(phone, message);
    } else if (type === 'delivery-update') {
      const message = `Delivery Update: Your order #${data.orderNumber} is out for delivery today!`;
      return sendMSG91SMS(phone, message);
    }
  } else {
    // Use Twilio for Global (or as fallback)
    if (type === 'otp') {
      const otp = data.otp || generateOTP();
      const message = `Your The Nireeti Nest verification code is: ${otp}. Valid for 10 minutes.`;
      const result = await sendTwilioSMS(phone, message);
      return { ...result, otp };
    } else if (type === 'order-confirmation') {
      const message = `Order Confirmed! Order #${data.orderNumber} of ₹${data.total}. Thank you for shopping at The Nireeti Nest!`;
      return sendTwilioSMS(phone, message);
    } else if (type === 'order-shipped') {
      const message = `Your order #${data.orderNumber} has been shipped! Track: ${data.trackingUrl || 'Check email'}`;
      return sendTwilioSMS(phone, message);
    } else if (type === 'delivery-update') {
      const message = `Delivery Update: Order #${data.orderNumber} is out for delivery today!`;
      return sendTwilioSMS(phone, message);
    }
  }
  
  return { success: false, message: 'Invalid SMS type' };
}

// Verify OTP from Twilio Verify (for global numbers)
export async function verifyTwilioOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  if (!accountSid || !authToken || !verifyServiceSid) {
    return { success: false, message: 'Twilio Verify not configured' };
  }
  
  const formattedPhone = formatPhoneNumber(phone);
  
  try {
    const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
    
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('Code', otp);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.status === 'approved') {
      return { success: true, message: 'OTP verified successfully' };
    } else {
      return { success: false, message: 'Invalid OTP' };
    }
  } catch (error) {
    console.error('Twilio Verify check error:', error);
    return { success: false, message: 'Failed to verify OTP' };
  }
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian: 10 digits starting with 6-9, or with +91/91 prefix
  const indianRegex = /^(\+91|91)?[6-9]\d{9}$/;
  
  // International: + followed by 7-15 digits
  const intlRegex = /^\+[1-9]\d{6,14}$/;
  
  return indianRegex.test(cleanPhone) || intlRegex.test(cleanPhone);
}

// Format phone for display
export function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  
  // Indian number formatting
  if (clean.length === 10 && /^[6-9]/.test(clean)) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  
  // With country code
  if (clean.startsWith('+91') && clean.length === 13) {
    const num = clean.slice(3);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  
  return phone;
}
