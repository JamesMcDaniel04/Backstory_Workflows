# Executive Inbox — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **Email platform access** — Gmail, Outlook, IMAP, or Microsoft Graph credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery
- **Project management access** — Jira, Asana, or another ticketing/project API

## Architecture

```
Schedule Trigger & Email Fetch → Identify Customer Emails → Enrich with Account Context → AI Triage & Classification → Route to Channels → Await & Follow Up
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger and Email Fetch
- **What:** Run on the same cadence as the catalog workflow: Schedule.
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `0 8 * * 1-5`.

### Step 2: Identify Customer Emails
- **What:** Code and conditional logic filter out internal, automated, and non-customer messages, keeping only emails that warrant attention.
- **API example:**
  ```text
  GET /mailFolders/inbox/messages?lookback_days=1
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Enrich with Account Context
- **What:** For each customer email, queries Backstory MCP and Project Management (Jira, Asana, etc.) to pull account status, recent activity, open tickets, and relationship history.
- **API example:**
  ```text
  GET /mailFolders/inbox/messages?lookback_days=1
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI Triage and Classification
- **What:** AI Agent (via agent, structured output parser, and chain) analyzes email content plus account context to assign urgency, category, and routing recommendation.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Executive Inbox output.
  Purpose: Automates executive email triage by reading unread email messages, identifying those from customers or prospects, enriching them with CRM context from Backstory, and using AI to classify and route each message. The AI Agent analyzes the email content alongside account history to determine urgency, category (support escalation, deal progression, renewal, executive outreach, etc.), and the appropriate internal channel or person. Routed messages land in the right Messaging channel (Slack, Teams, or Email) or trigger follow-up workflows, ensuring nothing falls through the cracks.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Route to Channels
- **What:** A switch node directs each classified email to the appropriate Messaging channel (Slack, Teams, or Email), team member, or follow-up queue based on the AI's triage decision.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

### Step 6: Await and Follow Up
- **What:** Wait nodes handle deferred actions and ensure follow-up tasks are tracked.
- **API example:**
  ```text
  GET /mailFolders/inbox/messages?lookback_days=1
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed emails IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

