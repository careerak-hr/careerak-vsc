# Content Sharing API Reference

> **Careerak Platform** — Developer Documentation  
> Feature: Content Sharing System  
> Languages supported: Arabic (ar), English (en), French (fr)

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Share Link Format](#share-link-format)
5. [UTM Parameter Conventions](#utm-parameter-conventions)
6. [Share Endpoints](#share-endpoints)
   - [POST /api/shares](#post-apishares)
   - [GET /api/shares/:contentType/:contentId](#get-apisharescontenttypecontentid)
   - [GET /api/shares/analytics](#get-apisharesanalytics)
   - [GET /api/shares/analytics/summary](#get-apisharesanalyticssummary)
   - [GET /api/shares/analytics/by-platform](#get-apisharesanalyticsby-platform)
   - [GET /api/shares/analytics/top-content](#get-apisharesanalyticstop-content)
   - [GET /api/shares/analytics/export](#get-apisharesanalyticsexport)
7. [Metadata Endpoints](#metadata-endpoints)
   - [GET /api/metadata/job/:id](#get-apimetadatajobid)
   - [GET /api/metadata/course/:id](#get-apimetadatacourseid)
   - [GET /api/metadata/profile/:id](#get-apimetadataprofileid)
   - [GET /api/metadata/company/:id](#get-apimetadatacompanyid)
8. [Error Codes](#error-codes)
9. [Content Types Reference](#content-types-reference)
10. [Share Methods Reference](#share-methods-reference)

---

## Overview

The Content Sharing API allows recording share events, retrieving share analytics, and generating rich social media metadata (Open Graph + Twitter Cards) for all shareable content on the Careerak platform.

Shareable content types:
- **job** — Job postings
- **course** — Educational courses
- **profile** — User profiles
- **company** — Company profiles

---

## Base URL

```
https://careerak.com/api
```

All endpoints are prefixed with `/api`.

---

## Authentication

Most read endpoints are **public** (no authentication required). Write endpoints and admin-only endpoints require a JWT Bearer token.

```
Authorization: Bearer <token>
```

| Endpoint | Auth Required |
|----------|--------------|
| POST /api/shares | Optional (user may or may not be logged in) |
| GET /api/shares/:contentType/:contentId | ❌ Public |
| GET /api/shares/analytics | ❌ Public |
| GET /api/shares/analytics/summary | ❌ Public |
| GET /api/shares/analytics/by-platform | ❌ Public |
| GET /api/shares/analytics/top-content | ❌ Public |
| GET /api/shares/analytics/export | ✅ Admin only |
| GET /api/metadata/* | ❌ Public |

---

## Share Link Format

Share links follow this structure:

**Direct SPA links** (internal sharing, copy link):
```
https://careerak.com/{contentTypePath}/{contentId}
```

**Social media share links** (with OG/Twitter meta tags served by backend):
```
https://careerak.com/share/{contentType}/{contentId}?{utmParams}
```

### Content Type Path Mapping

| contentType | SPA path | Share HTML path |
|-------------|----------|-----------------|
| `job` | `/job-postings/{id}` | `/share/job/{id}` |
| `course` | `/courses/{id}` | `/share/course/{id}` |
| `profile` | `/profile/{id}` | `/share/profile/{id}` |
| `company` | `/companies/{id}` | `/share/company/{id}` |

**Example — Job share link for Facebook:**
```
https://careerak.com/share/job/64abc123?utm_source=facebook&utm_medium=social&utm_campaign=share_job
```

**Example — Course copy link:**
```
https://careerak.com/courses/64def456
```

---

## UTM Parameter Conventions

UTM parameters are automatically appended to share links for external (social/messaging/email) share methods.

| shareMethod | utm_source | utm_medium | utm_campaign |
|-------------|-----------|------------|--------------|
| `facebook` | `facebook` | `social` | `share_{contentType}` |
| `twitter` | `twitter` | `social` | `share_{contentType}` |
| `linkedin` | `linkedin` | `social` | `share_{contentType}` |
| `whatsapp` | `whatsapp` | `messaging` | `share_{contentType}` |
| `telegram` | `telegram` | `messaging` | `share_{contentType}` |
| `email` | `email` | `email` | `share_{contentType}` |
| `copy_link` | — | — | — (no UTM) |
| `internal_chat` | — | — | — (no UTM) |
| `native` | — | — | — (no UTM) |

---

## Share Endpoints

### POST /api/shares

Record a share event when a user shares content.

**Auth:** Optional (JWT Bearer token)

**Request Body:**

```json
{
  "contentType": "job",
  "contentId": "64abc1234567890abcdef123",
  "shareMethod": "facebook"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contentType` | string | ✅ | One of: `job`, `course`, `profile`, `company` |
| `contentId` | string | ✅ | MongoDB ObjectId of the content item |
| `shareMethod` | string | ✅ | See [Share Methods Reference](#share-methods-reference) |

**Success Response — 201 Created:**

```json
{
  "success": true,
  "data": {
    "_id": "64xyz9876543210fedcba987",
    "contentType": "job",
    "contentId": "64abc1234567890abcdef123",
    "userId": "64user123456789abcdef000",
    "shareMethod": "facebook",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 400 — Missing required fields
{
  "success": false,
  "error": "contentType, contentId, and shareMethod are required"
}

// 400 — Invalid contentType or shareMethod
{
  "success": false,
  "error": "Invalid contentType: unknown"
}

// 403 — Private profile shared externally
{
  "success": false,
  "error": "Profile is private and cannot be shared externally"
}
```

---

### GET /api/shares/:contentType/:contentId

Get the share count and breakdown by method for a specific content item.

**Auth:** ❌ Public

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `contentType` | string | One of: `job`, `course`, `profile`, `company` |
| `contentId` | string | MongoDB ObjectId of the content item |

**Example Request:**
```
GET /api/shares/job/64abc1234567890abcdef123
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "contentType": "job",
    "contentId": "64abc1234567890abcdef123",
    "totalShares": 42,
    "sharesByMethod": [
      { "_id": "whatsapp", "count": 18 },
      { "_id": "linkedin", "count": 12 },
      { "_id": "copy_link", "count": 7 },
      { "_id": "facebook", "count": 5 }
    ]
  }
}
```

---

### GET /api/shares/analytics

Get share analytics, optionally filtered by content type and content ID.

**Auth:** ❌ Public

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `contentType` | string | ❌ | Filter by content type |
| `contentId` | string | ❌ | Filter by content ID |

**Example Request:**
```
GET /api/shares/analytics?contentType=job&contentId=64abc1234567890abcdef123
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "totalShares": 42,
    "sharesByMethod": [
      { "_id": "whatsapp", "count": 18 },
      { "_id": "linkedin", "count": 12 }
    ],
    "analytics": {
      "contentType": "job",
      "contentId": "64abc1234567890abcdef123",
      "totalShares": 42,
      "sharesByMethod": {
        "facebook": 5,
        "linkedin": 12,
        "whatsapp": 18,
        "copy_link": 7
      }
    }
  }
}
```

---

### GET /api/shares/analytics/summary

Get a summary of total shares grouped by content type, with optional date range filtering.

**Auth:** ❌ Public

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | `30` | Number of past days to include (ignored if `startDate` is set) |
| `startDate` | string (ISO 8601) | — | Start of date range (e.g. `2026-01-01`) |
| `endDate` | string (ISO 8601) | now | End of date range |

**Example Requests:**
```
GET /api/shares/analytics/summary
GET /api/shares/analytics/summary?days=7
GET /api/shares/analytics/summary?startDate=2026-01-01&endDate=2026-03-31
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "byContentType": [
      { "_id": "job", "count": 780 },
      { "_id": "course", "count": 310 },
      { "_id": "company", "count": 100 },
      { "_id": "profile", "count": 60 }
    ],
    "period": 30,
    "startDate": "2026-02-13T00:00:00.000Z",
    "endDate": "2026-03-15T23:59:59.999Z"
  }
}
```

---

### GET /api/shares/analytics/by-platform

Get shares grouped by share method/platform, with optional date range filtering.

**Auth:** ❌ Public

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | `30` | Number of past days to include |
| `startDate` | string (ISO 8601) | — | Start of date range |
| `endDate` | string (ISO 8601) | now | End of date range |

**Example Request:**
```
GET /api/shares/analytics/by-platform?days=7
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "byPlatform": [
      { "_id": "whatsapp", "count": 420 },
      { "_id": "linkedin", "count": 310 },
      { "_id": "copy_link", "count": 280 },
      { "_id": "facebook", "count": 150 },
      { "_id": "twitter", "count": 55 },
      { "_id": "telegram", "count": 25 },
      { "_id": "email", "count": 10 }
    ],
    "period": 7,
    "startDate": "2026-03-08T00:00:00.000Z",
    "endDate": "2026-03-15T23:59:59.999Z"
  }
}
```

---

### GET /api/shares/analytics/top-content

Get the top most-shared content items, with optional date range filtering.

**Auth:** ❌ Public

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | `10` | Maximum number of results to return |
| `days` | number | `30` | Number of past days to include |
| `startDate` | string (ISO 8601) | — | Start of date range |
| `endDate` | string (ISO 8601) | now | End of date range |

**Example Request:**
```
GET /api/shares/analytics/top-content?limit=5&days=7
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "topContent": [
      {
        "contentType": "job",
        "contentId": "64abc1234567890abcdef123",
        "shareCount": 87
      },
      {
        "contentType": "course",
        "contentId": "64def4567890abcdef123456",
        "shareCount": 54
      },
      {
        "contentType": "job",
        "contentId": "64ghi7890abcdef123456789",
        "shareCount": 41
      }
    ],
    "period": 7,
    "startDate": "2026-03-08T00:00:00.000Z",
    "endDate": "2026-03-15T23:59:59.999Z"
  }
}
```

---

### GET /api/shares/analytics/export

Export analytics data as a downloadable file. **Admin only.**

**Auth:** ✅ Required (Admin role)

**Query Parameters:**

| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `format` | string | `json` | `json`, `csv` | Output file format |
| `type` | string | `all` | `summary`, `by-platform`, `top-content`, `all` | Which data to include |
| `days` | number | `30` | — | Number of past days |
| `startDate` | string (ISO 8601) | — | — | Start of date range |
| `endDate` | string (ISO 8601) | now | — | End of date range |

**Example Requests:**
```
GET /api/shares/analytics/export?format=csv&type=all&days=30
GET /api/shares/analytics/export?format=json&type=summary&startDate=2026-01-01
```

**Success Response — 200 OK (JSON format):**

The response is a file download with `Content-Disposition: attachment; filename="share-analytics-{date}.json"`.

```json
{
  "exportedAt": "2026-03-15T10:30:00.000Z",
  "period": {
    "startDate": "2026-02-13T00:00:00.000Z",
    "endDate": "2026-03-15T23:59:59.999Z",
    "days": 30
  },
  "summary": {
    "total": 1250,
    "byContentType": [
      { "_id": "job", "count": 780 }
    ]
  },
  "byPlatform": [
    { "_id": "whatsapp", "count": 420 }
  ],
  "topContent": [
    { "contentType": "job", "contentId": "64abc123...", "shareCount": 87 }
  ]
}
```

**Success Response — 200 OK (CSV format):**

```
Type,Content Type,Count
summary,all,1250
summary,job,780
summary,course,310

Platform,Share Count
whatsapp,420
linkedin,310

Content Type,Content ID,Share Count
job,64abc123...,87
course,64def456...,54
```

**Error Response:**
```json
// 403 — Non-admin user
{
  "success": false,
  "error": "Forbidden. Admin access required."
}
```

---

## Metadata Endpoints

These endpoints return Open Graph and Twitter Card meta tags for use in HTML `<head>` sections, enabling rich social media previews when content links are shared.

All metadata endpoints are **public** and require no authentication.

### Response Structure

All metadata endpoints return the same shape:

```json
{
  "success": true,
  "data": {
    "openGraph": {
      "og:title": "...",
      "og:description": "...",
      "og:image": "https://...",
      "og:url": "https://careerak.com/...",
      "og:type": "website",
      "og:site_name": "Careerak"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:site": "@careerak",
      "twitter:title": "...",
      "twitter:description": "...",
      "twitter:image": "https://..."
    }
  }
}
```

**Error Response (content not found):**
```json
{
  "success": false,
  "error": "Content not found"
}
```

---

### GET /api/metadata/job/:id

Get Open Graph and Twitter Card metadata for a job posting.

**Auth:** ❌ Public

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the job posting |

**Example Request:**
```
GET /api/metadata/job/64abc1234567890abcdef123
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "openGraph": {
      "og:title": "Senior Frontend Developer - TechCorp",
      "og:description": "Remote | 8,000 - 12,000 | We are looking for an experienced frontend developer...",
      "og:image": "https://res.cloudinary.com/careerak/image/upload/company-logo.jpg",
      "og:url": "https://careerak.com/job-postings/64abc1234567890abcdef123",
      "og:type": "website",
      "og:site_name": "Careerak"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:site": "@careerak",
      "twitter:title": "Senior Frontend Developer - TechCorp",
      "twitter:description": "Remote | 8,000 - 12,000 | We are looking for an experienced frontend developer...",
      "twitter:image": "https://res.cloudinary.com/careerak/image/upload/company-logo.jpg"
    }
  }
}
```

**Metadata fields populated from:**
- `og:title` — `{job.title} - {company.name}`
- `og:description` — Location, salary range, and truncated description (max 200 chars)
- `og:image` — Company logo, falls back to `/images/default-job.jpg`
- `og:url` — `https://careerak.com/job-postings/{id}`
- `twitter:card` — Always `summary_large_image` for jobs

---

### GET /api/metadata/course/:id

Get Open Graph and Twitter Card metadata for an educational course.

**Auth:** ❌ Public

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the course |

**Example Request:**
```
GET /api/metadata/course/64def4567890abcdef123456
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "openGraph": {
      "og:title": "Complete React Development Course",
      "og:description": "Ahmed Khalil | 24h | ★ 4.8 | Master React from basics to advanced patterns...",
      "og:image": "https://res.cloudinary.com/careerak/image/upload/course-thumbnail.jpg",
      "og:url": "https://careerak.com/courses/64def4567890abcdef123456",
      "og:type": "website",
      "og:site_name": "Careerak"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:site": "@careerak",
      "twitter:title": "Complete React Development Course",
      "twitter:description": "Ahmed Khalil | 24h | ★ 4.8 | Master React from basics to advanced patterns...",
      "twitter:image": "https://res.cloudinary.com/careerak/image/upload/course-thumbnail.jpg"
    }
  }
}
```

**Metadata fields populated from:**
- `og:title` — `course.title`
- `og:description` — Instructor name, duration, rating, and truncated description (max 200 chars)
- `og:image` — Course thumbnail, falls back to `/images/default-course.jpg`
- `og:url` — `https://careerak.com/courses/{id}`
- `twitter:card` — Always `summary_large_image` for courses

---

### GET /api/metadata/profile/:id

Get Open Graph and Twitter Card metadata for a user profile.

**Auth:** ❌ Public

> **Privacy note:** Returns `404` if the user's `profileVisibility` setting is `none`. Only profiles with visibility set to `everyone` (default) are publicly shareable.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the user |

**Example Request:**
```
GET /api/metadata/profile/64user1234567890abcdef00
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "openGraph": {
      "og:title": "Sara Mansour - UX Designer",
      "og:description": "UX Designer | Figma, Adobe XD, Prototyping | Passionate about creating user-centered designs...",
      "og:image": "https://res.cloudinary.com/careerak/image/upload/w_400,h_400,c_fill,g_face/profile-pic.jpg",
      "og:url": "https://careerak.com/profile/64user1234567890abcdef00",
      "og:type": "profile",
      "og:site_name": "Careerak",
      "profile:first_name": "Sara",
      "profile:last_name": "Mansour"
    },
    "twitterCard": {
      "twitter:card": "summary",
      "twitter:site": "@careerak",
      "twitter:creator": "@careerak",
      "twitter:title": "Sara Mansour - UX Designer",
      "twitter:description": "UX Designer | Figma, Adobe XD, Prototyping | Passionate about creating user-centered designs...",
      "twitter:image": "https://res.cloudinary.com/careerak/image/upload/w_400,h_400,c_fill,g_face/profile-pic.jpg"
    }
  }
}
```

**Metadata fields populated from:**
- `og:title` — `{firstName} {lastName} - {specialization}` (or just full name if no specialization)
- `og:description` — Specialization, top 5 skills, and bio (max 200 chars)
- `og:image` — Profile picture (Cloudinary 400×400 face-crop), falls back to `/images/default-profile.jpg`
- `og:url` — `https://careerak.com/profile/{id}`
- `og:type` — `profile`
- `twitter:card` — `summary` for profiles

---

### GET /api/metadata/company/:id

Get Open Graph and Twitter Card metadata for a company profile.

**Auth:** ❌ Public

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the company |

**Example Request:**
```
GET /api/metadata/company/64comp1234567890abcdef00
```

**Success Response — 200 OK:**

```json
{
  "success": true,
  "data": {
    "openGraph": {
      "og:title": "TechCorp Solutions",
      "og:description": "Information Technology | 500 employees | 12 open positions | Leading software development company...",
      "og:image": "https://res.cloudinary.com/careerak/image/upload/company-logo.jpg",
      "og:url": "https://careerak.com/companies/64comp1234567890abcdef00",
      "og:type": "profile",
      "og:site_name": "Careerak"
    },
    "twitterCard": {
      "twitter:card": "summary",
      "twitter:site": "@careerak",
      "twitter:title": "TechCorp Solutions",
      "twitter:description": "Information Technology | 500 employees | 12 open positions | Leading software development company...",
      "twitter:image": "https://res.cloudinary.com/careerak/image/upload/company-logo.jpg"
    }
  }
}
```

**Metadata fields populated from:**
- `og:title` — `company.companyName`
- `og:description` — Industry, employee count, active job count, and description (max 200 chars)
- `og:image` — Company logo, falls back to `/images/default-company.jpg`
- `og:url` — `https://careerak.com/companies/{id}`
- `og:type` — `profile`
- `twitter:card` — `summary` for companies

---

## Error Codes

| HTTP Status | Meaning | When it occurs |
|-------------|---------|----------------|
| `200` | OK | Successful read |
| `201` | Created | Share event recorded successfully |
| `400` | Bad Request | Missing required fields, invalid `contentType` or `shareMethod` |
| `403` | Forbidden | Sharing a private profile externally; non-admin accessing export endpoint |
| `404` | Not Found | Content item does not exist; private profile metadata requested |
| `429` | Too Many Requests | Share spam detected (rate limit exceeded) |
| `500` | Internal Server Error | Unexpected server error |

### Standard Error Response Shape

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## Content Types Reference

| Value | Description | Public URL |
|-------|-------------|------------|
| `job` | Job posting | `/job-postings/{id}` |
| `course` | Educational course | `/courses/{id}` |
| `profile` | User profile | `/profile/{id}` |
| `company` | Company profile | `/companies/{id}` |

---

## Share Methods Reference

| Value | Type | Description | UTM medium |
|-------|------|-------------|------------|
| `facebook` | External | Share via Facebook | `social` |
| `twitter` | External | Share via Twitter/X | `social` |
| `linkedin` | External | Share via LinkedIn | `social` |
| `whatsapp` | External | Share via WhatsApp | `messaging` |
| `telegram` | External | Share via Telegram | `messaging` |
| `email` | External | Share via email client | `email` |
| `copy_link` | Internal | Copy link to clipboard | — |
| `internal_chat` | Internal | Share via in-app chat | — |
| `native` | Internal | Native device share sheet | — |

External methods trigger UTM parameter generation and use the `/share/{contentType}/{id}` backend route so social media crawlers receive proper Open Graph and Twitter Card meta tags.

Internal methods use the direct SPA route (`/job-postings/{id}`, etc.) with no UTM parameters.
