import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Statistics modules 9–10: unsupervised learning, then an end-to-end project, interview questions and a cheat sheet. */
export const ST09_UNSUPERVISED: LearnModule = {
  id: "unsupervised",
  title: "Unsupervised learning",
  titleHi: "अनसुपरवाइज़्ड लर्निंग",
  blurb: "Find structure without a target: reduce many columns to a few with PCA, group customers with k-means and hierarchical clustering, and handle scaling, mixed data types and model-based clustering.",
  lessons: [
    {
      id: "pca",
      title: "Principal component analysis (PCA)",
      oneLine: "PCA turns many correlated columns into a few new ones (principal components) that keep most of the information. PC1 is the direction along which the data varies most, PC2 the next (at right angles), and so on. It's used to simplify, visualise and de-noise data.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "diagram", text: "  physics\n     │          ●  ●\n     │       ●  ●●  ●     ← points lie along a diagonal\n     │    ●  ●●  ●          (good at maths ⇒ good at physics)\n     │  ●  ●\n     └────────────── maths\n\nPC1 = the long diagonal direction (\"overall science ability\")\nPC2 = the short direction across it (\"maths vs physics difference\")\nKeep PC1 → one column instead of two, with little lost" },
        py("Five subjects → two abilities", src`
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(5)
n = 200
science = rng.normal(0, 1, n)                 # hidden ability 1
language = rng.normal(0, 1, n)                # hidden ability 2
marks = pd.DataFrame({
    "maths":     60 + 12 * science + rng.normal(0, 5, n),
    "physics":   58 + 10 * science + rng.normal(0, 6, n),
    "chemistry": 62 + 9 * science + rng.normal(0, 6, n),
    "english":   65 + 11 * language + rng.normal(0, 5, n),
    "hindi":     70 + 10 * language + rng.normal(0, 5, n),
})

Z = StandardScaler().fit_transform(marks)     # PCA needs columns on the same scale
pca = PCA().fit(Z)
print("Share of variance per component:", pca.explained_variance_ratio_.round(3).tolist())
print("First two together:", round(float(pca.explained_variance_ratio_[:2].sum()), 3))
loadings = pd.DataFrame(pca.components_[:2].T, index=marks.columns, columns=["PC1", "PC2"])
print(loadings.round(2))
`, "Share of variance per component: [0.504, 0.362, 0.057, 0.043, 0.034]\nFirst two together: 0.866\n            PC1   PC2\nmaths      0.58 -0.07\nphysics    0.57 -0.10\nchemistry  0.56 -0.11\nenglish    0.11  0.70\nhindi      0.12  0.70"),
        { t: "p", text: "Two components keep most of the information in five columns. The **loadings** show what each component means: one is built from maths, physics and chemistry (science ability), the other from English and Hindi (language ability). The signs (+/−) of a component are arbitrary; what matters is which columns move together." },
        { t: "table", head: ["Term", "Meaning"], rows: [["Principal component", "A new column = weighted sum of the original (standardised) columns"], ["Loadings", "The weights: which original columns build each component"], ["Explained variance ratio", "Share of the total variation each component captures"], ["Scree plot", "Explained variance by component; keep components before the curve flattens (the \"elbow\")"]] },
        { t: "analogy", text: "PCA is like photographing a 3-D object: you choose the camera angle that shows the most detail in a 2-D picture. You lose a little depth, but you can see almost everything that matters." },
        { t: "trap", text: "**Always standardise before PCA**, or columns measured in big units (income in rupees) dominate the components. Components are hard to explain to non-technical people, and PCA only finds **linear** combinations. It's unsupervised: it keeps variance, not necessarily what predicts your target." },
        { t: "trick", text: "**Scale → PCA → keep components up to ~80–90% explained variance → read the loadings.**" },
        { t: "exam", items: ["What is PCA? Why use it?", "What is explained variance?", "Why scale data before PCA?", "What are loadings?", "How do you choose the number of components?", "PCA vs feature selection?"] },
        { t: "recap", items: ["PCA makes a few uncorrelated components from many correlated columns", "PC1 captures the most variance, PC2 the next…", "Standardise first", "Loadings tell you what each component means", "Use for visualisation, compression and removing noise"] },
      ],
      quiz: [
        { q: "PC1 is the direction of…", options: ["Maximum variance", "Minimum variance", "The target", "The mean"], answer: 0, explain: "Each next PC captures the most remaining variance." },
        { q: "Why standardise before PCA?", options: ["So large-unit columns don't dominate", "To remove outliers", "To make it supervised", "It's optional"], answer: 0, explain: "PCA is driven by variance." },
        { q: "Explained variance ratios 0.60, 0.25, 0.10, 0.05. Keeping 2 components keeps…", options: ["85%", "60%", "25%", "95%"], answer: 0, explain: "0.60 + 0.25." },
        { q: "PCA is…", options: ["Unsupervised", "Supervised", "A classifier", "A test of significance"], answer: 0, explain: "It ignores any target." },
      ],
    },
    {
      id: "k-means",
      title: "K-means clustering",
      oneLine: "K-means splits data into k groups: start with k centre points, assign every point to its nearest centre, move each centre to the mean of its points, and repeat until nothing changes. Use the elbow and silhouette scores to choose k, then describe each cluster.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: K-means by hand (1-D, k = 2)" },
        { t: "p", text: "Points: 1, 2, 3, 10, 11, 12. Start with centres at 1 and 2 (a poor start, on purpose)." },
        { t: "table", head: ["Round", "Centres", "Assignment", "New centres (means)"], rows: [["1", "1, 2", "{1} and {2, 3, 10, 11, 12}", "1 and 7.6"], ["2", "1, 7.6", "{1, 2, 3} and {10, 11, 12}", "2 and 11"], ["3", "2, 11", "same as before → **stop**", "2 and 11"]] },
        py("Customer segments", src`
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
segments = [(20, 5), (60, 25), (120, 10)]        # (spend ₹ thousand/year, visits/year)
data = np.vstack([np.column_stack([rng.normal(s, 6, 100), rng.normal(v, 3, 100)])
                  for s, v in segments])
customers = pd.DataFrame(data, columns=["spend", "visits"])
X = StandardScaler().fit_transform(customers)

for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print(f"k={k}: inertia {km.inertia_:7.1f}   silhouette {silhouette_score(X, km.labels_):.3f}")

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print(customers.groupby(km.labels_).agg(["mean", "count"]).round(1))
`, "k=2: inertia   282.6   silhouette 0.578\nk=3: inertia    36.2   silhouette 0.809\nk=4: inertia    29.5   silhouette 0.681\nk=5: inertia    23.4   silhouette 0.549\nk=6: inertia    17.3   silhouette 0.431\n   spend       visits\n    mean count   mean count\n0   59.2   100   24.9   100\n1  120.1   100   10.0   100\n2   20.5   100    4.8   100"),
        { t: "p", text: "**Inertia** (total squared distance to the centres) always falls as k grows, so look for the **elbow** where it stops dropping sharply. **Silhouette** (−1 to 1) measures how well each point fits its own cluster versus the next one; the highest is best. Both point to k = 3, the segments built into the data: low spenders, frequent mid spenders, and high spenders who visit less." },
        { t: "analogy", text: "Placing 3 new delivery hubs in a city: put them anywhere, assign each house to its nearest hub, move each hub to the centre of its houses, reassign, and repeat. Soon the hubs settle in the middle of natural neighbourhoods." },
        { t: "trap", text: "K-means needs **scaled** features, a chosen k, and works best for round, similar-sized clusters. Results depend on the starting centres, so run it several times (`n_init`) with a fixed `random_state`. Cluster numbers (0, 1, 2) are arbitrary labels; give each cluster a business name after looking at its averages." },
        { t: "trick", text: "**Scale → try several k → elbow + silhouette → profile each cluster with groupby.**" },
        { t: "exam", items: ["Explain the k-means algorithm.", "How do you choose k? (Elbow, silhouette, business sense.)", "Limitations of k-means?", "What is inertia?", "Clustering vs classification? (No labels vs known labels.)", "Business uses of clustering? (Customer segments, store groups, anomaly detection.)"] },
        { t: "recap", items: ["Assign to the nearest centre, move centres to means, repeat", "Scale features first", "Choose k with the elbow and silhouette", "n_init and random_state for stable results", "Describe clusters with groupby means and counts"] },
      ],
      quiz: [
        { q: "In k-means, each centre moves to…", options: ["The mean of its assigned points", "The farthest point", "A random point each time", "The origin"], answer: 0, explain: "Hence the name k-means." },
        { q: "As k increases, inertia…", options: ["Decreases", "Increases", "Stays the same", "Becomes negative"], answer: 0, explain: "So use the elbow, not the minimum." },
        { q: "A silhouette score close to 1 means…", options: ["Points fit their clusters well", "Clusters overlap", "k is too small", "The data wasn't scaled"], answer: 0, explain: "Close to 0 or negative is poor." },
        { q: "Clustering is…", options: ["Unsupervised: there are no labels", "Supervised", "A significance test", "A type of regression"], answer: 0, explain: "It finds groups by itself." },
      ],
    },
    {
      id: "hierarchical",
      title: "Hierarchical clustering",
      oneLine: "Hierarchical clustering starts with every point as its own cluster and repeatedly merges the two closest clusters, building a tree of merges (a dendrogram). Cut the tree at any height to get as many clusters as you need; no need to choose k in advance.",
      minutes: 16,
      blocks: [
        py("Merging six shops step by step", src`
import numpy as np
from scipy.cluster.hierarchy import fcluster, linkage

names = ["A", "B", "C", "D", "E", "F"]
points = np.array([[1, 1], [1.5, 1], [5, 5], [5.5, 5.2], [9, 1], [9.2, 1.5]])   # shop locations (km)

Z = linkage(points, method="average")            # average distance between clusters
clusters = {i: names[i] for i in range(len(names))}
for step, (a, b, dist, size) in enumerate(Z, start=1):
    merged = clusters.pop(int(a)) + clusters.pop(int(b))
    clusters[len(names) + step - 1] = merged
    print(f"step {step}: merge {merged:<6} at distance {dist:.2f}")

print("Cut into 3 groups:", fcluster(Z, t=3, criterion="maxclust").tolist())
`, "step 1: merge AB     at distance 0.50\nstep 2: merge EF     at distance 0.54\nstep 3: merge CD     at distance 0.54\nstep 4: merge EFCD   at distance 5.46\nstep 5: merge ABEFCD at distance 6.79\nCut into 3 groups: [1, 1, 3, 3, 2, 2]"),
        { t: "diagram", text: "distance\n 6.79 ┤  ┌───────────┴───────────┐          ← last merge: AB joins the rest\n      │  │                       │\n 5.46 ┤  │                 ┌─────┴─────┐    ← EF and CD merge\n      │  │                 │           │\n  3   ┤ ─┼─────────────────┼───────────┼──  ← cut here → 3 groups: {A,B} {E,F} {C,D}\n      │  │                 │           │\n ~0.5 ┤ ┌┴┐               ┌┴┐         ┌┴┐   ← nearby shops pair up first\n      └─A─B───────────────E─F─────────C─D──\n                    (the dendrogram for this example)" },
        { t: "table", head: ["Linkage", "Distance between two clusters", "Tends to make"], rows: [["Single", "Closest pair of points", "Long chains"], ["Complete", "Farthest pair of points", "Compact clusters"], ["Average", "Average over all pairs", "A balance"], ["Ward", "Increase in within-cluster variance", "Similar-sized, round clusters (popular default)"]] },
        { t: "analogy", text: "Like a family tree built backwards: first siblings join into families, families join into extended families, and those into whole communities. Cutting the tree at a level gives you families, clans or communities, whichever detail you need." },
        { t: "trap", text: "Hierarchical clustering compares every pair of points, so it becomes slow beyond a few tens of thousands of rows (use k-means there). Merges are never undone, so an early bad merge stays. And, as always, scale the features first." },
        { t: "trick", text: "**Merge the closest pair, repeat, read the dendrogram, cut where the gaps are big.**" },
        { t: "exam", items: ["How does agglomerative hierarchical clustering work?", "What is a dendrogram? How do you pick the number of clusters from it?", "Single vs complete vs average vs Ward linkage?", "Hierarchical clustering vs k-means?"] },
        { t: "recap", items: ["Start with singletons; merge the closest clusters repeatedly", "The dendrogram records every merge and its distance", "Cut the tree to get any number of clusters", "Linkage decides how cluster distance is measured", "Great for small data and exploring structure"] },
      ],
      quiz: [
        { q: "Agglomerative clustering starts with…", options: ["Every point as its own cluster", "One cluster with all points", "k random centres", "A trained model"], answer: 0, explain: "Then it merges." },
        { q: "A dendrogram shows…", options: ["The order and distance of merges", "Explained variance", "A confusion matrix", "Residuals"], answer: 0, explain: "Cut it to get clusters." },
        { q: "Ward linkage merges the pair that…", options: ["Increases within-cluster variance the least", "Is farthest apart", "Has the most points", "Is chosen at random"], answer: 0, explain: "Gives compact, similar-sized clusters." },
        { q: "For millions of rows, prefer…", options: ["K-means", "Hierarchical clustering", "A dendrogram by hand", "Nothing works"], answer: 0, explain: "Hierarchical compares all pairs." },
      ],
    },
    {
      id: "scaling-mixed-gmm",
      title: "Scaling, mixed data types and model-based clustering",
      oneLine: "Distances only make sense when features are on comparable scales, so standardise them. For tables mixing numbers and categories, Gower distance compares each column fairly. Gaussian mixture models are a softer clustering method that gives probabilities and can choose k with BIC.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: What happens without scaling" },
        py("Clusters driven by the biggest number", src`
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(2)
people = pd.DataFrame({
    "income": np.concatenate([rng.normal(30000, 4000, 50), rng.normal(32000, 4000, 50)]),  # ₹ per month
    "age": np.concatenate([rng.normal(25, 3, 50), rng.normal(55, 3, 50)]),                # two real groups
})
truth = np.repeat([0, 1], 50)

for name, X in [("unscaled", people), ("scaled", StandardScaler().fit_transform(people))]:
    labels = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)
    agree = max(np.mean(labels == truth), np.mean(labels != truth))    # labels may be swapped
    print(f"{name:<9} matches the real groups for {agree:.0%} of people")
`, "unscaled  matches the real groups for 55% of people\nscaled    matches the real groups for 100% of people"),
        { t: "p", text: "The real groups differ by **age** (25 vs 55). Unscaled, income differences of thousands of rupees swamp age differences of tens of years, so k-means splits by income noise. After standardising, it finds the real groups." },
        { t: "h", text: "Step 2: Gower distance for mixed data" },
        { t: "p", text: "How far apart are two customers described by age (number), city (category) and premium member (yes/no)? **Gower distance** scores each column from 0 to 1 and averages: numbers by |difference| / range, categories by 0 (same) or 1 (different)." },
        py("Gower distance by hand", src`
import pandas as pd

df = pd.DataFrame({"age": [25, 40, 60], "city": ["Pune", "Pune", "Delhi"], "premium": [True, False, True]})
age_range = df["age"].max() - df["age"].min()

def gower(i, j):
    parts = [abs(df.loc[i, "age"] - df.loc[j, "age"]) / age_range,     # numeric: scaled difference
             float(df.loc[i, "city"] != df.loc[j, "city"]),            # categorical: 0 or 1
             float(df.loc[i, "premium"] != df.loc[j, "premium"])]
    return sum(parts) / len(parts)

for i, j in [(0, 1), (0, 2), (1, 2)]:
    print(f"customer {i} vs {j}: {gower(i, j):.3f}")
`, "customer 0 vs 1: 0.476\ncustomer 0 vs 2: 0.667\ncustomer 1 vs 2: 0.857", "Hierarchical clustering can use any distance matrix, so it pairs well with Gower distance. For many categories, k-prototypes (the kmodes package) is another option."),
        { t: "h", text: "Step 3: Gaussian mixture models" },
        py("Choosing k with BIC", src`
import numpy as np
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
segments = [(20, 5), (60, 25), (120, 10)]
data = np.vstack([np.column_stack([rng.normal(s, 6, 100), rng.normal(v, 3, 100)]) for s, v in segments])
X = StandardScaler().fit_transform(data)

for k in range(1, 6):
    gm = GaussianMixture(n_components=k, random_state=0).fit(X)
    print(f"k={k}: BIC {gm.bic(X):8.1f}")

gm = GaussianMixture(n_components=3, random_state=0).fit(X)
print("Membership probabilities of the first customer:", gm.predict_proba(X[:1]).round(3).tolist())
`, "k=1: BIC   1727.2\nk=2: BIC    941.9\nk=3: BIC    629.2\nk=4: BIC    656.5\nk=5: BIC    688.9\nMembership probabilities of the first customer: [[0.0, 0.0, 1.0]]"),
        { t: "p", text: "Each cluster is modelled as a normal (Gaussian) blob that can be stretched and tilted. **Lower BIC is better**, and it bottoms out at the true k = 3. Unlike k-means, every point gets a **probability** of belonging to each cluster, which is useful for customers who sit between segments." },
        { t: "analogy", text: "Comparing people by income in rupees and age in years without scaling is like comparing a 10-kg difference with a 10-gram difference just because both are \"10\". Scaling converts every column into the same currency before measuring distance." },
        { t: "trap", text: "Don't one-hot encode categories and then use plain Euclidean distance blindly: a city mismatch may count far more or less than you intend. Decide how much each column should matter (scaling, weights, Gower). And clusters are hypotheses: check they're stable and make business sense." },
        { t: "trick", text: "**Numbers → standardise. Mixed types → Gower. Soft clusters with probabilities → Gaussian mixture + BIC.**" },
        { t: "exam", items: ["Why does scaling matter for clustering?", "Standardisation vs normalisation (min-max)?", "How do you cluster data with categorical variables?", "What is a Gaussian mixture model? How is it different from k-means?", "What is BIC?"] },
        { t: "recap", items: ["Distance-based methods need comparable scales", "StandardScaler (z-scores) or MinMaxScaler (0–1)", "Gower distance handles mixed numeric and categorical data", "Gaussian mixtures give soft, probabilistic clusters", "Choose k with BIC (lower is better)"] },
      ],
      quiz: [
        { q: "Without scaling, k-means on income (₹) and age (years) mostly groups by…", options: ["Income", "Age", "Both equally", "Neither"], answer: 0, explain: "Its numbers are thousands of times larger." },
        { q: "Gower distance for a categorical column is…", options: ["0 if the same, 1 if different", "The difference in codes", "Always 0.5", "The squared difference"], answer: 0, explain: "Then all columns are averaged." },
        { q: "With BIC, the best number of components has the…", options: ["Lowest BIC", "Highest BIC", "BIC closest to 0", "BIC equal to k"], answer: 0, explain: "BIC penalises complexity." },
        { q: "What does a Gaussian mixture give that k-means doesn't?", options: ["Probabilities of belonging to each cluster", "Faster results always", "Labels for training", "A p-value"], answer: 0, explain: "Soft clustering." },
      ],
    },
  ],
};

export const ST10_JOB_READY: LearnModule = {
  id: "job-ready",
  title: "Job-ready: project, interviews and cheat sheet",
  titleHi: "नौकरी के लिए तैयार: प्रोजेक्ट, इंटरव्यू और चीट शीट",
  blurb: "Put it all together in an end-to-end churn prediction project, practise the statistics and machine-learning questions asked in data-science interviews, and keep a one-page cheat sheet of which method to use when.",
  lessons: [
    {
      id: "end-to-end-project",
      title: "End-to-end project: predicting customer churn",
      oneLine: "A real data-science project follows the same steps every time: define the problem and metric, explore the data, split it, build a baseline, try better models with cross-validation, evaluate once on the test set, explain the model, and communicate a business recommendation.",
      minutes: 30,
      blocks: [
        { t: "h", text: "The project: which mobile customers will leave next month?" },
        { t: "table", head: ["Step", "What you do", "Lessons used"], rows: [
          ["1. Define", "Target: churn yes/no. Metric: AUC + recall at a chosen threshold", "Classification, evaluation"],
          ["2. Explore", "Churn rate, churn by contract type, distributions", "EDA, crosstabs, groupby"],
          ["3. Split", "Stratified train/test split before any modelling", "Model selection"],
          ["4. Baseline", "Logistic regression in a pipeline", "Logistic regression"],
          ["5. Improve", "Random forest / boosting with cross-validation", "Statistical ML"],
          ["6. Evaluate", "Test-set AUC, confusion matrix at a business threshold", "Evaluation"],
          ["7. Explain", "Permutation importance, coefficients", "Interpretation"],
          ["8. Communicate", "\"Call the top 20% riskiest customers; month-to-month contracts with many support calls churn most\"", "Expected value"],
        ] },
        py("Explore the data", src`
import numpy as np
import pandas as pd

rng = np.random.default_rng(11)
n = 2000
df = pd.DataFrame({
    "tenure_months": rng.integers(1, 72, n),
    "monthly_charge": rng.normal(500, 150, n).clip(150, None).round(0),     # ₹
    "contract": rng.choice(["month-to-month", "one-year", "two-year"], n, p=[0.5, 0.3, 0.2]),
    "support_calls": rng.poisson(1.5, n),
})
contract_risk = df["contract"].map({"month-to-month": 0.8, "one-year": -0.6, "two-year": -1.5})
logit = (-1.2 - 0.03 * (df["tenure_months"] - 36) + 0.002 * (df["monthly_charge"] - 500)
         + 0.4 * (df["support_calls"] - 1.5) + contract_risk)
df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
df.to_csv("churn.csv", index=False)                    # save for the next step

print("Churn rate:", round(df["churn"].mean(), 3))
print(df.groupby("contract")["churn"].mean().round(3))
print(df.groupby("support_calls")["churn"].mean().round(2).head(6))
`, "Churn rate: 0.279\ncontract\nmonth-to-month    0.429\none-year          0.152\ntwo-year          0.093\nName: churn, dtype: float64\nsupport_calls\n0    0.16\n1    0.24\n2    0.33\n3    0.42\n4    0.36\n5    0.58\nName: churn, dtype: float64"),
        py("Model, evaluate and explain", src`
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, roc_auc_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# (re-create the data from the previous step so this runs on its own)
rng = np.random.default_rng(11)
n = 2000
df = pd.DataFrame({
    "tenure_months": rng.integers(1, 72, n),
    "monthly_charge": rng.normal(500, 150, n).clip(150, None).round(0),
    "contract": rng.choice(["month-to-month", "one-year", "two-year"], n, p=[0.5, 0.3, 0.2]),
    "support_calls": rng.poisson(1.5, n),
})
contract_risk = df["contract"].map({"month-to-month": 0.8, "one-year": -0.6, "two-year": -1.5})
logit = (-1.2 - 0.03 * (df["tenure_months"] - 36) + 0.002 * (df["monthly_charge"] - 500)
         + 0.4 * (df["support_calls"] - 1.5) + contract_risk)
df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

X, y = df.drop(columns="churn"), df["churn"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

prep = ColumnTransformer([
    ("num", StandardScaler(), ["tenure_months", "monthly_charge", "support_calls"]),
    ("cat", OneHotEncoder(drop="first"), ["contract"]),
])
models = {
    "logistic": Pipeline([("prep", prep), ("model", LogisticRegression())]),
    "forest": Pipeline([("prep", prep), ("model", RandomForestClassifier(300, min_samples_leaf=10, random_state=0))]),
}
for name, pipe in models.items():
    auc = cross_val_score(pipe, X_train, y_train, cv=5, scoring="roc_auc").mean()
    print(f"{name:<9} CV AUC {auc:.3f}")

best = models["logistic"].fit(X_train, y_train)           # the simpler model is as good: keep it
prob = best.predict_proba(X_test)[:, 1]
print("Test AUC:", round(roc_auc_score(y_test, prob), 3))

threshold = np.quantile(prob, 0.8)                        # contact the riskiest 20%
tn, fp, fn, tp = confusion_matrix(y_test, (prob >= threshold).astype(int)).ravel()
print(f"Top 20% list: catches {tp} of {tp + fn} churners (recall {tp / (tp + fn):.2f}), precision {tp / (tp + fp):.2f}")

imp = permutation_importance(best, X_test, y_test, scoring="roc_auc", n_repeats=10, random_state=0)
print(pd.Series(imp.importances_mean, index=X.columns).sort_values(ascending=False).round(3))
`, "logistic  CV AUC 0.784\nforest    CV AUC 0.768\nTest AUC: 0.796\nTop 20% list: catches 65 of 139 churners (recall 0.47), precision 0.65\ncontract          0.163\ntenure_months     0.082\nsupport_calls     0.054\nmonthly_charge    0.019\ndtype: float64"),
        { t: "h", text: "Communicating the result" },
        { t: "points", items: ["**Lead with the decision, not the model:** \"Calling the riskiest 20% each month reaches about half of the customers who would leave.\"", "**Quantify the value with expected value:** if a retention call costs ₹50 and saves 30% of the churners reached, each worth ₹6,000 a year, the campaign pays off when precision × 0.3 × 6000 > 50.", "**Explain the drivers simply:** month-to-month contracts, short tenure and many support calls.", "**State the limits:** a model trained on past behaviour; monitor it monthly and retrain when performance drifts."] },
        { t: "p", text: "**Put it on GitHub:** a notebook with clear headings (problem, EDA, models, results), a README with the business summary and key chart, and a requirements.txt. This one project demonstrates almost everything in this course." },
        { t: "analogy", text: "A data-science project is like a doctor's visit: understand the complaint (problem), run tests (EDA), try a standard treatment first (baseline), adjust if needed (better models), confirm with a final check-up (test set), and explain the diagnosis in plain words (communication)." },
        { t: "trap", text: "Common project mistakes: preprocessing (scaling, encoding, resampling) **before** splitting, which leaks test information; choosing the model on the test set; reporting only accuracy; and presenting code instead of a recommendation. Pipelines + cross-validation prevent most leaks." },
        { t: "trick", text: "**Define → explore → split → baseline → improve with CV → test once → explain → recommend.**" },
        { t: "exam", items: ["Walk me through a data-science project you've done.", "How do you prevent data leakage?", "Why use a pipeline?", "How did you choose your evaluation metric?", "How would you explain your model to a business manager?", "How do you monitor a model after deployment?"] },
        { t: "recap", items: ["Every project follows the same 8 steps", "Split first; put preprocessing inside a pipeline", "Start with a simple baseline; keep it if it's as good", "Pick a threshold from the business need", "Communicate decisions, value and limits"] },
      ],
      quiz: [
        { q: "When should you split into train and test sets?", options: ["Before any preprocessing or modelling", "After scaling everything", "After choosing the model on all data", "It doesn't matter"], answer: 0, explain: "Otherwise test information leaks." },
        { q: "Two models have the same CV AUC. Prefer…", options: ["The simpler, more explainable one", "The more complex one", "The one with more features", "Neither"], answer: 0, explain: "Simplicity wins ties." },
        { q: "What does permutation importance measure?", options: ["How much the score drops when a feature is shuffled", "The coefficient size", "The number of trees", "The p-value"], answer: 0, explain: "Shuffling breaks the feature's link to the target." },
        { q: "The best way to present results to a manager is…", options: ["A clear recommendation with its expected value and limits", "The full code", "Only the AUC", "A list of hyperparameters"], answer: 0, explain: "Decisions, not code." },
      ],
    },
    {
      id: "interview-questions",
      title: "Top statistics and ML interview questions",
      oneLine: "The questions data-science interviews ask again and again, with short answers and code proofs: Bayes' theorem traps, the birthday problem, p-values, bias vs variance, overfitting, metrics, A/B tests and more.",
      minutes: 25,
      blocks: [
        { t: "h", text: "Q1. A test is 99% sensitive and 95% specific; 1% of people have the disease. You test positive. Chance you have it?" },
        py("Bayes' theorem: the base-rate trap", src`
prevalence, sensitivity, specificity = 0.01, 0.99, 0.95

true_pos = prevalence * sensitivity                 # sick and test positive
false_pos = (1 - prevalence) * (1 - specificity)    # healthy but test positive
print("P(disease | positive) =", round(true_pos / (true_pos + false_pos), 3))

people = 10_000                                     # the same thing with counts
sick = people * prevalence
print(f"Of {people:,}: {sick * sensitivity:.0f} true positives vs {(people - sick) * (1 - specificity):.0f} false positives")
`, "P(disease | positive) = 0.167\nOf 10,000: 99 true positives vs 495 false positives"),
        { t: "p", text: "Only about **17%**, not 99%. The disease is rare, so false positives from the many healthy people outnumber the true positives. Interviewers love this question because most people answer 99%." },
        { t: "h", text: "Q2. How many people are needed for a 50% chance that two share a birthday?" },
        py("Birthday problem: formula and simulation", src`
import numpy as np

def p_shared(n):
    p_all_different = 1.0
    for i in range(n):
        p_all_different *= (365 - i) / 365
    return 1 - p_all_different

print("23 people:", round(p_shared(23), 3))
print("50 people:", round(p_shared(50), 3))

rng = np.random.default_rng(0)
trials = rng.integers(0, 365, size=(20_000, 23))           # 20,000 rooms of 23 people
shared = np.array([len(set(row)) < 23 for row in trials])
print("Simulated, 23 people:", round(shared.mean(), 3))
`, "23 people: 0.507\n50 people: 0.97\nSimulated, 23 people: 0.498"),
        { t: "h", text: "Q3. Is the p-value the probability that the null hypothesis is true?" },
        py("Under H₀, p-values are uniform", src`
import numpy as np
from scipy import stats

rng = np.random.default_rng(1)
p_values = np.array([stats.ttest_ind(rng.normal(0, 1, 30), rng.normal(0, 1, 30)).pvalue
                     for _ in range(5000)])            # H0 is TRUE every time
print("Share of p < 0.05:", round(float(np.mean(p_values < 0.05)), 3))
print("Share of p < 0.50:", round(float(np.mean(p_values < 0.50)), 3))
`, "Share of p < 0.05: 0.05\nShare of p < 0.50: 0.489", "No. When H₀ is true, every p-value between 0 and 1 is equally likely, so p < 0.05 happens about 5% of the time: that's the Type I error rate α, not the probability that H₀ is true."),
        { t: "h", text: "Quick-fire answers" },
        { t: "table", head: ["Question", "Short answer"], rows: [
          ["Bias vs variance?", "Bias = error from a too-simple model (underfitting); variance = sensitivity to the training data (overfitting). Good models balance both"],
          ["How do you detect overfitting?", "Training score much better than validation/CV score"],
          ["Mean vs median?", "Median for skewed data or outliers"],
          ["SD vs SE?", "SD = spread of data; SE = uncertainty of an estimate (SD/√n)"],
          ["Central limit theorem?", "Sample means are approximately normal for large n, whatever the data's shape"],
          ["Type I vs Type II error?", "False positive (α) vs false negative (β); power = 1 − β"],
          ["What is a confidence interval?", "A range from a method that captures the true value in, e.g., 95% of samples"],
          ["Correlation vs causation?", "Correlation is association; causation needs experiments or careful control of confounders"],
          ["Precision vs recall?", "Of flagged, how many right / of real positives, how many caught"],
          ["Why is accuracy misleading?", "With imbalanced classes, predicting the majority gives high accuracy and no value"],
          ["L1 vs L2 regularisation?", "L1 (Lasso) can zero out coefficients; L2 (Ridge) shrinks them smoothly"],
          ["Bagging vs boosting?", "Parallel models on bootstrap samples, averaged / sequential models fixing previous errors"],
          ["How to handle missing data?", "Understand why it's missing; drop, impute (median/mode/model), add a missing-indicator; impute inside the pipeline"],
          ["What is data leakage?", "Information from the test set or the future sneaking into training"],
          ["How long to run an A/B test?", "Until the pre-calculated sample size is reached, in full weeks; no peeking"],
          ["What is multicollinearity?", "Highly correlated predictors make coefficients unstable; check VIF"],
          ["k-means vs hierarchical?", "k-means: fast, needs k; hierarchical: dendrogram, any k, slow on big data"],
          ["What does PCA do?", "Rotates data to uncorrelated components ordered by variance; used to reduce dimensions"],
          ["Logistic regression coefficient?", "Change in log-odds per unit; e^b is the odds ratio"],
          ["Why cross-validation?", "A more reliable estimate of performance on unseen data than one split"],
        ] },
        { t: "analogy", text: "Interview questions are like a driving test: the examiner doesn't care whether you can recite the rule book, but whether you know what to do at a tricky junction. Explain the idea in plain words, give a tiny example, and mention a common mistake." },
        { t: "trap", text: "Don't answer with formulas alone. For \"what is a p-value?\", a strong answer has three parts: the definition (probability of data this extreme if H₀ is true), an example (the A/B test), and what it is NOT (the probability that H₀ is true, or the effect size)." },
        { t: "trick", text: "**Definition → small example → common mistake → when you'd use it.**" },
        { t: "exam", items: ["Everything in the table above.", "Explain a p-value / confidence interval to a non-technical person.", "Design an A/B test for a new checkout button.", "Your model's accuracy is 98%: is it good? (Ask about class balance and the confusion matrix.)", "How would you detect fraud in transactions? (Imbalanced classification + anomaly detection.)"] },
        { t: "recap", items: ["Base rates matter: P(disease | positive) can be small", "Birthday problem: 23 people ≈ 50%", "Under H₀, p-values are uniform", "Know the 20 quick-fire answers", "Answer with definition, example and pitfall"] },
      ],
      quiz: [
        { q: "A rare disease (1%) and a 95%-specific test: a positive result means the person is…", options: ["Probably still healthy", "Certainly sick", "95% likely sick", "99% likely sick"], answer: 0, explain: "False positives dominate when the disease is rare." },
        { q: "About how many people for a 50% birthday match?", options: ["23", "183", "365", "50"], answer: 0, explain: "Pairs grow fast: 23 people make 253 pairs." },
        { q: "High training accuracy, low test accuracy indicates…", options: ["High variance (overfitting)", "High bias", "Data is perfectly clean", "Good generalisation"], answer: 0, explain: "The model memorised the training data." },
        { q: "If H₀ is true, P(p < 0.05) is about…", options: ["5%", "0%", "50%", "95%"], answer: 0, explain: "That's α, the Type I error rate." },
      ],
    },
    {
      id: "cheat-sheet",
      title: "Cheat sheet: which method when?",
      oneLine: "One page to come back to: which summary, chart, test or model fits your question and your data types, plus a study plan for the next steps in data science.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Describing data" },
        { t: "table", head: ["Data", "Centre", "Spread", "Chart"], rows: [["Numeric, symmetric", "Mean", "SD", "Histogram, boxplot"], ["Numeric, skewed / outliers", "Median", "IQR, MAD", "Histogram, boxplot"], ["Categorical", "Mode, proportions", "–", "Bar chart"], ["Two numeric", "Correlation (Pearson / Spearman)", "–", "Scatter, hexbin"], ["Category × category", "Row percentages", "–", "Crosstab, stacked bars"], ["Number × category", "Group medians/means", "Group IQRs", "Side-by-side boxplots"]] },
        { t: "h", text: "Choosing a test" },
        { t: "table", head: ["Question", "Test", "Python"], rows: [
          ["Two group means", "Welch's t-test (or permutation test)", "`stats.ttest_ind(a, b, equal_var=False)`"],
          ["Same people before/after", "Paired t-test", "`stats.ttest_rel`"],
          ["Two proportions (A/B conversion)", "Two-proportion z-test", "`proportions_ztest`"],
          ["3+ group means", "ANOVA, then Tukey HSD", "`stats.f_oneway`, `stats.tukey_hsd`"],
          ["Counts in a table", "Chi-square (Fisher if counts < 5)", "`chi2_contingency`, `fisher_exact`"],
          ["Non-normal, small samples", "Mann-Whitney U / permutation test", "`stats.mannwhitneyu`, `stats.permutation_test`"],
          ["Uncertainty of any statistic", "Bootstrap CI", "`stats.bootstrap`"],
          ["Many tests at once", "Bonferroni / Benjamini-Hochberg", "`stats.false_discovery_control`"],
        ] },
        { t: "h", text: "Choosing a model" },
        { t: "table", head: ["Goal", "Start with", "Then try", "Evaluate with"], rows: [
          ["Predict a number", "Linear regression", "Random forest, gradient boosting", "RMSE, MAE, R² (cross-validated)"],
          ["Predict yes/no", "Logistic regression", "Random forest, gradient boosting", "AUC, precision, recall, F1"],
          ["Text classification", "Naive Bayes / logistic regression", "Transformer models", "F1, accuracy"],
          ["Rare positive class", "Logistic + class_weight", "Boosting with weights, threshold tuning", "Recall, precision, PR-AUC"],
          ["Explain drivers", "Linear / logistic regression", "Permutation importance, SHAP", "Coefficients, CIs"],
          ["Find groups", "K-means (scaled)", "Hierarchical, Gaussian mixture", "Silhouette, BIC, business sense"],
          ["Reduce columns", "PCA", "Feature selection, Lasso", "Explained variance"],
        ] },
        { t: "h", text: "What to learn next" },
        { t: "table", head: ["Weeks", "Focus"], rows: [["1–2", "SQL (joins, group by, window functions): most data jobs test it"], ["3–4", "pandas + matplotlib/seaborn on real datasets (Kaggle, data.gov.in)"], ["5–6", "Two portfolio projects: one EDA + A/B analysis, one prediction model"], ["7–8", "Interview practice: statistics questions above, SQL problems, case studies"], ["Later", "Time series (forecasting), deep learning, MLOps (deploying and monitoring models)"]] },
        { t: "analogy", text: "This cheat sheet is the map at a mall entrance: you don't memorise every shop, you check where you are (your data types) and where you want to go (your question), and the route (method) follows." },
        { t: "trap", text: "No table replaces looking at your data. Before any test or model: plot it, check the data types, missing values and outliers, and ask how the data was collected (bias). Most real mistakes happen there, not in the choice of algorithm." },
        { t: "trick", text: "**Question + data types → method. Simple first. Always validate on unseen data.**" },
        { t: "exam", items: ["Which test would you use to compare conversion rates?", "Which model would you try first for a yes/no prediction, and why?", "How would you explain the difference between a statistical test and a machine-learning model?", "What would you check before running any analysis?"] },
        { t: "recap", items: ["Skewed data → median and IQR", "Means → t-test/ANOVA; counts → chi-square; rates → z-test", "Bootstrap for the uncertainty of anything", "Simple models first, ensembles next, always cross-validate", "SQL + pandas + projects = job-ready"] },
      ],
      quiz: [
        { q: "Comparing conversion rates of two page versions: which test?", options: ["Two-proportion z-test (or chi-square)", "Paired t-test", "ANOVA", "PCA"], answer: 0, explain: "Comparing proportions." },
        { q: "First model to try for a yes/no prediction?", options: ["Logistic regression", "A deep neural network", "K-means", "PCA"], answer: 0, explain: "A strong, explainable baseline." },
        { q: "Best centre for salary data with a few huge values?", options: ["Median", "Mean", "Max", "Mode"], answer: 0, explain: "It's robust to outliers." },
        { q: "To group customers without labels, start with…", options: ["K-means on scaled features", "Logistic regression", "A t-test", "Linear regression"], answer: 0, explain: "Clustering is unsupervised." },
      ],
    },
  ],
};
