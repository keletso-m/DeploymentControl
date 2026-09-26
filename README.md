# DeploymentControl

**A lightweight deployment control plane for managing application deployments, environments, releases, and deployment history.**

DeploymentControl is a cloud-based DevOps platform built with **TypeScript, Next.js, PostgreSQL, AWS, and Vercel**.

It provides a centralized interface for managing application deployments across different environments and deployment targets. It tracks deployment state, maintains release history, captures deployment logs, and provides the foundation for automated CI/CD workflows.

> **Build it. Deploy it. Track it. Roll it back.**

---

## Project Goals

DeploymentCtrl is designed to explore practical **DevOps, cloud, and platform engineering** concepts without attempting to become a full replacement for platforms such as Vercel, GitHub Actions, Kubernetes, or AWS CodeDeploy.

The project focuses on:

* Application and project management
* Deployment orchestration
* Environment management
* Deployment history
* Release tracking
* Deployment logs
* GitHub integration
* CI/CD workflows
* Health checks
* Rollbacks
* Authentication and authorization
* Audit logging
* Cloud deployment
* Production-oriented application architecture

The goal is to understand how **source control, CI/CD, deployment infrastructure, application state, and observability fit together into one system.**

---

# Architecture

```text
                         ┌──────────────────────┐
                         │      Developer       │
                         └──────────┬───────────┘
                                    │
                               git push
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       GitHub         │
                         └──────────┬───────────┘
                                    │
                               Webhook
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │       DeployControl          │
                    │                              │
                    │        Next.js App           │
                    │       API / Control Plane     │
                    └──────────────┬───────────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
          ┌────────────┐    ┌────────────┐    ┌────────────┐
          │ PostgreSQL │    │    AWS     │    │ Deployment │
          │            │    │   Storage  │    │   Engine   │
          └────────────┘    └────────────┘    └─────┬──────┘
                                                     │
                                                     ▼
                                             ┌──────────────┐
                                             │ Deployment   │
                                             │   Target     │
                                             └──────────────┘
```

DeployControl separates the **control plane** from the systems responsible for actually running applications.

The control plane manages:

* What should be deployed
* Where it should be deployed
* Which version should be deployed
* Deployment state
* Deployment history
* Deployment logs
* Health status
* Rollback information

---

# Core Concepts

## Projects

A project represents an application managed by DeployControl.

```text
Project
────────────────────────────

Name:
Portfolio

Repository:
github.com/example/portfolio

Default Branch:
main

Status:
Active
```

Projects contain environments, deployments, releases, and deployment targets.

---

## Environments

Projects can have multiple environments.

```text
Development
Staging
Production
```

Each environment can have its own configuration and deployment target.

Example:

```text
Portfolio
│
├── Development
├── Staging
└── Production
```

This allows deployments to move through a controlled lifecycle.

```text
Development
      ↓
   Staging
      ↓
 Production
```

---

# Deployments

A deployment represents an attempt to release a particular version of an application.

Example:

```text
Deployment #184

Project:
Portfolio

Environment:
Production

Commit:
a82f91c

Status:
SUCCESS

Started:
2026-08-31 18:41

Completed:
2026-08-31 18:42

Duration:
43 seconds
```

Deployments have explicit lifecycle states:

```text
QUEUED
   ↓
BUILDING
   ↓
DEPLOYING
   ↓
HEALTH_CHECK
   ↓
SUCCESS
```

Failures are represented explicitly:

```text
QUEUED
   ↓
BUILDING
   ↓
FAILED
```

---

# Deployment History

Every deployment is preserved as historical information.

```text
DEPLOYMENTS

Version     Status       Environment
──────────────────────────────────────
v1.8.4      SUCCESS      Production
v1.8.3      SUCCESS      Production
v1.8.2      FAILED       Production
v1.8.1      SUCCESS      Production
v1.8.0      SUCCESS      Production
```

A deployment can be inspected to determine:

* What was deployed
* Which commit produced it
* Who initiated it
* Where it was deployed
* When it started
* When it finished
* Whether it succeeded
* What happened during deployment

Deployment history provides an auditable record of application releases.

---

# Deployment Logs

Each deployment can produce logs throughout its lifecycle.

```text
DEPLOYMENT #184

18:41:02  Deployment queued
18:41:04  Source retrieved
18:41:07  Installing dependencies
18:41:21  Building application
18:41:34  Build completed
18:41:36  Starting deployment
18:41:42  Deployment completed
18:41:43  Running health check
18:41:45  Health check passed
18:41:45  Deployment successful
```

Logs allow failed deployments to be investigated without relying solely on a final status.

---

# GitHub Integration

DeployControl can integrate with GitHub repositories through webhooks.

A push to a configured branch can automatically create a deployment.

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    │ webhook
    ▼
DeployControl
    │
    ▼
Create Deployment
    │
    ▼
Build
    │
    ▼
Deploy
    │
    ▼
Health Check
    │
    ▼
SUCCESS / FAILED
```

Example webhook:

```http
POST /api/webhooks/github
```

The deployment system records information such as:

```text
Repository
Branch
Commit SHA
Author
Commit message
Timestamp
```

---

# CI/CD

DeployControl provides the orchestration layer for automated deployments.

A basic CI/CD workflow can be represented as:

```text
Code Change
     │
     ▼
Git Push
     │
     ▼
GitHub Webhook
     │
     ▼
Deployment Created
     │
     ▼
Build
     │
     ▼
Deploy
     │
     ▼
Health Check
     │
     ├───────────────┐
     ▼               ▼
  Healthy          Failed
     │               │
     ▼               ▼
 SUCCESS          FAILURE
```

The platform records each stage so that the complete deployment lifecycle can be inspected.

---

# Rollbacks

Deployments can be reverted to a previous successful release.

Example:

```text
Production

v1.8.4  ← current
v1.8.3
v1.8.2
v1.8.1
```

If `v1.8.4` introduces a problem:

```text
v1.8.4
   │
   │ rollback
   ▼
v1.8.3
```

The rollback itself is recorded as a new deployment event rather than deleting the previous history.

This preserves an accurate deployment timeline.

---

# Health Checks

After deployment, DeployControl can verify that the application is responding correctly.

Example:

```text
Deployment
    ↓
Application started
    ↓
GET /health
    ↓
HTTP 200
    ↓
Deployment successful
```

A failed health check can mark the deployment as failed and prevent the release from being considered healthy.

---

# Deployment Targets

Deployments are performed against configurable targets.

The system uses a target abstraction so that deployment logic is not tightly coupled to one infrastructure provider.

```text
Deployment Target
│
├── Provider
├── Environment
├── Configuration
└── Deployment Strategy
```

Potential targets include:

```text
Vercel
AWS
Self-hosted infrastructure
Container hosts
```

Additional target integrations can be implemented independently.

---

# Data Model

The initial data model is centered around the deployment lifecycle.

```text
User
 │
 └── Organization
       │
       └── Project
             │
             ├── Environment
             │      │
             │      └── Deployment
             │             │
             │             ├── DeploymentLog
             │             └── Release
             │
             └── DeploymentTarget
```

Core entities include:

```text
User
Organization
Project
Environment
Deployment
DeploymentTarget
Release
DeploymentLog
AuditLog
```

---

# Technology Stack

## Frontend

* TypeScript
* Next.js
* React
* HTML
* CSS

## Backend

* Next.js
* TypeScript
* REST APIs / Server Actions where appropriate
* Background processing where required

## Database

* PostgreSQL
* ORM/database layer selected during implementation

## Cloud

* AWS
* Vercel

Potential AWS services include:

* Amazon RDS / PostgreSQL
* Amazon S3
* AWS Lambda where appropriate
* CloudWatch where appropriate

Vercel is used to host the Next.js application.

AWS services are introduced only where they provide a clear architectural purpose.

---

# Project Structure

```text
deploycontrol/
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── deployments/
│   │   ├── environments/
│   │   └── settings/
│   │
│   ├── components/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── deployments/
│   │   ├── github/
│   │   └── health/
│   │
│   ├── services/
│   ├── types/
│   └── config/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── prisma/                 # If Prisma is selected
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── docs/
├── .github/
│   └── workflows/
│
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

The exact structure may evolve during implementation.

---

# API

The application exposes APIs for managing deployment resources.

Example endpoints:

```text
GET    /api/projects
POST   /api/projects

GET    /api/projects/{id}

GET    /api/projects/{id}/deployments
POST   /api/projects/{id}/deployments

GET    /api/deployments/{id}
POST   /api/deployments/{id}/rollback

GET    /api/deployments/{id}/logs

GET    /api/environments
POST   /api/environments

GET    /api/targets
POST   /api/targets

POST   /api/webhooks/github

GET    /api/health
```

API design will follow REST principles where appropriate.

---

# Security

DeployControl handles infrastructure and deployment operations, so security is treated as a core requirement.

The application will implement:

* Authentication
* Authorization
* Project-level access control
* Environment-level permissions where required
* Secure webhook verification
* Secret management
* Input validation
* API authorization
* Audit logging
* Secure handling of deployment credentials

Sensitive credentials should never be committed to source control.

Production secrets should be managed through appropriate environment or cloud secret-management mechanisms.

---

# Audit Logging

Administrative and deployment actions can be recorded as audit events.

Example:

```text
AUDIT LOG

18:41  keletso deployed v1.8.4
18:32  keletso created production environment
17:54  keletso modified deployment target
17:21  admin created project
```

Audit events provide historical context for important changes.

---

# Testing

DeployControl uses automated tests to verify deterministic application behavior.

Testing will cover:

### Unit Tests

* Deployment state transitions
* Permission checks
* Environment rules
* Rollback logic
* Health-check handling

### Integration Tests

* Database operations
* GitHub webhook processing
* Deployment creation
* Deployment state updates

### End-to-End Tests

Important user workflows such as:

```text
Create project
      ↓
Create environment
      ↓
Configure deployment
      ↓
Trigger deployment
      ↓
View deployment
      ↓
Inspect logs
      ↓
Rollback
```

Deployment infrastructure tests should use controlled environments.

---

# Development

## Requirements

* Node.js
* npm / pnpm
* PostgreSQL
* Git
* AWS account for cloud-specific functionality
* Vercel account for deployment

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/deploycontrol.git
cd deploycontrol
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env.local
```

Configure the PostgreSQL connection and other required settings.

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

The application will be available through the local Next.js development server.

---

# Environment Variables

Example:

```env
DATABASE_URL=

NEXTAUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

Actual production secrets must not be committed to the repository.

---

# Deployment

The primary web application is designed to run on **Vercel**.

Cloud resources can be hosted on **AWS**.

Example:

```text
                    Internet
                       │
                       ▼
                    Vercel
                       │
                       ▼
                 Next.js App
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      PostgreSQL      AWS S3      AWS Services
```

The architecture intentionally keeps local development simple while allowing production infrastructure to be introduced progressively.

---

# Roadmap

## Phase 1 — Foundation

* [ ] Next.js application
* [ ] TypeScript configuration
* [ ] PostgreSQL integration
* [ ] Authentication
* [ ] Basic dashboard
* [ ] Project model

## Phase 2 — Deployment Model

* [ ] Environment model
* [ ] Deployment model
* [ ] Deployment targets
* [ ] Deployment states
* [ ] Deployment history
* [ ] Deployment details

## Phase 3 — GitHub Integration

* [ ] GitHub repository connection
* [ ] Webhook handling
* [ ] Commit tracking
* [ ] Automatic deployment creation
* [ ] Branch configuration

## Phase 4 — Deployment Engine

* [ ] Build lifecycle
* [ ] Deployment lifecycle
* [ ] Deployment logs
* [ ] Status tracking
* [ ] Failure handling
* [ ] Health checks

## Phase 5 — Release Management

* [ ] Release history
* [ ] Version tracking
* [ ] Rollback
* [ ] Deployment comparison
* [ ] Deployment timeline

## Phase 6 — Security & Reliability

* [ ] Authorization
* [ ] Secure webhook verification
* [ ] Audit logging
* [ ] Secret management
* [ ] Input validation
* [ ] Error handling

## Phase 7 — Cloud

* [ ] Vercel deployment
* [ ] AWS integration
* [ ] S3 integration where required
* [ ] Cloud monitoring
* [ ] Production configuration

## Phase 8 — Validation

* [ ] Unit tests
* [ ] Integration tests
* [ ] End-to-end tests
* [ ] Deployment failure tests
* [ ] Rollback tests
* [ ] CI pipeline

---

# Design Principles

## Keep the Control Plane Lightweight

DeployControl should orchestrate deployments rather than attempt to replace mature infrastructure platforms.

It should manage:

```text
State
Policy
Orchestration
History
Visibility
```

while delegating infrastructure responsibilities to appropriate platforms.

---

## Explicit State

Deployment state should always be explicit.

```text
QUEUED
BUILDING
DEPLOYING
HEALTH_CHECK
SUCCESS
FAILED
CANCELLED
```

This makes deployment behavior easier to reason about and test.

---

## Historical Evidence

Deployments should not disappear when a newer version is released.

The system should preserve:

```text
Who
What
Where
When
Result
Logs
```

for every deployment.

---

## Failure First

Deployment systems must assume that failures will occur.

The system should handle:

* Failed builds
* Deployment failures
* Timeouts
* Health-check failures
* Invalid configuration
* Lost deployment workers
* Duplicate webhooks

without corrupting deployment state.

---

## Least Privilege

Deployment credentials should receive only the permissions necessary to perform their intended operations.

Production deployment access should be treated as a privileged operation.

---

# What DeployControl Is Not

DeployControl is intentionally **not**:

* A replacement for Vercel
* A replacement for GitHub Actions
* A Kubernetes platform
* A container orchestrator
* A cloud provider
* A complete infrastructure-as-code platform
* An enterprise CI/CD platform

The purpose is to build a focused deployment control plane that demonstrates practical DevOps and software engineering concepts.

---

# Project Status

**Active Development**

DeployControl is a personal engineering project focused on developing practical experience with:

* TypeScript
* Next.js
* PostgreSQL
* Cloud architecture
* AWS
* Vercel
* CI/CD
* Deployment orchestration
* Webhooks
* REST API design
* Authentication and authorization
* Database design
* Observability
* Testing
* Production-oriented software engineering

The project is developed incrementally, with functionality added only after the underlying system is understood and tested.

---

# License

MIT License — see [`LICENSE`](LICENSE).
