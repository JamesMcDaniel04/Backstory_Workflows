# Activity Gap Detector — Platform-Agnostic Recipe

> Rebuild this workflow on **any** automation platform (Make, Power Automate, Zapier, etc.)

## Prerequisites

- **Backstory API access** — REST API access or an MCP-to-REST bridge for enrichment calls
- **LLM API key** — Claude, OpenAI, Gemini, or another chat completion provider
- **Messaging credentials** — Slack Bot Token, Teams webhook, or SMTP for delivery

## Architecture

```
Schedule Trigger → Fetch Team Activity → Benchmark Analysis → AI Coaching Insights → Deliver to Managers
```

## Step-by-Step Rebuild

### Step 1: Schedule Trigger
- **What:** Run on the same cadence as the catalog workflow: Schedule — Weekly Friday 8:00 AM.
- **Make:** Schedule module with the matching cron/cadence
- **Power Automate:** Recurrence trigger with the matching interval/time window
- **Zapier:** Schedule by Zapier with the nearest supported cadence
- **Implementation note:** Cron equivalent: `0 8 * * 5`.

### Step 2: Fetch Team Activity
- **What:** Pulls Backstory activity data for all reps on the team: emails sent, meetings held, contacts engaged, accounts touched.
- **API example:**
  ```text
  GET /sales/activity-rollups?lookback_days=7
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 3: Benchmark Analysis
- **What:** Code node calculates team averages and top-performer baselines, then flags reps falling below thresholds.
- **API example:**
  ```text
  GET /sales/activity-rollups?lookback_days=7
  ```
- **Make / Power Automate / Zapier:** Use the source system connector if one exists; otherwise use an HTTP request module/action.

### Step 4: AI Coaching Insights
- **What:** AI Agent analyzes each flagged rep's patterns, identifies specific gaps (e.g., low multi-threading, no exec outreach), and generates coaching recommendations.
- **Prompting pattern:** Give the LLM the source record, Backstory context, and the expected output structure.
- **System prompt:**
  ```
  You are generating the Activity Gap Detector output.
  Purpose: Compares each rep's weekly activity patterns against team benchmarks and top performer profiles using Backstory activity data. Identifies reps with low outbound activity, thin multi-threading on key deals, or single-threaded opportunities missing executive engagement. An AI agent generates personalized coaching nudges for sales managers, highlighting specific gaps and suggesting actionable improvement areas. Delivered weekly to frontline managers via Messaging.
  Use Backstory context plus the source payload to produce concise, actionable guidance.
  Return a Slack-safe markdown summary with findings, risks, and next actions.
  ```
- **All platforms:** Use your preferred LLM connector or raw HTTP requests to Claude/OpenAI/Gemini.

### Step 5: Deliver to Managers
- **What:** Sends a per-manager coaching digest via Messaging, listing their reps' gaps with suggested conversation starters.
- **Slack example:** `POST https://slack.com/api/chat.postMessage` with a channel ID and markdown text body
- **Teams / Email:** Use native message or SMTP actions if Slack is not your destination.

## MCP Gap Workaround

Most automation platforms do **not** speak MCP natively. Use one of these patterns:

1. **Backstory REST API directly** — best option if your tenant exposes the required endpoints.
2. **MCP-to-REST bridge** — lightweight proxy that translates HTTP requests into MCP tool calls.
3. **n8n as middleware** — let n8n handle the MCP calls, then expose results to your other platform by webhook.

## State and Deduplication

- Store the last processed reps IDs or timestamps so recurring runs do not resend the same insight.
- Keep thresholds and routing destinations in a config store instead of hardcoding them into the workflow logic.

## Estimated Build Time

| Platform        | Estimated Time | Complexity |
|-----------------|---------------|------------|
| Make | 3-4 hours | Medium |
| Power Automate | 4-5 hours | Medium-High |
| Zapier | 3-4 hours | Medium |
| Custom code | 2-3 hours | Medium |
| n8n (native) | 15 minutes | Low (import JSON) |

