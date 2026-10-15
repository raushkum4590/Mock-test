import type { Lesson } from "../types";

/** Physical module: the universe, the solar system and India in space. */
export const SOLAR_SYSTEM: Lesson = {
  id: "solar-system",
  title: "Universe, solar system, Moon & India's space missions",
  oneLine: "The Sun is one of billions of stars in the Milky Way; eight planets go round it — and each planet has one or two “record” facts exams love.",
  minutes: 18,
  blocks: [
    { t: "p", text: "**From big to small:** the **universe** contains billions of **galaxies**; our galaxy is the **Milky Way** (Akash Ganga); inside it is our star, the **Sun**, with its family of planets — the **solar system**. The nearest star after the Sun is **Proxima Centauri** (about 4.2 light years away)." },
    { t: "trap", text: "A **light year** is a unit of DISTANCE (how far light travels in a year — about 9.46 lakh crore km), not of time." },
    { t: "p", text: "**The Sun** holds about 99.8% of the solar system's mass. It shines by **nuclear fusion** — hydrogen turning into helium. Sunlight takes about **8 minutes 20 seconds** to reach the Earth." },
    {
      t: "table",
      head: ["Planet", "Remember"],
      rows: [
        ["Mercury", "Smallest and closest to the Sun; fastest orbit; no moon"],
        ["Venus", "HOTTEST planet (thick CO₂ atmosphere); brightest — “morning/evening star”; spins east → west (backwards); “Earth's twin” in size; no moon"],
        ["Earth", "“Blue planet”; densest planet; only known life; 1 moon"],
        ["Mars", "“Red planet” (iron oxide); Olympus Mons — highest volcano in the solar system; 2 moons — Phobos and Deimos"],
        ["Jupiter", "LARGEST planet; Great Red Spot (a giant storm); Ganymede — largest moon in the solar system"],
        ["Saturn", "Famous rings; least dense (it would float on water!); Titan; the most known moons"],
        ["Uranus", "Spins on its side (axis tilted ~98°); greenish (methane); found by William Herschel (1781)"],
        ["Neptune", "Farthest planet; strongest winds"],
        ["Pluto", "Called a “dwarf planet” since 2006 (International Astronomical Union)"],
      ],
    },
    { t: "trick", text: "Order of planets: “My Very Educated Mother Just Served Us Noodles” — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. The **asteroid belt** lies between Mars and Jupiter. The first four are rocky (terrestrial); the last four are gas/ice giants." },
    { t: "p", text: "**The Moon** is about **3,84,400 km** away; its light reaches us in about 1.3 seconds. It goes round the Earth in **27.3 days**, and a full cycle of phases (new moon to new moon) takes about **29.5 days**. We always see the **same face** because it spins once on its axis in the same time it takes to go round the Earth. Gravity there is about **1/6** of the Earth's." },
    {
      t: "table",
      head: ["Eclipse", "Who is in the middle", "Happens on"],
      rows: [
        ["Solar eclipse", "The MOON comes between the Sun and the Earth", "New moon (Amavasya)"],
        ["Lunar eclipse", "The EARTH comes between the Sun and the Moon", "Full moon (Purnima)"],
      ],
    },
    {
      t: "table",
      head: ["Indian space mission", "Remember"],
      rows: [
        ["Aryabhata (1975)", "India's first satellite"],
        ["Chandrayaan-1 (2008)", "Found evidence of water molecules on the Moon"],
        ["Mangalyaan / Mars Orbiter Mission (2013)", "Reached Mars orbit in 2014 in the FIRST attempt — first Asian country to do so"],
        ["Chandrayaan-3", "Lander **Vikram** landed near the Moon's **south pole** on **23 August 2023** — India first there; rover **Pragyan**; landing point “Shiv Shakti”; 23 August = **National Space Day**"],
        ["Aditya-L1 (2023)", "India's first solar mission, at Lagrange point L1"],
        ["Axiom-4 (2025)", "Group Captain **Shubhanshu Shukla** — first Indian to visit the International Space Station"],
        ["Gaganyaan", "India's planned human spaceflight programme"],
      ],
    },
    {
      t: "exam",
      items: [
        "“Hottest planet?” → Venus (not Mercury, though Mercury is closest)",
        "“Largest moon of the solar system?” → Ganymede (Jupiter)",
        "“Red planet / Blue planet / Morning star” labels",
        "Chandrayaan-3 date and site; National Space Day 23 August",
      ],
    },
    {
      t: "recap",
      items: [
        "Milky Way; Proxima Centauri nearest star; light year = distance",
        "Sunlight takes ~8 min 20 s; fusion of hydrogen → helium",
        "Mercury smallest; Venus hottest & brightest; Jupiter largest; Saturn least dense; Uranus on its side",
        "Solar eclipse — Moon in the middle, new moon; lunar — Earth in the middle, full moon",
        "Aryabhata 1975; Mangalyaan 2013; Chandrayaan-3 south pole 23 Aug 2023; Aditya-L1",
      ],
    },
  ],
  quiz: [
    { q: "The hottest planet of the solar system is:", options: ["Mercury", "Venus", "Mars", "Jupiter"], answer: 1, explain: "Its thick carbon-dioxide atmosphere traps heat." },
    { q: "A solar eclipse happens when:", options: ["The Earth is between the Sun and the Moon", "The Moon is between the Sun and the Earth", "The Sun is between the Earth and the Moon", "The Moon is behind the Earth"], answer: 1, explain: "Only on a new moon day." },
    { q: "Chandrayaan-3 landed near the Moon's south pole on:", options: ["14 July 2023", "23 August 2023", "2 September 2023", "22 July 2019"], answer: 1, explain: "Now National Space Day." },
    { q: "A light year is a unit of:", options: ["Time", "Speed", "Distance", "Brightness"], answer: 2, explain: "The distance light travels in one year." },
  ],
};

/** Physical module: landforms made by rivers, wind, glaciers, sea and groundwater; mountain types. */
export const LANDFORMS: Lesson = {
  id: "landforms",
  title: "Landforms: rivers, wind, glaciers, sea & types of mountains",
  oneLine: "Running water, wind, ice and waves slowly carve the land; each one leaves its own “signature” landform.",
  minutes: 16,
  blocks: [
    { t: "p", text: "**Weathering vs erosion.** **Weathering** is rocks breaking down *where they are* (by heat, frost, plants, chemicals). **Erosion** is the broken material being *carried away* by an agent — river, wind, glacier or sea waves — and dropped somewhere else (**deposition**)." },
    {
      t: "table",
      head: ["Agent", "Erosion makes", "Deposition makes"],
      rows: [
        ["River (young → old)", "V-shaped valley, gorge, canyon, waterfall, rapids", "Meanders, ox-bow lake, flood plain, levees, delta (or estuary)"],
        ["Wind (deserts)", "Mushroom (pedestal) rock, inselberg", "Sand dunes — crescent-shaped **barchans**; **loess** (fine soil, e.g. in China)"],
        ["Glacier", "U-shaped valley, cirque, horn, fjord (Norway)", "Moraines"],
        ["Sea waves", "Sea cliff, cave, arch, stack", "Beach, spit, bar, lagoon (e.g. Chilika)"],
        ["Groundwater (limestone — karst)", "Sinkholes, caves", "Stalactites (hang from the ceiling), stalagmites (rise from the ground)"],
      ],
    },
    { t: "trick", text: "stalaCtite → Ceiling; stalaGmite → Ground. V-valley = river; U-valley = glacier." },
    {
      t: "table",
      head: ["Mountain type", "How it forms", "Examples"],
      rows: [
        ["Fold mountains", "Plates push and fold layers of rock", "Young: Himalayas, Alps, Andes, Rockies · Old: Aravallis, Appalachians, Urals"],
        ["Block mountains", "Land between faults rises (horst); land that sinks forms a rift valley (graben)", "Vosges, Black Forest (Europe); Satpura is often cited; rift valleys — Narmada, Tapi, Great Rift Valley (Africa)"],
        ["Volcanic mountains", "Lava piles up", "Kilimanjaro, Mt Fuji, Vesuvius"],
        ["Residual mountains", "Worn-down remains of old mountains", "Nilgiris, Parasnath, Rajmahal hills"],
      ],
    },
    { t: "p", text: "**Plateaus** are high flat lands: the **Tibetan plateau** is the highest (“Roof of the World”); the **Deccan plateau** is made of old lava (Deccan traps)." },
    { t: "trap", text: "An ox-bow lake is made by a river's MATURE/old stage (meander cut off), not by a glacier. Fjords are made by glaciers, not rivers." },
    {
      t: "exam",
      items: [
        "Match landform ↔ agent (barchan–wind; moraine–glacier; ox-bow–river; stalactite–groundwater)",
        "“Himalayas are which type of mountains?” → young fold mountains",
        "“Narmada flows through a…” → rift valley",
      ],
    },
    {
      t: "recap",
      items: [
        "Weathering = break in place; erosion = carried away",
        "River: V-valley, waterfall → meander, ox-bow, delta",
        "Wind: mushroom rock, barchan, loess; glacier: U-valley, moraine, fjord",
        "Fold (Himalaya), block (Vosges; rift valleys), volcanic (Kilimanjaro), residual (Nilgiri)",
      ],
    },
  ],
  quiz: [
    { q: "Barchans are formed by:", options: ["Rivers", "Glaciers", "Wind", "Sea waves"], answer: 2, explain: "Crescent-shaped sand dunes." },
    { q: "A U-shaped valley is made by a:", options: ["River", "Glacier", "Wind", "Volcano"], answer: 1, explain: "Rivers make V-shaped valleys." },
    { q: "Stalagmites are found:", options: ["Hanging from cave roofs", "Rising from cave floors", "In river deltas", "In deserts"], answer: 1, explain: "Stalactites hang from the ceiling." },
  ],
};

/** India physical module: passes, lakes, waterfalls and dams. */
export const PASSES_LAKES_DAMS: Lesson = {
  id: "passes-lakes-dams",
  title: "Mountain passes, lakes, waterfalls & dams of India",
  oneLine: "These are pure “which-is-where” questions — the fastest marks in geography if you learn them as tables.",
  minutes: 18,
  blocks: [
    {
      t: "table",
      head: ["Pass", "State / UT", "Connects"],
      rows: [
        ["Karakoram", "Ladakh", "Ladakh – China (Xinjiang)"],
        ["Zoji La", "Ladakh / J&K", "Srinagar – Leh"],
        ["Banihal", "J&K", "Jammu – Srinagar (Jawahar tunnel)"],
        ["Rohtang", "Himachal Pradesh", "Manali – Lahaul (Atal Tunnel, 2020, built beneath it)"],
        ["Shipki La", "Himachal Pradesh", "HP – Tibet; Sutlej enters India here"],
        ["Lipulekh", "Uttarakhand", "To Tibet — Kailash Mansarovar route"],
        ["Nathu La & Jelep La", "Sikkim", "Sikkim – Tibet (Nathu La border trade)"],
        ["Bomdi La", "Arunachal Pradesh", "To Tawang / Tibet"],
        ["Diphu", "Arunachal Pradesh", "India – Myanmar"],
        ["Palghat (Palakkad) gap", "Kerala – Tamil Nadu", "Gap between the Nilgiris and Anaimalai hills"],
        ["Thal ghat & Bhor ghat", "Maharashtra", "Mumbai – Nashik; Mumbai – Pune"],
      ],
    },
    {
      t: "table",
      head: ["Lake", "Where", "Famous for"],
      rows: [
        ["Wular", "J&K", "Largest FRESHWATER lake in India (on the Jhelum)"],
        ["Chilika", "Odisha", "Largest coastal (brackish) lagoon; India's first Ramsar site (1981, with Keoladeo)"],
        ["Sambhar", "Rajasthan", "Largest inland SALT lake"],
        ["Loktak", "Manipur", "Floating islands (phumdis); Keibul Lamjao — the only floating national park (sangai deer)"],
        ["Vembanad", "Kerala", "Longest lake; boat races"],
        ["Pulicat", "AP – Tamil Nadu", "Lagoon; Sriharikota island separates it from the sea"],
        ["Kolleru", "Andhra Pradesh", "Freshwater lake between Godavari & Krishna deltas"],
        ["Lonar", "Maharashtra", "Crater lake made by a meteorite"],
        ["Pangong Tso", "Ladakh", "High-altitude salt lake shared with China"],
        ["Dal", "Srinagar", "Houseboats, shikaras"],
      ],
    },
    {
      t: "table",
      head: ["Waterfall", "River / state"],
      rows: [
        ["Kunchikal", "Varahi, Karnataka — usually given as India's highest"],
        ["Jog (Gersoppa)", "Sharavathi, Karnataka"],
        ["Dudhsagar", "Mandovi, Goa"],
        ["Chitrakote — “Niagara of India”", "Indravati, Chhattisgarh"],
        ["Hundru", "Subarnarekha, Jharkhand"],
        ["Kakolat", "Nawada, Bihar"],
      ],
    },
    {
      t: "table",
      head: ["Dam / project", "River", "State / note"],
      rows: [
        ["Bhakra Nangal", "Sutlej", "HP–Punjab; reservoir Gobind Sagar"],
        ["Tehri", "Bhagirathi", "Uttarakhand — highest dam in India"],
        ["Hirakud", "Mahanadi", "Odisha — one of the longest earthen dams"],
        ["Sardar Sarovar", "Narmada", "Gujarat"],
        ["Nagarjuna Sagar", "Krishna", "Telangana – Andhra Pradesh"],
        ["Mettur", "Kaveri", "Tamil Nadu"],
        ["Tungabhadra", "Tungabhadra", "Karnataka"],
        ["Rihand", "Rihand (Son tributary)", "UP — Govind Ballabh Pant Sagar reservoir"],
        ["Damodar Valley Corporation (1948)", "Damodar — once the “Sorrow of Bengal”", "First multipurpose project of free India, modelled on the USA's Tennessee Valley Authority"],
        ["Farakka barrage", "Ganga", "West Bengal (1975) — feeds the Hooghly"],
        ["Kosi project", "Kosi", "Bihar–Nepal; Bhimnagar barrage"],
        ["Gandak project", "Gandak", "Bihar–UP–Nepal; Valmikinagar barrage"],
        ["Salal, Baglihar", "Chenab", "J&K"],
        ["Idukki", "Periyar", "Kerala — arch dam"],
      ],
    },
    { t: "trap", text: "Wular = largest freshwater lake; Chilika = largest brackish lagoon; Sambhar = largest salt lake. Tehri (Bhagirathi) is India's highest dam, NOT Bhakra." },
    {
      t: "exam",
      items: [
        "Match pass ↔ state (Shipki La–HP; Nathu La–Sikkim; Bomdi La–Arunachal; Zoji La–Ladakh)",
        "Match dam ↔ river (Hirakud–Mahanadi; Nagarjuna Sagar–Krishna; Mettur–Kaveri)",
        "“Largest freshwater / salt / brackish lake” trio",
      ],
    },
    {
      t: "recap",
      items: [
        "Zoji La (Srinagar–Leh), Banihal, Rohtang (Atal Tunnel), Shipki La (Sutlej), Nathu La (Sikkim), Bomdi La, Palghat gap",
        "Wular freshwater; Chilika brackish (first Ramsar); Sambhar salt; Loktak phumdis; Lonar crater",
        "Kunchikal, Jog, Chitrakote (Niagara of India), Kakolat (Bihar)",
        "Bhakra–Sutlej; Tehri–Bhagirathi (highest); Hirakud–Mahanadi; Sardar Sarovar–Narmada; DVC 1948",
      ],
    },
  ],
  quiz: [
    { q: "The largest freshwater lake of India is:", options: ["Chilika", "Wular", "Sambhar", "Dal"], answer: 1, explain: "On the Jhelum in J&K." },
    { q: "Shipki La pass is in:", options: ["Sikkim", "Himachal Pradesh", "Uttarakhand", "Arunachal Pradesh"], answer: 1, explain: "The Sutlej enters India here." },
    { q: "The Hirakud dam is built on the:", options: ["Godavari", "Mahanadi", "Krishna", "Narmada"], answer: 1, explain: "In Odisha." },
    { q: "Keibul Lamjao, the only floating national park, is on:", options: ["Wular lake", "Loktak lake", "Dal lake", "Chilika lake"], answer: 1, explain: "Home of the sangai deer, Manipur." },
  ],
};

/** World/environment module: national parks and wildlife. */
export const PARKS_WILDLIFE: Lesson = {
  id: "parks-wildlife",
  title: "National parks, wildlife projects & national symbols",
  oneLine: "Each famous park protects one “star” animal — learn the park, the state and the animal together.",
  minutes: 16,
  blocks: [
    {
      t: "table",
      head: ["National park / reserve", "State", "Famous for"],
      rows: [
        ["Jim Corbett", "Uttarakhand", "First national park (1936, as Hailey NP); Project Tiger began here (1973)"],
        ["Kaziranga", "Assam", "One-horned rhinoceros (UNESCO site)"],
        ["Manas", "Assam", "Tigers, pygmy hog, golden langur (UNESCO site)"],
        ["Gir", "Gujarat", "Only wild home of the Asiatic lion"],
        ["Sundarbans", "West Bengal", "Royal Bengal tiger in mangroves (UNESCO site)"],
        ["Keoladeo (Bharatpur)", "Rajasthan", "Bird sanctuary (UNESCO site)"],
        ["Ranthambore, Sariska", "Rajasthan", "Tigers"],
        ["Kanha", "Madhya Pradesh", "Barasingha (hard-ground swamp deer)"],
        ["Bandhavgarh", "Madhya Pradesh", "High tiger density; white tigers of Rewa region"],
        ["Kuno", "Madhya Pradesh", "Cheetahs brought from Namibia (17 Sept 2022) — Project Cheetah"],
        ["Periyar", "Kerala", "Elephants"],
        ["Silent Valley", "Kerala", "Lion-tailed macaque"],
        ["Hemis", "Ladakh", "Snow leopard — India's largest national park"],
        ["Dachigam", "J&K", "Hangul (Kashmir stag)"],
        ["Valley of Flowers & Nanda Devi", "Uttarakhand", "UNESCO site"],
        ["Great Himalayan NP", "Himachal Pradesh", "UNESCO site"],
        ["Valmiki", "Bihar", "Bihar's national park & tiger reserve (West Champaran)"],
      ],
    },
    {
      t: "table",
      head: ["Law / project", "Year"],
      rows: [
        ["Wild Life (Protection) Act", "1972 (amended 2022)"],
        ["Project Tiger", "1973"],
        ["Crocodile project", "1975 (Bhitarkanika, Odisha)"],
        ["Project Elephant", "1992"],
        ["Project Snow Leopard", "2009"],
        ["Project Dolphin", "Announced 2020"],
        ["Project Cheetah", "2022 (Kuno)"],
      ],
    },
    { t: "p", text: "**Tiger numbers:** the 2022 All-India Tiger Estimation counted about **3,682 tigers** (about three-quarters of the world's wild tigers); **Madhya Pradesh** has the most. India has **more than 55 tiger reserves**; the largest is **Nagarjunsagar–Srisailam** (Andhra Pradesh). India has **90+ Ramsar wetlands** (2025); **Tamil Nadu** has the most." },
    {
      t: "table",
      head: ["National symbol", "What"],
      rows: [
        ["National animal", "Tiger"],
        ["National bird", "Indian peacock"],
        ["National aquatic animal", "Gangetic river dolphin (2009)"],
        ["National heritage animal", "Elephant (2010)"],
        ["National tree / flower / fruit", "Banyan / lotus / mango"],
      ],
    },
    { t: "p", text: "**IUCN Red List** ranks species from “Least Concern” to “Extinct”. The **Great Indian Bustard** (Rajasthan) is **critically endangered**." },
    { t: "trap", text: "Gir = lions, Kaziranga = rhinos, Kuno = cheetahs. Hemis is the LARGEST national park; Corbett is the OLDEST." },
    {
      t: "exam",
      items: [
        "Match park ↔ state ↔ animal (Dachigam–hangul; Silent Valley–lion-tailed macaque; Kanha–barasingha)",
        "“Cheetahs were reintroduced in…” → Kuno National Park, MP (2022)",
        "National symbols, especially the national aquatic animal (Gangetic dolphin — Bihar's Vikramshila sanctuary)",
      ],
    },
    {
      t: "recap",
      items: [
        "Corbett oldest (1936) & first tiger reserve; Hemis largest",
        "Kaziranga rhino; Gir lion; Sundarbans tiger; Kuno cheetah; Valmiki — Bihar",
        "WPA 1972; Tiger 1973; Elephant 1992; Cheetah 2022",
        "~3,682 tigers (2022); MP most; 90+ Ramsar sites; Tamil Nadu most",
        "Dolphin — national aquatic animal; elephant — heritage animal",
      ],
    },
  ],
  quiz: [
    { q: "The hangul (Kashmir stag) is found in:", options: ["Hemis NP", "Dachigam NP", "Kanha NP", "Gir NP"], answer: 1, explain: "Dachigam, J&K." },
    { q: "Cheetahs were reintroduced in India at:", options: ["Gir", "Kuno", "Sariska", "Bandhavgarh"], answer: 1, explain: "Madhya Pradesh, 17 September 2022." },
    { q: "Which is India's oldest national park?", options: ["Kaziranga", "Jim Corbett", "Gir", "Hemis"], answer: 1, explain: "Founded 1936 as Hailey National Park." },
    { q: "India's national heritage animal is the:", options: ["Tiger", "Elephant", "Gangetic dolphin", "Rhinoceros"], answer: 1, explain: "Declared in 2010." },
  ],
};

/** World/environment module: disasters. */
export const DISASTERS: Lesson = {
  id: "disasters",
  title: "Natural disasters & disaster management in India",
  oneLine: "India faces earthquakes, floods, cyclones, droughts and landslides — knowing WHERE each strikes and WHO manages them is the exam angle.",
  minutes: 14,
  blocks: [
    {
      t: "table",
      head: ["Disaster", "Most-affected areas", "Remember"],
      rows: [
        ["Earthquakes", "Seismic Zone V (highest risk): North-East, J&K & Ladakh, Himachal, Uttarakhand, Rann of Kutch, north Bihar, Andaman & Nicobar", "Bihar–Nepal 1934, Latur 1993, Bhuj 26 Jan 2001"],
        ["Floods", "Assam and Bihar (Brahmaputra, Kosi, Gandak) are the most flood-prone", "Most deaths in the monsoon"],
        ["Cyclones", "East coast (Odisha, AP, West Bengal, Tamil Nadu) — the Bay of Bengal gets more and stronger cyclones", "Odisha super cyclone 1999"],
        ["Tsunami", "Coasts & islands", "26 December 2004 (from Sumatra); warning centre at INCOIS, Hyderabad (2007)"],
        ["Drought", "Rajasthan, Gujarat, parts of the Deccan", "Rain-shadow & low rainfall areas"],
        ["Landslides", "Himalayas, Western Ghats, North-East", "Wayanad, Kerala (July 2024)"],
        ["Heat waves & lightning", "North & central India; lightning deaths high in Bihar, Jharkhand, Odisha", ""],
      ],
    },
    { t: "p", text: "**Naming cyclones:** cyclones in the North Indian Ocean are named from a list made by **13 countries** (WMO/ESCAP panel); the **India Meteorological Department (IMD)** at New Delhi is the regional centre that announces names." },
    {
      t: "table",
      head: ["Who manages disasters", "Details"],
      rows: [
        ["Disaster Management Act", "2005"],
        ["NDMA (national)", "Chaired by the Prime Minister"],
        ["SDMA (state)", "Chaired by the Chief Minister"],
        ["DDMA (district)", "Chaired by the District Magistrate / Collector"],
        ["NDRF", "Specialised national rescue force (2006)"],
        ["NIDM", "National Institute of Disaster Management — training & research"],
        ["Sendai Framework", "Global disaster-risk-reduction plan, 2015–2030"],
      ],
    },
    { t: "trap", text: "The Bay of Bengal gets more cyclones than the Arabian Sea — that is why the east coast suffers more. North Bihar lies in a high earthquake zone." },
    {
      t: "exam",
      items: [
        "“The chairperson of NDMA is…” → Prime Minister",
        "“Which part of India lies in seismic zone V?” — statement questions",
        "Bihar: floods (Kosi), earthquakes (1934), lightning, heat waves",
      ],
    },
    {
      t: "recap",
      items: [
        "Zone V: NE, Himalaya, Kutch, north Bihar, Andamans",
        "Floods — Assam, Bihar; cyclones — east coast; tsunami 2004 (INCOIS)",
        "DM Act 2005: NDMA (PM), SDMA (CM), DDMA (DM); NDRF",
        "Cyclone names: 13-country list; IMD New Delhi",
      ],
    },
  ],
  quiz: [
    { q: "The National Disaster Management Authority is chaired by the:", options: ["Home Minister", "Prime Minister", "President", "Cabinet Secretary"], answer: 1, explain: "Under the DM Act 2005." },
    { q: "India's tsunami early-warning centre is at:", options: ["Chennai", "Hyderabad (INCOIS)", "Pune", "Visakhapatnam"], answer: 1, explain: "Set up in 2007." },
    { q: "Which coast of India is hit more often by cyclones?", options: ["West coast", "East coast", "Both equally", "Neither"], answer: 1, explain: "The Bay of Bengal produces more cyclones." },
  ],
};

/** World/environment module: neighbours, cities on rivers and peoples. */
export const NEIGHBOURS_PEOPLES: Lesson = {
  id: "neighbours-peoples",
  title: "India's neighbours, cities on rivers & tribes",
  oneLine: "Border lengths, capitals, which state touches which country, cities on rivers and tribes — quick-fact tables that cover dozens of questions.",
  minutes: 15,
  blocks: [
    {
      t: "table",
      head: ["Neighbour (by border length)", "Capital", "Indian states / UTs on the border"],
      rows: [
        ["1. Bangladesh (~4,096 km — longest)", "Dhaka", "West Bengal (longest), Assam, Meghalaya, Tripura, Mizoram"],
        ["2. China (~3,488 km)", "Beijing", "Ladakh, Himachal, Uttarakhand, Sikkim, Arunachal Pradesh"],
        ["3. Pakistan (~3,323 km)", "Islamabad", "Gujarat, Rajasthan, Punjab, J&K, Ladakh"],
        ["4. Nepal (~1,751 km)", "Kathmandu", "Uttarakhand, Uttar Pradesh (longest), **Bihar**, West Bengal, Sikkim"],
        ["5. Myanmar (~1,643 km)", "Naypyidaw", "Arunachal Pradesh, Nagaland, Manipur, Mizoram"],
        ["6. Bhutan (~699 km)", "Thimphu", "Sikkim, West Bengal, Assam, Arunachal Pradesh"],
        ["7. Afghanistan (~106 km)", "Kabul", "Ladakh (PoK area)"],
        ["Sri Lanka & Maldives (by sea)", "Sri Jayawardenepura Kotte; Malé", "Tamil Nadu (Palk Strait)"],
      ],
    },
    { t: "trick", text: "Border length order: “B C P N M B A” — Bangladesh, China, Pakistan, Nepal, Myanmar, Bhutan, Afghanistan." },
    {
      t: "table",
      head: ["City", "River"],
      rows: [
        ["London / Paris / Rome", "Thames / Seine / Tiber"],
        ["Cairo", "Nile"],
        ["Baghdad", "Tigris"],
        ["Vienna, Budapest, Belgrade", "Danube"],
        ["Washington DC / New York", "Potomac / Hudson"],
        ["Shanghai", "Yangtze"],
        ["Delhi, Agra / Lucknow", "Yamuna / Gomti"],
        ["Patna, Varanasi, Prayagraj", "Ganga"],
        ["Ahmedabad / Hyderabad / Srinagar", "Sabarmati / Musi / Jhelum"],
        ["Kolkata / Cuttack", "Hooghly / Mahanadi"],
      ],
    },
    {
      t: "table",
      head: ["Tribe / people", "Where"],
      rows: [
        ["Masai", "Kenya, Tanzania"],
        ["Bedouin", "Arabian deserts"],
        ["Bushmen (San)", "Kalahari desert"],
        ["Pygmies", "Congo basin"],
        ["Inuit (Eskimo)", "Arctic — Canada, Greenland"],
        ["Aborigines / Maori", "Australia / New Zealand"],
        ["Bhil (India's largest ST) & Gond", "Rajasthan, MP, Gujarat / central India"],
        ["Santhal, Munda, Oraon", "Jharkhand, Bihar, Odisha, West Bengal"],
        ["Tharu", "Terai of Bihar & Uttar Pradesh"],
        ["Toda", "Nilgiri hills"],
        ["Khasi, Garo (matrilineal)", "Meghalaya"],
        ["Jarawa, Onge, Sentinelese / Shompen", "Andaman / Nicobar"],
      ],
    },
    { t: "trap", text: "India's LONGEST border is with Bangladesh, not China or Pakistan. Uttar Pradesh (not Bihar) has the longest border with Nepal." },
    {
      t: "exam",
      items: [
        "“Which state does NOT border Nepal?” type questions",
        "Match city ↔ river; tribe ↔ region",
        "Capital of Myanmar → Naypyidaw (not Yangon)",
      ],
    },
    {
      t: "recap",
      items: [
        "Bangladesh > China > Pakistan > Nepal > Myanmar > Bhutan > Afghanistan",
        "Bihar borders Nepal; Sikkim borders China, Nepal, Bhutan",
        "Cairo–Nile; Baghdad–Tigris; Danube cities; Patna–Ganga",
        "Bhil largest ST; Santhal, Munda, Oraon; Tharu (Bihar terai); Khasi matrilineal",
      ],
    },
  ],
  quiz: [
    { q: "India shares its longest land border with:", options: ["China", "Pakistan", "Bangladesh", "Nepal"], answer: 2, explain: "About 4,096 km." },
    { q: "Which of these states does NOT border Nepal?", options: ["Bihar", "Sikkim", "Himachal Pradesh", "Uttarakhand"], answer: 2, explain: "Uttarakhand, UP, Bihar, WB and Sikkim border Nepal." },
    { q: "Baghdad is situated on the river:", options: ["Euphrates", "Tigris", "Nile", "Jordan"], answer: 1, explain: "Tigris." },
    { q: "The Tharu tribe lives mainly in the:", options: ["Nilgiri hills", "Terai of Bihar and UP", "Andaman Islands", "Khasi hills"], answer: 1, explain: "Including West Champaran, Bihar." },
  ],
};
