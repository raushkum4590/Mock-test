import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science from scratch, modules 1–3: what data science is, Python and charts for data, linear algebra. */
export const DS01_INTRO: LearnModule = {
  id: "intro",
  title: "What is data science?",
  titleHi: "डेटा साइंस क्या है?",
  blurb: "What data scientists actually do, the data science workflow, and your first real analysis: finding key people, suggesting friends and spotting salary patterns in a small social network, using nothing but plain Python.",
  lessons: [
    {
      id: "what-is-data-science",
      title: "What data scientists do",
      oneLine: "Data science is turning raw data into useful answers and decisions, using programming, statistics and knowledge of the business. A data scientist asks a good question, gets and cleans data, explores it, builds models, and explains the result so people can act on it.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: The three skills" },
        { t: "diagram", text: "          Programming\n          (Python, SQL)\n              ╱ ╲\n             ╱   ╲\n            ╱ DATA ╲\n           ╱SCIENCE ╲\n          ╱──────────╲\n   Maths &            Domain\n   statistics         knowledge\n                      (business, health, cricket…)" },
        { t: "p", text: "You don't need to be a genius in all three. You need **enough** programming to handle data, **enough** statistics to avoid fooling yourself, and **curiosity** about the problem you're solving." },
        { t: "h", text: "Step 2: The workflow" },
        { t: "table", head: ["Step", "Question", "Example: a food delivery app"], rows: [
          ["1. Ask", "What decision will this help?", "Why do customers stop ordering?"],
          ["2. Get data", "Where is the data?", "Orders database, app events, reviews"],
          ["3. Clean", "Is it correct and complete?", "Remove test orders, fix city names"],
          ["4. Explore", "What patterns appear?", "Late deliveries are common before customers leave"],
          ["5. Model", "Can we predict or explain it?", "Predict who is likely to leave next month"],
          ["6. Communicate", "What should we do?", "Give a coupon after any late delivery"],
        ] },
        { t: "h", text: "Step 3: Jobs in data" },
        { t: "table", head: ["Role", "Focus", "Main tools"], rows: [
          ["Data analyst", "Reports, dashboards, answering business questions", "SQL, Excel, Power BI/Tableau, Python"],
          ["Data scientist", "Experiments, statistics, predictive models", "Python, SQL, statistics, scikit-learn"],
          ["ML engineer", "Putting models into real products at scale", "Python, cloud, MLOps, deep learning"],
          ["Data engineer", "Pipelines that collect, clean and store data", "SQL, Python, Spark, Airflow, cloud"],
        ] },
        { t: "h", text: "Step 4: Why \"from scratch\"mean: 35.17  median: 30.0  mode: [30]\nrange: 83  sd: 23.18\n10th / 90th percentile: 15 60\nIQR: 23" },
        { t: "p", text: "In this course you'll build every tool yourself in plain Python: averages, correlation, gradient descent, k-nearest neighbours, naive Bayes, regression, decision trees, neural networks, k-means, PageRank, recommenders and more. Libraries like NumPy, pandas and scikit-learn do this faster, but building it once means you **understand** what the library is doing, which is exactly what interviews test. (The Statistics for Data Science course shows the library way.)" },
        py("Your first data analysis", src`
orders = [
    {"customer": "Asha", "city": "Patna", "amount": 450, "late": False},
    {"customer": "Ravi", "city": "Pune", "amount": 820, "late": True},
    {"customer": "Zoya", "city": "Patna", "amount": 300, "late": False},
    {"customer": "Imran", "city": "Delhi", "amount": 640, "late": True},
    {"customer": "Neha", "city": "Pune", "amount": 510, "late": False},
]

total = sum(o["amount"] for o in orders)
late = [o for o in orders if o["late"]]
print("Orders:", len(orders))
print("Average order: ₹", total / len(orders))
print("Late deliveries:", len(late), f"({len(late) / len(orders):.0%})")
print("Late orders came from:", sorted({o["city"] for o in late}))
`, "Orders: 5\nAverage order: ₹ 544.0\nLate deliveries: 2 (40%)\nLate orders came from: ['Delhi', 'Pune']"),
        { t: "analogy", text: "A data scientist is like a detective: the data is the evidence, statistics is the forensic lab that says which clues are reliable, programming is the notebook and tools, and the final report must convince the jury (managers) to act." },
        { t: "trap", text: "The most common failure isn't a bad algorithm: it's answering the wrong question, or trusting dirty data. Spend time on steps 1 and 3. A simple, correct analysis that leads to a decision beats a fancy model nobody uses." },
        { t: "trick", text: "**Ask → get → clean → explore → model → communicate.**" },
        { t: "exam", items: ["What is data science?", "Data analyst vs data scientist vs data engineer?", "Describe the steps of a data science project.", "Why is data cleaning important?"] },
        { t: "recap", items: ["Data science = programming + statistics + domain knowledge", "Workflow: ask, get, clean, explore, model, communicate", "Roles: analyst, scientist, ML engineer, data engineer", "This course builds every method from scratch in plain Python"] },
      ],
      quiz: [
        { q: "Which step usually takes the most time in real projects?", options: ["Getting and cleaning data", "Choosing the algorithm", "Writing the report title", "Buying servers"], answer: 0, explain: "Often 60–80% of the work." },
        { q: "Who mainly builds data pipelines?", options: ["Data engineer", "Data analyst", "UX designer", "Accountant"], answer: 0, explain: "Analysts and scientists use the data they prepare." },
        { q: "The first step of a project is to…", options: ["Ask a clear question", "Train a neural network", "Buy a dataset", "Make charts"], answer: 0, explain: "Everything else depends on it." },
        { q: "Why build algorithms from scratch when libraries exist?", options: ["To understand what the libraries do", "Libraries are wrong", "It's faster", "Libraries are banned in jobs"], answer: 0, explain: "In real work you'll use the libraries." },
      ],
    },
    {
      id: "first-analysis",
      title: "Your first project: analysing a small social network",
      oneLine: "Using only lists, dictionaries and Counter, we analyse a study app's network: who is most connected, which friends to suggest (friends of friends), who shares interests, and how salary relates to experience. Real data science often starts exactly like this.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Who are the key connectors?" },
        { t: "diagram", text: "Asha(0)─Ravi(1)          Kabir(5)─Meera(6)\n   ╲      │  ╲            │   ╲       │\n   Zoya(2)─Imran(3)─Neha(4)  Arjun(7)─Sara(8)─Dev(9)" },
        py("Friendship counts", src`
from collections import defaultdict

names = ["Asha", "Ravi", "Zoya", "Imran", "Neha", "Kabir", "Meera", "Arjun", "Sara", "Dev"]
friendships = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 3), (3, 4),
               (4, 5), (5, 6), (5, 7), (6, 8), (7, 8), (8, 9)]

friends = defaultdict(list)                  # user id → list of friend ids
for a, b in friendships:
    friends[a].append(b)                     # friendship goes both ways
    friends[b].append(a)

total = sum(len(friends[u]) for u in range(len(names)))
print("Average friends per user:", total / len(names))

by_degree = sorted(range(len(names)), key=lambda u: len(friends[u]), reverse=True)
print("Most connected:", [(names[u], len(friends[u])) for u in by_degree[:5]])
`, "Average friends per user: 2.4\nMost connected: [('Ravi', 3), ('Zoya', 3), ('Imran', 3), ('Kabir', 3), ('Sara', 3)]"),
        { t: "p", text: "Counting connections (the **degree**) is the simplest measure of importance in a network. Later, in Network analysis, you'll see smarter measures: who sits on the paths between others (betweenness), and whose friends are themselves important (eigenvector centrality and PageRank)." },
        { t: "h", text: "Step 2: \"People you may know\"" },
        py("Friends of friends", src`
from collections import Counter, defaultdict

names = ["Asha", "Ravi", "Zoya", "Imran", "Neha", "Kabir", "Meera", "Arjun", "Sara", "Dev"]
friendships = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 3), (3, 4),
               (4, 5), (5, 6), (5, 7), (6, 8), (7, 8), (8, 9)]
friends = defaultdict(list)
for a, b in friendships:
    friends[a].append(b)
    friends[b].append(a)

def suggestions(user):
    counts = Counter(
        fof
        for friend in friends[user]
        for fof in friends[friend]                       # a friend of my friend…
        if fof != user and fof not in friends[user]      # …who isn't me or already my friend
    )
    return [(names[u], mutual) for u, mutual in counts.most_common()]

print("Suggestions for Asha:", suggestions(0))
print("Suggestions for Meera:", suggestions(6))
`, "Suggestions for Asha: [('Imran', 2)]\nSuggestions for Meera: [('Arjun', 2), ('Neha', 1), ('Dev', 1)]"),
        { t: "h", text: "Step 3: Shared interests" },
        py("Who shares my interests?", src`
from collections import Counter, defaultdict

names = ["Asha", "Ravi", "Zoya", "Imran", "Neha", "Kabir", "Meera", "Arjun", "Sara", "Dev"]
interests = [(0, "python"), (0, "statistics"), (0, "ml"), (1, "python"), (1, "sql"),
             (2, "statistics"), (2, "ml"), (2, "r"), (3, "sql"), (3, "excel"),
             (4, "python"), (4, "ml"), (5, "deep learning"), (5, "ml"), (6, "excel"),
             (7, "python"), (7, "statistics"), (8, "r"), (9, "sql")]

users_by_interest = defaultdict(list)          # an "index" in both directions
interests_by_user = defaultdict(list)
for user, topic in interests:
    users_by_interest[topic].append(user)
    interests_by_user[user].append(topic)

def most_common_interests_with(user):
    return Counter(other
                   for topic in interests_by_user[user]
                   for other in users_by_interest[topic]
                   if other != user)

print({names[u]: n for u, n in most_common_interests_with(0).most_common()})
print("Most popular topics:", Counter(t for _, t in interests).most_common(3))
`, "{'Neha': 2, 'Arjun': 2, 'Zoya': 2, 'Ravi': 1, 'Kabir': 1}\nMost popular topics: [('python', 4), ('ml', 4), ('statistics', 3)]"),
        { t: "h", text: "Step 4: Salary and experience" },
        py("Average salary by experience bucket", src`
from collections import defaultdict

salaries = [(4.5, 0.5), (5.2, 1.5), (6.0, 1.8), (7.8, 3.0), (8.5, 4.2),      # (₹ lakh/year, years)
            (9.0, 2.5), (12.5, 6.0), (14.0, 8.5), (11.0, 5.5), (16.0, 10.0)]

def bucket(years):
    if years < 2:
        return "under 2 years"
    elif years <= 5:
        return "2 to 5 years"
    return "over 5 years"

by_bucket = defaultdict(list)
for salary, years in salaries:
    by_bucket[bucket(years)].append(salary)

for name, values in by_bucket.items():
    print(f"{name:<14} average ₹{sum(values) / len(values):.2f} lakh  ({len(values)} people)")
`, "under 2 years  average ₹5.23 lakh  (3 people)\n2 to 5 years   average ₹8.43 lakh  (3 people)\nover 5 years   average ₹13.38 lakh  (4 people)"),
        { t: "analogy", text: "Friend suggestions work like a school: if Asha's two best friends both know Imran, Asha probably will soon too. Counting mutual friends is the simplest recommender system, and real apps started with almost exactly this." },
        { t: "trap", text: "With 10 users everything looks like a pattern. Real conclusions need more data and the statistics from later modules (is the difference bigger than chance?). Also, bucketing loses information: in the Regression module you'll fit a line through all the points instead." },
        { t: "trick", text: "**defaultdict(list) builds indexes; Counter counts; sorted(key=…) ranks.**" },
        { t: "exam", items: ["How would you recommend friends in a social network?", "What is the degree of a node?", "How would you find users with similar interests?", "How would you analyse the relationship between salary and experience?"] },
        { t: "recap", items: ["Represent a network as a dict of friend lists", "Degree = number of connections", "Friends-of-friends + Counter = simple recommendations", "Two-way indexes (topic → users, user → topics)", "Group values into buckets to compare averages"] },
      ],
      quiz: [
        { q: "In a network, a user's degree is…", options: ["The number of connections they have", "Their age", "Their rank in a sorted list", "The number of posts"], answer: 0, explain: "The simplest importance measure." },
        { q: "Why exclude existing friends from suggestions?", options: ["They're already connected", "They have no friends", "Counter requires it", "To save memory"], answer: 0, explain: "Suggest only new people." },
        { q: "Counter([1, 1, 2]).most_common(1) is…", options: ["[(1, 2)]", "[(2, 1)]", "[1]", "{1: 2}"], answer: 0, explain: "Item 1 appears twice." },
        { q: "defaultdict(list) is useful because…", options: ["Missing keys automatically start as empty lists", "It sorts keys", "It's faster than lists", "It removes duplicates"], answer: 0, explain: "No KeyError when appending." },
      ],
    },
  ],
};

export const DS02_PYTHON_VIZ: LearnModule = {
  id: "python-for-ds",
  title: "Python and charts for data",
  titleHi: "डेटा के लिए पाइथन और चार्ट",
  blurb: "The Python tools data scientists use every day (Counter, defaultdict, comprehensions, sorting, zip, generators, random, regular expressions), then how to visualise data with matplotlib and how to choose the right chart.",
  lessons: [
    {
      id: "python-toolkit",
      title: "The data scientist's Python toolkit",
      oneLine: "A handful of Python features do most of the work in data code: comprehensions to transform data, Counter and defaultdict to count and group, sorted with key to rank, zip to pair columns, generators to stream large data, random for simulations and re for messy text.",
      minutes: 20,
      blocks: [
        { t: "note", kind: "info", title: "New to Python?", text: "Take the **Python course** first (Modules 1–8). This lesson is a fast refresher focused on what data work needs." },
        { t: "h", text: "Step 1: Transform, count, group, rank" },
        py("Comprehensions, Counter, defaultdict, sorted", src`
from collections import Counter, defaultdict

marks = {"Asha": 88, "Ravi": 72, "Zoya": 95, "Imran": 64, "Neha": 81}

passed = [name for name, m in marks.items() if m >= 70]           # filter
curved = {name: min(100, m + 5) for name, m in marks.items()}     # transform
print(passed)
print(curved)

ranking = sorted(marks.items(), key=lambda kv: kv[1], reverse=True)
print("Top 3:", ranking[:3])

grades = Counter("A" if m >= 85 else "B" if m >= 70 else "C" for m in marks.values())
print(grades)

by_grade = defaultdict(list)
for name, m in marks.items():
    by_grade["A" if m >= 85 else "B" if m >= 70 else "C"].append(name)
print(dict(by_grade))
`, "['Asha', 'Ravi', 'Zoya', 'Neha']\n{'Asha': 93, 'Ravi': 77, 'Zoya': 100, 'Imran': 69, 'Neha': 86}\nTop 3: [('Zoya', 95), ('Asha', 88), ('Neha', 81)]\nCounter({'A': 2, 'B': 2, 'C': 1})\n{'A': ['Asha', 'Zoya'], 'B': ['Ravi', 'Neha'], 'C': ['Imran']}"),
        { t: "h", text: "Step 2: zip, unpacking and generators" },
        py("Columns, rows and lazy data", src`
names = ["Asha", "Ravi", "Zoya"]
ages = [21, 22, 20]
rows = list(zip(names, ages))              # columns → rows
print(rows)
cols = list(zip(*rows))                    # rows → columns again (unzip)
print(cols)

def read_big_log():                        # a generator: yields one line at a time
    for i in range(1, 1_000_001):
        yield f"request {i} status {'500' if i % 1000 == 0 else '200'}"

errors = sum(1 for line in read_big_log() if line.endswith("500"))   # never builds a big list
print("Errors in 1 million lines:", errors)
`, "[('Asha', 21), ('Ravi', 22), ('Zoya', 20)]\n[('Asha', 'Ravi', 'Zoya'), (21, 22, 20)]\nErrors in 1 million lines: 1000"),
        { t: "h", text: "Step 3: Randomness you can repeat" },
        py("random with a seed", src`
import random

random.seed(10)                                   # same seed → same "random" numbers
print([random.randint(1, 6) for _ in range(5)])   # dice rolls
print(random.choice(["heads", "tails"]))
cards = list(range(1, 11))
random.shuffle(cards)
print(cards)
print(random.sample(range(100), 3))               # 3 different numbers
print(round(random.random(), 4))                  # a float in [0, 1)
`, "[5, 1, 4, 4, 5]\nheads\n[10, 5, 6, 1, 2, 3, 7, 9, 8, 4]\n[41, 9, 31]\n0.9524", "Simulations, train/test splits and random initial weights all need randomness. Setting a seed makes your results reproducible, so others (and you, next week) get the same numbers."),
        { t: "h", text: "Step 4: Regular expressions for messy text" },
        py("Extract emails, phones and amounts", src`
import re

text = "Contact asha.k@example.com or 98765-43210. Refund ₹1,499.00 to ravi@test.in by 15/11/2026."
print(re.findall(r"[\w.]+@[\w.]+\.\w+", text))                 # emails
print(re.findall(r"\b\d{5}-\d{5}\b", text))                    # 10-digit phone with a dash
print(re.findall(r"₹([\d,]+\.\d{2})", text))                   # amounts after ₹
print(re.sub(r"\d", "#", "OTP 482913"))                         # mask digits
print(re.split(r"[,;]\s*", "python, sql;excel,  statistics"))   # split on , or ;
`, "['asha.k@example.com', 'ravi@test.in']\n['98765-43210']\n['1,499.00']\nOTP ######\n['python', 'sql', 'excel', 'statistics']"),
        { t: "table", head: ["Pattern", "Matches"], rows: [["`\\d`", "A digit"], ["`\\w`", "A letter, digit or _"], ["`\\s`", "A space, tab or new line"], ["`+` / `*` / `?`", "1 or more / 0 or more / optional"], ["`{5}`", "Exactly 5 times"], ["`[abc]`", "Any one of a, b, c"], ["`( )`", "Capture this part"], ["`\\b`", "A word boundary"]] },
        { t: "analogy", text: "These tools are a chef's knife set: a comprehension is the knife that chops (transforms), Counter is the measuring scale, defaultdict is the set of labelled bowls, sorted is the plating, and regex is the peeler for awkward vegetables (messy text)." },
        { t: "trap", text: "Write regexes as raw strings (`r\"\\d+\"`), otherwise Python treats backslashes as escape characters. Regex is powerful but easy to get wrong on real data: test it on several examples, and prefer a proper parser for HTML, JSON or CSV." },
        { t: "trick", text: "**Transform: comprehension. Count: Counter. Group: defaultdict(list). Rank: sorted(key=). Pair: zip.**" },
        { t: "exam", items: ["What is a list comprehension? A generator?", "How do you count frequencies in Python?", "How do you sort a dictionary by value?", "Why set a random seed?", "Write a regex to extract email addresses."] },
        { t: "recap", items: ["Comprehensions filter and transform", "Counter counts; defaultdict groups", "sorted(items, key=…, reverse=True) ranks", "zip pairs columns; zip(*rows) unzips", "Generators stream big data; seeds make randomness repeatable; re handles messy text"] },
      ],
      quiz: [
        { q: "list(zip(*[(1, \"a\"), (2, \"b\")])) is…", options: ["[(1, 2), ('a', 'b')]", "[(1, 'a'), (2, 'b')]", "[1, 2, 'a', 'b']", "Error"], answer: 0, explain: "Unzipping rows into columns." },
        { q: "Why use a generator to read a 50 GB log?", options: ["It processes one line at a time, using little memory", "It's always faster", "It sorts the file", "Lists can't hold strings"], answer: 0, explain: "Lazy evaluation." },
        { q: "re.findall(r\"\\d+\", \"a12b345\") gives…", options: ["['12', '345']", "[12, 345]", "['1', '2', '3', '4', '5']", "'12345'"], answer: 0, explain: "Strings of 1 or more digits." },
        { q: "random.seed(1) is used to…", options: ["Make results reproducible", "Make numbers more random", "Speed up code", "Pick a random seed each run"], answer: 0, explain: "Same seed, same sequence." },
      ],
    },
    {
      id: "visualizing-data",
      title: "Visualising data",
      oneLine: "Charts let you see patterns no table shows. Use bar charts to compare categories, line charts for trends over time, histograms for distributions and scatter plots for relationships. matplotlib draws them in Python; and an honest chart starts its bars at zero.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Pick the right chart" },
        { t: "table", head: ["Question", "Chart", "Example"], rows: [
          ["Compare categories", "Bar chart", "Orders per city"],
          ["Change over time", "Line chart", "Daily active users this month"],
          ["Distribution of one number", "Histogram (or boxplot)", "Delivery times"],
          ["Relationship between two numbers", "Scatter plot", "Hours studied vs marks"],
          ["Parts of a whole (few parts)", "Stacked bar (pie only for 2–3 slices)", "Payment mode share"],
        ] },
        { t: "h", text: "Step 2: matplotlib" },
        py("Bar, line and scatter charts with matplotlib", src`
import matplotlib.pyplot as plt          # pip install matplotlib

cities = ["Patna", "Pune", "Delhi", "Mumbai"]
orders = [120, 340, 410, 380]
days = list(range(1, 8))
users = [500, 520, 560, 540, 610, 700, 690]
hours = [1, 2, 3, 4, 5, 6]
marks = [35, 45, 50, 62, 70, 80]

fig, axes = plt.subplots(1, 3, figsize=(14, 4))
axes[0].bar(cities, orders, color="teal")
axes[0].set_title("Orders per city")
axes[1].plot(days, users, marker="o")
axes[1].set_title("Daily active users")
axes[1].set_xlabel("Day")
axes[2].scatter(hours, marks)
axes[2].set_title("Study hours vs marks")
axes[2].set_xlabel("Hours")
axes[2].set_ylabel("Marks")
plt.tight_layout()
plt.savefig("charts.png")                # or plt.show() in a notebook
`, undefined, "Run this in Jupyter, Google Colab or VS Code to see the three charts. Every chart needs a title and axis labels."),
        { t: "h", text: "Step 3: Charts in plain text" },
        py("Text bar chart and histogram", src`
from collections import Counter

cities = {"Patna": 120, "Pune": 340, "Delhi": 410, "Mumbai": 380}
biggest = max(cities.values())
for city, n in sorted(cities.items(), key=lambda kv: -kv[1]):
    print(f"{city:<7}{'█' * round(30 * n / biggest)} {n}")      # bars start at zero

print()
times = [12, 15, 14, 10, 13, 16, 22, 11, 14, 18, 13, 12, 17, 15, 14, 25, 19, 13]
buckets = Counter(t // 5 * 5 for t in times)                    # 10–14, 15–19, …
for start in sorted(buckets):
    print(f"{start:>2}-{start + 4:<2} min  {'*' * buckets[start]}")
`, "Delhi  ██████████████████████████████ 410\nMumbai ████████████████████████████ 380\nPune   █████████████████████████ 340\nPatna  █████████ 120\n\n10-14 min  **********\n15-19 min  ******\n20-24 min  *\n25-29 min  *"),
        { t: "h", text: "Step 4: Honest charts" },
        { t: "diagram", text: "Misleading (axis starts at 95):        Honest (axis starts at 0):\n  A ████████████████████ 99           A ███████████████████ 99\n  B █████ 96                          B ██████████████████  96\n  \"B is 4× worse!\"                    \"Nearly the same\"" },
        { t: "points", items: ["**Bar charts start at zero.** Cutting the axis exaggerates small differences.", "**Label everything:** title, axis labels with units, data source.", "**Don't use 3-D, heavy colour or pie charts with many slices:** they make comparisons harder.", "**Show the data size:** 80% of 5 people isn't 80% of 5,000."] },
        { t: "analogy", text: "A table is a list of ingredients; a chart is the photo of the finished dish. People decide in seconds from the photo, so it must be honest: no camera tricks (cut axes) that make a small dish look huge." },
        { t: "trap", text: "Line charts imply a connection between points, so use them for time or ordered data, not for unrelated categories. And a correlation in a scatter plot still isn't causation (see the Statistics module)." },
        { t: "trick", text: "**Compare → bar. Time → line. Distribution → histogram. Relationship → scatter. Bars start at 0.**" },
        { t: "exam", items: ["Which chart would you use to show sales over 12 months? Compare regions? Show the distribution of order values?", "How can charts mislead?", "Bar chart vs histogram?", "What makes a good data visualisation?"] },
        { t: "recap", items: ["Choose the chart from the question", "matplotlib: plt.bar, plt.plot, plt.scatter, plt.hist", "Always title and label axes", "Bar charts start at zero", "Avoid 3-D and crowded pie charts"] },
      ],
      quiz: [
        { q: "Best chart for website visits over 30 days?", options: ["Line chart", "Pie chart", "Scatter plot", "Bar chart of categories"], answer: 0, explain: "Trends over time." },
        { q: "Best chart for the relationship between price and sales?", options: ["Scatter plot", "Pie chart", "Histogram", "Line chart over time"], answer: 0, explain: "Two numeric variables." },
        { q: "A bar chart's y-axis starting at 95 instead of 0…", options: ["Exaggerates differences", "Is always better", "Is required", "Hides outliers"], answer: 0, explain: "Bars should start at zero." },
        { q: "Which function draws a histogram in matplotlib?", options: ["plt.hist", "plt.bar only", "plt.pie", "plt.hexbin"], answer: 0, explain: "plt.hist(values, bins=…)." },
      ],
    },
  ],
};

export const DS03_LINEAR_ALGEBRA: LearnModule = {
  id: "linear-algebra",
  title: "Linear algebra",
  titleHi: "लीनियर अलजेब्रा",
  blurb: "Vectors and matrices are how data is stored and computed on: a customer is a vector of features, a dataset is a matrix. Build vector maths (dot product, distance) and matrix maths (transpose, multiplication) from scratch.",
  lessons: [
    {
      id: "vectors",
      title: "Vectors: data points as lists of numbers",
      oneLine: "A vector is an ordered list of numbers, like a student's marks [88, 72, 95] or a flat's [area, bedrooms, age]. Adding, scaling, the dot product, length and distance between vectors are the building blocks of almost every machine-learning algorithm.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: What a vector is" },
        { t: "p", text: "Each student's marks in maths, science and English form a vector: Asha = [88, 72, 95]. Thinking of rows of data as vectors lets us ask geometric questions: how **similar** are two students? How **far** apart? What's the **average** student?" },
        { t: "table", head: ["Operation", "Formula", "Example with a = [1, 2], b = [3, 5]"], rows: [
          ["Add", "[a₁ + b₁, a₂ + b₂]", "[4, 7]"],
          ["Scalar multiply", "[c·a₁, c·a₂]", "2·a = [2, 4]"],
          ["Dot product", "a₁b₁ + a₂b₂", "1·3 + 2·5 = 13"],
          ["Magnitude (length)", "√(a·a)", "√(1 + 4) ≈ 2.24"],
          ["Distance", "magnitude of (a − b)", "√(2² + 3²) ≈ 3.61"],
        ] },
        py("Vector toolkit from scratch", src`
import math

def add(v, w):
    return [vi + wi for vi, wi in zip(v, w)]          # element by element

def subtract(v, w):
    return [vi - wi for vi, wi in zip(v, w)]

def scalar_multiply(c, v):
    return [c * vi for vi in v]

def vector_mean(vectors):
    n = len(vectors)
    return [sum(column) / n for column in zip(*vectors)]   # average of each position

def dot(v, w):
    return sum(vi * wi for vi, wi in zip(v, w))

def magnitude(v):
    return math.sqrt(dot(v, v))

def distance(v, w):
    return magnitude(subtract(v, w))

asha, ravi, zoya = [88, 72, 95], [70, 85, 60], [90, 70, 92]   # maths, science, english
print("Asha + Ravi:", add(asha, ravi))
print("Half of Asha:", scalar_multiply(0.5, asha))
print("Average student:", [round(x, 1) for x in vector_mean([asha, ravi, zoya])])
print("dot(Asha, Ravi):", dot(asha, ravi))
print("Distance Asha–Ravi:", round(distance(asha, ravi), 2))
print("Distance Asha–Zoya:", round(distance(asha, zoya), 2))
`, "Asha + Ravi: [158, 157, 155]\nHalf of Asha: [44.0, 36.0, 47.5]\nAverage student: [82.7, 75.7, 82.3]\ndot(Asha, Ravi): 17980\nDistance Asha–Ravi: 41.45\nDistance Asha–Zoya: 4.12"),
        { t: "p", text: "Zoya is much **closer** to Asha than Ravi is: their mark patterns are similar. Distance is the heart of k-nearest neighbours and k-means clustering; the dot product is the heart of linear regression, neural networks and recommendation systems." },
        { t: "h", text: "Step 2: Cosine similarity (direction, not size)" },
        py("Cosine similarity", src`
import math

def dot(v, w):
    return sum(a * b for a, b in zip(v, w))

def cosine_similarity(v, w):
    return dot(v, w) / (math.sqrt(dot(v, v)) * math.sqrt(dot(w, w)))

likes_light = [5, 4, 0, 1]        # ratings for: comedy, romance, horror, action
likes_heavy = [10, 8, 0, 2]       # same taste, just rates everything twice as high
likes_horror = [0, 1, 5, 4]
print("Same taste, different scale:", round(cosine_similarity(likes_light, likes_heavy), 3))
print("Different taste:", round(cosine_similarity(likes_light, likes_horror), 3))
`, "Same taste, different scale: 1.0\nDifferent taste: 0.19"),
        { t: "analogy", text: "A vector is a recipe: [2 cups rice, 1 cup dal, 3 cups water]. Adding vectors combines recipes, scaling doubles a recipe, and the distance between two recipes says how different the dishes will taste. Cosine similarity says whether two recipes have the same **proportions**, even if one makes a bigger pot." },
        { t: "trap", text: "Vector operations need vectors of the **same length** in the **same order**: zip silently stops at the shorter one, so a missing feature gives a wrong answer without an error. Real code should check `len(v) == len(w)`. And distances are dominated by features with large units, so scale features first (see Working with data)." },
        { t: "trick", text: "**Dot = multiply pairs and add. Magnitude = √(v·v). Distance = magnitude of the difference.**" },
        { t: "exam", items: ["What is a vector in machine learning?", "What is the dot product? What does it measure?", "Euclidean distance vs cosine similarity?", "Why must features be scaled before using distances?"] },
        { t: "recap", items: ["A data point = a vector of features", "add / subtract / scalar multiply work element by element", "dot(v, w) = Σ vᵢwᵢ", "distance = √Σ(vᵢ − wᵢ)²", "Cosine similarity compares direction (taste), not size"] },
      ],
      quiz: [
        { q: "dot([1, 2, 3], [4, 5, 6]) is…", options: ["32", "21", "[4, 10, 18]", "15"], answer: 0, explain: "4 + 10 + 18." },
        { q: "Magnitude of [3, 4]?", options: ["5", "7", "25", "12"], answer: 0, explain: "√(9 + 16)." },
        { q: "Cosine similarity of [1, 1] and [5, 5]?", options: ["1", "0", "5", "0.5"], answer: 0, explain: "Same direction." },
        { q: "Which algorithm relies on distances between vectors?", options: ["k-nearest neighbours", "Bubble sort", "Binary search", "Hashing"], answer: 0, explain: "Also k-means." },
      ],
    },
    {
      id: "matrices",
      title: "Matrices: whole datasets as tables of numbers",
      oneLine: "A matrix is a 2-D grid of numbers: rows are data points, columns are features. Transposing swaps rows and columns, and matrix multiplication combines rows of one matrix with columns of another. It's how models apply weights to a whole dataset in one step.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Shape, rows and columns" },
        { t: "diagram", text: "A = [[88, 72, 95],     ← row 0: Asha\n     [70, 85, 60],     ← row 1: Ravi\n     [90, 70, 92]]     ← row 2: Zoya\n       ↑   ↑   ↑\n      maths sci eng     shape = (3 rows, 3 columns)" },
        py("Matrix basics from scratch", src`
def shape(A):
    return len(A), len(A[0]) if A else 0

def get_column(A, j):
    return [row[j] for row in A]

def make_matrix(rows, cols, entry_fn):
    return [[entry_fn(i, j) for j in range(cols)] for i in range(rows)]

def identity(n):
    return make_matrix(n, n, lambda i, j: 1 if i == j else 0)

def transpose(A):
    return [list(col) for col in zip(*A)]          # rows become columns

marks = [[88, 72, 95],
         [70, 85, 60],
         [90, 70, 92],
         [65, 80, 75]]
print("Shape:", shape(marks))
print("Science column:", get_column(marks, 1))
print("Class average per subject:", [sum(c) / len(c) for c in transpose(marks)])
print("Identity:", identity(3))
print("Transpose:", transpose([[1, 2, 3], [4, 5, 6]]))
`, "Shape: (4, 3)\nScience column: [72, 85, 70, 80]\nClass average per subject: [78.25, 76.75, 80.5]\nIdentity: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]\nTranspose: [[1, 4], [2, 5], [3, 6]]"),
        { t: "h", text: "Step 2: Matrix multiplication" },
        { t: "p", text: "To multiply A (n × k) by B (k × m), each result cell (i, j) is the **dot product of row i of A with column j of B**. The inner sizes must match (k), and the result is n × m." },
        { t: "formula", items: [["Rule", "(A·B)ᵢⱼ = dot(row i of A, column j of B)"], ["Example", "[[1, 2], [3, 4]] · [[5, 6], [7, 8]] = [[1·5 + 2·7, 1·6 + 2·8], [3·5 + 4·7, 3·6 + 4·8]] = [[19, 22], [43, 50]]"]] },
        py("Weighted totals with one multiplication", src`
def dot(v, w):
    return sum(a * b for a, b in zip(v, w))

def matmul(A, B):
    cols = list(zip(*B))                                   # columns of B
    return [[dot(row, col) for col in cols] for row in A]

print(matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]]))

marks = [[88, 72, 95],          # each row: maths, science, english
         [70, 85, 60],
         [90, 70, 92]]
weights = [[0.5],               # final score = 50% maths + 30% science + 20% english
           [0.3],
           [0.2]]
for name, (score,) in zip(["Asha", "Ravi", "Zoya"], matmul(marks, weights)):
    print(name, round(score, 1))
`, "[[19, 22], [43, 50]]\nAsha 84.6\nRavi 72.5\nZoya 84.4"),
        { t: "p", text: "That last step is exactly what a linear model does: **predictions = data matrix × weight vector**. A neural network layer is the same multiplication followed by a non-linear function. Libraries like NumPy do it in optimised C code thousands of times faster (`marks @ weights`), but the maths is what you just wrote." },
        { t: "h", text: "Step 3: A network as a matrix" },
        py("Adjacency matrix", src`
friendships = [(0, 1), (0, 2), (1, 2), (2, 3)]
n = 4
adj = [[1 if (i, j) in friendships or (j, i) in friendships else 0 for j in range(n)]
       for i in range(n)]
for row in adj:
    print(row)
print("Friends of user 2:", [j for j, linked in enumerate(adj[2]) if linked])
`, "[0, 1, 1, 0]\n[1, 0, 1, 0]\n[1, 1, 0, 1]\n[0, 0, 1, 0]\nFriends of user 2: [0, 1, 3]"),
        { t: "analogy", text: "A matrix is a spreadsheet of numbers. Matrix multiplication is a cashier's bill at scale: one matrix lists how many of each item every customer bought, the other lists the price of each item, and multiplying gives every customer's total in one go." },
        { t: "trap", text: "Matrix multiplication is **not** commutative: A·B usually isn't B·A, and often only one of them is even possible. Check shapes first: (n × k)·(k × m) works only when the inner sizes match. Pure-Python matrices are slow; use NumPy for real data." },
        { t: "trick", text: "**Cell (i, j) = row i · column j. Inner sizes must match. Data × weights = predictions.**" },
        { t: "exam", items: ["What is a matrix's shape?", "How does matrix multiplication work? When is it defined?", "What is the transpose?", "What is an identity matrix?", "How are matrices used in machine learning? (Datasets, weights, neural network layers.)"] },
        { t: "recap", items: ["Matrix = list of rows; shape = (rows, columns)", "Transpose swaps rows and columns: zip(*A)", "(A·B)ᵢⱼ = row i of A · column j of B", "Inner dimensions must match", "Predictions = data matrix × weights"] },
      ],
      quiz: [
        { q: "A is 3 × 2 and B is 2 × 4. Shape of A·B?", options: ["3 × 4", "2 × 2", "3 × 2", "Not defined"], answer: 0, explain: "Outer sizes: 3 and 4." },
        { q: "Transpose of [[1, 2, 3]] is…", options: ["[[1], [2], [3]]", "[[3, 2, 1]]", "[[1, 2, 3]]", "[1, 2, 3]"], answer: 0, explain: "1 × 3 becomes 3 × 1." },
        { q: "[[1, 0], [0, 1]] is called…", options: ["The identity matrix", "A zero matrix", "A transpose", "A vector"], answer: 0, explain: "Multiplying by it changes nothing." },
        { q: "Is A·B always equal to B·A?", options: ["No", "Yes", "Only for vectors", "Only in Python"], answer: 0, explain: "Order matters." },
      ],
    },
  ],
};
