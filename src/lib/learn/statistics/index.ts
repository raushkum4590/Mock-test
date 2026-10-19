import type { Course } from "../types";
import { ST01_EDA, ST02_DISTRIBUTIONS } from "./s01-eda";
import { ST03_SAMPLING, ST04_DISTRIBUTIONS } from "./s02-sampling-distributions";
import { ST05_EXPERIMENTS } from "./s03-experiments";
import { ST06_REGRESSION } from "./s04-regression";
import { ST07_CLASSIFICATION, ST08_MACHINE_LEARNING } from "./s05-classification-ml";
import { ST09_UNSUPERVISED, ST10_JOB_READY } from "./s06-unsupervised-jobready";

/** Statistics for data science, beginner to job-ready, with every concept explained in plain words and checked Python code. */
export const STATISTICS_COURSE: Course = {
  id: "statistics",
  title: "Statistics for Data Science — beginner to job-ready",
  titleHi: "डेटा साइंस के लिए सांख्यिकी — शुरुआत से नौकरी तक",
  short: "Statistics for Data Science",
  shortHi: "डेटा साइंस सांख्यिकी",
  tagline: "Python · pandas · scikit-learn · A/B testing · Machine learning · Interview prep",
  subtitle: "The 50 essential statistics concepts for data science in plain words: exploring data, sampling and the bootstrap, A/B tests and p-values, regression, classification, machine learning and clustering. Every idea has a hand-worked example, real Python code with its output, common mistakes, interview questions and a quiz.",
  subtitleHi: "डेटा साइंस की 50 ज़रूरी सांख्यिकी अवधारणाएँ आसान भाषा में: डेटा की खोज, सैंपलिंग और बूटस्ट्रैप, A/B टेस्ट और p-value, रिग्रेशन, क्लासिफ़िकेशन, मशीन लर्निंग और क्लस्टरिंग। हर विचार के साथ हाथ से हल किया उदाहरण, आउटपुट सहित पाइथन कोड, आम गलतियाँ, इंटरव्यू प्रश्न और क्विज़।",
  tutorial: true,
  modules: [ST01_EDA, ST02_DISTRIBUTIONS, ST03_SAMPLING, ST04_DISTRIBUTIONS, ST05_EXPERIMENTS, ST06_REGRESSION, ST07_CLASSIFICATION, ST08_MACHINE_LEARNING, ST09_UNSUPERVISED, ST10_JOB_READY],
  links: [
    { title: "Python course", titleHi: "पाइथन कोर्स", sub: "Learn the language used in every example", subHi: "हर उदाहरण में इस्तेमाल भाषा सीखें", href: "/study-material/learn/python" },
    { title: "DSA course", titleHi: "डीएसए कोर्स", sub: "Algorithms for coding interviews", subHi: "कोडिंग इंटरव्यू के लिए एल्गोरिदम", href: "/study-material/learn/dsa" },
  ],
};
