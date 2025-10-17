import { Validator, Sanitizer, ValidationSchemas } from '../validation';

describe('Validator', () => {
  describe('isEmail', () => {
    it('should validate correct email addresses', () => {
      expect(Validator.isEmail('test@example.com')).toBe(true);
      expect(Validator.isEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(Validator.isEmail('invalid.email')).toBe(false);
      expect(Validator.isEmail('test@')).toBe(false);
      expect(Validator.isEmail('@example.com')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(Validator.isEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(Validator.isStrongPassword('SecurePass123!')).toBe(true);
      expect(Validator.isStrongPassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(Validator.isStrongPassword('weak')).toBe(false);
      expect(Validator.isStrongPassword('12345678')).toBe(false);
      expect(Validator.isStrongPassword('NoSpecial123')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(Validator.isValidName('John Doe')).toBe(true);
      expect(Validator.isValidName('Erdem Erciyas')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(Validator.isValidName('A')).toBe(false);
      expect(Validator.isValidName('123')).toBe(false);
      expect(Validator.isValidName('Name@123')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(Validator.isValidPhone('+1 234 567 8900')).toBe(true);
      expect(Validator.isValidPhone('1234567890')).toBe(true);
      expect(Validator.isValidPhone('+90 555 123 4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(Validator.isValidPhone('123')).toBe(false);
      expect(Validator.isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(Validator.isValidUrl('https://example.com')).toBe(true);
      expect(Validator.isValidUrl('http://www.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(Validator.isValidUrl('not a url')).toBe(false);
      expect(Validator.isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('should validate slugs', () => {
      expect(Validator.isValidSlug('my-project')).toBe(true);
      expect(Validator.isValidSlug('project-123')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(Validator.isValidSlug('My Project')).toBe(false);
      expect(Validator.isValidSlug('project_name')).toBe(false);
    });
  });

  describe('isValidMongoId', () => {
    it('should validate MongoDB IDs', () => {
      expect(Validator.isValidMongoId('507f1f77bcf86cd799439011')).toBe(true);
      expect(Validator.isValidMongoId('507f1f77bcf86cd799439012')).toBe(true);
    });

    it('should reject invalid MongoDB IDs', () => {
      expect(Validator.isValidMongoId('invalid')).toBe(false);
      expect(Validator.isValidMongoId('507f1f77bcf86cd79943901')).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('should validate text length', () => {
      expect(Validator.isValidLength('hello', 1, 10)).toBe(true);
      expect(Validator.isValidLength('test', 4, 4)).toBe(true);
    });

    it('should reject invalid lengths', () => {
      expect(Validator.isValidLength('hi', 5, 10)).toBe(false);
      expect(Validator.isValidLength('verylongtext', 1, 5)).toBe(false);
    });
  });
});

describe('Sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = Sanitizer.sanitizeHtml(html);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('should remove dangerous tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      const result = Sanitizer.sanitizeHtml(html);
      expect(result).not.toContain('<script>');
    });

    it('should remove dangerous attributes', () => {
      const html = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = Sanitizer.sanitizeHtml(html);
      expect(result).not.toContain('onclick');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const text = 'Hello <script>alert("xss")</script> World';
      const result = Sanitizer.sanitizeText(text);
      expect(result).not.toContain('<script>');
    });

    it('should remove javascript protocol', () => {
      const text = 'javascript:alert("xss")';
      const result = Sanitizer.sanitizeText(text);
      expect(result).not.toContain('javascript:');
    });

    it('should limit text length', () => {
      const longText = 'a'.repeat(20000);
      const result = Sanitizer.sanitizeText(longText);
      expect(result.length).toBeLessThanOrEqual(10000);
    });
  });
});

describe('ValidationSchemas', () => {
  it('should have all required schemas', () => {
    expect(ValidationSchemas.email).toBeDefined();
    expect(ValidationSchemas.password).toBeDefined();
    expect(ValidationSchemas.name).toBeDefined();
    expect(ValidationSchemas.phone).toBeDefined();
    expect(ValidationSchemas.url).toBeDefined();
    expect(ValidationSchemas.slug).toBeDefined();
    expect(ValidationSchemas.mongoId).toBeDefined();
  });
});
