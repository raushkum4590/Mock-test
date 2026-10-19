import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science from scratch, modules 4–6: statistics and probability, inference, gradient descent. */
export const DS04_STATS_PROBABILITY: LearnModule = {
  id: "stats-probability",
  title: "Statistics and probability from scratch",
  titleHi: "सांख्यिकी और प्रायिकता शुरू से",
  blurb: "Write your own mean, median, quantiles, variance, standard deviation and correlation; then conditional probability, Bayes' theorem, the normal distribution and the central limit theorem, all in plain Python with simulations.",
  lessons: [
    {
      id: "statistics-from-scratch",
      title: "Describing data: write your own statistics functions",
      oneLine: "Summary statistics compress a list of numbers into a few meaningful ones: where the centre is (mean, median, mode), how spread out the values are (range, variance, standard deviation, IQR), and how two lists move together (covariance, correlation). Writing them yourself shows exactly what each one measures.",
      minutes: 20,
      blocks: [
        { t: "note", kind: "info", title: "Going deeper", text: "The **Statistics for Data Science** course explains each measure in more depth with pandas and SciPy. Here we build them by hand." },
        py("Centre and spread", src`
import math
from collections import Counter

minutes = [12, 45, 30, 22, 60, 15, 30, 95, 25, 30, 18, 40]     # daily minutes on an app

def mean(xs):
    return sum(xs) / len(xs)

def median(xs):
    s, n = sorted(xs), len(xs)
    mid = n // 2
    return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2     # odd: middle; even: average of two

def quantile(xs, p):
    return sorted(xs)[int(p * len(xs))]                      # simple version: the value at p% position

def mode(xs):
    counts = Counter(xs)
    top = max(counts.values())
    return [x for x, c in counts.items() if c == top]       # there can be several modes

def variance(xs):
    m = mean(xs)
    return sum((x - m) ** 2 for x in xs) / (len(xs) - 1)     # n - 1 for a sample

def standard_deviation(xs):
    return math.sqrt(variance(xs))

print("mean:", round(mean(minutes), 2), " median:", median(minutes), " mode:", mode(minutes))
print("range:", max(minutes) - min(minutes), " sd:", round(standard_deviation(minutes), 2))
print("10th / 90th percentile:", quantile(minutes, 0.10), quantile(minutes, 0.90))
print("IQR:", quantile(minutes, 0.75) - quantile(minutes, 0.25))
`, "mean: 35.17  median: 30.0  mode: [30]\nrange: 83  sd: 23.18\n10th / 90th percentile: 15 60\nIQR: 23"),
        { t: "p", text: "The mean is pulled up by the 95-minute day; the median (30) better describes a typical day. The IQR describes the middle half of days and ignores the extreme one." },
        { t: "h", text: "Correlation from scratch" },
        py("Covariance and correlation", src`
import math

def mean(xs):
    return sum(xs) / len(xs)

def covariance(xs, ys):
    mx, my = mean(xs), mean(ys)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (len(xs) - 1)

def correlation(xs, ys):
    sx = math.sqrt(covariance(xs, xs))         # covariance of a list with itself = variance
    sy = math.sqrt(covariance(ys, ys))
    return covariance(xs, ys) / (sx * sy) if sx > 0 and sy > 0 else 0

friends = [5, 12, 30, 8, 22, 40, 15, 3]
minutes = [10, 25, 55, 18, 40, 70, 30, 9]
print("covariance:", round(covariance(friends, minutes), 2))
print("correlation:", round(correlation(friends, minutes), 3))

friends_out = friends + [200]                 # one celebrity account
minutes_out = minutes + [2]                   # who almost never logs in
print("with one outlier:", round(correlation(friends_out, minutes_out), 3))
`, "covariance: 280.59\ncorrelation: 0.999\nwith one outlier: -0.261"),
        { t: "p", text: "Covariance's size depends on the units (friends × minutes), so it's hard to read. Correlation divides by both standard deviations, giving a unit-free number from −1 to 1. One extreme point can wreck it, so always look at a scatter plot and investigate outliers." },
        { t: "h", text: "Simpson's paradox" },
        { t: "table", head: ["Coast", "Group", "Members", "Avg friends"], rows: [["West", "Data scientists", "101", "8.2"], ["West", "Not data scientists", "103", "6.5"], ["East", "Data scientists", "103", "5.4"], ["East", "Not data scientists", "96", "3.2"], ["**Overall**", "Data scientists", "204", "6.8 *"], ["**Overall**", "Not data scientists", "199", "4.9 *"]], caption: "* illustrative numbers. Data scientists have more friends on each coast and overall here, but if the groups were unevenly spread across the coasts, the overall comparison could reverse. Always compare like with like." },
        { t: "analogy", text: "Summary statistics are a cricket scorecard: average (mean), highest score (max), consistency (standard deviation). Correlation is noticing that a batter scores more on flat pitches. It doesn't tell you the pitch is the reason; maybe those matches were also at home." },
        { t: "trap", text: "This simple `quantile` picks a value by position; libraries interpolate between values, so small differences are normal. Correlation measures **linear** relationships only, and is not causation. Divide by n − 1 for a sample's variance." },
        { t: "trick", text: "**Mean, median, mode → centre. Range, SD, IQR → spread. Correlation = covariance / (sd·sd).**" },
        { t: "exam", items: ["Write a function for the median.", "Why divide by n − 1 for sample variance?", "Covariance vs correlation?", "What is Simpson's paradox?", "Why is correlation not causation?"] },
        { t: "recap", items: ["Centre: mean (outlier-sensitive), median (robust), mode", "Spread: range, variance, SD, IQR", "Covariance depends on units; correlation is −1 to 1", "Outliers can distort correlation", "Compare like with like (Simpson's paradox)"] },
      ],
      quiz: [
        { q: "Median of [4, 1, 3, 2]?", options: ["2.5", "2", "3", "10"], answer: 0, explain: "Sorted 1 2 3 4; average of 2 and 3." },
        { q: "Which is NOT affected by one huge outlier?", options: ["Median", "Mean", "Standard deviation", "Range"], answer: 0, explain: "It only depends on the middle value." },
        { q: "Correlation always lies between…", options: ["−1 and 1", "0 and 1", "0 and 100", "−∞ and ∞"], answer: 0, explain: "It's unit-free." },
        { q: "Covariance of a list with itself equals its…", options: ["Variance", "Mean", "Median", "Correlation"], answer: 0, explain: "Σ(x − x̄)² / (n − 1)." },
      ],
    },
    {
      id: "probability-bayes",
      title: "Probability, conditional probability and Bayes' theorem",
      oneLine: "Probability measures how likely events are. Two events are independent if knowing one tells you nothing about the other. Conditional probability P(A | B) is the chance of A once you know B happened, and Bayes' theorem flips it around: from P(B | A) to P(A | B).",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Independence and conditional probability" },
        { t: "formula", items: [["Independent events", "P(A and B) = P(A) × P(B)"], ["Conditional probability", "P(A | B) = P(A and B) / P(B)"], ["If independent", "P(A | B) = P(A): knowing B changes nothing"]] },
        { t: "p", text: "A family has two children, each equally likely to be a boy or a girl. **(1)** If the older child is a girl, what's the chance both are girls? **(2)** If at least one is a girl, what's the chance both are girls? Most people say ½ for both. Let's simulate." },
        py("The two-children puzzle", src`
import random

random.seed(0)
both = older_girl = either_girl = 0
for _ in range(100_000):
    younger = random.choice(["boy", "girl"])
    older = random.choice(["boy", "girl"])
    if older == "girl":
        older_girl += 1
    if older == "girl" and younger == "girl":
        both += 1
    if older == "girl" or younger == "girl":
        either_girl += 1

print("P(both | older is a girl):", round(both / older_girl, 3))
print("P(both | at least one girl):", round(both / either_girl, 3))
`, "P(both | older is a girl): 0.499\nP(both | at least one girl): 0.333"),
        { t: "table", head: ["Families", "BB", "BG", "GB", "GG"], rows: [["All four equally likely", "¼", "¼", "¼", "¼"], ["Older is a girl → GB or GG", "", "", "½", "½ → answer ½"], ["At least one girl → BG, GB or GG", "", "⅓", "⅓", "⅓ → answer ⅓"]] },
        { t: "h", text: "Step 2: Bayes' theorem" },
        { t: "formula", items: [["Bayes' theorem", "P(A | B) = P(B | A) × P(A) / P(B)"], ["With the total", "P(B) = P(B | A)·P(A) + P(B | not A)·P(not A)"]] },
        py("Is this transaction fraud?", src`
p_fraud = 0.002                  # 0.2% of transactions are fraud (the prior)
p_alert_if_fraud = 0.95          # the system flags 95% of frauds
p_alert_if_ok = 0.03             # and wrongly flags 3% of normal transactions

p_alert = p_alert_if_fraud * p_fraud + p_alert_if_ok * (1 - p_fraud)
p_fraud_if_alert = p_alert_if_fraud * p_fraud / p_alert
print("P(alert):", round(p_alert, 4))
print("P(fraud | alert):", round(p_fraud_if_alert, 3))
`, "P(alert): 0.0318\nP(fraud | alert): 0.06"),
        { t: "p", text: "Even with a 95%-accurate detector, only about **6%** of alerts are real fraud, because fraud is so rare that the 3% false alarms on millions of normal transactions vastly outnumber the true catches. That's why alerts go to a human or a second check rather than blocking cards automatically." },
        { t: "h", text: "Step 3: Random variables and expected value" },
        py("Expected value of a dice game", src`
import random

outcomes = {1: -10, 2: -10, 3: 0, 4: 0, 5: 20, 6: 30}     # ₹ won for each face
expected = sum(value / 6 for value in outcomes.values())
print("Expected winnings per roll: ₹", round(expected, 2))

random.seed(1)
rolls = [outcomes[random.randint(1, 6)] for _ in range(100_000)]
print("Simulated average: ₹", round(sum(rolls) / len(rolls), 2))
`, "Expected winnings per roll: ₹ 5.0\nSimulated average: ₹ 4.97"),
        { t: "analogy", text: "Bayes' theorem is how a sensible person updates beliefs: \"the smoke alarm went off\" (evidence) should make you think about how often it beeps for burnt toast versus real fires, and how rare real fires are (the prior), before you call the fire brigade." },
        { t: "trap", text: "**Ignoring the base rate** is the classic mistake: P(alert | fraud) = 95% does NOT mean P(fraud | alert) = 95%. Also, \"independent\" and \"mutually exclusive\" are different: mutually exclusive events can't both happen, so they're strongly dependent." },
        { t: "trick", text: "**P(A|B) = P(B|A)·P(A) / P(B). Always ask: how common is A to begin with?**" },
        { t: "exam", items: ["What is conditional probability?", "State Bayes' theorem and give an example.", "What does independence mean?", "Independent vs mutually exclusive events?", "What is the expected value of a random variable?"] },
        { t: "recap", items: ["Independent: P(A and B) = P(A)·P(B)", "P(A | B) = P(A and B) / P(B)", "Bayes: P(A | B) = P(B | A)·P(A) / P(B)", "Rare events → many false positives", "Expected value = Σ value × probability; simulations confirm it"] },
      ],
      quiz: [
        { q: "Two fair coins: P(both heads)?", options: ["1/4", "1/2", "1/3", "1"], answer: 0, explain: "½ × ½ for independent events." },
        { q: "P(A and B) = 0.12, P(B) = 0.4. P(A | B)?", options: ["0.3", "0.048", "0.52", "0.12"], answer: 0, explain: "0.12 / 0.4." },
        { q: "A test catches 99% of a rare disease. A positive result means…", options: ["You need the base rate to know the chance you're sick", "99% chance you're sick", "1% chance you're sick", "You're definitely sick"], answer: 0, explain: "Bayes' theorem needs the prior." },
        { q: "A fair die: expected value of the face?", options: ["3.5", "3", "6", "21"], answer: 0, explain: "(1 + 2 + … + 6) / 6." },
      ],
    },
    {
      id: "distributions-clt",
      title: "The normal distribution and the central limit theorem",
      oneLine: "A probability density function (pdf) describes how likely values are near each point; its cumulative version (cdf) gives P(X ≤ x). The normal curve's cdf can be built with math.erf, and inverted with binary search. The central limit theorem explains why sums and averages of many random things look normal.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: pdf and cdf" },
        py("Normal pdf, cdf and inverse cdf", src`
import math

def normal_pdf(x, mu=0, sigma=1):
    return math.exp(-((x - mu) ** 2) / (2 * sigma ** 2)) / (math.sqrt(2 * math.pi) * sigma)

def normal_cdf(x, mu=0, sigma=1):
    return (1 + math.erf((x - mu) / math.sqrt(2) / sigma)) / 2       # P(X <= x)

def inverse_normal_cdf(p, mu=0, sigma=1, tolerance=1e-6):
    low, high = -10.0, 10.0                                        # binary search on the standard normal
    while high - low > tolerance:
        mid = (low + high) / 2
        if normal_cdf(mid) < p:
            low = mid
        else:
            high = mid
    return mu + sigma * (low + high) / 2

print("pdf at 0:", round(normal_pdf(0), 4))
print("P(Z <= 1.96):", round(normal_cdf(1.96), 4))
print("P(-1 < Z < 1):", round(normal_cdf(1) - normal_cdf(-1), 4))
print("95th percentile:", round(inverse_normal_cdf(0.95), 3))
print("Heights: P(height < 170 | mean 160, sd 8):", round(normal_cdf(170, 160, 8), 4))
`, "pdf at 0: 0.3989\nP(Z <= 1.96): 0.975\nP(-1 < Z < 1): 0.6827\n95th percentile: 1.645\nHeights: P(height < 170 | mean 160, sd 8): 0.8944"),
        { t: "p", text: "The **pdf** isn't a probability itself (it can be above 1 for narrow curves); probabilities are **areas** under it, which is what the cdf gives. Inverting the cdf answers questions like \"what height is taller than 95% of people?\"." },
        { t: "h", text: "Step 2: The central limit theorem by simulation" },
        { t: "p", text: "A **Bernoulli** trial is one yes/no event with probability p (does a visitor click?). The sum of n Bernoulli trials is **binomial**. The CLT says that for large n, this sum is approximately normal with mean np and SD √(np(1 − p))." },
        py("Binomial sums become a bell", src`
import math
import random
from collections import Counter

def binomial(n, p):
    return sum(1 for _ in range(n) if random.random() < p)    # number of "yes" in n trials

random.seed(4)
n, p, trials = 100, 0.3, 10_000
data = [binomial(n, p) for _ in range(trials)]

mu, sigma = n * p, math.sqrt(n * p * (1 - p))
print(f"theory: mean {mu}, sd {sigma:.2f}")
print(f"simulation: mean {sum(data) / trials:.2f}")

counts = Counter(x // 3 * 3 for x in data)                     # buckets of 3
for start in sorted(counts):
    if counts[start] >= 50:
        print(f"{start:>2}-{start + 2:<2} {'#' * (counts[start] // 50)}")
`, "theory: mean 30.0, sd 4.58\nsimulation: mean 30.01\n18-20 ##\n21-23 ############\n24-26 #############################\n27-29 ###############################################\n30-32 ################################################\n33-35 ##################################\n36-38 ################\n39-41 #####\n42-44 #"),
        { t: "analogy", text: "One die roll is flat: every face is equally likely. The total of 50 dice rolls is a bell: extreme totals (all ones, all sixes) need everything to go one way, which almost never happens, while middle totals can happen in countless ways. That's the central limit theorem." },
        { t: "trap", text: "The CLT needs **many** independent pieces; with small n or very skewed pieces (p = 0.001), the normal approximation is poor. And it's about sums and averages, not the raw data: individual incomes stay skewed however many you collect." },
        { t: "trick", text: "**cdf = area to the left. Sum of many small random things → normal, mean np, sd √(np(1−p)).**" },
        { t: "exam", items: ["What is the difference between a pdf and a cdf?", "State the central limit theorem.", "What is the normal approximation to the binomial?", "Can a pdf value be greater than 1? (Yes; areas are what must be ≤ 1.)"] },
        { t: "recap", items: ["pdf: density; cdf: P(X ≤ x)", "normal_cdf with math.erf; inverse via binary search", "Bernoulli → binomial (sum of n trials)", "CLT: sums/averages of many independent pieces ≈ normal", "Binomial ≈ Normal(np, √(np(1−p))) for large n"] },
      ],
      quiz: [
        { q: "P(Z ≤ 0) for a standard normal?", options: ["0.5", "0", "1", "0.68"], answer: 0, explain: "The curve is symmetric around 0." },
        { q: "The cdf at x gives…", options: ["P(X ≤ x)", "The curve's height at x", "The mean", "P(X = x)"], answer: 0, explain: "The area to the left." },
        { q: "100 visitors with p = 0.3. Expected clicks?", options: ["30", "3", "70", "0.3"], answer: 0, explain: "np." },
        { q: "The CLT applies to…", options: ["Sums and averages of many independent values", "Every single data point", "Only normal data", "Only small samples"], answer: 0, explain: "Not to the raw data's shape." },
      ],
    },
  ],
};

export const DS05_INFERENCE: LearnModule = {
  id: "inference",
  title: "Hypothesis testing and inference",
  titleHi: "परिकल्पना परीक्षण और अनुमान",
  blurb: "Decide whether a coin is fair or a new design works: build hypothesis tests, p-values and confidence intervals from the normal approximation, see p-hacking happen, run an A/B test, and update beliefs with Bayesian inference.",
  lessons: [
    {
      id: "hypothesis-testing",
      title: "Is this coin fair? Tests, p-values and confidence intervals",
      oneLine: "To test a claim (the coin is fair), assume it's true, work out how much the result would vary by chance, and see whether your data falls far outside that range. The p-value measures how surprising the data is under the claim; a confidence interval gives the range of believable values.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: What would a fair coin do?" },
        { t: "p", text: "Flip 1,000 times. If the coin is fair (the **null hypothesis** H₀: p = 0.5), the number of heads is binomial, which is approximately normal with mean **np = 500** and SD **√(np(1−p)) ≈ 15.8**." },
        py("Bounds, significance and p-values", src`
import math

def normal_cdf(x, mu=0, sigma=1):
    return (1 + math.erf((x - mu) / math.sqrt(2) / sigma)) / 2

def inverse_normal_cdf(p, mu=0, sigma=1):
    low, high = -10.0, 10.0
    while high - low > 1e-6:
        mid = (low + high) / 2
        low, high = (mid, high) if normal_cdf(mid) < p else (low, mid)
    return mu + sigma * (low + high) / 2

n, p = 1000, 0.5
mu, sigma = n * p, math.sqrt(n * p * (1 - p))
print(f"Under H0: mean {mu}, sd {sigma:.1f}")

low = inverse_normal_cdf(0.025, mu, sigma)          # 95% of fair-coin results fall in [low, high]
high = inverse_normal_cdf(0.975, mu, sigma)
print(f"95% of fair results are between {low:.0f} and {high:.0f} heads")

def two_sided_p_value(x, mu, sigma):
    if x >= mu:
        return 2 * (1 - normal_cdf(x, mu, sigma))
    return 2 * normal_cdf(x, mu, sigma)

for heads in [510, 530, 560]:
    pv = two_sided_p_value(heads - 0.5, mu, sigma)    # -0.5: continuity correction
    print(f"{heads} heads: p-value {pv:.4f} {'→ reject H0' if pv < 0.05 else '→ consistent with fair'}")
`, "Under H0: mean 500.0, sd 15.8\n95% of fair results are between 469 and 531 heads\n510 heads: p-value 0.5480 → consistent with fair\n530 heads: p-value 0.0621 → consistent with fair\n560 heads: p-value 0.0002 → reject H0"),
        { t: "table", head: ["Term", "Meaning here"], rows: [["Significance level α", "5%: we accept wrongly calling a fair coin unfair 5% of the time"], ["Rejection region", "Fewer than about 469 or more than about 531 heads"], ["p-value", "Probability a fair coin gives a result at least this extreme"], ["Power", "Chance of detecting an unfair coin (e.g. p = 0.55); higher with more flips"]] },
        { t: "h", text: "Step 2: Confidence intervals" },
        py("A 95% interval for the true heads probability", src`
import math

def interval(heads, n, z=1.96):
    p_hat = heads / n
    se = math.sqrt(p_hat * (1 - p_hat) / n)           # standard error of a proportion
    return p_hat - z * se, p_hat + z * se

for heads in [525, 540]:
    lo, hi = interval(heads, 1000)
    verdict = "0.5 is inside → can't say unfair" if lo <= 0.5 <= hi else "0.5 is outside → likely unfair"
    print(f"{heads}/1000: 95% CI {lo:.3f} to {hi:.3f}  ({verdict})")
`, "525/1000: 95% CI 0.494 to 0.556  (0.5 is inside → can't say unfair)\n540/1000: 95% CI 0.509 to 0.571  (0.5 is outside → likely unfair)"),
        { t: "h", text: "Step 3: p-hacking" },
        py("Run 1,000 experiments on FAIR coins", src`
import math
import random

def normal_cdf(x, mu=0, sigma=1):
    return (1 + math.erf((x - mu) / math.sqrt(2) / sigma)) / 2

random.seed(0)
mu, sigma = 500, math.sqrt(250)
significant = 0
for _ in range(1000):
    heads = sum(random.random() < 0.5 for _ in range(1000))     # a perfectly fair coin
    z = abs(heads - mu) / sigma
    if 2 * (1 - normal_cdf(z)) < 0.05:
        significant += 1
print("'Significant' results from fair coins:", significant, "of 1000")
`, "'Significant' results from fair coins: 55 of 1000"),
        { t: "p", text: "About **5%** of tests on fair coins come out \"significant\": that's what α = 5% means. If you try many analyses and only report the ones with p < 0.05 (**p-hacking**), you'll publish flukes. Decide your hypotheses before looking at the data." },
        { t: "analogy", text: "A hypothesis test is like checking whether a cricket bowler is no-balling on purpose: you know how often honest bowlers overstep by accident. Only if this bowler does it far more often than honest bowlers ever do do you call it deliberate." },
        { t: "trap", text: "\"Not significant\" doesn't prove the coin is fair: with few flips, you can't detect small biases (low power). A confidence interval is more informative: it shows the range of biases still consistent with the data." },
        { t: "trick", text: "**Assume H₀, find chance's range, see if the data falls outside. Decide tests before looking.**" },
        { t: "exam", items: ["Explain hypothesis testing with a coin example.", "What is a p-value?", "What are significance and power?", "How do you build a confidence interval for a proportion?", "What is p-hacking and how do you avoid it?"] },
        { t: "recap", items: ["H₀: fair coin → heads ~ Normal(np, √(np(1−p)))", "Reject H₀ if the result falls outside the 95% range (p < 0.05)", "p-value = chance of a result at least this extreme under H₀", "CI for a proportion: p̂ ± 1.96·√(p̂(1−p̂)/n)", "Testing many things guarantees false positives"] },
      ],
      quiz: [
        { q: "1,000 flips of a fair coin: expected heads and SD?", options: ["500 and about 15.8", "500 and 250", "1000 and 31.6", "250 and 15.8"], answer: 0, explain: "np and √(np(1−p))." },
        { q: "With α = 0.05, how many of 100 tests on fair coins will look significant on average?", options: ["5", "0", "50", "95"], answer: 0, explain: "That's the false-positive rate." },
        { q: "A 95% CI for p is 0.49 to 0.55. Can you call the coin unfair at 5%?", options: ["No, 0.5 is inside", "Yes", "Only if n > 10,000", "The CI is wrong"], answer: 0, explain: "0.5 is a plausible value." },
        { q: "p-hacking means…", options: ["Trying many analyses and reporting only the significant ones", "Using a large sample", "Using one-sided tests", "Rounding p-values"], answer: 0, explain: "It produces flukes." },
      ],
    },
    {
      id: "ab-bayesian",
      title: "A/B testing and Bayesian inference",
      oneLine: "An A/B test compares two conversion rates using a z-statistic: the difference divided by its standard error. Bayesian inference takes another approach: start with a prior belief, then update it with data to get a posterior distribution, using the Beta distribution for probabilities.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: A/B test from scratch" },
        py("Which ad gets more clicks?", src`
import math

def normal_cdf(x):
    return (1 + math.erf(x / math.sqrt(2))) / 2

def estimate(clicks, views):
    p = clicks / views
    return p, math.sqrt(p * (1 - p) / views)       # rate and its standard error

def ab_test(clicks_a, views_a, clicks_b, views_b):
    pa, sa = estimate(clicks_a, views_a)
    pb, sb = estimate(clicks_b, views_b)
    z = (pb - pa) / math.sqrt(sa ** 2 + sb ** 2)   # difference in standard errors
    return pa, pb, z, 2 * (1 - normal_cdf(abs(z)))

for a, b in [(200, 180), (200, 150)]:              # clicks out of 1,000 views each
    pa, pb, z, pv = ab_test(a, 1000, b, 1000)
    print(f"A {pa:.1%} vs B {pb:.1%}: z = {z:.2f}, p = {pv:.3f}")
`, "A 20.0% vs B 18.0%: z = -1.14, p = 0.254\nA 20.0% vs B 15.0%: z = -2.95, p = 0.003"),
        { t: "p", text: "A 2-point gap (20% vs 18%) is well within chance for 1,000 views each. A 5-point gap (20% vs 15%) would very rarely happen by chance: ad A is genuinely better." },
        { t: "h", text: "Step 2: Bayesian inference" },
        { t: "p", text: "Instead of a yes/no test, Bayesian inference keeps a whole **distribution of beliefs** about the click rate. The **Beta(α, β)** distribution is perfect for probabilities: start with a prior Beta(α, β); after seeing h clicks and t non-clicks, the posterior is **Beta(α + h, β + t)**. That's it." },
        py("Updating beliefs about a click rate", src`
import math

def beta_pdf(x, a, b):
    if x <= 0 or x >= 1:
        return 0
    log_norm = math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)
    return math.exp((a - 1) * math.log(x) + (b - 1) * math.log(1 - x) - log_norm)

def beta_mean(a, b):
    return a / (a + b)

def prob_between(a, b, lo, hi, steps=10_000):       # area under the curve, numerically
    width = (hi - lo) / steps
    return sum(beta_pdf(lo + (i + 0.5) * width, a, b) for i in range(steps)) * width

clicks, misses = 30, 170                             # observed: 30 clicks in 200 views
for name, (a, b) in {"no opinion Beta(1,1)": (1, 1), "expects ~10% Beta(10,90)": (10, 90)}.items():
    pa, pb = a + clicks, b + misses                  # the posterior
    print(f"{name:<26} posterior mean {beta_mean(pa, pb):.3f}, "
          f"P(rate between 10% and 20%) = {prob_between(pa, pb, 0.10, 0.20):.3f}")
`, "no opinion Beta(1,1)       posterior mean 0.153, P(rate between 10% and 20%) = 0.950\nexpects ~10% Beta(10,90)   posterior mean 0.133, P(rate between 10% and 20%) = 0.963"),
        { t: "table", head: ["", "Frequentist (p-values, CIs)", "Bayesian"], rows: [["Parameter", "Fixed but unknown", "Has a probability distribution"], ["Prior knowledge", "Not used", "Built in through the prior"], ["Answer", "\"p = 0.01: data unlikely if no effect\"", "\"92% probability B is better\""], ["Needs", "Sample size planning", "A reasonable prior"]] },
        { t: "analogy", text: "Bayesian updating is how you judge a new restaurant: you start with a belief from its rating (prior), then each meal you eat there (data) nudges that belief. After many meals, your own experience dominates; after one meal, the prior still matters." },
        { t: "trap", text: "A strong prior can drown out the data when the data is small, so state your prior and check how sensitive the result is to it. Above, with only 200 views, the prior still pulls the estimate (posterior means 0.153 vs 0.133). With thousands of views, the two posteriors would become almost identical: the data takes over." },
        { t: "trick", text: "**A/B: z = difference / SE. Bayes with clicks: Beta(α + clicks, β + misses).**" },
        { t: "exam", items: ["How do you analyse an A/B test of conversion rates?", "Frequentist vs Bayesian statistics?", "What is a prior? A posterior?", "Why is the Beta distribution used for probabilities?", "What is a conjugate prior? (A prior whose posterior has the same family: Beta–binomial.)"] },
        { t: "recap", items: ["A/B z-statistic: (p_B − p_A) / √(SE_A² + SE_B²)", "Small gaps on small samples are often chance", "Bayesian: prior + data → posterior", "Beta(α, β) → Beta(α + successes, β + failures)", "Lots of data makes the prior matter less"] },
      ],
      quiz: [
        { q: "In an A/B z-test, z = 3 means…", options: ["The difference is 3 standard errors: very unlikely by chance", "B converts 3% more", "The test failed", "p = 0.3"], answer: 0, explain: "p ≈ 0.003." },
        { q: "Prior Beta(2, 2), then 8 successes and 2 failures. Posterior?", options: ["Beta(10, 4)", "Beta(8, 2)", "Beta(2, 2)", "Beta(4, 10)"], answer: 0, explain: "Add successes to α and failures to β." },
        { q: "Mean of Beta(3, 7)?", options: ["0.3", "0.7", "0.43", "3"], answer: 0, explain: "α / (α + β)." },
        { q: "Bayesian inference treats the unknown rate as…", options: ["A random quantity with a distribution", "A fixed constant only", "Always 0.5", "Unknowable"], answer: 0, explain: "Beliefs are distributions." },
      ],
    },
  ],
};

export const DS06_GRADIENT_DESCENT: LearnModule = {
  id: "gradient-descent",
  title: "Gradient descent",
  titleHi: "ग्रेडिएंट डिसेंट",
  blurb: "How machines learn: start with a guess, measure the error, and step downhill. Estimate gradients numerically, choose step sizes, and fit a line with batch, mini-batch and stochastic gradient descent.",
  lessons: [
    {
      id: "gd-idea",
      title: "The idea: walk downhill",
      oneLine: "Most machine-learning models learn by minimising an error function. Gradient descent starts somewhere, computes the slope (gradient) at that point, and takes a small step in the downhill direction, again and again, until it reaches the bottom.",
      minutes: 18,
      blocks: [
        { t: "diagram", text: "error\n  │ ●  start\n  │  ╲\n  │   ●   step: x_new = x − learning_rate × slope\n  │    ╲\n  │     ●\n  │      ╲___●___ ← minimum (slope = 0)\n  └────────────────────── x" },
        { t: "h", text: "Step 1: Estimating a slope numerically" },
        py("Difference quotient vs the true derivative", src`
def f(x):
    return (x - 3) ** 2 + 2          # lowest point at x = 3

def true_derivative(x):
    return 2 * (x - 3)

def estimated_derivative(f, x, h=0.0001):
    return (f(x + h) - f(x)) / h      # rise over a tiny run

for x in [0, 2, 3, 5]:
    print(f"x={x}: true slope {true_derivative(x):5.1f}, estimated {estimated_derivative(f, x):8.4f}")
`, "x=0: true slope  -6.0, estimated  -5.9999\nx=2: true slope  -2.0, estimated  -1.9999\nx=3: true slope   0.0, estimated   0.0001\nx=5: true slope   4.0, estimated   4.0001"),
        { t: "p", text: "The slope is negative left of 3 (downhill to the right), zero at 3 (the bottom), and positive right of 3. Moving **against** the slope always heads downhill." },
        { t: "h", text: "Step 2: Gradient descent in one dimension" },
        py("Finding the minimum", src`
def gradient(x):
    return 2 * (x - 3)                # slope of (x - 3)**2 + 2

x = 10.0                              # a bad starting guess
learning_rate = 0.1
for step in range(1, 51):
    x = x - learning_rate * gradient(x)          # step downhill
    if step in (1, 2, 3, 10, 25, 50):
        print(f"step {step:>2}: x = {x:.4f}")
`, "step  1: x = 8.6000\nstep  2: x = 7.4800\nstep  3: x = 6.5840\nstep 10: x = 3.7516\nstep 25: x = 3.0264\nstep 50: x = 3.0001"),
        { t: "table", head: ["Step", "x", "gradient 2(x − 3)", "x − 0.1 × gradient"], rows: [["start", "10", "14", "10 − 1.4 = 8.6"], ["1", "8.6", "11.2", "8.6 − 1.12 = 7.48"], ["2", "7.48", "8.96", "7.48 − 0.896 = 6.584"]], caption: "Each step closes 20% of the remaining gap to 3" },
        { t: "h", text: "Step 3: Choosing the step size" },
        py("Learning rate too small, right, too big", src`
def gradient(x):
    return 2 * (x - 3)

for lr in [0.01, 0.1, 0.9, 1.1]:
    x = 10.0
    for _ in range(30):
        x -= lr * gradient(x)
    print(f"learning rate {lr:<4}: x after 30 steps = {x:.4f}")
`, "learning rate 0.01: x after 30 steps = 6.8184\nlearning rate 0.1 : x after 30 steps = 3.0087\nlearning rate 0.9 : x after 30 steps = 3.0087\nlearning rate 1.1 : x after 30 steps = 1664.6342"),
        { t: "p", text: "Too small (0.01): slow progress. Good (0.1): close to 3. Big but stable (0.9): jumps back and forth across the minimum but still converges. Too big (1.1): every step overshoots further, and x **explodes**. In practice, try a few rates and watch the error." },
        { t: "h", text: "Step 4: Many dimensions" },
        py("Minimising a function of 3 variables", src`
import random

def gradient(v):                      # f(v) = sum of squares, minimum at [0, 0, 0]
    return [2 * vi for vi in v]

random.seed(0)
v = [random.uniform(-10, 10) for _ in range(3)]
print("start:", [round(x, 3) for x in v])
for _ in range(100):
    v = [vi - 0.05 * gi for vi, gi in zip(v, gradient(v))]   # step every coordinate
print("after 100 steps:", [round(x, 3) for x in v])
`, "start: [6.888, 5.159, -1.589]\nafter 100 steps: [0.0, 0.0, -0.0]"),
        { t: "analogy", text: "You're on a hill in thick fog and want to reach the valley. You can't see far, but you can feel the slope under your feet. Take a step downhill, feel again, step again. The learning rate is your step length: tiny steps take forever, giant leaps may jump over the valley onto the other hill." },
        { t: "trap", text: "Gradient descent finds a **local** minimum: on bumpy error surfaces (neural networks), where you start matters. Features on very different scales make the surface a long narrow valley and slow descent down: scale your features first." },
        { t: "trick", text: "**x ← x − learning_rate × gradient. Repeat until the steps get tiny.**" },
        { t: "exam", items: ["Explain gradient descent in simple words.", "What is a learning rate? What happens if it's too large or too small?", "What is a gradient?", "What are local minima?", "Why does feature scaling help gradient descent?"] },
        { t: "recap", items: ["Models learn by minimising an error function", "The gradient points uphill; step the opposite way", "Estimate it numerically with (f(x + h) − f(x)) / h", "Learning rate controls step size: too big diverges", "Works in any number of dimensions"] },
      ],
      quiz: [
        { q: "In gradient descent, you move…", options: ["Opposite to the gradient", "Along the gradient", "Randomly", "To x = 0 always"], answer: 0, explain: "The gradient points uphill." },
        { q: "At a minimum, the gradient is…", options: ["0", "Very large", "Negative", "1"], answer: 0, explain: "The surface is flat at the bottom." },
        { q: "A learning rate that's too large can…", options: ["Overshoot and diverge", "Never move", "Find the exact answer in one step always", "Reduce the data size"], answer: 0, explain: "Steps get bigger and bigger." },
        { q: "x = 5, gradient = 4, learning rate 0.5. Next x?", options: ["3", "7", "4.5", "2"], answer: 0, explain: "5 − 0.5 × 4." },
      ],
    },
    {
      id: "fitting-with-gd",
      title: "Fitting a model: batch, mini-batch and stochastic gradient descent",
      oneLine: "To fit y = slope·x + intercept to data, gradient descent adjusts both numbers to reduce the squared error. Batch GD uses all data per step; mini-batch uses small random chunks; stochastic GD (SGD) uses one point at a time. Mini-batches are what deep learning uses.",
      minutes: 20,
      blocks: [
        { t: "formula", items: [["Model", "prediction = slope × x + intercept"], ["Error for one point", "(prediction − y)²"], ["Gradient for one point", "d/dslope = 2·error·x,   d/dintercept = 2·error   (error = prediction − y)"]] },
        py("Learning y = 20x + 5 from data", src`
import random

random.seed(0)
data = [(x, 20 * x + 5 + random.uniform(-2, 2)) for x in [i / 10 for i in range(-50, 50)]]

def point_gradient(x, y, slope, intercept):
    error = (slope * x + intercept) - y
    return 2 * error * x, 2 * error                 # how the squared error changes

def mean_gradient(batch, slope, intercept):
    grads = [point_gradient(x, y, slope, intercept) for x, y in batch]
    return sum(g[0] for g in grads) / len(batch), sum(g[1] for g in grads) / len(batch)

def mse(slope, intercept):
    return sum((slope * x + intercept - y) ** 2 for x, y in data) / len(data)

# 1) Batch gradient descent: all 100 points per step
slope, intercept = random.uniform(-1, 1), random.uniform(-1, 1)
for epoch in range(1, 1001):
    gs, gi = mean_gradient(data, slope, intercept)
    slope, intercept = slope - 0.01 * gs, intercept - 0.01 * gi
    if epoch in (1, 10, 100, 1000):
        print(f"batch epoch {epoch:>4}: slope {slope:7.3f} intercept {intercept:6.3f}  MSE {mse(slope, intercept):9.3f}")

# 2) Mini-batch: random chunks of 10 points
slope, intercept = 0.0, 0.0
for epoch in range(100):
    random.shuffle(data)
    for start in range(0, len(data), 10):
        gs, gi = mean_gradient(data[start:start + 10], slope, intercept)
        slope, intercept = slope - 0.01 * gs, intercept - 0.01 * gi
print(f"mini-batch:  slope {slope:.3f} intercept {intercept:.3f}")

# 3) Stochastic: one point at a time
slope, intercept = 0.0, 0.0
for epoch in range(100):
    random.shuffle(data)
    for x, y in data:
        gs, gi = point_gradient(x, y, slope, intercept)
        slope, intercept = slope - 0.001 * gs, intercept - 0.001 * gi
print(f"stochastic:  slope {slope:.3f} intercept {intercept:.3f}")
`, "batch epoch    1: slope   3.550 intercept  0.763  MSE  2276.612\nbatch epoch   10: slope  16.812 intercept  1.453  MSE   100.988\nbatch epoch  100: slope  20.020 intercept  4.708  MSE     1.518\nbatch epoch 1000: slope  20.024 intercept  5.344  MSE     1.114\nmini-batch:  slope 20.073 intercept 5.341\nstochastic:  slope 20.022 intercept 5.344"),
        { t: "p", text: "All three recover the true line (slope 20, intercept 5) up to the noise. Batch GD needs many full passes; mini-batch and stochastic GD update many times per pass, so they usually reach a good answer faster on big data." },
        { t: "table", head: ["Method", "Data per update", "Pros", "Cons"], rows: [["Batch GD", "All rows", "Smooth, stable steps", "Slow on big data"], ["Mini-batch GD", "32–512 rows", "Fast, works on GPUs, the deep-learning standard", "Needs a batch size"], ["Stochastic GD", "1 row", "Very fast updates, can escape shallow minima", "Noisy steps; needs a smaller learning rate"]] },
        { t: "analogy", text: "Batch GD is asking the whole class before every decision: accurate but slow. SGD is asking one random student: fast, a bit noisy. Mini-batch is asking a small group: almost as accurate as the whole class and almost as fast as asking one student." },
        { t: "trap", text: "**Epoch** means one full pass over the data, not one step. Shuffle the data every epoch for mini-batch and SGD, otherwise the order of the rows biases the steps. And with SGD, the error jumps around: judge progress by the error over the whole dataset." },
        { t: "trick", text: "**Same update rule; only the batch size changes: all (batch), some (mini-batch), one (SGD).**" },
        { t: "exam", items: ["Batch vs mini-batch vs stochastic gradient descent?", "What is an epoch?", "Why shuffle the data in SGD?", "Why is mini-batch GD used in deep learning?", "How do you know gradient descent has converged?"] },
        { t: "recap", items: ["Loss = mean squared error; gradients for slope and intercept", "Batch: all data per step", "Mini-batch: small random chunks (deep-learning standard)", "SGD: one point per step, noisy but fast", "Shuffle each epoch; tune the learning rate"] },
      ],
      quiz: [
        { q: "One epoch is…", options: ["One full pass over the training data", "One gradient step", "One batch of 32 rows", "One learning rate"], answer: 0, explain: "Many steps happen per epoch in mini-batch/SGD." },
        { q: "SGD updates the parameters using…", options: ["One data point at a time", "All data at once", "No data", "Only the test set"], answer: 0, explain: "Stochastic = random single points." },
        { q: "Deep learning usually trains with…", options: ["Mini-batch gradient descent", "Batch gradient descent only", "No gradients", "Closed-form formulas"], answer: 0, explain: "It fits GPU hardware." },
        { q: "For y = slope·x + b with error e = prediction − y, the gradient for b is…", options: ["2e", "2ex", "e²", "x"], answer: 0, explain: "d(e²)/db = 2e." },
      ],
    },
  ],
};
