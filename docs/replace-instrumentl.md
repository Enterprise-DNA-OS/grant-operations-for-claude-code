# Move your owned grant records from Instrumentl

1. In Instrumentl, open Reports and choose the Opportunities report. Include every project and reporting year needed. Download CSV/Excel as CSV. The quick Tracker export reflects selected columns and filters; use the full Opportunities report for this importer.
2. Keep the original CSV, award letters, submitted proposals and financial exports. Exports require a paid Instrumentl subscription. Do not close the account before reconciliation.
3. Create a fresh database with `npm run migrate` (do not run the demo seed). Import one currency per file. The vendor report does not establish a currency for every amount, so supply it explicitly.
4. Run the same command with `--dry-run` first, then without it:

```bash
node scripts/grants.mjs import instrumentl opportunities.csv --currency=NZD --actor=Mere --date-format=mdy --dry-run
```

Omit `--date-format` for ISO dates. Select `mdy` or `dmy` to match the actual export. Invalid dates or amounts reject the entire batch. Nothing calls Instrumentl or needs an API key.

The importer supports the vendor's [documented Opportunities report](https://help.instrumentl.com/en/articles/3730779-export-your-data-with-reports), checked 25 October 2026. The synthetic fixture uses those documented headings; it is not a captured customer export. Validate an actual tenant export before switching.

| Vendor heading | Local meaning |
|---|---|
| Year, Project, Funder name, Opportunity name | Composite source identity; all required |
| [Grant] Owner or Owner | Grant owner |
| Status | Recognised values map to the local workflow; other values start at prospect and remain in the raw row |
| Amount requested, Amount awarded | Optional decimal amounts in the explicitly supplied currency; blank means unknown, never zero |
| Funder Full proposal deadline | Application deadline |
| Award Period Start Date, Award Period End Date | Award period |
| Next task title, Next task deadline | One preparation task, only if both fields are present |
| Every other heading, including custom fields | Preserved in source_row for later mapping |

The source identity is case-sensitive and contains the four named fields. Renaming an opportunity, project, funder or year creates a new identity; reconcile it rather than deleting an old record. Duplicate identities in one CSV fail the batch. An unchanged repeat is a no-op for grant records. A changed repeat updates only the raw source and raises a reconciliation flag: it never overwrites local owners, amounts, budgets or completed tasks. Review `grant` and `history`, make explicit `set-grant` changes, then use `acknowledge-source --note=... --actor=...`.

The Opportunities report carries only the next task. It is not the complete task history. Full tasks, budgets, transactions, award letters, attachments, private discovery data and funder-search subscriptions do not migrate in this command. Export those separately, retain them, and scope mappings with Enterprise DNA. Enter verified budgets and expenses through the CLI or add an agreed importer through /customise. It does not recreate Instrumentl's discovery service, accounting connections or proposal editor.

Reconcile counts, identities, currencies, award periods and amounts against the source before use. Review unknown statuses and missing owners. Keep the vendor open until source files, historical evidence and ongoing integrations have been checked. Export everything held locally with `export --out=exports/snapshot.json`; it is a full JSON snapshot, not an accounting export or automatic restore tool.
