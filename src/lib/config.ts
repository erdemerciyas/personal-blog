/**
 * Centralized configuration management
 * Validates environment variables and provides typed access
 */

import { logger } from './logger';

// Environment validation schema
interface EnvironmentConfig {
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // App configuration
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  
  // Database
  MONGODB_URI: string;
  
  // External services
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  
  OPENAI_API_KEY?: string;
  
  // App settings
  APP_NAME?: string;
  APP_URL?: string;
  
  // Security
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW?: string;
}

class ConfigManager {
  private config: EnvironmentConfig;
  private isValidated = false;

  constructor() {
    this.config = this.loadEnvironmentVariables();
    this.validateConfig();
  }

  private loadEnvironmentVariables(): EnvironmentConfig {
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
      MONGODB_URI: process.env.MONGODB_URI || '',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      APP_NAME: process.env.APP_NAME || 'Personal Blog',
      APP_URL: process.env.APP_URL || process.env.NEXTAUTH_URL,
      RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Required variables
    const required: (keyof EnvironmentConfig)[] = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'MONGODB_URI'
    ];

    for (const key of required) {
      if (!this.config[key]) {
        errors.push(`Missing required environment variable: ${key}`);
      }
    }

    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(this.config.NODE_ENV)) {
      errors.push(`Invalid NODE_ENV: ${this.config.NODE_ENV}`);
    }

    // Validate URLs
    if (this.config.NEXTAUTH_URL && !this.isValidUrl(this.config.NEXTAUTH_URL)) {
      errors.push(`Invalid NEXTAUTH_URL: ${this.config.NEXTAUTH_URL}`);
    }

    if (this.config.APP_URL && !this.isValidUrl(this.config.APP_URL)) {
      errors.push(`Invalid APP_URL: ${this.config.APP_URL}`);
    }

    // Validate MongoDB URI
    if (this.config.MONGODB_URI && !this.config.MONGODB_URI.startsWith('mongodb')) {
      errors.push(`Invalid MONGODB_URI format`);
    }

    // Validate numeric values
    if (this.config.RATE_LIMIT_MAX && isNaN(Number(this.config.RATE_LIMIT_MAX))) {
      errors.push(`RATE_LIMIT_MAX must be a number`);
    }

    if (this.config.RATE_LIMIT_WINDOW && isNaN(Number(this.config.RATE_LIMIT_WINDOW))) {
      errors.push(`RATE_LIMIT_WINDOW must be a number`);
    }

    // Log warnings for optional but recommended variables
    const recommended = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET'
    ];

    const missingRecommended = recommended.filter(key => !this.config[key as keyof EnvironmentConfig]);
    if (missingRecommended.length > 0) {
      logger.warn('Missing recommended environment variables', 'CONFIG', {
        missing: missingRecommended
      });
    }

    if (errors.length > 0) {
      logger.error('Environment configuration validation failed', 'CONFIG', {
        errors
      });
      
      if (this.config.NODE_ENV === 'production') {
        throw new Error(`Environment validation failed: ${errors.join(', ')}`);
      }
    } else {
      logger.info('Environment configuration validated successfully', 'CONFIG');
      this.isValidated = true;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Getters for configuration values
  get nodeEnv(): 'development' | 'production' | 'test' {
    return this.config.NODE_ENV;
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  get auth() {
    return {
      url: this.config.NEXTAUTH_URL,
      secret: this.config.NEXTAUTH_SECRET,
    };
  }

  get database() {
    return {
      uri: this.config.MONGODB_URI,
    };
  }

  get cloudinary() {
    return {
      cloudName: this.config.CLOUDINARY_CLOUD_NAME,
      apiKey: this.config.CLOUDINARY_API_KEY,
      apiSecret: this.config.CLOUDINARY_API_SECRET,
      isConfigured: !!(
        this.config.CLOUDINARY_CLOUD_NAME &&
        this.config.CLOUDINARY_API_KEY &&
        this.config.CLOUDINARY_API_SECRET
      ),
    };
  }

  get openai() {
    return {
      apiKey: this.config.OPENAI_API_KEY,
      isConfigured: !!this.config.OPENAI_API_KEY,
    };
  }

  get app() {
    return {
      name: this.config.APP_NAME || 'Personal Blog',
      url: this.config.APP_URL || this.config.NEXTAUTH_URL,
    };
  }

  get rateLimit() {
    return {
      max: Number(this.config.RATE_LIMIT_MAX) || 100,
      windowMs: Number(this.config.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    };
  }

  // Get all configuration (for debugging) - ONLY in development
  getAll(): EnvironmentConfig | null {
    if (this.config.NODE_ENV !== 'development') {
      logger.warn('Attempted to access full config in production', 'SECURITY');
      return null;
    }
    return { ...this.config };
  }

  // Get safe configuration (without secrets)
  getSafeConfig() {
    return {
      NODE_ENV: this.config.NODE_ENV,
      APP_NAME: this.config.APP_NAME,
      APP_URL: this.config.APP_URL,
      NEXTAUTH_URL: this.config.NEXTAUTH_URL,
      cloudinaryConfigured: this.cloudinary.isConfigured,
      openaiConfigured: this.openai.isConfigured,
      isValidated: this.isValidated,
      timestamp: Date.now()
    };
  }

  // Mask sensitive values for logging
  getMaskedConfig() {
    return {
      NODE_ENV: this.config.NODE_ENV,
      NEXTAUTH_URL: this.config.NEXTAUTH_URL,
      NEXTAUTH_SECRET: this.config.NEXTAUTH_SECRET ? '***MASKED***' : 'NOT_SET',
      MONGODB_URI: this.config.MONGODB_URI ? 
        this.config.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'NOT_SET',
      CLOUDINARY_CLOUD_NAME: this.config.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      CLOUDINARY_API_KEY: this.config.CLOUDINARY_API_KEY ? '***MASKED***' : 'NOT_SET',
      CLOUDINARY_API_SECRET: this.config.CLOUDINARY_API_SECRET ? '***MASKED***' : 'NOT_SET',
      OPENAI_API_KEY: this.config.OPENAI_API_KEY ? '***MASKED***' : 'NOT_SET',
    };
  }
}

// Export singleton instance
export const config = new ConfigManager();

// Environment helpers
export const env = {
  isProduction: config.isProduction,
  isDevelopment: config.isDevelopment,
  isTest: config.isTest,
};

// Feature flags based on configuration
export const features = {
  cloudinaryUpload: config.cloudinary.isConfigured,
  aiImageGeneration: config.openai.isConfigured,
  rateLimiting: config.isProduction,
  detailedLogging: config.isDevelopment,
}; 