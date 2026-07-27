// Generates the "project" variant of each workflow's orchestrator instructions:
// the same workflow, reframed to run inside a Claude.ai Project or an OpenAI
// Project / Custom GPT, where a person types a request and reads the report in
// the chat instead of a schedule firing and a connector delivering it.
//
// Sibling of build-orchestrator-instructions.mjs, which produces the automated
// workflow variant. Both read the same canonical workflows.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'workflows.json');

const writeText = (target, value) => fs.writeFileSync(target, `${value.trimStart()}\n`);

// ─── Source-shape helpers ──────────────────────────────────────────────────

const stepsOfType = (workflow, ...types) =>
  (workflow.node_flow || []).filter((step) => types.includes(step.type));

const credentialName = (credential) => String(credential).split('—')[0].trim();

const usesBackstory = (workflow) =>
  (workflow.credentials || []).some((c) => /backstory/i.test(c));

const haystack = (workflow) =>
  [workflow.name, workflow.description, workflow.trigger, ...(workflow.configuration || [])]
    .join(' ')
    .toLowerCase();

// Catalog copy is written in the third person about an automated run ("Flags
// deals...", "Delivered via Messaging every Monday"). A project instruction is
// addressed to the model in the imperative, and has no delivery step at all, so
// both have to be rewritten rather than quoted verbatim.

const singularize = (verb) => {
  if (/ies$/i.test(verb)) return verb.replace(/ies$/i, 'y');
  if (/sses$/i.test(verb)) return verb.replace(/es$/i, '');
  if (/s$/i.test(verb)) return verb.replace(/s$/i, '');
  return verb;
};

// A Set rather than a /g regex: a global regex carries lastIndex between
// .test() calls and would skip every other match.
const THIRD_PERSON_VERBS = new Set(
  ('identifies analyzes analyses evaluates generates produces scores assesses prioritizes recommends ' +
    'summarizes compares flags creates highlights suggests calculates checks pulls queries fetches reads ' +
    'retrieves normalizes resolves aggregates validates maps splits merges filters routes adapts replays ' +
    'surfaces monitors combines synthesizes sends posts delivers')
    .split(' '),
);

const isThirdPersonVerb = (word) => THIRD_PERSON_VERBS.has(String(word).toLowerCase());

function toImperative(text) {
  if (!text) return '';
  let out = text.trim();
  // Leading verb: "Identifies hygiene issues" -> "Identify hygiene issues"
  out = out.replace(/^([A-Za-z]+)/, (word) => {
    if (!isThirdPersonVerb(word)) return word;
    const singular = singularize(word);
    return singular.charAt(0).toUpperCase() + singular.slice(1);
  });
  // Coordinated verbs: "... and prioritizes by stage" -> "... and prioritize by stage"
  out = out.replace(/\b(and|then)\s+([A-Za-z]+)/gi, (match, joiner, verb) =>
    isThirdPersonVerb(verb) ? `${joiner} ${singularize(verb)}` : match,
  );
  return out;
}

// Drop the sentences that only describe the automated run's schedule or its
// connector delivery — a project has neither.
const DELIVERY_SENTENCE =
  /^(delivered|delivery|alerts? (are|is) sent|briefs? (are|is) delivered|the (scorecard|digest|brief|debrief|report) is delivered)/i;

// "Every Monday, ...", "At 6 AM on weekdays, ...", "On a weekly cadence, ..."
const CADENCE_CLAUSE = /^(every|each|at|on|when)\b[^,]{2,48},\s*/i;

function projectPurpose(workflow) {
  return (workflow.description || '')
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((sentence) => {
      if (DELIVERY_SENTENCE.test(sentence)) return false;
      return !/\b(deliver(ed|s)?|sent|posts?|posted)\b[^.]*\b(via|to)\b[^.]*\b(messaging|slack|teams|email|smtp|channel|inbox)\b/i.test(
        sentence,
      );
    })
    .map((sentence) => {
      const trimmed = sentence.replace(CADENCE_CLAUSE, '');
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join(' ')
    .replace(/\bthe workflow\b/gi, 'this project')
    .replace(/\buses the LLM to\b/gi, 'uses AI to')
    .replace(/\bpasses (it|them|the data) to the LLM to\b/gi, 'then')
    .trim();
}

// A project has no scheduler and no delivery connector, so the credentials list
// has to be rewritten: the model itself replaces the LLM API, the chat replaces
// the messaging surface, and systems we can no longer call become paste-ins.
const DROPPED_CREDENTIAL = /^(llm api|optional llm api)/i;
const DELIVERY_CREDENTIAL = /^(messaging|slack|email|smtp|project management|delivery|fallback sink|messaging or work-management surface)/i;

function pasteInSources(workflow) {
  return (workflow.credentials || [])
    .map(credentialName)
    .filter((name) => !DROPPED_CREDENTIAL.test(name) && !DELIVERY_CREDENTIAL.test(name) && !/backstory/i.test(name));
}

// ─── What the person types ─────────────────────────────────────────────────

// The scheduled/webhook trigger becomes a typed request. Most workflows key off
// an account; these are the ones where that would be the wrong prompt.
const INPUT_OVERRIDES = {
  '01-sales-digest': 'a rep name (or "me") and the accounts they own',
  '02-meeting-brief': 'the account name and who you are meeting',
  '05-forecast-coach': 'a sales leader or team name, or a list of their open deals',
  '06-executive-inbox': 'the unread messages you want triaged, pasted in',
  '10-activity-gap-detector': 'a team or a list of rep names',
  '11-deal-hygiene-audit': 'a rep name, a team, or a list of account names',
  '12-win-loss-debrief': 'the account or deal that closed, and whether it was won or lost',
  '14-territory-heat-map': 'a rep name or the list of accounts in the territory',
  '15-qbr-auto-prep': 'the account name and which quarter the QBR covers',
  '17-marketing-sales-handoff-scorer': 'the new lead — name, title, company, and how they came in',
  '18-channel-pulse': 'an account name and how many days back to look',
  '20-crm-signal-normalizer': 'a sample of the CRM records you want normalized, pasted in',
  '21-meeting-intelligence-normalizer': 'a meeting or transcript payload, pasted in',
  '22-multi-channel-delivery-router': 'the insight payload plus who it is for',
  '23-identity-resolution-hub': 'the identity records you want resolved, pasted in',
  '24-workflow-contract-validator': 'the payload plus the contract it is supposed to satisfy',
  '27-adapter-regression-monitor': 'the golden case and the actual adapter output, pasted in',
  '32-revenue-orchestration': 'the revenue signal plus the account it relates to',
  '34-manager-coaching-brief': 'the rep name plus the account or deal to coach on',
  '35-grounded-follow-up': 'the account or deal, what you want to send, and who it goes to',
};

// Platform-enablement workflows are intake-driven rather than account-driven.
const INTAKE_CATEGORIES = new Set(['platform-enablement']);

function inputHint(workflow) {
  if (INPUT_OVERRIDES[workflow.id]) return INPUT_OVERRIDES[workflow.id];
  if (INTAKE_CATEGORIES.has(workflow.category)) return 'your intake details, pasted in';
  const text = haystack(workflow);
  if (/\brenewal\b/.test(text)) return 'an account name and its renewal date';
  if (/opportunit|deal|pipeline/.test(text)) return 'an account name, or a specific opportunity';
  return 'one or more account names';
}

// ─── Backstory MCP tool selection ──────────────────────────────────────────

const TOOL_NOTES = {
  find_account: 'resolve each name to a Backstory account',
  get_account_status: 'open risks, next steps, and live topics',
  get_opportunity_status: 'stage, close date, amount, and deal health',
  get_recent_account_activity: 'recent meetings, emails, and who was on them',
  get_recent_opportunity_activity: 'deal-level activity and last touch',
  get_engaged_people: 'stakeholders, seniority, and engagement volume',
  get_scorecard: 'scored engagement and coverage signals',
};

function mcpTools(workflow) {
  if (!usesBackstory(workflow)) return [];
  const text = haystack(workflow);
  const tools = ['find_account', 'get_account_status'];
  const dealShaped = /opportunit|deal|pipeline|forecast|renewal|quota|close/.test(text);
  if (dealShaped) tools.push('get_opportunity_status');
  tools.push('get_recent_account_activity');
  if (dealShaped) tools.push('get_recent_opportunity_activity');
  if (/stakeholder|contact|exec|sponsor|champion|thread|relationship|people|engag/.test(text)) {
    tools.push('get_engaged_people');
  }
  if (/score|health|benchmark|grade|risk/.test(text)) tools.push('get_scorecard');
  return [...new Set(tools)];
}

function askTool(workflow) {
  return /opportunit|deal|pipeline|forecast|renewal|close/.test(haystack(workflow))
    ? 'ask_sales_ai_about_opportunity'
    : 'ask_sales_ai_about_account';
}

// The AI step's own description is the best available statement of what this
// workflow is actually reasoning about, so it becomes the analysis instruction.
function analysisQuestion(workflow) {
  const ai = stepsOfType(workflow, 'ai')[0];
  const raw = (ai?.description || '').replace(/^AI Agent\s*/i, '').trim();
  if (!raw) return 'Identify what matters most here and what the owner should do next.';
  const imperative = toImperative(raw);
  return imperative.charAt(0).toUpperCase() + imperative.slice(1);
}

// ─── Section builders ──────────────────────────────────────────────────────

function processSection(workflow) {
  const lines = [];
  let n = 1;
  const tools = mcpTools(workflow);

  if (tools.length) {
    lines.push(
      `${n++}. **Resolve what you were given** — run \`find_account\` for every account or company named. If the request names a rep, team, or territory instead, ask which accounts that covers unless the user already pasted a list. If a name does not resolve, say so instead of guessing.`,
    );
    lines.push(`${n++}. **Gather the evidence in parallel:**`);
    for (const tool of tools.filter((t) => t !== 'find_account')) {
      lines.push(`   - \`${tool}\` — ${TOOL_NOTES[tool]}`);
    }
    lines.push(`   - \`${askTool(workflow)}\` — "${analysisQuestion(workflow)}"`);
  } else {
    lines.push(`${n++}. **Read the intake** the user pasted in. List anything required that is missing before you analyze.`);
  }

  // Data steps split into two kinds. Retrieval steps ("Queries CRM for...",
  // "Pulls Backstory data on...") are already covered by the tool list above,
  // so repeating them just pads the process. Derivation steps ("Benchmark
  // Analysis", "Identify Unmatched Accounts") describe work the automated
  // version does in code and a project has to do in reasoning — keep those.
  const isRetrievalStep = (step) =>
    /^(quer|pull|fetch|read|retriev|receiv|load|gather|enrich|collect)/i.test(step.description || '') ||
    /\bpulls? (backstory|crm)\b/i.test(step.description || '');

  const derivationSteps = stepsOfType(workflow, 'data').filter((step) => !(tools.length && isRetrievalStep(step)));
  for (const step of derivationSteps) {
    lines.push(`${n++}. **${step.name}** — ${toImperative(step.description)}`);
  }

  lines.push(`${n++}. **Analyze** — ${analysisQuestion(workflow)}`);
  lines.push(
    `${n++}. **Write the report into this chat.** You have no connectors — do not try to send, post, email, or schedule anything. The user copies it wherever it needs to go.`,
  );
  return lines.join('\n');
}

// Deliberately not derived from the workflow's output steps: those describe a
// connector delivery ("Sends a per-rep checklist via Messaging, CC'ing their
// manager") which does not exist here, and quoting them tells the model to do
// something it cannot do.
function reportSections(workflow) {
  const lines = [
    '1. **Headline** — what you checked, and the single most important finding',
    '2. **Ranked findings** — grouped by urgency, most severe first',
    '3. **Evidence** — under each finding, the dates, fields, people, or records it rests on',
    '4. **Next actions** — each with a named owner and a due date',
  ];
  if (workflow.sample_output?.content) {
    lines.push('');
    lines.push('Match the structure of the Output Format block below — same grouping, same order, same level of detail.');
  }
  return lines.join('\n');
}

function rulesSection(workflow) {
  const rules = [];
  if (usesBackstory(workflow)) {
    rules.push('Use ONLY verified data from Backstory MCP or what the user pasted in — never invent an account name, date, amount, or person');
  } else {
    rules.push('Use ONLY what the user pasted in — never invent a field, record, or system detail');
  }
  rules.push('Cite the evidence behind every finding: the date, the field, the person, or the record it came from');
  rules.push('If a record is incomplete, say which check you could not run rather than assuming it passed');
  rules.push('Mark anything uncertain as `(low confidence)` and say what would confirm it');
  rules.push('Every recommended action names a specific person and is doable this week');
  rules.push('Rank ruthlessly — lead with what matters most, and summarize the long tail as a count');
  rules.push('Keep the report short enough to paste into Slack or an email without editing');

  const pasteIns = pasteInSources(workflow);
  if (pasteIns.length) {
    rules.push(
      `This project has no connection to ${pasteIns.join(', ')} — ask the user to paste or upload an export when you need that data`,
    );
  }
  return rules.map((r) => `- ${r}`).join('\n');
}

function integrationsSection(workflow) {
  const lines = [];
  if (usesBackstory(workflow)) {
    lines.push('- **Backstory MCP** — for account, opportunity, activity, and stakeholder data');
  }
  const pasteIns = pasteInSources(workflow);
  if (pasteIns.length) {
    lines.push(`- **Pasted or uploaded by the user** — ${pasteIns.join(', ')}`);
  }
  if (!lines.length) lines.push('- None. Everything this project needs is pasted in by the user.');
  return lines.join('\n');
}

function configurationSection(workflow) {
  const items = (workflow.configuration || []).filter(Boolean);
  if (!items.length) return '';
  return `\n## Settings You Can Change\n\nTell the project to override any of these at the start of a request:\n\n${items
    .map((item) => `- ${item}`)
    .join('\n')}\n`;
}

function outputFormatSection(workflow) {
  const content = workflow.sample_output?.content;
  if (!content) return '';
  return `\n## Output Format\n\n\`\`\`text\n${content}\n\`\`\`\n`;
}

// ─── Document assembly ─────────────────────────────────────────────────────

const PLATFORMS = {
  claude: {
    file: 'claude-project.md',
    heading: 'Claude.ai Project Template',
    fieldName: 'Claude.ai project custom instructions',
    fieldPath: 'Claude.ai → Projects → your project → Instructions',
    sectionTitle: 'Custom Instructions',
  },
  openai: {
    file: 'openai-project.md',
    heading: 'OpenAI Project Template',
    fieldName: 'OpenAI project instructions (or a Custom GPT’s Instructions field)',
    fieldPath: 'ChatGPT → Projects → your project → Instructions, or GPT Builder → Configure → Instructions',
    sectionTitle: 'Instructions',
  },
};

function buildProjectInstructions(workflow, platform) {
  const meta = PLATFORMS[platform];
  const purpose = projectPurpose(workflow);
  const configuration = configurationSection(workflow);
  const outputFormat = outputFormatSection(workflow);

  return `
# ${meta.heading}: ${workflow.name}

## Project Name
${workflow.name}

## Where This Goes
${meta.fieldPath}

## ${meta.sectionTitle}
(Copy everything below this line into the ${meta.fieldName})

---

You are the ${workflow.name} Agent. ${purpose}

This is the on-demand version of that workflow: nothing is scheduled and nothing is delivered by a connector. A person types ${inputHint(workflow)}, and you produce the finished report in the chat for them to read, copy, and send themselves.

## How to Use
Type ${inputHint(workflow)}. You will get a complete ${workflow.name} report, ranked by what needs attention first.

## Your Process

${processSection(workflow)}

## Report Sections
${reportSections(workflow)}

## Rules
${rulesSection(workflow)}
${configuration}${outputFormat}
## Required Integrations
${integrationsSection(workflow)}
`;
}

// Hand-authored refinements that the catalog metadata cannot express. These are
// spliced into the generated document so regeneration never loses them.
const EXTRA_SECTIONS = {
  '11-deal-hygiene-audit': {
    after: '## Your Process',
    markdown: `
## Hygiene Checks

Flag a deal if any of these is true:

| Check | Trigger |
|---|---|
| Past-due close date | Close date is before today and the deal is still open |
| Unrealistic close date | Close date is inside 30 days but the stage is Discovery or Qualification |
| Stale activity | No logged activity beyond the stage norm (see below) |
| No next step | No next step logged, or the logged next step has no owner or no due date |
| Single-threaded | Fewer than 2 contacts engaged in the last 30 days |
| No executive engagement | No VP+ contact engaged, on a deal past Discovery or above $50K |
| Missing fields | Champion, competition, or qualification score blank on a deal past Qualification |

Default stage norms for activity recency — override these if the user gives you their own:
Discovery 7 days · Qualification 7 days · POC / Technical Validation 5 days · Proposal 5 days · Negotiation 3 days
`,
  },
};

function applyExtraSections(markdown, workflowId) {
  const extra = EXTRA_SECTIONS[workflowId];
  if (!extra) return markdown;
  const anchor = markdown.indexOf(extra.after);
  if (anchor === -1) return markdown;
  const nextHeading = markdown.indexOf('\n## ', anchor + extra.after.length);
  const cut = nextHeading === -1 ? markdown.length : nextHeading;
  return `${markdown.slice(0, cut)}\n${extra.markdown}${markdown.slice(cut)}`;
}

export function buildProjectInstructionAssets() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  let updatedWorkflows = 0;
  const written = [];

  for (const workflow of catalog.workflows || []) {
    const workflowDir = path.join(repoRoot, workflow.id);
    if (!fs.existsSync(workflowDir)) continue;

    for (const [platform, meta] of Object.entries(PLATFORMS)) {
      const markdown = applyExtraSections(buildProjectInstructions(workflow, platform), workflow.id);
      writeText(path.join(workflowDir, meta.file), markdown);
      written.push(`${workflow.id}/${meta.file}`);
    }

    workflow.platforms = workflow.platforms || {};
    workflow.platforms['claude-project'] = 'claude-project.docx';
    workflow.platforms['openai-project'] = 'openai-project.docx';

    workflow.platform_status = workflow.platform_status || {};
    workflow.platform_status['claude-project'] = 'guide-only';
    workflow.platform_status['openai-project'] = 'guide-only';

    // Every rendered format of each project asset, so the site can offer all
    // three and sync-data knows what to copy.
    workflow.platform_formats = {
      ...(workflow.platform_formats || {}),
      'claude-project': ['claude-project.docx', 'claude-project.pdf', 'claude-project.md'],
      'openai-project': ['openai-project.docx', 'openai-project.pdf', 'openai-project.md'],
    };

    const exports = new Set(workflow.exports || []);
    for (const file of ['claude-project.docx', 'claude-project.pdf', 'openai-project.docx', 'openai-project.pdf']) {
      exports.add(file);
    }
    workflow.exports = [...exports];

    updatedWorkflows += 1;
  }

  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  return { updatedWorkflows, writtenCount: written.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildProjectInstructionAssets(), null, 2));
}
