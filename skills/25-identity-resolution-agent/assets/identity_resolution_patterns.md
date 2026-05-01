# Identity Resolution Patterns

## Canonical Entity Types

- person
- account
- owner
- channel
- participant

## Preferred Identifier Order

1. stable system ID
2. corporate email
3. approved alias list
4. domain + display-name combination

## Never Auto-Merge

- shared mailboxes
- contractors without stable corporate identity
- duplicate display names across regions
- subsidiary domains not present in the domain registry

## Review Triggers

- alias maps to multiple accounts
- same human appears under multiple owner IDs
- channel naming conflicts with team or region names
- meeting participant lacks trusted email
