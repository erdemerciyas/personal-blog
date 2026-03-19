/**
 * @jest-environment node
 */
import { Validator, Sanitizer } from '../validation';

describe('Validator', () => {
  describe('isEmail', () => {
    it('accepts valid emails', () => {
      expect(Validator.isEmail('user@example.com')).toBe(true);
      expect(Validator.isEmail('user.name+tag@sub.domain.org')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(Validator.isEmail('not-an-email')).toBe(false);
      expect(Validator.isEmail('@missing-local.com')).toBe(false);
      expect(Validator.isEmail('missing-domain@')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('accepts passwords meeting all criteria', () => {
      expect(Validator.isStrongPassword('Secure@123')).toBe(true);
      expect(Validator.isStrongPassword('P@ssw0rd!')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(Validator.isStrongPassword('password')).toBe(false); // no uppercase/digit/special
      expect(Validator.isStrongPassword('SHORT1!')).toBe(false);  // under 8 chars
      expect(Validator.isStrongPassword('NoDigit@!')).toBe(false); // no digit
    });
  });

  describe('isValidName', () => {
    it('accepts Turkish and Latin names', () => {
      expect(Validator.isValidName('Erdem Erciyas')).toBe(true);
      expect(Validator.isValidName('Şükrü')).toBe(true);
    });

    it('rejects names with digits or special chars', () => {
      expect(Validator.isValidName('Name123')).toBe(false);
      expect(Validator.isValidName('N')).toBe(false); // too short
    });
  });

  describe('isValidSlug', () => {
    it('accepts valid slugs', () => {
      expect(Validator.isValidSlug('my-post')).toBe(true);
      expect(Validator.isValidSlug('hello-world-2024')).toBe(true);
      expect(Validator.isValidSlug('simple')).toBe(true);
    });

    it('rejects invalid slugs', () => {
      expect(Validator.isValidSlug('Has-Uppercase')).toBe(false);
      expect(Validator.isValidSlug('has spaces')).toBe(false);
      expect(Validator.isValidSlug('-leading-dash')).toBe(false);
    });
  });

  describe('isValidMongoId', () => {
    it('accepts 24-char hex string', () => {
      expect(Validator.isValidMongoId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('rejects non-ObjectId strings', () => {
      expect(Validator.isValidMongoId('short')).toBe(false);
      expect(Validator.isValidMongoId('507f1f77bcf86cd79943901z')).toBe(false); // invalid char
    });
  });

  describe('isValidLength', () => {
    it('accepts text within range', () => {
      expect(Validator.isValidLength('hello', 3, 10)).toBe(true);
    });

    it('rejects text outside range', () => {
      expect(Validator.isValidLength('hi', 3, 10)).toBe(false);
      expect(Validator.isValidLength('toolongstring', 3, 5)).toBe(false);
    });
  });
});

describe('Sanitizer', () => {
  describe('sanitizeText', () => {
    it('removes HTML angle brackets', () => {
      const result = Sanitizer.sanitizeText('<script>alert(1)</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('removes javascript: protocol', () => {
      const result = Sanitizer.sanitizeText('javascript:alert(1)');
      expect(result).not.toContain('javascript:');
    });

    it('trims whitespace', () => {
      expect(Sanitizer.sanitizeText('  hello  ')).toBe('hello');
    });

    it('truncates at 10000 chars', () => {
      const long = 'a'.repeat(15000);
      expect(Sanitizer.sanitizeText(long).length).toBe(10000);
    });
  });

  describe('sanitizeEmail', () => {
    it('lowercases the email', () => {
      expect(Sanitizer.sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
    });

    it('strips invalid characters', () => {
      // '+' is removed; alphanumeric chars like 'tag' are kept by \w pattern
      expect(Sanitizer.sanitizeEmail('user+tag!#@example.com')).toBe('usertag@example.com');
    });

    it('truncates at 254 chars', () => {
      const long = 'a'.repeat(250) + '@x.com';
      expect(Sanitizer.sanitizeEmail(long).length).toBeLessThanOrEqual(254);
    });
  });

  describe('sanitizeUrl', () => {
    it('allows http and https URLs', () => {
      // URL constructor normalises by appending trailing slash for bare origins
      expect(Sanitizer.sanitizeUrl('https://www.example.com')).toContain('https://www.example.com');
      expect(Sanitizer.sanitizeUrl('http://example.com/path')).toContain('example.com/path');
    });

    it('returns empty string for non-http(s) URLs', () => {
      expect(Sanitizer.sanitizeUrl('ftp://example.com')).toBe('');
      expect(Sanitizer.sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(Sanitizer.sanitizeUrl('/relative-path')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('allows safe HTML tags', () => {
      const result = Sanitizer.sanitizeHtml('<p>Hello <strong>world</strong></p>');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('strips script tags', () => {
      const result = Sanitizer.sanitizeHtml('<p>Safe</p><script>alert(1)</script>');
      expect(result).not.toContain('<script>');
    });

    it('strips dangerous event attributes', () => {
      const result = Sanitizer.sanitizeHtml('<p onclick="alert(1)">Click me</p>');
      expect(result).not.toContain('onclick');
    });
  });
});
