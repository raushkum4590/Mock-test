import type { LearnModule } from "../types";
import { py, src } from "./helpers";

/** Python modules 9–11: errors and files, object-oriented programming, modules and the standard library. */
export const PY09_ERRORS_FILES: LearnModule = {
  id: "errors-files",
  title: "Errors and files",
  titleHi: "एरर और फ़ाइलें",
  blurb: "Handle errors without crashing (try/except/else/finally, raise, custom exceptions), then read and write text, CSV and JSON files.",
  lessons: [
    {
      id: "exceptions",
      title: "Handling errors: try, except, else, finally",
      oneLine: "An exception is an error that happens while the program runs. try/except catches it so the program can respond (show a message, ask again) instead of crashing. raise creates your own errors.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Reading an error message" },
        { t: "diagram", text: "Traceback (most recent call last):\n  File \"app.py\", line 3, in <module>      ← WHERE: file and line number\n    total = price / qty\n            ~~~~~~^~~~~\nZeroDivisionError: division by zero         ← WHAT: error type + message\n\nRead the LAST line first, then the line number above it." },
        { t: "table", head: ["Error", "When it happens", "Example"], rows: [
          ["`ValueError`", "Right type, wrong value", "`int(\"abc\")`"],
          ["`TypeError`", "Wrong type for the operation", "`\"5\" + 5`"],
          ["`ZeroDivisionError`", "Dividing by zero", "`10 / 0`"],
          ["`IndexError`", "List index doesn't exist", "`[1, 2][5]`"],
          ["`KeyError`", "Dictionary key doesn't exist", "`{}[\"x\"]`"],
          ["`NameError`", "Variable not defined", "`print(totl)`"],
          ["`FileNotFoundError`", "File doesn't exist", "`open(\"nope.txt\")`"],
          ["`AttributeError`", "Object has no such method/attribute", "`5.append(1)`"],
        ] },
        { t: "h", text: "Step 2: try / except" },
        py("Catching an error", src`
try:
    n = int("abc")                     # this line fails…
    print("This line is skipped")      # …so the rest of try is skipped
except ValueError:
    print("That's not a number!")      # …and except runs instead
print("The program keeps running.")
`, "That's not a number!\nThe program keeps running."),
        py("Several excepts, else and finally", src`
def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        return "Can't divide by zero"
    except TypeError:
        return "Numbers only, please"
    else:
        return result                  # runs only if there was NO error
    finally:
        print("divide() finished")     # ALWAYS runs, even after return

print(divide(10, 2))
print(divide(5, 0))
print(divide(5, "x"))
`, "divide() finished\n5.0\ndivide() finished\nCan't divide by zero\ndivide() finished\nNumbers only, please"),
        { t: "table", head: ["Block", "Runs when"], rows: [["`try`", "Always (until an error happens)"], ["`except X`", "An error of type X happened in try"], ["`else`", "No error happened in try"], ["`finally`", "Always, last: used for clean-up (closing files, connections)"]] },
        { t: "h", text: "Step 3: Ask again until the input is valid" },
        py("Safe number input", src`
while True:
    text = input("Enter your age: ")
    try:
        age = int(text)
        if age < 0:
            raise ValueError("negative")    # treat negatives as invalid too
        break                               # valid: leave the loop
    except ValueError:
        print("Please enter a valid age.")
print("Age saved:", age)
`, "Enter your age: abc\nPlease enter a valid age.\nEnter your age: -3\nPlease enter a valid age.\nEnter your age: 25\nAge saved: 25"),
        { t: "h", text: "Step 4: raise and custom exceptions" },
        py("Raising errors", src`
class InsufficientFundsError(Exception):     # your own error type
    pass

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > balance:
        raise InsufficientFundsError(f"Need ₹{amount}, have only ₹{balance}")
    return balance - amount

for amount in [200, -5, 800]:
    try:
        print("New balance:", withdraw(500, amount))
    except ValueError as e:
        print("Invalid:", e)
    except InsufficientFundsError as e:
        print("Failed:", e)
`, "New balance: 300\nInvalid: Amount must be positive\nFailed: Need ₹800, have only ₹500"),
        { t: "analogy", text: "try/except is a safety net under a trapeze artist. The artist (your code) tries the jump; if they fall (an error), the net (except) catches them and the show goes on. finally is the crew cleaning the stage after every show, whether the jump worked or not." },
        { t: "trap", text: "Never write a bare `except:` or `except Exception: pass`: it hides every bug, even typos, and makes problems impossible to find. Catch the **specific** error you expect, and keep the try block small (only the line that can fail)." },
        { t: "trick", text: "**try the risky line, except the specific error, else on success, finally always.**" },
        { t: "exam", items: ["What is exception handling? Why use it?", "Difference between else and finally in try?", "How do you raise an exception? Create a custom one?", "Syntax error vs exception? (Syntax errors stop the program before it runs.)", "Why avoid a bare except?"] },
        { t: "recap", items: ["Read the last line of a traceback first", "try/except catches errors so the program continues", "else runs on success; finally always runs", "raise ValueError(\"msg\") signals a problem", "class MyError(Exception): pass for custom errors"] },
      ],
      quiz: [
        { q: "int(\"12a\") raises…", options: ["ValueError", "TypeError", "NameError", "KeyError"], answer: 0, explain: "The type (str) is fine; the value isn't a number." },
        { q: "When does finally run?", options: ["Always", "Only on error", "Only without error", "Never after return"], answer: 0, explain: "Even after return or an error." },
        { q: "[1, 2, 3][3] raises…", options: ["IndexError", "KeyError", "ValueError", "No error"], answer: 0, explain: "Indexes are 0, 1, 2." },
        { q: "How do you create your own error type?", options: ["class MyError(Exception): pass", "def MyError(): pass", "error MyError", "raise new MyError"], answer: 0, explain: "Inherit from Exception." },
        { q: "Why avoid except: pass?", options: ["It silently hides every error, even bugs", "It's a syntax error", "It's slow", "It only works in Python 2"], answer: 0, explain: "Catch specific errors." },
      ],
    },
    {
      id: "files",
      title: "Reading and writing text files",
      oneLine: "open() connects your program to a file. Use \"w\" to write (replace), \"a\" to append and \"r\" to read, always inside a with block, which closes the file automatically.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Write, append, read" },
        py("Write and read a file", src`
with open("notes.txt", "w", encoding="utf-8") as f:   # "w": create or REPLACE
    f.write("Learn Python\n")                         # \n ends the line
    f.write("Practice daily\n")

with open("notes.txt", "a", encoding="utf-8") as f:   # "a": add to the end
    f.write("Build projects\n")

with open("notes.txt", encoding="utf-8") as f:        # "r" (read) is the default
    content = f.read()                                # the whole file as one string
print(content)
`, "Learn Python\nPractice daily\nBuild projects"),
        { t: "table", head: ["Mode", "Means", "If the file exists", "If it doesn't"], rows: [
          ["`\"r\"`", "Read (default)", "Reads it", "FileNotFoundError"],
          ["`\"w\"`", "Write", "**Erases** it first", "Creates it"],
          ["`\"a\"`", "Append", "Adds to the end", "Creates it"],
          ["`\"x\"`", "Create", "FileExistsError", "Creates it"],
          ["add `\"b\"`", "Binary (images, PDFs): `\"rb\"`, `\"wb\"`", "", ""],
        ] },
        { t: "h", text: "Step 2: Line by line" },
        py("Reading lines", src`
with open("fruits.txt", "w", encoding="utf-8") as f:
    f.writelines(["apple\n", "banana\n", "cherry\n"])   # write several lines

with open("fruits.txt", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):         # a file is iterable: one line at a time
        print(number, line.strip())                    # strip() removes the \n

with open("fruits.txt", encoding="utf-8") as f:
    lines = f.read().splitlines()                      # a list of lines without \n
print(lines, len(lines))
`, "1 apple\n2 banana\n3 cherry\n['apple', 'banana', 'cherry'] 3"),
        { t: "p", text: "Looping over the file object reads **one line at a time**, so it works even for a 10 GB log file. `f.read()` loads everything into memory: fine for small files." },
        { t: "h", text: "Step 3: Missing files and pathlib" },
        py("Handling a missing file", src`
try:
    with open("missing.txt", encoding="utf-8") as f:
        print(f.read())
except FileNotFoundError:
    print("File not found. Check the name and the folder.")
`, "File not found. Check the name and the folder."),
        py("pathlib: the modern way", src`
from pathlib import Path

p = Path("report.txt")
p.write_text("Total: 955.50\n", encoding="utf-8")   # open + write + close in one call
print(p.exists())
print(p.read_text(encoding="utf-8").strip())
print(p.suffix, p.stem, p.name)
print((Path("data") / "2026" / "marks.csv").as_posix())   # / joins path parts
`, "True\nTotal: 955.50\n.txt report report.txt\ndata/2026/marks.csv"),
        { t: "analogy", text: "Opening a file is like borrowing a library book: `with` is the librarian who makes sure it's returned (closed) when you're done, even if you trip on the way. Mode \"w\" is like getting a fresh notebook: whatever was written before is gone." },
        { t: "trap", text: "**\"w\" erases the file instantly**, before you write anything. Use \"a\" to add to it. Always pass `encoding=\"utf-8\"`: without it, Windows may fail on ₹, emojis or Hindi text. And a relative path like `\"notes.txt\"` is relative to the folder you run Python from, not the folder of the script." },
        { t: "trick", text: "**with open(name, mode, encoding=\"utf-8\") as f: r read, w wipe-and-write, a add.**" },
        { t: "exam", items: ["Why use with when opening files? (It closes the file automatically, even on errors.)", "Difference between \"w\" and \"a\"?", "Difference between read(), readline() and readlines()?", "How do you read a huge file efficiently? (Loop over it line by line.)", "Count lines/words/characters in a file."] },
        { t: "recap", items: ["with open(...) as f: closes the file for you", "r read, w write (erases), a append", "for line in f: reads line by line", "Catch FileNotFoundError", "pathlib.Path for paths, read_text and write_text"] },
      ],
      quiz: [
        { q: "Which mode adds to the end of an existing file?", options: ["\"a\"", "\"w\"", "\"r\"", "\"x\""], answer: 0, explain: "\"w\" would erase it." },
        { q: "Why use with open(...)?", options: ["The file is closed automatically", "It's faster to type", "It reads binary files", "It creates backups"], answer: 0, explain: "Even if an error happens." },
        { q: "Opening a missing file with \"r\" raises…", options: ["FileNotFoundError", "KeyError", "Nothing", "ValueError"], answer: 0, explain: "\"w\" or \"a\" would create it." },
        { q: "line.strip() is used when reading lines to…", options: ["Remove the trailing \\n and spaces", "Split words", "Lowercase the text", "Close the file"], answer: 0, explain: "Each line ends with \\n." },
      ],
    },
    {
      id: "csv-json",
      title: "CSV and JSON files",
      oneLine: "CSV is a spreadsheet saved as text (rows of comma-separated values); the csv module reads and writes it safely. JSON is the format of web APIs; the json module converts between JSON text and Python dicts and lists.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: CSV" },
        py("Write and read a CSV file", src`
import csv

rows = [["name", "marks"], ["Asha", 88], ["Ravi", 72], ["Zoya", 95]]
with open("marks.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)              # one list = one row

with open("marks.csv", encoding="utf-8") as f:
    print(f.read())                            # what the file looks like

with open("marks.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):              # each row becomes a dict, using the header
        print(row["name"], "→", int(row["marks"]) + 5, "after grace marks")
`, "name,marks\nAsha,88\nRavi,72\nZoya,95\n\nAsha → 93 after grace marks\nRavi → 77 after grace marks\nZoya → 100 after grace marks"),
        { t: "p", text: "Values read from a CSV are always **strings**: convert with `int()` or `float()`. Excel and Google Sheets can open and save CSV files, so this is how Python talks to spreadsheets. (For .xlsx files, use the `openpyxl` or `pandas` package.)" },
        { t: "h", text: "Step 2: JSON" },
        py("JSON text ↔ Python", src`
import json

student = {"name": "Asha", "marks": [88, 92], "active": True, "city": None}
text = json.dumps(student)          # Python → JSON text (dump-s = to a string)
print(text)

back = json.loads(text)             # JSON text → Python (load-s = from a string)
print(back["marks"][1], type(back))

print(json.dumps({"a": 1, "b": [1, 2]}, indent=2))   # pretty-printed
`, "{\"name\": \"Asha\", \"marks\": [88, 92], \"active\": true, \"city\": null}\n92 <class 'dict'>\n{\n  \"a\": 1,\n  \"b\": [\n    1,\n    2\n  ]\n}"),
        { t: "table", head: ["Python", "JSON"], rows: [["dict", "object `{ }`"], ["list, tuple", "array `[ ]`"], ["str", "string (double quotes only)"], ["int, float", "number"], ["True / False", "true / false"], ["None", "null"]] },
        py("Save and load app data", src`
import json

settings = {"theme": "dark", "language": "hi", "font_size": 16}
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2)         # write to a file (no s)

with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)                    # read from a file (no s)

loaded["font_size"] += 2
print(loaded)
print(loaded == settings)
`, "{'theme': 'dark', 'language': 'hi', 'font_size': 18}\nFalse"),
        { t: "analogy", text: "CSV is a register with columns ruled on paper: simple rows of values. JSON is a parcel with labelled boxes inside boxes: it can hold nested data, which is why websites use it to send information to apps." },
        { t: "trap", text: "On Windows, open CSV files for writing with `newline=\"\"`, or you'll get a blank line between every row. Don't split CSV lines with `line.split(\",\")`: values like `\"Patna, Bihar\"` contain commas. The csv module handles quotes correctly. In json, `dump/load` work with files and `dumps/loads` (with s) with strings." },
        { t: "trick", text: "**CSV = rows (csv module). JSON = nested data (json module). The s means string.**" },
        { t: "exam", items: ["How do you read a CSV file in Python? (csv.reader or csv.DictReader.)", "Difference between json.dump and json.dumps?", "How do Python types map to JSON?", "Why use the csv module instead of split(\",\")?", "Convert a list of dicts to a CSV file. (csv.DictWriter.)"] },
        { t: "recap", items: ["csv.writer(f).writerows(rows); csv.DictReader(f) for dict rows", "CSV values are strings: convert them", "json.dumps / json.loads for strings", "json.dump / json.load for files; indent=2 for pretty output", "true/false/null in JSON = True/False/None in Python"] },
      ],
      quiz: [
        { q: "json.loads('{\"a\": true}') returns…", options: ["{'a': True}", "'{\"a\": true}'", "{'a': 'true'}", "Error"], answer: 0, explain: "JSON true becomes Python True." },
        { q: "Which writes JSON to an open file?", options: ["json.dump(data, f)", "json.dumps(data, f)", "json.write(f)", "f.json(data)"], answer: 0, explain: "dumps returns a string instead." },
        { q: "Values read by csv.DictReader are…", options: ["Strings", "Already numbers", "Lists", "Tuples"], answer: 0, explain: "Convert with int() or float()." },
        { q: "Python None becomes which JSON value?", options: ["null", "None", "0", "\"\""], answer: 0, explain: "JSON has null." },
      ],
    },
  ],
};

export const PY10_OOP: LearnModule = {
  id: "oop",
  title: "Object-oriented programming",
  titleHi: "ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग",
  blurb: "Model real things with classes and objects: attributes and methods, inheritance and super(), special (dunder) methods, properties, dataclasses and a mini library system.",
  lessons: [
    {
      id: "classes-objects",
      title: "Classes and objects",
      oneLine: "A class is a blueprint; an object is a thing built from it. __init__ sets up each new object's data (attributes), self means \"this object\", and methods are functions that belong to the object.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Blueprint and objects" },
        { t: "diagram", text: "class Student  (blueprint)\n  data:    name, marks\n  actions: is_pass(), describe()\n        │\n        ├──▶ s1 = Student(\"Asha\", 88)   object 1\n        └──▶ s2 = Student(\"Ravi\", 35)   object 2" },
        py("Your first class", src`
class Student:
    def __init__(self, name, marks):     # runs automatically when an object is created
        self.name = name                 # attributes: data stored IN the object
        self.marks = marks

    def is_pass(self):                   # a method: a function that belongs to the class
        return self.marks >= 40

    def describe(self):
        status = "pass" if self.is_pass() else "fail"
        return f"{self.name} scored {self.marks} ({status})"

s1 = Student("Asha", 88)                 # create objects (Python calls __init__)
s2 = Student("Ravi", 35)
print(s1.name, s1.marks)                 # read attributes with a dot
print(s1.describe())
print(s2.describe())

s2.marks = 45                            # change an attribute
print(s2.describe())
print(type(s1))
`, "Asha 88\nAsha scored 88 (pass)\nRavi scored 35 (fail)\nRavi scored 45 (pass)\n<class '__main__.Student'>"),
        { t: "table", head: ["Word", "Meaning", "In the example"], rows: [
          ["Class", "The blueprint", "`Student`"],
          ["Object / instance", "One thing made from the class", "`s1`, `s2`"],
          ["`__init__`", "The setup method (constructor)", "Stores name and marks"],
          ["`self`", "\"This particular object\"", "In s1.describe(), self is s1"],
          ["Attribute", "Data inside an object", "`self.name`"],
          ["Method", "A function inside a class", "`describe()`"],
        ] },
        { t: "example", title: "What does s1.describe() really do?", steps: ["Python turns s1.describe() into Student.describe(s1).", "So inside the method, self is s1.", "self.name is \"Asha\" and self.marks is 88, so it returns \"Asha scored 88 (pass)\"."], answer: "self is the object before the dot." },
        { t: "h", text: "Step 2: A bank account" },
        py("BankAccount class", src`
class BankAccount:
    bank_name = "City Bank"                  # class attribute: shared by ALL accounts

    def __init__(self, owner, balance=0):
        self.owner = owner                   # instance attributes: different per account
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient balance")
            return self.balance
        self.balance -= amount
        return self.balance

acc = BankAccount("Asha", 1000)
print(acc.deposit(500))
print(acc.withdraw(2000))
print(acc.withdraw(300))

other = BankAccount("Ravi")                  # balance uses its default, 0
print(other.owner, other.balance, other.bank_name)
`, "1500\nInsufficient balance\n1500\n1200\nRavi 0 City Bank"),
        { t: "analogy", text: "A class is the architect's drawing of a flat; objects are the actual flats built from it. Every flat has the same rooms (attributes) and switches (methods), but flat 101's fridge holds different things than flat 102's. self is the flat number: \"turn on the light in **this** flat\"." },
        { t: "trap", text: "Forgetting `self` is the classic OOP error: `def deposit(amount):` gives `TypeError: deposit() takes 1 positional argument but 2 were given` (Python passes the object as the first argument). Inside methods, always write `self.balance`, not `balance`, or you create a local variable." },
        { t: "trick", text: "**Class = blueprint, object = thing, self = this object, __init__ = setup.**" },
        { t: "exam", items: ["What is a class? What is an object?", "What is self?", "What is __init__? Is it a constructor?", "Difference between class attributes and instance attributes?", "Write a class for a bank account with deposit and withdraw."] },
        { t: "recap", items: ["class Name: defines a blueprint", "__init__(self, ...) sets up each object's attributes", "self is the object the method was called on", "Create objects with Name(args); use them with obj.attr / obj.method()", "Class attributes are shared; instance attributes belong to one object"] },
      ],
      quiz: [
        { q: "What is self?", options: ["The object the method was called on", "The class name", "A keyword for private data", "The parent class"], answer: 0, explain: "In a.m(), self is a." },
        { q: "When does __init__ run?", options: ["When an object is created", "When the program ends", "When a method is called", "Never automatically"], answer: 0, explain: "Student(\"A\", 9) calls it." },
        { q: "def show(): inside a class, called as obj.show(), gives…", options: ["TypeError: takes 0 positional arguments but 1 was given", "It works", "NameError", "None"], answer: 0, explain: "The method needs a self parameter." },
        { q: "A class attribute is…", options: ["Shared by all objects of the class", "Different for each object", "Private", "A method"], answer: 0, explain: "Like bank_name above." },
      ],
    },
    {
      id: "inheritance",
      title: "Inheritance, super() and polymorphism",
      oneLine: "Inheritance lets a new class (child) reuse and extend an existing class (parent). The child can override methods, call the parent's version with super(), and different classes can share one interface (polymorphism).",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: A child class reuses the parent" },
        py("Animals", src`
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def intro(self):                                   # written once, used by all children
        return f"I am {self.name} and I say {self.speak()}"

class Dog(Animal):                                     # Dog IS an Animal
    def speak(self):                                   # override: replace the parent's version
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

for pet in [Dog("Tommy"), Cat("Kitty"), Animal("Generic")]:
    print(pet.intro())                                 # same call, different behaviour

print(isinstance(Dog("x"), Animal))
print(issubclass(Cat, Dog))
`, "I am Tommy and I say Woof\nI am Kitty and I say Meow\nI am Generic and I say ...\nTrue\nFalse"),
        { t: "h", text: "Step 2: super() extends the parent" },
        py("Employee and Manager", src`
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def yearly(self):
        return self.salary * 12

class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)        # let the parent set name and salary
        self.team_size = team_size            # then add what's new

    def yearly(self):
        return super().yearly() + 50000       # parent's result + a bonus

e = Employee("Ravi", 40000)
m = Manager("Neha", 80000, 5)
print(e.name, e.yearly())
print(m.name, m.team_size, m.yearly())
`, "Ravi 480000\nNeha 5 1010000"),
        { t: "h", text: "Step 3: Polymorphism (one interface, many forms)" },
        py("Shapes", src`
import math

class Shape:
    def area(self):
        raise NotImplementedError("Each shape must define area()")

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return math.pi * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h

for s in [Circle(1), Rectangle(3, 4)]:
    print(type(s).__name__, round(s.area(), 2))     # no if/else on the type needed
`, "Circle 3.14\nRectangle 12"),
        { t: "table", head: ["OOP pillar", "Meaning", "In Python"], rows: [
          ["Encapsulation", "Keep data and the methods that use it together; hide details", "Attributes + methods in a class; `_name` means \"internal\""],
          ["Inheritance", "A child class reuses a parent class", "`class Dog(Animal):`"],
          ["Polymorphism", "Same method name, different behaviour", "`speak()`, `area()` above"],
          ["Abstraction", "Show what something does, hide how", "A Shape that only promises `area()` (see the `abc` module)"],
        ] },
        { t: "analogy", text: "Inheritance is like a family recipe: the child cook gets the parent's whole recipe book (methods) and can change one dish (override) or add extra spice to the parent's version (super()). Polymorphism is a TV remote: the same \"power\" button works on every TV brand, each doing it its own way." },
        { t: "trap", text: "If a child defines `__init__`, the parent's `__init__` does **not** run automatically: call `super().__init__(...)`, or attributes like `self.name` won't exist (AttributeError). Use inheritance only for a real \"is a\" relationship (a Manager is an Employee); for \"has a\" (a Car has an Engine), store an object as an attribute (composition)." },
        { t: "trick", text: "**class Child(Parent). Override to replace, super() to extend.**" },
        { t: "exam", items: ["What are the four pillars of OOP?", "What is inheritance? Types? (single, multiple, multilevel, hierarchical.)", "What does super() do?", "Method overriding vs overloading? (Python has no traditional overloading; use default arguments.)", "What is polymorphism? Example.", "Composition vs inheritance?"] },
        { t: "recap", items: ["class Child(Parent): inherits all methods", "Override by defining a method with the same name", "super().method() calls the parent's version", "Polymorphism: same call, different behaviour", "isinstance(obj, Class) checks type including parents"] },
      ],
      quiz: [
        { q: "class Car(Vehicle): means…", options: ["Car inherits from Vehicle", "Vehicle inherits from Car", "Car contains a Vehicle", "Car is a function"], answer: 0, explain: "The parent goes in brackets." },
        { q: "What does super().__init__(name) do?", options: ["Runs the parent's __init__", "Creates a new parent object", "Deletes the parent", "Calls the child again"], answer: 0, explain: "So the parent sets up its attributes." },
        { q: "A child defines speak() which the parent also has. This is…", options: ["Overriding", "Overloading", "Encapsulation", "Abstraction"], answer: 0, explain: "The child's version replaces the parent's." },
        { q: "isinstance(Dog(\"x\"), Animal) where Dog(Animal) is…", options: ["True", "False", "Error", "None"], answer: 0, explain: "A Dog is an Animal." },
      ],
    },
    {
      id: "dunder-property",
      title: "Special methods, properties and class methods",
      oneLine: "Dunder methods (__str__, __add__, __eq__, __len__…) let your objects work with print, +, ==, len() and loops. @property adds checked attributes, and @classmethod / @staticmethod add methods that don't need an object.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Make objects print and compare nicely" },
        py("A Money class", src`
class Money:
    def __init__(self, amount):
        self.amount = amount

    def __str__(self):                   # used by print() and str()
        return f"₹{self.amount:,.2f}"

    def __repr__(self):                  # used in lists and for debugging
        return f"Money({self.amount})"

    def __add__(self, other):            # makes  a + b  work
        return Money(self.amount + other.amount)

    def __eq__(self, other):             # makes  a == b  compare values
        return self.amount == other.amount

    def __lt__(self, other):             # makes  a < b  and sorting work
        return self.amount < other.amount

a = Money(1500)
b = Money(250.5)
print(a)
print(a + b)
print([a, b])
print(a == Money(1500))
print(sorted([a, b]))
`, "₹1,500.00\n₹1,750.50\n[Money(1500), Money(250.5)]\nTrue\n[Money(250.5), Money(1500)]"),
        py("len, indexing and loops", src`
class Playlist:
    def __init__(self, *songs):
        self.songs = list(songs)

    def __len__(self):                   # len(p)
        return len(self.songs)

    def __getitem__(self, i):            # p[i], and makes for-loops work
        return self.songs[i]

p = Playlist("Song A", "Song B", "Song C")
print(len(p), p[0], p[-1])
for song in p:
    print("Playing", song)
`, "3 Song A Song C\nPlaying Song A\nPlaying Song B\nPlaying Song C"),
        { t: "table", head: ["Dunder method", "Makes this work"], rows: [["`__init__`", "`Obj(...)` (setup)"], ["`__str__` / `__repr__`", "`print(obj)` / showing it in a list"], ["`__eq__`, `__lt__`", "`==`, `<`, `sorted()`"], ["`__add__`", "`a + b`"], ["`__len__`", "`len(obj)`"], ["`__getitem__`", "`obj[i]`, for loops"], ["`__contains__`", "`x in obj`"]] },
        { t: "h", text: "Step 2: @property (attributes with checks)" },
        py("Validated marks", src`
class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks                     # goes through the setter below

    @property
    def marks(self):                           # reading s.marks calls this
        return self._marks

    @marks.setter
    def marks(self, value):                    # writing s.marks = x calls this
        if not 0 <= value <= 100:
            raise ValueError("marks must be between 0 and 100")
        self._marks = value                    # _marks: "internal, don't touch"

    @property
    def grade(self):                           # computed and read-only
        return "A" if self._marks >= 90 else "B" if self._marks >= 75 else "C"

s = Student("Asha", 88)
print(s.marks, s.grade)
s.marks = 95
print(s.marks, s.grade)
try:
    s.marks = 150
except ValueError as e:
    print("Error:", e)
`, "88 B\n95 A\nError: marks must be between 0 and 100"),
        { t: "h", text: "Step 3: @classmethod and @staticmethod" },
        py("Temperature", src`
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):              # another way to CREATE an object
        return cls((f - 32) * 5 / 9)          # cls is the class itself

    @staticmethod
    def is_fever(celsius):                    # a helper: needs neither self nor cls
        return celsius > 37.5

t = Temperature.from_fahrenheit(101.3)
print(round(t.celsius, 1))
print(Temperature.is_fever(t.celsius))
`, "38.5\nTrue"),
        { t: "table", head: ["Kind", "First parameter", "Use for"], rows: [["Normal method", "`self` (the object)", "Working with one object's data"], ["`@classmethod`", "`cls` (the class)", "Alternative constructors: `from_json()`, `from_fahrenheit()`"], ["`@staticmethod`", "none", "Helpers that logically belong to the class"]] },
        { t: "analogy", text: "Dunder methods are the sockets on your object: once you fit a __len__ socket, the len() plug works with it; fit __add__ and the + plug works. A property is a security guard at the door of an attribute: every value going in is checked first." },
        { t: "trap", text: "Without `__str__`, printing an object shows something like `<__main__.Money object at 0x0000…>`. Without `__eq__`, `==` checks whether it's the **same object**, not equal values. In a property, store the value in `self._marks`, not `self.marks`, or the setter calls itself forever (RecursionError)." },
        { t: "trick", text: "**Want obj to work with X()? Define __X__. Want checks on an attribute? @property + setter.**" },
        { t: "exam", items: ["What are magic/dunder methods? Examples.", "Difference between __str__ and __repr__?", "What is @property used for?", "Difference between @classmethod and @staticmethod?", "Does Python have private variables? (No; _name is a convention and __name triggers name mangling.)"] },
        { t: "recap", items: ["__str__/__repr__ for printing; __eq__/__lt__ for comparing", "__add__, __len__, __getitem__ make operators and loops work", "@property + setter = attribute with validation", "@classmethod gets cls (alternative constructors)", "@staticmethod gets nothing (helpers)"] },
      ],
      quiz: [
        { q: "Which method does print(obj) use?", options: ["__str__", "__init__", "__len__", "__print__"], answer: 0, explain: "It falls back to __repr__ if __str__ is missing." },
        { q: "To make a + b work for your objects, define…", options: ["__add__", "__plus__", "__sum__", "add()"], answer: 0, explain: "Python calls a.__add__(b)." },
        { q: "@classmethod receives…", options: ["cls, the class", "self, the object", "Nothing", "The parent class"], answer: 0, explain: "Often used for alternative constructors." },
        { q: "Why store a property's value in self._marks?", options: ["Writing self.marks inside the setter would call the setter again forever", "Underscores are faster", "It's required syntax", "To make it public"], answer: 0, explain: "That causes a RecursionError." },
      ],
    },
    {
      id: "dataclasses-project",
      title: "Dataclasses and an OOP mini project",
      oneLine: "@dataclass writes __init__, __repr__ and __eq__ for you from a list of typed fields. Then we combine classes into a small library system: books, borrowing and returning.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: @dataclass" },
        py("Dataclasses", src`
from dataclasses import dataclass, field

@dataclass
class Product:
    name: str                  # field: type hint
    price: float
    qty: int = 1               # with a default

    def total(self):
        return self.price * self.qty

p = Product("Pen", 10.0, 3)    # __init__ was written for us
print(p)                       # so was __repr__
print(p.total())
print(p == Product("Pen", 10.0, 3))   # and __eq__ compares the fields

@dataclass
class Cart:
    items: list = field(default_factory=list)   # a NEW list for every cart

    def add(self, product):
        self.items.append(product)

    def total(self):
        return sum(p.total() for p in self.items)

cart = Cart()
cart.add(p)
cart.add(Product("Bag", 799.0))
print(len(cart.items), cart.total())
`, "Product(name='Pen', price=10.0, qty=3)\n30.0\nTrue\n2 829.0"),
        { t: "p", text: "Use a dataclass whenever a class is mainly a **bundle of data** (a product, a user, a point). It saves boilerplate and makes objects print and compare sensibly. Add `frozen=True` to make objects read-only." },
        { t: "h", text: "Step 2: Mini project: a library system" },
        py("Library system", src`
from dataclasses import dataclass

@dataclass
class Book:
    title: str
    author: str
    available: bool = True

class Library:
    def __init__(self):
        self.books = {}                          # title → Book

    def add(self, book):
        self.books[book.title] = book

    def borrow(self, title):
        book = self.books.get(title)
        if book is None:
            return f"'{title}' is not in the library"
        if not book.available:
            return f"'{title}' is already borrowed"
        book.available = False
        return f"You borrowed '{title}'"

    def give_back(self, title):
        self.books[title].available = True
        return f"Thanks for returning '{title}'"

    def available_titles(self):
        return [b.title for b in self.books.values() if b.available]

lib = Library()
lib.add(Book("Wings of Fire", "A. P. J. Abdul Kalam"))
lib.add(Book("Godan", "Premchand"))

print(lib.borrow("Godan"))
print(lib.borrow("Godan"))
print(lib.borrow("Harry Potter"))
print(lib.available_titles())
print(lib.give_back("Godan"))
print(lib.available_titles())
`, "You borrowed 'Godan'\n'Godan' is already borrowed\n'Harry Potter' is not in the library\n['Wings of Fire']\nThanks for returning 'Godan'\n['Wings of Fire', 'Godan']"),
        { t: "h", text: "Step 3: How to design classes" },
        { t: "points", items: ["Write the problem in a sentence: \"A **library** has **books**; a member can **borrow** and **return** a book.\"", "**Nouns become classes** (Library, Book), their details become attributes (title, available).", "**Verbs become methods** (borrow, give_back).", "Keep each class focused on one job. Library manages the collection; Book just holds book data."] },
        { t: "p", text: "**Extend it yourself:** add a Member class with a list of borrowed books, a limit of 3 books per member, and save the library to a JSON file with the json module." },
        { t: "analogy", text: "A dataclass is a ready-made form with labelled boxes: you just list the boxes (fields) and Python prints the form, fills it in and compares two forms for you." },
        { t: "trap", text: "A mutable default like `items: list = []` in a dataclass raises an error (Python protects you from the shared-list bug). Use `field(default_factory=list)`. Don't create a class for everything: a simple function or dict is often enough." },
        { t: "trick", text: "**Nouns → classes, verbs → methods. Mostly data → @dataclass.**" },
        { t: "exam", items: ["What is a dataclass? What does it generate?", "Why default_factory=list?", "Design classes for a parking lot / library / ATM (a common design question).", "What does frozen=True do?"] },
        { t: "recap", items: ["@dataclass generates __init__, __repr__ and __eq__", "Fields are declared with type hints and optional defaults", "field(default_factory=list) for list defaults", "Design: nouns → classes, verbs → methods", "Keep each class focused on one job"] },
      ],
      quiz: [
        { q: "Which method does @dataclass NOT generate by default?", options: ["__add__", "__init__", "__repr__", "__eq__"], answer: 0, explain: "You write operators yourself." },
        { q: "How should a list field default be written in a dataclass?", options: ["field(default_factory=list)", "items: list = []", "items = list", "items: list = None always"], answer: 0, explain: "Each object gets its own list." },
        { q: "In OOP design, verbs in the problem usually become…", options: ["Methods", "Classes", "Attributes", "Modules"], answer: 0, explain: "Nouns become classes." },
        { q: "Two dataclass objects with the same field values compare as…", options: ["Equal (==)", "Not equal", "An error", "The same object (is)"], answer: 0, explain: "__eq__ compares the fields." },
      ],
    },
  ],
};

export const PY11_MODULES: LearnModule = {
  id: "modules-stdlib",
  title: "Modules, packages and the standard library",
  titleHi: "मॉड्यूल, पैकेज और स्टैंडर्ड लाइब्रेरी",
  blurb: "Split code into modules, import other people's code, install packages with pip inside a virtual environment, and use the best of Python's built-in library.",
  lessons: [
    {
      id: "modules-imports",
      title: "Modules and imports",
      oneLine: "A module is just a .py file. import lets you use code from another file, from Python's standard library, or from installed packages. if __name__ == \"__main__\": marks code that runs only when the file is run directly.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Four ways to import" },
        py("Importing", src`
import math                          # 1. the whole module: use math.name
print(math.sqrt(16), math.pi)

from math import ceil, floor         # 2. specific names: use them directly
print(ceil(4.2), floor(4.8))

import statistics as st              # 3. a shorter alias
print(st.mean([4, 8, 6]), st.median([3, 1, 2]))

from random import *                 # 4. everything: AVOID (you can't tell where names come from)
`, "4.0 3.141592653589793\n5 4\n6 2"),
        { t: "h", text: "Step 2: Your own module" },
        py("my_utils.py", src`
"""my_utils.py: small helpers I reuse."""
GST_RATE = 18

def add_gst(price):
    return round(price * (1 + GST_RATE / 100), 2)

def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":           # runs only with: python my_utils.py
    print("Testing my_utils:", add_gst(100))
`),
        py("main.py (in the same folder)", src`
import my_utils                      # finds my_utils.py in the same folder
from my_utils import greet

print(my_utils.add_gst(500))
print(greet("Asha"))
print(my_utils.GST_RATE)
`, "590.0\nHello, Asha!\n18", "The test line inside `my_utils.py` did **not** run, because the file was imported, not run directly."),
        { t: "table", head: ["How the file runs", "`__name__` is", "Code under the if…"], rows: [["`python my_utils.py`", "`\"__main__\"`", "runs"], ["`import my_utils` from another file", "`\"my_utils\"`", "doesn't run"]] },
        { t: "h", text: "Step 3: Packages (folders of modules)" },
        { t: "diagram", text: "shop/\n├── main.py              from billing.invoice import make_invoice\n└── billing/            ← a package: a folder of modules\n    ├── __init__.py      (can be empty; marks the folder as a package)\n    ├── invoice.py\n    └── tax.py" },
        { t: "analogy", text: "Modules are like apps on your phone: instead of building a calculator yourself, you open the calculator app (import math). Your own modules are your own apps that you reuse across projects. A package is a folder of related apps." },
        { t: "trap", text: "Don't name your file the same as a module you import (`random.py`, `math.py`, `json.py`, `test.py` next to code that imports `test`). Python finds your file first and you get strange errors like `AttributeError: module 'random' has no attribute 'randint'`. Also avoid circular imports (a imports b, b imports a)." },
        { t: "trick", text: "**A module is a .py file. Guard test code with if __name__ == \"__main__\":.**" },
        { t: "exam", items: ["What is a module? A package?", "Difference between import x and from x import y?", "What does if __name__ == \"__main__\" do?", "What is __init__.py for?", "Why avoid from module import *?"] },
        { t: "recap", items: ["import module / from module import name / import module as alias", "Any .py file is a module", "__name__ is \"__main__\" only when the file is run directly", "A package is a folder of modules (with __init__.py)", "Don't shadow standard module names"] },
      ],
      quiz: [
        { q: "After import math, how do you call sqrt?", options: ["math.sqrt(9)", "sqrt(9)", "math->sqrt(9)", "import.sqrt(9)"], answer: 0, explain: "Use from math import sqrt to call sqrt directly." },
        { q: "When is __name__ == \"__main__\"?", options: ["When the file is run directly", "When it's imported", "Always", "Never"], answer: 0, explain: "Imported modules get their own name." },
        { q: "A folder of modules is called a…", options: ["Package", "Library file", "Class", "Script"], answer: 0, explain: "Usually with an __init__.py." },
        { q: "Your file is named random.py and imports random. What happens?", options: ["It imports itself, causing errors", "It works normally", "Python renames it", "A SyntaxError"], answer: 0, explain: "Your file shadows the real module." },
      ],
    },
    {
      id: "pip-venv",
      title: "pip, virtual environments and packages",
      oneLine: "pip installs packages written by others (from PyPI, 500,000+ packages). A virtual environment (venv) is a private folder of packages for one project, so projects don't clash. requirements.txt lists what a project needs.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: Create and activate a virtual environment" },
        { t: "code", lang: "bash", code: "# inside your project folder\npython -m venv .venv                 # create the environment (once)\n\n# activate it (every time you open a new terminal)\n.venv\\Scripts\\activate               # Windows\nsource .venv/bin/activate            # Mac / Linux\n\n# your prompt now starts with (.venv)" },
        { t: "h", text: "Step 2: Install packages with pip" },
        { t: "code", lang: "bash", code: "pip install requests                 # install a package\npip install pandas==2.2.3            # an exact version\npip list                             # what's installed\npip uninstall requests               # remove it\n\npip freeze > requirements.txt        # save the project's packages\npip install -r requirements.txt      # install them on another computer" },
        { t: "code", lang: "text", title: "requirements.txt", code: "requests==2.32.3\npandas==2.2.3\nflask==3.0.3" },
        { t: "h", text: "Step 3: Use a package" },
        py("Calling a web API with requests", src`
import requests                      # pip install requests

response = requests.get("https://api.github.com/users/octocat", timeout=10)
data = response.json()               # JSON text → Python dict
print(response.status_code)          # 200 means OK
print(data["name"], "has", data["public_repos"], "public repos")
`, undefined, "Needs internet and `pip install requests`, so there's no fixed output here. Try it on your own computer."),
        { t: "table", head: ["Package", "Used for"], rows: [
          ["`requests`", "Calling web APIs and downloading pages"],
          ["`pandas`, `numpy`", "Data analysis, tables, maths on big arrays"],
          ["`matplotlib`, `seaborn`", "Charts and graphs"],
          ["`flask`, `fastapi`, `django`", "Web apps and REST APIs"],
          ["`pytest`", "Testing"],
          ["`openpyxl`", "Excel files"],
          ["`beautifulsoup4`", "Reading HTML (web scraping)"],
          ["`scikit-learn`, `pytorch`", "Machine learning and AI"],
        ] },
        { t: "analogy", text: "pip is the Play Store for Python. A virtual environment is a separate phone for each project: installing a new version of an app on one phone doesn't break the other projects. requirements.txt is the shopping list to set up an identical phone." },
        { t: "trap", text: "Installing everything globally causes \"works on my machine\" problems: project A needs pandas 1.x, project B needs 2.x. Always create a venv per project. Don't commit the `.venv` folder to Git; commit `requirements.txt`. If `pip` isn't found, use `python -m pip install …`." },
        { t: "trick", text: "**New project → python -m venv .venv → activate → pip install → pip freeze > requirements.txt.**" },
        { t: "exam", items: ["What is pip? What is PyPI?", "What is a virtual environment and why use one?", "What is requirements.txt?", "How do you install a specific version of a package?", "Name popular Python libraries for web, data and ML."] },
        { t: "recap", items: ["pip install name installs packages from PyPI", "python -m venv .venv creates an isolated environment per project", "Activate it before installing", "pip freeze > requirements.txt; pip install -r requirements.txt", "Don't commit .venv; commit requirements.txt"] },
      ],
      quiz: [
        { q: "Which command creates a virtual environment?", options: ["python -m venv .venv", "pip venv", "python create env", "venv install"], answer: 0, explain: "Then activate it." },
        { q: "What does pip freeze > requirements.txt do?", options: ["Saves the installed packages and versions to a file", "Stops pip", "Installs requirements", "Deletes packages"], answer: 0, explain: "Install them elsewhere with -r." },
        { q: "Why use a virtual environment?", options: ["Each project gets its own package versions", "It makes Python faster", "It's required to run Python", "It encrypts code"], answer: 0, explain: "It avoids version clashes." },
        { q: "Which package is used for data analysis with tables?", options: ["pandas", "flask", "pytest", "requests"], answer: 0, explain: "flask is for web apps." },
      ],
    },
    {
      id: "standard-library",
      title: "The standard library: batteries included",
      oneLine: "Python comes with hundreds of ready-made modules. The ones you'll use most: datetime for dates, random for random choices, collections for smarter containers, itertools for combinations, and math/statistics for numbers.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: datetime" },
        py("Dates and times", src`
from datetime import date, datetime, timedelta

exam = date(2026, 12, 15)
today = date(2026, 10, 18)                 # in real code: date.today()
print((exam - today).days, "days left")    # subtracting dates gives a timedelta
print(exam.strftime("%d %B %Y, %A"))       # format a date as text
print(today + timedelta(days=30))          # 30 days later

dt = datetime.strptime("18-10-2026 14:30", "%d-%m-%Y %H:%M")   # text → datetime
print(dt.hour, dt.minute, dt.year)
`, "58 days left\n15 December 2026, Tuesday\n2026-11-17\n14 30 2026"),
        { t: "table", head: ["Code", "Means", "Example"], rows: [["`%d` `%m` `%Y`", "day, month, year", "18 10 2026"], ["`%B` / `%b`", "month name / short", "October / Oct"], ["`%A`", "weekday", "Sunday"], ["`%H:%M`", "24-hour time", "14:30"], ["`%I %p`", "12-hour time", "02 PM"]] },
        { t: "h", text: "Step 2: random" },
        py("Random numbers and choices", src`
import random

random.seed(42)                       # same seed = same "random" results (for testing)
print(random.randint(1, 6))           # a dice roll: 1 to 6, both included
print(random.choice(["rock", "paper", "scissors"]))
cards = [1, 2, 3, 4, 5]
random.shuffle(cards)                 # shuffles the list in place
print(cards)
print(random.sample(range(1, 50), 3)) # 3 different numbers
`, "6\nrock\n[2, 4, 5, 3, 1]\n[9, 48, 7]","Remove `random.seed(42)` and you get different results every run. For passwords and OTPs, use the `secrets` module, not random."),
        { t: "h", text: "Step 3: collections" },
        py("Counter, defaultdict, namedtuple, deque", src`
from collections import Counter, defaultdict, namedtuple, deque

votes = ["A", "B", "A", "C", "A", "B"]
c = Counter(votes)                         # counts everything in one line
print(c)
print(c.most_common(1))

groups = defaultdict(list)                 # missing keys start as an empty list
for name, city in [("Asha", "Patna"), ("Ravi", "Pune"), ("Zoya", "Patna")]:
    groups[city].append(name)
print(dict(groups))

Point = namedtuple("Point", ["x", "y"])   # a tuple with named fields
p = Point(3, 4)
print(p.x, p.y, p)

q = deque([1, 2, 3])                       # fast adds/removes at BOTH ends
q.appendleft(0)
q.append(4)
print(q.popleft(), list(q))
`, "Counter({'A': 3, 'B': 2, 'C': 1})\n[('A', 3)]\n{'Patna': ['Asha', 'Zoya'], 'Pune': ['Ravi']}\n3 4 Point(x=3, y=4)\n0 [1, 2, 3, 4]"),
        { t: "h", text: "Step 4: itertools and more" },
        py("Combinations and permutations", src`
from itertools import combinations, permutations, chain

print(list(combinations([1, 2, 3], 2)))      # pairs, order doesn't matter
print(len(list(permutations("abc"))))        # arrangements, order matters
print(list(chain([1, 2], [3], [4, 5])))      # join several iterables
`, "[(1, 2), (1, 3), (2, 3)]\n6\n[1, 2, 3, 4, 5]"),
        { t: "table", head: ["Module", "What it's for"], rows: [
          ["`math`, `statistics`", "sqrt, ceil, floor, pi; mean, median, stdev"],
          ["`datetime`", "Dates, times, differences, formatting"],
          ["`random`, `secrets`", "Games and sampling / secure tokens and OTPs"],
          ["`collections`", "Counter, defaultdict, deque, namedtuple"],
          ["`itertools`", "combinations, permutations, chain, product"],
          ["`pathlib`, `os`, `shutil`", "Files, folders, copying and moving"],
          ["`json`, `csv`", "Data files"],
          ["`re`", "Regular expressions (patterns in text)"],
          ["`logging`", "Proper log messages instead of print"],
          ["`sys`, `argparse`", "Command-line arguments"],
        ] },
        { t: "analogy", text: "\"Batteries included\" means Python arrives like a new phone with the charger, earphones and apps already in the box. Before installing a package or writing something yourself, check whether the standard library already has it." },
        { t: "trap", text: "`random.randint(1, 6)` includes **both** 1 and 6, but `random.randrange(1, 6)` excludes 6, like range(). Never use `random` for passwords, OTPs or tokens: use `secrets.token_hex()` or `secrets.randbelow()`. And date formatting codes are case-sensitive: `%m` is month, `%M` is minutes." },
        { t: "trick", text: "**Counting → Counter. Grouping → defaultdict(list). Queue → deque. Dates → datetime.**" },
        { t: "exam", items: ["What is Counter? Count word frequencies in one line.", "Difference between defaultdict and dict?", "How do you find the number of days between two dates?", "random vs secrets?", "Why is deque better than a list for a queue? (O(1) popleft vs O(n) pop(0).)"] },
        { t: "recap", items: ["datetime: date, timedelta, strftime, strptime", "random: randint, choice, shuffle, sample (seed for repeatable tests)", "collections: Counter, defaultdict, namedtuple, deque", "itertools: combinations, permutations, chain", "Check the standard library before writing it yourself"] },
      ],
      quiz: [
        { q: "Counter(\"aab\") gives…", options: ["Counter({'a': 2, 'b': 1})", "{'a', 'b'}", "['a', 'a', 'b']", "3"], answer: 0, explain: "It counts each item." },
        { q: "random.randint(1, 3) can return…", options: ["1, 2 or 3", "Only 1 or 2", "0 to 3", "Any float"], answer: 0, explain: "Both ends are included." },
        { q: "Which is best for OTPs and passwords?", options: ["secrets", "random", "math", "itertools"], answer: 0, explain: "secrets is cryptographically secure." },
        { q: "date(2026, 1, 10) - date(2026, 1, 1) gives…", options: ["A timedelta of 9 days", "9", "10 days", "An error"], answer: 0, explain: "Use .days to get the number 9." },
      ],
    },
  ],
};
