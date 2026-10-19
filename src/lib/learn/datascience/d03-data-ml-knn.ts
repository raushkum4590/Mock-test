import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science from scratch, modules 7–9: getting and working with data, machine-learning basics, k-NN and naive Bayes. */
export const DS07_DATA: LearnModule = {
  id: "working-with-data",
  title: "Getting and working with data",
  titleHi: "डेटा प्राप्त करना और उस पर काम करना",
  blurb: "Get data from files, CSV, JSON, web pages and APIs; explore it in one, two and many dimensions; clean messy rows; group and transform; rescale features; and reduce dimensions with principal component analysis built from scratch.",
  lessons: [
    {
      id: "getting-data",
      title: "Getting data: files, CSV, JSON, web pages and APIs",
      oneLine: "Data arrives as text files, CSV tables, JSON from APIs, or HTML web pages. Python's standard library reads all of them: open() for files, csv for tables, json for API responses, html.parser for scraping, and urllib (or requests) to download.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Text and CSV files" },
        py("Write, then read a CSV of trades", src`
import csv

rows = [["date", "symbol", "close"],
        ["2026-10-14", "INFY", "1820.5"], ["2026-10-14", "TCS", "4105.0"],
        ["2026-10-15", "INFY", "1835.0"], ["2026-10-15", "TCS", "4090.25"],
        ["2026-10-16", "INFY", "n/a"],    ["2026-10-16", "TCS", "4122.75"]]
with open("prices.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)

with open("prices.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):                    # each row → dict using the header
        print(row["date"], row["symbol"], row["close"])
`, "2026-10-14 INFY 1820.5\n2026-10-14 TCS 4105.0\n2026-10-15 INFY 1835.0\n2026-10-15 TCS 4090.25\n2026-10-16 INFY n/a\n2026-10-16 TCS 4122.75"),
        { t: "h", text: "Step 2: JSON from an API" },
        py("Parsing a JSON response", src`
import json

response_text = """{"user": "asha", "repos": [
    {"name": "ds-notes", "stars": 42, "language": "Python"},
    {"name": "portfolio", "stars": 7, "language": "HTML"},
    {"name": "ml-from-scratch", "stars": 120, "language": "Python"}]}"""

data = json.loads(response_text)                     # JSON text → dicts and lists
python_repos = [r["name"] for r in data["repos"] if r["language"] == "Python"]
print("Python repos:", python_repos)
print("Total stars:", sum(r["stars"] for r in data["repos"]))
`, "Python repos: ['ds-notes', 'ml-from-scratch']\nTotal stars: 169"),
        py("Downloading from a real API", src`
import json
from urllib.request import urlopen

with urlopen("https://api.github.com/users/octocat/repos", timeout=10) as resp:
    repos = json.loads(resp.read().decode("utf-8"))
for repo in repos[:3]:
    print(repo["name"], repo["stargazers_count"])
`, undefined, "Needs internet, so there's no fixed output. Most real code uses the `requests` package: `requests.get(url).json()`."),
        { t: "h", text: "Step 3: Scraping a web page" },
        py("Extract books and prices from HTML", src`
from html.parser import HTMLParser

page = """
<html><body>
  <div class="book"><h3>Python for Data</h3><span class="price">₹499</span></div>
  <div class="book"><h3>Statistics Made Easy</h3><span class="price">₹350</span></div>
  <div class="book"><h3>Deep Learning Basics</h3><span class="price">₹799</span></div>
</body></html>
"""

class BookParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.books, self.field = [], None
    def handle_starttag(self, tag, attrs):
        if tag == "h3":
            self.field = "title"
        elif tag == "span" and ("class", "price") in attrs:
            self.field = "price"
    def handle_data(self, text):
        if self.field == "title":
            self.books.append({"title": text})
        elif self.field == "price":
            self.books[-1]["price"] = int(text.strip("₹"))
        self.field = None

parser = BookParser()
parser.feed(page)
for book in sorted(parser.books, key=lambda b: b["price"]):
    print(f"{book['title']:<22} ₹{book['price']}")
`, "Statistics Made Easy   ₹350\nPython for Data        ₹499\nDeep Learning Basics   ₹799", "Real scrapers usually use `requests` + `BeautifulSoup` (`soup.select(\"div.book h3\")`). Check a site's terms and robots.txt, and prefer an official API when one exists."),
        { t: "table", head: ["Source", "Python tool", "Watch out for"], rows: [["Text / log files", "`open()`, loop over lines", "Encoding (use utf-8)"], ["CSV / Excel exports", "`csv.DictReader` (or pandas)", "Values are strings; commas inside quotes"], ["JSON APIs", "`json.loads`, `requests`", "Rate limits, API keys, pagination"], ["Web pages", "`html.parser`, BeautifulSoup", "Terms of use, changing layouts"], ["Databases", "`sqlite3`, SQLAlchemy", "Write SQL, not loops (see the SQL module)"]] },
        { t: "analogy", text: "Getting data is like shopping for a recipe: some ingredients come neatly packed (CSV, APIs), some need to be picked from a market stall (scraping), and everything needs checking and washing before cooking (cleaning, next lesson)." },
        { t: "trap", text: "CSV values are always **strings** (\"1820.5\" and even \"n/a\"); convert and validate them. Never put API keys in code you share: read them from environment variables. Scraping breaks whenever the website's HTML changes." },
        { t: "trick", text: "**CSV → csv.DictReader. JSON → json.loads. HTML → a parser, never regex. Prefer APIs to scraping.**" },
        { t: "exam", items: ["How do you read a CSV file in Python?", "What is JSON? How do you parse it?", "What is web scraping? What are its risks?", "What is an API? REST?", "How do you keep API keys secret?"] },
        { t: "recap", items: ["open() for text; csv for tables; json for APIs", "html.parser / BeautifulSoup to scrape HTML", "urllib or requests to download", "Everything read from text starts as a string", "APIs beat scraping when available"] },
      ],
      quiz: [
        { q: "csv.DictReader gives each row as…", options: ["A dict keyed by the header", "A tuple of numbers", "A single string", "A list of lists"], answer: 0, explain: "Values are still strings." },
        { q: "json.loads(\"[1, 2]\") returns…", options: ["[1, 2]", "\"[1, 2]\"", "(1, 2)", "Error"], answer: 0, explain: "A Python list." },
        { q: "Best way to get data from a site that offers an API?", options: ["Use the API", "Scrape the HTML", "Copy-paste", "Guess"], answer: 0, explain: "APIs are stable and allowed." },
        { q: "Where should API keys be stored?", options: ["Environment variables / secret settings", "In the code on GitHub", "In the README", "In the CSV"], answer: 0, explain: "Never commit secrets." },
      ],
    },
    {
      id: "exploring-cleaning",
      title: "Exploring, cleaning and manipulating data",
      oneLine: "Before modelling: explore each column (counts, range, histogram), look at pairs (correlations), clean bad rows (parse carefully, skip or fix invalid values), and reshape the data by grouping and computing new columns like daily percentage changes.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Clean while parsing" },
        py("Parse rows safely", src`
from datetime import date

raw = [["2026-10-14", "INFY", "1820.5"], ["2026-10-14", "TCS", "4105.0"],
       ["2026-10-15", "INFY", "1835.0"], ["2026-10-15", "TCS", "4090.25"],
       ["2026-10-16", "INFY", "n/a"],    ["2026-10-16", "TCS", "4122.75"],
       ["2026-13-01", "TCS", "4130.0"],  ["2026-10-17", "INFY", "1848.2"],
       ["2026-10-17", "TCS", "4140.0"]]

def parse(row):
    try:
        return {"date": date.fromisoformat(row[0]), "symbol": row[1], "close": float(row[2])}
    except ValueError:
        return None                                   # bad date or bad number

clean, bad = [], []
for row in raw:
    parsed = parse(row)
    (clean if parsed else bad).append(parsed or row)
print("clean rows:", len(clean), " bad rows:", bad)
`, "clean rows: 7  bad rows: [['2026-10-16', 'INFY', 'n/a'], ['2026-13-01', 'TCS', '4130.0']]"),
        { t: "h", text: "Step 2: Group and transform" },
        py("Per-stock summary and daily % change", src`
from collections import defaultdict
from datetime import date

clean = [
    {"date": date(2026, 10, 14), "symbol": "INFY", "close": 1820.5},
    {"date": date(2026, 10, 14), "symbol": "TCS", "close": 4105.0},
    {"date": date(2026, 10, 15), "symbol": "INFY", "close": 1835.0},
    {"date": date(2026, 10, 15), "symbol": "TCS", "close": 4090.25},
    {"date": date(2026, 10, 16), "symbol": "TCS", "close": 4122.75},
    {"date": date(2026, 10, 17), "symbol": "INFY", "close": 1848.2},
    {"date": date(2026, 10, 17), "symbol": "TCS", "close": 4140.0},
]

by_symbol = defaultdict(list)                       # group rows by stock
for row in clean:
    by_symbol[row["symbol"]].append(row)

for symbol, rows in by_symbol.items():
    rows.sort(key=lambda r: r["date"])              # make sure days are in order
    closes = [r["close"] for r in rows]
    changes = [(today / yesterday - 1) * 100 for yesterday, today in zip(closes, closes[1:])]
    print(f"{symbol}: max close {max(closes)}, daily % changes {[round(c, 2) for c in changes]}")
`, "INFY: max close 1848.2, daily % changes [0.8, 0.72]\nTCS: max close 4140.0, daily % changes [-0.36, 0.79, 0.42]", "zip(closes, closes[1:]) pairs each day with the next: a common trick for computing changes."),
        { t: "h", text: "Step 3: Explore one, two and many dimensions" },
        py("Histogram and correlation matrix", src`
import math
import random
from collections import Counter

random.seed(3)
n = 500
study = [random.gauss(5, 2) for _ in range(n)]                     # hours per week
marks = [40 + 6 * s + random.gauss(0, 8) for s in study]
phone = [10 - 0.8 * s + random.gauss(0, 2) for s in study]        # hours on phone

buckets = Counter(int(m // 10 * 10) for m in marks)               # 1-D: histogram of marks
for start in sorted(buckets):
    print(f"{start:>3}-{start + 9:<3} {'#' * (buckets[start] // 5)}")

def correlation(xs, ys):
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    return cov / math.sqrt(sum((x - mx) ** 2 for x in xs) * sum((y - my) ** 2 for y in ys))

columns = {"study": study, "marks": marks, "phone": phone}        # many-D: correlation matrix
print(" " * 6 + "".join(f"{c:>8}" for c in columns))
for a in columns:
    print(f"{a:<6}" + "".join(f"{correlation(columns[a], columns[b]):>8.2f}" for b in columns))
`, " 20-29\n 30-39  ##\n 40-49  ######\n 50-59  ###############\n 60-69  #############################\n 70-79  #######################\n 80-89  ###############\n 90-99  #####\n100-109 #\n110-119\n         study   marks   phone\nstudy     1.00    0.84   -0.66\nmarks     0.84    1.00   -0.56\nphone    -0.66   -0.56    1.00"),
        { t: "analogy", text: "Cleaning data is like sorting rice before cooking: pick out the stones (invalid rows), check for spoilt grains (impossible values like month 13), and measure before you cook (explore). Skipping it ruins the meal no matter how good the recipe." },
        { t: "trap", text: "Silently dropping bad rows can **bias** the data (what if all the missing prices were crash days?). Count and inspect what you drop, and log it. Also sort by date before computing changes: data files are not guaranteed to be in order." },
        { t: "trick", text: "**Parse with try/except, keep the bad rows for inspection, group with defaultdict, pair consecutive rows with zip(xs, xs[1:]).**" },
        { t: "exam", items: ["How do you handle missing or invalid values?", "What do you check during EDA?", "How would you compute daily returns from closing prices?", "Why might dropping rows bias an analysis?", "What is a correlation matrix used for?"] },
        { t: "recap", items: ["Parse carefully; collect and inspect bad rows", "Group with defaultdict; sort before time-based calculations", "zip(xs, xs[1:]) for consecutive pairs", "Explore: histograms (1-D), scatter/correlation (2-D), matrices (many-D)", "Document every cleaning decision"] },
      ],
      quiz: [
        { q: "float(\"n/a\") raises…", options: ["ValueError", "TypeError", "KeyError", "Nothing"], answer: 0, explain: "Catch it and handle the row." },
        { q: "list(zip([1, 2, 3], [2, 3])) is…", options: ["[(1, 2), (2, 3)]", "[(1, 2), (2, 3), (3, None)]", "[1, 2, 3]", "Error"], answer: 0, explain: "Consecutive pairs." },
        { q: "Close went from 100 to 103. Daily % change?", options: ["3%", "0.03%", "103%", "−3%"], answer: 0, explain: "(103 / 100 − 1) × 100." },
        { q: "Why is silently dropping bad rows risky?", options: ["The dropped rows may not be random, biasing results", "It's slow", "It's illegal", "It changes the column names"], answer: 0, explain: "Always inspect what you drop." },
      ],
    },
    {
      id: "rescaling-pca",
      title: "Rescaling and dimensionality reduction (PCA from scratch)",
      oneLine: "Distances depend on units: height in cm vs metres changes which points look close. Rescaling to z-scores fixes this. PCA finds the direction in which the data varies most; projecting onto the top few directions keeps most of the information in fewer columns.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Units change distances" },
        py("Rescaling to z-scores", src`
import math

customers = {"A": [25, 30000], "B": [55, 30500], "C": [27, 38000]}   # [age in years, income in ₹/month]

def distance(v, w):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(v, w)))

def nearest_to_a(points):
    return min(["B", "C"], key=lambda name: distance(points["A"], points[name]))

print("raw:    A–B", round(distance(customers["A"], customers["B"]), 1),
      " A–C", round(distance(customers["A"], customers["C"]), 1), " nearest to A:", nearest_to_a(customers))

means, sds = [40, 35000], [10, 10000]          # mean and SD of each column across ALL customers
scaled = {k: [(x - m) / s for x, m, s in zip(v, means, sds)] for k, v in customers.items()}
print("scaled:", {k: [round(x, 2) for x in v] for k, v in scaled.items()})
print("scaled: A–B", round(distance(scaled["A"], scaled["B"]), 2),
      " A–C", round(distance(scaled["A"], scaled["C"]), 2), " nearest to A:", nearest_to_a(scaled))
`, "raw:    A–B 500.9  A–C 8000.0  nearest to A: B\nscaled: {'A': [-1.5, -0.5], 'B': [1.5, -0.45], 'C': [-1.3, 0.3]}\nscaled: A–B 3.0  A–C 0.82  nearest to A: C", "Raw, income differences of thousands of rupees swamp an age gap of 30 years, so B (aged 55!) looks most similar to A. Measured in standard deviations, A and C (similar age, similar income) are the closest pair. After rescaling, each column has mean 0 and standard deviation 1, so age and income count equally. Rescale before k-NN, k-means, PCA and gradient descent."),
        { t: "h", text: "Step 2: PCA by power iteration" },
        { t: "p", text: "PCA's first component is the direction of greatest variance. A simple way to find it: start with any direction, multiply it by the **covariance matrix** again and again, normalising each time. It turns towards the direction of greatest variance (**power iteration**)." },
        py("First principal component from scratch", src`
import math
import random

random.seed(1)
data = []
for _ in range(300):
    t = random.gauss(0, 3)                                  # one hidden factor…
    data.append([t + random.gauss(0, 0.5), 0.5 * t + random.gauss(0, 0.5)])   # …drives both columns

means = [sum(c) / len(c) for c in zip(*data)]
centered = [[x - m for x, m in zip(row, means)] for row in data]      # PCA needs mean 0
n = len(centered)
cov = [[sum(r[i] * r[j] for r in centered) / (n - 1) for j in range(2)] for i in range(2)]

direction = [1.0, 0.0]
for _ in range(100):                                       # power iteration
    new = [sum(cov[i][j] * direction[j] for j in range(2)) for i in range(2)]
    length = math.sqrt(sum(x * x for x in new))
    direction = [x / length for x in new]

projections = [sum(a * b for a, b in zip(row, direction)) for row in centered]
var_pc1 = sum(p * p for p in projections) / (n - 1)
total_var = cov[0][0] + cov[1][1]
print("first component:", [round(x, 3) for x in direction])
print("share of variance kept by 1 number per row:", round(var_pc1 / total_var, 3))
`, "first component: [0.897, 0.443]\nshare of variance kept by 1 number per row: 0.982"),
        { t: "p", text: "One number per row (the projection onto the first component) keeps most of the variation in two columns. With 100 columns, keeping the top 10 components often keeps most of the information, making models faster and less prone to overfitting. Libraries do this with `sklearn.decomposition.PCA`." },
        { t: "analogy", text: "Rescaling is converting all prices to the same currency before comparing them. PCA is finding the best camera angle for a 3-D sculpture: from the right angle, a flat photo shows almost everything important." },
        { t: "trap", text: "Always **centre** (and usually scale) the data before PCA, or the first component just points at the mean or at the largest-unit column. Components are combinations of columns, so they're harder to explain to business users." },
        { t: "trick", text: "**Scale → centre → covariance → power iteration (or a library) → project.**" },
        { t: "exam", items: ["Why rescale features? Standardisation vs min-max scaling?", "Which algorithms need scaling?", "What does PCA do?", "What is explained variance?", "Why centre data before PCA?"] },
        { t: "recap", items: ["Units change distances; z-scores fix it", "z = (x − mean) / sd per column", "PCA: directions of greatest variance", "Power iteration on the covariance matrix finds the first component", "Project onto top components to reduce dimensions"] },
      ],
      quiz: [
        { q: "After standardising, each column has…", options: ["Mean 0 and SD 1", "Range 0 to 1", "Mean 1", "No negative values"], answer: 0, explain: "Min-max scaling gives 0 to 1." },
        { q: "Which algorithm does NOT need scaling?", options: ["Decision trees", "k-NN", "k-means", "PCA"], answer: 0, explain: "Trees split one feature at a time." },
        { q: "PCA's first component is the direction of…", options: ["Greatest variance", "Smallest variance", "The target", "The mean"], answer: 0, explain: "Each next one captures the most remaining variance." },
        { q: "Before PCA, the data should be…", options: ["Centred (and usually scaled)", "Sorted", "Rounded", "Shuffled only"], answer: 0, explain: "Otherwise the result is distorted." },
      ],
    },
  ],
};

export const DS08_ML_BASICS: LearnModule = {
  id: "ml-basics",
  title: "Machine learning basics",
  titleHi: "मशीन लर्निंग की बुनियाद",
  blurb: "What a model is, supervised vs unsupervised learning, splitting data into train and test sets, overfitting and underfitting, measuring correctness (accuracy, precision, recall, F1), the bias-variance trade-off and choosing features.",
  lessons: [
    {
      id: "models-overfitting",
      title: "Models, train/test splits and overfitting",
      oneLine: "A model is a rule learned from data that makes predictions. To know whether it works on NEW data, hold some data back: train on one part, test on the other. A model that memorises its training data (overfitting) looks perfect in training and fails in testing.",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Type", "Learns from", "Examples"], rows: [["Supervised", "Examples with the right answer (labels)", "Spam or not, house price, will a customer leave"], ["Unsupervised", "Data without labels", "Customer segments, topics in documents"], ["Semi-supervised", "A few labels + lots of unlabelled data", "Labelling a few images, learning from the rest"], ["Reinforcement", "Rewards from actions", "Game-playing agents, robots"]] },
        { t: "h", text: "Step 1: Train/test split from scratch" },
        py("split_data", src`
import random

def split_data(rows, test_fraction, seed=0):
    rows = rows[:]                                 # don't shuffle the caller's list
    random.Random(seed).shuffle(rows)
    cut = int(len(rows) * (1 - test_fraction))
    return rows[:cut], rows[cut:]

data = list(range(1000))
train, test = split_data(data, 0.25)
print(len(train), len(test))
print("overlap:", len(set(train) & set(test)))
print("first few test rows:", test[:5])
`, "750 250\noverlap: 0\nfirst few test rows: [821, 367, 770, 204, 791]"),
        { t: "h", text: "Step 2: Overfitting, seen clearly" },
        py("A memoriser vs a simple rule", src`
import random

random.seed(5)
def make_student():
    hours = random.randint(0, 10)
    passed = hours + random.gauss(0, 2) > 5          # more study → more likely to pass (with luck)
    student_id = random.randint(10_000, 99_999)
    return student_id, hours, passed

students = [make_student() for _ in range(400)]
train, test = students[:300], students[300:]

memory = {sid: passed for sid, hours, passed in train}          # memorise every training student
def memoriser(sid, hours):
    return memory.get(sid, False)                                # unknown student → guess "fail"

def simple_rule(sid, hours):
    return hours > 5                                              # one learned threshold

def accuracy(model, rows):
    return sum(model(sid, h) == p for sid, h, p in rows) / len(rows)

for name, model in [("memoriser", memoriser), ("simple rule", simple_rule)]:
    print(f"{name:<12} train {accuracy(model, train):.2f}   test {accuracy(model, test):.2f}")
`, "memoriser    train 1.00   test 0.52\nsimple rule  train 0.88   test 0.84"),
        { t: "p", text: "The memoriser is perfect on students it has seen and no better than guessing on new ones: it learned the IDs, not the pattern. The simple rule learned the real pattern (study hours) and does similarly on both. **Judge models on the test set.**" },
        { t: "table", head: ["", "Training error", "Test error", "Fix"], rows: [["Underfitting", "High", "High", "More features, a more flexible model"], ["Good fit", "Low", "Low (similar)", "Keep it"], ["Overfitting", "Very low", "High", "Simpler model, more data, regularisation"]] },
        { t: "analogy", text: "A student who memorises last year's question paper scores 100% on it and fails the real exam. A student who understands the chapter does well on both. The test set is the real exam the model hasn't seen." },
        { t: "trap", text: "Never use the test set to choose between models or tune settings, then report its score: it stops being \"unseen\". Use a third **validation** set (or cross-validation) for choices, and touch the test set once at the end." },
        { t: "trick", text: "**Train to learn, validate to choose, test once to report.**" },
        { t: "exam", items: ["What is a model?", "Supervised vs unsupervised learning?", "Why split into training and test sets?", "What are overfitting and underfitting? How do you detect them?", "What is a validation set?"] },
        { t: "recap", items: ["Supervised: labelled examples; unsupervised: no labels", "Shuffle and split: train / (validation) / test", "Overfitting: great on train, poor on test", "Underfitting: poor on both", "Report performance on unseen data"] },
      ],
      quiz: [
        { q: "Grouping customers without any labels is…", options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Regression"], answer: 0, explain: "No target is given." },
        { q: "Train accuracy 99%, test 60%. This is…", options: ["Overfitting", "Underfitting", "A good fit", "Data leakage only"], answer: 0, explain: "It memorised the training data." },
        { q: "Why shuffle before splitting?", options: ["So both parts represent the data fairly", "To make it faster", "To remove duplicates", "It's never needed"], answer: 0, explain: "Data files are often sorted." },
        { q: "The validation set is used to…", options: ["Choose models and settings", "Report the final score", "Train the model", "Replace the test set"], answer: 0, explain: "The test set stays untouched." },
      ],
    },
    {
      id: "correctness-features",
      title: "Correctness, bias-variance and features",
      oneLine: "Accuracy hides important details, so count the four outcomes (true/false positives/negatives) and compute precision, recall and F1. Models trade off bias (too simple) against variance (too sensitive to the training data). Good features, extracted and selected carefully, matter more than clever algorithms.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Metrics from scratch" },
        py("Accuracy, precision, recall and F1", src`
def accuracy(tp, fp, fn, tn):
    return (tp + tn) / (tp + fp + fn + tn)

def precision(tp, fp, fn, tn):
    return tp / (tp + fp)                 # of those we flagged, how many were right

def recall(tp, fp, fn, tn):
    return tp / (tp + fn)                 # of the real positives, how many we caught

def f1(tp, fp, fn, tn):
    p, r = precision(tp, fp, fn, tn), recall(tp, fp, fn, tn)
    return 2 * p * r / (p + r)

# A test that predicts diabetes, checked on 10,000 people (100 actually have it)
results = {"always say no": (0, 0, 100, 9900), "screening test": (80, 300, 20, 9600)}
for name, counts in results.items():
    acc = accuracy(*counts)
    rec = recall(*counts)
    prec = precision(*counts) if counts[0] + counts[1] else 0.0
    f = f1(*counts) if counts[0] else 0.0
    print(f"{name:<15} accuracy {acc:.3f}  precision {prec:.3f}  recall {rec:.2f}  F1 {f:.3f}")
`, "always say no   accuracy 0.990  precision 0.000  recall 0.00  F1 0.000\nscreening test  accuracy 0.968  precision 0.211  recall 0.80  F1 0.333"),
        { t: "p", text: "\"Always say no\" is 99% accurate and catches **zero** patients. The screening test is slightly less accurate but catches 80% of patients; most of its alerts are false alarms (low precision), which a follow-up test can sort out." },
        { t: "h", text: "Step 2: Bias and variance" },
        { t: "table", head: ["", "High bias", "High variance"], rows: [["Model", "Too simple (a straight line through a curve)", "Too flexible (a wiggly curve through every point)"], ["Training error", "High", "Very low"], ["Test error", "High", "High"], ["Fix", "More features, more flexible model", "More data, simpler model, regularisation"]] },
        { t: "h", text: "Step 3: Feature extraction and selection" },
        py("Turning raw records into features", src`
from datetime import datetime

raw = {"email_text": "WIN a FREE phone!!! Click now", "sent": "2026-10-18 02:14",
       "sender": "promo@deals.example", "links": 5}

def extract_features(r):
    text = r["email_text"]
    sent = datetime.strptime(r["sent"], "%Y-%m-%d %H:%M")
    return {
        "contains_free": int("free" in text.lower()),            # yes/no feature
        "exclamations": text.count("!"),                         # count feature
        "capital_ratio": round(sum(c.isupper() for c in text) / len(text), 2),
        "sent_at_night": int(sent.hour < 6),                     # derived from a date
        "num_links": r["links"],
        "sender_domain": r["sender"].split("@")[1],              # categorical (needs encoding)
    }

print(extract_features(raw))
`, "{'contains_free': 1, 'exclamations': 3, 'capital_ratio': 0.28, 'sent_at_night': 1, 'num_links': 5, 'sender_domain': 'deals.example'}"),
        { t: "points", items: ["**Extraction:** turn raw data (text, dates, addresses) into useful numbers and categories.", "**Encoding:** categories → one-hot 0/1 columns.", "**Selection:** keep features that help; drop useless or leaky ones (anything not known at prediction time).", "**Domain knowledge** suggests the best features: a fraud analyst knows that night-time transactions on a new device are risky."] },
        { t: "analogy", text: "Bias is a weighing scale that always reads 2 kg too heavy (consistently wrong). Variance is a scale whose reading jumps around each time you step on it (inconsistent). A good model, like a good scale, is both accurate and steady." },
        { t: "trap", text: "**Data leakage** through features: including \"refund_issued\" to predict \"will complain\" gives a brilliant model that's useless, because refunds happen after complaints. Only use features available at the moment you'd make the prediction." },
        { t: "trick", text: "**Count TP/FP/FN/TN, not just accuracy. Simple + good features beats complex + bad features.**" },
        { t: "exam", items: ["Precision vs recall vs F1?", "Why is accuracy misleading for rare classes?", "Explain the bias-variance trade-off.", "What is feature engineering? Give examples.", "What is data leakage? Example."] },
        { t: "recap", items: ["accuracy, precision = TP/(TP+FP), recall = TP/(TP+FN), F1", "Accuracy misleads with rare classes", "Bias = too simple; variance = too sensitive", "Features: extract, encode, select", "Avoid leaky features"] },
      ],
      quiz: [
        { q: "TP 80, FN 20. Recall?", options: ["0.8", "0.2", "0.25", "4"], answer: 0, explain: "80 / (80 + 20)." },
        { q: "TP 80, FP 300. Precision?", options: ["About 0.21", "0.8", "0.27", "3.75"], answer: 0, explain: "80 / 380." },
        { q: "A model that's too simple has…", options: ["High bias", "High variance", "Perfect accuracy", "Leakage"], answer: 0, explain: "It underfits." },
        { q: "Using \"refund_issued\" to predict complaints is…", options: ["Data leakage", "Good feature engineering", "Regularisation", "Scaling"], answer: 0, explain: "It's only known after the event." },
      ],
    },
  ],
};

export const DS09_KNN_NB: LearnModule = {
  id: "knn-naive-bayes",
  title: "k-nearest neighbours and naive Bayes",
  titleHi: "k-निकटतम पड़ोसी और नेव बेज़",
  blurb: "Your first two machine-learning algorithms, built line by line: k-NN predicts from the most similar examples (and suffers the curse of dimensionality), and naive Bayes builds a working spam filter from word counts.",
  lessons: [
    {
      id: "knn",
      title: "k-nearest neighbours from scratch",
      oneLine: "k-NN predicts a new point's label by looking at the k closest labelled points and taking a majority vote. It has no training step, just distances. Choose k by testing, and remember that in many dimensions everything is far from everything (the curse of dimensionality).",
      minutes: 22,
      blocks: [
        py("Favourite language by location", src`
import math
import random
from collections import Counter

random.seed(2)
hubs = {"Python": (28.6, 77.2), "Java": (12.97, 77.59), "JavaScript": (19.07, 72.88)}   # Delhi, Bengaluru, Mumbai
data = []
for lang, (lat, lon) in hubs.items():
    for _ in range(30):
        point = (lat + random.gauss(0, 2.5), lon + random.gauss(0, 2.5))
        label = lang if random.random() < 0.8 else random.choice(list(hubs))   # 20% noise
        data.append((point, label))

def distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

def majority_vote(labels):
    counts = Counter(labels)
    winner, top = counts.most_common(1)[0]
    if sum(1 for c in counts.values() if c == top) == 1:
        return winner
    return majority_vote(labels[:-1])            # tie: drop the farthest neighbour and vote again

def knn_classify(k, labelled, new_point):
    by_distance = sorted(labelled, key=lambda pl: distance(pl[0], new_point))
    return majority_vote([label for _, label in by_distance[:k]])

for k in [1, 3, 5, 7, 15]:                       # leave-one-out: predict each point from all the others
    correct = sum(knn_classify(k, data[:i] + data[i + 1:], p) == label for i, (p, label) in enumerate(data))
    print(f"k={k:>2}: {correct}/{len(data)} correct")

print("A developer in Hyderabad (17.4, 78.5) probably likes:", knn_classify(5, data, (17.4, 78.5)))
`, "k= 1: 67/90 correct\nk= 3: 70/90 correct\nk= 5: 74/90 correct\nk= 7: 77/90 correct\nk=15: 75/90 correct\nA developer in Hyderabad (17.4, 78.5) probably likes: Java"),
        { t: "table", head: ["Step", "What happens"], rows: [["1", "Compute the distance from the new point to every labelled point"], ["2", "Sort by distance and keep the k nearest"], ["3", "Majority vote among their labels (break ties by dropping the farthest)"], ["4", "For regression, average the neighbours' values instead"]] },
        { t: "h", text: "The curse of dimensionality" },
        py("In high dimensions, nearest isn't near", src`
import math
import random

def random_point(dim):
    return [random.random() for _ in range(dim)]

def distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

random.seed(0)
for dim in [1, 2, 10, 50, 100]:
    points = [random_point(dim) for _ in range(200)]
    distances = [distance(points[0], p) for p in points[1:]]
    print(f"{dim:>3} dimensions: nearest / average distance = {min(distances) / (sum(distances) / len(distances)):.3f}")
`, "  1 dimensions: nearest / average distance = 0.002\n  2 dimensions: nearest / average distance = 0.040\n 10 dimensions: nearest / average distance = 0.465\n 50 dimensions: nearest / average distance = 0.669\n100 dimensions: nearest / average distance = 0.851"),
        { t: "p", text: "In 1 or 2 dimensions, the nearest point is much closer than average. In 100 dimensions, the nearest point is almost as far as the average one, so \"nearest neighbours\" stop meaning \"similar\". With many features, reduce dimensions (PCA) or select features first." },
        { t: "analogy", text: "To guess which cricket team a new person supports, ask their 5 nearest neighbours in the housing society and go with the majority. Asking only 1 neighbour is risky (they might be the one fan of a different team); asking the whole city ignores local differences." },
        { t: "trap", text: "Scale features before computing distances (see Rescaling), and use an odd k for two classes to reduce ties. k-NN stores all the training data and compares against all of it for every prediction, which is slow for big datasets." },
        { t: "trick", text: "**Distance → sort → top k → vote. Scale first. Tune k by leave-one-out or cross-validation.**" },
        { t: "exam", items: ["Implement k-NN from scratch.", "How do you choose k?", "How do you break ties?", "What is the curse of dimensionality?", "k-NN for regression?"] },
        { t: "recap", items: ["No training: just store the data", "Predict by majority vote of the k nearest points", "Break ties by shrinking k", "Choose k with leave-one-out / cross-validation", "High dimensions make distances meaningless"] },
      ],
      quiz: [
        { q: "k-NN's training step consists of…", options: ["Storing the data", "Gradient descent", "Building a tree", "Computing priors"], answer: 0, explain: "All the work happens at prediction time." },
        { q: "Neighbours' labels: A, B, A, B, C (nearest first) with k = 5. Tie between A and B. What does the tie-break here do?", options: ["Drops C (the farthest) and votes again", "Picks A always", "Picks randomly", "Returns C"], answer: 0, explain: "Then it drops neighbours until there's a winner." },
        { q: "Leave-one-out evaluation predicts each point…", options: ["Using all the other points", "Using itself", "Using the test set only", "Without data"], answer: 0, explain: "A thorough test for small data." },
        { q: "In very high dimensions, the nearest neighbour is…", options: ["Almost as far as an average point", "Always identical", "Always very close", "Undefined"], answer: 0, explain: "The curse of dimensionality." },
      ],
    },
    {
      id: "naive-bayes",
      title: "A spam filter with naive Bayes",
      oneLine: "Naive Bayes estimates, from training emails, how often each word appears in spam and in normal (ham) emails. For a new email it multiplies these word probabilities (adding logs to avoid tiny numbers), applies Bayes' theorem, and outputs P(spam). Smoothing stops unseen words from giving zero probabilities.",
      minutes: 24,
      blocks: [
        { t: "formula", items: [["Bayes", "P(spam | words) ∝ P(spam) × Π P(word | spam)"], ["Smoothing (k = 0.5)", "P(word | spam) = (spam emails containing word + k) / (spam emails + 2k)"], ["Logs", "multiply many small numbers by adding their logs, then convert back with exp"]] },
        py("Naive Bayes from scratch", src`
import math
import re
from collections import defaultdict

def tokenize(text):
    return set(re.findall(r"[a-z0-9']+", text.lower()))      # the set of words in a message

class NaiveBayes:
    def __init__(self, k=0.5):
        self.k = k
        self.spam_counts = defaultdict(int)                    # word → spam emails containing it
        self.ham_counts = defaultdict(int)
        self.n_spam = self.n_ham = 0

    def train(self, messages):
        for text, is_spam in messages:
            if is_spam:
                self.n_spam += 1
            else:
                self.n_ham += 1
            for word in tokenize(text):
                (self.spam_counts if is_spam else self.ham_counts)[word] += 1
        self.vocab = sorted(set(self.spam_counts) | set(self.ham_counts))   # sorted: same order every run

    def word_probs(self, word):
        k = self.k
        return ((self.spam_counts[word] + k) / (self.n_spam + 2 * k),
                (self.ham_counts[word] + k) / (self.n_ham + 2 * k))

    def predict(self, text):
        words = tokenize(text)
        log_spam = math.log(self.n_spam / (self.n_spam + self.n_ham))     # the priors
        log_ham = math.log(self.n_ham / (self.n_spam + self.n_ham))
        for word in self.vocab:                                          # every known word:
            p_s, p_h = self.word_probs(word)
            if word in words:                                            # present → P(word)
                log_spam += math.log(p_s); log_ham += math.log(p_h)
            else:                                                        # absent → 1 - P(word)
                log_spam += math.log(1 - p_s); log_ham += math.log(1 - p_h)
        return 1 / (1 + math.exp(log_ham - log_spam))                   # = P(spam | words)

training = [("win a free phone now", True), ("free cash offer, claim now", True),
            ("limited offer: win cash", True), ("you won a free trip", True),
            ("meeting moved to 3 pm", False), ("please review the project report", False),
            ("lunch tomorrow?", False), ("report due on friday", False),
            ("free tickets for the team lunch", False), ("can we meet now?", False)]
model = NaiveBayes()
model.train(training)

for text in ["claim your free cash", "project meeting tomorrow", "free lunch on friday"]:
    print(f"{text!r:<28} P(spam) = {model.predict(text):.3f}")

spammiest = sorted(model.vocab, key=lambda w: (-model.word_probs(w)[0] / model.word_probs(w)[1], w))
print("most spammy words:", spammiest[:4])
`, "'claim your free cash'       P(spam) = 0.980\n'project meeting tomorrow'   P(spam) = 0.005\n'free lunch on friday'       P(spam) = 0.022\nmost spammy words: ['a', 'cash', 'offer', 'win']"),
        { t: "table", head: ["Piece", "Why it's there"], rows: [["`tokenize` returns a set", "We model \"does the word appear\", not how many times"], ["Smoothing `k`", "A word never seen in ham shouldn't make P(ham) exactly 0"], ["Logs", "Multiplying hundreds of probabilities like 0.01 underflows to 0.0"], ["Absent words", "Not seeing \"meeting\" is also evidence"], ["`1 / (1 + exp(…))`", "Turns the two log scores back into a probability"]] },
        { t: "analogy", text: "Each word is a witness. \"free\" and \"cash\" say \"probably spam\"; \"report\" and \"meeting\" say \"probably work\". Naive Bayes listens to every witness independently (that's the \"naive\" part) and weighs their testimony by how reliable each has been in the past." },
        { t: "trap", text: "With 10 training emails, the probabilities are very rough: notice 'a' among the \"spammiest\" words, just because it happened to appear in two spam emails. Real filters train on many thousands of emails and often drop very common stop-words (a, the, is). The independence assumption makes the probabilities overconfident, so use them to rank or classify, not as exact chances. And keep a separate test set to measure it." },
        { t: "trick", text: "**Count words per class, smooth, add log-probabilities, convert with the sigmoid.**" },
        { t: "exam", items: ["Implement naive Bayes for spam detection.", "Why use log probabilities?", "What is smoothing and why is it needed?", "Why is it called naive?", "How would you evaluate a spam filter? (Precision matters: don't lose real emails.)"] },
        { t: "recap", items: ["Count how many spam/ham messages contain each word", "Smoothed P(word | class) = (count + k) / (n + 2k)", "Sum log-probabilities for present and absent words", "P(spam) = 1 / (1 + e^(log_ham − log_spam))", "Simple, fast and surprisingly effective for text"] },
      ],
      quiz: [
        { q: "Why add log-probabilities instead of multiplying?", options: ["To avoid numbers too small for floats (underflow)", "Logs are more accurate", "It's required by Bayes", "To make it slower"], answer: 0, explain: "Products of many small numbers become 0.0." },
        { q: "With smoothing k = 0.5, 0 of 4 spam emails contain \"report\". P(report | spam)?", options: ["0.1", "0", "0.5", "0.125"], answer: 0, explain: "(0 + 0.5) / (4 + 1)." },
        { q: "The \"naive\" assumption is that…", options: ["Words appear independently given the class", "All emails are spam", "Words have equal weight", "Order of words matters"], answer: 0, explain: "It's false but works well." },
        { q: "For a spam filter, a costly mistake is usually…", options: ["Marking a real email as spam (low precision)", "Letting one spam through", "Using smoothing", "Using logs"], answer: 0, explain: "Losing an important email hurts more." },
      ],
    },
  ],
};
