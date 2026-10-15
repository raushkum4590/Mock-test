/**
 * Sample bilingual SSC CGL-style mock paper. The official pattern changes
 * over time, so section sizes, marks and duration here are just defaults —
 * administrators configure the real values per mock exam.
 */
type Opt = [en: string, hi: string | null];
export type SeedQuestion = { code: string; topic: string; en: string; hi: string | null; options: Opt[]; correct: number; explanationEn?: string };
export type SeedSection = { code: string; titleEn: string; titleHi: string; subject: string; marksCorrect: number; marksWrong: number; questions: SeedQuestion[] };

export const SAMPLE_EXAM = {
  code: "CGL-MOCK-01",
  examType: "SSC_CGL" as const,
  titleEn: "SSC CGL Tier-I Mock Test 01",
  titleHi: "एसएससी सीजीएल टियर-I मॉक टेस्ट 01",
  defaultDurationMinutes: 60,
  instructionsEn: [
    "1. The examination contains 20 multiple-choice questions in 4 sections.",
    "2. Each correct answer carries 2 marks. 0.50 marks are deducted for each wrong answer. Unanswered questions carry no marks.",
    "3. The clock is set on the server. The countdown in the top-right corner shows the official remaining time. The exam is submitted automatically when the time is over.",
    "4. Click an option to select it. Your answer is saved to the server automatically; 'Saved' appears when the server confirms it.",
    "5. 'Save & Next' saves and moves to the next question. 'Mark for Review & Next' marks the question so you can revisit it.",
    "6. Answers marked for review that have an option selected WILL be evaluated.",
    "7. Use the question palette to jump to any question. You may switch between English and Hindi at any time; your answers are not affected.",
    "8. This is a mock examination. Results are not official SSC results.",
  ].join("\n"),
  instructionsHi: [
    "1. परीक्षा में 4 खंडों में 20 बहुविकल्पीय प्रश्न हैं।",
    "2. प्रत्येक सही उत्तर के लिए 2 अंक दिए जाएंगे। प्रत्येक गलत उत्तर के लिए 0.50 अंक काटे जाएंगे। अनुत्तरित प्रश्नों के लिए कोई अंक नहीं है।",
    "3. घड़ी सर्वर पर निर्धारित है। ऊपर दाईं ओर की उलटी गिनती आधिकारिक शेष समय दर्शाती है। समय समाप्त होने पर परीक्षा स्वतः जमा हो जाएगी।",
    "4. किसी विकल्प को चुनने के लिए उस पर क्लिक करें। आपका उत्तर स्वतः सर्वर पर सहेजा जाता है; सर्वर द्वारा पुष्टि होने पर 'सहेजा गया' दिखाई देता है।",
    "5. 'सहेजें और आगे बढ़ें' उत्तर सहेजकर अगले प्रश्न पर ले जाता है। 'समीक्षा हेतु चिह्नित करें और आगे बढ़ें' प्रश्न को बाद में देखने के लिए चिह्नित करता है।",
    "6. समीक्षा हेतु चिह्नित जिन प्रश्नों में विकल्प चुना गया है, उनका मूल्यांकन किया जाएगा।",
    "7. किसी भी प्रश्न पर जाने के लिए प्रश्न पैलेट का उपयोग करें। आप कभी भी अंग्रेज़ी और हिंदी के बीच बदल सकते हैं; आपके उत्तर प्रभावित नहीं होंगे।",
    "8. यह एक मॉक परीक्षा है। परिणाम आधिकारिक एसएससी परिणाम नहीं हैं।",
  ].join("\n"),
};

/** Online catalogue (descriptions are this platform's own text). */
export const CATEGORIES = [
  {
    slug: "ssc-cgl",
    nameEn: "SSC CGL",
    nameHi: "एसएससी सीजीएल",
    descriptionEn: "Combined Graduate Level mock tests: reasoning, general awareness, quantitative aptitude and English.",
    descriptionHi: "संयुक्त स्नातक स्तर मॉक टेस्ट: तर्कशक्ति, सामान्य जागरूकता, मात्रात्मक योग्यता और अंग्रेज़ी।",
    position: 1,
  },
  {
    slug: "ssc-chsl",
    nameEn: "SSC CHSL",
    nameHi: "एसएससी सीएचएसएल",
    descriptionEn: "Combined Higher Secondary Level mock tests for 10+2 level posts.",
    descriptionHi: "10+2 स्तर के पदों के लिए संयुक्त उच्चतर माध्यमिक स्तर मॉक टेस्ट।",
    position: 2,
  },
  {
    slug: "ssc-je",
    nameEn: "SSC JE",
    nameHi: "एसएससी जेई",
    descriptionEn: "Junior Engineer mock tests with separate Civil, Mechanical and Electrical series.",
    descriptionHi: "सिविल, मैकेनिकल और इलेक्ट्रिकल की अलग सीरीज़ के साथ जूनियर इंजीनियर मॉक टेस्ट।",
    position: 3,
  },
];

/** Bilingual explanations for the sample paper, keyed by question code. */
export const EXPLANATIONS: Record<string, [en: string, hi: string]> = {
  "CGL-GI-001": ["Differences are 4, 6, 8, 10, so the next difference is 12: 30 + 12 = 42.", "अंतर 4, 6, 8, 10 हैं, इसलिए अगला अंतर 12 है: 30 + 12 = 42।"],
  "CGL-GI-002": ["Each letter moves one step forward: C→D, A→B, T→U. So D→E, O→P, G→H gives EPH.", "प्रत्येक अक्षर एक स्थान आगे बढ़ता है: C→D, A→B, T→U। अतः D→E, O→P, G→H से EPH बनता है।"],
  "CGL-GI-003": ["Mother's brother is Rita's maternal uncle; his son is Rita's (maternal) cousin.", "माँ का भाई रीता का मामा है; उनका पुत्र रीता का ममेरा भाई है।"],
  "CGL-GI-004": ["Apple, mango and banana are fruits; potato is a vegetable (tuber).", "सेब, आम और केला फल हैं; आलू एक सब्ज़ी (कंद) है।"],
  "CGL-GI-005": ["Order of height: D > A > B > C, so C is the shortest.", "लंबाई का क्रम: D > A > B > C, अतः C सबसे छोटा है।"],
  "CGL-GA-001": ["Article 17 abolishes untouchability and forbids its practice in any form.", "अनुच्छेद 17 अस्पृश्यता का उन्मूलन करता है और किसी भी रूप में इसके आचरण को निषिद्ध करता है।"],
  "CGL-GA-002": ["Iron oxide on its surface gives Mars its reddish appearance.", "सतह पर आयरन ऑक्साइड के कारण मंगल लाल दिखाई देता है।"],
  "CGL-GA-003": ["Lord Mountbatten was the first Governor-General of independent India (1947–48); C. Rajagopalachari was the first Indian Governor-General.", "लॉर्ड माउंटबेटन स्वतंत्र भारत के प्रथम गवर्नर-जनरल (1947–48) थे; सी. राजगोपालाचारी प्रथम भारतीय गवर्नर-जनरल थे।"],
  "CGL-GA-004": ["Na comes from the Latin name of sodium, 'natrium'.", "Na सोडियम के लैटिन नाम 'नैट्रियम' से आता है।"],
  "CGL-GA-005": ["The Kosi frequently changes course and floods north Bihar, hence 'Sorrow of Bihar'.", "कोसी बार-बार मार्ग बदलती है और उत्तर बिहार में बाढ़ लाती है, इसलिए इसे 'बिहार का शोक' कहते हैं।"],
  "CGL-QA-001": ["15% of 840 = 840 × 15 ÷ 100 = 126.", "840 का 15% = 840 × 15 ÷ 100 = 126।"],
  "CGL-QA-002": ["150 m / 15 s = 10 m/s = 10 × 18/5 = 36 km/h.", "150 मी ÷ 15 से = 10 मी/से = 10 × 18/5 = 36 किमी/घंटा।"],
  "CGL-QA-003": ["SI = P × R × T ÷ 100 = 5000 × 8 × 3 ÷ 100 = ₹1,200.", "साधारण ब्याज = P × R × T ÷ 100 = 5000 × 8 × 3 ÷ 100 = ₹1,200।"],
  "CGL-QA-004": ["(x + 1/x)² = x² + 2 + 1/x², so x² + 1/x² = 25 − 2 = 23.", "(x + 1/x)² = x² + 2 + 1/x², अतः x² + 1/x² = 25 − 2 = 23।"],
  "CGL-QA-005": ["The middle number equals the average: 20, 22, 24, 26, 28 — the largest is 28.", "बीच की संख्या औसत के बराबर है: 20, 22, 24, 26, 28 — सबसे बड़ी 28 है।"],
  "CGL-EN-001": ["'Abundant' means existing in large quantities — 'plentiful'.", "'Abundant' का अर्थ है बड़ी मात्रा में — 'plentiful'।"],
  "CGL-EN-002": ["'Ancient' means very old; its opposite is 'modern'.", "'Ancient' का अर्थ बहुत पुराना है; इसका विलोम 'modern' है।"],
  "CGL-EN-003": ["'Accommodate' has a double c and a double m.", "'Accommodate' में दो c और दो m होते हैं।"],
  "CGL-EN-004": ["'Since' is used with a point in time (2019); 'for' is used with a period.", "समय-बिंदु (2019) के साथ 'since' प्रयुक्त होता है; अवधि के साथ 'for'।"],
  "CGL-EN-005": ["A bibliophile is a person who loves or collects books.", "Bibliophile वह व्यक्ति है जिसे पुस्तकों से प्रेम हो या जो उन्हें संग्रह करता हो।"],
};

export const SAMPLE_SECTIONS: SeedSection[] = [
  {
    code: "GI",
    titleEn: "General Intelligence and Reasoning",
    titleHi: "सामान्य बुद्धि एवं तर्कशक्ति",
    subject: "General Intelligence and Reasoning",
    marksCorrect: 2,
    marksWrong: 0.5,
    questions: [
      {
        code: "CGL-GI-001",
        topic: "Number series",
        en: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
        hi: "श्रृंखला में अगली संख्या ज्ञात कीजिए: 2, 6, 12, 20, 30, ?",
        options: [["40", "40"], ["42", "42"], ["44", "44"], ["46", "46"]],
        correct: 1,
        explanationEn: "Differences are 4, 6, 8, 10, so the next difference is 12: 30 + 12 = 42.",
      },
      {
        code: "CGL-GI-002",
        topic: "Coding-decoding",
        en: "If CAT is coded as DBU, how is DOG coded in the same code?",
        hi: "यदि किसी कूट भाषा में CAT को DBU लिखा जाता है, तो उसी कूट भाषा में DOG को कैसे लिखा जाएगा?",
        options: [["EPH", "EPH"], ["EOH", "EOH"], ["FPH", "FPH"], ["DPH", "DPH"]],
        correct: 0,
      },
      {
        code: "CGL-GI-003",
        topic: "Blood relations",
        en: "Pointing to a man, Rita said, \"He is the son of my mother's only brother.\" How is the man related to Rita?",
        hi: "एक व्यक्ति की ओर इशारा करते हुए रीता ने कहा, \"वह मेरी माँ के इकलौते भाई का पुत्र है।\" वह व्यक्ति रीता से किस प्रकार संबंधित है?",
        options: [["Brother", "भाई"], ["Cousin", "ममेरा भाई"], ["Nephew", "भतीजा"], ["Uncle", "मामा"]],
        correct: 1,
      },
      {
        code: "CGL-GI-004",
        topic: "Odd one out",
        en: "Select the odd one out: Apple, Mango, Potato, Banana",
        hi: "विषम शब्द चुनिए: सेब, आम, आलू, केला",
        options: [["Apple", "सेब"], ["Mango", "आम"], ["Potato", "आलू"], ["Banana", "केला"]],
        correct: 2,
      },
      {
        code: "CGL-GI-005",
        topic: "Ranking",
        en: "A is taller than B, B is taller than C, and D is taller than A. Who is the shortest?",
        hi: "A, B से लंबा है, B, C से लंबा है और D, A से लंबा है। सबसे छोटा कौन है?",
        options: [["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]],
        correct: 2,
      },
    ],
  },
  {
    code: "GA",
    titleEn: "General Awareness",
    titleHi: "सामान्य जागरूकता",
    subject: "General Awareness",
    marksCorrect: 2,
    marksWrong: 0.5,
    questions: [
      {
        code: "CGL-GA-001",
        topic: "Polity",
        en: "Which Article of the Constitution of India abolishes untouchability?",
        hi: "भारतीय संविधान का कौन-सा अनुच्छेद अस्पृश्यता का उन्मूलन करता है?",
        options: [["Article 14", "अनुच्छेद 14"], ["Article 17", "अनुच्छेद 17"], ["Article 19", "अनुच्छेद 19"], ["Article 21", "अनुच्छेद 21"]],
        correct: 1,
      },
      {
        code: "CGL-GA-002",
        topic: "Science",
        en: "Which planet is known as the Red Planet?",
        hi: "किस ग्रह को 'लाल ग्रह' के नाम से जाना जाता है?",
        options: [["Venus", "शुक्र"], ["Mars", "मंगल"], ["Jupiter", "बृहस्पति"], ["Mercury", "बुध"]],
        correct: 1,
      },
      {
        code: "CGL-GA-003",
        topic: "History",
        en: "Who was the first Governor-General of independent India?",
        hi: "स्वतंत्र भारत के प्रथम गवर्नर-जनरल कौन थे?",
        options: [
          ["C. Rajagopalachari", "सी. राजगोपालाचारी"],
          ["Lord Mountbatten", "लॉर्ड माउंटबेटन"],
          ["Lord Canning", "लॉर्ड कैनिंग"],
          ["Warren Hastings", "वॉरेन हेस्टिंग्स"],
        ],
        correct: 1,
      },
      {
        code: "CGL-GA-004",
        topic: "Chemistry",
        en: "The chemical symbol of sodium is:",
        hi: "सोडियम का रासायनिक प्रतीक है:",
        options: [["So", "So"], ["Sd", "Sd"], ["Na", "Na"], ["S", "S"]],
        correct: 2,
      },
      {
        code: "CGL-GA-005",
        topic: "Geography",
        en: "Which river is known as the 'Sorrow of Bihar'?",
        hi: "किस नदी को 'बिहार का शोक' कहा जाता है?",
        options: [["Ganga", "गंगा"], ["Kosi", "कोसी"], ["Son", "सोन"], ["Gandak", "गंडक"]],
        correct: 1,
      },
    ],
  },
  {
    code: "QA",
    titleEn: "Quantitative Aptitude",
    titleHi: "मात्रात्मक योग्यता",
    subject: "Quantitative Aptitude",
    marksCorrect: 2,
    marksWrong: 0.5,
    questions: [
      {
        code: "CGL-QA-001",
        topic: "Percentage",
        en: "What is 15% of 840?",
        hi: "840 का 15% कितना है?",
        options: [["116", "116"], ["126", "126"], ["136", "136"], ["146", "146"]],
        correct: 1,
      },
      {
        code: "CGL-QA-002",
        topic: "Speed and distance",
        en: "A train 150 m long passes a pole in 15 seconds. What is its speed in km/h?",
        hi: "150 मीटर लंबी एक रेलगाड़ी एक खंभे को 15 सेकंड में पार करती है। उसकी चाल किमी/घंटा में कितनी है?",
        options: [["30", "30"], ["36", "36"], ["40", "40"], ["45", "45"]],
        correct: 1,
        explanationEn: "150 m / 15 s = 10 m/s = 10 × 18/5 = 36 km/h.",
      },
      {
        code: "CGL-QA-003",
        topic: "Simple interest",
        en: "The simple interest on ₹5,000 at 8% per annum for 3 years is:",
        hi: "₹5,000 पर 8% वार्षिक दर से 3 वर्ष का साधारण ब्याज है:",
        options: [["₹1,000", "₹1,000"], ["₹1,200", "₹1,200"], ["₹1,400", "₹1,400"], ["₹1,600", "₹1,600"]],
        correct: 1,
      },
      {
        code: "CGL-QA-004",
        topic: "Algebra",
        en: "If x + 1/x = 5, find the value of x² + 1/x².",
        hi: "यदि x + 1/x = 5 है, तो x² + 1/x² का मान ज्ञात कीजिए।",
        options: [["21", "21"], ["23", "23"], ["25", "25"], ["27", "27"]],
        correct: 1,
        explanationEn: "(x + 1/x)² = x² + 2 + 1/x², so x² + 1/x² = 25 − 2 = 23.",
      },
      {
        code: "CGL-QA-005",
        topic: "Average",
        en: "The average of 5 consecutive even numbers is 24. What is the largest of these numbers?",
        hi: "5 क्रमागत सम संख्याओं का औसत 24 है। इनमें सबसे बड़ी संख्या कौन-सी है?",
        options: [["26", "26"], ["28", "28"], ["30", "30"], ["32", "32"]],
        correct: 1,
      },
    ],
  },
  {
    // English Comprehension is tested in English only: no Hindi text, so the
    // interface falls back to English even when Hindi is selected.
    code: "EN",
    titleEn: "English Comprehension",
    titleHi: "अंग्रेज़ी बोध",
    subject: "English Comprehension",
    marksCorrect: 2,
    marksWrong: 0.5,
    questions: [
      { code: "CGL-EN-001", topic: "Synonyms", en: "Choose the synonym of 'ABUNDANT'.", hi: null, options: [["Scarce", null], ["Plentiful", null], ["Rare", null], ["Meagre", null]], correct: 1 },
      { code: "CGL-EN-002", topic: "Antonyms", en: "Choose the antonym of 'ANCIENT'.", hi: null, options: [["Old", null], ["Antique", null], ["Modern", null], ["Archaic", null]], correct: 2 },
      { code: "CGL-EN-003", topic: "Spelling", en: "Select the correctly spelt word.", hi: null, options: [["Acommodate", null], ["Accomodate", null], ["Accommodate", null], ["Acomodate", null]], correct: 2 },
      { code: "CGL-EN-004", topic: "Prepositions", en: "Fill in the blank: She has been working here ____ 2019.", hi: null, options: [["for", null], ["since", null], ["from", null], ["by", null]], correct: 1 },
      { code: "CGL-EN-005", topic: "One-word substitution", en: "Choose the one-word substitute for 'a person who loves books'.", hi: null, options: [["Bibliophile", null], ["Philanthropist", null], ["Misanthrope", null], ["Optimist", null]], correct: 0 },
    ],
  },
];
