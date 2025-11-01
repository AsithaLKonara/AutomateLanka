# Autolanka API Documentation

## Overview

The Autolanka API provides comprehensive endpoints for managing automation workflows, media processing, AI-powered content generation, social media publishing, analytics, and more.

**Base URL**: `http://localhost:8000/api` (development) or `https://api.autolanka.com/api` (production)

## Authentication

All API endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are rate-limited per user:
- **General endpoints**: 100 requests per 15 minutes
- **Upload endpoints**: 20 requests per 15 minutes
- **Social media endpoints**: 50 requests per 15 minutes

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": { ... }
}
```

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### User Management

#### GET /api/users/profile
Get current user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "clerkId": "clerk-user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "imageUrl": "https://example.com/avatar.jpg",
      "profile": {
        "company": "Example Corp",
        "phone": "+1234567890",
        "timezone": "UTC",
        "language": "en"
      }
    }
  }
}
```

#### PUT /api/users/profile
Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "company": "Example Corp",
  "phone": "+1234567890",
  "timezone": "America/New_York",
  "language": "en"
}
```

#### GET /api/users/notification-preferences
Get user notification preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "email": true,
      "push": true,
      "sms": false,
      "workflowUpdates": true,
      "systemAlerts": true,
      "marketing": false
    }
  }
}
```

#### PUT /api/users/notification-preferences
Update notification preferences.

**Request Body:**
```json
{
  "email": true,
  "push": true,
  "sms": false,
  "workflowUpdates": true,
  "systemAlerts": true,
  "marketing": false
}
```

#### GET /api/users/security-settings
Get user security settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "twoFactor": false,
      "sessionTimeout": 30,
      "loginAlerts": true,
      "deviceManagement": true
    }
  }
}
```

#### PUT /api/users/security-settings
Update security settings.

**Request Body:**
```json
{
  "twoFactor": true,
  "sessionTimeout": 60,
  "loginAlerts": true,
  "deviceManagement": true
}
```

#### GET /api/users/dashboard-stats
Get dashboard statistics for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMedia": 42,
      "totalPosts": 18,
      "activeWorkflows": 5,
      "scheduledPosts": 12
    }
  }
}
```

#### GET /api/users/recent-activity
Get recent activity for the current user.

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "activity": [
      {
        "id": "activity-1",
        "type": "media",
        "title": "New video uploaded: Introduction to Automation",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "completed"
      },
      {
        "id": "activity-2",
        "type": "workflow",
        "title": "Social media automation executed",
        "timestamp": "2024-01-15T09:15:00Z",
        "status": "completed"
      }
    ]
  }
}
```

### Media Management

#### POST /api/media/upload
Upload media files to the platform.

**Request:** Multipart form data
- `file`: Media file (image, video, audio)
- `title`: File title
- `description`: File description
- `brandId`: Brand ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "media": {
      "id": "media-id",
      "title": "My Video",
      "type": "video",
      "url": "https://storage.example.com/media/video.mp4",
      "thumbnailUrl": "https://storage.example.com/thumbnails/video.jpg",
      "duration": 120,
      "size": 15728640,
      "status": "processing"
    }
  }
}
```

#### GET /api/media
Get list of media files.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by media type
- `brandId` (optional): Filter by brand

**Response:**
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "id": "media-id",
        "title": "My Video",
        "type": "video",
        "url": "https://storage.example.com/media/video.mp4",
        "thumbnailUrl": "https://storage.example.com/thumbnails/video.jpg",
        "duration": 120,
        "size": 15728640,
        "status": "completed",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Content Generation

#### POST /api/content/generate
Generate AI-powered content.

**Request Body:**
```json
{
  "contentType": "social_post",
  "sourceText": "Our new product launch is amazing!",
  "brandVoice": "professional",
  "platform": "instagram",
  "customPrompt": "Make it more engaging",
  "maxLength": 280
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "🚀 Exciting news! Our latest product launch is absolutely incredible! Discover the innovation that's changing the game. #Innovation #ProductLaunch #GameChanger",
    "hashtags": ["#Innovation", "#ProductLaunch", "#GameChanger"],
    "suggestions": ["Consider adding a call-to-action", "Include relevant industry hashtags"],
    "metadata": {
      "wordCount": 25,
      "characterCount": 156,
      "sentiment": "positive",
      "confidence": 0.95
    }
  }
}
```

### Social Media Publishing

#### POST /api/social-media/publish
Publish content to social media platforms.

**Request Body:**
```json
{
  "content": "Check out our latest update!",
  "platforms": ["instagram", "twitter", "linkedin"],
  "mediaIds": ["media-id-1", "media-id-2"],
  "scheduleAt": "2024-01-15T15:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publication": {
      "id": "pub-id",
      "status": "scheduled",
      "platforms": ["instagram", "twitter", "linkedin"],
      "scheduledAt": "2024-01-15T15:00:00Z",
      "estimatedReach": 5000
    }
  }
}
```

### Analytics

#### GET /api/analytics/overview
Get analytics overview.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `platform` (optional): Filter by platform

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPosts": 150,
      "totalReach": 125000,
      "totalEngagement": 8500,
      "engagementRate": 6.8,
      "topPerformingPost": {
        "id": "post-id",
        "title": "Viral Content",
        "engagement": 2500,
        "reach": 15000
      }
    }
  }
}
```

### Workflow Marketplace

#### GET /api/marketplace/templates
Browse workflow templates.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search term
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template-id",
        "title": "Social Media Automation",
        "description": "Automatically post content across platforms",
        "category": "social_media",
        "tags": ["automation", "social", "content"],
        "price": 0,
        "rating": 4.8,
        "downloads": 1250,
        "preview": "https://example.com/preview.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Notifications

#### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type
- `read` (optional): Filter by read status

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-id",
        "title": "Workflow Completed",
        "message": "Your social media automation workflow has completed successfully",
        "type": "success",
        "priority": "medium",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### PUT /api/notifications/:id
Update notification (mark as read, archive, etc.).

**Request Body:**
```json
{
  "read": true,
  "archived": false
}
```

### Integrations

#### GET /api/integrations
Get organization integrations.

**Response:**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "integration-id",
        "name": "Slack Integration",
        "type": "webhook",
        "provider": "slack",
        "isActive": true,
        "lastSync": "2024-01-15T10:30:00Z",
        "syncStatus": "success"
      }
    ]
  }
}
```

#### POST /api/integrations
Create new integration.

**Request Body:**
```json
{
  "name": "Slack Integration",
  "type": "webhook",
  "provider": "slack",
  "config": {
    "webhookUrl": "https://hooks.slack.com/services/...",
    "channels": ["general", "announcements"]
  }
}
```

### Health Check

#### GET /api/health
Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "storage": "healthy",
      "ml_service": "healthy"
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @autolanka/sdk
```

```javascript
import { AutolankaClient } from '@autolanka/sdk'

const client = new AutolankaClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.autolanka.com'
})

// Generate content
const content = await client.content.generate({
  contentType: 'social_post',
  sourceText: 'Hello world!',
  brandVoice: 'professional'
})
```

### Python
```bash
pip install autolanka-sdk
```

```python
from autolanka import AutolankaClient

client = AutolankaClient(
    api_key='your-api-key',
    base_url='https://api.autolanka.com'
)

# Generate content
content = client.content.generate(
    content_type='social_post',
    source_text='Hello world!',
    brand_voice='professional'
)
```

## Webhooks

Autolanka supports webhooks for real-time notifications. Configure webhooks in your dashboard to receive events when:

- Workflows complete or fail
- Content is published
- New media is processed
- Analytics data is updated

### Webhook Events

| Event | Description |
|-------|-------------|
| `workflow.completed` | Workflow execution completed |
| `workflow.failed` | Workflow execution failed |
| `content.published` | Content published to social media |
| `media.processed` | Media file processing completed |
| `analytics.updated` | Analytics data updated |

### Webhook Payload

```json
{
  "event": "workflow.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "workflowId": "workflow-id",
    "executionId": "execution-id",
    "status": "completed",
    "duration": 120,
    "results": { ... }
  }
}
```

## Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| File Upload | 20 requests | 15 minutes |
| Social Media | 50 requests | 15 minutes |
| Analytics | 200 requests | 15 minutes |
| Webhooks | 1000 requests | 15 minutes |

## Support

For API support and questions:
- Email: api-support@autolanka.com
- Documentation: https://docs.autolanka.com
- Status Page: https://status.autolanka.com

