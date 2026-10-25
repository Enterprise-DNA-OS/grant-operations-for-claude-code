# CLI reference

All reads support --json. Writes require --actor. Flags use --name=value. Dates are ISO. Amounts are nonnegative decimal currency units stored in integer cents. Grant references accept unique case-insensitive names or partial ids. Task and expense references use partial ids. Ambiguity exits 1 and lists matches.

## help

`node scripts/grants.mjs help`

## grants

`node scripts/grants.mjs grants`

## grant

`node scripts/grants.mjs grant <name-or-id>`

## pipeline

`node scripts/grants.mjs pipeline`

## deadlines

`node scripts/grants.mjs deadlines`

## awards

`node scripts/grants.mjs awards`

## spenddown

`node scripts/grants.mjs spenddown [grant]`

## budgets

`node scripts/grants.mjs budgets [grant]`

## expenses

`node scripts/grants.mjs expenses [grant]`

## tasks

`node scripts/grants.mjs tasks [grant]`

## reports-due

`node scripts/grants.mjs reports-due`

## evidence-gaps

`node scripts/grants.mjs evidence-gaps`

## attention

`node scripts/grants.mjs attention`

## compliance

`node scripts/grants.mjs compliance`

## weekly-review

`node scripts/grants.mjs weekly-review`

## history

`node scripts/grants.mjs history [grant]`

## imports

`node scripts/grants.mjs imports`

## organisations

`node scripts/grants.mjs organisations`

## add-organisation

`node scripts/grants.mjs add-organisation <name> --jurisdiction=NZ|AU --balance-date=YYYY-MM-DD --actor=name`

## file-annual

`node scripts/grants.mjs file-annual <organisation> --date=YYYY-MM-DD --evidence=reference --actor=name`

## add-grant

`node scripts/grants.mjs add-grant <name> --project=name --funder=name --currency=NZD --actor=name [--owner=name]`

## set-grant

`node scripts/grants.mjs set-grant <grant> [--owner=name --status=awarded --requested=100.00 --awarded=100.00 --deadline=YYYY-MM-DD --start=YYYY-MM-DD --end=YYYY-MM-DD --restrictions=text --agreement=reference] --actor=name`

## set-task

`node scripts/grants.mjs set-task <task-id> [--title=text --kind=report --due=YYYY-MM-DD --owner=name --requirement=reference] --actor=name`

## set-budget

`node scripts/grants.mjs set-budget <grant> --category=name --amount=100.00 --actor=name`

## add-expense

`node scripts/grants.mjs add-expense <grant> --reference=unique --category=name --date=YYYY-MM-DD --amount=100.00 --state=actual|planned --description=text [--evidence=reference] --actor=name`

## post-expense

`node scripts/grants.mjs post-expense <expense-id> --date=YYYY-MM-DD --evidence=reference --actor=name`

## void-expense

`node scripts/grants.mjs void-expense <expense-id> --reason=text --actor=name`

## add-task

`node scripts/grants.mjs add-task <grant> --title=text --kind=application|report|deliverable --due=YYYY-MM-DD [--owner=name --requirement=reference] --actor=name`

## complete-task

`node scripts/grants.mjs complete-task <task-id> --date=YYYY-MM-DD --evidence=reference --actor=name`

## log

`node scripts/grants.mjs log <grant> --note=text --actor=name`

## acknowledge-source

`node scripts/grants.mjs acknowledge-source <grant> --note=reconciliation-explanation --actor=name`

## import

`node scripts/grants.mjs import instrumentl <opportunities.csv> --currency=NZD --actor=name [--dry-run --date-format=mdy|dmy|iso]`

## export

`node scripts/grants.mjs export --out=path.json`

## draft-acquittal

`node scripts/grants.mjs draft-acquittal <grant>`

## draft-application

`node scripts/grants.mjs draft-application <grant>`
