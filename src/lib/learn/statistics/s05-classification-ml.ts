import type { Block, LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** The practice loan dataset used by the classification and machine-learning lessons. */
const LOANS: Block = py("loans.py", src`
"""loans.py: 1,000 practice loan applications (fixed seed, so the same every time)."""
import numpy as np
import pandas as pd

def load_loans():
    rng = np.random.default_rng(7)
    n = 1000
    income = rng.normal(50, 15, n).clip(15, None).round(1)          # ₹ thousand per month
    loan = rng.normal(300, 100, n).clip(50, None).round(0)          # ₹ thousand borrowed
    credit_score = rng.normal(700, 60, n).clip(300, 900).round(0)
    purpose = rng.choice(["home", "car", "education", "personal"], n, p=[0.3, 0.3, 0.2, 0.2])
    risk = pd.Series(purpose).map({"home": -0.5, "car": 0.0, "education": 0.2, "personal": 0.8}).to_numpy()
    logit = -1.0 - 0.04 * (income - 50) + 0.006 * (loan - 300) - 0.02 * (credit_score - 700) + risk
    default = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)   # 1 = did not repay
    return pd.DataFrame({"income": income, "loan": loan, "credit_score": credit_score,
                         "purpose": purpose, "default": default})
`);

const LOANS_NOTE: Block = { t: "note", kind: "info", title: "Practice data", text: "Save this as `loans.py` next to your script. Real projects load a CSV or a database table; this generated data gives exactly the outputs shown." };

/** Statistics modules 7–8: classification, then statistical machine learning. */
export const ST07_CLASSIFICATION: LearnModule = {
  id: "classification",
  title: "Classification",
  titleHi: "क्लासिफ़िकेशन",
  blurb: "Predict a category (spam or not, will default or not): naive Bayes, logistic regression and discriminant analysis, how to evaluate classifiers (confusion matrix, precision, recall, ROC/AUC) and what to do when one class is rare.",
  lessons: [
    {
      id: "naive-bayes",
      title: "Naive Bayes",
      oneLine: "Naive Bayes uses Bayes' rule to compute the probability of each class given the features, \"naively\" assuming the features are independent within each class. It's simple, fast and strong for text, such as spam filters.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Bayes' rule" },
        { t: "formula", items: [["Bayes' rule", "P(class | features) ∝ P(class) × P(features | class)"], ["\"Naive\" step", "P(features | class) ≈ P(feature₁ | class) × P(feature₂ | class) × …"], ["Then", "normalise: divide each class's score by the total so they add up to 1"]] },
        { t: "h", text: "Step 2: A spam filter by hand" },
        { t: "p", text: "Out of 10 past emails, 4 were spam. \"free\" appeared in 3 of the 4 spam emails and 1 of the 6 normal (ham) ones; \"offer\" also in 3 of 4 spam and 1 of 6 ham. A new email contains both words." },
        { t: "table", head: ["", "Spam", "Ham"], rows: [["Prior P(class)", "4/10 = 0.4", "6/10 = 0.6"], ["P(\"free\" | class)", "3/4", "1/6"], ["P(\"offer\" | class)", "3/4", "1/6"], ["Score = prior × products", "0.4 × 0.75 × 0.75 = **0.225**", "0.6 × 0.167 × 0.167 = **0.0167**"], ["Normalised probability", "0.225 / 0.2417 ≈ **0.93**", "≈ 0.07"]] },
        py("A tiny spam filter with scikit-learn", src`
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

emails = ["win free offer now", "free money offer", "claim your free prize",
          "meeting at noon", "project report attached", "lunch at noon tomorrow",
          "free lunch at office"]
labels = ["spam", "spam", "spam", "ham", "ham", "ham", "ham"]

vectorizer = CountVectorizer()                    # text → word counts
X = vectorizer.fit_transform(emails)
model = MultinomialNB().fit(X, labels)            # learns P(word | class) with smoothing

new = ["free offer today", "report meeting tomorrow"]
probs = model.predict_proba(vectorizer.transform(new))
for text, label, p in zip(new, model.predict(vectorizer.transform(new)), probs):
    print(f"{text!r:<28} → {label}  (P(spam) = {p[list(model.classes_).index('spam')]:.2f})")
`, "'free offer today'           → spam  (P(spam) = 0.85)\n'report meeting tomorrow'    → ham  (P(spam) = 0.11)"),
        { t: "p", text: "Words never seen in training (\"today\") are simply ignored, and **smoothing** (adding 1 to every count) stops a word that never appeared in spam from making P(spam) exactly 0." },
        { t: "analogy", text: "A doctor who sees fever and a rash thinks: \"how common is measles (prior), and how often does measles cause fever and rash (likelihood)?\", treating each symptom as separate evidence. That's naive Bayes: combine independent clues, weighted by how common each disease is." },
        { t: "trap", text: "The independence assumption is usually false (\"free\" and \"offer\" often appear together), so naive Bayes' **probabilities** are often too extreme, even when its **rankings** and predicted classes are good. Use it for classification or as a baseline, not for trustworthy probabilities." },
        { t: "trick", text: "**Posterior ∝ prior × product of likelihoods. Great for text; probabilities are rough.**" },
        { t: "exam", items: ["Explain Bayes' theorem.", "Why is naive Bayes called \"naive\"?", "What is Laplace (add-one) smoothing?", "Where is naive Bayes used? (Spam filters, text classification, quick baselines.)", "Prior vs posterior probability?"] },
        { t: "recap", items: ["P(class | x) ∝ P(class) × Π P(xᵢ | class)", "Assumes features are independent within each class", "Smoothing avoids zero probabilities", "Fast, works well on text", "Probabilities are rough; rankings are usually fine"] },
      ],
      quiz: [
        { q: "What makes naive Bayes \"naive\"?", options: ["It assumes features are independent within a class", "It ignores the prior", "It uses only one feature", "It can't handle text"], answer: 0, explain: "Then likelihoods simply multiply." },
        { q: "The prior P(spam) in the hand example is…", options: ["0.4", "0.75", "0.93", "0.6"], answer: 0, explain: "4 of 10 emails." },
        { q: "Laplace smoothing prevents…", options: ["Zero probabilities for unseen words", "Overfitting in trees", "Negative coefficients", "Large datasets"], answer: 0, explain: "It adds 1 to every count." },
        { q: "Naive Bayes is especially popular for…", options: ["Text classification", "Image generation", "Time-series forecasting", "Clustering"], answer: 0, explain: "Spam filters, sentiment, topics." },
      ],
    },
    {
      id: "logistic-regression",
      title: "Logistic regression and discriminant analysis",
      oneLine: "Logistic regression predicts the probability of a yes/no outcome. It fits a linear equation to the log-odds, then squashes it into 0–1 with the sigmoid curve. Its coefficients become odds ratios: how much the odds multiply for each unit of a feature.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Probability, odds and log-odds" },
        { t: "table", head: ["Probability p", "Odds = p / (1 − p)", "Log-odds = ln(odds)"], rows: [["0.10", "0.11", "−2.20"], ["0.25", "0.33", "−1.10"], ["0.50", "1.00", "0.00"], ["0.75", "3.00", "1.10"], ["0.90", "9.00", "2.20"]] },
        { t: "formula", items: [["The model", "log-odds = b₀ + b₁x₁ + b₂x₂ + …"], ["Back to probability (sigmoid)", "p = 1 / (1 + e^−(log-odds))"], ["Odds ratio", "e^b: the odds multiply by e^b for each +1 in that feature"]] },
        { t: "diagram", text: "p\n1.0 ┤                      ●●●●●●●●\n    │                 ●●●\n0.5 ┤             ●            ← sigmoid: an S-curve\n    │        ●●●\n0.0 ┤●●●●●●●●\n    └──────────────┼──────────────▶ log-odds\n                   0" },
        LOANS,
        LOANS_NOTE,
        py("Logistic regression with statsmodels", src`
import numpy as np
import statsmodels.formula.api as smf
from loans import load_loans

df = load_loans()
print("Default rate:", round(df["default"].mean(), 3))

model = smf.logit("default ~ income + loan + credit_score + C(purpose, Treatment('home'))",
                  data=df).fit(disp=0)
coefs = model.params.rename(lambda s: s.replace("C(purpose, Treatment('home'))", "purpose"))
print(coefs.round(3))
print("Odds ratio per +10 credit points:", round(float(np.exp(10 * model.params["credit_score"])), 3))
`, "Default rate: 0.362\nIntercept               13.065\npurpose[T.car]           0.987\npurpose[T.education]     0.540\npurpose[T.personal]      1.523\nincome                  -0.051\nloan                     0.006\ncredit_score            -0.020\ndtype: float64\nOdds ratio per +10 credit points: 0.819"),
        { t: "p", text: "Negative coefficients (income, credit score) **lower** the risk; positive ones (loan size, personal loans) **raise** it. Every 10 extra credit-score points multiply the odds of default by the odds ratio shown, so it falls by a little under 20%." },
        py("Predicting probabilities with scikit-learn", src`
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]
clf = make_pipeline(StandardScaler(), LogisticRegression()).fit(X, y)

applicants = pd.DataFrame({"income": [80, 30], "loan": [200, 450], "credit_score": [780, 620],
                           "purpose": ["home", "personal"]})
A = pd.get_dummies(applicants, dtype=int).reindex(columns=X.columns, fill_value=0)
for (i, row), p in zip(applicants.iterrows(), clf.predict_proba(A)[:, 1]):
    print(f"Applicant {i + 1}: P(default) = {p:.2f}")
`, "Applicant 1: P(default) = 0.00\nApplicant 2: P(default) = 0.97"),
        { t: "h", text: "Step 2: Discriminant analysis (LDA)" },
        py("Linear discriminant analysis", src`
import pandas as pd
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import cross_val_score
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
lda = LinearDiscriminantAnalysis()
print("LDA 5-fold accuracy:", round(cross_val_score(lda, X, df["default"], cv=5).mean(), 3))
`, "LDA 5-fold accuracy: 0.755", "LDA is an older method that separates classes with a linear boundary assuming normally distributed features. In practice it performs similarly to logistic regression; logistic regression is far more common today."),
        { t: "analogy", text: "Logistic regression is a points system for loan approval: income adds safety points, a big loan adds risk points, and the total is turned into a probability by the S-shaped sigmoid. Close to 0 points means 50-50; lots of risk points means a high chance of default." },
        { t: "trap", text: "Don't fit an ordinary linear regression to a 0/1 target: it predicts \"probabilities\" below 0 and above 1. And a logistic coefficient is **not** a change in probability; it's a change in log-odds. Convert with e^b to talk about odds ratios." },
        { t: "trick", text: "**Linear on the log-odds, sigmoid to probability, e^coef = odds ratio.**" },
        { t: "exam", items: ["What is logistic regression? Why not linear regression for classification?", "What are odds and log-odds?", "How do you interpret a logistic regression coefficient? (Odds ratio e^b.)", "What is the sigmoid function?", "What loss does logistic regression minimise? (Log loss / cross-entropy, via maximum likelihood.)", "Logistic regression vs LDA?"] },
        { t: "recap", items: ["Predicts P(y = 1) for a yes/no target", "Linear model on the log-odds; sigmoid maps to 0–1", "e^coefficient = odds ratio per unit", "statsmodels logit for interpretation; sklearn for prediction", "LDA: similar results, stronger assumptions"] },
      ],
      quiz: [
        { q: "p = 0.8. The odds are…", options: ["4", "0.8", "0.25", "1.6"], answer: 0, explain: "0.8 / 0.2." },
        { q: "A coefficient of 0 corresponds to an odds ratio of…", options: ["1 (no effect)", "0", "e", "0.5"], answer: 0, explain: "e⁰ = 1." },
        { q: "Why not use linear regression for a 0/1 target?", options: ["It can predict values outside 0–1", "It's too slow", "It needs categories", "It always overfits"], answer: 0, explain: "Logistic regression keeps predictions in 0–1." },
        { q: "The sigmoid of 0 is…", options: ["0.5", "0", "1", "e"], answer: 0, explain: "1 / (1 + e⁰)." },
      ],
    },
    {
      id: "evaluating-classifiers",
      title: "Evaluating classifiers: confusion matrix, precision, recall, ROC and AUC",
      oneLine: "Accuracy alone can mislead. A confusion matrix counts true/false positives and negatives; precision asks \"of those flagged, how many were right?\", recall asks \"of the real positives, how many did we catch?\". The ROC curve and AUC judge a model across all thresholds.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: The confusion matrix by hand" },
        { t: "p", text: "A loan model is tested on 200 applicants: 50 actually defaulted, 150 repaid." },
        { t: "table", head: ["", "Predicted default", "Predicted repay"], rows: [["**Actually defaulted (50)**", "TP = 40 ✔", "FN = 10 ✘ (missed)"], ["**Actually repaid (150)**", "FP = 20 ✘ (false alarm)", "TN = 130 ✔"]] },
        { t: "formula", items: [["Accuracy", "(TP + TN) / total = 170 / 200 = 0.85"], ["Precision", "TP / (TP + FP) = 40 / 60 ≈ 0.67  → of those we flagged, 67% really defaulted"], ["Recall (sensitivity)", "TP / (TP + FN) = 40 / 50 = 0.80  → we caught 80% of defaulters"], ["Specificity", "TN / (TN + FP) = 130 / 150 ≈ 0.87"], ["F1 score", "2 × P × R / (P + R) = 2 × 0.67 × 0.8 / 1.47 ≈ 0.73"]] },
        LOANS,
        LOANS_NOTE,
        py("Metrics on a held-out test set", src`
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
clf = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_train, y_train)
prob = clf.predict_proba(X_test)[:, 1]                 # P(default) for each test applicant

for threshold in [0.5, 0.3]:
    pred = (prob >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    print(f"threshold {threshold}: TP={tp} FP={fp} FN={fn} TN={tn}  "
          f"precision={precision_score(y_test, pred):.2f} recall={recall_score(y_test, pred):.2f}")
print("AUC:", round(roc_auc_score(y_test, prob), 3))
`, "threshold 0.5: TP=69 FP=19 FN=40 TN=172  precision=0.78 recall=0.63\nthreshold 0.3: TP=100 FP=68 FN=9 TN=123  precision=0.60 recall=0.92\nAUC: 0.886"),
        { t: "p", text: "Lowering the threshold from 0.5 to 0.3 flags more applicants: **recall rises** (fewer missed defaulters) but **precision falls** (more false alarms). The right threshold is a business decision: what does a missed defaulter cost compared with a rejected good customer?" },
        { t: "h", text: "Step 2: ROC curve and AUC" },
        { t: "diagram", text: "recall (true positive rate)\n1.0 ┤        ●●●●●●●●●●\n    │    ●●●              ← a good model hugs the top-left\n    │  ●              ·\n    │ ●           ·        ← diagonal = random guessing (AUC 0.5)\n    │●        ·\n0.0 ┼──────────────────── false positive rate (1 − specificity)\n    0                  1\nAUC = area under the curve: 1.0 perfect, 0.5 useless" },
        { t: "p", text: "The ROC curve plots recall against the false-positive rate for **every** threshold. **AUC** has a neat meaning: the probability that the model gives a randomly chosen defaulter a higher score than a randomly chosen good customer. **Lift** answers a marketing version of the same question: \"if I contact the top 10% by score, how many more positives do I find than by contacting 10% at random?\"" },
        { t: "table", head: ["Situation", "Focus on", "Why"], rows: [["Cancer screening, fraud alerts", "Recall", "Missing a positive is very costly"], ["Spam filter, promotions", "Precision", "False alarms annoy users"], ["Balanced trade-off", "F1", "Harmonic mean of both"], ["Ranking quality across thresholds", "AUC", "Threshold-free"]] },
        { t: "analogy", text: "A security guard at a mall: **recall** is how many shoplifters they actually stop; **precision** is how many of the people they stop really are shoplifters. Stopping everyone gives perfect recall and terrible precision. The threshold is how suspicious someone must look before being stopped." },
        { t: "trap", text: "If only 5% of loans default, a model that predicts \"repay\" for everyone is **95% accurate** and completely useless. Always check the confusion matrix, precision and recall. And compute metrics on held-out data, never on the data the model was trained on." },
        { t: "trick", text: "**Precision = right among flagged. Recall = caught among real. AUC = ranking quality.**" },
        { t: "exam", items: ["Explain a confusion matrix.", "Precision vs recall: when do you prefer each?", "What is the F1 score?", "What are the ROC curve and AUC?", "Why can accuracy be misleading?", "How do you choose a classification threshold?"] },
        { t: "recap", items: ["TP, FP, FN, TN form the confusion matrix", "Precision = TP / (TP + FP); recall = TP / (TP + FN)", "Lower threshold → higher recall, lower precision", "ROC/AUC evaluates all thresholds; 0.5 = random", "Accuracy misleads when classes are imbalanced"] },
      ],
      quiz: [
        { q: "TP = 30, FP = 10. Precision?", options: ["0.75", "0.25", "0.30", "3.0"], answer: 0, explain: "30 / (30 + 10)." },
        { q: "TP = 30, FN = 20. Recall?", options: ["0.6", "0.4", "0.75", "1.5"], answer: 0, explain: "30 / (30 + 20)." },
        { q: "For cancer screening, which metric matters most?", options: ["Recall", "Precision", "Accuracy", "Specificity only"], answer: 0, explain: "Missing a real case is the worst outcome." },
        { q: "An AUC of 0.5 means the model…", options: ["Ranks no better than random", "Is perfect", "Has 50% precision", "Has 50% accuracy always"], answer: 0, explain: "It's the diagonal line." },
        { q: "Lowering the threshold usually…", options: ["Raises recall and lowers precision", "Raises both", "Lowers both", "Changes nothing"], answer: 0, explain: "More applicants get flagged." },
      ],
    },
    {
      id: "imbalanced-data",
      title: "When one class is rare: imbalanced data",
      oneLine: "In fraud, disease and default data, the interesting class is rare. Models then learn to ignore it. Fixes: weight the rare class more (class_weight), undersample the common class, oversample the rare one (or create synthetic examples with SMOTE), and judge with recall, precision and AUC.",
      minutes: 18,
      blocks: [
        py("Fraud detection with rare fraud", src`
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(12)
n = 5000
amount = rng.exponential(2000, n)                    # transaction amount (₹)
night = rng.random(n) < 0.2                          # happened between midnight and 5 am
new_device = rng.random(n) < 0.1
logit = -5.2 + 0.0004 * amount + 1.5 * night + 2.0 * new_device
fraud = rng.random(n) < 1 / (1 + np.exp(-logit))
X = np.column_stack([amount / 1000, night, new_device])
print("Fraud rate:", round(fraud.mean(), 3))

X_tr, X_te, y_tr, y_te = train_test_split(X, fraud, test_size=0.3, random_state=0, stratify=fraud)
for weight in [None, "balanced"]:
    clf = LogisticRegression(class_weight=weight).fit(X_tr, y_tr)
    pred = clf.predict(X_te)
    print(f"class_weight={str(weight):<9} accuracy={accuracy_score(y_te, pred):.3f} "
          f"recall={recall_score(y_te, pred):.2f} precision={precision_score(y_te, pred, zero_division=0):.2f}")
`, "Fraud rate: 0.044\nclass_weight=None      accuracy=0.955 recall=0.10 precision=0.50\nclass_weight=balanced  accuracy=0.779 recall=0.76 precision=0.14"),
        { t: "p", text: "Without weighting, the model is almost always \"not fraud\": high accuracy, but it catches little or no fraud. With `class_weight=\"balanced\"`, each fraud case counts as much as many normal ones, so the model catches far more fraud, at the cost of many more false alarms and lower accuracy. Accuracy dropping is fine here: catching fraud is the goal, and the false alarms can go to a quick manual check." },
        { t: "h", text: "The toolbox" },
        { t: "table", head: ["Technique", "How", "In Python"], rows: [
          ["Class weights", "Errors on the rare class cost more", "`LogisticRegression(class_weight=\"balanced\")`, most sklearn models"],
          ["Undersampling", "Use only a random part of the common class", "`df.groupby(y).sample(n=k)`"],
          ["Oversampling", "Repeat rare-class rows (training data only)", "`sklearn.utils.resample(..., replace=True)`"],
          ["SMOTE", "Create synthetic rare examples between real neighbours", "`imblearn.over_sampling.SMOTE` (pip install imbalanced-learn)"],
          ["Threshold tuning", "Flag at P > 0.1 instead of 0.5", "`(prob >= 0.1)`"],
          ["Right metrics", "Recall, precision, F1, PR-AUC instead of accuracy", "`sklearn.metrics`"],
        ] },
        py("Oversampling the training data", src`
import numpy as np
import pandas as pd
from sklearn.utils import resample

train = pd.DataFrame({"x": range(100), "fraud": [1] * 5 + [0] * 95})   # 5% fraud
fraud = train[train["fraud"] == 1]
normal = train[train["fraud"] == 0]
fraud_up = resample(fraud, replace=True, n_samples=len(normal), random_state=0)   # repeat rare rows
balanced = pd.concat([normal, fraud_up])
print(balanced["fraud"].value_counts())
`, "fraud\n0    95\n1    95\nName: count, dtype: int64", "Resample **only the training data**, after the train/test split. If copies of the same fraud row land in both train and test, the test score becomes fake-good."),
        { t: "analogy", text: "Teaching a child to spot snakes using 1,000 photos of ropes and 5 of snakes: they'll learn \"it's always a rope\". You either show the snake photos more often (oversampling/weights) or show fewer rope photos (undersampling), so they actually learn what a snake looks like." },
        { t: "trap", text: "Balancing changes the model's probabilities: after oversampling to 50/50, predicted probabilities are far too high for the real 2% world. If you need real probabilities (for pricing or expected loss), recalibrate them, or use weights and tune the threshold instead." },
        { t: "trick", text: "**Rare class? Weight it, resample (train only), tune the threshold, and stop looking at accuracy.**" },
        { t: "exam", items: ["How do you handle imbalanced data?", "What is SMOTE?", "Why is accuracy a bad metric for imbalanced data?", "Oversampling vs undersampling: pros and cons?", "When must you resample: before or after the train/test split? (After, on training data only.)"] },
        { t: "recap", items: ["Rare classes get ignored by default", "class_weight=\"balanced\" is the easiest fix", "Under/oversampling and SMOTE rebalance the training data", "Tune the threshold for the business cost", "Judge with recall, precision, F1, AUC"] },
      ],
      quiz: [
        { q: "1% of transactions are fraud. Predicting \"not fraud\" always gives accuracy…", options: ["99%", "1%", "50%", "0%"], answer: 0, explain: "Accuracy is misleading here." },
        { q: "SMOTE creates…", options: ["Synthetic rare-class examples", "More features", "A new test set", "Fewer rare examples"], answer: 0, explain: "By interpolating between neighbours." },
        { q: "class_weight=\"balanced\" makes the model…", options: ["Penalise mistakes on the rare class more", "Delete rare rows", "Ignore weights", "Use only one feature"], answer: 0, explain: "Each rare example counts more." },
        { q: "When should you oversample?", options: ["On the training set, after splitting", "Before splitting", "On the test set", "Never"], answer: 0, explain: "Otherwise copies leak into the test set." },
      ],
    },
  ],
};

export const ST08_MACHINE_LEARNING: LearnModule = {
  id: "statistical-ml",
  title: "Statistical machine learning",
  titleHi: "स्टैटिस्टिकल मशीन लर्निंग",
  blurb: "Models that learn patterns directly from data: k-nearest neighbours, decision trees, bagging and random forests, and boosting, with scaling, tuning and feature importance.",
  lessons: [
    {
      id: "knn",
      title: "K-nearest neighbours",
      oneLine: "To classify a new point, find the k most similar points in the training data (its nearest neighbours) and let them vote. Distances must be computed on standardised features, otherwise the feature with the biggest numbers dominates. k is chosen with cross-validation.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Distance by hand, and why scaling matters" },
        { t: "p", text: "Applicant A: income 50, credit score 700. Applicant B: income 20, credit score 710. Applicant C: income 52, credit score 640." },
        { t: "formula", items: [["Euclidean distance", "√((x₁ − y₁)² + (x₂ − y₂)²)"], ["A to B (raw)", "√(30² + 10²) = √1000 ≈ 31.6"], ["A to C (raw)", "√(2² + 60²) = √3604 ≈ 60.0  → B looks closer, only because credit scores are big numbers"], ["After standardising (z-scores)", "income SD ≈ 15 and score SD ≈ 60, so A–B ≈ √(2² + 0.17²) ≈ 2.0 and A–C ≈ √(0.13² + 1²) ≈ 1.0 → now C is closer"]] },
        LOANS,
        LOANS_NOTE,
        py("Choosing k with cross-validation", src`
import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]

for k in [1, 5, 15, 51]:
    raw = KNeighborsClassifier(n_neighbors=k)
    scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    auc_raw = cross_val_score(raw, X, y, cv=5, scoring="roc_auc").mean()
    auc_scaled = cross_val_score(scaled, X, y, cv=5, scoring="roc_auc").mean()
    print(f"k={k:>2}: AUC unscaled {auc_raw:.3f}   scaled {auc_scaled:.3f}")
`, "k= 1: AUC unscaled 0.620   scaled 0.617\nk= 5: AUC unscaled 0.730   scaled 0.741\nk=15: AUC unscaled 0.755   scaled 0.793\nk=51: AUC unscaled 0.773   scaled 0.797"),
        { t: "p", text: "Once k is 5 or more, scaling clearly helps (at k = 1 the prediction is too noisy for it to matter). k = 1 copies the single nearest neighbour, noise and all (overfitting); larger k averages more neighbours and gives smoother, more reliable predictions, up to a point where it starts ignoring local detail." },
        { t: "analogy", text: "Choosing a restaurant by asking the 5 people who live nearest to you and have tastes most like yours. Ask just 1 person and you might get a strange opinion; ask the whole city and you lose what's special about your taste." },
        { t: "trap", text: "Always scale features for KNN (and for any distance-based method such as clustering and SVMs). KNN also slows down with lots of data (it compares with every training row at prediction time) and struggles with many irrelevant features (the curse of dimensionality)." },
        { t: "trick", text: "**Scale first, small k overfits, choose k by cross-validation.**" },
        { t: "exam", items: ["How does KNN work?", "Why must features be scaled for KNN?", "How do you choose k?", "KNN for regression? (Average the neighbours' values.)", "What is the curse of dimensionality?", "Is KNN a lazy learner? (Yes, it does no training; all the work happens at prediction.)"] },
        { t: "recap", items: ["Predict by majority vote of the k nearest training points", "Distance = usually Euclidean", "Standardise features first", "Small k → overfit; large k → underfit; tune with CV", "Simple, but slow on big data and many features"] },
      ],
      quiz: [
        { q: "Why scale features before KNN?", options: ["So big-number features don't dominate the distance", "To make it faster", "To remove outliers", "It isn't needed"], answer: 0, explain: "Distance depends on units." },
        { q: "k = 1 tends to…", options: ["Overfit", "Underfit", "Be the best always", "Ignore the data"], answer: 0, explain: "It follows every noisy point." },
        { q: "Distance between (0, 0) and (3, 4)?", options: ["5", "7", "1", "25"], answer: 0, explain: "√(9 + 16)." },
        { q: "KNN does most of its work…", options: ["At prediction time", "At training time", "Never", "During scaling only"], answer: 0, explain: "It's a lazy learner." },
      ],
    },
    {
      id: "decision-trees",
      title: "Decision trees",
      oneLine: "A decision tree asks a series of yes/no questions (credit score < 650? income < 30?) and predicts at the end of each path. Each split is chosen to make the groups as pure as possible (lowest Gini impurity). Trees are easy to explain but overfit if they grow too deep.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Gini impurity by hand" },
        { t: "formula", items: [["Gini impurity", "1 − Σ pᵢ²  (0 = pure; 0.5 = a 50/50 mix for two classes)"], ["Group of 10: 5 default, 5 repay", "1 − (0.5² + 0.5²) = 0.5"], ["Split → left 4 default / 1 repay", "1 − (0.8² + 0.2²) = 0.32"], ["          right 1 default / 4 repay", "also 0.32 → weighted average 0.32 < 0.5, so the split helps"]] },
        LOANS,
        LOANS_NOTE,
        py("A small, readable tree", src`
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]

tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, y)
print(export_text(tree, feature_names=list(X.columns), show_weights=True))
`, "|--- credit_score <= 689.50\n|   |--- income <= 55.90\n|   |   |--- weights: [112.00, 210.00] class: 1\n|   |--- income >  55.90\n|   |   |--- weights: [90.00, 41.00] class: 0\n|--- credit_score >  689.50\n|   |--- credit_score <= 763.50\n|   |   |--- weights: [301.00, 105.00] class: 0\n|   |--- credit_score >  763.50\n|   |   |--- weights: [135.00, 6.00] class: 0", "`weights: [repay, default]` counts the training rows that end in each leaf. Credit score is the first question: the most useful single split."),
        py("Depth vs overfitting", src`
import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]

for depth in [1, 2, 3, 5, 10, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0)
    train_acc = tree.fit(X, y).score(X, y)
    cv_acc = cross_val_score(tree, X, y, cv=5).mean()
    print(f"max_depth={str(depth):<4}  train accuracy {train_acc:.3f}   CV accuracy {cv_acc:.3f}")
`, "max_depth=1     train accuracy 0.687   CV accuracy 0.675\nmax_depth=2     train accuracy 0.736   CV accuracy 0.724\nmax_depth=3     train accuracy 0.744   CV accuracy 0.714\nmax_depth=5     train accuracy 0.789   CV accuracy 0.720\nmax_depth=10    train accuracy 0.922   CV accuracy 0.654\nmax_depth=None  train accuracy 1.000   CV accuracy 0.652"),
        { t: "p", text: "An unlimited tree memorises the training data (100% training accuracy) but does worse on new data. Limit the depth, require a minimum number of samples per leaf (`min_samples_leaf`), or prune (`ccp_alpha`), choosing the setting by cross-validation." },
        { t: "analogy", text: "A tree is the game \"20 questions\": each question splits the possibilities. Good first questions split the field into clean groups. Asking 200 hyper-specific questions lets you identify every training example, which is memorising, not learning." },
        { t: "trap", text: "Trees are **unstable**: a small change in the data can produce a completely different tree. They also make step-shaped predictions. Both problems are solved by combining many trees: random forests and boosting (next lessons). Trees don't need feature scaling." },
        { t: "trick", text: "**Split to reduce impurity; limit depth; one tree explains, many trees predict.**" },
        { t: "exam", items: ["How does a decision tree decide where to split?", "What are Gini impurity and entropy (information gain)?", "Why do trees overfit? How do you prevent it?", "Advantages and disadvantages of decision trees?", "Do trees need feature scaling? (No.)"] },
        { t: "recap", items: ["A tree = yes/no questions ending in predictions", "Splits chosen to minimise impurity (Gini or entropy)", "Deep trees overfit; tune max_depth / min_samples_leaf with CV", "Easy to explain (export_text, plots)", "Unstable on their own; combine them in ensembles"] },
      ],
      quiz: [
        { q: "Gini impurity of a pure node is…", options: ["0", "0.5", "1", "Undefined"], answer: 0, explain: "1 − 1² = 0." },
        { q: "Gini of a 50/50 node with two classes?", options: ["0.5", "0", "1", "0.25"], answer: 0, explain: "1 − (0.25 + 0.25)." },
        { q: "A tree with 100% training accuracy and poor CV accuracy is…", options: ["Overfitting", "Underfitting", "Perfect", "Pruned"], answer: 0, explain: "It memorised the data." },
        { q: "Which method is a fix for a single tree's instability?", options: ["Random forests", "Scaling", "More depth", "Removing features"], answer: 0, explain: "Averaging many trees." },
      ],
    },
    {
      id: "random-forests",
      title: "Bagging and random forests",
      oneLine: "Bagging trains many trees on bootstrap samples of the data and averages their votes, which cancels out individual trees' mistakes. A random forest also lets each split consider only a random subset of features, making the trees more different and the average even better.",
      minutes: 18,
      blocks: [
        { t: "points", items: ["Draw a **bootstrap sample** of the rows (with replacement).", "Grow a deep tree on it; at **each split**, consider only a random subset of the features (random forest).", "Repeat for hundreds of trees.", "Predict by **majority vote** (or average probability). Rows left out of a tree's bootstrap sample (\"out-of-bag\") give a free validation score."] },
        LOANS,
        LOANS_NOTE,
        py("Random forest vs one tree", src`
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]

tree = DecisionTreeClassifier(random_state=0)
forest = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, oob_score=True, random_state=0)
print("One deep tree, CV AUC:", round(cross_val_score(tree, X, y, cv=5, scoring="roc_auc").mean(), 3))
print("Random forest, CV AUC:", round(cross_val_score(forest, X, y, cv=5, scoring="roc_auc").mean(), 3))

forest.fit(X, y)
print("Out-of-bag accuracy:", round(forest.oob_score_, 3))
importance = pd.Series(forest.feature_importances_, index=X.columns).sort_values(ascending=False)
print(importance.round(3))
`, "One deep tree, CV AUC: 0.62\nRandom forest, CV AUC: 0.804\nOut-of-bag accuracy: 0.737\ncredit_score         0.414\nincome               0.260\nloan                 0.241\npurpose_home         0.039\npurpose_personal     0.032\npurpose_education    0.015\ndtype: float64"),
        { t: "p", text: "The forest beats the single tree clearly. **Feature importance** shows which inputs the forest relies on most; credit score and income lead, matching how the data was built. For decisions, also check **permutation importance** (`sklearn.inspection.permutation_importance`), which is less biased towards features with many distinct values." },
        { t: "analogy", text: "Asking one expert can go badly if that expert has a blind spot. Asking 300 experts, each trained on slightly different cases and each looking at different clues, then taking a vote, is far more reliable: the \"wisdom of crowds\", as long as the crowd is diverse." },
        { t: "trap", text: "A random forest is harder to explain than one tree (\"300 trees voted\"). Feature importance shows what matters, not the direction of the effect: use partial dependence plots or SHAP values for that. More trees never hurt accuracy, they just take longer." },
        { t: "trick", text: "**Bootstrap rows + random features per split + vote = random forest.**" },
        { t: "exam", items: ["What is bagging?", "How is a random forest different from bagged trees? (Random feature subsets at each split.)", "What is the out-of-bag error?", "How is feature importance computed?", "Why does averaging many trees reduce variance?", "Key hyperparameters of a random forest?"] },
        { t: "recap", items: ["Bagging = bootstrap samples + many models + vote/average", "Random forest adds random feature subsets per split", "Reduces variance: much better than one tree", "OOB score is a free validation estimate", "Feature importance shows which inputs matter most"] },
      ],
      quiz: [
        { q: "Bagging trains each model on…", options: ["A bootstrap sample of the rows", "The same full data", "Only the test set", "One feature"], answer: 0, explain: "Sampling with replacement." },
        { q: "What does a random forest add to bagging?", options: ["A random subset of features at each split", "Boosting", "Linear regression", "Scaling"], answer: 0, explain: "It makes the trees less alike." },
        { q: "Out-of-bag rows are…", options: ["Rows not used to train a given tree", "Outliers", "The test set", "Duplicated rows"], answer: 0, explain: "Used to estimate accuracy for free." },
        { q: "Averaging many trees mainly reduces…", options: ["Variance", "Bias only", "Training time", "The number of features"], answer: 0, explain: "Individual trees' noise cancels out." },
      ],
    },
    {
      id: "boosting",
      title: "Boosting and hyperparameter tuning",
      oneLine: "Boosting builds trees one after another, each one focusing on the mistakes of the trees before it, and adds them up with a small learning rate. Gradient boosting (XGBoost, LightGBM, scikit-learn's HistGradientBoosting) is often the most accurate model for table data, but it needs tuning.",
      minutes: 20,
      blocks: [
        { t: "diagram", text: "Tree 1: rough prediction ──▶ residual errors\n   Tree 2: fits those errors ──▶ smaller errors\n      Tree 3: fits what's left ──▶ smaller still\n         …\nFinal = tree1 + η·tree2 + η·tree3 + …   (η = learning rate, e.g. 0.1)" },
        LOANS,
        LOANS_NOTE,
        py("Gradient boosting with a grid search", src`
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from loans import load_loans

df = load_loans()
X = pd.get_dummies(df.drop(columns="default"), drop_first=True, dtype=int)
y = df["default"]

grid = GridSearchCV(
    HistGradientBoostingClassifier(random_state=0),
    param_grid={"learning_rate": [0.03, 0.1, 0.3], "max_depth": [2, 3, None], "max_iter": [100, 300]},
    cv=5, scoring="roc_auc",
)
grid.fit(X, y)
print("Best settings:", grid.best_params_)
print("Best CV AUC:", round(grid.best_score_, 3))

results = pd.DataFrame(grid.cv_results_).sort_values("mean_test_score")
print("Worst combination AUC:", round(results["mean_test_score"].iloc[0], 3))

baseline = make_pipeline(StandardScaler(), LogisticRegression())
print("Logistic regression baseline AUC:", round(cross_val_score(baseline, X, y, cv=5, scoring="roc_auc").mean(), 3))
`, "Best settings: {'learning_rate': 0.03, 'max_depth': 2, 'max_iter': 300}\nBest CV AUC: 0.811\nWorst combination AUC: 0.745\nLogistic regression baseline AUC: 0.825"),
        { t: "table", head: ["Hyperparameter", "What it controls", "Too high →"], rows: [
          ["`learning_rate` (eta)", "How much each new tree counts", "Overfits fast; pair a low rate with more trees"],
          ["`max_iter` / `n_estimators`", "Number of trees", "Overfitting (use early stopping)"],
          ["`max_depth` / `max_leaf_nodes`", "Complexity of each tree", "Each tree memorises"],
          ["`l2_regularization`, `min_samples_leaf`", "Regularisation", "Too much → underfitting"],
        ] },
        { t: "table", head: ["", "Random forest", "Gradient boosting"], rows: [["Trees built", "Independently, in parallel", "One after another, each fixing the last"], ["Main effect", "Reduces variance", "Reduces bias (and variance with regularisation)"], ["Tuning needed", "Little", "More (learning rate, depth, number of trees)"], ["Typical accuracy on tables", "Very good", "Often the best"]] },
        { t: "p", text: "Look at the last line: on this dataset (which was generated from a logistic model), plain logistic regression (AUC 0.825) actually **beats** tuned boosting (0.811). Boosting shines when relationships are complex and non-linear; when they're simple, a simple model wins. That's a real lesson: **always compare against a simple baseline** before reaching for a complex model." },
        { t: "analogy", text: "Boosting is a coaching team: the first coach teaches the basics; the second watches where the student still fails and drills only those weak spots; the third focuses on what's still wrong, and so on. Each coach's advice counts a little (learning rate), so no one coach can push the student too far in the wrong direction." },
        { t: "trap", text: "Boosting can overfit if you add trees forever with a high learning rate. Use cross-validation or early stopping (`early_stopping=True` in HistGradientBoosting, `early_stopping_rounds` in XGBoost). Tune with cross-validation on training data only, then check once on the test set." },
        { t: "trick", text: "**Small learning rate + many trees + early stopping + cross-validated tuning.**" },
        { t: "exam", items: ["What is boosting? How is it different from bagging?", "Explain gradient boosting in simple words.", "What is the learning rate in boosting?", "XGBoost vs random forest: when to use which?", "What is grid search? Random search?", "What is early stopping?"] },
        { t: "recap", items: ["Boosting adds trees sequentially, each fixing earlier errors", "Learning rate shrinks each tree's contribution", "Tune learning rate, depth and number of trees with CV", "Often the most accurate on tabular data", "Always compare with a simple baseline"] },
      ],
      quiz: [
        { q: "In boosting, each new tree focuses on…", options: ["The errors of the previous trees", "A random bootstrap sample only", "The test set", "A single feature"], answer: 0, explain: "That's the sequential idea." },
        { q: "A smaller learning rate usually needs…", options: ["More trees", "Fewer trees", "No trees", "Deeper trees only"], answer: 0, explain: "Each tree contributes less." },
        { q: "GridSearchCV…", options: ["Tries every combination of settings with cross-validation", "Draws charts", "Splits data into a grid", "Removes features"], answer: 0, explain: "Then picks the best by CV score." },
        { q: "Bagging vs boosting: which builds trees one after another?", options: ["Boosting", "Bagging", "Both", "Neither"], answer: 0, explain: "Bagging builds them independently." },
      ],
    },
  ],
};
