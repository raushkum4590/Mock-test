import type { LearnModule } from "../types";
import { H03_EXTRA_LESSONS } from "./h03-modern-extra";

export const H03_MODERN: LearnModule = {
  id: "modern",
  title: "Modern India & the freedom struggle",
  titleHi: "आधुनिक भारत एवं स्वतंत्रता संग्राम",
  blurb: "How the British took over, how Indians resisted and reformed society, and the long road to independence — the highest-scoring part of history.",
  lessons: [
    {
      id: "british-conquest",
      title: "Europeans arrive & the British conquest",
      oneLine: "Europeans came to trade; the English East India Company used battles like Plassey and Buxar to become India's ruler.",
      minutes: 15,
      blocks: [
        {
          t: "table",
          head: ["European power", "Arrival", "Remember"],
          rows: [
            ["Portuguese", "1498 — Vasco da Gama reached Calicut", "First to come, last to leave (Goa, 1961)"],
            ["Dutch", "1602 Dutch East India Company", "Spices; mostly in Southeast Asia"],
            ["English", "1600 East India Company (charter by Queen Elizabeth I)", "First factory at Surat (1613)"],
            ["French", "1664 French East India Company", "Main base Pondicherry; lost the Carnatic wars to the English"],
          ],
        },
        { t: "p", text: "**Battle of Plassey (1757)** — in Bengal. **Robert Clive** (English) defeated **Siraj-ud-Daulah**, the Nawab of Bengal, mainly by bribing the Nawab's commander **Mir Jafar**, who was then made Nawab. Won by treachery more than fighting, it gave the Company control of Bengal." },
        { t: "p", text: "**Battle of Buxar (1764)** — in Bihar. The Company defeated a combined army of **Mir Qasim** (Nawab of Bengal), **Shuja-ud-Daulah** (Nawab of Awadh) and the Mughal emperor **Shah Alam II**. A real military victory. By the **Treaty of Allahabad (1765)** the Company got the **Diwani** — the right to collect revenue — of **Bengal, Bihar and Orissa**." },
        { t: "trap", text: "Plassey 1757 (Bengal) vs Buxar 1764 (Bihar). Buxar is considered more decisive because it was a genuine battle victory against three powers." },
        {
          t: "table",
          head: ["How the British expanded", "Who / when", "Meaning"],
          rows: [
            ["Wars", "Anglo-Mysore (Hyder Ali, Tipu Sultan — died 1799), Anglo-Maratha, Anglo-Sikh wars", "Conquest by force"],
            ["Subsidiary Alliance", "Lord Wellesley (1798); Hyderabad was the first to accept", "An Indian ruler kept a British army, paid for it, and gave up foreign policy"],
            ["Doctrine of Lapse", "Lord Dalhousie (1848–56); Satara was first, then Jhansi, Nagpur", "If a ruler died without a natural son, the state was taken over"],
          ],
        },
        {
          t: "recap",
          items: [
            "Vasco da Gama 1498 Calicut; English EIC 1600; first English factory Surat",
            "Plassey 1757: Clive vs Siraj-ud-Daulah (Mir Jafar's betrayal)",
            "Buxar 1764: vs Mir Qasim, Shuja-ud-Daulah, Shah Alam II → Diwani 1765",
            "Subsidiary Alliance — Wellesley; Doctrine of Lapse — Dalhousie",
          ],
        },
      ],
      quiz: [
        { q: "The Battle of Buxar was fought in:", options: ["1757", "1764", "1765", "1799"], answer: 1, explain: "1764; Diwani was granted in 1765." },
        { q: "The Doctrine of Lapse is associated with:", options: ["Wellesley", "Dalhousie", "Cornwallis", "Clive"], answer: 1, explain: "Lord Dalhousie annexed Satara, Jhansi, Nagpur." },
        { q: "Which state first accepted the Subsidiary Alliance?", options: ["Mysore", "Hyderabad", "Awadh", "Satara"], answer: 1, explain: "Hyderabad, 1798." },
      ],
    },
    {
      id: "british-policies",
      title: "British land-revenue systems & the drain of wealth",
      oneLine: "The British changed how land was taxed to collect as much money as possible — and much of India's wealth flowed to Britain.",
      minutes: 13,
      blocks: [
        {
          t: "table",
          head: ["System", "Introduced by / year", "Where", "Who paid the tax to the government"],
          rows: [
            ["Permanent Settlement (Zamindari)", "Lord Cornwallis, 1793", "Bengal, Bihar, Orissa", "Zamindars — tax fixed forever; zamindars squeezed peasants"],
            ["Ryotwari", "Thomas Munro (and Read)", "Madras, Bombay", "Peasants (ryots) directly"],
            ["Mahalwari", "Holt Mackenzie (1822)", "North-west provinces, Punjab, Agra", "The village (mahal) as a whole"],
          ],
        },
        { t: "trick", text: "“Permanent — Cornwallis — Bengal”, “Ryot = peasant — Munro — Madras”, “Mahal = village — Mackenzie — north-west”." },
        { t: "p", text: "**Drain of wealth theory** — **Dadabhai Naoroji** (the “Grand Old Man of India”) showed in his book **Poverty and Un-British Rule in India** that India's wealth was being drained to Britain through salaries, pensions, profits and “home charges”, without anything coming back. This was an early economic argument against British rule." },
        { t: "p", text: "**Other effects:** Indian handicrafts and weaving declined because cheap British machine-made goods flooded the market (**de-industrialisation**); farmers were forced to grow cash crops like **indigo** and opium; frequent famines." },
        {
          t: "recap",
          items: [
            "Permanent Settlement 1793, Cornwallis, Bengal–Bihar–Orissa, zamindars",
            "Ryotwari — Munro — peasants directly; Mahalwari — village as a unit",
            "Dadabhai Naoroji: drain theory, “Poverty and Un-British Rule in India”",
            "De-industrialisation and forced cash crops (indigo)",
          ],
        },
      ],
      quiz: [
        { q: "The Permanent Settlement was introduced by:", options: ["Warren Hastings", "Lord Cornwallis", "Lord Dalhousie", "Thomas Munro"], answer: 1, explain: "In 1793, for Bengal, Bihar and Orissa." },
        { q: "The drain of wealth theory was put forward by:", options: ["R. C. Dutt only", "Dadabhai Naoroji", "Gopal Krishna Gokhale", "M. G. Ranade"], answer: 1, explain: "In “Poverty and Un-British Rule in India”." },
      ],
    },
    {
      id: "revolt-1857",
      title: "The Revolt of 1857",
      oneLine: "In 1857 soldiers, peasants and rulers rose together against the Company; it failed, but it ended Company rule — India passed directly to the British Crown.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Why did it happen?** Many reasons added up: **political** (Doctrine of Lapse, annexation of Awadh 1856), **economic** (heavy land taxes, ruined artisans), **social-religious** (fear that the British wanted to convert Indians), **military** (Indian soldiers — sepoys — were paid less and treated badly). The **immediate cause** was the new **Enfield rifle** whose cartridges were said to be greased with cow and pig fat, which both Hindus and Muslims had to bite open." },
        { t: "p", text: "**How it started:** **Mangal Pandey** attacked officers at **Barrackpore** (29 March 1857) and was hanged. The actual revolt began at **Meerut on 10 May 1857**; the soldiers marched to Delhi and declared the old Mughal emperor **Bahadur Shah Zafar** their leader." },
        {
          t: "table",
          head: ["Centre", "Indian leader", "British officer who suppressed it"],
          rows: [
            ["Delhi", "Bahadur Shah Zafar, General Bakht Khan", "John Nicholson, Hodson"],
            ["Kanpur", "Nana Saheb, Tantia Tope", "Colin Campbell"],
            ["Lucknow", "Begum Hazrat Mahal", "Colin Campbell"],
            ["Jhansi", "Rani Lakshmibai", "Hugh Rose"],
            ["Jagdishpur (Bihar)", "Kunwar Singh (about 80 years old)", "William Taylor, Vincent Eyre"],
            ["Faizabad", "Maulvi Ahmadullah", "—"],
          ],
        },
        { t: "p", text: "**Why did it fail?** It was limited to parts of north and central India; many rulers supported the British; there was no single leader or common plan; the British had better weapons and communications." },
        { t: "p", text: "**Results:** the **Government of India Act 1858** ended East India Company rule — India came directly under the **British Crown**. The Governor-General became the **Viceroy** (Lord Canning was the first). **Queen Victoria's Proclamation (1858)** promised not to annex more states and to respect religions." },
        { t: "trap", text: "The revolt began at Meerut on 10 May 1857 — Mangal Pandey's incident at Barrackpore (March 1857) came earlier. Bihar's hero is Kunwar Singh of Jagdishpur." },
        {
          t: "recap",
          items: [
            "Immediate cause: greased cartridges of the Enfield rifle",
            "Started at Meerut, 10 May 1857; Bahadur Shah Zafar declared emperor",
            "Leaders: Nana Saheb (Kanpur), Hazrat Mahal (Lucknow), Lakshmibai (Jhansi), Kunwar Singh (Bihar)",
            "Government of India Act 1858 → Crown rule; Canning first Viceroy",
          ],
        },
      ],
      quiz: [
        { q: "The Revolt of 1857 began at:", options: ["Barrackpore", "Meerut", "Delhi", "Kanpur"], answer: 1, explain: "10 May 1857." },
        { q: "Who led the revolt in Bihar?", options: ["Nana Saheb", "Kunwar Singh", "Tantia Tope", "Maulvi Ahmadullah"], answer: 1, explain: "Kunwar Singh of Jagdishpur." },
        { q: "After 1857, the first Viceroy of India was:", options: ["Lord Dalhousie", "Lord Canning", "Lord Curzon", "Lord Ripon"], answer: 1, explain: "Governor-General Canning became the first Viceroy." },
      ],
    },
    {
      id: "reform-movements",
      title: "Social & religious reform movements",
      oneLine: "In the 19th century Indian reformers fought evils like sati, child marriage and caste discrimination, and spread modern education.",
      minutes: 14,
      blocks: [
        {
          t: "table",
          head: ["Reformer", "Organisation / work", "Remember"],
          rows: [
            ["Raja Ram Mohan Roy", "Brahmo Samaj (1828)", "“Father of the Indian Renaissance”; campaigned against sati → abolished in 1829 by Lord William Bentinck"],
            ["Ishwar Chandra Vidyasagar", "Women's education, widow remarriage", "Hindu Widows' Remarriage Act, 1856"],
            ["Swami Dayanand Saraswati", "Arya Samaj (1875, Bombay)", "Slogan “Back to the Vedas”; book Satyarth Prakash; shuddhi movement"],
            ["Swami Vivekananda", "Ramakrishna Mission (1897)", "Famous speech at Chicago's Parliament of Religions (1893)"],
            ["Jyotiba Phule", "Satyashodhak Samaj (1873)", "Fought caste discrimination; with his wife Savitribai Phule opened a girls' school in Pune (1848)"],
            ["Sir Syed Ahmad Khan", "Aligarh movement; MAO College (1875)", "Modern education for Muslims; college became Aligarh Muslim University"],
            ["Annie Besant", "Theosophical Society (headquarters Adyar, Madras)", "Society founded 1875 in New York by Blavatsky and Olcott; Besant later started the Home Rule League"],
          ],
        },
        { t: "trick", text: "Years: Brahmo 1828 → Satyashodhak 1873 → Arya Samaj 1875 → Ramakrishna Mission 1897. “Roy, Phule, Dayanand, Vivekananda” in that order." },
        { t: "trap", text: "Sati was abolished in 1829 by Lord William Bentinck (because of Ram Mohan Roy's campaign); widow remarriage was legalised in 1856 (Vidyasagar). Don't swap the two." },
        {
          t: "recap",
          items: [
            "Ram Mohan Roy: Brahmo Samaj 1828; sati abolished 1829 (Bentinck)",
            "Vidyasagar: Widow Remarriage Act 1856",
            "Dayanand: Arya Samaj 1875, Satyarth Prakash, Back to the Vedas",
            "Vivekananda: Chicago 1893, Ramakrishna Mission 1897",
            "Phule: Satyashodhak Samaj 1873; Sir Syed: Aligarh, MAO College 1875",
          ],
        },
      ],
      quiz: [
        { q: "Arya Samaj was founded by:", options: ["Raja Ram Mohan Roy", "Swami Dayanand Saraswati", "Swami Vivekananda", "Keshab Chandra Sen"], answer: 1, explain: "In 1875 at Bombay." },
        { q: "Sati was abolished in 1829 by:", options: ["Lord Dalhousie", "Lord William Bentinck", "Lord Canning", "Lord Ripon"], answer: 1, explain: "After Raja Ram Mohan Roy's campaign." },
        { q: "The Satyashodhak Samaj was founded by:", options: ["B. R. Ambedkar", "Jyotiba Phule", "Narayana Guru", "Periyar"], answer: 1, explain: "In 1873." },
      ],
    },
    {
      id: "rise-of-nationalism",
      title: "Congress, moderates & extremists, and the Swadeshi movement (1885–1915)",
      oneLine: "The Indian National Congress (1885) first asked politely for reforms; the partition of Bengal (1905) made the movement angrier and mass-based.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Indian National Congress (INC)** — founded on **28 December 1885** at Bombay with the help of **A. O. Hume**, a retired British officer. First president: **W. C. Bonnerjee**; 72 delegates attended." },
        {
          t: "table",
          head: ["", "Moderates (1885–1905)", "Extremists (from 1905)"],
          rows: [
            ["Leaders", "Dadabhai Naoroji, Gopal Krishna Gokhale, Pherozeshah Mehta", "Lal-Bal-Pal: Lala Lajpat Rai, Bal Gangadhar Tilak, Bipin Chandra Pal; Aurobindo Ghosh"],
            ["Method", "Petitions, prayers, protests — the “3 Ps”", "Boycott, swadeshi, mass agitation"],
            ["Aim", "Reforms within British rule", "Swaraj — “Swaraj is my birthright and I shall have it” (Tilak)"],
          ],
        },
        { t: "p", text: "**Partition of Bengal (1905)** — Viceroy **Lord Curzon** divided Bengal, claiming it was too big to govern. The real aim was to divide Hindus and Muslims and weaken Bengali nationalism. In protest came the **Swadeshi and Boycott movement**: burn foreign cloth, use Indian goods, start national schools. **Rabindranath Tagore** wrote “Amar Sonar Bangla”." },
        {
          t: "table",
          head: ["Year", "Event"],
          rows: [
            ["1906", "Muslim League founded at Dhaka"],
            ["1907", "Surat split — Congress divided into moderates and extremists"],
            ["1909", "Morley–Minto Reforms — separate electorates for Muslims"],
            ["1911", "Partition of Bengal annulled; capital to shift from Calcutta to Delhi (announced at the Delhi Durbar)"],
            ["1915", "Gandhi returned from South Africa (9 January — now Pravasi Bharatiya Divas)"],
            ["1916", "Home Rule Leagues (Tilak in April, Annie Besant in September); Lucknow Pact between Congress and Muslim League"],
          ],
        },
        { t: "trap", text: "The partition of Bengal happened in 1905 (Curzon) and was cancelled in 1911 (Hardinge). Separate electorates came with the Morley–Minto reforms of 1909." },
        {
          t: "recap",
          items: [
            "INC 1885, Bombay, A. O. Hume; first president W. C. Bonnerjee",
            "Moderates: petitions; Extremists (Lal-Bal-Pal): swaraj, boycott",
            "Partition of Bengal 1905 → Swadeshi; annulled 1911",
            "Muslim League 1906; Surat split 1907; Morley–Minto 1909 separate electorates",
            "Home Rule Leagues and Lucknow Pact 1916",
          ],
        },
      ],
      quiz: [
        { q: "The first president of the Indian National Congress was:", options: ["A. O. Hume", "W. C. Bonnerjee", "Dadabhai Naoroji", "Surendranath Banerjee"], answer: 1, explain: "Bombay session, 1885." },
        { q: "Separate electorates for Muslims were introduced by:", options: ["Montagu–Chelmsford Reforms", "Morley–Minto Reforms", "Government of India Act 1935", "Communal Award"], answer: 1, explain: "Indian Councils Act 1909." },
        { q: "The partition of Bengal (1905) was carried out by:", options: ["Lord Curzon", "Lord Minto", "Lord Hardinge", "Lord Lytton"], answer: 0, explain: "It was annulled in 1911." },
      ],
    },
    {
      id: "gandhian-era",
      title: "The Gandhian era: Champaran to Quit India (1917–1942)",
      oneLine: "Gandhi turned the freedom struggle into a mass movement using satyagraha — non-violent resistance — in three big waves: 1920, 1930 and 1942.",
      minutes: 20,
      blocks: [
        { t: "p", text: "**What is satyagraha?** “Insistence on truth” — fighting injustice through non-violence, non-cooperation and willingness to suffer, without hating the opponent. Gandhi first used it in South Africa." },
        {
          t: "table",
          head: ["Year", "Movement", "What happened"],
          rows: [
            ["1917", "Champaran (Bihar)", "First satyagraha in India — for indigo farmers forced under the tinkathia system (grow indigo on 3/20 of their land); Gandhi came at the request of Raj Kumar Shukla"],
            ["1918", "Kheda (Gujarat)", "Peasants unable to pay tax after crop failure; Sardar Patel joined"],
            ["1918", "Ahmedabad mill strike", "Gandhi's first hunger strike, for mill workers"],
            ["1919", "Rowlatt Act → Jallianwala Bagh (13 April)", "Act allowed jailing without trial; General Dyer fired on a peaceful crowd at Amritsar; Tagore returned his knighthood"],
            ["1920–22", "Non-Cooperation & Khilafat movement", "Boycott of British schools, courts, cloth and titles; called off after the violence at Chauri Chaura (5 Feb 1922)"],
            ["1928", "Simon Commission", "All-white commission → “Simon, go back”; Lala Lajpat Rai died after a police lathi-charge"],
            ["1929", "Lahore session (President: Jawaharlal Nehru)", "Purna Swaraj (complete independence) resolution; 26 January 1930 celebrated as Independence Day"],
            ["1930", "Civil Disobedience — Dandi March (12 March – 6 April)", "Gandhi walked 240 miles from Sabarmati to Dandi and broke the salt law"],
            ["1931", "Gandhi–Irwin Pact; Second Round Table Conference", "Gandhi attended the second RTC in London as Congress's only representative"],
            ["1932", "Communal Award → Poona Pact", "Separate electorates for depressed classes replaced by reserved seats (Gandhi–Ambedkar agreement)"],
            ["1942", "Quit India Movement (8 August, Bombay)", "Slogan “Do or Die”; leaders arrested at once; a leaderless mass uprising followed"],
          ],
        },
        { t: "trick", text: "Gandhi's three big waves are about 10 years apart: Non-Cooperation 1920 → Civil Disobedience 1930 → Quit India 1942." },
        { t: "p", text: "**Government of India Act 1935** — provincial autonomy, a proposed federation, and elections in 1937 in which Congress formed governments in most provinces. It later became a major source for India's Constitution." },
        { t: "trap", text: "Champaran (1917) was Gandhi's FIRST satyagraha in India, and it was in Bihar. Non-Cooperation was withdrawn because of Chauri Chaura (1922), not Jallianwala Bagh." },
        {
          t: "recap",
          items: [
            "Champaran 1917 (Bihar, indigo, tinkathia) → Kheda 1918 → Ahmedabad 1918",
            "Rowlatt Act & Jallianwala Bagh 1919 (General Dyer)",
            "Non-Cooperation 1920–22, ended after Chauri Chaura",
            "Lahore 1929 Purna Swaraj; Dandi March 1930; Poona Pact 1932",
            "Quit India 8 August 1942 — “Do or Die”",
          ],
        },
      ],
      quiz: [
        { q: "Gandhi's first satyagraha in India was at:", options: ["Kheda", "Champaran", "Ahmedabad", "Bardoli"], answer: 1, explain: "Champaran, Bihar, 1917 — for indigo farmers." },
        { q: "The Non-Cooperation Movement was withdrawn after:", options: ["Jallianwala Bagh", "Chauri Chaura", "Simon Commission", "Dandi March"], answer: 1, explain: "Violence at Chauri Chaura, February 1922." },
        { q: "The Purna Swaraj resolution was passed at the Congress session of:", options: ["Calcutta 1928", "Lahore 1929", "Karachi 1931", "Lucknow 1916"], answer: 1, explain: "Presided over by Jawaharlal Nehru." },
      ],
    },
    {
      id: "independence",
      title: "Revolutionaries, INA & the road to independence (1942–1947)",
      oneLine: "Alongside Gandhi's non-violence, revolutionaries and Subhas Bose's INA fought too; after World War II the British finally left in 1947 — with partition.",
      minutes: 15,
      blocks: [
        {
          t: "table",
          head: ["Revolutionary / event", "Remember"],
          rows: [
            ["Khudiram Bose (1908)", "Muzaffarpur (Bihar) bomb case — one of the youngest martyrs, hanged at 18"],
            ["Kakori train robbery (1925)", "Ram Prasad Bismil, Ashfaqulla Khan"],
            ["Bhagat Singh & B. K. Dutt (8 April 1929)", "Threw bombs (to make a point, not to kill) in the Central Legislative Assembly; Bhagat Singh, Rajguru and Sukhdev were hanged on 23 March 1931"],
            ["Chandrashekhar Azad", "Leader of the Hindustan Socialist Republican Association (HSRA)"],
            ["Chittagong Armoury Raid (1930)", "Surya Sen"],
          ],
        },
        { t: "p", text: "**Subhas Chandra Bose and the INA.** Bose, twice Congress president (1938, 1939), left India during World War II, took charge of the **Indian National Army (Azad Hind Fauj)** and formed the **Provisional Government of Free India (Azad Hind) in Singapore in 1943**. Slogans: “Delhi Chalo”, “Give me blood and I will give you freedom”. The INA trials at the Red Fort (1945–46) stirred the whole country." },
        {
          t: "table",
          head: ["Year", "Event"],
          rows: [
            ["1942", "Cripps Mission — offered dominion status after the war; rejected"],
            ["1946", "Royal Indian Navy mutiny (Bombay); Cabinet Mission plan; Interim Government (Nehru) formed; Muslim League's Direct Action Day (16 August) → riots"],
            ["1947 (3 June)", "Mountbatten Plan — partition into India and Pakistan"],
            ["1947 (July)", "Indian Independence Act passed by the British Parliament"],
            ["15 August 1947", "Independence; Lord Mountbatten became the first Governor-General of free India; C. Rajagopalachari the first (and only) Indian Governor-General (1948)"],
          ],
        },
        { t: "trap", text: "The first Governor-General of independent India was Lord Mountbatten; the first Indian Governor-General was C. Rajagopalachari. India's first President (1950) was Dr Rajendra Prasad." },
        {
          t: "recap",
          items: [
            "Khudiram Bose (Muzaffarpur 1908); Kakori 1925; Bhagat Singh's Assembly bomb 1929, hanged 1931",
            "Bose: INA, Azad Hind government in Singapore 1943, “Delhi Chalo”",
            "1942 Cripps; 1946 Cabinet Mission, Direct Action Day; 3 June 1947 Mountbatten Plan",
            "15 August 1947 independence with partition",
          ],
        },
      ],
      quiz: [
        { q: "The Provisional Government of Free India was set up in 1943 at:", options: ["Tokyo", "Singapore", "Rangoon", "Berlin"], answer: 1, explain: "By Subhas Chandra Bose." },
        { q: "Bhagat Singh was executed on:", options: ["13 April 1919", "23 March 1931", "8 April 1929", "15 August 1947"], answer: 1, explain: "With Rajguru and Sukhdev." },
        { q: "The plan to partition India (3 June 1947) is known as the:", options: ["Cabinet Mission Plan", "Cripps Plan", "Mountbatten Plan", "Wavell Plan"], answer: 2, explain: "Announced by Lord Mountbatten." },
      ],
    },
    ...H03_EXTRA_LESSONS,
  ],
};
