interface SecurityEvent {
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// In-memory storage for demo purposes
// In production, use proper logging infrastructure (e.g., Winston, Pino, or cloud logging)
const securityLogs: SecurityEvent[] = [];

const eventSeverityMap: Record<string, SecurityEvent['severity']> = {
  'RATE_LIMIT_EXCEEDED': 'medium',
  'INVALID_NEWSLETTER_SUBSCRIPTION_DATA': 'low',
  'DUPLICATE_NEWSLETTER_SUBSCRIPTION': 'low',
  'NEWSLETTER_SUBSCRIPTION_SUCCESS': 'low',
  'NEWSLETTER_SUBSCRIPTION_ERROR': 'medium',
  'NEWSLETTER_UNSUBSCRIBE': 'low',
  'SUSPICIOUS_ACTIVITY': 'high',
  'SECURITY_BREACH_ATTEMPT': 'critical'
};

export function logSecurityEvent(
  event: string, 
  details: Record<string, any> = {}
): void {
  const securityEvent: SecurityEvent = {
    timestamp: new Date().toISOString(),
    event,
    severity: eventSeverityMap[event] || 'medium',
    details: {
      ...details,
      // Remove sensitive information
      ...(details.email && { email: maskEmail(details.email) })
    },
    ip: details.ip,
    userAgent: details.userAgent
  };
  
  // Store the event
  securityLogs.push(securityEvent);
  
  // Keep only last 1000 events in memory
  if (securityLogs.length > 1000) {
    securityLogs.shift();
  }
  
  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY] ${event}:`, securityEvent);
  }
  
  // In production, you would:
  // 1. Send to logging service (e.g., DataDog, Splunk, ELK stack)
  // 2. Alert on high/critical severity events
  // 3. Store in secure, tamper-proof storage
  // 4. Implement log rotation and retention policies
  
  // Alert on critical events
  if (securityEvent.severity === 'critical') {
    alertSecurityTeam(securityEvent);
  }
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.substring(0, 2)}***@${domain}`;
}

function alertSecurityTeam(event: SecurityEvent): void {
  // In production, implement actual alerting:
  // 1. Send to security team via email/Slack/PagerDuty
  // 2. Create incident in incident management system
  // 3. Trigger automated response procedures
  
  console.error('[CRITICAL SECURITY EVENT]', event);
}

export function getSecurityLogs(
  limit: number = 100,
  severity?: SecurityEvent['severity']
): SecurityEvent[] {
  let logs = securityLogs;
  
  if (severity) {
    logs = logs.filter(log => log.severity === severity);
  }
  
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getSecurityMetrics(): {
  totalEvents: number;
  eventsBySeverity: Record<SecurityEvent['severity'], number>;
  recentEvents: number;
} {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const eventsBySeverity = securityLogs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<SecurityEvent['severity'], number>);
  
  const recentEvents = securityLogs.filter(
    log => new Date(log.timestamp) > oneHourAgo
  ).length;
  
  return {
    totalEvents: securityLogs.length,
    eventsBySeverity,
    recentEvents
  };
}