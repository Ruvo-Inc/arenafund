import DOMPurify from 'isomorphic-dompurify';
import crypto from 'crypto';

// Comprehensive input sanitization utilities
export class InputSanitizer {
  // HTML sanitization patterns
  private static readonly HTML_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  ];

  // SQL injection patterns
  private static readonly SQL_PATTERNS = [
    /('|\\')|(;|\\;)|(--)/gi,
    /\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/gi,
    /(script|javascript|vbscript|onload|onerror|onclick)/gi,
    /\b(and|or)\b.{1,6}?(=|>|<)/gi,
    /\b(union\s+select|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/gi,
  ];

  // XSS patterns
  private static readonly XSS_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /on\w+\s*=/gi,
    /<[^>]*>/g,
    /&[#\w]+;/g,
  ];

  // Control characters and suspicious unicode
  private static readonly CONTROL_PATTERNS = [
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
    /[\u200B-\u200D\uFEFF]/g,             // Zero-width characters
    /[\u2028\u2029]/g,                     // Line/paragraph separators
    /[\uFFF0-\uFFFF]/g,                    // Specials block
  ];

  /**
   * Sanitize text input for safe storage and display
   */
  static sanitizeText(input: string, options: {
    maxLength?: number;
    allowHTML?: boolean;
    strictMode?: boolean;
  } = {}): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const {
      maxLength = 1000,
      allowHTML = false,
      strictMode = true
    } = options;

    let sanitized = input.trim();

    // Remove control characters
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[0], '');
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[1], '');
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[2], '');
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[3], '');

    // Handle HTML content
    if (!allowHTML) {
      // Remove dangerous HTML patterns first (including content)
      InputSanitizer.HTML_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
      
      // Remove all remaining HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      
      // Decode HTML entities
      sanitized = InputSanitizer.decodeHTMLEntities(sanitized);
    } else {
      // Use DOMPurify for safe HTML sanitization
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      });
    }

    // Remove SQL injection patterns in strict mode
    if (strictMode) {
      InputSanitizer.SQL_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
    }

    // Remove XSS patterns
    InputSanitizer.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    let sanitized = email.trim().toLowerCase();

    // Remove control characters
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[0], '');
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[1], '');

    // Remove any HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove suspicious patterns
    InputSanitizer.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Limit to reasonable email length
    if (sanitized.length > 254) {
      sanitized = sanitized.substring(0, 254);
    }

    return sanitized;
  }

  /**
   * Sanitize name input
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    let sanitized = name.trim();

    // Remove control characters
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[0], '');
    sanitized = sanitized.replace(InputSanitizer.CONTROL_PATTERNS[1], '');

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove XSS patterns
    InputSanitizer.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove SQL injection patterns
    InputSanitizer.SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Only allow letters, spaces, hyphens, apostrophes, and dots
    sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]/g, '');

    // Limit length
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
  }

  /**
   * Validate and sanitize JSON input
   */
  static sanitizeJSON(input: any, schema: any): any {
    try {
      // Basic type checking
      if (typeof input !== 'object' || input === null) {
        throw new Error('Invalid JSON input');
      }

      const sanitized: any = {};

      // Sanitize each field based on schema
      for (const [key, value] of Object.entries(input)) {
        if (schema[key]) {
          const fieldType = schema[key].type;
          
          switch (fieldType) {
            case 'string':
              sanitized[key] = this.sanitizeText(value as string, schema[key].options || {});
              break;
            case 'email':
              sanitized[key] = this.sanitizeEmail(value as string);
              break;
            case 'name':
              sanitized[key] = this.sanitizeName(value as string);
              break;
            default:
              sanitized[key] = value;
          }
        }
      }

      return sanitized;
    } catch (error) {
      throw new Error('JSON sanitization failed');
    }
  }

  /**
   * Check if input contains suspicious patterns
   */
  static containsSuspiciousPatterns(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    // Check for SQL injection patterns
    if (InputSanitizer.SQL_PATTERNS.some(pattern => pattern.test(input))) {
      return true;
    }

    // Check for XSS patterns
    if (InputSanitizer.XSS_PATTERNS.some(pattern => pattern.test(input))) {
      return true;
    }

    // Check for HTML injection
    if (InputSanitizer.HTML_PATTERNS.some(pattern => pattern.test(input))) {
      return true;
    }

    return false;
  }

  /**
   * Decode HTML entities safely
   */
  private static decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '=',
    };

    return text.replace(/&[#\w]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }

  /**
   * Generate content security policy nonce
   */
  static generateCSPNonce(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  }
}

// Export convenience functions
export const sanitizeText = InputSanitizer.sanitizeText;
export const sanitizeEmail = InputSanitizer.sanitizeEmail;
export const sanitizeName = InputSanitizer.sanitizeName;
export const sanitizeJSON = InputSanitizer.sanitizeJSON;
export const containsSuspiciousPatterns = InputSanitizer.containsSuspiciousPatterns;