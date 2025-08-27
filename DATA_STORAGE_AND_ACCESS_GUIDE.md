# Data Storage and Access Guide

## Overview
All user application data and file uploads are stored securely in Firebase/Google Cloud Platform with comprehensive access methods for your team.

## 📊 **Data Storage Locations**

### 1. **Application Data (Firestore Database)**
- **Location**: Firebase Firestore collection `applications`
- **Database**: `arenafund` project
- **Structure**: Each application is a document with a unique ID

#### **Founder Applications Data Structure**
```typescript
{
  // System Fields
  id: string,                    // Unique application ID
  uid: string | null,           // Firebase user ID (if authenticated)
  createdAt: Timestamp,         // Application submission time
  updatedAt: Timestamp,         // Last modification time
  env: string,                  // Environment (prod/dev)
  applicationType: 'founder',   // Application type identifier
  
  // Founder & Team Info
  founderName: string,          // Full name
  founderEmail: string,         // Email address
  role: string,                 // Role at company
  phone: string | null,         // Phone number
  linkedin: string | null,      // LinkedIn profile URL
  
  // Company Info
  companyName: string,          // Company name
  companyUrl: string,           // Company website
  stage: string,                // Startup stage (pre-seed, seed, etc.)
  industry: string,             // Industry category
  oneLineDescription: string,   // Brief company description
  
  // Business Details
  problem: string,              // Problem description
  solution: string,             // Solution description
  traction: string,             // Traction stage
  revenue: string | null,       // Revenue information
  
  // Pitch Materials
  deckUrl: string | null,       // Pitch deck URL
  deckFileRef: string | null,   // Uploaded file reference
  videoPitch: string | null,    // Video pitch URL
  
  // Validation & Edge
  enterpriseEngagement: string, // Enterprise engagement details
  keyHighlights: string | null, // Key highlights
  
  // Funding
  capitalRaised: string | null,     // Previous capital raised
  capitalRaisedAmount: string | null, // Amount raised
  capitalSought: string,            // Capital being sought
  
  // Consent & Legal
  signature: string,            // Digital signature
  accuracyConfirm: boolean,     // Accuracy confirmation
  understandingConfirm: boolean, // Understanding confirmation
  
  // System Metadata
  userEmailFromIdToken: string | null, // Email from auth token
  userAgent: string | null,     // Browser user agent
  ipHint: string | null,        // IP address hint
}
```

#### **Investor Applications Data Structure**
```typescript
{
  // System Fields
  id: string,                    // Unique application ID
  uid: string | null,           // Firebase user ID (if authenticated)
  createdAt: Timestamp,         // Application submission time
  updatedAt: Timestamp,         // Last modification time
  env: string,                  // Environment (prod/dev)
  applicationType: 'investor',  // Application type identifier
  
  // Basic Investor Info
  fullName: string,             // Full name
  email: string,                // Email address
  country: string,              // Country
  state: string,                // State (for US investors)
  investorType: string,         // individual, family-office, institutional, other
  accreditationStatus: string,  // yes, no, unsure
  
  // Investment Preferences
  checkSize: string,            // 25k-50k, 50k-250k, 250k-plus
  areasOfInterest: string[],    // Array of interest areas
  referralSource: string | null, // How they heard about us
  
  // 506(c) Specific Fields (when applicable)
  investorMode: string,         // 506b or 506c
  verificationMethod: string | null,    // letter, third-party, bank-brokerage
  verificationFileRef: string | null,   // Uploaded verification document
  entityName: string | null,            // Legal entity name
  jurisdiction: string | null,          // Legal jurisdiction
  custodianInfo: string | null,         // Custodian information
  
  // Consent & Legal
  consentConfirm: boolean,      // Consent confirmation
  signature: string,            // Digital signature
  
  // System Metadata
  userEmailFromIdToken: string | null, // Email from auth token
  userAgent: string | null,     // Browser user agent
  ipHint: string | null,        // IP address hint
}
```

### 2. **File Storage (Google Cloud Storage)**
- **Location**: Google Cloud Storage bucket `arenafund.appspot.com`
- **Structure**:
  - `applications/uploads/` - General application files (pitch decks, etc.)
  - `applications/verification/` - Investor verification documents (PDFs)

#### **File Naming Convention**
```
applications/uploads/{timestamp}-{sanitized-filename}
applications/verification/{timestamp}-{sanitized-filename}
```

### 3. **Rate Limiting Data (Firestore)**
- **Location**: Firebase Firestore collection `applications_meta`
- **Purpose**: Prevent spam and track submission frequency
- **Structure**: Documents keyed by email hash

## 🔐 **Access Methods for Your Team**

### 1. **Firebase Console (Web Interface)**
**URL**: https://console.firebase.google.com/project/arenafund

**Access Steps**:
1. Go to Firebase Console
2. Select the `arenafund` project
3. Navigate to "Firestore Database"
4. Browse the `applications` collection
5. Each document represents one application

**What You Can Do**:
- View all application data in real-time
- Search and filter applications
- Export data to CSV/JSON
- Set up custom queries
- Monitor application volume and trends

### 2. **Google Cloud Console (Advanced)**
**URL**: https://console.cloud.google.com/

**Access Steps**:
1. Go to Google Cloud Console
2. Select the `arenafund` project
3. Navigate to "Firestore" for database access
4. Navigate to "Cloud Storage" for file access

**What You Can Do**:
- Advanced database queries
- Bulk data operations
- File management and downloads
- Set up automated backups
- Configure access permissions

### 3. **Email Notifications (Automatic)**
Every application automatically sends a comprehensive email to your operations team.

**Email Recipients**: 
- Configured via `OPS_EMAILS` environment variable
- Default: `invest@thearenafund.com`

**Email Content Includes**:
- All form field data formatted for easy reading
- Secure download links for uploaded files (7-day expiration)
- Application ID for reference
- Timestamp and metadata

### 4. **Webhook Notifications (Real-time)**
**URL**: Configured via `OPS_WEBHOOK_URL` environment variable

**Payload Structure**:
```json
{
  "text": "New founder application: CompanyName by FounderName (email@example.com)",
  "application": { /* full application data */ },
  "source": "apply_api",
  "env": "prod"
}
```

### 5. **API Access (Programmatic)**
You can create custom scripts or tools to access the data programmatically.

**Example Node.js Script**:
```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'arenafund'
});

const db = admin.firestore();

// Get all applications
async function getAllApplications() {
  const snapshot = await db.collection('applications').get();
  const applications = [];
  
  snapshot.forEach(doc => {
    applications.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return applications;
}

// Get applications by type
async function getApplicationsByType(type) {
  const snapshot = await db.collection('applications')
    .where('applicationType', '==', type)
    .get();
    
  const applications = [];
  snapshot.forEach(doc => {
    applications.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return applications;
}
```

## 📁 **File Access Methods**

### 1. **Email Links (Easiest)**
- Every application email contains secure download links
- Links expire after 7 days for security
- No additional setup required

### 2. **Download API Endpoint**
**URL**: `https://yourdomain.com/api/files/download`

**Usage**:
```bash
# Download a file
curl "https://yourdomain.com/api/files/download?ref=applications/verification/123-document.pdf"

# Preview a file
curl "https://yourdomain.com/api/files/download?ref=applications/verification/123-document.pdf&action=view"
```

### 3. **Google Cloud Storage Console**
1. Go to Google Cloud Console
2. Navigate to Cloud Storage
3. Select `arenafund.appspot.com` bucket
4. Browse `applications/` folder
5. Download files directly

## 🔍 **Common Queries and Filters**

### **Recent Applications**
```javascript
// Last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentApps = await db.collection('applications')
  .where('createdAt', '>=', sevenDaysAgo)
  .orderBy('createdAt', 'desc')
  .get();
```

### **Applications by Type**
```javascript
// Founder applications only
const founderApps = await db.collection('applications')
  .where('applicationType', '==', 'founder')
  .get();

// Investor applications only
const investorApps = await db.collection('applications')
  .where('applicationType', '==', 'investor')
  .get();
```

### **506(c) Investor Applications**
```javascript
const accreditedInvestors = await db.collection('applications')
  .where('applicationType', '==', 'investor')
  .where('investorMode', '==', '506c')
  .get();
```

### **Applications with Files**
```javascript
const appsWithFiles = await db.collection('applications')
  .where('deckFileRef', '!=', null)
  .get();

const appsWithVerification = await db.collection('applications')
  .where('verificationFileRef', '!=', null)
  .get();
```

## 📊 **Data Export Options**

### 1. **Firebase Console Export**
- Go to Firestore Database
- Select collection
- Click "Export" button
- Choose format (JSON, CSV)

### 2. **Programmatic Export**
```javascript
const fs = require('fs');

async function exportToCSV() {
  const snapshot = await db.collection('applications').get();
  const csvData = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    csvData.push({
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      applicationType: data.applicationType,
      name: data.founderName || data.fullName,
      email: data.founderEmail || data.email,
      company: data.companyName || 'N/A',
      // Add other fields as needed
    });
  });
  
  // Convert to CSV and save
  const csv = convertToCSV(csvData);
  fs.writeFileSync('applications.csv', csv);
}
```

## 🔒 **Security and Compliance**

### **Data Security Features**
- All data encrypted at rest and in transit
- File uploads stored in secure Google Cloud Storage
- Access controlled via Firebase Authentication
- Audit logging for all file downloads
- Rate limiting to prevent abuse

### **Privacy Compliance**
- All user data stored with explicit consent
- Digital signatures captured for legal compliance
- IP addresses and user agents logged for security
- Data retention policies can be configured

### **File Security**
- Verification documents stored separately from general uploads
- Time-limited download URLs (expire after 7 days)
- File type validation (PDF-only for verification docs)
- File size limits enforced
- Audit trail for all file access

## 🚀 **Getting Started**

### **Immediate Access (No Setup Required)**
1. **Check your email** - Every application sends a notification
2. **Firebase Console** - Go to https://console.firebase.google.com/project/arenafund
3. **Browse applications** - Navigate to Firestore Database > applications collection

### **For Advanced Users**
1. Set up Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Set project: `firebase use arenafund`
4. Query data: `firebase firestore:get applications`

### **Team Access Setup**
1. Add team members to the Firebase project
2. Assign appropriate roles (Viewer, Editor, Admin)
3. Configure email notifications in environment variables
4. Set up webhook integrations if needed

## 📞 **Support**

If you need help accessing or querying the data:
1. Check the Firebase Console first
2. Review the email notifications
3. Use the API endpoints for programmatic access
4. Contact the development team for custom queries or exports

All application data is immediately available and searchable through multiple channels, ensuring your team has complete visibility into the application pipeline.