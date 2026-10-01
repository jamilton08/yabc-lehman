---
version: 1.0
---

# Angles where lines cross

Geometry starts with one picture: two lines crossing. That makes four angles, and those four angles are tied together by rules that never break. Once you know the rules, a geometry figure turns into an equation, and you already know how to solve those.

> [!KEY] The rules for today
> - Two angles side by side on a straight line add up to $180^\circ$.
> - Vertical angles, the ones **across** from each other where two lines cross, are **equal**.
> - Angles that fill a right angle add up to $90^\circ$. All the way around a point is $360^\circ$.

## The words you need

You only need a handful of words to talk about any of this.

| Word | What it is | How it is written |
|---|---|---|
| **Point** | an exact spot, with no size | $A$ |
| **Line** | perfectly straight, goes forever both ways | $\overleftrightarrow{AB}$ |
| **Ray** | starts at a point and goes forever one way | $\overrightarrow{BA}$ starts at $B$ |
| **Segment** | the piece of a line between two points | $\overline{AB}$ |
| **Angle** | two rays that start at the same point | $\angle ABC$ |
| **Vertex** | that shared starting point, the corner | $B$, in $\angle ABC$ |

> [!DEFINITION] Naming an angle
> In $\angle ABC$ the **middle letter is always the vertex**. $\angle ABC$ and $\angle CBA$ are the same angle. When nothing else meets at that corner you can just say $\angle B$, and figures often number angles instead: $\angle 1$, $\angle 2$. The *size* of an angle is its measure, written $m\angle ABC = 40^\circ$.

Angles come in four sizes you should know on sight:

| Name | Measure | Looks like |
|---|---|---|
| **Acute** | less than $90^\circ$ | a sharp corner |
| **Right** | exactly $90^\circ$ | a square corner, marked with a little square |
| **Obtuse** | between $90^\circ$ and $180^\circ$ | a wide-open corner |
| **Straight** | exactly $180^\circ$ | a straight line |

## Rule 1: a linear pair adds up to 180°

A straight line is a straight angle: $180^\circ$. Stand a ray on the line and it splits that $180^\circ$ into two angles side by side. The two pieces are called a **linear pair**. Together they are still the whole straight line, so

$$
m\angle 1 + m\angle 2 = 180^\circ
$$

If one of them is $130^\circ$, the other has to be $50^\circ$. There is nothing to measure. The line decides it.

> [!NOTE] Supplementary
> Any two angles that add up to $180^\circ$ are called **supplementary**. A linear pair is the side-by-side kind. On the Regents you will see both words.

## Rule 2: vertical angles are equal

Two lines cross and make four angles. The angles **across** from each other are **vertical angles**. The name comes from *vertex*, the point they share, and has nothing to do with up and down.

Vertical angles are always equal, and you do not have to take that on faith. Here is why:

> [!STEPS] Why vertical angles match
> 1. $\angle 1$ and $\angle 2$ sit side by side on a straight line, so $m\angle 1 + m\angle 2 = 180^\circ$.
> 2. $\angle 2$ and $\angle 3$ sit side by side on the other straight line, so $m\angle 2 + m\angle 3 = 180^\circ$.
> 3. Both $\angle 1$ and $\angle 3$ are "$180^\circ$ minus $\angle 2$." So they are the same size: $m\angle 1 = m\angle 3$.

That is a **proof**: three lines of reasoning, and now it is true for every pair of crossing lines that will ever exist. The rest of geometry works the same way.

## Rule 3: 90° in a corner, 360° all the way around

- Two angles that add up to $90^\circ$ are **complementary**. When a ray splits a right angle, the two pieces are complementary.
- The angles all the way **around a point**, with no gaps and no overlaps, add up to $360^\circ$, one full turn.

> [!TIP] Remembering which is which
> **C**omplementary comes before **S**upplementary in the alphabet, and $90$ comes before $180$. Or: a **c**orner is $90^\circ$, a **s**traight line is $180^\circ$.

## Drag it until you believe it

Drag the lines around. The angles change the whole time, but the rules on the right never break. Try the dare.

```embed
angle-explorer.html
height: 700
```

## From a figure to an equation

This is where geometry and algebra meet. The figure tells you **which rule** applies, the rule gives you an **equation**, and you solve it the way you did in the algebra lesson.

> [!EXAMPLE] A linear pair
> Two angles side by side on a straight line measure $(3x + 10)^\circ$ and $(2x - 5)^\circ$.
>
> $$
> \begin{aligned}
> (3x + 10) + (2x - 5) &= 180 && \text{linear pair} \\
> 5x + 5 &= 180 && \text{combine like terms} \\
> 5x &= 175 && \text{subtract 5} \\
> x &= 35 && \text{divide by 5}
> \end{aligned}
> $$

> [!WARNING] x is not the angle
> The question asks for the **angle**, and $35$ is only $x$. Plug it back in: $3(35) + 10 = 115^\circ$. Check with the other angle: $2(35) - 5 = 65^\circ$, and $115 + 65 = 180$. ✓

> [!EXAMPLE] Vertical angles
> Vertical angles measure $(3x + 10)^\circ$ and $(5x - 20)^\circ$. Vertical angles are **equal**, so set them equal:
>
> $$3x + 10 = 5x - 20 \quad\Rightarrow\quad 30 = 2x \quad\Rightarrow\quad x = 15$$
>
> The angle is $3(15) + 10 = 55^\circ$, and $5(15) - 20 = 55^\circ$ too. ✓

> [!STEPS] Every angle problem, the same four steps
> 1. **Look** at where the marked angles sit, and pick the rule: equal, $180$, $90$, or $360$.
> 2. **Write** the equation. Equal means set them equal to each other. The others mean add them all and set the total to $180$, $90$, or $360$.
> 3. **Solve** for $x$.
> 4. **Plug** $x$ back in to get the angle. Then check that it makes sense: an angle that looks sharp should come out under $90^\circ$.

## Your turn, on the calculator

The step calculator now does angle problems:

- The **figure** is drawn to scale, so it will not lie to you.
- First you pick **how the marked angles are related**, and the calculator writes the equation from your pick. A wrong pick gets one more try. After two misses the calculator shows you the answer, and that problem is capped at half credit.
- Then you **solve** it, same moves as the algebra lesson: combine, move, detach.
- Last, you **type the angle measure**.
- Full points: the right rule on the first pick, no hint, par $+1$ moves or fewer, and the right angle on the first try. Everything goes on your tape.

### Warm-up: plain numbers

```calc
title: Warm-up — find the missing angle
points: 1

1. angles linear: 130 | x
   > 130 + x = 180, so x = 50°.
2. angles vertical: 64 | x
   > Vertical angles are equal, so x = 64° without any solving at all.
3. angles complementary: x | 28
   > x + 28 = 90, so x = 62°.
4. angles around: 100 | 120 | x
   > 100 + 120 + x = 360. Combine first: 220 + x = 360, so x = 140°.
```

### Assigned work

```calc
title: Assigned work — set it up, solve it, find the angle
points: 2

1. angles linear: 3x + 10 | 2x - 5
   > 5x + 5 = 180, x = 35, and the angle is 3(35) + 10 = 115°.
2. angles vertical: 3x + 10 | 5x - 20
   > Set them equal: x = 15, and the angle is 55°.
3. angles complementary: 2x + 6 | 4x
   > 6x + 6 = 90, x = 14, and the angle is 2(14) + 6 = 34°.
4. angles linear: 4x | x + 30 | find 2
   > 5x + 30 = 180, x = 30. The question asks for the second angle: 30 + 30 = 60°.
5. angles vertical: 2x + 40 | 6x - 12
   > 2x + 40 = 6x − 12, so 52 = 4x and x = 13. The angle is 66°.
6. angles around: x + 20 | 2x + 10 | 3x | 90 | find 3
   > 6x + 120 = 360, x = 40, and the angle marked 3x is 120°.
7. angles linear: 5x - 12 | 3x + 8 | find 2
   > 8x − 4 = 180, so x = 23. The question asks for the second angle: 3(23) + 8 = 77°. (The first is 103°, and 103 + 77 = 180.)
8. angles complementary: x + 12 | 3x - 2
   > 4x + 10 = 90, so x = 20. The angle is 20 + 12 = 32°, and the other is 58°.
9. angles linear: x | 2x + 15 | 3x - 15 | find 3
   > Three angles on one straight line still add up to 180°: 6x = 180, so x = 30, and the third angle is 3(30) − 15 = 75°.
10. angles around: 2x | 3x + 15 | x + 45 | 120 | find 2
   > 6x + 180 = 360, so x = 30. The angle marked 3x + 15 is 105°.
```

## Checkpoint

```quiz
title: Checkpoint — angle rules

1. In $\angle PQR$, which point is the vertex?
   - [ ] $P$
   - [x] $Q$
   - [ ] $R$
   > The middle letter is always the vertex.

2. Two angles form a linear pair. One measures $47^\circ$. What does the other measure (in degrees)?
   = 133
   > $180 - 47 = 133$.

3. Two lines cross. One of the four angles measures $71^\circ$. What does the angle **vertical** to it measure?
   = 71
   > Vertical angles are equal.

4. What is the complement of a $38^\circ$ angle?
   = 52
   > Complementary angles add up to $90^\circ$: $90 - 38 = 52$.

5. Three angles go all the way around a point: $90^\circ$, $125^\circ$, and $x^\circ$. What is $x$?
   = 145
   > $90 + 125 + x = 360$, so $x = 145$.

6. [2 pts] Vertical angles measure $(4x - 12)^\circ$ and $(2x + 30)^\circ$. What is the measure of **each angle** (in degrees)?
   = 72
   > $4x - 12 = 2x + 30$, so $2x = 42$ and $x = 21$. The angle is $4(21) - 12 = 72^\circ$. If you typed 21, that is $x$, not the angle.

7. [2 pts] Two angles form a linear pair. One is $24^\circ$ more than the other. What is the measure of the **larger** angle (in degrees)?
   = 102
   > Call the smaller one $x$. Then $x + (x + 24) = 180$, so $2x = 156$ and $x = 78$. The larger angle is $78 + 24 = 102^\circ$.

8. $\angle 1$ and $\angle 2$ are complementary, and $m\angle 1$ is twice $m\angle 2$. What is $m\angle 1$ (in degrees)?
   = 60
   > Let $m\angle 2 = x$, so $m\angle 1 = 2x$. Then $2x + x = 90$, so $x = 30$ and $m\angle 1 = 60^\circ$.
```

## Wrap up

- In $\angle ABC$, the middle letter is the vertex.
- **Linear pair**: side by side on a straight line, adds up to $180^\circ$.
- **Vertical angles**: across from each other where two lines cross, always **equal**.
- **Complementary**: adds up to $90^\circ$. **Around a point**: adds up to $360^\circ$.
- Every angle problem goes the same way: figure → rule → equation → solve for $x$ → plug in for the angle.

More reps are in the [extra practice](practice.md). Next up is triangles: the three angles inside any triangle add up to $180^\circ$, and you will prove it using today's rules.
