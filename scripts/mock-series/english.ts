/** English Language & Comprehension — curated tables + generated spelling questions. */
import { factQuestion, mcq, shuffle, type GenQuestion, type Rng } from "./core";

const S = "English Language and Comprehension";

// Words chosen so that no other answer in the same list is also a synonym/antonym.
const SYNONYMS: [string, string][] = [
  ["Abundant", "Plentiful"], ["Benevolent", "Kind"], ["Candid", "Frank"], ["Diligent", "Hardworking"], ["Eminent", "Distinguished"], ["Frugal", "Thrifty"],
  ["Gregarious", "Sociable"], ["Hostile", "Unfriendly"], ["Imminent", "Impending"], ["Jovial", "Cheerful"], ["Lucid", "Clear"], ["Meticulous", "Careful"],
  ["Novice", "Beginner"], ["Obsolete", "Outdated"], ["Placid", "Calm"], ["Quaint", "Old-fashioned"], ["Reluctant", "Unwilling"],
  ["Ubiquitous", "Omnipresent"], ["Vivid", "Bright"], ["Zeal", "Enthusiasm"], ["Ambiguous", "Unclear"],
  ["Brevity", "Conciseness"], ["Cordial", "Warm"], ["Deter", "Discourage"], ["Enormous", "Huge"], ["Fragile", "Delicate"], ["Genuine", "Authentic"],
  ["Hazard", "Danger"], ["Inept", "Clumsy"], ["Lethargic", "Sluggish"], ["Mitigate", "Lessen"], ["Notorious", "Infamous"], ["Ostentatious", "Showy"],
  ["Prudent", "Sensible"], ["Rebuke", "Scold"], ["Scarce", "Rare"], ["Tedious", "Boring"], ["Vacant", "Empty"], ["Adversary", "Opponent"],
  ["Barren", "Infertile"], ["Commence", "Begin"], ["Dwindle", "Shrink"], ["Exquisite", "Beautiful"], ["Feeble", "Weak"], ["Hamper", "Hinder"], ["Illicit", "Illegal"],
  ["Kindle", "Ignite"], ["Lament", "Mourn"], ["Mundane", "Ordinary"], ["Obstinate", "Stubborn"], ["Pinnacle", "Peak"], ["Ponder", "Consider"],
  ["Rectify", "Correct"], ["Spurious", "Fake"], ["Vindicate", "Justify"],
];

const ANTONYMS: [string, string][] = [
  ["Ancient", "Modern"], ["Brave", "Cowardly"], ["Generous", "Stingy"], ["Humble", "Arrogant"], ["Increase", "Decrease"],
  ["Optimist", "Pessimist"], ["Permanent", "Temporary"], ["Superior", "Inferior"], ["Victory", "Defeat"], ["Accept", "Reject"], ["Artificial", "Natural"],
  ["Barren", "Fertile"], ["Benevolent", "Malevolent"], ["Comedy", "Tragedy"], ["Conceal", "Reveal"], ["Deep", "Shallow"], ["Expensive", "Cheap"],
  ["Famous", "Unknown"], ["Guilty", "Innocent"], ["Hostile", "Friendly"], ["Import", "Export"], ["Literate", "Illiterate"], ["Majority", "Minority"],
  ["Maximum", "Minimum"], ["Obey", "Defy"], ["Praise", "Criticise"], ["Rigid", "Flexible"], ["Scarcity", "Abundance"], ["Transparent", "Opaque"],
  ["Vague", "Precise"], ["Wisdom", "Folly"], ["Zenith", "Nadir"], ["Ascend", "Descend"], ["Attract", "Repel"], ["Credit", "Debit"], ["Dynamic", "Static"],
  ["Exterior", "Interior"], ["Frequent", "Rare"], ["Gradual", "Sudden"], ["Harmony", "Discord"], ["Include", "Exclude"], ["Lenient", "Strict"],
  ["Mortal", "Immortal"], ["Oppose", "Support"], ["Prosperity", "Adversity"], ["Rural", "Urban"], ["Sorrow", "Joy"],
  ["Timid", "Bold"], ["Voluntary", "Compulsory"], ["Asset", "Liability"], ["Hasten", "Delay"], ["Plural", "Singular"],
];

const ONE_WORD: [string, string][] = [
  ["One who knows everything", "Omniscient"], ["One who is present everywhere", "Omnipresent"], ["One who is all-powerful", "Omnipotent"],
  ["A person who does not believe in God", "Atheist"], ["A life history written by oneself", "Autobiography"], ["A life history written by someone else", "Biography"],
  ["One who cannot read or write", "Illiterate"], ["A speech delivered without preparation", "Extempore"], ["One who looks on the bright side", "Optimist"],
  ["One who looks on the dark side", "Pessimist"], ["That which cannot be seen", "Invisible"], ["That which cannot be avoided", "Inevitable"],
  ["That which cannot be read", "Illegible"], ["A government by the people", "Democracy"], ["Rule by a single person with absolute power", "Autocracy"],
  ["One who hates mankind", "Misanthrope"], ["One who loves mankind", "Philanthropist"], ["A person who eats no meat", "Vegetarian"],
  ["The study of birds", "Ornithology"], ["The study of insects", "Entomology"], ["The study of the human mind", "Psychology"], ["A place where bees are kept", "Apiary"],
  ["A place where birds are kept", "Aviary"], ["A place where fish are kept", "Aquarium"], ["A place where coins are made", "Mint"], ["A place where dead bodies are kept", "Mortuary"],
  ["Killing of one's own brother", "Fratricide"], ["Killing of a king", "Regicide"], ["A disease that spreads by contact", "Contagious"],
  ["A disease that spreads over a whole country or the world", "Pandemic"], ["A word with the same meaning as another", "Synonym"], ["A word opposite in meaning", "Antonym"],
  ["A handwriting that is difficult to read", "Illegible"], ["Fear of heights", "Acrophobia"], ["Fear of water", "Hydrophobia"], ["A person who walks in sleep", "Somnambulist"],
  ["One who is unable to pay debts", "Insolvent"], ["Animals that eat flesh", "Carnivorous"], ["Animals that eat plants", "Herbivorous"], ["A collection of poems", "Anthology"],
  ["The art of beautiful handwriting", "Calligraphy"], ["A medicine that kills germs", "Antiseptic"], ["Words written on a tomb", "Epitaph"],
  ["A person who leaves his country to live in another", "Emigrant"], ["A person who comes into a country to settle", "Immigrant"],
];

const IDIOMS: [string, string][] = [
  ["A piece of cake", "Very easy"], ["Break the ice", "Start a conversation in an awkward situation"], ["Hit the nail on the head", "Describe exactly what is causing a situation"],
  ["Once in a blue moon", "Very rarely"], ["Cost an arm and a leg", "Be very expensive"], ["Let the cat out of the bag", "Reveal a secret"],
  ["Burn the midnight oil", "Work late into the night"], ["Under the weather", "Feeling ill"], ["Spill the beans", "Disclose information"],
  ["Bite the bullet", "Face a difficult situation bravely"], ["A blessing in disguise", "A good thing that seemed bad at first"], ["Beat around the bush", "Avoid the main topic"],
  ["Call it a day", "Stop working on something"], ["Cut corners", "Do something badly to save time or money"], ["Hit the sack", "Go to bed"],
  ["In hot water", "In trouble"], ["Pull someone's leg", "Tease or joke with someone"], ["The ball is in your court", "It is your decision now"],
  ["Turn a blind eye", "Pretend not to notice"], ["Add fuel to the fire", "Make a bad situation worse"], ["Bury the hatchet", "Make peace"],
  ["Cry over spilt milk", "Regret something that cannot be undone"], ["Kill two birds with one stone", "Achieve two aims with one action"],
  ["A drop in the ocean", "A very small amount compared to what is needed"], ["Face the music", "Accept the consequences"], ["Feather in one's cap", "An achievement to be proud of"],
  ["Hold one's horses", "Wait and be patient"], ["Red-letter day", "A memorable day"], ["Through thick and thin", "In good times and bad"],
  ["At the eleventh hour", "At the last moment"], ["Back to square one", "Back to the start"], ["Bite off more than one can chew", "Take on too much"],
];

const SPELLINGS = [
  "Accommodation", "Achievement", "Acquaintance", "Aggressive", "Apparent", "Argument", "Beginning", "Believe", "Bureaucracy", "Calendar", "Committee",
  "Conscience", "Conscious", "Definitely", "Dilemma", "Disappoint", "Embarrass", "Environment", "Exaggerate", "Existence", "Fluorescent", "Foreign",
  "Government", "Grammar", "Guarantee", "Harass", "Hierarchy", "Immediately", "Independent", "Knowledge", "Liaison", "Maintenance", "Millennium",
  "Mischievous", "Necessary", "Noticeable", "Occasion", "Occurrence", "Parliament", "Perseverance", "Possession", "Privilege", "Pronunciation",
  "Questionnaire", "Receive", "Recommend", "Restaurant", "Rhythm", "Separate", "Successful", "Supersede", "Surprise", "Threshold", "Tomorrow",
  "Unnecessary", "Vacuum", "Weird", "Withhold", "Entrepreneur", "Lieutenant",
];

function misspell(r: Rng, w: string): string[] {
  const out = new Set<string>();
  const lower = w.toLowerCase();
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  // Undouble / double letters.
  for (let i = 1; i < lower.length; i++) if (lower[i] === lower[i - 1]) out.add(cap(lower.slice(0, i) + lower.slice(i + 1)));
  for (let i = 1; i < lower.length - 1; i++) if ("cmnlrst".includes(lower[i]!) && lower[i] !== lower[i - 1] && lower[i] !== lower[i + 1]) out.add(cap(lower.slice(0, i) + lower[i] + lower.slice(i)));
  // ie/ei swaps and vowel changes.
  if (lower.includes("ie")) out.add(cap(lower.replace("ie", "ei")));
  if (lower.includes("ei")) out.add(cap(lower.replace("ei", "ie")));
  const vowels = "aeiou";
  for (let i = 1; i < lower.length; i++) {
    if (vowels.includes(lower[i]!)) {
      const v = vowels[(vowels.indexOf(lower[i]!) + 1 + Math.floor(r() * 3)) % 5]!;
      out.add(cap(lower.slice(0, i) + v + lower.slice(i + 1)));
    }
  }
  out.delete(w);
  return shuffle(r, [...out]);
}

export function allEnglishQuestions(r: Rng): GenQuestion[] {
  const out: (GenQuestion | null)[] = [];
  const syn = SYNONYMS.map(([p, a]) => ({ p, a }));
  for (const row of syn) out.push(factQuestion(r, syn, row, { key: (x) => `E:syn:${x.p}`, subject: S, topic: "Synonyms", en: (x) => `Choose the word most similar in meaning to '${x.p}'.`, answer: (x) => x.a }));
  const ant = ANTONYMS.map(([p, a]) => ({ p, a }));
  for (const row of ant) out.push(factQuestion(r, ant, row, { key: (x) => `E:ant:${x.p}`, subject: S, topic: "Antonyms", en: (x) => `Choose the word opposite in meaning to '${x.p}'.`, answer: (x) => x.a }));
  const ows = ONE_WORD.map(([p, a]) => ({ p, a }));
  for (const row of ows) out.push(factQuestion(r, ows, row, { key: (x) => `E:ows:${x.p}`, subject: S, topic: "One-word substitution", en: (x) => `Choose the one word for: "${x.p}".`, answer: (x) => x.a }));
  const idm = IDIOMS.map(([p, a]) => ({ p, a }));
  for (const row of idm) out.push(factQuestion(r, idm, row, { key: (x) => `E:idm:${x.p}`, subject: S, topic: "Idioms and phrases", en: (x) => `What does the idiom '${x.p}' mean?`, answer: (x) => x.a }));
  for (const w of SPELLINGS) {
    out.push(mcq(r, { key: `E:spell:${w}`, subject: S, topic: "Spelling", difficulty: "MEDIUM", en: "Choose the correctly spelt word." }, w, misspell(r, w)));
  }
  const PREP: [string, string, string[]][] = [
    ["She is good ___ mathematics.", "at", ["in", "on", "for"]], ["He has been ill ___ last Monday.", "since", ["for", "from", "by"]],
    ["They have lived here ___ ten years.", "for", ["since", "from", "by"]], ["The book is ___ the table.", "on", ["at", "in", "by"]],
    ["He is fond ___ music.", "of", ["for", "with", "about"]], ["She was angry ___ her brother.", "with", ["on", "at", "for"]],
    ["I prefer tea ___ coffee.", "to", ["than", "over", "from"]], ["He was accused ___ theft.", "of", ["for", "with", "about"]],
    ["The train arrived ___ time.", "on", ["at", "in", "by"]], ["She is married ___ a doctor.", "to", ["with", "by", "for"]],
    ["He died ___ cholera.", "of", ["from", "by", "with"]], ["We should abide ___ the rules.", "by", ["with", "to", "on"]],
    ["He is senior ___ me.", "to", ["than", "from", "over"]], ["The cat jumped ___ the wall.", "over", ["across", "on", "in"]],
    ["She congratulated him ___ his success.", "on", ["for", "at", "with"]], ["He is addicted ___ smoking.", "to", ["with", "for", "of"]],
    ["I will meet you ___ 5 o'clock.", "at", ["on", "in", "by"]], ["He insisted ___ paying the bill.", "on", ["for", "at", "to"]],
  ];
  for (const [s, a, wrong] of PREP) out.push(mcq(r, { key: `E:prep:${s}`, subject: S, topic: "Prepositions", difficulty: "EASY", en: `Fill in the blank with the correct preposition: ${s}` }, a, wrong));
  const ART: [string, string, string[]][] = [
    ["He is ___ honest man.", "an", ["a", "the", "no article"]], ["She is ___ European.", "a", ["an", "the", "no article"]],
    ["___ sun rises in the east.", "The", ["A", "An", "No article"]], ["He bought ___ umbrella.", "an", ["a", "the", "no article"]],
    ["She is ___ university student.", "a", ["an", "the", "no article"]], ["___ Ganga is a holy river.", "The", ["A", "An", "No article"]],
    ["It was ___ hour before he came.", "an", ["a", "the", "no article"]], ["He is ___ one-eyed man.", "a", ["an", "the", "no article"]],
  ];
  for (const [s, a, wrong] of ART) out.push(mcq(r, { key: `E:art:${s}`, subject: S, topic: "Articles", difficulty: "EASY", en: `Fill in the blank with the correct article: ${s}` }, a, wrong));
  return out.filter((x): x is GenQuestion => !!x);
}
