import type { Course } from "../types";
import { DS01_INTRO, DS02_PYTHON_VIZ, DS03_LINEAR_ALGEBRA } from "./d01-foundations";
import { DS04_STATS_PROBABILITY, DS05_INFERENCE, DS06_GRADIENT_DESCENT } from "./d02-stats-inference-gd";
import { DS07_DATA, DS08_ML_BASICS, DS09_KNN_NB } from "./d03-data-ml-knn";
import { DS10_REGRESSION, DS11_TREES, DS12_NEURAL_NETWORKS } from "./d04-models";
import { DS13_CLUSTERING, DS14_NLP, DS15_NETWORKS_RECOMMENDERS, DS16_SCALE_CAREER } from "./d05-unsupervised-nlp-networks-scale";
import { DS17_NUMPY, DS18_PANDAS_BASICS, DS19_PANDAS_ANALYSIS } from "./d06-numpy-pandas";
import { DS20_VISUALIZATION, DS21_SKLEARN } from "./d07-viz-sklearn";
import { DS22_DEEP_LEARNING, DS23_CAPSTONE } from "./d08-deep-learning-capstone";
import { DS24_JUPYTER, DS25_ML_DEPTH, NUMPY_EXTRA, PANDAS_ANALYSIS_EXTRA, PANDAS_BASICS_EXTRA, VIZ_EXTRA } from "./d09-handbook-depth";

/** Complete data science: every method built from scratch in plain Python, then the industry toolkit (NumPy, pandas, matplotlib, seaborn, scikit-learn, deep learning) and a capstone project. */
export const DATA_SCIENCE_COURSE: Course = {
  id: "data-science",
  title: "Data Science — complete course, beginner to job-ready",
  titleHi: "डेटा साइंस — संपूर्ण कोर्स, शुरुआत से नौकरी तक",
  short: "Data Science",
  shortHi: "डेटा साइंस",
  tagline: "Python · Jupyter · NumPy · pandas · matplotlib · seaborn · scikit-learn · Deep learning · SQL · Projects · Interview prep",
  subtitle: "The complete data science path. Part 1: build every idea from scratch in plain Python (vectors, statistics, probability, hypothesis tests, gradient descent, k-NN, naive Bayes, regression, decision trees, neural networks, clustering, NLP, network analysis, recommenders, SQL, MapReduce) so you truly understand it. Part 2: the industry toolkit — Jupyter and IPython, NumPy, pandas, matplotlib, seaborn, scikit-learn pipelines and tuning, machine learning in depth (validation curves, feature engineering, SVMs, manifold learning, Gaussian mixtures), deep learning with PyTorch and transformers — ending with a capstone project, deployment and interview prep. Every example runs and shows its real output.",
  subtitleHi: "संपूर्ण डेटा साइंस। भाग 1: हर विचार को साधारण पाइथन में शुरू से बनाएँ (वेक्टर, सांख्यिकी, प्रायिकता, परिकल्पना परीक्षण, ग्रेडिएंट डिसेंट, k-NN, नेव बेज़, रिग्रेशन, डिसीज़न ट्री, न्यूरल नेटवर्क, क्लस्टरिंग, NLP, नेटवर्क विश्लेषण, रिकमेंडर, SQL, MapReduce)। भाग 2: इंडस्ट्री टूलकिट — NumPy, pandas, matplotlib, seaborn, scikit-learn पाइपलाइन और ट्यूनिंग, PyTorch और ट्रांसफ़ॉर्मर से डीप लर्निंग — और अंत में कैपस्टोन प्रोजेक्ट, डिप्लॉयमेंट और इंटरव्यू तैयारी। हर उदाहरण का असली आउटपुट।",
  tutorial: true,
  modules: [DS01_INTRO, DS02_PYTHON_VIZ, DS03_LINEAR_ALGEBRA, DS04_STATS_PROBABILITY, DS05_INFERENCE, DS06_GRADIENT_DESCENT, DS07_DATA, DS08_ML_BASICS, DS09_KNN_NB, DS10_REGRESSION, DS11_TREES, DS12_NEURAL_NETWORKS, DS13_CLUSTERING, DS14_NLP, DS15_NETWORKS_RECOMMENDERS,
    DS24_JUPYTER,
    { ...DS17_NUMPY, lessons: [...DS17_NUMPY.lessons, ...NUMPY_EXTRA] },
    { ...DS18_PANDAS_BASICS, lessons: [...DS18_PANDAS_BASICS.lessons, ...PANDAS_BASICS_EXTRA] },
    { ...DS19_PANDAS_ANALYSIS, lessons: [...DS19_PANDAS_ANALYSIS.lessons, ...PANDAS_ANALYSIS_EXTRA] },
    { ...DS20_VISUALIZATION, lessons: [...DS20_VISUALIZATION.lessons, ...VIZ_EXTRA] },
    DS21_SKLEARN,
    DS25_ML_DEPTH,
    DS22_DEEP_LEARNING, DS23_CAPSTONE, DS16_SCALE_CAREER],
  links: [
    { title: "Statistics for Data Science", titleHi: "डेटा साइंस सांख्यिकी", sub: "The same ideas with pandas and scikit-learn", subHi: "यही विचार pandas और scikit-learn के साथ", href: "/study-material/learn/statistics" },
    { title: "Python course", titleHi: "पाइथन कोर्स", sub: "Learn Python first if you're new", subHi: "नए हैं तो पहले पाइथन सीखें", href: "/study-material/learn/python" },
  ],
};
