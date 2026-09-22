---
version: 1.0
---

# Slope and the y-intercept

Every straight line on a graph can be written the same way:

$$
y = mx + b
$$

Two numbers describe the whole line. **$b$** is where it starts — the point where it crosses the $y$-axis. **$m$** is how fast it climbs — how much $y$ changes every time $x$ goes up by 1.

> [!DEFINITION] Slope
> $$m = \frac{\text{rise}}{\text{run}} = \frac{\text{change in } y}{\text{change in } x} = \frac{y_2 - y_1}{x_2 - x_1}$$
> Positive slope goes uphill left to right. Negative slope goes downhill. Slope 0 is flat.

## Play with it first

Drag the sliders. Watch what $m$ does and what $b$ does — they are completely independent.

```embed
line-explorer.html
height: 560
title: Line explorer
```

Things to try:

- Set $m = 0$. What does the line look like? What is $y$ for every $x$?
- Keep $m$ fixed and slide $b$. Does the steepness change?
- Make $m$ negative. Which way does the line go?

## Reading slope off a graph

Pick two points on the line where the grid lines cross. Count the **rise** (up is positive, down is negative) and the **run** (always to the right). Divide.

> [!EXAMPLE] From (1, 2) to (4, 8)
> Rise: from 2 up to 8 is $+6$. Run: from 1 to 4 is $3$.
> $$m = \frac{6}{3} = 2$$
> The line goes up 2 for every 1 step right.

> [!WARNING] Order matters — but only if you mix it up
> Using $(4, 8)$ first and $(1, 2)$ second: $\dfrac{2 - 8}{1 - 4} = \dfrac{-6}{-3} = 2$. Same answer. What breaks it is taking $y$'s in one order and $x$'s in the other.

## Reading slope off a table

| $x$ | $y$ |
|---:|---:|
| 0 | 5 |
| 1 | 8 |
| 2 | 11 |
| 3 | 14 |

Each time $x$ goes up by 1, $y$ goes up by 3. So $m = 3$. And when $x = 0$, $y = 5$, so $b = 5$. The line is $y = 3x + 5$.

If the table does not have $x = 0$, get $m$ first, then plug any row into $y = mx + b$ and solve for $b$.

```quiz
title: Checkpoint 1 — read the numbers

1. In $y = -2x + 7$, what is the slope?
   = -2

2. In $y = -2x + 7$, where does the line cross the $y$-axis?
   - [ ] at $y = -2$
   - [x] at $y = 7$
   - [ ] at $x = 7$
   > $b$ is the $y$-value when $x = 0$.

3. Find the slope of the line through $(2, 3)$ and $(6, 11)$.
   = 2
   > $\dfrac{11 - 3}{6 - 2} = \dfrac{8}{4} = 2$.

4. [2 pts] A table shows $y = 4$ when $x = 1$ and $y = 10$ when $x = 3$. What is $b$?
   = 1
   > $m = \frac{10 - 4}{3 - 1} = 3$. Then $4 = 3(1) + b$, so $b = 1$.
```

## What slope means in real life

Slope is a **rate**. If $y$ is dollars and $x$ is hours, slope is dollars per hour. If $y$ is miles and $x$ is gallons, slope is miles per gallon.

> [!EXAMPLE] A phone plan
> A plan costs \$20 a month plus \$5 per gigabyte. Total cost $C$ for $g$ gigabytes:
> $$C = 5g + 20$$
> Slope 5: each gigabyte adds \$5. Intercept 20: even with zero data, you pay \$20.

```quiz
title: Checkpoint 2 — slope as a rate

1. A ride costs \$3 to start plus \$2 per mile. Which equation gives the cost $C$ for $d$ miles?
   - [ ] $C = 3d + 2$
   - [x] $C = 2d + 3$
   - [ ] $C = 5d$
   > The per-mile charge is the slope (multiplies $d$); the flat fee is the intercept.

2. [2 pts] Using $C = 2d + 3$, how much is a 7-mile ride?
   = 17
   > $2(7) + 3 = 17$.

3. Two lines have the same slope but different intercepts. They are…
   - [x] parallel
   - [ ] the same line
   - [ ] crossing at the origin
   > Same steepness, different starting point — they never meet.
```

## Wrap up

- $y = mx + b$: $m$ is the slope (rate), $b$ is the $y$-intercept (start).
- Slope from two points: $\dfrac{y_2 - y_1}{x_2 - x_1}$. Rise over run.
- From a table: how much $y$ changes per step of $x$.
- Same $m$, different $b$ → parallel lines.
