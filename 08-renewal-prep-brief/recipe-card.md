# Renewal Prep Brief — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Schedule Trigger → Find Upcoming Renewals → Enrich with Account Health → AI Brief Generation → Deliver to Account Team
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger
- **What:** Run on the same cadence as the catalog workflow: Schedule — Daily 7:00 AM.
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `0 7 * * *`.

### Step 2: Find Upcoming Renewals
- **What:** Queries CRM for accounts with renewals in 60, 30, or 15 days, filtering out those already briefed at this milestone.
- **API example:**
  ```text
  GET /accounts/renewals?lookback_days=60
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Enrich with Account Health
- **What:** For each renewal account, pulls Backstory engagement trends, support ticket history, champion activity, and expansion signals from MCP.
- **API example:**
  ```text
  GET /accounts/renewals?lookback_days=60
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI Brief Generation
- **What:** AI Agent synthesizes engagement data into a structured renewal brief with health score, risk factors, expansion opportunities, and recommended strategy.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Renewal Prep Brief output.
  Purpose: Automatically generates renewal preparation briefs at 60, 30, and 15 days before each account's renewal date. The workflow queries the CRM for upcoming renewals, enriches each account with Backstory engagement trends, support history, expansion signals, and key contact activity. An AI agent produces a structured brief covering account health, risk factors, expansion opportunities, and a recommended renewal strategy. Briefs are delivered to the assigned CSM and account executive via Messaging.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Deliver to Account Team
- **What:** Sends the brief to the assigned CSM and AE via Messaging with the renewal date and urgency tier highlighted.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed renewals IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

