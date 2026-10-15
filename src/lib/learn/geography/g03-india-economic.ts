import type { LearnModule } from "../types";

export const G03_INDIA_ECONOMIC: LearnModule = {
  id: "india-economic",
  title: "India: agriculture, resources, industry & people",
  titleHi: "भारत: कृषि, संसाधन, उद्योग एवं जनसंख्या",
  blurb: "Crops and seasons, minerals and energy, industries and transport, and what the census tells us about India's people.",
  lessons: [
    {
      id: "agriculture",
      title: "Agriculture: crop seasons & revolutions",
      oneLine: "Indian farming follows the monsoon: kharif crops are sown with the rains, rabi crops in winter, and zaid crops in the short summer season.",
      minutes: 15,
      blocks: [
        {
          t: "table",
          head: ["Season", "Sown → harvested", "Crops"],
          rows: [
            ["Kharif (monsoon crops)", "June–July → Sept–Oct", "Rice, maize, jowar, bajra, cotton, jute, groundnut, soybean, arhar"],
            ["Rabi (winter crops)", "Oct–Dec → March–April", "Wheat, barley, gram, mustard, peas"],
            ["Zaid (summer, short)", "Between rabi and kharif", "Watermelon, muskmelon, cucumber, vegetables, fodder"],
          ],
        },
        { t: "trick", text: "Rabi = Arabic for spring (harvest time). Remember “Rabi = Wheat in Winter”, “Kharif = Rice in Rain”." },
        {
          t: "table",
          head: ["Crop", "Needs", "Top states (generally)"],
          rows: [
            ["Rice", "High temperature, heavy rain (100+ cm) or irrigation, alluvial soil", "West Bengal, Uttar Pradesh, Punjab"],
            ["Wheat", "Cool growing season, bright sun at ripening, 50–75 cm rain", "Uttar Pradesh, Punjab, Madhya Pradesh"],
            ["Sugarcane", "Hot & humid, lots of water", "Uttar Pradesh, Maharashtra"],
            ["Cotton", "Black soil, 210 frost-free days", "Gujarat, Maharashtra"],
            ["Jute (“golden fibre”)", "Hot, humid, flood plains", "West Bengal, Bihar, Assam"],
            ["Tea", "Hill slopes, well-drained soil, heavy rain", "Assam, West Bengal (Darjeeling)"],
            ["Coffee", "Hill slopes, shade", "Karnataka (Chikkamagaluru) — over two-thirds of India's coffee"],
          ],
        },
        {
          t: "table",
          head: ["Revolution", "Related to"],
          rows: [
            ["Green", "Food grains (mainly wheat, from 1960s) — M. S. Swaminathan in India; Norman Borlaug worldwide; high-yielding seeds + irrigation + fertilisers"],
            ["White (Operation Flood, 1970)", "Milk — Verghese Kurien (“Milkman of India”); India is the world's largest milk producer"],
            ["Blue", "Fish"],
            ["Yellow", "Oilseeds"],
            ["Golden", "Horticulture (fruits) / honey"],
            ["Silver", "Eggs (poultry)"],
            ["Round", "Potato"],
          ],
        },
        { t: "p", text: "**Minimum Support Price (MSP)** — the price at which the government promises to buy crops; announced for 22 major crops on the recommendation of the **Commission for Agricultural Costs and Prices (CACP)**. **Food Corporation of India (FCI, 1965)** buys and stores grain." },
        { t: "trap", text: "Groundnut, cotton and soybean are KHARIF crops; mustard and gram are RABI crops. Jute is the “golden fibre”." },
        {
          t: "recap",
          items: [
            "Kharif (rain): rice, cotton, maize; Rabi (winter): wheat, mustard, gram; Zaid: melons",
            "Coffee — Karnataka; tea — Assam; jute — West Bengal",
            "Green = grains (Swaminathan, Borlaug); White = milk (Kurien, 1970); Blue = fish; Yellow = oilseeds",
            "MSP on CACP's advice; FCI 1965",
          ],
        },
      ],
      quiz: [
        { q: "Which of these is a rabi crop?", options: ["Rice", "Cotton", "Mustard", "Maize"], answer: 2, explain: "Mustard is sown in winter." },
        { q: "The White Revolution is associated with:", options: ["M. S. Swaminathan", "Verghese Kurien", "Norman Borlaug", "C. Subramaniam"], answer: 1, explain: "Operation Flood, 1970." },
        { q: "The largest coffee-producing state in India is:", options: ["Kerala", "Tamil Nadu", "Karnataka", "Assam"], answer: 2, explain: "Karnataka produces about two-thirds." },
      ],
    },
    {
      id: "resources-industry",
      title: "Minerals, energy, industries & transport",
      oneLine: "India's minerals are concentrated in the old peninsular plateau — especially the Chota Nagpur region — and industries grew up near raw materials and ports.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**Why the Chota Nagpur plateau?** Minerals are mostly found in old rocks. The Chota Nagpur plateau (Jharkhand, Odisha, Chhattisgarh, West Bengal) is so rich in coal, iron ore, mica and bauxite that it is called the **“mineral heartland” / “Ruhr of India”**." },
        {
          t: "table",
          head: ["Mineral", "Remember"],
          rows: [
            ["Coal", "Most in Jharkhand, Odisha, Chhattisgarh; Jharia (Jharkhand) — best coking coal; Raniganj (West Bengal) — oldest coalfield"],
            ["Iron ore", "Odisha is the top producer; Bailadila (Chhattisgarh), Kudremukh (Karnataka) — best ore is haematite/magnetite"],
            ["Bauxite (aluminium)", "Odisha top (Panchpatmali)"],
            ["Mica", "Jharkhand (Koderma), Andhra Pradesh, Rajasthan — used in electrical goods"],
            ["Copper", "Khetri (Rajasthan), Malanjkhand (MP), Singhbhum (Jharkhand)"],
            ["Zinc & lead", "Zawar (Rajasthan)"],
            ["Gold", "Hutti (Karnataka); Kolar Gold Fields (closed 2001)"],
            ["Petroleum", "Digboi (Assam) — oldest oil field & refinery; Mumbai High — largest offshore field; Ankleshwar (Gujarat)"],
          ],
        },
        {
          t: "table",
          head: ["Energy", "Remember"],
          rows: [
            ["Thermal (coal)", "Still the biggest source of India's electricity"],
            ["Hydro", "Bhakra Nangal (Sutlej) — one of the highest gravity dams; Tehri (Bhagirathi) — highest dam in India"],
            ["Nuclear", "Tarapur (Maharashtra, 1969) — first; others: Rawatbhata, Kalpakkam, Narora, Kakrapar, Kaiga, Kudankulam (largest)"],
            ["Solar & wind", "Fast-growing; Bhadla Solar Park (Rajasthan) one of the world's largest; Tamil Nadu and Gujarat lead in wind; India's non-fossil capacity crossed 50% in 2025"],
          ],
        },
        {
          t: "table",
          head: ["Industry", "Firsts & centres"],
          rows: [
            ["Cotton textile", "First mill: Mumbai, 1854 — Mumbai is “Cottonopolis of India”; Ahmedabad “Manchester of India”"],
            ["Jute", "First mill: Rishra (near Kolkata), 1855; Hooghly belt"],
            ["Iron & steel", "TISCO, Jamshedpur (1907) — first big private steel plant; public plants: Bhilai, Rourkela, Durgapur, Bokaro"],
            ["Software / IT", "Bengaluru — “Silicon Valley of India”"],
          ],
        },
        { t: "p", text: "**Transport.** The first train ran on **16 April 1853** from **Bori Bunder (Mumbai) to Thane**. **NH 44** (Srinagar → Kanyakumari) is the longest national highway. The **Golden Quadrilateral** joins Delhi, Mumbai, Chennai and Kolkata. **Mumbai** is the busiest port historically, **Mundra** is the largest private port, and **Kandla (Deendayal Port)** is a tidal port in Gujarat. **National Waterway 1** runs on the Ganga from **Prayagraj to Haldia**." },
        { t: "trap", text: "Digboi is the OLDEST oil field; Mumbai High is the LARGEST offshore field. Tehri is India's highest dam; Hirakud is one of the longest." },
        {
          t: "recap",
          items: [
            "Chota Nagpur = mineral heartland; Jharia coking coal; Odisha top for iron ore & bauxite",
            "Khetri copper; Zawar zinc; Hutti gold; Koderma mica",
            "Digboi oldest oil; Mumbai High offshore; Tarapur first nuclear (1969)",
            "Mumbai cotton 1854; Rishra jute 1855; TISCO 1907",
            "First train 1853 Mumbai–Thane; NH 44 longest; NW-1 Prayagraj–Haldia",
          ],
        },
      ],
      quiz: [
        { q: "India's first nuclear power station was set up at:", options: ["Kalpakkam", "Tarapur", "Narora", "Rawatbhata"], answer: 1, explain: "Tarapur, Maharashtra, 1969." },
        { q: "The Khetri mines in Rajasthan are known for:", options: ["Zinc", "Copper", "Mica", "Gold"], answer: 1, explain: "Copper." },
        { q: "National Waterway 1 runs between:", options: ["Sadiya–Dhubri", "Prayagraj–Haldia", "Kollam–Kottapuram", "Patna–Kolkata only"], answer: 1, explain: "On the Ganga–Bhagirathi–Hooghly." },
      ],
    },
    {
      id: "population",
      title: "Population & census",
      oneLine: "The census counts India's people every ten years; its key numbers — density, sex ratio and literacy — are favourite exam questions.",
      minutes: 12,
      blocks: [
        { t: "p", text: "**Census basics.** The first (non-synchronous) census was in **1872**; the first **regular census** was in **1881** under Lord Ripon; it has been held every 10 years since. **1921** is called the “year of the great divide” — after it India's population never fell. The **2021 census was postponed** (COVID-19); the next census, with **caste enumeration**, has reference date **1 March 2027**. So most questions still use **Census 2011**." },
        {
          t: "table",
          head: ["Census 2011", "India", "Highest", "Lowest"],
          rows: [
            ["Population", "121.09 crore (17.5% of the world)", "Uttar Pradesh", "Sikkim"],
            ["Density (people per sq km)", "382", "Bihar (1,106)", "Arunachal Pradesh (17)"],
            ["Sex ratio (women per 1,000 men)", "943", "Kerala (1,084)", "Haryana (879)"],
            ["Child sex ratio (0–6 yrs)", "919", "Mizoram / Meghalaya (970)", "Haryana (834)"],
            ["Literacy", "74.04%", "Kerala (94%)", "Bihar (61.8%)"],
          ],
        },
        { t: "p", text: "**Other terms:** **Demographic dividend** — a large share of working-age people (15–64) who can boost the economy. **Urbanisation** in 2011 was about **31%**. India became the **world's most populous country in 2023**, passing China (UN estimate)." },
        { t: "trap", text: "Bihar has the HIGHEST population density but the LOWEST literacy (Census 2011). Uttar Pradesh has the largest population." },
        {
          t: "recap",
          items: [
            "First census 1872, regular 1881; 1921 great divide; next census reference date 1 March 2027",
            "2011: 121.09 crore, density 382, sex ratio 943, literacy 74.04%",
            "Bihar density 1,106 (highest), literacy 61.8% (lowest); Kerala sex ratio 1,084",
            "India most populous country since 2023",
          ],
        },
      ],
      quiz: [
        { q: "According to Census 2011, which state has the highest population density?", options: ["West Bengal", "Kerala", "Bihar", "Uttar Pradesh"], answer: 2, explain: "1,106 people per sq km." },
        { q: "India's sex ratio in Census 2011 was:", options: ["927", "933", "940", "943"], answer: 3, explain: "943 women per 1,000 men." },
      ],
    },
  ],
};
