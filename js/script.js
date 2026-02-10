(function () {
  // Security & Form Management
  const FORM_SUBMISSION_TIMEOUT = 3000; // 3 seconds between submissions
  let lastSubmissionTime = 0;

  // Email config - choose a provider and replace placeholders before deploying
  // provider: 'emailjs' (client-side EmailJS) OR 'formsubmit' (free no-JS-required service)
  const EMAIL_CONFIG = {
    provider: 'formsubmit', // 'formsubmit' is a free option (no account required for basic usage)
    // For FormSubmit: set ownerEmail to the destination address where you want to receive form submissions
    ownerEmail: 'setudigitalsolutions@gmail.com',
    // For EmailJS (optional): set these if you prefer EmailJS
    serviceId: 'service_faje7uh',
    ownerTemplateId: 'YOUR_OWNER_TEMPLATE_ID',
    userTemplateId: 'YOUR_USER_TEMPLATE_ID',
    publicKey: 'pIciPRFqp6XA4seDF'
  };

  // Initialize EmailJS if available and publicKey set
  function initEmailService() {
    if (window.emailjs && typeof emailjs.init === 'function' && EMAIL_CONFIG.publicKey) {
      try {
        emailjs.init(EMAIL_CONFIG.publicKey);
      } catch (err) {
        console.warn('EmailJS init failed', err);
      }
    }
  }

  // Generate CSRF token
  function generateCSRFToken() {
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    sessionStorage.setItem('csrfToken', token);
    return token;
  }

  // Get or create CSRF token
  function getCSRFToken() {
    let token = sessionStorage.getItem('csrfToken');
    if (!token) {
      token = generateCSRFToken();
    }
    const tokenInput = document.getElementById('csrf_token');
    if (tokenInput) {
      tokenInput.value = token;
    }
    return token;
  }

  // Input validation & sanitization
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  function validateFormInput(name, value) {
    if (!value || value.trim() === '') return false;

    // Check length
    if (value.length > 1000) return false;

    // Check for suspicious patterns
    if (name === 'firstname' || name === 'lastname') {
      return /^[a-zA-Z\s'\-]{1,50}$/.test(value.trim());
    }
    if (name === 'email') {
      return validateEmail(value.trim());
    }
    if (name === 'business') {
      return /^[a-zA-Z0-9\s&.,'\-]{1,100}$/.test(value.trim());
    }
    if (name === 'message') {
      return value.split('\n').length <= 50; // Max 50 lines
    }
    return true;
  }

  // Rate limiting check
  function checkRateLimit() {
    const now = Date.now();
    if (now - lastSubmissionTime < FORM_SUBMISSION_TIMEOUT) {
      return false;
    }
    lastSubmissionTime = now;
    return true;
  }

  // Small escape helper for template params
  function safeParam(v) {
    return String(v || '').trim().slice(0, 2000);
  }

  // Send email via configured provider; returns Promise
  async function sendEmailTemplates(params) {
    if (EMAIL_CONFIG.provider === 'emailjs') {
      if (!window.emailjs) throw new Error('EmailJS not available');
      // Owner notification
      const ownerParams = Object.assign({}, params, { to_role: 'owner' });
      await emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.ownerTemplateId, ownerParams);
      // User confirmation (if template provided)
      if (EMAIL_CONFIG.userTemplateId) {
        const userParams = Object.assign({}, params, { to_role: 'user' });
        await emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.userTemplateId, userParams);
      }
      return;
    }

    if (EMAIL_CONFIG.provider === 'formsubmit') {
      // Using FormSubmit.co — free lightweight form-to-email service.
      // It accepts a POST to https://formsubmit.co/{ownerEmail} with form fields.
      if (!EMAIL_CONFIG.ownerEmail || EMAIL_CONFIG.ownerEmail.indexOf('@') === -1) {
        throw new Error('Owner email not configured for FormSubmit');
      }

      const endpoint = 'https://formsubmit.co/' + encodeURIComponent(EMAIL_CONFIG.ownerEmail);
      const payload = {
        name: (params.firstname && params.lastname) ? params.firstname + ' ' + params.lastname : (params.firstname || ''),
        email: params.email || '',
        business: params.business || '',
        message: params.message || '',
        _subject: 'Website inquiry from ' + (params.firstname || params.email || 'website'),
        _captcha: 'false'
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error('FormSubmit failed: ' + res.status + ' ' + text);
      }

      // Optionally: send a confirmation to the user using FormSubmit by posting to their email address
      // (uncomment if you want to attempt sending a copy to the user — some providers block arbitrary sends)
      // if (params.email) {
      //   await fetch('https://formsubmit.co/' + encodeURIComponent(params.email), {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ message: 'Thanks for contacting us. We received your message.', _subject: 'Thanks from Setu Digital' })
      //   });
      // }

      return;
    }

    throw new Error('Unsupported email provider');
  }

  // Nav toggle
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  btn &&
    btn.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

  // Close menu when clicking on a link
  const navLinks = document.querySelectorAll('.primary-nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize CSRF tokens on page load
  document.addEventListener('DOMContentLoaded', function () {
    initEmailService();
    getCSRFToken();
  });

  // Smooth scroll for anchor links
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Enhanced contact form handler with security and email sending
  window.handleContact = async function (e) {
    e.preventDefault();
    const form = e.target;

    // Check honeypot field (spam trap)
    const honeypot = form.querySelector('input[name="honeypot"]');
    if (honeypot && honeypot.value !== '') {
      console.warn('Spam attempt detected');
      return;
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      form.classList.add('error');
      alert('Please wait before submitting again.');
      setTimeout(() => form.classList.remove('error'), 2000);
      return;
    }

    // Validate all inputs
    const fields = {
      firstname: form.querySelector('input[name="firstname"]'),
      lastname: form.querySelector('input[name="lastname"]'),
      email: form.querySelector('input[name="email"]'),
      business: form.querySelector('input[name="business"]'),
      message: form.querySelector('textarea[name="message"]')
    };

    let isValid = true;
    for (const [name, field] of Object.entries(fields)) {
      if (!field) continue;

      const value = field.value;
      if (!validateFormInput(name, value)) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    }

    if (!isValid) {
      alert('Please check your input and try again.');
      return;
    }

    // CSRF check: ensure the form token matches session token
    const submittedToken = form.querySelector('#csrf_token') ? form.querySelector('#csrf_token').value : null;
    if (!submittedToken || submittedToken !== sessionStorage.getItem('csrfToken')) {
      alert('Security validation failed. Please reload the page and try again.');
      return;
    }

    // Sanitize inputs and prepare template params
    const firstname = sanitizeInput(fields.firstname.value.trim());
    const lastname = sanitizeInput(fields.lastname.value.trim());
    const email = sanitizeInput(fields.email.value.trim());
    const business = sanitizeInput((fields.business && fields.business.value) ? fields.business.value.trim() : '');
    const message = sanitizeInput(fields.message.value.trim());

    const templateParams = {
      firstname: safeParam(firstname),
      lastname: safeParam(lastname),
      email: safeParam(email),
      business: safeParam(business),
      message: safeParam(message),
      csrf_token: safeParam(submittedToken)
    };

    // Attempt to send emails via EmailJS (client-side). If not configured, inform user.
    try {
      if (!window.emailjs || !EMAIL_CONFIG.publicKey || EMAIL_CONFIG.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
        // EmailJS not configured — fallback: just acknowledge submission
        alert('Thanks ' + firstname + '! We received your inquiry and will get back to you within 24 hours. (Email delivery not configured)');
        form.reset();
        getCSRFToken();
        return;
      }

      // Send owner + user templates
      await sendEmailTemplates(templateParams);

      alert('Thanks ' + firstname + '! Your message was sent — we will respond within 24 hours.');
      form.reset();
      getCSRFToken();
    } catch (err) {
      console.error('Email send error', err);
      alert('There was an issue sending your message. Please try again later or email us directly.');
    }
  };

  // Contact page form handler (same as home)
  window.handleContactPage = window.handleContact;
})();
