# add-expense

Read the affected records before changing them. Use full ids after resolving a name. Report the actual result and any missing evidence.

Run `node scripts/grants.mjs add-expense <grant> --reference=unique --category=name --date=YYYY-MM-DD --amount=100.00 --state=actual|planned --description=text [--evidence=reference] --actor=name`. Replace placeholders with the operator's values. Append `--json` when validating results. Every write needs an actor. If ambiguous, show matches and ask. Never send, submit or make a payment. Drafts stay local.
