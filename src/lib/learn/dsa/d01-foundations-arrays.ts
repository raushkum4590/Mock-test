import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA modules 1–2: what DSA is, reading code in five languages, Big-O, arrays and strings. */
export const DSA01_FOUNDATIONS: LearnModule = {
  id: "foundations",
  title: "Foundations",
  titleHi: "बुनियाद",
  blurb: "What DSA is, how to read code in Python, C, C++, Java and JavaScript side by side, and how to measure speed with Big-O.",
  lessons: [
    {
      id: "what-is-dsa",
      title: "What is DSA?",
      oneLine: "A data structure is a way to organise data; an algorithm is a step-by-step method to solve a problem with it. DSA is learning to pick the right ones so programs are fast.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Step 1: Two simple words" },
        { t: "table", head: ["Word", "Meaning", "Everyday example"], rows: [
          ["**Data structure**", "A way to **store and organise** data", "Books arranged on shelves by subject"],
          ["**Algorithm**", "A **step-by-step method** to solve a problem", "\"Go to the Science shelf, then look alphabetically\" to find a book"],
        ] },
        { t: "analogy", text: "Think of a library. If 10,000 books are thrown in a pile (bad data structure), finding one book takes hours. If they're arranged by subject and title (good data structure), and you follow a clear method (algorithm), you find it in a minute. DSA is exactly this, for computers." },
        { t: "h", text: "Step 2: Your first algorithm: find the largest number" },
        { t: "p", text: "Problem: given the marks of 5 students, find the highest mark. The idea: **remember the biggest number seen so far**, look at each number one by one, and update when you find a bigger one." },
        { t: "p", text: "Choose your favourite language in the tabs. Every version does exactly the same thing, and every line has a comment explaining it." },
        multi("Find the largest number", {
          python: src`
# Find the largest number in a list
marks = [72, 95, 64, 88, 91]   # our data: a list of 5 numbers

largest = marks[0]             # start by assuming the first one is the largest
for m in marks:                # look at every number, one by one
    if m > largest:            # is this one bigger than our best so far?
        largest = m            # yes: remember it as the new largest

print("Largest:", largest)     # after the loop, largest holds the answer
`,
          c: src`
#include <stdio.h>                        // lets us use printf

int main(void) {
    int marks[] = {72, 95, 64, 88, 91};   // our data: an array of 5 numbers
    int n = 5;                            // C arrays don't know their size, so we store it

    int largest = marks[0];               // assume the first one is the largest
    for (int i = 0; i < n; i++) {         // i goes 0, 1, 2, 3, 4
        if (marks[i] > largest) {         // bigger than our best so far?
            largest = marks[i];           // yes: remember it
        }
    }

    printf("Largest: %d\n", largest);     // %d is replaced by the number
    return 0;                             // 0 means "finished without errors"
}
`,
          cpp: src`
#include <iostream>                        // lets us use cout
#include <vector>                          // lets us use vector (a resizable array)
using namespace std;

int main() {
    vector<int> marks = {72, 95, 64, 88, 91};   // our data: 5 numbers

    int largest = marks[0];                // assume the first one is the largest
    for (int m : marks) {                  // look at every number, one by one
        if (m > largest) {                 // bigger than our best so far?
            largest = m;                   // yes: remember it
        }
    }

    cout << "Largest: " << largest << endl;   // print the answer
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] marks = {72, 95, 64, 88, 91};   // our data: an array of 5 numbers

        int largest = marks[0];               // assume the first one is the largest
        for (int m : marks) {                 // look at every number, one by one
            if (m > largest) {                // bigger than our best so far?
                largest = m;                  // yes: remember it
            }
        }

        System.out.println("Largest: " + largest);   // print the answer
    }
}
`,
          javascript: src`
// Find the largest number in an array
const marks = [72, 95, 64, 88, 91];   // our data: an array of 5 numbers

let largest = marks[0];               // assume the first one is the largest
for (const m of marks) {              // look at every number, one by one
  if (m > largest) {                  // bigger than our best so far?
    largest = m;                      // yes: remember it
  }
}

console.log("Largest: " + largest);   // print the answer
`,
        }, "Largest: 95"),
        { t: "h", text: "Step 3: Dry run (trace it by hand)" },
        { t: "p", text: "A **dry run** means following the code on paper, step by step, writing down the variables. It's the best way to truly understand any algorithm." },
        { t: "table", head: ["Step", "m (current number)", "m > largest?", "largest after this step"], rows: [
          ["start", "–", "–", "72 (the first number)"],
          ["1", "72", "72 > 72? No", "72"],
          ["2", "95", "95 > 72? **Yes**", "**95**"],
          ["3", "64", "64 > 95? No", "95"],
          ["4", "88", "88 > 95? No", "95"],
          ["5", "91", "91 > 95? No", "95"],
        ], caption: "After looking at all 5 numbers, largest = 95" },
        { t: "h", text: "Step 4: Why learn DSA?" },
        { t: "table", head: ["Data structure", "Real-life use"], rows: [
          ["Array", "A list of marks, prices, pixels in an image"],
          ["Stack", "The Undo button; the browser's Back button"],
          ["Queue", "Printer jobs; customers waiting in a line"],
          ["Hash map", "A phone contacts list: name → number, found instantly"],
          ["Tree", "Folders on your computer; a family tree"],
          ["Graph", "Google Maps roads; friends on social media"],
        ] },
        { t: "points", items: ["**Speed**: the right algorithm can turn 1 hour into 1 second.", "**Jobs**: almost every software company tests DSA in interviews (TCS, Infosys, Amazon, Google…).", "**Thinking**: DSA trains you to break big problems into small steps."] },
        { t: "trap", text: "DSA is **not** about memorising code. It's about understanding the idea (like \"remember the biggest so far\") so you can write it yourself in any language. That's why every lesson shows 5 languages: the idea is the same in all of them." },
        { t: "trick", text: "**Data structure = how you store it. Algorithm = how you solve it.**" },
        { t: "exam", items: ["What is a data structure? Give examples.", "What is an algorithm?", "Find the largest element in an array. (The most common first question.)", "Why is DSA important?"] },
        { t: "recap", items: ["Data structure = a way to organise data", "Algorithm = step-by-step steps to solve a problem", "Find the largest: keep the biggest so far and compare each element", "Dry run = trace the variables step by step on paper", "The idea stays the same in every language"] },
      ],
      quiz: [
        { q: "What is a data structure?", options: ["A way to store and organise data", "A programming language", "A type of computer", "A website"], answer: 0, explain: "For example arrays, stacks and trees." },
        { q: "What is an algorithm?", options: ["A step-by-step method to solve a problem", "A kind of variable", "A database", "An error"], answer: 0, explain: "Like a recipe." },
        { q: "In the find-largest program, largest starts as…", options: ["The first element", "0", "The last element", "100"], answer: 0, explain: "Then we compare it with every other element." },
        { q: "What is a dry run?", options: ["Tracing the code by hand, step by step", "Running code without electricity", "Deleting code", "Compiling code"], answer: 0, explain: "The best way to understand an algorithm." },
        { q: "Which data structure works like the browser's Back button?", options: ["Stack", "Queue", "Array", "Graph"], answer: 0, explain: "The last page visited is the first to go back to." },
      ],
    },
    {
      id: "five-languages",
      title: "Reading code in 5 languages",
      oneLine: "Python, C, C++, Java and JavaScript look different but share the same building blocks: variables, if, loops, functions and arrays. Learn the mapping once and every lesson becomes easy.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: The same ideas, different spellings" },
        { t: "table", head: ["Idea", "Python", "C", "C++", "Java", "JavaScript"], rows: [
          ["Print", "`print(x)`", "`printf(\"%d\\n\", x);`", "`cout << x << endl;`", "`System.out.println(x);`", "`console.log(x);`"],
          ["Integer variable", "`x = 5`", "`int x = 5;`", "`int x = 5;`", "`int x = 5;`", "`let x = 5;`"],
          ["Array", "`a = [1, 2, 3]`", "`int a[] = {1, 2, 3};`", "`vector<int> a = {1, 2, 3};`", "`int[] a = {1, 2, 3};`", "`const a = [1, 2, 3];`"],
          ["Length", "`len(a)`", "store it: `int n = 3;`", "`a.size()`", "`a.length`", "`a.length`"],
          ["if", "`if x > 0:`", "`if (x > 0) { }`", "`if (x > 0) { }`", "`if (x > 0) { }`", "`if (x > 0) { }`"],
          ["Loop 0 to n−1", "`for i in range(n):`", "`for (int i = 0; i < n; i++)`", "same as C", "same as C", "`for (let i = 0; i < n; i++)`"],
          ["Function", "`def add(a, b):`", "`int add(int a, int b) { }`", "same as C", "`static int add(int a, int b) { }`", "`function add(a, b) { }`"],
          ["Integer division", "`7 // 2` → 3", "`7 / 2` → 3", "`7 / 2` → 3", "`7 / 2` → 3", "`Math.floor(7 / 2)` → 3"],
        ] },
        { t: "points", items: ["**Python** uses **indentation** (spaces) instead of `{ }`, and no semicolons.", "**C, C++ and Java** need the **type** of every variable (`int`, `double`, `char`).", "**C** arrays don't remember their length, so we keep it in a variable `n`.", "**Java** puts everything inside a `class`; the program starts at `main`.", "**JavaScript** uses `let` or `const`; numbers have no separate int type, so use `Math.floor` for whole-number division."] },
        { t: "h", text: "Step 2: One program in all five" },
        { t: "p", text: "Total, average and number of students who passed (40 or more). Switch tabs and compare the lines: you'll see the same steps every time." },
        multi("Total, average and pass count", {
          python: src`
marks = [72, 35, 64, 88, 41]       # 5 students' marks

total = 0                          # running sum, starts at 0
passed = 0                         # how many scored 40 or more
for m in marks:                    # visit every mark
    total = total + m              # add it to the sum
    if m >= 40:                    # did this student pass?
        passed = passed + 1        # count them

average = total // len(marks)      # // = whole-number division
print("Total:", total)
print("Average:", average)
print("Passed:", passed)
`,
          c: src`
#include <stdio.h>

int main(void) {
    int marks[] = {72, 35, 64, 88, 41};   // 5 students' marks
    int n = 5;                            // number of students

    int total = 0;                        // running sum
    int passed = 0;                       // how many scored 40 or more
    for (int i = 0; i < n; i++) {         // visit every mark
        total = total + marks[i];         // add it to the sum
        if (marks[i] >= 40) {             // did this student pass?
            passed = passed + 1;          // count them
        }
    }

    int average = total / n;              // int / int = whole-number division in C
    printf("Total: %d\n", total);
    printf("Average: %d\n", average);
    printf("Passed: %d\n", passed);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> marks = {72, 35, 64, 88, 41};   // 5 students' marks

    int total = 0;                    // running sum
    int passed = 0;                   // how many scored 40 or more
    for (int m : marks) {             // visit every mark
        total = total + m;            // add it to the sum
        if (m >= 40) {                // did this student pass?
            passed = passed + 1;      // count them
        }
    }

    int average = total / (int)marks.size();   // whole-number division
    cout << "Total: " << total << endl;
    cout << "Average: " << average << endl;
    cout << "Passed: " << passed << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] marks = {72, 35, 64, 88, 41};   // 5 students' marks

        int total = 0;                        // running sum
        int passed = 0;                       // how many scored 40 or more
        for (int m : marks) {                 // visit every mark
            total = total + m;                // add it to the sum
            if (m >= 40) {                    // did this student pass?
                passed = passed + 1;          // count them
            }
        }

        int average = total / marks.length;   // int / int = whole-number division
        System.out.println("Total: " + total);
        System.out.println("Average: " + average);
        System.out.println("Passed: " + passed);
    }
}
`,
          javascript: src`
const marks = [72, 35, 64, 88, 41];   // 5 students' marks

let total = 0;                        // running sum
let passed = 0;                       // how many scored 40 or more
for (const m of marks) {              // visit every mark
  total = total + m;                  // add it to the sum
  if (m >= 40) {                      // did this student pass?
    passed = passed + 1;              // count them
  }
}

const average = Math.floor(total / marks.length);   // round down to a whole number
console.log("Total: " + total);
console.log("Average: " + average);
console.log("Passed: " + passed);
`,
        }, "Total: 300\nAverage: 60\nPassed: 4"),
        { t: "h", text: "Step 3: Functions in all five" },
        { t: "p", text: "DSA code is mostly **functions**: give them input, get an answer back. Here's the same `square` function in every language." },
        multi("A function", {
          python: src`
def square(x):          # def = define a function; x is the input
    return x * x        # send the answer back

print(square(7))        # call it with 7
`,
          c: src`
#include <stdio.h>

int square(int x) {     // returns an int, takes an int x
    return x * x;       // send the answer back
}

int main(void) {
    printf("%d\n", square(7));   // call it with 7
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

int square(int x) {     // returns an int, takes an int x
    return x * x;       // send the answer back
}

int main() {
    cout << square(7) << endl;   // call it with 7
    return 0;
}
`,
          java: src`
public class Main {
    static int square(int x) {   // static = can be called from main directly
        return x * x;            // send the answer back
    }

    public static void main(String[] args) {
        System.out.println(square(7));   // call it with 7
    }
}
`,
          javascript: src`
function square(x) {    // x is the input
  return x * x;         // send the answer back
}

console.log(square(7)); // call it with 7
`,
        }, "49"),
        { t: "analogy", text: "The five languages are like five Indian languages describing the same recipe: the words differ (Hindi, Tamil, Bengali…), but the steps (boil water, add rice, wait 15 minutes) are identical. Learn the steps (the algorithm), and translating between languages becomes easy." },
        { t: "trap", text: "Integer division differs: in C, C++ and Java `7 / 2` is `3` when both are ints, but in Python `7 / 2` is `3.5` (use `//`) and in JavaScript it's `3.5` (use `Math.floor`). This causes many beginner bugs in DSA, for example when finding the middle index in binary search." },
        { t: "trick", text: "**Pick ONE main language for practice, but read all five: the idea is what matters.**" },
        { t: "exam", items: ["Which language is best for DSA interviews? (Any of them. Use the one you know best; C++ and Java are common in competitive programming, Python is the shortest.)", "Difference between static typing (C, Java) and dynamic typing (Python, JavaScript)?", "How do you get the length of an array in each language?"] },
        { t: "recap", items: ["All five share variables, if, loops, functions and arrays", "Python: indentation, no types; C, C++, Java: types and braces", "C arrays need a separate length variable n", "Whole-number division: // in Python, Math.floor in JS, / for ints elsewhere"] },
      ],
      quiz: [
        { q: "In Python, 7 // 2 gives…", options: ["3", "3.5", "4", "Error"], answer: 0, explain: "// is whole-number division." },
        { q: "Which language uses indentation instead of { } for blocks?", options: ["Python", "C", "Java", "JavaScript"], answer: 0, explain: "Spaces mark the inside of if, for and def." },
        { q: "How do you get an array's length in Java?", options: ["a.length", "len(a)", "a.size()", "length(a)"], answer: 0, explain: "C++ vectors use a.size(); Python uses len(a)." },
        { q: "Why does C code often keep a separate variable n?", options: ["C arrays don't store their own length", "C requires every variable to be named n", "It makes the code faster", "To print the array"], answer: 0, explain: "You must track the size yourself." },
        { q: "In JavaScript, how do you do whole-number division of 7 by 2?", options: ["Math.floor(7 / 2)", "7 // 2", "7 div 2", "int(7 / 2)"], answer: 0, explain: "JavaScript has no integer division operator." },
      ],
    },
    {
      id: "big-o",
      title: "Time complexity and Big-O",
      oneLine: "Big-O describes how the number of steps grows as the input gets bigger. O(1) stays the same, O(n) grows evenly, O(n²) explodes, and O(log n) barely grows.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Why not just use a stopwatch?" },
        { t: "p", text: "The same program runs faster on a new laptop than on an old phone. So instead of seconds, we count **how many steps** an algorithm takes for an input of size **n**, and how that count **grows** as n grows. That's **time complexity**, written in **Big-O** notation." },
        { t: "h", text: "Step 2: The four shapes you'll meet most" },
        { t: "table", head: ["Big-O", "Name", "Meaning", "Example"], rows: [
          ["**O(1)**", "Constant", "Same steps, however big n is", "Getting `a[5]` from an array"],
          ["**O(log n)**", "Logarithmic", "The problem is **halved** each step", "Binary search; guessing a number 1–100 by halves"],
          ["**O(n)**", "Linear", "One step per item", "Finding the largest number"],
          ["**O(n²)**", "Quadratic", "Every item compared with every item", "Checking all pairs; bubble sort"],
        ] },
        { t: "h", text: "Step 3: Counting the steps yourself" },
        { t: "p", text: "This program counts how many steps each pattern takes when n = 8." },
        multi("Counting steps for n = 8", {
          python: src`
n = 8
print("n =", n)

# O(1): one step, no matter how big n is
steps = 1
print("O(1):", steps)

# O(log n): keep halving n until it reaches 1
steps = 0
i = n
while i > 1:
    i = i // 2          # 8 -> 4 -> 2 -> 1
    steps = steps + 1
print("O(log n):", steps)

# O(n): one step for each item
steps = 0
for i in range(n):
    steps = steps + 1
print("O(n):", steps)

# O(n^2): a loop inside a loop, every item with every item
steps = 0
for i in range(n):
    for j in range(n):
        steps = steps + 1
print("O(n^2):", steps)
`,
          c: src`
#include <stdio.h>

int main(void) {
    int n = 8;
    printf("n = %d\n", n);

    // O(1): one step, no matter how big n is
    int steps = 1;
    printf("O(1): %d\n", steps);

    // O(log n): keep halving until we reach 1
    steps = 0;
    for (int i = n; i > 1; i = i / 2) {   // 8 -> 4 -> 2 -> 1
        steps++;
    }
    printf("O(log n): %d\n", steps);

    // O(n): one step for each item
    steps = 0;
    for (int i = 0; i < n; i++) {
        steps++;
    }
    printf("O(n): %d\n", steps);

    // O(n^2): a loop inside a loop
    steps = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            steps++;
        }
    }
    printf("O(n^2): %d\n", steps);
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

int main() {
    int n = 8;
    cout << "n = " << n << endl;

    // O(1): one step, no matter how big n is
    int steps = 1;
    cout << "O(1): " << steps << endl;

    // O(log n): keep halving until we reach 1
    steps = 0;
    for (int i = n; i > 1; i = i / 2) {   // 8 -> 4 -> 2 -> 1
        steps++;
    }
    cout << "O(log n): " << steps << endl;

    // O(n): one step for each item
    steps = 0;
    for (int i = 0; i < n; i++) steps++;
    cout << "O(n): " << steps << endl;

    // O(n^2): a loop inside a loop
    steps = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            steps++;
    cout << "O(n^2): " << steps << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int n = 8;
        System.out.println("n = " + n);

        // O(1): one step, no matter how big n is
        int steps = 1;
        System.out.println("O(1): " + steps);

        // O(log n): keep halving until we reach 1
        steps = 0;
        for (int i = n; i > 1; i = i / 2) {   // 8 -> 4 -> 2 -> 1
            steps++;
        }
        System.out.println("O(log n): " + steps);

        // O(n): one step for each item
        steps = 0;
        for (int i = 0; i < n; i++) steps++;
        System.out.println("O(n): " + steps);

        // O(n^2): a loop inside a loop
        steps = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                steps++;
        System.out.println("O(n^2): " + steps);
    }
}
`,
          javascript: src`
const n = 8;
console.log("n = " + n);

// O(1): one step, no matter how big n is
let steps = 1;
console.log("O(1): " + steps);

// O(log n): keep halving until we reach 1
steps = 0;
for (let i = n; i > 1; i = Math.floor(i / 2)) {   // 8 -> 4 -> 2 -> 1
  steps++;
}
console.log("O(log n): " + steps);

// O(n): one step for each item
steps = 0;
for (let i = 0; i < n; i++) steps++;
console.log("O(n): " + steps);

// O(n^2): a loop inside a loop
steps = 0;
for (let i = 0; i < n; i++)
  for (let j = 0; j < n; j++)
    steps++;
console.log("O(n^2): " + steps);
`,
        }, "n = 8\nO(1): 1\nO(log n): 3\nO(n): 8\nO(n^2): 64"),
        { t: "h", text: "Step 4: How fast do they grow?" },
        { t: "table", head: ["n", "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"], rows: [
          ["10", "1", "≈3", "10", "≈33", "100", "1,024"],
          ["100", "1", "≈7", "100", "≈664", "10,000", "huge"],
          ["1,000", "1", "≈10", "1,000", "≈9,966", "1,000,000", "impossible"],
          ["1,000,000", "1", "≈20", "1,000,000", "≈20 million", "10¹² (hours)", "impossible"],
        ], caption: "Number of steps. A computer does roughly 10⁸ simple steps per second." },
        { t: "example", title: "How to find the Big-O of code", steps: [
          "One loop over n items → **O(n)**.",
          "A loop inside a loop, both over n → **O(n²)**.",
          "A loop where n is halved (or doubled) each time → **O(log n)**.",
          "Steps one after another: add them, then keep the biggest. O(n) + O(n²) → **O(n²)**.",
          "Drop constants: 3n + 5 steps is still **O(n)**.",
        ], answer: "Look at the loops: how many times does the innermost line run?" },
        { t: "h", text: "Step 5: Space complexity" },
        { t: "p", text: "**Space complexity** is the same idea for **memory**. Finding the largest number uses one extra variable, which is **O(1) space**. Making a copy of the array uses **O(n) space**." },
        { t: "analogy", text: "Searching for a name in a phone book: reading every page is O(n). Opening the middle, deciding left or right half, and repeating is O(log n), so 1,000 pages take only about 10 tries. Same book, a much smarter algorithm." },
        { t: "trap", text: "Big-O ignores constants and small terms: O(2n) is written O(n), and O(n² + n) is written O(n²). It describes how the cost **grows** for big inputs, not the exact number of steps." },
        { t: "trick", text: "**1 < log n < n < n log n < n² < 2ⁿ**: learn this order by heart." },
        { t: "exam", items: ["What is time complexity? What is Big-O?", "What is the complexity of a nested loop over n? (O(n²).)", "Why is binary search O(log n)? (It halves the search space every step.)", "Best, average and worst case?", "What is space complexity?"] },
        { t: "recap", items: ["Big-O = how the steps grow as the input grows", "O(1) constant, O(log n) halving, O(n) one loop, O(n²) nested loops", "Drop constants and keep the biggest term", "Space complexity = extra memory used", "1 < log n < n < n log n < n² < 2ⁿ"] },
      ],
      quiz: [
        { q: "A single loop over n items is…", options: ["O(n)", "O(1)", "O(n²)", "O(log n)"], answer: 0, explain: "One step per item." },
        { q: "Two nested loops, each over n items, are…", options: ["O(n²)", "O(n)", "O(2n)", "O(log n)"], answer: 0, explain: "n × n steps." },
        { q: "An algorithm that halves the problem every step is…", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], answer: 0, explain: "Binary search is the classic example." },
        { q: "O(3n + 10) simplifies to…", options: ["O(n)", "O(3n)", "O(10)", "O(n + 10)"], answer: 0, explain: "Drop constants." },
        { q: "Which grows fastest?", options: ["O(2ⁿ)", "O(n²)", "O(n log n)", "O(n)"], answer: 0, explain: "Exponential is the slowest kind of algorithm." },
      ],
    },
  ],
};

export const DSA02_ARRAYS: LearnModule = {
  id: "arrays",
  title: "Arrays and strings",
  titleHi: "ऐरे और स्ट्रिंग",
  blurb: "Arrays from scratch (insert, delete, search), then the three patterns that solve most array problems: two pointers, sliding window and prefix sums. Plus strings.",
  lessons: [
    {
      id: "array-basics",
      title: "Arrays: traverse, insert, delete, search",
      oneLine: "An array stores items side by side in memory, numbered from 0. Reading by index is instant, O(1), but inserting or deleting in the middle means shifting items, O(n).",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: How an array sits in memory" },
        { t: "diagram", text: "index:    0    1    2    3\n        ┌────┬────┬────┬────┐\nvalue:  │ 10 │ 20 │ 30 │ 40 │\n        └────┴────┴────┴────┘\n          side by side in memory, so a[2] is found instantly" },
        { t: "p", text: "Because items sit next to each other, the computer can jump straight to `a[2]`. That's why **reading by index is O(1)**. But to **insert** in the middle, every item after it must move one place to make room." },
        { t: "h", text: "Step 2: Insert by shifting right" },
        { t: "example", title: "Insert 25 at index 2 in [10, 20, 30, 40]", steps: [
          "Start from the **last** item and move each one a place to the right: 40 moves to index 4.",
          "30 moves to index 3. Now index 2 is free.",
          "Put 25 at index 2 → [10, 20, 25, 30, 40].",
          "Increase the size n from 4 to 5.",
        ], answer: "Shift from the end backwards, otherwise you overwrite items." },
        { t: "h", text: "Step 3: The full program" },
        { t: "p", text: "We use a fixed **capacity** of 10 slots and a variable **n** for how many are used. That's how arrays work in C, and it shows what built-in lists do for you behind the scenes." },
        multi("Insert, delete and search in an array", {
          python: src`
def show(label, a, n):                # print the first n items
    print(label, *a[:n])

def insert(a, n, index, value):       # returns the new size
    for i in range(n, index, -1):     # from the end down to index+1
        a[i] = a[i - 1]               # shift each item one place right
    a[index] = value                  # place the new value in the gap
    return n + 1

def delete(a, n, index):              # returns the new size
    for i in range(index, n - 1):     # from index to the second-last
        a[i] = a[i + 1]               # shift each item one place left
    return n - 1

def search(a, n, target):             # linear search
    for i in range(n):                # check every item
        if a[i] == target:
            return i                  # found: return its index
    return -1                         # not found

a = [0] * 10                          # capacity of 10 slots
a[0], a[1], a[2], a[3] = 10, 20, 30, 40
n = 4                                 # 4 slots used

show("Start:", a, n)
n = insert(a, n, 2, 25)
show("After insert:", a, n)
n = delete(a, n, 0)
show("After delete:", a, n)
print("Index of 30:", search(a, n, 30))
print("Index of 99:", search(a, n, 99))
`,
          c: src`
#include <stdio.h>

void show(const char *label, int a[], int n) {   // print the first n items
    printf("%s", label);
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int insert(int a[], int n, int index, int value) {   // returns the new size
    for (int i = n; i > index; i--) {   // from the end down to index+1
        a[i] = a[i - 1];                // shift each item one place right
    }
    a[index] = value;                   // place the new value in the gap
    return n + 1;
}

int delete_at(int a[], int n, int index) {   // returns the new size
    for (int i = index; i < n - 1; i++) {    // from index to the second-last
        a[i] = a[i + 1];                     // shift each item one place left
    }
    return n - 1;
}

int search(int a[], int n, int target) {     // linear search
    for (int i = 0; i < n; i++) {            // check every item
        if (a[i] == target) return i;        // found: return its index
    }
    return -1;                               // not found
}

int main(void) {
    int a[10] = {10, 20, 30, 40};   // capacity 10, first 4 filled
    int n = 4;                      // 4 slots used

    show("Start:", a, n);
    n = insert(a, n, 2, 25);
    show("After insert:", a, n);
    n = delete_at(a, n, 0);
    show("After delete:", a, n);
    printf("Index of 30: %d\n", search(a, n, 30));
    printf("Index of 99: %d\n", search(a, n, 99));
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

void show(const string& label, int a[], int n) {   // print the first n items
    cout << label;
    for (int i = 0; i < n; i++) cout << " " << a[i];
    cout << endl;
}

int insertAt(int a[], int n, int index, int value) {   // returns the new size
    for (int i = n; i > index; i--) {   // from the end down to index+1
        a[i] = a[i - 1];                // shift each item one place right
    }
    a[index] = value;                   // place the new value in the gap
    return n + 1;
}

int deleteAt(int a[], int n, int index) {   // returns the new size
    for (int i = index; i < n - 1; i++) {   // from index to the second-last
        a[i] = a[i + 1];                    // shift each item one place left
    }
    return n - 1;
}

int search(int a[], int n, int target) {    // linear search
    for (int i = 0; i < n; i++) {
        if (a[i] == target) return i;       // found: return its index
    }
    return -1;                              // not found
}

int main() {
    int a[10] = {10, 20, 30, 40};   // capacity 10, first 4 filled
    int n = 4;

    show("Start:", a, n);
    n = insertAt(a, n, 2, 25);
    show("After insert:", a, n);
    n = deleteAt(a, n, 0);
    show("After delete:", a, n);
    cout << "Index of 30: " << search(a, n, 30) << endl;
    cout << "Index of 99: " << search(a, n, 99) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static void show(String label, int[] a, int n) {   // print the first n items
        StringBuilder sb = new StringBuilder(label);
        for (int i = 0; i < n; i++) sb.append(" ").append(a[i]);
        System.out.println(sb);
    }

    static int insert(int[] a, int n, int index, int value) {   // returns the new size
        for (int i = n; i > index; i--) {   // from the end down to index+1
            a[i] = a[i - 1];                // shift each item one place right
        }
        a[index] = value;                   // place the new value in the gap
        return n + 1;
    }

    static int delete(int[] a, int n, int index) {   // returns the new size
        for (int i = index; i < n - 1; i++) {        // from index to the second-last
            a[i] = a[i + 1];                         // shift each item one place left
        }
        return n - 1;
    }

    static int search(int[] a, int n, int target) {  // linear search
        for (int i = 0; i < n; i++) {
            if (a[i] == target) return i;            // found: return its index
        }
        return -1;                                   // not found
    }

    public static void main(String[] args) {
        int[] a = new int[10];          // capacity of 10 slots
        a[0] = 10; a[1] = 20; a[2] = 30; a[3] = 40;
        int n = 4;                      // 4 slots used

        show("Start:", a, n);
        n = insert(a, n, 2, 25);
        show("After insert:", a, n);
        n = delete(a, n, 0);
        show("After delete:", a, n);
        System.out.println("Index of 30: " + search(a, n, 30));
        System.out.println("Index of 99: " + search(a, n, 99));
    }
}
`,
          javascript: src`
function show(label, a, n) {             // print the first n items
  let line = label;
  for (let i = 0; i < n; i++) line += " " + a[i];
  console.log(line);
}

function insert(a, n, index, value) {    // returns the new size
  for (let i = n; i > index; i--) {      // from the end down to index+1
    a[i] = a[i - 1];                     // shift each item one place right
  }
  a[index] = value;                      // place the new value in the gap
  return n + 1;
}

function remove(a, n, index) {           // returns the new size
  for (let i = index; i < n - 1; i++) {  // from index to the second-last
    a[i] = a[i + 1];                     // shift each item one place left
  }
  return n - 1;
}

function search(a, n, target) {          // linear search
  for (let i = 0; i < n; i++) {
    if (a[i] === target) return i;       // found: return its index
  }
  return -1;                             // not found
}

const a = new Array(10).fill(0);         // capacity of 10 slots
a[0] = 10; a[1] = 20; a[2] = 30; a[3] = 40;
let n = 4;                               // 4 slots used

show("Start:", a, n);
n = insert(a, n, 2, 25);
show("After insert:", a, n);
n = remove(a, n, 0);
show("After delete:", a, n);
console.log("Index of 30: " + search(a, n, 30));
console.log("Index of 99: " + search(a, n, 99));
`,
        }, "Start: 10 20 30 40\nAfter insert: 10 20 25 30 40\nAfter delete: 20 25 30 40\nIndex of 30: 2\nIndex of 99: -1"),
        { t: "table", head: ["Operation", "Time", "Why"], rows: [
          ["Read / write `a[i]`", "**O(1)**", "Jump straight to the slot"],
          ["Insert / delete at the **end**", "**O(1)**", "Nothing needs to move"],
          ["Insert / delete in the **middle**", "**O(n)**", "Items after it must shift"],
          ["Search (unsorted)", "**O(n)**", "Might have to check every item"],
        ] },
        { t: "analogy", text: "An array is a row of numbered seats in a cinema. Finding seat 7 is instant. But if someone wants to sit at seat 3 in a full row, everyone from seat 3 onwards must shift one seat to the right." },
        { t: "trap", text: "When inserting, shift from the **end** backwards (`i = n` down to `index + 1`). If you shift from the front, you copy the same value into every slot. When deleting, shift from the **front** forwards. And never go past the capacity: in C, writing beyond `a[9]` corrupts memory." },
        { t: "trick", text: "**Insert: shift right, start at the end. Delete: shift left, start at the gap.**" },
        { t: "exam", items: ["Why is array access O(1)?", "Time complexity of insertion in the middle of an array? (O(n).)", "Implement linear search.", "Difference between an array and a linked list? (Next module.)", "Static vs dynamic arrays? (Python lists, C++ vectors and Java ArrayLists grow automatically.)"] },
        { t: "recap", items: ["Arrays store items side by side; indexes start at 0", "Read by index: O(1)", "Insert or delete in the middle: shift items, O(n)", "Linear search checks each item: O(n)", "Built-in lists (Python list, vector, ArrayList, JS array) do this shifting for you"] },
      ],
      quiz: [
        { q: "What is the time complexity of reading a[i]?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explain: "The address is calculated directly." },
        { q: "Inserting at index 0 of an array with n items takes…", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], answer: 0, explain: "All n items shift right." },
        { q: "When inserting, you should shift items starting from…", options: ["The end of the array", "Index 0", "The middle", "It doesn't matter"], answer: 0, explain: "Otherwise you overwrite values." },
        { q: "Linear search returns -1 when…", options: ["The target isn't in the array", "The target is the first element", "The array is sorted", "Always"], answer: 0, explain: "-1 is the usual \"not found\" signal." },
        { q: "After deleting index 0 from [20, 25, 30, 40]…", options: ["[25, 30, 40]", "[20, 25, 30]", "[0, 25, 30, 40]", "[20, 30, 40]"], answer: 0, explain: "Everything shifts one place left." },
      ],
    },
    {
      id: "two-pointers",
      title: "Two pointers",
      oneLine: "Use two index variables that move towards each other (or together) to solve array problems in one pass, O(n), instead of checking every pair, O(n²).",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "p", text: "Put one pointer (`left`) at the start and one (`right`) at the end. Look at the two items, decide something, then move one or both pointers inwards. Stop when they meet." },
        { t: "diagram", text: "  [ 1   2   3   4   5 ]\n    ↑               ↑\n   left           right   → swap, then left++, right--" },
        { t: "h", text: "Step 2: Problem 1: reverse an array in place" },
        multi("Reverse an array with two pointers", {
          python: src`
a = [1, 2, 3, 4, 5]

left = 0                    # first index
right = len(a) - 1          # last index
while left < right:         # until the pointers meet in the middle
    a[left], a[right] = a[right], a[left]   # swap the two ends
    left = left + 1         # move inwards
    right = right - 1

print(*a)                   # * prints the items separated by spaces
`,
          c: src`
#include <stdio.h>

int main(void) {
    int a[] = {1, 2, 3, 4, 5};
    int n = 5;

    int left = 0;               // first index
    int right = n - 1;          // last index
    while (left < right) {      // until the pointers meet
        int temp = a[left];     // swap needs a temporary box in C
        a[left] = a[right];
        a[right] = temp;
        left++;                 // move inwards
        right--;
    }

    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 3, 4, 5};

    int left = 0;                     // first index
    int right = (int)a.size() - 1;    // last index
    while (left < right) {            // until the pointers meet
        swap(a[left], a[right]);      // C++ has a built-in swap
        left++;                       // move inwards
        right--;
    }

    for (int x : a) cout << x << " ";
    cout << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5};

        int left = 0;                 // first index
        int right = a.length - 1;     // last index
        while (left < right) {        // until the pointers meet
            int temp = a[left];       // swap using a temporary variable
            a[left] = a[right];
            a[right] = temp;
            left++;                   // move inwards
            right--;
        }

        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(x).append(" ");
        System.out.println(sb.toString().trim());
    }
}
`,
          javascript: src`
const a = [1, 2, 3, 4, 5];

let left = 0;                  // first index
let right = a.length - 1;      // last index
while (left < right) {         // until the pointers meet
  const temp = a[left];        // swap using a temporary variable
  a[left] = a[right];
  a[right] = temp;
  left++;                      // move inwards
  right--;
}

console.log(a.join(" "));
`,
        }, "5 4 3 2 1"),
        { t: "table", head: ["Round", "left", "right", "Swap", "Array after"], rows: [
          ["1", "0", "4", "1 ↔ 5", "5 2 3 4 1"],
          ["2", "1", "3", "2 ↔ 4", "5 4 3 2 1"],
          ["3", "2", "2", "left < right is false → stop", "5 4 3 2 1"],
        ], caption: "Only n/2 swaps: O(n) time, O(1) extra space" },
        { t: "h", text: "Step 3: Problem 2: pair with a given sum (sorted array)" },
        { t: "p", text: "Find two numbers in a **sorted** array that add up to a target. Checking every pair is O(n²). With two pointers: if the sum is **too small**, move `left` right (bigger numbers); if it's **too big**, move `right` left (smaller numbers)." },
        multi("Pair with target sum", {
          python: src`
a = [1, 3, 4, 6, 8, 11]      # must be sorted
target = 10

left, right = 0, len(a) - 1
while left < right:
    s = a[left] + a[right]   # sum of the two ends
    if s == target:          # found it
        print("Pair found:", a[left], "+", a[right], "=", target)
        break
    elif s < target:         # too small: need a bigger number
        left = left + 1
    else:                    # too big: need a smaller number
        right = right - 1
`,
          c: src`
#include <stdio.h>

int main(void) {
    int a[] = {1, 3, 4, 6, 8, 11};   // must be sorted
    int n = 6, target = 10;

    int left = 0, right = n - 1;
    while (left < right) {
        int s = a[left] + a[right];      // sum of the two ends
        if (s == target) {               // found it
            printf("Pair found: %d + %d = %d\n", a[left], a[right], target);
            break;
        } else if (s < target) {         // too small: need a bigger number
            left++;
        } else {                         // too big: need a smaller number
            right--;
        }
    }
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 3, 4, 6, 8, 11};   // must be sorted
    int target = 10;

    int left = 0, right = (int)a.size() - 1;
    while (left < right) {
        int s = a[left] + a[right];        // sum of the two ends
        if (s == target) {                 // found it
            cout << "Pair found: " << a[left] << " + " << a[right] << " = " << target << endl;
            break;
        } else if (s < target) {           // too small: move left forward
            left++;
        } else {                           // too big: move right back
            right--;
        }
    }
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] a = {1, 3, 4, 6, 8, 11};   // must be sorted
        int target = 10;

        int left = 0, right = a.length - 1;
        while (left < right) {
            int s = a[left] + a[right];      // sum of the two ends
            if (s == target) {               // found it
                System.out.println("Pair found: " + a[left] + " + " + a[right] + " = " + target);
                break;
            } else if (s < target) {         // too small
                left++;
            } else {                         // too big
                right--;
            }
        }
    }
}
`,
          javascript: src`
const a = [1, 3, 4, 6, 8, 11];   // must be sorted
const target = 10;

let left = 0, right = a.length - 1;
while (left < right) {
  const s = a[left] + a[right];  // sum of the two ends
  if (s === target) {            // found it
    console.log("Pair found: " + a[left] + " + " + a[right] + " = " + target);
    break;
  } else if (s < target) {       // too small: need a bigger number
    left++;
  } else {                       // too big: need a smaller number
    right--;
  }
}
`,
        }, "Pair found: 4 + 6 = 10"),
        { t: "table", head: ["left (value)", "right (value)", "Sum", "Decision"], rows: [
          ["0 (1)", "5 (11)", "12", "Too big → right--"],
          ["0 (1)", "4 (8)", "9", "Too small → left++"],
          ["1 (3)", "4 (8)", "11", "Too big → right--"],
          ["1 (3)", "3 (6)", "9", "Too small → left++"],
          ["2 (4)", "3 (6)", "**10**", "**Found!**"],
        ] },
        { t: "analogy", text: "Two friends search a sorted bookshelf from opposite ends. If the combined price is too high, the friend at the expensive end steps towards the cheaper books; if it's too low, the friend at the cheap end steps the other way. They never need to try every combination." },
        { t: "trap", text: "The pair-sum trick only works on a **sorted** array: the logic \"too small → move left\" relies on the order. For an unsorted array, sort it first (O(n log n)) or use a hash map (Hashing module)." },
        { t: "trick", text: "**Too small → left++. Too big → right--.**" },
        { t: "exam", items: ["Reverse an array in place.", "Two-sum on a sorted array (O(n), O(1) space).", "Remove duplicates from a sorted array.", "Check if a string is a palindrome (two pointers on characters).", "Move all zeros to the end."] },
        { t: "recap", items: ["Two pointers: left at the start, right at the end, move inwards", "Reverse: swap the ends, move both", "Pair sum (sorted): sum too small → left++, too big → right--", "O(n) time, O(1) space instead of O(n²)"] },
      ],
      quiz: [
        { q: "Reversing an array with two pointers takes…", options: ["O(n) time", "O(n²) time", "O(log n) time", "O(1) time"], answer: 0, explain: "About n/2 swaps." },
        { q: "In the pair-sum problem, if the sum is too small you…", options: ["Move left forward", "Move right back", "Move both", "Stop"], answer: 0, explain: "You need a bigger number." },
        { q: "The two-pointer pair-sum method requires the array to be…", options: ["Sorted", "Reversed", "Small", "Unique"], answer: 0, explain: "The direction logic depends on order." },
        { q: "When does the reverse loop stop?", options: ["When left >= right", "When left = 0", "After n swaps", "Never"], answer: 0, explain: "The pointers meet in the middle." },
      ],
    },
    {
      id: "sliding-window",
      title: "Sliding window",
      oneLine: "To look at every group of k items in a row, don't re-add everything each time. Slide a window: add the new item coming in and subtract the item going out. O(n) instead of O(n·k).",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: The problem" },
        { t: "p", text: "Given daily sales `[2, 1, 5, 1, 3, 2]`, find the **best total of 3 days in a row**. The windows are: 2+1+5, 1+5+1, 5+1+3 and 1+3+2." },
        { t: "h", text: "Step 2: The slow way (brute force)" },
        multi("Brute force: re-add every window", {
          python: src`
a = [2, 1, 5, 1, 3, 2]
k = 3

best = 0
for start in range(len(a) - k + 1):     # every possible starting day
    total = 0
    for i in range(start, start + k):   # add the k days of this window
        total = total + a[i]
    best = max(best, total)

print("Max sum of 3 in a row:", best)
`,
          c: src`
#include <stdio.h>

int main(void) {
    int a[] = {2, 1, 5, 1, 3, 2};
    int n = 6, k = 3;

    int best = 0;
    for (int start = 0; start <= n - k; start++) {   // every starting day
        int total = 0;
        for (int i = start; i < start + k; i++) {     // add the k days
            total += a[i];
        }
        if (total > best) best = total;
    }

    printf("Max sum of 3 in a row: %d\n", best);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {2, 1, 5, 1, 3, 2};
    int n = a.size(), k = 3;

    int best = 0;
    for (int start = 0; start <= n - k; start++) {   // every starting day
        int total = 0;
        for (int i = start; i < start + k; i++) total += a[i];   // add k days
        best = max(best, total);
    }

    cout << "Max sum of 3 in a row: " << best << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] a = {2, 1, 5, 1, 3, 2};
        int k = 3;

        int best = 0;
        for (int start = 0; start <= a.length - k; start++) {   // every starting day
            int total = 0;
            for (int i = start; i < start + k; i++) total += a[i];   // add k days
            best = Math.max(best, total);
        }

        System.out.println("Max sum of 3 in a row: " + best);
    }
}
`,
          javascript: src`
const a = [2, 1, 5, 1, 3, 2];
const k = 3;

let best = 0;
for (let start = 0; start <= a.length - k; start++) {   // every starting day
  let total = 0;
  for (let i = start; i < start + k; i++) total += a[i]; // add the k days
  best = Math.max(best, total);
}

console.log("Max sum of 3 in a row: " + best);
`,
        }, "Max sum of 3 in a row: 9", "This adds k numbers for every window: O(n·k). For 1 lakh days and k = 1,000 that's 10 crore additions."),
        { t: "h", text: "Step 3: The fast way: slide the window" },
        { t: "diagram", text: "  [2  1  5] 1  3  2     sum = 8\n   2 [1  5  1] 3  2     sum = 8 − 2 + 1 = 7   (2 leaves, 1 enters)\n   2  1 [5  1  3] 2     sum = 7 − 1 + 3 = 9\n   2  1  5 [1  3  2]    sum = 9 − 5 + 2 = 6" },
        multi("Sliding window", {
          python: src`
a = [2, 1, 5, 1, 3, 2]
k = 3

window = sum(a[:k])          # sum of the first window: 2 + 1 + 5 = 8
best = window
for i in range(k, len(a)):   # i = the index of the item ENTERING the window
    window = window + a[i] - a[i - k]   # add the new item, remove the one leaving
    best = max(best, window)

print("Max sum of 3 in a row:", best)
`,
          c: src`
#include <stdio.h>

int main(void) {
    int a[] = {2, 1, 5, 1, 3, 2};
    int n = 6, k = 3;

    int window = 0;
    for (int i = 0; i < k; i++) window += a[i];   // first window: 8
    int best = window;

    for (int i = k; i < n; i++) {          // i = item entering the window
        window += a[i] - a[i - k];         // add new item, remove the leaving one
        if (window > best) best = window;
    }

    printf("Max sum of 3 in a row: %d\n", best);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> a = {2, 1, 5, 1, 3, 2};
    int n = a.size(), k = 3;

    int window = 0;
    for (int i = 0; i < k; i++) window += a[i];   // first window: 8
    int best = window;

    for (int i = k; i < n; i++) {          // i = item entering the window
        window += a[i] - a[i - k];         // add new, remove leaving
        best = max(best, window);
    }

    cout << "Max sum of 3 in a row: " << best << endl;
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        int[] a = {2, 1, 5, 1, 3, 2};
        int k = 3;

        int window = 0;
        for (int i = 0; i < k; i++) window += a[i];   // first window: 8
        int best = window;

        for (int i = k; i < a.length; i++) {   // i = item entering the window
            window += a[i] - a[i - k];         // add new, remove leaving
            best = Math.max(best, window);
        }

        System.out.println("Max sum of 3 in a row: " + best);
    }
}
`,
          javascript: src`
const a = [2, 1, 5, 1, 3, 2];
const k = 3;

let window = 0;
for (let i = 0; i < k; i++) window += a[i];   // first window: 8
let best = window;

for (let i = k; i < a.length; i++) {  // i = item entering the window
  window += a[i] - a[i - k];          // add new item, remove the leaving one
  best = Math.max(best, window);
}

console.log("Max sum of 3 in a row: " + best);
`,
        }, "Max sum of 3 in a row: 9"),
        { t: "table", head: ["i (entering)", "a[i] in", "a[i−k] out", "window", "best"], rows: [
          ["start", "–", "–", "8", "8"],
          ["3", "1", "2", "8 + 1 − 2 = 7", "8"],
          ["4", "3", "1", "7 + 3 − 1 = 9", "**9**"],
          ["5", "2", "5", "9 + 2 − 5 = 6", "9"],
        ] },
        { t: "analogy", text: "A train window moving along a platform: as it moves one step, one person leaves the view on the left and one new person appears on the right. You don't recount everyone; you just adjust for the one who left and the one who arrived." },
        { t: "trap", text: "Use the right indexes: when `i` enters, the item leaving is `a[i − k]`, not `a[i − k + 1]`. Check with a dry run. Also start `best` from the first window's sum, not 0, if numbers can be negative." },
        { t: "trick", text: "**New sum = old sum + incoming − outgoing.**" },
        { t: "exam", items: ["Maximum sum subarray of size k.", "Longest substring without repeating characters (a variable-size window).", "Smallest subarray with sum ≥ target.", "Brute force vs sliding window complexity? (O(n·k) vs O(n).)"] },
        { t: "recap", items: ["A window = k consecutive items", "Compute the first window once", "Slide: add a[i], subtract a[i − k]", "O(n) instead of O(n·k)"] },
      ],
      quiz: [
        { q: "When the window slides one step right, you…", options: ["Add the new item and subtract the item that left", "Re-add all k items", "Multiply by k", "Sort the window"], answer: 0, explain: "That's what makes it O(n)." },
        { q: "Sliding window time complexity is…", options: ["O(n)", "O(n·k)", "O(n²)", "O(k)"], answer: 0, explain: "Each item enters and leaves once." },
        { q: "For a = [2, 1, 5, 1, 3, 2] and k = 3, the first window sum is…", options: ["8", "7", "9", "6"], answer: 0, explain: "2 + 1 + 5." },
        { q: "When index i enters a window of size k, which index leaves?", options: ["i − k", "i − 1", "i + k", "0"], answer: 0, explain: "The window covers i−k+1 … i." },
      ],
    },
    {
      id: "prefix-sums",
      title: "Prefix sums",
      oneLine: "Precompute running totals once, O(n). Then the sum of any range a[l..r] is just prefix[r+1] − prefix[l], O(1) per question.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: The problem" },
        { t: "p", text: "You're asked many questions like \"what's the sum from index 1 to 3?\" and \"from 2 to 5?\". Adding up the range each time is O(n) per question. With thousands of questions that's slow." },
        { t: "h", text: "Step 2: Build running totals" },
        { t: "diagram", text: "index:      0   1   2   3   4   5\na:          3   1   4   1   5   9\n\nprefix: 0   3   4   8   9  14  23\n        ↑ prefix[i] = sum of the first i items (prefix[0] = 0)" },
        { t: "example", title: "Sum of a[1..3] = 1 + 4 + 1", steps: [
          "prefix[4] = sum of the first 4 items = 3 + 1 + 4 + 1 = 9.",
          "prefix[1] = sum of the first 1 item = 3.",
          "Remove the part before index 1: 9 − 3 = **6**.",
          "Check: 1 + 4 + 1 = 6 ✓",
        ], answer: "sum(l..r) = prefix[r + 1] − prefix[l]" },
        multi("Prefix sums with range queries", {
          python: src`
a = [3, 1, 4, 1, 5, 9]

prefix = [0] * (len(a) + 1)              # one extra slot for prefix[0] = 0
for i in range(len(a)):
    prefix[i + 1] = prefix[i] + a[i]     # running total

def range_sum(l, r):                     # sum of a[l..r], inclusive
    return prefix[r + 1] - prefix[l]

print("Prefix:", *prefix)
print("Sum of [1..3] =", range_sum(1, 3))
print("Sum of [2..5] =", range_sum(2, 5))
`,
          c: src`
#include <stdio.h>

int prefix[7];   // n + 1 slots

int range_sum(int l, int r) {          // sum of a[l..r], inclusive
    return prefix[r + 1] - prefix[l];
}

int main(void) {
    int a[] = {3, 1, 4, 1, 5, 9};
    int n = 6;

    prefix[0] = 0;
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + a[i];   // running total
    }

    printf("Prefix:");
    for (int i = 0; i <= n; i++) printf(" %d", prefix[i]);
    printf("\n");
    printf("Sum of [1..3] = %d\n", range_sum(1, 3));
    printf("Sum of [2..5] = %d\n", range_sum(2, 5));
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9};
    int n = a.size();

    vector<int> prefix(n + 1, 0);          // n + 1 slots, all 0
    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + a[i];  // running total
    }

    auto rangeSum = [&](int l, int r) {    // sum of a[l..r], inclusive
        return prefix[r + 1] - prefix[l];
    };

    cout << "Prefix:";
    for (int p : prefix) cout << " " << p;
    cout << endl;
    cout << "Sum of [1..3] = " << rangeSum(1, 3) << endl;
    cout << "Sum of [2..5] = " << rangeSum(2, 5) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static int[] prefix;

    static int rangeSum(int l, int r) {    // sum of a[l..r], inclusive
        return prefix[r + 1] - prefix[l];
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9};
        int n = a.length;

        prefix = new int[n + 1];           // n + 1 slots, all 0
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + a[i];   // running total
        }

        StringBuilder sb = new StringBuilder("Prefix:");
        for (int p : prefix) sb.append(" ").append(p);
        System.out.println(sb);
        System.out.println("Sum of [1..3] = " + rangeSum(1, 3));
        System.out.println("Sum of [2..5] = " + rangeSum(2, 5));
    }
}
`,
          javascript: src`
const a = [3, 1, 4, 1, 5, 9];

const prefix = new Array(a.length + 1).fill(0);   // one extra slot
for (let i = 0; i < a.length; i++) {
  prefix[i + 1] = prefix[i] + a[i];               // running total
}

function rangeSum(l, r) {                         // sum of a[l..r], inclusive
  return prefix[r + 1] - prefix[l];
}

console.log("Prefix: " + prefix.join(" "));
console.log("Sum of [1..3] = " + rangeSum(1, 3));
console.log("Sum of [2..5] = " + rangeSum(2, 5));
`,
        }, "Prefix: 0 3 4 8 9 14 23\nSum of [1..3] = 6\nSum of [2..5] = 19"),
        { t: "analogy", text: "Prefix sums are like the odometer in a car. To know how far you drove between Patna and Gaya, you don't measure the road again; you subtract the odometer reading at Patna from the reading at Gaya." },
        { t: "trap", text: "Off-by-one errors are the classic bug here. Using an extra slot `prefix[0] = 0` makes the formula clean: `prefix[r + 1] − prefix[l]`. Always test with a tiny example by hand." },
        { t: "trick", text: "**Build once in O(n), answer every range in O(1).**" },
        { t: "exam", items: ["Range sum queries.", "Subarray sum equals k (prefix sums + a hash map).", "Find the equilibrium index (left sum = right sum).", "Why prefix sums? (O(1) per query after O(n) setup.)"] },
        { t: "recap", items: ["prefix[0] = 0; prefix[i + 1] = prefix[i] + a[i]", "sum(l..r) = prefix[r + 1] − prefix[l]", "Setup O(n), each query O(1)", "Dry-run small examples to avoid off-by-one bugs"] },
      ],
      quiz: [
        { q: "With prefix sums, each range-sum query takes…", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explain: "Just one subtraction." },
        { q: "For a = [3, 1, 4], prefix is…", options: ["[0, 3, 4, 8]", "[3, 4, 8]", "[3, 1, 4]", "[0, 3, 1, 4]"], answer: 0, explain: "Running totals with a leading 0." },
        { q: "sum(l..r) using our prefix array is…", options: ["prefix[r + 1] − prefix[l]", "prefix[r] − prefix[l]", "prefix[r] + prefix[l]", "prefix[l] − prefix[r]"], answer: 0, explain: "The total up to r minus the total before l." },
        { q: "Building the prefix array takes…", options: ["O(n)", "O(1)", "O(n²)", "O(log n)"], answer: 0, explain: "One pass over the array." },
      ],
    },
    {
      id: "strings",
      title: "Strings: reverse, palindrome, counting",
      oneLine: "A string is an array of characters, so array techniques work on strings too: two pointers for reversing and palindromes, and a count array for character frequency.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: A string is an array of characters" },
        { t: "diagram", text: "index:   0   1   2   3   4\n        'h' 'e' 'l' 'l' 'o'\n\n  s[0] = 'h'    length = 5" },
        { t: "table", head: ["Language", "Get a character", "Length", "Can you change s[0] directly?"], rows: [
          ["Python", "`s[0]`", "`len(s)`", "No (strings are immutable; use a list)"],
          ["C", "`s[0]`", "`strlen(s)`", "Yes (a char array)"],
          ["C++", "`s[0]`", "`s.size()`", "Yes (std::string)"],
          ["Java", "`s.charAt(0)`", "`s.length()`", "No (use a char[] array)"],
          ["JavaScript", "`s[0]`", "`s.length`", "No (split into an array)"],
        ] },
        { t: "h", text: "Step 2: Reverse, palindrome and vowels" },
        { t: "p", text: "A **palindrome** reads the same forwards and backwards (madam, level, racecar). Two pointers check it: compare the first and last characters, then move inwards." },
        multi("Reverse, palindrome check, vowel count", {
          python: src`
def reverse(s):
    chars = list(s)                    # strings can't change, so use a list
    left, right = 0, len(chars) - 1
    while left < right:                # two pointers, like arrays
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return "".join(chars)              # list back to a string

def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:        # a mismatch means not a palindrome
            return False
        left += 1
        right -= 1
    return True                        # every pair matched

def count_vowels(s):
    count = 0
    for ch in s:
        if ch in "aeiou":              # is this character a vowel?
            count += 1
    return count

print("Reversed:", reverse("hello"))
print("madam is a palindrome:", "true" if is_palindrome("madam") else "false")
print("hello is a palindrome:", "true" if is_palindrome("hello") else "false")
print("Vowels in programming:", count_vowels("programming"))
`,
          c: src`
#include <stdio.h>
#include <string.h>

void reverse(char s[]) {                 // changes s in place
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        char temp = s[left];             // swap two characters
        s[left] = s[right];
        s[right] = temp;
        left++;
        right--;
    }
}

int is_palindrome(const char s[]) {      // 1 = yes, 0 = no
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        if (s[left] != s[right]) return 0;   // mismatch
        left++;
        right--;
    }
    return 1;
}

int count_vowels(const char s[]) {
    int count = 0;
    for (int i = 0; s[i] != '\0'; i++) {     // '\0' marks the end of a C string
        if (strchr("aeiou", s[i])) count++;  // is s[i] one of the vowels?
    }
    return count;
}

int main(void) {
    char word[] = "hello";               // a char array we're allowed to change
    reverse(word);
    printf("Reversed: %s\n", word);
    printf("madam is a palindrome: %s\n", is_palindrome("madam") ? "true" : "false");
    printf("hello is a palindrome: %s\n", is_palindrome("hello") ? "true" : "false");
    printf("Vowels in programming: %d\n", count_vowels("programming"));
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
using namespace std;

string reverseStr(string s) {           // works on a copy
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        swap(s[left], s[right]);        // std::string characters can change
        left++;
        right--;
    }
    return s;
}

bool isPalindrome(const string& s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;   // mismatch
        left++;
        right--;
    }
    return true;
}

int countVowels(const string& s) {
    int count = 0;
    for (char ch : s) {
        if (string("aeiou").find(ch) != string::npos) count++;   // found in "aeiou"?
    }
    return count;
}

int main() {
    cout << "Reversed: " << reverseStr("hello") << endl;
    cout << "madam is a palindrome: " << (isPalindrome("madam") ? "true" : "false") << endl;
    cout << "hello is a palindrome: " << (isPalindrome("hello") ? "true" : "false") << endl;
    cout << "Vowels in programming: " << countVowels("programming") << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static String reverse(String s) {
        char[] chars = s.toCharArray();      // Strings can't change, so use a char[]
        int left = 0, right = chars.length - 1;
        while (left < right) {
            char temp = chars[left];         // swap two characters
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;   // mismatch
            left++;
            right--;
        }
        return true;
    }

    static int countVowels(String s) {
        int count = 0;
        for (char ch : s.toCharArray()) {
            if ("aeiou".indexOf(ch) >= 0) count++;   // found in "aeiou"?
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println("Reversed: " + reverse("hello"));
        System.out.println("madam is a palindrome: " + isPalindrome("madam"));
        System.out.println("hello is a palindrome: " + isPalindrome("hello"));
        System.out.println("Vowels in programming: " + countVowels("programming"));
    }
}
`,
          javascript: src`
function reverse(s) {
  const chars = s.split("");           // strings can't change, so use an array
  let left = 0, right = chars.length - 1;
  while (left < right) {
    const temp = chars[left];          // swap two characters
    chars[left] = chars[right];
    chars[right] = temp;
    left++;
    right--;
  }
  return chars.join("");               // array back to a string
}

function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;   // mismatch
    left++;
    right--;
  }
  return true;
}

function countVowels(s) {
  let count = 0;
  for (const ch of s) {
    if ("aeiou".includes(ch)) count++;  // is it a vowel?
  }
  return count;
}

console.log("Reversed: " + reverse("hello"));
console.log("madam is a palindrome: " + isPalindrome("madam"));
console.log("hello is a palindrome: " + isPalindrome("hello"));
console.log("Vowels in programming: " + countVowels("programming"));
`,
        }, "Reversed: olleh\nmadam is a palindrome: true\nhello is a palindrome: false\nVowels in programming: 3"),
        { t: "h", text: "Step 3: Counting characters with a frequency array" },
        { t: "p", text: "To count how often each letter appears, use an array of 26 counters, one per letter. The trick: `ch − 'a'` turns a letter into its position: 'a' → 0, 'b' → 1, … 'z' → 25." },
        multi("Character frequency", {
          python: src`
word = "banana"
count = [0] * 26                        # one counter per letter a..z

for ch in word:
    count[ord(ch) - ord("a")] += 1      # ord('b') - ord('a') = 1

for i in range(26):
    if count[i] > 0:                    # only print letters that appear
        print(chr(i + ord("a")) + ":", count[i])
`,
          c: src`
#include <stdio.h>

int main(void) {
    const char *word = "banana";
    int count[26] = {0};                 // one counter per letter a..z

    for (int i = 0; word[i] != '\0'; i++) {
        count[word[i] - 'a']++;          // 'b' - 'a' = 1
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] > 0) {              // only letters that appear
            printf("%c: %d\n", 'a' + i, count[i]);
        }
    }
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
using namespace std;

int main() {
    string word = "banana";
    int count[26] = {0};                 // one counter per letter a..z

    for (char ch : word) {
        count[ch - 'a']++;               // 'b' - 'a' = 1
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] > 0) {              // only letters that appear
            cout << (char)('a' + i) << ": " << count[i] << endl;
        }
    }
    return 0;
}
`,
          java: src`
public class Main {
    public static void main(String[] args) {
        String word = "banana";
        int[] count = new int[26];           // one counter per letter a..z

        for (char ch : word.toCharArray()) {
            count[ch - 'a']++;               // 'b' - 'a' = 1
        }

        for (int i = 0; i < 26; i++) {
            if (count[i] > 0) {              // only letters that appear
                System.out.println((char) ('a' + i) + ": " + count[i]);
            }
        }
    }
}
`,
          javascript: src`
const word = "banana";
const count = new Array(26).fill(0);              // one counter per letter

for (const ch of word) {
  count[ch.charCodeAt(0) - "a".charCodeAt(0)]++; // 'b' -> 1
}

for (let i = 0; i < 26; i++) {
  if (count[i] > 0) {                             // only letters that appear
    console.log(String.fromCharCode(97 + i) + ": " + count[i]);
  }
}
`,
        }, "a: 3\nb: 1\nn: 2"),
        { t: "analogy", text: "The frequency array is like 26 labelled boxes, one for each letter. You read the word letter by letter and drop a token into the matching box. At the end, count the tokens in each box." },
        { t: "trap", text: "In Python, Java and JavaScript, strings are **immutable**: `s[0] = 'x'` doesn't work. Convert to a list or array first. In C, a string ends with an invisible `'\\0'` character, so loop until you reach it (or use strlen)." },
        { t: "trick", text: "**Letter → index: ch − 'a'. Index → letter: 'a' + i.**" },
        { t: "exam", items: ["Reverse a string.", "Check if a string is a palindrome.", "Check if two strings are anagrams (same letter counts).", "Find the first non-repeating character.", "Count vowels and consonants."] },
        { t: "recap", items: ["A string is an array of characters", "Reverse and palindrome: two pointers", "Frequency: an array of 26 counters, index = ch − 'a'", "Python, Java and JS strings are immutable; C strings end with '\\0'"] },
      ],
      quiz: [
        { q: "Which word is a palindrome?", options: ["level", "hello", "world", "react"], answer: 0, explain: "It reads the same backwards." },
        { q: "What is 'c' − 'a'?", options: ["2", "3", "1", "99"], answer: 0, explain: "a → 0, b → 1, c → 2." },
        { q: "How many counters do you need to count lowercase letters?", options: ["26", "10", "52", "256"], answer: 0, explain: "One per letter a–z." },
        { q: "Two strings are anagrams when…", options: ["They have the same letter counts", "They have the same length only", "One is the reverse of the other", "They start with the same letter"], answer: 0, explain: "Like listen and silent." },
        { q: "What marks the end of a string in C?", options: ["'\\0'", "'\\n'", "-1", "The length"], answer: 0, explain: "The null character." },
      ],
    },
  ],
};
