# Grant record checks

Checked 25 October 2026. These are evidence prompts and agreement checks, not a legal opinion or a compliance certificate. The signed award sets allowed costs, reporting dates and retention requirements. The operator records those terms. The software never infers eligibility from a category name, pays money, submits a report, or decides whether a cost qualifies for reimbursement.

| Check | Implemented behaviour | Source |
|---|---|---|
| NZ annual filing | An organisation with an unfiled reporting period is shown with the due month, six months after its month-end balance date. | [Charities Services annual returns](https://www.charities.govt.nz/annual-reporting/annual-return) |
| AU annual filing | Six months after a month-end reporting period. Confirm any ACNC extension, reporting-group arrangement or first-year exception separately. | [ACNC due dates](https://www.acnc.gov.au/for-charities/annual-information-statement/annual-information-statement-due-dates) |
| AU evidence retention | The compliance review reminds the operator to retain financial and operational records for seven years. No deletion command exists. | [ACNC record-keeping](https://www.acnc.gov.au/tools/topic-guides/record-keeping) |
| Grant balances | Recorded expenses and category allocations are compared with the recorded award. Planned commitments remain separate from actual expenses. | [Charities Services Tier 3 guide, tracking grants](https://charities.govt.nz/assets/Uploads/Resources/Tier-3-Guide-161103-printed-V2.0-web.pdf), used as record-keeping guidance, not as the current accounting standard |
| Agreement evidence | Flag a missing agreement, missing restriction text, missing award dates, spending outside those dates, uncategorised budgets and missing expense references. | The operator's signed agreement, stored in agreement_ref. These checks are internal policy, not a statutory rule. |
| Reporting evidence | An unfinished reporting task remains due. Completing a task requires an evidence reference. | The operator's requirement_ref on each task. |

Use `node scripts/grants.mjs compliance`. Use `add-organisation` to enter each reporting period as a separate record (include the year in the name); `file-annual` records filing date and evidence in the history. Only month-end balance dates are supported. The seeded organisation is fictional.

Evidence references are pointers, not proof that a file exists, is complete or was reviewed. Store source documents securely, check links, reconcile the accounting ledger and retain backups. Do not confuse grant receipt, recognised income, expenses and cash payments: this desk tracks award allocations and spending records, not accounting recognition or tax. No financial-statement or statutory filing is produced.

Row-level security is enabled with no public grants. The owner connection bypasses those protections. A shared installation needs authenticated accounts, appropriate roles and isolated organisation data. The actor flag is attribution, not authentication. The activity history is an application audit trail, not an immutable ledger against a database administrator.
