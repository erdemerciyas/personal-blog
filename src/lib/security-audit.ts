/**
 * Security audit and monitoring utilities
 */

import { logger } from './logger';

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'password_change' | 
        'admin_access' | 'suspicious_activity' | 'rate_limit_exceeded' | 'input_validation_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent?: string;
  email?: string;
  details?: any;
  timestamp: Date;
}

class SecurityAudit {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 1000; // Keep last 1000 events in memory

  // Log security event
  static logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    // Add to in-memory storage
    this.events.unshift(securityEvent);
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(0, this.MAX_EVENTS);
    }

    // Log to system logger
    logger.error(`Security Event: ${event.type}`, 'SECURITY_AUDIT', {
      severity: event.severity,
      ip: event.ip,
      email: event.email,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: securityEvent.timestamp.toISOString()
    });

    // Check for patterns that require immediate attention
    this.checkForSuspiciousPatterns(event);
  }

  // Check for suspicious patterns
  private static checkForSuspiciousPatterns(event: SecurityEvent) {
    const recentEvents = this.getRecentEvents(15 * 60 * 1000); // Last 15 minutes
    const sameIPEvents = recentEvents.filter(e => e.ip === event.ip);

    // Multiple failed login attempts from same IP
    if (event.type === 'login_failure') {
      const failedLogins = sameIPEvents.filter(e => e.type === 'login_failure').length;
      if (failedLogins >= 5) {
        this.logEvent({
          type: 'suspicious_activity',
          severity: 'high',
          ip: event.ip,
          userAgent: event.userAgent,
          details: {
            pattern: 'multiple_failed_logins',
            count: failedLogins,
            timeframe: '15_minutes'
          }
        });
      }
    }

    // Multiple different user attempts from same IP
    const uniqueEmails = new Set(
      sameIPEvents
        .filter(e => e.email)
        .map(e => e.email)
    );
    
    if (uniqueEmails.size >= 3) {
      this.logEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip: event.ip,
        userAgent: event.userAgent,
        details: {
          pattern: 'multiple_user_attempts',
          unique_emails: uniqueEmails.size,
          timeframe: '15_minutes'
        }
      });
    }

    // Rapid requests from same IP
    if (sameIPEvents.length >= 50) {
      this.logEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ip: event.ip,
        userAgent: event.userAgent,
        details: {
          pattern: 'rapid_requests',
          count: sameIPEvents.length,
          timeframe: '15_minutes'
        }
      });
    }
  }

  // Get recent events
  static getRecentEvents(timeframeMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeframeMs);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  // Get events by type
  static getEventsByType(type: SecurityEvent['type'], limit = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(0, limit);
  }

  // Get events by IP
  static getEventsByIP(ip: string, limit = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.ip === ip)
      .slice(0, limit);
  }

  // Get security summary
  static getSecuritySummary(timeframeMs = 24 * 60 * 60 * 1000): any {
    const recentEvents = this.getRecentEvents(timeframeMs);
    
    const summary = {
      timeframe: `${timeframeMs / (60 * 60 * 1000)} hours`,
      totalEvents: recentEvents.length,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      topIPs: {} as Record<string, number>,
      suspiciousActivity: recentEvents.filter(e => e.type === 'suspicious_activity').length,
      failedLogins: recentEvents.filter(e => e.type === 'login_failure').length,
      successfulLogins: recentEvents.filter(e => e.type === 'login_success').length
    };

    // Count by type
    recentEvents.forEach(event => {
      summary.eventsByType[event.type] = (summary.eventsByType[event.type] || 0) + 1;
      summary.eventsBySeverity[event.severity] = (summary.eventsBySeverity[event.severity] || 0) + 1;
      summary.topIPs[event.ip] = (summary.topIPs[event.ip] || 0) + 1;
    });

    return summary;
  }

  // Check if IP is suspicious
  static isIPSuspicious(ip: string): boolean {
    const recentEvents = this.getEventsByIP(ip, 50);
    const last15Min = recentEvents.filter(
      e => e.timestamp > new Date(Date.now() - 15 * 60 * 1000)
    );

    // Too many failed logins
    const failedLogins = last15Min.filter(e => e.type === 'login_failure').length;
    if (failedLogins >= 5) return true;

    // Too many requests
    if (last15Min.length >= 100) return true;

    // Has suspicious activity events
    const suspiciousEvents = last15Min.filter(e => e.type === 'suspicious_activity').length;
    if (suspiciousEvents >= 1) return true;

    return false;
  }

  // Get blocked IPs (for rate limiting enhancement)
  static getBlockedIPs(): string[] {
    const suspiciousIPs = new Set<string>();
    
    // Get IPs with recent suspicious activity
    const recentSuspicious = this.getRecentEvents(60 * 60 * 1000) // Last hour
      .filter(e => e.type === 'suspicious_activity');
    
    recentSuspicious.forEach(event => {
      suspiciousIPs.add(event.ip);
    });

    return Array.from(suspiciousIPs);
  }

  // Clear old events (for memory management)
  static clearOldEvents(olderThanMs = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoff = new Date(Date.now() - olderThanMs);
    this.events = this.events.filter(event => event.timestamp > cutoff);
  }

  // Export events for external analysis
  static exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    } else {
      // CSV format
      const headers = 'timestamp,type,severity,ip,email,userAgent,details\n';
      const rows = this.events.map(event => 
        `${event.timestamp.toISOString()},${event.type},${event.severity},${event.ip},${event.email || ''},${event.userAgent || ''},"${JSON.stringify(event.details || {})}"`
      ).join('\n');
      
      return headers + rows;
    }
  }
}

export default SecurityAudit;

// Helper functions for common security events
export const SecurityEvents = {
  loginAttempt: (ip: string, email: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'login_attempt',
      severity: 'low',
      ip,
      email,
      userAgent
    });
  },

  loginSuccess: (ip: string, email: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'login_success',
      severity: 'low',
      ip,
      email,
      userAgent
    });
  },

  loginFailure: (ip: string, email: string, userAgent?: string, reason?: string) => {
    SecurityAudit.logEvent({
      type: 'login_failure',
      severity: 'medium',
      ip,
      email,
      userAgent,
      details: { reason }
    });
  },

  passwordChange: (ip: string, email: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'password_change',
      severity: 'medium',
      ip,
      email,
      userAgent
    });
  },

  adminAccess: (ip: string, email: string, endpoint: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'admin_access',
      severity: 'medium',
      ip,
      email,
      userAgent,
      details: { endpoint }
    });
  },

  suspiciousActivity: (ip: string, activity: string, details?: any, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip,
      userAgent,
      details: { activity, ...details }
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      ip,
      userAgent,
      details: { endpoint }
    });
  },

  inputValidationFailed: (ip: string, endpoint: string, reason: string, userAgent?: string) => {
    SecurityAudit.logEvent({
      type: 'input_validation_failed',
      severity: 'high',
      ip,
      userAgent,
      details: { endpoint, reason }
    });
  }
};