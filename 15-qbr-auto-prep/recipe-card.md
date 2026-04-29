# QBR Auto-Prep — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Calendar API access** — Google Calendar, Outlook, or Microsoft Graph
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Schedule Trigger → Find Upcoming QBRs → Pull Quarterly Engagement → AI QBR Document Generation → Deliver Prep Materials
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger
- **What:** Run on the same cadence as the catalog workflow: Schedule — Weekly (configurable to quarterly cadence).
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `0 8 * * 1`.

### Step 2: Find Upcoming QBRs
- **What:** Scans calendar for meetings matching QBR title patterns, extracts the associated account names.
- **API example:**
  ```text
  GET /calendarView?lookback_days=90
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Pull Quarterly Engagement
- **What:** For each QBR account, queries Backstory for the full quarter's engagement data: meetings, emails, contact maps, and activity trends.
- **API example:**
  ```text
  GET /calendarView?lookback_days=90
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI QBR Document Generation
- **What:** AI Agent produces a structured QBR prep document with executive summary, quarter-over-quarter trends, key wins, risk areas, and recommended talking points.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the QBR Auto-Prep output.
  Purpose: Automatically prepares quarterly business review materials for every account on an upcoming QBR agenda. The workflow scans the calendar for meetings tagged as QBRs (or matching configurable title patterns), then for each account on the agenda, pulls the full quarter's engagement data from Backstory: meeting frequency, email volume, contacts engaged, key relationship changes, and deal progression. An AI agent generates a structured QBR prep document with executive summary, engagement trends, wins/risks, and talking points. Delivered to the account team 48 hours before the QBR.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Deliver Prep Materials
- **What:** Sends the QBR prep document to the account team via Messaging 48 hours before the meeting.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed meetings IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

