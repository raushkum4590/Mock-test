import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science toolkit, part 4: deep learning in practice, then a capstone project and sharing your work. */
export const DS22_DEEP_LEARNING: LearnModule = {
  id: "deep-learning",
  title: "Deep learning in practice",
  titleHi: "डीप लर्निंग व्यवहार में",
  blurb: "Train a real neural network on handwritten digits, then learn how PyTorch training loops work, which network types suit images, sequences and text, and how transfer learning, transformers and LLMs fit in.",
  lessons: [
    {
      id: "mlp-digits",
      title: "A neural network that reads handwritten digits",
      oneLine: "scikit-learn's MLPClassifier is a ready-made feed-forward neural network (the kind you built by hand in the Neural networks module). Trained on 8×8 images of handwritten digits, it learns to recognise them with high accuracy. Scale inputs, use early stopping, and check which digits it confuses.",
      minutes: 22,
      blocks: [
        py("Recognising digits 0–9", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

digits = load_digits()                              # 1,797 images of 8×8 pixels (64 numbers each)
X, y = digits.data, digits.target
print(X.shape, "pixel values from", X.min(), "to", X.max())
print("\n".join("".join("#" if p > 8 else "." for p in row) for row in digits.images[0].astype(int)))
print("label of that image:", y[0])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
baseline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_train, y_train)
net = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(64, 32), early_stopping=True,
                                  max_iter=500, random_state=0)).fit(X_train, y_train)
for name, model in [("logistic regression", baseline), ("neural network (64, 32)", net)]:
    print(f"{name:<24} test accuracy {accuracy_score(y_test, model.predict(X_test)):.3f}")

cm = confusion_matrix(y_test, net.predict(X_test))
np.fill_diagonal(cm, 0)                              # keep only the mistakes
true, pred = np.unravel_index(cm.argmax(), cm.shape)
print(f"most common mistake: {true} read as {pred} ({cm.max()} times)")
`, "(1797, 64) pixel values from 0.0 to 16.0\n...##...\n..####..\n..#..#..\n..#.....\n.....#..\n..#..#..\n..#.##..\n...##...\nlabel of that image: 0\nlogistic regression      test accuracy 0.969\nneural network (64, 32)  test accuracy 0.956\nmost common mistake: 8 read as 1 (3 times)"),
        { t: "table", head: ["Setting", "Meaning", "Tip"], rows: [["`hidden_layer_sizes=(64, 32)`", "Two hidden layers with 64 and 32 neurons", "Start small; add layers or neurons if it underfits"], ["`activation`", "Non-linearity: \"relu\" (default), \"tanh\", \"logistic\"", "ReLU trains fastest in practice"], ["`alpha`", "L2 regularisation strength", "Raise it if the network overfits"], ["`early_stopping=True`", "Stops when the validation score stops improving", "Prevents overfitting and saves time"], ["`learning_rate_init`", "Step size of the optimiser (Adam)", "Lower it if training is unstable"]] },
        { t: "p", text: "An 8×8 image is just 64 numbers, so any model can use it. For real photos (thousands of pixels with spatial patterns), **convolutional neural networks (CNNs)** in PyTorch or TensorFlow work far better; that's the next lesson." },
        { t: "analogy", text: "The first hidden layer learns simple strokes (a curve here, a line there); the next layer combines strokes into shapes (a loop on top = maybe 9); the output layer votes on the digit. Each layer builds on the previous one." },
        { t: "trap", text: "Neural networks need **scaled inputs**, and they overfit easily on small data: compare against a simple baseline (here logistic regression even beat the network, 0.969 vs 0.956, because 8×8 digits are simple enough) and use early stopping or regularisation. They're also slower and harder to explain, so use them when they clearly win." },
        { t: "trick", text: "**Scale → MLP with early stopping → compare with a simple baseline → inspect the confusion matrix.**" },
        { t: "exam", items: ["What is a multilayer perceptron?", "Why do neural networks need scaled inputs?", "What does early stopping do?", "When would you choose a neural network over a tree-based model? (Images, audio, text; tabular data often favours boosting.)", "What is ReLU?"] },
        { t: "recap", items: ["MLPClassifier = feed-forward neural network", "hidden_layer_sizes sets layers and neurons", "Scale inputs; use early stopping and alpha", "Compare with a simple baseline", "Images and text call for CNNs and transformers"] },
      ],
      quiz: [
        { q: "An 8×8 grayscale image becomes how many input features?", options: ["64", "8", "16", "1"], answer: 0, explain: "One per pixel." },
        { q: "hidden_layer_sizes=(64, 32) means…", options: ["Two hidden layers with 64 and 32 neurons", "64 epochs and 32 batches", "64 inputs and 32 outputs", "A CNN"], answer: 0, explain: "Layer sizes in order." },
        { q: "early_stopping=True helps prevent…", options: ["Overfitting", "Underfitting only", "Scaling", "Missing values"], answer: 0, explain: "Stops when validation stops improving." },
        { q: "For large photo datasets, the best family of models is usually…", options: ["Convolutional neural networks", "Naive Bayes", "k-means", "Linear regression"], answer: 0, explain: "They learn spatial patterns." },
      ],
    },
    {
      id: "pytorch-architectures",
      title: "PyTorch, network architectures, transformers and LLMs",
      oneLine: "PyTorch is the main deep-learning library: tensors (GPU arrays), automatic gradients, layers in nn.Module, and a training loop you write yourself. Different architectures suit different data: CNNs for images, RNNs for sequences, transformers for text (and now almost everything). Transfer learning reuses big pre-trained models.",
      minutes: 24,
      blocks: [
        py("A PyTorch training loop", src`
# pip install torch   (see pytorch.org for the right command for your computer / GPU)
import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)
X = torch.tensor(X / 16.0, dtype=torch.float32)            # scale pixels to 0–1
y = torch.tensor(y)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

model = nn.Sequential(                                       # layers, stacked
    nn.Linear(64, 64), nn.ReLU(),
    nn.Linear(64, 32), nn.ReLU(),
    nn.Linear(32, 10),                                       # 10 scores, one per digit
)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(30):
    for i in range(0, len(X_train), 64):                     # mini-batches of 64
        xb, yb = X_train[i:i + 64], y_train[i:i + 64]
        loss = loss_fn(model(xb), yb)                        # 1) forward pass + loss
        optimizer.zero_grad()
        loss.backward()                                      # 2) backpropagation (automatic!)
        optimizer.step()                                     # 3) update the weights

with torch.no_grad():
    accuracy = (model(X_test).argmax(dim=1) == y_test).float().mean()
print(f"test accuracy: {accuracy:.3f}")
`, undefined, "Needs PyTorch, so there's no fixed output here. It reaches about the same accuracy as the MLP above. Notice the same three steps you wrote by hand: forward, backward, update. `loss.backward()` does all the calculus for you."),
        { t: "table", head: ["Concept", "What it is", "Your from-scratch version"], rows: [["Tensor", "A NumPy-like array that can live on a GPU and track gradients", "Lists / NumPy arrays"], ["Autograd", "`loss.backward()` computes every gradient automatically", "The backpropagation code you wrote"], ["`nn.Module` / `nn.Sequential`", "Layers with their weights", "Lists of weight lists"], ["Loss function", "`CrossEntropyLoss` (classes), `MSELoss` (numbers)", "Squared error"], ["Optimiser", "`SGD`, `Adam`: how weights are updated", "w -= lr × gradient"], ["Epoch / batch", "Passes over data / rows per update", "Mini-batch gradient descent"]] },
        { t: "h", text: "Which network for which data?" },
        { t: "table", head: ["Architecture", "Best for", "Examples"], rows: [
          ["MLP (dense layers)", "Tabular features, small inputs", "Digits above, simple scoring"],
          ["CNN (convolutional)", "Images and spatial data", "X-ray screening, crop disease detection, face unlock"],
          ["RNN / LSTM", "Sequences (older approach)", "Sensor data, simple time series"],
          ["Transformer (attention)", "Text, and now images, audio, code", "Translation, ChatGPT-style models, search"],
          ["Autoencoders / diffusion", "Compressing and generating data", "Anomaly detection, image generation"],
        ] },
        { t: "h", text: "Transfer learning and LLMs" },
        py("Using a pre-trained transformer", src`
# pip install transformers torch
from transformers import pipeline

sentiment = pipeline("sentiment-analysis")          # downloads a small pre-trained model
for review in ["Delivery was quick and the food was amazing!", "Cold food and a rude delivery boy."]:
    print(review, "→", sentiment(review)[0])
`, undefined, "Needs internet and the transformers library. In two lines you use a model someone else trained on millions of sentences: that's transfer learning. You can fine-tune such a model on your own labelled data (for example Hindi–English reviews) with far less data than training from scratch."),
        { t: "points", items: ["**Transfer learning:** start from a model pre-trained on huge data (ImageNet for images, large text corpora for language) and fine-tune it on your small dataset.", "**Large language models (LLMs)** are transformers trained to predict the next token on enormous text. Data scientists use them through APIs or open models for summarising, classifying and extracting information from text.", "**Embeddings** turn text or images into vectors (like the TF-IDF vectors you built, but capturing meaning), powering semantic search and recommendations.", "**GPUs** make deep learning practical; free options include Google Colab and Kaggle notebooks."] },
        { t: "analogy", text: "Training from scratch is teaching a child to read starting from the alphabet. Transfer learning is hiring a graduate who already reads well and teaching them your company's specific documents: much faster and needs far fewer examples." },
        { t: "trap", text: "Deep learning isn't automatically better: on ordinary tables (customers, transactions), gradient boosting usually wins and is cheaper. Large models also bring costs, latency, privacy and bias concerns. Start simple, and reach for deep learning when the data is images, audio or text, or when simpler models clearly fall short." },
        { t: "trick", text: "**PyTorch loop: forward → loss → backward → step. Images → CNN, text → transformer, tables → boosting first.**" },
        { t: "exam", items: ["Explain the PyTorch training loop.", "What is autograd?", "CNN vs RNN vs transformer?", "What is transfer learning? Fine-tuning?", "What are embeddings?", "When would you NOT use deep learning?"] },
        { t: "recap", items: ["Tensors + autograd + nn.Module + optimiser", "forward → loss → backward → step, in mini-batches", "CNNs for images, transformers for text", "Transfer learning reuses pre-trained models", "Tabular data: try gradient boosting first"] },
      ],
      quiz: [
        { q: "In PyTorch, which call computes all the gradients?", options: ["loss.backward()", "optimizer.step()", "model.eval()", "torch.no_grad()"], answer: 0, explain: "step() then updates the weights." },
        { q: "Best architecture for classifying photos?", options: ["CNN", "k-NN on raw text", "Linear regression", "Naive Bayes"], answer: 0, explain: "Convolutions capture spatial patterns." },
        { q: "Transfer learning means…", options: ["Starting from a pre-trained model and fine-tuning it", "Copying data between computers", "Training only on test data", "Converting PyTorch to TensorFlow"], answer: 0, explain: "Big savings in data and time." },
        { q: "For a table of customer features, start with…", options: ["Gradient boosting or logistic regression", "A huge transformer", "A CNN", "An LLM"], answer: 0, explain: "Cheaper and usually as good or better." },
      ],
    },
  ],
};

export const DS23_CAPSTONE: LearnModule = {
  id: "capstone",
  title: "Capstone project and sharing your work",
  titleHi: "कैपस्टोन प्रोजेक्ट और काम साझा करना",
  blurb: "Put the whole toolkit together in an end-to-end project (pandas EDA, feature engineering, scikit-learn pipeline, evaluation, explanation, saving the model), then share it as a notebook, a web app or an API, with a GitHub README that gets you interviews.",
  lessons: [
    {
      id: "end-to-end",
      title: "End-to-end project: which customers will stop ordering?",
      oneLine: "A food-delivery app wants to know which customers will stop ordering next month. We load and explore the data with pandas, engineer features, build a scikit-learn pipeline, compare a baseline with gradient boosting, evaluate on held-out data, explain the drivers, save the model and score new customers.",
      minutes: 35,
      blocks: [
        { t: "table", head: ["Step", "What we do"], rows: [["1. Problem", "Predict churn (no order next month). Metric: AUC, plus recall in the top 20% riskiest customers"], ["2. Data + EDA", "Load the CSV, check types and missing values, churn rate by segment"], ["3. Features", "Days since last order, orders per month, late-delivery share"], ["4. Model", "Pipeline: impute + scale + one-hot → logistic baseline vs gradient boosting, 5-fold CV"], ["5. Evaluate", "Test AUC, top-20% recall and precision"], ["6. Explain", "Permutation importance"], ["7. Deliver", "Save with joblib, score new customers"]] },
        py("The whole project", src`
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# ---- 1. Data (generated here; in real life: pd.read_csv("customers.csv")) ----
rng = np.random.default_rng(21)
n = 3000
df = pd.DataFrame({
    "city": rng.choice(["Patna", "Pune", "Delhi", "Mumbai"], n),
    "signup": pd.Timestamp("2026-10-01") - pd.to_timedelta(rng.integers(30, 720, n), unit="D"),
    "last_order": pd.Timestamp("2026-10-01") - pd.to_timedelta(rng.exponential(20, n).astype(int), unit="D"),
    "orders": rng.poisson(12, n) + 1,
    "late_orders": rng.poisson(1.5, n),
    "avg_order_value": rng.normal(450, 120, n).round(),
    "has_membership": rng.random(n) < 0.3,
})
df.loc[rng.choice(n, 120, replace=False), "avg_order_value"] = np.nan          # messy, like real data
days_idle = (pd.Timestamp("2026-10-01") - df["last_order"]).dt.days
logit = (-1.5 + 0.05 * (days_idle - 20) + 0.5 * (df["late_orders"] / df["orders"] * 10 - 1)
         - 0.9 * df["has_membership"] - 0.03 * (df["orders"] - 12))
df["churned"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
df.to_csv("customers.csv", index=False)

# ---- 2. Load and explore ----
df = pd.read_csv("customers.csv", parse_dates=["signup", "last_order"])
print("rows:", len(df), "| churn rate:", round(df["churned"].mean(), 3),
      "| missing avg_order_value:", int(df["avg_order_value"].isna().sum()))
print(df.groupby("has_membership")["churned"].mean().round(3).rename("churn rate"))

# ---- 3. Feature engineering ----
today = pd.Timestamp("2026-10-01")
df["days_since_last_order"] = (today - df["last_order"]).dt.days
df["months_active"] = ((today - df["signup"]).dt.days / 30).clip(lower=1)
df["orders_per_month"] = df["orders"] / df["months_active"]
df["late_share"] = df["late_orders"] / df["orders"]
features = ["city", "has_membership", "days_since_last_order", "orders_per_month",
            "late_share", "avg_order_value"]
X, y = df[features], df["churned"]

# ---- 4. Pipeline and model comparison ----
numeric = ["days_since_last_order", "orders_per_month", "late_share", "avg_order_value"]
prep = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city", "has_membership"]),
])
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
candidates = {
    "logistic": Pipeline([("prep", prep), ("model", LogisticRegression(max_iter=1000))]),
    "boosting": Pipeline([("prep", prep), ("model", HistGradientBoostingClassifier(max_depth=3, random_state=0))]),
}
for name, pipe in candidates.items():
    print(f"{name:<9} 5-fold CV AUC {cross_val_score(pipe, X_train, y_train, cv=5, scoring='roc_auc').mean():.3f}")

# ---- 5. Evaluate the chosen model once on the test set ----
best = candidates["logistic"].fit(X_train, y_train)
prob = best.predict_proba(X_test)[:, 1]
top = prob >= np.quantile(prob, 0.8)                                   # the riskiest 20%
caught = int((top & (y_test == 1)).sum())
print(f"test AUC {roc_auc_score(y_test, prob):.3f} | top-20% list catches {caught} of "
      f"{int(y_test.sum())} churners (recall {caught / y_test.sum():.2f}, precision {caught / top.sum():.2f})")

# ---- 6. Explain ----
imp = permutation_importance(best, X_test, y_test, scoring="roc_auc", n_repeats=10, random_state=0)
print(pd.Series(imp.importances_mean, index=features).sort_values(ascending=False).round(3))

# ---- 7. Save and use ----
joblib.dump(best, "churn_model.joblib")
loaded = joblib.load("churn_model.joblib")
new = pd.DataFrame({"city": ["Pune", "Patna"], "has_membership": [False, True],
                    "days_since_last_order": [45, 3], "orders_per_month": [0.8, 3.5],
                    "late_share": [0.3, 0.0], "avg_order_value": [520, np.nan]})
print("churn risk for 2 new customers:", loaded.predict_proba(new)[:, 1].round(2).tolist())
`, "rows: 3000 | churn rate: 0.2 | missing avg_order_value: 120\nhas_membership\nFalse    0.230\nTrue     0.127\nName: churn rate, dtype: float64\nlogistic  5-fold CV AUC 0.786\nboosting  5-fold CV AUC 0.769\ntest AUC 0.823 | top-20% list catches 83 of 150 churners (recall 0.55, precision 0.55)\ndays_since_last_order    0.193\nlate_share               0.088\nhas_membership           0.035\norders_per_month         0.000\navg_order_value         -0.001\ncity                    -0.001\ndtype: float64\nchurn risk for 2 new customers: [0.65, 0.02]"),
        { t: "h", text: "Turning results into a recommendation" },
        { t: "points", items: ["**Decision:** each week, send a coupon to the top 20% riskiest customers.", "**Value (expected value):** if a ₹50 coupon saves 25% of the churners it reaches and each saved customer is worth ₹3,000 a year, value per coupon ≈ precision × 0.25 × 3,000, which is well above ₹50 at this precision.", "**Drivers to fix:** days since the last order dominates, followed by late deliveries and membership: work with operations on late deliveries and push memberships.", "**Next steps:** run an A/B test of the coupon (see Inference), monitor the model monthly, retrain when performance drifts."] },
        { t: "analogy", text: "This project is a full cricket match, not net practice: every skill from the course (batting = pandas, bowling = modelling, fielding = evaluation, captaincy = the business recommendation) has to come together, and the result is judged by the scoreboard (the test set), not by practice sessions." },
        { t: "trap", text: "Features must be available at prediction time and computed the same way: here \"days since last order\" is measured from the same \"today\" for training and scoring. Don't let the target leak into features (for example, \"coupon_sent_after_churn\"), and don't tune on the test set." },
        { t: "trick", text: "**Problem → EDA → features → pipeline → CV compare → test once → explain → save → recommend.**" },
        { t: "exam", items: ["Walk me through an end-to-end ML project.", "How did you choose the threshold?", "How did you handle missing values and categories?", "How would you deploy and monitor this model?", "How would you prove the model creates business value? (An A/B test of the intervention.)"] },
        { t: "recap", items: ["pandas for loading, EDA and features", "ColumnTransformer + model in one Pipeline", "Compare models with cross-validation; keep the simpler one if it ties", "Evaluate once on test data with business metrics", "Explain with permutation importance; save with joblib"] },
      ],
      quiz: [
        { q: "joblib.dump(model, \"m.joblib\") is used to…", options: ["Save a trained model to a file", "Train a model", "Plot results", "Split data"], answer: 0, explain: "joblib.load brings it back." },
        { q: "Why compute features the same way for training and scoring?", options: ["Otherwise predictions on new data are wrong", "It's faster", "joblib requires it", "It isn't necessary"], answer: 0, explain: "Training/serving skew." },
        { q: "The logistic baseline and boosting tie in CV. Choose…", options: ["The simpler, more explainable logistic model", "Boosting always", "Neither", "The one with more parameters"], answer: 0, explain: "Simplicity wins ties." },
        { q: "How do you prove the coupon campaign works?", options: ["Run an A/B test", "Look at the training accuracy", "Check the AUC only", "Ask the model"], answer: 0, explain: "Prediction ≠ intervention effect." },
      ],
    },
    {
      id: "sharing-work",
      title: "Notebooks, apps, APIs and a portfolio that gets interviews",
      oneLine: "Analysis that nobody sees has no value. Organise notebooks so others can follow them, turn models into a simple web app (Streamlit) or an API (FastAPI) others can use, put everything on GitHub with a clear README, and keep improving after deployment.",
      minutes: 18,
      blocks: [
        { t: "h", text: "A notebook others can follow" },
        { t: "table", head: ["Section", "Contains"], rows: [["1. Problem", "The business question and how success is measured"], ["2. Data", "Source, size, columns, known issues"], ["3. EDA", "3–6 key charts, each with a one-line takeaway"], ["4. Modelling", "Baseline, candidates, cross-validation results"], ["5. Results", "Test metrics, chosen threshold, feature importance"], ["6. Recommendation", "What to do, expected value, limits, next steps"]] },
        py("A Streamlit app for the churn model", src`
# app.py  —  run with:  pip install streamlit  then  streamlit run app.py
import joblib
import pandas as pd
import streamlit as st

model = joblib.load("churn_model.joblib")
st.title("Customer churn risk")

city = st.selectbox("City", ["Patna", "Pune", "Delhi", "Mumbai"])
member = st.checkbox("Has membership")
idle = st.slider("Days since last order", 0, 120, 10)
per_month = st.number_input("Orders per month", 0.0, 30.0, 2.0)
late = st.slider("Share of late deliveries", 0.0, 1.0, 0.1)
value = st.number_input("Average order value (₹)", 50, 5000, 450)

row = pd.DataFrame({"city": [city], "has_membership": [member], "days_since_last_order": [idle],
                    "orders_per_month": [per_month], "late_share": [late], "avg_order_value": [value]})
risk = model.predict_proba(row)[0, 1]
st.metric("Churn risk", f"{risk:.0%}")
if risk > 0.5:
    st.warning("High risk: consider a retention offer.")
`, undefined, "Opens an interactive page in the browser. Streamlit Community Cloud can host it for free from a GitHub repository."),
        py("Serving predictions with FastAPI", src`
# api.py  —  pip install fastapi uvicorn   then   uvicorn api:app --reload
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

model = joblib.load("churn_model.joblib")
app = FastAPI()

class Customer(BaseModel):
    city: str
    has_membership: bool
    days_since_last_order: int
    orders_per_month: float
    late_share: float
    avg_order_value: float | None = None

@app.post("/predict")
def predict(customer: Customer):
    risk = model.predict_proba(pd.DataFrame([customer.model_dump()]))[0, 1]
    return {"churn_risk": round(float(risk), 3)}
`, undefined, "Other apps (a CRM, the mobile app's backend) can now send a customer as JSON and get a risk score back. Docs appear automatically at /docs."),
        { t: "h", text: "After deployment" },
        { t: "points", items: ["**Monitor** input data and prediction distributions: if they drift (new cities, a pricing change), performance drops.", "**Track** the real outcome later and recompute AUC/recall monthly.", "**Retrain** on fresh data on a schedule or when drift is detected.", "**Version** data, code and models (Git, DVC, MLflow) so results can be reproduced."] },
        { t: "h", text: "README template for each portfolio project" },
        { t: "code", lang: "markdown", title: "README.md", code: "# Customer churn prediction\n\n**Goal:** flag customers likely to stop ordering next month so the team can win them back.\n\n**Result:** the top-20% risk list catches about half of churners; days since last order and late deliveries are the main drivers.\n\n## Data\n3,000 customers, 7 columns (source, period, known issues).\n\n## Approach\nEDA → features → scikit-learn pipeline → logistic vs gradient boosting (5-fold CV) → test evaluation.\n\n## How to run\npip install -r requirements.txt\njupyter notebook churn.ipynb      # or: streamlit run app.py\n\n## Next steps\nA/B test the coupon; monitor drift monthly." },
        { t: "analogy", text: "A model in a notebook is a recipe in your diary. A Streamlit app is a food stall where anyone can taste it; an API is a supplier other restaurants can order from. The README is the menu that convinces people to try it." },
        { t: "trap", text: "Don't commit large data files, passwords or API keys to GitHub; use .gitignore and environment variables. A portfolio of tutorial copies (Titanic, Iris) doesn't stand out: pick a question you care about, with real, messy data." },
        { t: "trick", text: "**Clear notebook + app or API + README with results first = a project recruiters remember.**" },
        { t: "exam", items: ["How would you deploy a machine-learning model?", "What is model drift and how do you detect it?", "How do you make your analysis reproducible?", "Tell me about a project on your GitHub.", "How do you explain technical results to non-technical stakeholders?"] },
        { t: "recap", items: ["Structure notebooks as a story: problem → data → EDA → model → results → recommendation", "Streamlit for quick apps; FastAPI for APIs", "Monitor, track outcomes and retrain", "Version data, code and models", "README: goal, result, data, approach, how to run"] },
      ],
      quiz: [
        { q: "Which tool turns a Python script into an interactive web app quickly?", options: ["Streamlit", "NumPy", "joblib", "sqlite3"], answer: 0, explain: "FastAPI is for APIs." },
        { q: "Model drift means…", options: ["Incoming data or relationships change, so performance drops", "The model file moves", "Training is slow", "The README is outdated"], answer: 0, explain: "Monitor and retrain." },
        { q: "What should a README start with?", options: ["The goal and the key result", "The full code", "A list of libraries only", "Your resume"], answer: 0, explain: "Recruiters skim the first lines." },
        { q: "Where should API keys go?", options: ["Environment variables, never GitHub", "In the notebook", "In the README", "In the CSV"], answer: 0, explain: "Keep secrets out of code." },
      ],
    },
  ],
};
