/**
 * General Awareness — static GK and general science fact tables (no current
 * affairs: those change and cannot be verified offline). Each table's answers
 * are unique per prompt; distractors come from other rows of the same table.
 */
import { factQuestion, type GenQuestion, type Rng } from "./core";

const S = "General Awareness";

type Row = { p: string; a: string; pHi?: string; aHi?: string };
type Table = { topic: string; en: (p: string) => string; hi?: (p: string) => string; rows: Row[] };

const STATE_HI: Record<string, string> = {
  "Andhra Pradesh": "आंध्र प्रदेश", "Arunachal Pradesh": "अरुणाचल प्रदेश", Assam: "असम", Bihar: "बिहार", Chhattisgarh: "छत्तीसगढ़", Goa: "गोवा",
  Gujarat: "गुजरात", Haryana: "हरियाणा", "Himachal Pradesh": "हिमाचल प्रदेश", Jharkhand: "झारखंड", Karnataka: "कर्नाटक", Kerala: "केरल",
  "Madhya Pradesh": "मध्य प्रदेश", Maharashtra: "महाराष्ट्र", Manipur: "मणिपुर", Meghalaya: "मेघालय", Mizoram: "मिज़ोरम", Nagaland: "नागालैंड",
  Odisha: "ओडिशा", Punjab: "पंजाब", Rajasthan: "राजस्थान", Sikkim: "सिक्किम", "Tamil Nadu": "तमिलनाडु", Telangana: "तेलंगाना", Tripura: "त्रिपुरा",
  "Uttar Pradesh": "उत्तर प्रदेश", Uttarakhand: "उत्तराखंड", "West Bengal": "पश्चिम बंगाल", "Jammu and Kashmir": "जम्मू और कश्मीर", Ladakh: "लद्दाख",
};
const st = (state: string) => STATE_HI[state] ?? state;

const CAPITALS: [string, string, string][] = [
  ["Andhra Pradesh", "Amaravati", "अमरावती"], ["Arunachal Pradesh", "Itanagar", "ईटानगर"], ["Assam", "Dispur", "दिसपुर"], ["Bihar", "Patna", "पटना"],
  ["Chhattisgarh", "Raipur", "रायपुर"], ["Goa", "Panaji", "पणजी"], ["Gujarat", "Gandhinagar", "गांधीनगर"], ["Haryana", "Chandigarh", "चंडीगढ़"],
  ["Himachal Pradesh", "Shimla", "शिमला"], ["Jharkhand", "Ranchi", "रांची"], ["Karnataka", "Bengaluru", "बेंगलुरु"], ["Kerala", "Thiruvananthapuram", "तिरुवनंतपुरम"],
  ["Madhya Pradesh", "Bhopal", "भोपाल"], ["Maharashtra", "Mumbai", "मुंबई"], ["Manipur", "Imphal", "इंफाल"], ["Meghalaya", "Shillong", "शिलांग"],
  ["Mizoram", "Aizawl", "आइजोल"], ["Nagaland", "Kohima", "कोहिमा"], ["Odisha", "Bhubaneswar", "भुवनेश्वर"], ["Rajasthan", "Jaipur", "जयपुर"],
  ["Sikkim", "Gangtok", "गंगटोक"], ["Tamil Nadu", "Chennai", "चेन्नई"], ["Telangana", "Hyderabad", "हैदराबाद"], ["Tripura", "Agartala", "अगरतला"],
  ["Uttar Pradesh", "Lucknow", "लखनऊ"], ["Uttarakhand", "Dehradun", "देहरादून"], ["West Bengal", "Kolkata", "कोलकाता"],
];

const DANCES: [string, string][] = [
  ["Bihu", "Assam"], ["Garba", "Gujarat"], ["Bhangra", "Punjab"], ["Kathakali", "Kerala"], ["Kuchipudi", "Andhra Pradesh"], ["Odissi", "Odisha"],
  ["Bharatanatyam", "Tamil Nadu"], ["Manipuri", "Manipur"], ["Lavani", "Maharashtra"], ["Ghoomar", "Rajasthan"], ["Yakshagana", "Karnataka"],
  ["Giddha", "Punjab"], ["Nati", "Himachal Pradesh"], ["Mohiniyattam", "Kerala"], ["Sattriya", "Assam"], ["Kalbelia", "Rajasthan"], ["Jat-Jatin", "Bihar"],
];

const PARKS: [string, string][] = [
  ["Jim Corbett National Park", "Uttarakhand"], ["Kaziranga National Park", "Assam"], ["Gir National Park", "Gujarat"], ["Ranthambore National Park", "Rajasthan"],
  ["Kanha National Park", "Madhya Pradesh"], ["Bandhavgarh National Park", "Madhya Pradesh"], ["Sundarbans National Park", "West Bengal"],
  ["Periyar National Park", "Kerala"], ["Bandipur National Park", "Karnataka"], ["Dudhwa National Park", "Uttar Pradesh"], ["Valmiki National Park", "Bihar"],
  ["Great Himalayan National Park", "Himachal Pradesh"], ["Silent Valley National Park", "Kerala"], ["Keoladeo National Park", "Rajasthan"],
  ["Simlipal National Park", "Odisha"], ["Nagarhole National Park", "Karnataka"], ["Manas National Park", "Assam"], ["Tadoba National Park", "Maharashtra"],
  ["Betla National Park", "Jharkhand"], ["Namdapha National Park", "Arunachal Pradesh"], ["Hemis National Park", "Ladakh"], ["Satpura National Park", "Madhya Pradesh"],
];

const TABLES: Table[] = [
  {
    topic: "Indian geography",
    en: (p) => `What is the capital of ${p}?`,
    hi: (p) => `${p} की राजधानी क्या है?`,
    rows: CAPITALS.map(([s, c, cHi]) => ({ p: s, pHi: st(s), a: c, aHi: cHi })),
  },
  {
    topic: "Art and culture",
    en: (p) => `The dance form ${p} is associated with which state?`,
    hi: (p) => `नृत्य शैली ${p} किस राज्य से संबंधित है?`,
    rows: DANCES.map(([d, s]) => ({ p: d, a: s, aHi: st(s) })),
  },
  {
    topic: "Indian geography",
    en: (p) => `In which state/UT is ${p} located?`,
    hi: (p) => `${p} किस राज्य/केंद्रशासित प्रदेश में स्थित है?`,
    rows: PARKS.map(([n, s]) => ({ p: n, a: s, aHi: st(s) })),
  },
  {
    topic: "Indian geography",
    en: (p) => `The ${p} dam/barrage is built on which river?`,
    hi: (p) => `${p} बाँध/बैराज किस नदी पर बना है?`,
    rows: [
      ["Bhakra Nangal", "Sutlej", "सतलुज"], ["Hirakud", "Mahanadi", "महानदी"], ["Sardar Sarovar", "Narmada", "नर्मदा"], ["Tehri", "Bhagirathi", "भागीरथी"],
      ["Nagarjuna Sagar", "Krishna", "कृष्णा"], ["Mettur", "Kaveri", "कावेरी"], ["Farakka", "Ganga", "गंगा"], ["Idukki", "Periyar", "पेरियार"],
    ].map(([p, a, aHi]) => ({ p: p!, a: a!, aHi })),
  },
  {
    topic: "Indian geography",
    en: (p) => `Where does the river ${p} originate?`,
    hi: (p) => `${p} नदी का उद्गम कहाँ से होता है?`,
    rows: [
      ["Ganga", "Gangotri Glacier"], ["Yamuna", "Yamunotri Glacier"], ["Narmada", "Amarkantak"], ["Godavari", "Trimbakeshwar (Nashik)"],
      ["Krishna", "Mahabaleshwar"], ["Kaveri", "Talakaveri (Brahmagiri hills)"], ["Mahanadi", "Sihawa (Chhattisgarh)"], ["Tapti", "Multai (Betul, Madhya Pradesh)"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Books and authors",
    en: (p) => `Who wrote '${p}'?`,
    hi: (p) => `'${p}' के लेखक कौन हैं?`,
    rows: [
      ["Godan", "Premchand"], ["Gitanjali", "Rabindranath Tagore"], ["The Discovery of India", "Jawaharlal Nehru"], ["Wings of Fire", "A. P. J. Abdul Kalam"],
      ["Arthashastra", "Kautilya"], ["Panchatantra", "Vishnu Sharma"], ["Abhijnanashakuntalam", "Kalidasa"], ["The Story of My Experiments with Truth", "Mahatma Gandhi"],
      ["Train to Pakistan", "Khushwant Singh"], ["The God of Small Things", "Arundhati Roy"], ["Midnight's Children", "Salman Rushdie"],
      ["India Wins Freedom", "Maulana Abul Kalam Azad"], ["Ramcharitmanas", "Tulsidas"], ["Kamayani", "Jaishankar Prasad"], ["Malgudi Days", "R. K. Narayan"],
      ["Anandmath", "Bankim Chandra Chatterjee"], ["Rashmirathi", "Ramdhari Singh Dinkar"], ["Indica", "Megasthenes"], ["Akbarnama", "Abul Fazl"],
      ["Baburnama", "Babur"], ["Rajatarangini", "Kalhana"], ["Natyashastra", "Bharata Muni"], ["Gita Govinda", "Jayadeva"], ["Harshacharita", "Banabhatta"],
      ["Gita Rahasya", "Bal Gangadhar Tilak"], ["Poverty and Un-British Rule in India", "Dadabhai Naoroji"], ["A Suitable Boy", "Vikram Seth"],
      ["The White Tiger", "Aravind Adiga"], ["Unhappy India", "Lala Lajpat Rai"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Science and technology",
    en: (p) => `Who is credited with ${p}?`,
    rows: [
      ["inventing the telephone", "Alexander Graham Bell"], ["inventing a practical incandescent light bulb", "Thomas Edison"], ["developing radio communication", "Guglielmo Marconi"],
      ["demonstrating the first working television", "John Logie Baird"], ["the first powered aeroplane flight", "Wright brothers"], ["discovering penicillin", "Alexander Fleming"],
      ["inventing dynamite", "Alfred Nobel"], ["improving the steam engine", "James Watt"], ["the movable-type printing press in Europe", "Johannes Gutenberg"],
      ["the laws of motion and universal gravitation", "Isaac Newton"], ["the theory of relativity", "Albert Einstein"], ["discovering the electron", "J. J. Thomson"],
      ["discovering the neutron", "James Chadwick"], ["discovering radioactivity", "Henri Becquerel"], ["discovering X-rays", "Wilhelm Röntgen"],
      ["developing the first polio vaccine", "Jonas Salk"], ["developing the smallpox vaccine", "Edward Jenner"], ["the periodic table of elements", "Dmitri Mendeleev"],
      ["the Raman effect", "C. V. Raman"], ["electromagnetic induction", "Michael Faraday"], ["first observing and naming the cell", "Robert Hooke"],
      ["describing blood circulation", "William Harvey"], ["the theory of evolution by natural selection", "Charles Darwin"], ["the laws of heredity", "Gregor Mendel"],
      ["inventing the mercury barometer", "Evangelista Torricelli"], ["the rabies vaccine", "Louis Pasteur"], ["the nuclear model of the atom", "Ernest Rutherford"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "General science",
    en: (p) => `What is the SI unit of ${p}?`,
    hi: (p) => `${p} का SI मात्रक क्या है?`,
    rows: [
      ["force", "newton", "बल"], ["energy", "joule", "ऊर्जा"], ["power", "watt", "शक्ति"], ["pressure", "pascal", "दाब"], ["frequency", "hertz", "आवृत्ति"],
      ["electric current", "ampere", "विद्युत धारा"], ["electrical resistance", "ohm", "विद्युत प्रतिरोध"], ["electric charge", "coulomb", "विद्युत आवेश"],
      ["potential difference", "volt", "विभवांतर"], ["thermodynamic temperature", "kelvin", "ऊष्मागतिक ताप"], ["luminous intensity", "candela", "ज्योति तीव्रता"],
      ["amount of substance", "mole", "पदार्थ की मात्रा"], ["capacitance", "farad", "धारिता"], ["magnetic flux", "weber", "चुंबकीय फ्लक्स"], ["inductance", "henry", "प्रेरकत्व"],
    ].map(([p, a, pHi]) => ({ p: p!, a: a!, pHi })),
  },
  {
    topic: "General science",
    en: (p) => `Deficiency of ${p} causes which disease?`,
    hi: (p) => `${p} की कमी से कौन-सा रोग होता है?`,
    rows: [
      ["vitamin A", "Night blindness", "विटामिन A", "रतौंधी"], ["vitamin B1", "Beriberi", "विटामिन B1", "बेरी-बेरी"], ["vitamin C", "Scurvy", "विटामिन C", "स्कर्वी"],
      ["vitamin D", "Rickets", "विटामिन D", "रिकेट्स"], ["vitamin B3 (niacin)", "Pellagra", "विटामिन B3 (नियासिन)", "पेलाग्रा"],
      ["vitamin B12", "Pernicious anaemia", "विटामिन B12", "घातक रक्ताल्पता"], ["iodine", "Goitre", "आयोडीन", "घेंघा"], ["vitamin K", "Delayed blood clotting", "विटामिन K", "रक्त का थक्का देर से जमना"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "General science",
    en: (p) => `What is the chemical formula of ${p}?`,
    hi: (p) => `${p} का रासायनिक सूत्र क्या है?`,
    rows: [
      ["common salt", "NaCl", "साधारण नमक"], ["baking soda", "NaHCO₃", "खाने का सोडा"], ["washing soda", "Na₂CO₃·10H₂O", "धोने का सोडा"], ["quicklime", "CaO", "बिना बुझा चूना"],
      ["slaked lime", "Ca(OH)₂", "बुझा हुआ चूना"], ["limestone / chalk", "CaCO₃", "चूना पत्थर / खड़िया"], ["gypsum", "CaSO₄·2H₂O", "जिप्सम"],
      ["plaster of Paris", "CaSO₄·½H₂O", "प्लास्टर ऑफ पेरिस"], ["blue vitriol", "CuSO₄·5H₂O", "नीला थोथा"], ["sulphuric acid", "H₂SO₄", "सल्फ्यूरिक अम्ल"],
      ["nitric acid", "HNO₃", "नाइट्रिक अम्ल"], ["ammonia", "NH₃", "अमोनिया"], ["methane", "CH₄", "मीथेन"], ["ethanol", "C₂H₅OH", "एथेनॉल"], ["glucose", "C₆H₁₂O₆", "ग्लूकोज"],
      ["ozone", "O₃", "ओज़ोन"],
    ].map(([p, a, pHi]) => ({ p: p!, a: a!, pHi })),
  },
  {
    topic: "General science",
    en: (p) => `Which acid is found in ${p}?`,
    hi: (p) => `${p} में कौन-सा अम्ल पाया जाता है?`,
    rows: [
      ["lemon", "Citric acid", "नींबू", "साइट्रिक अम्ल"], ["vinegar", "Acetic acid", "सिरका", "एसिटिक अम्ल"], ["an ant's sting", "Formic acid", "चींटी का डंक", "फॉर्मिक अम्ल"],
      ["sour milk / curd", "Lactic acid", "खट्टा दूध / दही", "लैक्टिक अम्ल"], ["tamarind", "Tartaric acid", "इमली", "टार्टरिक अम्ल"], ["apple", "Malic acid", "सेब", "मैलिक अम्ल"],
      ["the human stomach", "Hydrochloric acid", "मानव आमाशय", "हाइड्रोक्लोरिक अम्ल"], ["tomato", "Oxalic acid", "टमाटर", "ऑक्सेलिक अम्ल"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "General science",
    en: (p) => `Which is ${p}?`,
    hi: (p) => `${p} कौन-सा है?`,
    rows: [
      ["the largest organ of the human body", "Skin", "मानव शरीर का सबसे बड़ा अंग", "त्वचा"], ["the largest gland of the human body", "Liver", "मानव शरीर की सबसे बड़ी ग्रंथि", "यकृत"],
      ["the smallest bone of the human body", "Stapes", "मानव शरीर की सबसे छोटी हड्डी", "स्टेपीज़"], ["the longest bone of the human body", "Femur", "मानव शरीर की सबसे लंबी हड्डी", "फीमर"],
      ["the largest artery of the human body", "Aorta", "मानव शरीर की सबसे बड़ी धमनी", "महाधमनी"], ["the organ that filters blood to form urine", "Kidney", "रक्त को छानकर मूत्र बनाने वाला अंग", "वृक्क"],
      ["the 'powerhouse of the cell'", "Mitochondria", "'कोशिका का ऊर्जा घर'", "माइटोकॉन्ड्रिया"], ["the site of protein synthesis in a cell", "Ribosome", "कोशिका में प्रोटीन संश्लेषण का स्थल", "राइबोसोम"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "General science",
    en: (p) => `Which element/substance is ${p}?`,
    hi: (p) => `कौन-सा तत्व/पदार्थ ${p} है?`,
    rows: [
      ["the hardest natural substance", "Diamond", "सबसे कठोर प्राकृतिक पदार्थ", "हीरा"], ["the lightest gas", "Hydrogen", "सबसे हल्की गैस", "हाइड्रोजन"],
      ["the most abundant gas in Earth's atmosphere", "Nitrogen", "पृथ्वी के वायुमंडल में सबसे अधिक मात्रा वाली गैस", "नाइट्रोजन"],
      ["the metal that is liquid at room temperature", "Mercury", "कमरे के ताप पर द्रव धातु", "पारा"],
      ["the most abundant metal in Earth's crust", "Aluminium", "भू-पर्पटी में सबसे अधिक पाई जाने वाली धातु", "एल्युमिनियम"],
      ["the best conductor of electricity", "Silver", "विद्युत का सर्वोत्तम चालक", "चाँदी"], ["present in all organic compounds", "Carbon", "सभी कार्बनिक यौगिकों में उपस्थित", "कार्बन"],
      ["the non-flammable gas used to fill balloons", "Helium", "गुब्बारों में भरी जाने वाली अज्वलनशील गैस", "हीलियम"],
      ["the gas used in glowing advertising signs (red-orange glow)", "Neon", "विज्ञापन बोर्डों में प्रयुक्त चमकने वाली गैस (लाल-नारंगी)", "निऑन"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "Indian polity",
    en: (p) => `Which Article of the Indian Constitution deals with ${p}?`,
    hi: (p) => `भारतीय संविधान का कौन-सा अनुच्छेद ${p} से संबंधित है?`,
    rows: [
      ["equality before law", "Article 14", "विधि के समक्ष समता"], ["abolition of untouchability", "Article 17", "अस्पृश्यता का अंत"],
      ["protection of life and personal liberty", "Article 21", "प्राण और दैहिक स्वतंत्रता का संरक्षण"], ["the right to education", "Article 21A", "शिक्षा का अधिकार"],
      ["the right to constitutional remedies", "Article 32", "संवैधानिक उपचारों का अधिकार"], ["a uniform civil code", "Article 44", "समान नागरिक संहिता"],
      ["fundamental duties", "Article 51A", "मौलिक कर्तव्य"], ["the pardoning power of the President", "Article 72", "राष्ट्रपति की क्षमादान शक्ति"],
      ["the definition of a Money Bill", "Article 110", "धन विधेयक की परिभाषा"], ["the annual financial statement (Budget)", "Article 112", "वार्षिक वित्तीय विवरण (बजट)"],
      ["the ordinance-making power of the President", "Article 123", "राष्ट्रपति की अध्यादेश जारी करने की शक्ति"],
      ["the Comptroller and Auditor General of India", "Article 148", "भारत के नियंत्रक एवं महालेखा परीक्षक"], ["the Finance Commission", "Article 280", "वित्त आयोग"],
      ["the Election Commission", "Article 324", "निर्वाचन आयोग"], ["the official language of the Union", "Article 343", "संघ की राजभाषा"],
      ["a proclamation of national emergency", "Article 352", "राष्ट्रीय आपातकाल की उद्घोषणा"], ["President's rule in a state", "Article 356", "राज्य में राष्ट्रपति शासन"],
      ["financial emergency", "Article 360", "वित्तीय आपातकाल"], ["the amendment of the Constitution", "Article 368", "संविधान संशोधन"],
      ["the Attorney General of India", "Article 76", "भारत के महान्यायवादी"],
    ].map(([p, a, pHi]) => ({ p: p!, a: a!, pHi, aHi: a!.replace("Article", "अनुच्छेद") })),
  },
  {
    topic: "Indian polity",
    en: (p) => `The Indian Constitution borrowed ${p} from which country?`,
    hi: (p) => `भारतीय संविधान ने ${p} किस देश से ग्रहण किया है?`,
    rows: [
      ["the concept of Directive Principles of State Policy", "Ireland", "राज्य के नीति निदेशक तत्व", "आयरलैंड"], ["the parliamentary system", "United Kingdom", "संसदीय प्रणाली", "ब्रिटेन"],
      ["the suspension of Fundamental Rights during emergency", "Germany", "आपातकाल में मौलिक अधिकारों का निलंबन", "जर्मनी"], ["the Concurrent List", "Australia", "समवर्ती सूची", "ऑस्ट्रेलिया"],
      ["a federation with a strong Centre", "Canada", "सशक्त केंद्र वाला संघ", "कनाडा"], ["Fundamental Duties", "USSR (Russia)", "मौलिक कर्तव्य", "सोवियत संघ (रूस)"],
      ["the procedure for amendment", "South Africa", "संशोधन की प्रक्रिया", "दक्षिण अफ्रीका"], ["the ideals of liberty, equality and fraternity", "France", "स्वतंत्रता, समानता और बंधुत्व के आदर्श", "फ्रांस"],
      ["judicial review", "United States of America", "न्यायिक पुनरावलोकन", "संयुक्त राज्य अमेरिका"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "Indian polity",
    en: (p) => `Which Schedule of the Indian Constitution contains ${p}?`,
    hi: (p) => `भारतीय संविधान की कौन-सी अनुसूची में ${p} है?`,
    rows: [
      ["the names of States and Union Territories", "First Schedule", "राज्यों और केंद्रशासित प्रदेशों के नाम", "पहली अनुसूची"],
      ["forms of oaths and affirmations", "Third Schedule", "शपथ और प्रतिज्ञान के प्रारूप", "तीसरी अनुसूची"],
      ["the Union, State and Concurrent Lists", "Seventh Schedule", "संघ, राज्य और समवर्ती सूचियाँ", "सातवीं अनुसूची"],
      ["the recognised languages", "Eighth Schedule", "मान्यता प्राप्त भाषाएँ", "आठवीं अनुसूची"],
      ["the anti-defection provisions", "Tenth Schedule", "दल-बदल विरोधी प्रावधान", "दसवीं अनुसूची"],
      ["the powers of Panchayats", "Eleventh Schedule", "पंचायतों की शक्तियाँ", "ग्यारहवीं अनुसूची"],
      ["the powers of Municipalities", "Twelfth Schedule", "नगरपालिकाओं की शक्तियाँ", "बारहवीं अनुसूची"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "International organisations",
    en: (p) => `Where are the headquarters of ${p}?`,
    rows: [
      ["the United Nations", "New York"], ["UNESCO", "Paris"], ["the World Health Organization", "Geneva"], ["the International Monetary Fund", "Washington, D.C."],
      ["the Food and Agriculture Organization", "Rome"], ["Interpol", "Lyon"], ["ASEAN", "Jakarta"], ["SAARC", "Kathmandu"], ["NATO", "Brussels"],
      ["ISRO", "Bengaluru"], ["the Reserve Bank of India", "Mumbai"], ["the International Cricket Council", "Dubai"], ["FIFA", "Zurich"],
      ["the International Olympic Committee", "Lausanne"], ["Amnesty International", "London"], ["OPEC", "Vienna"], ["the Asian Infrastructure Investment Bank", "Beijing"],
      ["the New Development Bank (BRICS)", "Shanghai"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Sports",
    en: (p) => `The term '${p}' is associated with which sport?`,
    hi: (p) => `'${p}' शब्द किस खेल से संबंधित है?`,
    rows: [
      ["Googly", "Cricket", "क्रिकेट"], ["Leg before wicket", "Cricket", "क्रिकेट"], ["Checkmate", "Chess", "शतरंज"], ["Gambit", "Chess", "शतरंज"],
      ["Penalty corner", "Hockey", "हॉकी"], ["Birdie", "Golf", "गोल्फ़"], ["Bogey", "Golf", "गोल्फ़"], ["Slam dunk", "Basketball", "बास्केटबॉल"],
      ["Scrum", "Rugby", "रग्बी"], ["Uppercut", "Boxing", "मुक्केबाज़ी"], ["Butterfly stroke", "Swimming", "तैराकी"], ["Raider", "Kabaddi", "कबड्डी"],
      ["Clean and jerk", "Weightlifting", "भारोत्तोलन"],
    ].map(([p, a, aHi]) => ({ p: p!, a: a!, aHi })),
  },
  {
    topic: "Sports",
    en: (p) => `The ${p} is associated with which sport?`,
    hi: (p) => `${p} किस खेल से संबंधित है?`,
    rows: [
      ["Ranji Trophy", "Cricket"], ["Duleep Trophy", "Cricket"], ["Durand Cup", "Football"], ["Santosh Trophy", "Football"], ["Thomas Cup", "Badminton"],
      ["Uber Cup", "Badminton"], ["Davis Cup", "Tennis"], ["Ryder Cup", "Golf"], ["Beighton Cup", "Hockey"], ["Aga Khan Cup", "Hockey"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Awards",
    en: (p) => `The ${p} is given in which field?`,
    hi: (p) => `${p} किस क्षेत्र में दिया जाता है?`,
    rows: [
      ["Dadasaheb Phalke Award", "Cinema"], ["Jnanpith Award", "Literature"], ["Arjuna Award", "Sports"],
      ["Grammy Award", "Music"], ["Kalinga Prize", "Popularisation of science"], ["Shanti Swarup Bhatnagar Prize", "Science and technology"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Indian history",
    en: (p) => `In which year did ${p} take place?`,
    hi: (p) => `${p} किस वर्ष हुआ/हुई?`,
    rows: [
      ["the First Battle of Panipat", "1526", "पानीपत का प्रथम युद्ध"], ["the Second Battle of Panipat", "1556", "पानीपत का द्वितीय युद्ध"],
      ["the Third Battle of Panipat", "1761", "पानीपत का तृतीय युद्ध"], ["the Battle of Plassey", "1757", "प्लासी का युद्ध"], ["the Battle of Buxar", "1764", "बक्सर का युद्ध"],
      ["the Revolt of 1857 (first war of independence)", "1857", "1857 का विद्रोह"], ["the founding of the Indian National Congress", "1885", "भारतीय राष्ट्रीय कांग्रेस की स्थापना"],
      ["the Partition of Bengal", "1905", "बंगाल विभाजन"], ["the founding of the All-India Muslim League", "1906", "अखिल भारतीय मुस्लिम लीग की स्थापना"],
      ["the Lucknow Pact", "1916", "लखनऊ समझौता"], ["the Champaran Satyagraha", "1917", "चंपारण सत्याग्रह"], ["the Jallianwala Bagh massacre", "1919", "जलियाँवाला बाग हत्याकांड"],
      ["the launch of the Non-Cooperation Movement", "1920", "असहयोग आंदोलन का आरंभ"], ["the Dandi (Salt) March", "1930", "दांडी (नमक) यात्रा"],
      ["the Gandhi–Irwin Pact", "1931", "गांधी–इरविन समझौता"], ["the Poona Pact", "1932", "पूना समझौता"], ["the Quit India Movement", "1942", "भारत छोड़ो आंदोलन"],
      ["India's independence", "1947", "भारत की स्वतंत्रता"], ["the Constitution of India coming into force", "1950", "भारत के संविधान का लागू होना"],
    ].map(([p, a, pHi]) => ({ p: p!, a: a!, pHi, aHi: a })),
  },
  {
    topic: "Indian history",
    en: (p) => `Who founded ${p}?`,
    rows: [
      ["the Arya Samaj", "Dayanand Saraswati"], ["the Brahmo Samaj", "Raja Ram Mohan Roy"], ["the Ramakrishna Mission", "Swami Vivekananda"],
      ["the Satyashodhak Samaj", "Jyotirao Phule"], ["the Servants of India Society", "Gopal Krishna Gokhale"], ["the Khudai Khidmatgar movement", "Khan Abdul Ghaffar Khan"],
      ["the Mughal Empire in India", "Babur"], ["the Maurya Empire", "Chandragupta Maurya"], ["the Slave (Mamluk) dynasty of Delhi", "Qutb-ud-din Aibak"],
      ["the Khilji dynasty", "Jalal-ud-din Khilji"], ["the Tughlaq dynasty", "Ghiyas-ud-din Tughlaq"], ["the Lodi dynasty", "Bahlul Lodi"], ["the Sur dynasty", "Sher Shah Suri"],
      ["the Sikh Empire", "Maharaja Ranjit Singh"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Art and culture",
    en: (p) => `In which city is ${p} located?`,
    rows: [
      ["the Charminar", "Hyderabad"], ["the Gateway of India", "Mumbai"], ["the Hawa Mahal", "Jaipur"], ["the Victoria Memorial", "Kolkata"], ["the Golden Temple", "Amritsar"],
      ["the Gol Gumbaz", "Vijayapura (Bijapur)"], ["the Meenakshi Temple", "Madurai"], ["the Qutub Minar", "Delhi"], ["the Buland Darwaza", "Fatehpur Sikri"],
      ["the Mysore Palace", "Mysuru"], ["the Taj Mahal", "Agra"], ["the Brihadeeswarar Temple", "Thanjavur"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Indian history",
    en: (p) => `Who commissioned/built ${p}?`,
    rows: [
      ["the Taj Mahal", "Shah Jahan"], ["the Buland Darwaza", "Akbar"], ["the Charminar", "Muhammad Quli Qutb Shah"], ["the Hawa Mahal", "Maharaja Sawai Pratap Singh"],
      ["the Konark Sun Temple", "Narasimhadeva I"], ["the Brihadeeswarar Temple at Thanjavur", "Rajaraja Chola I"], ["the Great Stupa at Sanchi (original)", "Ashoka"],
      ["Humayun's Tomb", "Empress Bega Begum"],
    ].map(([p, a]) => ({ p: p!, a: a! })),
  },
  {
    topic: "Personalities",
    en: (p) => `Who was ${p}?`,
    hi: (p) => `${p} कौन थे/थीं?`,
    rows: [
      ["the first President of India", "Dr. Rajendra Prasad", "भारत के प्रथम राष्ट्रपति", "डॉ. राजेंद्र प्रसाद"], ["the first Prime Minister of India", "Jawaharlal Nehru", "भारत के प्रथम प्रधानमंत्री", "जवाहरलाल नेहरू"],
      ["the first woman Prime Minister of India", "Indira Gandhi", "भारत की प्रथम महिला प्रधानमंत्री", "इंदिरा गांधी"], ["the first woman President of India", "Pratibha Patil", "भारत की प्रथम महिला राष्ट्रपति", "प्रतिभा पाटिल"],
      ["the first Indian Nobel laureate", "Rabindranath Tagore", "प्रथम भारतीय नोबेल पुरस्कार विजेता", "रवींद्रनाथ टैगोर"], ["the first Indian in space", "Rakesh Sharma", "अंतरिक्ष में जाने वाले प्रथम भारतीय", "राकेश शर्मा"],
      ["the first woman IPS officer of India", "Kiran Bedi", "भारत की प्रथम महिला आईपीएस अधिकारी", "किरण बेदी"],
      ["the first Indian Governor-General of independent India", "C. Rajagopalachari", "स्वतंत्र भारत के प्रथम भारतीय गवर्नर-जनरल", "सी. राजगोपालाचारी"],
      ["the first Vice-President of India", "Dr. S. Radhakrishnan", "भारत के प्रथम उपराष्ट्रपति", "डॉ. एस. राधाकृष्णन"], ["the first Chief Justice of India", "H. J. Kania", "भारत के प्रथम मुख्य न्यायाधीश", "एच. जे. कानिया"],
      ["the first woman Chief Minister in India", "Sucheta Kriplani", "भारत की प्रथम महिला मुख्यमंत्री", "सुचेता कृपलानी"],
      ["the first Indian woman to climb Mount Everest", "Bachendri Pal", "माउंट एवरेस्ट पर चढ़ने वाली प्रथम भारतीय महिला", "बछेंद्री पाल"],
      ["the first woman Governor of an Indian state", "Sarojini Naidu", "भारत के किसी राज्य की प्रथम महिला राज्यपाल", "सरोजिनी नायडू"],
      ["the first Speaker of the Lok Sabha", "G. V. Mavalankar", "लोकसभा के प्रथम अध्यक्ष", "जी. वी. मावलंकर"],
      ["the first Chief Election Commissioner of India", "Sukumar Sen", "भारत के प्रथम मुख्य निर्वाचन आयुक्त", "सुकुमार सेन"],
      ["the first woman Speaker of the Lok Sabha", "Meira Kumar", "लोकसभा की प्रथम महिला अध्यक्ष", "मीरा कुमार"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "Geography",
    en: (p) => `Which planet is ${p}?`,
    hi: (p) => `कौन-सा ग्रह ${p} है?`,
    rows: [
      ["the largest planet of the solar system", "Jupiter", "सौरमंडल का सबसे बड़ा ग्रह", "बृहस्पति"], ["the smallest planet of the solar system", "Mercury", "सौरमंडल का सबसे छोटा ग्रह", "बुध"],
      ["known as the Red Planet", "Mars", "लाल ग्रह के नाम से प्रसिद्ध", "मंगल"], ["the hottest planet of the solar system", "Venus", "सौरमंडल का सबसे गर्म ग्रह", "शुक्र"],
      ["famous for its prominent ring system", "Saturn", "अपने प्रमुख वलयों के लिए प्रसिद्ध", "शनि"], ["the farthest planet from the Sun", "Neptune", "सूर्य से सबसे दूर स्थित ग्रह", "वरुण (नेपच्यून)"],
      ["the only planet known to support life", "Earth", "जीवन वाला एकमात्र ज्ञात ग्रह", "पृथ्वी"], ["the planet that rotates on its side (axis tilted ~98°)", "Uranus", "अपनी धुरी पर लगभग लेटकर घूमने वाला ग्रह", "अरुण (यूरेनस)"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
  {
    topic: "Indian geography",
    en: (p) => `Which is ${p}?`,
    hi: (p) => `${p} कौन-सा है?`,
    rows: [
      ["the largest Indian state by area", "Rajasthan", "क्षेत्रफल की दृष्टि से भारत का सबसे बड़ा राज्य", "राजस्थान"],
      ["the smallest Indian state by area", "Goa", "क्षेत्रफल की दृष्टि से भारत का सबसे छोटा राज्य", "गोवा"],
      ["the most populous Indian state (Census 2011)", "Uttar Pradesh", "सबसे अधिक जनसंख्या वाला राज्य (जनगणना 2011)", "उत्तर प्रदेश"],
      ["the Indian state with the longest coastline (mainland)", "Gujarat", "सबसे लंबी तटरेखा वाला राज्य (मुख्य भूमि)", "गुजरात"],
      ["the state known as the 'Land of Five Rivers'", "Punjab", "'पाँच नदियों की भूमि' कहलाने वाला राज्य", "पंजाब"],
    ].map(([p, a, pHi, aHi]) => ({ p: p!, a: a!, pHi, aHi })),
  },
];

export function allGaFactQuestions(r: Rng): GenQuestion[] {
  const out: GenQuestion[] = [];
  for (const t of TABLES) {
    for (const row of t.rows) {
      const q = factQuestion(r, t.rows, row, {
        key: (x) => `G:${t.topic}:${t.en("").slice(0, 25)}:${x.p}`,
        subject: S,
        topic: t.topic,
        en: (x) => t.en(x.p),
        hi: t.hi ? (x) => t.hi!(x.pHi ?? x.p) : undefined,
        answer: (x) => x.a,
        answerHi: t.rows.some((x) => x.aHi) ? (x) => x.aHi ?? x.a : undefined,
      });
      if (q) out.push(q);
    }
  }
  return out;
}
