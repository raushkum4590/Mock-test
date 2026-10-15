import type { LearnModule } from "../types";
import { GROWTH_DEVELOPMENT } from "./e-extra";

export const E01_BASICS: LearnModule = {
  id: "basics",
  title: "Economy basics & national income",
  titleHi: "अर्थव्यवस्था की मूल बातें एवं राष्ट्रीय आय",
  blurb: "What an economy is, the three sectors, demand and supply, and how a country's income (GDP) is measured.",
  lessons: [
    {
      id: "what-is-economy",
      title: "What is an economy? Sectors, systems, demand & supply",
      oneLine: "An economy is how a country produces, shares and uses goods and services — and prices are set by the pull between demand and supply.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Start from your village.** A farmer grows wheat, a miller turns it into flour, a shopkeeper sells it, a teacher teaches the farmer's children. Everyone produces something and buys something. All of this activity taken together is the **economy**. Economics asks one basic question: **how do we use limited resources to meet unlimited wants?** (the problem of **scarcity**)." },
        {
          t: "table",
          head: ["Sector", "Meaning", "Examples"],
          rows: [
            ["Primary", "Using natural resources directly", "Farming, fishing, mining, forestry"],
            ["Secondary", "Turning raw material into goods (manufacturing)", "Factories, construction, electricity"],
            ["Tertiary (services)", "Providing services, not goods", "Banking, transport, teaching, IT, health"],
          ],
        },
        { t: "p", text: "In India the **tertiary (services) sector** gives the biggest share of GDP (over half), but **agriculture** still employs the most people (about 45%) — this mismatch is called **disguised unemployment**: more people work on a farm than are really needed." },
        {
          t: "table",
          head: ["Economic system", "Who decides what to produce?", "Example"],
          rows: [
            ["Capitalist (market)", "Private owners and the market", "USA"],
            ["Socialist", "The government", "Former USSR, Cuba"],
            ["Mixed", "Both government and private sector", "INDIA — public sector + private sector together"],
          ],
        },
        { t: "p", text: "**Demand and supply.** **Law of demand:** when the price goes up, people buy less (and vice versa) — other things being equal. **Law of supply:** when the price goes up, sellers want to sell more. Where demand meets supply, we get the **equilibrium price**. **Micro-economics** studies one person, firm or market; **macro-economics** studies the whole economy (GDP, inflation, unemployment). Adam Smith is the “father of economics” (*Wealth of Nations*, 1776); J. M. Keynes is the father of macro-economics." },
        { t: "analogy", text: "Mangoes in May: lots of supply → price falls. Mangoes in December: hardly any supply → price shoots up. That is demand and supply at work." },
        {
          t: "recap",
          items: [
            "Economics = choosing under scarcity",
            "Primary (natural), secondary (manufacturing), tertiary (services)",
            "India: services biggest in GDP, agriculture biggest in jobs → disguised unemployment",
            "India is a mixed economy",
            "Demand ↓ when price ↑; supply ↑ when price ↑; Adam Smith (1776), Keynes (macro)",
          ],
        },
      ],
      quiz: [
        { q: "Banking and transport belong to which sector?", options: ["Primary", "Secondary", "Tertiary", "Quaternary only"], answer: 2, explain: "They provide services." },
        { q: "India's economy is best described as:", options: ["Capitalist", "Socialist", "Mixed", "Feudal"], answer: 2, explain: "Public and private sectors work together." },
        { q: "Who is called the father of economics?", options: ["J. M. Keynes", "Adam Smith", "Karl Marx", "Alfred Marshall"], answer: 1, explain: "Wealth of Nations, 1776." },
      ],
    },
    {
      id: "national-income",
      title: "National income: GDP, GNP & friends",
      oneLine: "GDP is the total value of all final goods and services produced inside a country in a year — the most common measure of the size of an economy.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**GDP (Gross Domestic Product)** = the market value of all **final** goods and services produced **within the country's borders** in one year. We count only *final* goods (the bread, not the flour that went into it) to avoid **double counting**." },
        {
          t: "formula",
          items: [
            ["GNP (National product)", "GDP + net factor income from abroad (income Indians earn abroad − income foreigners earn in India)"],
            ["NDP (Net Domestic Product)", "GDP − depreciation (wear and tear of machines)"],
            ["NNP at factor cost = National Income", "GNP − depreciation − (indirect taxes − subsidies)"],
            ["Per capita income", "National income ÷ population"],
          ],
        },
        { t: "trick", text: "“Domestic” = inside the borders (who cares who produced it). “National” = by the country's people (who cares where). Gross − depreciation = Net." },
        { t: "example", title: "Nominal vs real GDP", steps: ["Last year a country made 100 bags of rice at ₹10 each → GDP = ₹1,000.", "This year it makes the SAME 100 bags, but prices rose to ₹12 → nominal GDP = ₹1,200.", "Did people get 20% more rice? No! Only prices rose.", "Real GDP uses the BASE-YEAR price: 100 × ₹10 = ₹1,000 → real growth = 0%."], answer: "Real GDP removes inflation; nominal GDP uses current prices" },
        {
          t: "table",
          head: ["Who measures what", "Details"],
          rows: [
            ["National Statistics Office (NSO), Ministry of Statistics (MoSPI)", "Calculates GDP; current base year 2011-12 (being revised to 2022-23)"],
            ["First estimate of national income", "Dadabhai Naoroji (1867-68) — “Poverty and Un-British Rule in India”, Drain theory"],
            ["First official estimate", "P. C. Mahalanobis–led National Income Committee (1949)"],
            ["Human Development Index (HDI)", "By UNDP; measures health (life expectancy), education and income per head — designed by Mahbub ul Haq"],
          ],
        },
        { t: "trap", text: "GDP counts production INSIDE India, even by a foreign company. GNP counts production by INDIANS, even abroad. And national income is NNP at factor cost, not GDP." },
        {
          t: "recap",
          items: [
            "GDP = final goods & services within borders in a year",
            "GNP = GDP + net factor income from abroad; Net = Gross − depreciation",
            "National income = NNP at factor cost; per capita = NI ÷ population",
            "Real GDP uses base-year prices (removes inflation)",
            "NSO/MoSPI; Naoroji first estimate; HDI by UNDP (Mahbub ul Haq)",
          ],
        },
      ],
      quiz: [
        { q: "NDP is equal to:", options: ["GDP + depreciation", "GDP − depreciation", "GNP − subsidies", "GDP + taxes"], answer: 1, explain: "Net = Gross − depreciation." },
        { q: "The first estimate of India's national income was made by:", options: ["P. C. Mahalanobis", "V. K. R. V. Rao", "Dadabhai Naoroji", "R. C. Dutt"], answer: 2, explain: "1867-68." },
        { q: "The Human Development Index is published by:", options: ["World Bank", "IMF", "UNDP", "WTO"], answer: 2, explain: "UN Development Programme." },
      ],
    },
    GROWTH_DEVELOPMENT,
  ],
};
