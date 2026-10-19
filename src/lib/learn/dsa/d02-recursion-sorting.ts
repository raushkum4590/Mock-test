import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA modules 3–4: recursion and backtracking, searching and sorting. */
export const DSA03_RECURSION: LearnModule = {
  id: "recursion",
  title: "Recursion and backtracking",
  titleHi: "रिकर्शन और बैकट्रैकिंग",
  blurb: "Functions that call themselves: base case, the call stack, classic recursive problems, and backtracking to generate subsets and permutations.",
  lessons: [
    {
      id: "recursion-basics",
      title: "Recursion: a function that calls itself",
      oneLine: "Recursion solves a big problem by solving a smaller copy of the same problem. Every recursive function needs a base case (when to stop) and a recursive case (a smaller call).",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "p", text: "5! (5 factorial) = 5 × 4 × 3 × 2 × 1. Notice that 5! = 5 × 4!, and 4! = 4 × 3!, and so on. Each problem contains a **smaller copy of itself**. A function that solves the small copy by **calling itself** is **recursive**." },
        { t: "table", head: ["Part", "Meaning", "For factorial"], rows: [
          ["**Base case**", "The simplest version, answered directly. It **stops** the recursion", "1! = 1 (and 0! = 1)"],
          ["**Recursive case**", "Solve using a smaller version of the same problem", "n! = n × (n − 1)!"],
        ] },
        { t: "analogy", text: "Russian dolls: to reach the smallest doll, you open one doll, find a smaller doll inside, and repeat, until you reach the tiny solid doll that doesn't open (the base case)." },
        { t: "h", text: "Step 2: Two first examples" },
        multi("Countdown and factorial", {
          python: src`
def countdown(n):
    if n == 0:                  # base case: stop here
        print("Go!")
        return
    print(n)                    # do the work for this call
    countdown(n - 1)            # recursive case: a smaller problem

def factorial(n):
    if n <= 1:                  # base case: 1! = 1
        return 1
    return n * factorial(n - 1) # n! = n x (n-1)!

countdown(3)
print("5! =", factorial(5))
`,
          c: src`
#include <stdio.h>

void countdown(int n) {
    if (n == 0) {                  // base case: stop here
        printf("Go!\n");
        return;
    }
    printf("%d\n", n);             // do the work for this call
    countdown(n - 1);              // recursive case: a smaller problem
}

int factorial(int n) {
    if (n <= 1) return 1;          // base case: 1! = 1
    return n * factorial(n - 1);   // n! = n x (n-1)!
}

int main(void) {
    countdown(3);
    printf("5! = %d\n", factorial(5));
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

void countdown(int n) {
    if (n == 0) {                  // base case: stop here
        cout << "Go!" << endl;
        return;
    }
    cout << n << endl;             // do the work for this call
    countdown(n - 1);              // recursive case: a smaller problem
}

int factorial(int n) {
    if (n <= 1) return 1;          // base case: 1! = 1
    return n * factorial(n - 1);   // n! = n x (n-1)!
}

int main() {
    countdown(3);
    cout << "5! = " << factorial(5) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static void countdown(int n) {
        if (n == 0) {                  // base case: stop here
            System.out.println("Go!");
            return;
        }
        System.out.println(n);         // do the work for this call
        countdown(n - 1);              // recursive case: a smaller problem
    }

    static int factorial(int n) {
        if (n <= 1) return 1;          // base case: 1! = 1
        return n * factorial(n - 1);   // n! = n x (n-1)!
    }

    public static void main(String[] args) {
        countdown(3);
        System.out.println("5! = " + factorial(5));
    }
}
`,
          javascript: src`
function countdown(n) {
  if (n === 0) {                // base case: stop here
    console.log("Go!");
    return;
  }
  console.log(n);               // do the work for this call
  countdown(n - 1);             // recursive case: a smaller problem
}

function factorial(n) {
  if (n <= 1) return 1;         // base case: 1! = 1
  return n * factorial(n - 1);  // n! = n x (n-1)!
}

countdown(3);
console.log("5! = " + factorial(5));
`,
        }, "3\n2\n1\nGo!\n5! = 120"),
        { t: "h", text: "Step 3: What really happens: the call stack" },
        { t: "p", text: "Each call waits for the smaller call to finish. The computer keeps these waiting calls on a **call stack**: calls pile up going down, then the answers come back up." },
        { t: "diagram", text: "factorial(5) = 5 × factorial(4)          ↓ calls go down\n  factorial(4) = 4 × factorial(3)\n    factorial(3) = 3 × factorial(2)\n      factorial(2) = 2 × factorial(1)\n        factorial(1) = 1             ← base case!\n      factorial(2) = 2 × 1 = 2           ↑ answers come back up\n    factorial(3) = 3 × 2 = 6\n  factorial(4) = 4 × 6 = 24\nfactorial(5) = 5 × 24 = 120" },
        { t: "table", head: ["Call", "Waits for", "Returns"], rows: [["factorial(1)", "nothing (base case)", "1"], ["factorial(2)", "factorial(1) = 1", "2 × 1 = 2"], ["factorial(3)", "factorial(2) = 2", "3 × 2 = 6"], ["factorial(4)", "factorial(3) = 6", "4 × 6 = 24"], ["factorial(5)", "factorial(4) = 24", "5 × 24 = **120**"]] },
        { t: "trap", text: "Forgetting the base case (or a base case that's never reached) makes the function call itself forever, until the program crashes with a **stack overflow** (\"Maximum call stack size exceeded\" in JavaScript, \"RecursionError\" in Python). Always ask: does every call get closer to the base case?" },
        { t: "trick", text: "**Base case first, then trust the smaller call.** Assume factorial(n − 1) already works, and just use it." },
        { t: "exam", items: ["What is recursion? What is a base case?", "Write factorial recursively.", "What is a stack overflow?", "Recursion vs iteration (loops)? (Recursion is often shorter but uses O(n) stack memory.)", "Time and space complexity of recursive factorial? (O(n) time, O(n) stack space.)"] },
        { t: "recap", items: ["Recursion = a function that calls itself on a smaller problem", "Base case stops it; recursive case shrinks the problem", "Calls pile up on the call stack, then return in reverse", "No base case → stack overflow"] },
      ],
      quiz: [
        { q: "What stops a recursive function?", options: ["The base case", "The recursive case", "A for loop", "The return type"], answer: 0, explain: "Without it, recursion never ends." },
        { q: "factorial(4) returns…", options: ["24", "12", "4", "10"], answer: 0, explain: "4 × 3 × 2 × 1." },
        { q: "What happens without a base case?", options: ["Stack overflow (infinite recursion)", "It returns 0", "It runs once", "Nothing"], answer: 0, explain: "The calls never stop piling up." },
        { q: "Where does the computer keep waiting function calls?", options: ["The call stack", "A queue", "The hard disk", "An array"], answer: 0, explain: "Last call in, first call out." },
        { q: "What is the space complexity of recursive factorial(n)?", options: ["O(n)", "O(1)", "O(n²)", "O(log n)"], answer: 0, explain: "n calls wait on the stack at the deepest point." },
      ],
    },
    {
      id: "recursion-practice",
      title: "Recursion practice: Fibonacci, power, digits",
      oneLine: "Practise the recursive way of thinking on three classics: Fibonacci (two calls), power (multiply n times) and sum of digits (chop off the last digit).",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Thinking recursively in 3 questions" },
        { t: "points", items: ["1. **What's the smallest input** I can answer directly? (base case)", "2. **How does a smaller answer help** me build the bigger answer?", "3. **Does every call get smaller**, so it reaches the base case?"] },
        { t: "table", head: ["Problem", "Base case", "Recursive case"], rows: [
          ["Fibonacci fib(n)", "fib(0) = 0, fib(1) = 1", "fib(n) = fib(n − 1) + fib(n − 2)"],
          ["Power xⁿ", "x⁰ = 1", "xⁿ = x × xⁿ⁻¹"],
          ["Sum of digits of 1234", "a single digit, or 0 → itself", "last digit (1234 % 10 = 4) + sum of digits of 123 (1234 / 10)"],
        ] },
        multi("Fibonacci, power and sum of digits", {
          python: src`
def fib(n):
    if n <= 1:                          # base: fib(0)=0, fib(1)=1
        return n
    return fib(n - 1) + fib(n - 2)      # each number = the two before it

def power(x, n):
    if n == 0:                          # base: x^0 = 1
        return 1
    return x * power(x, n - 1)          # x^n = x * x^(n-1)

def digit_sum(n):
    if n < 10:                          # base: a single digit
        return n
    return n % 10 + digit_sum(n // 10)  # last digit + sum of the rest

print("Fibonacci:", *[fib(i) for i in range(10)])
print("2^10 =", power(2, 10))
print("Sum of digits of 1234 =", digit_sum(1234))
`,
          c: src`
#include <stdio.h>

int fib(int n) {
    if (n <= 1) return n;               // base: fib(0)=0, fib(1)=1
    return fib(n - 1) + fib(n - 2);     // each number = the two before it
}

int power(int x, int n) {
    if (n == 0) return 1;               // base: x^0 = 1
    return x * power(x, n - 1);         // x^n = x * x^(n-1)
}

int digit_sum(int n) {
    if (n < 10) return n;               // base: a single digit
    return n % 10 + digit_sum(n / 10);  // last digit + sum of the rest
}

int main(void) {
    printf("Fibonacci:");
    for (int i = 0; i < 10; i++) printf(" %d", fib(i));
    printf("\n");
    printf("2^10 = %d\n", power(2, 10));
    printf("Sum of digits of 1234 = %d\n", digit_sum(1234));
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

int fib(int n) {
    if (n <= 1) return n;               // base: fib(0)=0, fib(1)=1
    return fib(n - 1) + fib(n - 2);     // each number = the two before it
}

int power(int x, int n) {
    if (n == 0) return 1;               // base: x^0 = 1
    return x * power(x, n - 1);         // x^n = x * x^(n-1)
}

int digitSum(int n) {
    if (n < 10) return n;               // base: a single digit
    return n % 10 + digitSum(n / 10);   // last digit + sum of the rest
}

int main() {
    cout << "Fibonacci:";
    for (int i = 0; i < 10; i++) cout << " " << fib(i);
    cout << endl;
    cout << "2^10 = " << power(2, 10) << endl;
    cout << "Sum of digits of 1234 = " << digitSum(1234) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static int fib(int n) {
        if (n <= 1) return n;               // base: fib(0)=0, fib(1)=1
        return fib(n - 1) + fib(n - 2);     // each number = the two before it
    }

    static int power(int x, int n) {
        if (n == 0) return 1;               // base: x^0 = 1
        return x * power(x, n - 1);         // x^n = x * x^(n-1)
    }

    static int digitSum(int n) {
        if (n < 10) return n;               // base: a single digit
        return n % 10 + digitSum(n / 10);   // last digit + sum of the rest
    }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Fibonacci:");
        for (int i = 0; i < 10; i++) sb.append(" ").append(fib(i));
        System.out.println(sb);
        System.out.println("2^10 = " + power(2, 10));
        System.out.println("Sum of digits of 1234 = " + digitSum(1234));
    }
}
`,
          javascript: src`
function fib(n) {
  if (n <= 1) return n;                       // base: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2);             // each number = the two before it
}

function power(x, n) {
  if (n === 0) return 1;                      // base: x^0 = 1
  return x * power(x, n - 1);                 // x^n = x * x^(n-1)
}

function digitSum(n) {
  if (n < 10) return n;                       // base: a single digit
  return (n % 10) + digitSum(Math.floor(n / 10));   // last digit + the rest
}

let line = "Fibonacci:";
for (let i = 0; i < 10; i++) line += " " + fib(i);
console.log(line);
console.log("2^10 = " + power(2, 10));
console.log("Sum of digits of 1234 = " + digitSum(1234));
`,
        }, "Fibonacci: 0 1 1 2 3 5 8 13 21 34\n2^10 = 1024\nSum of digits of 1234 = 10"),
        { t: "example", title: "digit_sum(1234), call by call", steps: [
          "digit_sum(1234) = 4 + digit_sum(123)",
          "digit_sum(123) = 3 + digit_sum(12)",
          "digit_sum(12) = 2 + digit_sum(1)",
          "digit_sum(1) = 1 (base case: a single digit)",
          "Back up: 2 + 1 = 3 → 3 + 3 = 6 → 4 + 6 = **10**",
        ], answer: "% 10 gives the last digit; / 10 (or // 10) removes it." },
        { t: "h", text: "Step 2: Why simple recursive Fibonacci is slow" },
        { t: "diagram", text: "                fib(5)\n           /            \\\n       fib(4)           fib(3)\n      /     \\           /    \\\n  fib(3)  fib(2)    fib(2)  fib(1)\n  /   \\\nfib(2) fib(1)        ← fib(3) and fib(2) are computed again and again", caption: "Two calls each time: about 2ⁿ calls, O(2ⁿ). Dynamic programming (module 11) fixes this." },
        { t: "trap", text: "Plain recursive Fibonacci is O(2ⁿ): fib(40) makes over 300 million calls. It's great for learning recursion, but in real code use a loop or memoization (the Dynamic Programming lessons)." },
        { t: "trick", text: "**Digits: % 10 takes the last digit, / 10 removes it.**" },
        { t: "exam", items: ["Print the first n Fibonacci numbers.", "Why is recursive Fibonacci slow? (Overlapping subproblems, O(2ⁿ).)", "Compute xⁿ recursively. (Bonus: fast power in O(log n) by halving n.)", "Sum or reverse the digits of a number."] },
        { t: "recap", items: ["Ask: base case? How does the smaller answer help? Does it shrink?", "fib(n) = fib(n−1) + fib(n−2): simple but O(2ⁿ)", "power: x × power(x, n−1)", "digits: n % 10 + f(n / 10)"] },
      ],
      quiz: [
        { q: "fib(6) is…", options: ["8", "5", "13", "6"], answer: 0, explain: "0 1 1 2 3 5 8." },
        { q: "What does 1234 % 10 give?", options: ["4", "123", "1", "10"], answer: 0, explain: "The last digit." },
        { q: "Simple recursive Fibonacci has time complexity…", options: ["O(2ⁿ)", "O(n)", "O(log n)", "O(1)"], answer: 0, explain: "Each call makes two more calls." },
        { q: "Base case for power(x, n)?", options: ["n == 0 → return 1", "n == 1 → return 0", "x == 0 → return x", "There is none"], answer: 0, explain: "x⁰ = 1." },
      ],
    },
    {
      id: "backtracking",
      title: "Backtracking: subsets and permutations",
      oneLine: "Backtracking builds solutions step by step: choose an option, explore deeper, then undo the choice (backtrack) and try the next option. It's how you generate every subset, permutation or path.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Choose → explore → un-choose" },
        { t: "p", text: "Backtracking is recursion with a pattern. At each step you have choices. For each choice: **make it**, **recurse** to make the remaining choices, then **undo it** so the next choice starts clean." },
        { t: "analogy", text: "Solving a maze: at every junction you pick a path and walk it. If it's a dead end, you walk back (backtrack) to the junction and try the next path. Eventually you've tried every route." },
        { t: "h", text: "Step 2: All subsets of [1, 2, 3]" },
        { t: "diagram", text: "                    []\n         /           |          \\\n       [1]          [2]         [3]\n      /    \\          |\n  [1,2]   [1,3]     [2,3]\n    |\n [1,2,3]", caption: "Each node is a subset. From a subset, add any later number. 2³ = 8 subsets in total." },
        multi("Generate all subsets", {
          python: src`
nums = [1, 2, 3]
current = []                         # the subset being built

def backtrack(start):
    print("[" + ", ".join(str(x) for x in current) + "]")   # every node is a subset
    for i in range(start, len(nums)):    # try adding each remaining number
        current.append(nums[i])          # 1. choose
        backtrack(i + 1)                 # 2. explore (only later numbers)
        current.pop()                    # 3. un-choose (backtrack)

backtrack(0)
`,
          c: src`
#include <stdio.h>

int nums[] = {1, 2, 3};
int n = 3;
int current[3];        // the subset being built
int size = 0;          // how many items are in current

void print_subset(void) {
    printf("[");
    for (int i = 0; i < size; i++) printf(i ? ", %d" : "%d", current[i]);
    printf("]\n");
}

void backtrack(int start) {
    print_subset();                        // every node is a subset
    for (int i = start; i < n; i++) {      // try each remaining number
        current[size++] = nums[i];         // 1. choose
        backtrack(i + 1);                  // 2. explore (only later numbers)
        size--;                            // 3. un-choose (backtrack)
    }
}

int main(void) {
    backtrack(0);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

vector<int> nums = {1, 2, 3};
vector<int> current;                   // the subset being built

void backtrack(int start) {
    cout << "[";                       // every node is a subset
    for (size_t i = 0; i < current.size(); i++) cout << (i ? ", " : "") << current[i];
    cout << "]" << endl;
    for (int i = start; i < (int)nums.size(); i++) {   // try each remaining number
        current.push_back(nums[i]);    // 1. choose
        backtrack(i + 1);              // 2. explore (only later numbers)
        current.pop_back();            // 3. un-choose (backtrack)
    }
}

int main() {
    backtrack(0);
    return 0;
}
`,
          java: src`
import java.util.ArrayList;
import java.util.List;

public class Main {
    static int[] nums = {1, 2, 3};
    static List<Integer> current = new ArrayList<>();   // the subset being built

    static void backtrack(int start) {
        System.out.println(current);                     // prints like [1, 2]
        for (int i = start; i < nums.length; i++) {      // try each remaining number
            current.add(nums[i]);                        // 1. choose
            backtrack(i + 1);                            // 2. explore
            current.remove(current.size() - 1);          // 3. un-choose (backtrack)
        }
    }

    public static void main(String[] args) {
        backtrack(0);
    }
}
`,
          javascript: src`
const nums = [1, 2, 3];
const current = [];                    // the subset being built

function backtrack(start) {
  console.log("[" + current.join(", ") + "]");   // every node is a subset
  for (let i = start; i < nums.length; i++) {    // try each remaining number
    current.push(nums[i]);             // 1. choose
    backtrack(i + 1);                  // 2. explore (only later numbers)
    current.pop();                     // 3. un-choose (backtrack)
  }
}

backtrack(0);
`,
        }, "[]\n[1]\n[1, 2]\n[1, 2, 3]\n[1, 3]\n[2]\n[2, 3]\n[3]"),
        { t: "h", text: "Step 3: All permutations of \"ABC\"" },
        { t: "p", text: "A permutation uses **every** letter once, in some order. Keep a `used` array: at each position, try every letter that isn't used yet." },
        multi("Generate all permutations", {
          python: src`
letters = "ABC"
used = [False] * len(letters)      # which letters are already placed
current = []

def permute():
    if len(current) == len(letters):   # base case: all letters placed
        print("".join(current))
        return
    for i in range(len(letters)):
        if used[i]:                    # skip letters already in use
            continue
        used[i] = True                 # 1. choose letter i
        current.append(letters[i])
        permute()                      # 2. explore
        current.pop()                  # 3. un-choose
        used[i] = False

permute()
`,
          c: src`
#include <stdio.h>
#include <string.h>

const char *letters = "ABC";
int n = 3;
int used[3] = {0};          // which letters are already placed
char current[4];            // the arrangement being built (+1 for '\0')
int size = 0;

void permute(void) {
    if (size == n) {                     // base case: all letters placed
        current[size] = '\0';
        printf("%s\n", current);
        return;
    }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;           // skip letters already in use
        used[i] = 1;                     // 1. choose letter i
        current[size++] = letters[i];
        permute();                       // 2. explore
        size--;                          // 3. un-choose
        used[i] = 0;
    }
}

int main(void) {
    permute();
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
#include <vector>
using namespace std;

string letters = "ABC";
vector<bool> used(3, false);   // which letters are already placed
string current;

void permute() {
    if (current.size() == letters.size()) {   // base case: all placed
        cout << current << endl;
        return;
    }
    for (int i = 0; i < (int)letters.size(); i++) {
        if (used[i]) continue;               // skip letters already in use
        used[i] = true;                      // 1. choose letter i
        current.push_back(letters[i]);
        permute();                           // 2. explore
        current.pop_back();                  // 3. un-choose
        used[i] = false;
    }
}

int main() {
    permute();
    return 0;
}
`,
          java: src`
public class Main {
    static String letters = "ABC";
    static boolean[] used = new boolean[3];       // which letters are placed
    static StringBuilder current = new StringBuilder();

    static void permute() {
        if (current.length() == letters.length()) {   // base case
            System.out.println(current);
            return;
        }
        for (int i = 0; i < letters.length(); i++) {
            if (used[i]) continue;                    // skip letters in use
            used[i] = true;                           // 1. choose letter i
            current.append(letters.charAt(i));
            permute();                                // 2. explore
            current.deleteCharAt(current.length() - 1);   // 3. un-choose
            used[i] = false;
        }
    }

    public static void main(String[] args) {
        permute();
    }
}
`,
          javascript: src`
const letters = "ABC";
const used = new Array(letters.length).fill(false);   // which letters are placed
const current = [];

function permute() {
  if (current.length === letters.length) {   // base case: all letters placed
    console.log(current.join(""));
    return;
  }
  for (let i = 0; i < letters.length; i++) {
    if (used[i]) continue;                   // skip letters already in use
    used[i] = true;                          // 1. choose letter i
    current.push(letters[i]);
    permute();                               // 2. explore
    current.pop();                           // 3. un-choose
    used[i] = false;
  }
}

permute();
`,
        }, "ABC\nACB\nBAC\nBCA\nCAB\nCBA"),
        { t: "table", head: ["Problem", "How many results", "Time"], rows: [["Subsets of n items", "2ⁿ", "O(n · 2ⁿ)"], ["Permutations of n items", "n!", "O(n · n!)"]], caption: "Backtracking explores every possibility, so it's slow for big n, but often the only way." },
        { t: "trap", text: "Forgetting the **un-choose** step (pop, used = false) is the #1 backtracking bug: the next branch starts with leftovers from the previous branch, and you get wrong or missing results." },
        { t: "trick", text: "**Choose → explore → un-choose.** Write the three lines together, every time." },
        { t: "exam", items: ["Generate all subsets (the power set).", "Generate all permutations of a string.", "N-Queens problem.", "Combination sum.", "Rat in a maze / Sudoku solver."] },
        { t: "recap", items: ["Backtracking = recursion + choose / explore / un-choose", "Subsets: at each step, add a later item or stop (2ⁿ results)", "Permutations: a used[] array; fill each position with an unused item (n! results)", "Always undo the choice before trying the next one"] },
      ],
      quiz: [
        { q: "How many subsets does [1, 2, 3] have?", options: ["8", "6", "3", "9"], answer: 0, explain: "2³ = 8, including the empty set." },
        { q: "How many permutations does \"ABC\" have?", options: ["6", "3", "9", "8"], answer: 0, explain: "3! = 3 × 2 × 1." },
        { q: "The three steps of backtracking are…", options: ["Choose, explore, un-choose", "Sort, search, print", "Push, pop, peek", "Input, process, output"], answer: 0, explain: "Undoing the choice is essential." },
        { q: "What happens if you forget the un-choose step?", options: ["Later branches start with leftover choices, giving wrong results", "It runs faster", "Nothing", "It prints nothing"], answer: 0, explain: "The state must be restored." },
      ],
    },
  ],
};

export const DSA04_SORTING: LearnModule = {
  id: "search-sort",
  title: "Searching and sorting",
  titleHi: "सर्चिंग और सॉर्टिंग",
  blurb: "Binary search, the three simple sorts (bubble, selection, insertion), and the two fast ones (merge sort, quick sort), each traced step by step.",
  lessons: [
    {
      id: "binary-search",
      title: "Binary search",
      oneLine: "In a sorted array, check the middle item. If the target is smaller, search the left half; if bigger, the right half. Halving each step makes it O(log n): 10 lakh items need only about 20 checks.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Linear vs binary search" },
        { t: "table", head: ["", "Linear search", "Binary search"], rows: [["How", "Check items one by one", "Check the middle, throw away half"], ["Needs a sorted array?", "No", "**Yes**"], ["Time", "O(n)", "**O(log n)**"], ["10,00,000 items, worst case", "10,00,000 checks", "about 20 checks"]] },
        { t: "analogy", text: "Guessing a number from 1 to 100: you don't ask \"is it 1? is it 2?\". You ask \"is it more than 50?\", then \"more than 75?\", halving each time. You always win in 7 guesses. That's binary search." },
        { t: "h", text: "Step 2: The code" },
        multi("Binary search with a step counter", {
          python: src`
def binary_search(a, target):
    low, high = 0, len(a) - 1     # the part of the array still possible
    steps = 0
    while low <= high:            # while there's something left to check
        steps += 1
        mid = (low + high) // 2   # the middle index
        if a[mid] == target:
            return mid, steps     # found it
        elif a[mid] < target:     # target is bigger: throw away the left half
            low = mid + 1
        else:                     # target is smaller: throw away the right half
            high = mid - 1
    return -1, steps              # not found

a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]   # must be sorted
for t in [23, 7]:
    index, steps = binary_search(a, t)
    if index != -1:
        print(t, "found at index", index, "after", steps, "steps")
    else:
        print(t, "not found after", steps, "steps")
`,
          c: src`
#include <stdio.h>

int steps;   // how many middles we checked

int binary_search(int a[], int n, int target) {
    int low = 0, high = n - 1;        // the part still possible
    steps = 0;
    while (low <= high) {             // while something is left
        steps++;
        int mid = (low + high) / 2;   // the middle index
        if (a[mid] == target) return mid;      // found it
        else if (a[mid] < target) low = mid + 1;   // go right
        else high = mid - 1;                       // go left
    }
    return -1;                        // not found
}

int main(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};   // must be sorted
    int targets[] = {23, 7};
    for (int k = 0; k < 2; k++) {
        int idx = binary_search(a, 10, targets[k]);
        if (idx != -1) printf("%d found at index %d after %d steps\n", targets[k], idx, steps);
        else printf("%d not found after %d steps\n", targets[k], steps);
    }
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int steps;   // how many middles we checked

int binarySearch(const vector<int>& a, int target) {
    int low = 0, high = (int)a.size() - 1;   // the part still possible
    steps = 0;
    while (low <= high) {
        steps++;
        int mid = low + (high - low) / 2;    // middle (safe from overflow)
        if (a[mid] == target) return mid;    // found it
        if (a[mid] < target) low = mid + 1;  // go right
        else high = mid - 1;                 // go left
    }
    return -1;
}

int main() {
    vector<int> a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};   // must be sorted
    for (int t : {23, 7}) {
        int idx = binarySearch(a, t);
        if (idx != -1) cout << t << " found at index " << idx << " after " << steps << " steps" << endl;
        else cout << t << " not found after " << steps << " steps" << endl;
    }
    return 0;
}
`,
          java: src`
public class Main {
    static int steps;   // how many middles we checked

    static int binarySearch(int[] a, int target) {
        int low = 0, high = a.length - 1;       // the part still possible
        steps = 0;
        while (low <= high) {
            steps++;
            int mid = low + (high - low) / 2;   // middle (safe from overflow)
            if (a[mid] == target) return mid;   // found it
            if (a[mid] < target) low = mid + 1; // go right
            else high = mid - 1;                // go left
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};   // must be sorted
        for (int t : new int[]{23, 7}) {
            int idx = binarySearch(a, t);
            if (idx != -1) System.out.println(t + " found at index " + idx + " after " + steps + " steps");
            else System.out.println(t + " not found after " + steps + " steps");
        }
    }
}
`,
          javascript: src`
let steps = 0;   // how many middles we checked

function binarySearch(a, target) {
  let low = 0, high = a.length - 1;       // the part still possible
  steps = 0;
  while (low <= high) {
    steps++;
    const mid = Math.floor((low + high) / 2);   // middle (whole number!)
    if (a[mid] === target) return mid;          // found it
    if (a[mid] < target) low = mid + 1;         // go right
    else high = mid - 1;                        // go left
  }
  return -1;
}

const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];   // must be sorted
for (const t of [23, 7]) {
  const idx = binarySearch(a, t);
  if (idx !== -1) console.log(t + " found at index " + idx + " after " + steps + " steps");
  else console.log(t + " not found after " + steps + " steps");
}
`,
        }, "23 found at index 5 after 3 steps\n7 not found after 3 steps"),
        { t: "h", text: "Step 3: Dry run for target 23" },
        { t: "table", head: ["Step", "low", "high", "mid", "a[mid]", "Decision"], rows: [
          ["1", "0", "9", "4", "16", "16 < 23 → low = 5"],
          ["2", "5", "9", "7", "56", "56 > 23 → high = 6"],
          ["3", "5", "6", "5", "23", "**Found at index 5**"],
        ] },
        { t: "trap", text: "Three classic bugs: (1) using `while (low < high)` and missing the last item (use `<=`); (2) writing `low = mid` instead of `mid + 1`, which loops forever; (3) in JavaScript, forgetting `Math.floor`, so mid becomes 4.5. In C++ and Java, `low + (high − low) / 2` avoids integer overflow on huge arrays." },
        { t: "trick", text: "**Too small → low = mid + 1. Too big → high = mid − 1. Loop while low <= high.**" },
        { t: "exam", items: ["Implement binary search (iterative and recursive).", "Why must the array be sorted?", "Find the first or last occurrence of an element.", "Search in a rotated sorted array.", "Square root of a number using binary search."] },
        { t: "recap", items: ["Works only on sorted arrays", "Check the middle; discard half each step", "O(log n) time, O(1) space (iterative)", "Use <= in the loop condition and mid ± 1 updates"] },
      ],
      quiz: [
        { q: "Binary search requires the array to be…", options: ["Sorted", "Unsorted", "Small", "Of strings"], answer: 0, explain: "The halving logic relies on order." },
        { q: "Time complexity of binary search?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], answer: 0, explain: "The search space halves each step." },
        { q: "If a[mid] < target, the next step is…", options: ["low = mid + 1", "high = mid − 1", "low = mid", "return mid"], answer: 0, explain: "The target must be on the right." },
        { q: "About how many checks for 1,000,000 sorted items?", options: ["20", "1,000", "500,000", "1,000,000"], answer: 0, explain: "log₂(10⁶) ≈ 20." },
      ],
    },
    {
      id: "simple-sorts",
      title: "Bubble, selection and insertion sort",
      oneLine: "Three easy sorting methods, all O(n²): bubble sort swaps neighbours, selection sort picks the smallest each round, and insertion sort inserts each item into the sorted part like arranging playing cards.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Three ideas" },
        { t: "table", head: ["Sort", "Idea in one line", "Like…"], rows: [
          ["**Bubble**", "Compare neighbours and swap if they're in the wrong order. The biggest \"bubbles\" to the end each pass", "Bubbles rising in water"],
          ["**Selection**", "Find the smallest remaining item and put it in the next place", "Picking the shortest student to stand first, then the next shortest…"],
          ["**Insertion**", "Take the next item and slide it left into its correct place among the sorted ones", "Arranging playing cards in your hand"],
        ] },
        multi("Three simple sorts", {
          python: src`
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):                 # n-1 passes
        for j in range(n - 1 - i):         # the last i items are already in place
            if a[j] > a[j + 1]:            # wrong order?
                a[j], a[j + 1] = a[j + 1], a[j]   # swap the neighbours

def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        smallest = i                       # assume position i holds the smallest
        for j in range(i + 1, n):          # look at the rest
            if a[j] < a[smallest]:
                smallest = j               # found a smaller one
        a[i], a[smallest] = a[smallest], a[i]   # put it in position i

def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]                         # the card we're placing
        j = i - 1
        while j >= 0 and a[j] > key:       # shift bigger items one place right
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key                     # drop the card into the gap

data = [5, 2, 9, 1, 6]
for name, sort in [("Bubble:", bubble_sort), ("Selection:", selection_sort), ("Insertion:", insertion_sort)]:
    a = data.copy()                        # sort a fresh copy each time
    sort(a)
    print(name, *a)
`,
          c: src`
#include <stdio.h>

void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }   // swap two ints

void bubble_sort(int a[], int n) {
    for (int i = 0; i < n - 1; i++)              // n-1 passes
        for (int j = 0; j < n - 1 - i; j++)      // last i are already in place
            if (a[j] > a[j + 1]) swap(&a[j], &a[j + 1]);   // swap neighbours
}

void selection_sort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int smallest = i;                        // assume i is the smallest
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[smallest]) smallest = j;   // found a smaller one
        swap(&a[i], &a[smallest]);               // put it in position i
    }
}

void insertion_sort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i];                          // the card we're placing
        int j = i - 1;
        while (j >= 0 && a[j] > key) {           // shift bigger items right
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;                          // drop it into the gap
    }
}

void print(const char *name, int a[], int n) {
    printf("%s", name);
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int data[] = {5, 2, 9, 1, 6}, n = 5, a[5];
    for (int i = 0; i < n; i++) a[i] = data[i];   // fresh copy
    bubble_sort(a, n);    print("Bubble:", a, n);
    for (int i = 0; i < n; i++) a[i] = data[i];
    selection_sort(a, n); print("Selection:", a, n);
    for (int i = 0; i < n; i++) a[i] = data[i];
    insertion_sort(a, n); print("Insertion:", a, n);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++)                 // n-1 passes
        for (int j = 0; j < n - 1 - i; j++)         // last i already in place
            if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);   // swap neighbours
}

void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int smallest = i;                           // assume i is the smallest
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[smallest]) smallest = j;   // found a smaller one
        swap(a[i], a[smallest]);                    // put it in position i
    }
}

void insertionSort(vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i];                             // the card we're placing
        int j = i - 1;
        while (j >= 0 && a[j] > key) {              // shift bigger items right
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;                             // drop it into the gap
    }
}

void print(const string& name, const vector<int>& a) {
    cout << name;
    for (int x : a) cout << " " << x;
    cout << endl;
}

int main() {
    vector<int> data = {5, 2, 9, 1, 6};
    vector<int> a = data; bubbleSort(a);    print("Bubble:", a);      // fresh copy each time
    a = data;             selectionSort(a); print("Selection:", a);
    a = data;             insertionSort(a); print("Insertion:", a);
    return 0;
}
`,
          java: src`
public class Main {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++)                 // n-1 passes
            for (int j = 0; j < n - 1 - i; j++)         // last i already in place
                if (a[j] > a[j + 1]) swap(a, j, j + 1); // swap neighbours
    }

    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int smallest = i;                           // assume i is the smallest
            for (int j = i + 1; j < n; j++)
                if (a[j] < a[smallest]) smallest = j;   // found a smaller one
            swap(a, i, smallest);                       // put it in position i
        }
    }

    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];                             // the card we're placing
            int j = i - 1;
            while (j >= 0 && a[j] > key) {              // shift bigger items right
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;                             // drop it into the gap
        }
    }

    static void print(String name, int[] a) {
        StringBuilder sb = new StringBuilder(name);
        for (int x : a) sb.append(" ").append(x);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        int[] data = {5, 2, 9, 1, 6};
        int[] a = data.clone(); bubbleSort(a);    print("Bubble:", a);   // fresh copy each time
        a = data.clone();       selectionSort(a); print("Selection:", a);
        a = data.clone();       insertionSort(a); print("Insertion:", a);
    }
}
`,
          javascript: src`
function bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++)                // n-1 passes
    for (let j = 0; j < n - 1 - i; j++)          // last i already in place
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];   // swap neighbours
}

function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let smallest = i;                            // assume i is the smallest
    for (let j = i + 1; j < n; j++)
      if (a[j] < a[smallest]) smallest = j;      // found a smaller one
    [a[i], a[smallest]] = [a[smallest], a[i]];   // put it in position i
  }
}

function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];                            // the card we're placing
    let j = i - 1;
    while (j >= 0 && a[j] > key) {               // shift bigger items right
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;                              // drop it into the gap
  }
}

const data = [5, 2, 9, 1, 6];
for (const [name, sort] of [["Bubble:", bubbleSort], ["Selection:", selectionSort], ["Insertion:", insertionSort]]) {
  const a = [...data];                           // sort a fresh copy each time
  sort(a);
  console.log(name + " " + a.join(" "));
}
`,
        }, "Bubble: 1 2 5 6 9\nSelection: 1 2 5 6 9\nInsertion: 1 2 5 6 9"),
        { t: "h", text: "Step 2: Bubble sort, pass by pass" },
        { t: "table", head: ["Pass", "Comparisons and swaps", "Array after the pass"], rows: [
          ["start", "", "5 2 9 1 6"],
          ["1", "5↔2 swap, 5–9 ok, 9↔1 swap, 9↔6 swap", "2 5 1 6 **9**"],
          ["2", "2–5 ok, 5↔1 swap, 5–6 ok", "2 1 5 **6 9**"],
          ["3", "2↔1 swap, 2–5 ok", "1 2 **5 6 9**"],
          ["4", "1–2 ok", "**1 2 5 6 9**"],
        ], caption: "After each pass, the largest remaining item is fixed at the end (bold)" },
        { t: "h", text: "Step 3: Insertion sort, card by card" },
        { t: "table", head: ["i", "key", "What happens", "Array"], rows: [
          ["1", "2", "5 > 2 → shift 5 right; place 2", "2 5 9 1 6"],
          ["2", "9", "5 < 9 → stays", "2 5 9 1 6"],
          ["3", "1", "shift 9, 5, 2 right; place 1 at the front", "1 2 5 9 6"],
          ["4", "6", "shift 9 right; place 6", "1 2 5 6 9"],
        ] },
        { t: "table", head: ["Sort", "Best", "Average", "Worst", "Extra space", "Note"], rows: [
          ["Bubble", "O(n)*", "O(n²)", "O(n²)", "O(1)", "*with an early-exit flag when no swaps happen"],
          ["Selection", "O(n²)", "O(n²)", "O(n²)", "O(1)", "Fewest swaps (n − 1)"],
          ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "Great for nearly-sorted data"],
        ] },
        { t: "trap", text: "In bubble sort, the inner loop goes to `n − 1 − i`, not `n`: comparing `a[j]` with `a[j + 1]` when j = n − 1 reads past the end of the array (a crash in C and Java, undefined in JavaScript)." },
        { t: "trick", text: "**Bubble = swap neighbours. Selection = pick the minimum. Insertion = slide into place.**" },
        { t: "exam", items: ["Write bubble, selection and insertion sort.", "Which is best for nearly-sorted data? (Insertion.)", "Which makes the fewest swaps? (Selection.)", "What is a stable sort? (Equal items keep their order: bubble and insertion are stable; selection isn't.)"] },
        { t: "recap", items: ["Bubble: swap neighbours; the largest moves to the end each pass", "Selection: find the minimum and put it at the front", "Insertion: slide each item left into the sorted part", "All are O(n²) and in-place, fine for small arrays"] },
      ],
      quiz: [
        { q: "Which sort works like arranging playing cards in your hand?", options: ["Insertion sort", "Bubble sort", "Selection sort", "Merge sort"], answer: 0, explain: "Each card slides into place." },
        { q: "After the first pass of bubble sort, which element is in its final place?", options: ["The largest", "The smallest", "The middle one", "None"], answer: 0, explain: "It bubbles to the end." },
        { q: "Average time complexity of these three sorts?", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 0, explain: "Nested loops." },
        { q: "Which sort is fastest on an already-sorted array?", options: ["Insertion sort, O(n)", "Selection sort", "All the same", "None"], answer: 0, explain: "Nothing needs shifting." },
      ],
    },
    {
      id: "merge-sort",
      title: "Merge sort",
      oneLine: "Divide the array in half, sort each half (recursively), then merge the two sorted halves. It's always O(n log n), and the classic divide-and-conquer algorithm.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Divide, sort, merge" },
        { t: "diagram", text: "           [38 27 43 3 9 82 10]\n             /              \\\n      [38 27 43]           [3 9 82 10]          ← divide\n      /       \\             /        \\\n   [38]    [27 43]       [3 9]     [82 10]\n            /   \\        /  \\       /   \\\n          [27] [43]    [3]  [9]   [82]  [10]   ← single items are sorted\n            \\   /        \\  /       \\   /\n   [38]    [27 43]       [3 9]     [10 82]      ← merge back up\n      \\       /             \\        /\n      [27 38 43]           [3 9 10 82]\n             \\              /\n          [3 9 10 27 38 43 82]" },
        { t: "h", text: "Step 2: The key part: merging two sorted lists" },
        { t: "example", title: "Merge [27, 38, 43] and [3, 9, 10, 82]", steps: [
          "Compare the fronts: 27 vs 3 → take **3**.",
          "27 vs 9 → take **9**. 27 vs 10 → take **10**.",
          "27 vs 82 → take **27**. 38 vs 82 → take **38**. 43 vs 82 → take **43**.",
          "The left list is empty, so copy the rest: **82**.",
          "Result: 3 9 10 27 38 43 82.",
        ], answer: "Always take the smaller front item: one pass, O(n)." },
        multi("Merge sort", {
          python: src`
def merge_sort(a):
    if len(a) <= 1:                  # base case: 0 or 1 item is already sorted
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])       # sort the left half
    right = merge_sort(a[mid:])      # sort the right half
    return merge(left, right)        # combine them

def merge(left, right):
    result = []
    i = j = 0                        # front of each list
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:      # take the smaller front item
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])          # copy whatever is left over
    result.extend(right[j:])
    return result

print(*merge_sort([38, 27, 43, 3, 9, 82, 10]))
`,
          c: src`
#include <stdio.h>

void merge(int a[], int l, int m, int r) {   // merge a[l..m] and a[m+1..r]
    int temp[50], i = l, j = m + 1, k = 0;
    while (i <= m && j <= r) {               // take the smaller front item
        if (a[i] <= a[j]) temp[k++] = a[i++];
        else temp[k++] = a[j++];
    }
    while (i <= m) temp[k++] = a[i++];       // copy leftovers
    while (j <= r) temp[k++] = a[j++];
    for (int t = 0; t < k; t++) a[l + t] = temp[t];   // copy back
}

void merge_sort(int a[], int l, int r) {
    if (l >= r) return;                      // base case: 0 or 1 item
    int m = (l + r) / 2;
    merge_sort(a, l, m);                     // sort the left half
    merge_sort(a, m + 1, r);                 // sort the right half
    merge(a, l, m, r);                       // combine them
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10};
    int n = 7;
    merge_sort(a, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& a, int l, int m, int r) {   // merge a[l..m] and a[m+1..r]
    vector<int> temp;
    int i = l, j = m + 1;
    while (i <= m && j <= r) {                       // take the smaller front item
        if (a[i] <= a[j]) temp.push_back(a[i++]);
        else temp.push_back(a[j++]);
    }
    while (i <= m) temp.push_back(a[i++]);           // copy leftovers
    while (j <= r) temp.push_back(a[j++]);
    for (int k = 0; k < (int)temp.size(); k++) a[l + k] = temp[k];   // copy back
}

void mergeSort(vector<int>& a, int l, int r) {
    if (l >= r) return;                              // base case
    int m = l + (r - l) / 2;
    mergeSort(a, l, m);                              // sort the left half
    mergeSort(a, m + 1, r);                          // sort the right half
    merge(a, l, m, r);                               // combine them
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(a, 0, (int)a.size() - 1);
    for (int x : a) cout << x << " ";
    cout << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static void merge(int[] a, int l, int m, int r) {   // merge a[l..m] and a[m+1..r]
        int[] temp = new int[r - l + 1];
        int i = l, j = m + 1, k = 0;
        while (i <= m && j <= r) {                      // take the smaller front item
            if (a[i] <= a[j]) temp[k++] = a[i++];
            else temp[k++] = a[j++];
        }
        while (i <= m) temp[k++] = a[i++];              // copy leftovers
        while (j <= r) temp[k++] = a[j++];
        for (int t = 0; t < k; t++) a[l + t] = temp[t]; // copy back
    }

    static void mergeSort(int[] a, int l, int r) {
        if (l >= r) return;                             // base case
        int m = l + (r - l) / 2;
        mergeSort(a, l, m);                             // sort the left half
        mergeSort(a, m + 1, r);                         // sort the right half
        merge(a, l, m, r);                              // combine them
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(a, 0, a.length - 1);
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(" ");
        System.out.println(sb.toString().trim());
    }
}
`,
          javascript: src`
function mergeSort(a) {
  if (a.length <= 1) return a;              // base case: already sorted
  const mid = Math.floor(a.length / 2);
  const left = mergeSort(a.slice(0, mid));  // sort the left half
  const right = mergeSort(a.slice(mid));    // sort the right half
  return merge(left, right);                // combine them
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;                         // front of each list
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);   // take the smaller
    else result.push(right[j++]);
  }
  while (i < left.length) result.push(left[i++]);      // copy leftovers
  while (j < right.length) result.push(right[j++]);
  return result;
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]).join(" "));
`,
        }, "3 9 10 27 38 43 82"),
        { t: "h", text: "Step 3: Why O(n log n)?" },
        { t: "points", items: ["Halving the array again and again gives **log n levels** (7 items → 3 levels).", "At each level, merging touches all **n** items once.", "n work × log n levels = **O(n log n)**, in the best, average **and** worst case.", "It needs **O(n) extra memory** for the temporary arrays."] },
        { t: "analogy", text: "Sorting exam papers with friends: split the pile in half again and again until everyone has one paper (sorted by definition). Then pairs merge their piles by always taking the paper with the lower roll number from the top, until one big sorted pile remains." },
        { t: "trap", text: "Using `<` instead of `<=` when comparing the fronts makes merge sort **unstable** (equal items swap order). And forgetting to copy the leftovers loses items." },
        { t: "trick", text: "**Split until 1, then merge by taking the smaller front.**" },
        { t: "exam", items: ["Implement merge sort.", "Time and space complexity of merge sort? (O(n log n) time, O(n) space.)", "Merge two sorted arrays.", "Count inversions using merge sort.", "Merge sort vs quick sort?"] },
        { t: "recap", items: ["Divide in half → sort each half → merge", "Merge: take the smaller front item, then copy leftovers", "Always O(n log n); needs O(n) extra space", "Stable when using <="] },
      ],
      quiz: [
        { q: "Time complexity of merge sort in the worst case?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], answer: 0, explain: "log n levels × n work each." },
        { q: "What is the base case of merge sort?", options: ["An array of 0 or 1 items", "An array of 2 items", "A sorted array", "There isn't one"], answer: 0, explain: "A single item is already sorted." },
        { q: "Merging [1, 4] and [2, 3] gives…", options: ["[1, 2, 3, 4]", "[1, 4, 2, 3]", "[2, 3, 1, 4]", "[4, 3, 2, 1]"], answer: 0, explain: "Always take the smaller front item." },
        { q: "Extra space used by merge sort?", options: ["O(n)", "O(1)", "O(n²)", "None"], answer: 0, explain: "For the temporary arrays." },
      ],
    },
    {
      id: "quick-sort",
      title: "Quick sort",
      oneLine: "Pick a pivot, move smaller items to its left and bigger ones to its right (partition), then quick sort each side. Usually the fastest sort in practice: O(n log n) on average.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Partition around a pivot" },
        { t: "p", text: "Pick the **last** item as the **pivot**. Walk through the array and move every item **smaller** than the pivot to the front. Finally, put the pivot right after them. Now the pivot is in its **final sorted position**: everything left is smaller, everything right is bigger." },
        { t: "example", title: "Partition [10, 80, 30, 90, 40, 50, 70] with pivot 70", steps: [
          "i marks the end of the \"smaller than pivot\" zone; it starts before index 0.",
          "10 < 70 → move into the zone → [10, 80, 30, 90, 40, 50, 70].",
          "80 > 70 → skip. 30 < 70 → swap with 80 → [10, 30, 80, 90, 40, 50, 70].",
          "90 > 70 → skip. 40 < 70 → swap with 80 → [10, 30, 40, 90, 80, 50, 70].",
          "50 < 70 → swap with 90 → [10, 30, 40, 50, 80, 90, 70].",
          "Finally swap the pivot into place after the zone → [10, 30, 40, 50, **70**, 90, 80].",
        ], answer: "70 is now in its final position. Quick sort the left part [10, 30, 40, 50] and the right part [90, 80]." },
        multi("Quick sort (Lomuto partition)", {
          python: src`
def partition(a, low, high):
    pivot = a[high]                  # choose the last item as the pivot
    i = low - 1                      # end of the "smaller than pivot" zone
    for j in range(low, high):       # look at every item before the pivot
        if a[j] < pivot:             # belongs in the smaller zone
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[high] = a[high], a[i + 1]   # put the pivot right after the zone
    return i + 1                     # the pivot's final position

def quick_sort(a, low, high):
    if low < high:                   # more than one item in this part
        p = partition(a, low, high)
        quick_sort(a, low, p - 1)    # sort the left of the pivot
        quick_sort(a, p + 1, high)   # sort the right of the pivot

a = [10, 80, 30, 90, 40, 50, 70]
quick_sort(a, 0, len(a) - 1)
print(*a)
`,
          c: src`
#include <stdio.h>

void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

int partition(int a[], int low, int high) {
    int pivot = a[high];                 // last item is the pivot
    int i = low - 1;                     // end of the "smaller" zone
    for (int j = low; j < high; j++) {   // every item before the pivot
        if (a[j] < pivot) {              // belongs in the smaller zone
            i++;
            swap(&a[i], &a[j]);
        }
    }
    swap(&a[i + 1], &a[high]);           // pivot goes right after the zone
    return i + 1;                        // the pivot's final position
}

void quick_sort(int a[], int low, int high) {
    if (low < high) {                    // more than one item
        int p = partition(a, low, high);
        quick_sort(a, low, p - 1);       // left of the pivot
        quick_sort(a, p + 1, high);      // right of the pivot
    }
}

int main(void) {
    int a[] = {10, 80, 30, 90, 40, 50, 70};
    int n = 7;
    quick_sort(a, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& a, int low, int high) {
    int pivot = a[high];                 // last item is the pivot
    int i = low - 1;                     // end of the "smaller" zone
    for (int j = low; j < high; j++) {
        if (a[j] < pivot) {              // belongs in the smaller zone
            i++;
            swap(a[i], a[j]);
        }
    }
    swap(a[i + 1], a[high]);             // pivot right after the zone
    return i + 1;
}

void quickSort(vector<int>& a, int low, int high) {
    if (low < high) {
        int p = partition(a, low, high);
        quickSort(a, low, p - 1);        // left of the pivot
        quickSort(a, p + 1, high);       // right of the pivot
    }
}

int main() {
    vector<int> a = {10, 80, 30, 90, 40, 50, 70};
    quickSort(a, 0, (int)a.size() - 1);
    for (int x : a) cout << x << " ";
    cout << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static int partition(int[] a, int low, int high) {
        int pivot = a[high];                 // last item is the pivot
        int i = low - 1;                     // end of the "smaller" zone
        for (int j = low; j < high; j++) {
            if (a[j] < pivot) {              // belongs in the smaller zone
                i++;
                swap(a, i, j);
            }
        }
        swap(a, i + 1, high);                // pivot right after the zone
        return i + 1;
    }

    static void quickSort(int[] a, int low, int high) {
        if (low < high) {
            int p = partition(a, low, high);
            quickSort(a, low, p - 1);        // left of the pivot
            quickSort(a, p + 1, high);       // right of the pivot
        }
    }

    public static void main(String[] args) {
        int[] a = {10, 80, 30, 90, 40, 50, 70};
        quickSort(a, 0, a.length - 1);
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(" ");
        System.out.println(sb.toString().trim());
    }
}
`,
          javascript: src`
function partition(a, low, high) {
  const pivot = a[high];                 // last item is the pivot
  let i = low - 1;                       // end of the "smaller" zone
  for (let j = low; j < high; j++) {
    if (a[j] < pivot) {                  // belongs in the smaller zone
      i++;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];   // pivot right after the zone
  return i + 1;
}

function quickSort(a, low, high) {
  if (low < high) {
    const p = partition(a, low, high);
    quickSort(a, low, p - 1);            // left of the pivot
    quickSort(a, p + 1, high);           // right of the pivot
  }
}

const a = [10, 80, 30, 90, 40, 50, 70];
quickSort(a, 0, a.length - 1);
console.log(a.join(" "));
`,
        }, "10 30 40 50 70 80 90"),
        { t: "h", text: "Step 2: Comparing all the sorts" },
        { t: "table", head: ["Sort", "Best", "Average", "Worst", "Extra space", "Stable?"], rows: [
          ["Bubble", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
          ["Selection", "O(n²)", "O(n²)", "O(n²)", "O(1)", "No"],
          ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
          ["Merge", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
          ["Quick", "O(n log n)", "O(n log n)", "**O(n²)**", "O(log n)", "No"],
        ] },
        { t: "p", text: "Built-in sorts use these ideas: Python's `sorted()` and Java's object sort use **Timsort** (merge + insertion), C++ `std::sort` uses **introsort** (quick + heap + insertion), and C has `qsort`." },
        { t: "trap", text: "Quick sort's worst case is **O(n²)**: it happens when the pivot is always the smallest or largest item, for example on an already-sorted array with the last item as the pivot. Real implementations pick a random or median-of-three pivot to avoid this." },
        { t: "trick", text: "**Merge sort: easy split, hard merge. Quick sort: hard split (partition), no merge.**" },
        { t: "exam", items: ["Implement quick sort. Explain partition.", "Worst case of quick sort and how to avoid it.", "Quick sort vs merge sort: when to use which?", "Kth smallest element using partition (QuickSelect).", "Is quick sort stable? (No.)"] },
        { t: "recap", items: ["Partition: pivot in its final place, smaller left, bigger right", "Recurse on both sides", "Average O(n log n), worst O(n²), in-place", "Use a random pivot to avoid the worst case"] },
      ],
      quiz: [
        { q: "After partition, the pivot is…", options: ["In its final sorted position", "At index 0", "At the end", "Removed"], answer: 0, explain: "Smaller items are left of it, bigger ones right." },
        { q: "Quick sort's worst-case time is…", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 0, explain: "When pivots are always extreme." },
        { q: "Which sort is guaranteed O(n log n) in the worst case?", options: ["Merge sort", "Quick sort", "Bubble sort", "Insertion sort"], answer: 0, explain: "Merge sort always halves evenly." },
        { q: "Which sort needs O(n) extra memory?", options: ["Merge sort", "Quick sort", "Selection sort", "Bubble sort"], answer: 0, explain: "For the merge step." },
      ],
    },
  ],
};
