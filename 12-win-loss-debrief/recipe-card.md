# Win/Loss Debrief — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Webhook Trigger → Fetch Deal Timeline → AI Debrief Analysis → Deliver Debrief
```

## Step-by-Step Rebuild

### Step 1: Webhook Trigger
- **What:** Accept an inbound webhook when CRM deal stage change to Closed Won/Lost.
- **Make:** Custom webhook module
- **Power Automate:** When an HTTP request is received
- **Zapier:** Webhooks by Zapier → Catch Hook
- **Implementation note:** Use path `win-loss-debrief` (or your platform's equivalent public webhook path).

### Step 2: Fetch Deal Timeline
- **What:** Pulls the complete Backstory engagement history for the deal: meetings, emails, contacts, activity cadence over the deal lifecycle.
- **API example:**
  ```text
  POST /opportunities/closed-events
Body: { "lookback_days": 120, "mode": "closed opportunity events" }
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: AI Debrief Analysis
- **What:** AI Agent analyzes the full timeline, identifies key moments (first exec meeting, proposal sent, competitor mention, engagement gaps), and generates a structured debrief.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Win/Loss Debrief Generator output.
  Purpose: Automatically generates a structured win/loss debrief when any deal closes (won or lost). Triggered by a CRM webhook on stage change, the workflow pulls the full engagement timeline from Backstory — every meeting, email, contact involved, and engagement cadence throughout the deal cycle. An AI agent analyzes the timeline to produce a structured debrief: what worked, where engagement dropped, key turning points, multi-threading effectiveness, and lessons learned. The debrief is delivered to the rep, their manager, and optionally a shared enablement channel.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 4: Deliver Debrief
- **What:** Formats the debrief as a rich message and delivers to the rep, their manager, and the team enablement channel via Messaging.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Persist processed event IDs so retries from the upstream system do not generate duplicate alerts.
- Log raw webhook payloads during early testing so you can tighten field mappings before production.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

