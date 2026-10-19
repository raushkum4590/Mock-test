import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Statistics module 5: statistical experiments and significance testing. */
export const ST05_EXPERIMENTS: LearnModule = {
  id: "experiments",
  title: "Experiments and significance testing",
  titleHi: "प्रयोग और महत्व परीक्षण",
  blurb: "Run A/B tests the right way, decide whether a difference is real or luck (hypothesis tests, permutation tests, p-values, t-tests), avoid the multiple-testing trap, compare many groups (ANOVA, chi-square), and plan sample sizes and bandit tests.",
  lessons: [
    {
      id: "ab-testing",
      title: "A/B testing: designing an experiment",
      oneLine: "An A/B test randomly splits users into a control group (A, the current version) and a treatment group (B, the new version), measures one pre-chosen metric, and compares. Randomisation makes the groups alike in every other way, so a difference can be credited to the change.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The parts of an A/B test" },
        { t: "table", head: ["Part", "Meaning", "Example"], rows: [
          ["Treatment", "The change you're testing", "A green \"Buy now\" button instead of grey"],
          ["Control group (A)", "Users who see the current version", "Grey button"],
          ["Treatment group (B)", "Users who see the new version", "Green button"],
          ["Randomisation", "A coin flip decides each user's group", "So both groups have similar users"],
          ["Metric", "The ONE number you'll compare, chosen before the test", "Conversion rate = buyers / visitors"],
          ["Blinding", "Users (and ideally analysts) don't know the group", "Prevents expectations from affecting results"],
        ] },
        { t: "p", text: "**Why random?** If you show the green button only to mobile users, any difference might come from mobile vs desktop, not from the colour. A coin flip spreads mobile users, new users, rich users… evenly across both groups." },
        py("Randomly assigning 4,000 users", src`
import numpy as np
import pandas as pd

rng = np.random.default_rng(10)
users = pd.DataFrame({"user_id": range(1, 4001)})
users["group"] = rng.permutation(np.repeat(["A", "B"], 2000))     # a fair 50/50 split
true_rate = users["group"].map({"A": 0.10, "B": 0.12})             # unknown in real life!
users["converted"] = rng.random(4000) < true_rate                  # simulate who buys

print(users.groupby("group")["converted"].agg(["count", "sum", "mean"]))
`, "       count  sum   mean\ngroup\nA       2000  174  0.087\nB       2000  226  0.113", "The true rates were 10% and 12%, but this run measured 8.7% and 11.3%: that wobble is sampling noise, and it is exactly why we need significance tests."),
        { t: "h", text: "Step 2: Reading the result" },
        { t: "p", text: "Suppose the final counts are **A: 200 buyers of 2,000 (10.0%)** and **B: 240 of 2,000 (12.0%)**. The absolute difference is 2 percentage points; the **relative lift** is 2 / 10 = **20%**. The next lessons answer the real question: could a 2-point gap happen by pure luck even if the button made no difference?" },
        { t: "formula", items: [["Conversion rate", "buyers / visitors"], ["Absolute difference", "12.0% − 10.0% = 2.0 percentage points"], ["Relative lift", "(12.0 − 10.0) / 10.0 = 20%"]] },
        { t: "h", text: "Step 3: Rules for a trustworthy test" },
        { t: "points", items: ["**Decide the metric and the test length before starting.** Choosing afterwards is cherry-picking.", "**Randomise at the right level:** per user, not per page view, so one person always sees one version.", "**Run full weeks:** weekday and weekend users behave differently.", "**Don't stop early** the first time B looks better (\"peeking\" inflates false positives).", "**Check the split:** if you asked for 50/50 and got 55/45, something is broken (a sample ratio mismatch)."] },
        { t: "analogy", text: "An A/B test is a fair cricket trial: to decide whether a new bat helps, give it to a randomly chosen half of the team for the same matches, not just to the best batters. Otherwise you're measuring the batters, not the bat." },
        { t: "trap", text: "Before/after comparisons (\"sales rose after the redesign\") aren't experiments: festivals, ads and seasons change too. Without a control group running at the same time, you can't separate the change from everything else." },
        { t: "trick", text: "**Random split, one metric chosen in advance, same time period, no peeking.**" },
        { t: "exam", items: ["What is an A/B test? Walk me through designing one.", "Why randomise?", "What are a control group and a treatment group?", "How do you choose the metric? What is a guardrail metric? (A metric that must not get worse, like page load time.)", "What is peeking and why is it a problem?", "What is a sample ratio mismatch?"] },
        { t: "recap", items: ["Control (A) vs treatment (B), assigned at random", "Pick one primary metric before the test", "Randomisation balances everything except the change", "Compare rates: absolute difference and relative lift", "No peeking; run full weeks; check the split"] },
      ],
      quiz: [
        { q: "Why are users assigned to A or B at random?", options: ["So the groups are alike except for the change", "To make the test faster", "To get more users", "Randomness isn't needed"], answer: 0, explain: "It removes hidden differences between the groups." },
        { q: "A converts at 5%, B at 6%. Relative lift?", options: ["20%", "1%", "6%", "120%"], answer: 0, explain: "(6 − 5) / 5." },
        { q: "When should the success metric be chosen?", options: ["Before the test starts", "After seeing the results", "Halfway through", "It doesn't matter"], answer: 0, explain: "Otherwise you'll cherry-pick." },
        { q: "\"Sales rose after we changed the logo\" is weak evidence because…", options: ["There's no control group at the same time", "Logos don't matter", "Sales can't be measured", "The sample is too big"], answer: 0, explain: "Other things changed too." },
      ],
    },
    {
      id: "hypothesis-tests",
      title: "Hypothesis tests and the permutation test",
      oneLine: "A hypothesis test asks: if the change made NO difference (the null hypothesis), how surprising is the gap we saw? A permutation test answers by shuffling the group labels thousands of times to see how big the gap gets by chance alone.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Null and alternative hypotheses" },
        { t: "table", head: ["Term", "Meaning", "For the button test"], rows: [
          ["Null hypothesis H₀", "Nothing is going on; any gap is chance", "Green and grey convert equally"],
          ["Alternative H₁", "What you hope to show", "Green converts differently (or better)"],
          ["Two-sided test", "H₁: different in either direction", "Green is better OR worse"],
          ["One-sided test", "H₁: different in one stated direction", "Green is better"],
        ] },
        { t: "p", text: "The logic is like a court: assume innocence (H₀) and only reject it if the evidence would be very surprising under innocence. We never \"prove\" H₁; we find out whether the data is hard to explain by chance." },
        { t: "h", text: "Step 2: A permutation test by hand" },
        { t: "p", text: "Seconds spent on a page, 8 users per version. **A: 21, 35, 18, 42, 30, 25, 38, 27** (mean 29.5). **B: 45, 31, 52, 40, 36, 48, 29, 50** (mean 41.375). B's mean is **11.875 s** higher. Is that luck?" },
        { t: "points", items: ["If H₀ is true, the labels A and B are meaningless: any of the 16 values could have been in either group.", "So **put all 16 values in one box, shuffle, and deal 8 to \"A\" and 8 to \"B\"**. Record the difference in means.", "Repeat 10,000 times. This shows how big the difference gets **by chance alone**.", "The **p-value** is the fraction of shuffles with a difference at least as big as the real 11.875."] },
        py("Permutation test", src`
import numpy as np

a = np.array([21, 35, 18, 42, 30, 25, 38, 27])
b = np.array([45, 31, 52, 40, 36, 48, 29, 50])
observed = b.mean() - a.mean()
print("Observed difference:", observed)

rng = np.random.default_rng(4)
combined = np.concatenate([a, b])
diffs = []
for _ in range(10_000):
    shuffled = rng.permutation(combined)                 # throw away the labels
    diffs.append(shuffled[8:].mean() - shuffled[:8].mean())
diffs = np.array(diffs)

p_one_sided = np.mean(diffs >= observed)                 # "B better" only
p_two_sided = np.mean(np.abs(diffs) >= abs(observed))    # either direction
print("Largest chance difference:", round(diffs.max(), 2))
print("p-value (one-sided):", p_one_sided)
print("p-value (two-sided):", p_two_sided)
`, "Observed difference: 11.875\nLargest chance difference: 16.12\np-value (one-sided): 0.0091\np-value (two-sided): 0.0183"),
        { t: "p", text: "Shuffling very rarely produced a gap as large as the real one, so chance is a poor explanation: the evidence suggests B really keeps people longer. SciPy can do the same in one call:" },
        py("scipy.stats.permutation_test", src`
import numpy as np
from scipy import stats

a = np.array([21, 35, 18, 42, 30, 25, 38, 27])
b = np.array([45, 31, 52, 40, 36, 48, 29, 50])
res = stats.permutation_test((b, a), lambda x, y: x.mean() - y.mean(),
                             n_resamples=10_000, alternative="greater",
                             rng=np.random.default_rng(4))
print("Statistic:", res.statistic, "p-value:", round(res.pvalue, 4))
`, "Statistic: 11.875 p-value: 0.0087"),
        { t: "analogy", text: "Shuffling is asking \"what if the labels were stuck on at random?\". If random labels almost never create a gap as big as the real one, the real labels (A vs B) probably matter." },
        { t: "trap", text: "\"Not significant\" doesn't mean \"no effect\": with small samples, real effects often fail to reach significance. And choose one-sided vs two-sided **before** looking at the data; switching to one-sided afterwards to get a smaller p-value is cheating." },
        { t: "trick", text: "**Assume nothing's going on, shuffle the labels, and see how rare the real gap is.**" },
        { t: "exam", items: ["What are the null and alternative hypotheses?", "One-tailed vs two-tailed tests?", "Explain a permutation test.", "Why do we \"fail to reject\" rather than \"accept\" the null?", "What is a resampling method?"] },
        { t: "recap", items: ["H₀: no real difference; H₁: a real difference", "Permutation test: shuffle labels, rebuild the chance distribution", "p-value = fraction of shuffles at least as extreme as observed", "Two-sided by default; decide before looking", "Small p → chance is a poor explanation"] },
      ],
      quiz: [
        { q: "The null hypothesis in an A/B test usually says…", options: ["There's no difference between A and B", "B is better", "A is better", "The test is broken"], answer: 0, explain: "We look for evidence against it." },
        { q: "In a permutation test, what gets shuffled?", options: ["The group labels", "The metric's definition", "The users' names", "Nothing"], answer: 0, explain: "That simulates \"labels don't matter\"." },
        { q: "If 30 of 10,000 shuffles beat the real difference, the p-value is about…", options: ["0.003", "0.3", "30", "0.03"], answer: 0, explain: "30 / 10,000." },
        { q: "A large p-value means…", options: ["The data is consistent with chance", "The null is proven true", "The effect is huge", "The test failed to run"], answer: 0, explain: "We fail to reject H₀." },
      ],
    },
    {
      id: "p-values-t-tests",
      title: "p-values, significance, errors and t-tests",
      oneLine: "The p-value is the probability of seeing a result at least this extreme if the null hypothesis were true. If it's below a pre-chosen alpha (usually 0.05), the result is called statistically significant. t-tests (for means) and z-tests (for proportions) compute p-values with formulas.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Alpha and the two kinds of error" },
        { t: "table", head: ["", "H₀ really true (no effect)", "H₀ really false (real effect)"], rows: [
          ["**Reject H₀** (say \"significant\")", "**Type I error** (false positive), probability α", "Correct ✔ (probability = power)"],
          ["**Don't reject H₀**", "Correct ✔", "**Type II error** (false negative), probability β"],
        ] },
        { t: "p", text: "**α (alpha)** is the false-positive rate you accept, chosen in advance: usually 0.05 (5%). **Power** = 1 − β is the chance of detecting a real effect; aim for 80% or more." },
        { t: "h", text: "Step 2: A z-test for two proportions, by hand" },
        { t: "p", text: "A: 200 of 2,000 bought (10%). B: 240 of 2,000 (12%)." },
        { t: "formula", items: [["Pooled rate", "p = (200 + 240) / 4000 = 0.11"], ["Standard error of the difference", "SE = √(p(1 − p)(1/n₁ + 1/n₂)) = √(0.11 × 0.89 × 0.001) ≈ 0.00989"], ["z statistic", "z = (0.12 − 0.10) / 0.00989 ≈ 2.02"], ["Two-sided p-value", "P(|Z| ≥ 2.02) ≈ 0.043 < 0.05 → significant at 5%"]] },
        py("Two-proportion z-test", src`
from statsmodels.stats.proportion import proportions_ztest   # pip install statsmodels

conversions = [240, 200]          # B, A
visitors = [2000, 2000]
z, p = proportions_ztest(conversions, visitors)
print(f"z = {z:.3f}, p-value = {p:.4f}")
print("Significant at 5%?", p < 0.05)
`, "z = 2.021, p-value = 0.0432\nSignificant at 5%? True"),
        { t: "h", text: "Step 3: The t-test for means" },
        py("Welch's t-test", src`
import numpy as np
from scipy import stats

a = np.array([21, 35, 18, 42, 30, 25, 38, 27])        # seconds on page, version A
b = np.array([45, 31, 52, 40, 36, 48, 29, 50])        # version B
t_stat, p = stats.ttest_ind(b, a, equal_var=False)    # Welch: doesn't assume equal variances
print(f"t = {t_stat:.3f}, two-sided p = {p:.4f}")
`, "t = 2.774, two-sided p = 0.0149"),
        { t: "table", head: ["Test", "Use for", "SciPy / statsmodels"], rows: [
          ["Two-sample t-test (Welch)", "Compare two group means", "`stats.ttest_ind(b, a, equal_var=False)`"],
          ["Paired t-test", "Same people before vs after", "`stats.ttest_rel(after, before)`"],
          ["One-sample t-test", "A mean vs a fixed value", "`stats.ttest_1samp(x, 50)`"],
          ["Two-proportion z-test", "Compare two rates (conversions)", "`proportions_ztest(counts, nobs)`"],
          ["Mann-Whitney U", "Compare two groups without assuming normality", "`stats.mannwhitneyu(b, a)`"],
        ] },
        { t: "h", text: "Step 4: What a p-value is NOT" },
        { t: "points", items: ["It is **not** the probability that H₀ is true.", "It is **not** the probability that the result is due to chance.", "It does **not** measure the size or importance of the effect: with millions of users, a 0.01% difference can be \"significant\" yet worthless.", "p = 0.049 and p = 0.051 are practically the same evidence. Report the effect size and a confidence interval, not just \"significant or not\"."] },
        { t: "analogy", text: "A smoke alarm: α is how often it beeps when there's no fire (burnt toast = Type I error). β is how often it stays silent during a real fire (Type II error). Making it less sensitive reduces false alarms but misses more fires. Bigger samples are like a better alarm: fewer of both." },
        { t: "trap", text: "\"p < 0.05 so the new design is better\" skips the most important question: **by how much?** Always report the effect size (2 percentage points, 20% lift) with its confidence interval. Statistical significance isn't the same as practical (business) significance." },
        { t: "trick", text: "**p = how surprising the data is if nothing's going on. Small p + meaningful effect size = act.**" },
        { t: "exam", items: ["What is a p-value? Explain it to a non-technical manager.", "What are Type I and Type II errors?", "What is statistical power?", "What is alpha? Why 0.05?", "Statistical vs practical significance?", "When do you use a t-test vs a z-test vs Mann-Whitney?"] },
        { t: "recap", items: ["p-value = P(data at least this extreme | H₀ true)", "p < α (usually 0.05) → statistically significant", "Type I = false positive (α); Type II = false negative (β); power = 1 − β", "z-test for proportions, t-test for means", "Report the effect size and CI, not just p"] },
      ],
      quiz: [
        { q: "A Type I error is…", options: ["A false positive: claiming an effect that isn't real", "A false negative", "A calculation error", "A biased sample"], answer: 0, explain: "Its probability is α." },
        { q: "p = 0.03 with α = 0.05 means…", options: ["Statistically significant", "Not significant", "H₀ is 3% likely to be true", "The effect is 3%"], answer: 0, explain: "p is below α." },
        { q: "Power is the probability of…", options: ["Detecting a real effect", "A false positive", "Getting p = 0.05", "Rejecting a true null"], answer: 0, explain: "Power = 1 − β." },
        { q: "With 10 million users, a tiny 0.01% difference is significant. You should…", options: ["Check if the effect size matters for the business", "Launch immediately", "Ignore the p-value", "Increase alpha"], answer: 0, explain: "Statistical ≠ practical significance." },
        { q: "Which test compares the same people before and after?", options: ["Paired t-test", "Two-sample t-test", "Chi-square test", "ANOVA"], answer: 0, explain: "stats.ttest_rel." },
      ],
    },
    {
      id: "multiple-testing-anova",
      title: "Multiple testing, degrees of freedom and ANOVA",
      oneLine: "Test 20 useless ideas at α = 0.05 and you'll probably \"find\" at least one significant result by luck. Corrections like Bonferroni control this. ANOVA tests whether several group means differ, using one test instead of many pairwise t-tests.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The multiple-testing trap" },
        { t: "formula", items: [["P(at least one false positive in m tests)", "1 − (1 − α)^m"], ["20 tests at α = 0.05", "1 − 0.95²⁰ ≈ 0.64: a 64% chance of at least one fluke"], ["Bonferroni correction", "test each at α / m = 0.05 / 20 = 0.0025"]] },
        py("20 tests where nothing is going on", src`
import numpy as np
from scipy import stats

rng = np.random.default_rng(8)
p_values = []
for _ in range(20):                                    # 20 metrics, NO real effects
    a = rng.normal(100, 15, 50)
    b = rng.normal(100, 15, 50)                         # same distribution as a
    p_values.append(stats.ttest_ind(a, b).pvalue)
p_values = np.array(p_values)

print("Significant at 0.05 (no correction):", np.sum(p_values < 0.05))
print("Significant after Bonferroni:", np.sum(p_values < 0.05 / 20))
print("Smallest p-value:", round(p_values.min(), 4))
print("Chance of >= 1 fluke in 20 tests:", round(1 - 0.95**20, 3))
`, "Significant at 0.05 (no correction): 2\nSignificant after Bonferroni: 0\nSmallest p-value: 0.0055\nChance of >= 1 fluke in 20 tests: 0.642"),
        { t: "table", head: ["Correction", "Idea", "In Python"], rows: [["Bonferroni", "Use α / m for each test (strict)", "`p < 0.05 / m`"], ["Holm", "Step-down version of Bonferroni, a bit more power", "`statsmodels...multipletests(p, method=\"holm\")`"], ["Benjamini-Hochberg (FDR)", "Controls the share of false discoveries; good for many tests", "`scipy.stats.false_discovery_control(p)`"]] },
        { t: "h", text: "Step 2: Degrees of freedom" },
        { t: "p", text: "If you know the mean of 10 numbers and 9 of the numbers, the 10th is fixed. Only 9 are **free to vary**: the degrees of freedom are n − 1. Tests use df to pick the right t, F or chi-square distribution. With big data, df barely matters; with small samples it changes the result noticeably." },
        { t: "h", text: "Step 3: ANOVA (comparing 3+ groups)" },
        { t: "p", text: "Delivery times (minutes) on three routes. Instead of three separate t-tests (A–B, A–C, B–C, which brings back the multiple-testing problem), **one-way ANOVA** asks a single question: are all the means equal?" },
        py("One-way ANOVA", src`
from scipy import stats

route_a = [30, 32, 29, 35, 31]
route_b = [28, 27, 30, 26, 29]
route_c = [34, 36, 33, 38, 35]
f_stat, p = stats.f_oneway(route_a, route_b, route_c)
print(f"F = {f_stat:.2f}, p = {p:.6f}")

res = stats.tukey_hsd(route_a, route_b, route_c)        # which pairs differ?
print(res)
`, "F = 16.92, p = 0.000322\nPairwise Group Comparisons (95.0% Confidence Interval)\nComparison  Statistic  p-value  Lower CI  Upper CI\n (0 - 1)      3.400     0.044     0.096     6.704\n (0 - 2)     -3.800     0.025    -7.104    -0.496\n (1 - 0)     -3.400     0.044    -6.704    -0.096\n (1 - 2)     -7.200     0.000   -10.504    -3.896\n (2 - 0)      3.800     0.025     0.496     7.104\n (2 - 1)      7.200     0.000     3.896    10.504", "Groups 0, 1, 2 are routes A, B, C. Every pair differs at the 5% level; route B is the fastest."),
        { t: "formula", items: [["F statistic", "F = variation BETWEEN group means / variation WITHIN groups"], ["Large F", "the groups differ more than the noise inside them → small p"], ["Then", "a post-hoc test (Tukey HSD) tells you WHICH pairs differ"]] },
        { t: "analogy", text: "Multiple testing is like buying 20 lottery tickets and being amazed one of them won ₹100. Of course something \"wins\" if you try enough times. ANOVA is like asking the class \"do any of these three teaching methods make a difference?\" before comparing them pair by pair." },
        { t: "trap", text: "Dashboards with 50 metrics and 10 segments are a multiple-testing machine: something always looks significant. Decide your primary metric in advance and treat the rest as exploratory ideas to re-test. ANOVA only says \"some means differ\"; it doesn't say which." },
        { t: "trick", text: "**More tests → more flukes. Correct (Bonferroni/FDR) or pre-register one primary metric.**" },
        { t: "exam", items: ["What is the multiple comparisons problem? How do you correct for it?", "Bonferroni vs Benjamini-Hochberg?", "What are degrees of freedom?", "What is ANOVA? What does the F-statistic measure?", "Why not run many t-tests instead of ANOVA?"] },
        { t: "recap", items: ["m tests at α → P(≥ 1 false positive) = 1 − (1 − α)^m", "Bonferroni: α / m; FDR (BH) for many tests", "df = values free to vary (often n − 1)", "ANOVA tests if several means are equal: F = between / within", "Post-hoc tests (Tukey) find which pairs differ"] },
      ],
      quiz: [
        { q: "10 independent tests at α = 0.05 with no real effects. Expected false positives?", options: ["0.5", "5", "0", "10"], answer: 0, explain: "10 × 0.05." },
        { q: "Bonferroni threshold for 10 tests at α = 0.05?", options: ["0.005", "0.05", "0.5", "0.01"], answer: 0, explain: "α / m." },
        { q: "ANOVA is used to compare…", options: ["The means of three or more groups", "Two proportions", "Correlations", "Variances only"], answer: 0, explain: "With one F-test." },
        { q: "After a significant ANOVA, which test tells you which groups differ?", options: ["A post-hoc test like Tukey HSD", "Another ANOVA", "A chi-square test", "None is needed"], answer: 0, explain: "ANOVA only says some means differ." },
      ],
    },
    {
      id: "chi-square",
      title: "The chi-square test (counts in categories)",
      oneLine: "The chi-square test checks whether counts in categories match what you'd expect if there were no relationship, for example whether click rates differ across three ad headlines. It compares observed counts with expected counts: χ² = Σ (observed − expected)² / expected.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Observed vs expected, by hand" },
        { t: "p", text: "Three headlines were each shown 1,000 times. Clicks: **H1 30, H2 18, H3 27** (75 clicks in total). If headlines made no difference, each would expect 75 / 3 = **25** clicks and 975 non-clicks." },
        { t: "table", head: ["", "H1", "H2", "H3"], rows: [["Clicks (observed)", "30", "18", "27"], ["Clicks (expected)", "25", "25", "25"], ["(O − E)² / E", "1.00", "1.96", "0.16"], ["No-clicks (observed)", "970", "982", "973"], ["No-clicks (expected)", "975", "975", "975"], ["(O − E)² / E", "0.026", "0.050", "0.004"]] },
        { t: "formula", items: [["χ²", "1.00 + 1.96 + 0.16 + 0.026 + 0.050 + 0.004 ≈ 3.2"], ["Degrees of freedom", "(rows − 1) × (columns − 1) = (2 − 1) × (3 − 1) = 2"], ["p-value", "P(χ² with 2 df ≥ 3.2) ≈ 0.20 → not significant"]] },
        py("chi2_contingency", src`
import numpy as np
from scipy.stats import chi2_contingency

observed = np.array([[30, 18, 27],          # clicks for H1, H2, H3
                     [970, 982, 973]])      # no clicks
chi2, p, dof, expected = chi2_contingency(observed)
print(f"chi2 = {chi2:.2f}, df = {dof}, p = {p:.3f}")
print(expected)
`, "chi2 = 3.20, df = 2, p = 0.202\n[[ 25.  25.  25.]\n [975. 975. 975.]]"),
        { t: "p", text: "A difference of 30 vs 18 clicks looks big, but with only 75 clicks in total it's well within what chance produces. To claim H1 is better, you'd need more impressions." },
        { t: "h", text: "Step 2: Small counts: Fisher's exact test" },
        py("Fisher's exact test", src`
from scipy.stats import fisher_exact

#            recovered  not recovered
table = [[9, 1],      # new medicine
         [4, 6]]      # placebo
odds_ratio, p = fisher_exact(table)
print(f"odds ratio = {odds_ratio:.1f}, p = {p:.4f}")
`, "odds ratio = 13.5, p = 0.0573", "9 of 10 recovered vs 4 of 10, yet p ≈ 0.057: with only 20 patients, even a big difference isn't conclusive. When expected counts are below about 5, the chi-square approximation is poor. Fisher's exact test calculates the exact probability instead."),
        { t: "analogy", text: "A chi-square test is a teacher checking whether a die is fair: roll it 600 times and you'd expect about 100 of each face. A few more 6s is normal; 200 sixes is suspicious. χ² adds up how far every count is from its expected value." },
        { t: "trap", text: "Chi-square works on **counts**, never on percentages or means: convert rates back to counts first. With very large samples, even trivial differences become significant, so look at the actual rates too. And for small expected counts (< 5), use Fisher's exact test." },
        { t: "trick", text: "**Counts in a table → chi-square. Expected = row total × column total / grand total.**" },
        { t: "exam", items: ["What is the chi-square test used for?", "How are expected counts calculated?", "Degrees of freedom for a contingency table?", "When do you use Fisher's exact test instead?", "Chi-square test of independence vs goodness of fit?"] },
        { t: "recap", items: ["χ² = Σ (O − E)² / E over all cells", "Expected = row total × column total / grand total", "df = (rows − 1)(columns − 1)", "scipy.stats.chi2_contingency(table)", "Small counts → Fisher's exact test"] },
      ],
      quiz: [
        { q: "Chi-square tests are used for…", options: ["Counts in categories", "Comparing two means", "Correlation", "Regression slopes"], answer: 0, explain: "Contingency tables." },
        { q: "A 2 × 4 table has how many degrees of freedom?", options: ["3", "8", "4", "6"], answer: 0, explain: "(2 − 1)(4 − 1)." },
        { q: "Row total 100, column total 50, grand total 200. Expected count?", options: ["25", "50", "100", "12.5"], answer: 0, explain: "100 × 50 / 200." },
        { q: "With expected counts below 5, prefer…", options: ["Fisher's exact test", "A t-test", "ANOVA", "Nothing: chi-square is fine"], answer: 0, explain: "The approximation breaks down." },
      ],
    },
    {
      id: "power-bandits",
      title: "Sample size, power and multi-arm bandits",
      oneLine: "Before a test, calculate how many users you need to detect the smallest effect worth caring about (a power analysis). Smaller effects need far more users. Multi-arm bandits are an alternative that gradually sends more traffic to the winning version while the test runs.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: What decides the sample size?" },
        { t: "table", head: ["Input", "Example", "Effect on the sample size"], rows: [
          ["Baseline rate", "10% conversion today", "Rarer events need more data"],
          ["Minimum detectable effect", "10% → 12%", "Halving the effect needs about 4× the users"],
          ["Significance level α", "0.05", "Stricter α needs more users"],
          ["Power (1 − β)", "0.80", "More power needs more users"],
        ] },
        py("How many users per group?", src`
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

analysis = NormalIndPower()
for target in [0.12, 0.11, 0.105]:
    effect = proportion_effectsize(target, 0.10)          # 10% baseline
    n = analysis.solve_power(effect_size=effect, alpha=0.05, power=0.8)
    print(f"10% → {target:.1%}: about {n:,.0f} users per group")
`, "10% → 12.0%: about 3,835 users per group\n10% → 11.0%: about 14,744 users per group\n10% → 10.5%: about 57,756 users per group"),
        { t: "p", text: "Detecting a lift from 10% to 12% needs a few thousand users per group; detecting 10% to 10.5% needs about **15 times** as many. Decide the smallest effect that would change your decision, then calculate n **before** starting." },
        { t: "h", text: "Step 2: Multi-arm bandits" },
        { t: "p", text: "A classic A/B test spends half its traffic on the losing version until the end. A **bandit** algorithm keeps testing but sends more and more traffic to whichever version is winning so far. The simplest is **epsilon-greedy**: 10% of the time, try a random version (explore); 90% of the time, show the current best (exploit)." },
        py("Epsilon-greedy with three headlines", src`
import numpy as np

rng = np.random.default_rng(21)
true_rates = [0.10, 0.12, 0.15]           # unknown to the algorithm
shown = np.zeros(3)
clicks = np.zeros(3)

for visitor in range(10_000):
    if rng.random() < 0.1 or shown.min() == 0:
        arm = rng.integers(3)                                   # explore
    else:
        arm = int(np.argmax(clicks / shown))                    # exploit the best so far
    shown[arm] += 1
    clicks[arm] += rng.random() < true_rates[arm]

for i in range(3):
    print(f"Headline {i + 1}: shown {shown[i]:>5.0f} times, click rate {clicks[i] / shown[i]:.3f}")
print("Total clicks:", int(clicks.sum()))
`, "Headline 1: shown   590 times, click rate 0.088\nHeadline 2: shown   381 times, click rate 0.123\nHeadline 3: shown  9029 times, click rate 0.144\nTotal clicks: 1401"),
        { t: "table", head: ["", "A/B test", "Bandit"], rows: [["Traffic split", "Fixed (50/50) until the end", "Shifts towards the winner"], ["Best for", "Clear, rigorous answers; long-term decisions", "Short campaigns, many versions, earning while learning"], ["Downside", "\"Wastes\" traffic on the loser", "Harder to get a clean p-value"]] },
        { t: "analogy", text: "A new food court with 3 stalls: an A/B test eats at each stall exactly 10 times before deciding. A bandit tries all three, then mostly goes to the tastiest one while occasionally re-checking the others, in case they improved." },
        { t: "trap", text: "Running a test until it \"becomes significant\" is the peeking problem, and a bandit doesn't make it go away. For a classic A/B test, fix the sample size in advance from a power analysis; small tests with tiny effects give noisy, often wrong winners." },
        { t: "trick", text: "**Smallest effect worth acting on → power analysis → required n → then run. Short campaigns → bandits.**" },
        { t: "exam", items: ["How do you decide the sample size for an A/B test?", "What is the minimum detectable effect?", "What is statistical power and why aim for 80%?", "What is a multi-arm bandit? Explore vs exploit?", "When would you use a bandit instead of an A/B test?"] },
        { t: "recap", items: ["Sample size depends on baseline, effect size, α and power", "Half the effect → about 4× the users", "statsmodels: proportion_effectsize + NormalIndPower().solve_power", "Bandits shift traffic to winners while testing", "Epsilon-greedy: explore with probability ε, exploit otherwise"] },
      ],
      quiz: [
        { q: "To detect a smaller effect you need…", options: ["A larger sample", "A smaller sample", "A higher p-value", "Fewer groups"], answer: 0, explain: "Small signals hide in noise." },
        { q: "Halving the minimum detectable effect multiplies the needed sample size by about…", options: ["4", "2", "0.5", "8"], answer: 0, explain: "n ∝ 1 / effect²." },
        { q: "In epsilon-greedy with ε = 0.1, how often does it explore?", options: ["10% of the time", "90% of the time", "Never", "Only at the start"], answer: 0, explain: "Otherwise it exploits the current best." },
        { q: "A big advantage of bandits is…", options: ["Less traffic is wasted on losing versions", "Exact p-values", "No randomness", "They need no data"], answer: 0, explain: "They earn while they learn." },
      ],
    },
  ],
};
