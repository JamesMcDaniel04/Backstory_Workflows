# Backstory Automation Catalog

Static GitHub Pages SPA rebranded from the original `HappyCowboyAI/automation-catalog`.

## What This Repo Contains

- `index.html`: single-page app with hash routing
- `workflows.json`: catalog data for the original 18 workflows
- `01-*` through `18-*`: copied workflow assets and downloadable files used by the detail pages

The site requires no build step and is designed to deploy directly from the repo root.

## Routes

- `#/`
- `#/about`
- `#/guides`
- `#/guides/backstory-mcp`
- `#/guides/slack-bot-setup`
- `#/guides/teams-setup`
- `#/guides/google-chat-setup`
- `#/guides/email-setup`
- `#/workflow/<id>`

Legacy links to `#/guides/peopleai-mcp` redirect to `#/guides/backstory-mcp`.

## Local Preview

Because the SPA fetches `workflows.json`, serve the repo over HTTP instead of opening `index.html` directly from `file://`.

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/#/
```

## GitHub Pages Deployment

1. Push this repo to GitHub.
2. Open the repository settings in GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Save.
6. Wait a minute or two for GitHub Pages to publish.

Your site will be available at:

```text
https://<username-or-org>.github.io/<repo-name>/
```

## Notes

- No build pipeline is required.
- Download links on workflow detail pages resolve to files in this repo, not the upstream source repo.
- The production MCP endpoint remains `https://mcp.people.ai/mcp`.
- The Backstory n8n instance referenced in the guides is `https://n8n-pg.peoplesync.ai`.
