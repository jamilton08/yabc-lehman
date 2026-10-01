---
version: 1.0
---

# Solving linear inequalities

You need a 65 to pass the Regents. A 65 passes. So does a 66, a 71, an 88, a 100. "Passing" is not one number. It is **every score from 65 up**:

$$
s \ge 65
$$

That is an **inequality**. An equation like $2x + 3 = 11$ has one answer. An inequality like $2x + 3 > 11$ has a whole *range* of answers, and in this lesson you will write that range, test it, and graph it.

Here is the good news: you already know how to solve these.

> [!KEY] The whole lesson in one line
> **Same moves as equations. One new rule:** when you multiply or divide both sides by a **negative** number, the sign **flips**.

## The four signs

| Sign | Read it | Words that mean it | Example |
|---|---|---|---|
| $<$ | is less than | under, below, fewer than | $x < 4$ |
| $>$ | is greater than | over, above, more than | $x > 4$ |
| $\le$ | is less than or equal to | at most, no more than, a maximum of | $x \le 4$ |
| $\ge$ | is greater than or equal to | at least, no less than, a minimum of | $x \ge 4$ |

The line under $\le$ and $\ge$ is half of an equals sign. It means the number itself **counts**: $x \le 4$ includes 4, and $x < 4$ does not.

> [!TIP] The point aims at the smaller side
> The pointy end of $<$ or $>$ always aims at the smaller side. In $3 < 8$ it points at the 3. In $8 > 3$ it still points at the 3.

> [!WARNING] Same statement, two ways
> $x > 6$ and $6 < x$ say the **same thing**: $x$ is bigger than 6. Always read it from $x$'s side. If you swap the sides, turn the sign around with them.

## A solution is a whole set

A **solution** is any number that makes the inequality true. To test a number, plug it in and ask: is the statement true?

> [!EXAMPLE] Is 5 a solution of $2x + 3 > 11$?
> $2(5) + 3 = 13$, and $13 > 11$ is true. **Yes.**
>
> What about 4? $2(4) + 3 = 11$, and $11 > 11$ is false, because 11 is not bigger than itself. **No.**
>
> What about 4.5? $2(4.5) + 3 = 12$, and $12 > 11$. **Yes.** Fractions and decimals count too.

So the solutions are *every* number bigger than 4. You write that as $x > 4$: infinitely many answers in four characters.

```quiz
title: Checkpoint 1 — read it
points: 1

1. Which inequality says "$x$ is at least 18"?
   - [ ] $x > 18$
   - [x] $x \ge 18$
   - [ ] $x \le 18$
   - [ ] $x < 18$
   > "At least 18" means 18 or more. 18 itself counts, so the line goes under the sign: $\ge$.

2. A phone plan lets you use **no more than** 15 GB a month. Which inequality fits, with $g$ for gigabytes?
   - [x] $g \le 15$
   - [ ] $g < 15$
   - [ ] $g \ge 15$
   - [ ] $g > 15$
   > "No more than 15" means 15 is allowed but nothing above it: $g \le 15$.

3. Is $x = -2$ a solution of $3x + 1 < -4$?
   - [x] Yes
   - [ ] No
   > $3(-2) + 1 = -5$, and $-5 < -4$ is true, because $-5$ sits further left on the number line.

4. Is $x = 3$ a solution of $5 - x \ge 2$?
   - [x] Yes
   - [ ] No
   > $5 - 3 = 2$, and $2 \ge 2$ is true. The "or equal to" part counts.

5. $9 < x$ means the same as…
   - [ ] $x < 9$
   - [x] $x > 9$
   - [ ] $x \le 9$
   > Read it from $x$'s side: 9 is less than $x$, so $x$ is greater than 9. The point still aims at the 9.
```

## Graph it on a number line

You can't list every solution, so you **draw** them. Every inequality graph has two parts:

1. **A circle at the boundary**, the number where the answer starts.
   - **Open circle** for $<$ or $>$: the boundary is **not** a solution.
   - **Closed circle** (filled in) for $\le$ or $\ge$: the boundary **is** a solution.
2. **Shading toward the numbers that work**, ending in an arrow because they go on forever.

| Inequality | Circle | Shade |
|---|---|---|
| $x < 4$ | open | left ← |
| $x \le 4$ | closed | left ← |
| $x > 4$ | open | right → |
| $x \ge 4$ | closed | right → |

> [!WARNING] Read it from x's side before you shade
> With $x$ on the left, the sign points the way you shade: $x < 4$ shades left and $x > 4$ shades right. If you have $6 < x$, rewrite it as $x > 6$ first. Even better, **test a number** and shade the side where the test number works.

```embed
number-line.html?part=graph
height: 470
title: Number line explorer
```

Things to try:

- Set it to $x \ge -1$ and drag the test point. Where does it turn green? Is $-1$ itself green?
- Switch between $<$ and $\le$. What changes on the graph, and what stays the same?

## Solve it: the same moves

You solve an inequality with the same moves you used on equations: **terms move, coefficients detach**, and whatever you do to one side, you do to the other. The only difference is the sign in the middle.

$$
\begin{aligned}
2x + 3 &> 11 \\
2x &> 8 && \text{subtract 3 from both sides} \\
x &> 4 && \text{divide both sides by 2 (positive, so the sign stays)}
\end{aligned}
$$

**Check it with test points.** Pick a number inside the answer, like 5: $2(5) + 3 = 13 > 11$ ✓. Pick one outside, like 0: $2(0) + 3 = 3$, and $3 > 11$ is false ✗. The answer holds up.

### What's new on the step calculator

The calculator works the same as before. With an inequality, it adds three steps:

- **Keep or flip?** Every time you multiply or divide both sides, the calculator stops and asks what happens to the sign. **You** decide. A wrong call gets explained and written on your tape, and that problem drops to half credit.
- **Read it from x's side.** If $x$ ends up alone on the right, like $6 < x$, you pick what that means ($x > 6$) before it counts.
- **Graph it.** Pick the circle and the side to shade, then check. A right first check keeps full credit. A right second check is worth half.

Par, hints, and undo work the same as before. For full points, solve with no hint, in par $+1$ moves or fewer, and get every call right.

### Assigned work A — tap to move

Every one of these divides or multiplies by a **positive** number. Read what the calculator asks each time, and notice that a negative **answer** does not mean a flip.

```calc
title: Assigned work A — same moves, then graph
moves: tap
points: 2

1. x + 5 > 9
   > One move: subtract 5. Open circle at 4, shade right.
2. 3x - 4 <= 11
   > Dividing by 3, a positive, keeps the ≤. Closed circle at 5, shade left.
3. x/2 + 1 >= 4
   > Detaching 1/2 means multiplying both sides by 2. Positive, so ≥ stays.
4. 2x + 7 < x + 3
   > Move the x (the smaller coefficient), then the 7: x < −4. The answer is negative, but nothing flipped, because you never multiplied or divided by a negative.
5. 4x - 1 > 2x + 9
   > Move the 2x, then the −1, then divide by 2 (positive): x > 5.
```

## The one new rule: the flip

Start with a true statement:

$$
2 < 6
$$

Now multiply both sides by $-1$. You get $-2$ and $-6$. Is $-2 < -6$?

**No.** On a number line, $-2$ sits to the **right** of $-6$, so $-2 > -6$. Multiplying by a negative mirrors every number across zero, and that turns their order around. To keep the statement true, the sign has to turn around too.

```embed
number-line.html?part=flip
height: 580
title: Why the sign flips
```

> [!KEY] The flip rule
> When you **multiply or divide both sides by a negative number**, flip the sign. $<$ becomes $>$, $\le$ becomes $\ge$, and the other way around.

> [!EXAMPLE] Flip it
> $$
> \begin{aligned}
> -3x + 2 &\ge 14 \\
> -3x &\ge 12 && \text{subtract 2 from both sides (no flip)} \\
> x &\le -4 && \text{divide by } {-3}\text{: negative, so } \ge \text{ flips to } \le
> \end{aligned}
> $$
> Test $x = -5$, which is in $x \le -4$: $-3(-5) + 2 = 17$, and $17 \ge 14$ ✓.

> [!WARNING] These do NOT flip the sign
> - **Adding or subtracting anything**, even a negative: $x - 5 < -2$ gives $x < 3$.
> - **A negative number on the other side**: $2x < -8$ gives $x < -4$. You divided by **2**, which is positive.
> - **A negative answer**: $x < -4$ is just where the answer happens to land. Nothing flipped.
>
> Only one thing flips it: **multiplying or dividing both sides BY a negative.** Look at the number you multiply or divide by, and nothing else.

> [!TIP] Dodge the flip
> When $x$ is on both sides, move the $x$-term with the **smaller** coefficient, same as in lesson one. The $x$-term you keep has a positive coefficient, so you never divide by a negative. You may end up with $x$ on the right, like $-5 \ge x$. That's fine: read it from $x$'s side, which gives $x \le -5$.

```quiz
title: Checkpoint 2 — keep or flip?
points: 1

1. Solving $-4x < 20$, you divide both sides by $-4$. The $<$…
   - [ ] stays $<$
   - [x] flips to $>$
   > Dividing by a negative flips it: $x > -5$.

2. Solving $3x \ge -12$, you divide both sides by 3. The $\ge$…
   - [x] stays $\ge$
   - [ ] flips to $\le$
   > 3 is positive. The $-12$ doesn't matter, because you are not dividing by it. $x \ge -4$.

3. Which moves flip the sign? (pick every one)
   - [x] divide both sides by $-2$
   - [ ] subtract 7 from both sides
   - [x] multiply both sides by $-\tfrac{1}{3}$
   - [ ] add $-5$ to both sides
   - [ ] divide both sides by 6 when the other side is $-18$
   > Only multiplying or dividing **by** a negative flips it. Adding a negative is still adding.

4. [2 pts] Solve $-2x + 1 > 9$.
   - [ ] $x > -4$
   - [x] $x < -4$
   - [ ] $x > 4$
   - [ ] $x < 4$
   > Subtract 1: $-2x > 8$. Divide by $-2$ and flip: $x < -4$. Test $x = -5$: $-2(-5) + 1 = 11 > 9$ ✓.
```

### Assigned work B — key it in

No more tapping to move. Now you key in every move. Some of these flip and some don't. The calculator asks every time, and you make the call.

```calc
title: Assigned work B — key in the move
moves: type
points: 2

1. -2x > 8
   > Divide by −2. Negative, so > flips to <: x < −4.
2. 5 - x <= 7
   > Subtract 5: −x ≤ 2. The hidden coefficient is −1, and dividing by −1 flips it: x ≥ −2.
3. -x/3 + 4 < 6
   > −x/3 < 2. The coefficient is −1/3, so multiply both sides by −3. Negative, so flip: x > −6.
4. 2x + 5 < 5x - 13
   > Move the 2x (the smaller one) and you never divide by a negative: 18 < 3x, so 6 < x. Read from x's side: x > 6.
5. 3(x - 2) >= 5x + 4
   > Distribute: 3x − 6 ≥ 5x + 4. Move the 3x: −10 ≥ 2x, so −5 ≥ x. That means x ≤ −5.
6. 4(x + 1) > 4x - 3
   > 4x + 4 > 4x − 3. The x-terms cancel and you are left with 4 > −3, which is always true. Every number works.
```

## From words to inequalities

On the Regents, inequalities usually come inside a story. Work through the same three steps every time.

> [!STEPS]
> 1. **Name the unknown.** For example, let $s$ be the number of songs.
> 2. **Find the limit words**, like "at most," "no more than," "at least," or "a minimum of." They tell you which sign to use.
> 3. **Build it, solve it, then answer the real question.** If you are counting things, the answer is a whole number.

> [!EXAMPLE] Songs on a gift card
> Dani has a \$25 gift card. She buys a \$7 phone case, then songs at \$1.50 each. What is the **greatest** number of songs she can buy?
>
> Her spending can be **at most** 25: $7 + 1.5s \le 25$.
>
> Subtract 7: $1.5s \le 18$. Divide by 1.5: $s \le 12$. She can buy **at most 12 songs**.

> [!WARNING] Whole-number answers
> If the math says $s \le 12.4$, the most songs you can actually buy is **12**, so you round down. If it says you need $h \ge 6.2$ hours to reach a goal, 6 hours will not be enough, so you need **7**. Always ask which whole number actually works.

### Assigned work C — from the story

The inequality is already written for you here. Solve it, graph it, and then read the note. The final checkpoint has you write your own.

```calc
title: Assigned work C — from the story
points: 2

1. 12 + 8h >= 100
   ? You have $12 saved and earn $8 an hour. You need at least $100 for a concert ticket. Let h = hours you work.
   > 8h ≥ 88, so h ≥ 11. You need to work at least 11 hours.
2. 45 - 3w > 20
   ? Your transit card has $45 on it. Each round trip costs $3. You want more than $20 left over. Let w = round trips.
   > −3w > −25. Dividing by −3 flips it: w < 25/3, about 8.3. So at most 8 round trips. Nine would leave only $18.
3. 2(n + 4) <= 30
   ? A group buys n concert tickets plus 4 guest passes, and every ticket or pass costs $2. The total can be no more than $30.
   > Detach the 2 (positive, so ≤ stays): n + 4 ≤ 15, so n ≤ 11.
```

## Final checkpoint — Regents style

```quiz
title: Final checkpoint — Regents style

1. A taxi charges \$3.50 plus \$2.25 per mile. Malik has \$30. Which inequality gives the number of miles, $m$, he can afford?
   - [ ] $3.50m + 2.25 \le 30$
   - [x] $3.50 + 2.25m \le 30$
   - [ ] $3.50 + 2.25m \ge 30$
   - [ ] $2.25 + 3.50m < 30$
   > The per-mile charge multiplies $m$, and the flat \$3.50 is added once. Having \$30 means the total can be **at most** 30.

2. [2 pts] Using that inequality, what is the greatest **whole** number of miles Malik can ride?
   = 11
   > $2.25m \le 26.50$, so $m \le 11.7$ or so. A 12-mile ride would cost \$30.50, which is too much. The answer is **11**.

3. A number line has a **closed** circle at $-3$ and is shaded to the **right**. Which inequality does it show?
   - [ ] $x > -3$
   - [x] $x \ge -3$
   - [ ] $x \le -3$
   - [ ] $x < -3$
   > Closed means $-3$ counts, so the sign is $\ge$ or $\le$. Shaded right means bigger numbers: $x \ge -3$.

4. [2 pts] Solve $7 - 2x \ge 15$.
   - [ ] $x \ge -4$
   - [x] $x \le -4$
   - [ ] $x \ge 4$
   - [ ] $x \le 4$
   > Subtract 7: $-2x \ge 8$. Divide by $-2$ and flip: $x \le -4$.

5. To pass, a student needs an average of **at least** 65 on three tests. She scored 58 and 70 on the first two. Which inequality gives the score $t$ she needs on the third test?
   - [x] $\dfrac{58 + 70 + t}{3} \ge 65$
   - [ ] $\dfrac{58 + 70 + t}{3} > 65$
   - [ ] $58 + 70 + t \ge 65$
   - [ ] $\dfrac{58 + 70 + t}{3} \le 65$
   > The average is the total divided by 3, and "at least 65" means $\ge$. (Solving it gives $t \ge 67$.)

6. Which number is **not** in the solution set of $3(x - 1) < 2x + 4$?
   - [ ] $-2$
   - [ ] $0$
   - [ ] $6$
   - [x] $7$
   > Distribute: $3x - 3 < 2x + 4$, so $x < 7$. The boundary 7 is not included because the sign is $<$. Check: $3(7 - 1) = 18$ and $2(7) + 4 = 18$, and $18 < 18$ is false.
```

## Wrap up

- An inequality has a **set** of solutions. To test a number, plug it in and see if the statement is true.
- $<$ and $>$ get an **open** circle. $\le$ and $\ge$ get a **closed** circle. Shade toward the numbers that work.
- Solve with the **same moves** as equations: terms move, coefficients detach.
- **Multiplying or dividing by a negative flips the sign.** Nothing else does: not subtracting, not a negative on the other side, not a negative answer.
- $6 < x$ means $x > 6$. Always read it from $x$'s side.
- In word problems, find the limit words, and check that your whole-number answer actually works.

Want more reps? The [extra practice](practice.md) has more problems on the same calculator, and nothing there is recorded. The [step calculator](calculator.html) solves any equation or inequality you type in, which is handy for homework.
