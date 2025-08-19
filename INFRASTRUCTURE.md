# Arena Fund Infrastructure Documentation

## Overview
This document outlines all the Google Cloud Platform infrastructure that has been set up and should be preserved when rebuilding the Arena Fund application from scratch.

## GCP Project Details
- **Project ID:** `arenafund`
- **Region:** `us-central1`
- **Domain:** `thearenafund.com`

## Cloud SQL Database
- **Instance Type:** PostgreSQL 15
- **Configuration:** 1 vCPU, 3.75GB RAM
- **Features:** Auto backups enabled, row-level security, auditability
- **Database Name:** `arenafund_db` (NOT `arenafund-pg`)
- **Connection:** Via Cloud SQL Proxy or private IP

## Secret Manager Secrets
All secrets are stored in Google Secret Manager with automatic replication:

### Database Secrets
- `DB_HOST` - Cloud SQL instance host
- `DB_PORT` - Database port (typically 5432)
- `DB_NAME` - Database name (`arenafund_db`)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `CLOUD_SQL_INSTANCE_CONNECTION_NAME` - Full connection string for Cloud SQL

### Email/Gmail API Secrets
- `GMAIL_CLIENT_EMAIL` - Service account email for Gmail API
- `GMAIL_PRIVATE_KEY` - Private key for Gmail API authentication
- `GMAIL_IMPERSONATED_USER` - User to impersonate for sending emails
- `GMAIL_FROM_ADDRESS` - From address for outgoing emails
- `ADMIN_ALERT_EMAILS` - Comma-separated list of admin notification emails
- `SEND_APPLICANT_CONFIRMATION` - Flag for sending applicant confirmations

### reCAPTCHA Secrets
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Public reCAPTCHA v3 site key
- `RECAPTCHA_SECRET_KEY` - Private reCAPTCHA v3 secret key

## Service Accounts & IAM
- **Default Compute Engine Service Account:** Has Secret Manager Secret Accessor role
- **Custom Service Accounts:** May exist for specific services
- **Required IAM Roles:**
  - Cloud Run Admin
  - Cloud Build Editor
  - Artifact Registry Writer
  - Secret Manager Admin/Accessor
  - Cloud SQL Admin
  - Service Account Token Creator

## Cloud Services
- **Cloud Run:** Service named `arenafund-web` configured for app deployment
- **Artifact Registry:** Container registry for Docker images
- **Cloud Build:** CI/CD pipeline for automated deployments
- **Cloud Storage:** May have buckets for file uploads/assets

## DNS & Email Configuration
- **Domain:** `thearenafund.com` configured in Google Cloud DNS
- **Email Deliverability:** SPF, DKIM, and DMARC records may be configured
- **Gmail API:** Configured with Google Workspace delegation

## Networking
- **VPC:** Default or custom VPC configuration
- **Firewall Rules:** Standard Cloud Run ingress rules
- **Load Balancer:** May be configured for custom domain

## Monitoring & Logging
- **Cloud Logging:** Enabled for all services
- **Cloud Monitoring:** Basic monitoring enabled
- **Error Reporting:** Integrated with applications

## Security
- **IAM Policies:** Principle of least privilege applied
- **Secret Management:** All sensitive data in Secret Manager
- **Network Security:** Private Google Access enabled where applicable

## Important Notes
1. **Database Name:** Always use `arenafund_db` (not `arenafund-pg`)
2. **Project Context:** Ensure `gcloud config set project arenafund` before operations
3. **Secret Access:** Cloud Run service account has proper Secret Manager permissions
4. **Email Setup:** Gmail API requires Google Workspace domain delegation
5. **reCAPTCHA:** v3 keys are configured for the domain

## Commands to Verify Infrastructure
```bash
# Set correct project
gcloud config set project arenafund

# List secrets
gcloud secrets list

# Check Cloud SQL instances
gcloud sql instances list

# Check Cloud Run services
gcloud run services list --region=us-central1

# Check IAM policies
gcloud projects get-iam-policy arenafund
```

## Rebuild Checklist
When rebuilding the application:
- [ ] Verify all secrets are accessible
- [ ] Test database connectivity
- [ ] Confirm Gmail API delegation
- [ ] Test reCAPTCHA keys
- [ ] Verify Cloud Run deployment pipeline
- [ ] Check domain DNS configuration
