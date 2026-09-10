# PROJECT: MANUFACTURING STOCK CONTROL — MINI ERP

Build a new commercial source-code product called:

**Manufacturing Stock Control (MSC)**

This product is a lightweight **Manufacturing Stock Control / Mini ERP** focused on inventory transactions, production execution, LOT traceability, and stock accuracy.

---

# 0. CRITICAL REFERENCE PROJECT

Use my existing GitHub repository:

**hidayatressa-pixel/smart-andon-manufacturing-system**

as the REFERENCE for:

- Product structure philosophy
- Buyer first-run experience
- Demo Mode concept
- Role-based access philosophy
- Login experience
- Admin vs operational authority separation
- Master Data concept
- System Configuration concept
- Branding/customization concept
- Activity/Audit Log concept
- Reporting structure
- CSV/template workflows where appropriate
- Commercial source-code distribution philosophy
- Overall modern manufacturing UI/UX direction

IMPORTANT:

Do NOT convert Smart Andon itself into this product.

Do NOT modify the Smart Andon repository.

This must be a NEW and independent Manufacturing Stock Control project.

Smart Andon is only the architectural/product-experience reference.

The business domain must be completely changed from Andon response management into:

**Inventory → Production → LOT Traceability → Stock Control.**

---

# 1. ABSOLUTELY DO NOT USE VINEXT

Do NOT use:

- Vinext
- proprietary application builders
- proprietary wrappers
- mandatory hosted backend platforms
- mandatory third-party SaaS for core functionality

Do NOT introduce a platform simply because it makes development faster.

Do NOT migrate the project to another application platform without my explicit approval.

Normal open-source libraries/frameworks are allowed.

The application must remain understandable, editable, deployable and commercially distributable as source code.

---

# 2. COMMERCIAL PRODUCT PHILOSOPHY

This product will be sold as source code.

The desired buyer experience is:

DOWNLOAD SOURCE
→ INSTALL/RUN
→ OPEN APPLICATION
→ LOGIN USING DEMO ACCOUNT
→ EXPLORE COMPLETE DEMO SYSTEM
→ CONFIGURE THEIR OWN SYSTEM
→ INITIALIZE THEIR OWN DATABASE
→ CREATE THEIR OWN USERS
→ SWITCH TO PRODUCTION MODE
→ USE THEIR OWN DATA

The buyer should NOT need to rewrite the source code just to begin using the application.

The application must feel complete when first opened.

---

# 3. TWO APPLICATION MODES

Implement two clearly separated modes.

## DEMO MODE

Demo Mode exists so a potential buyer can immediately experience the application.

Provide realistic manufacturing demo data.

Demo Mode must include working examples of:

- Items
- Raw Materials
- WIP
- Finished Goods
- BOM
- Inventory
- Raw Material LOTs
- Production Orders
- Material Requests
- Material Issues
- Production Results
- Finished Goods LOTs
- Stock Ledger
- Reject data
- Stock Opname
- Traceability
- Reports
- Dashboard KPIs
- Activity Logs

Demo data must be isolated from production data.

Provide a Demo Reset feature.

Demo Reset must ONLY reset demo data.

It must NEVER affect production data.

## PRODUCTION MODE

Production Mode uses the buyer's own:

- Database
- Company information
- Master Data
- Users
- Inventory
- Production transactions
- LOTs
- Reports

No demo credentials may automatically become production credentials.

---

# 4. DATABASE / DEPLOYMENT PHILOSOPHY

Unlike the reference Smart Andon product, Manufacturing Stock Control should NOT require Firebase for its core production operation.

Use a conventional self-hosted architecture.

Preferred production database:

**MySQL**

The buyer should control their own database.

Database configuration should support standard values such as:

DB\_HOST
DB\_PORT
DB\_NAME
DB\_USER
DB\_PASSWORD

Provide:

`.env.example`

Never hardcode real credentials.

The system should support:

CONFIGURE DATABASE
→ TEST CONNECTION
→ RUN/VERIFY MIGRATION
→ INITIALIZE SYSTEM
→ CREATE ADMIN
→ PRODUCTION MODE

Sensitive database credentials must remain server-side.

Do NOT expose database credentials in browser JavaScript or insecure localStorage.

The application must be capable of operating on a local company network without requiring internet access for core manufacturing functionality.

---

# 5. PREFERRED TECHNICAL DIRECTION

Use Smart Andon's frontend philosophy as reference.

Preferred:

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS

Backend:

- Node.js
- Express or another conventional open-source Node backend if technically justified

Database:

- MySQL

API:

- REST API

Do NOT change this architecture or introduce another major framework/platform without first explaining why and obtaining approval.

---

# 6. ROLE MODEL

Maintain the five-level philosophy used by Smart Andon, but adapt the operational roles to Manufacturing Stock Control.

Use:

### PRODUCTION

Shop-floor production user.

Primary capabilities:

- View released Production Orders
- View required materials
- Create/request Material Request where allowed
- Record production execution
- Input GOOD quantity
- Input REJECT quantity
- Select reject reason
- Complete production result
- View relevant production history

Production must NOT manage system configuration.

### WAREHOUSE

Inventory/material control user.

Primary capabilities:

- Receiving / Stock IN
- View inventory
- View Material Requests
- Perform Material Issue
- Select material LOT
- Handle controlled returns
- View stock movement
- Perform warehouse-related transactions

Warehouse must NOT manage system configuration.

### SUPERVISOR

Operational supervisory role.

Capabilities:

- Production visibility
- Warehouse visibility
- Production history
- Stock movement visibility
- Reject monitoring
- Stock discrepancy monitoring
- Operational reports
- Traceability access

### MANAGER

Highest operational authority.

Capabilities:

- Management Dashboard
- Full operational visibility
- Analytics
- Reports
- Inventory visibility
- Production performance
- Reject performance
- Stock variance
- LOT traceability

MANAGER must NOT automatically receive system-administration permissions.

### ADMIN

System administrator.

Capabilities:

- Master Data
- Item Master
- BOM administration
- User management
- Roles/permissions
- UOM
- Categories
- Transaction numbering
- System Configuration
- Branding
- Company information
- Demo reset
- Administrative utilities
- Activity log administration
- Database/setup-related administration where appropriate

Admin may perform operational actions when necessary.

Keep authorization rules centralized and maintainable.

---

# 7. DEMO ACCOUNTS

Provide five Demo Mode accounts.

Suggested credentials:

PRODUCTION DEMO
ID: `PROD-1001`
PIN: `1234`

WAREHOUSE DEMO
ID: `WH-2001`
PIN: `2345`

SUPERVISOR DEMO
ID: `SPV-3001`
PIN: `3456`

MANAGER DEMO
ID: `MGR-4001`
PIN: `4567`

ADMIN DEMO
ID: `admin01`
PIN: `8888`

These credentials are ONLY for Demo Mode.

Production users must be created/configured separately.

---

# 8. CORE MANUFACTURING PRINCIPLE

The most important data rule is:

## NEVER CHANGE STOCK DIRECTLY.

Every stock movement must originate from a valid transaction.

The system must always be able to answer:

- What changed the stock?
- Which transaction caused it?
- When did it happen?
- Who performed it?
- Which item was involved?
- Which LOT was involved?
- Which Production Order was involved?
- Why did the quantity change?

Stock movement must be auditable.

---

# 9. TRANSACTION NUMBERING

Use document-based transaction numbers.

Suggested prefixes:

RCV = Receiving
WO = Production Order
MR = Material Request
MI = Material Issue
PRD = Production Result / Finished Goods Receipt
RTN = Return
STO = Stock Opname
ADJ = Adjustment

Example:

RCV-20260911-0001
WO-20260911-0001
MR-20260911-0001
MI-20260911-0001
PRD-20260911-0001
STO-20260911-0001
ADJ-20260911-0001

Transaction numbering must be unique and collision-safe.

Allow Admin configuration where practical.

---

# 10. CORE MODULES / SCREENS

Build these main functional areas.

## 1. DASHBOARD

Display manufacturing KPIs such as:

- Raw Material stock
- WIP stock
- Finished Goods stock
- Production today
- GOOD quantity
- REJECT quantity
- Reject rate
- Low-stock items
- Open Production Orders
- Material Requests pending
- Stock variance
- Recent stock transactions

Dashboard content may adapt to role.

Production sees production-oriented information.

Warehouse sees inventory/material-oriented information.

Supervisor/Manager sees broader operational information.

Admin sees system/administrative information where appropriate.

---

## 2. ITEM MASTER

Support:

- Item code / SKU
- Item name
- Description
- Category
- Item type:
  - RAW MATERIAL
  - WIP
  - FINISHED GOODS
- UOM
- Minimum stock
- Active/inactive
- Barcode/QR value
- Created timestamp
- Updated timestamp

SKU must be unique.

Support CSV import/export where appropriate.

Provide downloadable CSV templates similar to the configurable Master Data philosophy of Smart Andon.

---

## 3. INVENTORY

Display:

- Current stock
- Stock by item
- Stock by LOT
- Available stock
- IN transactions
- OUT transactions
- Stock movement history
- Low-stock condition
- Search/filter

Support controlled inventory transactions such as:

- Opening Balance
- Receiving
- Return
- Adjustment

Do NOT implement full Purchasing in V1.

Receiving may reference an external purchasing/document number.

---

# 11. BOM — BILL OF MATERIALS

Support BOM relationships.

Example:

FG-A001
Standard output: 1 PCS

Requires:

RM-A01 = 2 PCS
RM-B02 = 0.5 KG
RM-C03 = 1 PCS

BOM must contain:

- Parent item
- Component item
- Standard quantity
- UOM
- Status
- Optional version information

BOM drives Production Order material requirement calculations.

---

# 12. PRODUCTION ORDER

Production Order is a production execution document.

It is NOT advanced Production Planning/MRP.

Support:

- WO number
- Product
- Target quantity
- BOM reference
- Production date
- Optional due date
- Status
- Notes

Suggested lifecycle:

DRAFT
→ RELEASED
→ IN PRODUCTION
→ COMPLETED

Also support CANCELLED with appropriate validation.

When a WO is released, calculate required material:

BOM STANDARD × TARGET QUANTITY

Example:

Product A target = 500 PCS

BOM RM-A01 = 2 PCS/product

Required material:

1,000 PCS RM-A01

---

# 13. MATERIAL REQUEST

A Production Order must be able to generate/request required materials.

Material Request contains:

- MR number
- WO reference
- Material
- Required quantity
- Requested quantity
- Issued quantity
- Remaining quantity
- Status
- Requester
- Timestamp

Suggested lifecycle:

DRAFT
→ REQUESTED
→ PARTIALLY ISSUED
→ ISSUED
→ CLOSED

---

# 14. MATERIAL ISSUE

Warehouse processes Material Requests.

Material Issue must contain:

- MI transaction number
- MR reference
- WO reference
- Material
- Material LOT
- Requested quantity
- Issued quantity
- Warehouse user
- Timestamp

Material Issue creates:

**STOCK OUT**

Do not permit issue above available LOT quantity unless an explicitly approved rule allows it.

Support partial issue.

Example:

Requested = 1,000 PCS

Issue #1 = 600 PCS
Issue #2 = 400 PCS

Remaining request automatically becomes zero.

---

# 15. PRODUCTION RESULT

Production records actual production result.

Support:

- PRD transaction number
- WO
- Product
- Target quantity
- GOOD quantity
- REJECT quantity
- Reject reason
- Operator/user
- Start timestamp
- Finish timestamp
- Notes

Validate quantities logically.

Posting GOOD quantity creates Finished Goods stock.

Example:

Target = 500

GOOD = 490
REJECT = 10

Finished Goods inventory receives:

+490 PCS

Reject is recorded separately and must NOT increase usable FG stock.

---

# 16. LOT / BATCH MANAGEMENT

LOT traceability is a CORE selling feature.

Raw Material receiving may create or register:

RM LOT

Material Issue must record which RM LOT was consumed.

Production Result must generate/assign:

FG LOT

Example:

RM-LOT-001
→ MI-0001
→ WO-0001
→ PRD-0001
→ FG-LOT-001

Support LOT quantity balance.

---

# 17. FORWARD & BACKWARD TRACEABILITY

Support both directions.

### Forward Traceability

Search Raw Material LOT:

RM LOT
→ Material Issue
→ Production Order
→ Production Result
→ Finished Goods LOT

### Backward Traceability

Search Finished Goods LOT:

FG LOT
→ Production Result
→ Production Order
→ Material Issues
→ Raw Material LOTs

Traceability should have a clear visual representation.

This is one of the product's main selling features.

---

# 18. STOCK LEDGER

Implement a reliable Stock Ledger.

Conceptual fields:

- id
- transaction\_number
- transaction\_type
- item\_id
- lot\_id
- quantity
- direction
- reference\_type
- reference\_id
- user\_id
- timestamp
- notes/reason

Direction:

IN
OUT

Important:

Posted stock transactions must not simply disappear when somebody edits or deletes a document.

Use controlled reversal/correction logic where appropriate.

Prevent duplicate posting.

Use database transactions for stock-affecting operations.

---

# 19. STOCK OPNAME

Implement physical stock reconciliation.

User records:

SYSTEM QTY
ACTUAL QTY

System calculates:

GAP = ACTUAL - SYSTEM

Example:

SYSTEM = 1,000
ACTUAL = 980

GAP = -20

Do NOT overwrite system stock silently.

Posting the Stock Opname adjustment must generate a controlled ADJ transaction referencing the STO document.

Maintain history.

---

# 20. REPORTS

Provide useful reports including:

- Current Stock
- Stock Movement
- Stock by LOT
- Receiving History
- Material Request History
- Material Issue History
- Production Order History
- Production Result
- GOOD vs REJECT
- Material Consumption
- Stock Opname Variance
- LOT Traceability

Support filters such as:

- Date
- Item
- Transaction type
- LOT
- WO
- User
- Status

Support CSV/XLSX export where practical.

---

# 21. MASTER DATA

Admin manages:

- Items
- Categories
- UOM
- BOM
- Reject Reasons
- Users
- Roles/permissions
- Optional warehouse/location master if required
- Transaction numbering configuration

Where appropriate provide:

DOWNLOAD TEMPLATE
UPLOAD CSV
VALIDATE
PREVIEW
IMPORT

Do not hard-code the buyer's factory/product structure.

---

# 22. ACTIVITY / AUDIT LOG

Follow Smart Andon's Activity Log philosophy.

Record meaningful activities such as:

- Login
- Logout
- Item creation/update
- BOM changes
- WO creation/release/completion
- Material Request
- Material Issue
- Production Result
- Stock Adjustment
- Stock Opname
- User changes
- System configuration changes
- Demo reset

Log:

WHO
WHAT
WHEN
REFERENCE

Do not allow normal operational users to erase audit history.

---

# 23. SYSTEM CONFIGURATION

Admin-only System Configuration should include:

- Company name
- Company logo
- Application branding
- Language where implemented
- Theme
- UOM configuration
- Transaction numbering
- Database/setup status
- Demo/Production mode visibility
- Other safe configuration

Keep sensitive server credentials out of frontend storage.

---

# 24. WHITE LABEL / BUYER CUSTOMIZATION

Like Smart Andon, the product should be buyer-configurable.

Buyer should be able to customize without editing source code where reasonable:

- Company name
- Logo
- Items
- BOM
- Users
- Categories
- UOM
- Reject reasons
- Operational Master Data

Do not hard-code one factory's production structure.

---

# 25. UI / UX DIRECTION

Use Smart Andon as visual/product-family inspiration.

The new product should feel related to Smart Andon but NOT copied blindly.

Requirements:

- Modern manufacturing UI
- Professional sidebar
- Responsive layout
- Desktop/tablet friendly
- KPI cards
- Clear tables
- Search/filter
- Status badges
- Confirmation dialogs
- Toast notifications
- Empty states
- Loading states
- Error states
- Dark/light theme if practical
- Clear transaction numbers
- Clear LOT identification
- Clear stock warnings

Avoid a generic AI-generated admin-dashboard appearance.

The UI should look commercially sellable.

---

# 26. DATA INTEGRITY REQUIREMENTS

This is extremely important.

Implement:

- Database transactions
- Referential integrity
- Unique constraints
- Input validation
- Duplicate-post prevention
- Negative-stock prevention
- Authorization checks
- Safe error handling
- Atomic stock posting
- Audit timestamps

Material Issue must not partially post if database processing fails.

Production Result must not partially create FG stock if processing fails.

Stock Opname posting must be atomic.

---

# 27. OUT OF SCOPE FOR V1

DO NOT implement:

- Full Purchasing
- Purchase Order workflow
- Supplier payment
- Sales Order
- Customer management
- Accounting
- Finance
- HR
- Payroll
- Advanced MRP
- Capacity Planning
- Production Scheduling engine
- Machine scheduling
- OEE
- TPM
- Maintenance
- Andon
- IoT
- PLC integration
- AI
- Subscription billing
- Mandatory cloud services
- Multi-factory enterprise architecture

These may become future products or Pro features.

DO NOT expand scope without approval.

---

# 28. COMMERCIAL SOURCE-CODE REQUIREMENTS

The project will be distributed/sold as source code.

Provide:

- Clean repository
- README
- Installation guide
- `.env.example`
- Database migrations
- Demo seed
- Demo credentials documentation
- Production configuration guide
- Build instructions
- Deployment instructions
- License placeholder/documentation
- Clean dependency list

No:

- Hardcoded secrets
- Personal API keys
- Personal database credentials
- Hidden telemetry
- Mandatory vendor accounts
- Unnecessary paid APIs

The buyer must be able to inspect and modify the source.

---

# 29. PRODUCT POSITIONING

This is NOT marketed as a complete ERP.

Position it as:

**Manufacturing Stock Control — Mini ERP**

Core workflow:

RAW MATERIAL
→ INVENTORY
→ PRODUCTION ORDER
→ MATERIAL REQUEST
→ MATERIAL ISSUE
→ PRODUCTION
→ GOOD / REJECT
→ FINISHED GOODS
→ STOCK OPNAME
→ TRACEABILITY

Core promise:

**Every Stock Movement Is Traceable.**

---

# 30. IMPORTANT DEVELOPMENT INSTRUCTION

DO NOT START IMPLEMENTING THE ENTIRE APPLICATION YET.

FIRST:

1. Inspect `hidayatressa-pixel/smart-andon-manufacturing-system`.
2. Understand its role model.
3. Understand its Demo Mode.
4. Understand its Admin/Manager separation.
5. Understand its Master Data philosophy.
6. Understand its System Configuration/branding philosophy.
7. Understand its Activity Log/reporting philosophy.
8. Identify which concepts can be reused as patterns.
9. Identify which Smart Andon-specific concepts must NOT be copied.
10. Propose the architecture for Manufacturing Stock Control.
11. Propose the database schema.
12. Propose the role-permission matrix.
13. Propose the stock transaction model.
14. Propose LOT relationships.
15. Propose the screen/navigation structure.
16. Identify data-integrity risks.
17. Identify security risks.
18. Confirm that Vinext or another proprietary platform will NOT be introduced.

Then present the proposed architecture to me.

## STOP AFTER THE ARCHITECTURE PROPOSAL.

DO NOT generate or modify production code until I approve the architecture.

Do not make major assumptions silently.

If a requirement conflicts with good data integrity or security practice, explain the conflict before implementation.

The priority order is:

1. Stock/data integrity
2. Traceability
3. Security
4. Correct manufacturing workflow
5. Buyer configurability
6. Ease of deployment
7. UI/UX
8. Additional features