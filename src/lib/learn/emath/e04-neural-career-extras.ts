import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Essential Math for Data Science, chapters 7–8 and appendix: neural networks, career advice, extra topics. */
export const EM08_NEURAL_NETWORKS: LearnModule = {
  id: "neural-networks",
  title: "Neural networks",
  titleHi: "न्यूरल नेटवर्क",
  blurb: "Build a small neural network that chooses a readable font colour for any background: activation functions, forward propagation with matrices, backpropagation with the chain rule, stochastic gradient descent, then the scikit-learn version and the real limits of neural networks.",
  lessons: [
    {
      id: "forward-propagation",
      title: "When to use neural networks, activation functions and forward propagation",
      oneLine: "A neural network is layers of weighted sums passed through activation functions. Forward propagation pushes inputs through: hidden = ReLU(W₁·x + b₁), output = sigmoid(W₂·hidden + b₂). Use networks for images, audio, text and very complex patterns; for ordinary tables, simpler models often win.",
      minutes: 22,
      blocks: [
        { t: "p", text: "**The problem:** given a background colour (red, green, blue values 0–255), should the text on it be light or dark? We'll generate labelled examples using a brightness formula, then teach a network to learn the rule from the examples alone." },
        py("Data, activations and one forward pass", src`
import numpy as np

rng = np.random.default_rng(0)
colors = rng.integers(0, 256, size=(1500, 3))                          # random backgrounds
brightness = (0.299 * colors[:, 0] + 0.587 * colors[:, 1] + 0.114 * colors[:, 2]) / 255
dark_font = (brightness > 0.5).astype(int)                              # 1 = use dark text
X = colors / 255.0                                                       # scale inputs to 0–1
print("examples:", X.shape, "| share needing dark font:", round(float(dark_font.mean()), 3))

relu = lambda z: np.maximum(z, 0)
sigmoid = lambda z: 1 / (1 + np.exp(-z))
print("relu([-2, 0, 3]) =", relu(np.array([-2, 0, 3])).tolist(), "| sigmoid([-2, 0, 3]) =", sigmoid(np.array([-2.0, 0, 3])).round(3).tolist())

W1, b1 = rng.uniform(-1, 1, (3, 3)), rng.uniform(-1, 1, (3, 1))        # hidden layer: 3 neurons
W2, b2 = rng.uniform(-1, 1, (1, 3)), rng.uniform(-1, 1, (1, 1))        # output layer: 1 neuron

def forward(X):
    A1 = relu(W1 @ X.T + b1)                                             # hidden activations (3 × n)
    return sigmoid(W2 @ A1 + b2)                                         # P(dark font) (1 × n)

p = forward(X[:3])
print("untrained predictions for 3 colours:", p.round(3).tolist(), "| truth:", dark_font[:3].tolist())
`, "examples: (1500, 3) | share needing dark font: 0.511\nrelu([-2, 0, 3]) = [0, 0, 3] | sigmoid([-2, 0, 3]) = [0.119, 0.5, 0.953]\nuntrained predictions for 3 colours: [[0.608, 0.599, 0.643]] | truth: [1, 0, 0]"),
        { t: "table", head: ["Activation", "Formula", "Used in"], rows: [["Linear", "x", "Output for regression"], ["Sigmoid (logistic)", "1 / (1 + e⁻ˣ)", "Output for yes/no probabilities"], ["Tanh", "(eˣ − e⁻ˣ) / (eˣ + e⁻ˣ)", "Hidden layers (older networks)"], ["ReLU", "max(0, x)", "Hidden layers: the default today"], ["Softmax", "eˣⁱ / Σ eˣʲ", "Output for several classes"]] },
        { t: "diagram", text: "R ─┐        ┌─(h1)─┐\nG ─┼─ W1 ─┼─(h2)─┼─ W2 ─▶ (σ) ─▶ P(dark font)\nB ─┘  +b1 └─(h3)─┘  +b2\ninputs   hidden layer (ReLU)   output (sigmoid)" },
        { t: "analogy", text: "Each neuron is a small judge: it weighs the inputs (weights), adds a personal bias, and only speaks up if its total is positive (ReLU). The final judge combines the small judges' opinions and squashes them into a probability (sigmoid)." },
        { t: "trap", text: "Without non-linear activations, stacked layers collapse into a single linear model, however many layers you add. Untrained networks output near-random probabilities, so don't evaluate before training, and always scale the inputs (here, dividing by 255)." },
        { t: "trick", text: "**Layer = activation(W · input + b). ReLU inside, sigmoid/softmax at the output.**" },
        { t: "exam", items: ["When should you use a neural network?", "What is an activation function? Why is it needed?", "ReLU vs sigmoid?", "Explain forward propagation.", "Why scale inputs for neural networks?"] },
        { t: "recap", items: ["Layers of weighted sums + activations", "Forward pass: hidden = ReLU(W₁x + b₁), out = σ(W₂h + b₂)", "ReLU for hidden layers, sigmoid/softmax for outputs", "Non-linearity is essential", "Best for images, audio, text, complex patterns"] },
      ],
      quiz: [
        { q: "ReLU(−3) = ?", options: ["0", "−3", "3", "0.05"], answer: 0, explain: "max(0, x)." },
        { q: "Which output activation suits a yes/no probability?", options: ["Sigmoid", "ReLU", "Linear", "None"], answer: 0, explain: "It maps to (0, 1)." },
        { q: "Without activation functions, a deep network is equivalent to…", options: ["A single linear model", "A decision tree", "k-means", "A perfect classifier"], answer: 0, explain: "Linear layers compose to one linear map." },
        { q: "Why divide RGB values by 255?", options: ["To scale inputs to 0–1 for stable training", "To make them integers", "To remove colour", "It's required by NumPy"], answer: 0, explain: "Scaled inputs train better." },
      ],
    },
    {
      id: "backpropagation",
      title: "Backpropagation and stochastic gradient descent",
      oneLine: "To learn, the network measures its error, then uses the chain rule to work backwards and compute how much each weight and bias contributed (backpropagation). Stochastic gradient descent nudges every parameter a little against its gradient, one example at a time, for many passes.",
      minutes: 26,
      blocks: [
        { t: "formula", items: [["Loss (one example)", "C = (A₂ − y)²"], ["Output layer", "dC/dA₂ = 2(A₂ − y);  dA₂/dZ₂ = A₂(1 − A₂);  dZ₂/dW₂ = A₁"], ["Hidden layer", "dZ₂/dA₁ = W₂;  dA₁/dZ₁ = 1 if Z₁ > 0 else 0 (ReLU);  dZ₁/dW₁ = x"], ["Chain rule", "dC/dW₁ = dC/dA₂ · dA₂/dZ₂ · dZ₂/dA₁ · dA₁/dZ₁ · dZ₁/dW₁"]] },
        py("Training the font-colour network from scratch", src`
import numpy as np

rng = np.random.default_rng(0)
colors = rng.integers(0, 256, size=(1500, 3))
brightness = (0.299 * colors[:, 0] + 0.587 * colors[:, 1] + 0.114 * colors[:, 2]) / 255
y = (brightness > 0.5).astype(float)
X = colors / 255.0
X_train, y_train, X_test, y_test = X[:1000], y[:1000], X[1000:], y[1000:]

W1, b1 = rng.uniform(-1, 1, (3, 3)), rng.uniform(-1, 1, (3, 1))
W2, b2 = rng.uniform(-1, 1, (1, 3)), rng.uniform(-1, 1, (1, 1))
relu = lambda z: np.maximum(z, 0)
sigmoid = lambda z: 1 / (1 + np.exp(-z))

def forward(X):
    Z1 = W1 @ X.T + b1
    A1 = relu(Z1)
    Z2 = W2 @ A1 + b2
    return Z1, A1, Z2, sigmoid(Z2)

def accuracy(X, y):
    return float(np.mean((forward(X)[3].ravel() >= 0.5) == y))

lr = 0.05
print("accuracy before training:", round(accuracy(X_test, y_test), 3))
for epoch in range(1, 41):
    for i in rng.permutation(len(X_train)):                  # stochastic: one example at a time
        x, target = X_train[i:i + 1], y_train[i]
        Z1, A1, Z2, A2 = forward(x)
        dC_dZ2 = 2 * (A2 - target) * A2 * (1 - A2)            # chain rule, output layer
        dC_dW2, dC_db2 = dC_dZ2 @ A1.T, dC_dZ2
        dC_dZ1 = (W2.T @ dC_dZ2) * (Z1 > 0)                   # chain rule, back through ReLU
        dC_dW1, dC_db1 = dC_dZ1 @ x, dC_dZ1
        W2 -= lr * dC_dW2; b2 -= lr * dC_db2                  # gradient descent step
        W1 -= lr * dC_dW1; b1 -= lr * dC_db1
    if epoch in (1, 10, 40):
        print(f"epoch {epoch:>2}: test accuracy {accuracy(X_test, y_test):.3f}")

for rgb in [(255, 255, 255), (0, 0, 128), (255, 200, 0)]:
    p = forward(np.array([rgb]) / 255.0)[3].item()
    print(f"background {rgb}: P(dark font) = {p:.3f} → {'dark' if p >= 0.5 else 'light'} text")
`, "accuracy before training: 0.472\nepoch  1: test accuracy 0.472\nepoch 10: test accuracy 0.986\nepoch 40: test accuracy 0.978\nbackground (255, 255, 255): P(dark font) = 1.000 → dark text\nbackground (0, 0, 128): P(dark font) = 0.000 → light text\nbackground (255, 200, 0): P(dark font) = 1.000 → dark text"),
        { t: "p", text: "Starting from random weights, the network learns the brightness rule from examples alone: white and yellow backgrounds get dark text, navy gets light text. Every deep-learning framework runs exactly this loop (forward, loss, backward with the chain rule, update) automatically and on GPUs." },
        { t: "analogy", text: "Backpropagation is a relay team reviewing a lost race backwards from the finish line: the last runner's time is checked first, then how much each earlier runner contributed, so each one knows how to improve next time." },
        { t: "trap", text: "With an unlucky initialisation, a ReLU neuron can \"die\" (always output 0 and stop learning), and too large a learning rate makes training diverge. If accuracy stalls, change the seed or learning rate, or use a framework's better initialisers and optimisers (Adam)." },
        { t: "trick", text: "**Forward → loss → backward (multiply local derivatives) → update. Repeat for many epochs.**" },
        { t: "exam", items: ["Explain backpropagation.", "Derive the gradient for the output layer of a sigmoid network.", "What is the derivative of ReLU?", "Why use stochastic gradient descent?", "What is a dead ReLU?"] },
        { t: "recap", items: ["Loss measures the error", "Backprop applies the chain rule layer by layer", "ReLU's derivative: 1 if positive, else 0", "SGD updates after each example (or mini-batch)", "Frameworks automate this loop"] },
      ],
      quiz: [
        { q: "Backpropagation computes…", options: ["The gradient of the loss for every weight", "The forward prediction", "The training data", "The activation function"], answer: 0, explain: "Using the chain rule." },
        { q: "The derivative of the sigmoid output A is…", options: ["A(1 − A)", "1", "A²", "1/A"], answer: 0, explain: "Used for dA₂/dZ₂." },
        { q: "ReLU's derivative for a negative input is…", options: ["0", "1", "−1", "Undefined always"], answer: 0, explain: "The neuron passes no gradient." },
        { q: "One epoch means…", options: ["One full pass over the training data", "One weight update", "One layer", "One test"], answer: 0, explain: "Many updates per epoch in SGD." },
      ],
    },
    {
      id: "sklearn-limitations",
      title: "Neural networks with scikit-learn, and their limits",
      oneLine: "scikit-learn's MLPClassifier trains the same kind of network in a few lines, here for font colours and for handwritten digits. Neural networks are powerful but data-hungry, hard to explain, easy to overfit and sometimes beaten by simpler models; know when not to use them.",
      minutes: 18,
      blocks: [
        py("MLPClassifier for colours and digits", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

rng = np.random.default_rng(0)
colors = rng.integers(0, 256, size=(1500, 3))
y = ((0.299 * colors[:, 0] + 0.587 * colors[:, 1] + 0.114 * colors[:, 2]) / 255 > 0.5).astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(colors / 255.0, y, test_size=1 / 3, random_state=0)
mlp = MLPClassifier(hidden_layer_sizes=(3,), activation="relu", solver="sgd", learning_rate_init=0.05,
                    max_iter=2000, random_state=0).fit(X_tr, y_tr)
print("font colour, MLP test accuracy:", round(mlp.score(X_te, y_te), 3))
print("font colour, logistic regression:", round(LogisticRegression().fit(X_tr, y_tr).score(X_te, y_te), 3))

digits = load_digits()                                       # small MNIST-style digits (8×8)
D_tr, D_te, t_tr, t_te = train_test_split(digits.data / 16.0, digits.target, test_size=0.25,
                                          random_state=0, stratify=digits.target)
net = MLPClassifier(hidden_layer_sizes=(100,), max_iter=500, random_state=0).fit(D_tr, t_tr)
print("digits, MLP test accuracy:", round(net.score(D_te, t_te), 3))
`, "font colour, MLP test accuracy: 1.0\nfont colour, logistic regression: 0.99\ndigits, MLP test accuracy: 0.98"),
        { t: "p", text: "For the font colours, logistic regression does almost exactly as well as the network (0.99 vs 1.0): the true rule is a weighted sum of R, G and B, which is exactly what a linear model expresses. The network shines more on the digits, where the patterns are richer. Choose the simplest model that does the job." },
        { t: "table", head: ["Limitation", "What it means"], rows: [["Data-hungry", "Needs many labelled examples; small tables often favour simpler models"], ["Hard to explain", "Thousands of weights; difficult to justify individual decisions (loans, medicine)"], ["Overfitting", "Can memorise noise; needs validation, regularisation, early stopping"], ["Compute-heavy", "Large models need GPUs, time and energy"], ["Brittle", "Small, unexpected input changes can flip predictions; can't extrapolate beyond its data"], ["Correlation, not understanding", "Learns patterns in the data, including its biases"]] },
        { t: "analogy", text: "A neural network is a powerful excavator: brilliant for moving mountains (images, speech, language), overkill and clumsy for planting a flower pot (a 1,000-row spreadsheet), where a trowel (linear or tree model) is faster, cheaper and easier to explain." },
        { t: "trap", text: "Don't use deep learning because it sounds impressive: compare it with a simple baseline on held-out data. Hype aside, many business problems are best solved with linear models, gradient boosting and good features." },
        { t: "trick", text: "**MLPClassifier for quick networks; always compare with a simple baseline; know the limits.**" },
        { t: "exam", items: ["When would you choose a neural network over logistic regression?", "What are the main limitations of neural networks?", "How do you prevent a neural network from overfitting?", "Why is explainability a concern?"] },
        { t: "recap", items: ["MLPClassifier trains feed-forward networks", "Compare with simple baselines", "Networks excel on images, audio, text", "Limits: data, explainability, overfitting, compute, brittleness", "Choose the simplest model that works"] },
      ],
      quiz: [
        { q: "If the true rule is a weighted sum of inputs, a good model choice is…", options: ["Logistic regression", "A 50-layer network", "k-means", "PCA"], answer: 0, explain: "It matches the structure exactly." },
        { q: "A key weakness of neural networks in regulated decisions (loans) is…", options: ["They're hard to explain", "They're too simple", "They need no data", "They can't output probabilities"], answer: 0, explain: "Decisions must be justified." },
        { q: "MLPClassifier's hidden_layer_sizes=(100,) means…", options: ["One hidden layer with 100 neurons", "100 layers", "100 epochs", "100 outputs"], answer: 0, explain: "A tuple of layer sizes." },
        { q: "Which helps prevent overfitting in neural networks?", options: ["Early stopping and regularisation", "More layers always", "Training on the test set", "Removing activations"], answer: 0, explain: "Validate as you train." },
      ],
    },
  ],
};

export const EM09_CAREER: LearnModule = {
  id: "career",
  title: "Career advice and the path forward",
  titleHi: "करियर सलाह और आगे का रास्ता",
  blurb: "What data science really is today, the skills that give you an edge (SQL, programming, visualisation, domain knowledge), the warning signs in data-science jobs, and how to keep growing.",
  lessons: [
    {
      id: "finding-your-edge",
      title: "Redefining data science and finding your edge",
      oneLine: "\"Data science\" covers many roles, from reporting analyst to ML engineer. You stand out not by knowing every algorithm but by combining solid SQL and programming, clear visualisation, knowledge of an industry, and the habit of learning productively, as a practitioner who builds or an advisor who guides decisions.",
      minutes: 18,
      blocks: [
        { t: "table", head: ["Skill", "Why it gives you an edge", "How to build it"], rows: [
          ["SQL", "Almost all company data lives in databases; every data role uses it", "Daily practice: joins, GROUP BY, window functions"],
          ["Programming (Python)", "Automate, analyse and build models beyond spreadsheets", "Projects, not just tutorials; read others' code"],
          ["Data visualisation", "Decisions are made from charts, not notebooks", "Make one clear chart per question; learn a BI tool"],
          ["Domain knowledge", "Knowing the business makes your analysis useful", "Pick an industry you like (health, retail, finance) and learn its problems"],
          ["Math and statistics", "Know when results are real, and what the black box is doing", "This course, then practice on real data"],
          ["Productive learning", "Tools change every year", "Learn just-in-time for a real problem; build, then read"],
        ] },
        py("SQL is the first skill employers check", src`
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE sales (region TEXT, product TEXT, month TEXT, revenue REAL);
INSERT INTO sales VALUES
  ('North', 'Tea', '2026-08', 120), ('North', 'Tea', '2026-09', 150), ('North', 'Coffee', '2026-09', 90),
  ('South', 'Tea', '2026-08', 200), ('South', 'Coffee', '2026-09', 260), ('South', 'Coffee', '2026-08', 180);
""")
query = """
SELECT region, SUM(revenue) AS total,
       RANK() OVER (ORDER BY SUM(revenue) DESC) AS rank
FROM sales
GROUP BY region
"""
for row in db.execute(query):
    print(row)
print(db.execute("SELECT product, ROUND(AVG(revenue), 1) FROM sales GROUP BY product ORDER BY 2 DESC").fetchall())
`, "('South', 640.0, 1)\n('North', 360.0, 2)\n[('Coffee', 176.7), ('Tea', 156.7)]", "Window functions like RANK() OVER (...) are a favourite interview topic; practise them."),
        { t: "table", head: ["Practitioner", "Advisor"], rows: [["Builds pipelines, models and tools", "Frames questions, interprets results, guides decisions"], ["Deep in code and data", "Deep in the business and communication"], ["\"How do we build it?\"", "\"Should we build it at all?\""]], caption: "Both are valuable; many careers move between them. Knowing the math helps both judge what's realistic." },
        { t: "analogy", text: "Data skills are like cricket skills: a batter who can also bowl a few overs and field well (SQL + Python + communication + domain knowledge) gets picked far more often than a specialist who can only play one perfect shot." },
        { t: "trap", text: "Chasing every new tool (a new framework every month) without depth leaves you with nothing solid. Equally, knowing algorithms without SQL or communication skills makes you hard to hire. Build a T-shape: broad basics, one deep specialty." },
        { t: "trick", text: "**SQL + Python + one chart + one industry + the math = an edge.**" },
        { t: "exam", items: ["What does a data scientist do in your view?", "Why is SQL so important?", "What is a window function?", "How do you stay current without chasing every tool?", "Practitioner vs advisor: which suits you and why?"] },
        { t: "recap", items: ["Data science spans many roles", "SQL and Python are the base", "Visualisation and communication drive decisions", "Domain knowledge makes analysis useful", "Learn productively: just-in-time, through projects"] },
      ],
      quiz: [
        { q: "Which skill appears in almost every data job?", options: ["SQL", "Assembly language", "Photoshop", "COBOL"], answer: 0, explain: "Data lives in databases." },
        { q: "RANK() OVER (ORDER BY total DESC) is an example of…", options: ["A window function", "A JOIN", "An index", "A subquery only"], answer: 0, explain: "Calculations across rows." },
        { q: "\"Productive learning\" means…", options: ["Learning what you need for a real problem, by building", "Collecting certificates", "Reading every book first", "Avoiding new tools"], answer: 0, explain: "Just-in-time, applied." },
        { q: "A T-shaped skill set is…", options: ["Broad basics plus one deep specialty", "Only one skill", "Many shallow skills", "Only management"], answer: 0, explain: "Depth and breadth." },
      ],
    },
    {
      id: "watch-out-jobs",
      title: "What to watch out for in data-science jobs, and where to go next",
      oneLine: "Many data roles disappoint because of unclear role definitions, no leadership buy-in, poor data or tools, unrealistic goals, or pressure to replace working systems with \"AI\". Ask about these before joining, keep your skills portable, and build your own path if your dream job doesn't exist yet.",
      minutes: 15,
      blocks: [
        { t: "table", head: ["Warning sign", "Question to ask in the interview"], rows: [
          ["Vague role definition", "\"What would success look like in my first 6 months?\""],
          ["No organisational buy-in", "\"Which decisions have recently changed because of data work?\""],
          ["Inadequate resources", "\"Where does the data live, and who maintains it? What tools would I use?\""],
          ["Unreasonable objectives", "\"What problem should this model solve, and how is it done today?\""],
          ["Competing with a working system", "\"Is there an existing process or rules system this would replace? Why replace it?\""],
          ["Role not what was advertised", "\"Can I talk to someone on the team about a typical week?\""],
        ] },
        { t: "points", items: ["**Hype vs reality:** a lot of \"AI\" work is data cleaning, SQL and reporting. That work is valuable; just know what you're signing up for.", "**Simple often wins:** a well-understood rules system or a linear model may beat a complex model that nobody can maintain.", "**Keep skills portable:** SQL, Python, statistics and communication move with you between companies and industries.", "**If your dream job doesn't exist,** build it: automate a painful process at your current job, publish analyses, freelance, or start small consulting projects."] },
        { t: "h", text: "Where to go next" },
        { t: "table", head: ["Direction", "Next steps"], rows: [["Analytics", "SQL window functions, a BI tool (Power BI / Tableau), A/B testing"], ["Machine learning", "scikit-learn projects, then deep learning (PyTorch), MLOps basics"], ["Statistics / research", "Experimental design, Bayesian methods, causal inference"], ["Optimisation / operations research", "Linear programming and scheduling (see the appendix lesson)"], ["Data engineering", "SQL, cloud data warehouses, pipelines (Airflow, dbt)"]] },
        { t: "analogy", text: "Joining a data team without asking these questions is like joining a cricket team without asking whether there's a pitch, a coach or a match schedule. You might be great, but you won't get to play." },
        { t: "trap", text: "Don't measure your progress by how advanced your models are. Measure it by decisions changed, money saved and problems solved. That's what employers remember and what advances careers." },
        { t: "trick", text: "**Before you join: success definition, data access, buy-in, realistic goals. After you join: solve real problems simply.**" },
        { t: "exam", items: ["What questions would you ask before accepting a data-science job?", "Tell me about a time a simple solution beat a complex one.", "How would you handle a request to \"add AI\" to a process that already works?", "Where do you see your career in three years?"] },
        { t: "recap", items: ["Clarify the role and what success means", "Check data, tools and leadership buy-in", "Beware replacing working systems for hype", "Keep skills portable", "Measure impact, not model complexity"] },
      ],
      quiz: [
        { q: "A good question to test organisational buy-in is…", options: ["\"Which decisions recently changed because of data work?\"", "\"What's the salary?\"", "\"Do you use Python 3?\"", "\"How big is the office?\""], answer: 0, explain: "It shows whether data work has influence." },
        { q: "Replacing a reliable rules-based system with a complex model…", options: ["Needs a clear reason and evidence it's better", "Is always good", "Is always bad", "Requires no testing"], answer: 0, explain: "Compare against what works today." },
        { q: "Which skills are most portable between companies?", options: ["SQL, Python, statistics, communication", "One company's internal tool", "A single library version", "Office politics"], answer: 0, explain: "They apply everywhere." },
        { q: "Career progress in data is best measured by…", options: ["Impact on decisions and problems solved", "Number of layers in your models", "Number of tools listed", "Hours worked"], answer: 0, explain: "Results matter." },
      ],
    },
  ],
};

export const EM10_EXTRAS: LearnModule = {
  id: "extras",
  title: "Extra topics: from scratch, hill climbing and optimisation",
  titleHi: "अतिरिक्त विषय",
  blurb: "Supplementary topics: build the binomial and beta distributions and the normal CDF and inverse CDF from scratch, fit linear and logistic regression by hill climbing, and solve business problems with linear programming.",
  lessons: [
    {
      id: "distributions-from-scratch",
      title: "Distributions and the inverse CDF from scratch",
      oneLine: "Library functions are just maths: the binomial probability is a count times powers, the beta CDF is an area you can approximate with thin rectangles, and the normal inverse CDF can be found by bisection (binary search) on the CDF. Building them once removes the mystery.",
      minutes: 20,
      blocks: [
        py("Rebuilding SciPy's functions", src`
import math
from scipy.stats import beta as scipy_beta, binom, norm

def binomial(k, n, p):
    return math.comb(n, k) * p ** k * (1 - p) ** (n - k)

def beta_pdf(x, a, b):
    return x ** (a - 1) * (1 - x) ** (b - 1) / (math.gamma(a) * math.gamma(b) / math.gamma(a + b))

def beta_cdf(x, a, b, steps=100_000):            # area under the pdf from 0 to x (midpoint rectangles)
    width = x / steps
    return sum(beta_pdf((i + 0.5) * width, a, b) for i in range(steps)) * width

def normal_cdf(x, mu=0, sigma=1):
    return (1 + math.erf((x - mu) / (sigma * math.sqrt(2)))) / 2

def inverse_normal_cdf(p, mu=0, sigma=1, tol=1e-9):
    low, high = mu - 10 * sigma, mu + 10 * sigma
    while high - low > tol:                      # bisection: keep halving the interval
        mid = (low + high) / 2
        low, high = (mid, high) if normal_cdf(mid, mu, sigma) < p else (low, mid)
    return (low + high) / 2

print("binomial P(8 of 10 | 0.9):", round(binomial(8, 10, 0.9), 6), "| scipy:", round(binom.pmf(8, 10, 0.9), 6))
print("beta CDF(0.9; 9, 3):", round(beta_cdf(0.9, 9, 3), 6), "| scipy:", round(scipy_beta.cdf(0.9, 9, 3), 6))
print("normal CDF(1.96):", round(normal_cdf(1.96), 6), "| scipy:", round(norm.cdf(1.96), 6))
print("inverse CDF(0.975):", round(inverse_normal_cdf(0.975), 6), "| scipy:", round(norm.ppf(0.975), 6))
`, "binomial P(8 of 10 | 0.9): 0.19371 | scipy: 0.19371\nbeta CDF(0.9; 9, 3): 0.910438 | scipy: 0.910438\nnormal CDF(1.96): 0.975002 | scipy: 0.975002\ninverse CDF(0.975): 1.959964 | scipy: 1.959964"),
        { t: "p", text: "Bayes' theorem itself comes from writing the joint probability two ways: P(A and B) = P(A | B)·P(B) = P(B | A)·P(A). Dividing both sides by P(B) gives P(A | B) = P(B | A)·P(A) / P(B)." },
        { t: "analogy", text: "Using a library without knowing its maths is driving without knowing what the pedals do: fine until something goes wrong. Building it once is a driving lesson under the bonnet." },
        { t: "trap", text: "From-scratch versions are for understanding: libraries handle edge cases, precision and speed far better (the rectangle method gets slow and inaccurate near spikes). Use SciPy in real work." },
        { t: "trick", text: "**Binomial = count × powers. CDF = area. Inverse CDF = binary search on the CDF.**" },
        { t: "exam", items: ["How would you compute a CDF if you only had the PDF?", "How does bisection find an inverse CDF?", "Derive Bayes' theorem.", "Why use libraries in practice?"] },
        { t: "recap", items: ["Binomial: C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ", "CDF = integral (area) of the PDF", "Inverse CDF by bisection", "Bayes from two ways of writing a joint probability", "Libraries for real work"] },
      ],
      quiz: [
        { q: "A CDF can be computed from a PDF by…", options: ["Integrating (adding up area)", "Differentiating", "Squaring it", "Taking its log"], answer: 0, explain: "Area up to x." },
        { q: "Bisection finds a value by…", options: ["Repeatedly halving the interval that contains it", "Random guessing", "Sorting", "Differentiating"], answer: 0, explain: "Binary search." },
        { q: "Bayes' theorem follows from…", options: ["Writing P(A and B) two ways", "The CLT", "Linear regression", "The power rule"], answer: 0, explain: "P(A|B)P(B) = P(B|A)P(A)." },
        { q: "Inverse normal CDF of 0.5 (standard normal) is…", options: ["0", "1", "0.5", "1.96"], answer: 0, explain: "The median is 0." },
      ],
    },
    {
      id: "hill-climbing",
      title: "Hill climbing for linear and logistic regression",
      oneLine: "Hill climbing is optimisation without derivatives: randomly nudge a parameter, keep the change if the fit improves, undo it otherwise, and repeat. It's slower than gradient descent but works on any score you can compute, and it shows that \"fitting a model\" is just searching for better parameters.",
      minutes: 18,
      blocks: [
        py("Fitting by random improvements", src`
import math
import random

random.seed(4)
years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
salary = [3.2, 4.1, 4.6, 5.9, 6.3, 7.4, 7.9, 9.1, 9.6, 10.8]

def sse(m, b):
    return sum((m * x + b - y) ** 2 for x, y in zip(years, salary))

m = b = 0.0
best = sse(m, b)
for step in range(150_000):
    dm, db = random.gauss(0, 0.05), random.gauss(0, 0.05)       # a random small move
    if sse(m + dm, b + db) < best:                              # keep it only if it's better
        m, b = m + dm, b + db
        best = sse(m, b)
print(f"hill-climbed line: m={m:.3f} b={b:.3f} SSE={best:.4f}  (least squares: m=0.827 b=2.340)")

dose = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]
recovered = [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1]

def log_likelihood(b0, b1):
    total = 0.0
    for x, y in zip(dose, recovered):
        p = 1 / (1 + math.exp(-(b0 + b1 * x)))
        total += math.log(p) if y else math.log(1 - p)
    return total

b0 = b1 = 0.0
best = log_likelihood(b0, b1)
for step in range(150_000):
    n0, n1 = b0 + random.gauss(0, 0.05), b1 + random.gauss(0, 0.05)
    score = log_likelihood(n0, n1)
    if score > best:                                            # higher likelihood = better
        b0, b1, best = n0, n1, score
print(f"hill-climbed logistic: b0={b0:.2f} b1={b1:.2f} log-likelihood={best:.4f}  (MLE: b0=-5.29 b1=1.25)")
`, "hill-climbed line: m=0.827 b=2.340 SSE=0.3076  (least squares: m=0.827 b=2.340)\nhill-climbed logistic: b0=-5.29 b1=1.25 log-likelihood=-5.0755  (MLE: b0=-5.29 b1=1.25)"),
        { t: "table", head: ["", "Hill climbing", "Gradient descent"], rows: [["Needs derivatives?", "No", "Yes"], ["Speed", "Slow, many wasted tries", "Fast, every step is useful"], ["Works with", "Any score you can compute (even non-smooth)", "Smooth, differentiable losses"], ["Risk", "Stuck on a local peak", "Stuck in a local minimum"]] },
        { t: "analogy", text: "Hill climbing is finding the top of a hill in thick fog by taking a random step: if you went up, stay; if you went down, step back. Gradient descent is having a slope-meter that always tells you the steepest direction." },
        { t: "trap", text: "Hill climbing can stall on a local peak, and its result depends on the step size and the number of tries. Simulated annealing (sometimes accepting worse moves) and random restarts help, but for smooth problems gradient-based methods are far better." },
        { t: "trick", text: "**Random nudge → better? keep it : undo it. Repeat. No calculus needed.**" },
        { t: "exam", items: ["What is hill climbing?", "Hill climbing vs gradient descent?", "What is a local optimum?", "What is simulated annealing?"] },
        { t: "recap", items: ["Nudge parameters randomly; keep improvements", "Works without derivatives", "Converges near the least-squares / MLE answers", "Slow and can get stuck", "Gradient methods are preferred for smooth losses"] },
      ],
      quiz: [
        { q: "Hill climbing keeps a random change when…", options: ["The score improves", "Always", "Never", "The change is negative"], answer: 0, explain: "Otherwise it's undone." },
        { q: "An advantage of hill climbing is…", options: ["It doesn't need derivatives", "It's always fastest", "It never gets stuck", "It needs no score"], answer: 0, explain: "Any computable score works." },
        { q: "For logistic regression, hill climbing tries to…", options: ["Increase the log-likelihood", "Decrease the log-likelihood", "Increase the residuals", "Reduce the data"], answer: 0, explain: "Maximum likelihood." },
        { q: "Getting stuck on a small peak is called…", options: ["A local optimum", "Overfitting", "Regularisation", "Convergence"], answer: 0, explain: "Random restarts help." },
      ],
    },
    {
      id: "linear-programming",
      title: "Linear programming: the best decision under constraints",
      oneLine: "Linear programming finds the best values of decision variables (how many of each product to make) that maximise or minimise a linear objective (profit, cost) while respecting linear constraints (hours, materials, demand). It powers planning, scheduling, logistics and diet problems.",
      minutes: 18,
      blocks: [
        { t: "p", text: "A small workshop makes **chairs** (profit ₹300) and **tables** (profit ₹500). Each chair needs 2 hours of carpentry and 1 hour of polishing; each table needs 4 hours of carpentry and 3 hours of polishing. There are 40 carpentry hours and 24 polishing hours a week, and at most 15 chairs can be sold. What mix maximises profit?" },
        py("Solving with scipy.optimize.linprog", src`
from scipy.optimize import linprog

profit = [300, 500]                      # per chair, per table
c = [-p for p in profit]                 # linprog minimises, so negate to maximise
A_ub = [[2, 4],                          # carpentry hours:  2·chairs + 4·tables <= 40
        [1, 3],                          # polishing hours:  1·chairs + 3·tables <= 24
        [1, 0]]                          # demand:           chairs <= 15
b_ub = [40, 24, 15]
result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=[(0, None), (0, None)], method="highs")
chairs, tables = result.x
print(f"make {chairs:.1f} chairs and {tables:.1f} tables → weekly profit ₹{-result.fun:,.0f}")
print("hours used:", [round(float(sum(a * x for a, x in zip(row, result.x))), 1) for row in A_ub[:2]], "of", b_ub[:2])

result_int = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=[(0, None), (0, None)], integrality=[1, 1], method="highs")
print(f"whole items only: {result_int.x[0]:.0f} chairs, {result_int.x[1]:.0f} tables → ₹{-result_int.fun:,.0f}")
`, "make 15.0 chairs and 2.5 tables → weekly profit ₹5,750\nhours used: [40.0, 22.5] of [40, 24]\nwhole items only: 14 chairs, 3 tables → ₹5,700"),
        { t: "diagram", text: "tables\n 10 ┤╲  carpentry: 2c + 4t ≤ 40\n    │ ╲╲\n  8 ┤   ╲ ╲  polishing: c + 3t ≤ 24\n    │ ▒▒▒╲▒▒╲\n    │ ▒▒▒▒▒╲▒▒╲        ▒ = feasible region\n    │ ▒▒▒▒▒▒▒╲▒▒│\n  0 ┼─────────────┴──── chairs (≤ 15)\n    The best answer is always at a corner of the feasible region." },
        { t: "analogy", text: "Linear programming is planning a thali on a budget: you want the most nutrition (objective) but have limits on money, calories and portions (constraints). The best plate is found at the edge of what's allowed, never in the middle." },
        { t: "trap", text: "Real items are often whole numbers (you can't sell 2.5 tables): that's integer programming, which needs `integrality=` or a MILP solver, and its answer can differ from simply rounding the LP solution. Also, everything must be linear: no products of variables or curves." },
        { t: "trick", text: "**Decision variables + linear objective + linear constraints → linprog (negate to maximise). Whole numbers → integer programming.**" },
        { t: "exam", items: ["What is linear programming?", "What are decision variables, objective and constraints?", "Why is the optimum at a corner of the feasible region?", "LP vs integer programming?", "Give business uses of optimisation."] },
        { t: "recap", items: ["Maximise or minimise a linear objective", "Subject to linear constraints", "linprog minimises: negate to maximise", "Optimum lies at a corner of the feasible region", "Integer programming for whole-number decisions"] },
      ],
      quiz: [
        { q: "To maximise profit with linprog, you…", options: ["Minimise the negative profit", "Maximise directly", "Use a classifier", "Remove constraints"], answer: 0, explain: "linprog only minimises." },
        { q: "In linear programming, the best solution lies…", options: ["At a corner (vertex) of the feasible region", "In the middle", "Outside the constraints", "At zero always"], answer: 0, explain: "A key property of LP." },
        { q: "Requiring whole numbers of products makes it…", options: ["Integer programming", "Linear regression", "Hill climbing", "A hypothesis test"], answer: 0, explain: "Mixed-integer programming." },
        { q: "\"2·chairs + 4·tables ≤ 40\" is a…", options: ["Constraint", "Objective", "Decision variable", "Loss function"], answer: 0, explain: "A limit on carpentry hours." },
      ],
    },
  ],
};
