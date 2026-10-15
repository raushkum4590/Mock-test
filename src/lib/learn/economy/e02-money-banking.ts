import type { LearnModule } from "../types";
import { BANKING_REFORMS, FINANCIAL_MARKETS } from "./e-extra";

export const E02_MONEY_BANKING: LearnModule = {
  id: "money-banking",
  title: "Money, inflation, banking, RBI & financial markets",
  titleHi: "मुद्रा, मुद्रास्फीति, बैंकिंग एवं आरबीआई",
  blurb: "What money does, why prices rise, how banks work and how the Reserve Bank controls money with repo rate, CRR and SLR.",
  lessons: [
    {
      id: "money-inflation",
      title: "Money & inflation",
      oneLine: "Inflation means prices keep rising, so the same ₹100 buys less; the RBI tries to keep it near 4%.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**Why money?** Before money there was **barter** — swapping wheat for cloth. The problem: the person with cloth must want your wheat at the same time (**double coincidence of wants**). Money solves this. It is a **medium of exchange**, a **measure of value**, a **store of value**, and a **standard of deferred payment** (you can repay loans in it)." },
        {
          t: "table",
          head: ["Money measure", "Includes", "Remember"],
          rows: [
            ["M0 (reserve money / high-powered money)", "Currency + bankers' deposits with RBI + other deposits with RBI", "Base money"],
            ["M1 (narrow money)", "Currency with public + demand deposits in banks + other deposits with RBI", "Most liquid"],
            ["M3 (broad money)", "M1 + time (fixed) deposits", "Most widely used measure"],
          ],
        },
        { t: "p", text: "**Inflation** is a continuous rise in the general price level. If inflation is 5%, something that cost ₹100 last year costs ₹105 now — your money's **purchasing power** has fallen. **Deflation** = prices falling. **Stagflation** = high inflation + slow growth + unemployment together." },
        {
          t: "table",
          head: ["Type", "Cause"],
          rows: [
            ["Demand-pull", "Too much money chasing too few goods — demand rises faster than supply"],
            ["Cost-push", "Cost of production rises — e.g. fuel, wages, raw materials"],
            ["Headline vs core", "Headline includes everything; core leaves out volatile food and fuel"],
          ],
        },
        {
          t: "table",
          head: ["Price index", "Released by", "Note"],
          rows: [
            ["CPI (Consumer Price Index)", "NSO (MoSPI)", "Prices consumers pay — the RBI's target uses CPI; new series with base year 2024 from 2026"],
            ["WPI (Wholesale Price Index)", "Office of the Economic Adviser, Ministry of Commerce & Industry", "Wholesale prices; base 2011-12; no services"],
          ],
        },
        { t: "p", text: "**Inflation targeting:** since **2016**, the RBI's job (under the amended RBI Act) is to keep **CPI inflation at 4%, with a band of ±2%** (so 2%–6%). Interest rates are decided by a **6-member Monetary Policy Committee (MPC)** chaired by the RBI Governor (3 from RBI + 3 appointed by the government; Governor has the casting vote)." },
        { t: "trap", text: "The RBI's inflation target is based on CPI, not WPI. The target is 4% ± 2%, not “below 6%”." },
        {
          t: "recap",
          items: [
            "Money solves double coincidence of wants; 4 functions",
            "M1 narrow (most liquid), M3 broad (= M1 + time deposits)",
            "Demand-pull vs cost-push; stagflation; core excludes food & fuel",
            "CPI by NSO; WPI by Commerce Ministry's Economic Adviser",
            "Target 4% ± 2% CPI (2016); MPC of 6, Governor casting vote",
          ],
        },
      ],
      quiz: [
        { q: "RBI's inflation target is:", options: ["2% ± 1%", "4% ± 2%", "5% ± 1%", "6% ± 2%"], answer: 1, explain: "CPI inflation 4% with a 2–6% band." },
        { q: "Broad money is denoted by:", options: ["M0", "M1", "M2", "M3"], answer: 3, explain: "M3 = M1 + time deposits." },
        { q: "Too much money chasing too few goods causes:", options: ["Cost-push inflation", "Demand-pull inflation", "Deflation", "Stagflation"], answer: 1, explain: "Demand runs ahead of supply." },
      ],
    },
    {
      id: "rbi-banking",
      title: "The RBI & the banking system",
      oneLine: "Banks take deposits and give loans; the RBI is the “bank of banks” and controls how much money flows using tools like the repo rate, CRR and SLR.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**How a bank earns.** You deposit ₹100; the bank pays you, say, 6% interest. It lends that money to a shopkeeper at 10%. The 4% difference is the bank's earning. Banks keep only a part of deposits as cash — that is why they can create credit." },
        {
          t: "table",
          head: ["About the RBI", "Details"],
          rows: [
            ["Established", "1 April 1935, on the Hilton Young Commission's advice; nationalised on 1 January 1949"],
            ["Headquarters", "Mumbai (first in Kolkata)"],
            ["Roles", "Issues currency (except ₹1 notes & coins — issued by the Government), banker to the government, bank of banks, controls credit, manages foreign exchange"],
            ["Logo", "Tiger and palm tree"],
          ],
        },
        {
          t: "table",
          head: ["Tool", "Meaning", "If RBI raises it…"],
          rows: [
            ["Repo rate", "Rate at which RBI lends to banks for the short term (against government securities)", "Loans get costlier → less money → inflation falls"],
            ["Reverse repo / SDF", "Rate RBI pays banks for parking money with it (Standing Deposit Facility is now the floor)", "Banks park more with RBI"],
            ["CRR (Cash Reserve Ratio)", "Share of deposits banks must keep as CASH with the RBI (no interest)", "Banks have less to lend"],
            ["SLR (Statutory Liquidity Ratio)", "Share of deposits banks must keep in liquid assets themselves — gold, cash, government securities", "Less to lend"],
            ["Bank rate", "Long-term lending rate of RBI to banks (no securities needed)", "Costlier loans"],
            ["Open Market Operations (OMO)", "RBI buys/sells government bonds", "Selling bonds sucks money out"],
          ],
        },
        { t: "analogy", text: "Think of the repo rate as the tap controlling water (money) to a field: when inflation rises, the RBI tightens the tap (raises the repo rate); when growth needs a push, it opens the tap (cuts the rate)." },
        {
          t: "table",
          head: ["Banking milestone", "Year"],
          rows: [
            ["State Bank of India (from Imperial Bank)", "1955"],
            ["14 major banks nationalised", "19 July 1969"],
            ["6 more banks nationalised", "1980"],
            ["NABARD (rural / farm credit)", "1982"],
            ["SIDBI (small industries)", "1990"],
            ["UPI launched (by NPCI)", "2016"],
            ["Pradhan Mantri Jan Dhan Yojana (bank account for every family)", "2014"],
            ["10 public sector banks merged into 4", "2020"],
          ],
        },
        { t: "trap", text: "CRR is kept WITH THE RBI as cash; SLR is kept BY THE BANK itself in gold/cash/securities. ₹1 notes are issued by the Ministry of Finance, not the RBI." },
        {
          t: "recap",
          items: [
            "RBI 1 April 1935 (Hilton Young), nationalised 1949, HQ Mumbai",
            "Repo = RBI lends to banks; raise repo → curb inflation",
            "CRR with RBI (cash); SLR with the bank (gold/securities)",
            "SBI 1955; nationalisation 1969 (14) & 1980 (6); NABARD 1982; SIDBI 1990",
            "UPI 2016 (NPCI); Jan Dhan 2014",
          ],
        },
      ],
      quiz: [
        { q: "The Reserve Bank of India was established in:", options: ["1935", "1947", "1949", "1969"], answer: 0, explain: "1 April 1935; nationalised in 1949." },
        { q: "To control inflation, the RBI will usually:", options: ["Cut the repo rate", "Raise the repo rate", "Cut the CRR", "Buy government bonds"], answer: 1, explain: "Costlier loans reduce demand." },
        { q: "The share of deposits banks keep as cash with the RBI is the:", options: ["SLR", "Bank rate", "CRR", "Repo rate"], answer: 2, explain: "Cash Reserve Ratio." },
      ],
    },
    BANKING_REFORMS,
    FINANCIAL_MARKETS,
  ],
};
