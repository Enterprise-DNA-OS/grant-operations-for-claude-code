# Grant Operations for Claude Code

Keep grant applications, award restrictions, budgets, expense evidence and reporting dates in a database you own. An MIT-licensed desk for a charity or grant consultant that already knows its funders.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Try the demo and import your grant opportunities. | Your award fields, reporting rules, evidence mappings and agreed screens. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=instrumentl&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=instrumentl&utm_medium=managed) |

## The weekly grant meeting

Five recurring jobs: check applications due, reconcile award balances, review category budgets, collect missing evidence and draft the next acquittal. The fictional Harbour Community Trust has an overdue application, a late report, a missing receipt, an overcommitted category and a transport award with spending after its end date.

## Quick start

Node 20 or later. The commands are the same on Windows and Linux.

```bash
git clone https://github.com/Enterprise-DNA-OS/grant-operations-for-claude-code.git
cd grant-operations-for-claude-code
npm install
npm run demo
npm test
node scripts/grants.mjs weekly-review
npm run view
npm run docs
```

Open this folder in Claude Code, Codex, OpenCode or Cursor. There are 36 CLI commands and 37 slash recipes, including /customise and /new-view. [Full CLI reference](docs/cli.md).

PGlite stores local data under .data/db. DATABASE_URL selects PostgreSQL with verified TLS. For business records use a fresh DATA_DIR, run migrations and omit the demo seed. Embedded mode supports one trusted operator at a time. Shared use requires authenticated roles, organisation isolation, backups and protected document storage. Row-level security is enabled with no public grants. The owner account bypasses that protection; an actor name is attribution, not authentication.

## Keep financial evidence straight

Amounts are stored in integer cents and remain separated by currency. Unknown award values remain unknown. Planned expenses reduce uncommitted funding but do not count as actual spend. Posting a planned expense converts the same record, so it is not counted twice. Voids preserve the record and explanation. The desk does not make payments, synchronise a bank account, calculate tax or prepare statutory accounts.

Budgets and reports follow your signed agreement. The checks flag missing evidence, dates, restrictions and over-allocation. They do not decide cost eligibility or certify compliance. References point to files you keep elsewhere; the software does not verify that those documents exist. [Rule sources and limitations](docs/compliance.md).

Imports are transactional and repeatable. The source identity combines year, project, funder and opportunity name. Every source column is retained. Changed imports raise a reconciliation flag and preserve local decisions. Review the changed source, make explicit corrections and acknowledge it with a note. No missing row is deleted. The export includes all local records and activity history as JSON.

## Ten questions beyond a fixed report

Instrumentl already offers reporting and spending analysis. These are questions this free desk answers today, not claims that the vendor cannot answer them.

1. Which applications are overdue and have no owner? `attention`
2. Which award has money left but a category already overcommitted? `budgets` and `awards`
3. How much funding remains after actual and planned costs? `spenddown`
4. Which expense lacks a receipt reference? `evidence-gaps`
5. Which expense falls outside the signed award period? `evidence-gaps`
6. Which reporting deadline passed without completion evidence? `reports-due` and `attention`
7. Which source changed after our local review? `attention` and `history`
8. Which budgets lack a recorded award agreement? `evidence-gaps`
9. What changed when a planned expense became an actual expense? `history`
10. Which annual filing period is overdue? `compliance`

## Your first hour: ten things to ask for

1. Put our name, logo and colours on the review pack.
2. Show the applications that need an owner.
3. Find the report that is late.
4. Explain remaining funding versus uncommitted funding.
5. Show the category that exceeds its budget.
6. Test our Opportunities export without saving it.
7. Import into a fresh database and reconcile every award.
8. Draft an acquittal with unresolved evidence visible.
9. Add our funder's reporting category with /customise.
10. Add our board's monthly view with /new-view.

## Working papers and read-only reports

brand.json controls the business name, logo and colours. npm run docs creates draft acquittals, application briefs and evidence registers. npm run view creates a weekly review and evidence report. Both are printable HTML, kept locally. No file is sent, submitted or hosted. [Why no front end](docs/why-no-front-end.md). [Three captured demo runs](docs/demo-output.md).

## Move from Instrumentl

The [replacement guide](docs/replace-instrumentl.md) covers the documented Opportunities CSV export in one import command. It brings over owned grant records, not the full Instrumentl service. The vendor's funder discovery, complete task history, proposal editor and live accounting connections need separate arrangements. Use the free desk where your funders and source documents are already known; Enterprise DNA scopes the wider migration and operating setup. The supplied fixture is synthetic, not an actual tenant export. [Selection evidence](docs/research.md).

MIT licence. Not affiliated with Instrumentl or Anthropic. Database hosting and agent usage have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=instrumentl&utm_medium=readme).
