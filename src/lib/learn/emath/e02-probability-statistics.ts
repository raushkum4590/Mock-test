import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Essential Math for Data Science, chapters 2–3: probability, then descriptive and inferential statistics. */
export const EM03_PROBABILITY: LearnModule = {
  id: "probability",
  title: "Probability",
  titleHi: "प्रायिकता",
  blurb: "Measure uncertainty: probability vs odds, joint and union probabilities, conditional probability and Bayes' theorem, then the binomial distribution (how many successes?) and the beta distribution (what is the underlying success rate?).",
  lessons: [
    {
      id: "probability-basics",
      title: "Probability, odds and simulation",
      oneLine: "A probability is a number from 0 to 1 saying how likely an event is; odds compare it with the chance it doesn't happen (P / (1 − P)). Probability reasons from a known process to likely data; statistics reasons from observed data back to the process.",
      minutes: 15,
      blocks: [
        py("Probability, odds and a simulation", src`
import random

def odds(p):
    return p / (1 - p)

def probability_from_odds(o):
    return o / (1 + o)

p_rain = 0.7
print(f"P(rain) = {p_rain} → odds {odds(p_rain):.2f} (about 7 to 3)")
print("odds 3:1 →", probability_from_odds(3))

random.seed(2)
rolls = [random.randint(1, 6) for _ in range(60_000)]
print("simulated P(six):", round(rolls.count(6) / len(rolls), 4), "| exact:", round(1 / 6, 4))
`, "P(rain) = 0.7 → odds 2.33 (about 7 to 3)\nodds 3:1 → 0.75\nsimulated P(six): 0.1661 | exact: 0.1667"),
        { t: "table", head: ["", "Probability", "Statistics"], rows: [["Starts from", "A known process (a fair die)", "Observed data (60 rolls)"], ["Asks", "How likely is this data?", "What process produced this data?"], ["Example", "P(two sixes in a row) = 1/36", "Is this die biased, given 20 sixes in 60 rolls?"]] },
        { t: "analogy", text: "Odds are how bookies talk (\"3 to 1\"), probabilities are how scientists talk (\"75%\"); they carry the same information. Simulating 60,000 dice rolls is checking a recipe by cooking it many times instead of trusting the book." },
        { t: "trap", text: "Probabilities must be between 0 and 1, and the probabilities of all possible outcomes must add up to 1. A 70% chance of rain doesn't mean it will rain 70% of the day: it means that on days like this, it rains about 7 times out of 10." },
        { t: "trick", text: "**odds = p / (1 − p); p = odds / (1 + odds). Probability: process → data. Statistics: data → process.**" },
        { t: "exam", items: ["What is the difference between probability and odds?", "Probability vs statistics?", "What does a 70% chance of rain mean?", "How can simulation estimate a probability?"] },
        { t: "recap", items: ["0 ≤ P ≤ 1; all outcomes sum to 1", "odds = p / (1 − p)", "Probability: from process to data", "Statistics: from data to process", "Simulation approximates probabilities"] },
      ],
      quiz: [
        { q: "P = 0.8. Odds?", options: ["4 (4 to 1)", "0.8", "0.25", "1.25"], answer: 0, explain: "0.8 / 0.2." },
        { q: "Odds of 1:1 means a probability of…", options: ["0.5", "1", "0", "0.25"], answer: 0, explain: "1 / (1 + 1)." },
        { q: "\"Given this data, is the coin fair?\" is a question of…", options: ["Statistics", "Probability only", "Calculus", "Linear algebra"], answer: 0, explain: "From data back to the process." },
        { q: "The probabilities of all outcomes add up to…", options: ["1", "0", "100", "Any number"], answer: 0, explain: "Something must happen." },
      ],
    },
    {
      id: "joint-union-bayes",
      title: "Joint, union and conditional probability, and Bayes' theorem",
      oneLine: "Joint probability: both A and B happen (multiply if independent). Union: A or B happens (add, then subtract the overlap). Conditional probability P(A | B): A happens given B happened. Bayes' theorem flips a conditional: from P(B | A) to P(A | B).",
      minutes: 22,
      blocks: [
        { t: "formula", items: [["Joint (independent)", "P(A and B) = P(A) × P(B)"], ["Joint (general)", "P(A and B) = P(B) × P(A | B)"], ["Union", "P(A or B) = P(A) + P(B) − P(A and B)"], ["Conditional", "P(A | B) = P(A and B) / P(B)"], ["Bayes' theorem", "P(A | B) = P(B | A) × P(A) / P(B)"]] },
        py("Dice, cards and a medical test", src`
from fractions import Fraction as F

p_head, p_six = F(1, 2), F(1, 6)
print("P(heads AND six):", p_head * p_six)                 # independent → multiply
print("P(heads OR six):", p_head + p_six - p_head * p_six) # subtract the overlap
print("P(king or heart):", F(4, 52) + F(13, 52) - F(1, 52))

# Bayes: a diabetes screening test
p_disease = 0.08                 # 8% of adults screened have diabetes (the prior)
p_pos_given_disease = 0.92       # sensitivity
p_pos_given_healthy = 0.10       # false-positive rate
p_pos = p_pos_given_disease * p_disease + p_pos_given_healthy * (1 - p_disease)
p_disease_given_pos = p_pos_given_disease * p_disease / p_pos
print(f"P(positive) = {p_pos:.4f}")
print(f"P(diabetes | positive) = {p_disease_given_pos:.3f}")
`, "P(heads AND six): 1/12\nP(heads OR six): 7/12\nP(king or heart): 4/13\nP(positive) = 0.1656\nP(diabetes | positive) = 0.444"),
        { t: "p", text: "Even with a 92%-sensitive test, a positive result means only about **44%** chance of diabetes here, because healthy people far outnumber sick ones and 10% of them test positive too. Confusing P(positive | disease) with P(disease | positive) is one of the most common reasoning errors, in medicine, courts and fraud detection." },
        { t: "table", head: ["Mistake", "Example", "Correct thinking"], rows: [["Ignoring the base rate", "\"The test is 92% accurate, so I'm 92% likely to be sick\"", "Use Bayes with the prior (8%)"], ["Adding without subtracting overlap", "P(king or heart) = 4/52 + 13/52", "Subtract the king of hearts once: 16/52"], ["Assuming independence", "Multiplying P(rain) × P(traffic jam)", "They're dependent: use P(jam | rain)"]] },
        { t: "analogy", text: "Bayes' theorem is how a good detective updates a suspicion: start with how common the crime is (prior), weigh how strongly the clue points to it (likelihood), and remember how often that clue appears in innocent cases too." },
        { t: "trap", text: "\"Mutually exclusive\" (can't both happen) is not \"independent\" (one doesn't affect the other). Rolling a 1 and a 6 on one die are mutually exclusive, and therefore very dependent: knowing one happened means the other didn't." },
        { t: "trick", text: "**AND (independent) → multiply. OR → add minus overlap. Given → divide by the condition. Flip a conditional → Bayes.**" },
        { t: "exam", items: ["State the sum rule and the product rule.", "Derive Bayes' theorem from the definition of conditional probability.", "A test is 99% accurate for a rare disease: what does a positive mean?", "Independent vs mutually exclusive?"] },
        { t: "recap", items: ["P(A and B) = P(A)P(B) if independent", "P(A or B) = P(A) + P(B) − P(A and B)", "P(A | B) = P(A and B) / P(B)", "Bayes flips conditionals using the prior", "Low base rates → many false positives"] },
      ],
      quiz: [
        { q: "P(heads on two coin tosses)?", options: ["1/4", "1/2", "1", "3/4"], answer: 0, explain: "½ × ½." },
        { q: "P(A) = 0.5, P(B) = 0.4, P(A and B) = 0.2. P(A or B)?", options: ["0.7", "0.9", "0.2", "0.1"], answer: 0, explain: "0.5 + 0.4 − 0.2." },
        { q: "Bayes' theorem lets you compute…", options: ["P(A | B) from P(B | A)", "Only joint probabilities", "Derivatives", "Means"], answer: 0, explain: "It flips conditionals." },
        { q: "Rolling a 2 and rolling a 5 on one roll are…", options: ["Mutually exclusive", "Independent", "Both", "Neither"], answer: 0, explain: "They can't happen together." },
      ],
    },
    {
      id: "binomial-beta",
      title: "Binomial and beta distributions",
      oneLine: "The binomial distribution gives the probability of k successes in n trials when the success rate p is known. The beta distribution works the other way: after seeing k successes and n − k failures, it describes what the unknown success rate p is likely to be.",
      minutes: 22,
      blocks: [
        py("Binomial: from scratch and with SciPy", src`
from math import comb
from scipy.stats import binom

def binomial_pmf(k, n, p):
    return comb(n, k) * p ** k * (1 - p) ** (n - k)    # ways × p^successes × (1-p)^failures

n, p = 10, 0.9                                          # a machine part passes a test 90% of the time
for k in range(6, 11):
    print(f"P({k:>2} of 10 pass) = {binomial_pmf(k, n, p):.4f}   scipy: {binom.pmf(k, n, p):.4f}")
print("P(8 or fewer pass):", round(binom.cdf(8, n, p), 4))
`, "P( 6 of 10 pass) = 0.0112   scipy: 0.0112\nP( 7 of 10 pass) = 0.0574   scipy: 0.0574\nP( 8 of 10 pass) = 0.1937   scipy: 0.1937\nP( 9 of 10 pass) = 0.3874   scipy: 0.3874\nP(10 of 10 pass) = 0.3487   scipy: 0.3487\nP(8 or fewer pass): 0.2639"),
        { t: "p", text: "Now flip the question. A new supplier's parts passed **8 of 10** tests. What is the supplier's true pass rate? We don't know p; the **beta distribution** Beta(successes + 1, failures + 1) describes how plausible each value of p is." },
        py("Beta: what's the underlying success rate?", src`
from scipy.stats import beta

a, b = 8 + 1, 2 + 1                         # 8 passes, 2 failures (+1 each: a flat starting belief)
print("most likely pass rate:", round((a - 1) / (a + b - 2), 2), "| mean:", round(beta.mean(a, b), 3))
print("P(true rate > 90%):", round(1 - beta.cdf(0.90, a, b), 3))
print("P(true rate between 70% and 90%):", round(beta.cdf(0.90, a, b) - beta.cdf(0.70, a, b), 3))
low, high = beta.ppf([0.05, 0.95], a, b)
print(f"90% credible interval: {low:.2f} to {high:.2f}")

a2, b2 = 80 + 1, 20 + 1                     # same 80% ratio, 10× the data
print("with 80/100: P(rate > 90%):", round(1 - beta.cdf(0.90, a2, b2), 4),
      "| interval:", [round(float(v), 2) for v in beta.ppf([0.05, 0.95], a2, b2)])
`, "most likely pass rate: 0.8 | mean: 0.75\nP(true rate > 90%): 0.09\nP(true rate between 70% and 90%): 0.598\n90% credible interval: 0.53 to 0.92\nwith 80/100: P(rate > 90%): 0.0009 | interval: [0.73, 0.86]"),
        { t: "p", text: "With only 10 tests, the true rate could easily be anywhere from about 0.53 to 0.92; there's still about a 9% chance it's above 90%. With 100 tests at the same 80% pass ratio, the interval shrinks a lot and a rate above 90% becomes very unlikely. More data → narrower beliefs." },
        { t: "analogy", text: "Binomial: \"if this bowler takes a wicket with 20% of overs, how likely are 3 wickets in 10 overs?\" Beta: \"this bowler took 3 wickets in 10 overs; what's their real wicket rate?\". Same numbers, opposite direction." },
        { t: "trap", text: "A small sample with a great ratio (9 out of 10) is much weaker evidence than a large one (900 out of 1,000). Always look at the spread of the beta distribution, not just the ratio. Ratings with few reviews are the everyday example." },
        { t: "trick", text: "**Known p → binomial (how many successes?). Observed successes → Beta(k + 1, n − k + 1) (what's p?).**" },
        { t: "exam", items: ["What does the binomial distribution model?", "Write the binomial formula.", "What does the beta distribution describe?", "Why does more data narrow the beta distribution?", "Compare a product with 5/5 stars from 2 reviews and 4.6/5 from 2,000 reviews."] },
        { t: "recap", items: ["Binomial: P(k successes in n trials | p)", "C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ", "Beta: plausible values of p after k successes, n − k failures", "Beta(k + 1, n − k + 1) with a flat starting belief", "More data → narrower beta"] },
      ],
      quiz: [
        { q: "Binomial: n = 3, p = 0.5. P(all 3 succeed)?", options: ["0.125", "0.5", "0.375", "1.5"], answer: 0, explain: "0.5³." },
        { q: "After 7 successes and 3 failures (flat prior), the beta parameters are…", options: ["Beta(8, 4)", "Beta(7, 3)", "Beta(10, 10)", "Beta(3, 7)"], answer: 0, explain: "Add 1 to each." },
        { q: "The beta distribution describes…", options: ["Possible values of an unknown probability", "The number of successes", "Waiting times", "Heights"], answer: 0, explain: "It lives between 0 and 1." },
        { q: "Same 80% ratio, 10× more data: the beta distribution becomes…", options: ["Narrower", "Wider", "Unchanged", "Uniform"], answer: 0, explain: "More certainty." },
      ],
    },
  ],
};

export const EM04_STATISTICS: LearnModule = {
  id: "statistics",
  title: "Descriptive and inferential statistics",
  titleHi: "वर्णनात्मक और अनुमानात्मक सांख्यिकी",
  blurb: "Describe data (mean, median, mode, population vs sample variance), use the normal distribution, z-scores and the inverse CDF, then infer from samples with the central limit theorem, confidence intervals, p-values, one- and two-tailed tests, and the t-distribution.",
  lessons: [
    {
      id: "descriptive",
      title: "Samples, bias and descriptive statistics",
      oneLine: "A population is everyone; a sample is who you measured, and bias creeps in when the sample isn't representative. Describe data with the mean (or weighted mean), median and mode, and its spread with variance and standard deviation: divide by n for a whole population, by n − 1 for a sample.",
      minutes: 18,
      blocks: [
        py("Centre and spread", src`
import statistics as st
import numpy as np

pets = [0, 1, 5, 7, 9, 10, 14]                          # pets owned by 7 people
print("mean:", round(st.mean(pets), 2), " median:", st.median(pets), " mode:", st.mode([1, 3, 3, 5, 3, 2]))

grades = [90, 80, 63, 87]                                # weighted mean: final exam counts double
weights = [1.0, 1.0, 1.0, 2.0]
print("weighted mean:", round(sum(g * w for g, w in zip(grades, weights)) / sum(weights), 2))

x = np.array(pets)
print("population variance:", round(x.var(), 3), " sd:", round(x.std(), 3))           # ÷ n
print("sample variance:", round(x.var(ddof=1), 3), " sd:", round(x.std(ddof=1), 3))   # ÷ (n − 1)
`, "mean: 6.57  median: 7  mode: 3\nweighted mean: 81.4\npopulation variance: 21.388  sd: 4.625\nsample variance: 24.952  sd: 4.995"),
        { t: "table", head: ["Bias", "What goes wrong", "Example"], rows: [["Sampling / selection bias", "Some groups are more likely to be measured", "A phone survey during office hours misses working people"], ["Self-selection bias", "People choose to take part", "Only angry customers write reviews"], ["Survivorship bias", "Failures aren't visible", "Studying only successful startups"], ["Confirmation bias", "Looking only for supporting data", "Stopping analysis once results look good"], ["Confounding", "A hidden variable drives both", "Ice-cream sales and drownings (summer)"]] },
        { t: "analogy", text: "A sample is a spoonful of soup: it tells you about the whole pot only if the pot was stirred (random sampling). The n − 1 correction is admitting that a spoonful slightly understates how varied the pot is." },
        { t: "trap", text: "NumPy's `var()` and `std()` divide by n (population) unless you pass `ddof=1`; pandas' `.var()` and `.std()` divide by n − 1 (sample). Use the sample version whenever your data is a sample of something bigger, which is almost always." },
        { t: "trick", text: "**Population ÷ n, sample ÷ (n − 1). Median for skew; weighted mean when importance differs.**" },
        { t: "exam", items: ["Population vs sample?", "Name types of sampling bias.", "Why divide by n − 1 for a sample variance?", "When is the median better than the mean?", "How do you compute a weighted mean?"] },
        { t: "recap", items: ["Samples must represent the population", "Mean, weighted mean, median, mode", "Variance = average squared deviation; SD = its square root", "Population ÷ n, sample ÷ (n − 1)", "NumPy needs ddof=1 for samples"] },
      ],
      quiz: [
        { q: "Median of [3, 9, 1, 7]?", options: ["5", "4", "7", "3"], answer: 0, explain: "Sorted 1 3 7 9 → (3 + 7) / 2." },
        { q: "Only customers who loved a product joined the survey. This is…", options: ["Self-selection bias", "Random sampling", "Confounding", "No bias"], answer: 0, explain: "People chose to take part." },
        { q: "np.std(x) by default divides by…", options: ["n", "n − 1", "n + 1", "2n"], answer: 0, explain: "Pass ddof=1 for a sample." },
        { q: "Weighted mean of 80 (weight 1) and 50 (weight 2)?", options: ["60", "65", "70", "55"], answer: 0, explain: "(80 + 100) / 3." },
      ],
    },
    {
      id: "normal-zscores",
      title: "The normal distribution, CDF, inverse CDF and z-scores",
      oneLine: "The normal (bell) curve is defined by its mean and standard deviation. Its PDF gives the curve's height, its CDF gives the probability up to a value, the inverse CDF finds the value for a probability, and a z-score says how many standard deviations a value is from the mean.",
      minutes: 20,
      blocks: [
        py("PDF, CDF, inverse CDF and z-scores", src`
from scipy.stats import norm

mean, sd = 42.5, 1.5                             # golden-retriever weights (kg), say
print("PDF at the mean:", round(norm.pdf(mean, mean, sd), 4))                     # a height, not a probability
print("P(weight < 43):", round(norm.cdf(43, mean, sd), 4))
print("P(42 < weight < 44):", round(norm.cdf(44, mean, sd) - norm.cdf(42, mean, sd), 4))
print("weight at the 95th percentile:", round(norm.ppf(0.95, mean, sd), 2))       # inverse CDF
print("middle 95% of dogs:", [round(float(v), 2) for v in norm.ppf([0.025, 0.975], mean, sd)])

def z(x, m, s):
    return (x - m) / s

house_a, house_b = 1_50_00_000, 82_00_000        # ₹ prices in two different cities
print("z-scores:", round(z(house_a, 1_10_00_000, 25_00_000), 2), round(z(house_b, 55_00_000, 12_00_000), 2))
`, "PDF at the mean: 0.266\nP(weight < 43): 0.6306\nP(42 < weight < 44): 0.4719\nweight at the 95th percentile: 44.97\nmiddle 95% of dogs: [39.56, 45.44]\nz-scores: 1.6 2.25"),
        { t: "p", text: "z-scores make values from different scales comparable: the ₹82 lakh house is more unusual in its city (z ≈ 2.25) than the ₹1.5 crore house is in its (z = 1.6), even though it's cheaper." },
        { t: "table", head: ["Function", "Question it answers"], rows: [["PDF `norm.pdf`", "How tall is the curve here? (likelihood, not probability)"], ["CDF `norm.cdf`", "What fraction is below x?"], ["Inverse CDF `norm.ppf`", "Which x has p of the data below it?"], ["z-score", "How many SDs from the mean? z = (x − μ) / σ"], ["Random draws `norm.rvs`", "Simulate values"]] },
        { t: "analogy", text: "The CDF is a running total of the crowd as you walk from the shortest to the tallest person: at 170 cm you've passed 85% of people. The inverse CDF asks the reverse: at what height have you passed 95%?" },
        { t: "trap", text: "Using the normal distribution on clearly skewed data (incomes, waiting times) gives wrong probabilities in the tails. Check the shape first (histogram, QQ plot). And the PDF's height isn't a probability; areas (CDF differences) are." },
        { t: "trick", text: "**cdf: value → share below. ppf: share → value. z = (x − μ)/σ.**" },
        { t: "exam", items: ["PDF vs CDF?", "What is the inverse CDF used for?", "What is a z-score? Why is it useful?", "State the 68-95-99.7 rule.", "When is the normal distribution a poor model?"] },
        { t: "recap", items: ["Normal = bell curve, defined by μ and σ", "cdf for probabilities, ppf for percentiles", "z-scores compare across scales", "About 95% lie within 1.96 SDs", "Check the shape before assuming normality"] },
      ],
      quiz: [
        { q: "norm.cdf(μ, μ, σ) equals…", options: ["0.5", "1", "0", "σ"], answer: 0, explain: "Half the data is below the mean." },
        { q: "Which finds the 90th-percentile value?", options: ["norm.ppf(0.9, μ, σ)", "norm.cdf(0.9)", "norm.pdf(0.9)", "norm.rvs(0.9)"], answer: 0, explain: "The inverse CDF." },
        { q: "Mean 100, SD 15. z-score of 130?", options: ["2", "30", "1.5", "0.5"], answer: 0, explain: "(130 − 100) / 15." },
        { q: "The PDF's value at x is…", options: ["A density, not a probability", "P(X = x)", "Always ≤ 0.5", "The CDF"], answer: 0, explain: "Probabilities are areas." },
      ],
    },
    {
      id: "clt-confidence",
      title: "The central limit theorem and confidence intervals",
      oneLine: "Take many samples from any population and average each one: the averages form a normal distribution centred on the true mean, with spread σ/√n (the central limit theorem). That's what lets us put a confidence interval around a sample mean: the range likely to contain the true mean.",
      minutes: 20,
      blocks: [
        py("CLT from a flat (uniform) population", src`
import numpy as np

rng = np.random.default_rng(3)
population = rng.uniform(0, 100, 1_000_000)            # flat: every value equally likely
print("population mean:", round(population.mean(), 2), "| sd:", round(population.std(), 2))

for n in [2, 10, 31]:
    means = rng.choice(population, size=(5000, n)).mean(axis=1)   # 5,000 samples of size n
    print(f"n={n:>2}: mean of means {means.mean():6.2f}, sd of means {means.std():5.2f}, "
          f"σ/√n = {population.std() / np.sqrt(n):5.2f}")

counts, edges = np.histogram(rng.choice(population, size=(5000, 31)).mean(axis=1), bins=8)
for c, left in zip(counts, edges):
    print(f"{left:5.1f} {'#' * (c // 40)}")
`, "population mean: 50.03 | sd: 28.87\nn= 2: mean of means  49.83, sd of means 20.54, σ/√n = 20.41\nn=10: mean of means  49.99, sd of means  9.23, σ/√n =  9.13\nn=31: mean of means  49.93, sd of means  5.25, σ/√n =  5.18\n 30.7\n 35.2 ##\n 39.6 ############\n 44.1 #################################\n 48.5 ########################################\n 53.0 ###########################\n 57.4 #######\n 61.8"),
        py("A 95% confidence interval for a mean", src`
import numpy as np
from scipy.stats import norm, t

rng = np.random.default_rng(8)
sample = rng.normal(250, 12, 40)                  # 40 measured chai cups (ml); true mean unknown to us
n, mean, sd = len(sample), sample.mean(), sample.std(ddof=1)
se = sd / np.sqrt(n)

z = norm.ppf(0.975)                               # 1.96
print(f"sample mean {mean:.1f} ml, standard error {se:.2f}")
print(f"95% CI (z): {mean - z * se:.1f} to {mean + z * se:.1f}")
tc = t.ppf(0.975, df=n - 1)                       # slightly wider: we estimated the SD
print(f"95% CI (t, df={n - 1}): {mean - tc * se:.1f} to {mean + tc * se:.1f}  (t* = {tc:.3f})")
`, "sample mean 248.0 ml, standard error 2.21\n95% CI (z): 243.7 to 252.4\n95% CI (t, df=39): 243.5 to 252.5  (t* = 2.023)"),
        { t: "formula", items: [["Standard error", "SE = s / √n"], ["Confidence interval", "x̄ ± critical value × SE"], ["Critical values", "95%: z = 1.96; 99%: z = 2.576; small samples use t with n − 1 degrees of freedom"]] },
        { t: "analogy", text: "One student's marks vary a lot; the average of a class of 31 varies far less, and averages of many classes pile up into a bell, whatever the shape of individual marks. That's the CLT. A confidence interval is a net thrown around your estimate: a wider net (99%) catches the truth more often." },
        { t: "trap", text: "The CLT is about **sample means**, not individual values: individual values keep their original shape. A 95% CI does not mean \"95% of the data lies in this range\"; it's about where the true **mean** is likely to be. Use t instead of z when n is small or σ is estimated." },
        { t: "trick", text: "**Means of samples → normal, sd σ/√n. CI = mean ± 1.96·SE (t for small samples).**" },
        { t: "exam", items: ["State the central limit theorem.", "What is the standard error?", "How do you compute a 95% confidence interval?", "When do you use the t-distribution instead of z?", "Interpret a 95% CI correctly."] },
        { t: "recap", items: ["Sample means are approximately normal (CLT)", "Their spread is σ/√n", "CI = x̄ ± critical value × SE", "t critical values for small samples", "CIs are about the mean, not individual values"] },
      ],
      quiz: [
        { q: "σ = 20, n = 100. Standard error?", options: ["2", "20", "0.2", "200"], answer: 0, explain: "20 / √100." },
        { q: "The CLT says the distribution of sample means is…", options: ["Approximately normal for large n", "The same as the population", "Uniform", "Always skewed"], answer: 0, explain: "Regardless of the population shape." },
        { q: "The z critical value for 95% confidence?", options: ["1.96", "1.645", "2.576", "1.00"], answer: 0, explain: "norm.ppf(0.975)." },
        { q: "For n = 8 with an estimated SD, use…", options: ["The t-distribution", "z = 1.96", "The binomial", "No interval"], answer: 0, explain: "t accounts for the extra uncertainty." },
      ],
    },
    {
      id: "hypothesis-testing",
      title: "p-values and hypothesis testing",
      oneLine: "A hypothesis test asks whether an observed effect could easily be chance. Assume no effect (the null hypothesis), compute the p-value (the probability of a result at least this extreme under the null), and reject the null if it's below a threshold like 0.05. One-tailed tests look in one direction, two-tailed in both.",
      minutes: 22,
      blocks: [
        py("Did the new route make deliveries faster?", src`
from scipy.stats import norm, t, ttest_1samp
import numpy as np

old_mean, old_sd = 32.0, 4.0                        # known history: delivery minutes
new_sample_mean, n = 30.6, 40                       # new route, 40 deliveries

se = old_sd / np.sqrt(n)
z = (new_sample_mean - old_mean) / se
p_one = norm.cdf(z)                                  # H1: new route is FASTER (one direction)
p_two = 2 * norm.cdf(-abs(z))                        # H1: new route is DIFFERENT (either direction)
print(f"z = {z:.2f}, one-tailed p = {p_one:.4f}, two-tailed p = {p_two:.4f}")
print("critical z for a one-tailed 5% test:", round(norm.ppf(0.05), 3))

rng = np.random.default_rng(5)
small = rng.normal(30.0, 4.0, 10)                   # only 10 deliveries, SD unknown
res = ttest_1samp(small, popmean=old_mean, alternative="less")
print(f"t-test on 10 deliveries: mean {small.mean():.1f}, t = {res.statistic:.2f}, p = {res.pvalue:.4f}")
print("t critical (df=9, one-tailed 5%):", round(t.ppf(0.05, 9), 3))
`, "z = -2.21, one-tailed p = 0.0134, two-tailed p = 0.0269\ncritical z for a one-tailed 5% test: -1.645\nt-test on 10 deliveries: mean 30.1, t = -1.56, p = 0.0771\nt critical (df=9, one-tailed 5%): -1.833"),
        { t: "table", head: ["Term", "Meaning"], rows: [["Null hypothesis H₀", "No effect (the new route isn't faster)"], ["Alternative H₁", "The effect you're testing for"], ["p-value", "P(result at least this extreme | H₀ true)"], ["α (significance level)", "Your threshold, usually 0.05, set before testing"], ["One-tailed", "Effect in one stated direction only"], ["Two-tailed", "Effect in either direction (the safer default)"], ["t-distribution", "Fatter-tailed bell for small samples with an estimated SD"]] },
        { t: "p", text: "A 1.4-minute improvement over 40 deliveries is statistically significant one-tailed and two-tailed here. With only 10 deliveries, the same kind of improvement is much less certain, which the t-test's larger p-value shows: small samples need bigger effects to be convincing." },
        { t: "h", text: "Big data and the Texas sharpshooter" },
        { t: "p", text: "A \"Texas sharpshooter\" fires at a barn, then paints a target around the tightest cluster of holes. With big data, it's easy to search thousands of patterns, find one that looks significant, and present it as if it had been predicted. Decide hypotheses **before** looking, correct for multiple tests, and confirm on new data." },
        { t: "analogy", text: "A hypothesis test is a courtroom: the null is \"innocent until proven guilty\", the p-value is how surprising the evidence would be if the defendant were innocent, and α is the standard of proof you agreed on before the trial." },
        { t: "trap", text: "A p-value is not the probability that the null hypothesis is true, and \"not significant\" doesn't prove there's no effect. Don't switch from two-tailed to one-tailed after seeing the data to get under 0.05, and report the size of the effect, not just the p-value." },
        { t: "trick", text: "**Assume no effect → compute how surprising the data is (p) → compare with α chosen in advance.**" },
        { t: "exam", items: ["What is a p-value?", "One-tailed vs two-tailed tests?", "What is the null hypothesis?", "When do you use a t-test?", "What is the Texas sharpshooter fallacy / p-hacking?"] },
        { t: "recap", items: ["H₀: no effect; H₁: the effect", "p-value: P(data this extreme | H₀)", "Reject H₀ if p < α (decided beforehand)", "Two-tailed by default; t-test for small samples", "Beware searching many patterns (sharpshooter)"] },
      ],
      quiz: [
        { q: "p = 0.03 with α = 0.05 means…", options: ["Reject the null hypothesis", "Accept the null as proven", "The effect is 3%", "There's a 3% chance H₀ is true"], answer: 0, explain: "The data is surprising under H₀." },
        { q: "A two-tailed p-value is (for a symmetric test)…", options: ["Twice the one-tailed p-value", "Half of it", "The same", "Always 0.05"], answer: 0, explain: "Both tails count." },
        { q: "With 8 observations and an estimated SD, use a…", options: ["t-test", "z-test with σ known", "Binomial test", "No test"], answer: 0, explain: "t accounts for small samples." },
        { q: "Painting the target after shooting is called…", options: ["The Texas sharpshooter fallacy", "Random sampling", "The CLT", "A confidence interval"], answer: 0, explain: "Finding patterns after the fact." },
      ],
    },
  ],
};
