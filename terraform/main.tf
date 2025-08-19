terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "arenafund"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "domain" {
  description = "Primary domain"
  type        = string
  default     = "thearenafund.com"
}

# Outputs
output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}
