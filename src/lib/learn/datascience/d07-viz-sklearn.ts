import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science toolkit, part 3: matplotlib and seaborn, then scikit-learn. */
export const DS20_VISUALIZATION: LearnModule = {
  id: "visualization-libraries",
  title: "Charts with matplotlib and seaborn",
  titleHi: "matplotlib और seaborn से चार्ट",
  blurb: "Draw professional charts: the matplotlib figure-and-axes model, line, bar, histogram and scatter plots, subplots and saving; then seaborn for statistical charts (distributions, groups, relationships, correlation heatmaps) and the rules that keep charts honest and readable.",
  lessons: [
    {
      id: "matplotlib",
      title: "matplotlib: figures, axes and the four core charts",
      oneLine: "In matplotlib, a Figure is the whole image and each Axes is one chart inside it. Create them with plt.subplots(), draw with ax.plot / ax.bar / ax.hist / ax.scatter, label everything, and save with fig.savefig(). Pick the chart from the question: trend, comparison, distribution or relationship.",
      minutes: 22,
      blocks: [
        { t: "diagram", text: "Figure (the whole image)\n┌───────────────────────────────────────────┐\n│  Axes 1 (a chart)        Axes 2 (a chart)  │\n│  ┌──────────────┐        ┌──────────────┐  │\n│  │ title         │        │ title         │  │\n│  │  y-axis ▲     │        │               │  │\n│  │         └──▶ x│        │               │  │\n│  └──────────────┘        └──────────────┘  │\n└───────────────────────────────────────────┘\nfig, (ax1, ax2) = plt.subplots(1, 2)" },
        py("Four core charts in one figure", src`
import matplotlib
matplotlib.use("Agg")                          # draw to files (not needed in Jupyter)
import matplotlib.pyplot as plt
import numpy as np

BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"   # fixed category colours, always in this order
rng = np.random.default_rng(0)
days = np.arange(1, 31)
users = 500 + days * 12 + rng.normal(0, 25, 30)
cities, orders = ["Delhi", "Mumbai", "Pune", "Patna"], [410, 380, 340, 120]
delivery_minutes = rng.gamma(4, 7, 500)
hours = rng.uniform(0, 10, 80)
marks = 35 + 5 * hours + rng.normal(0, 6, 80)

fig, axes = plt.subplots(2, 2, figsize=(11, 7))

ax = axes[0, 0]                                 # 1) trend over time → line
ax.plot(days, users, color=BLUE, linewidth=2)
ax.set(title="Daily active users", xlabel="Day of month", ylabel="Users")

ax = axes[0, 1]                                 # 2) compare categories → bar (starts at 0)
ax.bar(cities, orders, color=BLUE)
ax.set(title="Orders by city", ylabel="Orders")
for x, y in zip(cities, orders):
    ax.annotate(str(y), (x, y), ha="center", va="bottom")      # label the bars directly

ax = axes[1, 0]                                 # 3) distribution → histogram
ax.hist(delivery_minutes, bins=25, color=AQUA, edgecolor="white")
ax.axvline(np.median(delivery_minutes), color="black", linestyle="--", linewidth=1)
ax.set(title="Delivery time", xlabel="Minutes", ylabel="Orders")

ax = axes[1, 1]                                 # 4) relationship → scatter
ax.scatter(hours, marks, s=20, color=ORANGE, alpha=0.7)
ax.set(title="Study hours vs marks", xlabel="Hours per week", ylabel="Marks")

for ax in axes.flat:
    ax.grid(alpha=0.3)                          # quiet grid
    ax.spines[["top", "right"]].set_visible(False)
fig.tight_layout()
fig.savefig("core_charts.png", dpi=120)

print("axes in the figure:", len(fig.axes))
print("titles:", [a.get_title() for a in fig.axes])
print("bars drawn:", len(axes[0, 1].patches))
`, "axes in the figure: 4\ntitles: ['Daily active users', 'Orders by city', 'Delivery time', 'Study hours vs marks']\nbars drawn: 4", "In Jupyter or Colab, the chart appears below the cell; elsewhere open core_charts.png. `matplotlib.use(\"Agg\")` is only needed when running scripts without a screen."),
        { t: "table", head: ["Question", "Chart", "matplotlib"], rows: [
          ["How does it change over time?", "Line", "`ax.plot(x, y)`"],
          ["Which category is bigger?", "Bar (sorted, starting at 0)", "`ax.bar(labels, values)` / `ax.barh`"],
          ["How are values spread out?", "Histogram / boxplot", "`ax.hist(x, bins=…)`, `ax.boxplot`"],
          ["Do two numbers move together?", "Scatter", "`ax.scatter(x, y)`"],
          ["Share of a whole (2–3 parts)", "Stacked bar (pie only for very few parts)", "`ax.bar(..., bottom=…)`"],
        ] },
        { t: "h", text: "Rules for readable, honest charts" },
        { t: "points", items: [
          "**Title, axis labels and units** on every chart.",
          "**Bars start at zero**; sort bars by value unless the categories have a natural order.",
          "**Never use two y-axes** on one chart: they invite false comparisons. Use two charts side by side.",
          "**Colour has a job:** one fixed colour per category (same order every time), one hue light → dark for magnitude, two hues around a grey midpoint for +/− values. No rainbows.",
          "**Don't rely on colour alone:** label lines and bars directly or add a legend, so colour-blind readers can follow.",
          "**Keep the grid and axes quiet**; the data should be the darkest thing on the chart.",
        ] },
        { t: "analogy", text: "A Figure is a sheet of paper; each Axes is a box you draw a chart in. The object style (`fig, ax = plt.subplots()` then `ax.plot`) is like naming each box before drawing in it, so you never draw in the wrong one." },
        { t: "trap", text: "Mixing `plt.plot` (draws on \"the current axes\") with several subplots leads to charts landing in the wrong place: use the `ax.` methods. Call `plt.close(fig)` in loops that make many charts, or memory fills up." },
        { t: "trick", text: "**fig, ax = plt.subplots() → ax.plot/bar/hist/scatter → ax.set(title, xlabel, ylabel) → fig.savefig().**" },
        { t: "exam", items: ["Figure vs Axes?", "Which chart for trends, comparisons, distributions, relationships?", "How do you create subplots?", "Why avoid dual y-axes and rainbow colour scales?", "How do you save a chart in high resolution?"] },
        { t: "recap", items: ["fig, axes = plt.subplots(rows, cols)", "line = trend, bar = comparison, hist = distribution, scatter = relationship", "Label everything; bars start at 0", "Colour with a job; no dual axes", "fig.savefig(\"name.png\", dpi=…)"] },
      ],
      quiz: [
        { q: "Best chart for monthly revenue over two years?", options: ["Line chart", "Pie chart", "Scatter plot", "Histogram"], answer: 0, explain: "A trend over time." },
        { q: "fig, axes = plt.subplots(2, 3) creates how many charts?", options: ["6", "5", "2", "3"], answer: 0, explain: "2 rows × 3 columns." },
        { q: "Two measures with different units should be shown…", options: ["In two separate charts", "On one chart with two y-axes", "In a pie chart", "Only in a table"], answer: 0, explain: "Dual axes mislead." },
        { q: "Which shows the distribution of delivery times?", options: ["Histogram", "Line chart", "Bar chart of cities", "Map"], answer: 0, explain: "Counts per range of values." },
      ],
    },
    {
      id: "seaborn",
      title: "seaborn: statistical charts in one line",
      oneLine: "seaborn draws statistical charts straight from a DataFrame: histplot and kdeplot for distributions, boxplot and barplot to compare groups, scatterplot and regplot for relationships, and heatmap for correlation matrices. Map a column to hue to split by category.",
      minutes: 20,
      blocks: [
        py("EDA charts with seaborn", src`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns                                   # pip install seaborn

rng = np.random.default_rng(3)
n = 300
plan = rng.choice(["Basic", "Plus", "Premium"], n, p=[0.5, 0.3, 0.2])
spend = np.where(plan == "Basic", 400, np.where(plan == "Plus", 700, 1100)) + rng.normal(0, 120, n)
df = pd.DataFrame({
    "plan": plan,
    "monthly_spend": spend.round(),
    "visits": (spend / 60 + rng.normal(0, 3, n)).round(),
    "tenure_months": rng.integers(1, 60, n),
})
order = ["Basic", "Plus", "Premium"]
palette = dict(zip(order, ["#2a78d6", "#eb6834", "#1baf7a"]))   # fixed colour per plan

fig, axes = plt.subplots(2, 2, figsize=(11, 8))
sns.histplot(df, x="monthly_spend", hue="plan", hue_order=order, palette=palette,
             element="step", ax=axes[0, 0])
sns.boxplot(df, x="plan", y="monthly_spend", order=order, hue="plan", palette=palette,
            legend=False, ax=axes[0, 1])
sns.scatterplot(df, x="visits", y="monthly_spend", hue="plan", hue_order=order,
                palette=palette, s=18, ax=axes[1, 0])
corr = df[["monthly_spend", "visits", "tenure_months"]].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", center=0, vmin=-1, vmax=1, ax=axes[1, 1])
axes[0, 0].set_title("Spend distribution by plan")
axes[0, 1].set_title("Spend by plan")
axes[1, 0].set_title("Visits vs spend")
axes[1, 1].set_title("Correlation matrix")
fig.tight_layout()
fig.savefig("eda.png", dpi=120)

print(df.groupby("plan")["monthly_spend"].median().reindex(order))
print(corr.round(2))
`, "plan\nBasic       410.0\nPlus        716.0\nPremium    1086.5\nName: monthly_spend, dtype: float64\n               monthly_spend  visits  tenure_months\nmonthly_spend           1.00    0.85           0.01\nvisits                  0.85    1.00           0.05\ntenure_months           0.01    0.05           1.00", "The heatmap uses a diverging scale (two colours around a neutral middle at 0), because correlations can be positive or negative."),
        { t: "table", head: ["Question", "seaborn"], rows: [
          ["Distribution of one column", "`sns.histplot(df, x=…)`, `sns.kdeplot`"],
          ["Compare a number across groups", "`sns.boxplot(df, x=group, y=num)`, `violinplot`, `barplot`"],
          ["Relationship between two numbers", "`sns.scatterplot`, `sns.regplot` (adds a fitted line)"],
          ["All pairs at once", "`sns.pairplot(df, hue=…)`"],
          ["Correlation matrix", "`sns.heatmap(df.corr(), annot=True, center=0)`"],
          ["Counts per category", "`sns.countplot(df, x=…)`"],
        ] },
        { t: "p", text: "Charts are for **finding** things (EDA, quick and many) and for **telling** things (presentations, few and polished). For telling, put the key message in the title (\"Premium customers spend 2.5× more\"), not just \"Spend by plan\"." },
        { t: "analogy", text: "matplotlib is a full set of drawing tools; seaborn is a set of ready-made stencils for the charts statisticians use most. You can still finish a seaborn chart with matplotlib tools (titles, labels), because seaborn draws on matplotlib axes." },
        { t: "trap", text: "Default colour cycling changes colours when a category is missing or reordered, so \"Plus\" can be orange in one chart and green in the next. Fix the order (`order=`, `hue_order=`) and the colours (a dict palette). And a correlation heatmap must be centred at 0 with a diverging scale, or weak negative values look like strong ones." },
        { t: "trick", text: "**sns.<chart>(df, x=, y=, hue=, ax=). Fix hue_order and palette. Diverging colours centred at 0 for correlations.**" },
        { t: "exam", items: ["seaborn vs matplotlib?", "Which seaborn chart compares a numeric variable across groups?", "How do you show a correlation matrix?", "What is hue?", "EDA charts vs presentation charts?"] },
        { t: "recap", items: ["seaborn plots directly from DataFrames", "histplot/kdeplot, boxplot/barplot, scatterplot/regplot, heatmap, pairplot", "hue splits by category; fix hue_order and palette", "Diverging scale centred at 0 for correlations", "Message-style titles for presentations"] },
      ],
      quiz: [
        { q: "sns.boxplot(df, x=\"plan\", y=\"spend\") shows…", options: ["The spread of spend for each plan", "A time trend", "A correlation matrix", "Counts only"], answer: 0, explain: "Median, quartiles, outliers per group." },
        { q: "What does hue=\"plan\" do?", options: ["Colours points/bars by plan", "Sorts by plan", "Filters plans", "Adds a title"], answer: 0, explain: "A third variable by colour." },
        { q: "A correlation heatmap should use…", options: ["A diverging scale centred at 0", "A rainbow scale", "One random colour", "No colour"], answer: 0, explain: "Positive and negative need distinct directions." },
        { q: "seaborn charts are drawn on…", options: ["matplotlib axes", "HTML pages only", "Excel sheets", "Their own engine with no axes"], answer: 0, explain: "Use ax= to place them." },
      ],
    },
  ],
};

export const DS21_SKLEARN: LearnModule = {
  id: "scikit-learn",
  title: "Machine learning with scikit-learn",
  titleHi: "scikit-learn से मशीन लर्निंग",
  blurb: "The standard Python ML library: the fit/predict API, comparing models, preprocessing with pipelines and ColumnTransformer, cross-validation and grid search, classification and regression metrics, and clustering and PCA.",
  lessons: [
    {
      id: "sklearn-api",
      title: "The scikit-learn API: fit, predict, score",
      oneLine: "Every scikit-learn model works the same way: create it, fit(X_train, y_train), then predict(X_test) or score(X_test, y_test). Because the API is identical, you can swap logistic regression for a random forest in one line and compare models fairly.",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Step", "Code", "From-scratch version you built"], rows: [["Split", "`train_test_split(X, y, test_size=0.25, stratify=y)`", "`split_data`"], ["Create", "`model = LogisticRegression()`", "Choose an algorithm"], ["Learn", "`model.fit(X_train, y_train)`", "Gradient descent / counting / tree building"], ["Predict", "`model.predict(X_test)`, `predict_proba`", "Apply the learned rule"], ["Evaluate", "`model.score(X_test, y_test)`, `sklearn.metrics`", "accuracy, precision, recall"]] },
        py("Compare four models on a real dataset", src`
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

data = load_breast_cancer(as_frame=True)          # 569 tumours, 30 measurements, benign/malignant
X, y = data.data, data.target
print(X.shape, "classes:", data.target_names.tolist())

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
models = {
    "logistic regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "k-NN (k=5)": make_pipeline(StandardScaler(), KNeighborsClassifier(5)),
    "decision tree": DecisionTreeClassifier(random_state=0),
    "random forest": RandomForestClassifier(n_estimators=300, random_state=0),
}
for name, model in models.items():
    model.fit(X_train, y_train)                    # same two lines for every model
    print(f"{name:<20} test accuracy {model.score(X_test, y_test):.3f}")

proba = models["logistic regression"].predict_proba(X_test.iloc[:3])[:, 1]
print("P(benign) for 3 test tumours:", proba.round(3).tolist())
`, "(569, 30) classes: ['malignant', 'benign']\nlogistic regression  test accuracy 0.958\nk-NN (k=5)           test accuracy 0.951\ndecision tree        test accuracy 0.902\nrandom forest        test accuracy 0.944\nP(benign) for 3 test tumours: [0.996, 0.0, 0.0]"),
        { t: "p", text: "The single decision tree is clearly the weakest; the scaled linear model, k-NN and the forest all do very well. The same five lines (split, create, fit, predict, score) work for every model in the library." },
        { t: "analogy", text: "scikit-learn is a set of kitchen appliances that all have the same two buttons: **fit** (learn the recipe from examples) and **predict** (cook for new guests). Once you can use one, you can use them all." },
        { t: "trap", text: "Scaling must be **learned on the training data only**. Putting StandardScaler inside a pipeline guarantees that: fit learns the scaling from X_train, and predict reuses it on X_test. Scaling the whole dataset before splitting leaks test information." },
        { t: "trick", text: "**split → model = Algo() → fit(train) → predict/score(test). Scale inside a pipeline.**" },
        { t: "exam", items: ["Describe the scikit-learn estimator API.", "What does stratify=y do in train_test_split?", "predict vs predict_proba?", "Why put the scaler inside a pipeline?", "How do you compare several models fairly?"] },
        { t: "recap", items: ["fit / predict / predict_proba / score for every model", "train_test_split with stratify for classification", "make_pipeline(StandardScaler(), Model())", "Swap models in one line to compare", "Evaluate on the test set only"] },
      ],
      quiz: [
        { q: "Which method trains a scikit-learn model?", options: ["fit", "predict", "score", "transform"], answer: 0, explain: "fit(X_train, y_train)." },
        { q: "predict_proba returns…", options: ["Probabilities for each class", "Class labels", "Accuracy", "Coefficients"], answer: 0, explain: "Column 1 = P(class 1)." },
        { q: "stratify=y keeps…", options: ["The same class proportions in train and test", "The same size", "Sorted rows", "Only one class"], answer: 0, explain: "Important for imbalanced data." },
        { q: "Why scale inside a pipeline?", options: ["So scaling is learned from training data only", "It's faster", "It's required for trees", "To add features"], answer: 0, explain: "Prevents leakage." },
      ],
    },
    {
      id: "pipelines",
      title: "Preprocessing with pipelines and ColumnTransformer",
      oneLine: "Real tables mix numbers, categories and missing values. A ColumnTransformer applies the right steps to each column type (impute + scale numbers; impute + one-hot encode categories), and a Pipeline chains it with the model, so one fit() does everything correctly and the same steps run automatically at prediction time.",
      minutes: 22,
      blocks: [
        py("A full preprocessing pipeline", src`
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(5)
n = 800
df = pd.DataFrame({
    "age": rng.integers(18, 65, n).astype(float),
    "income": rng.normal(45, 15, n).round(1),
    "city": rng.choice(["Patna", "Pune", "Delhi", "Mumbai"], n),
    "device": rng.choice(["android", "ios", "web"], n, p=[0.6, 0.25, 0.15]),
})
logit = -0.5 + 0.03 * (df["income"] - 45) - 0.02 * (df["age"] - 40) + (df["device"] == "ios") * 0.8
df["bought"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
df.loc[rng.choice(n, 60, replace=False), "income"] = np.nan        # some missing values
df.loc[rng.choice(n, 30, replace=False), "city"] = np.nan

numeric, categorical = ["age", "income"], ["city", "device"]
prep = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
    ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                      ("onehot", OneHotEncoder(handle_unknown="ignore"))]), categorical),
])
model = Pipeline([("prep", prep), ("clf", LogisticRegression())])

X, y = df.drop(columns="bought"), df["bought"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
print("5-fold CV accuracy:", cross_val_score(model, X_train, y_train, cv=5).mean().round(3))
model.fit(X_train, y_train)
print("test accuracy:", round(model.score(X_test, y_test), 3))
print("features after preprocessing:", list(model.named_steps["prep"].get_feature_names_out()))

new = pd.DataFrame({"age": [25, 58], "income": [np.nan, 70], "city": ["Chennai", "Pune"], "device": ["ios", "web"]})
print("P(buy) for new users:", model.predict_proba(new)[:, 1].round(2).tolist())   # unseen city + missing income: handled
`, "5-fold CV accuracy: 0.59\ntest accuracy: 0.685\nfeatures after preprocessing: ['num__age', 'num__income', 'cat__city_Delhi', 'cat__city_Mumbai', 'cat__city_Patna', 'cat__city_Pune', 'cat__device_android', 'cat__device_ios', 'cat__device_web']\nP(buy) for new users: [0.64, 0.6]"),
        { t: "table", head: ["Step", "Tool", "Why"], rows: [["Missing numbers", "`SimpleImputer(strategy=\"median\")`", "Robust to outliers"], ["Missing categories", "`SimpleImputer(strategy=\"most_frequent\")`", "Or a constant like \"missing\""], ["Scale numbers", "`StandardScaler()`", "Needed by linear models, k-NN, SVMs, neural nets"], ["Encode categories", "`OneHotEncoder(handle_unknown=\"ignore\")`", "Unseen categories (Chennai) don't crash prediction"], ["Different steps per column", "`ColumnTransformer`", "Numbers and categories treated correctly"], ["Everything together", "`Pipeline([...])`", "One fit, no leakage, easy to save and deploy"]] },
        { t: "analogy", text: "A pipeline is a factory line: raw material (a messy row) goes in one end, each station does its job (fill gaps, scale, encode), and a prediction comes out the other end. New orders automatically pass through the same stations in the same order." },
        { t: "trap", text: "Doing imputation, scaling or encoding with pandas on the whole dataset **before** splitting leaks information from the test set and gives over-optimistic scores. Put every learned preprocessing step inside the pipeline and cross-validate the whole pipeline." },
        { t: "trick", text: "**ColumnTransformer(numeric steps, categorical steps) + model = one Pipeline. Fit it once.**" },
        { t: "exam", items: ["What is a scikit-learn Pipeline and why use it?", "What does ColumnTransformer do?", "How do you handle unseen categories at prediction time?", "Where should imputation happen to avoid leakage?", "One-hot vs ordinal encoding?"] },
        { t: "recap", items: ["Impute → scale numbers; impute → one-hot categories", "ColumnTransformer routes columns to the right steps", "Pipeline chains preprocessing and the model", "handle_unknown=\"ignore\" for unseen categories", "Cross-validate the whole pipeline"] },
      ],
      quiz: [
        { q: "OneHotEncoder turns \"city\" with 4 values into…", options: ["Up to 4 0/1 columns", "One number column", "A text column", "Nothing"], answer: 0, explain: "One column per category." },
        { q: "handle_unknown=\"ignore\" means an unseen category…", options: ["Gets all-zero columns instead of an error", "Crashes", "Is dropped from the dataset", "Becomes the most common city"], answer: 0, explain: "Safe for production." },
        { q: "Why cross-validate the whole pipeline?", options: ["So preprocessing is learned inside each fold", "It's faster", "Pipelines can't be scored otherwise", "To skip the test set"], answer: 0, explain: "Prevents leakage." },
        { q: "Median imputation is preferred over mean when…", options: ["The data has outliers or skew", "Always", "Never", "Data is categorical"], answer: 0, explain: "The median is robust." },
      ],
    },
    {
      id: "tuning-metrics",
      title: "Cross-validation, grid search and metrics",
      oneLine: "Choose settings (hyperparameters) with GridSearchCV, which tries every combination with cross-validation. Then evaluate once on the test set: classification_report and confusion_matrix for classifiers, MAE, RMSE and R² for regressors.",
      minutes: 22,
      blocks: [
        py("Tuning a random forest and reading the report", src`
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

grid = GridSearchCV(
    RandomForestClassifier(random_state=0),
    param_grid={"n_estimators": [100, 300], "max_depth": [3, None], "min_samples_leaf": [1, 5]},
    cv=5, scoring="roc_auc", n_jobs=1,
)
grid.fit(X_train, y_train)                         # 8 combinations × 5 folds = 40 fits
print("best settings:", grid.best_params_)
print("best CV AUC:", round(grid.best_score_, 4))

best = grid.best_estimator_                        # already refit on all training data
pred = best.predict(X_test)
print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred, target_names=["malignant", "benign"], digits=3))
print("test AUC:", round(roc_auc_score(y_test, best.predict_proba(X_test)[:, 1]), 4))
`, "best settings: {'max_depth': None, 'min_samples_leaf': 1, 'n_estimators': 100}\nbest CV AUC: 0.9954\n[[49  4]\n [ 4 86]]\n              precision    recall  f1-score   support\n\n   malignant      0.925     0.925     0.925        53\n      benign      0.956     0.956     0.956        90\n\n    accuracy                          0.944       143\n   macro avg      0.940     0.940     0.940       143\nweighted avg      0.944     0.944     0.944       143\n\ntest AUC: 0.9771"),
        { t: "p", text: "Read the confusion matrix as rows = actual, columns = predicted. For cancer screening the most important number is the **recall of malignant**: how many real cancers were caught. The report also gives precision and F1 per class, and the overall accuracy." },
        py("Regression metrics", src`
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split

X, y = load_diabetes(return_X_y=True)             # disease progression after one year
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
print("baseline (always predict the mean) MAE:", round(mean_absolute_error(y_test, np.full(len(y_test), y_train.mean())), 1))

for name, model in {"ridge": Ridge(alpha=1.0), "random forest": RandomForestRegressor(300, min_samples_leaf=5, random_state=0)}.items():
    cv_r2 = cross_val_score(model, X_train, y_train, cv=5, scoring="r2").mean()
    pred = model.fit(X_train, y_train).predict(X_test)
    print(f"{name:<14} CV R² {cv_r2:.3f} | test MAE {mean_absolute_error(y_test, pred):.1f} "
          f"RMSE {mean_squared_error(y_test, pred) ** 0.5:.1f} R² {r2_score(y_test, pred):.3f}")
`, "baseline (always predict the mean) MAE: 58.3\nridge          CV R² 0.426 | test MAE 44.9 RMSE 56.5 R² 0.357\nrandom forest  CV R² 0.491 | test MAE 47.2 RMSE 60.2 R² 0.270"),
        { t: "p", text: "Both models clearly beat the baseline (MAE 58.3). On this small, noisy medical dataset the simple **ridge** model actually beats the random forest on the test set: complex models need more data to pay off. Always try a simple model first." },
        { t: "table", head: ["Metric", "Task", "Meaning"], rows: [["Accuracy", "Classification", "Share correct (misleading with rare classes)"], ["Precision / recall / F1", "Classification", "Right among flagged / caught among actual / balance"], ["ROC AUC", "Classification", "Ranking quality over all thresholds"], ["MAE", "Regression", "Average absolute error, in the target's units"], ["RMSE", "Regression", "Like MAE but punishes big errors more"], ["R²", "Regression", "Share of variance explained (1 = perfect, 0 = mean baseline)"]] },
        { t: "analogy", text: "Grid search is trying every combination of oven temperature and baking time on small test batches (cross-validation folds), then baking the real cake with the best combination. The test set is the guests' verdict: you only get it once." },
        { t: "trap", text: "Grids grow fast: 5 settings × 5 × 5 × 5-fold CV = 625 fits. Use `RandomizedSearchCV` for big search spaces. Always compare with a simple baseline (predicting the mean, or the majority class): a model that can't beat it isn't useful." },
        { t: "trick", text: "**Tune with CV on training data → refit best → evaluate once on test → compare with a baseline.**" },
        { t: "exam", items: ["What is GridSearchCV? RandomizedSearchCV?", "What are hyperparameters vs parameters?", "How do you read a classification report?", "MAE vs RMSE vs R²?", "Why compare with a baseline model?"] },
        { t: "recap", items: ["GridSearchCV tries settings with cross-validation", "best_estimator_ is refit on all training data", "confusion_matrix + classification_report for classifiers", "MAE, RMSE, R² for regressors", "Beat a simple baseline before celebrating"] },
      ],
      quiz: [
        { q: "In confusion_matrix(y_true, y_pred), rows are…", options: ["Actual classes", "Predicted classes", "Features", "Folds"], answer: 0, explain: "Columns are predictions." },
        { q: "A grid of 3 × 4 settings with 5-fold CV runs how many fits (before the refit)?", options: ["60", "12", "17", "5"], answer: 0, explain: "12 combinations × 5 folds." },
        { q: "R² = 0 for a regressor means…", options: ["No better than predicting the mean", "Perfect", "Negative errors", "Overfitting"], answer: 0, explain: "R² compares with the mean baseline." },
        { q: "Hyperparameters are…", options: ["Settings chosen before training, like max_depth", "Weights learned from data", "The test labels", "Features"], answer: 0, explain: "Parameters are learned during fit." },
      ],
    },
    {
      id: "sklearn-unsupervised",
      title: "Clustering and PCA with scikit-learn",
      oneLine: "KMeans, AgglomerativeClustering and PCA follow the same API: fit on (scaled) features, then read labels_, cluster_centers_ or explained_variance_ratio_. Use the silhouette score to choose k, and compare clusters with known labels when you have them.",
      minutes: 18,
      blocks: [
        py("Clustering flowers without labels", src`
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

iris = load_iris(as_frame=True)                         # 150 flowers, 4 measurements, 3 species
X = StandardScaler().fit_transform(iris.data)

for k in range(2, 6):
    labels = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)
    print(f"k={k}: silhouette {silhouette_score(X, labels):.3f}")

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
species = iris.target_names[iris.target]
print(pd.crosstab(km.labels_, species, rownames=["cluster"], colnames=["species"]))

pca = PCA(n_components=2).fit(X)
print("variance kept by 2 components:", pca.explained_variance_ratio_.round(3).tolist(),
      "total", round(float(pca.explained_variance_ratio_.sum()), 3))
`, "k=2: silhouette 0.582\nk=3: silhouette 0.460\nk=4: silhouette 0.387\nk=5: silhouette 0.346\nspecies  setosa  versicolor  virginica\ncluster\n0             0          39         14\n1            50           0          0\n2             0          11         36\nvariance kept by 2 components: [0.73, 0.229] total 0.958"),
        { t: "p", text: "The silhouette score is highest for k = 2, because two of the species (versicolor and virginica) overlap heavily, while setosa is completely separate. With k = 3, the crosstab shows setosa found perfectly and the other two partly mixed. Unsupervised scores and real categories don't always agree; that's normal, and why business sense matters when choosing k." },
        { t: "analogy", text: "Clustering flowers by measurements alone is like sorting mangoes by size and colour without knowing the variety names: one variety stands out clearly, two similar ones get partly mixed up." },
        { t: "trap", text: "Cluster numbers are arbitrary labels (cluster 0 isn't \"the first species\"). Always scale features before KMeans and PCA, and fit PCA only on training data if you'll use it inside a supervised pipeline." },
        { t: "trick", text: "**Scale → KMeans(n_init=10, random_state) → silhouette for k → crosstab or profile the clusters → PCA to visualise.**" },
        { t: "exam", items: ["How do you choose k with scikit-learn?", "What does the silhouette score measure?", "How do you evaluate clusters when true labels exist?", "What does PCA's explained_variance_ratio_ tell you?"] },
        { t: "recap", items: ["KMeans(...).fit_predict(X_scaled)", "silhouette_score to compare k", "crosstab clusters vs known labels", "PCA(n_components).fit(X); explained_variance_ratio_", "Clusters are hypotheses: check they make sense"] },
      ],
      quiz: [
        { q: "Which attribute holds each point's cluster after KMeans.fit?", options: ["labels_", "coef_", "classes_", "support_"], answer: 0, explain: "cluster_centers_ holds the centres." },
        { q: "A higher silhouette score means…", options: ["Better-separated clusters", "More clusters", "Lower accuracy", "More features"], answer: 0, explain: "Range −1 to 1." },
        { q: "PCA(n_components=2).fit(X).explained_variance_ratio_ = [0.73, 0.23]. Total kept?", options: ["96%", "73%", "23%", "50%"], answer: 0, explain: "0.73 + 0.23." },
        { q: "Why might the best silhouette k differ from the number of real species?", options: ["Some groups overlap in the measured features", "KMeans is broken", "Silhouette counts species", "It never differs"], answer: 0, explain: "Similar groups merge." },
      ],
    },
  ],
};
