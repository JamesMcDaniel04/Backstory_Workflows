"""
Shared workflow specs for generated Backstory starter scripts.
"""
from __future__ import annotations

from workflow_platform_starters import WorkflowSpec


def _env_prefix(workflow_id: str) -> str:
    return workflow_id.split("-", 1)[1].replace("-", "_").upper()


def _spec(
    workflow_id: str,
    name: str,
    description: str,
    system_prompt: str,
    runner_instructions: str,
    source_summary: str,
    source_env_var: str,
    source_path: str,
    source_label: str,
    *,
    source_method: str = "GET",
    lookback_days: int = 7,
    trigger_mode: str = "schedule",
    delivery_mode: str = "slack_or_email",
) -> WorkflowSpec:
    prefix = _env_prefix(workflow_id)
    return WorkflowSpec(
        workflow_id=workflow_id,
        name=name,
        description=description,
        system_prompt=system_prompt,
        runner_instructions=runner_instructions,
        source_summary=source_summary,
        source_env_var=source_env_var,
        source_path=source_path,
        source_label=source_label,
        source_method=source_method,
        lookback_days=lookback_days,
        trigger_mode=trigger_mode,
        delivery_mode=delivery_mode,
        slack_channel_env=f"{prefix}_SLACK_CHANNEL",
        email_recipients_env=f"{prefix}_EMAIL_RECIPIENTS",
    )


WORKFLOW_SPECS: dict[str, WorkflowSpec] = {
    "06-executive-inbox": _spec(
        "06-executive-inbox",
        "Executive Inbox",
        "Automates executive email triage by identifying customer and prospect messages, enriching them with Backstory context, and routing the highest-priority items to the right internal owners.",
        """You are an executive email triage assistant for revenue teams.

Given an inbound executive email plus Backstory context, classify the message,
explain why it matters, and recommend the best route.

Output format:
- Urgency: Urgent / Follow Up / Informational
- Category: support escalation, deal progression, renewal, executive outreach,
  compliance request, or other
- Account/deal context with names, amounts, stage, renewal timing, or open risks
- Recommended routing destination and next action
- Keep the write-up concise and Slack-friendly
""",
        """Run the Executive Inbox workflow:
1. Call get_run_context() and load_records().
2. For each email record, use Backstory MCP tools to gather the most relevant
   account, opportunity, support, and relationship context.
3. Generate a triage summary using the workflow format.
4. Compile all triaged emails into a single report ordered by urgency.
5. Deliver the report to Slack with post_report_to_slack(). If email
   recipients are configured, also send it via send_report_via_email().
6. If no source records are returned, report that cleanly without error.
""",
        "unread external executive inbox messages",
        "EMAIL_API_BASE_URL",
        "/mail/inbox/unread",
        "emails",
        lookback_days=1,
    ),
    "07-churn-risk-scorecard": _spec(
        "07-churn-risk-scorecard",
        "Churn Risk Scorecard",
        "Generates a weekly churn risk scorecard for customer success leaders by combining account health signals from the CRM with Backstory engagement context.",
        """You are a customer success risk analyst.

For each customer account, assign a churn risk tier and explain the top drivers.

Output format:
- Risk tier: Critical / Watch / Healthy
- Score on a 1-10 scale
- Top risk drivers with evidence
- Save play with a concrete owner action
- Keep the result compact enough for a weekly manager digest
""",
        """Run the Churn Risk Scorecard workflow:
1. Call get_run_context() and load_records().
2. For each account, use Backstory MCP tools to pull engagement, relationship,
   activity, and opportunity context relevant to churn risk.
3. Score the account and write the save play.
4. Compile the accounts into a ranked weekly scorecard grouped by risk tier.
5. Deliver the final report to Slack and optionally email.
""",
        "active customer accounts for weekly churn scoring",
        "CRM_API_BASE_URL",
        "/accounts/active-customers",
        "accounts",
        lookback_days=30,
    ),
    "08-renewal-prep-brief": _spec(
        "08-renewal-prep-brief",
        "Renewal Prep Brief",
        "Builds renewal preparation briefs at key milestones before contract renewal by combining CRM renewal records with Backstory account context.",
        """You are a renewal strategy assistant.

For each upcoming renewal, produce a brief with:
- Account snapshot and renewal timing
- Strengths and momentum signals
- Risk factors that could threaten the renewal
- Expansion opportunities
- Recommended renewal strategy and next actions

Use precise dates, owners, and commercial context when available.
""",
        """Run the Renewal Prep Brief workflow:
1. Call get_run_context() and load_records().
2. For each renewal record, use Backstory MCP tools to gather account health,
   recent activity, open risks, executive engagement, and expansion context.
3. Produce a structured renewal brief.
4. Compile all briefs into a milestone-based report.
5. Deliver the report to Slack and optionally email.
""",
        "accounts approaching renewal milestones",
        "CRM_API_BASE_URL",
        "/renewals/upcoming",
        "renewals",
        lookback_days=60,
    ),
    "09-onboarding-pulse": _spec(
        "09-onboarding-pulse",
        "Onboarding Pulse",
        "Monitors newly closed-won accounts during onboarding to detect customers that are on track, at risk, or going dark before churn risk materializes.",
        """You are an onboarding health assistant.

For each newly won account in the onboarding window, assess whether engagement
is on track, at risk, or going dark.

Output format:
- Status: On Track / At Risk / Going Dark
- Evidence using meetings, emails, stakeholder engagement, and implementation steps
- Why the account matters commercially
- Recommended re-engagement action
""",
        """Run the Onboarding Pulse workflow:
1. Call get_run_context() and load_records().
2. For each onboarding account, use Backstory MCP tools to pull post-sale
   activity, stakeholder engagement, and deal-to-implementation context.
3. Assess the onboarding trajectory and recommend the next action.
4. Compile the output into a pulse report grouped by status.
5. Deliver the report to Slack and optionally email.
""",
        "newly closed-won customers in their first 90 days",
        "CRM_API_BASE_URL",
        "/customers/newly-closed-won",
        "accounts",
        lookback_days=90,
    ),
    "10-activity-gap-detector": _spec(
        "10-activity-gap-detector",
        "Activity Gap Detector",
        "Highlights reps whose weekly activity patterns fall below team benchmarks or who are failing to multi-thread strategically important deals.",
        """You are a frontline sales coaching assistant.

For each rep activity record, compare the rep against team benchmarks and
surface coaching-worthy gaps.

Output format:
- Gap severity: Significant / Moderate / None
- Quantified activity gap versus team or top-performer baseline
- Deal quality risk such as weak multi-threading or missing executive access
- Suggested manager coaching prompt
""",
        """Run the Activity Gap Detector workflow:
1. Call get_run_context() and load_records().
2. For each rep record, use Backstory MCP tools to enrich with recent
   opportunity, relationship, and activity context.
3. Write a coaching insight for the rep.
4. Compile a manager-ready activity gap report.
5. Deliver the report to Slack and optionally email.
""",
        "weekly rep activity benchmark records",
        "CRM_API_BASE_URL",
        "/sales/activity-benchmarks",
        "reps",
        lookback_days=7,
    ),
    "11-deal-hygiene-audit": _spec(
        "11-deal-hygiene-audit",
        "Deal Hygiene Audit",
        "Audits open pipeline for stale close dates, missing next steps, thin stakeholder coverage, and other CRM hygiene issues using Backstory engagement context.",
        """You are a deal hygiene auditor.

For each open opportunity, identify CRM and execution hygiene issues that need
to be fixed this week.

Output format:
- Severity: Critical / Important / Clean
- Specific hygiene issue(s)
- Why the issue matters based on stage, amount, or momentum
- The exact cleanup action the rep should take next
""",
        """Run the Deal Hygiene Audit workflow:
1. Call get_run_context() and load_records().
2. For each opportunity record, use Backstory MCP tools to enrich with recent
   engagement, stakeholder, and timeline context.
3. Evaluate hygiene issues and write a cleanup action list.
4. Compile a rep-ready audit report grouped by severity.
5. Deliver the report to Slack and optionally email.
""",
        "open opportunities for weekly hygiene checks",
        "CRM_API_BASE_URL",
        "/opportunities/open",
        "deals",
        lookback_days=14,
    ),
    "12-win-loss-debrief": _spec(
        "12-win-loss-debrief",
        "Win/Loss Debrief Generator",
        "Generates a structured debrief whenever a deal closes so reps and managers can learn from the full engagement timeline.",
        """You are a win/loss debrief assistant.

For each closed deal, analyze the full deal motion and produce:
- Deal snapshot
- What worked
- What almost derailed the outcome
- Key turning points
- Lessons the broader team should reuse or avoid

Be specific about timeline, stakeholders, and execution patterns.
""",
        """Run the Win/Loss Debrief workflow:
1. Call get_run_context() and load_records().
2. For each closed-deal event, use Backstory MCP tools to gather the full
   engagement timeline and opportunity context.
3. Write the win/loss debrief.
4. Compile the debrief(s) into a final report.
5. Deliver the report to Slack and optionally email.
""",
        "closed opportunity webhook events",
        "CRM_API_BASE_URL",
        "/opportunities/closed-webhook",
        "deals",
        source_method="POST",
        lookback_days=120,
        trigger_mode="webhook",
    ),
    "13-competitive-displacement-alert": _spec(
        "13-competitive-displacement-alert",
        "Competitive Displacement Alert",
        "Flags customer accounts that show both engagement deterioration and competitor activity so account teams can respond before a displacement happens.",
        """You are a competitive risk assistant.

For each at-risk account, determine whether the account shows early, elevated,
or high displacement risk.

Output format:
- Risk level with urgency
- Evidence from engagement decline and competitor signals
- Why the risk matters now
- Defensive action plan for the account team
""",
        """Run the Competitive Displacement Alert workflow:
1. Call get_run_context() and load_records().
2. For each flagged account, use Backstory MCP tools to gather relationship
   changes, activity decline, and account momentum context.
3. Combine that with the source competitor signal record.
4. Produce a defensive alert and group the accounts by risk level.
5. Deliver the alert report to Slack and optionally email.
""",
        "accounts flagged for possible competitive displacement",
        "CRM_API_BASE_URL",
        "/accounts/competitive-risk",
        "accounts",
        source_method="POST",
        lookback_days=14,
    ),
    "14-territory-heat-map": _spec(
        "14-territory-heat-map",
        "Territory Heat Map",
        "Builds a weekly territory digest showing which accounts are heating up, staying steady, or cooling down so reps can focus the week correctly.",
        """You are a territory prioritization assistant.

For each territory account, determine whether momentum is heating up, steady,
or cooling down.

Output format:
- Momentum band
- Evidence behind the change
- Why the account should be prioritized or monitored
- The most useful next action for the rep
""",
        """Run the Territory Heat Map workflow:
1. Call get_run_context() and load_records().
2. For each territory account, use Backstory MCP tools to gather engagement,
   stakeholder, and opportunity context behind the momentum change.
3. Summarize the account's weekly momentum.
4. Compile a heat-map digest grouped by heating up, steady, and cooling down.
5. Deliver the digest to Slack and optionally email.
""",
        "territory momentum records",
        "CRM_API_BASE_URL",
        "/territories/heat-map",
        "accounts",
        lookback_days=7,
    ),
    "15-qbr-auto-prep": _spec(
        "15-qbr-auto-prep",
        "QBR Auto-Prep",
        "Prepares QBR briefing material by combining upcoming QBR meeting records with a quarter of Backstory account engagement and relationship history.",
        """You are a QBR preparation assistant.

For each upcoming QBR, produce:
- Executive summary
- Quarter-over-quarter engagement or business trends
- Key wins
- Risk areas
- Recommended talking points for the account team

Make the output feel ready to paste into a prep channel or doc.
""",
        """Run the QBR Auto-Prep workflow:
1. Call get_run_context() and load_records().
2. For each QBR meeting or account record, use Backstory MCP tools to gather
   quarterly engagement, relationship, opportunity, and risk context.
3. Write the QBR prep brief.
4. Compile the briefs into a final prep report.
5. Deliver the report to Slack and optionally email.
""",
        "upcoming QBR meetings and account mappings",
        "CALENDAR_API_BASE_URL",
        "/qbr-events",
        "meetings",
        lookback_days=90,
    ),
    "16-executive-sponsor-tracker": _spec(
        "16-executive-sponsor-tracker",
        "Executive Sponsor Tracker",
        "Detects strategic deals where VP+ contacts have gone quiet so sellers can re-engage executive sponsors before forecast or renewal risk compounds.",
        """You are an executive sponsor engagement assistant.

For each strategic deal, determine whether executive sponsor engagement is
healthy, declining, or silent.

Output format:
- Sponsor risk level
- Last meaningful executive engagement and why it matters
- The deal or renewal implication
- Specific re-engagement tactic for the owner or leadership team
""",
        """Run the Executive Sponsor Tracker workflow:
1. Call get_run_context() and load_records().
2. For each strategic opportunity record, use Backstory MCP tools to gather
   executive contact engagement and recent deal context.
3. Assess sponsor risk and write a re-engagement recommendation.
4. Compile the alerts into a strategic sponsor report.
5. Deliver the report to Slack and optionally email.
""",
        "strategic deals with executive sponsor metadata",
        "CRM_API_BASE_URL",
        "/opportunities/strategic",
        "deals",
        lookback_days=21,
    ),
    "17-marketing-sales-handoff-scorer": _spec(
        "17-marketing-sales-handoff-scorer",
        "Marketing-to-Sales Handoff Scorer",
        "Scores new MQL handoffs using existing relationship history from Backstory so SDRs and AEs know whether an inbound lead is truly hot, warm, or cold.",
        """You are a marketing-to-sales handoff assistant.

For each new MQL, score the handoff as Hot, Warm, or Cold and explain why.

Output format:
- Handoff score and confidence
- Existing relationship history or lack of it
- Relevant prior opportunities, stakeholders, and buyer signals
- Recommended first outreach approach
""",
        """Run the Marketing-to-Sales Handoff Scorer workflow:
1. Call get_run_context() and load_records().
2. For each MQL event, use Backstory MCP tools to gather prior account
   relationship history, meeting activity, prior opportunities, and current
   buying signals.
3. Score the handoff and write the context brief.
4. Compile the handoff report.
5. Deliver the report to Slack and optionally email.
""",
        "new MQL webhook events",
        "CRM_API_BASE_URL",
        "/mql/handoff",
        "mqls",
        source_method="POST",
        lookback_days=180,
        trigger_mode="webhook",
    ),
}
