import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science from scratch, modules 10–12: regression, decision trees and forests, neural networks. */
export const DS10_REGRESSION: LearnModule = {
  id: "regression-from-scratch",
  title: "Regression from scratch",
  titleHi: "रिग्रेशन शुरू से",
  blurb: "Fit lines by least squares and by gradient descent, extend to many features, measure fit with R², estimate coefficient uncertainty with the bootstrap, regularise with ridge, and classify with logistic regression.",
  lessons: [
    {
      id: "simple-regression",
      title: "Simple linear regression",
      oneLine: "Fit y ≈ α + β·x so the squared errors are as small as possible. The best slope is β = correlation × (sd of y / sd of x) and α = mean(y) − β·mean(x). R² tells you what share of y's variation the line explains. Gradient descent finds the same answer.",
      minutes: 20,
      blocks: [
        { t: "formula", items: [["Slope", "β = correlation(x, y) × sd(y) / sd(x)"], ["Intercept", "α = mean(y) − β × mean(x)"], ["R²", "1 − (sum of squared errors) / (total sum of squares of y around its mean)"]] },
        py("Least squares and R² from scratch", src`
import math
import random

def mean(xs):
    return sum(xs) / len(xs)

def sd(xs):
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))

def correlation(xs, ys):
    mx, my = mean(xs), mean(ys)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / ((len(xs) - 1) * sd(xs) * sd(ys))

def least_squares_fit(xs, ys):
    beta = correlation(xs, ys) * sd(ys) / sd(xs)
    return mean(ys) - beta * mean(xs), beta

def r_squared(alpha, beta, xs, ys):
    sse = sum((y - (alpha + beta * x)) ** 2 for x, y in zip(xs, ys))
    sst = sum((y - mean(ys)) ** 2 for y in ys)
    return 1 - sse / sst

random.seed(6)
friends = [random.randint(1, 50) for _ in range(100)]
minutes = [12 + 0.9 * f + random.gauss(0, 6) for f in friends]    # minutes on the app per day

alpha, beta = least_squares_fit(friends, minutes)
print(f"minutes ≈ {alpha:.2f} + {beta:.3f} × friends")
print("R²:", round(r_squared(alpha, beta, friends, minutes), 3))
print("Prediction for 30 friends:", round(alpha + beta * 30, 1), "minutes")
`, "minutes ≈ 13.42 + 0.845 × friends\nR²: 0.808\nPrediction for 30 friends: 38.8 minutes"),
        { t: "p", text: "Each extra friend adds roughly 0.85 minutes of daily use, and the line explains about 80% of the variation (R² ≈ 0.81). The data was generated with intercept 12 and slope 0.9, so from 100 noisy points the fit came close to the truth, but not exactly: that gap is sampling noise." },
        py("The same fit by gradient descent", src`
import random

random.seed(6)
friends = [random.randint(1, 50) for _ in range(100)]
minutes = [12 + 0.9 * f + random.gauss(0, 6) for f in friends]

alpha, beta = 0.0, 0.0
lr = 0.0005
for epoch in range(20_000):
    grad_a = grad_b = 0.0
    for x, y in zip(friends, minutes):
        error = (alpha + beta * x) - y
        grad_a += 2 * error / len(friends)
        grad_b += 2 * error * x / len(friends)
    alpha, beta = alpha - lr * grad_a, beta - lr * grad_b
print(f"gradient descent: alpha {alpha:.2f}, beta {beta:.3f}")
`, "gradient descent: alpha 13.29, beta 0.848"),
        { t: "p", text: "Almost the same line; with more steps (or a better learning rate) it would match the formula exactly. Least squares has a formula for straight lines; gradient descent works for **any** model you can differentiate, which is why it powers logistic regression and neural networks. (Least squares is also the **maximum likelihood** answer when the errors are normally distributed.)" },
        { t: "analogy", text: "R² is like a weather forecaster's score: 0 means they did no better than always predicting the average temperature; 1 means perfect forecasts. An R² of 0.9 means the line accounts for 90% of the ups and downs." },
        { t: "trap", text: "A high R² doesn't mean causation, and a low R² doesn't make a coefficient useless (lots of noise, real effect). Check the residuals for curves, and don't predict far outside the x-range you fitted on." },
        { t: "trick", text: "**β = r × sd(y)/sd(x); α = ȳ − βx̄; R² = 1 − SSE/SST.**" },
        { t: "exam", items: ["Derive or state the least-squares slope and intercept.", "What is R²?", "Least squares vs gradient descent: when use which?", "What is maximum likelihood estimation?", "What does the slope mean in words?"] },
        { t: "recap", items: ["Simple regression: y ≈ α + βx", "β = r·sd(y)/sd(x), α = ȳ − βx̄", "R² = share of variance explained", "Gradient descent reaches the same answer", "Least squares = MLE with normal errors"] },
      ],
      quiz: [
        { q: "r = 0.5, sd(y) = 10, sd(x) = 2. Slope β?", options: ["2.5", "0.1", "10", "5"], answer: 0, explain: "0.5 × 10 / 2." },
        { q: "R² = 0 means the line…", options: ["Is no better than predicting the mean", "Is perfect", "Has slope 0 always", "Is negative"], answer: 0, explain: "It explains none of the variation." },
        { q: "ȳ = 50, x̄ = 10, β = 3. Intercept α?", options: ["20", "80", "47", "30"], answer: 0, explain: "50 − 3 × 10." },
        { q: "Why learn gradient descent if there's a formula?", options: ["It works for models without a formula", "It's always faster", "It gives a different line", "Formulas are wrong"], answer: 0, explain: "Logistic regression and neural nets need it." },
      ],
    },
    {
      id: "multiple-regression",
      title: "Multiple regression, the bootstrap and ridge",
      oneLine: "With several features, y ≈ β₀ + β₁x₁ + β₂x₂ + … Solve for the β's (here exactly, with the normal equations). The bootstrap estimates how uncertain each β is, and ridge regression adds a penalty that shrinks coefficients to fight overfitting.",
      minutes: 24,
      blocks: [
        py("Least squares for several features", src`
import random

def solve(A, b):
    """Solve A·x = b with Gaussian elimination (A is small and square)."""
    n = len(A)
    M = [row[:] + [b_i] for row, b_i in zip(A, b)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[pivot] = M[pivot], M[col]
        for r in range(n):
            if r != col:
                factor = M[r][col] / M[col][col]
                M[r] = [a - factor * c for a, c in zip(M[r], M[col])]
    return [M[i][n] / M[i][i] for i in range(n)]

def fit(X, y, ridge=0.0):
    """Normal equations: (XᵀX + ridge·I) β = Xᵀy  (no penalty on the intercept)."""
    k = len(X[0])
    XtX = [[sum(row[i] * row[j] for row in X) + (ridge if i == j and i > 0 else 0) for j in range(k)]
           for i in range(k)]
    Xty = [sum(row[i] * yi for row, yi in zip(X, y)) for i in range(k)]
    return solve(XtX, Xty)

random.seed(8)
X, y = [], []
for _ in range(200):
    friends, work_hours, phd = random.randint(1, 50), random.uniform(20, 60), random.random() < 0.3
    X.append([1, friends, work_hours, int(phd)])                    # leading 1 = the intercept
    y.append(30 + 1.0 * friends - 0.5 * work_hours - 2.0 * phd + random.gauss(0, 5))

beta = fit(X, y)
for name, b in zip(["intercept", "friends", "work_hours", "phd"], beta):
    print(f"{name:<10} {b:7.3f}")

pred = [sum(b * x for b, x in zip(beta, row)) for row in X]
mean_y = sum(y) / len(y)
r2 = 1 - sum((p - t) ** 2 for p, t in zip(pred, y)) / sum((t - mean_y) ** 2 for t in y)
print("R²:", round(r2, 3))
`, "intercept   27.787\nfriends      0.955\nwork_hours  -0.426\nphd         -1.672\nR²: 0.896"),
        { t: "p", text: "Each coefficient is the effect of that feature **holding the others constant**: one more friend adds about 1 minute (0.96), each extra work hour removes a bit under half a minute (−0.43), and having a PhD is associated with about 1.7 fewer minutes. The data was generated with 1.0, −0.5 and −2.0, so the estimates are close, and the PhD effect is the least precise (see its standard error below)." },
        { t: "h", text: "How sure are we? The bootstrap" },
        py("Bootstrap standard errors of the coefficients", src`
import math
import random

def solve(A, b):
    n = len(A)
    M = [row[:] + [b_i] for row, b_i in zip(A, b)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[pivot] = M[pivot], M[col]
        for r in range(n):
            if r != col:
                factor = M[r][col] / M[col][col]
                M[r] = [a - factor * c for a, c in zip(M[r], M[col])]
    return [M[i][n] / M[i][i] for i in range(n)]

def fit(X, y):
    k = len(X[0])
    XtX = [[sum(r[i] * r[j] for r in X) for j in range(k)] for i in range(k)]
    return solve(XtX, [sum(r[i] * t for r, t in zip(X, y)) for i in range(k)])

random.seed(8)
X, y = [], []
for _ in range(200):
    friends, work_hours, phd = random.randint(1, 50), random.uniform(20, 60), random.random() < 0.3
    X.append([1, friends, work_hours, int(phd)])
    y.append(30 + 1.0 * friends - 0.5 * work_hours - 2.0 * phd + random.gauss(0, 5))

boot = []
for _ in range(100):
    idx = [random.randrange(len(X)) for _ in range(len(X))]      # resample rows with replacement
    boot.append(fit([X[i] for i in idx], [y[i] for i in idx]))

for j, name in enumerate(["intercept", "friends", "work_hours", "phd"]):
    values = [b[j] for b in boot]
    m = sum(values) / len(values)
    se = math.sqrt(sum((v - m) ** 2 for v in values) / (len(values) - 1))
    print(f"{name:<10} estimate {m:7.3f}  std error {se:.3f}  t ≈ {m / se:6.1f}")
`, "intercept  estimate  27.932  std error 1.401  t ≈   19.9\nfriends    estimate   0.953  std error 0.023  t ≈   41.2\nwork_hours estimate  -0.426  std error 0.029  t ≈  -14.6\nphd        estimate  -1.844  std error 0.717  t ≈   -2.6"),
        { t: "p", text: "A coefficient whose size is many standard errors away from 0 (|t| well above 2) is reliably non-zero. The PhD effect has a much larger standard error relative to its size than friends does: we're less sure about it." },
        { t: "h", text: "Regularisation: ridge" },
        py("Ridge shrinks coefficients", src`
import random

def solve(A, b):
    n = len(A)
    M = [row[:] + [b_i] for row, b_i in zip(A, b)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[pivot] = M[pivot], M[col]
        for r in range(n):
            if r != col:
                factor = M[r][col] / M[col][col]
                M[r] = [a - factor * c for a, c in zip(M[r], M[col])]
    return [M[i][n] / M[i][i] for i in range(n)]

def fit(X, y, ridge=0.0):
    k = len(X[0])
    XtX = [[sum(r[i] * r[j] for r in X) + (ridge if i == j and i > 0 else 0) for j in range(k)] for i in range(k)]
    return solve(XtX, [sum(r[i] * t for r, t in zip(X, y)) for i in range(k)])

random.seed(9)
X, y = [], []
for _ in range(30):                                         # few rows, many useless features
    features = [random.gauss(0, 1) for _ in range(8)]
    X.append([1] + features)
    y.append(5 + 3 * features[0] + random.gauss(0, 2))     # only feature 1 matters

for ridge in [0, 10, 100]:
    beta = fit(X, y, ridge)
    print(f"ridge {ridge:>3}: feature 1 = {beta[1]:5.2f},  useless features sum |β| = {sum(abs(b) for b in beta[2:]):.2f}")
`, "ridge   0: feature 1 =  3.33,  useless features sum |β| = 1.56\nridge  10: feature 1 =  2.51,  useless features sum |β| = 0.99\nridge 100: feature 1 =  0.86,  useless features sum |β| = 0.64"),
        { t: "p", text: "Ridge adds λ·Σβ² to the error, so large coefficients cost extra. The useless features' coefficients shrink towards 0, and the model overfits the noise less. Too much ridge also shrinks the real effect, so λ is tuned with cross-validation. (Lasso, with λ·Σ|β|, can shrink coefficients exactly to 0.)" },
        { t: "analogy", text: "Ridge is a strict budget for a team: everyone wants a big role, but each rupee of coefficient costs extra, so only features that really help get a large share. The bootstrap is re-running the season many times with reshuffled matches to see how stable each player's rating is." },
        { t: "trap", text: "Coefficients of correlated features (friends and followers, say) can swing wildly and have huge standard errors, even if predictions are fine. Scale features before ridge, since the penalty treats all coefficients the same; and never penalise the intercept." },
        { t: "trick", text: "**Coefficient = effect holding others fixed. Bootstrap → its standard error. Ridge → shrink to fight overfitting.**" },
        { t: "exam", items: ["How do you interpret a coefficient in multiple regression?", "What are the normal equations?", "How can the bootstrap estimate standard errors?", "Ridge vs lasso?", "Why not regularise the intercept?"] },
        { t: "recap", items: ["y ≈ Xβ with a leading 1 for the intercept", "Normal equations (XᵀX)β = Xᵀy, or gradient descent", "Bootstrap rows to get coefficient standard errors", "|coef / SE| well above 2 → reliable", "Ridge adds λΣβ², shrinking useless coefficients"] },
      ],
      quiz: [
        { q: "Why add a column of 1s to X?", options: ["It lets the model learn an intercept", "To avoid division by zero", "To scale the data", "It's a ridge penalty"], answer: 0, explain: "β₀ multiplies the 1." },
        { q: "A coefficient of 0.5 with standard error 0.05 is…", options: ["Reliably non-zero (t = 10)", "Not significant", "Exactly 0", "Overfitted"], answer: 0, explain: "10 standard errors from 0." },
        { q: "Ridge regression penalises…", options: ["The sum of squared coefficients", "The number of rows", "The intercept only", "Residuals only"], answer: 0, explain: "λΣβ²." },
        { q: "Increasing the ridge penalty makes coefficients…", options: ["Smaller", "Larger", "Unchanged", "Negative"], answer: 0, explain: "They shrink towards 0." },
      ],
    },
    {
      id: "logistic-regression",
      title: "Logistic regression from scratch",
      oneLine: "For yes/no outcomes, pass the linear score through the logistic (sigmoid) function to get a probability between 0 and 1. Train the weights by gradient descent on the log-likelihood, then pick a threshold and check precision and recall on a test set.",
      minutes: 24,
      blocks: [
        { t: "formula", items: [["Logistic function", "σ(z) = 1 / (1 + e^(−z))"], ["Model", "P(y = 1 | x) = σ(β·x)"], ["Gradient of the log-likelihood", "Σ (y − σ(β·x)) × x   (the same shape as linear regression's)"]] },
        py("Will a user pay for premium?", src`
import math
import random

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

random.seed(11)
rows = []
for _ in range(400):
    experience = random.uniform(0, 10)                       # years
    salary = random.uniform(3, 30)                           # ₹ lakh / year
    z = -6 + 0.6 * experience + 0.15 * salary
    rows.append(([1, experience, salary], int(random.random() < sigmoid(z))))   # 1 = paid

random.shuffle(rows)
train, test = rows[:300], rows[300:]

means = [sum(x[j] for x, _ in train) / len(train) for j in range(3)]           # standardise
sds = [1] + [math.sqrt(sum((x[j] - means[j]) ** 2 for x, _ in train) / len(train)) for j in (1, 2)]
def scale(x):
    return [1] + [(x[j] - means[j]) / sds[j] for j in (1, 2)]

beta = [0.0, 0.0, 0.0]
for epoch in range(2000):                                    # gradient ASCENT on the log-likelihood
    grad = [0.0, 0.0, 0.0]
    for x, y in train:
        xs = scale(x)
        error = y - sigmoid(sum(b * v for b, v in zip(beta, xs)))
        grad = [g + error * v for g, v in zip(grad, xs)]
    beta = [b + 0.01 * g / len(train) * 10 for b, g in zip(beta, grad)]
print("coefficients (scaled features):", [round(b, 2) for b in beta])

tp = fp = fn = tn = 0
for x, y in test:
    pred = sigmoid(sum(b * v for b, v in zip(beta, scale(x)))) >= 0.5
    tp += pred and y; fp += pred and not y; fn += (not pred) and y; tn += (not pred) and not y
print(f"test: TP={tp} FP={fp} FN={fn} TN={tn}")
print(f"precision {tp / (tp + fp):.2f}, recall {tp / (tp + fn):.2f}, accuracy {(tp + tn) / len(test):.2f}")
`, "coefficients (scaled features): [-0.16, 1.83, 1.23]\ntest: TP=32 FP=9 FN=15 TN=44\nprecision 0.78, recall 0.68, accuracy 0.76"),
        { t: "p", text: "Both coefficients are positive: more experience and a higher salary both raise the chance of paying. Because features were standardised, the coefficients are comparable: the larger one belongs to the more influential feature." },
        { t: "table", head: ["", "Linear regression", "Logistic regression"], rows: [["Predicts", "A number", "A probability (0–1)"], ["Output function", "None (identity)", "Sigmoid"], ["Fitted by", "Least squares", "Maximum likelihood (gradient ascent)"], ["Evaluated with", "RMSE, R²", "Precision, recall, AUC, log-loss"]] },
        { t: "p", text: "**Support vector machines (SVMs)** solve the same yes/no problem differently: they look for the boundary with the widest margin between the classes, and with the \"kernel trick\" they can draw curved boundaries. scikit-learn's `SVC` implements them." },
        { t: "analogy", text: "The sigmoid is a dimmer switch, not an on/off switch: as the score rises, the probability glides smoothly from 0 to 1, passing 0.5 when the score is 0." },
        { t: "trap", text: "Without scaling, features with large values (salary in rupees) make gradient descent crawl or blow up. And 0.5 isn't a magic threshold: with rare positives, a lower threshold may catch more of them at an acceptable cost." },
        { t: "trick", text: "**score = β·x → probability = σ(score) → update β += lr × (y − p) × x.**" },
        { t: "exam", items: ["Implement logistic regression with gradient descent.", "What is the logistic (sigmoid) function?", "Why use log-likelihood rather than squared error?", "How do you interpret the coefficients?", "Logistic regression vs SVM?"] },
        { t: "recap", items: ["P(y = 1) = σ(β·x)", "Train by gradient ascent on the log-likelihood", "Gradient: Σ (y − p)·x", "Scale features first", "Evaluate with precision, recall, accuracy on a test set"] },
      ],
      quiz: [
        { q: "σ(0) equals…", options: ["0.5", "0", "1", "e"], answer: 0, explain: "1 / (1 + 1)." },
        { q: "As z → +∞, σ(z) →…", options: ["1", "0", "0.5", "∞"], answer: 0, explain: "It never exceeds 1." },
        { q: "The update for each weight uses…", options: ["(y − p) × feature", "y × p", "p² only", "The intercept only"], answer: 0, explain: "The error times the input." },
        { q: "A positive coefficient means the feature…", options: ["Raises the probability of y = 1", "Lowers it", "Has no effect", "Is categorical"], answer: 0, explain: "Higher score, higher σ." },
      ],
    },
  ],
};

export const DS11_TREES: LearnModule = {
  id: "trees-forests",
  title: "Decision trees and random forests",
  titleHi: "डिसीज़न ट्री और रैंडम फ़ॉरेस्ट",
  blurb: "Measure disorder with entropy, choose the split that reduces it most, grow a decision tree recursively (the ID3 algorithm), and combine many randomised trees into a forest.",
  lessons: [
    {
      id: "decision-trees",
      title: "Entropy and building a decision tree",
      oneLine: "Entropy measures how mixed a group is: 0 if everyone has the same label, 1 for a 50/50 yes/no split. A decision tree picks the question whose answers leave the purest groups (lowest weighted entropy), then repeats inside each group until the groups are pure.",
      minutes: 26,
      blocks: [
        { t: "formula", items: [["Entropy", "H = −Σ pᵢ log₂ pᵢ"], ["All one class", "H = 0 (pure)"], ["50/50", "H = −(0.5·log₂0.5 + 0.5·log₂0.5) = 1"], ["Entropy of a split", "weighted average of each group's entropy (weights = group sizes)"]] },
        py("Building a tree with ID3", src`
import math
from collections import Counter, defaultdict

students = [   # will the learner finish an online course?
    ({"background": "cs", "hours": "high", "laptop": "yes", "project": "yes"}, True),
    ({"background": "cs", "hours": "low", "laptop": "yes", "project": "no"}, False),
    ({"background": "cs", "hours": "medium", "laptop": "no", "project": "yes"}, True),
    ({"background": "commerce", "hours": "high", "laptop": "yes", "project": "yes"}, True),
    ({"background": "commerce", "hours": "low", "laptop": "no", "project": "no"}, False),
    ({"background": "commerce", "hours": "medium", "laptop": "yes", "project": "no"}, False),
    ({"background": "commerce", "hours": "medium", "laptop": "yes", "project": "yes"}, True),
    ({"background": "arts", "hours": "high", "laptop": "no", "project": "yes"}, True),
    ({"background": "arts", "hours": "low", "laptop": "yes", "project": "no"}, False),
    ({"background": "arts", "hours": "medium", "laptop": "no", "project": "no"}, False),
    ({"background": "arts", "hours": "high", "laptop": "yes", "project": "no"}, True),
    ({"background": "cs", "hours": "medium", "laptop": "yes", "project": "no"}, True),
]

def entropy(labels):
    counts, n = Counter(labels), len(labels)
    return -sum(c / n * math.log2(c / n) for c in counts.values())

def split_entropy(rows, attr):
    groups = defaultdict(list)
    for features, label in rows:
        groups[features[attr]].append(label)
    return sum(len(g) / len(rows) * entropy(g) for g in groups.values())

def build_tree(rows, attrs):
    labels = [label for _, label in rows]
    if len(set(labels)) == 1 or not attrs:                       # pure, or nothing left to ask
        return Counter(labels).most_common(1)[0][0]
    best = min(attrs, key=lambda a: split_entropy(rows, a))      # the most informative question
    groups = defaultdict(list)
    for features, label in rows:
        groups[features[best]].append((features, label))
    rest = [a for a in attrs if a != best]
    return (best, {value: build_tree(sub, rest) for value, sub in groups.items()})

def show(tree, indent=""):
    if not isinstance(tree, tuple):
        print(indent + ("→ FINISHES" if tree else "→ drops out"))
        return
    attr, branches = tree
    for value, subtree in branches.items():
        print(f"{indent}{attr} = {value}:")
        show(subtree, indent + "    ")

attrs = ["background", "hours", "laptop", "project"]
print("Entropy of all labels:", round(entropy([l for _, l in students]), 3))
for a in attrs:
    print(f"  split on {a:<10} → entropy {split_entropy(students, a):.3f}")
tree = build_tree(students, attrs)
show(tree)
`, "Entropy of all labels: 0.98\n  split on background → entropy 0.937\n  split on hours      → entropy 0.405\n  split on laptop     → entropy 0.970\n  split on project    → entropy 0.503\nhours = high:\n    → FINISHES\nhours = low:\n    → drops out\nhours = medium:\n    background = cs:\n        → FINISHES\n    background = commerce:\n        project = no:\n            → drops out\n        project = yes:\n            → FINISHES\n    background = arts:\n        → drops out"),
        { t: "p", text: "The tree asks the most informative question first (the one with the lowest split entropy), then asks follow-up questions only in groups that are still mixed. The final branches are pure, so the tree classifies every training student correctly. That's also its weakness: it can memorise noise." },
        { t: "table", head: ["Choice", "Effect"], rows: [["Stop when a group is pure", "Perfect on training data (risk of overfitting)"], ["Limit the depth", "Simpler tree, generalises better"], ["Minimum rows per leaf", "Avoids rules based on one or two examples"], ["Numeric features", "Try thresholds (\"hours ≤ 5?\") instead of categories"]] },
        { t: "analogy", text: "A decision tree is the flowchart a bank officer follows: \"Salaried? Then check the credit score; self-employed? Then check tax returns.\" Entropy picks the first question that best separates good and bad cases." },
        { t: "trap", text: "ID3 prefers attributes with many distinct values (like a student ID, which splits everyone into pure groups of one): useless but \"perfect\". Never use identifiers as features, and limit tree growth. Real libraries use Gini impurity and numeric thresholds (CART)." },
        { t: "trick", text: "**Entropy 0 = pure, 1 = 50/50. Pick the split with the lowest weighted entropy. Recurse.**" },
        { t: "exam", items: ["What is entropy? Information gain?", "How does a decision tree choose splits?", "Why do decision trees overfit? How do you prevent it?", "Gini impurity vs entropy?", "Advantages of decision trees? (Easy to explain, no scaling, handle categories.)"] },
        { t: "recap", items: ["Entropy H = −Σ p log₂ p", "Split entropy = weighted average over groups", "Choose the split with the lowest entropy (most information gain)", "Recurse until pure or out of attributes", "Limit depth to avoid overfitting"] },
      ],
      quiz: [
        { q: "Entropy of a group with all labels equal?", options: ["0", "1", "0.5", "Undefined"], answer: 0, explain: "No uncertainty." },
        { q: "Entropy of a 50/50 yes/no group?", options: ["1", "0", "0.5", "2"], answer: 0, explain: "Maximum uncertainty for two classes." },
        { q: "A tree chooses the split that…", options: ["Leaves the purest groups (lowest weighted entropy)", "Has the most branches", "Comes first alphabetically", "Is random"], answer: 0, explain: "Highest information gain." },
        { q: "Why is a student-ID feature dangerous for a tree?", options: ["It splits everyone perfectly but means nothing", "It's numeric", "Trees can't use it", "It's slow"], answer: 0, explain: "Pure memorisation." },
      ],
    },
    {
      id: "random-forests",
      title: "Random forests: many trees vote",
      oneLine: "One deep tree overfits. A random forest trains many trees, each on a bootstrap sample of the rows and with random subsets of features, and lets them vote. Their individual mistakes cancel out, giving much more reliable predictions.",
      minutes: 20,
      blocks: [
        py("One stump vs a forest of random stumps", src`
import random
from collections import Counter

random.seed(12)
def make_row():
    x = [random.uniform(0, 10) for _ in range(5)]
    label = (x[0] + x[1] > 10) != (random.random() < 0.15)        # depends on features 0 and 1, 15% noise
    return x, label

train = [make_row() for _ in range(300)]
test = [make_row() for _ in range(300)]

def best_stump(rows, features):
    """The single 'feature <= threshold' question that classifies rows best."""
    best = None
    for f in features:
        for t in range(1, 10):
            left = Counter(label for x, label in rows if x[f] <= t)
            right = Counter(label for x, label in rows if x[f] > t)
            correct = max(left.values(), default=0) + max(right.values(), default=0)
            if best is None or correct > best[0]:
                best = (correct, f, t, left.most_common(1)[0][0] if left else False,
                        right.most_common(1)[0][0] if right else False)
    _, f, t, left_label, right_label = best
    return lambda x: left_label if x[f] <= t else right_label

def accuracy(predict, rows):
    return sum(predict(x) == label for x, label in rows) / len(rows)

stump = best_stump(train, range(5))
print("one stump:", round(accuracy(stump, test), 3))

forest = []
for _ in range(50):
    sample = [random.choice(train) for _ in train]                # bootstrap the rows
    features = random.sample(range(5), 2)                         # random subset of features
    forest.append(best_stump(sample, features))

def forest_predict(x):
    return Counter(tree(x) for tree in forest).most_common(1)[0][0]   # majority vote
print("forest of 50 random stumps:", round(accuracy(forest_predict, test), 3))
`, "one stump: 0.66\nforest of 50 random stumps: 0.693"),
        { t: "p", text: "Each stump can only ask one question, and the true rule needs two features (x₀ + x₁ > 10). Individually, stumps are weak; voting together, different stumps cover different parts of the rule, and the forest beats the single best stump. Real random forests use full trees instead of stumps and often hundreds of them." },
        { t: "table", head: ["Ingredient", "Why"], rows: [["Bootstrap samples (bagging)", "Each tree sees slightly different data, so their errors differ"], ["Random feature subsets", "Stops every tree from asking the same strongest question"], ["Majority vote / average", "Independent errors cancel out; variance drops"], ["Out-of-bag rows", "Rows a tree didn't see give a free accuracy estimate"]] },
        { t: "analogy", text: "A random forest is a panel of judges at a talent show: each judge saw a different set of rehearsals (bootstrap) and focuses on different skills (random features). One judge can be biased, but the panel's majority vote is far more reliable." },
        { t: "trap", text: "Forests lose the single tree's easy explanation. Use feature importance or permutation importance to see what drives them. They also can't extrapolate: a forest predicting prices never predicts above the highest price it has seen." },
        { t: "trick", text: "**Bootstrap rows + random features + many trees + vote = random forest.**" },
        { t: "exam", items: ["What is a random forest? Why does it work better than one tree?", "What is bagging?", "Why use random feature subsets?", "What is out-of-bag error?", "Random forest vs gradient boosting?"] },
        { t: "recap", items: ["Single trees are unstable and overfit", "Bagging: train on bootstrap samples", "Random features make trees more different", "Vote (classification) or average (regression)", "Lower variance, better predictions"] },
      ],
      quiz: [
        { q: "Each tree in a random forest is trained on…", options: ["A bootstrap sample of the rows", "The test set", "One row", "All rows, identically"], answer: 0, explain: "Sampling with replacement." },
        { q: "Why random feature subsets?", options: ["So the trees aren't all the same", "To speed up voting", "To remove noise from labels", "To scale data"], answer: 0, explain: "Diverse trees make better committees." },
        { q: "A forest classifies by…", options: ["Majority vote of its trees", "Using the first tree", "Averaging features", "Random choice"], answer: 0, explain: "Regression forests average." },
        { q: "Forests mainly reduce…", options: ["Variance", "The number of features", "Training data", "Bias to zero"], answer: 0, explain: "Errors of individual trees cancel." },
      ],
    },
  ],
};

export const DS12_NEURAL_NETWORKS: LearnModule = {
  id: "neural-networks",
  title: "Neural networks",
  titleHi: "न्यूरल नेटवर्क",
  blurb: "From a single perceptron that computes AND and OR, to a small feed-forward network trained with backpropagation that learns XOR, the problem a single neuron can't solve. The foundation of deep learning.",
  lessons: [
    {
      id: "perceptrons",
      title: "Perceptrons: a single artificial neuron",
      oneLine: "A perceptron multiplies its inputs by weights, adds a bias, and fires (outputs 1) if the total is positive. With the right weights it computes logic gates like AND, OR and NOT. But one perceptron can only draw a straight line, so it can't compute XOR.",
      minutes: 16,
      blocks: [
        { t: "diagram", text: "x₁ ──(w₁)──╲\n            ╲\n             ( Σ + bias ) ── step ──▶ 0 or 1\n            ╱\nx₂ ──(w₂)──╱\n\noutput = 1 if w₁x₁ + w₂x₂ + bias > 0 else 0" },
        py("Logic gates from perceptrons", src`
def perceptron(weights, bias, inputs):
    total = sum(w * x for w, x in zip(weights, inputs)) + bias
    return 1 if total > 0 else 0

AND = lambda a, b: perceptron([2, 2], -3, [a, b])     # fires only if both are 1 (2 + 2 - 3 > 0)
OR = lambda a, b: perceptron([2, 2], -1, [a, b])      # fires if either is 1
NOT = lambda a: perceptron([-2], 1, [a])              # flips the input

print(" a b | AND OR")
for a in (0, 1):
    for b in (0, 1):
        print(f" {a} {b} |  {AND(a, b)}   {OR(a, b)}")
print("NOT 0 =", NOT(0), " NOT 1 =", NOT(1))

XOR = lambda a, b: AND(OR(a, b), NOT(AND(a, b)))      # XOR needs TWO layers of perceptrons
print("XOR:", [XOR(a, b) for a in (0, 1) for b in (0, 1)])
`, " a b | AND OR\n 0 0 |  0   0\n 0 1 |  0   1\n 1 0 |  0   1\n 1 1 |  1   1\nNOT 0 = 1  NOT 1 = 0\nXOR: [0, 1, 1, 0]"),
        { t: "diagram", text: "AND / OR: one straight line separates the 1s from the 0s   ✔\nXOR:      (0,1) and (1,0) → 1, (0,0) and (1,1) → 0\n          no single straight line can separate them   ✘\n          → combine neurons in layers (next lesson)" },
        { t: "analogy", text: "A perceptron is a committee member with a voting rule: each input is an argument with a weight (how convincing it is), the bias is their initial mood, and they say yes only if the total is positive. XOR needs a committee of committees." },
        { t: "trap", text: "The step function has no useful slope (it's flat everywhere and jumps at 0), so you can't train perceptrons with gradient descent. Real networks use smooth activations like the sigmoid or ReLU, which have gradients." },
        { t: "trick", text: "**Perceptron = weighted sum + bias + step. One neuron = one straight line. XOR needs layers.**" },
        { t: "exam", items: ["What is a perceptron?", "What are weights and biases?", "Why can't a single perceptron learn XOR?", "What is an activation function?", "Why is the step function unsuitable for gradient-based training?"] },
        { t: "recap", items: ["Output = step(w·x + b)", "Weights = importance of inputs; bias = threshold", "AND, OR, NOT are single perceptrons", "XOR isn't linearly separable", "Layers of neurons solve it"] },
      ],
      quiz: [
        { q: "Weights [1, 1], bias −1.5, inputs (1, 1). Output?", options: ["1", "0", "−0.5", "2"], answer: 0, explain: "1 + 1 − 1.5 = 0.5 > 0." },
        { q: "Same perceptron, inputs (1, 0)?", options: ["0", "1", "−0.5", "0.5"], answer: 0, explain: "1 − 1.5 < 0: it's an AND gate." },
        { q: "Why can't one perceptron do XOR?", options: ["XOR's classes can't be split by one straight line", "XOR needs 3 inputs", "Perceptrons can't output 0", "XOR has no bias"], answer: 0, explain: "It isn't linearly separable." },
        { q: "The bias in a neuron acts like…", options: ["A threshold that shifts when it fires", "A second input", "The learning rate", "The output"], answer: 0, explain: "It moves the line." },
      ],
    },
    {
      id: "backpropagation",
      title: "Feed-forward networks and backpropagation",
      oneLine: "A feed-forward network stacks layers of sigmoid neurons: inputs → hidden layer → output. Backpropagation computes how much each weight contributed to the error, working backwards from the output with the chain rule, and gradient descent nudges every weight a little. Repeat thousands of times and the network learns.",
      minutes: 26,
      blocks: [
        { t: "diagram", text: "input        hidden (2 neurons)      output\n x₁ ──┬──▶ ( h₁ ) ──┐\n      ╳               ├──▶ ( o ) ──▶ prediction\n x₂ ──┴──▶ ( h₂ ) ──┘\n\nforward:  compute h₁, h₂, then o\nbackward: error at o → blame shared back to h₁, h₂ → update all weights" },
        py("A 2-2-1 network learns XOR", src`
import math
import random

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def neuron(weights, inputs):                 # last weight is the bias (input fixed at 1)
    return sigmoid(sum(w * x for w, x in zip(weights, inputs + [1])))

def feed_forward(network, x):
    hidden_layer, output_layer = network
    hidden = [neuron(w, x) for w in hidden_layer]
    output = neuron(output_layer[0], hidden)
    return hidden, output

def train_step(network, x, target, lr):
    hidden_layer, output_layer = network
    hidden, output = feed_forward(network, x)

    # 1) output error signal: (output - target) × slope of the sigmoid
    delta_out = (output - target) * output * (1 - output)
    # 2) each hidden neuron's share of the blame (chain rule)
    deltas_hidden = [delta_out * output_layer[0][i] * h * (1 - h) for i, h in enumerate(hidden)]
    # 3) gradient descent on every weight
    output_layer[0] = [w - lr * delta_out * v for w, v in zip(output_layer[0], hidden + [1])]
    for i, d in enumerate(deltas_hidden):
        hidden_layer[i] = [w - lr * d * v for w, v in zip(hidden_layer[i], x + [1])]

random.seed(3)
network = [[[random.uniform(-1, 1) for _ in range(3)] for _ in range(2)],   # hidden: 2 neurons × (2 inputs + bias)
           [[random.uniform(-1, 1) for _ in range(3)]]]                     # output: 1 neuron × (2 hidden + bias)
data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

for epoch in range(1, 20_001):
    for x, target in data:
        train_step(network, x, target, lr=0.5)
    if epoch in (1, 1000, 5000, 20_000):
        loss = sum((feed_forward(network, x)[1] - t) ** 2 for x, t in data)
        print(f"epoch {epoch:>6}: squared error {loss:.4f}")

for x, target in data:
    print(x, "→", round(feed_forward(network, x)[1], 3), " (target", target, ")")
`, "epoch      1: squared error 1.0713\nepoch   1000: squared error 0.4816\nepoch   5000: squared error 0.0030\nepoch  20000: squared error 0.0006\n[0, 0] → 0.011  (target 0 )\n[0, 1] → 0.989  (target 1 )\n[1, 0] → 0.989  (target 1 )\n[1, 1] → 0.014  (target 0 )"),
        { t: "table", head: ["Step", "What happens"], rows: [["Forward pass", "Inputs flow through the layers to produce a prediction"], ["Loss", "Compare the prediction with the target (squared error here; cross-entropy for classification)"], ["Backward pass", "The chain rule spreads the error back: each weight learns how much it contributed"], ["Update", "Every weight moves a small step against its gradient"], ["Repeat", "Over many epochs the error shrinks"]] },
        { t: "p", text: "Deep learning is this same loop with many more layers and neurons, ReLU activations, mini-batches, and frameworks (**PyTorch**, **TensorFlow/Keras**) that compute the gradients automatically on GPUs. Image recognition, translation and ChatGPT-style models are all trained by backpropagation." },
        { t: "analogy", text: "Backpropagation is how a cricket team reviews a lost match: the final score (error) is traced back to each player's contribution, and each player adjusts a little in proportion to how much they contributed to the loss. After many matches, the team works well together." },
        { t: "trap", text: "Networks can get stuck: with an unlucky random start (or too few hidden neurons), XOR training sometimes stalls at a poor solution. Change the seed, add neurons or adjust the learning rate. Real networks also need scaled inputs and careful initialisation." },
        { t: "trick", text: "**Forward → loss → backward (chain rule) → update. Repeat.**" },
        { t: "exam", items: ["Explain backpropagation in simple terms.", "Why do neural networks need non-linear activation functions?", "Sigmoid vs ReLU?", "What are epochs, batches and the learning rate?", "Why did deep learning take off? (Data, GPUs, better activations and frameworks.)"] },
        { t: "recap", items: ["Layers of neurons: input → hidden → output", "Forward pass makes a prediction", "Backpropagation uses the chain rule to get every weight's gradient", "Gradient descent updates all weights", "Deep learning frameworks automate the gradients"] },
      ],
      quiz: [
        { q: "Backpropagation computes…", options: ["The gradient of the error with respect to every weight", "The forward prediction only", "The data split", "The number of layers"], answer: 0, explain: "Then gradient descent uses them." },
        { q: "Without non-linear activations, a deep network behaves like…", options: ["One linear model", "A decision tree", "k-NN", "A perfect classifier"], answer: 0, explain: "Stacked linear layers are still linear." },
        { q: "The sigmoid's slope at output o is…", options: ["o × (1 − o)", "1", "o²", "1 / o"], answer: 0, explain: "Used in the delta terms." },
        { q: "Which libraries automate backpropagation?", options: ["PyTorch and TensorFlow", "csv and json", "re and random", "sqlite3"], answer: 0, explain: "Automatic differentiation." },
      ],
    },
  ],
};
