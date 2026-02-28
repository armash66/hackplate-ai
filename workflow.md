# HackPlate AI Workflow Integration Spec
Version: 1.0
Status: Active
Purpose: Apply structured AI-driven development methodologies to HackPlate SaaS.

---

# 1. Objective

This document defines how HackPlate development must follow a structured,
spec-driven, verification-oriented workflow inspired by modern AI development
systems such as Superpowers and GSD.

The goal is:

- Eliminate chaotic feature building
- Prevent vibecoding
- Enforce spec-first execution
- Improve UI consistency
- Maintain SaaS-grade discipline

This is not a tool dependency.
This is a workflow enforcement document.

---

# 2. Development Lifecycle (Mandatory for Every Feature)

Every feature must pass through the following phases:

---

## Phase 1: Problem Definition

Before writing any code, define:

- What user problem is being solved?
- What measurable outcome defines success?
- What is explicitly NOT included in this feature?

Output format:

Feature Name:
User Problem:
Expected Outcome:
Out of Scope:

No feature begins without this section completed.

---

## Phase 2: Spec & Micro-Task Decomposition

Break feature into:

1. Database changes
2. Backend API changes
3. Business logic layer updates
4. Frontend UI changes
5. Edge cases
6. Security considerations
7. Testing plan

Checklist must be written before implementation.

---

## Phase 3: Data Model Design

Define:

- New tables
- New columns
- Indexes required
- Constraints (unique, foreign keys)
- Migration plan

No schema guessing during implementation.

---

## Phase 4: API Contract Definition

Define:

Endpoint:
Method:
Request Schema:
Response Schema:
Error Cases:
Authentication Required: Yes/No

Backend must conform strictly to contract.

---

## Phase 5: Implementation

Order:

1. Database migration
2. Backend logic
3. Validation layer
4. Tests for critical logic
5. Frontend integration
6. UI state handling

No skipping validation.

---

## Phase 6: Verification & Code Review

Before merging:

- No secrets in code
- All inputs validated
- All URLs sanitized
- No raw HTML injection (XSS prevention)
- All external API calls handled safely
- No console.log left in production code

---

# 3. HackPlate Ingestion Architecture Standard

All ingestion sources must normalize to:

{
  title: string,
  description: string,
  url: string,
  location_text: string,
  latitude: number | null,
  longitude: number | null,
  source: string,
  created_at: timestamp
}

No source may bypass normalization.

---

# 4. Deduplication Standard

Events are considered duplicates if:

- URL matches exactly
OR
- Title similarity > 85% AND same event date

Deduplication must occur before scoring.

---

# 5. Intelligence & Scoring Standard

Food score components:

- Explicit mention of food-related keywords
- Sponsor presence
- Event duration
- Venue type

Relevance score components:

- Hackathon relevance keywords
- Technical tags
- Event format

Final score:

relevance_score + food_score + quality_weight

Expose:
- food_score
- relevance_score
- total_score

---

# 6. Location Intelligence Standard

All events must support:

- Latitude & Longitude storage
- Haversine-based radius search
- Online / Offline classification

API must support:

GET /events?lat=&lon=&radius=&min_score=

---

# 7. Notifications Framework

Notification rules must include:

- User ID
- Latitude
- Longitude
- Radius
- Minimum score
- Food required (boolean)

Evaluation must occur during ingestion cycle.

Telegram is primary.
Email is secondary.

---

# 8. UI/UX System Enforcement

HackPlate must maintain:

## Color System

- 1 Primary
- 1 Accent
- Neutral background scale

## Typography

- Heading scale (H1–H4)
- Body scale
- Label scale

## Spacing

- 8px grid system

## Components

Standardized:

- Cards
- Buttons
- Badges
- Input fields
- Map popups

No inline random styling allowed.

---

# 9. Security Standards

Mandatory:

- .env never committed
- JWT verification enforced
- Clerk tokens validated server-side
- URL validation (http/https only)
- No direct innerHTML injection
- CORS explicitly configured

---

# 10. Observability Standard

Track:

- Ingestion runs
- Events added per run
- Failed source count
- Average score per day
- Source reliability score

Expose via analytics dashboard.

---

# 11. Knowledge Management Pattern

All feature specs must live in:

docs/features/

Each feature has:

- spec.md
- tasks.md
- implementation_notes.md

No undocumented feature merges allowed.

---

# 12. Long-Term Vision Alignment

HackPlate is evolving toward:

A location-aware AI-powered student opportunity radar.

Not just an event scraper.
Not just a dashboard.

A discovery intelligence platform.

---

End of Document