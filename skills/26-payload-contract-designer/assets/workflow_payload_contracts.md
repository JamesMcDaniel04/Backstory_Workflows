# Workflow Payload Contracts

## Boundary Design Rule

Each workflow boundary should expose:

- stable IDs
- normalized timestamps
- explicit source metadata
- routing metadata
- version metadata

## Required vs Optional

- required fields must exist for the downstream step to run
- optional fields can be absent without changing the workflow decision
- derived fields should be recomputable downstream when possible

## Versioning

- additive changes can remain in the same major version
- renamed or retyped fields require a new version
- enum expansion requires registry updates before release

## Replay Guidance

- keep original payloads for quarantine and replay
- attach validation context to every failure
- avoid silent coercion for high-risk fields like account or owner IDs
