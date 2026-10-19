import type { LearnModule } from "../types";
import { py, src } from "./helpers";

/** Python modules 5–8: lists and tuples, dictionaries and sets, functions, comprehensions and built-ins. */
export const PY05_LISTS: LearnModule = {
  id: "lists-tuples",
  title: "Lists and tuples",
  titleHi: "लिस्ट और टपल",
  blurb: "Store many values in one variable: create, change, sort and loop over lists, avoid the copy trap, use 2-D lists, and learn when to use a tuple instead.",
  lessons: [
    {
      id: "lists",
      title: "Lists: create, change, add and remove",
      oneLine: "A list is an ordered, changeable collection in square brackets: [78, 92, 65]. Items are indexed from 0 like strings, but unlike strings you can change, add and remove items.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Create a list and read from it" },
        py("List basics", src`
marks = [78, 92, 65, 88]        # square brackets, items separated by commas
print(marks)
print(marks[0])                 # first item (index 0)
print(marks[-1])                # last item
print(len(marks))               # how many items

marks[2] = 70                   # lists CAN be changed
print(marks)

mixed = ["Asha", 21, True, 9.5] # any types can be mixed
print(mixed)
empty = []
print(empty, len(empty))
`, "[78, 92, 65, 88]\n78\n88\n4\n[78, 92, 70, 88]\n['Asha', 21, True, 9.5]\n[] 0"),
        { t: "diagram", text: "marks = [ 78 | 92 | 70 | 88 ]\nindex:     0    1    2    3\n          -4   -3   -2   -1" },
        { t: "h", text: "Step 2: Add and remove items" },
        py("Adding and removing", src`
cart = ["pen", "book"]
cart.append("bag")                 # add at the end
cart.insert(0, "pencil")           # add at index 0
cart.extend(["ink", "file"])       # add several items
print(cart)

cart.remove("book")                # remove by VALUE (first match)
last = cart.pop()                  # remove and return the last item
first = cart.pop(0)                # remove and return the item at index 0
print(cart)
print("Removed:", last, first)

del cart[1]                        # delete by index
print(cart)
print("pen" in cart)               # is it in the list?
`, "['pencil', 'pen', 'book', 'bag', 'ink', 'file']\n['pen', 'bag', 'ink']\nRemoved: file pencil\n['pen', 'ink']\nTrue"),
        { t: "table", head: ["Method", "Does", "Returns"], rows: [
          ["`append(x)`", "Add x at the end", "None"],
          ["`insert(i, x)`", "Add x at index i", "None"],
          ["`extend(list)`", "Add every item of another list", "None"],
          ["`remove(x)`", "Remove the first x (error if missing)", "None"],
          ["`pop()` / `pop(i)`", "Remove the last item / the item at i", "The removed item"],
          ["`clear()`", "Remove everything", "None"],
        ] },
        { t: "h", text: "Step 3: Sorting and summary functions" },
        py("Sort, min, max, sum", src`
nums = [5, 2, 9, 1]
print(sorted(nums))          # a NEW sorted list
print(nums)                  # the original is unchanged
nums.sort()                  # sorts the list itself
print(nums)
nums.sort(reverse=True)      # largest first
print(nums)
print(min(nums), max(nums), sum(nums))

names = ["ravi", "asha", "Zoya"]
print(sorted(names))                 # capital letters come first!
print(sorted(names, key=str.lower))  # ignore case
`, "[1, 2, 5, 9]\n[5, 2, 9, 1]\n[1, 2, 5, 9]\n[9, 5, 2, 1]\n1 9 17\n['Zoya', 'asha', 'ravi']\n['asha', 'ravi', 'Zoya']"),
        { t: "analogy", text: "A list is a numbered shopping list on a whiteboard: you can read item 0, rub out item 2 and write something else, add to the bottom, or squeeze something in at the top. A string is the same list printed on paper: you can read it, but not change it." },
        { t: "trap", text: "`nums.sort()` changes the list and returns **None**, so `nums = nums.sort()` destroys your list. Use `sorted(nums)` when you want a new list. Also `cart.append([\"a\", \"b\"])` adds ONE item (a list inside the list); use `extend` to add each item." },
        { t: "trick", text: "**append = one at the end, extend = many, pop = take out. sort() changes it, sorted() makes a new one.**" },
        { t: "exam", items: ["Difference between append() and extend()?", "Difference between remove(), pop() and del?", "Difference between sort() and sorted()?", "Are lists mutable? (Yes.)", "Find the largest number in a list without max()."] },
        { t: "recap", items: ["Lists use [ ], keep order, and can be changed", "Index from 0; -1 is the last item", "append, insert, extend add; remove, pop, del delete", "sort() in place, sorted() returns a new list", "min, max, sum, len work on lists"] },
      ],
      quiz: [
        { q: "a = [1, 2]; a.append(3). What is a?", options: ["[1, 2, 3]", "[3, 1, 2]", "[1, 2]", "[1, 2, [3]]"], answer: 0, explain: "append adds at the end." },
        { q: "What does pop() return?", options: ["The removed last item", "None", "The list", "The first item"], answer: 0, explain: "pop(i) removes index i instead." },
        { q: "x = [3, 1, 2]; y = x.sort(). What is y?", options: ["None", "[1, 2, 3]", "[3, 1, 2]", "Error"], answer: 0, explain: "sort() works in place and returns None." },
        { q: "[1, 2] + [3] is…", options: ["[1, 2, 3]", "[4, 2]", "[1, 2, [3]]", "Error"], answer: 0, explain: "+ joins lists." },
        { q: "Which removes by value?", options: ["remove(x)", "pop(i)", "del a[i]", "clear()"], answer: 0, explain: "The others work by index or remove everything." },
      ],
    },
    {
      id: "list-tricks",
      title: "Copying, 2-D lists and handy list tricks",
      oneLine: "b = a doesn't copy a list: both names point to the same list. Use a.copy() for a real copy. Lists can hold other lists (rows and columns), and Python has neat tricks like * unpacking.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The copy trap" },
        py("Same list vs a copy", src`
a = [1, 2, 3]
b = a              # b is ANOTHER NAME for the same list
b.append(4)
print(a)           # a changed too!

c = a.copy()       # a new, separate list (or a[:] or list(a))
c.append(5)
print(a)           # a is not affected
print(c)
`, "[1, 2, 3, 4]\n[1, 2, 3, 4]\n[1, 2, 3, 4, 5]"),
        { t: "diagram", text: "b = a:        a ──┐\n                  ├──▶ [1, 2, 3, 4]    one list, two names\n              b ──┘\n\nc = a.copy(): a ────▶ [1, 2, 3, 4]\n              c ────▶ [1, 2, 3, 4, 5]  two separate lists" },
        { t: "h", text: "Step 2: 2-D lists (a list of lists)" },
        py("Marks table", src`
marks = [
    [78, 85, 90],    # student 0: maths, science, english
    [65, 70, 72],    # student 1
    [88, 92, 95],    # student 2
]
print(marks[1])           # the whole row of student 1
print(marks[2][0])        # row 2, column 0

for row in marks:
    print(row, "average:", round(sum(row) / len(row), 1))
`, "[65, 70, 72]\n88\n[78, 85, 90] average: 84.3\n[65, 70, 72] average: 69.0\n[88, 92, 95] average: 91.7"),
        { t: "diagram", text: "            col 0  col 1  col 2\nrow 0  →  [  78,    85,    90 ]\nrow 1  →  [  65,    70,    72 ]\nrow 2  →  [  88,    92,    95 ]      marks[2][0] = 88" },
        { t: "h", text: "Step 3: Handy tricks" },
        py("More list tools", src`
nums = [3, 7, 3, 9, 3]
print(nums.count(3))          # how many 3s
print(nums.index(9))          # position of the first 9
print(list("abc"))            # string → list of characters
print([0] * 5)                # a list of five zeros
print([1, 2] + [3, 4])        # join two lists

words = "learn python today".split()
print(words)
print(" ".join(words).upper())

first, *rest = [10, 20, 30, 40]   # * collects "the rest"
print(first, rest)
*start, last = [10, 20, 30, 40]
print(start, last)
`, "3\n3\n['a', 'b', 'c']\n[0, 0, 0, 0, 0]\n[1, 2, 3, 4]\n['learn', 'python', 'today']\nLEARN PYTHON TODAY\n10 [20, 30, 40]\n[10, 20, 30] 40"),
        py("Build a new list instead of deleting while looping", src`
nums = [1, 2, 3, 4, 5, 6]
odds = []
for n in nums:
    if n % 2 == 1:
        odds.append(n)      # keep what you want
print(odds)
`, "[1, 3, 5]", "Removing items from a list while looping over it skips items. Building a new list is safe (and in Module 8 you'll do it in one line with a comprehension)."),
        { t: "analogy", text: "b = a is like giving your friend a second key to the same locker: whatever they put in, you'll see too. a.copy() is like buying them their own locker with the same things inside." },
        { t: "trap", text: "`grid = [[0] * 3] * 3` creates **three names for the same row**: changing `grid[0][0]` changes every row. Build 2-D lists with a loop or a comprehension: `[[0] * 3 for _ in range(3)]`. And `.copy()` is a shallow copy: inner lists are still shared (use `copy.deepcopy` for nested lists)." },
        { t: "trick", text: "**= shares, .copy() copies. grid[row][col].**" },
        { t: "exam", items: ["Difference between b = a and b = a.copy()?", "Shallow copy vs deep copy?", "How do you access an element of a 2-D list?", "Why is [[0] * 3] * 3 a bug?", "Remove duplicates from a list."] },
        { t: "recap", items: ["= makes another name for the same list", "copy(), a[:] or list(a) make a new list (shallow)", "2-D list: grid[row][col]", "count, index, * repeat, + join, * unpacking", "Don't remove items while looping; build a new list"] },
      ],
      quiz: [
        { q: "a = [1]; b = a; b.append(2). What is a?", options: ["[1, 2]", "[1]", "[2]", "Error"], answer: 0, explain: "a and b are the same list." },
        { q: "m = [[1, 2], [3, 4]]. What is m[1][0]?", options: ["3", "2", "1", "4"], answer: 0, explain: "Row 1, column 0." },
        { q: "first, *rest = [5, 6, 7]. What is rest?", options: ["[6, 7]", "6", "(6, 7)", "[5, 6]"], answer: 0, explain: "* collects the remaining items into a list." },
        { q: "Which makes an independent copy of a flat list?", options: ["a.copy()", "b = a", "a.clone()", "copy a"], answer: 0, explain: "Also a[:] or list(a)." },
      ],
    },
    {
      id: "tuples",
      title: "Tuples and unpacking",
      oneLine: "A tuple is like a list that can't be changed, written with round brackets: (3, 4). Use tuples for fixed groups of values like coordinates or a record, and unpack them into variables in one line.",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: Tuples are fixed" },
        py("Tuple basics", src`
point = (3, 4)
print(point[0], point[1])      # indexing works like lists
print(len(point))

try:
    point[0] = 10              # but you can't change a tuple
except TypeError as e:
    print("Error:", e)

single = (5,)                  # a one-item tuple needs a comma
not_tuple = (5)                # this is just the number 5 in brackets
print(type(single), type(not_tuple))
`, "3 4\n2\nError: 'tuple' object does not support item assignment\n<class 'tuple'> <class 'int'>"),
        { t: "h", text: "Step 2: Unpacking" },
        py("Unpacking tuples", src`
student = ("Asha", 21, "Patna")
name, age, city = student            # one variable per item
print(name, "is", age, "from", city)

points = [(0, 0), (2, 3), (5, 1)]
for x, y in points:                  # unpack inside a loop
    print(f"x={x}, y={y}")

def min_max(nums):                   # functions are covered in Module 7
    return min(nums), max(nums)      # returning two values = returning a tuple

low, high = min_max([4, 9, 1, 7])
print(low, high)
`, "Asha is 21 from Patna\nx=0, y=0\nx=2, y=3\nx=5, y=1\n1 9"),
        { t: "h", text: "Step 3: List or tuple?" },
        { t: "table", head: ["", "List `[ ]`", "Tuple `( )`"], rows: [
          ["Can change?", "Yes (mutable)", "No (immutable)"],
          ["Use for", "A collection that grows or changes: cart items, marks", "A fixed record: (x, y), (name, age), RGB colour"],
          ["Can be a dict key?", "No", "Yes, e.g. `{(0, 0): \"start\"}`"],
          ["Speed and memory", "Slightly more", "Slightly less"],
          ["Methods", "Many (append, sort…)", "Only count() and index()"],
        ] },
        py("Tuples as dictionary keys", src`
distance = {("Delhi", "Agra"): 233, ("Mumbai", "Pune"): 149}   # dictionaries: next module
print(distance[("Mumbai", "Pune")], "km")
`, "149 km"),
        { t: "analogy", text: "A list is a pencil-written list: erase and rewrite anytime. A tuple is printed on your Aadhaar card: name, date of birth, number. It's a fixed record; to change it, you'd issue a new card." },
        { t: "trap", text: "`(5)` is not a tuple, it's the number 5. A one-item tuple needs a trailing comma: `(5,)`. When unpacking, the number of variables must match: `a, b = (1, 2, 3)` raises `ValueError: too many values to unpack`." },
        { t: "trick", text: "**List = changeable shopping list. Tuple = fixed record. One item? Add a comma.**" },
        { t: "exam", items: ["Difference between a list and a tuple?", "Why can a tuple be a dictionary key but a list can't? (Keys must be hashable/immutable.)", "How do you create a single-element tuple?", "How does a function return multiple values? (As a tuple.)"] },
        { t: "recap", items: ["Tuples use ( ) and can't be changed", "a, b = (1, 2) unpacks", "Returning several values returns a tuple", "Tuples can be dict keys; lists can't", "(5,) is a tuple; (5) is just 5"] },
      ],
      quiz: [
        { q: "Which is a tuple with one item?", options: ["(7,)", "(7)", "[7]", "{7}"], answer: 0, explain: "The comma makes it a tuple." },
        { q: "t = (1, 2); t[0] = 5 gives…", options: ["TypeError", "(5, 2)", "(1, 5)", "Nothing"], answer: 0, explain: "Tuples are immutable." },
        { q: "a, b = (10, 20). What is b?", options: ["20", "10", "(10, 20)", "Error"], answer: 0, explain: "Unpacking matches by position." },
        { q: "Which can be a dictionary key?", options: ["(1, 2)", "[1, 2]", "{1, 2}", "{\"a\": 1}"], answer: 0, explain: "Keys must be immutable." },
      ],
    },
  ],
};

export const PY06_DICTS_SETS: LearnModule = {
  id: "dicts-sets",
  title: "Dictionaries and sets",
  titleHi: "डिक्शनरी और सेट",
  blurb: "Store data by name with dictionaries (key → value), count things, handle nested records like JSON, and use sets for unique items and fast membership checks.",
  lessons: [
    {
      id: "dictionaries",
      title: "Dictionaries: key → value",
      oneLine: "A dictionary stores pairs: a key (like a label) and its value. You look values up by key, not by position: student[\"name\"]. Lookups are very fast, no matter how big the dictionary is.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Create, read, add, change and delete" },
        py("Dictionary basics", src`
student = {"name": "Asha", "age": 21, "city": "Patna"}   # key: value pairs
print(student["name"])            # look up by key
print(student.get("marks"))       # get() returns None if the key is missing
print(student.get("marks", 0))    # …or a default you choose

student["marks"] = 88             # add a new key
student["age"] = 22               # change an existing key
print(student)

del student["city"]               # delete a key
print(student)
print("age" in student)           # does this KEY exist?
print(len(student))               # number of pairs
`, "Asha\nNone\n0\n{'name': 'Asha', 'age': 22, 'city': 'Patna', 'marks': 88}\n{'name': 'Asha', 'age': 22, 'marks': 88}\nTrue\n3"),
        py("KeyError", src`
student = {"name": "Asha"}
try:
    print(student["phone"])       # [ ] with a missing key is an error
except KeyError as e:
    print("KeyError:", e)
print(student.get("phone", "not given"))   # safe
`, "KeyError: 'phone'\nnot given"),
        { t: "h", text: "Step 2: Loop over a dictionary" },
        py("keys, values and items", src`
prices = {"pen": 10, "book": 45, "bag": 799}

for item in prices:                      # looping gives the KEYS
    print(item)

for item, price in prices.items():       # key and value together
    print(f"{item}: ₹{price}")

print(list(prices.keys()))
print(list(prices.values()))
print("Total:", sum(prices.values()))

prices.update({"pen": 12, "ink": 30})    # change and add several at once
removed = prices.pop("bag")              # remove and return a value
print(prices, removed)
`, "pen\nbook\nbag\npen: ₹10\nbook: ₹45\nbag: ₹799\n['pen', 'book', 'bag']\n[10, 45, 799]\nTotal: 854\n{'pen': 12, 'book': 45, 'ink': 30} 799"),
        { t: "table", head: ["Operation", "Code", "Notes"], rows: [
          ["Read", "`d[key]` / `d.get(key, default)`", "[ ] raises KeyError; get() doesn't"],
          ["Add / change", "`d[key] = value`", "Same syntax for both"],
          ["Delete", "`del d[key]` / `d.pop(key)`", "pop returns the value"],
          ["Check a key", "`key in d`", "Checks keys, not values"],
          ["Loop", "`for k, v in d.items():`", "Keys stay in insertion order (Python 3.7+)"],
        ] },
        { t: "analogy", text: "A dictionary is a real dictionary: you don't read page by page to find \"python\", you jump straight to the word (key) and read its meaning (value). Or your phone's contacts: name → number." },
        { t: "trap", text: "Keys must be **unique** and **immutable** (str, int, tuple). Writing the same key twice keeps only the last value: `{\"a\": 1, \"a\": 2}` is `{'a': 2}`. And `in` checks keys only: `45 in prices` is False even though 45 is a value; use `45 in prices.values()`." },
        { t: "trick", text: "**d[key] when it must exist, d.get(key, default) when it might not.**" },
        { t: "exam", items: ["What is a dictionary? How is it different from a list?", "Difference between d[key] and d.get(key)?", "Can dictionary keys be lists? (No, keys must be hashable.)", "Are dictionaries ordered? (Yes, insertion order is kept since Python 3.7.)", "Time to look up a key? (O(1) on average: it's a hash table.)"] },
        { t: "recap", items: ["{key: value}; look up with d[key]", "get() avoids KeyError", "d[key] = v adds or updates; del / pop removes", "for k, v in d.items() loops over pairs", "Keys are unique and immutable"] },
      ],
      quiz: [
        { q: "d = {\"a\": 1}. What is d.get(\"b\", 0)?", options: ["0", "None", "KeyError", "1"], answer: 0, explain: "The default is returned." },
        { q: "How do you add the key \"x\" with value 5?", options: ["d[\"x\"] = 5", "d.add(\"x\", 5)", "d.append(\"x\": 5)", "d += {\"x\": 5}"], answer: 0, explain: "Assignment adds or updates." },
        { q: "for k in d: gives…", options: ["The keys", "The values", "(key, value) pairs", "Indexes"], answer: 0, explain: "Use .items() for pairs." },
        { q: "{\"a\": 1, \"a\": 2} becomes…", options: ["{'a': 2}", "{'a': 1}", "{'a': [1, 2]}", "Error"], answer: 0, explain: "The last value wins." },
        { q: "Which can be a key?", options: ["\"name\"", "[1, 2]", "{\"a\": 1}", "{1, 2}"], answer: 0, explain: "Keys must be immutable." },
      ],
    },
    {
      id: "dict-practice",
      title: "Counting, nested data and lists of records",
      oneLine: "Real programs use dictionaries to count things, to store records (a list of dictionaries, exactly like JSON from an API), and to nest data inside data.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Counting with a dictionary" },
        py("Word count", src`
text = "the cat and the dog and the bird"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1     # 0 the first time, then +1
print(counts)

most = max(counts, key=counts.get)              # the key with the biggest value
print("Most common:", most, counts[most])
`, "{'the': 3, 'cat': 1, 'and': 2, 'dog': 1, 'bird': 1}\nMost common: the 3"),
        { t: "table", head: ["word", "counts.get(word, 0)", "counts after"], rows: [["the", "0", "{the: 1}"], ["cat", "0", "{the: 1, cat: 1}"], ["and", "0", "… and: 1"], ["the", "**1**", "the: 2"], ["dog", "0", "dog: 1"], ["and", "1", "and: 2"], ["the", "2", "**the: 3**"], ["bird", "0", "bird: 1"]], caption: "Dry run of the counting line" },
        { t: "h", text: "Step 2: A list of dictionaries (records)" },
        py("Student records", src`
students = [
    {"name": "Asha", "marks": 88},
    {"name": "Ravi", "marks": 72},
    {"name": "Zoya", "marks": 95},
]

total = 0
top = students[0]
for s in students:
    print(s["name"], "-", s["marks"])
    total += s["marks"]
    if s["marks"] > top["marks"]:
        top = s

print("Average:", round(total / len(students), 2))
print("Topper:", top["name"])
`, "Asha - 88\nRavi - 72\nZoya - 95\nAverage: 85.0\nTopper: Zoya"),
        { t: "h", text: "Step 3: Nested dictionaries" },
        py("Data inside data", src`
school = {
    "10A": {"teacher": "Mrs. Rao", "students": 32, "subjects": ["Maths", "Science"]},
    "10B": {"teacher": "Mr. Khan", "students": 28, "subjects": ["Maths", "History"]},
}
print(school["10A"]["teacher"])            # go one level at a time
print(school["10B"]["subjects"][1])

for cls, info in school.items():
    print(f"{cls}: {info['teacher']}, {info['students']} students")
`, "Mrs. Rao\nHistory\n10A: Mrs. Rao, 32 students\n10B: Mr. Khan, 28 students"),
        { t: "p", text: "This shape (dictionaries and lists inside each other) is exactly what **JSON** looks like. Almost every web API sends data like this, so reading nested data is a key job skill. You'll read and write JSON files in Module 9." },
        { t: "h", text: "Step 4: Grouping" },
        py("Group students by city", src`
people = [("Asha", "Patna"), ("Ravi", "Pune"), ("Zoya", "Patna"), ("Imran", "Pune"), ("Neha", "Delhi")]
by_city = {}
for name, city in people:
    if city not in by_city:
        by_city[city] = []          # first time: start an empty list
    by_city[city].append(name)
print(by_city)
`, "{'Patna': ['Asha', 'Zoya'], 'Pune': ['Ravi', 'Imran'], 'Delhi': ['Neha']}"),
        { t: "analogy", text: "A list of dictionaries is a register: each row is a student (a dictionary), and each column is a field (name, marks). Nested dictionaries are folders inside folders: school → class → teacher." },
        { t: "trap", text: "With nested data, one missing key crashes the whole line: `data[\"user\"][\"address\"][\"city\"]`. When data comes from outside (an API or a file), use `.get()` at each level or check with `in` first." },
        { t: "trick", text: "**Count: d[k] = d.get(k, 0) + 1. Group: d.setdefault(k, []).append(v).**" },
        { t: "exam", items: ["Count the frequency of each word or character.", "Find the key with the maximum value. (max(d, key=d.get))", "Group items by a property.", "Merge two dictionaries. (d1 | d2 or {**d1, **d2})", "What is JSON and how does it map to Python? (objects → dict, arrays → list.)"] },
        { t: "recap", items: ["Counting pattern: d[k] = d.get(k, 0) + 1", "A list of dicts = a table of records (like JSON)", "Nested access goes one level at a time: d[a][b]", "Grouping: a dict of lists", "Use get() for data you don't control"] },
      ],
      quiz: [
        { q: "After counting \"aab\" letter by letter, counts[\"a\"] is…", options: ["2", "1", "3", "0"], answer: 0, explain: "a appears twice." },
        { q: "data = {\"u\": {\"n\": \"Asha\"}}. How do you get \"Asha\"?", options: ["data[\"u\"][\"n\"]", "data[\"n\"]", "data.u.n", "data[\"u.n\"]"], answer: 0, explain: "One level at a time." },
        { q: "max(d, key=d.get) returns…", options: ["The key with the biggest value", "The biggest value", "The last key", "The biggest key"], answer: 0, explain: "It compares keys by their values." },
        { q: "A JSON object becomes which Python type?", options: ["dict", "list", "tuple", "set"], answer: 0, explain: "JSON arrays become lists." },
      ],
    },
    {
      id: "sets",
      title: "Sets: unique items",
      oneLine: "A set is an unordered collection with no duplicates: {1, 2, 3}. It's perfect for removing duplicates, checking membership quickly, and comparing groups (common items, differences).",
      minutes: 14,
      blocks: [
        { t: "h", text: "Step 1: Unique items" },
        py("Set basics", src`
nums = [1, 2, 2, 3, 3, 3]
unique = set(nums)                # duplicates disappear
print(unique)
print(len(unique))

fruits = {"apple", "mango"}
fruits.add("banana")
fruits.add("apple")               # already there: nothing happens
print(len(fruits))
print("mango" in fruits)          # very fast check
fruits.discard("grape")           # remove if present (no error if missing)
print(sorted(fruits))             # sets have no order, so sort to display

print(type({}), type(set()))      # {} is an empty DICT; use set()
`, "{1, 2, 3}\n3\n3\nTrue\n['apple', 'banana', 'mango']\n<class 'dict'> <class 'set'>"),
        { t: "h", text: "Step 2: Set maths" },
        py("Union, intersection, difference", src`
python_class = {"Asha", "Ravi", "Zoya", "Imran"}
java_class = {"Ravi", "Imran", "Neha"}

print(sorted(python_class & java_class))   # in BOTH
print(sorted(python_class | java_class))   # in EITHER (all students)
print(sorted(python_class - java_class))   # only in python_class
print(sorted(python_class ^ java_class))   # in exactly one
`, "['Imran', 'Ravi']\n['Asha', 'Imran', 'Neha', 'Ravi', 'Zoya']\n['Asha', 'Zoya']\n['Asha', 'Neha', 'Zoya']"),
        { t: "diagram", text: "      python_class          java_class\n    ┌──────────────┐   ┌──────────────┐\n    │ Asha  ┌──────┼───┼───┐          │\n    │ Zoya  │ Ravi │   │   │  Neha    │\n    │       │Imran │   │   │          │\n    └───────┼──────┘   └───┼──────────┘\n            └── & = {Ravi, Imran} ──┘" },
        { t: "table", head: ["Operator", "Method", "Meaning"], rows: [["`a | b`", "`a.union(b)`", "Everything in a or b"], ["`a & b`", "`a.intersection(b)`", "Only what's in both"], ["`a - b`", "`a.difference(b)`", "In a but not in b"], ["`a ^ b`", "`a.symmetric_difference(b)`", "In one but not both"]] },
        py("Remove duplicates but keep the order", src`
names = ["Ravi", "Asha", "Ravi", "Zoya", "Asha"]
print(list(dict.fromkeys(names)))     # keeps the first appearance of each

seen = set()
result = []
for name in names:
    if name not in seen:              # O(1) check
        seen.add(name)
        result.append(name)
print(result)
`, "['Ravi', 'Asha', 'Zoya']\n['Ravi', 'Asha', 'Zoya']"),
        { t: "analogy", text: "A set is a guest list at the gate: each name appears once, and the guard can instantly say whether you're on it. Comparing two guest lists (who's invited to both weddings?) is just set intersection." },
        { t: "trap", text: "Sets are **unordered**: you can't use `s[0]`, and the printed order of strings can change between runs. `{}` creates an empty **dictionary**, not a set; use `set()`. Set items must be immutable, so a set can't contain lists." },
        { t: "trick", text: "**set(list) removes duplicates. & both, | either, - only the first.**" },
        { t: "exam", items: ["Remove duplicates from a list (with and without keeping order).", "Find common elements of two lists.", "Why is checking x in a set faster than x in a list? (O(1) hashing vs O(n) scanning.)", "Difference between remove() and discard()?", "What is a frozenset? (An immutable set.)"] },
        { t: "recap", items: ["Sets hold unique items, with no order and no indexing", "add, discard, remove; x in s is fast", "& intersection, | union, - difference, ^ symmetric difference", "set() for an empty set; {} is an empty dict"] },
      ],
      quiz: [
        { q: "len({1, 1, 2, 2, 3}) is…", options: ["3", "5", "2", "Error"], answer: 0, explain: "Duplicates are removed." },
        { q: "{1, 2, 3} & {2, 3, 4} is…", options: ["{2, 3}", "{1, 2, 3, 4}", "{1, 4}", "{1}"], answer: 0, explain: "& keeps items in both." },
        { q: "type({}) is…", options: ["dict", "set", "list", "tuple"], answer: 0, explain: "Use set() for an empty set." },
        { q: "Why use a set for membership checks?", options: ["x in set is O(1), much faster than a list", "Sets keep order", "Sets allow duplicates", "Sets are always sorted"], answer: 0, explain: "Sets are hash tables." },
      ],
    },
  ],
};

export const PY07_FUNCTIONS: LearnModule = {
  id: "functions",
  title: "Functions",
  titleHi: "फ़ंक्शन",
  blurb: "Write reusable blocks of code: parameters, return values, default and keyword arguments, *args and **kwargs, scope, lambda and recursion.",
  lessons: [
    {
      id: "functions-basics",
      title: "Defining functions, parameters and return",
      oneLine: "A function is a named block of code you write once and run (call) many times. def creates it, parameters receive input, and return sends a result back to the caller.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Define, then call" },
        py("Your first function", src`
def greet():                     # def + name + () + colon
    print("Hello!")              # the body is indented
    print("Welcome to Python.")

greet()                          # call it: the body runs now
greet()                          # and again
`, "Hello!\nWelcome to Python.\nHello!\nWelcome to Python."),
        { t: "h", text: "Step 2: Parameters (inputs)" },
        py("Parameters", src`
def greet(name):                 # name is a parameter: a variable that receives a value
    print(f"Hello, {name}!")

greet("Asha")                    # "Asha" is the argument
greet("Ravi")
`, "Hello, Asha!\nHello, Ravi!"),
        { t: "h", text: "Step 3: return (output)" },
        py("Returning a value", src`
def add(a, b):
    return a + b                 # send the answer back to the caller

result = add(3, 4)               # the call is replaced by the returned value
print(result)
print(add(10, 20) * 2)           # use the result directly in an expression

def is_even(n):
    return n % 2 == 0            # return a True/False answer
print(is_even(4), is_even(7))

def price_with_gst(price, rate):
    tax = price * rate / 100
    return price + tax
print(price_with_gst(1000, 18))
`, "7\n60\nTrue False\n1180.0"),
        { t: "example", title: "What happens in result = add(3, 4)", steps: ["Python jumps into add with a = 3 and b = 4.", "It calculates a + b = 7 and hits return 7.", "The function ends and the call add(3, 4) becomes 7.", "result = 7."], answer: "return hands a value back to the line that called the function." },
        py("print vs return", src`
def show_square(n):
    print(n * n)                 # prints, but returns nothing (None)

def square(n):
    return n * n                 # returns the value, prints nothing

a = show_square(5)               # prints 25 here
b = square(5)
print(a, b)
`, "25\nNone 25"),
        { t: "h", text: "Step 4: Several return values and docstrings" },
        py("Return several values", src`
def stats(nums):
    """Return the smallest, largest and average of a list."""
    return min(nums), max(nums), sum(nums) / len(nums)

low, high, avg = stats([4, 8, 6])
print(low, high, avg)
print(stats.__doc__)             # the docstring documents the function
`, "4 8 6.0\nReturn the smallest, largest and average of a list."),
        { t: "analogy", text: "A function is a juice machine. Parameters are the slot where you put fruit (input). The body is the machine working. return is the juice coming out, which you can drink, pour into a glass (a variable) or mix into something else. A function that only prints is a machine that shows you a picture of juice: nice, but you can't use it." },
        { t: "trap", text: "A function that doesn't hit `return` gives back **None**. Using print inside a function when you need the value later is the most common mistake. Also, code after `return` never runs. And define a function **before** you call it." },
        { t: "trick", text: "**def name(inputs): … return output. If you'll use the result, return it; don't print it.**" },
        { t: "exam", items: ["What is a function? Why use functions? (Reuse, organisation, testing.)", "Difference between a parameter and an argument?", "Difference between print and return?", "What does a function return if there's no return statement? (None.)", "Can a Python function return multiple values? (Yes, as a tuple.)"] },
        { t: "recap", items: ["def name(params): with an indented body", "Call it with name(arguments)", "return sends a value back; without it you get None", "Return several values as a tuple and unpack them", "A docstring explains what the function does"] },
      ],
      quiz: [
        { q: "What keyword creates a function?", options: ["def", "function", "func", "fn"], answer: 0, explain: "def name():" },
        { q: "What does this print?", code: "def f(x):\n    return x * 3\nprint(f(4))", options: ["12", "4", "x * 3", "None"], answer: 0, explain: "4 * 3 = 12." },
        { q: "A function with no return statement returns…", options: ["None", "0", "False", "An error"], answer: 0, explain: "None is the default." },
        { q: "In def add(a, b):, a and b are…", options: ["Parameters", "Arguments", "Return values", "Globals"], answer: 0, explain: "The values passed in a call are arguments." },
        { q: "A function that ends with return x, y returns a…", options:["tuple", "list", "dict", "set"], answer: 0, explain: "return x, y returns (x, y)." },
      ],
    },
    {
      id: "arguments",
      title: "Default, keyword, *args and **kwargs",
      oneLine: "Parameters can have default values, arguments can be passed by name, *args collects any number of positional arguments into a tuple, and **kwargs collects named ones into a dictionary.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Default and keyword arguments" },
        py("Defaults and keywords", src`
def greet(name, greeting="Hello"):        # greeting has a default value
    print(f"{greeting}, {name}!")

greet("Asha")                             # uses the default
greet("Ravi", "Namaste")                  # overrides it
greet(greeting="Hi", name="Zoya")         # keyword arguments: any order
`, "Hello, Asha!\nNamaste, Ravi!\nHi, Zoya!"),
        { t: "h", text: "Step 2: *args (any number of values)" },
        py("*args", src`
def total(*numbers):              # * collects all positional arguments
    print(numbers)                # it's a tuple
    return sum(numbers)

print(total(1, 2, 3))
print(total(5, 10))
`, "(1, 2, 3)\n6\n(5, 10)\n15"),
        { t: "h", text: "Step 3: **kwargs (any number of named values)" },
        py("**kwargs", src`
def profile(name, **details):     # ** collects keyword arguments
    print("Name:", name)
    for key, value in details.items():   # it's a dictionary
        print(f"  {key}: {value}")

profile("Asha", age=21, city="Patna")
`, "Name: Asha\n  age: 21\n  city: Patna"),
        py("Unpacking into a call", src`
def area(length, width):
    return length * width

sizes = [4, 5]
print(area(*sizes))                       # * spreads a list into positions
room = {"length": 3, "width": 6}
print(area(**room))                       # ** spreads a dict into keywords
`, "20\n18"),
        { t: "table", head: ["Order in a definition", "Example"], rows: [["1. Normal parameters", "`a, b`"], ["2. *args", "`*args`"], ["3. Parameters with defaults / keyword-only", "`sep=\" \"`"], ["4. **kwargs", "`**kwargs`"]], caption: "def f(a, b, *args, sep=\" \", **kwargs) — this is how print() itself is built." },
        { t: "h", text: "Step 4: The mutable default trap" },
        py("Never use a list as a default", src`
def add_item(item, cart=[]):          # the SAME list is reused on every call!
    cart.append(item)
    return cart

print(add_item("pen"))
print(add_item("book"))               # surprise: pen is still there

def add_item_fixed(item, cart=None):  # the safe pattern
    if cart is None:
        cart = []                     # a fresh list on every call
    cart.append(item)
    return cart

print(add_item_fixed("pen"))
print(add_item_fixed("book"))
`, "['pen']\n['pen', 'book']\n['pen']\n['book']"),
        { t: "analogy", text: "Default arguments are a restaurant's default order: \"tea, with sugar\" unless you say otherwise. Keyword arguments are telling the waiter \"sugar: no, milk: extra\": you name what you change, in any order. *args is \"bring as many samosas as I list\"." },
        { t: "trap", text: "Default values are created **once**, when the function is defined. A list or dict default is shared between calls, which causes the bug above. Use `None` and create the list inside. Also, parameters with defaults must come after those without: `def f(a=1, b):` is a SyntaxError." },
        { t: "trick", text: "**Defaults: never [] or {}; use None. *args = tuple, **kwargs = dict.**" },
        { t: "exam", items: ["What are *args and **kwargs?", "Explain the mutable default argument problem.", "Positional vs keyword arguments?", "What does * do in a function call? (Unpacks a list/tuple into arguments.)", "Write a function that accepts any number of numbers and returns their average."] },
        { t: "recap", items: ["Defaults: def f(x, y=10)", "Keyword arguments: f(y=3, x=1), any order", "*args → tuple of extra positional arguments", "**kwargs → dict of extra keyword arguments", "Use None instead of [] or {} as a default"] },
      ],
      quiz: [
        { q: "def f(a, b=2): return a + b. What is f(5)?", options: ["7", "5", "Error", "2"], answer: 0, explain: "b uses its default 2." },
        { q: "Inside def f(*args):, args is a…", options: ["tuple", "list", "dict", "set"], answer: 0, explain: "**kwargs is a dict." },
        { q: "Why is def f(x, items=[]) risky?", options: ["The same list is shared between calls", "Lists can't be parameters", "It's a syntax error", "It's slower"], answer: 0, explain: "Use items=None." },
        { q: "f(**{\"a\": 1, \"b\": 2}) is the same as…", options: ["f(a=1, b=2)", "f(1, 2) always", "f({\"a\": 1, \"b\": 2})", "f(\"a\", \"b\")"], answer: 0, explain: "** spreads a dict into keyword arguments." },
      ],
    },
    {
      id: "scope-lambda",
      title: "Scope, lambda and recursion",
      oneLine: "Variables created inside a function are local and disappear when it ends. lambda makes a tiny one-line function, often used as a sort key. A recursive function calls itself on a smaller problem.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Local and global scope" },
        py("Local vs global", src`
x = 10                    # global: created outside any function

def show():
    y = 5                 # local: lives only inside show()
    print(x, y)           # functions can READ globals

show()
try:
    print(y)              # y doesn't exist out here
except NameError as e:
    print("NameError:", e)
`, "10 5\nNameError: name 'y' is not defined"),
        py("Changing a global (and a better way)", src`
count = 0
def increase():
    global count          # needed to CHANGE a global inside a function
    count += 1

increase()
increase()
print(count)

def increased(n):         # better: take a value in, return the new value
    return n + 1
score = increased(increased(0))
print(score)
`, "2\n2", "Avoid `global` in real code: functions that take inputs and return outputs are easier to understand and test."),
        { t: "h", text: "Step 2: lambda (tiny anonymous functions)" },
        py("lambda", src`
square = lambda n: n * n          # lambda inputs: expression
print(square(6))

students = [("Asha", 88), ("Ravi", 72), ("Zoya", 95)]
print(sorted(students, key=lambda s: s[1]))       # sort by marks
print(max(students, key=lambda s: s[1])[0])       # name of the topper
print(sorted(students, key=lambda s: -s[1]))      # highest first
`, "36\n[('Ravi', 72), ('Asha', 88), ('Zoya', 95)]\nZoya\n[('Zoya', 95), ('Asha', 88), ('Ravi', 72)]"),
        { t: "table", head: ["", "def", "lambda"], rows: [["Size", "Any number of lines", "One expression only"], ["Name", "Has a name", "Anonymous (can be stored in a variable)"], ["Best for", "Most functions", "Short keys for sorted / max / min / map / filter"]] },
        { t: "h", text: "Step 3: Functions are values" },
        py("Passing a function to a function", src`
def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

def apply(func, value):           # func is a function passed in
    return func(value)

print(apply(shout, "hi"))
print(apply(whisper, "HELLO"))
`, "HI!\nhello..."),
        { t: "h", text: "Step 4: Recursion (a function calling itself)" },
        py("Factorial with recursion", src`
def factorial(n):
    if n <= 1:                    # base case: stop here
        return 1
    return n * factorial(n - 1)   # smaller problem

print(factorial(5))
`, "120"),
        { t: "diagram", text: "factorial(5) = 5 * factorial(4)\n             = 5 * 4 * factorial(3)\n             = 5 * 4 * 3 * factorial(2)\n             = 5 * 4 * 3 * 2 * factorial(1)\n             = 5 * 4 * 3 * 2 * 1 = 120", caption: "The DSA course has a full module on recursion and backtracking." },
        { t: "analogy", text: "Scope is like rooms in a house: what you put on the table in your bedroom (local) can't be seen from the kitchen, but everyone can see the clock in the hall (global). Recursion is Russian dolls: open one, and there's a smaller one inside, until the smallest doll (the base case)." },
        { t: "trap", text: "Recursion without a base case runs until Python stops it with `RecursionError: maximum recursion depth exceeded` (about 1,000 calls). For large n, use a loop. And don't write big multi-line logic in a lambda: if it needs a name or more than one line, use def." },
        { t: "trick", text: "**Local = inside the function only. lambda = one-line key. Recursion = base case + smaller call.**" },
        { t: "exam", items: ["What is the LEGB rule? (Local, Enclosing, Global, Built-in: the order Python looks up names.)", "What does the global keyword do?", "What is a lambda function? Give a use.", "What is recursion? What is a base case?", "Are functions first-class objects in Python? (Yes: they can be passed and returned.)"] },
        { t: "recap", items: ["Variables inside a function are local", "Functions can read globals; changing one needs global (avoid it)", "lambda x: expr is a one-line function, great as a key", "Functions can be passed around like values", "Recursion needs a base case"] },
      ],
      quiz: [
        { q: "A variable created inside a function is…", options: ["Local to that function", "Global", "Shared by all functions", "A constant"], answer: 0, explain: "It disappears when the function ends." },
        { q: "(lambda a, b: a * b)(3, 4) is…", options: ["12", "7", "34", "Error"], answer: 0, explain: "A lambda called immediately." },
        { q: "Sort a list of (name, marks) by marks:", options: ["sorted(data, key=lambda s: s[1])", "sorted(data, s[1])", "data.sort(1)", "sorted(data, by=marks)"], answer: 0, explain: "key tells sorted what to compare." },
        { q: "A recursive function with no base case gives…", options: ["RecursionError", "0", "None", "An infinite loop with no error"], answer: 0, explain: "Python limits the depth to about 1,000." },
      ],
    },
  ],
};

export const PY08_PYTHONIC: LearnModule = {
  id: "pythonic",
  title: "Pythonic code: comprehensions and built-ins",
  titleHi: "पाइथॉनिक कोड",
  blurb: "Write short, clear Python: list/dict/set comprehensions, the most useful built-in functions (zip, enumerate, sorted, map, filter, any, all), and classic practice problems.",
  lessons: [
    {
      id: "comprehensions",
      title: "List, dict and set comprehensions",
      oneLine: "A comprehension builds a new list (or dict or set) in one readable line: [expression for item in items if condition]. It replaces the \"empty list + loop + append\" pattern.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: From a loop to a comprehension" },
        py("Same result, two ways", src`
squares = []
for n in range(1, 6):            # the long way
    squares.append(n * n)
print(squares)

squares = [n * n for n in range(1, 6)]   # the comprehension
print(squares)
`, "[1, 4, 9, 16, 25]\n[1, 4, 9, 16, 25]"),
        { t: "diagram", text: "[ n * n   for n in range(1, 6)   if n % 2 == 1 ]\n   ───┬─   ──────────┬──────────   ──────┬──────\n  what to keep   loop over this      only if this is True" },
        py("With a condition and a transformation", src`
evens = [n for n in range(1, 11) if n % 2 == 0]      # filter
print(evens)

names = ["asha", "ravi", "zoya"]
print([name.title() for name in names])               # transform

labels = ["even" if n % 2 == 0 else "odd" for n in range(1, 5)]   # if/else goes FIRST
print(labels)

matrix = [[1, 2], [3, 4], [5, 6]]
print([x for row in matrix for x in row])             # flatten: loops in normal order
print([[0] * 3 for _ in range(2)])                    # a safe 2-D grid
`, "[2, 4, 6, 8, 10]\n['Asha', 'Ravi', 'Zoya']\n['odd', 'even', 'odd', 'even']\n[1, 2, 3, 4, 5, 6]\n[[0, 0, 0], [0, 0, 0]]"),
        { t: "h", text: "Step 2: Dict and set comprehensions" },
        py("Dict and set comprehensions", src`
names = ["asha", "ravindra", "zoya"]
print({name: len(name) for name in names})            # dict: key: value

prices = {"pen": 10, "book": 45, "bag": 799}
print({item: round(p * 1.18, 2) for item, p in prices.items()})    # add 18% GST
print({item: p for item, p in prices.items() if p < 100})          # filter a dict

print({len(w) for w in ["hi", "yo", "hey"]})          # set: unique lengths
print(sum(n * n for n in range(1, 11)))               # generator: no list needed
`, "{'asha': 4, 'ravindra': 8, 'zoya': 4}\n{'pen': 11.8, 'book': 53.1, 'bag': 942.82}\n{'pen': 10, 'book': 45}\n{2, 3}\n385"),
        { t: "table", head: ["Brackets", "Builds", "Example"], rows: [["`[ ]`", "list", "`[x * 2 for x in nums]`"], ["`{k: v}`", "dict", "`{x: x * 2 for x in nums}`"], ["`{ }`", "set", "`{x % 3 for x in nums}`"], ["`( )` inside a call", "generator (lazy, no list)", "`sum(x * 2 for x in nums)`"]] },
        { t: "analogy", text: "A comprehension is an order to a factory line: \"for every apple on the belt, if it's ripe, make juice\". One sentence describes the whole process, instead of instructions for each step." },
        { t: "trap", text: "Don't cram complex logic into one line. If a comprehension needs nested ifs, several loops or side effects (like print), a normal loop is clearer. Note the position: a filter `if` goes at the **end**; an `if/else` that chooses the value goes at the **start**." },
        { t: "trick", text: "**[what for item in items if keep]. if/else before for; plain if after.**" },
        { t: "exam", items: ["What is a list comprehension? Convert a loop into one.", "Squares of even numbers from 1 to 20 in one line.", "What is a dictionary comprehension?", "Difference between a list comprehension and a generator expression? (A generator is lazy and uses almost no memory.)", "Flatten a 2-D list."] },
        { t: "recap", items: ["[expr for x in items if cond] builds a list", "{k: v for …} builds a dict, {x for …} a set", "if/else value choice goes before for", "(expr for …) inside sum/max/any is a memory-friendly generator", "Readable first: use a loop for complex logic"] },
      ],
      quiz: [
        { q: "[x * 2 for x in [1, 2, 3]] is…", options: ["[2, 4, 6]", "[1, 2, 3, 1, 2, 3]", "[2, 3, 4]", "6"], answer: 0, explain: "Each item doubled." },
        { q: "[x for x in range(6) if x % 3 == 0] is…", options: ["[0, 3]", "[3]", "[0, 3, 6]", "[1, 2, 4, 5]"], answer: 0, explain: "6 isn't in range(6)." },
        { q: "{x: x * x for x in [2, 3]} is…", options: ["{2: 4, 3: 9}", "[4, 9]", "{4, 9}", "{2: 2, 3: 3}"], answer: 0, explain: "A dict comprehension." },
        { q: "Where does an if/else that chooses the value go?", options: ["Before for", "After for", "At the very end", "It isn't allowed"], answer: 0, explain: "[a if c else b for x in xs]" },
      ],
    },
    {
      id: "built-ins",
      title: "Built-in functions you'll use every day",
      oneLine: "Python ships with powerful built-in functions: zip pairs lists, enumerate numbers them, sorted sorts with a key, map and filter transform and select, any and all check conditions, and many more.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: zip, enumerate, map and filter" },
        py("Working with several lists", src`
names = ["Asha", "Ravi", "Zoya"]
marks = [88, 72, 95]

for name, mark in zip(names, marks):          # pair items by position
    print(name, mark)
print(dict(zip(names, marks)))                # two lists → a dictionary

for i, name in enumerate(names, start=1):     # number the items
    print(i, name)

print(list(map(str.upper, names)))            # apply a function to every item
print(list(filter(lambda m: m >= 80, marks))) # keep items where the test is True
`, "Asha 88\nRavi 72\nZoya 95\n{'Asha': 88, 'Ravi': 72, 'Zoya': 95}\n1 Asha\n2 Ravi\n3 Zoya\n['ASHA', 'RAVI', 'ZOYA']\n[88, 95]"),
        { t: "h", text: "Step 2: Sorting with key" },
        py("sorted with key and reverse", src`
words = ["banana", "kiwi", "apple", "fig"]
print(sorted(words))                          # alphabetical
print(sorted(words, key=len))                 # by length
print(sorted(words, key=len, reverse=True))   # longest first
print(min(words, key=len), max(words, key=len))
`, "['apple', 'banana', 'fig', 'kiwi']\n['fig', 'kiwi', 'apple', 'banana']\n['banana', 'apple', 'kiwi', 'fig']\nfig banana"),
        { t: "h", text: "Step 3: any, all and friends" },
        py("Checks and small helpers", src`
marks = [88, 72, 95]
print(any(m < 75 for m in marks))      # is at least one True?
print(all(m >= 70 for m in marks))     # are all True?
print(list(reversed(marks)))           # reverse order (a new list here)
print(abs(-7), pow(2, 10), divmod(17, 5))
print(round(3.14159, 2))
print(isinstance(3.5, float), isinstance("3", int))
print(sum([0.5, 1.5]), len("hello"))
`, "True\nTrue\n[95, 72, 88]\n7 1024 (3, 2)\n3.14\nTrue False\n2.0 5"),
        { t: "table", head: ["Function", "Does", "Example → result"], rows: [
          ["`zip(a, b)`", "Pairs items by position", "`zip([1, 2], \"ab\")` → (1, 'a'), (2, 'b')"],
          ["`enumerate(x, start)`", "Index + item", "`enumerate(\"ab\")` → (0, 'a'), (1, 'b')"],
          ["`sorted(x, key, reverse)`", "New sorted list", "`sorted([3, 1])` → [1, 3]"],
          ["`map(f, x)`", "f applied to each item", "`map(int, [\"1\", \"2\"])` → 1, 2"],
          ["`filter(f, x)`", "Items where f is True", "`filter(None, [0, 1, 2])` → 1, 2"],
          ["`any(x)` / `all(x)`", "At least one / every item True", "`any([0, 1])` → True"],
          ["`divmod(a, b)`", "(a // b, a % b)", "`divmod(17, 5)` → (3, 2)"],
          ["`isinstance(x, T)`", "Is x of type T?", "`isinstance(5, int)` → True"],
        ] },
        { t: "p", text: "`map` and `filter` return lazy objects, so wrap them in `list()` to see the items. Many Python developers prefer comprehensions: `[s.upper() for s in names]` does the same as `map`." },
        { t: "analogy", text: "Built-ins are the tools already in your toolbox: a measuring tape (len), a sorter (sorted), a pairing machine (zip). Before writing a loop, check whether a built-in already does the job." },
        { t: "trap", text: "zip stops at the **shortest** list: `zip([1, 2, 3], \"ab\")` gives only 2 pairs, silently. A map or filter object can be used only once: after `list(m)`, `m` is empty. And `reversed()` and `sorted()` return new things; `list.reverse()` and `list.sort()` change the list." },
        { t: "trick", text: "**zip = pair, enumerate = number, sorted(key=) = order by anything, any/all = quick checks.**" },
        { t: "exam", items: ["What do zip and enumerate do?", "Difference between map, filter and a list comprehension?", "Sort a list of strings by length.", "Difference between any() and all()?", "What does divmod return?"] },
        { t: "recap", items: ["zip pairs, enumerate numbers", "sorted/min/max take key= and reverse=", "map transforms, filter selects (wrap in list())", "any/all check conditions", "Reach for a built-in before writing a loop"] },
      ],
      quiz: [
        { q: "list(zip([1, 2], [\"a\", \"b\"])) is…", options: ["[(1, 'a'), (2, 'b')]", "[1, 2, 'a', 'b']", "{1: 'a', 2: 'b'}", "[(1, 2), ('a', 'b')]"], answer: 0, explain: "Pairs by position." },
        { q: "all([True, 0, 5]) is…", options: ["False", "True", "0", "5"], answer: 0, explain: "0 is falsy." },
        { q: "sorted([\"bb\", \"a\", \"ccc\"], key=len) is…", options: ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['a', 'ccc', 'bb']", "Error"], answer: 0, explain: "Sorted by length." },
        { q: "list(map(int, [\"1\", \"2\"])) is…", options: ["[1, 2]", "['1', '2']", "3", "Error"], answer: 0, explain: "int applied to each item." },
      ],
    },
    {
      id: "practice-problems",
      title: "Practice problems (asked in tests and interviews)",
      oneLine: "Put everything together on the classic beginner problems: FizzBuzz, palindromes, anagrams, duplicates, second largest, vowels and reversing words. Each comes with a clear, Pythonic solution.",
      minutes: 20,
      blocks: [
        { t: "p", text: "Try each problem yourself first (5–10 minutes). Then compare with the solution and read the comments." },
        { t: "h", text: "Problem 1: FizzBuzz" },
        { t: "p", text: "For 1 to 15: print **Fizz** for multiples of 3, **Buzz** for multiples of 5, **FizzBuzz** for both, otherwise the number." },
        py("FizzBuzz", src`
out = []
for n in range(1, 16):
    if n % 15 == 0:            # check "both" FIRST
        out.append("FizzBuzz")
    elif n % 3 == 0:
        out.append("Fizz")
    elif n % 5 == 0:
        out.append("Buzz")
    else:
        out.append(str(n))
print(" ".join(out))
`, "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz"),
        { t: "h", text: "Problem 2: Palindrome (ignore case, spaces and punctuation)" },
        py("Palindrome", src`
def is_palindrome(text):
    clean = "".join(ch.lower() for ch in text if ch.isalnum())   # keep letters/digits
    return clean == clean[::-1]                                  # same backwards?

for t in ["Madam", "Never odd or even", "Python"]:
    print(t, "->", is_palindrome(t))
`, "Madam -> True\nNever odd or even -> True\nPython -> False"),
        { t: "h", text: "Problem 3: Anagrams" },
        py("Anagram check", src`
def is_anagram(a, b):
    return sorted(a.lower()) == sorted(b.lower())   # same letters, same counts

print(is_anagram("listen", "silent"))
print(is_anagram("Dusty", "study"))
print(is_anagram("hello", "world"))
`, "True\nTrue\nFalse"),
        { t: "h", text: "Problem 4: Second largest" },
        py("Second largest number", src`
def second_largest(nums):
    first = second = None
    for n in nums:
        if first is None or n > first:
            first, second = n, first           # old first moves down
        elif n != first and (second is None or n > second):
            second = n
    return second

print(second_largest([10, 40, 30, 40, 20]))
print(sorted(set([10, 40, 30, 40, 20]))[-2])  # short version (sorts, so slower)
`, "30\n30"),
        { t: "table", head: ["n", "first", "second"], rows: [["10", "10", "None"], ["40", "40", "10"], ["30", "40", "30"], ["40", "40 (equal, skipped)", "30"], ["20", "40", "30"]], caption: "One pass, O(n)" },
        { t: "h", text: "Problem 5: Count vowels and reverse words" },
        py("Vowels and word order", src`
text = "Programming in Python"
vowels = sum(1 for ch in text.lower() if ch in "aeiou")
print("Vowels:", vowels)

sentence = "I love Python"
print(" ".join(sentence.split()[::-1]))       # split, reverse the list, join
`, "Vowels: 5\nPython love I"),
        { t: "h", text: "Problem 6: Character frequency, sorted" },
        py("Most frequent characters", src`
word = "mississippi"
freq = {}
for ch in word:
    freq[ch] = freq.get(ch, 0) + 1
for ch, count in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0])):   # most first, then a-z
    print(ch, count)
`, "i 4\ns 4\np 2\nm 1"),
        { t: "analogy", text: "Practice problems are like the scales a music student plays every day. They're not songs, but every song is made of them. Every real program is built from these same small moves: loop, count, compare, build a new list." },
        { t: "trap", text: "In FizzBuzz, checking `n % 3` before `n % 15` prints Fizz for 15. Always put the most specific condition first. In \"second largest\", decide what to do with duplicates (here, 40 twice still gives 30) and with lists that are too short (returns None)." },
        { t: "trick", text: "**Clean the input, then compare. Most specific condition first. Write the dry run.**" },
        { t: "exam", items: ["FizzBuzz.", "Check palindrome / anagram.", "Second largest element without sorting.", "Count vowels, words and characters.", "Reverse the words in a sentence.", "Find duplicates in a list."] },
        { t: "recap", items: ["Try first, then compare", "Strings: lower(), isalnum(), [::-1], split/join", "Counting: dict.get(k, 0) + 1", "Sorting with key=lambda for custom order", "One pass with variables beats sorting when possible"] },
      ],
      quiz: [
        { q: "In FizzBuzz, what should 30 print?", options: ["FizzBuzz", "Fizz", "Buzz", "30"], answer: 0, explain: "Divisible by both 3 and 5." },
        { q: "Is \"Race car\" a palindrome after cleaning?", options: ["Yes", "No", "Only with the space", "Error"], answer: 0, explain: "\"racecar\" reads the same backwards." },
        { q: "sorted(\"cab\") gives…", options: ["['a', 'b', 'c']", "\"abc\"", "['c', 'a', 'b']", "Error"], answer: 0, explain: "sorted returns a list of characters." },
        { q: "\" \".join(\"a b c\".split()[::-1]) is…", options: ["\"c b a\"", "\"a b c\"", "\"cba\"", "['c', 'b', 'a']"], answer: 0, explain: "Words reversed, joined by spaces." },
      ],
    },
  ],
};
