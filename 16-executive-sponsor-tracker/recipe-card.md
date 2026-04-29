# Executive Sponsor Tracker — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Schedule Trigger → Find Strategic Deals → Check Executive Engagement → AI Risk & Re-engagement → Alert Deal Owners
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger
- **What:** Run on the same cadence as the catalog workflow: Schedule — Daily 7:30 AM.
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `30 7 * * *`.

### Step 2: Find Strategic Deals
- **What:** Queries CRM for open opportunities above the deal value threshold with identified executive contacts.
- **API example:**
  ```text
  GET /opportunities/strategic?lookback_days=21
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Check Executive Engagement
- **What:** For each deal, pulls Backstory engagement data for VP+ contacts to detect silent sponsors (no activity in lookback window).
- **API example:**
  ```text
  GET /opportunities/strategic?lookback_days=21
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI Risk and Re-engagement
- **What:** AI Agent evaluates the impact of sponsor silence on deal health and generates specific re-engagement tactics per deal.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Executive Sponsor Tracker output.
  Purpose: Monitors executive-level contact engagement across strategic deals to ensure champion and sponsor relationships stay active. The workflow identifies open opportunities above a configurable deal value threshold, checks Backstory for executive contact engagement (VP+ titles), and flags deals where executive sponsors have gone silent (no meetings or emails in the configured lookback window). An AI agent assesses the risk of each silent-sponsor situation and recommends re-engagement tactics. Alerts are sent to the deal owner and sales leadership via Messaging.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Alert Deal Owners
- **What:** Sends alerts to deal owners and sales leadership via Messaging for deals with silent executive sponsors.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed deals IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

