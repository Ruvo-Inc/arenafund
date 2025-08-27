interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
}

// Common email domains for typo detection
const commonDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'mail.com', 'yandex.com'
];

// Disposable email domains (basic list)
const disposableDomains = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc'
];

// RFC 5322 compliant email regex with enhanced validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Enhanced validation patterns
const SUSPICIOUS_PATTERNS = [
  /[<>]/,                    // HTML tags
  /javascript:/i,            // JavaScript protocol
  /data:/i,                  // Data protocol
  /vbscript:/i,             // VBScript protocol
  /on\w+\s*=/i,             // Event handlers
  /\x00-\x1f/,              // Control characters
  /[\u200B-\u200D\uFEFF]/,  // Zero-width characters
];

// Common SQL injection patterns (excluding single quotes which are valid in names)
const SQL_INJECTION_PATTERNS = [
  /(;|\\;)|(--)/i,
  /\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/i,
  /(script|javascript|vbscript|onload|onerror|onclick)/i,
];

// Name validation patterns
const NAME_PATTERNS = {
  // Allow letters, spaces, hyphens, apostrophes, and dots
  VALID_NAME: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/,
  // Detect suspicious patterns in names
  SUSPICIOUS_NAME: /[0-9@#$%^&*()_+={}[\]|\\:";?/<>~`]/,
  // Detect repeated characters (potential spam)
  REPEATED_CHARS: /(.)\1{4,}/,
};

function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function suggestDomainCorrections(domain: string): string[] {
  const suggestions: string[] = [];
  
  for (const commonDomain of commonDomains) {
    const distance = calculateLevenshteinDistance(domain.toLowerCase(), commonDomain);
    // Suggest if distance is 1-2 characters (likely typo)
    if (distance <= 2 && distance > 0) {
      suggestions.push(commonDomain);
    }
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  // Input sanitization - remove dangerous characters
  const sanitizedEmail = sanitizeInput(email);
  
  // Check for suspicious patterns
  if (containsSuspiciousPatterns(sanitizedEmail)) {
    return {
      isValid: false,
      reason: 'Email contains invalid characters'
    };
  }
  
  // Basic format validation
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return {
      isValid: false,
      reason: 'Invalid email format'
    };
  }
  
  const [localPart, domain] = sanitizedEmail.toLowerCase().split('@');
  
  // Enhanced validation checks
  if (localPart.length === 0 || domain.length === 0) {
    return {
      isValid: false,
      reason: 'Email cannot be empty'
    };
  }
  
  // Check local part length (RFC 5321 limit)
  if (localPart.length > 64) {
    return {
      isValid: false,
      reason: 'Email local part is too long'
    };
  }
  
  // Check domain length (RFC 5321 limit)
  if (domain.length > 253) {
    return {
      isValid: false,
      reason: 'Email domain is too long'
    };
  }
  
  // Check for consecutive dots
  if (sanitizedEmail.includes('..')) {
    return {
      isValid: false,
      reason: 'Email cannot contain consecutive dots'
    };
  }
  
  // Check for leading/trailing dots in local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      reason: 'Email local part cannot start or end with a dot'
    };
  }
  
  // Check for disposable email domains
  if (disposableDomains.includes(domain)) {
    return {
      isValid: false,
      reason: 'Disposable email addresses are not allowed'
    };
  }
  
  // Check for common typos and suggest corrections
  const suggestions = suggestDomainCorrections(domain);
  
  // Enhanced domain validation
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return {
      isValid: false,
      reason: 'Invalid domain format',
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
  
  // Check for valid TLD (enhanced check)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || tld.length > 6) {
    return {
      isValid: false,
      reason: 'Invalid top-level domain'
    };
  }
  
  // Check for numeric-only TLD (usually invalid)
  if (/^\d+$/.test(tld)) {
    return {
      isValid: false,
      reason: 'Invalid top-level domain'
    };
  }
  
  // Check for suspicious domain patterns
  if (containsSuspiciousDomainPatterns(domain)) {
    return {
      isValid: false,
      reason: 'Domain contains suspicious patterns'
    };
  }
  
  return {
    isValid: true,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Input sanitization function
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .substring(0, 254); // Limit length to RFC maximum
}

// Name validation function
export function validateName(name: string): { isValid: boolean; reason?: string } {
  const sanitizedName = sanitizeInput(name);
  
  if (!sanitizedName || sanitizedName.length === 0) {
    return { isValid: false, reason: 'Name is required' };
  }
  
  if (sanitizedName.length > 100) {
    return { isValid: false, reason: 'Name is too long' };
  }
  
  if (sanitizedName.length < 2) {
    return { isValid: false, reason: 'Name is too short' };
  }
  
  // Check for suspicious patterns
  if (NAME_PATTERNS.SUSPICIOUS_NAME.test(sanitizedName)) {
    return { isValid: false, reason: 'Name contains invalid characters' };
  }
  
  // Check for repeated characters (potential spam)
  if (NAME_PATTERNS.REPEATED_CHARS.test(sanitizedName)) {
    return { isValid: false, reason: 'Name contains suspicious patterns' };
  }
  
  // Check for valid name pattern
  if (!NAME_PATTERNS.VALID_NAME.test(sanitizedName)) {
    return { isValid: false, reason: 'Name contains invalid characters' };
  }
  
  // Check for SQL injection patterns
  if (SQL_INJECTION_PATTERNS.some(pattern => pattern.test(sanitizedName))) {
    return { isValid: false, reason: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
}

// Check for suspicious patterns in input
function containsSuspiciousPatterns(input: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(input)) ||
         SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

// Check for suspicious domain patterns
function containsSuspiciousDomainPatterns(domain: string): boolean {
  // Check for IP addresses (usually suspicious for email)
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipPattern.test(domain)) {
    return true;
  }
  
  // Check for suspicious TLDs or patterns
  const suspiciousDomainPatterns = [
    /\.tk$/i,     // Often used for spam
    /\.ml$/i,     // Often used for spam
    /\.ga$/i,     // Often used for spam
    /\.cf$/i,     // Often used for spam
    /\d{4,}/,     // Long sequences of numbers
    /[^a-z0-9.-]/i, // Invalid domain characters
  ];
  
  return suspiciousDomainPatterns.some(pattern => pattern.test(domain));
}

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email);
}