import type { Course } from "../types";
import { HO01_LANDSCAPE, HO02_PROJECT } from "./m01-landscape-project";
import { HO03_CLASSIFICATION, HO04_TRAINING_MODELS, HO05_SVM_TREES } from "./m02-classification-models";
import { HO06_ENSEMBLES, HO07_DIM_REDUCTION } from "./m03-ensembles-dimreduction";
import { HO08_KERAS_BASICS, HO09_ANN, HO10_TRAINING_DEEP_NETS, HO11_DISTRIBUTED } from "./m04-deep-learning-basics";
import { HO12_CNN, HO13_RNN, HO14_AUTOENCODERS, HO15_RL, HO16_CHECKLIST } from "./m05-cnn-rnn-ae-rl";

/** Hands-On Machine Learning: scikit-learn fundamentals, then deep learning with Keras (multi-backend). */
export const HANDS_ON_ML_COURSE: Course = {
  id: "hands-on-ml",
  title: "Hands-On Machine Learning — Scikit-Learn, Keras and TensorFlow",
  titleHi: "हैंड्स-ऑन मशीन लर्निंग — Scikit-Learn, Keras और TensorFlow",
  short: "Hands-On Machine Learning",
  shortHi: "हैंड्स-ऑन मशीन लर्निंग",
  tagline: "Scikit-Learn · Keras · TensorFlow · Deep learning · Projects · Interview prep",
  subtitle: "Practical machine learning, chapter by chapter: an end-to-end project, classification, training models (gradient descent, regularisation, logistic and softmax regression), SVMs, decision trees, ensembles and dimensionality reduction with scikit-learn; then neural networks, training deep nets, CNNs, RNNs, autoencoders and reinforcement learning with Keras (runs on TensorFlow, JAX or PyTorch). Every example runs and shows its real output.",
  subtitleHi: "व्यावहारिक मशीन लर्निंग, अध्याय दर अध्याय: एंड-टू-एंड प्रोजेक्ट, क्लासिफ़िकेशन, मॉडल ट्रेनिंग (ग्रेडिएंट डिसेंट, रेगुलराइज़ेशन, लॉजिस्टिक और सॉफ़्टमैक्स), SVM, डिसीज़न ट्री, एन्सेम्बल और डायमेंशनैलिटी रिडक्शन scikit-learn के साथ; फिर Keras से न्यूरल नेटवर्क, डीप नेट ट्रेनिंग, CNN, RNN, ऑटोएनकोडर और रीइन्फ़ोर्समेंट लर्निंग। हर उदाहरण का असली आउटपुट।",
  tutorial: true,
  modules: [HO01_LANDSCAPE, HO02_PROJECT, HO03_CLASSIFICATION, HO04_TRAINING_MODELS, HO05_SVM_TREES, HO06_ENSEMBLES, HO07_DIM_REDUCTION, HO08_KERAS_BASICS, HO09_ANN, HO10_TRAINING_DEEP_NETS, HO11_DISTRIBUTED, HO12_CNN, HO13_RNN, HO14_AUTOENCODERS, HO15_RL, HO16_CHECKLIST],
  links: [
    { title: "Essential Math for Data Science", titleHi: "डेटा साइंस के लिए गणित", sub: "The math behind these models", subHi: "इन मॉडलों के पीछे का गणित", href: "/study-material/learn/essential-math" },
    { title: "Python Data Science Handbook", titleHi: "पाइथन डेटा साइंस हैंडबुक", sub: "NumPy, pandas and plotting in depth", subHi: "NumPy, pandas और चार्ट गहराई से", href: "/study-material/learn/python-data-science-handbook" },
  ],
};
