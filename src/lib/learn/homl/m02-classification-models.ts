import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Hands-On ML, chapters 3–6: classification, training models, SVMs, decision trees. */
export const HO03_CLASSIFICATION: LearnModule = {
  id: "classification",
  title: "Classification",
  titleHi: "क्लासिफ़िकेशन",
  blurb: "Classify handwritten digits: a binary \"is it a 5?\" detector, why accuracy misleads, confusion matrices, precision, recall and the threshold trade-off, ROC curves, multiclass strategies, error analysis, and multilabel and multioutput classification.",
  lessons: [
    {
      id: "binary-measures",
      title: "A binary classifier and performance measures",
      oneLine: "Train a classifier to answer one yes/no question (is this digit a 5?). Accuracy looks great even for a model that always says \"no\", so measure with a confusion matrix, precision (how many flagged 5s really are 5s) and recall (how many real 5s were found).",
      minutes: 22,
      blocks: [
        py("Is it a 5?", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import cross_val_predict, cross_val_score, train_test_split

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.25,
                                                    random_state=42, stratify=digits.target)
y_train_5 = y_train == 5
print("share of 5s:", round(float(y_train_5.mean()), 3))

sgd = SGDClassifier(random_state=42)
never_5 = DummyClassifier(strategy="most_frequent")             # always answers "not 5"
print("SGD CV accuracy:", cross_val_score(sgd, X_train, y_train_5, cv=3).round(3).tolist())
print("'never 5' CV accuracy:", cross_val_score(never_5, X_train, y_train_5, cv=3).round(3).tolist())

pred = cross_val_predict(sgd, X_train, y_train_5, cv=3)          # clean predictions for every training row
print(confusion_matrix(y_train_5, pred))                         # rows: actual (not 5, 5); columns: predicted
print(f"precision {precision_score(y_train_5, pred):.3f}  recall {recall_score(y_train_5, pred):.3f}  F1 {f1_score(y_train_5, pred):.3f}")
`, "share of 5s: 0.101\nSGD CV accuracy: [0.993, 0.982, 0.989]\n'never 5' CV accuracy: [0.9, 0.9, 0.898]\n[[1204    7]\n [   9  127]]\nprecision 0.948  recall 0.934  F1 0.941"),
        { t: "p", text: "A \"classifier\" that always says \"not 5\" is about 90% accurate, because only about 10% of digits are 5s. That's why accuracy is a poor measure for skewed classes. The confusion matrix, precision and recall show what the real classifier gets right and wrong." },
        { t: "formula", items: [["Precision", "TP / (TP + FP): of the images called 5, how many were 5"], ["Recall", "TP / (TP + FN): of the real 5s, how many were found"], ["F1", "2 / (1/precision + 1/recall): high only if both are high"]] },
        { t: "analogy", text: "A smoke detector that never beeps is \"right\" 99.9% of the time, because fires are rare, and completely useless. Precision is \"when it beeps, is there a fire?\"; recall is \"when there's a fire, does it beep?\"." },
        { t: "trap", text: "Use `cross_val_predict` (not predictions on the training data) to build a confusion matrix for model selection; predictions on data the model trained on look far too good. Keep the test set for the end." },
        { t: "trick", text: "**Skewed classes → ignore accuracy; read the confusion matrix, precision, recall, F1.**" },
        { t: "exam", items: ["Why is accuracy misleading for imbalanced classes?", "Explain the confusion matrix.", "Precision vs recall?", "What is the F1 score? When is it not appropriate?", "What does cross_val_predict do?"] },
        { t: "recap", items: ["Binary classifier: one yes/no question", "A dummy majority classifier is a useful baseline", "Confusion matrix: TN, FP, FN, TP", "Precision, recall, F1", "cross_val_predict for honest training-set predictions"] },
      ],
      quiz: [
        { q: "10% of images are 5s. Always saying \"not 5\" gives accuracy…", options: ["About 90%", "About 10%", "50%", "0%"], answer: 0, explain: "Accuracy is misleading here." },
        { q: "Recall answers…", options: ["Of all real positives, how many did we find?", "Of flagged items, how many were right?", "How fast is the model?", "How many features?"], answer: 0, explain: "TP / (TP + FN)." },
        { q: "F1 is high only when…", options: ["Both precision and recall are high", "Precision alone is high", "Recall alone is high", "Accuracy is high"], answer: 0, explain: "It's a harmonic mean." },
        { q: "cross_val_predict returns…", options: ["Predictions for each row made by a model that didn't train on it", "Training scores", "The best model", "The test set"], answer: 0, explain: "Clean out-of-fold predictions." },
      ],
    },
    {
      id: "tradeoff-roc",
      title: "The precision/recall trade-off and ROC curves",
      oneLine: "A classifier computes a score for each image and compares it with a threshold. Raising the threshold increases precision but lowers recall, and vice versa, so choose the threshold for the business need. The ROC curve and its AUC compare classifiers across every threshold.",
      minutes: 20,
      blocks: [
        py("Choosing a threshold and comparing classifiers", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import precision_recall_curve, roc_auc_score
from sklearn.model_selection import cross_val_predict, train_test_split

digits = load_digits()
X_train, _, y_train, _ = train_test_split(digits.data, digits.target, test_size=0.25,
                                          random_state=42, stratify=digits.target)
y5 = y_train == 5

scores = cross_val_predict(SGDClassifier(random_state=42), X_train, y5, cv=3, method="decision_function")
precisions, recalls, thresholds = precision_recall_curve(y5, scores)
for t in [-2000, 0, 2000]:
    i = min(np.searchsorted(thresholds, t), len(thresholds) - 1)
    print(f"threshold {t:>5}: precision {precisions[i]:.3f}  recall {recalls[i]:.3f}")
i95 = int(np.argmax(precisions >= 0.95))
print(f"lowest threshold with ≥95% precision: {thresholds[i95]:.0f} → recall {recalls[i95]:.3f}")

forest_proba = cross_val_predict(RandomForestClassifier(random_state=42), X_train, y5, cv=3, method="predict_proba")[:, 1]
print("ROC AUC  SGD:", round(roc_auc_score(y5, scores), 4), " forest:", round(roc_auc_score(y5, forest_proba), 4))
`, "threshold -2000: precision 0.101  recall 1.000\nthreshold     0: precision 0.948  recall 0.934\nthreshold  2000: precision 1.000  recall 0.007\nlowest threshold with ≥95% precision: 12 → recall 0.934\nROC AUC  SGD: 0.9969  forest: 0.9992"),
        { t: "diagram", text: "scores:   low ◀────────────────────────▶ high\n          3 8 5 2 8 │ 5 5 9 5 5\n                    ▲ threshold\nmove right → fewer flagged → higher precision, lower recall\nmove left  → more flagged  → higher recall, lower precision" },
        { t: "table", head: ["Use case", "Prefer", "Threshold"], rows: [["Videos safe for kids", "High precision (few bad videos slip through as \"safe\")", "Higher"], ["Shoplifter detection on camera", "High recall (catch most, a guard checks alarms)", "Lower"], ["Comparing models overall", "ROC AUC (or PR AUC when positives are rare)", "All thresholds"]] },
        { t: "analogy", text: "The threshold is the bar for a job interview shortlist: raise it and everyone shortlisted is excellent (precision), but you miss some good candidates (recall); lower it and you catch everyone good, plus many weak candidates." },
        { t: "trap", text: "\"We'll get 99% precision\" is easy by setting a very high threshold, but recall may collapse. Always ask \"at what recall?\". When positives are rare, the precision-recall curve is more informative than the ROC curve." },
        { t: "trick", text: "**Score vs threshold. Higher threshold → precision ↑ recall ↓. Compare models by AUC.**" },
        { t: "exam", items: ["Explain the precision/recall trade-off.", "How do you choose a decision threshold?", "What is the ROC curve? AUC?", "When is the PR curve better than ROC?", "decision_function vs predict_proba?"] },
        { t: "recap", items: ["Classifiers output scores; a threshold turns them into labels", "Higher threshold: precision up, recall down", "precision_recall_curve to pick a threshold", "ROC AUC compares classifiers", "PR curve when positives are rare"] },
      ],
      quiz: [
        { q: "Raising the decision threshold usually…", options: ["Raises precision, lowers recall", "Raises both", "Lowers both", "Changes nothing"], answer: 0, explain: "Fewer, more confident positives." },
        { q: "A perfect classifier's ROC AUC is…", options: ["1.0", "0.5", "0", "100"], answer: 0, explain: "0.5 is random." },
        { q: "For rare positives, which curve is more informative?", options: ["Precision–recall", "ROC", "Learning curve", "Elbow curve"], answer: 0, explain: "ROC can look good misleadingly." },
        { q: "method=\"decision_function\" in cross_val_predict returns…", options: ["Raw scores", "Labels", "Probabilities always", "Errors"], answer: 0, explain: "Use them to choose thresholds." },
      ],
    },
    {
      id: "multiclass-errors-multilabel",
      title: "Multiclass, error analysis, multilabel and multioutput",
      oneLine: "For 10 digits, some algorithms handle many classes directly and others use one-vs-rest or one-vs-one binary classifiers. Scaling inputs helps. A confusion matrix of mistakes shows where to improve. Multilabel classifiers output several yes/no answers per image; multioutput ones predict many values (like every pixel of a cleaned image).",
      minutes: 22,
      blocks: [
        py("Ten classes, mistakes, labels and outputs", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import confusion_matrix, f1_score
from sklearn.model_selection import cross_val_predict, cross_val_score, train_test_split
from sklearn.multiclass import OneVsOneClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.25,
                                                    random_state=42, stratify=digits.target)
ovo = OneVsOneClassifier(SVC(random_state=42)).fit(X_train, y_train)
print("one-vs-one SVC: binary classifiers trained =", len(ovo.estimators_))

sgd = SGDClassifier(random_state=42)
print("SGD CV accuracy, raw pixels:", cross_val_score(sgd, X_train, y_train, cv=3).mean().round(3))
X_scaled = StandardScaler().fit_transform(X_train)
print("SGD CV accuracy, scaled:", cross_val_score(sgd, X_scaled, y_train, cv=3).mean().round(3))

pred = cross_val_predict(sgd, X_scaled, y_train, cv=3)
errors = confusion_matrix(y_train, pred)
np.fill_diagonal(errors, 0)
pairs = sorted(((int(errors[a, b]), a, b) for a in range(10) for b in range(10) if errors[a, b]), reverse=True)[:3]
print("most common mistakes (count, true, predicted):", pairs)

y_multilabel = np.c_[y_train >= 7, y_train % 2 == 1]            # two labels: large digit? odd digit?
knn = KNeighborsClassifier().fit(X_train, y_multilabel)
print("multilabel prediction for a 9:", knn.predict(X_test[y_test == 9][:1]).tolist())
ml_pred = cross_val_predict(KNeighborsClassifier(), X_train, y_multilabel, cv=3)
print("average F1 over both labels:", round(f1_score(y_multilabel, ml_pred, average="macro"), 3))

rng = np.random.default_rng(42)                                  # multioutput: remove noise from images
noisy_train = X_train + rng.integers(0, 6, X_train.shape)
noisy_test = X_test + rng.integers(0, 6, X_test.shape)
cleaner = KNeighborsClassifier().fit(noisy_train, X_train)       # predicts all 64 pixels at once
cleaned = cleaner.predict(noisy_test[:20])
print("mean pixel error — noisy:", round(float(np.abs(noisy_test[:20] - X_test[:20]).mean()), 2),
      " cleaned:", round(float(np.abs(cleaned - X_test[:20]).mean()), 2))
`, "one-vs-one SVC: binary classifiers trained = 45\nSGD CV accuracy, raw pixels: 0.898\nSGD CV accuracy, scaled: 0.945\nmost common mistakes (count, true, predicted): [(7, 3, 8), (6, 9, 8), (4, 9, 3)]\nmultilabel prediction for a 9: [[True, True]]\naverage F1 over both labels: 0.985\nmean pixel error — noisy: 2.48  cleaned: 1.44"),
        { t: "table", head: ["Type", "Output", "Example"], rows: [["Binary", "One yes/no", "Is it a 5?"], ["Multiclass", "One of many classes", "Which digit 0–9?"], ["Multilabel", "Several yes/no labels", "Is it large? Is it odd? (tags on a photo)"], ["Multioutput", "Several values, each with many classes", "Every pixel of a cleaned image"]] },
        { t: "p", text: "Scaling the pixels improves the linear classifier noticeably. The error list shows exactly which digit pairs get confused, which is where to focus: more examples of those digits, extra features (counting closed loops), or a better model. One-vs-one trains a classifier for every pair of classes (45 for 10 digits)." },
        { t: "analogy", text: "Error analysis is a teacher marking a class test and noticing that most mistakes are students mixing up 3s and 5s: the next lesson targets exactly that, instead of reteaching everything." },
        { t: "trap", text: "Don't stop at the overall score: one confused pair can hide behind a good average. With multilabel problems, decide whether every label matters equally (macro average) or by frequency (weighted average)." },
        { t: "trick", text: "**Multiclass: OvR or OvO under the hood. Scale features. Read the error matrix. Multilabel = many yes/no; multioutput = many values.**" },
        { t: "exam", items: ["One-vs-rest vs one-vs-one?", "How do you analyse a classifier's errors?", "Multilabel vs multiclass vs multioutput?", "Macro vs weighted average F1?", "Why does scaling help some classifiers?"] },
        { t: "recap", items: ["Some algorithms are natively multiclass; others use OvR/OvO", "OvO trains N(N−1)/2 classifiers", "Scale inputs for linear models", "Error confusion matrix shows what to fix", "Multilabel and multioutput predict several targets"] },
      ],
      quiz: [
        { q: "One-vs-one for 4 classes trains how many binary classifiers?", options: ["6", "4", "3", "16"], answer: 0, explain: "4 × 3 / 2." },
        { q: "Tagging a photo as both \"beach\" and \"sunset\" is…", options: ["Multilabel classification", "Binary", "Regression", "Clustering"], answer: 0, explain: "Several labels at once." },
        { q: "Error analysis means…", options: ["Studying which classes get confused to guide improvements", "Deleting wrong predictions", "Lowering the threshold", "Training longer"], answer: 0, explain: "Focus effort where it matters." },
        { q: "Predicting all 64 clean pixel values is…", options: ["Multioutput", "Binary", "Multilabel only", "Unsupervised"], answer: 0, explain: "Many outputs, each with many values." },
      ],
    },
  ],
};

export const HO04_TRAINING_MODELS: LearnModule = {
  id: "training-models",
  title: "Training models",
  titleHi: "मॉडल ट्रेनिंग",
  blurb: "How models actually learn: the normal equation, batch, stochastic and mini-batch gradient descent, polynomial regression and learning curves, ridge, lasso, elastic net and early stopping, then logistic and softmax regression.",
  lessons: [
    {
      id: "normal-equation-gd",
      title: "Linear regression: the normal equation and gradient descent",
      oneLine: "Linear regression can be solved directly (the normal equation, or SVD via lstsq) or by gradient descent: batch (all data per step), stochastic (one random row per step, with a decreasing learning rate) or mini-batch (small random groups). The direct way is exact but slows with many features; gradient descent scales to huge data.",
      minutes: 24,
      blocks: [
        py("Four ways to fit y = 4 + 3x", src`
import numpy as np
from sklearn.linear_model import LinearRegression, SGDRegressor

rng = np.random.default_rng(42)
m = 100
X = 2 * rng.random((m, 1))
y = 4 + 3 * X[:, 0] + rng.normal(0, 1, m)
X_b = np.c_[np.ones((m, 1)), X]                        # add x0 = 1 for the intercept

theta_normal = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y  # normal equation
theta_lstsq = np.linalg.lstsq(X_b, y, rcond=None)[0]   # SVD-based (what sklearn uses)
print("normal equation:", theta_normal.round(3), "| lstsq:", theta_lstsq.round(3))
lin = LinearRegression().fit(X, y)
print("sklearn:", round(lin.intercept_, 3), lin.coef_.round(3))

for eta in [0.02, 0.1, 0.5]:                           # batch gradient descent
    theta = np.zeros(2)
    for _ in range(1000):
        gradients = 2 / m * X_b.T @ (X_b @ theta - y)
        theta -= eta * gradients
    print(f"batch GD η={eta}: {theta.round(3)}")

theta = np.zeros(2)                                    # stochastic GD with a learning schedule
for epoch in range(50):
    for i in rng.permutation(m):
        xi, yi = X_b[i:i + 1], y[i:i + 1]
        eta = 5 / (epoch * m + i + 50)                 # learning rate shrinks over time
        theta -= eta * 2 * xi.T @ (xi @ theta - yi)
print("stochastic GD:", theta.round(3))
sgd = SGDRegressor(max_iter=1000, tol=1e-5, penalty=None, eta0=0.01, random_state=42).fit(X, y)
print("SGDRegressor:", round(float(sgd.intercept_[0]), 3), sgd.coef_.round(3))
`, "normal equation: [3.949 3.038] | lstsq: [3.949 3.038]\nsklearn: 3.949 [3.038]\nbatch GD η=0.02: [3.946 3.041]\nbatch GD η=0.1: [3.949 3.038]\nbatch GD η=0.5: [-1.31337421e+43 -1.48829504e+43]\nstochastic GD: [3.947 3.04 ]\nSGDRegressor: 3.897 [3.083]"),
        { t: "table", head: ["Method", "Large m (rows)", "Large n (features)", "Needs scaling", "Out-of-core"], rows: [["Normal equation / SVD", "Fast", "Slow (≈ n² to n³)", "No", "No"], ["Batch GD", "Slow", "Fast", "Yes", "No"], ["Stochastic GD", "Fast", "Fast", "Yes", "Yes"], ["Mini-batch GD", "Fast", "Fast", "Yes", "Yes (and GPU-friendly)"]] },
        { t: "analogy", text: "The normal equation is solving for the bottom of a valley with a formula. Batch GD walks down using a survey of the whole valley at every step; stochastic GD looks at one random stone each step: a drunken but fast walk that settles down as the steps (learning rate) get smaller." },
        { t: "trap", text: "With GD, a learning rate too low crawls (η = 0.02 above hasn't quite finished), and too high diverges. Always scale features for gradient descent, or the error surface becomes a long narrow valley. SGD's final weights bounce around the minimum unless the learning rate decays." },
        { t: "trick", text: "**Few features → normal equation/lstsq. Huge data → (mini-batch) SGD with scaling and a learning schedule.**" },
        { t: "exam", items: ["What is the normal equation?", "Computational complexity of the normal equation vs gradient descent?", "Batch vs stochastic vs mini-batch GD?", "What is a learning schedule?", "Why does feature scaling matter for gradient descent?"] },
        { t: "recap", items: ["θ = (XᵀX)⁻¹Xᵀy, or lstsq/SVD", "Batch GD: gradient over all rows", "SGD: one row per step, decaying learning rate", "Mini-batch: small groups (deep-learning standard)", "Scale features for gradient descent"] },
      ],
      quiz: [
        { q: "The normal equation becomes slow when…", options: ["There are very many features", "There are many rows", "Features are scaled", "The data is linear"], answer: 0, explain: "Inverting XᵀX scales badly with n." },
        { q: "SGD updates parameters using…", options: ["One random instance at a time", "All instances", "No data", "The test set"], answer: 0, explain: "Fast but noisy." },
        { q: "A learning schedule…", options: ["Gradually reduces the learning rate", "Increases the batch size randomly", "Picks features", "Splits the data"], answer: 0, explain: "Lets SGD settle." },
        { q: "Which method needs feature scaling?", options: ["Gradient descent", "The normal equation", "Both equally", "Neither"], answer: 0, explain: "Unscaled features slow it badly." },
      ],
    },
    {
      id: "polynomial-learning-curves",
      title: "Polynomial regression and learning curves",
      oneLine: "Adding powers of features lets a linear model fit curves. To tell whether a model underfits or overfits, plot learning curves: training and validation error as the training set grows. Underfitting: both errors high and close. Overfitting: a big gap that more data helps close.",
      minutes: 20,
      blocks: [
        py("Fitting a curve and reading learning curves", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import learning_curve
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

rng = np.random.default_rng(42)
m = 200
X = 6 * rng.random((m, 1)) - 3
y = 0.5 * X[:, 0] ** 2 + X[:, 0] + 2 + rng.normal(0, 1, m)

quad = make_pipeline(PolynomialFeatures(2, include_bias=False), LinearRegression()).fit(X, y)
print("learned: y =", round(quad[-1].intercept_, 2), "+", quad[-1].coef_.round(2).tolist(), "· [x, x²]")

for name, model in [("line (degree 1)", LinearRegression()),
                    ("degree 10", make_pipeline(PolynomialFeatures(10), StandardScaler(), LinearRegression()))]:
    sizes, train, valid = learning_curve(model, X, y, train_sizes=[0.1, 0.3, 0.6, 1.0], cv=5,
                                         scoring="neg_root_mean_squared_error", shuffle=True, random_state=42)
    print(name)
    for n, tr, va in zip(sizes, -train.mean(axis=1), -valid.mean(axis=1)):
        print(f"   {n:>3} rows: train RMSE {tr:.2f}   validation RMSE {va:.2f}")
`, "learned: y = 2.01 + [1.11, 0.51] · [x, x²]\nline (degree 1)\n    16 rows: train RMSE 1.18   validation RMSE 1.87\n    48 rows: train RMSE 1.48   validation RMSE 1.69\n    96 rows: train RMSE 1.60   validation RMSE 1.66\n   160 rows: train RMSE 1.62   validation RMSE 1.64\ndegree 10\n    16 rows: train RMSE 0.52   validation RMSE 390.99\n    48 rows: train RMSE 0.92   validation RMSE 2.01\n    96 rows: train RMSE 0.99   validation RMSE 1.11\n   160 rows: train RMSE 0.97   validation RMSE 1.03"),
        { t: "p", text: "The quadratic model recovers roughly 0.5x² + x + 2. The straight line's errors stay high and close together: more data won't help (underfitting). The degree-10 model has low training error but a gap to validation error, largest with little data, and the gap shrinks as data grows (overfitting fixed by more data)." },
        { t: "table", head: ["Learning curve shape", "Diagnosis", "Fix"], rows: [["Both high, plateaued, close", "Underfitting (bias)", "More complex model, better features"], ["Train low, validation much higher", "Overfitting (variance)", "More data, regularisation, simpler model"], ["Gap closing as data grows", "Variance shrinking", "Collect more data"]] },
        { t: "analogy", text: "A learning curve is a student's marks in practice tests (training) vs surprise tests (validation) as they study more chapters. A big gap means rote learning; both low means they need a better study method." },
        { t: "trap", text: "PolynomialFeatures(degree) explodes the number of features with many inputs ((n + d)! / (d! n!)), and high powers need scaling. The bias/variance trade-off is unavoidable: reduce one and the other tends to grow." },
        { t: "trick", text: "**Both errors high → bias → more power. Big gap → variance → more data or regularisation.**" },
        { t: "exam", items: ["How does polynomial regression work?", "What are learning curves and how do you read them?", "Explain the bias/variance trade-off.", "What is irreducible error?"] },
        { t: "recap", items: ["PolynomialFeatures + LinearRegression fits curves", "learning_curve shows train vs validation by size", "Underfit: both high; overfit: big gap", "More data helps variance, not bias", "Error = bias² + variance + irreducible noise"] },
      ],
      quiz: [
        { q: "Training and validation errors are both high and equal. The model…", options: ["Underfits", "Overfits", "Is perfect", "Leaks data"], answer: 0, explain: "High bias." },
        { q: "Will more training data fix underfitting?", options: ["Usually not", "Always", "Only with scaling", "Yes, completely"], answer: 0, explain: "Use a more powerful model." },
        { q: "PolynomialFeatures(degree=2) on one feature x adds…", options: ["x²", "x³", "log x", "Nothing"], answer: 0, explain: "(and keeps x)." },
        { q: "A large gap between train and validation error indicates…", options: ["High variance (overfitting)", "High bias", "Noise-free data", "A small test set"], answer: 0, explain: "It fits training noise." },
      ],
    },
    {
      id: "regularized-models",
      title: "Ridge, lasso, elastic net and early stopping",
      oneLine: "Regularisation constrains a model's weights to reduce overfitting. Ridge adds α·Σθ² (shrinks all weights), lasso adds α·Σ|θ| (sets many weights to exactly zero), elastic net mixes them, and early stopping halts gradient descent when validation error starts rising.",
      minutes: 22,
      blocks: [
        py("Regularising a degree-10 model", src`
import numpy as np
from copy import deepcopy
from sklearn.linear_model import ElasticNet, Lasso, LinearRegression, Ridge, SGDRegressor
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

rng = np.random.default_rng(42)
X = 6 * rng.random((30, 1)) - 3                      # only 30 points: easy to overfit
y = 0.5 * X[:, 0] ** 2 + X[:, 0] + 2 + rng.normal(0, 1, 30)
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.5, random_state=42)

for name, reg in [("no regularisation", LinearRegression()), ("ridge α=1", Ridge(alpha=1)),
                  ("lasso α=0.1", Lasso(alpha=0.1, max_iter=100_000)), ("elastic net", ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=100_000))]:
    model = make_pipeline(PolynomialFeatures(10, include_bias=False), StandardScaler(), reg).fit(X_tr, y_tr)
    coefs = model[-1].coef_
    val_rmse = mean_squared_error(y_val, model.predict(X_val)) ** 0.5
    print(f"{name:<18} validation RMSE {val_rmse:7.2f}   Σ|θ| {np.abs(coefs).sum():8.2f}   zero weights {int(np.sum(np.abs(coefs) < 1e-6))}")

prep = make_pipeline(PolynomialFeatures(10, include_bias=False), StandardScaler()).fit(X_tr)
Xp_tr, Xp_val = prep.transform(X_tr), prep.transform(X_val)
sgd = SGDRegressor(penalty=None, learning_rate="constant", eta0=0.01, random_state=42)
best_rmse, best_epoch, best_model = float("inf"), 0, None
for epoch in range(1, 501):                            # early stopping by hand
    sgd.partial_fit(Xp_tr, y_tr)
    rmse = mean_squared_error(y_val, sgd.predict(Xp_val)) ** 0.5
    if rmse < best_rmse:
        best_rmse, best_epoch, best_model = rmse, epoch, deepcopy(sgd)
print(f"early stopping: best validation RMSE {best_rmse:.2f} at epoch {best_epoch} of 500")
`, "no regularisation  validation RMSE 3261.55   Σ|θ|  8999.95   zero weights 0\nridge α=1          validation RMSE    1.78   Σ|θ|     2.95   zero weights 0\nlasso α=0.1        validation RMSE    1.39   Σ|θ|     1.89   zero weights 8\nelastic net        validation RMSE    1.44   Σ|θ|     1.94   zero weights 6\nearly stopping: best validation RMSE 1.73 at epoch 65 of 500"),
        { t: "formula", items: [["Ridge (L2)", "cost = MSE + α · Σ θᵢ²"], ["Lasso (L1)", "cost = MSE + α · Σ |θᵢ|"], ["Elastic net", "cost = MSE + r·α·Σ|θᵢ| + (1 − r)/2 · α · Σθᵢ²"], ["Early stopping", "keep the weights from the epoch with the lowest validation error"]] },
        { t: "p", text: "Without regularisation, ten polynomial weights chase the noise and validation error is poor. Ridge shrinks the weights; lasso zeros out most of the high powers, effectively selecting features; elastic net sits between. Early stopping regularises by simply stopping training at the best epoch." },
        { t: "analogy", text: "Regularisation is a budget on how wild the model can be: ridge taxes every large weight, lasso fires weights that don't pull their weight, and early stopping is leaving the exam hall once you've answered what you know, before second-guessing ruins the answers." },
        { t: "trap", text: "Always scale features before ridge, lasso or elastic net (the penalty treats all weights equally). Lasso behaves erratically when features are strongly correlated or outnumber rows; elastic net is safer then. Tune α with cross-validation (RidgeCV, LassoCV)." },
        { t: "trick", text: "**Default: a bit of ridge. Suspect few useful features: lasso or elastic net. Iterative training: early stopping.**" },
        { t: "exam", items: ["Ridge vs lasso vs elastic net?", "Why does lasso produce sparse models?", "Why scale before regularising?", "What is early stopping?", "How do you choose α?"] },
        { t: "recap", items: ["Regularisation limits weight size", "Ridge: L2, shrinks all", "Lasso: L1, zeros many (feature selection)", "Elastic net mixes both", "Early stopping keeps the best epoch's weights"] },
      ],
      quiz: [
        { q: "Which regularisation can set weights exactly to zero?", options: ["Lasso", "Ridge", "None", "Early stopping"], answer: 0, explain: "The L1 penalty." },
        { q: "Increasing ridge's α makes weights…", options: ["Smaller", "Larger", "Unchanged", "Negative"], answer: 0, explain: "Stronger shrinkage." },
        { q: "Early stopping stops training when…", options: ["Validation error stops improving", "Training error reaches zero", "After one epoch", "Weights become zero"], answer: 0, explain: "Then keep the best weights." },
        { q: "With many correlated features, prefer…", options: ["Elastic net over lasso", "No regularisation", "Lasso always", "A larger learning rate"], answer: 0, explain: "Lasso can be erratic there." },
      ],
    },
    {
      id: "logistic-softmax",
      title: "Logistic and softmax regression",
      oneLine: "Logistic regression estimates the probability that an instance belongs to a class (sigmoid of a linear score) and is trained by minimising log loss. Softmax regression generalises it to many classes: one score per class, turned into probabilities that sum to 1.",
      minutes: 20,
      blocks: [
        py("Iris flowers: one class, then three", src`
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

iris = load_iris(as_frame=True)
X = iris.data[["petal width (cm)"]].values
y = iris.target_names[iris.target] == "virginica"
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)
log_reg = LogisticRegression().fit(X_tr, y_tr)

widths = np.linspace(0, 3, 1000).reshape(-1, 1)
proba = log_reg.predict_proba(widths)[:, 1]
boundary = widths[np.argmax(proba >= 0.5)][0]
print(f"decision boundary: petal width ≈ {boundary:.2f} cm")
print("P(virginica) at 1.4, 1.7, 2.0 cm:", log_reg.predict_proba([[1.4], [1.7], [2.0]])[:, 1].round(3).tolist())
print("test accuracy:", round(log_reg.score(X_te, y_te), 3))

X2 = iris.data[["petal length (cm)", "petal width (cm)"]].values
X2_tr, X2_te, y2_tr, y2_te = train_test_split(X2, iris.target, random_state=42)
softmax = LogisticRegression(C=30).fit(X2_tr, y2_tr)            # multinomial (softmax) for 3 classes
p = softmax.predict_proba([[5, 2]])[0]
print("flower with petals 5 × 2 cm:", dict(zip(iris.target_names.tolist(), p.round(3).tolist())), "sum =", round(float(p.sum()), 3))
print("softmax test accuracy:", round(softmax.score(X2_te, y2_te), 3))
`, "decision boundary: petal width ≈ 1.65 cm\nP(virginica) at 1.4, 1.7, 2.0 cm: [0.277, 0.547, 0.792]\ntest accuracy: 1.0\nflower with petals 5 × 2 cm: {'setosa': 0.0, 'versicolor': 0.041, 'virginica': 0.959} sum = 1.0\nsoftmax test accuracy: 1.0"),
        { t: "formula", items: [["Logistic", "p̂ = σ(θᵀx) = 1 / (1 + e^(−θᵀx))"], ["Log loss", "J = −(1/m) Σ [y log p̂ + (1 − y) log(1 − p̂)]"], ["Softmax", "p̂ₖ = exp(sₖ) / Σⱼ exp(sⱼ), with one score sₖ = θₖᵀx per class"], ["Cross-entropy", "J = −(1/m) Σ Σₖ yₖ log p̂ₖ"]] },
        { t: "analogy", text: "Softmax is a vote-counting machine: each class gets a raw score, the exponentials make bigger scores much more dominant, and dividing by the total turns them into shares that add up to 100%." },
        { t: "trap", text: "scikit-learn's LogisticRegression applies L2 regularisation by default (controlled by C, the inverse of α); larger C means less regularisation. Logistic regression's boundary is linear in the inputs: for curved boundaries add features or use another model." },
        { t: "trick", text: "**Two classes → sigmoid + log loss. Many classes → softmax + cross-entropy. C = 1/α.**" },
        { t: "exam", items: ["How does logistic regression estimate probabilities?", "What is log loss?", "What is softmax regression?", "What is the decision boundary?", "What does C control in LogisticRegression?"] },
        { t: "recap", items: ["Logistic: sigmoid of a linear score", "Trained by minimising log loss (convex)", "Decision boundary where p = 0.5", "Softmax: one score per class → probabilities summing to 1", "C is inverse regularisation strength"] },
      ],
      quiz: [
        { q: "Softmax probabilities across all classes sum to…", options: ["1", "The number of classes", "0", "Any value"], answer: 0, explain: "They're shares of a whole." },
        { q: "The decision boundary of logistic regression is where p̂ =", options: ["0.5", "0", "1", "e"], answer: 0, explain: "Equal chance either way." },
        { q: "In sklearn, increasing C makes regularisation…", options: ["Weaker", "Stronger", "Unchanged", "L1"], answer: 0, explain: "C = 1/α." },
        { q: "The loss minimised by logistic regression is…", options: ["Log loss", "MSE", "Hinge loss", "MAE"], answer: 0, explain: "Also called binary cross-entropy." },
      ],
    },
  ],
};

export const HO05_SVM_TREES: LearnModule = {
  id: "svm-trees",
  title: "Support vector machines and decision trees",
  titleHi: "सपोर्ट वेक्टर मशीन और डिसीज़न ट्री",
  blurb: "Two classic model families: SVMs (large-margin classification, soft margins, polynomial and RBF kernels, SVM regression, hinge loss) and decision trees (training and visualising, Gini and the CART algorithm, regularisation, regression trees, instability).",
  lessons: [
    {
      id: "svm-classification",
      title: "SVM classification: margins and kernels",
      oneLine: "An SVM fits the widest possible street between classes. A soft margin (controlled by C) allows some violations to generalise better. For curved boundaries, add polynomial features or use the kernel trick (polynomial or RBF), which gets the same effect without creating the features.",
      minutes: 22,
      blocks: [
        py("Linear and non-linear SVMs", src`
from sklearn.datasets import load_iris, make_moons
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVC, LinearSVC

iris = load_iris(as_frame=True)
X = iris.data[["petal length (cm)", "petal width (cm)"]].values
y = iris.target == 2                                         # virginica?
for C in [0.01, 1, 100]:
    clf = make_pipeline(StandardScaler(), LinearSVC(C=C, random_state=42)).fit(X, y)
    margin_width = 2 / (clf[-1].coef_ ** 2).sum() ** 0.5
    print(f"LinearSVC C={C:<5}: training accuracy {clf.score(X, y):.3f}, margin width (scaled units) {margin_width:.2f}")

X_m, y_m = make_moons(n_samples=200, noise=0.15, random_state=42)
models = {
    "linear only": make_pipeline(StandardScaler(), LinearSVC(C=10, random_state=42, max_iter=10_000)),
    "poly features + linear": make_pipeline(PolynomialFeatures(3), StandardScaler(), LinearSVC(C=10, random_state=42, max_iter=10_000)),
    "poly kernel (d=3)": make_pipeline(StandardScaler(), SVC(kernel="poly", degree=3, coef0=1, C=5)),
    "RBF kernel": make_pipeline(StandardScaler(), SVC(kernel="rbf", gamma=5, C=1)),
}
for name, model in models.items():
    print(f"moons, {name:<23} CV accuracy {cross_val_score(model, X_m, y_m, cv=5).mean():.3f}")
`, "LinearSVC C=0.01 : training accuracy 0.940, margin width (scaled units) 4.21\nLinearSVC C=1    : training accuracy 0.960, margin width (scaled units) 0.87\nLinearSVC C=100  : training accuracy 0.960, margin width (scaled units) 0.52\nmoons, linear only             CV accuracy 0.845\nmoons, poly features + linear  CV accuracy 0.990\nmoons, poly kernel (d=3)       CV accuracy 0.980\nmoons, RBF kernel              CV accuracy 0.990"),
        { t: "table", head: ["Hyperparameter", "Small", "Large"], rows: [["C", "Wider street, more violations, smoother (risk of underfit)", "Narrow street, fewer violations (risk of overfit)"], ["gamma (RBF)", "Each point influences far away: smooth boundary", "Influence is local: wiggly boundary"], ["degree (poly)", "Simpler curves", "Complex curves"]] },
        { t: "p", text: "Lower C widens the margin. On the moons, a straight boundary can't separate the classes, while polynomial features, a polynomial kernel or an RBF kernel all succeed. The kernel trick computes the effect of the high-degree features without ever building them." },
        { t: "analogy", text: "An SVM is a road planner fitting the widest road between two villages. A soft margin lets a few houses sit on the road's edge if that makes the road much wider overall. The kernel trick is lifting the map into 3-D so a curved border becomes a flat cut." },
        { t: "trap", text: "SVMs are very sensitive to feature scales: always scale first. Kernel SVMs scale badly with the number of rows (roughly m² to m³ training time), so prefer LinearSVC or SGD for big datasets." },
        { t: "trick", text: "**Scale → try LinearSVC → if curved, RBF kernel → tune C and gamma together.**" },
        { t: "exam", items: ["What is large-margin classification?", "Hard vs soft margin? What does C do?", "What is the kernel trick?", "Polynomial vs RBF kernel?", "Why must features be scaled for SVMs?"] },
        { t: "recap", items: ["SVMs fit the widest street between classes", "C trades margin width vs violations", "Polynomial features or kernels for curves", "RBF with gamma and C is a strong default", "Scale features; kernel SVMs suit small/medium data"] },
      ],
      quiz: [
        { q: "Decreasing C in an SVM…", options: ["Widens the margin and allows more violations", "Narrows the margin", "Changes the kernel", "Removes scaling"], answer: 0, explain: "More regularisation." },
        { q: "Which kernel is a good default for non-linear data?", options: ["RBF", "Linear", "None", "Sigmoid always"], answer: 0, explain: "Then tune gamma and C." },
        { q: "The kernel trick lets SVMs…", options: ["Behave as if high-degree features were added, without computing them", "Train without data", "Skip scaling", "Cluster data"], answer: 0, explain: "Implicit feature mapping." },
        { q: "For 10 million rows, which SVM is practical?", options: ["LinearSVC / SGDClassifier", "SVC with RBF kernel", "Any kernel SVM", "None"], answer: 0, explain: "Kernel SVMs scale badly with rows." },
      ],
    },
    {
      id: "svm-regression-hinge",
      title: "SVM regression and what happens under the hood",
      oneLine: "SVM regression flips the goal: fit as many instances as possible inside a street of width ε, and ignore errors smaller than ε. Under the hood, a linear SVM computes a decision function wᵀx + b and is trained by minimising the hinge loss plus a penalty on ‖w‖.",
      minutes: 18,
      blocks: [
        py("SVR, the decision function and hinge loss", src`
import numpy as np
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR, LinearSVC, LinearSVR

rng = np.random.default_rng(42)
X = 2 * rng.random((100, 1))
y = 4 + 3 * X[:, 0] + rng.normal(0, 0.5, 100)
for eps in [0.5, 1.5]:
    svr = LinearSVR(epsilon=eps, random_state=42, max_iter=10_000).fit(X, y)
    inside = np.abs(svr.predict(X) - y) <= eps
    print(f"LinearSVR ε={eps}: slope {svr.coef_[0]:.2f}, intercept {svr.intercept_[0]:.2f}, points inside the street {inside.mean():.0%}")

x_curve = 2 * rng.random((100, 1)) - 1
y_curve = 0.2 + 0.1 * x_curve[:, 0] + 0.5 * x_curve[:, 0] ** 2 + rng.normal(0, 0.1, 100)
svr_poly = SVR(kernel="poly", degree=2, coef0=1, C=100, epsilon=0.1).fit(x_curve, y_curve)
print("polynomial SVR R²:", round(svr_poly.score(x_curve, y_curve), 3), "| support vectors:", len(svr_poly.support_))

iris = load_iris()
X_i = StandardScaler().fit_transform(iris.data[:, 2:])
y_i = np.where(iris.target == 2, 1, -1)                    # SVM labels are −1 / +1
clf = LinearSVC(C=1, random_state=42).fit(X_i, y_i)
scores = clf.decision_function(X_i[:3])
print("decision function for 3 flowers:", scores.round(2).tolist(), "→ classes", np.sign(scores).astype(int).tolist())
hinge = np.maximum(0, 1 - y_i * clf.decision_function(X_i))
print(f"mean hinge loss {hinge.mean():.3f}; instances with zero loss (outside the margin, correct side) {np.mean(hinge == 0):.0%}")
`, "LinearSVR ε=0.5: slope 3.01, intercept 3.96, points inside the street 69%\nLinearSVR ε=1.5: slope 3.35, intercept 3.12, points inside the street 96%\npolynomial SVR R²: 0.616 | support vectors: 35\ndecision function for 3 flowers: [-6.26, -6.26, -6.34] → classes [-1, -1, -1]\nmean hinge loss 0.131; instances with zero loss (outside the margin, correct side) 73%"),
        { t: "formula", items: [["Decision function", "h = wᵀx + b; predict +1 if h ≥ 0, else −1"], ["Hinge loss", "max(0, 1 − t·h): zero when correct with margin, grows linearly otherwise"], ["Soft-margin objective", "½‖w‖² + C · Σ hinge losses"], ["SVR", "ignore errors within ±ε; minimise ‖w‖ and the errors beyond ε"]] },
        { t: "analogy", text: "SVM regression is a road built along the data: points on the road are fine whatever their exact position; only points off the road (beyond ε) cost something. The hinge loss is a toll that's free if you're comfortably on the right side, and grows the further you stray." },
        { t: "trap", text: "SVMs don't output probabilities natively; `SVC(probability=True)` adds an expensive calibration step. Use the decision function for ranking and thresholds, or a calibrated classifier when you need probabilities." },
        { t: "trick", text: "**Classification: widest street, few inside. Regression: narrow street, most inside (ε). Loss: hinge.**" },
        { t: "exam", items: ["How does SVM regression work?", "What is ε in SVR?", "What is the hinge loss?", "Why don't SVMs output probabilities directly?", "What are support vectors?"] },
        { t: "recap", items: ["SVR fits a street of width ε around the data", "Points inside ε add no loss", "Decision function wᵀx + b", "Hinge loss max(0, 1 − t·h)", "Soft margin: ½‖w‖² + C·Σ hinge"] },
      ],
      quiz: [
        { q: "In SVR, errors smaller than ε…", options: ["Are ignored", "Are squared", "Double the loss", "Remove the point"], answer: 0, explain: "The ε-insensitive street." },
        { q: "Hinge loss for a correctly classified point beyond the margin is…", options: ["0", "1", "Negative", "Infinite"], answer: 0, explain: "max(0, 1 − t·h) with t·h ≥ 1." },
        { q: "SVM labels in the hinge-loss formula are…", options: ["−1 and +1", "0 and 1", "Probabilities", "Any numbers"], answer: 0, explain: "So t·h measures correctness." },
        { q: "To get probabilities from SVC you set…", options: ["probability=True (slower)", "kernel=\"prob\"", "C=0", "Nothing; it always gives them"], answer: 0, explain: "It calibrates scores." },
      ],
    },
    {
      id: "decision-trees-cart",
      title: "Decision trees: training, Gini and the CART algorithm",
      oneLine: "A decision tree asks yes/no questions about features. scikit-learn's CART algorithm picks, at each node, the feature and threshold that produce the purest subsets (lowest weighted Gini impurity), then repeats. Trees need no scaling, are easy to explain, and estimate class probabilities from the leaf's class mix.",
      minutes: 20,
      blocks: [
        py("Train, read and check a tree", src`
import numpy as np
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, export_text

iris = load_iris(as_frame=True)
X = iris.data[["petal length (cm)", "petal width (cm)"]].values
y = iris.target
tree = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X, y)
print(export_text(tree, feature_names=["petal length", "petal width"], show_weights=True))

flower = [[5.0, 1.5]]
print("P(class) for a 5 × 1.5 cm petal:", dict(zip(iris.target_names.tolist(), tree.predict_proba(flower)[0].round(3).tolist())))

def gini(counts):
    p = np.array(counts) / sum(counts)
    return 1 - np.sum(p ** 2)

left, right = [50, 0, 0], [0, 50, 50]                       # the root split
root = gini([50, 50, 50])
after = (50 * gini(left) + 100 * gini(right)) / 150
print(f"root Gini {root:.3f} → weighted Gini after the first split {after:.3f}")
`, "|--- petal length <= 2.45\n|   |--- weights: [50.00, 0.00, 0.00] class: 0\n|--- petal length >  2.45\n|   |--- petal width <= 1.75\n|   |   |--- weights: [0.00, 49.00, 5.00] class: 1\n|   |--- petal width >  1.75\n|   |   |--- weights: [0.00, 1.00, 45.00] class: 2\n\nP(class) for a 5 × 1.5 cm petal: {'setosa': 0.0, 'versicolor': 0.907, 'virginica': 0.093}\nroot Gini 0.667 → weighted Gini after the first split 0.333"),
        { t: "formula", items: [["Gini impurity", "G = 1 − Σ pₖ² (0 = pure)"], ["Entropy (alternative)", "H = −Σ pₖ log₂ pₖ"], ["CART cost for a split", "J = (m_left/m)·G_left + (m_right/m)·G_right; choose the split that minimises J"], ["Prediction cost", "O(log₂ m): very fast"]] },
        { t: "analogy", text: "CART is a quiz-master choosing, at each round, the single question that best separates the remaining contestants into clean groups. It never looks ahead, which keeps it fast but means the tree isn't guaranteed to be the best possible one." },
        { t: "trap", text: "CART is greedy: a locally best split isn't always globally best. Gini and entropy usually produce very similar trees; Gini is slightly faster. A tree's probability estimates are coarse (just the class mix of one leaf)." },
        { t: "trick", text: "**Each node: best feature + threshold by lowest weighted Gini. Leaf class mix = probability.**" },
        { t: "exam", items: ["How does the CART algorithm work?", "What is Gini impurity? Entropy?", "How does a tree estimate probabilities?", "Why don't trees need feature scaling?", "What is the computational complexity of prediction?"] },
        { t: "recap", items: ["Trees ask yes/no feature questions", "CART splits to minimise weighted Gini", "Greedy, not globally optimal", "Probabilities from leaf class proportions", "No scaling; easy to explain (white box)"] },
      ],
      quiz: [
        { q: "Gini impurity of a node with 50 of one class only?", options: ["0", "0.5", "1", "0.667"], answer: 0, explain: "A pure node." },
        { q: "Gini of a node with three classes in equal shares?", options: ["0.667", "0.5", "0", "1"], answer: 0, explain: "1 − 3 × (1/3)²." },
        { q: "CART is called greedy because…", options: ["It picks the best split at each step without looking ahead", "It uses all features at once", "It's slow", "It needs scaling"], answer: 0, explain: "Fast but not globally optimal." },
        { q: "Do decision trees need feature scaling?", options: ["No", "Yes", "Only for classification", "Only with Gini"], answer: 0, explain: "Splits compare values within one feature." },
      ],
    },
    {
      id: "tree-regularization-instability",
      title: "Regularising trees, regression trees and instability",
      oneLine: "Unrestricted trees overfit, so limit them with max_depth, min_samples_leaf, max_leaf_nodes and similar settings. Regression trees predict the average value in each leaf. Trees are unstable: small changes in data (or rotating it) can produce very different trees, which ensembles fix.",
      minutes: 20,
      blocks: [
        py("Regularisation, regression and instability", src`
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

X, y = make_moons(n_samples=300, noise=0.25, random_state=42)
for name, tree in [("no limits", DecisionTreeClassifier(random_state=42)),
                   ("min_samples_leaf=5", DecisionTreeClassifier(min_samples_leaf=5, random_state=42))]:
    tree.fit(X, y)
    print(f"{name:<19} leaves {tree.get_n_leaves():>3}  train acc {tree.score(X, y):.3f}  CV acc {cross_val_score(tree, X, y, cv=5).mean():.3f}")

rng = np.random.default_rng(42)
x = rng.random((200, 1)) - 0.5
target = x[:, 0] ** 2 + 0.025 * rng.normal(size=200)
for depth in [2, 3, None]:
    reg = DecisionTreeRegressor(max_depth=depth, random_state=42)
    score = cross_val_score(reg, x, target, cv=5, scoring="neg_root_mean_squared_error").mean()
    print(f"regression tree max_depth={str(depth):<4} CV RMSE {-score:.4f}")
print("depth-2 tree predicts only", len(np.unique(DecisionTreeRegressor(max_depth=2).fit(x, target).predict(x))), "distinct values")

base = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)
angle = np.pi / 4
rotated = X @ np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
turned = DecisionTreeClassifier(max_depth=3, random_state=0).fit(rotated, y)
print("root split, original data: feature", base.tree_.feature[0], "at", round(float(base.tree_.threshold[0]), 2))
print("root split, rotated data:  feature", turned.tree_.feature[0], "at", round(float(turned.tree_.threshold[0]), 2))
`, "no limits           leaves  33  train acc 1.000  CV acc 0.893\nmin_samples_leaf=5  leaves  20  train acc 0.957  CV acc 0.900\nregression tree max_depth=2    CV RMSE 0.0472\nregression tree max_depth=3    CV RMSE 0.0366\nregression tree max_depth=None CV RMSE 0.0364\ndepth-2 tree predicts only 4 distinct values\nroot split, original data: feature 1 at 0.45\nroot split, rotated data:  feature 1 at -0.32"),
        { t: "table", head: ["Hyperparameter", "Effect when increased"], rows: [["`max_depth`", "Deeper, more complex tree (less regularisation)"], ["`min_samples_split`, `min_samples_leaf`", "Fewer, larger leaves (more regularisation)"], ["`max_leaf_nodes`", "More leaves allowed (less regularisation)"], ["`max_features`", "More features considered per split"], ["`ccp_alpha`", "More pruning (more regularisation)"]] },
        { t: "p", text: "The unrestricted classifier memorises the training set; a minimum leaf size generalises better. A regression tree predicts a step function: depth 2 gives only four distinct values. Rotating the same data changes the very first question (a different threshold, and so a different tree below it), because trees only make axis-aligned cuts." },
        { t: "analogy", text: "A tree is like a very literal clerk with a rule book: it draws only horizontal and vertical lines, so a tilted border needs a long staircase of rules. And give the clerk slightly different training cases and they may write a completely different rule book." },
        { t: "trap", text: "Trees are sensitive to small variations in the training data and to rotations; their axis-aligned splits struggle with diagonal boundaries (PCA can help by rotating the data first). Random forests average many trees to fix this instability." },
        { t: "trick", text: "**Limit depth or leaf size. Regression tree = average per leaf. Unstable alone, strong in a forest.**" },
        { t: "exam", items: ["How do you regularise a decision tree?", "How does a regression tree make predictions?", "Why are decision trees unstable?", "Why are trees sensitive to rotation?", "How do ensembles fix tree instability?"] },
        { t: "recap", items: ["Unlimited trees overfit", "Regularise with max_depth, min_samples_leaf, max_leaf_nodes, ccp_alpha", "Regression trees predict leaf averages (step functions)", "Axis-aligned splits; sensitive to rotation", "Instability → use ensembles"] },
      ],
      quiz: [
        { q: "Increasing min_samples_leaf…", options: ["Regularises the tree", "Makes it deeper", "Removes features", "Has no effect"], answer: 0, explain: "Larger, fewer leaves." },
        { q: "A regression tree's prediction in a leaf is…", options: ["The average target of the training rows in that leaf", "A straight line", "The median feature", "Random"], answer: 0, explain: "Hence step functions." },
        { q: "Trees struggle with diagonal boundaries because…", options: ["Splits are perpendicular to an axis", "They need scaling", "They use Gini", "They're linear models"], answer: 0, explain: "A staircase approximates the diagonal." },
        { q: "What fixes trees' instability?", options: ["Ensembles like random forests", "Deeper trees", "More features", "Scaling"], answer: 0, explain: "Averaging many trees." },
      ],
    },
  ],
};
