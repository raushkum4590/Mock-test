import type { LearnModule } from "../types";

export const H02_MEDIEVAL: LearnModule = {
  id: "medieval",
  title: "Medieval India",
  titleHi: "मध्यकालीन भारत",
  blurb: "Regional kingdoms, the Delhi Sultanate, Vijayanagara, the Bhakti–Sufi saints, the Mughals and the Marathas.",
  lessons: [
    {
      id: "early-medieval",
      title: "Early medieval kingdoms (750–1200 CE)",
      oneLine: "After Harsha, no single empire ruled the north; regional kingdoms fought for Kannauj, while the Cholas built a great empire in the south.",
      minutes: 13,
      blocks: [
        { t: "p", text: "**The tripartite struggle.** For about 200 years three powers fought to control **Kannauj** (a rich city in the Ganga valley):" },
        {
          t: "table",
          head: ["Dynasty", "Region", "Remember"],
          rows: [
            ["Palas", "Bengal and Bihar", "Founded by Gopala (elected by nobles); Dharmapala founded Vikramashila University (Bihar); supporters of Buddhism"],
            ["Gurjara-Pratiharas", "Western India / Rajasthan", "Stopped Arab invasions"],
            ["Rashtrakutas", "Deccan", "Krishna I built the Kailasa temple at Ellora (cut from a single rock)"],
          ],
        },
        { t: "p", text: "**The Cholas (Tamil Nadu)** — the greatest southern power. **Rajaraja I** built the **Brihadeshwara temple at Thanjavur**. His son **Rajendra I** sent armies to the Ganga (and built a new capital, **Gangaikondacholapuram**) and a navy to Southeast Asia. Cholas are also known for village self-government (**Uttaramerur inscriptions**) and bronze sculptures like **Nataraja**." },
        { t: "p", text: "**Invasions from the north-west.** **Mahmud of Ghazni** raided India 17 times (1000–1027 CE), looting temples — most famously **Somnath (1025)**. **Muhammad Ghori** wanted to rule, not just loot: he lost the **First Battle of Tarain (1191)** to **Prithviraj Chauhan**, but won the **Second Battle of Tarain (1192)**. This opened the way for Turkish rule in Delhi." },
        { t: "trap", text: "Prithviraj Chauhan WON the first battle of Tarain (1191) and LOST the second (1192)." },
        {
          t: "recap",
          items: [
            "Tripartite struggle for Kannauj: Palas, Pratiharas, Rashtrakutas",
            "Palas: Gopala; Dharmapala founded Vikramashila",
            "Rashtrakuta Krishna I: Kailasa temple, Ellora",
            "Cholas: Rajaraja I (Brihadeshwara, Thanjavur), Rajendra I (navy, Gangaikondacholapuram)",
            "Tarain 1191 Prithviraj won; 1192 Ghori won",
          ],
        },
      ],
      quiz: [
        { q: "Vikramashila University was founded by:", options: ["Gopala", "Dharmapala", "Devapala", "Kumaragupta"], answer: 1, explain: "Pala king Dharmapala." },
        { q: "The Brihadeshwara temple at Thanjavur was built by:", options: ["Rajendra I", "Rajaraja I", "Krishna I", "Narasimhavarman"], answer: 1, explain: "Chola king Rajaraja I." },
        { q: "Who won the Second Battle of Tarain (1192)?", options: ["Prithviraj Chauhan", "Muhammad Ghori", "Mahmud of Ghazni", "Jaichand"], answer: 1, explain: "Ghori had lost in 1191 but won in 1192." },
      ],
    },
    {
      id: "delhi-sultanate",
      title: "The Delhi Sultanate (1206–1526)",
      oneLine: "Five dynasties ruled from Delhi for 320 years — remember them as “Slave, Khalji, Tughlaq, Sayyid, Lodi” and one big fact for each famous sultan.",
      minutes: 16,
      blocks: [
        { t: "trick", text: "Dynasty order: “Sab Khao Tab Sab Lo” — Slave (Mamluk), Khalji, Tughlaq, Sayyid, Lodi." },
        {
          t: "table",
          head: ["Dynasty", "Ruler", "Remember him for"],
          rows: [
            ["Slave / Mamluk (1206–1290)", "Qutb-ud-din Aibak", "Founder; began the Qutub Minar; called “Lakh Bakhsh” for generosity"],
            ["", "Iltutmish", "Real consolidator; completed the Qutub Minar; started the iqta system; silver tanka and copper jital coins"],
            ["", "Razia Sultan", "First and only woman ruler of Delhi"],
            ["", "Balban", "Strict ruler — “blood and iron” policy; made nobles bow (sijda, paibos)"],
            ["Khalji (1290–1320)", "Alauddin Khalji", "Market control (fixed prices), branding horses (dagh) and descriptive rolls of soldiers (chehra), defeated Mongols, conquered the south through Malik Kafur"],
            ["Tughlaq (1320–1414)", "Muhammad bin Tughlaq", "Moved the capital from Delhi to Daulatabad (1327) and back; token copper currency; Ibn Battuta visited his court"],
            ["", "Firoz Shah Tughlaq", "Built canals and towns; welfare measures"],
            ["Sayyid (1414–1451)", "Khizr Khan", "Weak dynasty"],
            ["Lodi (1451–1526)", "Sikandar Lodi", "Founded Agra (1504)"],
            ["", "Ibrahim Lodi", "Last Sultan — killed by Babur at the First Battle of Panipat, 1526"],
          ],
        },
        { t: "p", text: "**Iqta system:** the Sultan gave land revenue of an area (an iqta) to an officer (iqtadar) instead of a salary; in return the officer kept soldiers and maintained order." },
        { t: "p", text: "**Muhammad bin Tughlaq's experiments** are asked often: shifting the capital to Daulatabad (people suffered and had to come back), token currency of copper/brass (people forged coins, so it failed), and raising taxes in the Doab during a famine. Brilliant ideas, poorly carried out." },
        { t: "p", text: "**1398: Timur's invasion** devastated Delhi and weakened the Tughlaqs." },
        { t: "trap", text: "Qutub Minar was BEGUN by Aibak and COMPLETED by Iltutmish. The founder of Agra is Sikandar Lodi, not Akbar." },
        {
          t: "recap",
          items: [
            "Slave → Khalji → Tughlaq → Sayyid → Lodi (1206–1526)",
            "Aibak began Qutub Minar; Iltutmish completed it, iqta, tanka & jital",
            "Razia: only woman ruler; Balban: blood and iron",
            "Alauddin: market control, dagh & chehra; MbT: Daulatabad, token currency",
            "Sikandar Lodi founded Agra; Ibrahim Lodi lost Panipat I (1526)",
          ],
        },
      ],
      quiz: [
        { q: "Who introduced market control (fixed prices) in the Delhi Sultanate?", options: ["Balban", "Alauddin Khalji", "Firoz Shah Tughlaq", "Iltutmish"], answer: 1, explain: "Alauddin Khalji fixed prices to maintain a large army cheaply." },
        { q: "Token currency was introduced by:", options: ["Muhammad bin Tughlaq", "Sher Shah Suri", "Iltutmish", "Alauddin Khalji"], answer: 0, explain: "It failed because coins were easy to forge." },
        { q: "The only woman ruler of the Delhi Sultanate was:", options: ["Nur Jahan", "Razia Sultan", "Chand Bibi", "Rani Durgavati"], answer: 1, explain: "Daughter of Iltutmish." },
      ],
    },
    {
      id: "vijayanagara-bhakti",
      title: "Vijayanagara, Bahmani & the Bhakti–Sufi movements",
      oneLine: "In the south, Vijayanagara and Bahmani kingdoms rose; across India, Bhakti and Sufi saints taught that love of God matters more than rituals and caste.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Vijayanagara Empire (1336–1565)** — founded by brothers **Harihara and Bukka** (Sangama dynasty) on the Tungabhadra river; capital **Hampi** (now a UNESCO site). Greatest king: **Krishnadevaraya** (Tuluva dynasty) — a poet himself (**Amuktamalyada** in Telugu); his court had eight great poets, the **Ashtadiggajas**. The empire was defeated at the **Battle of Talikota (1565)** by an alliance of Deccan sultanates." },
        { t: "p", text: "**Bahmani kingdom (1347)** — founded by **Alauddin Hasan Bahman Shah** in the Deccan; famous minister **Mahmud Gawan** (built a madrasa at Bidar). Later it broke into five Deccan sultanates (Bijapur, Golconda, Ahmadnagar, Berar, Bidar)." },
        { t: "p", text: "**Bhakti movement** — devotion (bhakti) to a personal god, in the people's own language, open to all castes. It began in the south with the **Alvars** (devotees of Vishnu) and **Nayanars** (devotees of Shiva), then spread north." },
        {
          t: "table",
          head: ["Saint", "Region", "Remember"],
          rows: [
            ["Ramanuja", "South", "Vishishtadvaita philosophy"],
            ["Ramananda", "North", "Spread Rama-bhakti; Kabir was his disciple"],
            ["Kabir", "Varanasi", "Weaver; criticised both Hindu and Muslim rituals; dohas collected in the Bijak"],
            ["Guru Nanak", "Punjab", "Founder of Sikhism; one God, equality"],
            ["Chaitanya Mahaprabhu", "Bengal", "Krishna-bhakti through kirtan"],
            ["Mirabai", "Rajasthan", "Rajput princess; songs to Krishna"],
            ["Tulsidas", "UP", "Ramcharitmanas (in Awadhi)"],
            ["Surdas", "UP", "Sursagar — songs about Krishna"],
          ],
        },
        { t: "p", text: "**Sufi movement** — the mystical side of Islam, stressing love of God, simple life and service. Sufis were organised into **silsilas** (orders). The **Chishti** order was most popular in India: **Moinuddin Chishti** (dargah at Ajmer), **Nizamuddin Auliya** (Delhi). Poet **Amir Khusrau**, a disciple of Nizamuddin, is called the “Parrot of India” and is linked with the development of qawwali." },
        { t: "trap", text: "Ramcharitmanas was written by Tulsidas in Awadhi — not Sanskrit, and not by Valmiki (who wrote the Ramayana)." },
        {
          t: "recap",
          items: [
            "Vijayanagara 1336 (Harihara & Bukka), capital Hampi; Krishnadevaraya; Talikota 1565",
            "Bahmani 1347 (Bahman Shah); Mahmud Gawan",
            "Bhakti: Alvars (Vishnu) & Nayanars (Shiva) → Kabir, Nanak, Chaitanya, Mirabai, Tulsidas, Surdas",
            "Sufi Chishti order: Moinuddin (Ajmer), Nizamuddin Auliya (Delhi); Amir Khusrau",
          ],
        },
      ],
      quiz: [
        { q: "Vijayanagara was founded by:", options: ["Krishnadevaraya", "Harihara and Bukka", "Bahman Shah", "Rajaraja"], answer: 1, explain: "In 1336, Sangama dynasty." },
        { q: "The Ramcharitmanas was written in:", options: ["Sanskrit", "Braj", "Awadhi", "Maithili"], answer: 2, explain: "Tulsidas wrote it in Awadhi." },
        { q: "The dargah of Moinuddin Chishti is at:", options: ["Delhi", "Ajmer", "Fatehpur Sikri", "Lahore"], answer: 1, explain: "Ajmer, Rajasthan." },
      ],
    },
    {
      id: "mughals",
      title: "The Mughal Empire & Sher Shah Suri",
      oneLine: "Babur founded the Mughal Empire in 1526; Akbar made it strong with tolerance and good administration; it declined after Aurangzeb (1707).",
      minutes: 18,
      blocks: [
        { t: "trick", text: "The great Mughals in order: “Ba Hu Ak Ja Sha Au” — Babur, Humayun, Akbar, Jahangir, Shah Jahan, Aurangzeb." },
        {
          t: "table",
          head: ["Ruler", "Key events and facts"],
          rows: [
            ["Babur (1526–1530)", "First Battle of Panipat 1526 — defeated Ibrahim Lodi using cannons and the tulughma tactic; Battle of Khanwa 1527 — defeated Rana Sanga; wrote his memoir Baburnama (Tuzuk-i-Baburi) in Turki"],
            ["Humayun (1530–1556)", "Defeated by Sher Shah at Chausa (1539) and Kannauj/Bilgram (1540); lived in exile, returned in 1555; died falling from his library stairs"],
            ["Akbar (1556–1605)", "Second Battle of Panipat 1556 (Bairam Khan defeated Hemu); Haldighati 1576 vs Maharana Pratap; abolished jizya (1564); Din-i-Ilahi (1582); mansabdari system; built Fatehpur Sikri and Buland Darwaza"],
            ["Jahangir (1605–1627)", "Chain of justice; wife Nur Jahan very influential; English envoy Sir Thomas Roe came (1615)"],
            ["Shah Jahan (1628–1658)", "Golden age of architecture — Taj Mahal, Red Fort and Jama Masjid in Delhi, Peacock Throne"],
            ["Aurangzeb (1658–1707)", "Reimposed jizya (1679); long Deccan wars; after his death the empire declined"],
          ],
        },
        { t: "p", text: "**Sher Shah Suri (1540–1545)** — an Afghan from Bihar (his tomb is at **Sasaram**) who defeated Humayun. In only five years he: issued the silver **rupiya** (origin of the rupee), rebuilt the **Grand Trunk Road** (Sadak-e-Azam, from Sonargaon in Bengal to Peshawar), built **sarais** (rest houses), improved land measurement and revenue. Akbar later adopted many of his ideas." },
        { t: "p", text: "**Akbar's administration:**" },
        {
          t: "points",
          items: [
            "**Mansabdari system:** every officer got a rank (mansab) with two numbers — zat (personal rank, salary) and sawar (number of horsemen to maintain)",
            "**Land revenue (Zabt / Dahsala):** designed by **Raja Todar Mal** — revenue fixed on the average produce of the past ten years",
            "**Sulh-i-kul:** “peace with all” — religious tolerance; discussions at the Ibadat Khana in Fatehpur Sikri",
            "**Navaratnas** (nine gems) at court: Birbal, Tansen, Abul Fazl (wrote Akbarnama and Ain-i-Akbari), Todar Mal, Raja Man Singh and others",
          ],
        },
        { t: "p", text: "**Decline after 1707:** weak successors, costly wars, revenue problems, rise of regional powers (Marathas, Sikhs, Nawabs) and foreign invasions — **Nadir Shah (1739)** took the Peacock Throne and the Kohinoor diamond; Ahmad Shah Abdali invaded several times." },
        { t: "trap", text: "Panipat I 1526 (Babur vs Ibrahim Lodi), Panipat II 1556 (Akbar/Bairam Khan vs Hemu), Panipat III 1761 (Marathas vs Ahmad Shah Abdali). Haldighati 1576 = Akbar's army (Man Singh) vs Maharana Pratap." },
        {
          t: "recap",
          items: [
            "Babur: Panipat I 1526, Khanwa 1527, Baburnama",
            "Sher Shah (Sasaram, Bihar): rupiya, Grand Trunk Road, sarais",
            "Akbar: Panipat II 1556, mansabdari, Todar Mal's revenue, Din-i-Ilahi, jizya abolished",
            "Shah Jahan: Taj Mahal, Red Fort; Aurangzeb: jizya reimposed, died 1707",
            "Nadir Shah 1739 took the Peacock Throne & Kohinoor",
          ],
        },
      ],
      quiz: [
        { q: "The First Battle of Panipat (1526) was fought between:", options: ["Akbar and Hemu", "Babur and Ibrahim Lodi", "Babur and Rana Sanga", "Marathas and Abdali"], answer: 1, explain: "Babur used artillery and the tulughma tactic." },
        { q: "The silver “rupiya” was introduced by:", options: ["Akbar", "Sher Shah Suri", "Alauddin Khalji", "Muhammad bin Tughlaq"], answer: 1, explain: "Sher Shah Suri, 1540–45." },
        { q: "Who designed Akbar's land revenue system?", options: ["Birbal", "Abul Fazl", "Raja Todar Mal", "Bairam Khan"], answer: 2, explain: "The Zabt / Dahsala system." },
      ],
    },
    {
      id: "marathas",
      title: "Shivaji and the Marathas",
      oneLine: "Shivaji built an independent Maratha kingdom using hill forts and guerrilla warfare; the Peshwas later made the Marathas the strongest power in 18th-century India.",
      minutes: 12,
      blocks: [
        { t: "p", text: "**Shivaji (1630–1680)** — born at Shivneri fort. He captured forts in the Western Ghats, fought the Bijapur sultanate and the Mughals using fast **guerrilla tactics**, and was crowned **Chhatrapati** at **Raigad in 1674**." },
        {
          t: "points",
          items: [
            "**Ashtapradhan:** a council of eight ministers headed by the Peshwa (prime minister)",
            "**Chauth:** one-fourth of the land revenue collected from neighbouring areas in exchange for not raiding them; **Sardeshmukhi:** an extra one-tenth",
            "Famous escape from Agra (1666) after being placed under house arrest by Aurangzeb",
          ],
        },
        { t: "p", text: "**The Peshwas** — after Shivaji's grandson Shahu, the real power passed to the Peshwas (prime ministers): **Balaji Vishwanath**, then **Baji Rao I** (expanded Maratha power to the north), then **Balaji Baji Rao**." },
        { t: "p", text: "**Third Battle of Panipat (1761)** — the Marathas were heavily defeated by **Ahmad Shah Abdali** of Afghanistan. This weakened them just when the British were rising. The Marathas recovered somewhat but were finally defeated by the British in the **Anglo-Maratha wars** (the last ended in 1818)." },
        {
          t: "recap",
          items: [
            "Shivaji: guerrilla warfare, crowned at Raigad 1674, Ashtapradhan, chauth & sardeshmukhi",
            "Peshwas: Balaji Vishwanath → Baji Rao I → Balaji Baji Rao",
            "Panipat III 1761: Marathas lost to Ahmad Shah Abdali",
            "Anglo-Maratha wars ended Maratha power by 1818",
          ],
        },
      ],
      quiz: [
        { q: "Shivaji was crowned at:", options: ["Shivneri", "Raigad", "Pune", "Satara"], answer: 1, explain: "Raigad, 1674." },
        { q: "Chauth was a tax of:", options: ["One-tenth of revenue", "One-fourth of revenue", "Half of revenue", "One-sixth of produce"], answer: 1, explain: "Sardeshmukhi was an additional one-tenth." },
        { q: "The Third Battle of Panipat (1761) was won by:", options: ["The Marathas", "Ahmad Shah Abdali", "The British", "The Mughals"], answer: 1, explain: "A major Maratha defeat." },
      ],
    },
  ],
};
