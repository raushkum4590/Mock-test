import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science toolkit, part 2: NumPy, pandas basics, pandas for analysis. */
export const DS17_NUMPY: LearnModule = {
  id: "numpy",
  title: "NumPy: fast arrays",
  titleHi: "NumPy: तेज़ ऐरे",
  blurb: "The foundation of every data library: create arrays, compute on whole arrays at once (vectorisation), select with indexing, slicing and boolean masks, and use broadcasting, axes, linear algebra and random numbers.",
  lessons: [
    {
      id: "arrays",
      title: "Arrays and vectorisation",
      oneLine: "A NumPy array is a grid of numbers of one type, stored compactly in memory. Instead of looping, you write maths on the whole array (prices * 1.18) and NumPy runs it in fast C code: often 50–100× faster than a Python loop. This is called vectorisation.",
      minutes: 20,
      blocks: [
        { t: "note", kind: "info", title: "Install", text: "`pip install numpy pandas matplotlib seaborn scikit-learn`, or use Google Colab / Jupyter, where they're already installed. In the Linear algebra module you wrote vectors with lists; NumPy is the fast, professional version." },
        py("Creating arrays", src`
import numpy as np

marks = np.array([88, 72, 95, 64, 81])          # from a list
print(marks, marks.dtype, marks.shape)

grid = np.array([[1, 2, 3], [4, 5, 6]])         # 2-D: rows × columns
print(grid.shape, grid.ndim, grid.size)

print(np.zeros(3), np.ones((2, 2)))
print(np.arange(0, 10, 2))                      # like range()
print(np.linspace(0, 1, 5))                     # 5 evenly spaced points from 0 to 1
print(np.eye(3, dtype=int))                     # identity matrix
`, "[88 72 95 64 81] int64 (5,)\n(2, 3) 2 6\n[0. 0. 0.] [[1. 1.]\n [1. 1.]]\n[0 2 4 6 8]\n[0.   0.25 0.5  0.75 1.  ]\n[[1 0 0]\n [0 1 0]\n [0 0 1]]"),
        { t: "h", text: "Vectorisation: maths on whole arrays" },
        py("No loops needed", src`
import numpy as np

prices = np.array([499.0, 1299.0, 249.0, 899.0])
print(prices * 1.18)                            # add 18% GST to every price
print(prices - prices.mean())                   # distance from the average
print(np.round(np.sqrt(prices), 1))
print(prices > 500)                             # comparisons give True/False arrays
print(prices.sum(), prices.mean(), prices.max(), prices.argmax())   # argmax = index of the max
`, "[ 588.82 1532.82  293.82 1060.82]\n[-237.5  562.5 -487.5  162.5]\n[22.3 36.  15.8 30. ]\n[False  True False  True]\n2946.0 736.5 1299.0 1"),
        py("How much faster?", src`
import time
import numpy as np

values = list(range(1_000_000))
arr = np.arange(1_000_000)

start = time.perf_counter()
squares_list = [v * v for v in values]
loop_time = time.perf_counter() - start

start = time.perf_counter()
squares_arr = arr * arr
numpy_time = time.perf_counter() - start

print("same result:", squares_list[-1] == squares_arr[-1])
print("NumPy is faster:", numpy_time < loop_time)
`, "same result: True\nNumPy is faster: True", "Exact timings depend on your computer; NumPy is typically tens of times faster for this."),
        { t: "table", head: ["", "Python list", "NumPy array"], rows: [["Types", "Mixed", "One type (dtype) for all"], ["Maths", "Loop or comprehension", "Whole array at once"], ["Speed", "Slow for big data", "Fast (C code, compact memory)"], ["Size", "Grows with append", "Fixed size (create a new array to grow)"]] },
        { t: "analogy", text: "A Python list is a row of separate boxes, each possibly holding a different thing, that you open one by one. A NumPy array is an egg tray: same-size slots, all the same type, and a machine that processes the whole tray in one go." },
        { t: "trap", text: "`np.array([1, 2, \"3\"])` silently turns everything into strings. Integer arrays can overflow (an int32 above 2,147,483,647 wraps around) where Python ints never do. And `arr * 2` multiplies every number, while `list * 2` repeats the list." },
        { t: "trick", text: "**Write the maths for one element, apply it to the whole array. No loops.**" },
        { t: "exam", items: ["Why is NumPy faster than Python lists?", "What is vectorisation?", "What are shape, ndim, size and dtype?", "Difference between np.arange and np.linspace?", "List × 2 vs array × 2?"] },
        { t: "recap", items: ["np.array, zeros, ones, arange, linspace, eye", "shape / ndim / size / dtype describe an array", "Operations apply element-wise to the whole array", "Comparisons give boolean arrays", "Vectorised code is much faster than loops"] },
      ],
      quiz: [
        { q: "np.array([1, 2, 3]) * 2 is…", options: ["[2 4 6]", "[1 2 3 1 2 3]", "12", "Error"], answer: 0, explain: "Element-wise." },
        { q: "Shape of np.zeros((3, 4))?", options: ["(3, 4)", "(4, 3)", "12", "(3,)"], answer: 0, explain: "3 rows, 4 columns." },
        { q: "np.arange(1, 7, 2) is…", options: ["[1 3 5]", "[1 3 5 7]", "[2 4 6]", "[1 2 3 4 5 6]"], answer: 0, explain: "Stops before 7." },
        { q: "argmax() returns…", options: ["The index of the largest value", "The largest value", "The sorted array", "The mean"], answer: 0, explain: "Use max() for the value." },
      ],
    },
    {
      id: "indexing",
      title: "Indexing, slicing and boolean masks",
      oneLine: "Pick elements by position (arr[2]), ranges (arr[1:4]), rows and columns of 2-D arrays (grid[0, :], grid[:, 1]), lists of positions (fancy indexing), or a True/False mask (marks[marks > 80]). Masks are how you filter data in NumPy and pandas.",
      minutes: 18,
      blocks: [
        py("Indexing and slicing", src`
import numpy as np

marks = np.array([[88, 72, 95],          # Asha: maths, science, english
                  [64, 81, 70],          # Ravi
                  [91, 85, 78]])         # Zoya
print(marks[0, 2])                       # row 0, column 2
print(marks[1])                          # all of row 1
print(marks[:, 0])                       # every row, column 0 (all maths marks)
print(marks[0:2, 1:])                    # rows 0-1, columns 1-2
print(marks[[0, 2]])                     # fancy indexing: rows 0 and 2
`, "95\n[64 81 70]\n[88 64 91]\n[[72 95]\n [81 70]]\n[[88 72 95]\n [91 85 78]]"),
        py("Boolean masks", src`
import numpy as np

names = np.array(["Asha", "Ravi", "Zoya", "Imran", "Neha"])
scores = np.array([88, 64, 95, 52, 81])

passed = scores >= 60                     # a mask
print(passed)
print(names[passed])                      # keep only True positions
print(names[(scores > 80) & (scores < 90)])     # & = and, | = or (with brackets!)
print("how many failed:", (~passed).sum())       # ~ flips the mask; True counts as 1

capped = scores.copy()
capped[capped > 90] = 90                  # change only matching elements
print(capped)
print(np.where(scores >= 60, "pass", "fail"))   # choose a value per element
`, "[ True  True  True False  True]\n['Asha' 'Ravi' 'Zoya' 'Neha']\n['Asha' 'Neha']\nhow many failed: 1\n[88 64 90 52 81]\n['pass' 'pass' 'pass' 'fail' 'pass']"),
        { t: "trap", text: "A slice is a **view**, not a copy: `part = arr[0:2]; part[0] = 99` changes `arr` too. Use `.copy()` when you need independent data. With masks, use `&`, `|`, `~` and brackets: `(a > 1) & (a < 5)`; Python's `and`/`or` raise an error on arrays." },
        { t: "analogy", text: "A boolean mask is a stencil laid over the data: holes (True) let values through, solid parts (False) block them. The same stencil can select names, change scores or count matches." },
        { t: "trick", text: "**arr[row, col]. : means all. Filter with arr[condition]. Combine with & | ~ and brackets.**" },
        { t: "exam", items: ["How do you select a column of a 2-D array?", "What is a boolean mask?", "View vs copy in NumPy?", "What does np.where do?", "Why can't you use `and` with arrays?"] },
        { t: "recap", items: ["arr[i, j], arr[i], arr[:, j], arr[a:b, c:d]", "Fancy indexing with a list of positions", "Masks: arr[arr > x]; combine with & | ~", "Assign through masks to change matching values", "Slices are views; .copy() for independence"] },
      ],
      quiz: [
        { q: "For a 2-D array a, a[:, 1] gives…", options: ["Column 1 of every row", "Row 1", "The element at (1, 1)", "The last column"], answer: 0, explain: ": means all rows." },
        { q: "a = np.array([5, 15, 25]); a[a > 10] is…", options: ["[15 25]", "[True]", "[5]", "2"], answer: 0, explain: "A boolean mask filters." },
        { q: "Correct way to combine two conditions?", options: ["(a > 1) & (a < 5)", "a > 1 and a < 5", "a > 1 && a < 5", "a > 1 + a < 5"], answer: 0, explain: "Element-wise & with brackets." },
        { q: "b = a[0:2]; b[0] = 0. Does a change?", options: ["Yes, slices are views", "No", "Only if a is 2-D", "Error"], answer: 0, explain: "Use .copy() to avoid it." },
      ],
    },
    {
      id: "broadcasting-linalg",
      title: "Broadcasting, axes, linear algebra and random numbers",
      oneLine: "Broadcasting lets NumPy combine arrays of different shapes (a whole table minus one row of column means). axis=0 works down columns, axis=1 across rows. @ multiplies matrices, np.linalg solves equations, and np.random.default_rng makes reproducible random data.",
      minutes: 20,
      blocks: [
        py("Axes and broadcasting", src`
import numpy as np

marks = np.array([[88, 72, 95],
                  [64, 81, 70],
                  [91, 85, 78]])
print("per subject (axis=0):", marks.mean(axis=0).round(1))     # down each column
print("per student (axis=1):", marks.mean(axis=1).round(1))     # across each row

centered = marks - marks.mean(axis=0)              # (3×3) minus (3,) → broadcast to each row
print(centered.round(1))
z = (marks - marks.mean(axis=0)) / marks.std(axis=0)            # standardise every column at once
print(z.round(2))

weights = np.array([0.5, 0.3, 0.2])
print("weighted totals:", marks @ weights)          # matrix × vector
`, "per subject (axis=0): [81.  79.3 81. ]\nper student (axis=1): [85.  71.7 84.7]\n[[  7.   -7.3  14. ]\n [-17.    1.7 -11. ]\n [ 10.    5.7  -3. ]]\n[[ 0.58 -1.35  1.34]\n [-1.41  0.31 -1.06]\n [ 0.83  1.04 -0.29]]\nweighted totals: [84.6 70.3 86.6]"),
        { t: "diagram", text: "marks (3×3)        means (3,)             result (3×3)\n[[88 72 95]     −  [81 79.3 81]    →    each row minus the same means\n [64 81 70]        (stretched to\n [91 85 78]]        every row)\n\naxis=0 ↓ (down the rows, one result per column)   axis=1 → (across, one result per row)" },
        py("Solving equations and random data", src`
import numpy as np

# 2 pens + 3 books = 160,  1 pen + 4 books = 180. Price of each?
A = np.array([[2, 3], [1, 4]])
b = np.array([160, 180])
print("pen, book =", np.linalg.solve(A, b))
print("A @ A.T =", A @ A.T)

rng = np.random.default_rng(42)                     # the modern, reproducible way
print(rng.integers(1, 7, size=5))                   # dice
heights = rng.normal(160, 8, size=10_000)
print(round(heights.mean(), 1), round(heights.std(), 1))
print(rng.choice(["A", "B"], size=6, p=[0.7, 0.3]))
`, "pen, book = [20. 40.]\nA @ A.T = [[13 14]\n [14 17]]\n[1 5 4 3 3]\n159.9 8.1\n['A' 'A' 'A' 'A' 'A' 'A']"),
        { t: "table", head: ["Task", "NumPy"], rows: [["Matrix multiply", "`A @ B`"], ["Transpose", "`A.T`"], ["Solve A·x = b", "`np.linalg.solve(A, b)`"], ["Inverse / determinant", "`np.linalg.inv(A)`, `np.linalg.det(A)`"], ["Eigenvalues (PCA)", "`np.linalg.eig(C)`"], ["Random numbers", "`rng = np.random.default_rng(seed)`"], ["Reshape", "`a.reshape(2, 3)`, `a.ravel()`"], ["Stack", "`np.vstack`, `np.hstack`, `np.concatenate`"]] },
        { t: "analogy", text: "Broadcasting is a teacher saying \"everyone add 5 grace marks to maths\": one instruction stretched over the whole class, instead of telling each student separately. The axis says whether you summarise down each subject's column or across each student's row." },
        { t: "trap", text: "Broadcasting compares shapes from the right: (3, 3) with (3,) works, but (3, 3) with (2,) fails with \"operands could not be broadcast\". If you mean column-wise, reshape to (3, 1). And `*` is element-wise; use `@` for matrix multiplication." },
        { t: "trick", text: "**axis=0 = down (per column), axis=1 = across (per row). @ for matrices. rng = default_rng(seed).**" },
        { t: "exam", items: ["What is broadcasting?", "What does axis=0 vs axis=1 mean?", "Element-wise * vs @?", "How do you solve a system of linear equations in NumPy?", "Why use np.random.default_rng with a seed?"] },
        { t: "recap", items: ["axis=0 per column, axis=1 per row", "Broadcasting stretches smaller arrays to match", "Standardise a whole table in one line", "@ multiplies matrices; np.linalg solves and inverts", "rng = np.random.default_rng(seed) for reproducible randomness"] },
      ],
      quiz: [
        { q: "For a 2-D array, a.sum(axis=0) gives…", options: ["One total per column", "One total per row", "A single total", "The shape"], answer: 0, explain: "It collapses the rows." },
        { q: "Which operator multiplies matrices?", options: ["@", "*", "x", "**"], answer: 0, explain: "* is element-wise." },
        { q: "(4, 3) array minus a (3,) array…", options: ["Works: subtracted from each row", "Fails", "Gives (3,)", "Gives (4,)"], answer: 0, explain: "Broadcasting along rows." },
        { q: "np.linalg.solve(A, b) finds…", options: ["x such that A·x = b", "The inverse of b", "Eigenvalues", "A random matrix"], answer: 0, explain: "Systems of linear equations." },
      ],
    },
  ],
};

export const DS18_PANDAS_BASICS: LearnModule = {
  id: "pandas-basics",
  title: "pandas: DataFrames",
  titleHi: "pandas: डेटाफ़्रेम",
  blurb: "The data scientist's main tool: load data into DataFrames, inspect it, select rows and columns with loc, iloc and conditions, add columns, sort, and clean missing values, wrong types, duplicates, text and dates.",
  lessons: [
    {
      id: "dataframes",
      title: "Series, DataFrames and loading data",
      oneLine: "A Series is a labelled column; a DataFrame is a table of Series sharing one row index, like a spreadsheet you control with code. Load data with pd.read_csv (or read_excel, read_json, read_sql), then inspect it with head, info, describe and value_counts.",
      minutes: 20,
      blocks: [
        py("Building and loading a DataFrame", src`
import pandas as pd

orders = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106],
    "city": ["Patna", "Pune", "Patna", "Delhi", "Pune", "Delhi"],
    "amount": [450, 820, 300, 640, 510, 1200],
    "late": [False, True, False, True, False, False],
})
orders.to_csv("orders.csv", index=False)          # save…
df = pd.read_csv("orders.csv")                    # …and load, like a real file

print(df.head(3))                                  # first rows
print(df.shape)                                    # (rows, columns)
print(df.dtypes)
`, "   order_id   city  amount   late\n0       101  Patna     450  False\n1       102   Pune     820   True\n2       103  Patna     300  False\n(6, 4)\norder_id    int64\ncity          str\namount      int64\nlate         bool\ndtype: object"),
        py("Inspecting data", src`
import pandas as pd

df = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106],
    "city": ["Patna", "Pune", "Patna", "Delhi", "Pune", "Delhi"],
    "amount": [450, 820, 300, 640, 510, 1200],
    "late": [False, True, False, True, False, False],
})
print(df["amount"].describe().round(1))           # summary of one column (a Series)
print(df["city"].value_counts())                  # counts per category
print("late share:", df["late"].mean())           # True = 1, so the mean is a proportion
print(df.columns.tolist())
`, "count       6.0\nmean      653.3\nstd       320.5\nmin       300.0\n25%       465.0\n50%       575.0\n75%       775.0\nmax      1200.0\nName: amount, dtype: float64\ncity\nPatna    2\nPune     2\nDelhi    2\nName: count, dtype: int64\nlate share: 0.3333333333333333\n['order_id', 'city', 'amount', 'late']"),
        { t: "table", head: ["Need", "pandas"], rows: [["Read CSV / Excel / JSON / SQL", "`pd.read_csv`, `read_excel`, `read_json`, `read_sql`"], ["First / last rows", "`df.head()`, `df.tail()`"], ["Columns, types, missing counts", "`df.info()`"], ["Summary statistics", "`df.describe()`"], ["Counts of a category", "`df[\"col\"].value_counts()`"], ["Size", "`df.shape`, `len(df)`"], ["Save", "`df.to_csv(\"out.csv\", index=False)`, `to_excel`, `to_parquet`"]] },
        { t: "analogy", text: "A DataFrame is an Excel sheet that remembers how you cleaned it: every step is code you can rerun on next month's file in one second, instead of repeating 50 clicks." },
        { t: "trap", text: "`pd.read_csv` guesses column types: an ID like \"00123\" becomes 123, and a column with one bad value stays text. Use `dtype={\"pincode\": str}` for codes, and always check `df.dtypes` and `df.info()` right after loading. When saving, `index=False` avoids an extra unnamed column." },
        { t: "trick", text: "**Load → head → shape → dtypes/info → describe → value_counts. Every time.**" },
        { t: "exam", items: ["Series vs DataFrame?", "How do you read a CSV in pandas?", "What do info() and describe() show?", "How do you count values in a column?", "Why index=False when saving?"] },
        { t: "recap", items: ["Series = labelled column; DataFrame = table of columns", "pd.read_csv / to_csv to load and save", "head, shape, dtypes, info, describe, value_counts to inspect", "Boolean column mean = proportion of True", "Check types right after loading"] },
      ],
      quiz: [
        { q: "df.shape returns…", options: ["(rows, columns)", "The column names", "The first 5 rows", "The data types"], answer: 0, explain: "A tuple." },
        { q: "df[\"city\"] returns a…", options: ["Series", "DataFrame always", "List", "Dict"], answer: 0, explain: "df[[\"city\"]] returns a DataFrame." },
        { q: "Which shows missing values per column and types?", options: ["df.info()", "df.head()", "df.shape", "df.columns"], answer: 0, explain: "Also memory use." },
        { q: "The mean of a True/False column is…", options: ["The proportion of True", "Always 0.5", "An error", "The count"], answer: 0, explain: "True = 1, False = 0." },
      ],
    },
    {
      id: "selecting",
      title: "Selecting, filtering, sorting and new columns",
      oneLine: "Select columns with df[[\"a\", \"b\"]], rows and columns by label with .loc, by position with .iloc, and rows by condition with boolean masks or .query(). Sort with sort_values, and create columns with vectorised maths, np.where or .map.",
      minutes: 22,
      blocks: [
        py("loc, iloc and conditions", src`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ravi", "Zoya", "Imran", "Neha"],
    "city": ["Patna", "Pune", "Patna", "Delhi", "Pune"],
    "marks": [88, 64, 95, 52, 81],
    "fees_paid": [True, False, True, True, False],
}).set_index("name")                                  # use names as row labels

print(df.loc["Zoya"])                                 # one row by label
print(df.loc[["Asha", "Neha"], ["city", "marks"]])    # rows and columns by label
print(df.iloc[0:2, 1])                                # by position: first 2 rows, column 1
print(df[(df["marks"] > 60) & (df["city"] == "Patna")])         # boolean filter
print(df.query("marks > 80 and fees_paid").index.tolist())      # the same idea, as text
`, "city         Patna\nmarks           95\nfees_paid     True\nName: Zoya, dtype: object\n       city  marks\nname\nAsha  Patna     88\nNeha   Pune     81\nname\nAsha    88\nRavi    64\nName: marks, dtype: int64\n       city  marks  fees_paid\nname\nAsha  Patna     88       True\nZoya  Patna     95       True\n['Asha', 'Zoya']"),
        py("Sorting and creating columns", src`
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ravi", "Zoya", "Imran", "Neha"],
    "city": ["Patna", "Pune", "Patna", "Delhi", "Pune"],
    "marks": [88, 64, 95, 52, 81],
})
df["out_of_10"] = df["marks"] / 10                             # vectorised maths
df["result"] = np.where(df["marks"] >= 60, "pass", "fail")    # if/else per row
df["grade"] = pd.cut(df["marks"], bins=[0, 60, 80, 90, 100], labels=["C", "B", "A", "A+"])
df["state"] = df["city"].map({"Patna": "Bihar", "Pune": "Maharashtra", "Delhi": "Delhi"})
df["rank"] = df["marks"].rank(ascending=False).astype(int)

print(df.sort_values(["result", "marks"], ascending=[False, False]).to_string(index=False))
`, " name  city  marks  out_of_10 result grade       state  rank\n Zoya Patna     95        9.5   pass    A+       Bihar     1\n Asha Patna     88        8.8   pass     A       Bihar     2\n Neha  Pune     81        8.1   pass     A Maharashtra     3\n Ravi  Pune     64        6.4   pass     B Maharashtra     4\nImran Delhi     52        5.2   fail     C       Delhi     5"),
        { t: "table", head: ["Want", "Write"], rows: [["One column (Series)", "`df[\"marks\"]`"], ["Several columns", "`df[[\"name\", \"marks\"]]`"], ["Rows by label", "`df.loc[\"Zoya\"]`, `df.loc[rows, cols]`"], ["Rows by position", "`df.iloc[0]`, `df.iloc[0:5, 2]`"], ["Rows by condition", "`df[df[\"marks\"] > 60]`, `df.query(\"marks > 60\")`"], ["Change matching rows", "`df.loc[df[\"marks\"] > 90, \"marks\"] = 90`"]] },
        { t: "analogy", text: ".loc is finding a book by its title, .iloc is finding it by its shelf position, and a boolean filter is asking the librarian for \"every book published after 2020\"." },
        { t: "trap", text: "Chained assignment like `df[df[\"marks\"] > 90][\"marks\"] = 90` doesn't change df (and modern pandas warns or ignores it). Use one `.loc[condition, column] = value`. With conditions, use `&` `|` `~` and brackets, never `and`/`or`." },
        { t: "trick", text: "**loc = labels, iloc = positions, masks = conditions. Change data with one .loc[...] = ...**" },
        { t: "exam", items: ["loc vs iloc?", "How do you filter rows with two conditions?", "How do you add a column based on a condition?", "How do you sort by two columns?", "What is chained assignment and why avoid it?"] },
        { t: "recap", items: ["df[\"col\"] / df[[\"a\", \"b\"]] for columns", ".loc labels, .iloc positions", "Boolean masks or .query() for rows", "np.where, pd.cut, .map, .rank create columns", "Update with df.loc[mask, col] = value"] },
      ],
      quiz: [
        { q: "df.iloc[0] returns…", options: ["The first row by position", "The row labelled 0 always", "The first column", "The index"], answer: 0, explain: "iloc = integer position." },
        { q: "Which keeps rows where marks > 50 AND city is Pune?", options: ["df[(df.marks > 50) & (df.city == \"Pune\")]", "df[df.marks > 50 and df.city == \"Pune\"]", "df.loc[50, \"Pune\"]", "df.iloc[\"Pune\"]"], answer: 0, explain: "& with brackets." },
        { q: "np.where(cond, \"yes\", \"no\") does what?", options: ["Picks \"yes\" or \"no\" for each row", "Finds the row number", "Deletes rows", "Sorts"], answer: 0, explain: "A vectorised if/else." },
        { q: "The safe way to change values in matching rows is…", options: ["df.loc[mask, \"col\"] = value", "df[mask][\"col\"] = value", "df.col[mask] = value always", "A for loop over rows"], answer: 0, explain: "One .loc call." },
      ],
    },
    {
      id: "cleaning",
      title: "Cleaning data: missing values, types, duplicates, text and dates",
      oneLine: "Real data is messy. Find missing values with isna(), then drop or fill them; fix types with to_numeric and to_datetime; remove duplicates; tidy text with the .str methods; and extract date parts with .dt. Clean once, in code, so it's repeatable.",
      minutes: 24,
      blocks: [
        py("A messy dataset, cleaned step by step", src`
import numpy as np
import pandas as pd

raw = pd.DataFrame({
    "customer": ["  asha ", "RAVI", "Zoya", "ravi", "Imran", None],
    "city": ["Patna", "pune", "Patna ", "Pune", "Delhi", "Delhi"],
    "amount": ["450", "820", "n/a", "820", "1,200", "300"],
    "ordered_on": ["2026-10-01", "2026-10-02", "2026-10-02", "2026-10-02", "2026-10-05", "bad date"],
})
print("missing per column:\n", raw.isna().sum().to_dict())

df = raw.copy()
df["customer"] = df["customer"].str.strip().str.title()           # "  asha " → "Asha"
df["city"] = df["city"].str.strip().str.title()
df["amount"] = pd.to_numeric(df["amount"].str.replace(",", ""), errors="coerce")   # bad → NaN
df["ordered_on"] = pd.to_datetime(df["ordered_on"], errors="coerce")
df = df.dropna(subset=["customer"])                                # no customer → drop
df["amount"] = df["amount"].fillna(df["amount"].median())          # fill missing amounts
df = df.drop_duplicates(subset=["customer", "amount", "ordered_on"])   # Ravi's double order
df["weekday"] = df["ordered_on"].dt.day_name()

print(df.to_string(index=False))
print(df.dtypes.astype(str).to_dict())
`, "missing per column:\n {'customer': 1, 'city': 0, 'amount': 0, 'ordered_on': 0}\ncustomer  city  amount ordered_on  weekday\n    Asha Patna   450.0 2026-10-01 Thursday\n    Ravi  Pune   820.0 2026-10-02   Friday\n    Zoya Patna   820.0 2026-10-02   Friday\n   Imran Delhi  1200.0 2026-10-05   Monday\n{'customer': 'str', 'city': 'str', 'amount': 'float64', 'ordered_on': 'datetime64[us]', 'weekday': 'str'}"),
        { t: "table", head: ["Problem", "Detect", "Fix"], rows: [
          ["Missing values", "`df.isna().sum()`", "`dropna()`, `fillna(value / median / mode)`, or model-based imputation"],
          ["Numbers stored as text", "`df.dtypes` shows object/str", "`pd.to_numeric(col, errors=\"coerce\")`"],
          ["Dates as text", "dtype isn't datetime", "`pd.to_datetime(col, errors=\"coerce\")`"],
          ["Inconsistent text", "`value_counts()` shows \"pune\" and \"Pune \"", "`.str.strip().str.title()`"],
          ["Duplicates", "`df.duplicated().sum()`", "`drop_duplicates(subset=…)`"],
          ["Outliers", "`describe()`, boxplots", "Investigate; cap, remove or keep with a reason"],
        ] },
        { t: "analogy", text: "Cleaning is washing vegetables: remove the rotten ones (invalid rows), trim the stems (spaces in text), sort sizes into the same unit (types), and throw out duplicates. Skip it and every dish (analysis) tastes wrong." },
        { t: "trap", text: "Filling missing values with the mean or median hides that they were missing; for modelling, add an indicator column (`amount_was_missing`) and fill inside a pipeline using training data only. `errors=\"coerce\"` turns bad values into NaN silently, so count how many became NaN." },
        { t: "trick", text: "**isna → to_numeric/to_datetime(errors=\"coerce\") → .str.strip().str.title() → drop_duplicates → check again.**" },
        { t: "exam", items: ["How do you handle missing values? Pros and cons of each method?", "How do you convert a text column to numbers safely?", "How do you remove duplicates?", "How do you clean inconsistent text categories?", "How do you extract the month or weekday from a date column?"] },
        { t: "recap", items: ["isna().sum() first", "dropna / fillna (median for numbers, mode for categories)", "to_numeric / to_datetime with errors=\"coerce\"", ".str methods for text; .dt methods for dates", "drop_duplicates; re-check after every step"] },
      ],
      quiz: [
        { q: "pd.to_numeric(\"n/a\", errors=\"coerce\") gives…", options: ["NaN", "0", "An error", "\"n/a\""], answer: 0, explain: "Coerce turns bad values into NaN." },
        { q: "Which counts missing values per column?", options: ["df.isna().sum()", "df.count()", "df.size", "df.dropna()"], answer: 0, explain: "True counts as 1." },
        { q: "\" pune \" → \"Pune\" with…", options: ["s.str.strip().str.title()", "s.upper()", "s.replace(\" \")", "s.title() only"], answer: 0, explain: "Strip spaces, then title case." },
        { q: "df[\"date\"].dt.day_name() gives…", options: ["The weekday names", "The day numbers", "The month", "An error for datetimes"], answer: 0, explain: ".dt works on datetime columns." },
      ],
    },
  ],
};

export const DS19_PANDAS_ANALYSIS: LearnModule = {
  id: "pandas-analysis",
  title: "pandas for analysis",
  titleHi: "विश्लेषण के लिए pandas",
  blurb: "Answer real business questions: groupby and aggregation, pivot tables and reshaping, merging tables like SQL joins, time series with resample and rolling windows, and clean, fast method chaining.",
  lessons: [
    {
      id: "groupby-pivot",
      title: "groupby, aggregation and pivot tables",
      oneLine: "groupby splits a table into groups, applies a summary to each, and combines the results (split-apply-combine). agg computes several summaries at once, transform adds group results back to every row, and pivot_table builds Excel-style cross tables.",
      minutes: 22,
      blocks: [
        py("Split, apply, combine", src`
import pandas as pd

sales = pd.DataFrame({
    "region": ["North", "North", "South", "South", "West", "West", "North", "South"],
    "product": ["Tea", "Coffee", "Tea", "Coffee", "Tea", "Coffee", "Tea", "Tea"],
    "units": [120, 80, 200, 60, 90, 150, 130, 170],
    "price": [10, 25, 10, 25, 12, 22, 10, 11],
})
sales["revenue"] = sales["units"] * sales["price"]

print(sales.groupby("region")["revenue"].sum().sort_values(ascending=False))
print(sales.groupby(["region", "product"]).agg(units=("units", "sum"), avg_price=("price", "mean")))

sales["share_of_region"] = (sales["revenue"] / sales.groupby("region")["revenue"].transform("sum")).round(2)
print(sales[["region", "product", "revenue", "share_of_region"]].head(4))
`, "region\nSouth    5370\nNorth    4500\nWest     4380\nName: revenue, dtype: int64\n                units  avg_price\nregion product\nNorth  Coffee      80       25.0\n       Tea        250       10.0\nSouth  Coffee      60       25.0\n       Tea        370       10.5\nWest   Coffee     150       22.0\n       Tea         90       12.0\n  region product  revenue  share_of_region\n0  North     Tea     1200             0.27\n1  North  Coffee     2000             0.44\n2  South     Tea     2000             0.37\n3  South  Coffee     1500             0.28"),
        py("Pivot tables and reshaping", src`
import pandas as pd

sales = pd.DataFrame({
    "region": ["North", "North", "South", "South", "West", "West", "North", "South"],
    "product": ["Tea", "Coffee", "Tea", "Coffee", "Tea", "Coffee", "Tea", "Tea"],
    "units": [120, 80, 200, 60, 90, 150, 130, 170],
})
table = sales.pivot_table(index="region", columns="product", values="units",
                          aggfunc="sum", fill_value=0, margins=True)
print(table)

long = table.drop(index="All", columns="All").reset_index().melt(
    id_vars="region", var_name="product", value_name="units")      # wide → long
print(long.sort_values(["region", "product"]).to_string(index=False))
`, "product  Coffee  Tea   All\nregion\nNorth        80  250   330\nSouth        60  370   430\nWest        150   90   240\nAll         290  710  1000\nregion product  units\n North  Coffee     80\n North     Tea    250\n South  Coffee     60\n South     Tea    370\n  West  Coffee    150\n  West     Tea     90"),
        { t: "table", head: ["Tool", "Use for"], rows: [["`groupby(col)[x].sum()`", "One summary per group"], ["`.agg(name=(col, func))`", "Several named summaries"], ["`.transform(\"sum\")`", "Group result repeated on every row (shares, ranks within group)"], ["`pivot_table`", "Cross tables: rows × columns of a summary"], ["`melt` / `pivot`", "Wide ↔ long reshaping"], ["`pd.crosstab`", "Counts of two categories"]] },
        { t: "analogy", text: "groupby is sorting exam papers into piles by section, then writing one total on top of each pile. transform is writing each pile's total back on every paper in it, so each student can see their share." },
        { t: "trap", text: "groupby drops rows whose key is missing (NaN) by default: use `dropna=False` if they matter. After a multi-column groupby the result has a MultiIndex; call `.reset_index()` to get normal columns back." },
        { t: "trick", text: "**groupby(keys)[col].agg(...) to summarise; transform to broadcast back; pivot_table for cross tabs.**" },
        { t: "exam", items: ["Explain split-apply-combine.", "agg vs transform vs apply?", "How do you compute each row's share of its group total?", "pivot vs pivot_table vs melt?", "What is a MultiIndex?"] },
        { t: "recap", items: ["groupby + sum/mean/count per group", "agg with named aggregations", "transform keeps the original shape", "pivot_table for cross tables (margins=True for totals)", "melt for wide → long"] },
      ],
      quiz: [
        { q: "df.groupby(\"city\")[\"amount\"].mean() returns…", options: ["One average per city", "One overall average", "The original rows", "A crosstab"], answer: 0, explain: "Indexed by city." },
        { q: "To add each group's total to every row, use…", options: ["transform(\"sum\")", "agg(\"sum\")", "sum() then sort", "pivot"], answer: 0, explain: "It keeps the original length." },
        { q: "pivot_table(..., margins=True) adds…", options: ["Row and column totals", "Missing values", "Percentages", "Charts"], answer: 0, explain: "An \"All\" row and column." },
        { q: "melt converts a table from…", options: ["Wide to long", "Long to wide", "CSV to Excel", "Text to numbers"], answer: 0, explain: "pivot goes the other way." },
      ],
    },
    {
      id: "merging",
      title: "Merging and combining tables",
      oneLine: "Real data lives in several tables. merge joins them on a key like SQL: inner keeps matches only, left keeps every row of the left table, outer keeps everything. concat stacks tables with the same columns (for example, monthly files).",
      minutes: 18,
      blocks: [
        py("merge (joins) and concat", src`
import pandas as pd

customers = pd.DataFrame({"customer_id": [1, 2, 3, 4], "name": ["Asha", "Ravi", "Zoya", "Imran"],
                          "city": ["Patna", "Pune", "Patna", "Delhi"]})
orders = pd.DataFrame({"order_id": [10, 11, 12, 13, 14], "customer_id": [1, 1, 2, 3, 9],
                       "amount": [450, 300, 820, 150, 700]})

inner = orders.merge(customers, on="customer_id", how="inner")       # only matching ids
print(inner[["order_id", "name", "amount"]].to_string(index=False))

left = customers.merge(orders, on="customer_id", how="left")         # every customer
print(left.groupby("name", sort=False)["amount"].agg(["count", "sum"]))

check = orders.merge(customers, on="customer_id", how="left", indicator=True)
print("orders with unknown customer:", check.loc[check["_merge"] == "left_only", "order_id"].tolist())

october = pd.DataFrame({"month": ["Oct"], "revenue": [1720]})
november = pd.DataFrame({"month": ["Nov"], "revenue": [2105]})
print(pd.concat([october, november], ignore_index=True))           # stack rows
`, " order_id name  amount\n       10 Asha     450\n       11 Asha     300\n       12 Ravi     820\n       13 Zoya     150\n       count    sum\nname\nAsha       2  750.0\nRavi       1  820.0\nZoya       1  150.0\nImran      0    0.0\norders with unknown customer: [14]\n  month  revenue\n0   Oct     1720\n1   Nov     2105"),
        { t: "table", head: ["how=", "Keeps", "SQL"], rows: [["\"inner\"", "Rows with a match in both", "INNER JOIN"], ["\"left\"", "All left rows (NaN where no match)", "LEFT JOIN"], ["\"right\"", "All right rows", "RIGHT JOIN"], ["\"outer\"", "Everything from both", "FULL OUTER JOIN"]] },
        { t: "analogy", text: "merge is matching admission forms with fee receipts by roll number: inner gives students with both, left gives every student (blank fees for those who haven't paid), and indicator=True shows the receipts with no matching student." },
        { t: "trap", text: "If the key isn't unique in either table, merge multiplies rows (one customer × three orders × two addresses = six rows) and totals become wrong. Check row counts before and after, and use `validate=\"many_to_one\"` to make pandas raise an error if the right side has duplicate keys." },
        { t: "trick", text: "**merge(on=key, how=inner/left/outer). Check row counts. concat to stack.**" },
        { t: "exam", items: ["Inner vs left vs outer join?", "merge vs concat vs join?", "How do you find rows without a match?", "Why can a merge create more rows than expected?"] },
        { t: "recap", items: ["merge joins on key columns like SQL", "inner / left / right / outer", "indicator=True shows where rows came from", "Duplicate keys multiply rows; use validate=", "concat stacks tables with the same columns"] },
      ],
      quiz: [
        { q: "A customer with no orders appears in…", options: ["A left merge from customers to orders", "An inner merge", "Neither", "Only concat"], answer: 0, explain: "With NaN order values." },
        { q: "pd.concat([jan, feb]) does what?", options: ["Stacks the rows", "Joins on a key", "Sums the tables", "Deletes duplicates"], answer: 0, explain: "ignore_index=True renumbers rows." },
        { q: "indicator=True in merge adds…", options: ["A _merge column showing left_only / right_only / both", "An index", "Row totals", "A chart"], answer: 0, explain: "Great for checking joins." },
        { q: "Row count grew a lot after a merge. Likely cause?", options: ["Duplicate keys", "Missing values", "Wrong dtype", "Sorting"], answer: 0, explain: "Many-to-many joins multiply rows." },
      ],
    },
    {
      id: "time-series",
      title: "Time series: dates, resampling and rolling windows",
      oneLine: "With a datetime index, pandas can resample daily data into weeks or months, compute rolling averages that smooth noise, shift values to compare with yesterday, and compute percentage changes. These are the everyday tools for sales, traffic and stock data.",
      minutes: 20,
      blocks: [
        py("Daily sales: resample, rolling, shift", src`
import numpy as np
import pandas as pd

rng = np.random.default_rng(1)
days = pd.date_range("2026-09-01", periods=60, freq="D")
weekend = days.dayofweek >= 5
sales = pd.Series(1000 + 300 * weekend + rng.normal(0, 80, len(days)), index=days).round()

print(sales.head(3))
print(sales.resample("W").sum().head(3))                     # weekly totals
print(sales.resample("MS").mean().round(1))                   # monthly averages (MS = month start)
print(sales.rolling(7).mean().round(1).iloc[6:9])             # 7-day moving average
print(sales.pct_change().mul(100).round(1).iloc[1:4])          # % change vs yesterday
print("weekend vs weekday:", sales.groupby(weekend).mean().round(0).to_dict())
`, "2026-09-01    1028.0\n2026-09-02    1066.0\n2026-09-03    1026.0\nFreq: D, dtype: float64\n2026-09-06    6724.0\n2026-09-13    7643.0\n2026-09-20    7492.0\nFreq: W-SUN, dtype: float64\n2026-09-01    1074.7\n2026-10-01    1077.4\nFreq: MS, dtype: float64\n2026-09-07    1097.3\n2026-09-08    1099.9\n2026-09-09    1094.6\nFreq: D, dtype: float64\n2026-09-02     3.7\n2026-09-03    -3.8\n2026-09-04   -12.7\nFreq: D, dtype: float64\nweekend vs weekday: {False: 997.0, True: 1292.0}"),
        { t: "table", head: ["Need", "pandas"], rows: [["Parse dates", "`pd.to_datetime`, `parse_dates=[...]` in read_csv"], ["Date parts", "`.dt.year`, `.dt.month`, `.dt.day_name()`"], ["Change frequency", "`.resample(\"W\").sum()`, `\"MS\"`, `\"QS\"`"], ["Smooth noise", "`.rolling(7).mean()`"], ["Compare with earlier", "`.shift(1)`, `.diff()`, `.pct_change()`"], ["Date ranges", "`pd.date_range(start, periods, freq)`"]] },
        { t: "analogy", text: "Daily sales are a bumpy road; a 7-day rolling average is the view from a plane: the weekly bumps disappear and the real trend (going up, going down) becomes obvious." },
        { t: "trap", text: "A rolling window needs a full window before it produces values: the first 6 values of `rolling(7)` are NaN. For forecasting, never let future data leak into features: use `shift()` so today's features only use past values, and split train/test by time, not randomly." },
        { t: "trick", text: "**Datetime index → resample (change frequency) → rolling (smooth) → shift/pct_change (compare).**" },
        { t: "exam", items: ["resample vs groupby?", "What is a rolling average and why use it?", "How do you compute day-over-day change?", "How should you split time-series data into train and test?", "What is seasonality?"] },
        { t: "recap", items: ["Use a DatetimeIndex", "resample(\"W\"/\"MS\") changes frequency", "rolling(n).mean() smooths", "shift, diff, pct_change compare periods", "Split by time to avoid leakage"] },
      ],
      quiz: [
        { q: "sales.resample(\"MS\").sum() gives…", options: ["Monthly totals", "Daily totals", "A 7-day average", "Weekly counts"], answer: 0, explain: "MS = month start." },
        { q: "The first value of s.pct_change() is…", options: ["NaN", "0", "100", "The first value"], answer: 0, explain: "There's no previous value." },
        { q: "rolling(7).mean() is a…", options: ["7-period moving average", "7-day total", "Weekly resample", "Shift by 7"], answer: 0, explain: "It smooths noise." },
        { q: "For time series, the test set should be…", options: ["The latest period", "A random sample", "The first period", "The training set"], answer: 0, explain: "Predict the future from the past." },
      ],
    },
    {
      id: "chaining-performance",
      title: "apply, method chaining and fast pandas",
      oneLine: "Vectorised column operations are fastest; .apply with a Python function is flexible but slow. Method chaining writes a whole cleaning-and-analysis pipeline as one readable expression with assign, query, pipe and groupby. Use categories and efficient formats (Parquet) for big data.",
      minutes: 18,
      blocks: [
        py("Vectorised vs apply, and a method chain", src`
import time
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
df = pd.DataFrame({"price": rng.uniform(100, 2000, 200_000).round(2),
                   "qty": rng.integers(1, 5, 200_000),
                   "city": rng.choice(["Patna", "Pune", "Delhi", "Mumbai"], 200_000)})

start = time.perf_counter()
slow = df.apply(lambda row: row["price"] * row["qty"], axis=1)      # a Python call per row
apply_time = time.perf_counter() - start
start = time.perf_counter()
fast = df["price"] * df["qty"]                                      # one vectorised operation
vector_time = time.perf_counter() - start
print("same result:", np.allclose(slow, fast), " vectorised is faster:", vector_time < apply_time)

report = (
    df
    .assign(revenue=lambda d: d["price"] * d["qty"])                # add a column
    .query("qty >= 2")                                              # filter
    .groupby("city", as_index=False)
    .agg(orders=("revenue", "size"), revenue=("revenue", "sum"))
    .assign(revenue_lakh=lambda d: (d["revenue"] / 1e5).round(1))
    .sort_values("revenue", ascending=False)
    [["city", "orders", "revenue_lakh"]]
)
print(report.to_string(index=False))
`, "same result: True  vectorised is faster: True\n  city  orders  revenue_lakh\nMumbai   37781        1190.6\n Delhi   37658        1185.4\n Patna   37446        1176.7\n  Pune   37158        1169.7"),
        { t: "table", head: ["Tip", "Why"], rows: [["Vectorise; avoid row loops and apply(axis=1)", "Often 100× faster"], ["Method chaining with assign/query/pipe", "Readable, no temporary variables, easy to reorder steps"], ["`astype(\"category\")` for repeated text", "Much less memory, faster groupby"], ["Parquet instead of CSV", "Smaller files, keeps types, loads much faster"], ["Load only needed columns", "`pd.read_csv(..., usecols=[...])`"], ["Too big for memory?", "Chunks (`chunksize=`), Polars, DuckDB or Spark"]] },
        { t: "analogy", text: "apply is a cashier ringing up items one by one; vectorisation is a barcode scanner reading the whole trolley at once. Method chaining is writing the whole recipe as one clear list of steps instead of scattered notes." },
        { t: "trap", text: "Long chains are hard to debug: build them one step at a time and print intermediate results. Don't use apply for things pandas already has (`.str`, `.dt`, `np.where`, `.map`, arithmetic)." },
        { t: "trick", text: "**Vectorise first, apply last. Chain: assign → query → groupby → agg → sort.**" },
        { t: "exam", items: ["Why is apply slow?", "What is method chaining?", "How do you reduce memory use in pandas?", "CSV vs Parquet?", "What do you do when data doesn't fit in memory?"] },
        { t: "recap", items: ["Vectorised column maths beats apply", "assign / query / pipe enable chains", "category dtype saves memory", "Parquet is faster and keeps types", "Chunks, Polars, DuckDB or Spark for very big data"] },
      ],
      quiz: [
        { q: "Fastest way to multiply two columns?", options: ["df[\"a\"] * df[\"b\"]", "df.apply(lambda r: r.a * r.b, axis=1)", "A for loop", "iterrows"], answer: 0, explain: "Vectorised." },
        { q: "df.assign(x=...) returns…", options: ["A new DataFrame with column x", "None", "Only column x", "A Series"], answer: 0, explain: "Which makes chaining possible." },
        { q: "Best format for large, typed data files?", options: ["Parquet", "TXT", "PNG", "PDF"], answer: 0, explain: "Columnar and compressed." },
        { q: "Repeated city names use less memory as…", options: ["category dtype", "object strings", "float64", "lists"], answer: 0, explain: "Stored as small integer codes." },
      ],
    },
  ],
};
