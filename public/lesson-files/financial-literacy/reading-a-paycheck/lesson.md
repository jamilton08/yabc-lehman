---
version: 1.0
---

# Reading a paycheck

You were told \$18 an hour. You worked 40 hours. That is \$720 — and the check says \$578.41. Nobody stole anything. This lesson walks through exactly where the other \$141.59 went, line by line, so you can read any pay stub and know whether it is right.

> [!KEY] Gross vs. net
> **Gross pay** is what you earned. **Net pay** is what lands in your account. Everything in between is a **deduction**.
> $$\text{net pay} = \text{gross pay} - \text{deductions}$$

## The stub

Here is a pay stub for a part-time job in the Bronx. Two weeks of work.

| Earnings | Hours | Rate | Amount |
|---|---:|---:|---:|
| Regular | 40.00 | 18.00 | 720.00 |
| **Gross pay** | | | **720.00** |

| Deductions | This period |
|---|---:|
| Social Security (6.2%) | 44.64 |
| Medicare (1.45%) | 10.44 |
| Federal income tax | 41.20 |
| NY State income tax | 19.83 |
| NYC income tax | 15.48 |
| NY SDI / PFL | 10.00 |
| **Total deductions** | **141.59** |

| Result | Amount |
|---|---:|
| **Net pay** (gross − deductions) | **578.41** |

Every line has a reason. Let's take them in order.

## FICA: Social Security and Medicare

These two are the same for almost everyone in the country, and you can calculate them yourself:

- **Social Security: 6.2%** of gross pay. $720 \times 0.062 = 44.64$ ✓
- **Medicare: 1.45%** of gross pay. $720 \times 0.0145 = 10.44$ ✓

Together they are called **FICA** — 7.65% total. Your employer pays another 7.65% on top that never shows on your stub. This money funds retirement and disability checks for people collecting them *now*; when you retire, workers then will fund yours.

> [!TIP] Percent to decimal
> To take 6.2% of something, multiply by 0.062. Move the decimal two places left. 1.45% → 0.0145.

```quiz
title: Checkpoint 1 — FICA

1. Gross pay is \$900. How much is Social Security (6.2%)?
   = 55.80
   ~ 0.01
   > $900 \times 0.062 = 55.80$

2. Gross pay is \$900. How much is Medicare (1.45%)?
   = 13.05
   ~ 0.01
   > $900 \times 0.0145 = 13.05$

3. FICA is taken out of…
   - [x] every paycheck, at the same rate for almost everyone
   - [ ] only paychecks over \$1,000
   - [ ] only full-time jobs
   > FICA rates are flat: 6.2% + 1.45% on the first dollar you earn.
```

## Income tax withholding

Federal, state, and (because you live in the five boroughs) **New York City** income tax are different. They are not flat percentages. Two things decide how much comes out:

1. **How much you earn** — higher income, higher rate.
2. **Your W-4** — the form you filled out when you were hired. It tells your employer how much to hold back. Claiming more dependents or a second job changes the amount.

Withholding is an **estimate**. In April you file a tax return; if too much was withheld you get a **refund**, if too little you owe. That is why two people earning the same money can have different withholding lines.

> [!EXAMPLE] The stub above
> Federal 41.20 + NY State 19.83 + NYC 15.48 = **76.51** in income taxes on \$720 — about 10.6%. On a bigger check the percentage goes up.

## The small lines

**NY SDI / PFL** — New York's disability insurance and paid family leave. Small, capped, and it is what pays you if you cannot work because of an injury, or need to care for a newborn or a sick parent.

Other lines you may see on a different job's stub:

| Line | What it is | Comes out before tax? |
|---|---|---|
| 401(k) / 403(b) | retirement savings you chose | yes — lowers your taxable income |
| Health insurance | your share of the premium | usually yes |
| Union dues | if the job is a union job | no |
| Garnishment | court-ordered payment (child support, debt) | no |

> [!TRY] Run your own numbers
> Open the [paycheck calculator](paycheck-calculator.html) in the tab above. Put in your real hourly rate and hours. The calculator uses the same FICA rates and an estimate of the income taxes for a single filer in NYC.

## What a raise is actually worth

Your boss offers a \$2 raise: \$18 → \$20 an hour. On 40 hours that is \$80 more **gross**. But FICA takes 7.65% of it, and income taxes take roughly another 12–15%, so you keep about \$62 of the \$80.

That is still a raise. The point is to expect the number in your account to move by **less** than the number you negotiated — roughly 75–80 cents on the dollar at these income levels.

$$
\text{take-home from a raise} \approx \text{raise} \times (1 - 0.0765 - \text{income tax rate})
$$

```quiz
title: Checkpoint 2 — reading the stub

1. On the stub above, what is the total of all deductions?
   = 141.59
   ~ 0.01

2. [2 pts] Net pay ÷ gross pay tells you what fraction you keep. For this stub, what is $578.41 \div 720$, rounded to two decimal places?
   = 0.80
   ~ 0.006
   > About 80%. On this income, roughly one dollar in five goes to taxes and FICA.

3. Which line is decided partly by the W-4 you filled out?
   - [ ] Social Security
   - [ ] Medicare
   - [x] Federal income tax
   > FICA is flat. Income tax withholding depends on what you put on the W-4.

4. You get a \$100-a-week raise. Roughly how much of it shows up in your net pay?
   - [ ] All \$100
   - [x] About \$75–80
   - [ ] About \$50
   > FICA (7.65%) plus income taxes (~12–15% at this level) take about a fifth to a quarter.
```

## Check your own stub

Next time you get paid:

1. Multiply gross pay by 0.062. Does it match the Social Security line?
2. Multiply gross pay by 0.0145. Does it match Medicare?
3. Add every deduction. Subtract from gross. Does it equal net?
4. If you see a line you did not choose and cannot name, ask payroll. It is your money.
