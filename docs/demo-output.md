# Captured demo runs

Fictional data. Captured 25 October 2026.

## Application deadlines

Which applications need action before the next deadline?

```text
> node scripts/grants.mjs deadlines
  name                  owner  status     deadline  
  --------------------  -----  ---------  ----------
  Youth Digital Access         preparing  2026-10-22
  Community Meals 2027  Mere   submitted  2026-12-24
```

## Award balances

What funding remains after actual and planned spending?

```text
> node scripts/grants.mjs awards
  name                  currency  awarded   actual    planned   uncommitted
  --------------------  --------  --------  --------  --------  -----------
  Community Meals 2026  NZD       40000.00  21000.00  15000.00  4000.00    
  Community Transport   AUD       30000.00  32000.00  0.00      -2000.00
```

## Evidence gaps

Which grant records need evidence before we report?

```text
> node scripts/grants.mjs evidence-gaps
  name                  issue                        reference         
  --------------------  ---------------------------  ------------------
  Community Meals 2026  category budget exceeded     Food              
  Community Meals 2026  expense evidence missing     MEALS-003         
  Community Transport   agreement missing                              
  Community Transport   category budget exceeded     Transport         
  Community Transport   expense outside award dates  BUS-001           
  Youth Digital Access  requirement source missing   Application review
```
