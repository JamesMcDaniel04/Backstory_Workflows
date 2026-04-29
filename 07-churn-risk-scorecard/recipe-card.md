# Churn Risk Scorecard — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Schedule Trigger → Fetch Active Accounts → Enrich with Engagement Data → AI Risk Scoring → Compile Scorecard → Deliver to CS Managers
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger
- **What:** Run on the same cadence as the catalog workflow: Schedule — Weekly Monday 7:00 AM.
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `0 7 * * 1`.

### Step 2: Fetch Active Accounts
- **What:** Queries CRM for all active customer accounts assigned to the CS team.
- **API example:**
  ```text
  GET /accounts/active-customers?lookback_days=30
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Enrich with Engagement Data
- **What:** For each account, pulls Backstory engagement trends, contact activity changes, and meeting frequency from MCP.
- **API example:**
  ```text
  GET /accounts/active-customers?lookback_days=30
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI Risk Scoring
- **What:** AI Agent analyzes engagement drop-offs, support ticket spikes, champion departures, and usage patterns to assign a 1-10 churn risk score with top risk drivers.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Churn Risk Scorecard output.
  Purpose: Generates a weekly churn risk scorecard for the customer success team. The workflow pulls engagement trends, support ticket volumes, champion contact activity, and product usage signals from Backstory and the CRM. An AI agent scores each account on a 1-10 churn risk scale, identifies the top risk drivers, and suggests specific save plays. The scorecard is delivered to CS managers via Messaging with accounts ranked by risk severity.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Compile Scorecard
- **What:** Aggregates scored accounts into a ranked scorecard with risk tiers (Critical / Watch / Healthy) and suggested save plays.
- **API example:**
  ```text
  GET /accounts/active-customers?lookback_days=30
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 6: Deliver to CS Managers
- **What:** Sends the formatted scorecard via Messaging to each CS manager for their portfolio.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed accounts IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

