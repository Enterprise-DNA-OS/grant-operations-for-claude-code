# acknowledge-source

Read source_row and import-changed history. Reconcile values and make explicit set-grant changes before acknowledging with a substantive note.

Run `node scripts/grants.mjs acknowledge-source <grant> --note=reconciliation-explanation --actor=name`. Replace placeholders with the operator's values. Append `--json` when validating results. Every write needs an actor. If ambiguous, show matches and ask. Never send, submit or make a payment. Drafts stay local.
