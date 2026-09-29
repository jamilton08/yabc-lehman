---
version: 1.0
---

# Terms that move, coefficients that detach

Before you can solve an equation, you have to be able to **read** one: what the pieces are, which pieces can leave, and which piece is glued to $x$. That is this whole lesson.

You will do the work on a **step calculator**. It is not a calculator that gives you the answer. It only does what you tell it to do, it does the arithmetic for you, and it writes down every move you make, the same way you would on paper. That written-down work is what you turn in.

> [!KEY] The whole lesson in one line
> **Terms move. Coefficients detach.** A term that is *added or subtracted* leaves by doing the opposite to both sides. A coefficient is *multiplied* onto $x$, so it comes off by dividing.

## The pieces of an equation

An equation has two **sides**, one on each side of the $=$. Each side is a list of **terms**: the chunks separated by $+$ and $-$ signs.

The sign in front of a term **belongs to that term**. In

$$
4x - 7 = 2x + 9
$$

the four terms are $4x$, $-7$, $2x$, and $+9$. That $-7$ is a *negative seven*, not a seven with a minus sign floating near it.

There are two kinds of terms, and one more word you need:

| Word | What it is | In $4x - 7 = 2x + 9$ |
|---|---|---|
| **Constant term** | a plain number — it never changes | $-7$ and $+9$ |
| **$x$-term** (variable term) | a number times $x$ | $4x$ and $2x$ |
| **Coefficient** | the number multiplied onto $x$ | $4$ (in $4x$) and $2$ (in $2x$) |

> [!DEFINITION] Hidden coefficients
> Some coefficients do not show. They are still there.
>
> - $x$ means $1x$, so its coefficient is $1$.
> - $-x$ means $-1x$, so its coefficient is $-1$.
> - $\dfrac{x}{4}$ means $\dfrac{1}{4}x$, so its coefficient is $\dfrac{1}{4}$. The calculator writes it that way so you can see it.

On the calculator, every term on the screen is a button. For this warm-up, tap to pick, tap again to un-pick, then press **Check**. You get two checks per problem: the first is worth full points, the second half.

```calc
title: Warm-up — name the parts
points: 1

1. spot constants: 4x - 7 = 2x + 9
   > The constants are −7 and +9. The sign comes with the number.
2. spot x-terms: 5 - 3x = x + 12
   > −3x and x. The x on the right has a hidden coefficient of 1.
3. spot coefficients: 6x + 1 = -x + 15
   > 6, and the hidden −1 in front of −x.
4. spot coefficients: x/4 - 2 = 3x
   > 1/4 (that is what x/4 means) and 3.
5. spot movable: 3(x + 4) - 5 = 2x + 7
   > −5, 2x and +7 can move. The x and the 4 are locked inside the parentheses, and the 3 is a multiplier — it detaches, it does not move.
```

## Terms move

To **move** a term, do the **opposite** of it to **both** sides.

- The term is **added** ($+3$)? **Subtract** it from both sides.
- The term is **subtracted** ($-7$)? **Add** it to both sides.

It cancels on its own side and shows up on the other side:

$$
\begin{aligned}
2x + 3 &= 11 \\
2x + 3 - 3 &= 11 - 3 && \text{subtract 3 from both sides} \\
2x &= 8
\end{aligned}
$$

On paper it looks like the $+3$ jumped over the $=$ and flipped to $-3$. It did not jump. You did the same thing to both sides, and on the left it cancelled to zero. "Move it" is just the short way of saying that.

$x$-terms move exactly the same way. In $7x - 4 = 3x + 12$, the $3x$ on the right is added, so subtract $3x$ from both sides:

$$
\begin{aligned}
7x - 4 &= 3x + 12 \\
4x - 4 &= 12 && \text{subtract } 3x \text{ from both sides}
\end{aligned}
$$

> [!TIP] Which side keeps the x?
> When $x$ is on both sides, move the $x$-term with the **smaller** coefficient. You keep a positive coefficient and dodge a sign mistake later.

## Coefficients detach

The coefficient is not added to $x$. It is **multiplied** onto $x$. You cannot subtract it away: $2x - 2$ is not $x$. To undo multiplying, you **divide**.

To **detach** a coefficient, divide both sides by it:

$$
\begin{aligned}
2x &= 8 \\
\frac{2x}{2} &= \frac{8}{2} && \text{divide both sides by 2} \\
x &= 4
\end{aligned}
$$

Three things trip people up:

> [!WARNING] The sign is part of the coefficient
> In $-3x = 18$ the coefficient is $-3$, so divide by $-3$: $x = -6$. Dividing by $3$ leaves you with $-x = 6$, and you are not done.

> [!EXAMPLE] Hidden −1
> $-x = 4$ still has a coefficient to detach: $-1$. Divide both sides by $-1$ and you get $x = -4$.

> [!EXAMPLE] Fraction coefficients: multiply by the flip
> $\dfrac{x}{4} = 7$ has coefficient $\dfrac14$. Dividing by $\dfrac14$ is the same as multiplying by $4$, so multiply both sides by $4$: $x = 28$.
>
> $\dfrac{2}{3}x = 8$: multiply both sides by $\dfrac32$ and you get $x = 12$.

## Move first, detach last

Get the $x$-term **alone on its side first**, then detach. That order is the reverse of the order of operations. The last thing done to $x$ was the adding, so that is the first thing you undo.

If you detach too early, it is still legal, but you have to divide **every** term:

$$
2x + 3 = 11 \quad\xrightarrow{\ \div 2\ }\quad x + \tfrac32 = \tfrac{11}{2}
$$

Same answer in the end, with fractions you did not need. (Try it on the calculator and watch.)

## Locked terms: parentheses

In $3(x + 4) = 21$ the $4$ is **inside** the parentheses. It is not a term of the left side. The left side has one term, $3(x + 4)$. Subtracting 4 from both sides does not cancel it. The calculator will show you that if you try.

You have two ways to unlock it:

1. **Distribute** the $3$: $3x + 12 = 21$. Now the $12$ is a real term and can move.
2. **Detach** the $3$: it multiplies the whole group, so divide both sides by $3$: $x + 4 = 7$.

## How the step calculator works

- **Tap a term** to see what it is and what you can do with it. Tap a $3$ in front of parentheses to distribute or detach it.
- **Key in a move** on the keypad, like $-\,3$ or $\div\,2$ or $-\,2x$. Then press **Do it to both sides**. The calculator never lets you do something to only one side.
- **Combine like terms** merges terms of the same kind on the same side, like $5x - x \to 4x$. **Distribute** opens parentheses.
- **Undo** is fine. Undone moves stay on your tape, crossed out, so Mr. Cruz can see what you tried.
- **Hint** tells you the next move, but that problem can only earn half credit.
- **Par** is the fewest moves the problem takes. Solve with no hint in par $+1$ moves or fewer for full points.
- The **tape** on the right is your work, written out like it would be on paper. It goes into your result file.

### Assigned work A — tap to move

On this set you make every move by tapping. Tap the term you want gone and read what the calculator tells you about it. Then pick **Move it** or **Detach**.

```calc
title: Assigned work A — tap to move
moves: tap
points: 2

1. x + 7 = 12
2. 2x + 3 = 11
3. 5x - 4 = 16
4. -3x + 2 = 20
   > The coefficient is −3, so you divide by −3. That is how the answer ends up negative.
5. x/4 + 2 = 9
   > Detaching 1/4 means multiplying both sides by 4.
6. 7x - 4 = 3x + 12
   > Move the 3x first (the smaller coefficient), then the −4, then detach the 4.
```

### Assigned work B — key it in

No more tapping to move. The calculator will tell you what a term is if you tap it, but **you** have to key in the opposite operation.

```calc
title: Assigned work B — key in the move
moves: type
points: 2

1. 4x - 9 = 15
2. 6 - x = 10
   > After subtracting 6 you have −x = 4. The hidden coefficient is −1: divide by −1.
3. 2x + 5 = 5x - 13
   > Move the 2x (the smaller one) so the x stays positive: 18 = 3x, so x = 6.
4. 3(x + 4) = 21
   > Detaching the 3 first (÷ 3) is the short way: x + 4 = 7.
5. 2x/3 + 1 = 9
   > The coefficient is 2/3, so multiply both sides by 3/2.
6. 5x + 2 - x = 3x + 9
   > Combine 5x and −x first, so you are working with 4x.
```

## Checkpoint

```quiz
title: Checkpoint — which move?

1. In $6x - 5 = 13$, which term do you move first?
   - [x] $-5$
   - [ ] $6x$
   - [ ] $13$
   > Move the constant away from the $x$-term first (add 5 to both sides), then detach the 6.

2. To detach the coefficient in $-4x = 28$, you…
   - [ ] add 4 to both sides
   - [ ] divide both sides by 4
   - [x] divide both sides by $-4$
   > The coefficient is $-4$, sign included. $x = -7$.

3. What is the coefficient of $x$ in $\dfrac{x}{5}$? (a fraction or a decimal)
   = 1/5 | 0.2
   > $\dfrac{x}{5} = \dfrac15 x$. To detach it, multiply both sides by 5.

4. In $2(x - 3) + 4 = 10$, which of these can you move right now? (pick every one)
   - [x] $+4$
   - [x] $10$
   - [ ] the $-3$
   - [ ] the $x$
   > The $-3$ and the $x$ are inside the parentheses, so they are locked until you distribute the 2.

5. [2 pts] $-x + 8 = 3$. Subtract 8 from both sides, then detach the hidden coefficient. What is $x$?
   = 5
   > $-x = -5$. Divide both sides by $-1$: $x = 5$.
```

## Wrap up

- A **term** is a chunk between $+$ and $-$ signs, and its sign comes with it.
- **Constants** are plain numbers. **$x$-terms** have $x$. The **coefficient** is the number multiplied onto $x$, and it can be hidden ($1$, $-1$, $\frac14$).
- **Terms move** by doing the opposite to both sides: added → subtract, subtracted → add.
- **Coefficients detach** by dividing both sides by them, sign included. For a fraction, multiply by its flip.
- **Move first, detach last.** Terms inside parentheses are locked until you distribute (or detach the multiplier).

Want more reps? The [extra practice](practice.md) has more problems on the same calculator, and nothing there is recorded. The [step calculator](calculator.html) takes any equation you type in, which is handy for homework. Next up: [solving linear equations](/lessons/math/solving-linear-equations), where you put all of it together.
