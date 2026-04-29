# Marketing-to-Sales Handoff Scorer — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **CRM access** — Salesforce, HubSpot, or equivalent API credentials
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Webhook Trigger → Enrich with Backstory History → AI Handoff Scoring → Deliver to SDR/AE
```

## Step-by-Step Rebuild

### Step 1: Webhook Trigger
- **What:** Accept an inbound webhook when New MQL created in CRM/MAP.
- **Make:** Custom webhook module
- **Power Automate:** When an HTTP request is received
- **Zapier:** Webhooks by Zapier → Catch Hook
- **Implementation note:** Use path `marketing-sales-handoff` (or your platform's equivalent public webhook path).

### Step 2: Enrich with Backstory History
- **What:** Queries Backstory for any existing engagement with the MQL's account: past meetings, email history, known contacts, prior opportunities.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Marketing-to-Sales Handoff Scorer output.
  Purpose: Enriches marketing-qualified leads at the moment of handoff by checking Backstory for existing engagement history. When a new MQL is created in the CRM or marketing automation platform, the workflow queries Backstory to see if the account already has relationship history — prior meetings, email threads, known contacts, or past opportunities. An AI agent scores the handoff quality (hot / warm / cold) and generates a context brief for the receiving SDR or AE, so they never walk into a "cold" call that's actually warm. Delivered instantly via Messaging.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 3: AI Handoff Scoring
- **What:** AI Agent evaluates the engagement history to score the handoff (hot / warm / cold) and generates a context brief with key talking points and relationship history.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Marketing-to-Sales Handoff Scorer output.
  Purpose: Enriches marketing-qualified leads at the moment of handoff by checking Backstory for existing engagement history. When a new MQL is created in the CRM or marketing automation platform, the workflow queries Backstory to see if the account already has relationship history — prior meetings, email threads, known contacts, or past opportunities. An AI agent scores the handoff quality (hot / warm / cold) and generates a context brief for the receiving SDR or AE, so they never walk into a "cold" call that's actually warm. Delivered instantly via Messaging.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 4: Deliver to SDR/AE
- **What:** Sends the scored handoff with context brief to the assigned SDR or AE via Messaging, including recommended first outreach approach.
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

