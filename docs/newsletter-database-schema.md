# Newsletter Database Schema Documentation

## Overview

This document describes the Firebase Firestore database schema for the newsletter subscription system. The schema is designed to handle subscriber management, email uniqueness validation, and metadata tracking for security and compliance purposes.

## Collection Structure

### `newsletter_subscribers` Collection

The main collection that stores all newsletter subscriber information.

#### Document Structure

```typescript
interface NewsletterSubscriber {
  id: string;                    // Unique subscriber ID
  name: string;                  // Subscriber's name (1-100 characters)
  email: string;                 // Subscriber's email (unique, indexed)
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Timestamp;       // When they first subscribed
  source: string;                // Where they subscribed from
  metadata: {
    userAgent?: string;          // Browser/client information
    ipAddress?: string;          // Hashed IP address for security
    lastUpdated: Timestamp;      // Last modification time
    unsubscribedAt?: Timestamp;  // When they unsubscribed (if applicable)
    unsubscribeIP?: string;      // IP address when unsubscribed
    bounceCount?: number;        // Number of email bounces
    lastBounceAt?: Timestamp;    // Last bounce timestamp
  };
  unsubscribeToken?: string;     // Secure token for unsubscribe links
}
```

## Database Indexes

The following indexes are configured for optimal query performance:

1. **Email Index** (Unique)
   - Field: `email` (ASCENDING)
   - Purpose: Fast email lookups and uniqueness enforcement

2. **Status Index**
   - Field: `status` (ASCENDING)
   - Purpose: Filter subscribers by status (active, unsubscribed, bounced)

3. **Status + Subscription Date Index**
   - Fields: `status` (ASCENDING), `subscribedAt` (DESCENDING)
   - Purpose: Get recent active subscribers efficiently

4. **Subscription Date Index**
   - Field: `subscribedAt` (DESCENDING)
   - Purpose: Sort subscribers by subscription date

5. **Source Index**
   - Field: `source` (ASCENDING)
   - Purpose: Analytics and filtering by subscription source

6. **Source + Subscription Date Index**
   - Fields: `source` (ASCENDING), `subscribedAt` (DESCENDING)
   - Purpose: Get recent subscribers by source

## Security Rules

The Firestore security rules restrict access to the newsletter collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /newsletter_subscribers/{subscriberId} {
      // Only authenticated admin users can read
      allow read: if request.auth != null && request.auth.token.admin == true;
      
      // No direct client-side writes (API only)
      allow create, update: if false;
      
      // Only admin users can delete
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Data Validation Rules

### Name Validation
- **Required**: Yes
- **Type**: String
- **Length**: 1-100 characters
- **Pattern**: Letters, spaces, hyphens, apostrophes, and periods only
- **Regex**: `/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/`

### Email Validation
- **Required**: Yes
- **Type**: String
- **Length**: 5-254 characters
- **Pattern**: Valid email format
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Unique**: Yes (enforced at database level)

### Status Validation
- **Required**: Yes
- **Type**: String
- **Allowed Values**: `'active'`, `'unsubscribed'`, `'bounced'`

### Source Validation
- **Required**: Yes
- **Type**: String
- **Length**: Maximum 50 characters

## Setup Instructions

### 1. Initialize Database Schema

Run the initialization script to set up the collection:

```bash
npm run init-newsletter-db
```

### 2. Deploy Firestore Indexes

Deploy the indexes to Firebase:

```bash
firebase deploy --only firestore:indexes
```

### 3. Deploy Security Rules

Deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

## API Functions

The schema includes several helper functions for database operations:

### Core Functions

- `initializeNewsletterSchema()` - Initialize the database schema
- `validateSubscriberData(data)` - Validate subscriber data
- `checkEmailExists(email)` - Check if email already exists
- `createSubscriber(data)` - Create new subscriber
- `updateSubscriberStatus(email, status)` - Update subscriber status
- `getActiveSubscribers(limit?)` - Get active subscribers
- `getSubscriberStats()` - Get subscription statistics

### Utility Functions

- `hashIPAddress(ip)` - Hash IP address for privacy
- `generateUnsubscribeToken()` - Generate secure unsubscribe token
- `getNewsletterCollection()` - Get collection reference

## Privacy and Compliance

### GDPR Compliance

1. **Data Minimization**: Only collect necessary information
2. **Consent Tracking**: Record subscription timestamp and source
3. **Right to Deletion**: Support for removing subscriber data
4. **Data Security**: Hash IP addresses for privacy

### Security Features

1. **IP Address Hashing**: IP addresses are hashed with salt
2. **Secure Tokens**: Cryptographically secure unsubscribe tokens
3. **Server-Side Only**: No direct client access to database
4. **Audit Trail**: Track all status changes with timestamps

## Monitoring and Analytics

### Available Statistics

- Total subscribers
- Active subscribers
- Unsubscribed count
- Bounced email count
- Subscribers by source
- Subscription trends over time

### Performance Monitoring

- Database query performance
- Index usage efficiency
- Collection size growth
- Read/write operation costs

## Maintenance

### Regular Tasks

1. **Monitor bounce rates** - Update status for bounced emails
2. **Clean up old data** - Archive or remove old unsubscribed users
3. **Index optimization** - Monitor query performance and adjust indexes
4. **Security audits** - Review access patterns and security rules

### Backup Strategy

- Firebase automatically handles backups
- Consider exporting subscriber data periodically for compliance
- Maintain separate backup of unsubscribe tokens for security

## Troubleshooting

### Common Issues

1. **Duplicate Email Errors**: Check email normalization (lowercase, trimmed)
2. **Index Errors**: Ensure all required indexes are deployed
3. **Permission Errors**: Verify security rules and authentication
4. **Validation Errors**: Check data format against schema rules

### Debug Commands

```bash
# Test database connection
npm run init-newsletter-db

# Run schema tests
npm test -- src/lib/__tests__/newsletter-db-schema.test.ts

# Check Firestore rules
firebase firestore:rules:get
```

## Migration Guide

If updating from an existing newsletter system:

1. **Data Export**: Export existing subscriber data
2. **Data Transformation**: Convert to new schema format
3. **Validation**: Run validation on all existing data
4. **Import**: Use batch operations for large datasets
5. **Verification**: Verify all data imported correctly

## Performance Considerations

### Query Optimization

- Use indexed fields for filtering
- Limit result sets appropriately
- Use pagination for large datasets
- Cache frequently accessed data

### Cost Optimization

- Monitor read/write operations
- Use batch operations for bulk updates
- Implement proper pagination
- Consider data archiving strategies

## Support

For issues with the newsletter database schema:

1. Check the test suite for expected behavior
2. Review Firebase console for error logs
3. Verify index deployment status
4. Check security rule configuration