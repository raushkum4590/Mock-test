import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Python Data Science Handbook course: the "In Depth" algorithm chapters, done with scikit-learn. */
export const PDSH_IN_DEPTH: LearnModule = {
  id: "algorithms-in-depth",
  title: "Algorithms in depth",
  titleHi: "एल्गोरिदम गहराई से",
  blurb: "How the core algorithms behave in practice with scikit-learn: naive Bayes for numbers and text, linear regression with basis functions and regularisation, decision trees and random forests, PCA for visualisation and noise filtering, k-means and its limits, and a complete image-recognition pipeline.",
  lessons: [
    {
      id: "naive-bayes-depth",
      title: "Naive Bayes classification: Gaussian and multinomial",
      oneLine: "Gaussian naive Bayes assumes each feature follows a bell curve within each class; multinomial naive Bayes models word counts in text. Both train almost instantly, need little data and make a strong first baseline, especially for text.",
      minutes: 18,
      blocks: [
        py("Gaussian naive Bayes on measurements", src`
from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.naive_bayes import GaussianNB

X, y = load_iris(return_X_y=True)
model = GaussianNB()
print("5-fold accuracy:", round(cross_val_score(model, X, y, cv=5).mean(), 3))

model.fit(X, y)
print("class means of petal length:", model.theta_[:, 2].round(2).tolist())   # one bell curve per class
print("P(class) for one flower:", model.predict_proba([[6.0, 2.9, 4.5, 1.5]]).round(3).tolist())
`, "5-fold accuracy: 0.953\nclass means of petal length: [1.46, 4.26, 5.55]\nP(class) for one flower: [[0.0, 0.986, 0.014]]"),
        py("Multinomial naive Bayes for text", src`
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

train_text = ["the batsman hit a century", "bowler took five wickets", "match won by six runs",
              "new phone launched with better camera", "laptop battery lasts all day",
              "app update fixes the bug", "rupee falls against dollar", "stock market hits record high",
              "bank raises interest rate"]
train_labels = ["sports"] * 3 + ["tech"] * 3 + ["business"] * 3

model = make_pipeline(TfidfVectorizer(), MultinomialNB()).fit(train_text, train_labels)
for headline in ["camera app gets update", "wickets fall as match ends", "interest rate and market news"]:
    print(f"{headline!r:<34} → {model.predict([headline])[0]}")
`, "'camera app gets update'           → tech\n'wickets fall as match ends'       → sports\n'interest rate and market news'    → business"),
        { t: "table", head: ["Variant", "Features", "Typical use"], rows: [["`GaussianNB`", "Continuous numbers", "Measurements, quick baselines"], ["`MultinomialNB`", "Counts / TF-IDF", "Text classification"], ["`BernoulliNB`", "Yes/no features", "Word present or absent"], ["`ComplementNB`", "Counts, imbalanced classes", "Text with uneven class sizes"]] },
        { t: "analogy", text: "Gaussian naive Bayes is a tailor who knows the typical measurements of each size (S, M, L) and assigns you the size whose \"typical body\" you're closest to, checking each measurement separately." },
        { t: "trap", text: "Naive Bayes assumes features are independent within each class, which is rarely true, so its probabilities are often too extreme. Use it as a fast baseline and for text; for accurate probabilities, prefer logistic regression or calibrate the model." },
        { t: "trick", text: "**Numbers → GaussianNB. Text → TF-IDF + MultinomialNB. Always a quick first baseline.**" },
        { t: "exam", items: ["When would you use Gaussian vs multinomial naive Bayes?", "Why is naive Bayes fast?", "Why are its probabilities poorly calibrated?", "Where does naive Bayes work well?"] },
        { t: "recap", items: ["GaussianNB: one bell curve per feature per class", "MultinomialNB: word counts / TF-IDF", "Trains instantly, works with little data", "Great baseline, especially for text", "Probabilities are rough"] },
      ],
      quiz: [
        { q: "Which naive Bayes suits word counts?", options: ["MultinomialNB", "GaussianNB", "Linear regression", "KMeans"], answer: 0, explain: "It models counts." },
        { q: "GaussianNB assumes each feature within a class is…", options: ["Normally distributed", "Uniform", "Binary", "Sorted"], answer: 0, explain: "A bell curve per class." },
        { q: "A big strength of naive Bayes is…", options: ["Very fast training on little data", "Perfect probabilities", "Handling images best", "No assumptions"], answer: 0, explain: "It's often the first baseline." },
        { q: "Naive Bayes probabilities tend to be…", options: ["Too extreme (overconfident)", "Perfectly calibrated", "Always 0.5", "Negative"], answer: 0, explain: "Because of the independence assumption." },
      ],
    },
    {
      id: "linear-regression-depth",
      title: "Linear regression in depth: basis functions and regularisation",
      oneLine: "A linear model can fit curves if you feed it transformed inputs (basis functions: polynomials, splines, Gaussian bumps). Many basis functions overfit, so add regularisation: ridge shrinks all coefficients, lasso sets many exactly to zero.",
      minutes: 20,
      blocks: [
        py("Basis functions and regularisation", src`
import numpy as np
from sklearn.linear_model import Lasso, LinearRegression, Ridge
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import SplineTransformer

rng = np.random.default_rng(1)
x = np.sort(rng.uniform(0, 10, 50)).reshape(-1, 1)
y = np.sin(x).ravel() + 0.1 * x.ravel() + rng.normal(0, 0.2, 50)      # a wavy trend

def cv_r2(model):
    folds = KFold(5, shuffle=True, random_state=0)       # x is sorted, so shuffle the folds
    return cross_val_score(model, x, y, cv=folds, scoring="r2").mean()

print("straight line:", round(cv_r2(LinearRegression()), 3))
for name, reg in [("plain", LinearRegression()), ("ridge", Ridge(alpha=1.0)), ("lasso", Lasso(alpha=0.01, max_iter=50_000))]:
    model = make_pipeline(SplineTransformer(n_knots=30, degree=3), reg)    # 32 basis functions
    model.fit(x, y)
    coefs = model[-1].coef_
    print(f"30 knots + {name:<5}: CV R² {cv_r2(model):7.3f}   largest |coef| {np.abs(coefs).max():8.1f}   "
          f"zero coefs {int(np.sum(np.abs(coefs) < 1e-6))}")
`, "straight line: 0.048\n30 knots + plain: CV R² -5054408.593   largest |coef|      5.2   zero coefs 0\n30 knots + ridge: CV R²   0.743   largest |coef|      0.9   zero coefs 0\n30 knots + lasso: CV R²   0.737   largest |coef|      1.4   zero coefs 20"),
        { t: "p", text: "A straight line can't follow the waves (R² near 0). Thirty spline basis functions can, but without regularisation the fit chases the noise: where a fold leaves a gap between training points, the curve swings to absurd values, so its cross-validated R² is hugely negative (far worse than predicting the mean). Ridge keeps the coefficients small and lasso switches 20 of the 32 basis functions off entirely; both follow the real waves (R² ≈ 0.74)." },
        { t: "table", head: ["Tool", "Effect"], rows: [["`PolynomialFeatures(d)`", "x, x², …, x^d (can explode at the edges)"], ["`SplineTransformer(n_knots)`", "Smooth local pieces: well-behaved curves"], ["`Ridge(alpha)`", "Penalty α·Σβ²: shrinks every coefficient"], ["`Lasso(alpha)`", "Penalty α·Σ|β|: many coefficients become exactly 0"], ["`RidgeCV` / `LassoCV`", "Choose alpha by cross-validation automatically"]] },
        { t: "analogy", text: "Basis functions are a flexible ruler made of many joints: more joints let it follow any curve, but also every bump of noise. Regularisation is stiffness in the joints: enough to follow the real shape, not enough to trace every speck." },
        { t: "trap", text: "Scale features before ridge or lasso (the penalty treats all coefficients the same). When rows are sorted (like x here), use shuffled folds: plain `cv=5` would make every fold predict outside the range it was trained on. Don't judge basis-function models by training R²: more basis functions always look better on training data. Use cross-validation and RidgeCV/LassoCV to pick alpha." },
        { t: "trick", text: "**Linear model + basis functions = curves. Many basis functions → add ridge/lasso. Tune alpha by CV.**" },
        { t: "exam", items: ["How can linear regression model non-linear relationships?", "What are basis functions?", "Ridge vs lasso?", "How do you choose the regularisation strength?"] },
        { t: "recap", items: ["Transform inputs (polynomials, splines) to fit curves", "Too many basis functions overfit", "Ridge shrinks coefficients; lasso zeros many", "Pick alpha with cross-validation", "Scale features first"] },
      ],
      quiz: [
        { q: "A linear model with x² and x³ features can fit…", options: ["Curved relationships", "Only straight lines", "Only categories", "Nothing new"], answer: 0, explain: "It's still linear in the coefficients." },
        { q: "Which regularisation can set coefficients exactly to zero?", options: ["Lasso", "Ridge", "Plain least squares", "Splines"], answer: 0, explain: "The L1 penalty." },
        { q: "Large coefficients with many basis functions usually signal…", options: ["Overfitting", "A perfect model", "Underfitting", "Missing values"], answer: 0, explain: "Add regularisation." },
        { q: "RidgeCV chooses…", options: ["alpha by cross-validation", "The number of rows", "The test set", "The kernel"], answer: 0, explain: "Saves manual tuning." },
      ],
    },
    {
      id: "trees-forests-depth",
      title: "Decision trees and random forests in depth",
      oneLine: "A deep decision tree carves the space into tiny boxes and overfits; a random forest averages many randomised trees and generalises far better. Forests also do regression and give feature importances, with almost no preprocessing.",
      minutes: 20,
      blocks: [
        py("Overfitting trees vs a forest", src`
import numpy as np
from sklearn.datasets import load_digits, make_moons
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=500, noise=0.3, random_state=0)
for name, model in [("tree depth 2", DecisionTreeClassifier(max_depth=2, random_state=0)),
                    ("tree, unlimited", DecisionTreeClassifier(random_state=0)),
                    ("random forest", RandomForestClassifier(n_estimators=300, min_samples_leaf=3, random_state=0))]:
    train = model.fit(X, y).score(X, y)
    cv = cross_val_score(model, X, y, cv=5).mean()
    print(f"{name:<16} train {train:.3f}   CV {cv:.3f}")

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 300).reshape(-1, 1)
target = np.sin(x).ravel() + rng.normal(0, 0.3, 300)
reg = RandomForestRegressor(200, min_samples_leaf=5, random_state=0)
print("forest regression CV R²:", round(cross_val_score(reg, x, target, cv=5, scoring="r2").mean(), 3))

digits = load_digits()
forest = RandomForestClassifier(300, random_state=0).fit(digits.data, digits.target)
top = np.argsort(forest.feature_importances_)[::-1][:5]
print("most useful pixels (row, col):", [(int(p // 8), int(p % 8)) for p in top])
`, "tree depth 2     train 0.896   CV 0.886\ntree, unlimited  train 1.000   CV 0.850\nrandom forest    train 0.956   CV 0.878\nforest regression CV R²: 0.809\nmost useful pixels (row, col): [(2, 5), (5, 3), (3, 2), (4, 4), (5, 2)]"),
        { t: "p", text: "The unlimited tree is perfect on training data but worse on new data; the forest keeps most of the tree's flexibility while averaging away its noise. On digits, the most useful pixels sit in the middle of the image, where digits differ most, and the empty border pixels are useless." },
        { t: "table", head: ["Hyperparameter", "Effect"], rows: [["`max_depth`, `min_samples_leaf`", "Limit how finely trees split (main overfitting control)"], ["`n_estimators`", "More trees: more stable, slower; never hurts accuracy"], ["`max_features`", "Features tried per split: lower = more diverse trees"], ["`class_weight=\"balanced\"`", "For rare classes"]] },
        { t: "analogy", text: "One deep tree is a student who memorised every past paper's quirks. A forest is a study group of hundreds of students, each having seen different papers: individually quirky, together reliable." },
        { t: "trap", text: "Forest predictions for regression are averages of training values, so they can't predict outside the range seen in training (no extrapolation). Impurity-based feature importances favour features with many distinct values; check with permutation importance before drawing conclusions." },
        { t: "trick", text: "**One tree to explain, a forest to predict. Limit leaves, add trees, check permutation importance.**" },
        { t: "exam", items: ["Why do single decision trees overfit?", "How does a random forest reduce overfitting?", "Can random forests extrapolate?", "What do feature_importances_ measure and what are their pitfalls?"] },
        { t: "recap", items: ["Deep trees overfit; limit depth or leaf size", "Random forests average many randomised trees", "Forests work for classification and regression", "Little preprocessing needed", "Use permutation importance for reliable explanations"] },
      ],
      quiz: [
        { q: "An unlimited-depth tree usually has…", options: ["Perfect training accuracy and worse CV accuracy", "Low training accuracy", "No variance", "Perfect CV accuracy"], answer: 0, explain: "It memorises." },
        { q: "Which most directly limits overfitting in a tree?", options: ["max_depth / min_samples_leaf", "n_jobs", "random_state", "verbose"], answer: 0, explain: "They stop very fine splits." },
        { q: "Random forest regression predicting a value larger than any training value is…", options: ["Impossible: it averages training values", "Common", "Required", "Only with scaling"], answer: 0, explain: "Forests don't extrapolate." },
        { q: "Adding more trees to a forest…", options: ["Makes it more stable (and slower)", "Causes overfitting", "Reduces accuracy", "Changes the data"], answer: 0, explain: "Accuracy plateaus." },
      ],
    },
    {
      id: "pca-depth",
      title: "PCA in depth: visualisation, choosing components and noise filtering",
      oneLine: "PCA projects data onto the directions of greatest variance. Use it to visualise high-dimensional data in 2-D, choose the number of components from the cumulative explained variance (say 90%), and filter noise by keeping only the strong components and reconstructing.",
      minutes: 20,
      blocks: [
        py("Digits: projection, components and denoising", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

digits = load_digits()
X = digits.data                                   # 64 pixel features per image

projected = PCA(n_components=2).fit_transform(X)   # 64-D → 2-D for a scatter plot
print("2-D shape:", projected.shape)
for d in [0, 1, 6]:
    print(f"digit {d}: average position {projected[digits.target == d].mean(axis=0).round(1).tolist()}")

pca = PCA().fit(X)
cumulative = np.cumsum(pca.explained_variance_ratio_)
for target in [0.5, 0.9, 0.99]:
    print(f"components needed for {target:.0%} of variance: {int(np.searchsorted(cumulative, target) + 1)}")

rng = np.random.default_rng(0)
noisy = X + rng.normal(0, 4, X.shape)              # add heavy noise to every pixel
denoiser = PCA(0.5).fit(noisy)                     # keep components explaining 50% of variance
cleaned = denoiser.inverse_transform(denoiser.transform(noisy))
print("kept components:", denoiser.n_components_)
print("error vs clean images — noisy:", round(float(np.abs(noisy - X).mean()), 2),
      " denoised:", round(float(np.abs(cleaned - X).mean()), 2))
`, "2-D shape: (1797, 2)\ndigit 0: average position [2.0, -21.1]\ndigit 1: average position [5.4, 12.7]\ndigit 6: average position [16.2, -11.6]\ncomponents needed for 50% of variance: 5\ncomponents needed for 90% of variance: 21\ncomponents needed for 99% of variance: 41\nkept components: 12\nerror vs clean images — noisy: 3.19  denoised: 1.89"),
        { t: "p", text: "Different digits land in different regions of the 2-D map, even though PCA never saw the labels. About half of the variance needs only a handful of components, while 99% needs most of them. Keeping only the strong components and reconstructing removes much of the random noise, because noise is spread thinly across all directions while the real signal concentrates in a few." },
        { t: "table", head: ["Use", "How"], rows: [["Visualise", "`PCA(2).fit_transform(X)` → scatter plot coloured by label"], ["Choose components", "Cumulative `explained_variance_ratio_`, or `PCA(0.90)` to keep 90%"], ["Compress", "Store the projected data; `inverse_transform` approximately restores it"], ["Denoise", "Fit with few components, transform, inverse_transform"], ["Speed up models", "PCA before a slow model (SVM, k-NN) inside a pipeline"]] },
        { t: "analogy", text: "PCA is describing faces with \"average face + a bit of this pattern + a bit of that pattern\". A few patterns capture most of what makes faces differ; the tiny leftover patterns are mostly noise, so dropping them cleans the picture." },
        { t: "trap", text: "PCA finds directions of high variance, which aren't always the directions that matter for your prediction. Scale features first when they have different units, and fit PCA on training data only inside a pipeline." },
        { t: "trick", text: "**PCA(2) to look, PCA(0.9) to compress, few components + inverse_transform to denoise.**" },
        { t: "exam", items: ["How do you choose the number of PCA components?", "How can PCA remove noise?", "What does inverse_transform do?", "When might PCA hurt a model?"] },
        { t: "recap", items: ["Project to 2-D for visualisation", "Cumulative explained variance chooses k", "PCA(0.9) keeps 90% automatically", "Few components + reconstruction = denoising", "Scale first; fit inside pipelines"] },
      ],
      quiz: [
        { q: "PCA(0.95) keeps…", options: ["As many components as needed for 95% of the variance", "95 components", "5% of the data", "The 95th percentile"], answer: 0, explain: "A float means a variance share." },
        { q: "Why does reconstructing from a few components remove noise?", options: ["Noise is spread across many weak directions", "PCA deletes outliers", "Noise is always in PC1", "It sorts the pixels"], answer: 0, explain: "Signal concentrates in strong components." },
        { q: "inverse_transform maps data…", options: ["From component space back to the original features", "To labels", "To 2-D only", "To a random space"], answer: 0, explain: "Approximately, if components were dropped." },
        { q: "PCA uses the labels y…", options: ["Never: it's unsupervised", "Always", "Only for digits", "Only with scaling"], answer: 0, explain: "It only looks at X." },
      ],
    },
    {
      id: "kmeans-depth",
      title: "k-means in depth: digits, its limits and colour compression",
      oneLine: "k-means can discover digit classes without labels, but it assumes round, similar-sized clusters, so it fails on shapes like moons, where spectral clustering succeeds. It can also compress an image by replacing millions of colours with a small palette.",
      minutes: 20,
      blocks: [
        py("Clusters vs labels, curved shapes and colour compression", src`
import numpy as np
from scipy.stats import mode
from sklearn.cluster import KMeans, SpectralClustering
from sklearn.datasets import load_digits, make_moons
from sklearn.metrics import accuracy_score, adjusted_rand_score

digits = load_digits()
clusters = KMeans(n_clusters=10, n_init=10, random_state=0).fit_predict(digits.data)
labels = np.zeros_like(clusters)
for c in range(10):                                  # name each cluster after its most common digit
    mask = clusters == c
    labels[mask] = mode(digits.target[mask], keepdims=False).mode
print("k-means on digits, no labels used:", round(accuracy_score(digits.target, labels), 3))

X, y = make_moons(n_samples=400, noise=0.05, random_state=0)
km = KMeans(2, n_init=10, random_state=0).fit_predict(X)
sc = SpectralClustering(2, affinity="nearest_neighbors", n_neighbors=10, random_state=0).fit_predict(X)
print("moons — k-means agreement:", round(adjusted_rand_score(y, km), 2),
      " spectral agreement:", round(adjusted_rand_score(y, sc), 2))

rng = np.random.default_rng(0)
image = np.clip(rng.normal([[[120, 160, 90]]], 40, size=(120, 160, 3)), 0, 255)   # a 160×120 "photo"
pixels = image.reshape(-1, 3)
palette = KMeans(8, n_init=4, random_state=0).fit(pixels)
compressed = palette.cluster_centers_[palette.labels_].reshape(image.shape)
print("colours before:", len(np.unique(pixels.round(), axis=0)), "after:", len(palette.cluster_centers_))
print("average colour error per channel:", round(float(np.abs(compressed - image).mean()), 1))
`, "k-means on digits, no labels used: 0.792\nmoons — k-means agreement: 0.27  spectral agreement: 1.0\ncolours before: 19126 after: 8\naverage colour error per channel: 18.8"),
        { t: "p", text: "Without any labels, k-means groups most digit images correctly. On the two interlocking moons it draws a straight split and gets them badly wrong, while spectral clustering, which follows chains of nearest neighbours, separates them almost perfectly. For images, 8 cluster centres become the palette: every pixel is replaced by its nearest palette colour." },
        { t: "table", head: ["Method", "Cluster shapes", "Needs k?"], rows: [["KMeans", "Round, similar size", "Yes"], ["GaussianMixture", "Ellipses, soft membership", "Yes (choose with BIC)"], ["SpectralClustering", "Any connected shape", "Yes"], ["DBSCAN", "Any shape, finds noise points", "No (needs a density radius)"], ["AgglomerativeClustering", "Depends on linkage", "Yes, or a distance cut-off"]] },
        { t: "analogy", text: "k-means is like drawing circles around groups of people in a park: perfect when people stand in round huddles, useless when they're queuing in two curved lines. Spectral clustering follows who is standing next to whom, so it traces each queue." },
        { t: "trap", text: "k-means always returns k clusters, even on data with no real groups. Check silhouette scores, try other methods for non-round shapes, and scale features first. Cluster numbers are arbitrary; map them to meanings yourself." },
        { t: "trick", text: "**Round blobs → k-means. Curved shapes → spectral or DBSCAN. Images → k-means palette.**" },
        { t: "exam", items: ["What shapes does k-means assume?", "How would you evaluate clusters when labels exist? (Adjusted Rand index, mapping to majority labels.)", "When would you use spectral clustering or DBSCAN?", "How does k-means compress an image?"] },
        { t: "recap", items: ["k-means finds round clusters", "Map clusters to labels with the majority vote when labels exist", "Spectral clustering / DBSCAN for curved shapes", "Adjusted Rand index compares clusterings", "k-means centres make an image palette"] },
      ],
      quiz: [
        { q: "k-means struggles most with…", options: ["Curved, interlocking clusters", "Round blobs", "Scaled data", "Small k"], answer: 0, explain: "It splits with straight boundaries." },
        { q: "Which method needs no k and marks noise points?", options: ["DBSCAN", "KMeans", "PCA", "GaussianNB"], answer: 0, explain: "It works from density." },
        { q: "To compress an image to 16 colours with k-means, you cluster…", options: ["The pixels' RGB values with k = 16", "The image rows", "The file size", "The pixel positions"], answer: 0, explain: "Centres become the palette." },
        { q: "An adjusted Rand index of 1.0 means…", options: ["Clusters match the labels perfectly", "Random clusters", "One cluster", "An error"], answer: 0, explain: "0 means chance level." },
      ],
    },
    {
      id: "image-pipeline",
      title: "Application: an image-recognition pipeline",
      oneLine: "Put everything together for images: turn pictures into features (pixels, or engineered features like HOG), reduce dimensions with PCA, classify with an SVM, and tune the whole pipeline with a grid search. This is the classic recipe behind early face detectors.",
      minutes: 22,
      blocks: [
        py("PCA + SVM, tuned end to end", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data, digits.target, test_size=0.25,
                                                    random_state=0, stratify=digits.target)
pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA(whiten=True, random_state=0)), ("svm", SVC())])
grid = GridSearchCV(pipe, {"pca__n_components": [20, 40], "svm__C": [1, 10], "svm__gamma": ["scale", 0.01]}, cv=5)
grid.fit(X_train, y_train)
print("best settings:", grid.best_params_)
print("best CV accuracy:", round(grid.best_score_, 3))

pred = grid.predict(X_test)
print(classification_report(y_test, pred, digits=3).splitlines()[-3])     # the accuracy line
cm = confusion_matrix(y_test, pred)
np.fill_diagonal(cm, 0)
worst = np.dstack(np.unravel_index(np.argsort(cm.ravel())[::-1][:3], cm.shape))[0]
print("most confused (true → predicted):", [(int(a), int(b), int(cm[a, b])) for a, b in worst if cm[a, b] > 0])
`, "best settings: {'pca__n_components': 20, 'svm__C': 10, 'svm__gamma': 0.01}\nbest CV accuracy: 0.98\n    accuracy                          0.971       450\nmost confused (true → predicted): [(8, 1, 2), (1, 8, 2), (9, 5, 1)]"),
        { t: "h", text: "How face detection works with this recipe" },
        { t: "points", items: ["**Training data:** thousands of small image patches labelled face / not face.", "**Features:** HOG (histogram of oriented gradients) summarises edge directions in each patch: robust to lighting changes (`skimage.feature.hog`).", "**Model:** a linear SVM learns face vs not-face from the HOG features.", "**Sliding window:** scan the new photo patch by patch, at several sizes, and keep high-scoring patches; merge overlapping detections.", "**Today:** deep CNNs (and pre-trained detectors) do this far better, but the pipeline idea (features → model → tuned with CV) is the same."] },
        { t: "analogy", text: "The pipeline is a factory line for pictures: wash (scale), compress (PCA), inspect (SVM), with the quality manager (grid search) adjusting each machine's settings until the line performs best on samples it hasn't seen." },
        { t: "trap", text: "Tune the PCA and the SVM together (their best settings depend on each other), and keep all steps inside one pipeline so cross-validation is honest. Reported accuracy must come from the untouched test set." },
        { t: "trick", text: "**Features → scale → PCA → SVM, tuned together with GridSearchCV (step__param names).**" },
        { t: "exam", items: ["Describe a classic image-classification pipeline.", "What does PCA whitening do?", "How do you name pipeline parameters in a grid search? (step__parameter.)", "What are HOG features?", "How does a sliding-window detector work?"] },
        { t: "recap", items: ["Images → features (pixels, HOG, CNN embeddings)", "Scale → PCA → classifier in one Pipeline", "GridSearchCV with step__param names", "Evaluate once on the test set", "Deep learning has replaced hand-made features for most image tasks"] },
      ],
      quiz: [
        { q: "In GridSearchCV over a pipeline, the SVM's C is written as…", options: ["svm__C", "C", "svm.C", "SVC_C"], answer: 0, explain: "step name + __ + parameter." },
        { q: "Why tune PCA components and SVM settings together?", options: ["The best choice of each depends on the other", "It's faster", "PCA has no settings", "SVMs don't need tuning"], answer: 0, explain: "They interact." },
        { q: "HOG features describe…", options: ["Edge directions in image regions", "Pixel colours only", "Image file size", "Text"], answer: 0, explain: "Used in classic face detectors." },
        { q: "A sliding-window detector…", options: ["Scores many patches of the image at several sizes", "Reads the whole image once as text", "Uses no model", "Only works on 8×8 images"], answer: 0, explain: "Then merges overlapping hits." },
      ],
    },
  ],
};
