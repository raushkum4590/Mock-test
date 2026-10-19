import type { Block, LearnModule } from "../types";
import { py, src } from "../python/helpers";

const KERAS_NOTE: Block = { t: "note", kind: "info", title: "Running Keras", text: "`pip install keras` plus one backend: `tensorflow`, `jax` or `torch`. These examples set `KERAS_BACKEND` to `\"jax\"` if you haven't chosen one; with another backend the code is identical, but the last digits of the numbers can differ slightly." };

/** Hands-On ML, chapters 13–16 (modernised) + the project checklist appendix. */
export const HO12_CNN: LearnModule = {
  id: "cnns",
  title: "Convolutional neural networks",
  titleHi: "कन्वोल्यूशनल न्यूरल नेटवर्क (CNN)",
  blurb: "How computers see: convolution filters and feature maps (built by hand in NumPy), padding, stride and pooling, a Keras CNN on handwritten digits, the famous architectures from LeNet to ResNet, and transfer learning with pre-trained models.",
  lessons: [
    {
      id: "convolution-pooling",
      title: "Convolution, filters, stride and pooling",
      oneLine: "A convolutional layer slides small filters (e.g. 3×3) across an image; each filter detects one pattern (an edge, a curve) wherever it appears and produces a feature map. Pooling shrinks feature maps, keeping the strongest responses. Stacking them builds from edges to shapes to objects, with far fewer weights than a dense layer.",
      minutes: 20,
      blocks: [
        py("A convolution by hand", src`
import numpy as np

image = np.zeros((6, 6))
image[:, 3:] = 1                                     # left half dark (0), right half bright (1)
vertical_edge = np.array([[-1, 0, 1],
                          [-1, 0, 1],
                          [-1, 0, 1]])                # responds where brightness rises left → right

def conv2d(img, kernel, stride=1):                    # "valid" convolution (no padding)
    k = kernel.shape[0]
    out_size = (img.shape[0] - k) // stride + 1
    out = np.zeros((out_size, out_size))
    for i in range(out_size):
        for j in range(out_size):
            patch = img[i * stride:i * stride + k, j * stride:j * stride + k]
            out[i, j] = np.sum(patch * kernel)        # same weights at every position
    return out

fmap = conv2d(image, vertical_edge)
print("feature map (6×6 image, 3×3 filter → 4×4):")
print(fmap.astype(int))
print("stride 2 output shape:", conv2d(image, vertical_edge, stride=2).shape)

def max_pool(x, size=2):
    h, w = x.shape[0] // size, x.shape[1] // size
    return x[:h * size, :w * size].reshape(h, size, w, size).max(axis=(1, 3))
print("2×2 max pooling of the feature map:")
print(max_pool(fmap).astype(int))
print("weights: 3×3 filter =", vertical_edge.size, "| dense layer 36 → 16 =", 36 * 16)
`, "feature map (6×6 image, 3×3 filter → 4×4):\n[[0 3 3 0]\n [0 3 3 0]\n [0 3 3 0]\n [0 3 3 0]]\nstride 2 output shape: (2, 2)\n2×2 max pooling of the feature map:\n[[3 3]\n [3 3]]\nweights: 3×3 filter = 9 | dense layer 36 → 16 = 576"),
        { t: "table", head: ["Term", "Meaning"], rows: [["Filter / kernel", "A small weight grid (3×3, 5×5) learned during training"], ["Feature map", "The output of one filter over the whole image"], ["Channels", "Colour channels in input; one per filter in later layers"], ["Padding \"same\"", "Add zeros around the border so the output keeps the input size"], ["Stride", "Step size of the slide; stride 2 halves the size"], ["Pooling", "Max (or average) of each small window: smaller maps, some shift-invariance"], ["Receptive field", "How much of the original image a neuron \"sees\"; grows with depth"]] },
        { t: "formula", items: [["Output size", "⌊(n + 2p − k) / s⌋ + 1   (n input, k kernel, p padding, s stride)"], ["Conv layer parameters", "(k × k × input channels + 1) × filters"]] },
        { t: "analogy", text: "A filter is a small stamp-shaped magnifying glass you slide over a photo, looking for one thing, say a vertical edge. Wherever it finds it, the feature map lights up. Early layers find edges, middle layers combine edges into eyes and wheels, and later layers recognise faces and cars." },
        { t: "trap", text: "Dense layers on raw pixels ignore that nearby pixels belong together and need huge numbers of weights. Watch the shapes: images in Keras are (height, width, channels), so 8×8 grayscale is (8, 8, 1). Too much pooling throws away the location detail you may need." },
        { t: "trick", text: "**Conv = sliding shared filters → feature maps. Pool = shrink. Deeper = more abstract features.**" },
        { t: "exam", items: ["What does a convolutional layer compute?", "Why do CNNs need fewer parameters than dense networks?", "What do padding and stride do?", "What is max pooling for?", "Compute the output size: 32×32 input, 5×5 kernel, stride 1, no padding."] },
        { t: "recap", items: ["Filters detect local patterns anywhere", "Feature maps = filter responses", "Padding keeps size; stride shrinks it", "Pooling downsamples", "Weight sharing → few parameters"] },
      ],
      quiz: [
        { q: "A 6×6 image with a 3×3 filter, stride 1, no padding, gives…", options: ["4×4", "6×6", "3×3", "2×2"], answer: 0, explain: "6 − 3 + 1 = 4." },
        { q: "Why are CNNs efficient for images?", options: ["Each filter's weights are shared across all positions", "They have no weights", "They ignore pixels", "They use only one layer"], answer: 0, explain: "Weight sharing." },
        { q: "Padding \"same\" with stride 1…", options: ["Keeps the output size equal to the input size", "Halves the size", "Doubles the size", "Removes channels"], answer: 0, explain: "Zeros are added around the border." },
        { q: "Max pooling 2×2 on a 4×4 map gives…", options: ["2×2", "4×4", "1×1", "8×8"], answer: 0, explain: "Each 2×2 window becomes one value." },
      ],
    },
    {
      id: "keras-cnn-architectures",
      title: "A Keras CNN, famous architectures and pre-trained models",
      oneLine: "A typical CNN repeats convolution + pooling blocks, then flattens into dense layers with a softmax output. Architectures evolved from LeNet-5 to AlexNet, GoogLeNet, VGG and ResNet (skip connections that allow 100+ layers). In practice you usually start from a model pre-trained on ImageNet and fine-tune it.",
      minutes: 24,
      blocks: [
        KERAS_NOTE,
        py("A small CNN on 8×8 handwritten digits", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X = (digits.images / 16.0).reshape(-1, 8, 8, 1)                # (height, width, channels)
X_tr, X_te, y_tr, y_te = train_test_split(X, digits.target, test_size=0.25,
                                          random_state=42, stratify=digits.target)
keras.utils.set_random_seed(42)
model = keras.Sequential([
    keras.Input((8, 8, 1)),
    keras.layers.Conv2D(16, 3, padding="same", activation="relu"),   # 16 filters, 3×3
    keras.layers.MaxPooling2D(2),                                    # 8×8 → 4×4
    keras.layers.Conv2D(32, 3, padding="same", activation="relu"),
    keras.layers.MaxPooling2D(2),                                    # 4×4 → 2×2
    keras.layers.Flatten(),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(10, activation="softmax"),
])
for layer in model.layers:
    print(f"{layer.name:<16} output {str(layer.output.shape):<16} params {layer.count_params()}")
model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model.fit(X_tr, y_tr, epochs=30, batch_size=32, verbose=0, validation_split=0.1,
          callbacks=[keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)])
print(f"test accuracy {model.evaluate(X_te, y_te, verbose=0)[1]:.3f}")
`, "conv2d           output (None, 8, 8, 16) params 160\nmax_pooling2d    output (None, 4, 4, 16) params 0\nconv2d_1         output (None, 4, 4, 32) params 4640\nmax_pooling2d_1  output (None, 2, 2, 32) params 0\nflatten          output (None, 128)      params 0\ndense            output (None, 64)       params 8256\ndropout          output (None, 64)       params 0\ndense_1          output (None, 10)       params 650\ntest accuracy 0.982"),
        { t: "table", head: ["Architecture (year)", "Key idea"], rows: [
          ["LeNet-5 (1998)", "Conv + pooling + dense; read cheques and postcodes"],
          ["AlexNet (2012)", "Deep CNN on GPUs, ReLU, dropout; won ImageNet by a huge margin"],
          ["VGG (2014)", "Simple stacks of 3×3 convolutions, very deep"],
          ["GoogLeNet / Inception (2014)", "Inception modules: parallel 1×1, 3×3, 5×5 filters"],
          ["ResNet (2015)", "Skip (residual) connections: output = F(x) + x; trains 152 layers"],
          ["MobileNet / EfficientNet", "Depthwise-separable convolutions; accurate and small (phones)"],
          ["Vision Transformers (2020+)", "Attention over image patches; strong with big data"],
        ] },
        { t: "code", lang: "python", title: "Transfer learning with a pre-trained model (downloads ImageNet weights)", code: "import keras\n\nbase = keras.applications.EfficientNetB0(weights=\"imagenet\", include_top=False, input_shape=(224, 224, 3))\nbase.trainable = False                                   # freeze the pre-trained feature extractor\n\ninputs = keras.Input((224, 224, 3))\nx = keras.layers.RandomFlip(\"horizontal\")(inputs)       # data augmentation\nx = keras.layers.RandomRotation(0.1)(x)\nx = base(x, training=False)\nx = keras.layers.GlobalAveragePooling2D()(x)\noutputs = keras.layers.Dense(5, activation=\"softmax\")(x)  # e.g. 5 flower types\nmodel = keras.Model(inputs, outputs)\nmodel.compile(loss=\"sparse_categorical_crossentropy\", optimizer=\"adam\", metrics=[\"accuracy\"])\n# model.fit(train_ds, validation_data=val_ds, epochs=5)\n# then: base.trainable = True, recompile with a small learning rate (1e-5), fit a few more epochs" },
        { t: "points", items: ["**Beyond classification:** object detection (YOLO, Faster R-CNN) draws boxes; semantic segmentation (U-Net) labels every pixel.", "**Data augmentation** (flips, crops, rotations, colour changes) is the cheapest way to fight overfitting on images.", "**Classification + localisation:** add a second output head that predicts the bounding box."] },
        { t: "analogy", text: "Fine-tuning a pre-trained model is hiring an experienced photographer who has already seen millions of photos and only teaching them your shop's 5 product types, instead of training a newborn from scratch." },
        { t: "trap", text: "Pre-trained models expect their own input size and preprocessing (`keras.applications.<model>.preprocess_input`). Train the new top with the base frozen first; unfreezing immediately with a high learning rate destroys the pre-trained features." },
        { t: "trick", text: "**[Conv → Conv → Pool] × N → Flatten/GlobalPool → Dense → softmax. Real projects: start from a pre-trained model.**" },
        { t: "exam", items: ["Describe a typical CNN architecture.", "What problem do ResNet's skip connections solve?", "How do you fine-tune a pre-trained CNN?", "What is data augmentation?", "Classification vs detection vs segmentation?"] },
        { t: "recap", items: ["Conv/pool blocks then dense head", "LeNet → AlexNet → VGG → Inception → ResNet → EfficientNet/ViT", "Skip connections enable very deep nets", "Pre-trained models + fine-tuning", "Augment image data"] },
      ],
      quiz: [
        { q: "ResNet's key innovation is…", options: ["Skip (residual) connections", "Using sigmoid", "No convolutions", "One layer"], answer: 0, explain: "output = F(x) + x." },
        { q: "When fine-tuning, first you…", options: ["Freeze the pre-trained base and train the new top", "Unfreeze everything with a high learning rate", "Delete the base", "Train only biases"], answer: 0, explain: "Then optionally unfreeze with a small learning rate." },
        { q: "Keras image input for 8×8 grayscale has shape…", options: ["(8, 8, 1)", "(64,)", "(1, 64)", "(8, 1)"], answer: 0, explain: "Height, width, channels." },
        { q: "Labelling every pixel of an image is…", options: ["Semantic segmentation", "Classification", "Regression", "Clustering"], answer: 0, explain: "E.g. U-Net." },
      ],
    },
  ],
};

export const HO13_RNN: LearnModule = {
  id: "rnns",
  title: "Recurrent neural networks and sequences",
  titleHi: "रिकरंट न्यूरल नेटवर्क और सीक्वेंस",
  blurb: "Networks with memory: a recurrent cell built in NumPy, forecasting a time series with baselines, SimpleRNN and LSTM in Keras, the vanishing-memory problem (LSTM, GRU), and how sequence models led to attention and Transformers for text.",
  lessons: [
    {
      id: "rnn-cells-forecasting",
      title: "Recurrent cells and time-series forecasting",
      oneLine: "A recurrent neuron receives the current input and its own previous output (the hidden state), so it carries memory through a sequence. Trained by backpropagation through time, RNNs forecast time series and process text. Always compare against a naive baseline (\"tomorrow = today\") and a simple linear model.",
      minutes: 24,
      blocks: [
        py("A recurrent cell, step by step", src`
import numpy as np

rng = np.random.default_rng(42)
n_inputs, n_neurons = 3, 2
Wx = rng.normal(0, 0.5, (n_inputs, n_neurons))      # input → hidden
Wh = rng.normal(0, 0.5, (n_neurons, n_neurons))     # hidden → hidden (the memory)
b = np.zeros(n_neurons)

sequence = np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]])
h = np.zeros(n_neurons)                              # initial hidden state
for t, x_t in enumerate(sequence):
    h = np.tanh(x_t @ Wx + h @ Wh + b)              # same weights at every time step
    print(f"t={t} input {x_t.tolist()} → hidden state {h.round(3).tolist()}")
print("the last input is all zeros, but h is not: the cell remembers earlier inputs")
`, "t=0 input [1.0, 0.0, 0.0] → hidden state [0.151, -0.478]\nt=1 input [0.0, 1.0, 0.0] → hidden state [0.37, 0.572]\nt=2 input [0.0, 0.0, 1.0] → hidden state [-0.743, -0.741]\nt=3 input [0.0, 0.0, 0.0] → hidden state [-0.041, 0.408]\nthe last input is all zeros, but h is not: the cell remembers earlier inputs"),
        KERAS_NOTE,
        py("Forecasting a time series: baselines vs RNN vs LSTM", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
import numpy as np

def make_series(n, steps, rng):                     # two sine waves + noise (as in the book)
    freq1, freq2, off1, off2 = rng.random((4, n, 1))
    t = np.linspace(0, 1, steps)
    s = 0.5 * np.sin((t - off1) * (freq1 * 10 + 10)) + 0.2 * np.sin((t - off2) * (freq2 * 20 + 20))
    return (s + 0.1 * (rng.random((n, steps)) - 0.5))[..., np.newaxis].astype("float32")

rng = np.random.default_rng(42)
series = make_series(3000, 21, rng)
X_tr, y_tr = series[:2000, :20], series[:2000, 20]   # 20 steps in, predict step 21
X_te, y_te = series[2000:, :20], series[2000:, 20]

def mse(pred):
    return float(np.mean((np.asarray(pred).reshape(-1) - y_te.reshape(-1)) ** 2))
print(f"naive (repeat last value): MSE {mse(X_te[:, -1]):.4f}")

models = {
    "linear (Dense on 20 steps)": [keras.layers.Flatten(), keras.layers.Dense(1)],
    "SimpleRNN(20) × 2": [keras.layers.SimpleRNN(20, return_sequences=True), keras.layers.SimpleRNN(20), keras.layers.Dense(1)],
    "LSTM(20)": [keras.layers.LSTM(20), keras.layers.Dense(1)],
}
for name, layers in models.items():
    keras.utils.set_random_seed(42)
    model = keras.Sequential([keras.Input((20, 1))] + layers)
    model.compile(loss="mse", optimizer=keras.optimizers.Adam(0.005))
    model.fit(X_tr, y_tr, epochs=20, batch_size=32, verbose=0)
    print(f"{name:<26} MSE {mse(model.predict(X_te, verbose=0)):.4f}")
`, "naive (repeat last value): MSE 0.1060\nlinear (Dense on 20 steps) MSE 0.0147\nSimpleRNN(20) × 2          MSE 0.0080\nLSTM(20)                   MSE 0.0080"),
        { t: "table", head: ["Shape of the problem", "Example"], rows: [["Sequence → vector", "Last 20 days → tomorrow's value; review → sentiment"], ["Vector → sequence", "Image → caption"], ["Sequence → sequence", "Forecast many steps; translation (encoder–decoder)"]] },
        { t: "analogy", text: "An RNN reads a sentence like you do: one word at a time, keeping a running summary in your head (the hidden state). The naive forecast is the weather-forecaster who always says \"same as today\": surprisingly hard to beat, so every model must beat it first." },
        { t: "trap", text: "Never shuffle time-series data across time when splitting: train on the past, test on the future. Scale the series. Keras recurrent layers need 3-D input: (samples, time steps, features). A fancy RNN that doesn't beat the naive and linear baselines isn't worth using." },
        { t: "trick", text: "**RNN = same cell applied at every step + a hidden state. Always beat naive and linear baselines first.**" },
        { t: "exam", items: ["How does a recurrent neuron differ from a dense neuron?", "What is backpropagation through time?", "What input shape do Keras RNN layers expect?", "Why compare with a naive forecast?", "What does return_sequences=True do?"] },
        { t: "recap", items: ["Hidden state = memory", "Shared weights across time steps", "Input shape (samples, steps, features)", "Baselines: naive and linear", "Stack RNN layers with return_sequences=True"] },
      ],
      quiz: [
        { q: "An RNN's hidden state…", options: ["Carries information from earlier time steps", "Is reset at every step", "Stores the labels", "Is the loss"], answer: 0, explain: "That's its memory." },
        { q: "Keras RNN input shape is…", options: ["(samples, time steps, features)", "(samples,)", "(features, samples)", "(height, width, channels)"], answer: 0, explain: "3-D." },
        { q: "To stack two RNN layers, the first needs…", options: ["return_sequences=True", "A softmax", "Dropout", "No input"], answer: 0, explain: "So the next layer gets a full sequence." },
        { q: "A time-series test set should be…", options: ["Later in time than the training set", "Randomly shuffled from all dates", "The same as training", "Earlier than training"], answer: 0, explain: "Predict the future from the past." },
      ],
    },
    {
      id: "lstm-gru-nlp",
      title: "LSTM, GRU and sequences of words",
      oneLine: "Simple RNNs forget quickly because gradients vanish over long sequences. LSTM and GRU cells add gates that decide what to keep, forget and output, so they remember much longer. For text, words become tokens and embeddings; encoder–decoder models translate; attention and Transformers (the basis of today's language models) replaced RNNs for most NLP.",
      minutes: 20,
      blocks: [
        { t: "table", head: ["Cell", "Idea", "Notes"], rows: [
          ["SimpleRNN", "h = tanh(Wx·x + Wh·h + b)", "Short memory; vanishing gradients"],
          ["LSTM", "Forget, input and output gates + a separate cell state (long-term memory)", "Remembers hundreds of steps"],
          ["GRU", "Simplified LSTM: update and reset gates", "Fewer parameters; often as good"],
          ["1-D convolution", "Filters slide over time", "Fast; good for long sequences (WaveNet)"],
          ["Transformer", "Self-attention: every position looks at every other", "Parallel, state of the art for text"],
        ] },
        py("Counting parameters: why LSTM is 4× a SimpleRNN", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras

for layer in [keras.layers.SimpleRNN(32), keras.layers.GRU(32), keras.layers.LSTM(32)]:
    model = keras.Sequential([keras.Input((None, 10)), layer])     # any length, 10 features
    print(f"{type(layer).__name__:<9} 32 units on 10 features: {model.count_params():>5} parameters")
print("SimpleRNN by hand: 32·(10 + 32) + 32 =", 32 * (10 + 32) + 32, "| LSTM has 4 such blocks (3 gates + candidate):", 4 * (32 * (10 + 32) + 32))
`, "SimpleRNN 32 units on 10 features:  1376 parameters\nGRU       32 units on 10 features:  4224 parameters\nLSTM      32 units on 10 features:  5504 parameters\nSimpleRNN by hand: 32·(10 + 32) + 32 = 1376 | LSTM has 4 such blocks (3 gates + candidate): 5504"),
        { t: "code", lang: "python", title: "Sentiment analysis with an embedding + LSTM (downloads the IMDb dataset)", code: "import keras\n\nvocab, length = 10_000, 200\n(X_train, y_train), (X_test, y_test) = keras.datasets.imdb.load_data(num_words=vocab)\nX_train = keras.utils.pad_sequences(X_train, maxlen=length)     # words are already integer ids\nX_test = keras.utils.pad_sequences(X_test, maxlen=length)\n\nmodel = keras.Sequential([\n    keras.Input((length,)),\n    keras.layers.Embedding(vocab, 64),          # each word id → a learned 64-number vector\n    keras.layers.Bidirectional(keras.layers.LSTM(64)),\n    keras.layers.Dense(1, activation=\"sigmoid\"),  # positive or negative review\n])\nmodel.compile(loss=\"binary_crossentropy\", optimizer=\"adam\", metrics=[\"accuracy\"])\nmodel.fit(X_train, y_train, epochs=3, batch_size=128, validation_split=0.2)\nprint(model.evaluate(X_test, y_test))           # typically ≈ 0.85–0.88 accuracy" },
        { t: "points", items: ["**Tokens:** text is split into words or sub-words, each given an integer id.", "**Embeddings:** learned vectors where similar words end up close together (word2vec, GloVe).", "**Encoder–decoder:** one RNN reads the source sentence into a state, another writes the translation.", "**Attention:** the decoder looks back at every input word and weighs the relevant ones; Transformers use only attention.", "**Today:** use pre-trained Transformers (BERT, GPT-style models) via libraries such as Hugging Face and KerasHub."] },
        { t: "analogy", text: "An LSTM is a student with a notebook: gates decide what to write down (input), what to erase (forget) and what to read out for this answer (output). A simple RNN only has short-term memory, so by the end of a long paragraph it has forgotten the beginning." },
        { t: "trap", text: "RNNs process steps one by one, so they are slow to train on long sequences; Transformers parallelise. Pad sequences to a common length and mask the padding. Don't train a big text model from scratch when a pre-trained one exists." },
        { t: "trick", text: "**Long memory → LSTM/GRU. Text → tokens → embeddings → model. Modern NLP → attention/Transformers.**" },
        { t: "exam", items: ["Why do simple RNNs struggle with long sequences?", "Explain the LSTM gates.", "LSTM vs GRU?", "What is a word embedding?", "What is attention and why did Transformers replace RNNs?"] },
        { t: "recap", items: ["Gated cells (LSTM, GRU) remember longer", "LSTM ≈ 4× SimpleRNN parameters", "Embeddings turn words into vectors", "Encoder–decoder for translation", "Attention → Transformers"] },
      ],
      quiz: [
        { q: "LSTM's forget gate…", options: ["Decides what to remove from the cell state", "Adds noise", "Deletes the input", "Sets the learning rate"], answer: 0, explain: "Gates control memory." },
        { q: "GRU compared with LSTM has…", options: ["Fewer gates and parameters", "More gates", "No memory", "Convolutions"], answer: 0, explain: "Update and reset gates only." },
        { q: "A word embedding is…", options: ["A learned vector representing a word", "The word's length", "A one-letter code", "A stop word"], answer: 0, explain: "Similar words → nearby vectors." },
        { q: "Transformers rely on…", options: ["Self-attention", "Recurrence only", "Pooling only", "Decision trees"], answer: 0, explain: "\"Attention is all you need\" (2017)." },
      ],
    },
  ],
};

export const HO14_AUTOENCODERS: LearnModule = {
  id: "autoencoders",
  title: "Autoencoders and generative models",
  titleHi: "ऑटोएनकोडर और जेनरेटिव मॉडल",
  blurb: "Networks that learn to copy their input through a bottleneck: compression (compared with PCA), denoising, unsupervised features, and generative models (variational autoencoders, GANs and diffusion).",
  lessons: [
    {
      id: "stacked-denoising",
      title: "Stacked and denoising autoencoders",
      oneLine: "An autoencoder has an encoder that squeezes the input into a small code and a decoder that rebuilds the input from it. Because the code is small, the network must learn the important patterns. A linear autoencoder learns roughly what PCA does; deep non-linear ones compress better. A denoising autoencoder is trained to rebuild clean inputs from corrupted ones.",
      minutes: 22,
      blocks: [
        KERAS_NOTE,
        py("Compress 64 pixels to 8 numbers: PCA vs autoencoder, then denoising", src`
import os
os.environ.setdefault("KERAS_BACKEND", "jax")
import keras
import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split

X = load_digits().data / 16.0
X_tr, X_te = train_test_split(X, test_size=0.25, random_state=42)

def mse(a, b):
    return float(np.mean((a - b) ** 2))

pca = PCA(n_components=8).fit(X_tr)
print(f"PCA, 8 components:        reconstruction MSE {mse(X_te, pca.inverse_transform(pca.transform(X_te))):.4f}")

keras.utils.set_random_seed(42)
encoder = keras.Sequential([keras.Input((64,)), keras.layers.Dense(32, activation="relu"), keras.layers.Dense(8, activation="relu")])
decoder = keras.Sequential([keras.Input((8,)), keras.layers.Dense(32, activation="relu"), keras.layers.Dense(64, activation="sigmoid")])
autoencoder = keras.Sequential([encoder, decoder])
autoencoder.compile(loss="mse", optimizer="adam")
autoencoder.fit(X_tr, X_tr, epochs=100, batch_size=32, verbose=0)           # target = the input itself
print(f"autoencoder 64→32→8→32→64: reconstruction MSE {mse(X_te, autoencoder.predict(X_te, verbose=0)):.4f}")
print("code for the first test image:", [round(float(v), 2) for v in encoder.predict(X_te[:1], verbose=0)[0]])

rng = np.random.default_rng(42)
noisy_tr = np.clip(X_tr + rng.normal(0, 0.3, X_tr.shape), 0, 1)
noisy_te = np.clip(X_te + rng.normal(0, 0.3, X_te.shape), 0, 1)
keras.utils.set_random_seed(42)
denoiser = keras.Sequential([keras.Input((64,)), keras.layers.Dense(32, activation="relu"),
                             keras.layers.Dense(64, activation="sigmoid")])
denoiser.compile(loss="mse", optimizer="adam")
denoiser.fit(noisy_tr, X_tr, epochs=100, batch_size=32, verbose=0)          # noisy in, clean out
print(f"denoising: noisy test images MSE {mse(noisy_te, X_te):.4f} → after the denoiser {mse(denoiser.predict(noisy_te, verbose=0), X_te):.4f}")
`, "PCA, 8 components:        reconstruction MSE 0.0240\nautoencoder 64→32→8→32→64: reconstruction MSE 0.0200\ncode for the first test image: [5.4, 10.58, 2.91, 2.11, 5.95, 0.44, 2.53, 7.52]\ndenoising: noisy test images MSE 0.0523 → after the denoiser 0.0224"),
        { t: "table", head: ["Autoencoder", "Use"], rows: [["Undercomplete (bottleneck)", "Compression, dimensionality reduction, visualisation"], ["Stacked / deep", "Better non-linear compression"], ["Denoising", "Remove noise; learn robust features"], ["Sparse", "Few active code neurons: interpretable features"], ["Convolutional", "Images"], ["Anomaly detection", "Inputs it rebuilds badly are unusual (fraud, defects)"]] },
        { t: "analogy", text: "An autoencoder is a student summarising a chapter in 8 words and then rewriting the chapter from the summary. To do it well, the summary must keep only what matters. A denoising autoencoder is a restorer who learns what clean photos look like by fixing thousands of scratched copies." },
        { t: "trap", text: "A code that's too big lets the network simply copy the input without learning anything useful. Reconstruction error alone doesn't tell you the features help a downstream task: test them. Use a sigmoid output (with inputs scaled to 0–1) or a linear output with MSE, to match the data range." },
        { t: "trick", text: "**Autoencoder: input → small code → input. Train on (x, x); denoising trains on (noisy x, x).**" },
        { t: "exam", items: ["What is an autoencoder?", "How does a linear autoencoder relate to PCA?", "What is a denoising autoencoder?", "How can autoencoders detect anomalies?", "Why must the code be constrained?"] },
        { t: "recap", items: ["Encoder → code → decoder", "Target equals input", "Linear AE ≈ PCA; deep AE compresses better", "Denoising: noisy in, clean out", "High reconstruction error → anomaly"] },
      ],
      quiz: [
        { q: "An autoencoder is trained with targets equal to…", options: ["Its own inputs", "Class labels", "Random noise", "Zeros"], answer: 0, explain: "fit(X, X)." },
        { q: "A linear autoencoder with MSE learns a subspace like…", options: ["PCA", "k-means", "A decision tree", "Naive Bayes"], answer: 0, explain: "Same span as the top principal components." },
        { q: "A denoising autoencoder is trained on…", options: ["Noisy inputs → clean targets", "Clean inputs → noisy targets", "Labels only", "Images → text"], answer: 0, explain: "It learns to remove noise." },
        { q: "Autoencoders flag anomalies when…", options: ["Reconstruction error is high", "Reconstruction error is zero", "The code is large", "Training is fast"], answer: 0, explain: "Unusual inputs rebuild poorly." },
      ],
    },
    {
      id: "generative-models",
      title: "Generative models: VAEs, GANs and diffusion",
      oneLine: "Generative models create new data that looks like the training data. A variational autoencoder (VAE) learns a smooth code space you can sample from; a GAN pits a generator against a discriminator; diffusion models learn to remove noise step by step and power today's image generators.",
      minutes: 16,
      blocks: [
        { t: "table", head: ["Model", "How it works", "Strength / weakness"], rows: [
          ["Variational autoencoder (VAE)", "Encoder outputs a mean and spread; sample a code; decoder rebuilds. Loss = reconstruction + KL divergence (keeps codes near a normal distribution)", "Smooth, sample-able latent space; images a bit blurry"],
          ["GAN (2014)", "Generator makes fakes from noise; discriminator tries to tell real from fake; they train against each other", "Sharp images; unstable training, mode collapse"],
          ["Diffusion (2020+)", "Add noise to images step by step; train a network to undo one step; generate by denoising pure noise", "Best image quality (Stable Diffusion, DALL·E 3); slower sampling"],
          ["Autoregressive Transformers", "Predict the next token", "Text (GPT-style models), also images and audio"],
        ] },
        { t: "formula", items: [["VAE loss", "reconstruction error + KL( N(μ, σ²) ‖ N(0, 1) )"], ["Reparameterisation trick", "z = μ + σ·ε,  ε ~ N(0, 1)  (lets gradients flow through sampling)"], ["GAN game", "min_G max_D  E[log D(x)] + E[log(1 − D(G(z)))]"]] },
        { t: "code", lang: "python", title: "The core of a GAN training step (Keras + TensorFlow sketch)", code: "import tensorflow as tf\nimport keras\n\ngenerator = keras.Sequential([keras.Input((30,)), keras.layers.Dense(100, activation=\"relu\"), keras.layers.Dense(64, activation=\"sigmoid\")])\ndiscriminator = keras.Sequential([keras.Input((64,)), keras.layers.Dense(100, activation=\"relu\"), keras.layers.Dense(1, activation=\"sigmoid\")])\nbce = keras.losses.BinaryCrossentropy()\ng_opt, d_opt = keras.optimizers.Adam(1e-3), keras.optimizers.Adam(1e-3)\n\ndef train_step(real):\n    noise = tf.random.normal((len(real), 30))\n    with tf.GradientTape() as d_tape, tf.GradientTape() as g_tape:\n        fake = generator(noise)\n        d_real, d_fake = discriminator(real), discriminator(fake)\n        d_loss = bce(tf.ones_like(d_real), d_real) + bce(tf.zeros_like(d_fake), d_fake)  # spot fakes\n        g_loss = bce(tf.ones_like(d_fake), d_fake)                                       # fool the critic\n    d_opt.apply_gradients(zip(d_tape.gradient(d_loss, discriminator.trainable_variables), discriminator.trainable_variables))\n    g_opt.apply_gradients(zip(g_tape.gradient(g_loss, generator.trainable_variables), generator.trainable_variables))" },
        { t: "analogy", text: "A GAN is a counterfeiter (generator) and a police officer (discriminator) improving together: the better the police get at spotting fakes, the better the counterfeits must become, until they look real. Diffusion is a sculptor who learns to remove a little noise at a time until a clear image emerges." },
        { t: "trap", text: "GAN training is famously unstable: if the discriminator wins too easily, the generator stops learning; mode collapse means it produces only a few kinds of output. Judging generated quality is hard; metrics like FID help, but always look at samples." },
        { t: "trick", text: "**VAE = smooth latent space. GAN = generator vs discriminator. Diffusion = learn to denoise.**" },
        { t: "exam", items: ["What makes an autoencoder \"variational\"?", "Explain the GAN training game.", "What is mode collapse?", "How do diffusion models generate images?", "Generative vs discriminative models?"] },
        { t: "recap", items: ["VAE: probabilistic codes + KL loss", "GAN: adversarial training", "Diffusion: iterative denoising", "Autoregressive Transformers for text", "Evaluate samples visually and with metrics"] },
      ],
      quiz: [
        { q: "In a GAN, the discriminator…", options: ["Tells real from generated samples", "Generates images", "Compresses data", "Labels text"], answer: 0, explain: "The generator tries to fool it." },
        { q: "A VAE's loss adds a KL term to…", options: ["Keep codes close to a normal distribution", "Speed up training", "Remove the decoder", "Make images sharper"], answer: 0, explain: "So you can sample new codes." },
        { q: "Diffusion models generate by…", options: ["Removing noise step by step", "Copying training images", "Sorting pixels", "Clustering"], answer: 0, explain: "Starting from pure noise." },
        { q: "Mode collapse means…", options: ["The generator produces little variety", "The model is too slow", "The loss is negative", "The data is missing"], answer: 0, explain: "A classic GAN failure." },
      ],
    },
  ],
};

export const HO15_RL: LearnModule = {
  id: "reinforcement-learning",
  title: "Reinforcement learning",
  titleHi: "रीइन्फ़ोर्समेंट लर्निंग",
  blurb: "Agents that learn by trial and error to maximise rewards: the explore–exploit dilemma (bandits), Markov decision processes and value iteration, Q-learning, and how deep RL (DQN, policy gradients) plays Atari and Go.",
  lessons: [
    {
      id: "bandits-mdp",
      title: "Rewards, exploration and Markov decision processes",
      oneLine: "In reinforcement learning an agent acts in an environment, receives rewards, and learns a policy that maximises the total (discounted) future reward. It must balance exploring new actions with exploiting the best known one. A Markov decision process (MDP) describes states, actions, transition probabilities and rewards; value iteration finds the optimal policy when the MDP is known.",
      minutes: 22,
      blocks: [
        py("Explore vs exploit: an ε-greedy agent on three slot machines", src`
import numpy as np

rng = np.random.default_rng(42)
true_win_rate = [0.3, 0.5, 0.7]                      # unknown to the agent
for epsilon in [0.0, 0.1]:
    estimates, pulls, total = np.zeros(3), np.zeros(3), 0
    for step in range(2000):
        if rng.random() < epsilon:
            arm = int(rng.integers(3))                # explore: try a random machine
        else:
            arm = int(np.argmax(estimates))           # exploit: best estimate so far
        reward = float(rng.random() < true_win_rate[arm])
        pulls[arm] += 1
        estimates[arm] += (reward - estimates[arm]) / pulls[arm]   # running average
        total += reward
    print(f"ε = {epsilon}: total reward {total:.0f} / 2000, pulls per machine {pulls.astype(int).tolist()}, "
          f"estimates {estimates.round(2).tolist()}")
`, "ε = 0.0: total reward 607 / 2000, pulls per machine [2000, 0, 0], estimates [0.3, 0.0, 0.0]\nε = 0.1: total reward 1348 / 2000, pulls per machine [137, 173, 1690], estimates [0.28, 0.55, 0.72]"),
        py("Value iteration on the book's 3-state MDP", src`
import numpy as np

# T[s][a] = probabilities of the next state; R[s][a] = reward for each next state (None = action not allowed)
T = [[[0.7, 0.3, 0.0], [1.0, 0.0, 0.0], [0.8, 0.2, 0.0]],
     [[0.0, 1.0, 0.0], None, [0.0, 0.0, 1.0]],
     [None, [0.8, 0.1, 0.1], None]]
R = [[[+10, 0, 0], [0, 0, 0], [0, 0, 0]],
     [[0, 0, 0], [0, 0, 0], [0, 0, -50]],
     [[0, 0, 0], [+40, 0, 0], [0, 0, 0]]]
possible_actions = [[0, 1, 2], [0, 2], [1]]

def value_iteration(gamma, iterations=100):
    Q = np.full((3, 3), -np.inf)
    for s, actions in enumerate(possible_actions):
        Q[s, actions] = 0.0
    for _ in range(iterations):
        Q_prev = Q.copy()
        for s in range(3):
            for a in possible_actions[s]:        # Bellman: expected reward + discounted best future value
                Q[s, a] = sum(T[s][a][s2] * (R[s][a][s2] + gamma * Q_prev[s2].max()) for s2 in range(3))
    return Q

for gamma in [0.90, 0.95]:
    Q = value_iteration(gamma)
    print(f"γ = {gamma}: best action per state {Q.argmax(axis=1).tolist()} | Q-values of state 0 {Q[0].round(2).tolist()}")
`, "γ = 0.9: best action per state [0, 0, 1] | Q-values of state 0 [18.92, 17.03, 13.62]\nγ = 0.95: best action per state [0, 2, 1] | Q-values of state 0 [21.89, 20.79, 16.85]"),
        { t: "table", head: ["Term", "Meaning"], rows: [["Agent / environment", "The learner / the world it acts in"], ["State, action, reward", "Where it is, what it does, the feedback it gets"], ["Policy π", "The agent's rule: state → action"], ["Discount factor γ", "How much future rewards count (0.9–0.99)"], ["Return", "r₁ + γr₂ + γ²r₃ + …"], ["Q(s, a)", "Expected return from taking action a in state s, then acting optimally"], ["Exploration", "Trying actions to learn; ε-greedy, softmax, optimism"]] },
        { t: "formula", items: [["Bellman optimality", "Q*(s, a) = Σ_s′ T(s, a, s′) · [R(s, a, s′) + γ · max_a′ Q*(s′, a′)]"], ["Optimal policy", "π*(s) = argmax_a Q*(s, a)"]] },
        { t: "analogy", text: "Choosing a restaurant: always going to your favourite is exploiting; sometimes trying a new one is exploring, and you might find a better favourite. The discount factor is patience: a γ close to 1 means you'll accept a small penalty now for a big reward later." },
        { t: "trap", text: "A purely greedy agent (ε = 0) can lock onto the first decent option forever. Rewards may be delayed (credit assignment problem): a chess move matters only at the end of the game. Changing γ can change the optimal policy itself, as the output above shows." },
        { t: "trick", text: "**RL = maximise discounted future reward. Explore a little (ε-greedy). Known MDP → value iteration.**" },
        { t: "exam", items: ["How does RL differ from supervised learning?", "Explain the explore–exploit trade-off.", "What is a Markov decision process?", "What does the discount factor control?", "Write the Bellman optimality equation."] },
        { t: "recap", items: ["Agent, environment, state, action, reward, policy", "Explore vs exploit (ε-greedy)", "MDP: transitions + rewards", "Value iteration with the Bellman equation", "γ trades off now vs later"] },
      ],
      quiz: [
        { q: "An ε-greedy agent with ε = 0.1 explores…", options: ["About 10% of the time", "Never", "Always", "Half the time"], answer: 0, explain: "Random action with probability ε." },
        { q: "A discount factor γ close to 1 means…", options: ["Future rewards matter almost as much as immediate ones", "Only immediate rewards matter", "No rewards matter", "The agent is random"], answer: 0, explain: "A patient agent." },
        { q: "Value iteration requires…", options: ["Knowing the MDP's transitions and rewards", "A neural network", "Labelled data", "Images"], answer: 0, explain: "Otherwise, learn from experience (Q-learning)." },
        { q: "Q(s, a) is…", options: ["The expected return of action a in state s", "The reward of state s", "The number of actions", "The policy's loss"], answer: 0, explain: "The optimal policy picks the max-Q action." },
      ],
    },
    {
      id: "q-learning-deep-rl",
      title: "Q-learning and deep reinforcement learning",
      oneLine: "When the transitions and rewards are unknown, Q-learning learns Q-values from experience: after each step it nudges Q(s, a) towards reward + γ·max Q(next state). Deep Q-networks (DQN) replace the table with a neural network, with replay memory and a target network for stability; policy-gradient methods learn the policy directly.",
      minutes: 20,
      blocks: [
        py("Q-learning the same MDP from experience", src`
import numpy as np

T = [[[0.7, 0.3, 0.0], [1.0, 0.0, 0.0], [0.8, 0.2, 0.0]],
     [[0.0, 1.0, 0.0], None, [0.0, 0.0, 1.0]],
     [None, [0.8, 0.1, 0.1], None]]
R = [[[+10, 0, 0], [0, 0, 0], [0, 0, 0]],
     [[0, 0, 0], [0, 0, 0], [0, 0, -50]],
     [[0, 0, 0], [+40, 0, 0], [0, 0, 0]]]
possible_actions = [[0, 1, 2], [0, 2], [1]]

def step(state, action):                               # the environment: the agent never sees T or R
    next_state = int(rng.choice(3, p=T[state][action]))
    return next_state, R[state][action][next_state]

rng = np.random.default_rng(42)
Q = np.full((3, 3), -np.inf)
for s, actions in enumerate(possible_actions):
    Q[s, actions] = 0.0
gamma, alpha0, decay = 0.90, 0.05, 0.005
state = 0
for iteration in range(50000):
    action = int(rng.choice(possible_actions[state]))  # explore randomly (off-policy)
    next_state, reward = step(state, action)
    target = reward + gamma * Q[next_state].max()      # TD target
    alpha = alpha0 / (1 + iteration * decay)           # shrinking learning rate
    Q[state, action] += alpha * (target - Q[state, action])
    state = next_state
print("learned best action per state:", Q.argmax(axis=1).tolist())
print("learned Q-values of state 0:", Q[0].round(1).tolist(), "| value iteration (γ = 0.9): [18.92, 17.03, 13.62]")
`, "learned best action per state: [0, 0, 1]\nlearned Q-values of state 0: [18.9, 16.8, 13.4] | value iteration (γ = 0.9): [18.92, 17.03, 13.62]"),
        { t: "table", head: ["Method", "Idea", "Famous for"], rows: [
          ["Q-learning", "Table of Q(s, a); TD update", "Small discrete problems"],
          ["DQN (2013–15)", "Neural network predicts Q-values; replay memory + target network", "Atari games from pixels"],
          ["Policy gradients (REINFORCE)", "Increase the probability of actions that led to high returns", "Continuous actions, robotics"],
          ["Actor-critic (A2C, PPO, SAC)", "Policy (actor) + value estimate (critic)", "Today's standard; PPO is also used in RLHF for language models"],
          ["AlphaGo / AlphaZero", "Deep networks + tree search + self-play", "Beat world champions at Go and chess"],
        ] },
        { t: "code", lang: "python", title: "Environments with Gymnasium (pip install gymnasium)", code: "import gymnasium as gym\n\nenv = gym.make(\"CartPole-v1\")                  # balance a pole on a moving cart\nobs, info = env.reset(seed=42)\ntotal = 0\nfor _ in range(500):\n    action = 0 if obs[2] < 0 else 1              # a hand-written policy: push towards the lean\n    obs, reward, terminated, truncated, info = env.step(action)\n    total += reward\n    if terminated or truncated:\n        break\nprint(\"episode reward:\", total)                  # a learned DQN/PPO policy reaches the 500 maximum\n# libraries such as Stable-Baselines3 train PPO/DQN agents in a few lines" },
        { t: "analogy", text: "Q-learning is learning a city's best routes by driving around: after every trip you update your mental score for \"from this junction, turn left\" using what you just experienced, without ever seeing a map (the MDP)." },
        { t: "trap", text: "Naively training a neural network on consecutive RL experiences is unstable (correlated samples, moving targets): DQN needs replay memory and a target network. RL needs a huge number of trials; a simulator is essential, and reward design is easy to get wrong (agents exploit loopholes)." },
        { t: "trick", text: "**Q-learning: Q ← Q + α(r + γ·max Q′ − Q). Deep RL: a network approximates Q or the policy.**" },
        { t: "exam", items: ["Write the Q-learning update rule.", "On-policy vs off-policy learning?", "Why does DQN use replay memory and a target network?", "Value-based vs policy-gradient methods?", "Name real-world uses of RL."] },
        { t: "recap", items: ["Q-learning learns from experience, no model needed", "TD target: r + γ·max Q(s′)", "DQN: neural network + replay + target network", "Policy gradients and actor-critic (PPO)", "Simulators (Gymnasium) for practice"] },
      ],
      quiz: [
        { q: "Q-learning needs to know the transition probabilities?", options: ["No, it learns from experienced transitions", "Yes, always", "Only for rewards", "Only on GPUs"], answer: 0, explain: "Model-free." },
        { q: "The Q-learning target is…", options: ["r + γ·max_a′ Q(s′, a′)", "r only", "Q(s, a) + 1", "γ·r"], answer: 0, explain: "The temporal-difference target." },
        { q: "DQN's replay memory helps by…", options: ["Breaking the correlation between consecutive samples", "Making the agent forget", "Removing rewards", "Speeding up the GPU"], answer: 0, explain: "Train on random past experiences." },
        { q: "PPO is a…", options: ["Policy-gradient (actor-critic) method", "Clustering method", "CNN architecture", "Loss for regression"], answer: 0, explain: "A modern standard." },
      ],
    },
  ],
};

export const HO16_CHECKLIST: LearnModule = {
  id: "ml-project-checklist",
  title: "Machine-learning project checklist and next steps",
  titleHi: "मशीन लर्निंग प्रोजेक्ट चेकलिस्ट और आगे",
  blurb: "The book's appendix as a checklist you can follow on every project and in interviews: frame the problem, get and explore the data, prepare it, shortlist models, fine-tune, present, launch and monitor; plus a study path from here.",
  lessons: [
    {
      id: "checklist",
      title: "The eight-step ML project checklist",
      oneLine: "Every successful ML project follows the same eight steps: frame the problem and the business goal, get the data, explore it, prepare it, shortlist promising models, fine-tune the best ones, present the solution, then launch, monitor and maintain it. Most of the work is in the data and the framing, not the model.",
      minutes: 15,
      blocks: [
        { t: "table", head: ["Step", "Key questions and actions"], rows: [
          ["1. Frame the problem", "Business objective? How will the model be used? Current solution? Supervised/unsupervised, batch/online? Performance measure and the minimum acceptable value?"],
          ["2. Get the data", "What data, how much, where? Legal and privacy checks. Create a workspace; set aside a test set now and never look at it."],
          ["3. Explore", "Copy of the training set; types, missing values, distributions, correlations; visualise; note promising transformations."],
          ["4. Prepare", "Functions/pipelines for cleaning, imputation, encoding, scaling, feature engineering, outliers."],
          ["5. Shortlist models", "Train many quick models from different families; compare with cross-validation; analyse errors and important features."],
          ["6. Fine-tune", "Grid/random/Bayesian search; try ensembles; measure on the test set once, at the end."],
          ["7. Present", "Document; explain what worked and what didn't; clear visuals; state assumptions and limitations."],
          ["8. Launch and monitor", "Deploy (API, batch job, on device); monitor live performance and input drift; retrain regularly; keep backups and rollbacks."],
        ] },
        { t: "points", items: ["**Interview tip:** walk through these 8 steps when asked \"how would you approach this ML problem?\"", "**Baseline first:** a simple model or rule sets the bar every complex model must beat.", "**Reproducibility:** fixed seeds, versioned data and code, saved pipelines (`joblib`, `model.save`).", "**Responsible ML:** check performance across groups for fairness; protect personal data."] },
        { t: "table", head: ["Next step", "Where"], rows: [["Math foundations", "Essential Math for Data Science course"], ["NumPy, pandas, plotting", "Python Data Science Handbook course"], ["Practice", "Kaggle competitions and datasets; rebuild each chapter's project on new data"], ["Deep learning frameworks", "Keras guides, PyTorch tutorials, Hugging Face course"], ["MLOps", "MLflow, model serving (FastAPI), Docker, monitoring"]] },
        { t: "analogy", text: "The checklist is a pilot's pre-flight list: even experienced pilots use it because the cost of a forgotten step (data leakage, a wrong metric, no monitoring) is high, and the list makes it hard to forget." },
        { t: "trap", text: "The commonest real-world failures aren't model choice: they're solving the wrong problem, leaking test data into training, a mismatch between training and production data, and nobody monitoring the model after launch." },
        { t: "trick", text: "**Frame → Get → Explore → Prepare → Shortlist → Fine-tune → Present → Launch & monitor.**" },
        { t: "exam", items: ["List the 8 steps of an ML project.", "Why set aside the test set before exploring?", "What should you monitor after launch?", "What is data drift?", "How do you make an ML project reproducible?"] },
        { t: "recap", items: ["Frame the problem and the metric first", "Lock away the test set early", "Pipelines for preparation", "Many quick models, then fine-tune a few", "Launch, monitor, retrain"] },
      ],
      quiz: [
        { q: "The first step of an ML project is…", options: ["Framing the problem and objective", "Choosing a neural network", "Tuning hyperparameters", "Deploying"], answer: 0, explain: "Everything follows from the goal." },
        { q: "When should the test set be used?", options: ["Once, at the end, to estimate final performance", "For every tuning decision", "Never", "Before splitting"], answer: 0, explain: "Otherwise you overfit it." },
        { q: "Data drift means…", options: ["Production data changes from the training data", "Data is deleted", "Labels are correct", "The model is faster"], answer: 0, explain: "Monitor and retrain." },
        { q: "A baseline model is…", options: ["A simple reference that complex models must beat", "The final model", "A neural network", "The test set"], answer: 0, explain: "E.g. the mean or a linear model." },
      ],
    },
  ],
};
