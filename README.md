# Manufacturing Stock Control

Manufacturing Stock Control (MSC) is a focused manufacturing transaction and LOT traceability system.

Core workflow: `PPC → Warehouse → Production → Finished Goods / Delivery`.

MSC is built around connected business documents rather than disconnected CRUD screens.

## Transaction rules
- No orphan transactions.
- No direct stock edits for operational movement.
- Every stock movement has a source document, actor, time, item, LOT, source location and destination location.
- A status change must have a business consequence.
- Production Order is the operational transaction hub.
- LOT genealogy supports backward and forward traceability.

## Roles
PPC creates/releases Production Orders. Warehouse handles material requests, LOT preparation and transfer. Production receives material and reports GOOD/REJECT. Delivery receives Finished Goods LOTs. Supervisor and Manager monitor operations. Admin controls master data, users and configuration.

## Scope
Item/BOM master data, Production Orders, Material Requests, shop transfers, Production Results, Inventory by LOT/location, Stock Ledger, LOT Traceability, Stock Opname, reporting and audit history.

Production is designed to be self-hosted with buyer-controlled source code and database. Core manufacturing transactions must not require a proprietary hosted application platform or mandatory cloud service.

This branch is a clean rebuild. Transaction logic and data integrity take precedence over decorative screens and placeholder buttons.
