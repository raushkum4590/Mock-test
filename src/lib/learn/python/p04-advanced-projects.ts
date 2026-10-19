import type { LearnModule } from "../types";
import { py, src } from "./helpers";

/** Python modules 12–14: advanced features, projects, and getting job-ready. */
export const PY12_ADVANCED: LearnModule = {
  id: "advanced",
  title: "Advanced Python",
  titleHi: "एडवांस पाइथन",
  blurb: "The features interviewers love: iterators and generators, closures and decorators, type hints, context managers and the walrus operator.",
  lessons: [
    {
      id: "generators",
      title: "Iterators and generators",
      oneLine: "An iterator hands out items one at a time with next(). A generator is a function that uses yield to produce values lazily, one by one, so it can handle huge or even endless data using almost no memory.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: What a for loop really does" },
        py("iter and next", src`
nums = [10, 20, 30]
it = iter(nums)            # get an iterator from the list
print(next(it))            # hand out the next item
print(next(it))
print(next(it))
try:
    next(it)               # nothing left
except StopIteration:
    print("No more items")  # a for loop stops when it sees StopIteration
`, "10\n20\n30\nNo more items"),
        { t: "h", text: "Step 2: Generators with yield" },
        py("A generator function", src`
def count_up_to(n):
    i = 1
    while i <= n:
        yield i            # hand out i and PAUSE here until the next request
        i += 1

gen = count_up_to(3)       # nothing runs yet
print(next(gen))           # runs until the first yield
print(list(gen))           # the rest

for x in count_up_to(4):   # generators work in for loops
    print(x, end=" ")
print()
`, "1\n[2, 3]\n1 2 3 4"),
        { t: "table", head: ["", "return", "yield"], rows: [["Gives back", "One value, then the function ends", "A value, then pauses (keeps its variables)"], ["Calling the function", "Runs the body", "Creates a generator; the body runs on next()"], ["Memory", "Builds the whole result", "One item at a time"]] },
        py("Lazy = tiny memory", src`
import sys

big_list = [n * n for n in range(1_000_000)]   # all 1,000,000 values stored
big_gen = (n * n for n in range(1_000_000))    # a recipe; values made on demand
print(sys.getsizeof(big_list) > 1_000_000)     # about 8 MB for the list itself
print(sys.getsizeof(big_gen) < 1_000)          # about 200 bytes
print(sum(big_gen))
`, "True\nTrue\n333332833333500000"),
        py("An endless generator", src`
def fibonacci():
    a, b = 0, 1
    while True:                # endless is fine: values are made only when asked
        yield a
        a, b = b, a + b

for i, f in enumerate(fibonacci()):
    if i == 10:
        break
    print(f, end=" ")
print()
`, "0 1 1 2 3 5 8 13 21 34"),
        py("A processing pipeline", src`
log = ["INFO start", "ERROR disk full", "INFO ok", "ERROR timeout"]

errors = (line for line in log if line.startswith("ERROR"))   # step 1: filter
messages = (line.split(" ", 1)[1] for line in errors)         # step 2: transform
print(list(messages))                                          # nothing runs until here
`, "['disk full', 'timeout']", "With a real log file, `log` would be `open(\"app.log\")`, and this pipeline would process gigabytes one line at a time."),
        { t: "analogy", text: "A list is a full thali served at once: everything is on the plate, taking space. A generator is a chef making rotis one at a time as you ask: no pile on the table, and the chef can keep going as long as you're hungry." },
        { t: "trap", text: "A generator can be used **only once**: after `list(gen)`, it's empty and a second `list(gen)` gives `[]`. Generators don't support `len()` or indexing. Create a new generator (call the function again) when you need the values again." },
        { t: "trick", text: "**yield = pause and hand out. Generator = lazy list, used once.**" },
        { t: "exam", items: ["What is a generator? How is it different from a list?", "Difference between yield and return?", "What is an iterator? What are __iter__ and __next__?", "When should you use a generator? (Large or endless data, pipelines.)", "Generator expression vs list comprehension?"] },
        { t: "recap", items: ["iter() + next() is how for loops work", "yield makes a generator function", "Values are produced lazily, one at a time", "Generators save memory but can be used once", "(x for x in …) is a generator expression"] },
      ],
      quiz: [
        { q: "What does yield do?", options: ["Hands out a value and pauses the function", "Ends the function for good", "Prints a value", "Raises an error"], answer: 0, explain: "The function resumes on the next request." },
        { q: "g = (x for x in [1, 2]); list(g); list(g) gives…", options: ["[] the second time", "[1, 2] twice", "An error", "[1, 2, 1, 2]"], answer: 0, explain: "Generators are used up after one pass." },
        { q: "Why use a generator for a 10 GB file?", options: ["It processes one line at a time, using little memory", "It's always faster than lists", "It compresses the file", "It's required for files"], answer: 0, explain: "Laziness saves memory." },
        { q: "next() on an exhausted iterator raises…", options: ["StopIteration", "IndexError", "None", "KeyError"], answer: 0, explain: "for loops catch it for you." },
      ],
    },
    {
      id: "decorators",
      title: "Closures and decorators",
      oneLine: "A closure is an inner function that remembers variables from the function that created it. A decorator uses this to wrap a function with extra behaviour (logging, checks, caching) without changing its code: @decorator.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Functions that make functions (closures)" },
        py("A closure", src`
def make_multiplier(n):
    def multiply(x):
        return x * n             # multiply remembers n, even after make_multiplier ends
    return multiply              # return the function itself (no brackets)

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))
`, "10 15"),
        { t: "h", text: "Step 2: A decorator wraps a function" },
        py("Your first decorator", src`
def shout(func):                       # takes a function…
    def wrapper(name):
        result = func(name)            # …calls the original…
        return result.upper() + "!"    # …and changes the result
    return wrapper                     # …returns the new, wrapped function

@shout                                 # same as: greet = shout(greet)
def greet(name):
    return f"hello {name}"

print(greet("asha"))
`, "HELLO ASHA!"),
        { t: "diagram", text: "@shout\ndef greet(...)        means      greet = shout(greet)\n\ncall greet(\"asha\") ──▶ wrapper(\"asha\") ──▶ original greet ──▶ \"hello asha\"\n                                  └──▶ \"HELLO ASHA!\"" },
        { t: "h", text: "Step 3: Real-world decorators" },
        py("Logging calls", src`
import functools

def log_calls(func):
    @functools.wraps(func)                  # keep the original name and docstring
    def wrapper(*args, **kwargs):           # accept ANY arguments
        print(f"Calling {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(3, 4)
print(add.__name__)
`, "Calling add(3, 4)\nadd returned 7\nadd"),
        py("A login check", src`
import functools

def require_login(func):
    @functools.wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.get("logged_in"):
            return "Please log in first"     # stop before the real function runs
        return func(user, *args, **kwargs)
    return wrapper

@require_login
def view_profile(user):
    return f"Profile of {user['name']}"

print(view_profile({"name": "Asha", "logged_in": True}))
print(view_profile({"name": "Guest", "logged_in": False}))
`, "Profile of Asha\nPlease log in first", "Web frameworks work exactly like this: Flask's `@app.route(\"/\")` and Django's `@login_required` are decorators."),
        py("Built-in caching decorator", src`
from functools import lru_cache

@lru_cache(maxsize=None)          # remember every answer (memoization)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))                    # instant; without the cache it would take years
`, "23416728348467685"),
        { t: "analogy", text: "A decorator is gift wrapping: the gift (your function) stays the same, but the wrapping adds something: a card (logging), a lock (login check) or a box that remembers what was inside (cache). @ is how you wrap it." },
        { t: "trap", text: "Forgetting `return wrapper` (or returning `wrapper()` with brackets) breaks the decorated function. Without `@functools.wraps(func)`, the wrapped function loses its name and docstring (`add.__name__` would be \"wrapper\"), which confuses debugging and tools." },
        { t: "trick", text: "**Decorator = def outer(func): def wrapper(*args, **kwargs): … return func(*args, **kwargs); return wrapper.**" },
        { t: "exam", items: ["What is a decorator? Write one that logs or times a function.", "What is a closure?", "What does @functools.wraps do?", "Give real examples of decorators (@property, @staticmethod, @lru_cache, @app.route).", "Can you stack decorators? (Yes: the one nearest the function is applied first.)"] },
        { t: "recap", items: ["Functions can be returned and passed like values", "A closure remembers variables from its enclosing function", "@dec above def f means f = dec(f)", "Use *args, **kwargs in the wrapper and @functools.wraps", "lru_cache adds memoization in one line"] },
      ],
      quiz: [
        { q: "@timer above def f(): means…", options: ["f = timer(f)", "timer = f(timer)", "f is deleted", "timer runs only once"], answer: 0, explain: "The decorator wraps f." },
        { q: "What should a decorator return?", options: ["The wrapper function", "The wrapper's result", "None", "The original function's result"], answer: 0, explain: "return wrapper, without brackets." },
        { q: "Why use *args, **kwargs in a wrapper?", options: ["So it works for functions with any arguments", "It's faster", "It's required syntax", "To stop errors"], answer: 0, explain: "The wrapper passes them through." },
        { q: "Which built-in decorator caches results?", options: ["functools.lru_cache", "functools.wraps", "staticmethod", "property"], answer: 0, explain: "Great for recursive functions." },
      ],
    },
    {
      id: "type-hints-context",
      title: "Type hints, context managers and modern syntax",
      oneLine: "Type hints document what types a function expects and returns (checked by tools like mypy, not by Python). Context managers (with) guarantee clean-up. The walrus operator := assigns inside an expression.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Type hints" },
        py("Adding type hints", src`
def average(marks: list[float]) -> float:            # takes a list of floats, returns a float
    return sum(marks) / len(marks)

def find_marks(name: str, book: dict[str, int]) -> int | None:   # an int, or None
    return book.get(name)

print(average([80, 90]))
print(find_marks("Asha", {"Asha": 88}))
print(find_marks("Ravi", {"Asha": 88}))

def add(a: int, b: int) -> int:
    return a + b
print(add("hi", "there"))       # Python does NOT check hints at run time!
`, "85.0\n88\nNone\nhithere", "Run `pip install mypy` and `mypy app.py` to catch type mistakes like the last line before running. Editors like VS Code use hints for autocomplete and warnings."),
        { t: "table", head: ["Hint", "Means"], rows: [["`int`, `str`, `float`, `bool`", "Basic types"], ["`list[int]`", "A list of ints"], ["`dict[str, float]`", "Keys str, values float"], ["`tuple[int, int]`", "A pair of ints"], ["`int | None`", "An int or None (also `Optional[int]`)"], ["`-> None`", "Returns nothing"]] },
        { t: "h", text: "Step 2: Context managers (with)" },
        py("A context manager class", src`
class Connection:
    def __enter__(self):                     # runs at the start of the with block
        print("Connection opened")
        return self                          # becomes the "as" variable
    def __exit__(self, exc_type, exc, tb):   # ALWAYS runs at the end, even on errors
        print("Connection closed")
        return False                         # False = don't hide the error
    def query(self, sql):
        return f"Result of {sql}"

with Connection() as conn:
    print(conn.query("SELECT 1"))

try:
    with Connection() as conn:
        raise RuntimeError("network lost")   # an error inside the block…
except RuntimeError as e:
    print("Error:", e)                       # …but the connection was still closed
`, "Connection opened\nResult of SELECT 1\nConnection closed\nConnection opened\nConnection closed\nError: network lost"),
        py("The easy way: @contextmanager", src`
from contextlib import contextmanager

@contextmanager
def section(title):
    print(f"--- {title} ---")      # before the with block
    yield                           # the with block runs here
    print(f"--- end of {title} ---")   # after it

with section("Report"):
    print("Total: 955.50")
`, "--- Report ---\nTotal: 955.50\n--- end of Report ---"),
        { t: "h", text: "Step 3: Modern syntax you'll see" },
        py("Walrus, unpacking and more", src`
data = [3, 8, 1, 9]
if (n := len(data)) > 3:                    # := assigns AND uses the value
    print(f"List is long ({n} items)")

first, *middle, last = data                 # star unpacking
print(first, middle, last)

a = {"x": 1}
b = {"y": 2}
print(a | b)                                # merge dicts (3.9+)
print(f"{'ok':*^10}")                       # centre with * padding
print(1_000_000 == 10**6)                   # underscores in numbers
`, "List is long (4 items)\n3 [8, 1] 9\n{'x': 1, 'y': 2}\n****ok****\nTrue"),
        { t: "analogy", text: "Type hints are labels on kitchen jars (\"sugar\", \"salt\"): Python won't stop you from putting salt in the sugar jar, but anyone reading (and tools like mypy) will spot the mistake. A context manager is a hotel room key card: the room opens when you enter and locks itself when you leave, whatever happens inside." },
        { t: "trap", text: "Type hints are **not enforced** at run time: they help readers, editors and mypy. `list[int]` and `int | None` need Python 3.9 / 3.10+; older code uses `List[int]` and `Optional[int]` from `typing`. In `__exit__`, returning True swallows the error, so only do that on purpose." },
        { t: "trick", text: "**Hints document, mypy checks. with = guaranteed clean-up. := assigns in an expression.**" },
        { t: "exam", items: ["What are type hints? Does Python enforce them?", "What is a context manager? Which methods does it need? (__enter__ and __exit__.)", "Why is with open() better than open() + close()?", "What is the walrus operator?", "What is mypy?"] },
        { t: "recap", items: ["def f(x: int) -> str: documents types", "Tools like mypy and editors use hints; Python doesn't check them", "Context managers: __enter__ / __exit__ or @contextmanager + yield", "with guarantees clean-up even after errors", ":= assigns inside an expression; a | b merges dicts"] },
      ],
      quiz: [
        { q: "def f(x: int) -> int: … f(\"a\") at run time…", options: ["Runs anyway (hints aren't enforced)", "Raises a TypeHintError", "Converts \"a\" to int", "Won't compile"], answer: 0, explain: "Use mypy to catch it." },
        { q: "Which method runs at the end of a with block?", options: ["__exit__", "__enter__", "__del__", "__close__"], answer: 0, explain: "Even if an error happens." },
        { q: "if (n := len(x)) > 3: does what?", options: ["Assigns len(x) to n and compares it", "Compares n with len(x)", "Creates a tuple", "Raises a SyntaxError"], answer: 0, explain: "The walrus operator." },
        { q: "int | None means…", options: ["An int or None", "An int OR'd with None", "A bitwise operation", "Always None"], answer: 0, explain: "Same as Optional[int]." },
      ],
    },
  ],
};

export const PY13_PROJECTS: LearnModule = {
  id: "projects",
  title: "Projects",
  titleHi: "प्रोजेक्ट",
  blurb: "Build four complete programs you can put on GitHub: a to-do app that saves to JSON, a quiz game, an expense tracker with CSV reports, and a file organiser that automates a boring task.",
  lessons: [
    {
      id: "todo-app",
      title: "Project 1: To-do list app (saves to JSON)",
      oneLine: "A menu-driven command-line app: add, list, complete and delete tasks. Tasks are saved to a JSON file, so they're still there next time you run it. Uses functions, lists of dicts, loops, error handling and files.",
      minutes: 30,
      blocks: [
        { t: "h", text: "Step 1: Plan before coding" },
        { t: "table", head: ["Piece", "How"], rows: [
          ["Data", "A list of dicts: `[{\"title\": \"Buy milk\", \"done\": False}]`"],
          ["Saving", "`json` + `pathlib`: load at start, save after every change"],
          ["Menu", "`while True` loop with `input()`; `break` on Quit"],
          ["Bad input", "`try/except` for numbers, a range check for task numbers"],
          ["Structure", "Small functions: `load_tasks`, `save_tasks`, `show`, `main`"],
        ] },
        { t: "h", text: "Step 2: The full program" },
        py("todo.py", src`
import json
from pathlib import Path

FILE = Path("todos.json")

def load_tasks():
    """Read the tasks from the file, or start with an empty list."""
    if FILE.exists():
        return json.loads(FILE.read_text(encoding="utf-8"))
    return []

def save_tasks(tasks):
    FILE.write_text(json.dumps(tasks, indent=2), encoding="utf-8")

def show(tasks):
    if not tasks:
        print("No tasks yet.")
    for i, task in enumerate(tasks, start=1):
        mark = "✔" if task["done"] else " "
        print(f"{i}. [{mark}] {task['title']}")

def main():
    tasks = load_tasks()
    while True:
        print("\n1) Add  2) List  3) Done  4) Delete  5) Quit")
        choice = input("Choose: ").strip()

        if choice == "1":
            title = input("Task: ").strip()
            if title:                                  # ignore empty input
                tasks.append({"title": title, "done": False})
                save_tasks(tasks)
                print("Added.")
        elif choice == "2":
            show(tasks)
        elif choice in ("3", "4"):
            show(tasks)
            try:
                index = int(input("Task number: ")) - 1    # people count from 1
                if not 0 <= index < len(tasks):
                    raise IndexError
            except (ValueError, IndexError):
                print("Invalid number.")
                continue                               # back to the menu
            if choice == "3":
                tasks[index]["done"] = True
                print("Marked as done.")
            else:
                removed = tasks.pop(index)
                print("Deleted:", removed["title"])
            save_tasks(tasks)
        elif choice == "5":
            print("Bye!")
            break
        else:
            print("Please choose 1-5.")

if __name__ == "__main__":
    main()
`, "1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 1\nTask: Buy milk\nAdded.\n\n1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 1\nTask: Learn Python\nAdded.\n\n1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 3\n1. [ ] Buy milk\n2. [ ] Learn Python\nTask number: 1\nMarked as done.\n\n1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 4\n1. [✔] Buy milk\n2. [ ] Learn Python\nTask number: 2\nDeleted: Learn Python\n\n1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 2\n1. [✔] Buy milk\n\n1) Add  2) List  3) Done  4) Delete  5) Quit\nChoose: 5\nBye!", "A sample session: the text after each prompt is what the user typed. Run it again and Buy milk is still there, loaded from `todos.json`."),
        { t: "h", text: "Step 3: How it works" },
        { t: "points", items: ["`load_tasks()` runs once at the start; `save_tasks()` after every change, so nothing is lost if the program closes.", "`int(input(...)) - 1` turns the human number (1, 2, 3) into a list index (0, 1, 2).", "`raise IndexError` inside try lets one `except` handle both \"not a number\" and \"number out of range\".", "`continue` jumps back to the menu without saving.", "`if __name__ == \"__main__\":` lets you import these functions in tests without starting the menu."] },
        { t: "h", text: "Step 4: Make it yours (upgrade ideas)" },
        { t: "points", items: ["Add a due date to each task (`datetime`) and show overdue tasks in a different way.", "Add priorities (high/medium/low) and sort the list by priority.", "Add an Edit option.", "Turn it into a web app later with Flask (see the Job-ready module)."] },
        { t: "trap", text: "Saving only when the user quits means a crash loses everything; save after every change. When reading the JSON file, a broken file raises `json.JSONDecodeError`; a production app would catch it and back up the bad file." },
        { t: "trick", text: "**Data structure first, then functions, then the menu loop.**" },
        { t: "exam", items: ["Explain your project's structure in an interview: data, functions, saving, error handling.", "Why did you choose JSON? (Human-readable, maps directly to lists and dicts.)", "How would you test it? (Test load/save and show separately from the menu.)"] },
        { t: "recap", items: ["List of dicts for the data, JSON file for saving", "Menu with while True + input + break", "try/except plus a range check for user numbers", "Small single-purpose functions", "__main__ guard"] },
      ],
      quiz: [
        { q: "Why subtract 1 from the task number the user types?", options: ["Users count from 1, list indexes start at 0", "To skip the first task", "It's required by JSON", "To avoid negatives"], answer: 0, explain: "Task 1 is tasks[0]." },
        { q: "Why save after every change?", options: ["So no work is lost if the program stops", "It's faster", "JSON requires it", "To clear the list"], answer: 0, explain: "Never rely only on a clean exit." },
        { q: "What does continue do inside the menu loop?", options: ["Goes back to the start of the loop (the menu)", "Quits the app", "Saves the file", "Repeats the last action"], answer: 0, explain: "It skips the rest of that round." },
        { q: "Which module converts the tasks list to text for the file?", options: ["json", "csv", "random", "math"], answer: 0, explain: "json.dumps / json.loads." },
      ],
    },
    {
      id: "quiz-game",
      title: "Project 2: Quiz game",
      oneLine: "A multiple-choice quiz that asks questions, checks answers, rejects invalid input, and shows a score with a percentage at the end. Questions are data (a list of dicts), so adding more needs no new code.",
      minutes: 25,
      blocks: [
        { t: "h", text: "Step 1: Questions are data" },
        { t: "p", text: "Instead of writing an if-block for each question, store all questions in one list. The same `ask()` function handles every question. This idea (separate **data** from **logic**) is how real apps work." },
        py("quiz.py", src`
QUESTIONS = [
    {"q": "Which keyword defines a function?", "options": ["func", "def", "lambda", "fn"], "answer": "b"},
    {"q": "What is 7 // 2?", "options": ["3.5", "4", "3", "2"], "answer": "c"},
    {"q": "Which type is immutable?", "options": ["list", "dict", "set", "tuple"], "answer": "d"},
]

def ask(question, number):
    """Show one question, read a valid answer, return True if it's correct."""
    print(f"\nQ{number}. {question['q']}")
    for letter, option in zip("abcd", question["options"]):
        print(f"  {letter}) {option}")

    while True:                                    # keep asking until a-d
        reply = input("Your answer (a-d): ").strip().lower()
        if reply in ("a", "b", "c", "d"):
            break
        print("Please type a, b, c or d.")

    if reply == question["answer"]:
        print("✅ Correct!")
        return True
    correct = question["options"]["abcd".index(question["answer"])]
    print(f"❌ Wrong. The answer is {question['answer']}) {correct}")
    return False

def main():
    print("Python Quiz")
    score = 0
    for number, question in enumerate(QUESTIONS, start=1):
        if ask(question, number):
            score += 1
    percent = score / len(QUESTIONS) * 100
    print(f"\nScore: {score}/{len(QUESTIONS)} ({percent:.0f}%)")
    print("Great job!" if percent >= 70 else "Keep practising!")

if __name__ == "__main__":
    main()
`, "Python Quiz\n\nQ1. Which keyword defines a function?\n  a) func\n  b) def\n  c) lambda\n  d) fn\nYour answer (a-d): b\n✅ Correct!\n\nQ2. What is 7 // 2?\n  a) 3.5\n  b) 4\n  c) 3\n  d) 2\nYour answer (a-d): x\nPlease type a, b, c or d.\nYour answer (a-d): a\n❌ Wrong. The answer is c) 3\n\nQ3. Which type is immutable?\n  a) list\n  b) dict\n  c) set\n  d) tuple\nYour answer (a-d): d\n✅ Correct!\n\nScore: 2/3 (67%)\nKeep practising!"),
        { t: "h", text: "Step 2: Key lines explained" },
        { t: "table", head: ["Line", "Why"], rows: [
          ["`zip(\"abcd\", question[\"options\"])`", "Pairs each option with a letter: (a, func), (b, def)…"],
          ["`.strip().lower()`", "Accepts \" B \" as b"],
          ["`while True` … `break`", "Re-asks until the input is valid"],
          ["`\"abcd\".index(answer)`", "Turns the letter c into index 2 to show the right option"],
          ["`ask()` returns True/False", "main() just counts the True results"],
        ] },
        { t: "h", text: "Step 3: Upgrade ideas" },
        { t: "points", items: ["Shuffle the questions with `random.shuffle(QUESTIONS)`.", "Load questions from a JSON file so teachers can add them without touching code.", "Add a time limit per question using `time.time()`.", "Save high scores with names to a file and show the top 5."] },
        { t: "trap", text: "Comparing the raw input (`\"B\"` or `\"b \"`) to `\"b\"` fails; always clean input with `.strip().lower()`. Integer division of the score (`score // total * 100`) gives 0 for most scores; use `/`." },
        { t: "trick", text: "**Data in a list, one function per job, clean every input.**" },
        { t: "exam", items: ["How would you load the questions from a file? (json.load into the same list of dicts.)", "How would you prevent the same question appearing twice when shuffling? (Shuffle the list once; don't pick randomly each time.)", "How would you add categories or difficulty levels?"] },
        { t: "recap", items: ["Questions stored as data (list of dicts)", "One ask() function for all questions", "Validate input in a while loop", "Score and percentage with an f-string", "Easy to extend: shuffle, file, timer, high scores"] },
      ],
      quiz: [
        { q: "Why store questions in a list of dicts?", options: ["New questions need no new code", "It's faster to type", "Python requires it", "To encrypt them"], answer: 0, explain: "Separate data from logic." },
        { q: "\" B \".strip().lower() gives…", options: ["\"b\"", "\" b \"", "\"B\"", "\"b \""], answer: 0, explain: "Spaces removed, lowercased." },
        { q: "\"abcd\".index(\"c\") is…", options: ["2", "3", "c", "1"], answer: 0, explain: "a = 0, b = 1, c = 2." },
        { q: "2 / 3 * 100 formatted with :.0f shows…", options: ["67", "66", "0.67", "66.6"], answer: 0, explain: "66.67 rounded to 0 decimals." },
      ],
    },
    {
      id: "expense-tracker",
      title: "Project 3: Expense tracker with CSV reports",
      oneLine: "Record expenses in a CSV file (which opens in Excel), then produce a report: total per category, each category's share of spending, and the biggest expense. Uses csv, defaultdict, sorting with key and f-string tables.",
      minutes: 25,
      blocks: [
        py("expenses.py", src`
import csv
from collections import defaultdict
from pathlib import Path

FILE = Path("expenses.csv")
FIELDS = ["date", "category", "description", "amount"]

def add_expense(date, category, description, amount):
    new_file = not FILE.exists()
    with FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        if new_file:
            writer.writeheader()                    # the header row, only once
        writer.writerow({"date": date, "category": category,
                         "description": description, "amount": amount})

def load_expenses():
    if not FILE.exists():
        return []
    with FILE.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        row["amount"] = float(row["amount"])        # CSV gives strings
    return rows

def summary(expenses):
    by_category = defaultdict(float)
    for e in expenses:
        by_category[e["category"]] += e["amount"]
    return dict(sorted(by_category.items(), key=lambda kv: kv[1], reverse=True))

def report(expenses):
    total = sum(e["amount"] for e in expenses)
    print(f"{'Category':<12}{'Amount':>10}{'Share':>8}")
    for category, amount in summary(expenses).items():
        print(f"{category:<12}{amount:>10.2f}{amount / total:>8.0%}")
    print(f"{'Total':<12}{total:>10.2f}")
    biggest = max(expenses, key=lambda e: e["amount"])
    print(f"Biggest expense: {biggest['description']} (₹{biggest['amount']:.0f})")

add_expense("2026-10-01", "Food", "Groceries", 1850)
add_expense("2026-10-03", "Travel", "Metro card", 500)
add_expense("2026-10-05", "Food", "Pizza", 450)
add_expense("2026-10-08", "Books", "Python book", 699)
add_expense("2026-10-12", "Travel", "Bus to Pune", 1200)
report(load_expenses())
`, "Category        Amount   Share\nFood           2300.00     49%\nTravel         1700.00     36%\nBooks           699.00     15%\nTotal          4699.00\nBiggest expense: Groceries (₹1850)"),
        { t: "h", text: "How it works" },
        { t: "table", head: ["Function", "Job", "Concepts used"], rows: [
          ["`add_expense`", "Append one row; write the header the first time", "csv.DictWriter, \"a\" mode, pathlib"],
          ["`load_expenses`", "Read all rows and convert amounts to float", "csv.DictReader, type conversion"],
          ["`summary`", "Total per category, biggest first", "defaultdict, sorted with key and reverse"],
          ["`report`", "Print an aligned table and the biggest expense", "f-string alignment, :.0%, max with key"],
        ] },
        { t: "h", text: "Upgrade ideas" },
        { t: "points", items: ["Add an input menu like the to-do app.", "Filter by month: keep rows where `row[\"date\"].startswith(\"2026-10\")`.", "Set a monthly budget per category and warn when you cross 80%.", "Draw a pie chart with `matplotlib`, or analyse the CSV with `pandas` (`pd.read_csv`)."] },
        { t: "trap", text: "Every value read from a CSV is a string: `\"1850\" + \"450\"` is `\"1850450\"`. Convert amounts with `float()` right after reading. Use `newline=\"\"` when opening CSV files on Windows." },
        { t: "trick", text: "**Write rows, read rows, convert types, then summarise.**" },
        { t: "exam", items: ["How does defaultdict simplify the summary?", "How would you find the month with the highest spending?", "How would you handle a bad row (for example an amount of \"abc\")? (try/except around float(), and skip or log the row.)"] },
        { t: "recap", items: ["CSV keeps data in a format Excel can open", "DictWriter/DictReader work with dict rows", "Convert strings to numbers after reading", "defaultdict(float) for running totals", "f-string alignment builds clean reports"] },
      ],
      quiz: [
        { q: "Why call float(row[\"amount\"])?", options: ["CSV values are read as strings", "To round the amount", "DictReader requires it", "To sort rows"], answer: 0, explain: "Otherwise + would join text." },
        { q: "defaultdict(float)[\"new\"] starts at…", options: ["0.0", "None", "KeyError", "\"\""], answer: 0, explain: "float() returns 0.0." },
        { q: "f\"{0.4893:.0%}\" gives…", options: ["49%", "0.49", "48.93%", "48%"], answer: 0, explain: "Multiplied by 100, rounded." },
        { q: "Why write the header only when the file is new?", options: ["Otherwise every run adds another header row", "Headers are optional", "DictWriter writes it twice", "CSV can't have headers"], answer: 0, explain: "Append mode keeps the old content." },
      ],
    },
    {
      id: "file-organiser",
      title: "Project 4: Automate a boring task (file organiser)",
      oneLine: "Automation is one of Python's biggest job uses. This script tidies a messy Downloads folder by moving every file into a sub-folder by type: Images, Documents, Music and Others.",
      minutes: 20,
      blocks: [
        py("organise.py", src`
import shutil
from pathlib import Path

FOLDERS = {".jpg": "Images", ".png": "Images", ".pdf": "Documents",
           ".csv": "Documents", ".docx": "Documents", ".mp3": "Music"}

def organise(folder: Path) -> int:
    """Move each file into a sub-folder by its extension. Returns how many moved."""
    moved = 0
    for file in sorted(folder.iterdir()):
        if file.is_file():
            target = folder / FOLDERS.get(file.suffix.lower(), "Others")
            target.mkdir(exist_ok=True)                 # create the folder if needed
            shutil.move(str(file), str(target / file.name))
            moved += 1
    return moved

# --- demo: make a messy folder to tidy (use your real Downloads folder later) ---
downloads = Path("Downloads")
downloads.mkdir(exist_ok=True)
for name in ["photo.jpg", "notes.pdf", "song.mp3", "selfie.PNG", "resume.pdf", "data.csv", "setup.exe"]:
    (downloads / name).write_text("demo")

print("Moved", organise(downloads), "files")
for sub in sorted(downloads.iterdir()):
    print(sub.name + ":", ", ".join(sorted(f.name for f in sub.iterdir())))
`, "Moved 7 files\nDocuments: data.csv, notes.pdf, resume.pdf\nImages: photo.jpg, selfie.PNG\nMusic: song.mp3\nOthers: setup.exe"),
        { t: "h", text: "Key ideas" },
        { t: "points", items: ["`Path.iterdir()` lists a folder; `is_file()` skips sub-folders.", "`file.suffix.lower()` treats .PNG and .png the same.", "`FOLDERS.get(ext, \"Others\")` gives a default for unknown types.", "`mkdir(exist_ok=True)` doesn't fail if the folder already exists.", "`shutil.move` moves the file."] },
        { t: "h", text: "More things Python can automate" },
        { t: "table", head: ["Task", "Tools"], rows: [
          ["Rename 500 photos to date-based names", "pathlib, datetime"],
          ["Fill an Excel report every morning", "openpyxl or pandas"],
          ["Send emails with attachments", "smtplib, email"],
          ["Download data from a website every day", "requests, beautifulsoup4, schedule"],
          ["Merge or split PDFs", "pypdf"],
          ["Click through a website for testing", "selenium, playwright"],
        ] },
        { t: "trap", text: "Automation scripts can delete or overwrite real files. **Test on a copy** of the folder first, and print what you would do (a \"dry run\") before actually moving anything. If two files have the same name, `shutil.move` may overwrite one: check `target.exists()` first in a real tool." },
        { t: "trick", text: "**Dry run first, then run for real. Automate anything you do more than three times.**" },
        { t: "exam", items: ["Tell me about something you automated with Python.", "How do you list all files in a folder recursively? (Path.rglob(\"*\"))", "How would you make this script run every day? (Task Scheduler / cron.)"] },
        { t: "recap", items: ["pathlib for paths, iterdir, mkdir, suffix", "shutil.move / copy for files", "A dict maps extensions to folder names", "Always test on a copy and do a dry run", "Automation is a valuable job skill"] },
      ],
      quiz: [
        { q: "Path(\"a.PNG\").suffix.lower() is…", options: ["\".png\"", "\"PNG\"", "\"a\"", "\"png\""], answer: 0, explain: "suffix includes the dot." },
        { q: "What does mkdir(exist_ok=True) avoid?", options: ["An error if the folder already exists", "Creating nested folders", "Deleting files", "Permission errors"], answer: 0, explain: "parents=True creates nested folders." },
        { q: "Before running an automation on real files, you should…", options: ["Test on a copy / do a dry run", "Delete backups", "Run it twice", "Turn off the computer"], answer: 0, explain: "Mistakes on real files can't be undone." },
        { q: "Which module moves files?", options: ["shutil", "math", "json", "random"], answer: 0, explain: "shutil.move, shutil.copy." },
      ],
    },
  ],
};

export const PY14_JOB_READY: LearnModule = {
  id: "job-ready",
  title: "Job-ready: testing, careers and interviews",
  titleHi: "नौकरी के लिए तैयार",
  blurb: "Test and debug like a professional, pick a career path (web, data, automation, AI) and its next libraries, and practise the Python interview questions asked most often.",
  lessons: [
    {
      id: "testing-debugging",
      title: "Testing and debugging",
      oneLine: "Tests are small functions that check your code gives the right answers, so you can change it without fear. pytest runs them. For bugs, use print/logging, breakpoint() and the traceback.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: assert and test functions" },
        py("Testing by hand", src`
def add_gst(price, rate=18):
    if price < 0:
        raise ValueError("price can't be negative")
    return round(price * (1 + rate / 100), 2)

def test_basic():
    assert add_gst(100) == 118.0          # assert: crash loudly if this is False

def test_custom_rate():
    assert add_gst(200, 5) == 210.0

def test_negative_price():
    try:
        add_gst(-1)
    except ValueError:
        return                            # the error we expected: pass
    raise AssertionError("expected ValueError")

for test in [test_basic, test_custom_rate, test_negative_price]:
    test()
    print("PASSED", test.__name__)
`, "PASSED test_basic\nPASSED test_custom_rate\nPASSED test_negative_price"),
        { t: "h", text: "Step 2: The same tests with pytest (what companies use)" },
        py("test_billing.py", src`
import pytest
from billing import add_gst          # the code being tested lives in billing.py

def test_basic():
    assert add_gst(100) == 118.0

def test_custom_rate():
    assert add_gst(200, 5) == 210.0

@pytest.mark.parametrize("price, expected", [(0, 0.0), (50, 59.0), (1000, 1180.0)])
def test_many_prices(price, expected):     # one test, many inputs
    assert add_gst(price) == expected

def test_negative_price():
    with pytest.raises(ValueError):        # passes only if ValueError is raised
        add_gst(-1)
`),
        { t: "code", lang: "bash", code: "pip install pytest\npytest            # finds files named test_*.py and functions named test_*", output: "collected 6 items\n\ntest_billing.py ......                                   [100%]\n\n============ 6 passed in 0.02s ============" },
        { t: "h", text: "Step 3: Debugging" },
        py("logging instead of print", src`
import logging
import sys

logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s", stream=sys.stdout)

def average(marks):
    logging.debug("average() got %s", marks)
    if not marks:
        logging.warning("empty list, returning 0")
        return 0
    return sum(marks) / len(marks)

print(average([80, 90]))
print(average([]))
`, "DEBUG: average() got [80, 90]\n85.0\nDEBUG: average() got []\nWARNING: empty list, returning 0\n0"),
        { t: "points", items: ["**Read the traceback** bottom-up: error type, message, then the line number.", "**Reproduce** the bug with the smallest input, then write a test for it.", "**print / logging**: show the values just before the line that fails. Logging can be switched off with one setting and supports levels (DEBUG, INFO, WARNING, ERROR).", "**breakpoint()**: put it on a line; when the program reaches it, you can inspect variables (`p name`), step (`n`) and continue (`c`). VS Code's debugger does the same with red dots in the margin.", "**Rubber duck**: explain the code line by line to someone (or a rubber duck). You'll often spot the bug yourself."] },
        { t: "analogy", text: "Tests are the checklist a pilot runs before every flight: boring, fast, and they catch problems before passengers do. Debugging is detective work: the traceback is the crime scene, and logging is the CCTV footage." },
        { t: "trap", text: "Don't compare floats exactly in tests (`0.1 + 0.2 == 0.3` is False); use `pytest.approx(0.3)` or round. Don't leave `breakpoint()` or debug prints in committed code. And remember `assert` statements can be disabled with `python -O`, so never use assert to validate user input in real code: raise errors instead." },
        { t: "trick", text: "**Bug found → write a failing test → fix → test passes → it never comes back.**" },
        { t: "exam", items: ["How do you test Python code? (pytest or unittest.)", "What is assert?", "What is a unit test? Integration test?", "How do you debug a Python program?", "Difference between logging and print?", "What is TDD (test-driven development)?"] },
        { t: "recap", items: ["Tests are functions that assert expected results", "pytest finds test_*.py files and test_* functions", "pytest.raises checks for errors; parametrize runs many inputs", "Use logging with levels instead of print", "breakpoint() or the VS Code debugger to inspect variables"] },
      ],
      quiz: [
        { q: "What does assert x == 5 do when x is 4?", options: ["Raises AssertionError", "Prints False", "Sets x to 5", "Nothing"], answer: 0, explain: "assert fails loudly." },
        { q: "pytest automatically runs functions whose names start with…", options: ["test_", "check_", "run_", "assert_"], answer: 0, explain: "In files named test_*.py." },
        { q: "Why prefer logging over print for debugging?", options: ["Levels and one switch to turn it off", "It's shorter", "print doesn't work in functions", "logging is faster to type"], answer: 0, explain: "DEBUG/INFO/WARNING/ERROR." },
        { q: "Which call pauses the program so you can inspect variables?", options: ["breakpoint()", "pause()", "debug()", "stop()"], answer: 0, explain: "It opens the pdb debugger." },
      ],
    },
    {
      id: "career-paths",
      title: "Career paths and what to learn next",
      oneLine: "With core Python done, pick a direction: web back end (Flask, FastAPI, Django), data analysis (pandas, SQL), machine learning and AI, or automation/testing. Build 2–3 projects in that direction and put them on GitHub.",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Choose a path" },
        { t: "table", head: ["Path", "Learn next", "Typical first job titles", "Project ideas"], rows: [
          ["Web back end", "Flask or FastAPI, then Django; SQL; REST APIs; Git", "Python developer, back-end developer", "Notes API, URL shortener, blog with login"],
          ["Data analysis", "pandas, NumPy, matplotlib, SQL, Excel, Power BI", "Data analyst, business analyst", "Analyse IPL or COVID data, a sales dashboard"],
          ["Machine learning / AI", "Statistics, scikit-learn, then PyTorch; LLM APIs", "ML engineer (after experience), AI engineer, data scientist", "House-price predictor, a chatbot using an LLM API"],
          ["Automation and testing", "pytest, Selenium/Playwright, openpyxl, APIs", "QA automation engineer, automation developer", "Automated website tests, an Excel report bot"],
        ] },
        { t: "h", text: "Step 2: A taste of each" },
        py("A web API with FastAPI", src`
# pip install fastapi uvicorn   then run:  uvicorn app:app --reload
from fastapi import FastAPI

app = FastAPI()
todos = [{"id": 1, "title": "Learn Python", "done": True}]

@app.get("/todos")                       # visit http://127.0.0.1:8000/todos
def list_todos():
    return todos                         # returned as JSON automatically

@app.post("/todos")
def add_todo(title: str):                # type hints validate the input
    todo = {"id": len(todos) + 1, "title": title, "done": False}
    todos.append(todo)
    return todo
`, undefined, "Needs `pip install fastapi uvicorn`. Open http://127.0.0.1:8000/docs for automatic, interactive API documentation."),
        py("Data analysis with pandas", src`
# pip install pandas
import pandas as pd

df = pd.read_csv("expenses.csv")                       # the file from Project 3
print(df.head())                                       # first 5 rows
print(df.groupby("category")["amount"].sum())          # total per category, one line
print(df[df["amount"] > 1000])                         # filter rows
`, undefined, "Compare with Project 3: pandas does the summary in one line. That's why data jobs use it."),
        { t: "h", text: "Step 3: Your 90-day plan" },
        { t: "table", head: ["Weeks", "Do this"], rows: [
          ["1–4", "Finish this course; solve 2 easy problems a day (HackerRank / LeetCode easy)"],
          ["5–6", "Git and GitHub; push the 4 projects with clear README files"],
          ["7–10", "Your chosen path's main library (Flask/FastAPI, or pandas + SQL); build 1 bigger project"],
          ["11–12", "DSA basics (see the DSA course); mock interviews; resume; apply"],
        ] },
        { t: "points", items: ["**Resume:** list projects with what they do and the tech used (\"Expense tracker: CSV storage, category reports, Python, pandas\").", "**GitHub:** a README with a screenshot, how to run it, and features. Recruiters do look.", "**LinkedIn:** post what you build; connect with Python developers.", "**Certificates help less than projects.** One working, deployed project beats five certificates."] },
        { t: "analogy", text: "Core Python is learning to drive. Each path is a vehicle licence: a car (web), a truck (data), an aircraft (AI). Pick one vehicle, get really good at it, and you can switch later; the driving skills carry over." },
        { t: "trap", text: "Don't stay in \"tutorial mode\" forever, watching course after course. You learn by building and getting stuck. Also, don't try to learn web, data and AI at the same time: go deep in one path for 2–3 months." },
        { t: "trick", text: "**One path, three projects, on GitHub, then apply.**" },
        { t: "exam", items: ["Why do you want to be a Python developer?", "Walk me through a project you built.", "Flask vs Django vs FastAPI? (Micro framework / batteries-included / fast, async, typed APIs.)", "What is a REST API?", "What is pandas used for?"] },
        { t: "recap", items: ["Paths: web back end, data, ML/AI, automation/testing", "Learn the main library of your path next", "Projects on GitHub with good READMEs", "Practise DSA and mock interviews", "Build more than you watch"] },
      ],
      quiz: [
        { q: "Which library is used for data analysis with tables?", options: ["pandas", "flask", "pytest", "selenium"], answer: 0, explain: "Flask is a web framework." },
        { q: "FastAPI and Flask are used to build…", options: ["Web apps and APIs", "Charts", "Games only", "Mobile apps"], answer: 0, explain: "Back-end web development." },
        { q: "What impresses recruiters most for a fresher?", options: ["Working projects on GitHub", "Many certificates", "Long resumes", "Knowing every library"], answer: 0, explain: "Show what you can build." },
        { q: "Selenium and Playwright are used for…", options: ["Automated browser testing", "Machine learning", "Databases", "Image editing"], answer: 0, explain: "They control a browser." },
      ],
    },
    {
      id: "interview-questions",
      title: "Top Python interview questions (with code)",
      oneLine: "The questions asked again and again in Python interviews, each with a short answer and code that proves it: mutability, copying, argument passing, closures, generators, the GIL and more.",
      minutes: 25,
      blocks: [
        { t: "h", text: "Q1. Mutable vs immutable: what happens when you \"change\" them?" },
        py("Mutable vs immutable", src`
nums = [1, 2]
before = id(nums)
nums.append(3)                    # a list changes in place
print(id(nums) == before)         # same object

name = "asha"
before = id(name)
name = name.upper()               # a string can't change: a NEW object is made
print(id(name) == before)
`, "True\nFalse", "**Immutable:** int, float, str, tuple, frozenset, bool. **Mutable:** list, dict, set, most objects."),
        { t: "h", text: "Q2. How are arguments passed? (\"pass by object reference\")" },
        py("Passing lists and numbers", src`
def change(nums, n):
    nums.append(4)       # changes the SAME list the caller has
    n += 1               # makes a NEW int locally; the caller's int is untouched

my_list, my_num = [1, 2, 3], 10
change(my_list, my_num)
print(my_list, my_num)
`, "[1, 2, 3, 4] 10"),
        { t: "h", text: "Q3. Shallow copy vs deep copy" },
        py("copy vs deepcopy", src`
import copy

a = [[1, 2], [3, 4]]
shallow = copy.copy(a)          # new outer list, SAME inner lists
deep = copy.deepcopy(a)         # everything copied
a[0].append(99)
print(shallow)
print(deep)
`, "[[1, 2, 99], [3, 4]]\n[[1, 2], [3, 4]]"),
        { t: "h", text: "Q4. The late-binding closure trap" },
        py("Lambdas in a loop", src`
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])            # all see the FINAL i

funcs = [lambda i=i: i for i in range(3)]   # fix: capture i as a default now
print([f() for f in funcs])
`, "[2, 2, 2]\n[0, 1, 2]"),
        { t: "h", text: "Q5. == vs is, and truthiness" },
        py("Equality and identity", src`
a = [1, 2]
b = [1, 2]
print(a == b, a is b)          # equal values, different objects
x = None
print(x is None)               # the right way to check for None
print(bool([]), bool([0]))     # empty is falsy; a list with one item is truthy
`, "True False\nTrue\nFalse True"),
        { t: "h", text: "Quick-fire answers" },
        { t: "table", head: ["Question", "Short answer"], rows: [
          ["List vs tuple?", "List is mutable and uses [ ]; tuple is immutable, hashable, slightly faster"],
          ["What is the GIL?", "The Global Interpreter Lock lets only one thread run Python bytecode at a time in CPython. Threads still help with I/O (network, files); use multiprocessing for CPU-heavy work. Python 3.13 added an experimental free-threaded build"],
          ["Is Python compiled or interpreted?", "Source is compiled to bytecode (.pyc), which the Python virtual machine interprets"],
          ["What are *args and **kwargs?", "Extra positional arguments as a tuple / extra keyword arguments as a dict"],
          ["Generator vs list?", "A generator yields items lazily (little memory, one pass); a list stores all items"],
          ["What is a decorator?", "A function that takes a function and returns a wrapped version: @dec"],
          ["__init__ vs __new__?", "__new__ creates the object; __init__ sets it up. You almost always only write __init__"],
          ["What is self?", "The current object, passed automatically as the first argument of methods"],
          ["Mutable default argument problem?", "Defaults are created once and shared; use None and create the list inside"],
          ["How is memory managed?", "Reference counting plus a garbage collector for reference cycles"],
          ["Shallow vs deep copy?", "Shallow copies the outer container; deep copies everything inside too"],
          ["What is a lambda?", "A one-expression anonymous function, often a sort key"],
          ["How do dicts work? Lookup time?", "Hash tables; O(1) average lookup; keys must be hashable"],
          ["What does if __name__ == \"__main__\" do?", "Runs code only when the file is executed directly, not when imported"],
          ["What is PEP 8?", "Python's style guide: snake_case, 4-space indents, line length, spacing"],
          ["List comprehension vs map?", "Both transform items; comprehensions are usually clearer and can filter"],
          ["What is a virtual environment?", "An isolated set of packages for one project"],
          ["Exception handling keywords?", "try, except, else, finally, raise"],
          ["What is monkey patching?", "Changing a class or module at run time (common in tests)"],
          ["What is duck typing?", "\"If it walks like a duck…\": code cares about the methods an object has, not its type"],
        ] },
        { t: "h", text: "Output prediction (a favourite interview format)" },
        py("Predict the output", src`
print(type(1 / 1), type(7 // 2))
print("5" * 3, [0] * 3)
print(bool("False"), bool(""))
print(sorted("banana") [:3])
d = {}
d[1] = "int"
d[1.0] = "float"               # 1 == 1.0 and they hash the same: same key!
print(d)
print(0.1 + 0.2 == 0.3, round(0.1 + 0.2, 10) == 0.3)
`, "<class 'float'> <class 'int'>\n555 [0, 0, 0]\nTrue False\n['a', 'a', 'a']\n{1: 'float'}\nFalse True"),
        { t: "analogy", text: "Interviews test whether you understand what Python does **behind** the code, like a mechanic who knows why the car makes a noise, not just how to drive. Proving each answer with a tiny code example (like above) is the best way to learn and to answer." },
        { t: "trap", text: "Don't memorise answers word for word: interviewers ask follow-ups (\"why?\", \"what if the list is nested?\"). Run these examples, change them, and predict the output before you run them. If you don't know something, say how you'd find out; that's a good answer too." },
        { t: "trick", text: "**For every concept: definition in one line + a tiny code proof + when you'd use it.**" },
        { t: "exam", items: ["All the questions above, plus: reverse a string, check palindrome, count frequencies, find duplicates, FizzBuzz (see Module 8).", "Explain a project end to end.", "Then data structures and algorithms: see the DSA course."] },
        { t: "recap", items: ["Mutable objects change in place; immutable ones are replaced", "Arguments are passed by object reference", "copy.copy is shallow; copy.deepcopy copies nested objects", "Closures capture variables, not values (late binding)", "Know the quick-fire answers and prove them with code"] },
      ],
      quiz: [
        { q: "a = [1]; b = a; b += [2]; print(a) prints…", options: ["[1, 2]", "[1]", "[2]", "Error"], answer: 0, explain: "+= on a list changes it in place; a and b are the same list." },
        { q: "Which is immutable?", options: ["tuple", "list", "dict", "set"], answer: 0, explain: "Tuples can't be changed." },
        { q: "What does the GIL limit?", options: ["Only one thread runs Python bytecode at a time (in CPython)", "The number of processes", "Memory usage", "File access"], answer: 0, explain: "Use multiprocessing for CPU-heavy work." },
        { q: "{1: \"a\", 1.0: \"b\"} has how many keys?", options: ["1", "2", "0", "Error"], answer: 0, explain: "1 == 1.0 and they hash the same." },
        { q: "copy.copy of a nested list…", options: ["Shares the inner lists", "Copies everything", "Fails", "Returns the same object"], answer: 0, explain: "Use deepcopy for nested data." },
      ],
    },
  ],
};
