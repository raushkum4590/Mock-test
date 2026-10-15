/** Bihar GK for BPSC General Studies — hand-written options, one correct answer each. */
import { mcq, type GenQuestion, type Rng } from "./core";

const S = "General Studies";

const ITEMS: [string, string, string, string[], string[]][] = [
  // [key, English question, correct, wrong options, (Hindi question, correct, ...wrong) packed below]
  ["sorrow", "Which river is known as the 'Sorrow of Bihar'?", "Kosi", ["Gandak", "Son", "Punpun"], ["किस नदी को 'बिहार का शोक' कहा जाता है?", "कोसी", "गंडक", "सोन", "पुनपुन"]],
  ["diwas", "On which date is Bihar Diwas celebrated?", "22 March", ["26 January", "15 November", "1 April"], ["बिहार दिवस किस तिथि को मनाया जाता है?", "22 मार्च", "26 जनवरी", "15 नवंबर", "1 अप्रैल"]],
  ["separate1912", "In which year was Bihar separated from the Bengal Presidency?", "1912", ["1905", "1936", "1947"], ["बिहार को बंगाल प्रेसीडेंसी से किस वर्ष अलग किया गया?", "1912", "1905", "1936", "1947"]],
  ["jharkhand", "In which year was Jharkhand carved out of Bihar?", "2000", ["1998", "2002", "1991"], ["झारखंड को बिहार से किस वर्ष अलग किया गया?", "2000", "1998", "2002", "1991"]],
  ["districts", "How many districts are there in Bihar?", "38", ["36", "40", "33"], ["बिहार में कितने ज़िले हैं?", "38", "36", "40", "33"]],
  ["nalanda", "Who founded Nalanda University?", "Kumaragupta I", ["Dharmapala", "Harshavardhana", "Ashoka"], ["नालंदा विश्वविद्यालय की स्थापना किसने की?", "कुमारगुप्त प्रथम", "धर्मपाल", "हर्षवर्धन", "अशोक"]],
  ["vikramshila", "Who founded Vikramshila University?", "Dharmapala", ["Kumaragupta I", "Devapala", "Gopala"], ["विक्रमशिला विश्वविद्यालय की स्थापना किसने की?", "धर्मपाल", "कुमारगुप्त प्रथम", "देवपाल", "गोपाल"]],
  ["bodhgaya", "At which place in Bihar did Gautama Buddha attain enlightenment?", "Bodh Gaya", ["Rajgir", "Vaishali", "Kesaria"], ["गौतम बुद्ध को बिहार में किस स्थान पर ज्ञान प्राप्त हुआ?", "बोधगया", "राजगीर", "वैशाली", "केसरिया"]],
  ["mahavira", "Vardhamana Mahavira was born at Kundagram near which ancient city?", "Vaishali", ["Pataliputra", "Rajgir", "Champa"], ["वर्धमान महावीर का जन्म किस प्राचीन नगर के निकट कुंडग्राम में हुआ था?", "वैशाली", "पाटलिपुत्र", "राजगीर", "चंपा"]],
  ["gobind", "Guru Gobind Singh was born in which city?", "Patna", ["Amritsar", "Anandpur Sahib", "Nanded"], ["गुरु गोबिंद सिंह का जन्म किस शहर में हुआ था?", "पटना", "अमृतसर", "आनंदपुर साहिब", "नांदेड़"]],
  ["shershah", "Where is the tomb of Sher Shah Suri located?", "Sasaram", ["Delhi", "Agra", "Patna"], ["शेरशाह सूरी का मकबरा कहाँ स्थित है?", "सासाराम", "दिल्ली", "आगरा", "पटना"]],
  ["kunwar", "Babu Kunwar Singh, a leader of the 1857 revolt, belonged to which place?", "Jagdishpur", ["Arrah town", "Buxar", "Dumraon"], ["1857 के विद्रोह के नेता बाबू कुँवर सिंह कहाँ के थे?", "जगदीशपुर", "आरा नगर", "बक्सर", "डुमराँव"]],
  ["rajendra", "Dr. Rajendra Prasad was born at Ziradei in which district?", "Siwan", ["Saran", "Gopalganj", "Patna"], ["डॉ. राजेंद्र प्रसाद का जन्म ज़ीरादेई में हुआ था, जो किस ज़िले में है?", "सीवान", "सारण", "गोपालगंज", "पटना"]],
  ["champaran", "In which year did Mahatma Gandhi lead the Champaran Satyagraha?", "1917", ["1915", "1919", "1920"], ["महात्मा गांधी ने चंपारण सत्याग्रह का नेतृत्व किस वर्ष किया?", "1917", "1915", "1919", "1920"]],
  ["madhubani", "Madhubani painting originates from which region of Bihar?", "Mithila", ["Magadh", "Bhojpur", "Anga"], ["मधुबनी चित्रकला बिहार के किस क्षेत्र से उत्पन्न हुई है?", "मिथिला", "मगध", "भोजपुर", "अंग"]],
  ["sonepur", "The famous Sonepur cattle fair is held at the confluence of the Ganga and which river?", "Gandak", ["Son", "Kosi", "Ghaghara"], ["प्रसिद्ध सोनपुर पशु मेला गंगा और किस नदी के संगम पर लगता है?", "गंडक", "सोन", "कोसी", "घाघरा"]],
  ["patliputra", "Pataliputra was the capital of which empire under Chandragupta?", "Maurya Empire", ["Kushan Empire", "Pala Empire", "Mughal Empire"], ["चंद्रगुप्त के समय पाटलिपुत्र किस साम्राज्य की राजधानी था?", "मौर्य साम्राज्य", "कुषाण साम्राज्य", "पाल साम्राज्य", "मुग़ल साम्राज्य"]],
  ["valmiki", "In which district of Bihar is Valmiki National Park located?", "West Champaran", ["Gaya", "Kaimur", "Purnia"], ["वाल्मीकि राष्ट्रीय उद्यान बिहार के किस ज़िले में स्थित है?", "पश्चिमी चंपारण", "गया", "कैमूर", "पूर्णिया"]],
  ["jp", "Jayaprakash Narayan, leader of the 1974 'Total Revolution', was born at which village?", "Sitab Diyara", ["Ziradei", "Jagdishpur", "Kundagram"], ["1974 की 'संपूर्ण क्रांति' के नेता जयप्रकाश नारायण का जन्म किस गाँव में हुआ था?", "सिताब दियारा", "ज़ीरादेई", "जगदीशपुर", "कुंडग्राम"]],
  ["mahabodhi", "The Mahabodhi Temple, a UNESCO World Heritage Site, is in which place?", "Bodh Gaya", ["Nalanda", "Rajgir", "Vaishali"], ["यूनेस्को विश्व धरोहर स्थल महाबोधि मंदिर कहाँ है?", "बोधगया", "नालंदा", "राजगीर", "वैशाली"]],
];

export function allBiharQuestions(r: Rng): GenQuestion[] {
  return ITEMS.map(([key, en, ans, wrong, hi]) =>
    mcq(r, { key: `B:${key}`, subject: S, topic: "Bihar GK", difficulty: "MEDIUM", en, hi: hi[0] }, ans, wrong, { answer: hi[1]!, distractors: hi.slice(2) }),
  ).filter((q): q is GenQuestion => !!q);
}
