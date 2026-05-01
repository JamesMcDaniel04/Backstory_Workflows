# Workflow Template Strategy

Use this knowledge file when deciding how to package a workflow across customer environments.

## Core Rule

Productize the reusable logic:

- prompts
- scoring and routing rules
- payload shapes between steps
- validation checkpoints

Keep vendor-specific layers thin:

- CRM connector steps
- delivery-node implementations
- note-taker ingestion wrappers
- auth and field-mapping details

## Three-Layer Packaging Model

1. Validated implementation
2. Recipe for major orchestrators
3. Generic adaptation guidance

## System Families To Substitute

- CRM: Salesforce, Dynamics 365, HubSpot, custom warehouse
- Delivery: Slack, Teams, email, ticket queues
- Meeting sources: Gong, Zoom, Teams, Otter, Fireflies, Fathom
- Orchestration: n8n, Make, Power Automate, Zapier, Workato, custom code
