import type { Block, LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** The practice housing dataset used throughout the end-to-end project (shown in each lesson so every example runs on its own). */
const HOUSING: Block = py("housing.py", src`
"""housing.py: 2,000 neighbourhoods, generated with a fixed seed (a stand-in for the classic California housing data)."""
import numpy as np
import pandas as pd

def load_housing():
    rng = np.random.default_rng(42)
    n = 2000
    zone = rng.choice(["inland", "suburb", "city", "near_sea"], n, p=[0.35, 0.30, 0.20, 0.15])
    median_income = rng.lognormal(1.2, 0.45, n).round(2)               # ₹ lakh per year
    housing_age = rng.integers(1, 52, n)
    total_rooms = rng.integers(400, 6000, n)
    total_bedrooms = (total_rooms * rng.uniform(0.15, 0.25, n)).round()
    households = (total_rooms / rng.uniform(4, 7, n)).round().astype(int)
    population = (households * rng.uniform(2, 4.5, n)).round().astype(int)
    premium = pd.Series(zone).map({"inland": 0, "suburb": 20, "city": 60, "near_sea": 45}).to_numpy()
    value = 30 + 22 * median_income + premium - 0.2 * housing_age + rng.normal(0, 18, n)
    df = pd.DataFrame({
        "median_income": median_income, "housing_age": housing_age, "total_rooms": total_rooms,
        "total_bedrooms": total_bedrooms, "population": population, "households": households,
        "zone": zone, "median_house_value": np.clip(value, 20, 300).round(1),   # ₹ lakh, capped at 300
    })
    df.loc[rng.choice(n, 40, replace=False), "total_bedrooms"] = np.nan        # missing values
    return df
`);

const HOUSING_NOTE: Block = { t: "note", kind: "info", title: "Project data", text: "Save this as `housing.py` next to your script. It mimics the classic housing dataset (including capped values and missing bedrooms), so the steps are exactly what you'd do on real data with `pd.read_csv()`." };

/** Hands-On ML, chapters 1–2: the machine-learning landscape, then an end-to-end project. */
export const HO01_LANDSCAPE: LearnModule = {
  id: "ml-landscape",
  title: "The machine learning landscape",
  titleHi: "मशीन लर्निंग का परिदृश्य",
  blurb: "What machine learning is and when to use it, the main types of systems (supervised, unsupervised, semi-supervised, reinforcement; batch vs online; instance-based vs model-based), the main challenges, and how to test and validate models.",
  lessons: [
    {
      id: "what-is-ml",
      title: "What is machine learning? Types of systems",
      oneLine: "Machine learning is programming computers to learn from data instead of following hand-written rules. Systems are classified by how they learn (supervised, unsupervised, semi-supervised, reinforcement), whether they learn all at once or continuously (batch vs online), and how they generalise (by comparing to examples, or by building a model).",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Use ML when…", "Example"], rows: [["Rules would be long and keep changing", "Spam filtering (spammers adapt)"], ["There's no known algorithm", "Recognising speech or faces"], ["The environment keeps changing", "Fraud patterns, prices"], ["You want insights from lots of data", "Which features drive customer churn"]] },
        { t: "table", head: ["Category", "Types", "Examples"], rows: [
          ["Supervision", "Supervised (labels given)", "Spam yes/no, house price"],
          ["", "Unsupervised (no labels)", "Customer segments, anomaly detection, PCA"],
          ["", "Semi-supervised (few labels)", "Photo apps: label one face, it finds the rest"],
          ["", "Reinforcement (rewards)", "Game-playing agents, robots"],
          ["Learning over time", "Batch (offline): train once on all data", "Monthly retrained forecasting model"],
          ["", "Online: learn from a stream", "Stock or click data, huge datasets"],
          ["Generalisation", "Instance-based: compare to known examples", "k-nearest neighbours"],
          ["", "Model-based: fit a model's parameters", "Linear regression, neural networks"],
        ] },
        py("Model-based vs instance-based", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

# average income (₹ lakh per year) and a 0–10 well-being survey score for 10 cities
income = np.array([[3.1], [4.0], [4.6], [5.2], [6.0], [6.8], [7.5], [8.4], [9.1], [10.2]])
wellbeing = np.array([4.8, 5.2, 5.5, 5.6, 6.1, 6.3, 6.6, 6.9, 7.0, 7.3])

model = LinearRegression().fit(income, wellbeing)          # learns a line (2 parameters)
knn = KNeighborsRegressor(n_neighbors=3).fit(income, wellbeing)   # remembers the examples
new_city = [[7.0]]
print(f"model-based (line): {model.predict(new_city)[0]:.2f}  "
      f"[slope {model.coef_[0]:.3f}, intercept {model.intercept_:.3f}]")
print(f"instance-based (3 nearest cities): {knn.predict(new_city)[0]:.2f}")
`, "model-based (line): 6.31  [slope 0.357, intercept 3.812]\ninstance-based (3 nearest cities): 6.33"),
        { t: "analogy", text: "Instance-based learning is a new employee who answers \"what did we do last time something similar happened?\". Model-based learning is an employee who has worked out the general rule (\"each extra lakh of income adds about 0.3 points\") and applies it to any case." },
        { t: "trap", text: "ML isn't the answer to everything: if a clear, stable rule exists (calculate GST at 18%), write the rule. ML adds data requirements, maintenance and unpredictability." },
        { t: "trick", text: "**Labels? → supervised. No labels → unsupervised. Rewards → reinforcement. Remember examples → instance-based; fit parameters → model-based.**" },
        { t: "exam", items: ["Define machine learning.", "Supervised vs unsupervised vs reinforcement learning?", "Batch vs online learning?", "Instance-based vs model-based learning?", "Give four problems where ML shines."] },
        { t: "recap", items: ["ML learns from data instead of fixed rules", "Supervised / unsupervised / semi-supervised / reinforcement", "Batch (offline) vs online (streaming)", "Instance-based (k-NN) vs model-based (linear models)", "Use ML when rules are complex or keep changing"] },
      ],
      quiz: [
        { q: "Grouping customers with no labels is…", options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Online learning only"], answer: 0, explain: "No target is given." },
        { q: "A system that learns from a live stream of data is…", options: ["Online learning", "Batch learning", "Instance-based", "Semi-supervised"], answer: 0, explain: "It updates incrementally." },
        { q: "k-nearest neighbours is…", options: ["Instance-based", "Model-based", "Reinforcement learning", "Unsupervised only"], answer: 0, explain: "It compares to stored examples." },
        { q: "A robot learning by trial and reward is…", options: ["Reinforcement learning", "Supervised", "Clustering", "PCA"], answer: 0, explain: "Rewards and penalties guide it." },
      ],
    },
    {
      id: "challenges-validation",
      title: "Main challenges, testing and validating",
      oneLine: "Machine learning fails because of bad data (too little, unrepresentative, noisy, irrelevant features) or a bad model (overfitting, underfitting). To know how a model will do on new cases, hold out a test set, tune using a validation set or cross-validation, and touch the test set only once.",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Challenge", "Symptom", "Fix"], rows: [
          ["Insufficient data", "Unstable, poor results", "More data; simpler models"],
          ["Non-representative data", "Works in testing, fails in the real world", "Sample the population properly (avoid sampling bias)"],
          ["Poor-quality data", "Errors, outliers, missing values", "Clean: fix, drop or impute"],
          ["Irrelevant features", "Noise, overfitting", "Feature selection and engineering"],
          ["Overfitting", "Great on training, poor on new data", "Simplify, regularise, more data, less noise"],
          ["Underfitting", "Poor even on training data", "More powerful model, better features, less regularisation"],
        ] },
        py("Validation set vs test set", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 120).reshape(-1, 1)
y = 0.5 * x.ravel() ** 2 + x.ravel() + 2 + rng.normal(0, 1, 120)   # a curve + noise

X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=0)
X_tr, X_val, y_tr, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=0)

results = {}
for degree in [1, 2, 10, 25]:
    m = make_pipeline(PolynomialFeatures(degree), StandardScaler(), LinearRegression()).fit(X_tr, y_tr)
    rmse = lambda X, t: mean_squared_error(t, m.predict(X)) ** 0.5
    results[degree] = m
    print(f"degree {degree:>2}: train RMSE {rmse(X_tr, y_tr):.2f}   validation RMSE {rmse(X_val, y_val):.2f}")

best = min(results, key=lambda d: mean_squared_error(y_val, results[d].predict(X_val)))
final = make_pipeline(PolynomialFeatures(best), StandardScaler(), LinearRegression()).fit(X_train, y_train)
print(f"chosen degree {best}; test RMSE (reported once): {mean_squared_error(y_test, final.predict(X_test)) ** 0.5:.2f}")
`, "degree  1: train RMSE 1.80   validation RMSE 1.53\ndegree  2: train RMSE 1.03   validation RMSE 1.09\ndegree 10: train RMSE 0.96   validation RMSE 1.15\ndegree 25: train RMSE 0.93   validation RMSE 1.25\nchosen degree 2; test RMSE (reported once): 0.91"),
        { t: "diagram", text: "all data ──▶ [ train (choose & fit models) | validation (compare) ] [ test (final check, once) ]\n               └─────── or k-fold cross-validation ───────┘" },
        { t: "p", text: "Degree 1 underfits (a straight line can't follow the curve), degree 2 matches the true shape, and very high degrees fit the training noise. The validation set picks the model; the test set then gives an honest estimate. **No free lunch:** no model is best for every problem, so you must try a few reasonable ones." },
        { t: "analogy", text: "The validation set is the mock exams you use to decide how to study; the test set is the board exam. If you peek at the board-exam paper while preparing, your score no longer tells you how good you really are." },
        { t: "trap", text: "Tuning many models on the test set leaks it into your choices, and the reported score becomes over-optimistic. Also, data mismatch (training photos from the web, real photos from a phone camera) needs a separate \"train-dev\" set to diagnose." },
        { t: "trick", text: "**Train to fit, validate to choose, test once to report. Bad data beats clever algorithms every time.**" },
        { t: "exam", items: ["What are the main challenges of machine learning?", "What is sampling bias?", "Overfitting vs underfitting?", "Why do you need a validation set and a test set?", "What is the no free lunch theorem?"] },
        { t: "recap", items: ["Data problems: too little, unrepresentative, noisy, irrelevant", "Model problems: overfitting, underfitting", "Train / validation (or CV) / test", "Use the test set once", "No single model is always best"] },
      ],
      quiz: [
        { q: "High training error AND high validation error suggests…", options: ["Underfitting", "Overfitting", "Perfect fit", "Data leakage"], answer: 0, explain: "The model is too simple." },
        { q: "The validation set is used to…", options: ["Compare models and tune hyperparameters", "Report the final score", "Train the final model only", "Store backups"], answer: 0, explain: "The test set reports." },
        { q: "A survey done only online misses offline users. This is…", options: ["Sampling bias", "Overfitting", "Regularisation", "Online learning"], answer: 0, explain: "The sample isn't representative." },
        { q: "The no free lunch theorem says…", options: ["No model is best for every problem", "Data is free", "Training is free", "Linear models always win"], answer: 0, explain: "Try several reasonable models." },
      ],
    },
  ],
};

export const HO02_PROJECT: LearnModule = {
  id: "end-to-end-project",
  title: "An end-to-end machine learning project",
  titleHi: "एंड-टू-एंड मशीन लर्निंग प्रोजेक्ट",
  blurb: "Work through a full project to predict neighbourhood house prices, like a data scientist at a property company: frame the problem, look at the data, create a stratified test set, explore and engineer features, build preprocessing pipelines, train and compare models, fine-tune, evaluate and launch.",
  lessons: [
    {
      id: "frame-and-look",
      title: "Frame the problem and look at the data",
      oneLine: "Start by asking what the business wants (the model's output feeds a pricing decision), what kind of task it is (supervised, regression, batch), and how to measure success (RMSE or MAE). Then load the data and look: column types, missing values, distributions and capped values.",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Question", "Answer for this project"], rows: [["What's the objective?", "Estimate a neighbourhood's median house value to help decide where to invest"], ["What exists today?", "Experts estimate by hand: slow and often off by 20%"], ["Type of task", "Supervised (we have prices), multiple regression, batch learning (data fits in memory)"], ["Performance measure", "RMSE = √(mean squared error); MAE if there are many outliers"], ["Assumptions to check", "The downstream system needs prices, not categories (cheap/medium/expensive)"]] },
        { t: "formula", items: [["RMSE", "√( (1/m) Σ (prediction − actual)² ): punishes big errors more"], ["MAE", "(1/m) Σ |prediction − actual|: more robust to outliers"]] },
        HOUSING,
        HOUSING_NOTE,
        py("A first look", src`
from housing import load_housing

housing = load_housing()
print(housing.head(3).to_string())
print(housing.shape)
print("missing values:", housing.isna().sum()[housing.isna().sum() > 0].to_dict())
print(housing["zone"].value_counts().to_dict())
print(housing.describe().loc[["mean", "min", "max"]].round(1).to_string())
print("houses at the 300 cap:", int((housing["median_house_value"] == 300).sum()))
`, "   median_income  housing_age  total_rooms  total_bedrooms  population  households      zone  median_house_value\n0           2.09            5         3983           797.0        2465         655      city               120.8\n1           5.00           37         5889          1138.0        2278        1137    suburb               151.0\n2           1.93           23         4917          1006.0        1618         786  near_sea               108.9\n(2000, 8)\nmissing values: {'total_bedrooms': 40}\n{'inland': 703, 'suburb': 590, 'city': 394, 'near_sea': 313}\n      median_income  housing_age  total_rooms  total_bedrooms  population  households  median_house_value\nmean            3.7         26.1       3217.9           641.1      1955.1       601.7               130.7\nmin             0.8          1.0        401.0            61.0       141.0        62.0                20.0\nmax            13.3         51.0       5996.0          1472.0      6097.0      1476.0               300.0\nhouses at the 300 cap: 10"),
        { t: "points", items: ["**Missing values** in total_bedrooms: we'll impute them.", "**zone** is categorical text: we'll one-hot encode it.", "**The target is capped at 300**: the model can never learn prices above it. Ask the business whether that matters; if so, collect proper labels or drop those districts.", "**Skewed features** (income, rooms) and very different scales: we'll scale them and consider log transforms."] },
        { t: "analogy", text: "Framing the problem is a doctor asking about symptoms before ordering tests. Looking at the data is the physical exam: you check what's broken before prescribing a model." },
        { t: "trap", text: "Don't look too closely at the whole dataset before splitting off a test set: your brain will spot patterns in the test data and choose models that happen to fit them (data snooping bias). Set the test set aside first (next lesson)." },
        { t: "trick", text: "**Objective → task type → metric → load → head/info/describe → note the problems.**" },
        { t: "exam", items: ["How do you frame a machine-learning problem?", "RMSE vs MAE: when to use each?", "What is data snooping bias?", "What would you check when first looking at a dataset?"] },
        { t: "recap", items: ["Start from the business objective", "Supervised regression, batch learning", "RMSE (or MAE) as the metric", "Check missing values, categories, scales, caps", "Write down problems to fix later"] },
      ],
      quiz: [
        { q: "Predicting a price is which kind of task?", options: ["Regression", "Classification", "Clustering", "Reinforcement"], answer: 0, explain: "A number is predicted." },
        { q: "Which metric is more robust to outliers?", options: ["MAE", "RMSE", "R² only", "Accuracy"], answer: 0, explain: "RMSE squares big errors." },
        { q: "A target capped at 300 means the model…", options: ["Can't learn prices above 300", "Is more accurate", "Needs no cleaning", "Is a classifier"], answer: 0, explain: "It never sees higher values." },
        { q: "Data snooping bias comes from…", options: ["Looking at the test data while choosing models", "Using too much data", "Scaling features", "Using RMSE"], answer: 0, explain: "Set the test set aside early." },
      ],
    },
    {
      id: "test-set",
      title: "Create a test set: random vs stratified sampling",
      oneLine: "Set aside about 20% of the data before exploring. A purely random split can, by chance, under- or over-represent important groups. Stratified sampling splits each group (stratum) separately, so the test set mirrors the population on the feature that matters most, here income.",
      minutes: 18,
      blocks: [
        HOUSING,
        HOUSING_NOTE,
        py("Random vs stratified split", src`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from housing import load_housing

housing = load_housing()
housing["income_cat"] = pd.cut(housing["median_income"], bins=[0, 2, 3, 4.5, 6, np.inf], labels=[1, 2, 3, 4, 5])

def proportions(df):
    return df["income_cat"].value_counts(normalize=True).sort_index()

overall = proportions(housing)
compare = pd.DataFrame({"overall": overall})
for seed in [1, 7]:
    _, rand_test = train_test_split(housing, test_size=0.2, random_state=seed)
    compare[f"random (seed {seed})"] = proportions(rand_test)
_, strat_test = train_test_split(housing, test_size=0.2, random_state=1, stratify=housing["income_cat"])
compare["stratified"] = proportions(strat_test)
print((compare * 100).round(2))
print("largest error vs overall (percentage points):", (compare.sub(overall, axis=0).abs().max() * 100).round(2).to_dict())
`, "            overall  random (seed 1)  random (seed 7)  stratified\nincome_cat\n1             12.60            10.50            13.00       12.50\n2             27.85            27.50            28.50       27.75\n3             34.55            37.25            33.25       34.50\n4             15.60            16.75            13.75       15.75\n5              9.40             8.00            11.50        9.50\nlargest error vs overall (percentage points): {'overall': 0.0, 'random (seed 1)': 2.7, 'random (seed 7)': 2.1, 'stratified': 0.15}"),
        { t: "p", text: "The stratified test set matches the overall income mix almost exactly, while random splits drift by chance. On a few thousand rows this matters: a test set short of high-income districts would misjudge how well the model prices expensive areas." },
        { t: "table", head: ["Technique", "When"], rows: [["Random split", "Large datasets with many rows per group"], ["Stratified split (`stratify=`)", "Important groups or rare classes"], ["Time-based split", "Time series: test on the most recent period"], ["Hash of a stable ID", "Data that grows: keep the same rows in the test set across refreshes"]] },
        { t: "analogy", text: "Choosing 1,000 people for a national survey: picking purely at random may by chance include too few villagers. Stratified sampling picks the right share from each state and from cities and villages, so the sample mirrors the country." },
        { t: "trap", text: "Remove the helper column (income_cat) after splitting, so it doesn't sneak into the model as an extra feature. And fix the random seed, or the test set changes each run and you'll eventually see all the data." },
        { t: "trick", text: "**Split first, explore second. Stratify on the most important feature.**" },
        { t: "exam", items: ["Why create the test set before exploring?", "What is stratified sampling?", "When is a random split risky?", "How do you keep a stable test set as data grows?"] },
        { t: "recap", items: ["Hold out ~20% before exploring", "Random splits can be unrepresentative by chance", "Stratify on a key feature (binned if numeric)", "Time-based splits for time series", "Fix the seed; drop helper columns"] },
      ],
      quiz: [
        { q: "stratify=income_cat in train_test_split ensures…", options: ["Income groups have the same proportions in train and test", "The test set is larger", "Incomes are scaled", "Rows are sorted"], answer: 0, explain: "Each stratum is split separately." },
        { q: "For time-series data, the test set should be…", options: ["The most recent period", "A random sample", "The first rows", "The training set"], answer: 0, explain: "Predict the future from the past." },
        { q: "Why fix random_state when splitting?", options: ["So the test set stays the same each run", "To make it faster", "To scale data", "It's required"], answer: 0, explain: "Otherwise you eventually see all data." },
        { q: "To stratify on a numeric column, you first…", options: ["Bin it into categories", "Delete it", "Scale it", "Square it"], answer: 0, explain: "e.g. pd.cut into income bands." },
      ],
    },
    {
      id: "explore-prepare",
      title: "Explore, engineer features and build preprocessing pipelines",
      oneLine: "On the training set only: look for correlations with the target, try new feature combinations (rooms per household, bedrooms ratio), then build one pipeline that imputes missing values, adds the engineered features, scales numbers and one-hot encodes categories, ready to plug into any model.",
      minutes: 24,
      blocks: [
        HOUSING,
        HOUSING_NOTE,
        py("Correlations and new features", src`
from sklearn.model_selection import train_test_split
from housing import load_housing

housing = load_housing()
train, _ = train_test_split(housing, test_size=0.2, random_state=1)
explore = train.copy()
explore["rooms_per_household"] = explore["total_rooms"] / explore["households"]
explore["bedrooms_ratio"] = explore["total_bedrooms"] / explore["total_rooms"]
explore["people_per_household"] = explore["population"] / explore["households"]

corr = explore.drop(columns="zone").corr()["median_house_value"].sort_values(ascending=False)
print(corr.round(3).to_string())
print(explore.groupby("zone")["median_house_value"].median().sort_values().to_dict())
`, "median_house_value      1.000\nmedian_income           0.802\nhouseholds             -0.001\nbedrooms_ratio         -0.004\npopulation             -0.012\ntotal_rooms            -0.017\ntotal_bedrooms         -0.023\npeople_per_household   -0.027\nrooms_per_household    -0.042\nhousing_age            -0.046\n{'inland': 100.5, 'suburb': 120.1, 'near_sea': 146.3, 'city': 157.5}"),
        { t: "p", text: "Income is by far the strongest signal, and zone clearly matters (city and near-sea neighbourhoods cost more). The engineered ratios show almost no correlation here, because this practice data doesn't depend on them; in the real California data, bedrooms ratio and rooms per household were genuinely useful. That's the point of exploring: **try** feature ideas, then keep the ones the data supports." },
        py("One preprocessing pipeline for everything", src`
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler
from housing import load_housing

housing = load_housing()
train, _ = train_test_split(housing, test_size=0.2, random_state=1)
X = train.drop(columns="median_house_value")

def ratio(columns):                                         # a custom feature: a / b
    return columns[:, [0]] / columns[:, [1]]

def ratio_pipeline(name):
    return make_pipeline(SimpleImputer(strategy="median"),
                         FunctionTransformer(ratio, feature_names_out=lambda t, f: [name]),
                         StandardScaler())

log_pipeline = make_pipeline(SimpleImputer(strategy="median"),
                             FunctionTransformer(np.log, feature_names_out="one-to-one"), StandardScaler())
preprocessing = ColumnTransformer([
    ("rooms_per_household", ratio_pipeline("rooms_per_household"), ["total_rooms", "households"]),
    ("bedrooms_ratio", ratio_pipeline("bedrooms_ratio"), ["total_bedrooms", "total_rooms"]),
    ("people_per_household", ratio_pipeline("people_per_household"), ["population", "households"]),
    ("log", log_pipeline, ["total_rooms", "total_bedrooms", "population", "households", "median_income"]),
    ("zone", OneHotEncoder(handle_unknown="ignore"), ["zone"]),
], remainder=make_pipeline(SimpleImputer(strategy="median"), StandardScaler()))   # housing_age

prepared = preprocessing.fit_transform(X)
print("shape:", prepared.shape, "| any missing left:", bool(np.isnan(prepared).any()))
print(list(preprocessing.get_feature_names_out()))
`, "shape: (1600, 13) | any missing left: False\n['rooms_per_household__rooms_per_household', 'bedrooms_ratio__bedrooms_ratio', 'people_per_household__people_per_household', 'log__total_rooms', 'log__total_bedrooms', 'log__population', 'log__households', 'log__median_income', 'zone__zone_city', 'zone__zone_inland', 'zone__zone_near_sea', 'zone__zone_suburb', 'remainder__housing_age']"),
        { t: "table", head: ["Step", "Tool", "Why"], rows: [["Missing values", "`SimpleImputer(strategy=\"median\")`", "Robust to skew; learned on training data only"], ["Ratios / combos", "`FunctionTransformer` (or a custom class with fit/transform)", "Engineered features become part of the pipeline"], ["Heavy-tailed features", "log transform", "Makes distributions more symmetric for linear models"], ["Different scales", "`StandardScaler`", "Needed by linear models, SVMs, neural networks"], ["Categories", "`OneHotEncoder(handle_unknown=\"ignore\")`", "Unknown zones don't crash predictions"], ["Different columns, different steps", "`ColumnTransformer` + `remainder=`", "One object to fit, save and reuse"]] },
        { t: "analogy", text: "The pipeline is a recipe card written once: wash (impute), chop (ratios), season (log), portion (scale), label (encode). Every future batch of ingredients goes through exactly the same steps, in the same order, with the same measurements." },
        { t: "trap", text: "Fitting the imputer or scaler on the full dataset (including the test set) leaks information. Fit preprocessing on training data only, which a pipeline does automatically. Correlation only captures straight-line relationships, so also look at scatter plots." },
        { t: "trick", text: "**Explore on train only. Every transformation inside one ColumnTransformer.**" },
        { t: "exam", items: ["Why explore only the training set?", "How do you create new features from existing ones?", "What does a ColumnTransformer do?", "Why log-transform skewed features?", "How do you write a custom transformer?"] },
        { t: "recap", items: ["Correlations and group medians guide features", "Try ratios and combinations; keep the ones the data supports", "Impute, transform, scale, encode inside pipelines", "ColumnTransformer handles mixed column types", "Fit on training data only"] },
      ],
      quiz: [
        { q: "rooms_per_household = total_rooms / households is an example of…", options: ["Feature engineering", "Scaling", "Imputation", "Encoding"], answer: 0, explain: "A new, more meaningful feature." },
        { q: "OneHotEncoder(handle_unknown=\"ignore\") means an unseen zone…", options: ["Gets all-zero columns instead of an error", "Crashes", "Is dropped from training", "Becomes the most common zone"], answer: 0, explain: "Safe in production." },
        { q: "Why log-transform total_rooms?", options: ["It's heavy-tailed; logs make it more symmetric", "To remove missing values", "To encode categories", "Logs are required"], answer: 0, explain: "Helps linear models." },
        { q: "Where should the scaler learn its mean and SD?", options: ["Training data only", "The whole dataset", "The test set", "Anywhere"], answer: 0, explain: "Prevents leakage." },
      ],
    },
    {
      id: "train-tune-evaluate",
      title: "Train, compare, fine-tune, evaluate and launch",
      oneLine: "Put the preprocessing and a model in one pipeline, compare models with cross-validated RMSE (the training RMSE lies), fine-tune the best with a search over hyperparameters, inspect feature importances, then evaluate once on the test set with a confidence interval, save the model and plan monitoring.",
      minutes: 26,
      blocks: [
        HOUSING,
        HOUSING_NOTE,
        py("From models to a launched system", src`
import joblib
import numpy as np
from scipy import stats
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import RandomizedSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor
from housing import load_housing

housing = load_housing()
train, test = train_test_split(housing, test_size=0.2, random_state=1)
X, y = train.drop(columns="median_house_value"), train["median_house_value"]
num = ["median_income", "housing_age", "total_rooms", "total_bedrooms", "population", "households"]
prep = ColumnTransformer([("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), num),
                          ("zone", OneHotEncoder(handle_unknown="ignore"), ["zone"])])

for name, model in [("linear", LinearRegression()), ("tree", DecisionTreeRegressor(random_state=0)),
                    ("forest", RandomForestRegressor(100, random_state=0))]:
    pipe = make_pipeline(prep, model).fit(X, y)
    train_rmse = mean_squared_error(y, pipe.predict(X)) ** 0.5
    cv_rmse = -cross_val_score(pipe, X, y, cv=5, scoring="neg_root_mean_squared_error").mean()
    print(f"{name:<7} train RMSE {train_rmse:6.2f}   CV RMSE {cv_rmse:6.2f}")

search = RandomizedSearchCV(make_pipeline(prep, RandomForestRegressor(random_state=0)),
                            {"randomforestregressor__max_features": [2, 4, 6, 8],
                             "randomforestregressor__min_samples_leaf": [1, 5, 10, 20]},
                            n_iter=8, cv=3, scoring="neg_root_mean_squared_error", random_state=0)
search.fit(X, y)
print("best:", search.best_params_, "CV RMSE", round(-search.best_score_, 2))
best = search.best_estimator_
names = best[0].get_feature_names_out()
importances = sorted(zip(best[-1].feature_importances_, names), reverse=True)[:3]
print("top features:", [(n, round(float(v), 3)) for v, n in importances])

X_test, y_test = test.drop(columns="median_house_value"), test["median_house_value"]
errors = (best.predict(X_test) - y_test) ** 2
rmse = np.sqrt(errors.mean())
low, high = np.sqrt(stats.t.interval(0.95, len(errors) - 1, loc=errors.mean(), scale=stats.sem(errors)))
print(f"test RMSE {rmse:.2f} (95% CI {low:.2f} to {high:.2f}) ₹ lakh")
joblib.dump(best, "housing_model.joblib")
print("saved; reloaded prediction:", round(float(joblib.load("housing_model.joblib").predict(X_test.iloc[:1])[0]), 1))
`, "linear  train RMSE  17.78   CV RMSE  17.90\ntree    train RMSE   0.00   CV RMSE  26.44\nforest  train RMSE   7.22   CV RMSE  19.09\nbest: {'randomforestregressor__min_samples_leaf': 5, 'randomforestregressor__max_features': 8} CV RMSE 18.88\ntop features: [('num__median_income', 0.717), ('zone__zone_inland', 0.109), ('zone__zone_city', 0.05)]\ntest RMSE 18.96 (95% CI 17.63 to 20.21) ₹ lakh\nsaved; reloaded prediction: 117.1"),
        { t: "p", text: "The decision tree's training RMSE of 0 is a red flag: it memorised the data, and its cross-validated RMSE is far worse. The linear model holds up well here because the price really is close to a linear function of income and zone; the tuned forest is competitive. Income and zone dominate the feature importances. The test-set confidence interval shows how precise the final estimate is." },
        { t: "table", head: ["Launch step", "What to do"], rows: [["Package", "Save the whole pipeline (joblib); serve it behind an API or batch job"], ["Monitor", "Track live error when true prices arrive; watch for input drift (new zones, income shifts)"], ["Retrain", "Automate retraining on fresh data; compare new vs old model before switching"], ["Back up", "Keep previous models and datasets to roll back quickly"], ["Human checks", "Have experts review samples of predictions, especially outliers"]] },
        { t: "analogy", text: "Comparing models on training error is judging cricketers by net practice; cross-validation is several practice matches; the test set is the World Cup final, played once. Launching is not the end: like a team's form, a model's performance must be watched every season." },
        { t: "trap", text: "Never report the training score as performance (the tree's 0 RMSE). Don't keep tweaking after seeing the test score, or it stops being an honest estimate. And a model that's great at launch can decay silently as the world changes, so monitor it." },
        { t: "trick", text: "**Compare by CV → tune with search → inspect importances → test once with a CI → save the pipeline → monitor.**" },
        { t: "exam", items: ["Why is training error misleading?", "Grid search vs randomized search?", "How do you evaluate the final model?", "What do you monitor after deployment?", "Why save the whole pipeline, not just the model?"] },
        { t: "recap", items: ["Preprocessing + model in one pipeline", "Compare models with cross-validated RMSE", "RandomizedSearchCV / GridSearchCV to tune", "Test once; report a confidence interval", "Save, monitor, retrain, keep backups"] },
      ],
      quiz: [
        { q: "A tree with training RMSE 0 and CV RMSE 25 is…", options: ["Badly overfitting", "Perfect", "Underfitting", "Ready to launch"], answer: 0, explain: "It memorised the training data." },
        { q: "RandomizedSearchCV is preferred when…", options: ["The hyperparameter space is large", "There's only one setting", "There's no data", "You want to use the test set"], answer: 0, explain: "It samples combinations." },
        { q: "After launch, you should…", options: ["Monitor performance and input drift", "Delete the training data", "Never retrain", "Stop logging"], answer: 0, explain: "Models decay." },
        { q: "Why save the full pipeline?", options: ["So new data gets exactly the same preprocessing", "To save disk space", "It's faster to train", "joblib requires it"], answer: 0, explain: "Prevents training/serving skew." },
      ],
    },
  ],
};
