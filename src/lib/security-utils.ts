/**
 * Security utilities for input validation and sanitization
 */

import { logger } from './logger';

// Input sanitization
export class SecurityUtils {
  // Sanitize string input to prevent XSS
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate password strength
  static isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }
    
    if (password.length > 128) {
      errors.push('Şifre en fazla 128 karakter olabilir');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az 1 küçük harf içermelidir');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az 1 büyük harf içermelidir');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Şifre en az 1 rakam içermelidir');
    }
    
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Şifre en az 1 özel karakter (@$!%*?&) içermelidir');
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '12345678'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Bu şifre çok yaygın kullanılmaktadır, daha güçlü bir şifre seçin');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate MongoDB ObjectId
  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // Sanitize filename for uploads
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase();
  }

  // Check for SQL injection patterns
  static containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\b(EXEC|EXECUTE)\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Log security events
  static logSecurityEvent(event: string, details: unknown, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const detailsPayload = typeof details === 'object' && details !== null ? (details as Record<string, unknown>) : { details };
    logger.error(`Security Event: ${event}`, 'SECURITY', {
      severity,
      timestamp: new Date().toISOString(),
      ...detailsPayload
    });
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Validate request origin
  static isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) return false;
    return allowedOrigins.includes(origin);
  }

  // Rate limit key generation
  static generateRateLimitKey(ip: string, endpoint: string): string {
    return `rate_limit:${ip}:${endpoint}`;
  }

  // Check for suspicious file extensions
  static isSuspiciousFileExtension(filename: string): boolean {
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.php', '.asp', '.aspx', '.jsp', '.sh', '.py', '.rb'
    ];
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return suspiciousExtensions.includes(extension);
  }

  // Validate URL
  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Check for directory traversal
  static containsDirectoryTraversal(path: string): boolean {
    const traversalPatterns = [
      /\.\./,
      /\.\.\//, 
      /\.\.\\/, 
      /%2e%2e/i,
      /%252e%252e/i
    ];
    
    return traversalPatterns.some(pattern => pattern.test(path));
  }
}

// Request validation middleware helper
export function validateRequest(req: Record<string, unknown>, rules: Record<string, { required?: boolean; type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'mongoId'; minLength?: number; maxLength?: number }>) {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = (req as Record<string, unknown>)[field];
    const fieldRule = rule as { required?: boolean; type?: string; minLength?: number; maxLength?: number };
    
    // Required field check
    if (fieldRule.required && (!value || String(value).trim() === '')) {
      errors.push(`${field} alanı gereklidir`);
      continue;
    }
    
    // Skip other validations if field is not required and empty
    if (!fieldRule.required && (!value || String(value).trim() === '')) {
      continue;
    }
    
    // Type validation
    if (fieldRule.type === 'email' && !SecurityUtils.isValidEmail(String(value))) {
      errors.push(`${field} geçerli bir email adresi olmalıdır`);
    }
    
    if (fieldRule.type === 'password') {
      const passwordCheck = SecurityUtils.isStrongPassword(String(value));
      if (!passwordCheck.valid) {
        errors.push(...passwordCheck.errors);
      }
    }
    
    // Length validation
    if (typeof fieldRule.minLength === 'number' && String(value).length < fieldRule.minLength) {
      errors.push(`${field} en az ${fieldRule.minLength} karakter olmalıdır`);
    }
    
    if (typeof fieldRule.maxLength === 'number' && String(value).length > fieldRule.maxLength) {
      errors.push(`${field} en fazla ${fieldRule.maxLength} karakter olabilir`);
    }
    
    // SQL injection check
    if (typeof value === 'string' && SecurityUtils.containsSQLInjection(value)) {
      errors.push(`${field} alanında güvenlik riski tespit edildi`);
      SecurityUtils.logSecurityEvent('SQL Injection Attempt', {
        field,
        value: value.substring(0, 100) // Log first 100 chars only
      }, 'high');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}