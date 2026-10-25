# set-grant

Read the affected records before changing them. Use full ids after resolving a name. Report the actual result and any missing evidence.

Run `node scripts/grants.mjs set-grant <grant> [--owner=name --status=awarded --requested=100.00 --awarded=100.00 --deadline=YYYY-MM-DD --start=YYYY-MM-DD --end=YYYY-MM-DD --restrictions=text --agreement=reference] --actor=name`. Replace placeholders with the operator's values. Append `--json` when validating results. Every write needs an actor. If ambiguous, show matches and ask. Never send, submit or make a payment. Drafts stay local.
