import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Essential Math for Data Science, chapter 1: basic math, then calculus. */
export const EM01_BASIC_MATH: LearnModule = {
  id: "basic-math",
  title: "Basic math refresher",
  titleHi: "बुनियादी गणित दोहराव",
  blurb: "The everyday math behind data science, in Python: kinds of numbers, order of operations, variables and functions, summations (Σ), exponents, logarithms, and Euler's number e for growth and compound interest.",
  lessons: [
    {
      id: "numbers-operations",
      title: "Kinds of numbers and the order of operations",
      oneLine: "Numbers come in families: natural, whole, integers, rationals, irrationals, reals and complex numbers. Python follows the same order of operations as school maths (brackets, exponents, × ÷, + −), and floating-point numbers are approximations, which matters in data work.",
      minutes: 15,
      blocks: [
        { t: "table", head: ["Family", "Examples", "Where you meet it"], rows: [
          ["Natural numbers", "1, 2, 3, …", "Counting customers"],
          ["Whole numbers", "0, 1, 2, …", "Number of complaints today (can be 0)"],
          ["Integers", "…, −2, −1, 0, 1, 2, …", "Profit/loss in units, temperature"],
          ["Rational numbers", "½, 0.75, −3/4", "Ratios, percentages"],
          ["Irrational numbers", "π, √2, e", "Circles, growth, the normal curve"],
          ["Real numbers", "All of the above", "Almost every measurement"],
          ["Complex numbers", "3 + 2i (i² = −1)", "Signal processing, some algorithms"],
        ] },
        py("Order of operations and floating point", src`
import math
from fractions import Fraction

print(2 * 3 ** 2 + 4 / 2 - 1)          # ** first, then * and /, then + and -
print((2 * 3) ** 2 + 4 / (2 - 1))      # brackets change everything
print(Fraction(3, 4) + Fraction(1, 6)) # exact rational arithmetic
print(0.1 + 0.2, 0.1 + 0.2 == 0.3)     # floats are binary approximations
print(math.isclose(0.1 + 0.2, 0.3))    # compare floats with a tolerance
print(math.pi, math.sqrt(2))           # irrational numbers, approximated
print((1 + 2j) * (1 - 2j))             # complex numbers: i is written j in Python
`, "19.0\n40.0\n11/12\n0.30000000000000004 False\nTrue\n3.141592653589793 1.4142135623730951\n(5+0j)"),
        { t: "analogy", text: "Order of operations is the grammar of maths: \"2 + 3 × 4\" means 14 to everyone, just as everyone reads a sentence the same way. Brackets are how you say \"do this part first\" without arguing." },
        { t: "trap", text: "Never compare floats with ==: use `math.isclose` or `np.isclose`. And `-3 ** 2` is −9 in Python (the power happens before the minus sign); write `(-3) ** 2` for 9." },
        { t: "trick", text: "**Brackets → powers → × ÷ → + −. Compare floats with isclose.**" },
        { t: "exam", items: ["What are the families of numbers?", "Is 0.75 rational? Is π?", "Why is 0.1 + 0.2 not 0.3 in a computer?", "What does -3 ** 2 give in Python?"] },
        { t: "recap", items: ["Naturals ⊂ wholes ⊂ integers ⊂ rationals ⊂ reals", "Irrationals: π, √2, e", "Order: brackets, exponents, × ÷, + −", "Floats are approximations: use isclose", "fractions.Fraction for exact ratios"] },
      ],
      quiz: [
        { q: "2 + 3 * 2 ** 2 = ?", options: ["14", "100", "20", "22"], answer: 0, explain: "2 ** 2 = 4, × 3 = 12, + 2 = 14." },
        { q: "Which is irrational?", options: ["√2", "0.25", "−7", "3/8"], answer: 0, explain: "It can't be written as a fraction." },
        { q: "-3 ** 2 in Python is…", options: ["-9", "9", "6", "Error"], answer: 0, explain: "** binds tighter than unary minus." },
        { q: "The safe way to compare two floats is…", options: ["math.isclose(a, b)", "a == b", "a is b", "str(a) == str(b)"], answer: 0, explain: "Allows a tiny tolerance." },
      ],
    },
    {
      id: "functions-summations",
      title: "Variables, functions and summations",
      oneLine: "A function maps inputs to outputs, like y = 2x + 1; plotting it shows its shape. Summation notation Σ is just a compact way to write \"add these up\", which in Python is sum() over a loop or comprehension.",
      minutes: 16,
      blocks: [
        py("Functions as code and as tables", src`
def f(x):
    return 2 * x + 1                     # a linear function

def g(x):
    return x ** 2 - 4 * x + 3            # a quadratic: it curves

for x in range(-1, 5):
    print(f"x={x:>2}  f(x)={f(x):>2}  g(x)={g(x):>2}")
print("g has zeros at x = 1 and x = 3:", g(1), g(3))
`, "x=-1  f(x)=-1  g(x)= 8\nx= 0  f(x)= 1  g(x)= 3\nx= 1  f(x)= 3  g(x)= 0\nx= 2  f(x)= 5  g(x)=-1\nx= 3  f(x)= 7  g(x)= 0\nx= 4  f(x)= 9  g(x)= 3\ng has zeros at x = 1 and x = 3: 0 0"),
        { t: "formula", items: [["Summation", "Σ_{i=1}^{5} 2i = 2·1 + 2·2 + 2·3 + 2·4 + 2·5 = 30"], ["Mean", "x̄ = (1/n) Σ xᵢ"], ["Sum of squares", "Σ (xᵢ − x̄)²: the heart of variance and regression"]] },
        py("Σ in Python", src`
x = [4, 8, 6, 2]
print(sum(2 * i for i in range(1, 6)))            # Σ_{i=1}^{5} 2i
n = len(x)
mean = sum(x) / n                                  # (1/n) Σ x_i
squares = sum((xi - mean) ** 2 for xi in x)        # Σ (x_i - mean)^2
print(mean, squares)

import sympy as sp                                 # pip install sympy
i, n_sym = sp.symbols("i n", integer=True, positive=True)
print(sp.summation(i, (i, 1, n_sym)))              # symbolic: 1 + 2 + … + n
print(sp.summation(i, (i, 1, 100)))
`, "30\n5.0 20.0\nn**2/2 + n/2\n5050"),
        { t: "analogy", text: "A function is a vending machine: put in a coin (input x), get a snack (output f(x)). The same coin always gives the same snack. Σ is the cashier adding up a whole receipt in one line." },
        { t: "trap", text: "Read Σ's limits carefully: Σ from i = 1 to n has n terms; Python's range(1, n) stops at n − 1, so write range(1, n + 1). Mixing up 0-based and 1-based counting is a common source of off-by-one errors." },
        { t: "trick", text: "**Σ = sum(...) over a generator. Check the limits: range(1, n + 1).**" },
        { t: "exam", items: ["What is a function? Linear vs quadratic?", "Write Σ_{i=1}^{n} xᵢ² in Python.", "What does 1 + 2 + … + n equal? (n(n + 1)/2)", "Why do sums of squared differences appear everywhere in statistics?"] },
        { t: "recap", items: ["Functions map inputs to outputs", "Linear: straight line; quadratic: a curve", "Σ means add up the terms", "sum(...) over a generator implements Σ", "SymPy computes sums symbolically"] },
      ],
      quiz: [
        { q: "Σ_{i=1}^{4} i = ?", options: ["10", "4", "24", "16"], answer: 0, explain: "1 + 2 + 3 + 4." },
        { q: "f(x) = 3x − 2. f(4) = ?", options: ["10", "12", "14", "2"], answer: 0, explain: "12 − 2." },
        { q: "Python for Σ_{i=1}^{n} i² is…", options: ["sum(i**2 for i in range(1, n + 1))", "sum(range(n)) ** 2", "n ** 2", "sum(i for i in range(n))"], answer: 0, explain: "Include n." },
        { q: "1 + 2 + … + 100 = ?", options: ["5050", "5000", "10100", "100"], answer: 0, explain: "n(n + 1)/2 = 100·101/2." },
      ],
    },
    {
      id: "exponents-logs",
      title: "Exponents and logarithms",
      oneLine: "Exponents are repeated multiplication (2³ = 8), with rules for products, quotients, negative and fractional powers. A logarithm asks the reverse question: what power gives this number? log₂(8) = 3. Logs turn multiplication into addition and tame huge ranges of values.",
      minutes: 18,
      blocks: [
        { t: "table", head: ["Rule", "Example"], rows: [["xᵃ · xᵇ = xᵃ⁺ᵇ", "2³ · 2² = 2⁵ = 32"], ["xᵃ / xᵇ = xᵃ⁻ᵇ", "2⁵ / 2² = 2³ = 8"], ["(xᵃ)ᵇ = xᵃᵇ", "(2²)³ = 2⁶ = 64"], ["x⁻ᵃ = 1/xᵃ", "2⁻² = 1/4"], ["x^(1/n) = ⁿ√x", "8^(1/3) = 2"], ["x⁰ = 1", "5⁰ = 1"]] },
        py("Exponents and logs in Python", src`
import math

print(2 ** 3 * 2 ** 2, 2 ** 5)          # product rule
print(2 ** -2, 8 ** (1 / 3), 5 ** 0)    # negative, fractional, zero powers
print(math.log2(8), math.log10(1000), math.log(8, 2))   # what power gives the number?
print(math.log10(20 * 50), math.log10(20) + math.log10(50))   # log of a product = sum of logs

incomes = [12_000, 45_000, 80_000, 2_500_000, 40_000_000]       # a huge range
print([round(math.log10(v), 2) for v in incomes])                 # 4.08 … 7.6: a compact scale
`, "32 32\n0.25 2.0 1\n3.0 3.0 3.0\n3.0 3.0\n[4.08, 4.65, 4.9, 6.4, 7.6]"),
        { t: "p", text: "Data scientists use logs to plot or model values that span many orders of magnitude (incomes, city sizes, web traffic), to turn multiplicative effects into additive ones (log-odds in logistic regression), and to keep tiny probabilities from underflowing (adding log-probabilities in naive Bayes)." },
        { t: "analogy", text: "Exponents are a chain reaction: each step multiplies. A logarithm counts the steps: \"how many doublings get me from 1 to 1,024?\" Ten (log₂ 1024 = 10)." },
        { t: "trap", text: "log(0) is undefined (−∞) and logs of negative numbers aren't real: data with zeros often uses log(x + 1) (`np.log1p`). And `math.log(x)` is the natural log (base e), not base 10." },
        { t: "trick", text: "**log answers \"what power?\". log(a·b) = log a + log b. math.log is base e.**" },
        { t: "exam", items: ["State the exponent rules.", "What is a logarithm?", "Why use a log scale for incomes?", "Why does logistic regression use log-odds?", "What is log1p for?"] },
        { t: "recap", items: ["xᵃxᵇ = xᵃ⁺ᵇ; x⁻ᵃ = 1/xᵃ; x^(1/n) = ⁿ√x", "log_b(x) = the power of b that gives x", "Logs turn products into sums", "Log scales tame huge ranges", "math.log is natural log; use log1p with zeros"] },
      ],
      quiz: [
        { q: "log₁₀(10,000) = ?", options: ["4", "10", "1000", "3"], answer: 0, explain: "10⁴ = 10,000." },
        { q: "3⁻² = ?", options: ["1/9", "−9", "−6", "9"], answer: 0, explain: "1 / 3²." },
        { q: "log(a × b) equals…", options: ["log a + log b", "log a × log b", "log(a + b)", "a log b"], answer: 0, explain: "The product rule for logs." },
        { q: "In Python, math.log(x) uses base…", options: ["e", "10", "2", "x"], answer: 0, explain: "The natural logarithm." },
      ],
    },
    {
      id: "euler-growth",
      title: "Euler's number e, compound interest and natural logs",
      oneLine: "Compounding interest more and more often approaches a limit: e ≈ 2.71828. e describes continuous growth and decay everywhere, from loans and populations to probability (the normal curve, Poisson events). The natural log ln undoes it: how long until something doubles?",
      minutes: 18,
      blocks: [
        py("From compound interest to e", src`
import math

principal, rate, years = 100_000, 0.08, 5            # ₹1 lakh at 8% for 5 years
for n, name in [(1, "yearly"), (12, "monthly"), (365, "daily")]:
    amount = principal * (1 + rate / n) ** (n * years)
    print(f"{name:<10} ₹{amount:,.2f}")
print(f"continuous ₹{principal * math.e ** (rate * years):,.2f}")    # A = P e^(rt)

for n in [1, 10, 100, 10_000, 1_000_000]:
    print(n, round((1 + 1 / n) ** n, 6))                  # approaches e = 2.718282
print("e =", round(math.e, 6))
`, "yearly     ₹146,932.81\nmonthly    ₹148,984.57\ndaily      ₹149,175.93\ncontinuous ₹149,182.47\n1 2.0\n10 2.593742\n100 2.704814\n10000 2.718146\n1000000 2.71828\ne = 2.718282"),
        py("Natural logs: doubling time and decay", src`
import math

rate = 0.08
print("years to double at 8% (continuous):", round(math.log(2) / rate, 2))    # ln(2) / r
print("rule of 72 estimate:", 72 / 8)

half_life_days = 5                                    # a medicine's half-life
k = math.log(2) / half_life_days
for day in [0, 5, 10, 15]:
    print(f"day {day:>2}: {100 * math.exp(-k * day):5.1f}% remaining")

p_no_failure_per_day = 0.99                           # chance a server survives one day
days = math.log(0.5) / math.log(p_no_failure_per_day)
print("days until a 50% chance of at least one failure:", round(days, 1))
`, "years to double at 8% (continuous): 8.66\nrule of 72 estimate: 9.0\nday  0: 100.0% remaining\nday  5:  50.0% remaining\nday 10:  25.0% remaining\nday 15:  12.5% remaining\ndays until a 50% chance of at least one failure: 69.0"),
        { t: "formula", items: [["Compound interest", "A = P (1 + r/n)^(nt)"], ["Continuous growth", "A = P e^(rt)"], ["Doubling time", "t = ln(2) / r ≈ 0.693 / r (the \"rule of 70/72\")"], ["Decay with half-life h", "remaining = e^(−(ln 2 / h) · t)"]] },
        { t: "analogy", text: "e is the speed limit of compounding: splitting interest into ever-smaller pieces earns more, but never more than e^(rt). The natural log is the stopwatch that tells you how long growth takes to reach a target." },
        { t: "trap", text: "Rates must match the time unit: 8% per year with t in months is wrong. And growth that looks exponential in early data (users, cases) usually slows down later; don't extrapolate exponentials far into the future." },
        { t: "trick", text: "**A = Pe^(rt); doubling time = ln 2 / r; ln undoes e.**" },
        { t: "exam", items: ["What is Euler's number and where does it come from?", "Compound vs continuous interest?", "How do you compute doubling time?", "What is the natural logarithm?", "Where does e appear in probability? (Normal, exponential and Poisson distributions.)"] },
        { t: "recap", items: ["(1 + 1/n)^n → e ≈ 2.71828", "Continuous growth: Pe^(rt)", "ln is log base e and undoes e^x", "Doubling time ≈ 0.693 / rate", "Half-life decay uses e^(−kt)"] },
      ],
      quiz: [
        { q: "e is approximately…", options: ["2.718", "3.142", "1.618", "2.000"], answer: 0, explain: "Euler's number." },
        { q: "ln(e³) = ?", options: ["3", "e", "1", "20.1"], answer: 0, explain: "ln undoes e^x." },
        { q: "Doubling time at 10% continuous growth?", options: ["About 6.9 years", "10 years", "7.2 months", "2 years"], answer: 0, explain: "0.693 / 0.10." },
        { q: "More frequent compounding gives…", options: ["More money, up to the continuous limit", "Unlimited money", "Less money", "The same money"], answer: 0, explain: "The limit is Pe^(rt)." },
      ],
    },
  ],
};

export const EM02_CALCULUS: LearnModule = {
  id: "calculus",
  title: "Calculus for data science",
  titleHi: "डेटा साइंस के लिए कैलकुलस",
  blurb: "Just the calculus that machine learning uses: limits, derivatives as slopes (numerically and with SymPy), partial derivatives and the chain rule (the basis of gradient descent and backpropagation), and integrals as areas under curves.",
  lessons: [
    {
      id: "limits-derivatives",
      title: "Limits and derivatives",
      oneLine: "A limit is the value a function approaches as the input gets closer to some point. The derivative is the limit of the slope between two ever-closer points: the instantaneous rate of change. In machine learning, derivatives tell an algorithm which way to adjust a weight to reduce error.",
      minutes: 20,
      blocks: [
        py("A limit and a derivative, three ways", src`
import sympy as sp

def f(x):
    return x ** 2

for h in [1, 0.1, 0.01, 0.0001]:                         # slope between x=3 and x=3+h
    print(f"h={h:<7} slope ≈ {(f(3 + h) - f(3)) / h:.4f}")

x = sp.symbols("x")
print("limit of (x²-9)/(x-3) as x→3:", sp.limit((x ** 2 - 9) / (x - 3), x, 3))
print("derivative of x²:", sp.diff(x ** 2, x), "→ at x=3:", sp.diff(x ** 2, x).subs(x, 3))
print("derivative of 3x³ - 2x + 5:", sp.diff(3 * x ** 3 - 2 * x + 5, x))
print("limit of (1 + 1/n)^n:", sp.limit((1 + 1 / x) ** x, x, sp.oo))
`, "h=1       slope ≈ 7.0000\nh=0.1     slope ≈ 6.1000\nh=0.01    slope ≈ 6.0100\nh=0.0001  slope ≈ 6.0001\nlimit of (x²-9)/(x-3) as x→3: 6\nderivative of x²: 2*x → at x=3: 6\nderivative of 3x³ - 2x + 5: 9*x**2 - 2\nlimit of (1 + 1/n)^n: E"),
        { t: "table", head: ["Rule", "Derivative", "Example"], rows: [["Constant", "0", "d/dx 7 = 0"], ["Power", "n xⁿ⁻¹", "d/dx x³ = 3x²"], ["Constant multiple", "c f′(x)", "d/dx 5x² = 10x"], ["Sum", "f′ + g′", "d/dx (x² + x) = 2x + 1"], ["Exponential", "eˣ", "d/dx eˣ = eˣ"], ["Log", "1/x", "d/dx ln x = 1/x"]] },
        { t: "p", text: "At a minimum or maximum, the slope is 0. That's how optimisation works: gradient descent follows the negative slope downhill until the derivative is (nearly) zero, at the lowest error." },
        { t: "analogy", text: "A car's speedometer shows the derivative of distance: not the average speed of the whole trip, but how fast you're going right now. A limit is zooming in on a curve until it looks like a straight line." },
        { t: "trap", text: "Numerical derivatives with tiny h suffer from floating-point error (try h = 1e-15). Use moderate h (1e-5 to 1e-6), central differences (f(x+h) − f(x−h)) / 2h, or symbolic derivatives with SymPy / automatic differentiation in ML libraries." },
        { t: "trick", text: "**Derivative = slope right now. Power rule: xⁿ → nxⁿ⁻¹. Slope 0 at the bottom.**" },
        { t: "exam", items: ["What is a derivative?", "State the power rule.", "Why are derivatives important in machine learning?", "What is a limit?", "Numerical vs symbolic vs automatic differentiation?"] },
        { t: "recap", items: ["Limit: the value approached", "Derivative: limit of rise/run as run → 0", "Power rule and friends", "SymPy: sp.diff, sp.limit", "Slope 0 at minima: the goal of optimisation"] },
      ],
      quiz: [
        { q: "d/dx x⁴ = ?", options: ["4x³", "x³", "4x⁴", "x⁵/5"], answer: 0, explain: "Power rule." },
        { q: "Slope of x² at x = 5?", options: ["10", "25", "5", "2"], answer: 0, explain: "2x at x = 5." },
        { q: "At the minimum of a smooth curve, the derivative is…", options: ["0", "Infinite", "1", "Negative"], answer: 0, explain: "The curve is flat at the bottom." },
        { q: "Which SymPy function differentiates?", options: ["sp.diff", "sp.limit", "sp.integrate", "sp.solve"], answer: 0, explain: "sp.diff(expr, x)." },
      ],
    },
    {
      id: "partial-chain",
      title: "Partial derivatives and the chain rule",
      oneLine: "When a function has several inputs, a partial derivative measures the slope in one input while holding the others fixed; together they form the gradient. The chain rule differentiates functions inside functions (multiply the slopes), and it's exactly how neural networks are trained (backpropagation).",
      minutes: 20,
      blocks: [
        py("Partial derivatives and a gradient", src`
import sympy as sp

x, y = sp.symbols("x y")
f = 2 * x ** 3 + 3 * y ** 3
df_dx, df_dy = sp.diff(f, x), sp.diff(f, y)
print("∂f/∂x =", df_dx, "  ∂f/∂y =", df_dy)
print("gradient at (1, 2):", [df_dx.subs({x: 1, y: 2}), df_dy.subs({x: 1, y: 2})])

m, b = sp.symbols("m b")                     # the loss surface of a tiny regression
points = [(1, 3), (2, 5), (3, 7)]
loss = sum((m * px + b - py) ** 2 for px, py in points)
print("∂loss/∂m =", sp.expand(sp.diff(loss, m)))
print("∂loss/∂b =", sp.expand(sp.diff(loss, b)))
print("best m, b:", sp.solve([sp.diff(loss, m), sp.diff(loss, b)], [m, b]))
`, "∂f/∂x = 6*x**2   ∂f/∂y = 9*y**2\ngradient at (1, 2): [6, 36]\n∂loss/∂m = 12*b + 28*m - 68\n∂loss/∂b = 6*b + 12*m - 30\nbest m, b: {b: 1, m: 2}"),
        { t: "formula", items: [["Chain rule", "if y = f(u) and u = g(x), then dy/dx = (dy/du) · (du/dx)"], ["Example", "y = (2x + 1)³: dy/dx = 3(2x + 1)² · 2 = 6(2x + 1)²"]] },
        py("The chain rule, checked", src`
import sympy as sp

x, u = sp.symbols("x u")
inner = 2 * x + 1
outer = u ** 3
by_chain_rule = sp.diff(outer, u).subs(u, inner) * sp.diff(inner, x)   # dy/du · du/dx
direct = sp.diff((2 * x + 1) ** 3, x)
print(sp.factor(by_chain_rule), "|", sp.factor(direct), "| equal:", sp.simplify(by_chain_rule - direct) == 0)

w = sp.symbols("w")                                # one neuron: prediction = sigmoid(w·x), loss = (pred - 1)²
pred = 1 / (1 + sp.exp(-w * 2))
loss = (pred - 1) ** 2
print("d loss / d w at w = 0.5:", round(float(sp.diff(loss, w).subs(w, 0.5)), 4))
`, "6*(2*x + 1)**2 | 6*(2*x + 1)**2 | equal: True\nd loss / d w at w = 0.5: -0.2115"),
        { t: "analogy", text: "A partial derivative is checking how your bill changes when only the price of tea changes, keeping everything else the same. The chain rule is a gear train: if gear A turns 3× faster than B and B 2× faster than C, A turns 6× faster than C." },
        { t: "trap", text: "Forgetting the inner derivative is the classic chain-rule mistake: d/dx (2x + 1)³ is 6(2x + 1)², not 3(2x + 1)². Deep networks multiply many such factors, which is why gradients can vanish (many small factors) or explode (many large ones)." },
        { t: "trick", text: "**Partial: vary one, freeze the rest. Gradient = all partials. Chain rule: multiply slopes along the chain.**" },
        { t: "exam", items: ["What is a partial derivative? A gradient?", "State the chain rule.", "How is the chain rule used in backpropagation?", "What are vanishing and exploding gradients?"] },
        { t: "recap", items: ["∂f/∂x: slope in x with other inputs fixed", "Gradient = vector of all partial derivatives", "Setting partials to 0 finds the best regression line", "Chain rule: dy/dx = dy/du · du/dx", "Backpropagation = the chain rule through layers"] },
      ],
      quiz: [
        { q: "f = x²y. ∂f/∂x = ?", options: ["2xy", "x²", "2x", "y"], answer: 0, explain: "Treat y as a constant." },
        { q: "d/dx (3x + 2)² = ?", options: ["6(3x + 2)", "2(3x + 2)", "(3x + 2)", "9x"], answer: 0, explain: "2(3x + 2) · 3." },
        { q: "The gradient points in the direction of…", options: ["Steepest increase", "Steepest decrease", "Zero change", "The mean"], answer: 0, explain: "Gradient descent goes the opposite way." },
        { q: "Backpropagation is an application of…", options: ["The chain rule", "Integration", "Limits only", "The power rule only"], answer: 0, explain: "Derivatives through layers." },
      ],
    },
    {
      id: "integrals",
      title: "Integrals: areas under curves",
      oneLine: "An integral adds up infinitely many thin slices to find the area under a curve. In data science, the area under a probability density curve is a probability, and areas under curves summarise models (like the AUC of an ROC curve).",
      minutes: 16,
      blocks: [
        py("Riemann sums approach the integral", src`
import sympy as sp

def f(x):
    return 2 * x ** 2 + 1

a, b = 0, 2
for n in [4, 100, 10_000]:                              # n rectangles between a and b
    width = (b - a) / n
    area = sum(f(a + (i + 0.5) * width) * width for i in range(n))   # midpoint of each slice
    print(f"{n:>6} rectangles: area ≈ {area:.6f}")

x = sp.symbols("x")
exact = sp.integrate(2 * x ** 2 + 1, (x, 0, 2))
print("exact:", exact, "=", float(exact))
print("antiderivative:", sp.integrate(2 * x ** 2 + 1, x))
`, "     4 rectangles: area ≈ 7.250000\n   100 rectangles: area ≈ 7.333200\n 10000 rectangles: area ≈ 7.333333\nexact: 22/3 = 7.333333333333333\nantiderivative: 2*x**3/3 + x"),
        py("Probability as area", src`
import sympy as sp
from scipy import integrate, stats

x = sp.symbols("x")
density = sp.exp(-x ** 2 / 2) / sp.sqrt(2 * sp.pi)       # the standard normal curve
print("total area:", sp.integrate(density, (x, -sp.oo, sp.oo)))
area, _ = integrate.quad(stats.norm.pdf, -1, 1)          # numerical integration
print("P(-1 < Z < 1):", round(area, 4), "| same as cdf difference:", round(stats.norm.cdf(1) - stats.norm.cdf(-1), 4))
`, "total area: 1\nP(-1 < Z < 1): 0.6827 | same as cdf difference: 0.6827"),
        { t: "analogy", text: "An integral is measuring a field with an odd shape by cutting it into many thin strips, measuring each strip's area and adding them up. More, thinner strips give a more exact answer." },
        { t: "trap", text: "The height of a density curve isn't a probability; the **area** over an interval is. That's why P(X = exactly 5.000…) is 0 for a continuous variable, and why densities can exceed 1 for narrow distributions." },
        { t: "trick", text: "**Integral = sum of thin slices = area. Area under a density = probability.**" },
        { t: "exam", items: ["What does an integral represent?", "What are Riemann sums?", "How are integrals used in probability?", "Why is the total area under a density curve 1?", "What does AUC mean in a ROC curve?"] },
        { t: "recap", items: ["Integral = area under a curve", "Riemann sums approximate it with rectangles", "sp.integrate exact; scipy.integrate.quad numerical", "Area under a density = probability", "Total area under any density = 1"] },
      ],
      quiz: [
        { q: "∫₀² x dx = ?", options: ["2", "4", "1", "0"], answer: 0, explain: "x²/2 from 0 to 2." },
        { q: "More, thinner rectangles in a Riemann sum…", options: ["Get closer to the exact area", "Make it worse", "Change nothing", "Make it negative"], answer: 0, explain: "The limit is the integral." },
        { q: "For a continuous variable, a probability is…", options: ["An area under the density", "The curve's height", "Always 0.5", "The derivative"], answer: 0, explain: "Over an interval." },
        { q: "The total area under a probability density is…", options: ["1", "0", "100", "Infinite"], answer: 0, explain: "Something must happen." },
      ],
    },
  ],
};
