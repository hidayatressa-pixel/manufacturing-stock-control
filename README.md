# Manufacturing Stock Control — Mini ERP

Manufacturing Stock Control (MSC) is a planned commercial source-code product for inventory transactions, production execution, LOT traceability, and stock accuracy.

> **Status: architecture approval gate**

Production implementation has intentionally not started. The latest approved development instruction requires an architecture proposal first and explicitly prohibits production-code changes until the architecture is approved.

## Documents

- [`PROJECT_REQUIREMENTS.md`](PROJECT_REQUIREMENTS.md) — current product brief and scope.
- [`docs/ARCHITECTURE_PROPOSAL.md`](docs/ARCHITECTURE_PROPOSAL.md) — proposed architecture, data model, permissions, transaction rules, risks, and delivery milestones.

## Core promise

**Every Stock Movement Is Traceable.**

## Proposed stack (awaiting approval)

- React + TypeScript + Vite
- Tailwind CSS
- Node.js + Express REST API
- MySQL 8
- Prisma ORM
- Server-side sessions / JWT with refresh-token rotation
- Docker Compose optional; normal local/VPS installation supported

Vinext, Firebase, mandatory SaaS services, and proprietary application platforms are excluded.

## Reference boundary

`hidayatressa-pixel/smart-andon-manufacturing-system` is used only as a product-experience reference. It will not be modified or converted into MSC.

