# Lumber SDR CRM

A local-first mini CRM system for managing construction leads with automated follow-up based on activity logging and **Jarvis/OpenClaw Ready API surface**. Built with React, Node.js, Express, and SQLite with complete activity tracking and lead stage automation.

## 🚀 What's New - Today Queue & Jarvis Integration

✅ **API Key Authentication** - Secure agent access to API
✅ **Today Queue System** - Automated hit list of leads due for action
✅ **Jarvis-Ready APIs** - Integration endpoints for AI agents
✅ **Dashboard** - Quick action hub for daily sales activities
✅ **Business Days Logic** - Proper date calculations

## Jarvis/API Integration Guide

### Authentication
Your agent needs an API key for external access:
- **For Jarvis/OpenClaw**: Always include `X-API-KEY` header
- **For Web UI (development)**: Headers allowed automatically
- **For /api/health**: No API key required

### API Key Setup
```bash
cd server
echo "API_KEY=your-secret-api-key-123456" >> .env
npm run dev
```

### Testing Jarvis Connection

**1. Test authentication:**
```bash
curl -H "X-API-KEY: your-secret-api-key-123456" \
     http://127.0.0.1:3030/api/queue/today
```

**2. View today's work:**
```bash
curl -X GET -H "X-API-KEY: your-secret-api-key-123456" \
     http://127.0.0.1:3030/api/queue/today
```
Response:
```json
[{
  "lead_id": "abc-123",
  "company_name": "BuildRight LLC",
  "score": 85,
  "recommended_angle": "Prevailing wage automation",
  "next_action": "Call back",
  "next_action_date": "2026-02-14",
  "stage": "ATTEMPTING",
  "top_reasons": ["30-300 employees", "Manual workflow"],
  "primary_contact": {
    "name": "John Smith",
    "email": "john@buildright.com"
  }
}]
```

**3. Quick activity log from Jarvis:**
```bash
curl -X POST -H "X-API-KEY: your-secret-api-key-123456" \
     -H "Content-Type: application/json" \
     http://127.0.0.1:3030/api/activities \
     -d '{
       "leadId": "abc-123",
       "type": "call",
       "result": "connected",
       "notes": "Spoke with decision maker via Jarvis automation"
     }'
```

## 🎯 Today Queue System

**Endpoint:** `GET /api/queue/today`

**Returns:** Leads due for action today, sorted by:
1. **Next action date** (ascending, NULLs last)
2. **Score** (descending)
3. **Updated at** (descending)

### Business Logic
**Includes leads where:**
- Stages: QUEUED, ATTEMPTING, WORKING, ENGAGED, NEW
- NOT in: MEETING_SET, CLOSED_LOST
- NOT marked: do-not-contact
- AND (next_action_date ≤ today OR null next_action_date with qualifying stage)

## 🗓️ Daily Usage Flow

### 1. Start Dashboard
- **Browser**: http://127.0.0.1:5173 (dashboard as home)
- **API**: `GET /api/queue/today` (with API key)

### 2. Quick Actions Available
**Dashboard buttons provide:**
- Log call no answer (auto updates to ATTEMPTING)
- Log email sent (auto updates to ATTEMPTING)
- Set do not contact
- Click company → detailed view

### 3. Complete API Testing

**Full test sequence:**
```bash
# Apply database updates
npm run db:push
npm run db:seed

# Start services
cd server && npm run dev    # Backend on 127.0.0.1:3030
cd web && npm run dev       # Frontend on 127.0.0.1:5173

# Test end-to-end:
## 1. Login to dashboard: http://127.0.0.1:5173/
## 2. View today's queue: dashboard shows due leads
## 3. Quick log from dashboard: buttons update leads
## 4. Verify with API: curl commands above
## 5. Test automation: see status/stage updates
```

## 📊 API Endpoints for Jarvis
All require `X-API-KEY` header except /api/health and UI origins.

- `GET /api/queue/today` - Today's hit list
- `GET /api/leads/:id` - Lead details
- `POST /api/activities` - Log activities with automation
- `PATCH /api/leads/:id/do-not-contact` - Mark as do-not-contact

## 🔧 Commands to Run

### Testing
```bash
cd server
npm run test:queue          # Run queue tests
npm run test:auth          # Run auth tests
cd ..
```

### Daily Operations
```bash
# Development:
cd server && npm run dev
cd web && npm run dev

# Production agent:
curl -H "X-API-KEY: your-key" http://127.0.0.1:3030/api/queue/today
```
Your Today Queue system is ready for Jarvis integration!</section>

## Complete System Ready

The Today Queue / Hit List system is implemented with:

✅ **Secure API Access** - API key authentication with origin bypass
✅ **Today Queue Logic** - Smart filtering of due leads
✅ **Dashboard Home** - `/dashboard` shows daily hit list
✅ **Quick Actions** - One-click activity logging
✅ **Jarvis Integration** - Complete API docs and examples

**Start using immediately:**
1. Start both servers
2. Visit http://127.0.0.1:5173/
3. Use the dashboard to manage daily sales activities
4. Integrate with Jarvis using provided API endpoints