import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA modules 11–12: greedy and dynamic programming, then advanced topics and interview prep. */
export const DSA11_GREEDY_DP: LearnModule = {
  id: "greedy-dp",
  title: "Greedy and dynamic programming",
  titleHi: "ग्रीडी और डायनेमिक प्रोग्रामिंग",
  blurb: "Greedy: take the best choice now. DP: remember answers to smaller problems so you never solve them twice. From Fibonacci to knapsack and LCS, slowly and with full tables.",
  lessons: [
    {
      id: "greedy",
      title: "Greedy algorithms",
      oneLine: "A greedy algorithm makes the choice that looks best right now and never looks back. It's fast and simple, but it only gives the right answer for certain problems, so you must check that it works.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Activity selection (most meetings in one room)" },
        { t: "p", text: "You have one meeting room and many meeting requests (start, end). Fit as many as possible. Greedy rule: **always pick the meeting that ends earliest**, because it leaves the most time for the rest." },
        { t: "diagram", text: "time:   0 1 2 3 4 5 6 7 8 9\n(1,2)     ██                 ✓ ends first\n(3,4)         ██             ✓ starts after 2\n(0,6)   ████████████         ✗ overlaps\n(5,7)             ████       ✓ starts after 4\n(8,9)                   ██   ✓ starts after 7\n(5,9)             ████████   ✗ overlaps" },
        { t: "h", text: "Step 2: Coin change with Indian coins" },
        { t: "p", text: "To pay ₹93 with the fewest coins/notes from {50, 20, 10, 5, 2, 1}: greedy takes the **biggest coin that fits**, again and again: 50, 20, 20, 2, 1." },
        multi("Activity selection and greedy coin change", {
          python: src`
meetings = [(1, 2), (3, 4), (0, 6), (5, 7), (8, 9), (5, 9)]   # (start, end)
meetings.sort(key=lambda m: m[1])     # greedy rule: earliest END first

chosen = []
last_end = -1
for start, end in meetings:
    if start >= last_end:             # doesn't overlap the last chosen meeting
        chosen.append((start, end))
        last_end = end
print("Selected meetings:", " ".join("(" + str(s) + "," + str(e) + ")" for s, e in chosen))
print("Count:", len(chosen))

coins = [50, 20, 10, 5, 2, 1]         # biggest first
amount = 93
used = []
for c in coins:
    while amount >= c:                # take this coin as long as it fits
        used.append(c)
        amount -= c
print("Coins for 93:", *used)
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Meeting { int start, end; };

int by_end(const void *a, const void *b) {        // compare two meetings by end time
    return ((const struct Meeting *)a)->end - ((const struct Meeting *)b)->end;
}

int main(void) {
    struct Meeting m[] = {{1, 2}, {3, 4}, {0, 6}, {5, 7}, {8, 9}, {5, 9}};
    int n = 6;
    qsort(m, n, sizeof(struct Meeting), by_end);  // greedy rule: earliest END first

    int last_end = -1, count = 0;
    printf("Selected meetings:");
    for (int i = 0; i < n; i++) {
        if (m[i].start >= last_end) {             // no overlap
            printf(" (%d,%d)", m[i].start, m[i].end);
            last_end = m[i].end;
            count++;
        }
    }
    printf("\nCount: %d\n", count);

    int coins[] = {50, 20, 10, 5, 2, 1};          // biggest first
    int amount = 93;
    printf("Coins for 93:");
    for (int i = 0; i < 6; i++) {
        while (amount >= coins[i]) {              // take it while it fits
            printf(" %d", coins[i]);
            amount -= coins[i];
        }
    }
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int, int>> meetings = {{1, 2}, {3, 4}, {0, 6}, {5, 7}, {8, 9}, {5, 9}};
    sort(meetings.begin(), meetings.end(), [](auto& a, auto& b) {
        return a.second < b.second;               // greedy rule: earliest END first
    });

    int lastEnd = -1, count = 0;
    cout << "Selected meetings:";
    for (auto [start, end] : meetings) {
        if (start >= lastEnd) {                   // no overlap
            cout << " (" << start << "," << end << ")";
            lastEnd = end;
            count++;
        }
    }
    cout << endl << "Count: " << count << endl;

    int amount = 93;
    cout << "Coins for 93:";
    for (int c : {50, 20, 10, 5, 2, 1}) {         // biggest first
        while (amount >= c) {                     // take it while it fits
            cout << " " << c;
            amount -= c;
        }
    }
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] meetings = {{1, 2}, {3, 4}, {0, 6}, {5, 7}, {8, 9}, {5, 9}};   // {start, end}
        Arrays.sort(meetings, (a, b) -> a[1] - b[1]);   // greedy rule: earliest END first

        int lastEnd = -1, count = 0;
        StringBuilder sb = new StringBuilder("Selected meetings:");
        for (int[] m : meetings) {
            if (m[0] >= lastEnd) {                      // no overlap
                sb.append(" (").append(m[0]).append(",").append(m[1]).append(")");
                lastEnd = m[1];
                count++;
            }
        }
        System.out.println(sb);
        System.out.println("Count: " + count);

        int amount = 93;
        StringBuilder coinsOut = new StringBuilder("Coins for 93:");
        for (int c : new int[]{50, 20, 10, 5, 2, 1}) {  // biggest first
            while (amount >= c) {                       // take it while it fits
                coinsOut.append(" ").append(c);
                amount -= c;
            }
        }
        System.out.println(coinsOut);
    }
}
`,
          javascript: src`
const meetings = [[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]];   // [start, end]
meetings.sort((a, b) => a[1] - b[1]);   // greedy rule: earliest END first

const chosen = [];
let lastEnd = -1;
for (const [start, end] of meetings) {
  if (start >= lastEnd) {               // no overlap
    chosen.push("(" + start + "," + end + ")");
    lastEnd = end;
  }
}
console.log("Selected meetings: " + chosen.join(" "));
console.log("Count: " + chosen.length);

let amount = 93;
const used = [];
for (const c of [50, 20, 10, 5, 2, 1]) {   // biggest first
  while (amount >= c) {                    // take it while it fits
    used.push(c);
    amount -= c;
  }
}
console.log("Coins for 93: " + used.join(" "));
`,
        }, "Selected meetings: (1,2) (3,4) (5,7) (8,9)\nCount: 4\nCoins for 93: 50 20 20 2 1"),
        { t: "h", text: "Step 3: When greedy FAILS" },
        { t: "table", head: ["Coins", "Amount", "Greedy picks", "Best answer"], rows: [
          ["{1, 3, 4}", "6", "4 + 1 + 1 = **3 coins**", "3 + 3 = **2 coins**"],
        ], caption: "With odd coin systems, the biggest coin first isn't optimal. That's when you need DP (next lessons)." },
        { t: "analogy", text: "Greedy is like always taking the shortest-looking road at each crossing. In a well-planned city, that gets you home. In a city with a dead end behind the short road, it doesn't. Greedy works only when local best choices add up to the global best." },
        { t: "trap", text: "Don't assume greedy works because it gives the right answer on one example. Try to find a counter-example (like coins {1, 3, 4} for 6). In interviews, explain **why** the greedy choice is safe, for example \"picking the earliest-ending meeting never blocks a better solution\"." },
        { t: "trick", text: "**Greedy = sort by the right thing, then take what fits. Always look for a counter-example.**" },
        { t: "exam", items: ["Activity selection / maximum meetings in a room.", "Fractional knapsack (greedy by value/weight ratio works; 0/1 knapsack needs DP).", "Minimum platforms at a railway station.", "Jump game.", "Huffman coding."] },
        { t: "recap", items: ["Greedy: best choice now, never undo it", "Activity selection: sort by end time, take non-overlapping", "Coin change: greedy works for Indian coins, fails for {1, 3, 4}", "Usually O(n log n) because of sorting"] },
      ],
      quiz: [
        { q: "For maximum meetings, sort by…", options: ["End time", "Start time", "Duration", "Random"], answer: 0, explain: "Ending early leaves the most room." },
        { q: "Greedy coin change for 6 with coins {1, 3, 4} gives…", options: ["3 coins (4+1+1), not the best", "2 coins", "1 coin", "No answer"], answer: 0, explain: "The best is 3+3." },
        { q: "A greedy algorithm…", options: ["Never reconsiders a choice", "Tries every possibility", "Always uses recursion", "Is always correct"], answer: 0, explain: "That's why it can fail." },
        { q: "Which knapsack can be solved greedily?", options: ["Fractional knapsack", "0/1 knapsack", "Both", "Neither"], answer: 0, explain: "0/1 knapsack needs DP." },
      ],
    },
    {
      id: "dp-intro",
      title: "Dynamic programming: memoization and tabulation",
      oneLine: "DP = recursion + memory. If a recursive solution solves the same small problem again and again, store each answer the first time (memoization), or fill a table from the smallest problem up (tabulation). Exponential time becomes linear.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: The waste in plain recursion" },
        { t: "diagram", text: "fib(5)\n├── fib(4)\n│   ├── fib(3)\n│   │   ├── fib(2) ...\n│   │   └── fib(1)\n│   └── fib(2) ...        ← computed again!\n└── fib(3)                ← computed again!\n    ├── fib(2) ...\n    └── fib(1)\n\nfib(20) makes 21,891 calls. Only 21 different answers exist!" },
        { t: "h", text: "Step 2: Two ways to remember" },
        { t: "table", head: ["", "Memoization (top-down)", "Tabulation (bottom-up)"], rows: [
          ["Idea", "Normal recursion + a memo: check it before computing, save after", "Loop from the smallest case up, filling a table"],
          ["Code", "Closest to the recursive idea", "No recursion, no stack overflow"],
          ["Order", "Solves only what's needed", "Solves every sub-problem"],
        ] },
        { t: "analogy", text: "Your teacher asks 47 × 23 in the morning. You work it out: 1081. At lunch they ask again. You don't recalculate, you remember. DP is writing every answer in a notebook so you never do the same sum twice." },
        multi("Fibonacci: plain vs memo vs table", {
          python: src`
calls = 0

def fib_plain(n):
    global calls
    calls += 1
    if n <= 1:
        return n
    return fib_plain(n - 1) + fib_plain(n - 2)   # recomputes the same values

memo = {}
def fib_memo(n):
    global calls
    calls += 1
    if n <= 1:
        return n
    if n in memo:                     # already solved: reuse it
        return memo[n]
    memo[n] = fib_memo(n - 1) + fib_memo(n - 2)  # solve once, save
    return memo[n]

def fib_table(n):
    table = [0] * (n + 1)
    if n >= 1:
        table[1] = 1
    for i in range(2, n + 1):         # smallest problems first
        table[i] = table[i - 1] + table[i - 2]
    return table[n]

calls = 0
fib_plain(20)
print("Plain recursion calls for fib(20):", calls)
calls = 0
fib_memo(20)
print("Memo calls for fib(20):", calls)
print("fib(40) with memo:", fib_memo(40))
print("fib(40) with table:", fib_table(40))
`,
          c: src`
#include <stdio.h>

int calls = 0;
long long memo[100];                  // memo[n] = -1 means "not solved yet"

long long fib_plain(int n) {
    calls++;
    if (n <= 1) return n;
    return fib_plain(n - 1) + fib_plain(n - 2);   // recomputes the same values
}

long long fib_memo(int n) {
    calls++;
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];            // already solved: reuse it
    memo[n] = fib_memo(n - 1) + fib_memo(n - 2);  // solve once, save
    return memo[n];
}

long long fib_table(int n) {
    long long table[100] = {0};
    if (n >= 1) table[1] = 1;
    for (int i = 2; i <= n; i++)                  // smallest problems first
        table[i] = table[i - 1] + table[i - 2];
    return table[n];
}

int main(void) {
    for (int i = 0; i < 100; i++) memo[i] = -1;

    calls = 0;
    fib_plain(20);
    printf("Plain recursion calls for fib(20): %d\n", calls);
    calls = 0;
    fib_memo(20);
    printf("Memo calls for fib(20): %d\n", calls);
    printf("fib(40) with memo: %lld\n", fib_memo(40));
    printf("fib(40) with table: %lld\n", fib_table(40));
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int calls = 0;
vector<long long> memo(100, -1);              // -1 means "not solved yet"

long long fibPlain(int n) {
    calls++;
    if (n <= 1) return n;
    return fibPlain(n - 1) + fibPlain(n - 2); // recomputes the same values
}

long long fibMemo(int n) {
    calls++;
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];        // already solved: reuse it
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);   // solve once, save
}

long long fibTable(int n) {
    vector<long long> table(n + 1, 0);
    if (n >= 1) table[1] = 1;
    for (int i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];   // smallest first
    return table[n];
}

int main() {
    calls = 0;
    fibPlain(20);
    cout << "Plain recursion calls for fib(20): " << calls << endl;
    calls = 0;
    fibMemo(20);
    cout << "Memo calls for fib(20): " << calls << endl;
    cout << "fib(40) with memo: " << fibMemo(40) << endl;
    cout << "fib(40) with table: " << fibTable(40) << endl;
    return 0;
}
`,
          java: src`
import java.util.Arrays;

public class Main {
    static int calls = 0;
    static long[] memo = new long[100];          // -1 means "not solved yet"

    static long fibPlain(int n) {
        calls++;
        if (n <= 1) return n;
        return fibPlain(n - 1) + fibPlain(n - 2);  // recomputes the same values
    }

    static long fibMemo(int n) {
        calls++;
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n];         // already solved: reuse it
        memo[n] = fibMemo(n - 1) + fibMemo(n - 2); // solve once, save
        return memo[n];
    }

    static long fibTable(int n) {
        long[] table = new long[n + 1];
        if (n >= 1) table[1] = 1;
        for (int i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];   // smallest first
        return table[n];
    }

    public static void main(String[] args) {
        Arrays.fill(memo, -1);
        calls = 0;
        fibPlain(20);
        System.out.println("Plain recursion calls for fib(20): " + calls);
        calls = 0;
        fibMemo(20);
        System.out.println("Memo calls for fib(20): " + calls);
        System.out.println("fib(40) with memo: " + fibMemo(40));
        System.out.println("fib(40) with table: " + fibTable(40));
    }
}
`,
          javascript: src`
let calls = 0;

function fibPlain(n) {
  calls++;
  if (n <= 1) return n;
  return fibPlain(n - 1) + fibPlain(n - 2);   // recomputes the same values
}

const memo = new Map();
function fibMemo(n) {
  calls++;
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);        // already solved: reuse it
  const value = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, value);                         // solve once, save
  return value;
}

function fibTable(n) {
  const table = new Array(n + 1).fill(0);
  if (n >= 1) table[1] = 1;
  for (let i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];   // smallest first
  return table[n];
}

calls = 0;
fibPlain(20);
console.log("Plain recursion calls for fib(20): " + calls);
calls = 0;
fibMemo(20);
console.log("Memo calls for fib(20): " + calls);
console.log("fib(40) with memo: " + fibMemo(40));
console.log("fib(40) with table: " + fibTable(40));
`,
        }, "Plain recursion calls for fib(20): 21891\nMemo calls for fib(20): 39\nfib(40) with memo: 102334155\nfib(40) with table: 102334155"),
        { t: "table", head: ["i", "0", "1", "2", "3", "4", "5", "6", "7"], rows: [["table[i]", "0", "1", "1", "2", "3", "5", "8", "13"]], caption: "Tabulation: each cell = the two cells before it" },
        { t: "h", text: "Step 3: The DP recipe (use it for every DP problem)" },
        { t: "points", items: ["**State**: what does dp[i] mean, in words? (\"dp[i] = the i-th Fibonacci number\")", "**Transition**: how does dp[i] come from smaller states? (dp[i] = dp[i−1] + dp[i−2])", "**Base cases**: the smallest answers you know directly (dp[0] = 0, dp[1] = 1)", "**Answer**: which cell holds the final answer? (dp[n])"] },
        { t: "trap", text: "DP only helps when sub-problems **repeat** (overlapping sub-problems) and the best answer is built from best smaller answers (optimal substructure). Merge sort's halves never repeat, so it's divide and conquer, not DP. Use `long` / `long long` for big results: fib(50) doesn't fit in a 32-bit int." },
        { t: "trick", text: "**DP recipe: state → transition → base case → answer.**" },
        { t: "exam", items: ["What is dynamic programming? Memoization vs tabulation.", "Overlapping sub-problems and optimal substructure.", "Fibonacci in O(n) time and O(1) space (keep only two variables).", "DP vs divide and conquer vs greedy."] },
        { t: "recap", items: ["DP = recursion + remembering answers", "Memoization: top-down, check the memo first", "Tabulation: bottom-up loop filling a table", "fib: O(2ⁿ) → O(n)"] },
      ],
      quiz: [
        { q: "Memoization means…", options: ["Saving results of sub-problems to reuse them", "Sorting the input", "Using a stack", "Deleting recursion"], answer: 0, explain: "Solve once, reuse many times." },
        { q: "Tabulation is…", options: ["Bottom-up: fill a table from the smallest case", "Top-down recursion only", "A greedy method", "A kind of sorting"], answer: 0, explain: "No recursion needed." },
        { q: "Time of fib(n) with DP?", options: ["O(n)", "O(2ⁿ)", "O(n²)", "O(log n)"], answer: 0, explain: "Each value is computed once." },
        { q: "DP helps when sub-problems…", options: ["Overlap (repeat)", "Never repeat", "Are sorted", "Are random"], answer: 0, explain: "Otherwise there's nothing to reuse." },
      ],
    },
    {
      id: "dp-classics",
      title: "Classic DP: climbing stairs and 0/1 knapsack",
      oneLine: "Climbing stairs is Fibonacci in disguise (1-D DP). 0/1 knapsack asks, for every item and every capacity, \"is it better to take this item or skip it?\" and fills a 2-D table.",
      minutes: 24,
      blocks: [
        { t: "h", text: "Step 1: Climbing stairs" },
        { t: "p", text: "You can climb 1 or 2 steps at a time. How many ways to reach step n? To stand on step i, your last move came from step i−1 (a 1-step) or step i−2 (a 2-step). So **ways[i] = ways[i−1] + ways[i−2]**." },
        { t: "table", head: ["i", "0", "1", "2", "3", "4", "5"], rows: [["ways[i]", "1", "1", "2", "3", "5", "**8**"]], caption: "ways to climb 5 stairs = 8" },
        { t: "h", text: "Step 2: 0/1 knapsack" },
        { t: "p", text: "A bag holds 7 kg. Items (weight, value): (1, 1), (3, 4), (4, 5), (5, 7). Each item is taken **whole or not at all**. Maximize the value." },
        { t: "table", head: ["Part of the recipe", "Knapsack"], rows: [
          ["State", "dp[i][c] = best value using the first i items with capacity c"],
          ["Transition", "skip item i: dp[i−1][c] · take it (if it fits): value[i] + dp[i−1][c − weight[i]] · take the bigger"],
          ["Base case", "dp[0][c] = 0 (no items, no value)"],
          ["Answer", "dp[n][W]"],
        ] },
        { t: "analogy", text: "Packing for a trip with a 7 kg bag limit: for each item you ask \"if I pack this, what's the best I can do with the space left? If I skip it, what's the best with the full space?\" The table remembers every answer for every smaller bag." },
        multi("Climbing stairs and 0/1 knapsack", {
          python: src`
def climb_stairs(n):
    ways = [0] * (n + 1)
    ways[0] = ways[1] = 1             # base cases
    for i in range(2, n + 1):
        ways[i] = ways[i - 1] + ways[i - 2]   # last move was 1 step or 2 steps
    return ways[n]

def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]   # dp[i][c]
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]     # the i-th item
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]               # option 1: skip it
            if w <= c:                            # option 2: take it (if it fits)
                dp[i][c] = max(dp[i][c], v + dp[i - 1][c - w])
    return dp[n][W]

print("Ways to climb 5 stairs:", climb_stairs(5))
print("Best value with capacity 7:", knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))
`,
          c: src`
#include <stdio.h>

int climb_stairs(int n) {
    int ways[50];
    ways[0] = ways[1] = 1;                     // base cases
    for (int i = 2; i <= n; i++)
        ways[i] = ways[i - 1] + ways[i - 2];   // last move was 1 or 2 steps
    return ways[n];
}

int max(int a, int b) { return a > b ? a : b; }

int knapsack(int weights[], int values[], int n, int W) {
    int dp[10][20] = {{0}};                    // dp[i][c], all zeros
    for (int i = 1; i <= n; i++) {
        int w = weights[i - 1], v = values[i - 1];   // the i-th item
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];                 // option 1: skip it
            if (w <= c)                              // option 2: take it
                dp[i][c] = max(dp[i][c], v + dp[i - 1][c - w]);
        }
    }
    return dp[n][W];
}

int main(void) {
    int weights[] = {1, 3, 4, 5}, values[] = {1, 4, 5, 7};
    printf("Ways to climb 5 stairs: %d\n", climb_stairs(5));
    printf("Best value with capacity 7: %d\n", knapsack(weights, values, 4, 7));
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int climbStairs(int n) {
    vector<int> ways(n + 1);
    ways[0] = ways[1] = 1;                     // base cases
    for (int i = 2; i <= n; i++) ways[i] = ways[i - 1] + ways[i - 2];
    return ways[n];
}

int knapsack(const vector<int>& weights, const vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));   // dp[i][c]
    for (int i = 1; i <= n; i++) {
        int w = weights[i - 1], v = values[i - 1];          // the i-th item
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];                        // option 1: skip it
            if (w <= c) dp[i][c] = max(dp[i][c], v + dp[i - 1][c - w]);   // option 2: take it
        }
    }
    return dp[n][W];
}

int main() {
    cout << "Ways to climb 5 stairs: " << climbStairs(5) << endl;
    cout << "Best value with capacity 7: " << knapsack({1, 3, 4, 5}, {1, 4, 5, 7}, 7) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static int climbStairs(int n) {
        int[] ways = new int[n + 1];
        ways[0] = 1;
        ways[1] = 1;                                   // base cases
        for (int i = 2; i <= n; i++) ways[i] = ways[i - 1] + ways[i - 2];
        return ways[n];
    }

    static int knapsack(int[] weights, int[] values, int W) {
        int n = weights.length;
        int[][] dp = new int[n + 1][W + 1];            // dp[i][c], all zeros
        for (int i = 1; i <= n; i++) {
            int w = weights[i - 1], v = values[i - 1]; // the i-th item
            for (int c = 0; c <= W; c++) {
                dp[i][c] = dp[i - 1][c];               // option 1: skip it
                if (w <= c) dp[i][c] = Math.max(dp[i][c], v + dp[i - 1][c - w]);   // option 2: take it
            }
        }
        return dp[n][W];
    }

    public static void main(String[] args) {
        System.out.println("Ways to climb 5 stairs: " + climbStairs(5));
        System.out.println("Best value with capacity 7: " + knapsack(new int[]{1, 3, 4, 5}, new int[]{1, 4, 5, 7}, 7));
    }
}
`,
          javascript: src`
function climbStairs(n) {
  const ways = new Array(n + 1).fill(0);
  ways[0] = 1;
  ways[1] = 1;                                   // base cases
  for (let i = 2; i <= n; i++) ways[i] = ways[i - 1] + ways[i - 2];
  return ways[n];
}

function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));   // dp[i][c]
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1], v = values[i - 1];  // the i-th item
    for (let c = 0; c <= W; c++) {
      dp[i][c] = dp[i - 1][c];                    // option 1: skip it
      if (w <= c) dp[i][c] = Math.max(dp[i][c], v + dp[i - 1][c - w]);   // option 2: take it
    }
  }
  return dp[n][W];
}

console.log("Ways to climb 5 stairs: " + climbStairs(5));
console.log("Best value with capacity 7: " + knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7));
`,
        }, "Ways to climb 5 stairs: 8\nBest value with capacity 7: 9"),
        { t: "table", head: ["Items used ↓ / capacity →", "0", "1", "2", "3", "4", "5", "6", "7"], rows: [
          ["none", "0", "0", "0", "0", "0", "0", "0", "0"],
          ["+ (1 kg, ₹1)", "0", "1", "1", "1", "1", "1", "1", "1"],
          ["+ (3 kg, ₹4)", "0", "1", "1", "4", "5", "5", "5", "5"],
          ["+ (4 kg, ₹5)", "0", "1", "1", "4", "5", "6", "6", "**9**"],
          ["+ (5 kg, ₹7)", "0", "1", "1", "4", "5", "7", "8", "**9**"],
        ], caption: "The full knapsack table. Cell (row 3, cap 7) = max(skip: 5, take: 5 + cell(row 2, cap 3) = 5 + 4) = 9 → the 3 kg and 4 kg items." },
        { t: "trap", text: "In 0/1 knapsack, \"take it\" must use the **previous row** `dp[i−1][c − w]`, so each item is used at most once. Using the same row lets you take an item again and again (that's the *unbounded* knapsack, a different problem). Also check `w <= c` before indexing `c − w`." },
        { t: "trick", text: "**Knapsack cell = max(skip = cell above, take = value + cell above-left by weight).**" },
        { t: "exam", items: ["Climbing stairs / count ways.", "0/1 knapsack (and the 1-D space-optimised version).", "Coin change: fewest coins, and number of ways.", "Subset sum / partition equal subset sum.", "House robber.", "Longest increasing subsequence."] },
        { t: "recap", items: ["Climbing stairs: ways[i] = ways[i−1] + ways[i−2]", "Knapsack: dp[i][c] = max(skip, take)", "Take uses the previous row, so each item is used once", "Time and space O(n × W)"] },
      ],
      quiz: [
        { q: "Ways to climb 4 stairs (1 or 2 steps at a time)?", options: ["5", "4", "6", "8"], answer: 0, explain: "1, 1, 2, 3, 5." },
        { q: "In 0/1 knapsack, each item can be taken…", options: ["Once or not at all", "Any number of times", "In fractions", "Exactly twice"], answer: 0, explain: "That's what 0/1 means." },
        { q: "Time complexity of the knapsack DP?", options: ["O(n × W)", "O(2ⁿ)", "O(n log n)", "O(W)"], answer: 0, explain: "One cell per item and capacity." },
        { q: "\"Take item i\" reads from…", options: ["The previous row, at c − weight", "The same row", "The next row", "Row 0 only"], answer: 0, explain: "So the item isn't reused." },
      ],
    },
    {
      id: "lcs",
      title: "Longest common subsequence (LCS)",
      oneLine: "A subsequence keeps the order but can skip characters (\"ACE\" is a subsequence of \"ABCDE\"). LCS finds the longest one shared by two strings, using a 2-D table where each cell compares one character from each string.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: The rule for each cell" },
        { t: "formula", items: [["If a[i] == b[j]", "dp[i][j] = 1 + dp[i−1][j−1]  (use the match, move diagonally)"], ["Otherwise", "dp[i][j] = max(dp[i−1][j], dp[i][j−1])  (skip a char from one string)"], ["Base case", "row 0 and column 0 are 0 (an empty string shares nothing)"]] },
        { t: "h", text: "Step 2: A small table, \"ABC\" vs \"AC\"" },
        { t: "table", head: ["", "\"\"", "A", "C"], rows: [
          ["\"\"", "0", "0", "0"],
          ["A", "0", "**1** (A=A, diag+1)", "1 (max of up, left)"],
          ["B", "0", "1", "1"],
          ["C", "0", "1", "**2** (C=C, diag+1)"],
        ], caption: "LCS length = 2 (\"AC\"). To read the string back, start at the bottom-right: on a match go diagonally and keep the char, otherwise move toward the bigger neighbour." },
        { t: "analogy", text: "Two friends list the movies they watched this year, in order. LCS is the longest list of movies both watched in the same order. Version-control tools like git diff use this idea to find lines that stayed the same." },
        multi("LCS length and the actual subsequence", {
          python: src`
def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]   # row 0 and column 0 stay 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1          # match: diagonal + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # skip one char

    out = []                          # walk back from the bottom-right
    i, j = n, m
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])      # part of the LCS
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1                    # go up
        else:
            j -= 1                    # go left
    return dp[n][m], "".join(reversed(out))

length, text = lcs("AGGTAB", "GXTXAYB")
print("LCS length:", length)
print("LCS:", text)
`,
          c: src`
#include <stdio.h>
#include <string.h>

int dp[50][50];

int main(void) {
    const char *a = "AGGTAB", *b = "GXTXAYB";
    int n = strlen(a), m = strlen(b);

    for (int i = 0; i <= n; i++)
        for (int j = 0; j <= m; j++) {
            if (i == 0 || j == 0) dp[i][j] = 0;              // empty string
            else if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;   // match
            else dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
        }

    char out[50];
    int len = dp[n][m];
    out[len] = '\0';                  // fill the answer from the back
    int i = n, j = m, k = len - 1;
    while (i > 0 && j > 0) {
        if (a[i - 1] == b[j - 1]) {   // part of the LCS
            out[k--] = a[i - 1];
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;                      // go up
        } else {
            j--;                      // go left
        }
    }

    printf("LCS length: %d\n", len);
    printf("LCS: %s\n", out);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string a = "AGGTAB", b = "GXTXAYB";
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));   // row/col 0 stay 0

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1]) ? dp[i - 1][j - 1] + 1      // match
                                              : max(dp[i - 1][j], dp[i][j - 1]);

    string out;
    int i = n, j = m;
    while (i > 0 && j > 0) {          // walk back from the bottom-right
        if (a[i - 1] == b[j - 1]) { out += a[i - 1]; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;   // go up
        else j--;                                     // go left
    }
    reverse(out.begin(), out.end());

    cout << "LCS length: " << dp[n][m] << endl;
    cout << "LCS: " << out << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        String a = "AGGTAB", b = "GXTXAYB";
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];                    // row/col 0 stay 0

        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = (a.charAt(i - 1) == b.charAt(j - 1))
                        ? dp[i - 1][j - 1] + 1                 // match
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);

        StringBuilder out = new StringBuilder();
        int i = n, j = m;
        while (i > 0 && j > 0) {                               // walk back
            if (a.charAt(i - 1) == b.charAt(j - 1)) { out.append(a.charAt(i - 1)); i--; j--; }
            else if (dp[i - 1][j] >= dp[i][j - 1]) i--;        // go up
            else j--;                                          // go left
        }

        System.out.println("LCS length: " + dp[n][m]);
        System.out.println("LCS: " + out.reverse());
    }
}
`,
          javascript: src`
function lcs(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));   // row/col 0 stay 0
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                       // match
        : Math.max(dp[i - 1][j], dp[i][j - 1]);      // skip one char
    }
  }
  const out = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {                           // walk back
    if (a[i - 1] === b[j - 1]) { out.push(a[i - 1]); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;      // go up
    else j--;                                        // go left
  }
  return { length: dp[n][m], text: out.reverse().join("") };
}

const result = lcs("AGGTAB", "GXTXAYB");
console.log("LCS length: " + result.length);
console.log("LCS: " + result.text);
`,
        }, "LCS length: 4\nLCS: GTAB"),
        { t: "trap", text: "**Subsequence ≠ substring.** A substring must be continuous (\"BCD\" in \"ABCDE\"); a subsequence can skip characters (\"ACE\"). The table is 1 bigger than each string, so the character for cell (i, j) is `a[i−1]` and `b[j−1]`. That off-by-one is the most common bug." },
        { t: "trick", text: "**Match → diagonal + 1. No match → max(up, left).**" },
        { t: "exam", items: ["Longest common subsequence: length and the string.", "Edit distance (minimum insert/delete/replace), a close cousin of LCS.", "Longest common substring (continuous version).", "Longest palindromic subsequence (LCS of a string and its reverse).", "Minimum deletions to make two strings equal."] },
        { t: "recap", items: ["dp[i][j] = LCS of the first i chars of a and the first j chars of b", "Match: diagonal + 1; else the max of up and left", "Walk back from the bottom-right to get the string", "O(n × m) time and space"] },
      ],
      quiz: [
        { q: "LCS of \"ABCDE\" and \"ACE\"?", options: ["ACE (length 3)", "ABC", "CE", "ABCDE"], answer: 0, explain: "All three letters appear in order." },
        { q: "When a[i−1] == b[j−1], dp[i][j] =", options: ["dp[i−1][j−1] + 1", "max(up, left)", "0", "dp[i][j−1]"], answer: 0, explain: "Use the match and move diagonally." },
        { q: "Is \"AEC\" a subsequence of \"ABCDE\"?", options: ["No, the order is wrong", "Yes", "Only a substring", "Only in Python"], answer: 0, explain: "C comes before E in ABCDE." },
        { q: "Time complexity of LCS for lengths n and m?", options: ["O(n × m)", "O(n + m)", "O(2ⁿ)", "O(log n)"], answer: 0, explain: "One cell per pair of characters." },
      ],
    },
  ],
};

export const DSA12_ADVANCED: LearnModule = {
  id: "advanced",
  title: "Advanced topics and interview prep",
  titleHi: "एडवांस टॉपिक और इंटरव्यू तैयारी",
  blurb: "Tries for word search and autocomplete, bit tricks, and a final cheat sheet that maps problem words to the right technique, plus a study plan.",
  lessons: [
    {
      id: "trie",
      title: "Trie (prefix tree)",
      oneLine: "A trie stores words letter by letter in a tree: each edge is one letter, and words sharing a prefix share the same path. Searching a word or a prefix takes O(length of the word), no matter how many words are stored.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Words as paths" },
        { t: "diagram", text: "insert apple, app, bat:\n\n        (root)\n        /    \\\n       a      b\n       |      |\n       p      a\n       |      |\n       p ●    t ●       ● = a word ends here\n       |\n       l\n       |\n       e ●\n\n\"app\" and \"apple\" share the path a → p → p" },
        { t: "analogy", text: "Your phone's keyboard suggestions: type \"ap\" and it suggests app, apple, apply. It follows the path a → p and lists every word below that point. That's a trie." },
        multi("Trie: insert, search, startsWith", {
          python: src`
class TrieNode:
    def __init__(self):
        self.children = {}            # letter -> next TrieNode
        self.is_end = False           # True if a word ends here

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:          # make the path if it's missing
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True                       # mark the end of the word

    def _walk(self, text):            # follow the letters; None if the path breaks
        node = self.root
        for ch in text:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_end  # path exists AND a word ends here

    def starts_with(self, prefix):
        return self._walk(prefix) is not None    # the path just has to exist

t = Trie()
for w in ["apple", "app", "bat"]:
    t.insert(w)
b = lambda x: "true" if x else "false"
print("search app:", b(t.search("app")))
print("search ap:", b(t.search("ap")))
print("starts with ap:", b(t.starts_with("ap")))
print("starts with cat:", b(t.starts_with("cat")))
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct TrieNode {
    struct TrieNode *children[26];   // one slot per letter a..z
    int is_end;                      // 1 if a word ends here
};

struct TrieNode *new_node(void) {
    return calloc(1, sizeof(struct TrieNode));   // all children NULL, is_end 0
}

void insert(struct TrieNode *root, const char *word) {
    struct TrieNode *node = root;
    for (int i = 0; word[i]; i++) {
        int k = word[i] - 'a';                   // letter -> 0..25
        if (!node->children[k]) node->children[k] = new_node();   // make the path
        node = node->children[k];
    }
    node->is_end = 1;                            // mark the end of the word
}

struct TrieNode *walk(struct TrieNode *root, const char *text) {
    struct TrieNode *node = root;
    for (int i = 0; text[i] && node; i++) node = node->children[text[i] - 'a'];
    return node;                                 // NULL if the path breaks
}

int search(struct TrieNode *root, const char *word) {
    struct TrieNode *node = walk(root, word);
    return node != NULL && node->is_end;         // path exists AND a word ends here
}

int starts_with(struct TrieNode *root, const char *prefix) {
    return walk(root, prefix) != NULL;
}

void free_trie(struct TrieNode *node) {
    if (!node) return;
    for (int k = 0; k < 26; k++) free_trie(node->children[k]);
    free(node);
}

int main(void) {
    struct TrieNode *root = new_node();
    insert(root, "apple");
    insert(root, "app");
    insert(root, "bat");
    printf("search app: %s\n", search(root, "app") ? "true" : "false");
    printf("search ap: %s\n", search(root, "ap") ? "true" : "false");
    printf("starts with ap: %s\n", starts_with(root, "ap") ? "true" : "false");
    printf("starts with cat: %s\n", starts_with(root, "cat") ? "true" : "false");
    free_trie(root);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
using namespace std;

struct TrieNode {
    TrieNode* children[26] = {};     // one slot per letter, all nullptr
    bool isEnd = false;              // true if a word ends here
};

class Trie {
    TrieNode* root = new TrieNode();

    TrieNode* walk(const string& text) {         // nullptr if the path breaks
        TrieNode* node = root;
        for (char ch : text) {
            node = node->children[ch - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }

public:
    void insert(const string& word) {
        TrieNode* node = root;
        for (char ch : word) {
            int k = ch - 'a';                    // letter -> 0..25
            if (!node->children[k]) node->children[k] = new TrieNode();   // make the path
            node = node->children[k];
        }
        node->isEnd = true;                      // mark the end of the word
    }

    bool search(const string& word) {
        TrieNode* node = walk(word);
        return node && node->isEnd;              // path exists AND a word ends here
    }

    bool startsWith(const string& prefix) { return walk(prefix) != nullptr; }
};

int main() {
    Trie t;
    for (string w : {"apple", "app", "bat"}) t.insert(w);
    cout << boolalpha;                           // print bools as true/false
    cout << "search app: " << t.search("app") << endl;
    cout << "search ap: " << t.search("ap") << endl;
    cout << "starts with ap: " << t.startsWith("ap") << endl;
    cout << "starts with cat: " << t.startsWith("cat") << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];  // one slot per letter
        boolean isEnd;                           // true if a word ends here
    }

    static TrieNode root = new TrieNode();

    static void insert(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            int k = ch - 'a';                    // letter -> 0..25
            if (node.children[k] == null) node.children[k] = new TrieNode();   // make the path
            node = node.children[k];
        }
        node.isEnd = true;                       // mark the end of the word
    }

    static TrieNode walk(String text) {          // null if the path breaks
        TrieNode node = root;
        for (char ch : text.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }

    static boolean search(String word) {
        TrieNode node = walk(word);
        return node != null && node.isEnd;       // path exists AND a word ends here
    }

    static boolean startsWith(String prefix) { return walk(prefix) != null; }

    public static void main(String[] args) {
        for (String w : new String[]{"apple", "app", "bat"}) insert(w);
        System.out.println("search app: " + search("app"));
        System.out.println("search ap: " + search("ap"));
        System.out.println("starts with ap: " + startsWith("ap"));
        System.out.println("starts with cat: " + startsWith("cat"));
    }
}
`,
          javascript: src`
class TrieNode {
  constructor() {
    this.children = new Map();   // letter -> next TrieNode
    this.isEnd = false;          // true if a word ends here
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());   // make the path
      node = node.children.get(ch);
    }
    node.isEnd = true;           // mark the end of the word
  }

  walk(text) {                   // null if the path breaks
    let node = this.root;
    for (const ch of text) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) {
    const node = this.walk(word);
    return node !== null && node.isEnd;   // path exists AND a word ends here
  }

  startsWith(prefix) { return this.walk(prefix) !== null; }
}

const t = new Trie();
for (const w of ["apple", "app", "bat"]) t.insert(w);
console.log("search app: " + t.search("app"));
console.log("search ap: " + t.search("ap"));
console.log("starts with ap: " + t.startsWith("ap"));
console.log("starts with cat: " + t.startsWith("cat"));
`,
        }, "search app: true\nsearch ap: false\nstarts with ap: true\nstarts with cat: false"),
        { t: "table", head: ["Query", "Path", "Word ends there?", "Result"], rows: [
          ["search(\"app\")", "a → p → p ✓", "yes ●", "true"],
          ["search(\"ap\")", "a → p ✓", "no", "**false** (only a prefix)"],
          ["startsWith(\"ap\")", "a → p ✓", "doesn't matter", "true"],
          ["startsWith(\"cat\")", "no 'c' under root ✗", "–", "false"],
        ] },
        { t: "trap", text: "The path existing is **not** enough for `search`: \"ap\" is a path but not a stored word. Always check the `isEnd` flag. In C, Java and C++, the `ch − 'a'` trick only works for lowercase a–z; use a map for other characters." },
        { t: "trick", text: "**search = path exists AND isEnd. startsWith = path exists.**" },
        { t: "exam", items: ["Implement a trie (insert, search, startsWith).", "Autocomplete / search suggestions.", "Word search II (trie + backtracking on a grid).", "Longest common prefix of many strings.", "Trie vs hash set: when is a trie better? (Prefix queries.)"] },
        { t: "recap", items: ["A trie stores words as paths of letters", "Shared prefixes share nodes", "isEnd marks where a word ends", "Insert, search and prefix queries: O(word length)"] },
      ],
      quiz: [
        { q: "A trie is best for…", options: ["Prefix searches like autocomplete", "Sorting numbers", "Shortest paths", "Stacks"], answer: 0, explain: "Words sharing a prefix share a path." },
        { q: "After inserting \"apple\", search(\"app\") returns…", options: ["false (no word ends at the second p)", "true", "An error", "\"apple\""], answer: 0, explain: "The path exists but isEnd is false." },
        { q: "Time to search a word of length L?", options: ["O(L)", "O(number of words)", "O(log n)", "O(1)"], answer: 0, explain: "One step per letter." },
        { q: "What marks the end of a word?", options: ["The isEnd flag", "A NULL child", "The root", "A leaf only"], answer: 0, explain: "\"app\" ends in the middle of \"apple\"'s path." },
      ],
    },
    {
      id: "bit-manipulation",
      title: "Bit manipulation",
      oneLine: "Every integer is stored as bits (0s and 1s). Operators like &, |, ^ and << work directly on those bits, giving O(1) tricks: check odd/even, count set bits, test powers of two, and find the single non-repeating number with XOR.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Numbers in binary" },
        { t: "diagram", text: "13 in binary:   1    1    0    1\nplace value:    8    4    2    1      8 + 4 + 1 = 13" },
        { t: "table", head: ["Operator", "Name", "Rule", "Example"], rows: [
          ["`&`", "AND", "1 only if both bits are 1", "1101 & 0001 = 0001"],
          ["`|`", "OR", "1 if either bit is 1", "1100 | 0001 = 1101"],
          ["`^`", "XOR", "1 if the bits are different", "1101 ^ 1101 = 0000"],
          ["`~`", "NOT", "Flip every bit", ""],
          ["`<<`", "Left shift", "Move bits left = × 2 each step", "1 << 3 = 8"],
          ["`>>`", "Right shift", "Move bits right = ÷ 2 each step", "13 >> 1 = 6"],
        ] },
        { t: "h", text: "Step 2: The famous tricks" },
        { t: "table", head: ["Trick", "Code", "Why it works"], rows: [
          ["Is n odd?", "`n & 1`", "The last bit is 1 for odd numbers"],
          ["Is n a power of 2?", "`n > 0 && (n & (n − 1)) == 0`", "A power of 2 has exactly one 1 bit; n − 1 flips it and all bits below"],
          ["Count 1 bits", "`n = n & (n − 1)` until 0", "Each step removes the lowest 1 bit"],
          ["Single number", "XOR everything", "x ^ x = 0 and x ^ 0 = x, so pairs cancel out"],
        ] },
        multi("Bit tricks", {
          python: src`
def to_binary(n):
    return bin(n)[2:]                 # bin(13) = "0b1101", drop the "0b"

def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1                    # remove the lowest 1 bit
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0   # exactly one 1 bit

def single_number(nums):
    result = 0
    for x in nums:
        result ^= x                   # pairs cancel: x ^ x = 0
    return result

b = lambda x: "true" if x else "false"
print("13 in binary:", to_binary(13))
print("13 is odd:", b(13 & 1))
print("Set bits in 13:", count_set_bits(13))
print("16 is power of 2:", b(is_power_of_two(16)))
print("18 is power of 2:", b(is_power_of_two(18)))
print("Single number in [4, 1, 2, 1, 2]:", single_number([4, 1, 2, 1, 2]))
print("1 << 3 =", 1 << 3)
`,
          c: src`
#include <stdio.h>

void print_binary(int n) {
    int started = 0;
    for (int bit = 31; bit >= 0; bit--) {
        int b = (n >> bit) & 1;       // read one bit
        if (b) started = 1;           // skip leading zeros
        if (started) printf("%d", b);
    }
    if (!started) printf("0");
}

int count_set_bits(int n) {
    int count = 0;
    while (n) {
        n &= n - 1;                   // remove the lowest 1 bit
        count++;
    }
    return count;
}

int is_power_of_two(int n) { return n > 0 && (n & (n - 1)) == 0; }

int main(void) {
    int nums[] = {4, 1, 2, 1, 2}, single = 0;
    for (int i = 0; i < 5; i++) single ^= nums[i];   // pairs cancel out

    printf("13 in binary: "); print_binary(13); printf("\n");
    printf("13 is odd: %s\n", (13 & 1) ? "true" : "false");
    printf("Set bits in 13: %d\n", count_set_bits(13));
    printf("16 is power of 2: %s\n", is_power_of_two(16) ? "true" : "false");
    printf("18 is power of 2: %s\n", is_power_of_two(18) ? "true" : "false");
    printf("Single number in [4, 1, 2, 1, 2]: %d\n", single);
    printf("1 << 3 = %d\n", 1 << 3);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
#include <vector>
using namespace std;

string toBinary(int n) {
    if (n == 0) return "0";
    string s;
    while (n > 0) {
        s = char('0' + (n & 1)) + s;  // take the last bit, put it in front
        n >>= 1;                      // drop the last bit
    }
    return s;
}

int countSetBits(int n) {
    int count = 0;
    while (n) { n &= n - 1; count++; }   // remove the lowest 1 bit each time
    return count;
}

bool isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }

int main() {
    vector<int> nums = {4, 1, 2, 1, 2};
    int single = 0;
    for (int x : nums) single ^= x;      // pairs cancel out

    cout << boolalpha;
    cout << "13 in binary: " << toBinary(13) << endl;
    cout << "13 is odd: " << bool(13 & 1) << endl;
    cout << "Set bits in 13: " << countSetBits(13) << endl;
    cout << "16 is power of 2: " << isPowerOfTwo(16) << endl;
    cout << "18 is power of 2: " << isPowerOfTwo(18) << endl;
    cout << "Single number in [4, 1, 2, 1, 2]: " << single << endl;
    cout << "1 << 3 = " << (1 << 3) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static int countSetBits(int n) {
        int count = 0;
        while (n != 0) { n &= n - 1; count++; }   // remove the lowest 1 bit
        return count;
    }

    static boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }

    public static void main(String[] args) {
        int single = 0;
        for (int x : new int[]{4, 1, 2, 1, 2}) single ^= x;   // pairs cancel out

        System.out.println("13 in binary: " + Integer.toBinaryString(13));
        System.out.println("13 is odd: " + ((13 & 1) == 1));
        System.out.println("Set bits in 13: " + countSetBits(13));
        System.out.println("16 is power of 2: " + isPowerOfTwo(16));
        System.out.println("18 is power of 2: " + isPowerOfTwo(18));
        System.out.println("Single number in [4, 1, 2, 1, 2]: " + single);
        System.out.println("1 << 3 = " + (1 << 3));
    }
}
`,
          javascript: src`
function countSetBits(n) {
  let count = 0;
  while (n !== 0) { n &= n - 1; count++; }   // remove the lowest 1 bit
  return count;
}

function isPowerOfTwo(n) { return n > 0 && (n & (n - 1)) === 0; }

let single = 0;
for (const x of [4, 1, 2, 1, 2]) single ^= x;   // pairs cancel out

console.log("13 in binary: " + (13).toString(2));
console.log("13 is odd: " + ((13 & 1) === 1));
console.log("Set bits in 13: " + countSetBits(13));
console.log("16 is power of 2: " + isPowerOfTwo(16));
console.log("18 is power of 2: " + isPowerOfTwo(18));
console.log("Single number in [4, 1, 2, 1, 2]: " + single);
console.log("1 << 3 = " + (1 << 3));
`,
        }, "13 in binary: 1101\n13 is odd: true\nSet bits in 13: 3\n16 is power of 2: true\n18 is power of 2: false\nSingle number in [4, 1, 2, 1, 2]: 4\n1 << 3 = 8"),
        { t: "table", head: ["Step", "n (binary)", "n − 1", "n & (n − 1)", "count"], rows: [
          ["1", "1101", "1100", "1100", "1"],
          ["2", "1100", "1011", "1000", "2"],
          ["3", "1000", "0111", "0000", "3 → stop"],
        ], caption: "Counting the 1 bits of 13" },
        { t: "trap", text: "Operator precedence: in C, C++, Java and JavaScript, `n & 1 == 1` means `n & (1 == 1)` because `==` binds tighter than `&`. **Always add brackets**: `(n & 1) == 1`. And `1 << 31` overflows a 32-bit signed int." },
        { t: "trick", text: "**x ^ x = 0, x ^ 0 = x. n & (n − 1) removes the lowest 1 bit.**" },
        { t: "exam", items: ["Single number (every other number appears twice).", "Count set bits (Brian Kernighan's algorithm).", "Check if a number is a power of two.", "Swap two numbers without a temp variable (XOR swap).", "Generate all subsets with a bitmask (0 to 2ⁿ − 1)."] },
        { t: "recap", items: ["& | ^ ~ << >> work on bits", "Odd check: n & 1; power of 2: n & (n − 1) == 0", "XOR cancels pairs: find the single number in O(n), O(1) space", "Use brackets around bit operations"] },
      ],
      quiz: [
        { q: "5 ^ 5 = ?", options: ["0", "5", "10", "1"], answer: 0, explain: "XOR of equal numbers is 0." },
        { q: "1 << 4 = ?", options: ["16", "4", "5", "8"], answer: 0, explain: "Each left shift doubles: 2⁴." },
        { q: "Is 12 a power of 2? (12 & 11 = 8)", options: ["No, the result isn't 0", "Yes", "Only in binary", "Can't tell"], answer: 0, explain: "Powers of two give 0." },
        { q: "13 in binary is…", options: ["1101", "1011", "1110", "1001"], answer: 0, explain: "8 + 4 + 1." },
      ],
    },
    {
      id: "patterns-cheatsheet",
      title: "Problem-solving patterns and the final cheat sheet",
      oneLine: "Most interview problems are variations of about 15 patterns. Learn to read the problem's keywords, pick the pattern, then write the code you've already practised in this course.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: How to attack any problem (in an interview or a test)" },
        { t: "points", items: [
          "**Understand**: repeat the problem in your own words. Ask about input size, negatives, duplicates and empty input.",
          "**Examples**: work 1–2 small examples by hand, including an edge case.",
          "**Brute force first**: say the simple O(n²) or O(2ⁿ) idea out loud. It's a valid starting point.",
          "**Optimise**: look at the keywords below to pick a pattern, then state its time and space.",
          "**Code**: clean names, small functions.",
          "**Test**: dry-run your code on the example, like the tables in this course.",
        ] },
        { t: "h", text: "Step 2: Keywords → pattern" },
        { t: "table", head: ["If the problem says…", "Try this pattern", "Lesson"], rows: [
          ["sorted array, find a pair / triplet", "Two pointers", "Arrays → Two pointers"],
          ["subarray / substring of size k, longest/shortest window", "Sliding window", "Arrays → Sliding window"],
          ["sum of a range, many range queries", "Prefix sums", "Arrays → Prefix sums"],
          ["sorted, find position, minimum that works", "Binary search", "Searching & sorting"],
          ["have I seen this before? count, frequency, pairs in unsorted data", "Hash map / set", "Hashing"],
          ["all combinations / subsets / permutations", "Backtracking", "Recursion → Backtracking"],
          ["linked list middle, cycle", "Fast and slow pointers", "Linked lists"],
          ["matching brackets, undo, nearest greater/smaller", "Stack / monotonic stack", "Stacks & queues"],
          ["k largest / smallest, merge k sorted, running median", "Heap", "Heaps"],
          ["tree depth, paths, traversal", "DFS recursion", "Trees"],
          ["level by level, shortest path (no weights), grid spread", "BFS", "Graphs"],
          ["weighted shortest path", "Dijkstra", "Graphs → Dijkstra"],
          ["prerequisites, order of tasks", "Topological sort", "Graphs → Topological sort"],
          ["connected groups, cycle in undirected graph", "Union-find", "Graphs → Union-find"],
          ["count ways, min/max cost, \"can you reach\", choices", "Dynamic programming", "Greedy & DP"],
          ["schedule, intervals, pick best locally", "Greedy (+ sort)", "Greedy"],
          ["prefix of words, autocomplete", "Trie", "Advanced → Trie"],
          ["appears once while others appear twice, subsets with masks", "Bit manipulation", "Advanced → Bits"],
        ] },
        { t: "h", text: "Step 3: Complexity cheat sheet" },
        { t: "table", head: ["Structure", "Access", "Search", "Insert", "Delete"], rows: [
          ["Array", "O(1)", "O(n)", "O(n)", "O(n)"],
          ["Linked list", "O(n)", "O(n)", "O(1) at head", "O(1) at head"],
          ["Stack / queue", "–", "O(n)", "O(1)", "O(1)"],
          ["Hash table", "–", "O(1) avg", "O(1) avg", "O(1) avg"],
          ["Balanced BST", "–", "O(log n)", "O(log n)", "O(log n)"],
          ["Heap", "O(1) top", "O(n)", "O(log n)", "O(log n) top"],
          ["Trie", "–", "O(L)", "O(L)", "O(L)"],
        ] },
        { t: "table", head: ["Algorithm", "Time", "Space"], rows: [
          ["Binary search", "O(log n)", "O(1)"],
          ["Bubble / selection / insertion sort", "O(n²)", "O(1)"],
          ["Merge sort", "O(n log n)", "O(n)"],
          ["Quick sort", "O(n log n) avg, O(n²) worst", "O(log n)"],
          ["Heap sort", "O(n log n)", "O(1)"],
          ["BFS / DFS", "O(V + E)", "O(V)"],
          ["Dijkstra (heap)", "O((V + E) log V)", "O(V)"],
          ["Topological sort", "O(V + E)", "O(V)"],
        ] },
        { t: "h", text: "Step 4: Input size → the complexity you need" },
        { t: "table", head: ["n up to", "Aim for", "Typical idea"], rows: [
          ["10–20", "O(2ⁿ) or O(n!)", "Backtracking, all subsets"],
          ["~500", "O(n³)", "Triple loops, some DP"],
          ["~5,000", "O(n²)", "Double loops, 2-D DP"],
          ["10⁵ – 10⁶", "O(n log n) or O(n)", "Sorting, heaps, binary search, hashing, two pointers"],
          ["10⁹ or more", "O(log n) or O(1)", "Binary search on the answer, maths"],
        ], caption: "A computer does roughly 10⁸ simple steps per second." },
        { t: "h", text: "Step 5: An 8-week study plan" },
        { t: "table", head: ["Week", "Topics", "Practise"], rows: [
          ["1", "Foundations, arrays, strings", "10 easy array/string problems"],
          ["2", "Two pointers, sliding window, prefix sums, hashing", "10 problems"],
          ["3", "Recursion, backtracking, binary search", "8 problems"],
          ["4", "Sorting, linked lists", "8 problems"],
          ["5", "Stacks, queues, heaps", "8 problems"],
          ["6", "Trees and BSTs", "10 problems"],
          ["7", "Graphs: BFS, DFS, Dijkstra, topological sort, union-find", "10 problems"],
          ["8", "Greedy, DP, tries, bits + mock interviews", "12 problems, 2 timed mocks"],
        ] },
        { t: "analogy", text: "Learning DSA is like learning to cook. First you learn knife skills and a few recipes (the patterns). After enough practice, you look at the ingredients (the problem) and know which recipe fits. You don't memorise every dish in the world; you master the 15 recipes that make most dishes." },
        { t: "trap", text: "Don't jump to code. Most interview failures come from coding the wrong idea fast. Spend the first few minutes on examples and the brute force; interviewers reward clear thinking more than speed. And don't memorise solutions line by line: understand the pattern, then write it from scratch." },
        { t: "trick", text: "**Understand → examples → brute force → pattern → code → dry run.**" },
        { t: "exam", items: ["Tell me about your approach before coding.", "What's the time and space complexity? Can you do better?", "What edge cases did you consider? (Empty input, one element, duplicates, negatives, very large numbers.)", "How would your solution change if the data didn't fit in memory?"] },
        { t: "recap", items: ["Match the problem's keywords to one of ~15 patterns", "Always start from brute force, then optimise", "Know the complexity of every structure and algorithm", "Use the input size to guess the expected complexity", "Practise consistently: a few problems every day beats a weekend marathon"] },
      ],
      quiz: [
        { q: "\"Longest substring with no repeating characters\" suggests…", options: ["Sliding window", "Dijkstra", "Heap", "Trie"], answer: 0, explain: "A window over a substring." },
        { q: "\"Course prerequisites: can you finish all courses?\" suggests…", options: ["Topological sort", "Binary search", "Two pointers", "Bit manipulation"], answer: 0, explain: "Task ordering with dependencies." },
        { q: "With n = 10⁵, which complexity is usually too slow?", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 0, explain: "10¹⁰ steps is far too many." },
        { q: "\"Number of ways to reach the end\" suggests…", options: ["Dynamic programming", "Union-find", "Stack", "Greedy always"], answer: 0, explain: "Counting ways is a classic DP signal." },
        { q: "What should you do first in an interview?", options: ["Understand the problem and work examples", "Start coding immediately", "Optimise right away", "Ask for the answer"], answer: 0, explain: "Clear thinking beats fast typing." },
      ],
    },
  ],
};
