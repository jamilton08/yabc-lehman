# Python cheat sheet

Everything the lab uses, on one page. Keep it open in the other tab.

## Variables and types

```python
count = 0            # int
price = 4.50         # float
name = "Ana"         # str
done = False         # bool

count = count + 1    # or: count += 1
```

## Printing and input

```python
print("Hello")
print("Total:", count)          # prints  Total: 1
print(f"Total: {count}")        # f-string — the {} part is evaluated

answer = input("How many? ")    # ALWAYS a string
n = int(answer)                 # turn it into a number
```

## If / elif / else

```python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C or below"
```

| Compare | Means |
|---|---|
| `==` | equal (two signs!) |
| `!=` | not equal |
| `<` `<=` `>` `>=` | less / greater |
| `and` `or` `not` | combine conditions |

> [!WARNING]
> `=` assigns. `==` compares. Mixing them up is the most common bug in a first program.

## Loops

```python
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for letter in "abc":      # a, b, c
    print(letter)

while balance > 0:
    balance = balance - 10
```

`range(1, 6)` gives 1 through 5. `range(0, 20, 5)` gives 0, 5, 10, 15.

## Strings

```python
s = "  Locker 12  "
s.strip()          # "Locker 12"     — trims spaces
s.upper()          # "  LOCKER 12  "
s.lower()
s.title()          # "  Locker 12  " — capitalizes each word
s.split()          # ["Locker", "12"]
len(s)             # 13
"12" in s          # True
s.replace("12", "7")
s.startswith("  L")
```

Any character in a string: `s[0]` is the first, `s[-1]` the last.

## Lists

```python
items = ["pen", "cup"]
items.append("bag")      # add to the end
len(items)               # 3
items[0]                 # "pen"
for it in items:
    print(it)
```

## Common patterns

**Count things**

```python
total = 0
for x in numbers:
    total += x
```

**Check every character**

```python
has_digit = False
for ch in password:
    if ch.isdigit():
        has_digit = True
```

**Read until a stop word**

```python
while True:
    line = input()
    if line == "done":
        break
    # handle line
```
