# Canonical CRM Schema

Normalize customer CRM sources into a reusable object model with:

- account
- contact
- opportunity
- owner
- activity

## Recommended Core Fields

- `accountName`
- `accountId`
- `opportunityName`
- `opportunityId`
- `stage`
- `amount`
- `closeDate`
- `ownerName`
- `ownerEmail`
- `contactRoles`
- `lastActivityAt`
- `sourceSystem`
- `sourceId`

## Mapping Rule

Downstream workflows should consume the canonical fields only.
All vendor-specific names should be isolated in the normalization layer.
