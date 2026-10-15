import type { LearnModule } from "../types";
import { DISASTERS, NEIGHBOURS_PEOPLES, PARKS_WILDLIFE } from "./g-extra";

export const G04_WORLD_ENV_BIHAR: LearnModule = {
  id: "world-env-bihar",
  title: "World, neighbours, environment, disasters & Bihar",
  titleHi: "विश्व भूगोल, पर्यावरण एवं बिहार",
  blurb: "World “largest/longest” facts, famous lines and straits, ecology and environmental agreements, and the geography of Bihar.",
  lessons: [
    {
      id: "world",
      title: "World geography: records, lines & straits",
      oneLine: "A handful of world records, boundary lines and straits make up most world-geography questions — learn them as tables.",
      minutes: 14,
      blocks: [
        {
          t: "table",
          head: ["Record", "Answer"],
          rows: [
            ["Largest continent / smallest", "Asia / Australia (Oceania)"],
            ["Largest ocean", "Pacific (also deepest)"],
            ["Highest peak", "Mount Everest, Nepal–China — 8,849 m"],
            ["Longest river", "Nile (Africa); Amazon carries the most water"],
            ["Largest hot desert", "Sahara (Africa); largest desert overall is Antarctica"],
            ["Largest country / smallest", "Russia / Vatican City"],
            ["Largest freshwater lake", "Lake Superior (by area); Lake Baikal is the deepest"],
            ["Largest island", "Greenland"],
            ["Highest waterfall", "Angel Falls (Venezuela)"],
            ["Longest mountain range", "Andes (South America)"],
          ],
        },
        {
          t: "table",
          head: ["Boundary line", "Between"],
          rows: [
            ["Radcliffe Line", "India – Pakistan & India – Bangladesh"],
            ["McMahon Line", "India – China (eastern sector)"],
            ["Durand Line", "Pakistan – Afghanistan"],
            ["38th parallel", "North Korea – South Korea"],
            ["49th parallel", "USA – Canada"],
          ],
        },
        {
          t: "table",
          head: ["Strait", "Joins / separates"],
          rows: [
            ["Palk Strait", "India – Sri Lanka"],
            ["Strait of Malacca", "Indian Ocean – South China Sea (Malaysia – Sumatra)"],
            ["Strait of Hormuz", "Persian Gulf – Gulf of Oman (key oil route)"],
            ["Strait of Gibraltar", "Atlantic – Mediterranean (Europe – Africa)"],
            ["Bering Strait", "Asia – North America (Russia – Alaska)"],
            ["Bab-el-Mandeb", "Red Sea – Gulf of Aden"],
          ],
        },
        { t: "p", text: "**Grasslands of the world** (often asked): **Prairies** (North America), **Pampas** (Argentina), **Steppes** (Central Asia), **Veld** (South Africa), **Downs** (Australia)." },
        { t: "trick", text: "Grasslands: “PPSVD” — Prairies, Pampas, Steppes, Veld, Downs — US, Argentina, Asia, South Africa, Australia." },
        {
          t: "recap",
          items: [
            "Asia largest continent; Pacific largest ocean; Everest 8,849 m; Nile longest; Sahara largest hot desert",
            "Radcliffe (India–Pak/Bangladesh), McMahon (India–China), Durand (Pak–Afghan), 38th (Koreas), 49th (USA–Canada)",
            "Palk, Malacca, Hormuz, Gibraltar, Bering",
            "Prairies, Pampas, Steppes, Veld, Downs",
          ],
        },
      ],
      quiz: [
        { q: "The McMahon Line is the boundary between:", options: ["India and Pakistan", "India and China", "Pakistan and Afghanistan", "India and Nepal"], answer: 1, explain: "Eastern sector, Arunachal Pradesh." },
        { q: "The Pampas grasslands are in:", options: ["Australia", "South Africa", "Argentina", "Russia"], answer: 2, explain: "South America." },
        { q: "The Palk Strait separates India from:", options: ["Maldives", "Sri Lanka", "Myanmar", "Indonesia"], answer: 1, explain: "Between Tamil Nadu and Sri Lanka." },
      ],
    },
    NEIGHBOURS_PEOPLES,
    {
      id: "environment",
      title: "Ecology, biodiversity & environment",
      oneLine: "An ecosystem is a community of living things and their surroundings; protecting it needs protected areas at home and agreements across the world.",
      minutes: 16,
      blocks: [
        { t: "p", text: "**Ecosystem basics.** Plants are **producers** (they make food through photosynthesis); animals that eat plants are **primary consumers** (herbivores); animals that eat them are **secondary consumers**; **decomposers** (bacteria, fungi) break dead matter down. A **food chain** shows who eats whom: grass → deer → tiger. Only about **10% of energy** passes to the next level (**Lindeman's 10% law**), so food chains are short." },
        {
          t: "table",
          head: ["Protected area", "Meaning"],
          rows: [
            ["National park", "Strict protection; no human activity like grazing"],
            ["Wildlife sanctuary", "Protection for animals; some activities allowed"],
            ["Biosphere reserve", "Large area with a core (untouched), buffer and transition zone where people live — India has 18"],
            ["Tiger reserve", "Under Project Tiger (1973); first: Jim Corbett (Uttarakhand). Project Elephant 1992"],
          ],
        },
        { t: "p", text: "**Biodiversity hotspots in India:** the **Himalaya**, **Indo-Burma** (North-East), **Western Ghats & Sri Lanka**, and **Sundaland** (Nicobar Islands). **Famous parks:** Kaziranga (Assam — one-horned rhino), Gir (Gujarat — Asiatic lion, its only wild home), Sundarbans (West Bengal — Royal Bengal tiger, mangroves), Keoladeo/Bharatpur (Rajasthan — birds)." },
        {
          t: "table",
          head: ["Agreement / event", "Year", "About"],
          rows: [
            ["Stockholm Conference", "1972", "First UN environment conference → UNEP; World Environment Day 5 June"],
            ["Ramsar Convention", "1971", "Wetlands (Ramsar, Iran)"],
            ["CITES", "1973", "Trade in endangered animals and plants"],
            ["Montreal Protocol", "1987", "Protect the OZONE layer (phase out CFCs)"],
            ["Earth Summit, Rio", "1992", "UNFCCC (climate) and Convention on Biological Diversity"],
            ["Kyoto Protocol", "1997", "Binding cuts in greenhouse gases for rich countries"],
            ["Paris Agreement", "2015", "Keep warming well below 2°C, aim for 1.5°C"],
          ],
        },
        { t: "p", text: "**Disasters:** the **Disaster Management Act, 2005** set up the **National Disaster Management Authority (NDMA)**, chaired by the **Prime Minister**, and the **NDRF** rescue force. India's target for **net-zero** emissions is **2070**." },
        { t: "trap", text: "Montreal Protocol = ozone; Kyoto Protocol = greenhouse gases / climate. Don't mix them up." },
        {
          t: "recap",
          items: [
            "Producers → consumers → decomposers; 10% energy law",
            "National park strictest; 18 biosphere reserves; Project Tiger 1973 (Corbett first), Project Elephant 1992",
            "Hotspots: Himalaya, Indo-Burma, Western Ghats, Sundaland",
            "Ramsar 1971, Stockholm 1972, Montreal 1987 (ozone), Rio 1992, Kyoto 1997, Paris 2015",
            "NDMA (PM chairs) under DM Act 2005; net-zero by 2070",
          ],
        },
      ],
      quiz: [
        { q: "The Montreal Protocol is related to the protection of the:", options: ["Wetlands", "Ozone layer", "Endangered species", "Forests"], answer: 1, explain: "1987 — phase out of CFCs." },
        { q: "The only natural home of the Asiatic lion is:", options: ["Kaziranga", "Gir", "Sundarbans", "Ranthambore"], answer: 1, explain: "Gir, Gujarat." },
        { q: "Which of these is a decomposer?", options: ["Grass", "Deer", "Fungi", "Tiger"], answer: 2, explain: "Fungi and bacteria break down dead matter." },
      ],
    },
    PARKS_WILDLIFE,
    DISASTERS,
    {
      id: "bihar-geography",
      title: "Geography of Bihar",
      oneLine: "Bihar is a land-locked state on the fertile Ganga plain — the Ganga splits it into north and south Bihar, and the Kosi floods make it the “Sorrow of Bihar”.",
      minutes: 16,
      blocks: [
        {
          t: "table",
          head: ["Bihar at a glance", "Value"],
          rows: [
            ["Area", "About 94,163 sq km (land-locked)"],
            ["Borders", "Nepal (north), West Bengal (east), Jharkhand (south), Uttar Pradesh (west)"],
            ["Administrative units", "38 districts, 9 divisions"],
            ["Formation", "Separated from Bengal on 22 March 1912 (Bihar Diwas); Jharkhand was carved out on 15 November 2000"],
            ["Census 2011", "Population 10.41 crore (3rd), density 1,106 (highest), sex ratio 918, literacy 61.8%"],
          ],
        },
        { t: "p", text: "**Physical divisions.** (1) The **Shiwalik / Ramnagar–Someshwar hills** in the far north-west (West Champaran). (2) The **Ganga plain** — most of Bihar, split by the Ganga into **North Bihar** (flood-prone, many rivers from Nepal) and **South Bihar**. (3) The **southern plateau fringe** — hills of Rajgir, Gaya, Kaimur (Kaimur plateau in the south-west)." },
        {
          t: "table",
          head: ["Rivers", "Names"],
          rows: [
            ["North Bihar (join the Ganga from the north)", "Ghaghara, Gandak, Burhi Gandak, Bagmati, Kamla, Kosi, Mahananda"],
            ["South Bihar (from the south)", "Son (biggest southern tributary), Punpun, Phalgu (Gaya), Karmanasa, Kiul"],
          ],
        },
        { t: "p", text: "**Kosi — “the Sorrow of Bihar”** — carries huge amounts of silt from the Himalayas and keeps changing its course, causing floods. The 2008 Kusaha breach was one of the worst floods. The **Gandak** project and the **Son** canal system are major irrigation works (the Son canal at Dehri dates from the 1870s)." },
        {
          t: "table",
          head: ["Nature in Bihar", "Remember"],
          rows: [
            ["Valmiki Tiger Reserve", "West Champaran — Bihar's first tiger reserve"],
            ["Vikramshila Gangetic Dolphin Sanctuary", "Bhagalpur — the Gangetic dolphin is India's National Aquatic Animal (2009) and Bihar's state aquatic animal"],
            ["Kanwar Jheel (Kabartal)", "Begusarai — Bihar's first Ramsar site (2020), large oxbow lake"],
            ["Climate", "Hot summers, cold winters, monsoon rain of about 1,000–1,200 mm; more rain in the north-east"],
            ["Soils", "Mostly alluvial — old (Bangar) and new (Khadar); Tal lands near Mokama are flooded in the rains"],
            ["Crops", "Rice, wheat, maize, pulses; Bihar is famous for makhana (Mithila — GI tag), Shahi litchi (Muzaffarpur — GI tag), Jardalu mango (Bhagalpur — GI tag)"],
          ],
        },
        { t: "trap", text: "After Jharkhand was separated in 2000, most of the minerals (coal, iron, mica) went to Jharkhand. Today Bihar is mainly an agricultural state." },
        {
          t: "recap",
          items: [
            "94,163 sq km; 38 districts, 9 divisions; Bihar Diwas 22 March (1912); Jharkhand 15 Nov 2000",
            "Ganga splits North (flood-prone) and South Bihar; Kosi = Sorrow of Bihar",
            "North: Gandak, Bagmati, Kosi, Mahananda; South: Son, Punpun, Phalgu",
            "Valmiki Tiger Reserve; Vikramshila Dolphin Sanctuary; Kanwar Jheel first Ramsar site (2020)",
            "Makhana, Shahi litchi, Jardalu mango — GI tags",
          ],
        },
      ],
      quiz: [
        { q: "Which river is called the “Sorrow of Bihar”?", options: ["Gandak", "Son", "Kosi", "Bagmati"], answer: 2, explain: "It shifts its course and floods north Bihar." },
        { q: "Bihar's first Ramsar site is:", options: ["Kanwar Jheel", "Chilika", "Loktak", "Sambhar"], answer: 0, explain: "Begusarai, 2020." },
        { q: "The Vikramshila Gangetic Dolphin Sanctuary is in:", options: ["Patna", "Bhagalpur", "Munger", "Begusarai"], answer: 1, explain: "Bhagalpur district." },
      ],
    },
  ],
};
