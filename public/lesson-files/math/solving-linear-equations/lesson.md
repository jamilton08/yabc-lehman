---
version: 1.0
---

# Solving linear equations

An equation is a locked box. Somebody took a number, did a few things to it, and showed you the result. Your job is to **undo** what they did — in reverse order — until the number is standing alone.

> [!KEY] The one rule
> Whatever you do to one side of an equation, you do to the other side. Add 5 to the left, add 5 to the right. Divide the left by 3, divide the right by 3. The [balance scale](balance.html) shows this happening live.

## Undo in reverse

Take $2x + 3 = 11$. Somebody started with $x$, **multiplied by 2**, then **added 3**, and got 11.

To get $x$ back you undo the last thing first:

> [!STEPS]
> 1. Subtract 3 from both sides: $2x + 3 - 3 = 11 - 3$, so $2x = 8$.
> 2. Divide both sides by 2: $\dfrac{2x}{2} = \dfrac{8}{2}$, so $x = 4$.
> 3. Check it: $2(4) + 3 = 8 + 3 = 11$. ✓

The order matters. If you divided by 2 first you would have to divide the 3 as well, and you would be working with fractions for no reason.

> [!EXAMPLE] Negative numbers do not change the rule
> $-4x - 7 = 13$
>
> Add 7 to both sides: $-4x = 20$.
> Divide both sides by $-4$: $x = -5$.
>
> Check: $-4(-5) - 7 = 20 - 7 = 13$. ✓

```quiz
title: Checkpoint 1 — two-step equations

1. Solve $3x - 5 = 16$.
   = 7
   > Add 5 to both sides ($3x = 21$), then divide by 3.

2. Solve $\dfrac{x}{4} + 2 = 9$.
   = 28
   > Subtract 2 first ($\frac{x}{4} = 7$), then multiply both sides by 4.

3. In $5x + 8 = 3$, what is the **first** move?
   - [ ] Divide both sides by 5
   - [x] Subtract 8 from both sides
   - [ ] Subtract 3 from both sides
   > Undo the last thing that was done to $x$. Adding 8 happened last, so subtracting 8 comes first. (You will get $5x = -5$, so $x = -1$.)
```

## Variables on both sides

When $x$ shows up on both sides, move all the $x$ terms to one side and all the plain numbers to the other. Pick the side that keeps the $x$ coefficient positive — it saves a sign mistake later.

$$
\begin{aligned}
7x - 4 &= 3x + 12 \\
7x - 3x - 4 &= 12 && \text{subtract } 3x \text{ from both sides} \\
4x - 4 &= 12 \\
4x &= 16 && \text{add 4 to both sides} \\
x &= 4
\end{aligned}
$$

Check: left side $7(4) - 4 = 24$, right side $3(4) + 12 = 24$. ✓

> [!TIP]
> A check is not optional on a test. Plugging your answer back in takes ten seconds and catches almost every arithmetic slip.

## Parentheses: distribute first

Anything multiplied onto a parenthesis gets multiplied onto **every** term inside it.

$$
3(x + 4) = 2(x - 1) + 20
$$

Distribute on both sides: $3x + 12 = 2x - 2 + 20$, which is $3x + 12 = 2x + 18$.

Now it is a both-sides problem: subtract $2x$ to get $x + 12 = 18$, then subtract 12 to get $x = 6$.

> [!WARNING] The sign goes with the number
> $-2(x - 5)$ is $-2x + 10$, not $-2x - 10$. The $-2$ multiplies the $-5$ and two negatives make a positive.

```quiz
title: Checkpoint 2 — both sides and parentheses

1. Solve $5x + 3 = 2x + 18$.
   = 5
   > $3x + 3 = 18 \Rightarrow 3x = 15 \Rightarrow x = 5$.

2. What is $-3(2x - 4)$ after distributing?
   - [ ] $-6x - 12$
   - [x] $-6x + 12$
   - [ ] $-6x - 4$
   > $-3 \cdot 2x = -6x$ and $-3 \cdot (-4) = +12$.

3. [2 pts] Solve $4(x - 2) = 2x + 6$.
   = 7
   > Distribute: $4x - 8 = 2x + 6$. Subtract $2x$: $2x - 8 = 6$. Add 8: $2x = 14$. So $x = 7$.
```

## The two weird cases

Sometimes the $x$ disappears completely. What is left tells you what happened.

| What you end up with | What it means | Example |
|---|---|---|
| a true statement like $5 = 5$ | **every** number works (identity) | $2(x+3) = 2x + 6$ |
| a false statement like $5 = 9$ | **no** number works | $2x + 5 = 2x + 9$ |

> [!EXAMPLE] No solution
> $3x + 7 = 3x - 2$. Subtract $3x$ from both sides and you get $7 = -2$. That is never true, so no value of $x$ can make the original equation true. Write **no solution**.

> [!EXAMPLE] All real numbers
> $4(x - 1) = 4x - 4$. Distribute: $4x - 4 = 4x - 4$. Subtract $4x$: $-4 = -4$. Always true, so **every** number is a solution.

```quiz
title: Checkpoint 3 — what kind of answer?

1. $6x + 2 = 6x + 2$ has…
   - [ ] exactly one solution
   - [x] every real number as a solution
   - [ ] no solution
   > Both sides are identical, so any $x$ works.

2. $2x - 1 = 2x + 5$ has…
   - [ ] exactly one solution
   - [ ] every real number as a solution
   - [x] no solution
   > Subtracting $2x$ leaves $-1 = 5$, which is false for every $x$.

3. Solve $2(3x + 1) = 5x + 9$.
   = 7
   > $6x + 2 = 5x + 9 \Rightarrow x = 7$. One ordinary solution.
```

## Wrap up

- Undo operations in **reverse** order: add/subtract first, then multiply/divide.
- Variables on both sides: collect the $x$ terms on one side, numbers on the other.
- Parentheses: distribute to **every** term, sign included.
- If $x$ vanishes: true statement → all real numbers, false statement → no solution.
- Always plug your answer back in.

Want more reps? The [practice set](practice.md) has twelve problems with the answers hidden until you want them.
