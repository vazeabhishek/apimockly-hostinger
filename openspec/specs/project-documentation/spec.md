# project-documentation

## Purpose

Introduced by change add-chat-mock-api.

## Requirements

### Requirement: Diátaxis documentation structure
The project SHALL maintain documentation under `docs/` organised into the four Diátaxis quadrants: `tutorials/`, `how-to/`, `reference/` and `explanation/`, each containing content only of its type.

#### Scenario: Required pages exist
- **WHEN** the change is complete
- **THEN** there is a tutorial (create your first mock), how-to guides (claim a mock by signing up, run the cleanup job, configure limits), reference (chat phrase grammar, REST API, mock URL scheme, configuration, DB schema) and explanation (architecture, why URLs are namespaced, anonymous expiry model)

### Requirement: Docs updated with behavior changes
Every change that alters user-visible behavior, API or configuration SHALL update the relevant documentation in the same change.

#### Scenario: Behavior change
- **WHEN** a task changes the phrase grammar or limits
- **THEN** the reference docs are updated in the same change
