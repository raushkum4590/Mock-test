import type { Block, LearnModule } from "../types";
import { py, src } from "../python/helpers";

const KERAS_NOTE: Block = { t: "note", kind: "info", title: "Running Keras", text: "`pip install keras` plus one backend: `tensorflow`, `jax` or `torch`. These examples set `KERAS_BACKEND` to `\"jax\"` if you haven't chosen one; with another backend the code is identical, but the last digits of the numbers can differ slightly." };

/** Hands-On ML, chapters 9–12 (modernised): Keras and TensorFlow basics, neural networks, training deep nets, distributed training. */
export const HO08_KERAS_BASICS: LearnModule = {
  id: "keras-tensorflow",
  title: "Up and running with TensorFlow and Keras",
  titleHi: "TensorFlow और Keras की शुरुआत",
  blurb: "From TensorFlow 1's graphs and sessions to today's eager, Keras-first workflow: tensors and operations, automatic differentiation, and the Keras model life cycle (build, compile, fit, evaluate, predict, save) with callbacks.",
  lessons: [
    {
      id: "tensors-autodiff",
      title: "Tensors, operations and automatic differentiation",
      oneLine: "Deep-learning libraries are NumPy-like array (tensor) libraries that can run on GPUs and compute gradients automatically. TensorFlow 1 built a graph first and ran it in a session; today's TensorFlow 2, JAX and PyTorch run code immediately (eager execution) and still compile it for speed when asked.",
      minutes: 18,
      blocks: [
        { t: "table", head: ["", "TensorFlow 1 (book's first edition)", "Today (TF 2 / Keras 3 / JAX / PyTorch)"], rows: [["Style", "Build a graph, then `sess.run()`", "Eager: runs line by line, like NumPy"], ["Variables", "`tf.Variable` + initializers in a session", "Just tensors / layer weights"], ["Gradients", "`tf.gradients` on the graph", "`tf.GradientTape`, `jax.grad`, `loss.backward()`"], ["Speed", "Graph optimisation", "`@tf.function`, `jax.jit`, `torch.compile`"], ["High-level API", "tf.layers, tf.contrib", "Keras (multi-backend)"]] },
        KERAS_NOTE,
        py("Tensors and automatic gradients", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
from keras import ops
import jax

x = ops.convert_to_tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
print("shape:", tuple(x.shape), "| dtype:", x.dtype)
print("x @ xᵀ =", ops.convert_to_numpy(ops.matmul(x, ops.transpose(x))).tolist())
print("mean per column:", ops.convert_to_numpy(ops.mean(x, axis=0)).tolist())
print("softmax of a row:", [round(float(v), 3) for v in ops.convert_to_numpy(ops.softmax(x[0]))])

def f(w1, w2):                                   # f = 3·w1² + 2·w1·w2
    return 3 * w1 ** 2 + 2 * w1 * w2

grads = jax.grad(f, argnums=(0, 1))(5.0, 3.0)    # automatic differentiation
print("∂f/∂w1, ∂f/∂w2 at (5, 3):", [float(g) for g in grads], "| by hand: [6·5 + 2·3, 2·5] = [36, 10]")
`, "shape: (2, 3) | dtype: float32\nx @ xᵀ = [[14.0, 32.0], [32.0, 77.0]]\nmean per column: [2.5, 3.5, 4.5]\nsoftmax of a row: [0.09, 0.245, 0.665]\n∂f/∂w1, ∂f/∂w2 at (5, 3): [36.0, 10.0] | by hand: [6·5 + 2·3, 2·5] = [36, 10]"),
        py("The same gradient in TensorFlow 2", src`
import tensorflow as tf                          # pip install tensorflow

w1, w2 = tf.Variable(5.0), tf.Variable(3.0)
with tf.GradientTape() as tape:                  # records operations for differentiation
    z = 3 * w1 ** 2 + 2 * w1 * w2
print(tape.gradient(z, [w1, w2]))                # [36.0, 10.0]

@tf.function                                     # compiles to a fast graph (TF 1's idea, automated)
def f(x):
    return x ** 2 + 1
print(f(tf.constant(3.0)))
`, undefined, "Requires TensorFlow, so there's no checked output here; the gradients are the same [36, 10] as the JAX example above."),
        { t: "analogy", text: "TensorFlow 1 was writing a whole recipe card first and then handing it to the kitchen (the session). Eager execution is cooking step by step and tasting as you go; compiling (`tf.function`, `jax.jit`) is the kitchen memorising your recipe so it runs faster next time." },
        { t: "trap", text: "Many tutorials and Stack Overflow answers still use TensorFlow 1 (`tf.Session`, `tf.placeholder`); that code doesn't run in TensorFlow 2. Learn the eager style and Keras. Mixing NumPy arrays and tensors works, but converting back and forth inside a training loop is slow." },
        { t: "trick", text: "**Tensors = GPU-ready NumPy. Autodiff = gradients for free. Eager to debug, compile to speed up.**" },
        { t: "exam", items: ["What is a tensor?", "Eager execution vs graph execution?", "What is automatic differentiation and why does deep learning need it?", "What does tf.function / jax.jit do?", "What changed from TensorFlow 1 to TensorFlow 2?"] },
        { t: "recap", items: ["Tensors are multi-dimensional arrays", "Autodiff computes gradients of any computation", "TF 1: graph + session; TF 2/JAX/PyTorch: eager", "Compile for speed (tf.function, jax.jit)", "Keras is the high-level API across backends"] },
      ],
      quiz: [
        { q: "f = 3·w1² + 2·w1·w2. ∂f/∂w2 at w1 = 5 is…", options: ["10", "36", "15", "5"], answer: 0, explain: "2·w1." },
        { q: "Eager execution means…", options: ["Operations run immediately", "A graph is built first and run in a session", "Code runs only on GPUs", "No gradients"], answer: 0, explain: "The TF 2 default." },
        { q: "tf.GradientTape is used to…", options: ["Record operations to compute gradients", "Save models", "Load data", "Plot charts"], answer: 0, explain: "Then tape.gradient(...)." },
        { q: "Which can Keras 3 run on?", options: ["TensorFlow, JAX or PyTorch", "Only TensorFlow 1", "Only NumPy", "Only Excel"], answer: 0, explain: "Multi-backend." },
      ],
    },
    {
      id: "keras-workflow",
      title: "The Keras workflow: build, compile, fit, evaluate, save",
      oneLine: "Every Keras model follows the same life cycle: build it (Sequential, functional API or subclassing), compile it with a loss, an optimiser and metrics, fit it on training data with a validation split, evaluate it on the test set, predict, and save it. Callbacks like EarlyStopping control training automatically.",
      minutes: 22,
      blocks: [
        KERAS_NOTE,
        py("A complete Keras life cycle on handwritten digits", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

keras.utils.set_random_seed(42)                              # reproducible weights and shuffling
digits = load_digits()
X_train, X_test, y_train, y_test = train_test_split(digits.data / 16.0, digits.target, test_size=0.25,
                                                    random_state=42, stratify=digits.target)

model = keras.Sequential([                                   # 1. build
    keras.Input(shape=(64,)),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(10, activation="softmax"),
])
model.compile(loss="sparse_categorical_crossentropy",       # 2. compile
              optimizer="adam", metrics=["accuracy"])
print("parameters:", model.count_params())                  # 64·64 + 64 + 64·10 + 10

early = keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
history = model.fit(X_train, y_train, epochs=100, batch_size=32,   # 3. fit
                    validation_split=0.15, callbacks=[early], verbose=0)
print("epochs run:", len(history.history["loss"]), "| best validation accuracy:",
      round(max(history.history["val_accuracy"]), 3))

loss, acc = model.evaluate(X_test, y_test, verbose=0)        # 4. evaluate
print(f"test accuracy {acc:.3f}")
probs = model.predict(X_test[:3], verbose=0)                # 5. predict
print("predicted:", probs.argmax(axis=1).tolist(), "| actual:", y_test[:3].tolist())

model.save("digits.keras")                                  # 6. save and reload
reloaded = keras.models.load_model("digits.keras")
print("reloaded model agrees:", bool(np.allclose(reloaded.predict(X_test[:3], verbose=0), probs)))
`, "parameters: 4810\nepochs run: 61 | best validation accuracy: 0.985\ntest accuracy 0.973\npredicted: [1, 0, 9] | actual: [1, 0, 9]\nreloaded model agrees: True"),
        { t: "table", head: ["API", "Use when", "Example"], rows: [["Sequential", "A plain stack of layers", "`keras.Sequential([...])`"], ["Functional", "Several inputs/outputs, branches, skip connections", "`out = layer(inp)`; `keras.Model(inputs, outputs)`"], ["Subclassing", "Fully custom behaviour (loops, conditionals)", "`class MyModel(keras.Model): def call(...)`"]] },
        { t: "table", head: ["Callback", "Does"], rows: [["`EarlyStopping`", "Stops when validation stops improving (and restores the best weights)"], ["`ModelCheckpoint`", "Saves the model during training"], ["`ReduceLROnPlateau`", "Lowers the learning rate when progress stalls"], ["`TensorBoard`", "Logs curves for the TensorBoard dashboard"]] },
        { t: "analogy", text: "Compile is choosing the exam (loss), the study method (optimiser) and the report card (metrics). Fit is studying, with a mock test after each chapter (validation). Early stopping is the teacher who says \"stop, you're starting to cram, not learn\"." },
        { t: "trap", text: "The loss must match the labels: `sparse_categorical_crossentropy` for integer labels (0–9), `categorical_crossentropy` for one-hot labels, `binary_crossentropy` with a sigmoid output for yes/no. Scale inputs (here pixels to 0–1), and set a seed for reproducible experiments." },
        { t: "trick", text: "**Build → compile(loss, optimizer, metrics) → fit(validation, callbacks) → evaluate → predict → save.**" },
        { t: "exam", items: ["Describe the Keras model life cycle.", "Sequential vs functional vs subclassing API?", "Which loss for integer labels vs one-hot labels?", "What do callbacks do? Give examples.", "How do you save and load a Keras model?"] },
        { t: "recap", items: ["Sequential for simple stacks; functional for complex graphs", "compile(loss, optimizer, metrics)", "fit with validation_split and callbacks", "evaluate on test; predict for new data", "model.save(\"name.keras\") / keras.models.load_model"] },
      ],
      quiz: [
        { q: "Integer class labels 0–9 need which loss?", options: ["sparse_categorical_crossentropy", "categorical_crossentropy", "mse", "hinge"], answer: 0, explain: "Use categorical_crossentropy with one-hot labels." },
        { q: "A Dense(10) layer on 64 inputs has how many parameters?", options: ["650", "640", "74", "64"], answer: 0, explain: "64·10 weights + 10 biases." },
        { q: "EarlyStopping(restore_best_weights=True)…", options: ["Stops training and keeps the best epoch's weights", "Stops after one epoch", "Saves to disk", "Changes the loss"], answer: 0, explain: "Prevents overfitting." },
        { q: "Which API handles multiple inputs and outputs?", options: ["Functional API", "Sequential only", "sklearn", "None"], answer: 0, explain: "Or subclassing." },
      ],
    },
  ],
};

export const HO09_ANN: LearnModule = {
  id: "neural-networks",
  title: "Introduction to artificial neural networks",
  titleHi: "आर्टिफ़िशियल न्यूरल नेटवर्क का परिचय",
  blurb: "From biological neurons to perceptrons, multi-layer perceptrons and backpropagation; then Keras MLPs for classification and regression, a wide-and-deep network with the functional API, and fine-tuning hyperparameters.",
  lessons: [
    {
      id: "perceptron-mlp",
      title: "Perceptrons, MLPs and backpropagation",
      oneLine: "A perceptron computes a weighted sum and applies a step function; it can only draw a straight boundary. Stacking layers of neurons with smooth, non-linear activations creates a multi-layer perceptron (MLP), trained by backpropagation: a forward pass, an error, a backward pass of gradients, and a gradient-descent step.",
      minutes: 20,
      blocks: [
        py("A perceptron vs an MLP", src`
import numpy as np
from sklearn.datasets import load_iris, make_moons
from sklearn.linear_model import Perceptron
from sklearn.model_selection import cross_val_score
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X = iris.data[:, 2:]                               # petal length and width
y = (iris.target == 0).astype(int)                 # setosa or not: linearly separable
per = Perceptron(random_state=42).fit(X, y)
print("perceptron on setosa: training accuracy", per.score(X, y), "| weights", per.coef_.round(2).tolist())

X_m, y_m = make_moons(n_samples=500, noise=0.2, random_state=42)    # NOT linearly separable
for name, model in [("perceptron", Perceptron(random_state=42)),
                    ("MLP (2 × 16 ReLU)", MLPClassifier(hidden_layer_sizes=(16, 16), max_iter=2000, random_state=42))]:
    acc = cross_val_score(make_pipeline(StandardScaler(), model), X_m, y_m, cv=5).mean()
    print(f"moons, {name:<18} CV accuracy {acc:.3f}")
`, "perceptron on setosa: training accuracy 1.0 | weights [[-1.4, -2.2]]\nmoons, perceptron         CV accuracy 0.818\nmoons, MLP (2 × 16 ReLU)  CV accuracy 0.980"),
        { t: "table", head: ["Backpropagation step", "What happens"], rows: [["Forward pass", "Each layer computes activation(W·x + b); the output is a prediction"], ["Loss", "Compare predictions with targets (cross-entropy, MSE)"], ["Backward pass", "Chain rule: each weight learns how much it contributed to the error"], ["Gradient descent step", "Every weight moves a little against its gradient"], ["Repeat", "For many mini-batches and epochs"]] },
        { t: "table", head: ["Activation", "Range", "Use"], rows: [["Step (perceptron)", "0 or 1", "Historical; no gradient"], ["Sigmoid", "0 to 1", "Binary output"], ["Tanh", "−1 to 1", "Older hidden layers"], ["ReLU", "0 to ∞", "Default for hidden layers"], ["Softmax", "Probabilities summing to 1", "Multiclass output"]] },
        { t: "analogy", text: "One perceptron is a single judge who can only say \"left of this line or right of it\". An MLP is a panel of judges in layers: the first spots simple patterns, the next combine them, so together they can draw any curved border." },
        { t: "trap", text: "The step function has no useful gradient, which is why backpropagation needed smooth activations. Without non-linear activations, any number of layers collapses into one linear model. Scale inputs, or training is slow and unstable." },
        { t: "trick", text: "**Perceptron = one straight line. MLP = layers + non-linear activations. Backprop = chain rule + gradient descent.**" },
        { t: "exam", items: ["What is a perceptron? Its limitation?", "What is an MLP?", "Explain backpropagation.", "Why are non-linear activations necessary?", "Why did ReLU replace sigmoid in hidden layers?"] },
        { t: "recap", items: ["Perceptrons are linear classifiers", "MLPs stack layers with non-linear activations", "Backprop: forward, loss, backward, update", "ReLU hidden layers; sigmoid/softmax outputs", "Scale inputs"] },
      ],
      quiz: [
        { q: "A single perceptron can only learn…", options: ["Linearly separable patterns", "Any pattern", "Images", "Sequences"], answer: 0, explain: "It draws one straight boundary." },
        { q: "Backpropagation uses which calculus rule?", options: ["The chain rule", "The power rule only", "Integration", "L'Hôpital's rule"], answer: 0, explain: "Gradients flow backwards through layers." },
        { q: "The default hidden-layer activation today is…", options: ["ReLU", "Step", "Linear", "Softmax"], answer: 0, explain: "Fast and avoids saturation." },
        { q: "An MLP with no activation functions is equivalent to…", options: ["A linear model", "A decision tree", "k-NN", "A CNN"], answer: 0, explain: "Linear layers compose into one." },
      ],
    },
    {
      id: "keras-mlps",
      title: "Keras MLPs: classification, regression and a wide-and-deep network",
      oneLine: "Classification MLPs end in softmax (or sigmoid) and use cross-entropy; regression MLPs end in one linear neuron and use MSE. The functional API builds non-sequential networks such as wide-and-deep, which feeds inputs both through deep layers and straight to the output. Fine-tune the number of layers, neurons and learning rate on validation data.",
      minutes: 24,
      blocks: [
        KERAS_NOTE,
        py("Regression MLP and a wide-and-deep network", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

keras.utils.set_random_seed(42)
rng = np.random.default_rng(42)
n = 3000
X = rng.uniform(-2, 2, (n, 6))
y = np.sin(X[:, 0]) * 3 + X[:, 1] ** 2 + 2 * X[:, 2] + X[:, 3] * X[:, 4] + rng.normal(0, 0.3, n)   # non-linear target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler().fit(X_tr)
X_tr, X_te = scaler.transform(X_tr), scaler.transform(X_te)

def rmse(model):
    return float(np.sqrt(np.mean((model.predict(X_te, verbose=0).ravel() - y_te) ** 2)))

linear = keras.Sequential([keras.Input((6,)), keras.layers.Dense(1)])          # baseline: linear regression
mlp = keras.Sequential([keras.Input((6,)), keras.layers.Dense(64, activation="relu"),
                        keras.layers.Dense(64, activation="relu"), keras.layers.Dense(1)])

inputs = keras.Input((6,))                                                      # wide & deep (functional API)
deep = keras.layers.Dense(64, activation="relu")(inputs)
deep = keras.layers.Dense(64, activation="relu")(deep)
merged = keras.layers.Concatenate()([inputs, deep])                             # raw inputs skip ahead
wide_deep = keras.Model(inputs, keras.layers.Dense(1)(merged))

for name, model in [("linear", linear), ("MLP 2×64", mlp), ("wide & deep", wide_deep)]:
    model.compile(loss="mse", optimizer=keras.optimizers.Adam(learning_rate=0.003))
    model.fit(X_tr, y_tr, epochs=60, batch_size=64, validation_split=0.1, verbose=0,
              callbacks=[keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True)])
    print(f"{name:<12} test RMSE {rmse(model):.3f}")
`, "linear       test RMSE 1.882\nMLP 2×64     test RMSE 0.397\nwide & deep  test RMSE 0.391"),
        py("Fine-tuning hyperparameters", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_tr, X_val, y_tr, y_val = train_test_split(digits.data / 16.0, digits.target, test_size=0.3,
                                            random_state=42, stratify=digits.target)
results = []
for n_hidden in [1, 2]:
    for n_neurons in [16, 64]:
        for lr in [0.001, 0.01]:
            keras.utils.set_random_seed(42)
            layers = [keras.Input((64,))] + [keras.layers.Dense(n_neurons, activation="relu") for _ in range(n_hidden)]
            model = keras.Sequential(layers + [keras.layers.Dense(10, activation="softmax")])
            model.compile(loss="sparse_categorical_crossentropy", optimizer=keras.optimizers.Adam(lr), metrics=["accuracy"])
            model.fit(X_tr, y_tr, epochs=25, batch_size=32, verbose=0)
            results.append((model.evaluate(X_val, y_val, verbose=0)[1], n_hidden, n_neurons, lr))
for acc, h, n, lr in sorted(results, reverse=True)[:3]:
    print(f"validation accuracy {acc:.3f}  ← {h} hidden layer(s) × {n} neurons, learning rate {lr}")
print("worst setting:", round(min(results)[0], 3))
`, "validation accuracy 0.978  ← 1 hidden layer(s) × 64 neurons, learning rate 0.01\nvalidation accuracy 0.970  ← 2 hidden layer(s) × 64 neurons, learning rate 0.01\nvalidation accuracy 0.969  ← 2 hidden layer(s) × 64 neurons, learning rate 0.001\nworst setting: 0.933"),
        { t: "table", head: ["Hyperparameter", "Typical starting point"], rows: [["Hidden layers", "1–3 for tabular data; more for images/text (with transfer learning)"], ["Neurons per layer", "Same size in each layer (e.g. 64–300); prefer slightly too many + early stopping"], ["Learning rate", "The most important one: try 1e-4 … 1e-2 on a log scale"], ["Optimiser", "Adam (or AdamW)"], ["Batch size", "32 to 256; larger with learning-rate warm-up"], ["Activation", "ReLU (hidden), task-specific output"]] },
        { t: "analogy", text: "Wide-and-deep is a cricket selection panel that considers both the detailed analysis of a player's technique (deep path) and their simple raw stats (wide path), because sometimes the raw numbers already say a lot." },
        { t: "trap", text: "Neural networks for tabular data often don't beat gradient boosting; always compare. Tune with a validation set (or Keras Tuner) and never with the test set. Without early stopping or regularisation, bigger networks overfit fast." },
        { t: "trick", text: "**Regression: 1 linear output + MSE. Classification: softmax + cross-entropy. Tune the learning rate first.**" },
        { t: "exam", items: ["Output layer and loss for regression vs binary vs multiclass?", "What is a wide-and-deep network?", "Which hyperparameter matters most?", "How do you search hyperparameters efficiently? (Random search, Keras Tuner, Bayesian optimisation.)", "When would you not use a neural network for tabular data?"] },
        { t: "recap", items: ["Regression: Dense(1), MSE", "Classification: softmax/sigmoid + cross-entropy", "Functional API for branching models (wide & deep)", "Learning rate first, then size", "Compare with simpler models"] },
      ],
      quiz: [
        { q: "A regression MLP's output layer usually is…", options: ["Dense(1) with no activation", "Dense(10, softmax)", "Dense(1, sigmoid)", "Conv2D"], answer: 0, explain: "A single linear output." },
        { q: "In wide-and-deep, the wide path…", options: ["Sends inputs straight to the output layer", "Uses convolutions", "Has no inputs", "Replaces the deep path"], answer: 0, explain: "Simple patterns skip the deep layers." },
        { q: "The single most important hyperparameter to tune is usually…", options: ["The learning rate", "The random seed", "The layer names", "The number of outputs"], answer: 0, explain: "Search it on a log scale." },
        { q: "Hyperparameters should be tuned on…", options: ["A validation set", "The test set", "The training loss only", "Nothing"], answer: 0, explain: "Keep the test set clean." },
      ],
    },
  ],
};

export const HO10_TRAINING_DEEP_NETS: LearnModule = {
  id: "training-deep-nets",
  title: "Training deep neural networks",
  titleHi: "डीप न्यूरल नेटवर्क की ट्रेनिंग",
  blurb: "The problems of deep networks and their fixes: vanishing gradients (ReLU, He initialisation, batch normalisation), reusing pre-trained layers (transfer learning), faster optimisers and learning-rate schedules, and regularisation with dropout and early stopping.",
  lessons: [
    {
      id: "vanishing-transfer",
      title: "Vanishing gradients, initialisation, batch norm and transfer learning",
      oneLine: "In deep networks, gradients can shrink to almost nothing in early layers (vanishing) or blow up (exploding). Fixes: ReLU-family activations, He initialisation, batch normalisation and gradient clipping. Transfer learning reuses layers trained on a related task, so a new task needs far less data.",
      minutes: 24,
      blocks: [
        KERAS_NOTE,
        py("Deep sigmoid vs deep ReLU + He initialisation", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_tr, X_te, y_tr, y_te = train_test_split(digits.data / 16.0, digits.target, test_size=0.25,
                                          random_state=42, stratify=digits.target)

def deep_net(kind):
    layers = [keras.Input((64,))]
    for _ in range(10):                                    # 10 hidden layers
        if kind == "sigmoid":
            layers.append(keras.layers.Dense(32, activation="sigmoid"))
        else:
            layers.append(keras.layers.Dense(32, activation="relu", kernel_initializer="he_normal"))
    return keras.Sequential(layers + [keras.layers.Dense(10, activation="softmax")])

for kind in ["sigmoid", "relu + He"]:
    keras.utils.set_random_seed(42)
    model = deep_net(kind)
    model.compile(loss="sparse_categorical_crossentropy", optimizer=keras.optimizers.SGD(0.05), metrics=["accuracy"])
    history = model.fit(X_tr, y_tr, epochs=20, batch_size=32, verbose=0)
    print(f"{kind:<10} training accuracy after epochs 1/5/10/20: {[round(history.history['accuracy'][i], 2) for i in (0, 4, 9, 19)]}, "
          f"test {model.evaluate(X_te, y_te, verbose=0)[1]:.3f}")
`, "sigmoid    training accuracy after epochs 1/5/10/20: [0.09, 0.1, 0.08, 0.08], test 0.100\nrelu + He  training accuracy after epochs 1/5/10/20: [0.23, 0.56, 0.87, 0.84], test 0.904"),
        { t: "p", text: "With 10 sigmoid layers and plain SGD, the gradients reaching the first layers are tiny, so the network stays at chance level (about 10% on 10 digits) for all 20 epochs. The same depth with ReLU and He initialisation learns. Batch normalisation and residual connections push this further: they are what make networks with 50–100+ layers trainable (batch norm needs reasonably large batches and datasets to shine)." },
        py("Transfer learning: reuse layers for a new task", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X, y = digits.data / 16.0, digits.target
X_a, X_b, y_a, y_b = train_test_split(X, y, test_size=0.5, random_state=42, stratify=y)

keras.utils.set_random_seed(42)                            # model A: recognise digits 0–9 (plenty of labels)
model_a = keras.Sequential([keras.Input((64,)), keras.layers.Dense(64, activation="relu", name="h1"),
                            keras.layers.Dense(64, activation="relu", name="h2"), keras.layers.Dense(10, activation="softmax")])
model_a.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model_a.fit(X_a, y_a, epochs=30, verbose=0)

odd_b = y_b % 2                                            # task B: odd or even? only 40 labelled images
train, test = np.arange(40), np.arange(40, len(X_b))

def model_b(reuse):
    keras.utils.set_random_seed(7)
    h1 = keras.layers.Dense(64, activation="relu")
    h2 = keras.layers.Dense(64, activation="relu")
    m = keras.Sequential([keras.Input((64,)), h1, h2, keras.layers.Dense(1, activation="sigmoid")])
    if reuse:
        h1.set_weights(model_a.get_layer("h1").get_weights())   # copy the learned feature detectors
        h2.set_weights(model_a.get_layer("h2").get_weights())
        h1.trainable = h2.trainable = False                       # freeze them
    m.compile(loss="binary_crossentropy", optimizer=keras.optimizers.Adam(0.01), metrics=["accuracy"])
    m.fit(X_b[train], odd_b[train], epochs=100, verbose=0)
    return m.evaluate(X_b[test], odd_b[test], verbose=0)[1]

print(f"task B from scratch (40 images):  test accuracy {model_b(False):.3f}")
print(f"task B reusing model A's layers:  test accuracy {model_b(True):.3f}")
`, "task B from scratch (40 images):  test accuracy 0.847\ntask B reusing model A's layers:  test accuracy 0.901"),
        { t: "table", head: ["Problem", "Fix"], rows: [["Vanishing gradients", "ReLU/ELU/GELU activations, He initialisation, batch norm, residual connections"], ["Exploding gradients", "Gradient clipping (`clipnorm=1.0` in the optimiser), batch norm"], ["Too little labelled data", "Transfer learning from a related task; unsupervised pretraining"], ["Slow training", "Better optimisers (next lesson), batch norm"]] },
        { t: "analogy", text: "Transfer learning is a cricketer switching to baseball: hand-eye coordination and fitness (lower layers) transfer directly; only the sport-specific skills (top layers) need retraining. That's why 40 examples can be enough." },
        { t: "trap", text: "Transfer learning works when tasks are similar (images → images); reusing layers from an unrelated task can even hurt. (Here, layers trained only on digits 0–4 and frozen did *worse* than training from scratch on digits 5–9: features for one set of shapes didn't fit the other. Always compare against a from-scratch baseline.) Freeze reused layers at first, train the new top, then optionally unfreeze some layers with a low learning rate. Batch norm behaves differently in training and inference: Keras handles this automatically." },
        { t: "trick", text: "**Deep net won't learn? ReLU + He init + batch norm. Little data? Reuse a pre-trained network's layers.**" },
        { t: "exam", items: ["What are vanishing and exploding gradients?", "Why does He initialisation help?", "What does batch normalisation do?", "What is transfer learning? When does it work?", "What is gradient clipping?"] },
        { t: "recap", items: ["Deep sigmoid nets suffer vanishing gradients", "ReLU + He init + batch norm fix most of it", "Clip gradients against explosions", "Transfer learning: reuse and freeze lower layers", "Fine-tune with a small learning rate"] },
      ],
      quiz: [
        { q: "Vanishing gradients mostly affect…", options: ["The early (lower) layers", "The output layer", "The loss function", "The data"], answer: 0, explain: "Gradients shrink as they flow backwards." },
        { q: "Which initialisation pairs with ReLU?", options: ["He", "Zeros", "All ones", "Random integers"], answer: 0, explain: "Glorot suits sigmoid/tanh." },
        { q: "Freezing a layer means…", options: ["Its weights don't change during training", "It's deleted", "It's duplicated", "It uses a GPU"], answer: 0, explain: "layer.trainable = False." },
        { q: "Transfer learning helps most when…", options: ["The new task is similar and has little data", "Tasks are unrelated", "You have unlimited data", "The model has one layer"], answer: 0, explain: "Lower layers learn reusable features." },
      ],
    },
    {
      id: "optimizers-regularization",
      title: "Faster optimisers, learning-rate schedules and regularisation",
      oneLine: "Plain SGD is slow; momentum, RMSProp, Adam and AdamW reach good solutions much faster. A learning-rate schedule (warm-up, decay, one-cycle) helps further. To prevent overfitting, use early stopping, L1/L2 penalties and dropout, which randomly switches neurons off during training.",
      minutes: 22,
      blocks: [
        KERAS_NOTE,
        py("Optimisers compared, then dropout", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_tr, X_te, y_tr, y_te = train_test_split(digits.data / 16.0, digits.target, test_size=0.25,
                                          random_state=42, stratify=digits.target)

def net(dropout=0.0):
    layers = [keras.Input((64,))]
    for _ in range(2):
        layers.append(keras.layers.Dense(128, activation="relu"))
        if dropout:
            layers.append(keras.layers.Dropout(dropout))           # randomly drop neurons while training
    return keras.Sequential(layers + [keras.layers.Dense(10, activation="softmax")])

optimisers = {
    "SGD": lambda: keras.optimizers.SGD(learning_rate=0.01),
    "SGD + momentum": lambda: keras.optimizers.SGD(learning_rate=0.01, momentum=0.9),
    "RMSprop": lambda: keras.optimizers.RMSprop(learning_rate=0.001),
    "Adam": lambda: keras.optimizers.Adam(learning_rate=0.001),
}
for name, make in optimisers.items():
    keras.utils.set_random_seed(42)
    model = net()
    model.compile(loss="sparse_categorical_crossentropy", optimizer=make())
    history = model.fit(X_tr, y_tr, epochs=5, batch_size=32, verbose=0)
    print(f"{name:<15} training loss after 5 epochs: {history.history['loss'][-1]:.3f}")

schedule = keras.optimizers.schedules.ExponentialDecay(0.01, decay_steps=200, decay_rate=0.5)
print("scheduled learning rate at steps 0, 200, 400:", [round(float(schedule(s)), 4) for s in (0, 200, 400)])

for rate in [0.0, 0.5]:
    keras.utils.set_random_seed(42)
    model = net(rate)
    model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
    h = model.fit(X_tr, y_tr, epochs=40, batch_size=32, verbose=0, validation_data=(X_te, y_te))
    print(f"dropout {rate}: final train accuracy {h.history['accuracy'][-1]:.3f}, validation {h.history['val_accuracy'][-1]:.3f}, "
          f"gap {h.history['accuracy'][-1] - h.history['val_accuracy'][-1]:.3f}")
`, "SGD             training loss after 5 epochs: 1.771\nSGD + momentum  training loss after 5 epochs: 0.202\nRMSprop         training loss after 5 epochs: 0.174\nAdam            training loss after 5 epochs: 0.160\nscheduled learning rate at steps 0, 200, 400: [0.01, 0.005, 0.0025]\ndropout 0.0: final train accuracy 1.000, validation 0.980, gap 0.020\ndropout 0.5: final train accuracy 0.966, validation 0.987, gap -0.021"),
        { t: "table", head: ["Optimiser", "Idea"], rows: [["SGD", "Step against the gradient"], ["Momentum", "Keep rolling in the recent direction: faster through flat areas"], ["Nesterov", "Momentum that looks ahead before stepping"], ["RMSProp", "Adapt the step for each weight by recent gradient sizes"], ["Adam / AdamW", "Momentum + RMSProp (+ decoupled weight decay): the usual default"]] },
        { t: "table", head: ["Regulariser", "How"], rows: [["Early stopping", "Stop at the best validation epoch"], ["L2 / L1", "`kernel_regularizer=keras.regularizers.l2(1e-4)`"], ["Dropout", "`Dropout(0.2–0.5)` after layers; off at prediction time"], ["Max-norm", "Cap each neuron's weight vector length"], ["Data augmentation", "Create varied training examples (flips, crops, noise)"]] },
        { t: "analogy", text: "Momentum is a ball rolling downhill that builds up speed, instead of a cautious walker re-checking the slope every step. Dropout is a team where random players sit out each practice, so nobody relies on one star player; the whole team becomes stronger." },
        { t: "trap", text: "Dropout makes training accuracy look worse (it's measured with dropout on) and needs more epochs; judge it by validation performance. A learning rate that's too high makes even Adam diverge; when in doubt, find it with a learning-rate range test." },
        { t: "trick", text: "**Default: Adam(W) + a learning-rate schedule + early stopping (+ dropout if overfitting).**" },
        { t: "exam", items: ["How does momentum help gradient descent?", "Explain Adam.", "What is a learning-rate schedule? Why use one?", "How does dropout regularise a network?", "Is dropout applied at prediction time?"] },
        { t: "recap", items: ["Momentum, RMSProp, Adam speed up training", "Learning-rate schedules: start higher, decay", "Early stopping, L1/L2, dropout, max-norm regularise", "Dropout is off at inference", "Judge regularisation by validation scores"] },
      ],
      quiz: [
        { q: "Adam combines…", options: ["Momentum and RMSProp-style adaptive steps", "Dropout and batch norm", "SGD and k-NN", "PCA and SVD"], answer: 0, explain: "The common default optimiser." },
        { q: "Dropout during prediction is…", options: ["Turned off", "Doubled", "Applied to inputs only", "Required"], answer: 0, explain: "Keras handles it automatically." },
        { q: "A learning-rate schedule usually…", options: ["Reduces the learning rate as training progresses", "Keeps it fixed", "Increases it forever", "Removes it"], answer: 0, explain: "Big steps early, small steps late." },
        { q: "Dropout typically makes the train–validation gap…", options: ["Smaller", "Larger", "Unchanged", "Negative always"], answer: 0, explain: "It reduces overfitting." },
      ],
    },
  ],
};

export const HO11_DISTRIBUTED: LearnModule = {
  id: "distributed-training",
  title: "Distributing training across devices and servers",
  titleHi: "डिवाइस और सर्वर पर ट्रेनिंग बाँटना",
  blurb: "How large models are trained: GPUs and TPUs, data parallelism and model parallelism, synchronous vs asynchronous updates, and today's tools (tf.distribute strategies, JAX sharding, PyTorch DDP).",
  lessons: [
    {
      id: "parallelism",
      title: "GPUs, data parallelism and model parallelism",
      oneLine: "Deep learning is mostly matrix multiplication, which GPUs and TPUs run in parallel. To train faster or bigger, split the work: data parallelism gives every device a copy of the model and a different slice of each batch, then averages the gradients; model parallelism splits one huge model across devices.",
      minutes: 16,
      blocks: [
        { t: "table", head: ["Approach", "How it works", "Use when"], rows: [
          ["Single GPU", "Move tensors and the model to the GPU", "Most projects; often enough"],
          ["Data parallelism (synchronous)", "Each GPU has a full model copy and a slice of the batch; gradients are averaged (all-reduce) every step", "The model fits on one GPU; you want faster training"],
          ["Data parallelism (asynchronous)", "Workers update shared parameters independently", "Older setups; stale gradients can hurt"],
          ["Model / pipeline parallelism", "Split layers (or parts of layers) across devices", "The model doesn't fit on one device (large language models)"],
          ["Multi-machine", "The same ideas across servers", "Very large models and datasets"],
        ] },
        { t: "code", lang: "python", title: "Data parallelism in TensorFlow (multi-GPU)", code: "import tensorflow as tf\n\nstrategy = tf.distribute.MirroredStrategy()          # one model copy per local GPU\nprint(\"devices:\", strategy.num_replicas_in_sync)\nwith strategy.scope():                               # variables created here are mirrored\n    model = tf.keras.Sequential([...])\n    model.compile(loss=\"sparse_categorical_crossentropy\", optimizer=\"adam\")\nmodel.fit(dataset, epochs=10)                        # each batch is split across GPUs automatically\n\n# across machines: tf.distribute.MultiWorkerMirroredStrategy(); on TPUs: tf.distribute.TPUStrategy(resolver)" },
        { t: "points", items: ["**PyTorch:** `DistributedDataParallel` (DDP), plus FSDP to shard huge models.", "**JAX:** `jax.sharding` and `pmap`/`pjit` to place data and parameters on many devices.", "**Input pipelines matter:** prefetch and parallel loading (`tf.data`, PyTorch `DataLoader(num_workers=…)`) so GPUs never wait for data.", "**Mixed precision** (16-bit floats) roughly doubles speed and halves memory on modern GPUs.", "**Free GPUs to practise:** Google Colab and Kaggle notebooks."] },
        { t: "analogy", text: "Data parallelism is several teachers each marking a different pile of the same exam using the same answer key, then agreeing on corrections to the key together. Model parallelism is an assembly line where each worker builds one part of a huge machine." },
        { t: "trap", text: "More GPUs don't speed things up linearly: communication (averaging gradients) costs time, and larger effective batch sizes usually need a higher learning rate with warm-up. Start on one GPU; distribute only when needed." },
        { t: "trick", text: "**Model fits on one GPU → data parallelism. Model too big → model/pipeline parallelism. Always keep the GPU fed with data.**" },
        { t: "exam", items: ["Why are GPUs good for deep learning?", "Data parallelism vs model parallelism?", "Synchronous vs asynchronous updates?", "What is all-reduce?", "What is mixed-precision training?"] },
        { t: "recap", items: ["GPUs/TPUs parallelise matrix maths", "Data parallelism: copies of the model, split batches, average gradients", "Model parallelism: split the model itself", "tf.distribute, PyTorch DDP/FSDP, JAX sharding", "Fast input pipelines and mixed precision"] },
      ],
      quiz: [
        { q: "In synchronous data parallelism, each device has…", options: ["A full copy of the model and a slice of each batch", "A different model", "Only some layers", "No data"], answer: 0, explain: "Gradients are then averaged." },
        { q: "Model parallelism is needed when…", options: ["The model doesn't fit on one device", "The data is small", "You have one CPU", "Training is fast enough"], answer: 0, explain: "E.g. large language models." },
        { q: "tf.distribute.MirroredStrategy is for…", options: ["Multiple GPUs on one machine", "Single CPU only", "Data cleaning", "Saving models"], answer: 0, explain: "Synchronous data parallelism." },
        { q: "Doubling GPUs typically speeds up training by…", options: ["Less than 2× (communication overhead)", "Exactly 2×", "More than 2×", "Nothing"], answer: 0, explain: "Gradient syncing costs time." },
      ],
    },
  ],
};
