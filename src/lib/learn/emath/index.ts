import type { Course } from "../types";
import { EM01_BASIC_MATH, EM02_CALCULUS } from "./e01-math-calculus";
import { EM03_PROBABILITY, EM04_STATISTICS } from "./e02-probability-statistics";
import { EM05_LINEAR_ALGEBRA, EM06_LINEAR_REGRESSION, EM07_LOGISTIC_REGRESSION } from "./e03-linear-algebra-regression";
import { EM08_NEURAL_NETWORKS, EM09_CAREER, EM10_EXTRAS } from "./e04-neural-career-extras";

/** Essential Math for Data Science: calculus, probability, statistics, linear algebra, regression and neural networks, in Python. */
export const ESSENTIAL_MATH_COURSE: Course = {
  id: "essential-math",
  title: "Essential Math for Data Science — beginner to job-ready",
  titleHi: "डेटा साइंस के लिए ज़रूरी गणित — शुरुआत से नौकरी तक",
  short: "Essential Math for Data Science",
  shortHi: "डेटा साइंस के लिए गणित",
  tagline: "Calculus · Probability · Statistics · Linear algebra · Regression · Neural networks · Python",
  subtitle: "The math behind data science and machine learning in plain words, with Python (NumPy, SciPy, SymPy, scikit-learn): exponents, logs and e; derivatives, the chain rule and integrals; probability, Bayes, binomial and beta distributions; descriptive and inferential statistics; vectors, matrices and eigenvectors; linear and logistic regression built three ways; neural networks with backpropagation; and career advice. Every example runs and shows its real output.",
  subtitleHi: "डेटा साइंस और मशीन लर्निंग के पीछे का गणित आसान भाषा में, पाइथन के साथ (NumPy, SciPy, SymPy, scikit-learn): घातांक, लघुगणक और e; अवकलज, चेन रूल और समाकलन; प्रायिकता, बेज़, बाइनोमियल और बीटा वितरण; वर्णनात्मक और अनुमानात्मक सांख्यिकी; वेक्टर, मैट्रिक्स और आइगेनवेक्टर; लीनियर और लॉजिस्टिक रिग्रेशन; बैकप्रोपेगेशन वाले न्यूरल नेटवर्क; और करियर सलाह। हर उदाहरण का असली आउटपुट।",
  tutorial: true,
  modules: [EM01_BASIC_MATH, EM02_CALCULUS, EM03_PROBABILITY, EM04_STATISTICS, EM05_LINEAR_ALGEBRA, EM06_LINEAR_REGRESSION, EM07_LOGISTIC_REGRESSION, EM08_NEURAL_NETWORKS, EM09_CAREER, EM10_EXTRAS],
  links: [
    { title: "Statistics for Data Science", titleHi: "डेटा साइंस सांख्यिकी", sub: "Statistics in more depth with pandas", subHi: "pandas के साथ गहराई से सांख्यिकी", href: "/study-material/learn/statistics" },
    { title: "Data Science course", titleHi: "डेटा साइंस कोर्स", sub: "Apply the math: build algorithms and projects", subHi: "गणित लागू करें: एल्गोरिदम और प्रोजेक्ट", href: "/study-material/learn/data-science" },
  ],
};
