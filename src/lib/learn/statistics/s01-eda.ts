import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Statistics modules 1–2: exploring data (types, location, variability), then distributions and relationships. */
export const ST01_EDA: LearnModule = {
  id: "eda-basics",
  title: "Exploring data: the basics",
  titleHi: "डेटा की खोज: बुनियादी बातें",
  blurb: "The first step of every data project: know your data types, find the centre (mean, median, trimmed and weighted means) and measure the spread (variance, standard deviation, percentiles, IQR).",
  lessons: [
    {
      id: "data-types",
      title: "Types of data and the data table",
      oneLine: "Data is either numbers (continuous or discrete) or categories (nominal, ordinal or binary). Most analysis starts with a table where each row is one record and each column is one feature; in Python, that table is a pandas DataFrame.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: What is statistics for a data scientist?" },
        { t: "p", text: "**Statistics** is the science of learning from data: describing it, finding patterns, and deciding whether a pattern is real or just luck. Data science uses it at every step: exploring data (this module), checking experiments like A/B tests, and building prediction models (machine learning)." },
        { t: "p", text: "The first step is always **Exploratory Data Analysis (EDA)**: look at the data before you model it. Many wrong conclusions come from skipping this step." },
        { t: "h", text: "Step 2: The types of data" },
        { t: "table", head: ["Type", "Meaning", "Examples", "Also called"], rows: [
          ["**Continuous**", "Any value in a range, with decimals", "Height 165.2 cm, delivery time 12.5 min, price ₹499.99", "numeric, float, interval"],
          ["**Discrete**", "Whole-number counts", "Number of children, orders per day, goals", "integer, count"],
          ["**Categorical (nominal)**", "A fixed set of labels with no order", "City, payment mode (UPI/Card/Cash), blood group", "factor, enum"],
          ["**Ordinal**", "Categories with a natural order", "Grade A/B/C, rating 1–5 stars, size S/M/L", "ordered factor"],
          ["**Binary**", "Only two values", "Passed yes/no, clicked 0/1, fraud true/false", "boolean, dichotomous"],
        ] },
        { t: "p", text: "Why does the type matter? It decides **which chart, summary and model** you can use. You can average heights, but not cities. You can sort grades, but sorting cities alphabetically means nothing." },
        { t: "h", text: "Step 3: Rectangular data (the DataFrame)" },
        { t: "diagram", text: "              columns = features / variables / attributes\n            ┌────────┬─────┬───────────┬───────┬───────┬────────┐\n            │ name   │ age │ height_cm │ city  │ grade │ passed │\n rows   ──▶ ├────────┼─────┼───────────┼───────┼───────┼────────┤\n (records,  │ Asha   │ 21  │ 158.5     │ Patna │ B     │ True   │\n  cases,    │ Ravi   │ 22  │ 172.0     │ Pune  │ A     │ True   │\n  samples)  │ ...    │     │           │       │       │        │\n            └────────┴─────┴───────────┴───────┴───────┴────────┘\n              the column you want to predict = target / outcome / label" },
        py("Your first DataFrame", src`
import pandas as pd                      # pip install pandas

df = pd.DataFrame({
    "name": ["Asha", "Ravi", "Zoya", "Imran", "Neha"],
    "age": [21, 22, 20, 23, 21],                        # discrete
    "height_cm": [158.5, 172.0, 165.2, 180.1, 160.0],   # continuous
    "city": ["Patna", "Pune", "Patna", "Delhi", "Pune"],# categorical
    "grade": ["B", "A", "A", "C", "B"],                 # ordinal
    "passed": [True, True, True, False, True],          # binary
})
print(df)
print(df.shape)                  # (rows, columns)
print(df["height_cm"].mean())    # one column = a Series
print(df[df["city"] == "Patna"]["name"].tolist())   # filter rows
`, "    name  age  height_cm   city grade  passed\n0   Asha   21      158.5  Patna     B    True\n1   Ravi   22      172.0   Pune     A    True\n2   Zoya   20      165.2  Patna     A    True\n3  Imran   23      180.1  Delhi     C   False\n4   Neha   21      160.0   Pune     B    True\n(5, 6)\n167.16\n['Asha', 'Zoya']"),
        py("Telling pandas a column is ordinal", src`
import pandas as pd

grades = pd.Series(["B", "A", "A", "C", "B"])
grades = pd.Categorical(grades, categories=["C", "B", "A"], ordered=True)   # C < B < A
print(grades.max())                    # the best grade
print((grades > "B").sum())            # how many are better than B
print(list(grades.categories))
`, "A\n2\n['C', 'B', 'A']"),
        { t: "analogy", text: "A DataFrame is an Excel sheet that Python can think with: each row is one student (record), each column is one question on the form (feature). Data types are like the kind of answer each question expects: a number, a choice from a list, or yes/no." },
        { t: "trap", text: "Numbers aren't always numeric data. PIN codes, phone numbers and roll numbers are **labels**: averaging PIN codes is meaningless. And ratings 1–5 look numeric but are ordinal: the gap between 1★ and 2★ isn't necessarily the same as between 4★ and 5★." },
        { t: "trick", text: "**Can you average it? Numeric. Can you only count it? Categorical. Does order matter? Ordinal.**" },
        { t: "exam", items: ["What are the types of data? Give examples of each.", "Difference between discrete and continuous data?", "What is ordinal data?", "What is EDA and why is it the first step?", "What is a DataFrame? What are rows and columns called in data science?"] },
        { t: "recap", items: ["Numeric: continuous (decimals) or discrete (counts)", "Categorical: nominal (no order), ordinal (ordered), binary (two values)", "The type decides the chart, summary and model", "Rows = records, columns = features; the target is what you predict", "pandas DataFrame is Python's data table"] },
      ],
      quiz: [
        { q: "Delivery time in minutes (12.5, 30.2…) is…", options: ["Continuous", "Discrete", "Ordinal", "Binary"], answer: 0, explain: "It can take any value in a range." },
        { q: "T-shirt size S/M/L/XL is…", options: ["Ordinal", "Nominal", "Continuous", "Binary"], answer: 0, explain: "Categories with an order." },
        { q: "A PIN code like 800001 should be treated as…", options: ["Categorical (a label)", "Continuous", "A count", "Binary"], answer: 0, explain: "Averaging it is meaningless." },
        { q: "In a DataFrame, one row is usually one…", options: ["Record (case)", "Feature", "Target", "Type"], answer: 0, explain: "Columns are features." },
        { q: "Clicked an ad: yes/no is…", options: ["Binary", "Continuous", "Ordinal", "Discrete count"], answer: 0, explain: "Only two values." },
      ],
    },
    {
      id: "location",
      title: "Finding the centre: mean, median and friends",
      oneLine: "An estimate of location says where most of the data sits. The mean adds everything and divides; the median is the middle value. The median (and the trimmed mean) resist outliers; the mean doesn't. A weighted mean gives some values more importance.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Mean and median by hand" },
        { t: "p", text: "Seven food deliveries took these many minutes: **12, 15, 14, 10, 13, 16, 95**. One order got stuck in traffic for 95 minutes." },
        { t: "formula", items: [["Mean", "x̄ = (sum of all values) / n = 175 / 7 = 25 minutes"], ["Median", "sort the values and take the middle one: 10 12 13 **14** 15 16 95 → 14 minutes"], ["Median (even n)", "average of the two middle values: 1 2 **3 4** 5 6 → 3.5"]] },
        { t: "p", text: "Which number describes a **typical** delivery? 14 minutes. The single 95-minute order dragged the mean up to 25, which is longer than 6 of the 7 deliveries. The median wasn't affected." },
        { t: "table", head: ["Estimate", "How", "Affected by outliers?", "Use when"], rows: [
          ["Mean", "Sum ÷ count", "**Yes, a lot**", "Data without extreme values; needed for many formulas"],
          ["Median", "Middle value after sorting", "No (robust)", "Skewed data: incomes, house prices, delivery times"],
          ["Trimmed mean", "Drop the top and bottom x%, then average", "Little", "A compromise: used in judging sports and inflation figures"],
          ["Weighted mean", "Σ(value × weight) ÷ Σ(weights)", "Depends", "Some values count more (bigger groups, more reliable data)"],
          ["Mode", "Most common value", "No", "Categorical data"],
        ] },
        { t: "h", text: "Step 2: In Python" },
        py("Mean, median and trimmed mean", src`
import statistics
from scipy import stats                 # pip install scipy

times = [12, 15, 14, 10, 13, 16, 95]
print("Mean:", sum(times) / len(times))
print("Median:", statistics.median(times))
print("Trimmed mean:", stats.trim_mean(times, 0.15))   # drops 15% (here 1 value) from EACH end
`, "Mean: 25.0\nMedian: 14\nTrimmed mean: 14.0"),
        { t: "h", text: "Step 3: Weighted mean" },
        { t: "p", text: "A restaurant chain has three branches. Ratings: **4.5** (200 reviews), **3.8** (50 reviews), **4.1** (750 reviews). The simple mean treats the 50-review branch the same as the 750-review branch. The weighted mean counts each review once." },
        { t: "formula", items: [["Weighted mean", "(4.5×200 + 3.8×50 + 4.1×750) / (200 + 50 + 750) = (900 + 190 + 3075) / 1000 = 4.165"]] },
        py("Weighted mean with NumPy", src`
import numpy as np                       # pip install numpy

ratings = np.array([4.5, 3.8, 4.1])
reviews = np.array([200, 50, 750])
print("Simple mean:", round(ratings.mean(), 3))
print("Weighted mean:", round(np.average(ratings, weights=reviews), 3))
`, "Simple mean: 4.133\nWeighted mean: 4.165"),
        { t: "analogy", text: "Ten friends in a café earn about ₹30,000 a month each. A billionaire walks in. The **mean** income in the café is now crores; the **median** is still about ₹30,000. That's why news about \"average\" income or house prices usually reports the median." },
        { t: "trap", text: "\"Average\" in everyday speech usually means the mean. When data is **skewed** (a long tail of big values, like salaries), the mean can describe nobody. Always look at both: if the mean is much bigger than the median, there are large outliers or a long right tail." },
        { t: "trick", text: "**Outliers or skew → median. Different importance → weighted mean. Symmetric data → mean.**" },
        { t: "exam", items: ["Difference between mean and median? When is the median better?", "What is a robust statistic?", "What is a trimmed mean?", "When would you use a weighted mean?", "If mean > median, what does that tell you about the data? (Right-skewed.)"] },
        { t: "recap", items: ["Mean = sum / n; pulled by outliers", "Median = middle value; robust to outliers", "Trimmed mean drops the extremes, then averages", "Weighted mean = Σ(x·w) / Σw", "Compare mean and median to detect skew"] },
      ],
      quiz: [
        { q: "Median of 3, 9, 1, 7, 5?", options: ["5", "7", "4", "5.5"], answer: 0, explain: "Sorted: 1 3 5 7 9." },
        { q: "Median of 2, 4, 6, 8?", options: ["5", "4", "6", "20"], answer: 0, explain: "Average of the two middle values." },
        { q: "Which is most affected by one huge outlier?", options: ["Mean", "Median", "Mode", "Trimmed mean"], answer: 0, explain: "The outlier is added into the sum." },
        { q: "House prices in a city are best summarised by the…", options: ["Median", "Mean", "Maximum", "Mode"], answer: 0, explain: "They're right-skewed." },
        { q: "Marks 80 (weight 3) and 60 (weight 1). Weighted mean?", options: ["75", "70", "80", "65"], answer: 0, explain: "(240 + 60) / 4." },
      ],
    },
    {
      id: "variability",
      title: "Measuring spread: variance, standard deviation, percentiles and IQR",
      oneLine: "Two datasets can have the same mean but very different spread. Variability tells you how far values usually sit from the centre: range, variance, standard deviation, mean absolute deviation, and the outlier-proof percentiles and IQR.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Same average, different player" },
        { t: "p", text: "Two batters' last five scores. Both average **50**. Which one would you pick for a must-win match?" },
        { t: "table", head: ["Batter", "Scores", "Mean"], rows: [["A", "45, 50, 55, 48, 52", "50"], ["B", "5, 100, 20, 90, 35", "50"]] },
        { t: "p", text: "A is **consistent**, B is a gamble. The mean can't show that; measures of variability can." },
        { t: "h", text: "Step 2: Standard deviation by hand (batter A)" },
        { t: "table", head: ["Score x", "Deviation x − x̄", "Squared"], rows: [["45", "−5", "25"], ["50", "0", "0"], ["55", "5", "25"], ["48", "−2", "4"], ["52", "2", "4"], ["", "**Sum = 0**", "**Sum = 58**"]] },
        { t: "formula", items: [["Variance s²", "Σ(x − x̄)² / (n − 1) = 58 / 4 = 14.5"], ["Standard deviation s", "√variance = √14.5 ≈ 3.81 runs"], ["Mean absolute deviation", "Σ|x − x̄| / n = (5+0+5+2+2) / 5 = 2.8"], ["Range", "max − min = 55 − 45 = 10"]] },
        { t: "p", text: "Deviations always add up to 0 (the positives cancel the negatives), so we **square** them before adding. The standard deviation takes the square root to get back to the original units: runs, not runs²." },
        { t: "h", text: "Step 3: In Python" },
        py("Variance and standard deviation", src`
import numpy as np
from scipy.stats import median_abs_deviation

a = np.array([45, 50, 55, 48, 52])
b = np.array([5, 100, 20, 90, 35])
for name, x in [("A", a), ("B", b)]:
    print(name, "mean", x.mean(), "range", x.max() - x.min(),
          "variance", round(x.var(ddof=1), 1),          # ddof=1 → divide by n - 1
          "sd", round(x.std(ddof=1), 2),
          "MAD", median_abs_deviation(x))                # median of |x - median|
`, "A mean 50.0 range 10 variance 14.5 sd 3.81 MAD 2.0\nB mean 50.0 range 95 variance 1812.5 sd 42.57 MAD 30.0"),
        { t: "p", text: "Batter B's standard deviation (42.6 runs) is 11 times batter A's. The **median absolute deviation (MAD)** is the robust version: the median distance from the median, so one wild score can't blow it up." },
        { t: "h", text: "Step 4: Percentiles, quartiles and the IQR" },
        { t: "p", text: "The **p-th percentile** is the value below which p% of the data falls. The 25th, 50th and 75th percentiles are the **quartiles** Q1, Q2 (the median) and Q3. The **interquartile range IQR = Q3 − Q1** is the spread of the middle 50%." },
        py("Quartiles, IQR and outlier fences", src`
import numpy as np

data = np.array([2, 4, 4, 5, 7, 8, 9, 10, 12, 20])
q1, median, q3 = np.percentile(data, [25, 50, 75])
iqr = q3 - q1
print("Q1:", q1, "median:", median, "Q3:", q3, "IQR:", iqr)

low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr        # the usual outlier rule
print("Outlier fences:", low, high)
print("Outliers:", data[(data < low) | (data > high)])
`, "Q1: 4.25 median: 7.5 Q3: 9.75 IQR: 5.5\nOutlier fences: -4.0 18.0\nOutliers: [20]"),
        { t: "table", head: ["Measure", "Robust to outliers?", "Notes"], rows: [["Range", "No", "Only uses the two most extreme values"], ["Variance / SD", "No", "Squares make big deviations count even more"], ["Mean absolute deviation", "Somewhat", "Easier to explain than SD"], ["MAD (median absolute deviation)", "**Yes**", "Robust version of SD"], ["IQR", "**Yes**", "Used for boxplots and the 1.5 × IQR outlier rule"]] },
        { t: "analogy", text: "Standard deviation is the \"usual distance\" from the average. If a class's average height is 160 cm with SD 5 cm, most students are within about 5 cm of 160. If SD were 20 cm, you'd see very short and very tall students side by side." },
        { t: "trap", text: "**n − 1, not n**, for a sample's variance and SD (Bessel's correction): dividing by n underestimates the spread of the population the sample came from. NumPy's `np.std` uses n by default, so pass `ddof=1`; pandas' `.std()` already uses n − 1. Different tools use different percentile methods, so small differences in Q1/Q3 are normal." },
        { t: "trick", text: "**SD = typical distance from the mean. IQR = width of the middle half. Outliers lie beyond 1.5 × IQR.**" },
        { t: "exam", items: ["What is standard deviation? How is it calculated?", "Why divide by n − 1 for a sample?", "Variance vs standard deviation?", "What is the IQR? How do you find outliers with it?", "Which measures of spread are robust to outliers?"] },
        { t: "recap", items: ["Deviation = x − mean; they always sum to 0", "Variance = Σ(x − x̄)² / (n − 1); SD = √variance", "Range is simple but outlier-sensitive", "Percentiles and quartiles; IQR = Q3 − Q1", "Outliers: below Q1 − 1.5·IQR or above Q3 + 1.5·IQR"] },
      ],
      quiz: [
        { q: "Two datasets have the same mean. Which tells you which one is more consistent?", options: ["Standard deviation", "Mean", "Count", "Maximum"], answer: 0, explain: "It measures spread." },
        { q: "The sum of deviations from the mean is always…", options: ["0", "The variance", "n", "Positive"], answer: 0, explain: "That's why we square them." },
        { q: "Q1 = 20, Q3 = 50. IQR?", options: ["30", "70", "35", "15"], answer: 0, explain: "Q3 − Q1." },
        { q: "With Q1 = 20 and Q3 = 50, is 100 an outlier?", options: ["Yes, the upper fence is 95", "No", "Only if the mean is 35", "Can't tell"], answer: 0, explain: "50 + 1.5 × 30 = 95." },
        { q: "Why use ddof=1 in np.std for a sample?", options: ["To divide by n − 1 (Bessel's correction)", "To round the result", "To ignore outliers", "To sort the data"], answer: 0, explain: "pandas does this by default." },
      ],
    },
  ],
};

export const ST02_DISTRIBUTIONS: LearnModule = {
  id: "eda-distributions",
  title: "Distributions and relationships",
  titleHi: "वितरण और संबंध",
  blurb: "See the shape of your data with frequency tables, histograms and boxplots; summarise categories; measure how two variables move together (correlation); and compare groups with crosstabs and groupby.",
  lessons: [
    {
      id: "shape",
      title: "The shape of data: frequency tables, histograms and boxplots",
      oneLine: "A frequency table counts how many values fall into each range (bin); a histogram draws those counts as bars. A boxplot shows the median, quartiles and outliers in one picture. Together they show the shape: symmetric, skewed, or with two peaks.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Frequency table and histogram" },
        { t: "p", text: "Marks of 20 students: 35, 42, 48, 51, 55, 58, 60, 61, 63, 65, 66, 68, 70, 72, 74, 77, 80, 85, 91, 98. Group them into bins of 10 marks and count." },
        py("A text histogram", src`
import pandas as pd

marks = pd.Series([35, 42, 48, 51, 55, 58, 60, 61, 63, 65,
                   66, 68, 70, 72, 74, 77, 80, 85, 91, 98])
bins = pd.cut(marks, bins=range(30, 101, 10), right=False)   # [30, 40), [40, 50) …
counts = bins.value_counts().sort_index()
for interval, count in counts.items():
    print(f"{interval.left}-{interval.right - 1}: {'*' * count} ({count})")
`, "30-39: * (1)\n40-49: ** (2)\n50-59: *** (3)\n60-69: ****** (6)\n70-79: **** (4)\n80-89: ** (2)\n90-99: ** (2)"),
        { t: "p", text: "Each `*` is one student. The tallest bar (60–69) shows where most students are. In a real notebook you'd draw it with `marks.plot.hist(bins=7)` (matplotlib) or seaborn's `histplot`." },
        { t: "h", text: "Step 2: Shapes you'll meet" },
        { t: "diagram", text: "Symmetric (bell)        Right-skewed              Left-skewed            Bimodal (two peaks)\n     ▁▃▆█▆▃▁            █▆▃▂▁▁▁                   ▁▁▁▂▃▆█                ▂▆█▃▁▃█▆▂\nmean ≈ median         mean > median             mean < median          two groups mixed\nheights, exam marks   incomes, house prices     age at retirement      men + women heights" },
        { t: "h", text: "Step 3: The boxplot (five-number summary)" },
        py("Five-number summary", src`
import pandas as pd

marks = pd.Series([35, 42, 48, 51, 55, 58, 60, 61, 63, 65,
                   66, 68, 70, 72, 74, 77, 80, 85, 91, 98])
print(marks.describe().round(2))       # count, mean, std, min, quartiles, max
print("Skewness:", round(marks.skew(), 2))   # > 0 means a longer right tail
`, "count    20.00\nmean     65.95\nstd      15.88\nmin      35.00\n25%      57.25\n50%      65.50\n75%      74.75\nmax      98.00\ndtype: float64\nSkewness: 0.08"),
        { t: "diagram", text: "              Q1      median     Q3\n               │         │        │\n  min ├────────┼─────────┼────────┼────────┤ max      ●  ← outliers drawn as dots\n      35     57.25     65.5     74.75     98\n      whisker   └── box = IQR (middle 50%) ──┘  whisker (up to 1.5 × IQR)" },
        { t: "p", text: "Boxplots are perfect for **comparing groups side by side** (marks by section, salaries by department): you instantly see which group is higher, which is more spread out, and which has outliers." },
        { t: "analogy", text: "A histogram is like a crowd photo of a stadium from above: where people are packed together you see the bars rise. A boxplot is the summary the security chief writes: \"half the crowd sits between gate 3 and gate 7, the middle is gate 5, and a few people are way out at gate 12\"." },
        { t: "trap", text: "The number of bins changes the picture: too few bins hide the shape, too many make it noisy. Try a few. Also, a histogram's bars must touch and the bins must be equal width; a bar chart (for categories) has gaps." },
        { t: "trick", text: "**Histogram = shape. Boxplot = median, IQR, outliers, and group comparisons.**" },
        { t: "exam", items: ["What is a histogram? How is it different from a bar chart?", "What does a boxplot show?", "What is skewness? How do you recognise right skew? (Long right tail, mean > median.)", "What is the five-number summary?", "What is a density plot? (A smoothed histogram.)"] },
        { t: "recap", items: ["Frequency table = counts per bin; histogram draws it", "Shapes: symmetric, right-skewed, left-skewed, bimodal", "describe() gives count, mean, std, min, quartiles, max", "Boxplot: box = IQR, line = median, whiskers, outlier dots", "Bins change how a histogram looks"] },
      ],
      quiz: [
        { q: "Incomes usually have which shape?", options: ["Right-skewed", "Left-skewed", "Symmetric", "Uniform"], answer: 0, explain: "A few very high incomes form a long right tail." },
        { q: "The box in a boxplot covers…", options: ["Q1 to Q3 (the middle 50%)", "Min to max", "Mean ± SD", "The outliers"], answer: 0, explain: "Its width is the IQR." },
        { q: "In a right-skewed distribution, typically…", options: ["mean > median", "mean < median", "mean = median", "There's no median"], answer: 0, explain: "The tail pulls the mean up." },
        { q: "Two peaks in a histogram suggest…", options: ["Two different groups mixed together", "An error", "A normal distribution", "No outliers"], answer: 0, explain: "A bimodal distribution." },
      ],
    },
    {
      id: "categorical",
      title: "Categorical data: counts, proportions, mode and expected value",
      oneLine: "For categories, count how often each one occurs and turn counts into percentages. The mode is the most common category. Expected value is a probability-weighted average used to judge decisions like offers, bets and insurance.",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Counts and proportions" },
        py("Payment modes in a survey of 100 customers", src`
import pandas as pd

payments = pd.Series(["UPI"] * 52 + ["Cash"] * 25 + ["Card"] * 18 + ["Wallet"] * 5)
counts = payments.value_counts()
print(counts)
print((payments.value_counts(normalize=True) * 100).round(1))   # percentages
print("Mode:", payments.mode()[0])

for mode, n in counts.items():                                    # a text bar chart
    print(f"{mode:<7}{'█' * (n // 2)} {n}")
`, "UPI       52\nCash      25\nCard      18\nWallet     5\nName: count, dtype: int64\nUPI       52.0\nCash      25.0\nCard      18.0\nWallet     5.0\nName: proportion, dtype: float64\nMode: UPI\nUPI    ██████████████████████████ 52\nCash   ████████████ 25\nCard   █████████ 18\nWallet ██ 5"),
        { t: "p", text: "For categories, use **bar charts** (with gaps between bars) or a table of percentages. Pie charts are popular but hard to read when slices are similar in size: bars are easier to compare." },
        { t: "h", text: "Step 2: Expected value" },
        { t: "p", text: "A lucky-draw ticket costs ₹100. There's a 1% chance to win ₹5,000, a 10% chance to win ₹200, and an 89% chance to win nothing. Is it worth it?" },
        { t: "formula", items: [["Expected value", "EV = Σ (outcome × probability)"], ["This ticket", "5000 × 0.01 + 200 × 0.10 + 0 × 0.89 = 50 + 20 + 0 = ₹70"], ["Verdict", "You pay ₹100 to get ₹70 on average: an expected loss of ₹30 per ticket"]] },
        py("Expected value in code", src`
outcomes = [5000, 200, 0]
probs = [0.01, 0.10, 0.89]
assert abs(sum(probs) - 1) < 1e-9          # probabilities must add up to 1

ev = sum(o * p for o, p in zip(outcomes, probs))
print("Expected winnings: ₹", round(ev, 2))
print("Expected profit per ticket: ₹", round(ev - 100, 2))
`, "Expected winnings: ₹ 70.0\nExpected profit per ticket: ₹ -30.0"),
        { t: "p", text: "Businesses use expected value constantly: the value of a new customer (chance they stay × what they spend), whether a marketing offer pays off, how insurance premiums are priced." },
        { t: "analogy", text: "Expected value is what you'd earn **per ticket** if you bought a million tickets. Any single ticket wins ₹0, ₹200 or ₹5,000, never ₹70, but over many tickets you'd average ₹70 each." },
        { t: "trap", text: "Don't compute a mean of category codes (UPI = 1, Cash = 2…): the result means nothing. Expected value needs probabilities that **add up to 1**, and it says nothing about risk: two options with the same EV can be very different gambles." },
        { t: "trick", text: "**Categories → count, percent, mode, bar chart. Decisions under chance → expected value.**" },
        { t: "exam", items: ["How do you summarise categorical data?", "What is the mode? Can there be more than one?", "What is expected value? Calculate it for a simple game.", "Bar chart vs histogram?"] },
        { t: "recap", items: ["value_counts() counts categories; normalize=True gives proportions", "Mode = the most common category", "Bar charts for categories", "EV = Σ outcome × probability", "EV is a long-run average, not a guaranteed result"] },
      ],
      quiz: [
        { q: "Which summary makes sense for blood groups?", options: ["Counts and the mode", "The mean", "The standard deviation", "The median"], answer: 0, explain: "They're nominal categories." },
        { q: "A game: 50% chance to win ₹10, 50% to win ₹0. EV?", options: ["₹5", "₹10", "₹0", "₹50"], answer: 0, explain: "10 × 0.5 + 0 × 0.5." },
        { q: "value_counts(normalize=True) returns…", options: ["Proportions", "Counts", "The mean", "Sorted values"], answer: 0, explain: "Multiply by 100 for percentages." },
        { q: "Probabilities of all outcomes must add up to…", options: ["1", "100", "0", "n"], answer: 0, explain: "Or 100%." },
      ],
    },
    {
      id: "correlation",
      title: "Correlation: do two variables move together?",
      oneLine: "The correlation coefficient r (from −1 to +1) measures how strongly two numeric variables move together in a straight line: +1 perfectly together, −1 perfectly opposite, 0 no linear relationship. Correlation does NOT prove that one causes the other.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Hours studied vs marks" },
        { t: "table", head: ["Hours x", "Marks y", "x − x̄", "y − ȳ", "Product"], rows: [
          ["1", "35", "−2.5", "−22", "55"], ["2", "45", "−1.5", "−12", "18"], ["3", "50", "−0.5", "−7", "3.5"],
          ["4", "62", "0.5", "5", "2.5"], ["5", "70", "1.5", "13", "19.5"], ["6", "80", "2.5", "23", "57.5"],
          ["x̄ = 3.5", "ȳ = 57", "Σ(x−x̄)² = 17.5", "Σ(y−ȳ)² = 1400", "**Σ = 156**"],
        ] },
        { t: "formula", items: [["Pearson r", "Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² × Σ(y − ȳ)²)"], ["Here", "156 / √(17.5 × 1400) = 156 / 156.5 ≈ 0.997"]] },
        { t: "p", text: "When x is above its mean, y is also above its mean (and below with below), so the products are positive and r is close to +1: a very strong positive relationship." },
        { t: "h", text: "Step 2: In Python" },
        py("Correlation with NumPy and pandas", src`
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "hours_study": [1, 2, 3, 4, 5, 6],
    "marks": [35, 45, 50, 62, 70, 80],
    "hours_phone": [6, 5, 5, 3, 2, 1],
})
print(round(np.corrcoef(df["hours_study"], df["marks"])[0, 1], 3))
print(df.corr().round(2))              # the correlation matrix: every pair
`, "0.997\n             hours_study  marks  hours_phone\nhours_study         1.00   1.00        -0.98\nmarks               1.00   1.00        -0.99\nhours_phone        -0.98  -0.99         1.00"),
        { t: "table", head: ["r", "Meaning", "Scatter plot looks like"], rows: [["+1", "Perfect positive line", "Points on a rising line"], ["+0.7", "Strong positive", "Rising cloud, fairly tight"], ["0", "No linear relationship", "Round blob (or a curve!)"], ["−0.7", "Strong negative", "Falling cloud"], ["−1", "Perfect negative line", "Points on a falling line"]] },
        { t: "h", text: "Step 3: Robust correlation and its limits" },
        py("One outlier vs Spearman", src`
import pandas as pd

x = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
y = pd.Series([2, 1, 4, 3, 6, 5, 8, 7, 10, -40])     # last point is a data-entry error
print("Pearson:", round(x.corr(y), 2))
print("Spearman:", round(x.corr(y, method="spearman"), 2))   # uses ranks: robust
`, "Pearson: -0.36\nSpearman: 0.41"),
        { t: "p", text: "One bad point flipped Pearson's r to negative, while **Spearman's rank correlation** (which only looks at the order of the values) still sees the upward trend. Always look at a scatter plot, not just the number." },
        { t: "analogy", text: "Ice-cream sales and drowning accidents are strongly correlated. Does ice cream cause drowning? No: **summer** (a hidden third variable, a confounder) increases both. Correlation tells you two things move together, not why." },
        { t: "trap", text: "**Correlation is not causation.** Also, r only measures **straight-line** relationships: y = x² on −3…3 has r = 0 even though y depends completely on x. And r is sensitive to outliers. Plot the data first." },
        { t: "trick", text: "**r: sign = direction, size = strength, straight lines only, and never \"proves\" cause.**" },
        { t: "exam", items: ["What is correlation? What range does r take?", "Correlation vs causation: give an example.", "Pearson vs Spearman correlation?", "Can r be 0 when the variables are related? (Yes, for non-linear relationships.)", "What is a correlation matrix used for? (Spotting related features and multicollinearity.)"] },
        { t: "recap", items: ["r goes from −1 to +1", "Positive: both rise together; negative: one rises as the other falls", "Pearson = straight-line; Spearman = ranks, robust", "df.corr() gives a correlation matrix", "Correlation ≠ causation; watch for confounders"] },
      ],
      quiz: [
        { q: "r = −0.9 means…", options: ["A strong negative linear relationship", "No relationship", "A weak positive relationship", "An error"], answer: 0, explain: "As one rises, the other falls." },
        { q: "Ice-cream sales and drowning are correlated because of…", options: ["A confounder (hot weather)", "Ice cream causes drowning", "Pure chance", "Bad data"], answer: 0, explain: "A third variable drives both." },
        { q: "Which correlation is more robust to outliers?", options: ["Spearman", "Pearson", "Both equally", "Neither"], answer: 0, explain: "It uses ranks." },
        { q: "y = x² for x from −3 to 3 gives r about…", options: ["0", "1", "−1", "0.5"], answer: 0, explain: "The relationship isn't a straight line." },
      ],
    },
    {
      id: "two-variables",
      title: "Comparing groups: crosstabs and groupby",
      oneLine: "To explore two variables at once: two categories → a contingency table (crosstab) with counts or row percentages; a number by a category → groupby summaries or side-by-side boxplots; two numbers → a scatter plot.",
      minutes: 16,
      blocks: [
        { t: "table", head: ["Variable types", "Tool", "pandas"], rows: [["Category × category", "Contingency table", "`pd.crosstab(a, b)`"], ["Number × category", "Group summaries, boxplots by group", "`df.groupby(cat)[num].describe()`"], ["Number × number", "Scatter plot, correlation (hexbin for big data)", "`df.plot.scatter(x, y)`, `df.corr()`"]] },
        { t: "h", text: "Step 1: Contingency table (category × category)" },
        py("Which plan's customers leave?", src`
import pandas as pd

df = pd.DataFrame({
    "plan":    ["Basic", "Basic", "Premium", "Basic", "Premium", "Premium", "Basic", "Premium", "Basic", "Basic"],
    "churned": ["Yes",   "No",    "No",      "Yes",   "No",      "No",      "Yes",   "No",      "No",    "Yes"],
})
print(pd.crosstab(df["plan"], df["churned"], margins=True))           # counts + totals
print(pd.crosstab(df["plan"], df["churned"], normalize="index").round(2))   # row %
`, "churned  No  Yes  All\nplan\nBasic     2    4    6\nPremium   4    0    4\nAll       6    4   10\nchurned    No   Yes\nplan\nBasic    0.33  0.67\nPremium  1.00  0.00"),
        { t: "p", text: "Row percentages answer the real question: **67% of Basic customers churned, 0% of Premium**. Raw counts can mislead when groups have different sizes, so always compare percentages within each group." },
        { t: "h", text: "Step 2: A number by group" },
        py("Salaries by department", src`
import pandas as pd

df = pd.DataFrame({
    "dept":   ["IT", "IT", "IT", "HR", "HR", "Sales", "Sales", "Sales", "Sales"],
    "salary": [62, 75, 58, 40, 45, 35, 50, 42, 120],      # ₹ thousand per month
})
summary = df.groupby("dept")["salary"].agg(["count", "mean", "median", "min", "max"])
print(summary.round(1))
`, "       count  mean  median  min  max\ndept                                \nHR         2  42.5    42.5   40   45\nIT         3  65.0    62.0   58   75\nSales      4  61.8    46.0   35  120"),
        { t: "p", text: "Sales has a higher mean than its median: one top performer earning 120 pulls the mean up. Comparing **medians** shows that a typical Sales employee earns less than a typical IT employee. That's the kind of insight EDA is for." },
        { t: "analogy", text: "A crosstab is a school's result board split by section: instead of \"80 students passed\", it shows \"Section A: 95% passed, Section B: 60%\". Splitting by group is how you find where the problem or the opportunity is." },
        { t: "trap", text: "**Simpson's paradox:** a trend in every group can reverse when the groups are combined, because the group sizes differ. For example, a treatment can work better for both young and old patients, yet look worse overall if it was mostly given to the sicker group. Always check the breakdown." },
        { t: "trick", text: "**Compare percentages within groups, not raw counts. Compare medians when there are outliers.**" },
        { t: "exam", items: ["What is a contingency table?", "How do you compare a numeric variable across categories?", "What is Simpson's paradox?", "What does groupby do in pandas?", "How do you visualise two numeric variables with millions of points? (Hexbin or 2-D density plots.)"] },
        { t: "recap", items: ["Category × category: pd.crosstab, with row percentages", "Number × category: groupby + agg, boxplots by group", "Number × number: scatter plot and correlation", "Compare within-group percentages", "Beware Simpson's paradox"] },
      ],
      quiz: [
        { q: "Best tool to compare churn (yes/no) across plans?", options: ["A contingency table with row %", "A histogram", "Correlation", "A line chart"], answer: 0, explain: "Both variables are categorical." },
        { q: "df.groupby(\"dept\")[\"salary\"].median() gives…", options: ["The median salary in each department", "One overall median", "Salaries sorted", "The number of departments"], answer: 0, explain: "One value per group." },
        { q: "normalize=\"index\" in crosstab means…", options: ["Each row adds up to 1", "Each column adds up to 1", "Counts only", "Remove totals"], answer: 0, explain: "Row percentages." },
        { q: "Simpson's paradox is when…", options: ["A trend reverses when groups are combined", "The mean equals the median", "Correlation is 0", "Data has no outliers"], answer: 0, explain: "Group sizes change the overall picture." },
      ],
    },
  ],
};
