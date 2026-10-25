# import

Read docs/replace-instrumentl.md. Confirm full Opportunities export, actual date format and single currency. Run --dry-run first. Reconcile identities and amounts. Explain preserved source changes and missing financial/task history.

Run `node scripts/grants.mjs import instrumentl <opportunities.csv> --currency=NZD --actor=name [--dry-run --date-format=mdy|dmy|iso]`. Replace placeholders with the operator's values. Append `--json` when validating results. Every write needs an actor. If ambiguous, show matches and ask. Never send, submit or make a payment. Drafts stay local.
