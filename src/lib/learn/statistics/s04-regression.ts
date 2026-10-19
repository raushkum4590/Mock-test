import type { Block, LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** The practice dataset used by every regression lesson (shown in each lesson so each example runs on its own). */
const HOUSES: Block = py("houses.py", src`
"""houses.py: 200 practice flats, made with a fixed seed so they're the same every time."""
import numpy as np
import pandas as pd

def load_houses():
    rng = np.random.default_rng(42)
    n = 200
    area = rng.integers(500, 2500, n)                                  # sq ft
    bedrooms = np.clip(np.round(area / 600 + rng.normal(0, 0.7, n)), 1, 5).astype(int)
    age = rng.integers(0, 30, n)                                        # years old
    city = rng.choice(["Patna", "Pune", "Delhi"], n)
    premium = pd.Series(city).map({"Patna": 0, "Pune": 15, "Delhi": 30}).to_numpy()
    price = 10 + 0.05 * area + 2 * bedrooms - 0.6 * age + premium + rng.normal(0, 8, n)
    return pd.DataFrame({"area": area, "bedrooms": bedrooms, "age": age,
                         "city": city, "price": price.round(1)})         # price in ₹ lakh
`);

const HOUSES_NOTE: Block = { t: "note", kind: "info", title: "Practice data", text: "Save this as `houses.py` next to your script. In real projects you'd load a CSV with `pd.read_csv()`; here the data is generated so you get exactly the outputs shown." };

/** Statistics module 6: regression and prediction. */
export const ST06_REGRESSION: LearnModule = {
  id: "regression",
  title: "Regression and prediction",
  titleHi: "रिग्रेशन और प्रेडिक्शन",
  blurb: "Predict a number from other numbers: fit a line by least squares, add many predictors, judge models with RMSE, R² and cross-validation, handle categories and interactions, check diagnostics, and model curves.",
  lessons: [
    {
      id: "simple-linear",
      title: "Simple linear regression: fitting a line",
      oneLine: "Linear regression fits the straight line y = a + b·x that best predicts y from x. \"Best\" means least squares: the line that makes the sum of squared residuals (actual − predicted) as small as possible. The slope b says how much y changes for each one-unit increase in x.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: The words" },
        { t: "table", head: ["Term", "Meaning", "Flats example"], rows: [
          ["Response / target (y)", "What you predict", "Price"],
          ["Predictor / feature (x)", "What you predict from", "Area"],
          ["Intercept (a)", "Predicted y when x = 0", "Base price"],
          ["Slope / coefficient (b)", "Change in y per 1 unit of x", "Extra lakh per extra 100 sq ft"],
          ["Fitted value ŷ", "The line's prediction for a row", "Predicted price"],
          ["Residual", "Actual − fitted (the error)", "How far off the line a flat is"],
        ] },
        { t: "h", text: "Step 2: Least squares by hand" },
        { t: "p", text: "Five flats: area in **hundreds of sq ft** x = 5, 8, 10, 12, 15 and price (₹ lakh) y = 40, 55, 62, 70, 88. Means: x̄ = 10, ȳ = 63." },
        { t: "table", head: ["x", "y", "x − x̄", "y − ȳ", "(x − x̄)(y − ȳ)", "(x − x̄)²"], rows: [["5", "40", "−5", "−23", "115", "25"], ["8", "55", "−2", "−8", "16", "4"], ["10", "62", "0", "−1", "0", "0"], ["12", "70", "2", "7", "14", "4"], ["15", "88", "5", "25", "125", "25"], ["", "", "", "", "**270**", "**58**"]] },
        { t: "formula", items: [["Slope", "b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = 270 / 58 ≈ 4.655"], ["Intercept", "a = ȳ − b·x̄ = 63 − 4.655 × 10 ≈ 16.45"], ["The line", "price ≈ 16.45 + 4.655 × (area in 100 sq ft): each extra 100 sq ft adds about ₹4.66 lakh"]] },
        py("Least squares in NumPy", src`
import numpy as np

x = np.array([5, 8, 10, 12, 15])        # area in hundreds of sq ft
y = np.array([40, 55, 62, 70, 88])      # price in ₹ lakh
b = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean()) ** 2)
a = y.mean() - b * x.mean()
print(f"slope b = {b:.3f}, intercept a = {a:.2f}")

fitted = a + b * x
residuals = y - fitted
print("fitted:", fitted.round(1).tolist())
print("residuals:", residuals.round(1).tolist())
print("sum of squared residuals:", round(float(np.sum(residuals ** 2)), 2))
print("np.polyfit agrees:", np.round(np.polyfit(x, y, 1), 3).tolist())   # [slope, intercept]
`, "slope b = 4.655, intercept a = 16.45\nfitted: [39.7, 53.7, 63.0, 72.3, 86.3]\nresiduals: [0.3, 1.3, -1.0, -2.3, 1.7]\nsum of squared residuals: 11.1\nnp.polyfit agrees: [4.655, 16.448]"),
        { t: "h", text: "Step 3: With scikit-learn on 200 flats" },
        HOUSES,
        HOUSES_NOTE,
        py("Price from area", src`
import pandas as pd
from sklearn.linear_model import LinearRegression      # pip install scikit-learn
from houses import load_houses

df = load_houses()
print(df.head())

model = LinearRegression().fit(df[["area"]], df["price"])   # X must be 2-D: a DataFrame
print(f"price = {model.intercept_:.2f} + {model.coef_[0]:.4f} × area")
new_flat = pd.DataFrame({"area": [1200]})
print("Predicted price of a 1,200 sq ft flat:", round(float(model.predict(new_flat)[0]), 1), "lakh")
`, "   area  bedrooms  age   city  price\n0   678         1   13  Patna   43.4\n1  2047         3   14   Pune  133.6\n2  1809         3    4  Patna  107.0\n3  1377         3   12   Pune   90.4\n4  1366         2   18   Pune   90.1\nprice = 23.53 + 0.0474 × area\nPredicted price of a 1,200 sq ft flat: 80.4 lakh"),
        { t: "analogy", text: "Least squares is like stretching a straight wire through a scatter of nails so that the total \"pull\" from all the nails (squared distances) is as small as possible. Squaring makes big misses count much more than small ones." },
        { t: "trap", text: "Regression shows **association**, not causation: a slope doesn't prove that changing x will change y. Also don't **extrapolate** far outside the data: a line fitted on 500–2,500 sq ft flats says nothing reliable about a 20,000 sq ft villa." },
        { t: "trick", text: "**Slope = Σ(dx·dy) / Σ(dx²). Intercept = ȳ − slope·x̄. Residual = actual − predicted.**" },
        { t: "exam", items: ["What is linear regression? What does least squares minimise?", "How do you interpret the slope and the intercept?", "What is a residual?", "Regression vs correlation?", "What are the assumptions of linear regression? (Linearity, independent errors, constant variance, roughly normal errors for inference.)"] },
        { t: "recap", items: ["y = a + b·x; least squares minimises Σ residual²", "b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²; a = ȳ − b·x̄", "Slope = change in y per unit of x", "Residual = actual − fitted", "sklearn LinearRegression().fit(X, y); predict(new)"] },
      ],
      quiz: [
        { q: "price = 20 + 3 × area_hundreds. What's the predicted price for 10 (1,000 sq ft)?", options: ["50", "30", "23", "320"], answer: 0, explain: "20 + 3 × 10." },
        { q: "A residual is…", options: ["Actual − predicted", "Predicted − mean", "The slope", "x − x̄"], answer: 0, explain: "The prediction error for a row." },
        { q: "Least squares chooses the line that minimises…", options: ["The sum of squared residuals", "The number of points", "The slope", "The sum of x"], answer: 0, explain: "Ordinary least squares (OLS)." },
        { q: "Why is predicting a 20,000 sq ft villa from this model risky?", options: ["It's far outside the data used to fit it (extrapolation)", "Regression can't predict", "The slope is negative", "It isn't risky"], answer: 0, explain: "The relationship may not hold there." },
      ],
    },
    {
      id: "multiple-linear",
      title: "Multiple regression: many predictors, RMSE and R²",
      oneLine: "Multiple regression uses several predictors at once: price = b₀ + b₁·area + b₂·bedrooms + b₃·age. Each coefficient is the effect of that predictor holding the others constant. RMSE measures the typical error; R² the share of variation explained; t-statistics and p-values show which coefficients are reliable.",
      minutes: 20,
      blocks: [
        HOUSES,
        HOUSES_NOTE,
        py("Multiple regression with statsmodels", src`
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf        # pip install statsmodels
from houses import load_houses

df = load_houses()
model = smf.ols("price ~ area + bedrooms + age", data=df).fit()

table = pd.DataFrame({"coef": model.params, "std err": model.bse,
                      "t": model.tvalues, "p-value": model.pvalues})
print(table.round(4))
print("R-squared:", round(model.rsquared, 3), " adjusted:", round(model.rsquared_adj, 3))
print("RMSE:", round(float(np.sqrt(np.mean(model.resid ** 2))), 2), "lakh")
`, "              coef  std err        t  p-value\nIntercept  32.5781   3.4603   9.4147   0.0000\narea        0.0483   0.0030  16.1272   0.0000\nbedrooms    0.0064   1.4540   0.0044   0.9965\nage        -0.6851   0.1224  -5.5976   0.0000\nR-squared: 0.773  adjusted: 0.769\nRMSE: 14.45 lakh", "Look at **bedrooms**: p ≈ 1, as if bedrooms didn't matter. Its true effect in this data is +₹2 lakh, but area already carries most of the same information (bigger flats have more bedrooms) and the missing city variable adds a lot of noise. Once city is added (lesson 4), bedrooms comes out at about 2. Coefficients depend on which other predictors are in the model."),
        { t: "h", text: "Reading the output" },
        { t: "table", head: ["Column", "Meaning", "Rule of thumb"], rows: [
          ["coef", "Change in price (₹ lakh) for +1 unit of this predictor, others held constant", "age: negative = older flats are cheaper"],
          ["std err", "Uncertainty of the coefficient", "Smaller is more precise"],
          ["t", "coef / std err", "|t| above about 2 → probably a real effect"],
          ["p-value", "Chance of a coefficient this large if the true effect were 0", "< 0.05 → \"significant\""],
          ["R²", "Share of the variation in price that the model explains (0 to 1)", "Higher is better, but always rises when you add predictors"],
          ["Adjusted R²", "R² penalised for the number of predictors", "Use it to compare models of different sizes"],
          ["RMSE", "√(mean of squared residuals): typical prediction error in ₹ lakh", "Compare with the scale of prices"],
        ] },
        { t: "formula", items: [["RMSE", "√( Σ(y − ŷ)² / n )"], ["R²", "1 − Σ(y − ŷ)² / Σ(y − ȳ)²"]] },
        py("The same model in scikit-learn", src`
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from houses import load_houses

df = load_houses()
X, y = df[["area", "bedrooms", "age"]], df["price"]
model = LinearRegression().fit(X, y)
pred = model.predict(X)

print({col: round(float(c), 3) for col, c in zip(X.columns, model.coef_)})
print("RMSE:", round(mean_squared_error(y, pred) ** 0.5, 2))
print("R2:", round(r2_score(y, pred), 3))
`, "{'area': 0.048, 'bedrooms': 0.006, 'age': -0.685}\nRMSE: 14.45\nR2: 0.773"),
        { t: "p", text: "statsmodels is for **understanding** (standard errors, p-values, the formula interface). scikit-learn is for **predicting** (pipelines, cross-validation, many model types). Data scientists use both." },
        { t: "analogy", text: "\"Holding the others constant\" is like comparing two flats in the same building, same floor, same age, differing only in area. The area coefficient is the price difference you'd expect between those two." },
        { t: "trap", text: "This model leaves out **city**, which strongly affects price, so its RMSE is large and part of the city effect is lumped into the error. Leaving out important variables can also bias the other coefficients (omitted-variable bias). Also, a high R² doesn't mean the model is right: check the residuals." },
        { t: "trick", text: "**coef = effect holding others fixed; |t| > 2 ≈ significant; RMSE = typical error; R² = share explained.**" },
        { t: "exam", items: ["Interpret a coefficient in multiple regression.", "What are R² and adjusted R²?", "What is RMSE? RMSE vs MAE?", "What does a coefficient's p-value tell you?", "statsmodels vs scikit-learn?"] },
        { t: "recap", items: ["y = b₀ + b₁x₁ + b₂x₂ + … fitted by least squares", "Each coefficient: effect with other predictors held constant", "t = coef / SE; p-value tests coef = 0", "RMSE = typical error; R² = share of variance explained", "Adjusted R² compares models with different numbers of predictors"] },
      ],
      quiz: [
        { q: "Coefficient of age = −0.6 means…", options: ["Each extra year lowers the predicted price by ₹0.6 lakh, other things equal", "Older flats cost more", "Age explains 60%", "The model is wrong"], answer: 0, explain: "Holding area and bedrooms constant." },
        { q: "R² = 0.85 means…", options: ["The model explains 85% of the variation in y", "85% of predictions are exact", "The error is 15 lakh", "The slope is 0.85"], answer: 0, explain: "Share of variance explained." },
        { q: "Adding a useless predictor makes plain R²…", options: ["Go up (or stay the same)", "Go down", "Become 0", "Negative"], answer: 0, explain: "That's why adjusted R² exists." },
        { q: "A t-statistic of 0.4 for a coefficient suggests…", options: ["No clear evidence of an effect", "A strong effect", "An error in the data", "R² is 0.4"], answer: 0, explain: "|t| below about 2." },
      ],
    },
    {
      id: "model-selection",
      title: "Model selection, overfitting and cross-validation",
      oneLine: "A model that fits its training data perfectly can predict new data badly: that's overfitting. Always judge a model on data it hasn't seen, using a test set or k-fold cross-validation. Keep models as simple as the data allows (AIC, regularisation with Ridge and Lasso).",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Overfitting, seen with curves" },
        py("Training error vs test error", src`
import numpy as np
from numpy.polynomial import Polynomial

rng = np.random.default_rng(0)
x_train = np.sort(rng.uniform(0, 10, 20))
y_train = 3 + 2 * x_train + rng.normal(0, 3, 20)        # the truth is a straight line + noise
x_test = rng.uniform(0, 10, 200)
y_test = 3 + 2 * x_test + rng.normal(0, 3, 200)

for degree in [1, 3, 9, 15]:
    curve = Polynomial.fit(x_train, y_train, degree)
    train_rmse = np.sqrt(np.mean((curve(x_train) - y_train) ** 2))
    test_rmse = np.sqrt(np.mean((curve(x_test) - y_test) ** 2))
    print(f"degree {degree:>2}: train RMSE {train_rmse:6.2f}   test RMSE {test_rmse:8.2f}")
`, "degree  1: train RMSE   2.09   test RMSE     3.12\ndegree  3: train RMSE   1.74   test RMSE     3.48\ndegree  9: train RMSE   1.38   test RMSE     9.08\ndegree 15: train RMSE   0.57   test RMSE    93.47"),
        { t: "p", text: "As the curve gets more flexible, the **training** error keeps falling, but the **test** error explodes: the wiggly curve memorised the noise. The straight line, which matches the truth, does best on new data." },
        { t: "diagram", text: "error\n  │ ╲                         ╱ test error\n  │  ╲                     ╱\n  │   ╲_______________╱\n  │     ╲   sweet spot\n  │       ╲____________________ training error\n  └──────────────────────────────▶ model complexity\n  underfitting               overfitting" },
        { t: "h", text: "Step 2: Train/test split and k-fold cross-validation" },
        HOUSES,
        HOUSES_NOTE,
        py("Hold-out test set and 5-fold CV", src`
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from houses import load_houses

df = load_houses()
X = pd.get_dummies(df.drop(columns="price"), drop_first=True, dtype=int)   # city → 0/1 columns
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
model = LinearRegression().fit(X_train, y_train)
print("Train R2:", round(model.score(X_train, y_train), 3), " Test R2:", round(model.score(X_test, y_test), 3))

scores = cross_val_score(LinearRegression(), X, y, cv=5, scoring="neg_root_mean_squared_error")
print("5-fold RMSE per fold:", (-scores).round(2).tolist())
print("Mean CV RMSE:", round(float(-scores.mean()), 2))
`, "Train R2: 0.92  Test R2: 0.936\n5-fold RMSE per fold: [9.57, 7.4, 8.44, 8.5, 8.36]\nMean CV RMSE: 8.45"),
        { t: "diagram", text: "5-fold cross-validation (each row is one round):\n[ TEST ][ train ][ train ][ train ][ train ]\n[ train ][ TEST ][ train ][ train ][ train ]\n[ train ][ train ][ TEST ][ train ][ train ]\n[ train ][ train ][ train ][ TEST ][ train ]\n[ train ][ train ][ train ][ train ][ TEST ]\n→ every row is tested exactly once; average the 5 scores" },
        { t: "h", text: "Step 3: Choosing predictors: AIC and regularisation" },
        py("Comparing models with AIC", src`
import statsmodels.formula.api as smf
from houses import load_houses

df = load_houses()
for formula in ["price ~ area", "price ~ area + bedrooms + age", "price ~ area + bedrooms + age + C(city)"]:
    m = smf.ols(formula, data=df).fit()
    print(f"{formula:<42} AIC {m.aic:8.1f}   adj R2 {m.rsquared_adj:.3f}")
`, "price ~ area                               AIC   1669.9   adj R2 0.734\nprice ~ area + bedrooms + age              AIC   1643.8   adj R2 0.769\nprice ~ area + bedrooms + age + C(city)    AIC   1419.7   adj R2 0.925", "AIC rewards fit but charges a penalty for every extra coefficient. **Lower AIC is better.** Adding city lowers AIC a lot: it's worth its extra coefficients."),
        py("Lasso drops useless predictors", src`
import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
from houses import load_houses

df = load_houses()
rng = np.random.default_rng(1)
X = df[["area", "bedrooms", "age"]].copy()
for i in range(3):
    X[f"noise{i}"] = rng.normal(size=len(df))          # columns with NO real relationship

X_scaled = StandardScaler().fit_transform(X)          # Lasso needs features on one scale
lasso = Lasso(alpha=1.0).fit(X_scaled, df["price"])
for name, coef in zip(X.columns, lasso.coef_):
    print(f"{name:<9} {coef:7.2f}")
`, "area        25.39\nbedrooms     0.00\nage         -4.73\nnoise0       0.00\nnoise1       0.00\nnoise2      -0.70", "Two noise columns become exactly 0 and the third is tiny. bedrooms is dropped too: it overlaps with area, and Lasso tends to keep the strongest of a group of correlated predictors."),
        { t: "table", head: ["Method", "Idea"], rows: [["Train/test split", "Fit on one part, score on the unseen part"], ["k-fold cross-validation", "Rotate the test part k times; average the scores"], ["Stepwise selection", "Add/remove predictors one at a time by AIC (quick but can overfit)"], ["Ridge (L2)", "Shrinks all coefficients towards 0; good with correlated predictors"], ["Lasso (L1)", "Shrinks and sets some coefficients exactly to 0: automatic feature selection"]] },
        { t: "analogy", text: "A student who memorises last year's answer key scores 100% on that paper (training data) and fails the real exam (test data). Cross-validation is giving the student several mock papers they haven't seen. Regularisation is telling them: \"explain it simply; don't memorise\"." },
        { t: "trap", text: "Never tune or choose a model using the test set, then report that test score as your expected performance; the test set has leaked into your decisions. Use cross-validation on the training data for choices, and touch the test set once at the end. Also scale features before Ridge/Lasso." },
        { t: "trick", text: "**Judge on unseen data. Simpler wins ties. Low AIC, good CV score.**" },
        { t: "exam", items: ["What is overfitting? How do you detect and prevent it?", "What is cross-validation? Why use k-fold?", "Bias-variance trade-off?", "Ridge vs Lasso?", "What is AIC?", "What is data leakage?"] },
        { t: "recap", items: ["Training error always falls with complexity; test error doesn't", "Evaluate on a hold-out set or with k-fold CV", "AIC: lower is better, penalises extra coefficients", "Lasso can set useless coefficients to 0; Ridge shrinks them", "Never tune on the test set"] },
      ],
      quiz: [
        { q: "A model has train RMSE 1 and test RMSE 25. This is…", options: ["Overfitting", "Underfitting", "A perfect model", "Data leakage only"], answer: 0, explain: "It memorised the training data." },
        { q: "In 5-fold CV, each row is used for testing…", options: ["Exactly once", "5 times", "Never", "Twice"], answer: 0, explain: "And for training in the other 4 rounds." },
        { q: "Which regularisation can set coefficients exactly to 0?", options: ["Lasso", "Ridge", "OLS", "Cross-validation"], answer: 0, explain: "L1 penalty." },
        { q: "Comparing two models by AIC, you prefer the one with…", options: ["Lower AIC", "Higher AIC", "More predictors", "Higher plain R²"], answer: 0, explain: "AIC balances fit and simplicity." },
      ],
    },
    {
      id: "factors-interpretation",
      title: "Categories, interactions, multicollinearity and confounding",
      oneLine: "Regression needs numbers, so categories become 0/1 dummy columns (one-hot encoding, dropping one as the baseline). Interactions let one variable's effect depend on another. Correlated predictors (multicollinearity) make coefficients unstable, and missing confounders make them misleading.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Dummy variables" },
        { t: "table", head: ["city", "city_Pune", "city_Delhi"], rows: [["Patna", "0", "0"], ["Pune", "1", "0"], ["Delhi", "0", "1"]], caption: "Patna is the baseline (reference): its effect is in the intercept. 3 categories → 2 dummy columns." },
        HOUSES,
        HOUSES_NOTE,
        py("City as a predictor", src`
import statsmodels.formula.api as smf
from houses import load_houses

df = load_houses()
model = smf.ols("price ~ area + bedrooms + age + C(city, Treatment('Patna'))", data=df).fit()
params = model.params.rename(lambda s: s.replace("C(city, Treatment('Patna'))", "city"))
print(params.round(2))
print("R-squared:", round(model.rsquared, 3))
`, "Intercept        13.40\ncity[T.Delhi]    30.26\ncity[T.Pune]     15.08\narea              0.05\nbedrooms          1.98\nage              -0.63\ndtype: float64\nR-squared: 0.927"),
        { t: "p", text: "Read the city coefficients against the **baseline (Patna)**: a flat in Pune costs about ₹15 lakh more, and one in Delhi about ₹30 lakh more, than an otherwise identical flat in Patna. These are exactly the premiums built into the practice data, and R² jumps once city is included." },
        { t: "h", text: "Step 2: Interactions" },
        { t: "p", text: "An **interaction** lets the effect of one predictor depend on another: maybe each extra sq ft is worth more in Delhi than in Patna. In a formula, `area * city` adds area, city and their interaction `area:city`." },
        py("Does area matter more in some cities?", src`
import statsmodels.formula.api as smf
from houses import load_houses

df = load_houses()
model = smf.ols("price ~ area * C(city, Treatment('Patna')) + bedrooms + age", data=df).fit()
inter = model.pvalues[[n for n in model.pvalues.index if ":" in n]]
print(inter.rename(lambda s: s.replace("C(city, Treatment('Patna'))", "city")).round(3))
`, "area:city[T.Delhi]    0.094\narea:city[T.Pune]     0.361\ndtype: float64", "Large p-values: no evidence that area is valued differently by city in this data, so the simpler model without interactions is enough."),
        { t: "h", text: "Step 3: Multicollinearity" },
        py("Variance inflation factors", src`
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from houses import load_houses

df = load_houses()
X = df[["area", "bedrooms", "age"]].copy()
X["area_sqm"] = X["area"] * 0.0929 + 1       # almost the same information as area
X = sm.add_constant(X)
vif = pd.Series([variance_inflation_factor(X.values, i) for i in range(1, X.shape[1])],
                index=X.columns[1:])
print(vif.round(1))
`, "area        1.000800e+15\nbedrooms    2.500000e+00\nage         1.000000e+00\narea_sqm    1.000800e+15\ndtype: float64", "VIF above about 5–10 signals a problem. area and area_sqm carry the same information, so their VIFs are enormous (in fact infinite here: one is an exact function of the other). Drop one of them. bedrooms is also fairly correlated with area."),
        { t: "h", text: "Step 4: Confounding" },
        py("A confounder changes the story", src`
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

rng = np.random.default_rng(3)
n = 500
income = rng.normal(50, 15, n)                              # family income (₹ thousand/month)
coaching = 2 + 0.1 * income + rng.normal(0, 2, n)          # richer families buy more coaching
marks = 30 + 0.6 * income + 0.5 * coaching + rng.normal(0, 5, n)
df = pd.DataFrame({"income": income, "coaching": coaching, "marks": marks})

naive = smf.ols("marks ~ coaching", data=df).fit()
adjusted = smf.ols("marks ~ coaching + income", data=df).fit()
print("Coaching effect, ignoring income:", round(naive.params["coaching"], 2))
print("Coaching effect, adjusting for income:", round(adjusted.params["coaching"], 2))
`, "Coaching effect, ignoring income: 2.56\nCoaching effect, adjusting for income: 0.44", "The true effect of one hour of coaching is 0.5 marks. Ignoring income makes coaching look several times more powerful, because income drives both coaching and marks."),
        { t: "analogy", text: "Dummy variables are tick-boxes on a form: \"Pune? ☐ Delhi? ☐\". Leaving both empty means Patna. Multicollinearity is two witnesses who always say the same thing: you can't tell which one is really informative. A confounder is the hidden boss giving instructions to both." },
        { t: "trap", text: "**Dummy variable trap:** including a 0/1 column for every category together with an intercept makes the columns perfectly collinear. Drop one (`drop_first=True`) or let the formula do it. Also, coefficients describe the data you have; they become causal claims only with a randomised experiment or careful control of confounders." },
        { t: "trick", text: "**k categories → k − 1 dummies. Interaction = \"depends on\". High VIF → drop or combine. Check for confounders.**" },
        { t: "exam", items: ["How do you include categorical variables in regression? What is one-hot encoding?", "What is the dummy variable trap?", "What is an interaction term?", "What is multicollinearity? How do you detect it (VIF)?", "What is a confounding variable? Example.", "Ordinal variables: one-hot or numeric codes?"] },
        { t: "recap", items: ["Categories → k − 1 dummy columns; the dropped one is the baseline", "Coefficients of dummies = difference from the baseline", "Interactions (a * b) let effects depend on each other", "VIF > 5–10 → multicollinearity", "Omitted confounders bias coefficients"] },
      ],
      quiz: [
        { q: "A category with 4 levels needs how many dummy columns (with an intercept)?", options: ["3", "4", "1", "8"], answer: 0, explain: "k − 1; one level is the baseline." },
        { q: "The coefficient for city_Delhi (baseline Patna) is +30. Meaning?", options: ["Delhi flats cost ₹30 lakh more than similar Patna flats", "Delhi has 30 flats", "Delhi flats are 30% cheaper", "30 sq ft more"], answer: 0, explain: "Relative to the baseline, other things equal." },
        { q: "A VIF of 40 indicates…", options: ["Strong multicollinearity", "A great predictor", "No problem", "Overfitting only"], answer: 0, explain: "Above 5–10 is a warning sign." },
        { q: "Income affects both coaching hours and marks. Income is a…", options: ["Confounder", "Dummy variable", "Residual", "Interaction"], answer: 0, explain: "It distorts the coaching–marks relationship." },
      ],
    },
    {
      id: "diagnostics-nonlinear",
      title: "Diagnostics, prediction intervals and curves",
      oneLine: "After fitting, check the residuals: look for outliers, influential points (Cook's distance) and non-constant spread (heteroskedasticity). Give predictions with a prediction interval, not one number. When the relationship curves, use polynomial terms or splines.",
      minutes: 22,
      blocks: [
        HOUSES,
        HOUSES_NOTE,
        { t: "h", text: "Step 1: Residual diagnostics" },
        py("Outliers, influence and constant variance", src`
import numpy as np
import statsmodels.formula.api as smf
from statsmodels.stats.diagnostic import het_breuschpagan
from houses import load_houses

df = load_houses()
model = smf.ols("price ~ area + bedrooms + age + C(city)", data=df).fit()
influence = model.get_influence()
std_resid = influence.resid_studentized_internal          # residuals in SD units
cooks = influence.cooks_distance[0]

print("Rows with |standardised residual| > 2.5:", int(np.sum(np.abs(std_resid) > 2.5)))
print("Most influential row:", int(np.argmax(cooks)), " Cook's D:", round(float(cooks.max()), 3))
print("Breusch-Pagan p-value:", round(float(het_breuschpagan(model.resid, model.model.exog)[1]), 3))
`, "Rows with |standardised residual| > 2.5: 1\nMost influential row: 180  Cook's D: 0.053\nBreusch-Pagan p-value: 0.606"),
        { t: "table", head: ["Check", "Looks for", "Warning sign"], rows: [
          ["Residuals vs fitted plot", "Patterns, curves", "A U-shape → missing curve; a funnel → heteroskedasticity"],
          ["Standardised residuals", "Outliers", "|value| > 2.5 or 3"],
          ["Cook's distance", "Influential points that move the line a lot", "Much larger than the others (or > 4/n)"],
          ["Breusch-Pagan test", "Non-constant variance (heteroskedasticity)", "p < 0.05"],
          ["QQ plot of residuals", "Normal errors (for p-values/intervals)", "Ends bending away from the line"],
        ] },
        { t: "h", text: "Step 2: Confidence interval vs prediction interval" },
        py("Predicting one new flat", src`
import pandas as pd
import statsmodels.formula.api as smf
from houses import load_houses

df = load_houses()
model = smf.ols("price ~ area + bedrooms + age + C(city)", data=df).fit()
new = pd.DataFrame({"area": [1200], "bedrooms": [2], "age": [5], "city": ["Pune"]})
frame = model.get_prediction(new).summary_frame(alpha=0.05)
print(frame[["mean", "mean_ci_lower", "mean_ci_upper", "obs_ci_lower", "obs_ci_upper"]].round(1))
`, "   mean  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper\n0  86.4           83.9           88.9          69.9         103.0"),
        { t: "table", head: ["Interval", "Answers", "Width"], rows: [["Confidence interval (mean_ci)", "\"What's the AVERAGE price of all such flats?\"", "Narrow"], ["Prediction interval (obs_ci)", "\"What will THIS flat sell for?\"", "Wide: it includes each flat's own randomness"]] },
        { t: "h", text: "Step 3: When the relationship curves" },
        py("Polynomial and spline regression", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, SplineTransformer

rng = np.random.default_rng(9)
experience = np.sort(rng.uniform(0, 30, 150)).reshape(-1, 1)            # years
salary = 3 + 2.2 * experience[:, 0] - 0.05 * experience[:, 0] ** 2 + rng.normal(0, 2, 150)   # rises, then flattens

models = {
    "straight line": LinearRegression(),
    "quadratic": make_pipeline(PolynomialFeatures(2), LinearRegression()),
    "spline": make_pipeline(SplineTransformer(n_knots=5), LinearRegression()),
}
for name, m in models.items():
    m.fit(experience, salary)
    print(f"{name:<14} R2 = {m.score(experience, salary):.3f}   at 25 years: {m.predict([[25]])[0]:.1f} lakh/yr")
`, "straight line  R2 = 0.717   at 25 years: 28.3 lakh/yr\nquadratic      R2 = 0.923   at 25 years: 26.7 lakh/yr\nspline         R2 = 0.924   at 25 years: 26.6 lakh/yr"),
        { t: "p", text: "Salary rises quickly early in a career and then flattens. A straight line misses the bend; a **quadratic** term (experience²) or a **spline** (smooth pieces joined at knots) follows it. Generalised additive models (GAMs) automate this kind of smooth curve for each predictor." },
        { t: "analogy", text: "Residuals are the model's report card. A random scatter means \"good job\"; a pattern means the model is systematically missing something, like a tailor whose suits are always tight at the shoulders: the cut (model form) needs changing, not just the size." },
        { t: "trap", text: "Don't just delete outliers to improve the fit: first find out why they're unusual (a data-entry error? a genuinely different kind of flat?). And a prediction interval assumes future data looks like the training data; it can't protect you from a market crash." },
        { t: "trick", text: "**Plot residuals. One flat → prediction interval (wide). Average → confidence interval (narrow). Curves → polynomial or spline.**" },
        { t: "exam", items: ["How do you check whether a regression model is good? (Residual plots, diagnostics, CV.)", "What is heteroskedasticity? How do you detect and fix it?", "What is an influential point? Cook's distance?", "Prediction interval vs confidence interval?", "How do you model a non-linear relationship with linear regression?"] },
        { t: "recap", items: ["Plot and test residuals after every fit", "Standardised residuals → outliers; Cook's distance → influence", "Breusch-Pagan → non-constant variance", "Prediction intervals are wider than confidence intervals", "Polynomials and splines capture curves"] },
      ],
      quiz: [
        { q: "A funnel shape in a residuals vs fitted plot suggests…", options: ["Heteroskedasticity", "Perfect fit", "Multicollinearity", "Too few predictors only"], answer: 0, explain: "The spread grows with the fitted value." },
        { q: "Which interval is wider?", options: ["Prediction interval for one new flat", "Confidence interval for the mean", "They're equal", "It depends on R² only"], answer: 0, explain: "It includes the individual flat's randomness." },
        { q: "Cook's distance measures…", options: ["How much one point influences the fitted model", "Distance between cities", "The residual's sign", "The RMSE"], answer: 0, explain: "Large values = influential points." },
        { q: "To fit a curve with linear regression you can add…", options: ["Polynomial terms or splines", "More rows only", "A larger intercept", "Nothing: it's impossible"], answer: 0, explain: "The model stays linear in its coefficients." },
      ],
    },
  ],
};
