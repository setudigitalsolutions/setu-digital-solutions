/**
 * Configuration file for email and form settings
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file and rename it to config.js (without .example)
 * 2. Fill in your actual values below
 * 3. The config.js file is ignored by git (see .gitignore) — never commit secrets
 * 
 * For FormSubmit: Only EMAIL_PROVIDER and FORM_SUBMIT_EMAIL are needed
 * For EmailJS: Fill in all EMAILJS_* fields and set EMAIL_PROVIDER to 'emailjs'
 */

const CONFIG = {
  // Choose provider: 'formsubmit' or 'emailjs'
  EMAIL_PROVIDER: 'formsubmit',

  // FormSubmit Configuration (for 'formsubmit' provider)
  // Set to your email address where you want to receive form submissions
  FORM_SUBMIT_EMAIL: 'your-email@gmail.com',

  // EmailJS Configuration (for 'emailjs' provider)
  // Get these from https://dashboard.emailjs.com
  EMAILJS_SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID',
  EMAILJS_OWNER_TEMPLATE_ID: 'YOUR_OWNER_TEMPLATE_ID',
  EMAILJS_USER_TEMPLATE_ID: 'YOUR_USER_TEMPLATE_ID',
  EMAILJS_PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
