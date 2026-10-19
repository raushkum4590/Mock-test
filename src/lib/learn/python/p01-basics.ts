import type { LearnModule } from "../types";
import { py, src } from "./helpers";

/** Python modules 1–4: first steps, variables and types, operators and strings, decisions and loops. */
export const PY01_START: LearnModule = {
  id: "start",
  title: "Getting started",
  titleHi: "शुरुआत",
  blurb: "What Python is, how to install and run it, and your first program with print and comments.",
  lessons: [
    {
      id: "what-is-python",
      title: "What is Python?",
      oneLine: "Python is a programming language that reads almost like English. It's the most popular language for beginners, data science, AI, automation and web back ends.",
      minutes: 10,
      blocks: [
        { t: "h", text: "Step 1: What is a programming language?" },
        { t: "p", text: "A computer only follows instructions. A **programming language** is a way to write those instructions so both you and the computer can understand them. Python is one of the easiest to read, because it uses simple English words and very few symbols." },
        { t: "h", text: "Step 2: Your first Python program" },
        py("Hello, world", src`
print("Hello, world!")
print(2 + 3)
print("I am", 21, "years old")
`, "Hello, world!\n5\nI am 21 years old"),
        { t: "table", head: ["Piece", "Meaning"], rows: [
          ["`print( )`", "\"Show this on the screen\""],
          ["`\"Hello, world!\"`", "Text (called a **string**) goes inside quotes"],
          ["`2 + 3`", "Python calculates it first, then prints 5"],
          ["`\"I am\", 21, \"years old\"`", "Commas print several values with a space between them"],
        ] },
        { t: "p", text: "Notice: no semicolons, no curly braces, no `main` function. The same program in Java needs a class, a method and a lot of punctuation. That's why Python is the most common first language in schools and colleges." },
        { t: "h", text: "Step 3: Where is Python used?" },
        { t: "table", head: ["Area", "What Python does", "Popular tools"], rows: [
          ["Data science and AI", "Analyse data, train machine-learning models", "pandas, NumPy, scikit-learn, PyTorch"],
          ["Web back ends", "Run the server side of websites and APIs", "Django, Flask, FastAPI"],
          ["Automation", "Rename 1,000 files, fill Excel sheets, send emails", "Built-in modules, openpyxl"],
          ["Testing", "Automatically test websites and apps", "pytest, Selenium"],
          ["Scripting and tools", "Small helpers for developers and system admins", "Built-in modules"],
        ] },
        { t: "p", text: "Companies like Google, Netflix, Instagram, Spotify and most AI labs use Python every day. In India, Python roles include Python developer, data analyst, data scientist, ML engineer, automation/QA engineer and back-end developer." },
        { t: "analogy", text: "If programming languages were vehicles, C would be a manual racing car (fast, but you control every gear), Java a big bus (strict rules, carries large projects), and Python an automatic scooter: easy to start, easy to ride, and it takes you almost everywhere." },
        { t: "trap", text: "There were two versions: **Python 2** (dead since 2020) and **Python 3**. Always learn and use Python 3. Old tutorials with `print \"hi\"` (no brackets) are Python 2 and won't work." },
        { t: "trick", text: "**Python = readable code. If it reads like English, you're writing it the Python way.**" },
        { t: "exam", items: ["What is Python? (A high-level, interpreted, general-purpose language that's easy to read.)", "Why is Python popular? (Simple syntax, huge libraries, used in AI, data, web and automation.)", "Is Python compiled or interpreted? (Interpreted: code is run line by line by the Python interpreter, after being turned into bytecode.)", "Who created Python? (Guido van Rossum, released in 1991.)"] },
        { t: "recap", items: ["Python is an easy-to-read programming language", "print() shows values on the screen", "Used for AI, data science, web back ends, automation and testing", "Always use Python 3"] },
      ],
      quiz: [
        { q: "What does print(4 * 2) show?", options: ["8", "4 * 2", "42", "\"8\""], answer: 0, explain: "Python calculates first, then prints." },
        { q: "Which version of Python should you learn?", options: ["Python 3", "Python 2", "Python 1", "Any, they're the same"], answer: 0, explain: "Python 2 is no longer supported." },
        { q: "Which of these is NOT a common use of Python?", options: ["Designing printed circuit boards by hand", "Data science", "Web back ends", "Automation"], answer: 0, explain: "The others are Python's main areas." },
        { q: "print(\"Hi\", \"there\") prints…", options: ["Hi there", "Hithere", "Hi,there", "\"Hi\" \"there\""], answer: 0, explain: "Commas add a space between values." },
      ],
    },
    {
      id: "install-run",
      title: "Install Python and run your code",
      oneLine: "Install Python from python.org, then run code in two ways: type it line by line in the interactive shell (>>>), or save it in a .py file and run the whole file.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Step 1: Install Python" },
        { t: "points", items: [
          "Go to **python.org → Downloads** and download the latest Python 3 for your computer.",
          "**Windows: tick \"Add python.exe to PATH\"** on the first screen of the installer. This is the most important click.",
          "Open a terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux) and check the version:",
        ] },
        { t: "code", lang: "bash", code: "python --version        # Windows (or: py --version)\npython3 --version       # Mac and Linux", output: "Python 3.12.7" },
        { t: "h", text: "Step 2: The interactive shell (try one line at a time)" },
        { t: "p", text: "Type `python` (or `python3`) in the terminal. You'll see `>>>`. Type any Python and press Enter: the answer appears immediately. It's a calculator that speaks Python. Type `exit()` to leave." },
        { t: "code", lang: "text", code: ">>> 10 + 5\n15\n>>> print(\"Namaste\")\nNamaste\n>>> exit()" },
        { t: "h", text: "Step 3: Python files (real programs)" },
        { t: "points", items: [
          "Install **VS Code** and its **Python** extension (by Microsoft).",
          "Create a folder, then a file named `hello.py` (Python files end in **.py**).",
          "Write your code and save it.",
          "Run it: press the ▶ button in VS Code, or type `python hello.py` in the terminal.",
        ] },
        py("hello.py", src`
# hello.py: my first Python file
name = "Asha"
print("Hello,", name)
print("Welcome to Python!")
`, "Hello, Asha\nWelcome to Python!"),
        { t: "code", lang: "bash", code: "python hello.py", output: "Hello, Asha\nWelcome to Python!" },
        { t: "table", head: ["Way to run", "Best for"], rows: [
          ["Interactive shell `>>>`", "Quick tests and calculations"],
          ["`.py` file + `python file.py`", "Real programs you want to save and run again"],
          ["Jupyter Notebook / Google Colab", "Data science: code and results in one page, runs in the browser"],
          ["Online compilers", "Practice on a phone or a computer without Python installed"],
        ] },
        { t: "analogy", text: "The shell is like talking to a friend: you say one sentence, they reply at once. A .py file is like writing a letter: you write everything first, then they read it from top to bottom." },
        { t: "trap", text: "\"python is not recognized as an internal or external command\" means Python isn't on your PATH. Reinstall and tick **Add python.exe to PATH**, or use `py` on Windows. Also, don't name your file after a module you use, like `random.py` or `math.py`: Python will import your file instead of the real module." },
        { t: "trick", text: "**Shell for quick tests, .py file for real programs.**" },
        { t: "exam", items: ["How do you run a Python file? (python filename.py)", "What is the Python REPL? (The interactive shell: Read, Evaluate, Print, Loop.)", "What is the extension of a Python file? (.py)", "What is PATH? (The list of folders where the terminal looks for programs.)"] },
        { t: "recap", items: ["Install from python.org and tick \"Add to PATH\"", "Check with python --version", ">>> is the interactive shell; exit() leaves it", "Save programs as .py files and run them with python file.py", "VS Code + the Python extension is a great editor"] },
      ],
      quiz: [
        { q: "Which file extension do Python programs use?", options: [".py", ".python", ".pt", ".pyt"], answer: 0, explain: "For example hello.py." },
        { q: "What does >>> mean in a terminal?", options: ["You're in the Python interactive shell", "An error", "A comment", "The file has ended"], answer: 0, explain: "Type Python and press Enter." },
        { q: "How do you run a file called game.py?", options: ["python game.py", "run game", "open game.py", "py.run(game)"], answer: 0, explain: "Or press ▶ in VS Code." },
        { q: "Windows says \"python is not recognized\". The most likely reason?", options: ["Python isn't added to PATH", "The code has a bug", "The file is too long", "Python only works on Mac"], answer: 0, explain: "Tick \"Add python.exe to PATH\" when installing." },
      ],
    },
    {
      id: "print-comments",
      title: "print(), comments and escape characters",
      oneLine: "print() shows output and has two handy options: sep (what goes between values) and end (what goes at the end). Comments start with # and are ignored by Python, so they're notes for humans.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Step 1: print() in detail" },
        py("print with sep and end", src`
print("Python", "is", "fun")           # values separated by a space
print("2026", "10", "18", sep="-")     # sep: what goes between values
print("Loading", end="...")            # end: what goes at the end (default is a new line)
print("done")
print()                                # an empty line
print("Bye")
`, "Python is fun\n2026-10-18\nLoading...done\n\nBye"),
        { t: "table", head: ["Option", "Default", "Example", "Result"], rows: [
          ["`sep`", "a space `\" \"`", "`print(1, 2, 3, sep=\", \")`", "1, 2, 3"],
          ["`end`", "a new line `\"\\n\"`", "`print(\"Hi\", end=\"!\")`", "Hi! (and no new line)"],
        ] },
        { t: "h", text: "Step 2: Comments" },
        py("Comments", src`
# This whole line is a comment: Python skips it
price = 499       # a comment can also come after code
# print("This line will NOT run")

"""
Text in triple quotes that isn't stored anywhere
is often used as a multi-line note (a docstring).
"""
print("Price:", price)
`, "Price: 499"),
        { t: "p", text: "Write comments to explain **why** you did something, not what every line does. Good names often make comments unnecessary." },
        { t: "h", text: "Step 3: Escape characters (special characters inside strings)" },
        py("Escape characters", src`
print("Line 1\nLine 2")          # \n = new line
print("Name:\tAsha")             # \t = tab
print("He said \"hi\"")          # \" = a quote inside double quotes
print('It\'s easy')              # \' = an apostrophe inside single quotes
print("C:\\Users\\Asha")         # \\ = one backslash
print("""Roses are red,
Violets are blue.""")            # triple quotes keep line breaks
`, "Line 1\nLine 2\nName:\tAsha\nHe said \"hi\"\nIt's easy\nC:\\Users\\Asha\nRoses are red,\nViolets are blue."),
        { t: "table", head: ["Escape", "Means"], rows: [["`\\n`", "New line"], ["`\\t`", "Tab"], ["`\\\\`", "A real backslash"], ["`\\\"` and `\\'`", "A quote inside a string"]] },
        { t: "h", text: "Step 4: Your first errors" },
        { t: "table", head: ["You wrote", "Error", "Fix"], rows: [
          ["`print(\"Hello)`", "SyntaxError: unterminated string literal", "Close the quote: `print(\"Hello\")`"],
          ["`Print(\"Hi\")`", "NameError: name 'Print' is not defined", "Python is case-sensitive: `print`"],
          ["`  print(\"Hi\")` (spaces at the start)", "IndentationError: unexpected indent", "Remove the extra spaces"],
        ] },
        { t: "p", text: "Errors are normal. Read the **last line** of the error message first: it tells you the type of problem and usually the line number." },
        { t: "analogy", text: "Comments are sticky notes on your code: useful for you and your team, invisible to Python. Escape characters are like special keys on a keyboard (Enter, Tab) typed inside text using a backslash." },
        { t: "trap", text: "Python cares about spaces at the **start** of a line (indentation). A random space before `print` causes an IndentationError. Spaces inside a line, like `x = 5` vs `x=5`, don't matter." },
        { t: "trick", text: "**# = note for humans. \\n = new line. sep = between, end = at the end.**" },
        { t: "exam", items: ["How do you write a comment in Python? (#; triple-quoted strings for docstrings.)", "What do sep and end do in print()?", "What is \\n?", "Is Python case-sensitive? (Yes: print and Print are different.)"] },
        { t: "recap", items: ["print(a, b, sep=\"-\", end=\"!\") controls the separator and the ending", "# starts a comment", "\\n new line, \\t tab, \\\\ backslash", "Read the last line of an error first"] },
      ],
      quiz: [
        { q: "What does print(\"a\", \"b\", sep=\"+\") show?", options: ["a+b", "a b", "a + b", "ab"], answer: 0, explain: "sep goes between the values." },
        { q: "Which line is a comment?", options: ["# total marks", "// total marks", "<!-- total -->", "-- total"], answer: 0, explain: "Python uses #." },
        { q: "What does \\n do inside a string?", options: ["Starts a new line", "Prints n", "Adds a tab", "Ends the program"], answer: 0, explain: "It's the new-line escape." },
        { q: "Print(\"Hi\") gives…", code: "Print(\"Hi\")", options: ["NameError", "Hi", "SyntaxError: missing colon", "Nothing"], answer: 0, explain: "Python is case-sensitive; the function is print." },
        { q: "print(\"A\", end=\"\") followed by print(\"B\") shows…", options: ["AB", "A\nB", "A B", "B"], answer: 0, explain: "end=\"\" removes the new line after A." },
      ],
    },
  ],
};

export const PY02_VARIABLES: LearnModule = {
  id: "variables-types",
  title: "Variables and data types",
  titleHi: "वेरिएबल और डेटा टाइप",
  blurb: "Store values in variables, learn the main types (int, float, str, bool, None), convert between them, and read input from the user.",
  lessons: [
    {
      id: "variables",
      title: "Variables",
      oneLine: "A variable is a name that points to a value. You create one just by assigning: age = 21. No keyword, no type needed, and you can change it anytime.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Step 1: Creating variables" },
        py("Creating and changing variables", src`
name = "Asha"            # a variable called name holding "Asha"
age = 21                 # a variable called age holding 21
print(name, age)

age = age + 1            # calculate the right side (22), then store it in age
print(name, "is now", age)

city = "Patna"
city = "Pune"            # the old value is replaced
print(city)
`, "Asha 21\nAsha is now 22\nPune"),
        { t: "table", head: ["Piece of `age = 21`", "Meaning"], rows: [["`age`", "The variable's **name**"], ["`=`", "**Assign**: store the value on the right in the name on the left. It does NOT mean \"equals\" in maths"], ["`21`", "The value"]] },
        { t: "example", title: "What happens in age = age + 1", steps: ["Python first works out the right side: age + 1 → 21 + 1 → 22.", "Then it stores 22 in age.", "The old value 21 is forgotten."], answer: "= means \"calculate the right side, then store it on the left\"." },
        { t: "h", text: "Step 2: Python tricks with variables" },
        py("Multiple assignment and swapping", src`
a, b, c = 1, 2, 3        # three variables in one line
print(a, b, c)

x = y = 0                # both start at 0
print(x, y)

a, b = b, a              # swap two values: no temp variable needed!
print(a, b)
`, "1 2 3\n0 0\n2 1"),
        py("A variable can change its type", src`
value = 10
print(value, type(value))
value = "ten"            # now it holds a string
print(value, type(value))
`, "10 <class 'int'>\nten <class 'str'>", "Python is **dynamically typed**: the value has a type, the name doesn't. `type()` tells you a value's type."),
        { t: "h", text: "Step 3: Naming rules" },
        { t: "table", head: ["Rule", "✅ Good", "❌ Bad"], rows: [
          ["Letters, digits and _ only; can't start with a digit", "`player1`, `_count`", "`1player`, `my-name`, `my name`"],
          ["Case-sensitive", "`age` and `Age` are different", ""],
          ["Not a keyword", "`class_name`", "`class`, `if`, `for`, `True`"],
          ["Style: **snake_case** (lowercase with underscores)", "`total_price`, `is_logged_in`", "`TotalPrice`, `totalprice`"],
          ["Constants in CAPITALS (a convention)", "`GST_RATE = 18`", ""],
        ] },
        { t: "analogy", text: "A variable is a name tag tied to a value. `age = 21` ties the tag \"age\" to the number 21. `age = 22` moves the tag to a new value. The tag can be tied to a number now and to a word later." },
        { t: "trap", text: "Using a variable before creating it gives `NameError: name 'total' is not defined`. Also don't use built-in names like `list`, `str`, `sum` or `print` as variable names: `sum = 10` breaks the `sum()` function for the rest of the program." },
        { t: "trick", text: "**snake_case for variables, CAPITALS for constants, and = means \"store\".**" },
        { t: "exam", items: ["How do you declare a variable in Python? (Just assign: x = 5.)", "What is dynamic typing?", "How do you swap two variables in Python? (a, b = b, a)", "Which variable names are valid? (No leading digit, no spaces or dashes, not a keyword.)", "What is PEP 8? (Python's style guide: snake_case, 4-space indentation, and so on.)"] },
        { t: "recap", items: ["Create a variable by assigning: name = value", "= stores the right side into the left name", "a, b = b, a swaps", "snake_case names; constants in CAPITALS", "type(x) shows the type of a value"] },
      ],
      quiz: [
        { q: "x = 5, then x = x * 2. What is x?", options: ["10", "5", "7", "x * 2"], answer: 0, explain: "Right side first: 5 * 2 = 10." },
        { q: "Which variable name is valid?", options: ["total_marks", "2nd_place", "total-marks", "for"], answer: 0, explain: "No leading digit, no dash, not a keyword." },
        { q: "What does a, b = b, a do?", options: ["Swaps a and b", "Makes both equal to a", "Gives an error", "Deletes b"], answer: 0, explain: "Tuple unpacking swaps in one line." },
        { q: "Which naming style does Python recommend for variables?", options: ["snake_case", "camelCase", "PascalCase", "kebab-case"], answer: 0, explain: "From the PEP 8 style guide." },
        { q: "print(score) before score is created gives…", options: ["NameError", "0", "None", "An empty line"], answer: 0, explain: "The name doesn't exist yet." },
      ],
    },
    {
      id: "data-types",
      title: "Data types: int, float, str, bool and None",
      oneLine: "Every value has a type. Whole numbers are int, decimals are float, text is str, True/False is bool, and None means \"no value\". type() tells you which one you have.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: The basic types" },
        py("The five basic types", src`
age = 21                 # int: whole numbers
price = 99.5             # float: numbers with a decimal point
name = "Ravi"            # str: text, in quotes
is_student = True        # bool: True or False
result = None            # None: "no value yet"

print(type(age))
print(type(price))
print(type(name))
print(type(is_student))
print(type(result))
`, "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>\n<class 'NoneType'>"),
        { t: "table", head: ["Type", "Examples", "Used for"], rows: [
          ["`int`", "`0`, `42`, `-7`, `1_000_000`", "Counting: age, marks, quantity"],
          ["`float`", "`3.14`, `99.5`, `-0.5`, `2.0`", "Measurements: price, height, percentage"],
          ["`str`", "`\"Hi\"`, `'Asha'`, `\"\"\"long text\"\"\"`", "Text: names, messages, emails"],
          ["`bool`", "`True`, `False` (capital T and F)", "Yes/no: is_logged_in, has_paid"],
          ["`NoneType`", "`None`", "Nothing yet / no result"],
        ] },
        { t: "p", text: "Later you'll meet the collection types: `list` `[1, 2]`, `tuple` `(1, 2)`, `dict` `{\"a\": 1}` and `set` `{1, 2}`." },
        { t: "h", text: "Step 2: Numbers have superpowers (and one weakness)" },
        py("int and float in action", src`
print(2 ** 100)          # ints can be as big as you like
print(10 / 2)            # / always gives a float
print(7 // 2)            # // gives a whole number (floor division)
print(0.1 + 0.2)         # floats are stored in binary, so tiny errors appear
print(round(0.1 + 0.2, 2))
print(1_000_000 + 1)     # underscores make big numbers readable
`, "1267650600228229401496703205376\n5.0\n3\n0.30000000000000004\n0.3\n1000001"),
        { t: "p", text: "Most languages limit an int to about 2 billion or 9 quintillion. Python's int has **no limit**. Floats, on the other hand, can't store most decimals exactly (in any language), so round them when you display money." },
        { t: "h", text: "Step 3: Strings: single, double or triple quotes" },
        py("Three ways to write strings", src`
a = 'single quotes'
b = "double quotes"
c = """triple quotes
can span lines"""
print(a)
print(b)
print(c)
print("It's fine to mix: 'like this'")
`, "single quotes\ndouble quotes\ntriple quotes\ncan span lines\nIt's fine to mix: 'like this'"),
        { t: "analogy", text: "Types are like containers in a kitchen: a measuring cup (int/float) for amounts, a label (str) for names, a switch (bool) for on/off, and an empty box (None) that says \"nothing here yet\". You use each one differently, so Python needs to know which one it holds." },
        { t: "trap", text: "`\"25\"` (in quotes) is a **string**, not a number: `\"25\" + \"5\"` is `\"255\"`. And `true` (lowercase) is an error: Python's booleans are `True` and `False`. Never compare floats with ==, for example `0.1 + 0.2 == 0.3` is False." },
        { t: "trick", text: "**Quotes → str. Dot → float. Whole → int. Capital T/F → bool. Nothing → None.**" },
        { t: "exam", items: ["What are Python's built-in data types? (int, float, complex, str, bool, NoneType, list, tuple, dict, set, frozenset, bytes.)", "Difference between / and //?", "Why is 0.1 + 0.2 not 0.3?", "Is there a maximum int in Python? (No, ints have arbitrary precision.)", "Mutable vs immutable types? (int, float, str, tuple are immutable; list, dict, set are mutable.)"] },
        { t: "recap", items: ["int = whole numbers, float = decimals", "str = text in quotes, bool = True/False, None = no value", "type(x) shows the type", "/ always returns a float; // returns a whole number", "Python ints have no size limit"] },
      ],
      quiz: [
        { q: "type(3.0) is…", options: ["float", "int", "str", "decimal"], answer: 0, explain: "A decimal point makes it a float." },
        { q: "Which is a valid boolean in Python?", options: ["True", "true", "TRUE", "\"True\""], answer: 0, explain: "Capital T; the quoted one is a string." },
        { q: "What is 10 / 5?", options: ["2.0", "2", "\"2\"", "Error"], answer: 0, explain: "/ always returns a float." },
        { q: "What does None mean?", options: ["No value", "Zero", "False", "An empty string"], answer: 0, explain: "It's its own type: NoneType." },
        { q: "\"4\" + \"4\" is…", options: ["\"44\"", "8", "\"8\"", "Error"], answer: 0, explain: "Strings are joined." },
      ],
    },
    {
      id: "conversion-input",
      title: "Type conversion and user input",
      oneLine: "int(), float(), str() and bool() convert values between types. input() reads what the user types, but always returns a string, so convert it before doing maths.",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Converting between types" },
        py("Conversions", src`
print(int("42") + 8)         # text "42" → number 42
print(float("3.5") * 2)      # text "3.5" → 3.5
print(str(100) + " marks")   # number → text, so it can be joined
print(int(9.99))             # int() cuts off the decimals (doesn't round)
print(round(9.99))           # round() rounds
print(bool(0), bool(5), bool(""), bool("hi"))
`, "50\n7.0\n100 marks\n9\n10\nFalse True False True"),
        { t: "table", head: ["Function", "Converts to", "Example", "Result"], rows: [
          ["`int(x)`", "Whole number", "`int(\"7\")`, `int(7.9)`", "7, 7"],
          ["`float(x)`", "Decimal", "`float(\"2.5\")`, `float(3)`", "2.5, 3.0"],
          ["`str(x)`", "Text", "`str(25)`", "\"25\""],
          ["`bool(x)`", "True/False", "`bool(0)`, `bool(\"a\")`", "False, True"],
        ] },
        { t: "p", text: "**Falsy values** (become False): `0`, `0.0`, `\"\"` (empty string), `None`, and empty collections `[]`, `{}`, `()`. **Everything else is truthy.**" },
        { t: "h", text: "Step 2: When conversion fails" },
        py("Errors you will meet", src`
try:
    int("abc")                       # text that isn't a number
except ValueError as e:
    print("ValueError:", e)

try:
    print("Age: " + 21)              # can't join text and a number
except TypeError as e:
    print("TypeError:", e)

print("Age: " + str(21))             # fix: convert first
print("Age:", 21)                    # or let print add them
`, "ValueError: invalid literal for int() with base 10: 'abc'\nTypeError: can only concatenate str (not \"int\") to str\nAge: 21\nAge: 21", "`try / except` catches an error so the program can continue. You'll learn it properly in the Errors module."),
        { t: "h", text: "Step 3: Reading input from the user" },
        py("Reading input", src`
name = input("What is your name? ")          # always returns a str
year = int(input("Which year were you born? "))   # convert to int for maths
print(f"Hello {name}! You turn {2026 - year} this year.")
`, "What is your name? Asha\nWhich year were you born? 2008\nHello Asha! You turn 18 this year.", "The text after each `?` (Asha, 2008) is what the user typed. `f\"...{ }...\"` is an f-string: it puts values inside text (covered in the Strings module)."),
        py("Simple calculator", src`
a = int(input("First number: "))
b = int(input("Second number: "))
print(a, "+", b, "=", a + b)
print(a, "-", b, "=", a - b)
print(a, "*", b, "=", a * b)
print(a, "/", b, "=", a / b)
`, "First number: 12\nSecond number: 5\n12 + 5 = 17\n12 - 5 = 7\n12 * 5 = 60\n12 / 5 = 2.4"),
        { t: "example", title: "Why we need int() around input()", steps: ["The user types 12. input() returns the text \"12\".", "Without int(): \"12\" + \"5\" = \"125\" (joined like words).", "With int(): 12 + 5 = 17."], answer: "input() always gives a string: convert it before doing maths." },
        { t: "analogy", text: "input() is like a receptionist who writes down whatever you say on paper. Even if you say \"twelve\", it's written as text. int() is the accountant who reads that paper and turns it into a number you can add." },
        { t: "trap", text: "Forgetting to convert input is the #1 beginner bug: `age = input(\"Age: \")` then `age + 1` gives a TypeError. Also `int(\"3.5\")` fails; use `float()` for decimals, or `int(float(\"3.5\"))`." },
        { t: "trick", text: "**input() → str, always. Wrap it: int(input(...)) or float(input(...)).**" },
        { t: "exam", items: ["What type does input() return? (Always str.)", "Implicit vs explicit type conversion? (Python converts int to float automatically in 3 + 2.5; you convert explicitly with int(), str()…)", "What are falsy values in Python?", "Difference between int(9.9) and round(9.9)? (9 vs 10.)"] },
        { t: "recap", items: ["int(), float(), str(), bool() convert values", "int() cuts off decimals; round() rounds", "Falsy: 0, 0.0, \"\", None and empty collections", "input() always returns a string", "Convert input before maths: int(input(\"...\"))"] },
      ],
      quiz: [
        { q: "What type does input() return?", options: ["str", "int", "Depends on what's typed", "float"], answer: 0, explain: "Always a string." },
        { q: "int(7.9) is…", options: ["7", "8", "7.9", "Error"], answer: 0, explain: "int() cuts off the decimal part." },
        { q: "bool(\"\") is…", options: ["False", "True", "None", "Error"], answer: 0, explain: "An empty string is falsy." },
        { q: "\"Marks: \" + 90 gives…", options: ["TypeError", "Marks: 90", "Marks:90", "90"], answer: 0, explain: "Convert with str(90) first." },
        { q: "Which converts \"3.5\" to a number?", options: ["float(\"3.5\")", "int(\"3.5\")", "str(3.5)", "number(\"3.5\")"], answer: 0, explain: "int(\"3.5\") raises a ValueError." },
      ],
    },
  ],
};

export const PY03_OPERATORS_STRINGS: LearnModule = {
  id: "operators-strings",
  title: "Operators and strings",
  titleHi: "ऑपरेटर और स्ट्रिंग",
  blurb: "Do maths and comparisons, combine conditions, then master strings: indexing, slicing, methods and f-strings.",
  lessons: [
    {
      id: "operators",
      title: "Operators: maths, comparison and logic",
      oneLine: "Arithmetic operators do maths (+ - * / // % **), comparison operators answer True or False (== != > <), and logical operators combine conditions (and, or, not).",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: Arithmetic" },
        py("Maths operators", src`
print(17 + 5)     # add
print(17 - 5)     # subtract
print(17 * 5)     # multiply
print(17 / 5)     # divide (always a float)
print(17 // 5)    # floor division: whole part only
print(17 % 5)     # modulus: the remainder
print(2 ** 5)     # power: 2 × 2 × 2 × 2 × 2
`, "22\n12\n85\n3.4\n3\n2\n32"),
        { t: "example", title: "17 // 5 and 17 % 5", steps: ["How many times does 5 fit in 17? **3** times (that's 15). So 17 // 5 = 3.", "What's left over? 17 − 15 = **2**. So 17 % 5 = 2.", "Use `n % 2 == 0` to check if n is even, and `n % 10` to get the last digit."], answer: "// = how many times, % = what's left." },
        py("Order of operations", src`
print(2 + 3 * 4)       # * before +
print((2 + 3) * 4)     # brackets first
print(2 ** 3 ** 2)     # ** goes right to left: 3 ** 2 = 9, then 2 ** 9
print(-7 // 2)         # floor division rounds DOWN (towards minus infinity)
`, "14\n20\n512\n-4"),
        { t: "p", text: "Order: **brackets → `**` → `*` `/` `//` `%` → `+` `-`** (like BODMAS). When unsure, add brackets: they make code easier to read too." },
        py("Shortcut assignment", src`
score = 10
score += 5      # score = score + 5  → 15
score -= 3      # score = score - 3  → 12
score *= 2      # score = score * 2  → 24
score //= 4     # score = score // 4 → 6
print(score)
`, "6", "Python has no `++` or `--`. Use `count += 1`."),
        { t: "h", text: "Step 2: Comparison and logic (answers are True/False)" },
        py("Comparisons and logic", src`
age = 20
has_id = False

print(age > 18)              # greater than
print(age == 20)             # equal to (two = signs!)
print(age != 20)             # not equal
print(18 <= age < 60)        # chained: between 18 and 60
print(age >= 18 and has_id)  # and: both must be True
print(age >= 18 or has_id)   # or: at least one True
print(not has_id)            # not: flips True/False
`, "True\nTrue\nFalse\nTrue\nFalse\nTrue\nTrue"),
        { t: "table", head: ["A", "B", "A and B", "A or B", "not A"], rows: [["True", "True", "True", "True", "False"], ["True", "False", "False", "True", "False"], ["False", "True", "False", "True", "True"], ["False", "False", "False", "False", "True"]] },
        { t: "h", text: "Step 3: Membership and identity" },
        py("in and is", src`
print("a" in "Patna")        # is "a" inside the text?
print(3 in [1, 2, 3])        # is 3 in the list?
print("z" not in "Patna")

a = [1, 2]
b = [1, 2]
c = a
print(a == b)                # same VALUE? yes
print(a is b)                # same OBJECT in memory? no, two separate lists
print(a is c)                # c is just another name for a
`, "True\nTrue\nTrue\nTrue\nFalse\nTrue"),
        { t: "analogy", text: "`==` asks \"do these two bags contain the same things?\" `is` asks \"is this literally the same bag?\" Two bags can hold identical items and still be two different bags." },
        { t: "trap", text: "`=` stores a value; `==` compares. Writing `if age = 18:` is a SyntaxError. Use `is` only for `None`: write `if x is None:`, and `==` for everything else." },
        { t: "trick", text: "**// how many times, % what's left, ** power. = stores, == compares.**" },
        { t: "exam", items: ["Difference between / and //?", "What does % return? Give a use (even/odd, last digit).", "Difference between == and is?", "What are and, or, not? What is short-circuit evaluation? (and stops at the first False, or at the first True.)", "Does Python have ++? (No.)"] },
        { t: "recap", items: ["+ - * / // % ** for maths", "Brackets → ** → * / // % → + -", "Comparisons return True/False; chains like 0 < x < 10 work", "and, or, not combine conditions", "in checks membership; is checks identity (use it for None)"] },
      ],
      quiz: [
        { q: "What is 20 % 6?", options: ["2", "3", "3.33", "0"], answer: 0, explain: "6 fits 3 times (18), 2 is left." },
        { q: "What is 2 + 3 * 2?", options: ["8", "10", "12", "7"], answer: 0, explain: "Multiply first: 2 + 6." },
        { q: "True and False is…", options: ["False", "True", "None", "Error"], answer: 0, explain: "and needs both to be True." },
        { q: "How do you add 1 to count in Python?", options: ["count += 1", "count++", "++count", "count =+ 1"], answer: 0, explain: "Python has no ++." },
        { q: "Which check is correct for None?", options: ["x is None", "x = None", "x === None", "x equals None"], answer: 0, explain: "Use is for None." },
      ],
    },
    {
      id: "strings",
      title: "Strings: indexing, slicing and methods",
      oneLine: "A string is a sequence of characters. Each character has a position (index) starting at 0. Slicing [start:stop] cuts out a part, and string methods like .upper(), .strip(), .split() and .replace() return new strings.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Indexing (one character)" },
        { t: "diagram", text: " P   Y   T   H   O   N\n 0   1   2   3   4   5     ← index from the start\n-6  -5  -4  -3  -2  -1     ← index from the end" },
        py("Indexing", src`
word = "PYTHON"
print(word[0])       # first character
print(word[5])       # sixth character
print(word[-1])      # last character
print(word[-2])      # second from the end
print(len(word))     # length: number of characters
`, "P\nN\nN\nO\n6"),
        { t: "h", text: "Step 2: Slicing (a part of the string)" },
        { t: "p", text: "`text[start:stop:step]`: from `start` **up to but not including** `stop`. Leave start out to begin at 0; leave stop out to go to the end." },
        py("Slicing", src`
word = "PYTHON"
print(word[0:3])     # indexes 0, 1, 2
print(word[2:])      # from index 2 to the end
print(word[:4])      # from the start up to index 3
print(word[-3:])     # last 3 characters
print(word[::2])     # every 2nd character
print(word[::-1])    # step -1: reversed!
`, "PYT\nTHON\nPYTH\nHON\nPTO\nNOHTYP"),
        { t: "h", text: "Step 3: String methods" },
        py("Useful string methods", src`
text = "  Hello, Python World  "
print(text.strip())                       # remove spaces at both ends
print(text.strip().lower())               # all lowercase
print(text.strip().upper())               # all uppercase
print(text.strip().replace("Python", "Java"))
print("hello world".title())              # Capitalize Each Word
print("banana".count("a"))                # how many times
print("banana".find("n"))                 # first index, or -1
print("banana".find("x"))
print("photo.jpg".endswith(".jpg"))
print("a,b,c".split(","))                 # text → list
print("-".join(["2026", "10", "18"]))     # list → text
`, "Hello, Python World\nhello, python world\nHELLO, PYTHON WORLD\nHello, Java World\nHello World\n3\n2\n-1\nTrue\n['a', 'b', 'c']\n2026-10-18"),
        { t: "table", head: ["Method", "Does", "Example → result"], rows: [
          ["`.strip()`", "Removes spaces (and newlines) at both ends", "`\" hi \".strip()` → `\"hi\"`"],
          ["`.lower()` / `.upper()`", "Changes case", "`\"Hi\".lower()` → `\"hi\"`"],
          ["`.replace(a, b)`", "Replaces every a with b", "`\"a-b\".replace(\"-\", \"+\")` → `\"a+b\"`"],
          ["`.split(sep)`", "Breaks into a list", "`\"a b\".split()` → `['a', 'b']`"],
          ["`sep.join(list)`", "Joins a list into one string", "`\", \".join([\"a\", \"b\"])` → `\"a, b\"`"],
          ["`.find(x)`", "Index of x, or −1", "`\"abc\".find(\"c\")` → `2`"],
          ["`.startswith(x)` / `.endswith(x)`", "True/False", "`\"file.py\".endswith(\".py\")` → `True`"],
          ["`.isdigit()`", "Only digits?", "`\"123\".isdigit()` → `True`"],
        ] },
        { t: "h", text: "Step 4: Strings can't be changed (immutable)" },
        py("Immutability", src`
name = "ravi"
try:
    name[0] = "R"                # not allowed
except TypeError as e:
    print("Error:", e)

name = "R" + name[1:]            # build a NEW string instead
print(name)
print("ravi".capitalize())       # or use a method
`, "Error: 'str' object does not support item assignment\nRavi\nRavi"),
        { t: "analogy", text: "A string is a row of numbered train seats, starting at seat 0. Indexing picks one passenger; slicing picks a group of seats. And the train is sealed: you can't swap one passenger, you build a new train with the changes." },
        { t: "trap", text: "The stop index is **not included**: `\"PYTHON\"[0:3]` is `\"PYT\"`, not `\"PYTH\"`. Indexing past the end (`word[10]`) is an IndexError, but slicing past the end (`word[2:100]`) is safe. And methods return a new string: `name.upper()` alone does nothing; write `name = name.upper()`." },
        { t: "trick", text: "**Index from 0. Slice [start:stop) stops before stop. [::-1] reverses.**" },
        { t: "exam", items: ["Reverse a string in Python. (s[::-1])", "Check if a string is a palindrome. (s == s[::-1])", "Are strings mutable? (No.)", "Difference between split() and join()?", "Count vowels in a string."] },
        { t: "recap", items: ["Indexes start at 0; −1 is the last character", "text[a:b] = from a up to (not including) b", "text[::-1] reverses", "strip, lower, upper, replace, split, join, find, count", "Strings are immutable: methods return new strings"] },
      ],
      quiz: [
        { q: "\"HELLO\"[1] is…", options: ["E", "H", "L", "Error"], answer: 0, explain: "Index 0 is H." },
        { q: "\"HELLO\"[1:3] is…", options: ["EL", "ELL", "HEL", "EL L"], answer: 0, explain: "Indexes 1 and 2; 3 is not included." },
        { q: "\"abc\"[::-1] is…", options: ["cba", "abc", "a", "Error"], answer: 0, explain: "Step −1 reverses." },
        { q: "\"a,b\".split(\",\") gives…", options: ["['a', 'b']", "\"ab\"", "('a', 'b')", "['a,b']"], answer: 0, explain: "split returns a list." },
        { q: "name = \"asha\"; name.upper(); print(name) prints…", options: ["asha", "ASHA", "Asha", "Error"], answer: 0, explain: "upper() returns a new string; name isn't changed." },
      ],
    },
    {
      id: "f-strings",
      title: "f-strings and formatting output",
      oneLine: "An f-string (f\"...\") puts variables and expressions straight into text using {curly braces}, and can format numbers: 2 decimal places, commas, padding and percentages.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: The basics" },
        py("f-strings", src`
name = "Asha"
marks = 87.456

print(f"Hello, {name}!")                 # a variable inside text
print(f"Next year: {2026 + 1}")          # any expression works
print(f"{name.upper()} scored {round(marks)}")
print(f"Marks: {marks:.2f}")             # 2 decimal places
`, "Hello, Asha!\nNext year: 2027\nASHA scored 87\nMarks: 87.46"),
        { t: "p", text: "Without f-strings you'd write `\"Hello, \" + name + \"!\"` and convert numbers with `str()`. f-strings are shorter, faster and easier to read: use them everywhere." },
        { t: "h", text: "Step 2: The format part after the colon" },
        py("Formatting numbers and text", src`
price = 1234567.5
name = "Asha"
print(f"Price: ₹{price:,.2f}")     # comma separators + 2 decimals
print(f"[{name:>8}]")              # right-align in 8 spaces
print(f"[{name:<8}]")              # left-align
print(f"[{name:^8}]")              # centre
print(f"{7:03d}")                  # pad with zeros to 3 digits
print(f"{0.256:.1%}")              # as a percentage
x = 5
print(f"{x = }")                   # debug: shows the name and the value
`, "Price: ₹1,234,567.50\n[    Asha]\n[Asha    ]\n[  Asha  ]\n007\n25.6%\nx = 5"),
        { t: "table", head: ["Format", "Meaning", "Example", "Result"], rows: [
          ["`:.2f`", "2 decimal places", "`f\"{3.14159:.2f}\"`", "3.14"],
          ["`:,`", "Thousands separators", "`f\"{1000000:,}\"`", "1,000,000"],
          ["`:>10` `:<10` `:^10`", "Right / left / centre in 10 spaces", "`f\"{'hi':>5}\"`", "\"   hi\""],
          ["`:05d`", "Zero-pad to 5 digits", "`f\"{42:05d}\"`", "00042"],
          ["`:.1%`", "Percentage", "`f\"{0.5:.1%}\"`", "50.0%"],
        ] },
        { t: "h", text: "Step 3: A neat bill" },
        py("Printing a bill", src`
items = [("Pen", 2, 10.0), ("Notebook", 3, 45.5), ("Bag", 1, 799.0)]

print(f"{'Item':<10}{'Qty':>5}{'Total':>10}")
total = 0
for name, qty, price in items:          # loops come in the next module
    line = qty * price
    total += line
    print(f"{name:<10}{qty:>5}{line:>10.2f}")
print(f"{'Grand total':<15}{total:>10.2f}")
`, "Item        Qty     Total\nPen           2     20.00\nNotebook      3    136.50\nBag           1    799.00\nGrand total        955.50"),
        { t: "h", text: "Step 4: Older ways you'll see in old code" },
        py("format() and %", src`
name, age = "Ravi", 21
print("Name: {}, Age: {}".format(name, age))   # str.format()
print("Name: %s, Age: %d" % (name, age))       # the oldest style
print(f"Name: {name}, Age: {age}")             # modern: use this
`, "Name: Ravi, Age: 21\nName: Ravi, Age: 21\nName: Ravi, Age: 21"),
        { t: "analogy", text: "An f-string is a form with blanks: \"Dear {name}, your bill is ₹{amount:.2f}\". Python fills each blank with the value, already formatted the way you asked." },
        { t: "trap", text: "Forgetting the **f** prints the braces literally: `\"Hi {name}\"` shows `Hi {name}`. Inside an f-string with double quotes, use single quotes for inner strings: `f\"{'Item':<10}\"`. To print a real `{`, double it: `{{`." },
        { t: "trick", text: "**f + {value:format}. .2f = money, , = thousands, > < ^ = align.**" },
        { t: "exam", items: ["What is an f-string? (Formatted string literal, Python 3.6+.)", "Format a float to 2 decimal places. (f\"{x:.2f}\")", "Ways to format strings in Python? (f-strings, str.format(), % formatting.)", "Print a number with thousands separators."] },
        { t: "recap", items: ["f\"...{expr}...\" puts values in text", ":.2f two decimals, :, separators, :>10 right-align", ":05d zero-padding, :.1% percentage", "f\"{x = }\" for quick debugging"] },
      ],
      quiz: [
        { q: "f\"{2 * 3}\" gives…", options: ["\"6\"", "\"2 * 3\"", "\"{2 * 3}\"", "Error"], answer: 0, explain: "Expressions are evaluated inside {}." },
        { q: "f\"{3.14159:.2f}\" gives…", options: ["3.14", "3.1", "3.14159", "3"], answer: 0, explain: ".2f = 2 decimal places." },
        { q: "\"Hi {name}\" (no f) prints…", options: ["Hi {name}", "Hi Asha", "Error", "Hi"], answer: 0, explain: "Without f, braces are plain text." },
        { q: "f\"{5:03d}\" gives…", options: ["005", "5.000", "500", "  5"], answer: 0, explain: "Zero-padded to 3 digits." },
      ],
    },
  ],
};

export const PY04_CONTROL: LearnModule = {
  id: "control-flow",
  title: "Decisions and loops",
  titleHi: "निर्णय और लूप",
  blurb: "Make decisions with if/elif/else and match, repeat work with for and while loops, and control loops with break and continue.",
  lessons: [
    {
      id: "if-else",
      title: "if, elif, else and match",
      oneLine: "if runs a block of code only when a condition is True. elif checks more conditions in order, and else runs when none matched. Python uses indentation (4 spaces) to mark the block.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: A simple if" },
        py("if", src`
temperature = 38
if temperature > 35:                  # the condition ends with a colon :
    print("It's hot. Drink water!")   # indented 4 spaces = inside the if
    print("Stay indoors at noon.")
print("Have a nice day.")             # not indented = always runs
`, "It's hot. Drink water!\nStay indoors at noon.\nHave a nice day."),
        { t: "p", text: "**Indentation is the rule, not a style choice.** Every line indented under the `if:` belongs to it. The first line that's back at the left edge is outside the if." },
        { t: "h", text: "Step 2: if / else and if / elif / else" },
        py("Even or odd", src`
n = 7
if n % 2 == 0:
    print(n, "is even")
else:
    print(n, "is odd")
`, "7 is odd"),
        py("Grade calculator", src`
marks = int(input("Enter your marks: "))

if marks >= 90:
    grade = "A"
elif marks >= 75:          # only checked if the first was False
    grade = "B"
elif marks >= 60:
    grade = "C"
elif marks >= 40:
    grade = "D"
else:                      # none of the above
    grade = "F"
print("Grade:", grade)
`, "Enter your marks: 82\nGrade: B"),
        { t: "diagram", text: "marks = 82\n\n82 >= 90 ? No  ─┐\n82 >= 75 ? Yes ─┴─▶ grade = \"B\" → skip all the rest" },
        { t: "h", text: "Step 3: Shortcuts" },
        py("One-line if and truthiness", src`
age = 16
status = "adult" if age >= 18 else "minor"     # conditional expression
print(status)

name = ""
if name:                       # an empty string is falsy
    print("Hello", name)
else:
    print("Name is empty")

marks = [70, 85]
if marks and len(marks) >= 2:  # check it's not empty before using it
    print("Average:", sum(marks) / len(marks))
`, "minor\nName is empty\nAverage: 77.5"),
        { t: "h", text: "Step 4: match (Python 3.10+)" },
        py("match-case", src`
day = 6
match day:
    case 6 | 7:              # | means "or"
        print("Weekend")
    case 1 | 2 | 3 | 4 | 5:
        print("Weekday")
    case _:                  # _ matches anything else (like else)
        print("Invalid day")
`, "Weekend"),
        { t: "analogy", text: "if/elif/else is a traffic police officer checking vehicles one rule at a time: \"Ambulance? Let it go. Bus? Bus lane. Car? Main road. Anything else? Side road.\" Once a rule matches, the rest aren't checked." },
        { t: "trap", text: "Forgetting the colon `:` or the indentation gives a SyntaxError or IndentationError. Order matters in elif chains: if you check `marks >= 40` first, everyone with 40+ gets D. Put the strictest condition first. And `if x == 1 or 2:` is always True; write `if x == 1 or x == 2:` or `if x in (1, 2):`." },
        { t: "trick", text: "**Colon, then indent 4 spaces. Strictest condition first.**" },
        { t: "exam", items: ["Why is indentation important in Python? (It defines code blocks.)", "Difference between if-elif-else and several separate ifs? (elif stops at the first match.)", "What is the ternary operator in Python? (a if condition else b)", "What does match do? (Structural pattern matching, 3.10+.)", "Write a program for the largest of three numbers."] },
        { t: "recap", items: ["if condition: then an indented block", "elif checks the next condition; else catches the rest", "Only the first matching branch runs", "x if cond else y in one line", "match/case for many fixed options"] },
      ],
      quiz: [
        { q: "What ends an if line?", options: [":", ";", "{", "then"], answer: 0, explain: "if x > 5:" },
        { q: "How does Python know which lines are inside an if?", options: ["Indentation", "Curly braces", "The end keyword", "Semicolons"], answer: 0, explain: "Usually 4 spaces." },
        { q: "marks = 95. Which grade does the program above give?", options: ["A", "B", "A and B", "F"], answer: 0, explain: "The first match wins; the rest are skipped." },
        { q: "\"yes\" if 5 > 3 else \"no\" gives…", options: ["\"yes\"", "\"no\"", "True", "Error"], answer: 0, explain: "5 > 3 is True." },
        { q: "if x == 1 or 2: is…", options: ["Always True (a common bug)", "True only when x is 1 or 2", "A SyntaxError", "Always False"], answer: 0, explain: "2 on its own is truthy. Write x in (1, 2)." },
      ],
    },
    {
      id: "for-loops",
      title: "for loops and range()",
      oneLine: "A for loop repeats a block once for each item in a sequence: each item of a list, each character of a string, or each number produced by range().",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Loop over items" },
        py("for over a list and a string", src`
fruits = ["apple", "banana", "mango"]
for fruit in fruits:              # fruit takes each value in turn
    print("I like", fruit)

for ch in "Hi!":                  # a string is a sequence of characters
    print(ch)
`, "I like apple\nI like banana\nI like mango\nH\ni\n!"),
        { t: "h", text: "Step 2: range() makes numbers" },
        py("range", src`
print(list(range(5)))             # 0 up to 4 (5 is not included)
print(list(range(2, 6)))          # 2 up to 5
print(list(range(1, 10, 2)))      # step 2
print(list(range(5, 0, -1)))      # counting down
`, "[0, 1, 2, 3, 4]\n[2, 3, 4, 5]\n[1, 3, 5, 7, 9]\n[5, 4, 3, 2, 1]"),
        { t: "table", head: ["Call", "Numbers"], rows: [["`range(stop)`", "0, 1, …, stop−1"], ["`range(start, stop)`", "start, …, stop−1"], ["`range(start, stop, step)`", "start, start+step, … (before stop)"]] },
        py("Multiplication table", src`
n = 7
for i in range(1, 11):
    print(n, "x", i, "=", n * i)
`, "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70"),
        { t: "h", text: "Step 3: Common loop patterns" },
        py("Total, maximum and counting", src`
total = 0                         # 1. accumulator: start at 0
for i in range(1, 101):
    total += i                    # add each number
print("Sum of 1 to 100:", total)

marks = [78, 92, 65, 88]
highest = marks[0]                # 2. track the best so far
for m in marks:
    if m > highest:
        highest = m
print("Highest:", highest)

passed = 0                        # 3. counter
for m in marks:
    if m >= 70:
        passed += 1
print("Passed:", passed)
`, "Sum of 1 to 100: 5050\nHighest: 92\nPassed: 3"),
        { t: "table", head: ["Loop round", "m", "m > highest?", "highest after"], rows: [["start", "", "", "78"], ["1", "78", "No", "78"], ["2", "92", "**Yes**", "92"], ["3", "65", "No", "92"], ["4", "88", "No", "92"]], caption: "Dry run of the maximum" },
        py("enumerate: index and value together", src`
fruits = ["apple", "banana", "mango"]
for index, fruit in enumerate(fruits, start=1):
    print(index, fruit)
`, "1 apple\n2 banana\n3 mango"),
        { t: "h", text: "Step 4: Nested loops (a loop inside a loop)" },
        py("Star pattern and a grid", src`
for row in range(1, 5):
    print("*" * row)              # "*" * 3 = "***"

for i in range(1, 4):
    for j in range(1, 4):         # runs fully for every i
        print(i * j, end=" ")
    print()                       # new line after each row
`, "*\n**\n***\n****\n1 2 3\n2 4 6\n3 6 9"),
        { t: "analogy", text: "A for loop is a teacher taking attendance: go through the register one name at a time and do the same thing for each. A nested loop is a clock: for every hour, the minute hand goes all the way around." },
        { t: "trap", text: "`range(1, 10)` stops at **9**, not 10. To include 10, write `range(1, 11)`. Don't change a list (add or remove items) while looping over it; loop over a copy (`for x in items[:]`) or build a new list instead." },
        { t: "trick", text: "**for item in things: … range(start, stop) stops before stop.**" },
        { t: "exam", items: ["Print the multiplication table of n.", "Sum of the first n natural numbers.", "Print patterns (right triangle of stars, pyramid).", "What does enumerate() do?", "Factorial of a number using a loop."] },
        { t: "recap", items: ["for x in sequence: runs once per item", "range(start, stop, step), stop not included", "Patterns: accumulator, max-so-far, counter", "enumerate() gives index and value", "Nested loops: the inner loop runs fully each time"] },
      ],
      quiz: [
        { q: "list(range(3)) is…", options: ["[0, 1, 2]", "[1, 2, 3]", "[0, 1, 2, 3]", "[3]"], answer: 0, explain: "Starts at 0, stops before 3." },
        { q: "How many times does this print?", code: "for i in range(2, 8, 2):\n    print(i)", options: ["3 (2, 4, 6)", "4", "6", "8"], answer: 0, explain: "8 isn't included." },
        { q: "\"ab\" * 3 is…", options: ["\"ababab\"", "\"ab3\"", "Error", "6"], answer: 0, explain: "Repeating a string." },
        { q: "What does enumerate([\"a\", \"b\"]) give in a loop?", options: ["(0, \"a\"), (1, \"b\")", "\"a\", \"b\"", "0, 1", "Error"], answer: 0, explain: "Index and value pairs." },
      ],
    },
    {
      id: "while-loops",
      title: "while loops, break and continue",
      oneLine: "A while loop repeats as long as its condition is True; use it when you don't know in advance how many rounds you need. break exits a loop immediately, and continue skips to the next round.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: while" },
        py("Counting with while", src`
count = 1
while count <= 5:          # check the condition before every round
    print("Count:", count)
    count += 1             # change something, or it loops forever!
print("Done!")
`, "Count: 1\nCount: 2\nCount: 3\nCount: 4\nCount: 5\nDone!"),
        py("Sum of digits", src`
n = 4721
total = 0
while n > 0:
    digit = n % 10         # last digit
    total += digit
    n //= 10               # remove the last digit
print("Sum of digits:", total)
`, "Sum of digits: 14"),
        { t: "table", head: ["Round", "n", "digit = n % 10", "total", "n //= 10"], rows: [["1", "4721", "1", "1", "472"], ["2", "472", "2", "3", "47"], ["3", "47", "7", "10", "4"], ["4", "4", "4", "**14**", "0 → stop"]] },
        { t: "h", text: "Step 2: break and continue" },
        py("break and continue", src`
for n in range(1, 11):
    if n == 7:
        break              # leave the loop completely
    if n % 2 == 0:
        continue           # skip the rest of this round
    print(n)
`, "1\n3\n5"),
        { t: "table", head: ["Keyword", "Does", "Like…"], rows: [["`break`", "Exit the loop now", "Leaving a queue"], ["`continue`", "Skip to the next round", "Skipping one song in a playlist"], ["`pass`", "Do nothing (a placeholder)", "An empty slot to fill later"]] },
        { t: "h", text: "Step 3: A game loop" },
        py("Number guessing game", src`
secret = 37                    # in a real game: random.randint(1, 100)
tries = 0
while True:                    # loop "forever"…
    guess = int(input("Guess the number (1-100): "))
    tries += 1
    if guess > secret:
        print("Too high!")
    elif guess < secret:
        print("Too low!")
    else:
        print(f"Correct! You took {tries} tries.")
        break                  # …until break
`, "Guess the number (1-100): 50\nToo high!\nGuess the number (1-100): 30\nToo low!\nGuess the number (1-100): 37\nCorrect! You took 3 tries."),
        { t: "h", text: "Step 4: Loop else (runs only if there was no break)" },
        py("Prime check with for-else", src`
n = 29
for d in range(2, n):
    if n % d == 0:
        print(n, "is not prime, divisible by", d)
        break
else:                          # belongs to the for: no divisor was found
    print(n, "is prime")
`, "29 is prime"),
        { t: "table", head: ["Use", "When"], rows: [["`for`", "You know what to loop over (a list, a range, a string)"], ["`while`", "You loop until something happens (correct password, game over, n reaches 0)"]] },
        { t: "analogy", text: "A while loop is \"keep stirring while the tea isn't ready\". You don't know how many stirs; you keep checking. break is the moment the tea is ready and you stop at once." },
        { t: "trap", text: "An **infinite loop** happens when the condition never becomes False, usually because you forgot `count += 1`. Press **Ctrl + C** in the terminal to stop it. With `while True`, make sure every path eventually reaches `break`." },
        { t: "trick", text: "**for = known items, while = until something happens. break = exit, continue = skip.**" },
        { t: "exam", items: ["Difference between for and while?", "Difference between break, continue and pass?", "Reverse a number using a while loop.", "Check if a number is prime.", "What is the else clause on a loop?"] },
        { t: "recap", items: ["while condition: repeats while True", "Always change something so the loop can end", "break exits; continue skips to the next round", "while True + break for game and menu loops", "Loop else runs when no break happened"] },
      ],
      quiz: [
        { q: "What does break do?", options: ["Exits the loop immediately", "Skips one round", "Pauses the program", "Restarts the loop"], answer: 0, explain: "continue skips one round." },
        { q: "How many lines print?", code: "i = 0\nwhile i < 3:\n    print(i)\n    i += 1", options: ["3", "2", "4", "Infinite"], answer: 0, explain: "0, 1, 2." },
        { q: "What happens if you forget i += 1 above?", options: ["Infinite loop", "Error", "It prints once", "It prints nothing"], answer: 0, explain: "i stays 0, so i < 3 is always True." },
        { q: "Which keyword is a do-nothing placeholder?", options: ["pass", "continue", "skip", "none"], answer: 0, explain: "Useful for empty blocks." },
        { q: "n = 123; after n //= 10, n is…", options: ["12", "3", "12.3", "1"], answer: 0, explain: "It removes the last digit." },
      ],
    },
  ],
};
