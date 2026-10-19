import type { Course } from "../types";
import { DS18_PANDAS_BASICS, DS19_PANDAS_ANALYSIS, DS17_NUMPY } from "../datascience/d06-numpy-pandas";
import { DS20_VISUALIZATION, DS21_SKLEARN } from "../datascience/d07-viz-sklearn";
import { DS24_JUPYTER, DS25_ML_DEPTH, NUMPY_EXTRA, PANDAS_ANALYSIS_EXTRA, PANDAS_BASICS_EXTRA, VIZ_EXTRA } from "../datascience/d09-handbook-depth";
import { DS23_CAPSTONE } from "../datascience/d08-deep-learning-capstone";
import { PDSH_IN_DEPTH } from "./h01-in-depth";

/**
 * Python Data Science Handbook course: follows the book's five parts (Jupyter, NumPy, pandas,
 * visualisation, machine learning). Shares lessons with the Data Science course; progress is tracked per course.
 */
export const PDSH_COURSE: Course = {
  id: "python-data-science-handbook",
  title: "Python Data Science Handbook — the complete toolkit",
  titleHi: "पाइथन डेटा साइंस हैंडबुक — संपूर्ण टूलकिट",
  short: "Python Data Science Handbook",
  shortHi: "पाइथन डेटा साइंस हैंडबुक",
  tagline: "Jupyter · NumPy · pandas · matplotlib · seaborn · scikit-learn · Projects",
  subtitle: "The essential Python tools for working with data, in the order of the Python Data Science Handbook: Jupyter and IPython, NumPy arrays, pandas data manipulation, visualisation with matplotlib and seaborn, and machine learning with scikit-learn, from the basics to algorithms in depth and a full project. Every example runs and shows its real output, with common mistakes, interview questions and a quiz in every lesson.",
  subtitleHi: "डेटा के साथ काम करने के ज़रूरी पाइथन टूल, पाइथन डेटा साइंस हैंडबुक के क्रम में: Jupyter और IPython, NumPy ऐरे, pandas से डेटा प्रबंधन, matplotlib और seaborn से विज़ुअलाइज़ेशन, और scikit-learn से मशीन लर्निंग — बुनियाद से लेकर एल्गोरिदम की गहराई और पूरे प्रोजेक्ट तक। हर उदाहरण का असली आउटपुट, आम गलतियाँ, इंटरव्यू प्रश्न और हर पाठ में क्विज़।",
  tutorial: true,
  modules: [
    DS24_JUPYTER,                                                                                // Part I
    { ...DS17_NUMPY, lessons: [...DS17_NUMPY.lessons, ...NUMPY_EXTRA] },                         // Part II
    { ...DS18_PANDAS_BASICS, lessons: [...DS18_PANDAS_BASICS.lessons, ...PANDAS_BASICS_EXTRA] }, // Part III
    { ...DS19_PANDAS_ANALYSIS, lessons: [...DS19_PANDAS_ANALYSIS.lessons, ...PANDAS_ANALYSIS_EXTRA] },
    { ...DS20_VISUALIZATION, lessons: [...DS20_VISUALIZATION.lessons, ...VIZ_EXTRA] },           // Part IV
    DS21_SKLEARN,                                                                                // Part V
    DS25_ML_DEPTH,
    PDSH_IN_DEPTH,
    DS23_CAPSTONE,
  ],
  links: [
    { title: "Data Science course", titleHi: "डेटा साइंस कोर्स", sub: "Build every algorithm from scratch, plus deep learning", subHi: "हर एल्गोरिदम शुरू से बनाएँ, साथ में डीप लर्निंग", href: "/study-material/learn/data-science" },
    { title: "Statistics for Data Science", titleHi: "डेटा साइंस सांख्यिकी", sub: "The statistics behind the tools", subHi: "टूल्स के पीछे की सांख्यिकी", href: "/study-material/learn/statistics" },
    { title: "Python course", titleHi: "पाइथन कोर्स", sub: "Learn Python first if you're new", subHi: "नए हैं तो पहले पाइथन सीखें", href: "/study-material/learn/python" },
  ],
};
