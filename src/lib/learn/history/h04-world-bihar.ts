import type { LearnModule } from "../types";

export const H04_WORLD_BIHAR: LearnModule = {
  id: "world-bihar",
  title: "World history & the history of Bihar",
  titleHi: "विश्व इतिहास एवं बिहार का इतिहास",
  blurb: "The revolutions and world wars that shaped today's world, and Bihar's place in Indian history — a BPSC favourite.",
  lessons: [
    {
      id: "revolutions",
      title: "Revolutions that changed the world",
      oneLine: "Between 1750 and 1920, revolutions in America, France, industry and Russia created the ideas of democracy, rights and socialism we still use.",
      minutes: 14,
      blocks: [
        {
          t: "table",
          head: ["Revolution", "When", "What happened", "Big idea it left"],
          rows: [
            ["Industrial Revolution", "From about 1760, Britain", "Machines, steam engine (James Watt improved it), factories replaced hand-work", "Industrial capitalism, factory working class"],
            ["American Revolution", "1775–1783; Declaration of Independence 4 July 1776", "13 colonies broke free from Britain; George Washington", "“No taxation without representation”; written constitution (1787)"],
            ["French Revolution", "1789 (fall of the Bastille, 14 July)", "Ended the absolute monarchy of Louis XVI; Declaration of the Rights of Man", "Liberty, Equality, Fraternity — inspired democracy and nationalism worldwide"],
            ["Russian Revolution", "1917", "Tsar Nicholas II overthrown; Bolsheviks under Lenin took power (October Revolution)", "First socialist state (USSR, 1922)"],
          ],
        },
        { t: "p", text: "**Why it matters for India:** Indian leaders borrowed these ideas. The words **Liberty, Equality, Fraternity** in our Preamble come from the French Revolution; the idea of a written constitution and a Supreme Court from the USA; Five-Year Plans were inspired by the USSR." },
        { t: "p", text: "**Unification of Italy and Germany (19th century):** Italy united under Mazzini, Garibaldi and Cavour (1871 complete); Germany united under Bismarck's “blood and iron” policy (1871). These are examples of nationalism in Europe — a chapter in Class 10 NCERT." },
        {
          t: "recap",
          items: [
            "Industrial Revolution — Britain, from ~1760, steam engine",
            "American — Declaration of Independence 4 July 1776",
            "French — 1789, Bastille 14 July, Liberty–Equality–Fraternity",
            "Russian — 1917, Lenin, Bolsheviks",
            "Germany and Italy unified in 1871",
          ],
        },
      ],
      quiz: [
        { q: "“Liberty, Equality, Fraternity” is the slogan of the:", options: ["American Revolution", "French Revolution", "Russian Revolution", "Glorious Revolution"], answer: 1, explain: "1789; it also appears in India's Preamble." },
        { q: "The Russian Revolution of 1917 was led by:", options: ["Stalin", "Lenin", "Trotsky only", "Tsar Nicholas"], answer: 1, explain: "Lenin and the Bolsheviks." },
      ],
    },
    {
      id: "world-wars",
      title: "The two World Wars & the United Nations",
      oneLine: "Two world wars killed millions; the second ended with atomic bombs and led to the United Nations, created to prevent another such war.",
      minutes: 14,
      blocks: [
        {
          t: "table",
          head: ["", "World War I", "World War II"],
          rows: [
            ["Years", "1914–1918", "1939–1945"],
            ["Spark", "Assassination of Archduke Franz Ferdinand of Austria at Sarajevo (June 1914)", "Germany invaded Poland (1 September 1939)"],
            ["Sides", "Allies (Britain, France, Russia, later USA) vs Central Powers (Germany, Austria-Hungary, Ottoman Turkey)", "Allies (Britain, France, USSR, USA, China) vs Axis (Germany, Italy, Japan)"],
            ["Key events", "Trench warfare; USA joined in 1917", "Hitler; Japan attacked Pearl Harbor (Dec 1941); atomic bombs on Hiroshima (6 Aug 1945) and Nagasaki (9 Aug 1945)"],
            ["Ended with", "Treaty of Versailles (1919) — harsh on Germany", "Germany and Japan surrendered in 1945"],
            ["Organisation formed", "League of Nations (1920) — failed", "United Nations (24 October 1945)"],
          ],
        },
        { t: "p", text: "**Why did WWI lead to WWII?** The Treaty of Versailles humiliated Germany and made it pay huge reparations. Economic crisis (the **Great Depression, 1929**) and anger helped **Hitler's Nazi party** rise to power in 1933." },
        { t: "p", text: "**United Nations** — founded **24 October 1945** (UN Day) with **51** members, India among them; headquarters **New York**. Main organs: General Assembly, Security Council (5 permanent members with veto: USA, UK, France, Russia, China), International Court of Justice (The Hague), Secretariat, ECOSOC, Trusteeship Council." },
        { t: "p", text: "**After WWII — the Cold War** (1947–1991): rivalry between the USA and USSR without direct war. India led the **Non-Aligned Movement** (Nehru, with Nasser of Egypt and Tito of Yugoslavia; first summit at Belgrade, 1961). The Cold War ended with the breakup of the USSR in 1991." },
        { t: "trap", text: "The League of Nations followed WWI; the United Nations followed WWII. India was a founding member of the UN in 1945 even before independence." },
        {
          t: "recap",
          items: [
            "WWI 1914–18: Sarajevo assassination; Versailles 1919; League of Nations 1920",
            "WWII 1939–45: Poland invaded; Pearl Harbor 1941; Hiroshima & Nagasaki 1945",
            "UN: 24 October 1945, 51 founding members, HQ New York; P5 with veto",
            "Cold War 1947–91; Non-Aligned Movement (Belgrade 1961)",
          ],
        },
      ],
      quiz: [
        { q: "World War II began with Germany's invasion of:", options: ["France", "Poland", "Russia", "Austria"], answer: 1, explain: "1 September 1939." },
        { q: "The United Nations was founded on:", options: ["24 October 1945", "15 August 1947", "11 November 1918", "1 January 1942"], answer: 0, explain: "Observed as UN Day." },
        { q: "The first Non-Aligned Movement summit was held at:", options: ["Bandung", "Belgrade", "New Delhi", "Cairo"], answer: 1, explain: "Belgrade, 1961." },
      ],
    },
    {
      id: "bihar-history",
      title: "History of Bihar — from Magadha to modern times",
      oneLine: "Bihar was the heart of ancient India (Magadha, Buddha, Mahavira, Mauryas, Guptas, Nalanda) and played a key role in the freedom struggle (Kunwar Singh, Champaran).",
      minutes: 16,
      blocks: [
        {
          t: "table",
          head: ["Period", "Bihar's contribution"],
          rows: [
            ["6th century BCE", "Magadha (capital Rajgir, later Pataliputra) became the strongest Mahajanapada; Vaishali (Licchavis) — one of the world's earliest republics"],
            ["Religion", "Buddha's enlightenment at Bodh Gaya; Mahavira born near Vaishali, died at Pavapuri; first Buddhist council at Rajgir, second at Vaishali, third at Pataliputra"],
            ["Empires", "Mauryas and Guptas ruled from Pataliputra"],
            ["Education", "Nalanda (founded by Kumaragupta I, 5th century) and Vikramashila (Pala king Dharmapala) — great universities; Nalanda was destroyed by Bakhtiyar Khilji around 1193"],
            ["Medieval", "Sher Shah Suri (tomb at Sasaram) — rupiya, Grand Trunk Road"],
            ["British period", "Battle of Buxar 1764; Permanent Settlement 1793"],
            ["1857", "Kunwar Singh of Jagdishpur led the revolt at about 80"],
            ["1908", "Khudiram Bose's Muzaffarpur bomb case"],
            ["1912", "Bihar (with Orissa) separated from Bengal Presidency on 22 March 1912 — celebrated as Bihar Diwas"],
            ["1917", "Champaran Satyagraha — Gandhi's first in India"],
            ["1936", "Orissa separated from Bihar"],
            ["1929 / 1936", "Swami Sahajanand Saraswati — Bihar Provincial Kisan Sabha (1929); All India Kisan Sabha (1936)"],
            ["1942", "Quit India: seven students shot while hoisting the flag at the Patna Secretariat (11 August 1942) — the Shaheed Smarak honours them"],
            ["1950", "Dr Rajendra Prasad (from Zeradei, Siwan) became India's first President"],
            ["2000", "Jharkhand separated from Bihar (15 November 2000)"],
          ],
        },
        { t: "p", text: "**UNESCO World Heritage sites in Bihar:** the **Mahabodhi Temple, Bodh Gaya (2002)** and the **Archaeological Site of Nalanda Mahavihara (2016)**." },
        { t: "trick", text: "Bihar dates chain: 1764 Buxar → 1857 Kunwar Singh → 1912 Bihar formed (22 March) → 1917 Champaran → 1942 Patna Secretariat martyrs → 2000 Jharkhand." },
        {
          t: "recap",
          items: [
            "Magadha, Pataliputra, Vaishali republic; Bodh Gaya, Pavapuri",
            "Nalanda (Kumaragupta I) & Vikramashila (Dharmapala); Nalanda destroyed by Bakhtiyar Khilji",
            "Sher Shah of Sasaram; Buxar 1764; Kunwar Singh 1857",
            "Bihar Diwas 22 March (1912); Champaran 1917; Patna Secretariat martyrs 1942",
            "Rajendra Prasad first President; Jharkhand formed 2000",
          ],
        },
      ],
      quiz: [
        { q: "Bihar Diwas is celebrated on:", options: ["26 January", "22 March", "15 November", "11 August"], answer: 1, explain: "Bihar was separated from Bengal on 22 March 1912." },
        { q: "Nalanda University was destroyed by:", options: ["Mahmud of Ghazni", "Bakhtiyar Khilji", "Muhammad Ghori", "Timur"], answer: 1, explain: "Around 1193." },
        { q: "Mahabodhi Temple became a UNESCO World Heritage Site in:", options: ["1993", "2002", "2016", "2021"], answer: 1, explain: "Nalanda was added in 2016." },
      ],
    },
  ],
};
