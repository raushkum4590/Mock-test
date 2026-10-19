import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Hands-On ML, chapters 7–8: ensemble learning and random forests, dimensionality reduction. */
export const HO06_ENSEMBLES: LearnModule = {
  id: "ensembles",
  title: "Ensemble learning and random forests",
  titleHi: "एन्सेम्बल लर्निंग और रैंडम फ़ॉरेस्ट",
  blurb: "Combine many models into a stronger one: hard and soft voting, bagging and pasting with out-of-bag evaluation, random forests and extra-trees, feature importance, AdaBoost and gradient boosting, and stacking.",
  lessons: [
    {
      id: "voting-bagging",
      title: "Voting classifiers, bagging, pasting and out-of-bag evaluation",
      oneLine: "A group of different, reasonably good models usually beats its best member (the wisdom of the crowd). Voting combines different algorithms; bagging trains the same algorithm on random subsets of the data (with replacement), pasting without replacement. Rows a model never saw give a free out-of-bag accuracy estimate.",
      minutes: 22,
      blocks: [
        py("Crowds beat individuals", src`
from sklearn.datasets import make_moons
from sklearn.ensemble import BaggingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=1000, noise=0.30, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)
members = [("lr", LogisticRegression(random_state=42)),
           ("rf", RandomForestClassifier(random_state=42)),
           ("svc", SVC(probability=True, random_state=42))]
for name, clf in members:
    print(f"{name:<4} test accuracy {clf.fit(X_tr, y_tr).score(X_te, y_te):.3f}")
for voting in ["hard", "soft"]:
    vote = VotingClassifier(members, voting=voting).fit(X_tr, y_tr)
    print(f"{voting} voting: {vote.score(X_te, y_te):.3f}")

tree = DecisionTreeClassifier(random_state=42).fit(X_tr, y_tr)
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=500, max_samples=100, bootstrap=True,
                        oob_score=True, random_state=42).fit(X_tr, y_tr)
print(f"single tree {tree.score(X_te, y_te):.3f} | bagging 500 trees {bag.score(X_te, y_te):.3f} "
      f"| out-of-bag estimate {bag.oob_score_:.3f}")
`, "lr   test accuracy 0.852\nrf   test accuracy 0.912\nsvc  test accuracy 0.916\nhard voting: 0.908\nsoft voting: 0.916\nsingle tree 0.892 | bagging 500 trees 0.916 | out-of-bag estimate 0.911"),
        { t: "table", head: ["Method", "Diversity comes from", "Notes"], rows: [["Hard voting", "Different algorithms", "Majority of predicted classes"], ["Soft voting", "Different algorithms", "Average of predicted probabilities: usually better"], ["Bagging", "Random samples with replacement", "Lowers variance; parallel; enables OOB evaluation"], ["Pasting", "Random samples without replacement", "Similar, slightly less diverse"], ["Random patches / subspaces", "Random features too (`max_features`, `bootstrap_features`)", "Useful with many features (images)"]] },
        { t: "p", text: "With only three members and an already-strong SVC, soft voting merely matches the best member here (hard voting is slightly below): voting pays off most with many diverse, similarly good models. Bagging shows the effect clearly: the ensemble of 500 bagged trees generalises much better than one tree: individual trees overfit in different ways, and averaging cancels much of it. The out-of-bag score, computed on the rows each tree didn't see, is close to the test accuracy without needing a separate validation set." },
        { t: "analogy", text: "Asking 1,000 random people to guess the number of sweets in a jar gives an average far closer than most individuals, as long as their errors are independent. Ensembles work the same way, which is why they need diverse members." },
        { t: "trap", text: "Ensembles of very similar models (same algorithm, same data) gain little, because they make the same mistakes. Soft voting needs every member to estimate probabilities (`SVC(probability=True)`). Ensembles are slower and harder to explain than one model." },
        { t: "trick", text: "**Diverse models + vote (soft if possible). Same model + random data subsets = bagging, with free OOB scores.**" },
        { t: "exam", items: ["Why do ensembles work?", "Hard vs soft voting?", "Bagging vs pasting?", "What is out-of-bag evaluation?", "What are random patches and random subspaces?"] },
        { t: "recap", items: ["Diverse members → better ensemble", "Soft voting averages probabilities", "Bagging: bootstrap samples, parallel, lower variance", "OOB score ≈ validation score for free", "max_features adds feature randomness"] },
      ],
      quiz: [
        { q: "Soft voting combines…", options: ["Predicted probabilities", "Majority class labels", "Training times", "Feature importances"], answer: 0, explain: "Hard voting uses labels." },
        { q: "Bagging samples the training set…", options: ["With replacement", "Without replacement", "Not at all", "Only the test set"], answer: 0, explain: "Pasting is without replacement." },
        { q: "The out-of-bag score is computed on…", options: ["Rows each predictor didn't train on", "The test set", "All training rows", "Random noise"], answer: 0, explain: "A free validation estimate." },
        { q: "Ensembles work best when members are…", options: ["Diverse (make different errors)", "Identical", "All weak and identical", "Untrained"], answer: 0, explain: "Errors must not all agree." },
      ],
    },
    {
      id: "forests-importance",
      title: "Random forests, extra-trees and feature importance",
      oneLine: "A random forest is bagging of decision trees that also picks a random subset of features at each split. Extra-trees go further by choosing random thresholds, making training faster. Forests rank features by how much each one reduces impurity on average.",
      minutes: 18,
      blocks: [
        py("Forests and what they rely on", src`
import numpy as np
from sklearn.datasets import load_digits, load_iris, make_moons
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.model_selection import cross_val_score

X, y = make_moons(n_samples=1000, noise=0.30, random_state=42)
for name, model in [("random forest", RandomForestClassifier(500, max_leaf_nodes=16, random_state=42)),
                    ("extra-trees", ExtraTreesClassifier(500, max_leaf_nodes=16, random_state=42))]:
    print(f"{name:<14} CV accuracy {cross_val_score(model, X, y, cv=5).mean():.3f}")

iris = load_iris(as_frame=True)
forest = RandomForestClassifier(500, random_state=42).fit(iris.data, iris.target)
for score, name in sorted(zip(forest.feature_importances_, iris.data.columns), reverse=True):
    print(f"   {name:<20} importance {score:.3f}")

digits = load_digits()
pixels = RandomForestClassifier(200, random_state=42).fit(digits.data, digits.target).feature_importances_.reshape(8, 8)
print("pixel importance map (█ high, ░ low):")
for row in pixels:
    print("   " + "".join("█" if v > 0.025 else "▒" if v > 0.01 else "░" for v in row))
`, "random forest  CV accuracy 0.913\nextra-trees    CV accuracy 0.898\n   petal length (cm)    importance 0.441\n   petal width (cm)     importance 0.423\n   sepal length (cm)    importance 0.112\n   sepal width (cm)     importance 0.023\npixel importance map (█ high, ░ low):\n   ░░▒░░▒░░\n   ░▒█░▒█░░\n   ░░▒███░░\n   ░▒███▒█░\n   ░██▒█▒█░\n   ░▒██▒▒▒░\n   ░░▒▒▒█▒░\n   ░░▒░▒█▒░"),
        { t: "p", text: "Petal measurements carry almost all of the information about the iris species; sepal width barely matters. On digits, the centre pixels matter most and the border pixels are useless, which is a quick way to understand what a model looks at." },
        { t: "analogy", text: "A random forest is a committee where each member studied a different random selection of past cases and, at every decision, is only allowed to consider a few random clues. That forced variety is what makes the committee's vote reliable." },
        { t: "trap", text: "Impurity-based importances are biased towards features with many distinct values and are computed on training data. For decisions, confirm with permutation importance on a validation set. Correlated features split the credit between them, so each can look less important than it is." },
        { t: "trick", text: "**Forest = bagged trees + random features per split. Extra-trees = also random thresholds (faster). Check permutation importance.**" },
        { t: "exam", items: ["How does a random forest differ from bagged trees?", "What are extra-trees?", "How is feature importance computed?", "What are the pitfalls of impurity-based importance?"] },
        { t: "recap", items: ["Random forest: bagging + random feature subsets per split", "Extra-trees: random thresholds too; faster", "feature_importances_ ranks features", "Permutation importance is more reliable", "Forests are strong defaults for tabular data"] },
      ],
      quiz: [
        { q: "What does a random forest add to bagged trees?", options: ["A random subset of features at each split", "Boosting", "Linear models", "Scaling"], answer: 0, explain: "More diversity." },
        { q: "Extra-trees choose split thresholds…", options: ["Randomly", "By exhaustive search only", "From the test set", "Never"], answer: 0, explain: "Hence \"extremely randomized\"." },
        { q: "Impurity-based importances can be biased towards…", options: ["Features with many distinct values", "Binary features", "Missing features", "The target"], answer: 0, explain: "Use permutation importance to check." },
        { q: "On iris, the most important features are…", options: ["Petal measurements", "Sepal width", "Flower colour", "Row number"], answer: 0, explain: "They separate the species." },
      ],
    },
    {
      id: "boosting-stacking",
      title: "Boosting (AdaBoost and gradient boosting) and stacking",
      oneLine: "Boosting trains models one after another, each fixing its predecessor: AdaBoost re-weights the misclassified rows, gradient boosting fits each new tree to the previous trees' residual errors. Stacking trains a final model (a blender) to combine the predictions of several models.",
      minutes: 24,
      blocks: [
        py("Gradient boosting by hand, then with scikit-learn", src`
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor

rng = np.random.default_rng(42)
X = rng.random((100, 1)) - 0.5
y = 3 * X[:, 0] ** 2 + 0.05 * rng.normal(size=100)

tree1 = DecisionTreeRegressor(max_depth=2, random_state=42).fit(X, y)
residual1 = y - tree1.predict(X)
tree2 = DecisionTreeRegressor(max_depth=2, random_state=43).fit(X, residual1)   # fit the errors
residual2 = residual1 - tree2.predict(X)
tree3 = DecisionTreeRegressor(max_depth=2, random_state=44).fit(X, residual2)
for k, trees in enumerate([[tree1], [tree1, tree2], [tree1, tree2, tree3]], start=1):
    pred = sum(t.predict(X) for t in trees)
    print(f"{k} tree(s): training RMSE {np.sqrt(np.mean((y - pred) ** 2)):.4f}")

gbrt = GradientBoostingRegressor(max_depth=2, learning_rate=0.05, n_estimators=500,
                                 n_iter_no_change=10, random_state=42).fit(X, y)
print("early stopping kept", gbrt.n_estimators_, "of 500 trees")
`, "1 tree(s): training RMSE 0.0947\n2 tree(s): training RMSE 0.0818\n3 tree(s): training RMSE 0.0612\nearly stopping kept 53 of 500 trees"),
        py("AdaBoost, histogram boosting and stacking", src`
from sklearn.datasets import make_moons
from sklearn.ensemble import (AdaBoostClassifier, HistGradientBoostingClassifier, RandomForestClassifier,
                              StackingClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=1000, noise=0.30, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)

ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=30, learning_rate=0.5,
                         random_state=42).fit(X_tr, y_tr)                  # 30 decision stumps
hgb = HistGradientBoostingClassifier(random_state=42).fit(X_tr, y_tr)
stack = StackingClassifier(
    estimators=[("lr", LogisticRegression(random_state=42)), ("rf", RandomForestClassifier(random_state=42)),
                ("svc", SVC(probability=True, random_state=42))],
    final_estimator=RandomForestClassifier(random_state=43), cv=5).fit(X_tr, y_tr)
for name, model in [("AdaBoost (stumps)", ada), ("HistGradientBoosting", hgb), ("stacking", stack)]:
    print(f"{name:<21} test accuracy {model.score(X_te, y_te):.3f}")
`, "AdaBoost (stumps)     test accuracy 0.884\nHistGradientBoosting  test accuracy 0.908\nstacking              test accuracy 0.916"),
        { t: "table", head: ["Method", "How", "Key settings"], rows: [["AdaBoost", "Re-weight misclassified rows; weighted vote of predictors", "n_estimators, learning_rate"], ["Gradient boosting", "Each tree fits the previous trees' residuals", "learning_rate (shrinkage), n_estimators, max_depth, early stopping"], ["HistGradientBoosting / XGBoost / LightGBM", "Fast gradient boosting with binned features", "Excellent on large tabular data"], ["Stacking", "A blender learns how to combine models' predictions", "Use out-of-fold predictions (cv=)"]] },
        { t: "analogy", text: "Boosting is a series of tutors: the first teaches the basics, the next focuses only on the questions the student still gets wrong, and so on. Stacking is a coach who has learned which experts to trust for which kinds of question." },
        { t: "trap", text: "Boosting is sequential (harder to parallelise) and can overfit if you add too many trees with a high learning rate: use a small learning rate and early stopping. A stacking blender must be trained on out-of-fold predictions, or it learns to trust overfitted members." },
        { t: "trick", text: "**Bagging = parallel, lowers variance. Boosting = sequential, lowers bias. Stacking = a learned combiner.**" },
        { t: "exam", items: ["How does AdaBoost work?", "How does gradient boosting work?", "What is shrinkage (learning rate) in boosting?", "Bagging vs boosting?", "What is stacking and how is the blender trained?"] },
        { t: "recap", items: ["Boosting trains predictors sequentially", "AdaBoost reweights hard examples", "Gradient boosting fits residuals", "Small learning rate + early stopping", "Stacking: a blender on out-of-fold predictions"] },
      ],
      quiz: [
        { q: "In gradient boosting, each new tree is trained on…", options: ["The residual errors of the ensemble so far", "A bootstrap sample only", "The test set", "Random labels"], answer: 0, explain: "It corrects what's left." },
        { q: "AdaBoost focuses later predictors on…", options: ["Instances the previous ones got wrong", "Easy instances", "Random features", "The validation set"], answer: 0, explain: "By increasing their weights." },
        { q: "A smaller learning rate in boosting usually needs…", options: ["More trees", "Fewer trees", "No trees", "Deeper trees only"], answer: 0, explain: "Each tree contributes less." },
        { q: "In stacking, the final model is called the…", options: ["Blender (meta-learner)", "Stump", "Bootstrap", "Kernel"], answer: 0, explain: "It combines the base models." },
      ],
    },
  ],
};

export const HO07_DIM_REDUCTION: LearnModule = {
  id: "dimensionality-reduction",
  title: "Dimensionality reduction",
  titleHi: "डायमेंशनैलिटी रिडक्शन",
  blurb: "Why high-dimensional data is hard (the curse of dimensionality), projection vs manifold learning, PCA in depth (SVD, explained variance, choosing dimensions, compression, incremental and randomized PCA), kernel PCA and LLE.",
  lessons: [
    {
      id: "curse-pca",
      title: "The curse of dimensionality and PCA",
      oneLine: "In high dimensions, points are far apart and sparse, so models need far more data. PCA finds the axes of greatest variance (via singular value decomposition) and projects the data onto the first few, keeping most of the variance in far fewer dimensions; it can also compress and approximately reconstruct the data.",
      minutes: 22,
      blocks: [
        py("Distances in high dimensions", src`
import numpy as np

rng = np.random.default_rng(42)
for dims in [2, 10, 100, 1000]:
    a, b = rng.random((2000, dims)), rng.random((2000, dims))
    print(f"{dims:>4} dimensions: average distance between two random points {np.linalg.norm(a - b, axis=1).mean():6.2f}")
`, "   2 dimensions: average distance between two random points   0.53\n  10 dimensions: average distance between two random points   1.27\n 100 dimensions: average distance between two random points   4.07\n1000 dimensions: average distance between two random points  12.90", "In a unit square, two random points are about 0.53 apart; in a 1,000-dimensional unit hypercube, about 12.9. High-dimensional data is mostly empty space, so predictions rely on far-away neighbours (more overfitting risk)."),
        py("PCA by SVD, choosing dimensions and compression", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

rng = np.random.default_rng(42)
X3 = rng.multivariate_normal([0, 0, 0], [[3, 2.5, 0.2], [2.5, 3, 0.2], [0.2, 0.2, 0.3]], 500)
X_centered = X3 - X3.mean(axis=0)
U, s, Vt = np.linalg.svd(X_centered)                     # principal components = rows of Vt
explained = s ** 2 / np.sum(s ** 2)
print("explained variance ratios (SVD):", explained.round(3).tolist())
print("same with sklearn:", PCA().fit(X3).explained_variance_ratio_.round(3).tolist())

digits = load_digits()
pca = PCA().fit(digits.data)
d = int(np.argmax(np.cumsum(pca.explained_variance_ratio_) >= 0.95) + 1)
print(f"digits: {digits.data.shape[1]} pixels → {d} components keep 95% of the variance")
pca95 = PCA(n_components=0.95).fit(digits.data)
recovered = pca95.inverse_transform(pca95.transform(digits.data))
print("compressed size:", f"{pca95.n_components_ / 64:.0%}", "| mean reconstruction error per pixel:",
      round(float(np.abs(recovered - digits.data).mean()), 3))
`, "explained variance ratios (SVD): [0.891, 0.07, 0.039]\nsame with sklearn: [0.891, 0.07, 0.039]\ndigits: 64 pixels → 29 components keep 95% of the variance\ncompressed size: 45% | mean reconstruction error per pixel: 0.609"),
        { t: "table", head: ["PCA variant", "Use when"], rows: [["`PCA()`", "Data fits in memory (default)"], ["`PCA(svd_solver=\"randomized\")`", "Want only a few components from big data: much faster"], ["`IncrementalPCA`", "Data doesn't fit in memory: fit in mini-batches (`partial_fit`)"], ["`PCA(n_components=0.95)`", "Let the variance target choose the number of components"]] },
        { t: "analogy", text: "PCA is like describing people by \"overall size\" instead of height, weight and shoe size separately: one well-chosen combination captures most of the differences, so you can drop the rest with little loss." },
        { t: "trap", text: "PCA keeps variance, not necessarily what predicts your target, and components are hard to name. Centre the data (PCA does it for you) and scale features with different units first. Fit PCA on training data only inside a pipeline." },
        { t: "trick", text: "**Curse: more dimensions → emptier space → more data needed. PCA(0.95) → keep 95% variance.**" },
        { t: "exam", items: ["What is the curse of dimensionality?", "Projection vs manifold learning?", "How does PCA work? What is SVD's role?", "How do you choose the number of components?", "Randomized vs incremental PCA?"] },
        { t: "recap", items: ["High dimensions are sparse; distances grow", "PCA projects onto axes of greatest variance", "SVD gives the components", "explained_variance_ratio_ to choose d", "inverse_transform reconstructs (compression)"] },
      ],
      quiz: [
        { q: "As dimensions increase, the average distance between random points…", options: ["Grows", "Shrinks", "Stays the same", "Becomes zero"], answer: 0, explain: "Space gets emptier." },
        { q: "PCA's components come from the…", options: ["Singular value decomposition of centred data", "Labels", "Decision trees", "Random numbers"], answer: 0, explain: "Rows of Vᵀ." },
        { q: "PCA(n_components=0.95) chooses…", options: ["Enough components for 95% of the variance", "95 components", "95% of the rows", "The 95th percentile"], answer: 0, explain: "A float means a variance share." },
        { q: "For a dataset too big for memory, use…", options: ["IncrementalPCA", "PCA() only", "Kernel PCA", "LLE"], answer: 0, explain: "partial_fit on batches." },
      ],
    },
    {
      id: "kernel-pca-lle",
      title: "Kernel PCA and LLE: unrolling curved data",
      oneLine: "When data lies on a curved surface (a manifold), linear projection squashes it. Kernel PCA uses the kernel trick to perform non-linear projections, and its kernel can be tuned with a grid search inside a supervised pipeline. LLE (locally linear embedding) preserves each point's relation to its neighbours and can unroll twisted manifolds.",
      minutes: 20,
      blocks: [
        py("Kernel PCA tuned by a downstream task, and LLE", src`
import numpy as np
from scipy.stats import spearmanr
from sklearn.datasets import make_swiss_roll
from sklearn.decomposition import PCA, KernelPCA
from sklearn.linear_model import LogisticRegression
from sklearn.manifold import LocallyLinearEmbedding
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline

X, t = make_swiss_roll(n_samples=1000, noise=0.2, random_state=42)
y = t > 6.9                                                   # a label that follows the roll

pipe = Pipeline([("kpca", KernelPCA(n_components=2)), ("log_reg", LogisticRegression())])
grid = GridSearchCV(pipe, {"kpca__gamma": np.linspace(0.03, 0.05, 3).tolist(), "kpca__kernel": ["rbf", "sigmoid"]}, cv=3)
grid.fit(X, y)
print("best kernel PCA settings:", {k: round(v, 3) if isinstance(v, float) else v for k, v in grid.best_params_.items()})
print("CV accuracy with that projection:", round(grid.best_score_, 3))
linear = Pipeline([("pca", PCA(2)), ("log_reg", LogisticRegression())]).fit(X, y)
print("plain PCA + logistic training accuracy:", round(linear.score(X, y), 3))

for name, model in [("PCA", PCA(2)), ("LLE", LocallyLinearEmbedding(n_components=2, n_neighbors=10, random_state=42))]:
    emb = model.fit_transform(X)
    rho = max(abs(spearmanr(emb[:, i], t).statistic) for i in range(2))
    print(f"{name}: position along the roll preserved, rank correlation {rho:.2f}")
`, "best kernel PCA settings: {'kpca__gamma': 0.04, 'kpca__kernel': 'rbf'}\nCV accuracy with that projection: 0.931\nplain PCA + logistic training accuracy: 0.711\nPCA: position along the roll preserved, rank correlation 0.21\nLLE: position along the roll preserved, rank correlation 1.00"),
        { t: "table", head: ["Technique", "Idea", "Good for"], rows: [["PCA", "Linear projection keeping variance", "Speed, compression, preprocessing"], ["Kernel PCA", "PCA in an implicit high-dimensional space", "Non-linear structure; preserve clusters"], ["LLE", "Keep each point's linear relation to its neighbours", "Unrolling twisted manifolds (small data)"], ["Isomap / t-SNE / UMAP", "Preserve geodesic distances / local neighbourhoods", "Visualisation"], ["Random projections", "Multiply by a random matrix", "Very high dimensions, fast and cheap"]] },
        { t: "p", text: "Because kernel PCA is unsupervised, there's no obvious score to tune it with; the trick is to tune it by the performance of a downstream classifier. LLE follows the roll's surface far better than PCA, which squashes the layers together." },
        { t: "analogy", text: "A rolled-up newspaper photographed from above shows overlapping layers (PCA). Kernel PCA and LLE are like unrolling the newspaper before photographing it, so neighbouring words stay neighbours." },
        { t: "trap", text: "Kernel PCA and LLE scale poorly to large datasets and are sensitive to their hyperparameters (gamma, n_neighbors). Use them mainly for exploration or as a tuned preprocessing step, and always validate on held-out data." },
        { t: "trick", text: "**Curved data → kernel PCA (tune via a downstream pipeline) or LLE. Linear data → PCA.**" },
        { t: "exam", items: ["What is a manifold?", "What is kernel PCA?", "How do you tune an unsupervised method like kernel PCA?", "How does LLE work?", "When would dimensionality reduction hurt performance?"] },
        { t: "recap", items: ["Manifolds: low-dimensional surfaces in high-dimensional space", "Kernel PCA = non-linear PCA via kernels", "Tune it by a downstream model's score", "LLE preserves local neighbourhoods", "Validate; these methods don't scale to huge data"] },
      ],
      quiz: [
        { q: "Kernel PCA performs…", options: ["Non-linear projections via the kernel trick", "Only linear projections", "Clustering", "Classification"], answer: 0, explain: "Like SVM kernels." },
        { q: "How can you tune kernel PCA's gamma?", options: ["By grid-searching a pipeline with a downstream classifier", "By its own accuracy score", "It can't be tuned", "With the test set"], answer: 0, explain: "It's unsupervised itself." },
        { q: "LLE preserves…", options: ["Each point's relationship to its nearest neighbours", "Global variance", "Class labels", "Feature scales"], answer: 0, explain: "Locally linear relations." },
        { q: "Which squashes a Swiss roll's layers together?", options: ["Plain PCA", "LLE", "Isomap", "Kernel PCA with a good kernel"], answer: 0, explain: "A linear projection can't unroll it." },
      ],
    },
  ],
};
