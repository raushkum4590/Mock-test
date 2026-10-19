import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Statistics modules 3–4: sampling, the bootstrap and confidence intervals; probability distributions. */
export const ST03_SAMPLING: LearnModule = {
  id: "sampling",
  title: "Data and sampling",
  titleHi: "डेटा और सैंपलिंग",
  blurb: "Why a small random sample can describe millions of people, how bias ruins samples, how sample averages behave (the central limit theorem and standard error), and how to measure uncertainty with the bootstrap and confidence intervals.",
  lessons: [
    {
      id: "random-sampling",
      title: "Random sampling, bias and regression to the mean",
      oneLine: "A population is everyone you care about; a sample is the part you actually measure. A random sample gives every member an equal chance, so it represents the population fairly. Bias (a sample that systematically differs from the population) can't be fixed by collecting more data.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Population and sample" },
        { t: "table", head: ["Word", "Meaning", "Example"], rows: [
          ["Population", "Everyone or everything you want to know about", "All 14 crore voters of a state"],
          ["Sample", "The subset you actually measure", "5,000 voters in an exit poll"],
          ["Parameter", "A true number about the population (usually unknown)", "The true % voting for party X"],
          ["Statistic", "A number calculated from the sample", "42% in the exit poll"],
          ["Random sample", "Every member has the same chance of being picked", "Numbers drawn from the full voter list"],
          ["Stratified sample", "Random samples from each group (stratum) in the right proportions", "70% urban, 30% rural, like the state"],
        ] },
        { t: "h", text: "Step 2: Random beats big-but-biased" },
        py("Random vs biased sample", src`
import numpy as np

rng = np.random.default_rng(42)                     # a seed makes results repeatable
population = rng.normal(loc=160, scale=8, size=100_000)   # heights (cm) of 1 lakh people
print("Population mean:", round(population.mean(), 1))

sample = rng.choice(population, size=100, replace=False)  # 100 people picked at random
print("Random sample of 100:", round(sample.mean(), 1))

tallest = np.sort(population)[-5000:]               # e.g. surveying only a basketball club
biased = rng.choice(tallest, size=100, replace=False)
print("Biased sample of 100:", round(biased.mean(), 1))
`, "Population mean: 160.0\nRandom sample of 100: 160.8\nBiased sample of 100: 176.3"),
        { t: "p", text: "Just 100 random people get within a centimetre of the true mean of 1 lakh people. 100 people from the wrong place are off by more than 15 cm, and asking 10,000 basketball players wouldn't help: **more biased data is still biased**." },
        { t: "h", text: "Step 3: Kinds of bias" },
        { t: "table", head: ["Bias", "What goes wrong", "Example"], rows: [
          ["Selection bias", "The way people are chosen favours some of them", "An online poll only reaches internet users"],
          ["Non-response bias", "The people who answer differ from those who don't", "Only very happy or very angry customers fill feedback forms"],
          ["Survivorship bias", "You only see the ones that survived", "Studying only successful startups to find the \"secret\""],
          ["Data snooping", "Searching data until something looks significant", "Testing 100 ideas and reporting the 5 that \"worked\""],
          ["Self-selection", "People choose to be in the group", "Gym members are healthier, but the gym isn't the only reason"],
        ] },
        py("Stratified sampling with pandas", src`
import pandas as pd

df = pd.DataFrame({"area": ["Urban"] * 700 + ["Rural"] * 300, "id": range(1000)})
sample = df.groupby("area").sample(frac=0.1, random_state=1)   # 10% from EACH group
print(sample["area"].value_counts())
`, "area\nUrban    70\nRural    30\nName: count, dtype: int64"),
        { t: "h", text: "Step 4: Regression to the mean" },
        py("Top scorers usually drop next time", src`
import numpy as np

rng = np.random.default_rng(7)
ability = rng.normal(60, 10, 1000)               # each student's true level
test1 = ability + rng.normal(0, 10, 1000)        # score = ability + luck
test2 = ability + rng.normal(0, 10, 1000)        # new luck in the second test

top = test1 >= np.percentile(test1, 90)          # the top 10% in test 1
print("Top 10% in test 1 scored:", round(test1[top].mean(), 1))
print("Same students in test 2:", round(test2[top].mean(), 1))
`, "Top 10% in test 1 scored: 84.0\nSame students in test 2: 71.4", "Nobody got worse: part of their first score was good luck that didn't repeat. Extreme results tend to be followed by more ordinary ones."),
        { t: "analogy", text: "Tasting dal: you don't drink the whole pot to check the salt. One spoonful is enough **if you stir first** (random sampling). If you only taste from the top where the salt was just added (biased sampling), even ten spoonfuls will mislead you." },
        { t: "trap", text: "Regression to the mean fools people constantly: the \"rookie of the year\" has a weaker second season; a manager scolds a team after its worst month and then sees improvement, and credits the scolding. Part of an extreme result is luck, and luck doesn't repeat. Compare against a control group before claiming credit." },
        { t: "trick", text: "**Quality of the sample beats quantity. Stir before you taste.**" },
        { t: "exam", items: ["Population vs sample? Parameter vs statistic?", "What is selection bias? Give examples.", "What is stratified sampling and when do you use it?", "What is survivorship bias?", "Explain regression to the mean.", "Does a bigger sample fix bias? (No.)"] },
        { t: "recap", items: ["Sample = the part of the population you measure", "Random sampling gives everyone an equal chance", "Stratified sampling keeps group proportions", "Bias doesn't shrink with more data", "Extreme results are partly luck: regression to the mean"] },
      ],
      quiz: [
        { q: "A survey posted only on Instagram suffers from…", options: ["Selection bias", "No bias", "Regression to the mean", "Overfitting"], answer: 0, explain: "It only reaches Instagram users." },
        { q: "Does collecting 10× more data fix a biased sampling method?", options: ["No", "Yes", "Only for means", "Only for medians"], answer: 0, explain: "The bias stays." },
        { q: "Studying only famous successful dropouts to conclude \"dropping out leads to success\" is…", options: ["Survivorship bias", "Random sampling", "Stratification", "A valid study"], answer: 0, explain: "You don't see the failures." },
        { q: "The top scorer in one test usually scores a bit lower the next time because of…", options: ["Regression to the mean", "Selection bias", "Cheating", "Rounding"], answer: 0, explain: "Part of the extreme score was luck." },
      ],
    },
    {
      id: "sampling-distribution",
      title: "Sampling distributions, the CLT and standard error",
      oneLine: "If you took many samples and computed the mean of each, those means would form their own distribution: the sampling distribution. The central limit theorem says it's roughly bell-shaped for large samples, even if the data isn't. Its spread is the standard error: SE = s / √n.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "diagram", text: "Population (skewed waiting times)\n     │\n     ├── sample 1 (n = 30) → mean 28.4\n     ├── sample 2 (n = 30) → mean 31.9\n     ├── sample 3 (n = 30) → mean 29.7\n     │   … 2000 samples …\n     ▼\nThe 2000 means pile up in a BELL shape around the true mean.\nTheir spread (SD) is the STANDARD ERROR." },
        { t: "h", text: "Step 2: See it happen" },
        py("Central limit theorem in action", src`
import numpy as np

rng = np.random.default_rng(1)
population = rng.exponential(scale=30, size=1_000_000)    # waiting times: very right-skewed
print(f"Population mean {population.mean():.2f}, SD {population.std():.2f}")

for n in [5, 30, 100]:
    means = np.array([rng.choice(population, n).mean() for _ in range(2000)])
    print(f"n={n:>3}: mean of sample means {means.mean():.2f}, "
          f"SD of sample means {means.std():.2f}, SD/sqrt(n) = {population.std() / np.sqrt(n):.2f}")
`, "Population mean 29.94, SD 29.88\nn=  5: mean of sample means 30.30, SD of sample means 13.63, SD/sqrt(n) = 13.36\nn= 30: mean of sample means 29.89, SD of sample means 5.52, SD/sqrt(n) = 5.46\nn=100: mean of sample means 29.95, SD of sample means 3.07, SD/sqrt(n) = 2.99"),
        { t: "p", text: "Two things to notice: the sample means centre on the true mean (about 30), and their spread matches **SD / √n**, shrinking as n grows. That spread is the standard error." },
        py("The sample means form a bell", src`
import numpy as np

rng = np.random.default_rng(1)
population = rng.exponential(scale=30, size=1_000_000)
means = np.array([rng.choice(population, 30).mean() for _ in range(2000)])

counts, edges = np.histogram(means, bins=9)
for count, left in zip(counts, edges):
    print(f"{left:4.1f} | {'#' * (count // 15)}")
`, "14.7 | #\n18.7 | ########\n22.6 | ###########################\n26.6 | ########################################\n30.6 | ############################\n34.6 | #################\n38.6 | #######\n42.6 | #\n46.6 |"),
        { t: "h", text: "Step 3: Standard error" },
        { t: "formula", items: [["Standard error of the mean", "SE = s / √n   (s = sample standard deviation)"], ["Example", "25 customers, SD of spending ₹400 → SE = 400 / √25 = ₹80"], ["To halve the SE", "you need 4× the sample size (√4 = 2)"]] },
        { t: "table", head: ["", "Standard deviation (SD)", "Standard error (SE)"], rows: [["Measures", "Spread of individual values", "Spread (uncertainty) of a statistic like the mean"], ["Gets smaller with more data?", "No (it's a property of the data)", "Yes, ∝ 1/√n"], ["Answers", "\"How different are customers?\"", "\"How precise is my average?\""]] },
        { t: "analogy", text: "One student's marks vary a lot from test to test (SD). The class **average** varies much less from test to test, because highs and lows cancel out. The bigger the class, the steadier the average (smaller SE)." },
        { t: "trap", text: "Don't confuse SD and SE. Reporting SE when people expect SD makes data look far less variable than it is. And the CLT is about **means of samples**, not the data itself: individual waiting times stay skewed no matter how many you collect." },
        { t: "trick", text: "**SE = SD / √n. 4× the data → half the error.**" },
        { t: "exam", items: ["What is a sampling distribution?", "State the central limit theorem.", "What is the standard error? How is it different from standard deviation?", "How does sample size affect the standard error?", "Why is the CLT so important? (It lets us use normal-based formulas for means of non-normal data.)"] },
        { t: "recap", items: ["Sampling distribution = distribution of a statistic over many samples", "CLT: sample means are roughly normal for large n", "SE = s / √n measures the precision of the mean", "4× the sample size halves the SE", "SD describes data; SE describes an estimate"] },
      ],
      quiz: [
        { q: "SD of spending is ₹300 and n = 100. SE of the mean?", options: ["₹30", "₹300", "₹3", "₹3000"], answer: 0, explain: "300 / √100 = 30." },
        { q: "To halve the standard error, you need…", options: ["4× the sample size", "2× the sample size", "Half the sample size", "A different mean"], answer: 0, explain: "SE ∝ 1/√n." },
        { q: "The CLT says the distribution of sample means is approximately…", options: ["Normal (for large n)", "The same shape as the data", "Uniform", "Always skewed"], answer: 0, explain: "Even when the data is skewed." },
        { q: "Which shrinks as you collect more data?", options: ["Standard error", "Standard deviation of the data", "The population mean", "The range"], answer: 0, explain: "SD is a property of the data itself." },
      ],
    },
    {
      id: "bootstrap",
      title: "The bootstrap: resampling to measure uncertainty",
      oneLine: "The bootstrap estimates how much a statistic (mean, median, anything) would vary from sample to sample using only your one sample: draw many resamples WITH replacement, compute the statistic each time, and look at the spread. No formulas or normality assumptions needed.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The recipe" },
        { t: "points", items: ["Take your sample of n values.", "Draw n values from it **with replacement** (a value can be picked twice, another not at all). This is one bootstrap resample.", "Compute the statistic (for example the median) of the resample.", "Repeat thousands of times.", "The spread of those statistics estimates the standard error; their 2.5th and 97.5th percentiles give a 95% confidence interval."] },
        { t: "table", head: ["Resample of [3, 7, 8]", "Mean"], rows: [["7, 7, 3", "5.67"], ["8, 3, 8", "6.33"], ["3, 3, 3", "3.00"], ["8, 7, 3", "6.00"], ["7, 8, 8", "7.67"], ["…", "…"]], caption: "Each resample is the same size as the original and is drawn with replacement" },
        py("Bootstrap the median", src`
import numpy as np

rng = np.random.default_rng(3)
times = np.array([12, 15, 14, 10, 13, 16, 95, 11, 14, 18, 13, 12, 17, 15, 14])   # delivery minutes

boot_medians = np.array([
    np.median(rng.choice(times, size=len(times), replace=True))   # one resample's median
    for _ in range(5000)
])
print("Sample median:", np.median(times))
print("Bootstrap SE of the median:", round(boot_medians.std(ddof=1), 2))
print("95% interval:", np.percentile(boot_medians, [2.5, 97.5]).tolist())
`, "Sample median: 14.0\nBootstrap SE of the median: 0.8\n95% interval: [12.0, 16.0]"),
        { t: "p", text: "There's no simple formula for the standard error of a **median**, but the bootstrap gives one in four lines. The same code works for a trimmed mean, a ratio, a correlation, or a model's accuracy: just change the function." },
        py("Using SciPy's bootstrap", src`
import numpy as np
from scipy.stats import bootstrap

times = np.array([12, 15, 14, 10, 13, 16, 95, 11, 14, 18, 13, 12, 17, 15, 14])
res = bootstrap((times,), np.mean, n_resamples=5000, method="percentile",
                rng=np.random.default_rng(3))
low, high = res.confidence_interval
print(f"Mean {times.mean():.1f}, 95% CI {low:.1f} to {high:.1f}")
`, "Mean 19.3, 95% CI 13.1 to 30.7"),
        { t: "analogy", text: "You have one bag of 15 marbles from a huge factory. To guess how different another bag might look, you pretend your bag **is** the factory: you build thousands of new bags by picking marbles from yours (putting each back after picking). How much those pretend bags vary tells you how much real bags would vary." },
        { t: "trap", text: "The bootstrap **must** sample with replacement and use the same size n; without replacement you'd just get the original sample back. It can't fix a biased or tiny sample: it only shows the uncertainty already in your data. It also works poorly for extreme statistics like the maximum." },
        { t: "trick", text: "**Resample with replacement, same size, thousands of times, measure the spread.**" },
        { t: "exam", items: ["What is the bootstrap? Explain the algorithm.", "Why sample with replacement?", "When would you use the bootstrap instead of a formula? (Medians, ratios, model metrics, non-normal data.)", "What is bagging? (Bootstrap aggregating: training models on bootstrap samples; see Random forests.)"] },
        { t: "recap", items: ["Bootstrap = resample your sample with replacement", "Compute the statistic on each resample", "The spread of results ≈ standard error", "Percentiles of results give a confidence interval", "Works for almost any statistic; can't fix bias"] },
      ],
      quiz: [
        { q: "Bootstrap resamples are drawn…", options: ["With replacement, the same size as the sample", "Without replacement", "From a new population", "Half the size of the sample"], answer: 0, explain: "Otherwise you'd get the same sample." },
        { q: "The SD of the bootstrap statistics estimates the…", options: ["Standard error", "Population mean", "Sample size", "Median"], answer: 0, explain: "How much the statistic varies." },
        { q: "A key advantage of the bootstrap is…", options: ["No formula or normality assumption is needed", "It removes bias", "It needs no data", "It's exact"], answer: 0, explain: "It works for medians, ratios and more." },
        { q: "Bagging in machine learning stands for…", options: ["Bootstrap aggregating", "Bag of words", "Batch gradients", "Backward graphing"], answer: 0, explain: "Used by random forests." },
      ],
    },
    {
      id: "confidence-intervals",
      title: "Confidence intervals",
      oneLine: "A confidence interval gives a range of plausible values for a population number, instead of a single guess. A 95% CI is built by a method that captures the true value in 95% of samples. More data makes it narrower; more confidence makes it wider.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: From a point to a range" },
        { t: "p", text: "Saying \"customers spend ₹1,195 a month on average\" sounds precise, but it came from 20 customers. A confidence interval is more honest: \"**₹1,101 to ₹1,289, with 95% confidence**\"." },
        { t: "formula", items: [["CI for a mean (t method)", "x̄ ± t* × SE, where SE = s / √n"], ["t* for 95%, n = 20", "about 2.09 (from the t-distribution with n − 1 = 19 degrees of freedom)"], ["Bootstrap CI", "the 2.5th and 97.5th percentiles of the bootstrap means"]] },
        py("Two ways to get a 95% CI", src`
import numpy as np
from scipy import stats

spend = np.array([1200, 950, 1430, 1100, 870, 1600, 1320, 990, 1150, 1280,
                  1050, 1400, 1180, 920, 1500, 1250, 1010, 1350, 1120, 1230])
mean, se = spend.mean(), stats.sem(spend)                    # sem = s / sqrt(n)
low, high = stats.t.interval(0.95, df=len(spend) - 1, loc=mean, scale=se)
print(f"Mean ₹{mean:.0f}, SE ₹{se:.1f}")
print(f"t-based 95% CI: ₹{low:.0f} to ₹{high:.0f}")

rng = np.random.default_rng(0)
boot = [rng.choice(spend, len(spend)).mean() for _ in range(5000)]
print(f"Bootstrap 95% CI: ₹{np.percentile(boot, 2.5):.0f} to ₹{np.percentile(boot, 97.5):.0f}")
`, "Mean ₹1195, SE ₹44.7\nt-based 95% CI: ₹1101 to ₹1289\nBootstrap 95% CI: ₹1111 to ₹1280"),
        py("Confidence level vs width", src`
import numpy as np
from scipy import stats

spend = np.array([1200, 950, 1430, 1100, 870, 1600, 1320, 990, 1150, 1280,
                  1050, 1400, 1180, 920, 1500, 1250, 1010, 1350, 1120, 1230])
mean, se = spend.mean(), stats.sem(spend)
for level in [0.80, 0.90, 0.95, 0.99]:
    low, high = stats.t.interval(level, df=len(spend) - 1, loc=mean, scale=se)
    print(f"{level:.0%} CI: ₹{low:.0f} to ₹{high:.0f}  (width ₹{high - low:.0f})")
`, "80% CI: ₹1136 to ₹1254  (width ₹119)\n90% CI: ₹1118 to ₹1272  (width ₹155)\n95% CI: ₹1101 to ₹1289  (width ₹187)\n99% CI: ₹1067 to ₹1323  (width ₹256)"),
        { t: "h", text: "Step 2: What \"95% confidence\" really means" },
        { t: "p", text: "Imagine repeating the survey 100 times, each time with 20 new customers, and building a 95% CI each time. About **95 of those 100 intervals** would contain the true average. Any single interval either contains it or doesn't; the 95% describes the method's success rate." },
        { t: "table", head: ["Change", "Effect on the CI"], rows: [["Larger sample size n", "Narrower (SE shrinks)"], ["Higher confidence (99% vs 95%)", "Wider"], ["More variable data (bigger SD)", "Wider"]] },
        { t: "analogy", text: "Weather forecasts say \"25–30°C tomorrow\", not \"27.3°C\". A confidence interval is a forecast for an unknown number: a wider range is more likely to be right but less useful; a narrower range needs more data to be trustworthy." },
        { t: "trap", text: "\"There's a 95% probability the true mean is in ₹1,101–₹1,289\" is the common wrong interpretation (in classical statistics, the true mean is fixed, not random). Say \"we're 95% confident\" or describe the method's 95% success rate. Also, a CI only covers **sampling error**: it can't account for a biased sample." },
        { t: "trick", text: "**CI = estimate ± (critical value × SE). More data → narrower. More confidence → wider.**" },
        { t: "exam", items: ["What is a confidence interval? Interpret a 95% CI.", "How do sample size and confidence level affect the width?", "How do you compute a CI for a mean?", "How do you compute a bootstrap confidence interval?", "Difference between a confidence interval and a prediction interval? (A PI is for one future value, so it's wider.)"] },
        { t: "recap", items: ["A CI is a range of plausible values for a population number", "Mean CI: x̄ ± t* × s/√n", "Bootstrap CI: percentiles of resampled statistics", "95% = the method captures the truth 95% of the time", "Bigger n → narrower; higher confidence → wider"] },
      ],
      quiz: [
        { q: "Increasing the sample size makes a CI…", options: ["Narrower", "Wider", "No change", "Always include 0"], answer: 0, explain: "SE gets smaller." },
        { q: "A 99% CI compared with a 95% CI (same data) is…", options: ["Wider", "Narrower", "The same", "Not possible"], answer: 0, explain: "More confidence needs a wider net." },
        { q: "The right interpretation of a 95% CI is…", options: ["The method captures the true value in 95% of samples", "95% of the data lies inside it", "The true value moves around", "There's a 5% chance the data is wrong"], answer: 0, explain: "It's about the procedure." },
        { q: "A bootstrap 95% CI uses which percentiles of the bootstrap statistics?", options: ["2.5th and 97.5th", "5th and 95th", "25th and 75th", "0th and 100th"], answer: 0, explain: "5% split equally between the two tails." },
      ],
    },
  ],
};

export const ST04_DISTRIBUTIONS: LearnModule = {
  id: "distributions",
  title: "Probability distributions",
  titleHi: "प्रायिकता वितरण",
  blurb: "The shapes data comes in: the normal distribution and z-scores, long-tailed data and the t-distribution, the binomial for yes/no outcomes, and Poisson, exponential and Weibull for counts and waiting times.",
  lessons: [
    {
      id: "normal",
      title: "The normal distribution and z-scores",
      oneLine: "The normal distribution is the symmetric bell curve described by its mean and standard deviation. About 68% of values lie within 1 SD of the mean, 95% within 2 SD and 99.7% within 3 SD. A z-score says how many SDs a value is from the mean.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The bell curve and the 68-95-99.7 rule" },
        { t: "diagram", text: "                    ▁▃▅▇█▇▅▃▁\n               ▁▂▄▆█████████▆▄▂▁\n          ▁▂▃▅▇███████████████████▇▅▃▂▁\n   ───────┼──────┼──────┼──────┼──────┼──────┼──────┼───────\n         -3σ    -2σ    -1σ     μ     +1σ    +2σ    +3σ\n                        └─ 68% ──┘\n                 └──────── 95% ────────┘\n          └──────────────── 99.7% ───────────────┘" },
        { t: "formula", items: [["z-score", "z = (x − mean) / SD"], ["Example", "Heights: mean 160 cm, SD 8 cm. A 176 cm person: z = (176 − 160) / 8 = 2 → taller than about 97.7% of people"], ["Standardising", "converting every value to z (mean 0, SD 1) puts different units on one scale"]] },
        py("Normal probabilities with SciPy", src`
from scipy.stats import norm

mean, sd = 160, 8                                   # heights in cm
print("P(height < 170):", round(norm.cdf(170, mean, sd), 4))      # area to the left
print("P(height > 176):", round(1 - norm.cdf(176, mean, sd), 4))
print("Top 5% are taller than:", round(norm.ppf(0.95, mean, sd), 1), "cm")   # inverse
print("z for 176 cm:", (176 - mean) / sd)
`, "P(height < 170): 0.8944\nP(height > 176): 0.0228\nTop 5% are taller than: 173.2 cm\nz for 176 cm: 2.0"),
        { t: "table", head: ["Function", "Answers", "Example"], rows: [["`norm.cdf(x, m, s)`", "P(X ≤ x)", "What fraction is shorter than 170?"], ["`norm.ppf(p, m, s)`", "The value with fraction p below it", "What height is the 95th percentile?"], ["`norm.pdf(x, m, s)`", "Height of the curve at x", "Used for drawing and likelihoods"], ["`norm.rvs(m, s, size)`", "Random values", "Simulations"]] },
        py("Checking the 68-95-99.7 rule", src`
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(0, 1, 100_000)
for k in [1, 2, 3]:
    print(f"within {k} SD: {np.mean(np.abs(x) < k):.3f}")
`, "within 1 SD: 0.684\nwithin 2 SD: 0.955\nwithin 3 SD: 0.997"),
        { t: "h", text: "Step 2: Is my data normal? The QQ plot" },
        { t: "p", text: "A **QQ plot** puts your data's sorted z-scores against the values a perfect normal distribution would give. If the points lie on a straight line, the data is roughly normal; curving away at the ends means long tails or skew. `scipy.stats.probplot` computes it, and its r value measures how straight the line is." },
        py("QQ straightness for normal vs skewed data", src`
import numpy as np
from scipy import stats

rng = np.random.default_rng(5)
normal_data = rng.normal(50, 10, 500)
skewed_data = rng.exponential(10, 500)
for name, data in [("normal", normal_data), ("skewed", skewed_data)]:
    (_, _), (slope, intercept, r) = stats.probplot(data)
    print(f"{name}: QQ r = {r:.3f}")
`, "normal: QQ r = 0.999\nskewed: QQ r = 0.904"),
        { t: "analogy", text: "Heights in a big crowd look like a bell: most people are near average and very few are extremely tall or short, equally on both sides. A z-score is like a rank across different exams: z = 2 in maths and z = 2 in Hindi are equally impressive, even if the raw marks differ." },
        { t: "trap", text: "Most real data (incomes, prices, waiting times, web traffic) is **not** normal: it's skewed or long-tailed. The normal distribution matters mostly because of the CLT (sample means are roughly normal) and for measurement errors. Check the shape before using normal-based formulas on raw data." },
        { t: "trick", text: "**68-95-99.7 within 1-2-3 SD. z = (x − mean) / SD. cdf = left area, ppf = reverse.**" },
        { t: "exam", items: ["What is the normal distribution? Its properties?", "State the empirical (68-95-99.7) rule.", "What is a z-score? What is standardisation?", "How do you check whether data is normal? (Histogram, QQ plot, tests like Shapiro-Wilk.)", "Why is the normal distribution important in statistics?"] },
        { t: "recap", items: ["Bell-shaped, symmetric, defined by mean and SD", "68% / 95% / 99.7% within 1 / 2 / 3 SD", "z = (x − mean) / SD", "norm.cdf for probabilities, norm.ppf for percentiles", "QQ plot: a straight line ≈ normal"] },
      ],
      quiz: [
        { q: "About what % of a normal distribution lies within 2 SD of the mean?", options: ["95%", "68%", "99.7%", "50%"], answer: 0, explain: "The 68-95-99.7 rule." },
        { q: "Mean 70, SD 5. z-score of 80?", options: ["2", "10", "0.5", "−2"], answer: 0, explain: "(80 − 70) / 5." },
        { q: "norm.ppf(0.5, 100, 15) is…", options: ["100", "0.5", "15", "50"], answer: 0, explain: "The median of a normal is its mean." },
        { q: "Points curving away from the line at both ends of a QQ plot suggest…", options: ["Long tails", "Perfect normality", "Too few bins", "A mean of 0"], answer: 0, explain: "More extreme values than a normal would have." },
      ],
    },
    {
      id: "long-tails-t",
      title: "Long tails and the t-distribution",
      oneLine: "Many real datasets have long tails: extreme values happen far more often than a normal curve predicts. The t-distribution looks like a normal curve with fatter tails; it's used for small samples, because estimating the SD from few values adds extra uncertainty.",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Long tails in real data" },
        py("How often do extreme days happen?", src`
import numpy as np

rng = np.random.default_rng(11)
normal_days = rng.normal(0, 1, 100_000)
fat_days = rng.standard_t(df=3, size=100_000)          # long-tailed, like daily stock returns
fat_days = fat_days / fat_days.std()                    # same SD, to compare fairly
for name, x in [("normal", normal_days), ("long-tailed", fat_days)]:
    print(f"{name:<12} days beyond 4 SD: {np.sum(np.abs(x) > 4)}")
`, "normal       days beyond 4 SD: 4\nlong-tailed  days beyond 4 SD: 651"),
        { t: "p", text: "Under a normal curve, a 4-SD day should happen about 6 times in 1 lakh days. Long-tailed data produces many more. Stock-market crashes, viral posts and huge insurance claims are \"rare events\" that are much less rare than a bell curve suggests." },
        { t: "h", text: "Step 2: The t-distribution" },
        { t: "p", text: "When the sample is small, the sample SD is itself uncertain. **Student's t-distribution** accounts for that with fatter tails. Its shape depends on the **degrees of freedom** (df = n − 1 for one mean): with more data, t becomes the normal curve." },
        py("t critical values approach 1.96", src`
from scipy.stats import norm, t

print("normal:", round(norm.ppf(0.975), 3))           # the 95% two-sided critical value
for df in [2, 5, 10, 30, 100]:
    print(f"t with df={df:>3}:", round(t.ppf(0.975, df), 3))
`, "normal: 1.96\nt with df=  2: 4.303\nt with df=  5: 2.571\nt with df= 10: 2.228\nt with df= 30: 2.042\nt with df=100: 1.984"),
        { t: "p", text: "With 3 data points (df = 2), a 95% interval needs ±4.3 SEs instead of ±1.96: small samples get wider intervals. From about 30 data points on, t and normal are almost the same." },
        { t: "analogy", text: "Planning a trip based on a normal curve is like assuming the train is never more than 20 minutes late because it usually isn't. Long-tailed reality: every few months it's 6 hours late. The t-distribution is a cautious planner who keeps extra buffer when they've only taken the train a few times." },
        { t: "trap", text: "Using normal-based risk estimates on long-tailed data badly underestimates extreme events (a famous cause of financial losses). For small-sample means, use t (scipy's `t.interval`, `ttest_ind`), not z values like 1.96." },
        { t: "trick", text: "**Small sample → t-distribution. Real-world extremes → expect long tails.**" },
        { t: "exam", items: ["What is a long-tailed distribution? Examples.", "What is the t-distribution? When is it used?", "What are degrees of freedom?", "How does the t-distribution change as the sample size grows?", "What is kurtosis? (A measure of tail heaviness.)"] },
        { t: "recap", items: ["Long tails: extremes are more common than the normal predicts", "t-distribution: like the normal but with fatter tails", "df = n − 1 for one sample mean", "Large df → t ≈ normal (critical value → 1.96)", "Use t for small-sample means and CIs"] },
      ],
      quiz: [
        { q: "The t-distribution compared with the normal has…", options: ["Fatter tails", "Thinner tails", "Two peaks", "No mean"], answer: 0, explain: "Extra uncertainty from estimating the SD." },
        { q: "As the sample size grows, the t-distribution…", options: ["Approaches the normal", "Gets more skewed", "Gets fatter tails", "Becomes uniform"], answer: 0, explain: "By df ≈ 30 they're very close." },
        { q: "Degrees of freedom for a one-sample t-test with n = 15?", options: ["14", "15", "16", "1"], answer: 0, explain: "n − 1." },
        { q: "Daily stock returns are typically…", options: ["Long-tailed", "Perfectly normal", "Uniform", "Binomial"], answer: 0, explain: "Crashes happen more than a bell curve predicts." },
      ],
    },
    {
      id: "binomial",
      title: "The binomial distribution (yes/no outcomes)",
      oneLine: "The binomial distribution counts successes in n independent yes/no trials, each with the same probability p: how many of 10 visitors buy, how many of 20 calls convert. Its mean is n × p and its variance n × p × (1 − p).",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The formula, by hand" },
        { t: "p", text: "10 customers visit a store; each buys with probability 0.2, independently. What's the chance exactly 2 buy?" },
        { t: "formula", items: [["Binomial probability", "P(X = k) = C(n, k) × p^k × (1 − p)^(n − k)"], ["C(n, k)", "the number of ways to choose which k trials succeed = n! / (k! (n − k)!)"], ["Here", "C(10, 2) × 0.2² × 0.8⁸ = 45 × 0.04 × 0.1678 ≈ 0.302"], ["Mean and variance", "mean = np = 2 buyers, variance = np(1 − p) = 1.6"]] },
        py("Binomial by formula and with SciPy", src`
from math import comb
from scipy.stats import binom

n, p = 10, 0.2
print("By formula:", round(comb(n, 2) * p**2 * (1 - p)**8, 4))
print("P(X = 2):", round(binom.pmf(2, n, p), 4))
print("P(X <= 1):", round(binom.cdf(1, n, p), 4))        # 0 or 1 buyers
print("P(X >= 4):", round(1 - binom.cdf(3, n, p), 4))    # 4 or more
print("Mean:", binom.mean(n, p), "Variance:", round(binom.var(n, p), 2))

for k in range(6):                                        # the whole distribution
    print(k, f"{binom.pmf(k, n, p):.3f}", "#" * round(binom.pmf(k, n, p) * 50))
`, "By formula: 0.302\nP(X = 2): 0.302\nP(X <= 1): 0.3758\nP(X >= 4): 0.1209\nMean: 2.0 Variance: 1.6\n0 0.107 #####\n1 0.268 #############\n2 0.302 ###############\n3 0.201 ##########\n4 0.088 ####\n5 0.026 #"),
        { t: "h", text: "Step 2: Simulating it" },
        py("10,000 simulated days", src`
import numpy as np

rng = np.random.default_rng(2)
buyers = rng.binomial(n=10, p=0.2, size=10_000)       # buyers out of 10 visitors, each day
print("Average buyers per day:", buyers.mean())
print("Fraction of days with exactly 2:", np.mean(buyers == 2))
`, "Average buyers per day: 1.9977\nFraction of days with exactly 2: 0.2927"),
        { t: "table", head: ["Condition", "Means"], rows: [["Fixed number of trials n", "10 visitors, not \"until someone buys\""], ["Two outcomes", "Buy / don't buy"], ["Same probability p each time", "Every visitor has a 20% chance"], ["Independent trials", "One visitor buying doesn't change another's chance"]], caption: "When all four hold, the count of successes is binomial" },
        { t: "analogy", text: "Taking 10 penalty kicks with a 70% success rate: the binomial tells you the chance of scoring exactly 7, at least 9, or fewer than 5. Every yes/no business metric (clicks, sign-ups, defaults) works the same way." },
        { t: "trap", text: "Binomial needs **independent** trials with the same p. If one customer's purchase influences friends, or p changes through the day, the binomial is only an approximation. For large n with moderate p, the binomial looks normal (mean np, SD √(np(1−p))), which is what A/B tests use." },
        { t: "trick", text: "**n trials, p each, count the yeses: mean = np, variance = np(1 − p).**" },
        { t: "exam", items: ["What is the binomial distribution? Its conditions?", "Mean and variance of a binomial?", "Probability of exactly k heads in n coin tosses.", "What is a Bernoulli trial? (A single yes/no trial: binomial with n = 1.)", "When can a binomial be approximated by a normal?"] },
        { t: "recap", items: ["Counts successes in n independent trials with probability p", "P(X = k) = C(n, k) p^k (1 − p)^(n − k)", "Mean np, variance np(1 − p)", "scipy: binom.pmf, binom.cdf; numpy: rng.binomial", "Large n → approximately normal"] },
      ],
      quiz: [
        { q: "100 visitors, conversion rate 5%. Expected conversions?", options: ["5", "50", "0.05", "95"], answer: 0, explain: "np = 100 × 0.05." },
        { q: "Variance of a binomial with n = 10, p = 0.5?", options: ["2.5", "5", "0.25", "10"], answer: 0, explain: "np(1 − p) = 10 × 0.5 × 0.5." },
        { q: "binom.cdf(3, n, p) gives…", options: ["P(X ≤ 3)", "P(X = 3)", "P(X > 3)", "P(X ≥ 3)"], answer: 0, explain: "Cumulative: 3 or fewer." },
        { q: "Which situation is NOT binomial?", options: ["Counting customers until the first one buys", "Heads in 20 tosses", "Defective items in a batch of 50", "Clicks among 1,000 ad views"], answer: 0, explain: "The number of trials isn't fixed (that's geometric)." },
      ],
    },
    {
      id: "poisson-exponential",
      title: "Poisson, exponential and Weibull: counts and waiting times",
      oneLine: "Poisson counts events in a fixed time or space (calls per hour, typos per page) with average rate λ. The exponential models the waiting time between such events. The Weibull generalises it for things that wear out (machines, tyres) or fail early.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Poisson: how many events?" },
        { t: "formula", items: [["Poisson probability", "P(X = k) = λ^k × e^(−λ) / k!"], ["Mean and variance", "both equal λ"], ["Example", "a help desk gets λ = 4 calls per hour; P(no calls in an hour) = e^(−4) ≈ 0.018"]] },
        py("Calls per hour", src`
from scipy.stats import poisson

lam = 4                                              # average calls per hour
print("P(0 calls):", round(poisson.pmf(0, lam), 4))
print("P(exactly 4):", round(poisson.pmf(4, lam), 4))
print("P(more than 7):", round(1 - poisson.cdf(7, lam), 4))
print("Staff for 99% of hours:", poisson.ppf(0.99, lam), "calls")   # capacity planning
`, "P(0 calls): 0.0183\nP(exactly 4): 0.1954\nP(more than 7): 0.0511\nStaff for 99% of hours: 9.0 calls"),
        { t: "h", text: "Step 2: Exponential: how long until the next event?" },
        { t: "formula", items: [["Exponential", "if events happen at rate λ, the wait W has mean 1/λ and P(W > t) = e^(−λt)"], ["Example", "a bus comes every 15 minutes on average (λ = 1/15 per minute); P(wait > 30 min) = e^(−2) ≈ 0.135"]] },
        py("Waiting for a bus", src`
from scipy.stats import expon

mean_wait = 15                                       # minutes
print("P(wait > 30 min):", round(expon.sf(30, scale=mean_wait), 4))   # sf = 1 - cdf
print("P(wait < 5 min):", round(expon.cdf(5, scale=mean_wait), 4))
print("Median wait:", round(expon.median(scale=mean_wait), 1), "min")
`, "P(wait > 30 min): 0.1353\nP(wait < 5 min): 0.2835\nMedian wait: 10.4 min"),
        { t: "h", text: "Step 3: Weibull: when do things fail?" },
        { t: "table", head: ["Weibull shape k", "Failure rate over time", "Example"], rows: [["k < 1", "Decreasing: early failures", "Electronics that fail in the first days or never"], ["k = 1", "Constant (= exponential)", "Random accidents"], ["k > 1", "Increasing: wear-out", "Tyres, bearings, batteries"]] },
        py("Survival of machine parts", src`
from scipy.stats import weibull_min

k, scale = 2.0, 1000                                 # wear-out parts, typical life ~1000 hours
for hours in [500, 1000, 1500]:
    print(f"P(still working after {hours} h): {weibull_min.sf(hours, k, scale=scale):.3f}")
`, "P(still working after 500 h): 0.779\nP(still working after 1000 h): 0.368\nP(still working after 1500 h): 0.105"),
        { t: "analogy", text: "Poisson answers \"how many customers will walk in this hour?\". Exponential answers \"how long until the next one walks in?\". Same process, two questions. Weibull answers \"how long until this machine breaks?\", where old machines may be more (or less) likely to break." },
        { t: "trap", text: "Poisson assumes events are independent with a constant rate. Restaurant orders peak at lunch and dinner, so model each hour with its own λ, not one daily average. If the variance is much larger than the mean, the data is **over-dispersed** and a plain Poisson model will underestimate the busy hours." },
        { t: "trick", text: "**Count in a window → Poisson(λ). Time between events → exponential(mean 1/λ). Wear-out → Weibull.**" },
        { t: "exam", items: ["What is the Poisson distribution? Examples?", "Mean and variance of a Poisson?", "How are Poisson and exponential related?", "What is the memoryless property of the exponential? (The wait remaining doesn't depend on how long you've waited.)", "What is the Weibull distribution used for?"] },
        { t: "recap", items: ["Poisson: counts per interval, mean = variance = λ", "Exponential: time between events, mean 1/λ", "Weibull: failure times; shape k sets early failure vs wear-out", "scipy: poisson, expon, weibull_min (pmf/cdf/sf/ppf)", "Use different rates for different times of day"] },
      ],
      quiz: [
        { q: "Calls arrive at λ = 3 per hour. Expected calls in an hour?", options: ["3", "1/3", "9", "e^−3"], answer: 0, explain: "The Poisson mean is λ." },
        { q: "If events happen at 2 per minute, the mean wait between events is…", options: ["0.5 minutes", "2 minutes", "1 minute", "4 minutes"], answer: 0, explain: "1/λ." },
        { q: "A Poisson distribution's variance equals its…", options: ["Mean", "Square of the mean", "Median", "Zero"], answer: 0, explain: "Both are λ." },
        { q: "Weibull shape k > 1 means parts…", options: ["Wear out: failures increase with age", "Fail early", "Never fail", "Fail at a constant rate"], answer: 0, explain: "k = 1 is the exponential." },
      ],
    },
  ],
};
