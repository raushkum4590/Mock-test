import type { LearnModule } from "../types";
import { PASSES_LAKES_DAMS } from "./g-extra";

export const G02_INDIA_PHYSICAL: LearnModule = {
  id: "india-physical",
  title: "India: land, rivers, climate & soils",
  titleHi: "भारत: भू-आकृति, नदियाँ, जलवायु एवं मृदा",
  blurb: "Where India is, its mountains, plains and plateaus, its river systems, the monsoon, and its soils and forests.",
  lessons: [
    {
      id: "location-physiography",
      title: "India's location & physical divisions",
      oneLine: "India has six big physical divisions — the Himalayas, the northern plains, the peninsular plateau, the Thar desert, the coastal plains and the islands.",
      minutes: 18,
      blocks: [
        {
          t: "table",
          head: ["India in numbers", "Value"],
          rows: [
            ["Area", "About 32.87 lakh sq km — 7th largest country, about 2.4% of the world's land"],
            ["Latitude", "8°4′N to 37°6′N (mainland)"],
            ["Longitude", "68°7′E to 97°25′E — about 30° wide, so a 2-hour time difference between east and west"],
            ["Standard meridian", "82°30′E, passing near Mirzapur (Uttar Pradesh)"],
            ["Tropic of Cancer", "Passes through 8 states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram"],
            ["Southernmost point", "Indira Point (Great Nicobar); mainland: Kanyakumari"],
            ["Longest land border", "With Bangladesh"],
          ],
        },
        { t: "trick", text: "Tropic of Cancer states, west to east: “Gu-Ra-M-Chh-J-WB-T-Mi” — Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram. (It does NOT pass through Bihar or Odisha.)" },
        {
          t: "table",
          head: ["Division", "What to know"],
          rows: [
            ["1. The Himalayas", "Young FOLD mountains. Three parallel ranges: Himadri (Greater — highest peaks, e.g. Kangchenjunga 8,586 m), Himachal (Lesser — hill stations like Shimla, Mussoorie), Shiwaliks (Outer — lowest). Flat valleys between Lesser Himalaya and Shiwaliks are called “duns” (Dehradun)"],
            ["2. Northern plains", "Made of ALLUVIUM brought by the Indus, Ganga and Brahmaputra; one of the most fertile and densely populated areas. Bhabar (pebbles at the foothills) → Terai (marshy) → Bhangar (old alluvium) → Khadar (new alluvium, flooded every year)"],
            ["3. Peninsular plateau", "OLDEST landmass (part of Gondwana). Central Highlands (Malwa) and the Deccan Plateau; Western Ghats (Sahyadri, continuous, higher) and Eastern Ghats (broken by rivers, lower). Highest peak of South India: Anamudi (2,695 m)"],
            ["4. Thar desert", "West of the Aravallis (Rajasthan); Aravalli = one of the oldest fold mountains in the world; highest point Guru Shikhar (Mount Abu)"],
            ["5. Coastal plains", "West: Konkan, Kannad, Malabar (with lagoons/“kayals”). East: Northern Circars and Coromandel; wide deltas of Mahanadi, Godavari, Krishna, Kaveri"],
            ["6. Islands", "Andaman & Nicobar (Bay of Bengal — volcanic origin, separated by the Ten Degree Channel) and Lakshadweep (Arabian Sea — coral islands)"],
          ],
        },
        { t: "p", text: "**Highest peak question:** exams that include all Indian territory answer **K2 / Godwin Austen (8,611 m)**, in Indian territory under Pakistan's occupation. **Kangchenjunga (8,586 m, Sikkim)** is the highest peak in the part of India India administers. Read the options carefully." },
        { t: "trap", text: "The Himalayas are YOUNG mountains; the Aravallis and the peninsular plateau are OLD. The Eastern Ghats are lower and broken; the Western Ghats are higher and continuous." },
        {
          t: "recap",
          items: [
            "Area ≈ 32.87 lakh sq km (7th); 82°30′E; Tropic of Cancer through 8 states",
            "Himadri, Himachal, Shiwalik; duns",
            "Plains: Bhabar, Terai, Bhangar (old), Khadar (new)",
            "Plateau oldest; Western Ghats higher & continuous; Anamudi highest in South India",
            "Andamans volcanic (Barren Island), Lakshadweep coral",
          ],
        },
      ],
      quiz: [
        { q: "The Tropic of Cancer does NOT pass through:", options: ["Jharkhand", "Bihar", "Tripura", "Mizoram"], answer: 1, explain: "It passes through 8 states — Bihar is not one of them." },
        { q: "New alluvium in the northern plains is called:", options: ["Bhangar", "Khadar", "Bhabar", "Terai"], answer: 1, explain: "Khadar is renewed by floods every year." },
        { q: "The highest peak of South India is:", options: ["Doddabetta", "Anamudi", "Mahendragiri", "Guru Shikhar"], answer: 1, explain: "Anamudi, in the Anaimalai hills (Kerala)." },
      ],
    },
    {
      id: "rivers",
      title: "Rivers of India",
      oneLine: "Himalayan rivers are big and flow all year (snow-fed); peninsular rivers are older, smaller and depend on rain.",
      minutes: 18,
      blocks: [
        {
          t: "table",
          head: ["Himalayan rivers", "Peninsular rivers"],
          rows: [
            ["Fed by snow AND rain — flow all year (perennial)", "Fed by rain only — little water in summer (seasonal)"],
            ["Young; cut deep gorges; meander a lot in the plains", "Old; shallow valleys"],
            ["Indus, Ganga, Brahmaputra systems", "Godavari, Krishna, Kaveri, Mahanadi, Narmada, Tapi"],
          ],
        },
        { t: "p", text: "**The Ganga system.** The Ganga is formed at **Devprayag** where the **Bhagirathi** (from the Gangotri glacier) meets the **Alaknanda**. Length about **2,525 km** — India's longest river. Left-bank tributaries from the Himalayas: **Ramganga, Gomti, Ghaghara, Gandak, Kosi**. Right-bank: **Yamuna** (largest tributary, meets at Prayagraj) and **Son**. In Bangladesh the Ganga is called the **Padma**; together with the Brahmaputra it forms the **Sundarbans delta** — the world's largest delta." },
        { t: "p", text: "**The Brahmaputra** starts in Tibet as the **Tsangpo**, enters India in Arunachal Pradesh as the **Dihang/Siang**, flows through Assam as the Brahmaputra and enters Bangladesh as the **Jamuna**. **Majuli** in Assam is the largest river island in India. **The Indus** rises near Mansarovar in Tibet; its tributaries are Jhelum, Chenab, Ravi, Beas and Sutlej. Water sharing is governed by the **Indus Waters Treaty (1960)** with Pakistan." },
        {
          t: "table",
          head: ["Peninsular river", "Remember"],
          rows: [
            ["Godavari", "Longest peninsular river (~1,465 km), called the “Dakshin Ganga”; rises at Trimbakeshwar (Nashik)"],
            ["Krishna", "Rises at Mahabaleshwar; tributaries Tungabhadra, Bhima"],
            ["Kaveri", "Rises at Talakaveri (Kodagu, Karnataka); “Ganga of the South”; flows all year because it gets both monsoons"],
            ["Mahanadi", "Hirakud Dam (Odisha) — one of the longest dams in the world"],
            ["Narmada & Tapi", "Flow WEST into the Arabian Sea through RIFT VALLEYS; form ESTUARIES, not deltas. Narmada rises at Amarkantak; Sardar Sarovar Dam is on it"],
          ],
        },
        { t: "trick", text: "“NT flows West” — Narmada and Tapi are the main west-flowing rivers. Most others flow east into the Bay of Bengal and form deltas." },
        { t: "trap", text: "The Ganga is India's longest river, but the Godavari is the longest PENINSULAR river. Narmada and Tapi make estuaries, not deltas." },
        {
          t: "recap",
          items: [
            "Himalayan = perennial, young; peninsular = rain-fed, old",
            "Ganga = Bhagirathi + Alaknanda at Devprayag; ~2,525 km; Yamuna largest tributary; Sundarbans",
            "Brahmaputra: Tsangpo → Dihang → Brahmaputra → Jamuna; Majuli island",
            "Indus Waters Treaty 1960",
            "Godavari = Dakshin Ganga; Narmada & Tapi flow west through rift valleys → estuaries",
          ],
        },
      ],
      quiz: [
        { q: "The Bhagirathi and the Alaknanda meet at:", options: ["Rudraprayag", "Devprayag", "Haridwar", "Karnaprayag"], answer: 1, explain: "From Devprayag the river is called the Ganga." },
        { q: "Which river flows westward into the Arabian Sea?", options: ["Godavari", "Krishna", "Narmada", "Mahanadi"], answer: 2, explain: "Narmada and Tapi flow west through rift valleys." },
        { q: "The longest river of peninsular India is the:", options: ["Krishna", "Kaveri", "Godavari", "Mahanadi"], answer: 2, explain: "About 1,465 km — the Dakshin Ganga." },
      ],
    },
    PASSES_LAKES_DAMS,
    {
      id: "climate-soils-vegetation",
      title: "Monsoon, soils & natural vegetation",
      oneLine: "India's life runs on the monsoon — moisture-laden winds that reverse direction with the seasons; the monsoon in turn shapes our soils and forests.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**What is the monsoon?** In summer the land heats up much faster than the sea, creating **low pressure over north-west India**. Moist winds from the Indian Ocean rush in from the **south-west** and bring rain — the **south-west monsoon (June–September)**, which gives about **three-quarters** of India's yearly rain. It usually reaches **Kerala around 1 June**. In winter the winds reverse and blow from the land — the **north-east (retreating) monsoon (Oct–Dec)**, which gives **Tamil Nadu** most of its rain." },
        {
          t: "table",
          head: ["Season / term", "Meaning"],
          rows: [
            ["Mango showers", "Pre-monsoon showers in Kerala and Karnataka that help mangoes ripen"],
            ["Kal Baisakhi (Norwesters)", "Violent evening thunderstorms in West Bengal and Assam in summer — good for tea, jute, rice"],
            ["Loo", "Hot, dry summer winds in north India"],
            ["Western disturbances", "Winter rain in north-west India from the Mediterranean — very good for the rabi wheat crop"],
            ["October heat", "Hot and humid weather after the monsoon retreats"],
          ],
        },
        { t: "p", text: "**Wettest and driest:** **Mawsynram** (and nearby Cherrapunji) in Meghalaya receive the highest rainfall in the world. The western Rajasthan desert and **Leh** (Ladakh — a cold desert) receive the least. The Western Ghats get heavy rain on the windward (west) side while the plateau behind them lies in a **rain-shadow**." },
        {
          t: "table",
          head: ["Soil", "Where / why", "Good for"],
          rows: [
            ["Alluvial (most widespread, ~40%)", "Northern plains and deltas; deposited by rivers", "Rice, wheat, sugarcane"],
            ["Black (regur)", "Deccan lava plateau (Maharashtra, Gujarat, MP); holds moisture, self-ploughing cracks", "COTTON — called “black cotton soil”"],
            ["Red & yellow", "Eastern & southern plateau; red from iron oxide", "Millets, pulses (with fertilisers)"],
            ["Laterite", "Heavy rain + high heat → leaching (nutrients washed away)", "Tea, coffee, cashew; used to make bricks"],
            ["Arid", "Rajasthan; sandy, salty", "Bajra (with irrigation)"],
            ["Mountain / forest", "Himalayas", "Tea, fruits"],
          ],
        },
        {
          t: "table",
          head: ["Forest type", "Rainfall & place"],
          rows: [
            ["Tropical evergreen (rainforests)", "Over 200 cm; Western Ghats, North-East, Andamans — ebony, mahogany, rosewood; never bare"],
            ["Tropical deciduous (monsoon forests) — MOST widespread", "70–200 cm; trees shed leaves in dry season — teak, sal, sandalwood"],
            ["Thorn forests", "Less than 70 cm; Rajasthan, Gujarat — babool, cactus, kikar"],
            ["Mountain forests", "Change with height — oak, chestnut, then pine, deodar"],
            ["Mangroves (tidal)", "Deltas; Sundarbans — sundari tree, Royal Bengal tiger"],
          ],
        },
        { t: "p", text: "According to the **India State of Forest Report 2023**, forest cover is about **21.8%** of India's area, and forest + tree cover together about **25%**. National Forest Policy (1988) aims for **33%**." },
        { t: "trap", text: "Tamil Nadu gets most rain in WINTER (north-east monsoon). Black soil is for cotton; laterite forms because of leaching in heavy rain." },
        {
          t: "recap",
          items: [
            "SW monsoon June–Sept (~75% of rain), Kerala ~1 June; NE monsoon Oct–Dec → Tamil Nadu",
            "Mango showers, Kal Baisakhi, Loo, Western disturbances",
            "Mawsynram wettest; rain-shadow behind the Western Ghats",
            "Alluvial most widespread; black = cotton; laterite = leaching",
            "Tropical deciduous forests most widespread; forest cover ≈ 21.8% (ISFR 2023); target 33%",
          ],
        },
      ],
      quiz: [
        { q: "Which state gets most of its rainfall from the north-east monsoon?", options: ["Kerala", "Tamil Nadu", "West Bengal", "Gujarat"], answer: 1, explain: "October–December rains from the retreating monsoon." },
        { q: "Black soil is best suited for:", options: ["Tea", "Cotton", "Rice", "Jute"], answer: 1, explain: "Hence the name “black cotton soil”." },
        { q: "The most widespread forests in India are:", options: ["Tropical evergreen", "Tropical deciduous", "Thorn forests", "Mangroves"], answer: 1, explain: "Monsoon forests — teak, sal." },
      ],
    },
  ],
};
