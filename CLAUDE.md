# Grant Operations for Claude Code

This is a grant-recipient desk for applications, restricted awards, spending evidence and reports. Read docs/compliance.md and docs/replace-instrumentl.md before business imports.

Every answer starts with a CLI read. Use scripts/grants.mjs, not a second workflow library. The slash recipes in .claude/commands work in every agent.

| Request | Recipe |
|---|---|
| grants | /grants |
| grant | /grant |
| pipeline | /pipeline |
| deadlines | /deadlines |
| awards | /awards |
| spenddown | /spenddown |
| budgets | /budgets |
| expenses | /expenses |
| tasks | /tasks |
| reports-due | /reports-due |
| evidence-gaps | /evidence-gaps |
| attention | /attention |
| compliance | /compliance |
| weekly-review | /weekly-review |
| history | /history |
| imports | /imports |
| organisations | /organisations |
| add-organisation | /add-organisation |
| file-annual | /file-annual |
| add-grant | /add-grant |
| set-grant | /set-grant |
| set-task | /set-task |
| set-budget | /set-budget |
| add-expense | /add-expense |
| post-expense | /post-expense |
| void-expense | /void-expense |
| add-task | /add-task |
| complete-task | /complete-task |
| log | /log |
| acknowledge-source | /acknowledge-source |
| import | /import |
| export | /export |
| draft-acquittal | /draft-acquittal |
| draft-application | /draft-application |
| Change the business rules | /customise |
| Add a read-only report | /new-view |

Never invent a grant, amount, restriction, outcome or evidence reference. Resolve ambiguous names before any write. Record the operator as actor; this is attribution, not authentication. All writes and imports are transactional. Preserve raw source rows and reconcile source_changed before reporting. Keep currencies separate and unknown amounts unknown. A budget category is not a legal eligibility decision.

Never submit applications or reports, email, make payments, delete records or expose evidence publicly. Drafts stay local. Reconcile with signed agreements and the accounting ledger. Embedded mode is single operator. Shared use requires authenticated roles, organisation isolation and backups. The owner database account bypasses row-level security.

Schema: supabase/migrations. Adapter: scripts/lib/db.mjs. Working papers: documents.json. Read-only reports: views.json. Brand: brand.json. Changes use new migrations and npm test before business data.
