import type { Lesson, LearnModule } from "../types";
import { py, src } from "../python/helpers";

/**
 * Depth topics: Jupyter/IPython, extra NumPy, pandas and matplotlib lessons, and machine learning in depth
 * (validation curves, feature engineering, SVMs, manifold learning, Gaussian mixtures and KDE).
 */
export const DS24_JUPYTER: LearnModule = {
  id: "jupyter-ipython",
  title: "Jupyter and IPython: the data scientist's workbench",
  titleHi: "Jupyter और IPython: डेटा साइंटिस्ट की वर्कबेंच",
  blurb: "Work like a professional in notebooks: get help with ? and ??, use tab completion and shortcuts, magic commands (%timeit, %run, %%writefile), shell commands, input/output history, then debug and profile slow or broken code.",
  lessons: [
    {
      id: "ipython-jupyter-basics",
      title: "IPython and Jupyter: help, magics and history",
      oneLine: "IPython is an enhanced interactive Python shell, and Jupyter notebooks wrap it in a browser page that mixes code, output, charts and notes. Use ? for help, ?? for source code, Tab to explore, % magics for timing and running scripts, and ! to run shell commands.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Start a notebook" },
        { t: "code", lang: "bash", code: "pip install jupyterlab ipython     # or use Google Colab / Kaggle: nothing to install\njupyter lab                        # opens in your browser\nipython                            # the enhanced shell in the terminal" },
        { t: "table", head: ["Notebook skill", "How"], rows: [["Run a cell", "Shift + Enter"], ["New cell below / above", "B / A (command mode, press Esc first)"], ["Code cell ↔ Markdown cell", "Y / M"], ["Delete a cell", "D, D"], ["Restart and run everything", "Kernel → Restart & Run All (do this before sharing!)"]] },
        { t: "h", text: "Step 2: Help without leaving the notebook" },
        { t: "code", lang: "text", title: "Typed in IPython / Jupyter", code: "In [1]: len?             # the docstring: what len does and how to call it\nIn [2]: def square(a):\n   ...:     \"\"\"Return the square of a.\"\"\"\n   ...:     return a ** 2\nIn [3]: square??         # ?? shows the source code too\nIn [4]: import pandas as pd\nIn [5]: pd.read_<TAB>    # tab completion lists read_csv, read_excel, read_json…\nIn [6]: *Warning?        # wildcard search: every name ending in Warning" },
        py("What ? shows comes from docstrings", src`
def square(a):
    """Return the square of a."""
    return a ** 2

help_text = square.__doc__            # IPython's square? displays this
print(help_text)
import inspect
print(inspect.getsource(square))      # IPython's square?? displays this
print([name for name in dir(str) if name.startswith("is")][:5])   # what Tab completion lists
`, "Return the square of a.\ndef square(a):\n    \"\"\"Return the square of a.\"\"\"\n    return a ** 2\n\n['isalnum', 'isalpha', 'isascii', 'isdecimal', 'isdigit']", "Write docstrings in your own functions, and your team gets help in Jupyter for free."),
        { t: "h", text: "Step 3: Magic commands" },
        { t: "table", head: ["Magic", "Does"], rows: [
          ["`%timeit expr`", "Times a line many times and reports the average (best for small snippets)"],
          ["`%%timeit`", "Times a whole cell"],
          ["`%time expr`", "Times one run (for slow code)"],
          ["`%run script.py`", "Runs a script; its variables stay available in the notebook"],
          ["`%%writefile name.py`", "Saves the cell's contents to a file"],
          ["`%who`, `%whos`", "Lists the variables you've defined"],
          ["`%history -n 1-5`", "Shows earlier inputs; `In[3]` and `Out[3]` hold the 3rd input and output"],
          ["`%matplotlib inline`", "Shows charts inside the notebook (default in Jupyter today)"],
          ["`%lsmagic`, `%magic`", "Lists and explains all magics"],
          ["`!pip install x`, `!ls`", "Runs a shell command; `files = !ls` captures the output"],
        ] },
        { t: "code", lang: "text", title: "Timing in a notebook", code: "In [7]: %timeit sum(range(1000))\n7.82 µs ± 61.3 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)\n\nIn [8]: import numpy as np; a = np.arange(1000)\nIn [9]: %timeit a.sum()\n1.61 µs ± 10.4 ns per loop (…)" },
        py("The same timing outside Jupyter", src`
import timeit
import numpy as np

a = np.arange(1000)
python_sum = timeit.timeit(lambda: sum(range(1000)), number=2000)   # what %timeit does for you
numpy_sum = timeit.timeit(lambda: a.sum(), number=2000)
print("NumPy's sum is faster:", numpy_sum < python_sum)
`, "NumPy's sum is faster: True", "Exact times depend on your computer, so compare, don't memorise numbers."),
        { t: "analogy", text: "A plain Python shell is a basic calculator. IPython is a scientific calculator with a help button (?), a memory (In/Out history) and a stopwatch (%timeit). Jupyter is that calculator plus a notebook where you write down every step and the results next to it." },
        { t: "trap", text: "Notebooks run cells in whatever order you click them, so hidden state builds up: a variable deleted from the code may still exist in memory. Before sharing, **Restart & Run All** to prove the notebook runs top to bottom. Magics (%, !) only work in IPython/Jupyter, not in .py scripts." },
        { t: "trick", text: "**? = help, ?? = source, Tab = explore, % = magic, ! = shell. Restart & Run All before sharing.**" },
        { t: "exam", items: ["What is the difference between IPython and Jupyter?", "What are magic commands? Give examples.", "%time vs %timeit?", "What is the hidden-state problem in notebooks?", "When would you move code from a notebook into a .py module?"] },
        { t: "recap", items: ["Jupyter mixes code, output, charts and notes", "? help, ?? source, Tab completion", "%timeit, %run, %%writefile, %who, %history", "! runs shell commands", "Restart & Run All before sharing"] },
      ],
      quiz: [
        { q: "In IPython, what does obj?? show?", options: ["The source code (and docstring)", "Only the type", "The memory address", "Nothing"], answer: 0, explain: "obj? shows the docstring." },
        { q: "Best magic to time a tiny snippet accurately?", options: ["%timeit", "%run", "%who", "%history"], answer: 0, explain: "It repeats the code many times." },
        { q: "!pip install seaborn in a notebook…", options: ["Runs a shell command", "Is a Python syntax error", "Imports seaborn", "Times pip"], answer: 0, explain: "! sends the line to the shell." },
        { q: "Why Restart & Run All before sharing a notebook?", options: ["To prove it runs top to bottom without hidden state", "To make it faster", "To delete outputs", "It's required by Jupyter"], answer: 0, explain: "Cells may have run out of order." },
      ],
    },
    {
      id: "debugging-profiling",
      title: "Debugging and profiling",
      oneLine: "When code breaks, read the traceback, then use a debugger (%debug or breakpoint()) to inspect variables at the crash. When code is slow, profile it (cProfile, %prun, %lprun) to find where the time actually goes, and measure memory (tracemalloc, %memit) before optimising.",
      minutes: 18,
      blocks: [
        { t: "table", head: ["Tool", "Use"], rows: [["`%xmode Verbose`", "Tracebacks that also show variable values"], ["`%debug`", "Open the debugger right after an error, at the line that failed"], ["`breakpoint()`", "Pause a script at a chosen line (works everywhere)"], ["`%pdb on`", "Automatically open the debugger on every error"], ["Debugger commands", "`p var` print, `n` next line, `s` step into, `c` continue, `u`/`d` move up/down the call stack, `q` quit"]] },
        py("Profiling: where does the time go?", src`
import cProfile
import pstats

def slow_unique(values):
    result = []
    for v in values:
        if v not in result:              # searching a list: slow when it grows
            result.append(v)
    return result

def fast_unique(values):
    return list(dict.fromkeys(values))   # hash lookups

def pipeline():
    data = [i % 500 for i in range(20_000)]
    a = slow_unique(data)
    b = fast_unique(data)
    return a == b

profiler = cProfile.Profile()
print("same result:", profiler.runcall(pipeline))
stats = pstats.Stats(profiler)
times = {fn[2]: stat[3] for fn, stat in stats.stats.items() if fn[2] in ("slow_unique", "fast_unique")}
print("slow_unique took longer than fast_unique:", times["slow_unique"] > times["fast_unique"])
`, "same result: True\nslow_unique took longer than fast_unique: True", "In Jupyter, `%prun pipeline()` prints the same table, and `%lprun -f slow_unique pipeline()` (pip install line_profiler) shows the time for every line."),
        py("Measuring memory", src`
import tracemalloc
import numpy as np

tracemalloc.start()
as_list = [float(i) for i in range(200_000)]
list_bytes = tracemalloc.get_traced_memory()[0]
tracemalloc.stop()

tracemalloc.start()
as_array = np.arange(200_000, dtype=np.float64)
array_bytes = tracemalloc.get_traced_memory()[0]
tracemalloc.stop()

print("array bytes:", as_array.nbytes)                       # 8 bytes per float
print("list uses several times more memory:", list_bytes > 3 * array_bytes)
`, "array bytes: 1600000\nlist uses several times more memory: True", "A Python list stores a pointer to a separate float object for every value; a NumPy array stores the raw numbers side by side. In Jupyter, `%memit` (pip install memory_profiler) measures a line's memory directly."),
        { t: "analogy", text: "Debugging is a doctor examining the patient at the moment of the problem (the debugger at the crash line), not guessing from a description. Profiling is a stopwatch on every runner in a relay: you only train the slowest runner, not the whole team." },
        { t: "trap", text: "Don't optimise by guessing: programmers are famously bad at predicting where time goes. Profile first; often a single line (a list lookup inside a loop, a pandas apply) takes 90% of the time. And remove `breakpoint()` calls before committing code." },
        { t: "trick", text: "**Broken → read the traceback → %debug / breakpoint(). Slow → profile (%prun / %lprun) → fix the hottest line → measure again.**" },
        { t: "exam", items: ["How do you debug code in Jupyter?", "What does a profiler tell you?", "%prun vs %lprun?", "Why is checking membership in a list slow compared with a set or dict?", "How do you measure memory use in Python?"] },
        { t: "recap", items: ["Read tracebacks bottom-up; %xmode Verbose for more detail", "%debug or breakpoint() to inspect variables", "cProfile / %prun per function, %lprun per line", "tracemalloc / %memit for memory", "Profile before optimising"] },
      ],
      quiz: [
        { q: "Which command opens the debugger after an error in Jupyter?", options: ["%debug", "%timeit", "%run", "%who"], answer: 0, explain: "It jumps to the failing frame." },
        { q: "In pdb, which command prints a variable?", options: ["p name", "print!", "show name", "x name"], answer: 0, explain: "n = next, c = continue, q = quit." },
        { q: "A profiler is used to…", options: ["Find which functions or lines take the most time", "Fix syntax errors", "Install packages", "Draw charts"], answer: 0, explain: "Measure before optimising." },
        { q: "Why is `if v not in result_list` slow for big lists?", options: ["It scans the list each time (O(n))", "Lists are encrypted", "It uses the GPU", "It isn't slow"], answer: 0, explain: "Sets and dicts check in O(1)." },
      ],
    },
  ],
};

export const NUMPY_EXTRA: Lesson[] = [
  {
    id: "ufuncs-aggregations-reshaping",
    title: "Ufuncs, aggregations, reshaping and splitting",
    oneLine: "NumPy's universal functions (ufuncs) like np.exp, np.log and np.add work element by element and also offer .reduce, .accumulate and .outer. Aggregations have NaN-safe versions (np.nanmean). Reshape, stack and split arrays to get data into the shape a model needs.",
    minutes: 20,
    blocks: [
      py("Ufuncs and their extras", src`
import numpy as np

x = np.array([1.0, 2.0, 4.0, 8.0])
print(np.log2(x), np.exp(x).round(1), np.abs([-3, 4]))
print(np.add.reduce(x), np.multiply.reduce(x))          # same as sum and product
print(np.add.accumulate(x))                              # running total (like cumsum)
print(np.multiply.outer([1, 2, 3], [1, 10, 100]))        # every pair: a multiplication table

out = np.empty(4)
np.multiply(x, 10, out=out)                              # write straight into an existing array
print(out)
`, "[0. 1. 2. 3.] [2.700e+00 7.400e+00 5.460e+01 2.981e+03] [3 4]\n15.0 64.0\n[ 1.  3.  7. 15.]\n[[  1  10 100]\n [  2  20 200]\n [  3  30 300]]\n[10. 20. 40. 80.]"),
      py("Aggregations, including missing values", src`
import numpy as np

temps = np.array([[31.0, 33.5, np.nan, 30.2],          # city × day, one missing reading
                  [22.1, 21.8, 23.4, 24.0]])
print(np.mean(temps), np.nanmean(temps).round(2))       # NaN poisons the plain mean
print(np.nanmax(temps, axis=1), np.nanargmin(temps, axis=1))
print(np.percentile([3, 1, 4, 1, 5, 9, 2, 6], [25, 50, 75]))
print(np.any(temps > 33), np.all(temps[1] > 20))
`, "nan 26.57\n[33.5 24. ] [3 1]\n[1.75 3.5  5.25]\nTrue True"),
      py("Reshape, stack and split", src`
import numpy as np

a = np.arange(1, 13)
grid = a.reshape(3, 4)                                   # 12 values → 3 rows × 4 columns
print(grid)
print(a.reshape(-1, 6).shape)                            # -1 = "work it out for me"
print(grid[:, np.newaxis, 0].shape)                      # add an axis: a column vector
print(np.vstack([grid[0], grid[2]]))                     # stack rows
print(np.hstack([grid[:, :1], grid[:, -1:]]))            # stack columns
left, right = np.hsplit(grid, [1])                       # split before column 1
print(left.ravel(), right.shape)
`, "[[ 1  2  3  4]\n [ 5  6  7  8]\n [ 9 10 11 12]]\n(2, 6)\n(3, 1)\n[[ 1  2  3  4]\n [ 9 10 11 12]]\n[[ 1  4]\n [ 5  8]\n [ 9 12]]\n[1 5 9] (3, 3)"),
      { t: "table", head: ["Need", "NumPy"], rows: [["Element-wise maths", "`np.exp`, `np.log`, `np.sqrt`, `np.abs`, `np.sin`"], ["Reduce / running total / all pairs", "`np.add.reduce`, `np.add.accumulate`, `np.multiply.outer`"], ["Ignore NaN", "`np.nansum`, `np.nanmean`, `np.nanmax`"], ["Change shape", "`reshape(r, c)`, `reshape(-1, c)`, `ravel()`, `np.newaxis`"], ["Combine", "`np.concatenate`, `np.vstack`, `np.hstack`"], ["Split", "`np.split`, `np.vsplit`, `np.hsplit`"]] },
      { t: "trap", text: "One NaN makes `np.mean` return NaN: use the `nan` versions or clean the data first. reshape needs the total size to match (12 values can be 3×4 or 2×6, never 5×3), and it usually returns a view, so changing the reshaped array changes the original." },
      { t: "trick", text: "**ufunc + .reduce/.accumulate/.outer. nan-functions for missing data. reshape(-1, n) lets NumPy count.**" },
      { t: "exam", items: ["What is a ufunc?", "np.sum vs np.nansum?", "What does reshape(-1, 3) do?", "vstack vs hstack vs concatenate?", "What is np.newaxis for?"] },
      { t: "recap", items: ["Ufuncs work element-wise and have reduce/accumulate/outer", "Aggregations accept axis=; nan-versions ignore NaN", "reshape with -1 infers a dimension", "vstack/hstack/concatenate combine; split/hsplit/vsplit cut", "np.newaxis adds a dimension"] },
    ],
    quiz: [
      { q: "np.add.accumulate([1, 2, 3]) is…", options: ["[1 3 6]", "6", "[2 4 6]", "[1 2 3]"], answer: 0, explain: "A running total." },
      { q: "np.mean([1, np.nan, 3]) is…", options: ["nan", "2.0", "4.0", "Error"], answer: 0, explain: "Use np.nanmean for 2.0." },
      { q: "np.arange(12).reshape(-1, 4).shape is…", options: ["(3, 4)", "(4, 3)", "(12,)", "(-1, 4)"], answer: 0, explain: "12 / 4 = 3 rows." },
      { q: "np.multiply.outer([1, 2], [10, 20]) is…", options: ["[[10 20] [20 40]]", "[10 40]", "50", "[[1 2] [10 20]]"], answer: 0, explain: "Every pair multiplied." },
    ],
  },
  {
    id: "sorting-structured",
    title: "Sorting, partitioning, fancy indexing and structured arrays",
    oneLine: "np.sort sorts values and np.argsort returns the order (to sort other arrays the same way or find nearest neighbours). np.partition finds the k smallest without a full sort. Fancy indexing can also bin and count data. Structured arrays hold named columns of different types, a step towards pandas.",
    minutes: 18,
    blocks: [
      py("argsort, partition and nearest neighbours", src`
import numpy as np

marks = np.array([72, 95, 64, 88, 81])
names = np.array(["Ravi", "Zoya", "Imran", "Asha", "Neha"])
order = np.argsort(marks)[::-1]                    # positions from highest to lowest
print(names[order], marks[order])
print(np.sort(np.array([[3, 1, 2], [9, 7, 8]]), axis=1))
print(np.partition([7, 2, 9, 1, 5, 3], 2))         # the 2 smallest come first (unordered), no full sort

rng = np.random.default_rng(0)
points = rng.random((6, 2))
dist = ((points[:, np.newaxis, :] - points[np.newaxis, :, :]) ** 2).sum(axis=-1)   # all pairwise distances
nearest = np.argsort(dist, axis=1)[:, 1]           # column 0 is the point itself
print("nearest neighbour of each point:", nearest)
`, "['Zoya' 'Asha' 'Neha' 'Ravi' 'Imran'] [95 88 81 72 64]\n[[1 2 3]\n [7 8 9]]\n[1 2 3 5 7 9]\nnearest neighbour of each point: [5 0 4 4 3 0]"),
      py("Binning with fancy indexing, and structured arrays", src`
import numpy as np

rng = np.random.default_rng(1)
times = np.clip(rng.normal(30, 8, 1000), 0, 69.9)  # delivery minutes, kept inside 0–70
edges = np.arange(0, 80, 10)                       # bin edges 0, 10, …, 70 → 7 bins
counts = np.zeros(len(edges) - 1, dtype=int)
idx = np.searchsorted(edges, times, side="right") - 1   # which bin each value falls in
np.add.at(counts, idx, 1)                          # add 1 per value, repeats included
print({f"{lo}-{lo + 9}": int(c) for lo, c in zip(edges[:-1], counts)})
print("same as np.histogram:", np.array_equal(counts, np.histogram(times, bins=edges)[0]))

people = np.zeros(3, dtype={"names": ("name", "age", "score"), "formats": ("U10", "i4", "f8")})
people["name"] = ["Asha", "Ravi", "Zoya"]
people["age"] = [21, 25, 22]
people["score"] = [88.5, 72.0, 95.25]
print(people[people["age"] < 24]["name"])          # filter one named column by another
`, "{'0-9': 7, '10-19': 104, '20-29': 401, '30-39': 401, '40-49': 81, '50-59': 5, '60-69': 1}\nsame as np.histogram: True\n['Asha' 'Zoya']", "`np.add.at` is needed instead of `counts[idx] += 1`, because plain fancy assignment counts repeated indices only once."),
      { t: "trap", text: "`counts[idx] += 1` with repeated indices adds only 1 per distinct index: use `np.add.at` or `np.bincount`. Structured arrays work, but for real tabular work, pandas is far more convenient." },
      { t: "trick", text: "**argsort to reorder other arrays; partition for top-k; np.add.at for counting; pandas for tables.**" },
      { t: "exam", items: ["np.sort vs np.argsort?", "How do you get the top-k values efficiently?", "Why does counts[idx] += 1 miscount repeated indices?", "What is a structured array?"] },
      { t: "recap", items: ["argsort gives the order; reuse it on related arrays", "partition finds the k smallest in O(n)", "Broadcasting computes all pairwise distances", "np.add.at / np.bincount count correctly with repeats", "Structured arrays = named mixed-type columns"] },
    ],
    quiz: [
      { q: "np.argsort([30, 10, 20]) is…", options: ["[1 2 0]", "[10 20 30]", "[0 1 2]", "[2 0 1]"], answer: 0, explain: "Positions of the smallest, next, largest." },
      { q: "To find the 5 smallest of a million values quickly, use…", options: ["np.partition", "np.sort then slice always", "A Python loop", "np.unique"], answer: 0, explain: "No full sort needed." },
      { q: "counts[[1, 1, 2]] += 1 starting from zeros gives counts[1] =", options: ["1", "2", "0", "3"], answer: 0, explain: "Use np.add.at for 2." },
      { q: "A structured array is closest to…", options: ["A table with named columns of different types", "A 3-D image", "A Python dict", "A sorted list"], answer: 0, explain: "pandas is the convenient version." },
    ],
  },
];

export const PANDAS_BASICS_EXTRA: Lesson[] = [
  {
    id: "index-alignment-multiindex",
    title: "Index alignment and hierarchical (Multi) indexes",
    oneLine: "pandas lines up data by index labels, not positions, before doing maths, so Series with different rows combine correctly (unmatched labels become NaN). A MultiIndex stores several levels of row labels (state, year) and lets you slice by level, stack and unstack between long and wide shapes.",
    minutes: 20,
    blocks: [
      py("Alignment: labels, not positions", src`
import pandas as pd

area = pd.Series({"Bihar": 94_163, "Kerala": 38_863, "Goa": 3_702})          # km²
population = pd.Series({"Kerala": 3.56e7, "Bihar": 1.27e8, "Punjab": 3.1e7})
print((population / area).round(1))              # matched by state name; missing pairs → NaN
print(population.div(area, fill_value=1).round(1).loc[["Goa", "Punjab"]])

df = pd.DataFrame({"maths": [80, 60], "science": [70, 90]}, index=["Asha", "Ravi"])
print(df - df.iloc[0])                           # subtract Asha's row from every row (by column labels)
print(df.sub(df["maths"], axis=0))               # subtract each student's maths mark (by row labels)
`, "Bihar     1348.7\nGoa          NaN\nKerala     916.0\nPunjab       NaN\ndtype: float64\nGoa              0.0\nPunjab    31000000.0\ndtype: float64\n      maths  science\nAsha      0        0\nRavi    -20       20\n      maths  science\nAsha      0      -10\nRavi      0       30"),
      py("MultiIndex, stack and unstack", src`
import pandas as pd

index = pd.MultiIndex.from_product([["Bihar", "Kerala"], [2011, 2021]], names=["state", "year"])
pop = pd.Series([104.1, 124.8, 33.4, 35.7], index=index)          # crore people (approx.)
print(pop)
print(pop.loc["Kerala"])                                          # outer level
print(pop.loc[:, 2021])                                            # inner level
wide = pop.unstack()                                               # years become columns
print(wide)
print(wide.stack().equals(pop))                                     # and back again
growth = (wide[2021] / wide[2011] - 1).mul(100).round(1)
print(growth.rename("growth %"))
`, "state   year\nBihar   2011    104.1\n        2021    124.8\nKerala  2011     33.4\n        2021     35.7\ndtype: float64\nyear\n2011    33.4\n2021    35.7\ndtype: float64\nstate\nBihar     124.8\nKerala     35.7\ndtype: float64\nyear     2011   2021\nstate\nBihar   104.1  124.8\nKerala   33.4   35.7\nTrue\nstate\nBihar     19.9\nKerala     6.9\nName: growth %, dtype: float64"),
      { t: "table", head: ["Need", "pandas"], rows: [["Arithmetic with missing labels filled", "`a.add(b, fill_value=0)`, `.sub`, `.mul`, `.div`"], ["Operate along rows instead of columns", "`df.sub(series, axis=0)`"], ["Build a MultiIndex", "`pd.MultiIndex.from_product`, `from_tuples`, or `df.set_index([\"a\", \"b\"])`"], ["Select by level", "`s.loc[\"Kerala\"]`, `s.loc[:, 2021]`, `s.xs(2021, level=\"year\")`"], ["Long ↔ wide", "`unstack()` / `stack()`"], ["Back to columns", "`reset_index()`"]] },
      { t: "trap", text: "Alignment surprises people who expect position-based maths: two Series with different index orders still match by label, and unmatched labels give NaN. Slicing a MultiIndex by ranges needs a sorted index (`sort_index()`), or pandas raises a lexsort warning or error." },
      { t: "trick", text: "**pandas matches labels first, then computes. MultiIndex + unstack/stack = long ↔ wide.**" },
      { t: "exam", items: ["What is index alignment?", "How do you avoid NaN when labels don't match?", "What is a MultiIndex? When is it useful?", "stack vs unstack?", "What does reset_index do?"] },
      { t: "recap", items: ["Operations align on index labels", "fill_value= for unmatched labels", "axis=0 to operate row-wise with a Series", "MultiIndex = several levels of labels", "unstack (long → wide), stack (wide → long)"] },
    ],
    quiz: [
      { q: "Series with labels [a, b] + Series with labels [b, c] gives labels…", options: ["a, b, c (a and c are NaN)", "Only b", "a, b", "Error"], answer: 0, explain: "The union of labels, aligned." },
      { q: "s.unstack() on a (state, year) MultiIndex Series gives…", options: ["A DataFrame with years as columns", "A list", "A flat Series", "An error"], answer: 0, explain: "The inner level becomes columns." },
      { q: "a.add(b, fill_value=0) treats missing labels as…", options: ["0", "NaN", "1", "Errors"], answer: 0, explain: "Instead of producing NaN." },
      { q: "To subtract a Series from each row's values by row label, use…", options: ["df.sub(s, axis=0)", "df - s", "df.sub(s, axis=1)", "df.minus(s)"], answer: 0, explain: "df - s aligns on columns." },
    ],
  },
];

export const PANDAS_ANALYSIS_EXTRA: Lesson[] = [
  {
    id: "groupby-advanced-strings-eval",
    title: "groupby filter and apply, vectorised strings and eval",
    oneLine: "Beyond agg and transform, groupby can filter whole groups and apply any function to each group. The .str accessor runs string methods and regular expressions on whole columns at once. pd.eval and DataFrame.eval/query compute big expressions faster and with less memory.",
    minutes: 20,
    blocks: [
      py("groupby: filter and apply", src`
import pandas as pd

df = pd.DataFrame({
    "store": ["A", "A", "A", "B", "B", "C", "C", "C", "C"],
    "sales": [120, 80, 100, 300, 280, 50, 60, 55, 70],
})
busy = df.groupby("store").filter(lambda g: g["sales"].sum() > 250)   # keep whole groups
print(busy["store"].unique().tolist())

def top_day(g):
    return g.nlargest(1, "sales")                     # any function of one group
print(df.groupby("store", group_keys=False).apply(top_day).to_string(index=False))

print(df.groupby("store")["sales"].agg(["min", "median", "max"]))
`, "['A', 'B']\n sales\n   120\n   300\n    70\n       min  median  max\nstore\nA       80   100.0  120\nB      280   290.0  300\nC       50    57.5   70"),
      py("Vectorised string operations and regex", src`
import pandas as pd

recipes = pd.Series(["Paneer Butter Masala (veg)", "chicken biryani", "Masala Dosa (veg)",
                     "Fish Curry", "egg curry", "Veg Pulao (veg)"])
print(recipes.str.lower().str.contains("masala").tolist())
print(recipes.str.len().tolist())
print(recipes.str.extract(r"^(\w+)")[0].str.title().tolist())          # first word
print(recipes.str.contains(r"\(veg\)").sum(), "marked veg")
print(recipes.str.replace(r"\s*\(veg\)", "", regex=True).str.title().tolist())
print(recipes.str.split().str.len().tolist())                          # words per name
`, "[True, False, True, False, False, False]\n[26, 15, 17, 10, 9, 15]\n['Paneer', 'Chicken', 'Masala', 'Fish', 'Egg', 'Veg']\n3 marked veg\n['Paneer Butter Masala', 'Chicken Biryani', 'Masala Dosa', 'Fish Curry', 'Egg Curry', 'Veg Pulao']\n[4, 2, 3, 2, 2, 3]"),
      py("eval and query for big expressions", src`
import numpy as np
import pandas as pd

rng = np.random.default_rng(0)
df = pd.DataFrame(rng.random((200_000, 3)), columns=["a", "b", "c"])
plain = (df["a"] + df["b"]) / (df["c"] - 1)
with_eval = df.eval("(a + b) / (c - 1)")             # parsed once, computed without temporary arrays
print("same result:", np.allclose(plain, with_eval))

limit = 0.5
print(len(df.query("a < @limit and b < @limit")))     # @ uses a Python variable
df.eval("d = a * 2 + b", inplace=True)                # create a column
print(df.columns.tolist())
`, "same result: True\n50148\n['a', 'b', 'c', 'd']"),
      { t: "table", head: ["groupby method", "Returns", "Example"], rows: [["`agg`", "One row per group", "Total sales per store"], ["`transform`", "Same shape as the input", "Each row's share of its store"], ["`filter`", "Rows of the groups that pass", "Only stores with sales > 250"], ["`apply`", "Anything", "Top day per store, custom summaries"]] },
      { t: "trap", text: "`apply` on groups is flexible but slow: prefer agg/transform/filter when they fit. `.str.contains` treats the pattern as a regex by default, so escape special characters like `(`, or pass `regex=False`. `eval` only pays off on large frames (tens of thousands of rows or more)." },
      { t: "trick", text: "**agg = summarise, transform = broadcast, filter = keep groups, apply = anything. .str for whole text columns.**" },
      { t: "exam", items: ["agg vs transform vs filter vs apply?", "How do you search text columns with a regex?", "How do you extract part of a string column?", "When are eval and query faster?", "What does @ mean inside query?"] },
      { t: "recap", items: ["groupby.filter keeps whole groups", "groupby.apply runs any function per group", ".str methods + regex on whole columns", "str.extract captures regex groups into columns", "eval/query for large, readable expressions"] },
    ],
    quiz: [
      { q: "groupby(...).filter(f) returns…", options: ["Rows of groups where f is True", "One row per group", "A boolean", "The group names only"], answer: 0, explain: "Whole groups are kept or dropped." },
      { q: "s.str.contains(\"(veg)\") may behave unexpectedly because…", options: ["The pattern is treated as a regex", "It's case-sensitive", "It returns numbers", "It's slow"], answer: 0, explain: "Escape it or use regex=False." },
      { q: "In df.query(\"a < @x\"), @x refers to…", options: ["A Python variable named x", "A column named x", "The index", "An error"], answer: 0, explain: "Local variables need @." },
      { q: "Which is usually fastest for a per-group total?", options: ["groupby().agg(\"sum\")", "groupby().apply(custom)", "A Python loop", "iterrows"], answer: 0, explain: "Built-in aggregations are optimised." },
    ],
  },
];

export const VIZ_EXTRA: Lesson[] = [
  {
    id: "customizing-plots",
    title: "Customising plots: legends, colorbars, annotations, ticks and styles",
    oneLine: "Turn a default chart into a clear one: choose line styles and markers, add a legend (or label lines directly), use a colorbar to explain colours, annotate key points, format ticks (₹, %, thousands), lay out subplots with gridspec, and apply a style sheet for consistent looks.",
    minutes: 22,
    blocks: [
      py("A polished, annotated chart", src`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np

plt.style.use("seaborn-v0_8-whitegrid")                 # a built-in style sheet
months = np.arange(1, 13)
online = np.array([12, 14, 15, 18, 21, 25, 24, 27, 31, 36, 42, 48]) * 1e5
store = np.array([30, 29, 31, 30, 28, 27, 29, 28, 27, 26, 30, 33]) * 1e5

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(months, online, color="#2a78d6", linewidth=2, marker="o", markersize=4, label="Online")
ax.plot(months, store, color="#eb6834", linewidth=2, linestyle="--", label="In store")
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"₹{v / 1e5:.0f}L"))   # ₹ lakh
ax.set_xticks(months, ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"])
cross = int(np.argmax(online > store))
ax.annotate("Online overtakes stores", xy=(months[cross], online[cross]),
            xytext=(months[cross] - 4, online[cross] + 8e5),
            arrowprops={"arrowstyle": "->", "color": "black"})
ax.set(title="Online sales overtook stores in September", xlabel="Month (2026)", ylabel="Monthly sales")
ax.legend(frameon=False, loc="upper left")
fig.tight_layout()
fig.savefig("sales_story.png", dpi=120)

print("lines:", [line.get_label() for line in ax.get_lines()])
print("first tick labels:", [t.get_text() for t in ax.get_xticklabels()][:3])
print("annotation:", ax.texts[0].get_text())
`, "lines: ['Online', 'In store']\nfirst tick labels: ['J', 'F', 'M']\nannotation: Online overtakes stores"),
      py("Colorbars and layouts with gridspec", src`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(2)
hours = np.arange(24)
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
orders = rng.poisson(20 + 30 * np.exp(-((hours - 20) ** 2) / 8), size=(7, 24))     # dinner peak

fig = plt.figure(figsize=(10, 5))
grid = fig.add_gridspec(2, 3, height_ratios=[3, 1])
heat = fig.add_subplot(grid[0, :])                       # top row: full width
image = heat.imshow(orders, aspect="auto", cmap="Blues")  # one hue, light → dark for "more"
heat.set(yticks=range(7), yticklabels=days, xlabel="Hour of day", title="Orders per hour")
fig.colorbar(image, ax=heat, label="Orders")             # explains what the colours mean
for i, day in enumerate(["Mon", "Wed", "Sun"]):          # bottom row: three small charts
    ax = fig.add_subplot(grid[1, i])
    ax.bar(hours, orders[days.index(day)], color="#2a78d6", width=0.8)
    ax.set(title=day, xticks=[0, 12, 23])
fig.tight_layout()
fig.savefig("orders_heatmap.png", dpi=120)
print("axes:", len(fig.axes), "| colorbar label:", fig.axes[1].get_ylabel())
print("busiest hour:", int(orders.sum(axis=0).argmax()))
`, "axes: 5 | colorbar label: Orders\nbusiest hour: 21"),
      { t: "table", head: ["Need", "matplotlib"], rows: [
        ["Line style, marker", "`linestyle=\"--\"`, `marker=\"o\"`, `linewidth=2`"],
        ["Legend", "`label=` on each plot, then `ax.legend()` (or label lines directly with `ax.text`)"],
        ["Colour scale explanation", "`fig.colorbar(image, ax=ax, label=…)`"],
        ["Point out something", "`ax.annotate(text, xy=…, xytext=…, arrowprops=…)`"],
        ["Tick positions and labels", "`ax.set_xticks(positions, labels)`, `ticker.FuncFormatter`, `PercentFormatter`"],
        ["Complex layouts", "`fig.add_gridspec`, `plt.subplots(sharex=True)`"],
        ["Consistent look", "`plt.style.use(…)`, `plt.rcParams[\"font.size\"] = 12`"],
        ["3-D or contour", "Next lesson"],
      ] },
      { t: "trap", text: "Too much decoration hides the data: avoid heavy grids, 3-D effects and many colours. For heatmaps of magnitude, use one hue from light to dark (\"Blues\"), not a rainbow like \"jet\", which creates fake boundaries and fails for colour-blind readers." },
      { t: "trick", text: "**Message in the title, labels with units, legend or direct labels, annotate the key point, one hue for magnitude.**" },
      { t: "exam", items: ["How do you add a legend? An annotation?", "What is a colorbar for?", "How do you format ticks as currency or percentages?", "What is gridspec?", "Why avoid rainbow colormaps?"] },
      { t: "recap", items: ["label= + ax.legend()", "fig.colorbar explains colour scales", "ax.annotate points out the story", "ticker formatters for ₹, %, thousands", "gridspec for custom layouts; style sheets for consistency"] },
    ],
    quiz: [
      { q: "Which adds a legend entry for a line?", options: ["label=\"Online\" in ax.plot, then ax.legend()", "ax.title(\"Online\")", "ax.colorbar()", "plt.text only"], answer: 0, explain: "The legend reads the labels." },
      { q: "A colorbar is needed for…", options: ["Charts where colour encodes a number (heatmaps)", "Every bar chart", "Line charts only", "Pie charts"], answer: 0, explain: "It's the key to the colours." },
      { q: "Best colormap for \"more orders = darker\"?", options: ["A single-hue sequential map like Blues", "jet (rainbow)", "Random colours", "A diverging map"], answer: 0, explain: "Diverging maps are for +/− around a midpoint." },
      { q: "ax.annotate is used to…", options: ["Add text with an optional arrow pointing at data", "Change the axis scale", "Save the figure", "Create subplots"], answer: 0, explain: "Tell the story on the chart." },
    ],
  },
  {
    id: "density-contour-3d",
    title: "Density, contour and 3-D plots",
    oneLine: "For two-dimensional data with many points, show density instead of dots: 2-D histograms, hexbin and kernel density contours. Contour plots draw a function of two variables as level lines; 3-D surfaces and scatter plots show three variables, but are best used sparingly.",
    minutes: 18,
    blocks: [
      py("Contours, hexbin and a 3-D surface", src`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)                              # every (x, y) pair on a grid
Z = np.exp(-(X ** 2 + Y ** 2) / 2) - 0.5 * np.exp(-((X - 1.5) ** 2 + (Y - 1) ** 2))

rng = np.random.default_rng(4)
pts = rng.multivariate_normal([0, 0], [[1, 0.8], [0.8, 1]], size=20_000)   # 20k correlated points

fig = plt.figure(figsize=(13, 4))
ax1 = fig.add_subplot(1, 3, 1)
lines = ax1.contour(X, Y, Z, levels=10, cmap="RdBu_r")    # +/− values → diverging colours
ax1.clabel(lines, fontsize=7)
ax1.set_title("Contour lines of a surface")

ax2 = fig.add_subplot(1, 3, 2)
hb = ax2.hexbin(pts[:, 0], pts[:, 1], gridsize=40, cmap="Blues", mincnt=1)
fig.colorbar(hb, ax=ax2, label="points per hexagon")
ax2.set_title("20,000 points as density")

ax3 = fig.add_subplot(1, 3, 3, projection="3d")
ax3.plot_surface(X, Y, Z, cmap="RdBu_r", linewidth=0)
ax3.set_title("The same surface in 3-D")
fig.tight_layout()
fig.savefig("density_contour_3d.png", dpi=110)

print("grid shape:", Z.shape, "| peak value:", round(float(Z.max()), 3))
print("3-D axes:", ax3.name, "| densest hexagon holds", int(hb.get_array().max()), "points")
`, "grid shape: (100, 100) | peak value: 0.982\n3-D axes: 3d | densest hexagon holds 194 points"),
      { t: "table", head: ["Situation", "Use"], rows: [["Thousands of overlapping points", "`hexbin`, `hist2d`, or seaborn `kdeplot(x, y)`"], ["A function of two inputs (a loss surface, a map)", "`contour` / `contourf` + colorbar"], ["Three numeric variables", "Colour or size as the third variable in a 2-D scatter first; 3-D only if it truly helps"], ["Distribution of one variable, smoothly", "Kernel density estimate (KDE): `sns.kdeplot`"]] },
      { t: "trap", text: "3-D charts look impressive but distort sizes and hide points behind others; on paper they can't be rotated. Usually a 2-D chart with colour, a contour plot or small multiples communicates better. Use diverging colours only when values go above and below a meaningful midpoint." },
      { t: "trick", text: "**Too many dots → density (hexbin/KDE). Surface → contour + colorbar. 3-D → last resort.**" },
      { t: "exam", items: ["How do you visualise 100,000 points without overplotting?", "What is np.meshgrid for?", "contour vs contourf?", "When is a 3-D plot a bad idea?"] },
      { t: "recap", items: ["np.meshgrid builds grids for f(x, y)", "contour / contourf draw level lines / filled levels", "hexbin and KDE show where points are dense", "projection=\"3d\" for surfaces and 3-D scatter", "Prefer 2-D encodings when possible"] },
    ],
    quiz: [
      { q: "np.meshgrid(x, y) is used to…", options: ["Build every (x, y) pair for evaluating f(x, y)", "Sort arrays", "Draw a legend", "Load images"], answer: 0, explain: "Needed for contour and surface plots." },
      { q: "With 100,000 overlapping scatter points, use…", options: ["hexbin or a density plot", "Bigger markers", "A pie chart", "A 3-D bar chart"], answer: 0, explain: "Shows where points concentrate." },
      { q: "How do you create 3-D axes?", options: ["fig.add_subplot(projection=\"3d\")", "plt.plot3()", "ax.set_3d(True)", "It's impossible"], answer: 0, explain: "From mpl_toolkits.mplot3d." },
      { q: "A main weakness of 3-D charts is…", options: ["They distort and hide data", "They can't be saved", "They need pandas", "They're always slower to code"], answer: 0, explain: "Prefer 2-D when possible." },
    ],
  },
];

export const DS25_ML_DEPTH: LearnModule = {
  id: "ml-in-depth",
  title: "Machine learning in depth",
  titleHi: "मशीन लर्निंग गहराई से",
  blurb: "The ideas that separate a beginner from a practitioner: validation and learning curves, feature engineering for categories, text and derived features, support vector machines and kernels, manifold learning (Isomap, t-SNE), Gaussian mixture models and kernel density estimation.",
  lessons: [
    {
      id: "validation-curves",
      title: "Validation curves and learning curves",
      oneLine: "A validation curve plots training and validation scores as you change one setting (like tree depth): the best setting is where the validation score peaks. A learning curve plots scores as the training set grows: it tells you whether more data or a more flexible model will help.",
      minutes: 20,
      blocks: [
        py("Validation curve: choosing model complexity", src`
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import validation_curve
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
depths = [1, 2, 3, 4, 6, 8, 12]
train, valid = validation_curve(DecisionTreeClassifier(random_state=0), X, y,
                                param_name="max_depth", param_range=depths, cv=5)
for d, tr, va in zip(depths, train.mean(axis=1), valid.mean(axis=1)):
    print(f"max_depth={d:>2}: train {tr:.3f}  validation {va:.3f}  gap {tr - va:.3f}")
best = depths[int(np.argmax(valid.mean(axis=1)))]
print("best depth by validation score:", best)
`, "max_depth= 1: train 0.924  validation 0.900  gap 0.025\nmax_depth= 2: train 0.952  validation 0.928  gap 0.024\nmax_depth= 3: train 0.974  validation 0.917  gap 0.057\nmax_depth= 4: train 0.985  validation 0.916  gap 0.069\nmax_depth= 6: train 0.996  validation 0.914  gap 0.083\nmax_depth= 8: train 1.000  validation 0.916  gap 0.084\nmax_depth=12: train 1.000  validation 0.917  gap 0.083\nbest depth by validation score: 2"),
        { t: "diagram", text: "score\n 1.0 ┤ train ────────────────────────────▶ (keeps rising)\n     │       ╱‾‾‾‾‾╲___                validation (peaks, then falls)\n     │     ╱           ‾‾‾‾\n     │   ╱\n     └──────────────────────────────▶ model complexity\n      underfit   │ sweet spot │   overfit\n      (both low) │            │ (big gap)" },
        py("Learning curve: would more data help?", src`
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import learning_curve
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_digits(return_X_y=True)
sizes, train, valid = learning_curve(make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)),
                                     X, y, train_sizes=[0.1, 0.25, 0.5, 0.75, 1.0], cv=5)
for n, tr, va in zip(sizes, train.mean(axis=1), valid.mean(axis=1)):
    print(f"{n:>5} training images: train {tr:.3f}  validation {va:.3f}")
`, "  143 training images: train 1.000  validation 0.779\n  359 training images: train 1.000  validation 0.871\n  718 training images: train 1.000  validation 0.914\n 1077 training images: train 1.000  validation 0.923\n 1437 training images: train 0.999  validation 0.920"),
        { t: "table", head: ["What you see", "Diagnosis", "What to do"], rows: [["Train and validation both low, close together", "High bias (underfitting)", "More features or a more flexible model; more data won't help much"], ["Train high, validation much lower", "High variance (overfitting)", "More data, regularisation, simpler model"], ["Validation still rising at full size", "Data-limited", "Collect more data"], ["Both high and close", "Good fit", "Ship it (after a final test-set check)"]] },
        { t: "analogy", text: "A validation curve is tuning a guitar string: too loose (too simple) and too tight (too complex) both sound wrong; you turn the peg until the validation \"sound\" is best. A learning curve is a student's marks as they study more chapters: if marks are still climbing, more study (data) helps." },
        { t: "trap", text: "Choosing the setting with the best **training** score always picks the most complex model. Pick by validation score, then confirm once on the test set. Learning curves are noisy for small samples, so look at the trend, not single points." },
        { t: "trick", text: "**Validation curve → best complexity. Learning curve → is more data worth collecting?**" },
        { t: "exam", items: ["What is a validation curve?", "What is a learning curve and what can it tell you?", "How do you recognise high bias vs high variance from curves?", "Will more data fix underfitting?"] },
        { t: "recap", items: ["validation_curve varies one hyperparameter", "Pick the setting with the best validation score", "learning_curve varies the training size", "Big train–validation gap = variance; both low = bias", "More data helps variance, not bias"] },
      ],
      quiz: [
        { q: "Train 0.99, validation 0.80. Diagnosis?", options: ["Overfitting (high variance)", "Underfitting", "Perfect fit", "Data leakage only"], answer: 0, explain: "A big gap." },
        { q: "Both scores are 0.65 and stay flat with more data. Best next step?", options: ["Use a more flexible model or better features", "Collect much more data", "Lower the learning rate", "Delete features"], answer: 0, explain: "That's high bias." },
        { q: "validation_curve varies…", options: ["One hyperparameter", "The training size", "The test set", "The random seed only"], answer: 0, explain: "learning_curve varies the size." },
        { q: "Choose the hyperparameter value with the best…", options: ["Validation score", "Training score", "Test score during tuning", "Number of features"], answer: 0, explain: "The test set is for the final check." },
      ],
    },
    {
      id: "feature-engineering",
      title: "Feature engineering: categories, text, derived and polynomial features",
      oneLine: "Models only see numbers, and the right numbers matter more than the algorithm. Encode categories (one-hot), turn text into word counts or TF-IDF, derive features (ratios, date parts, polynomial terms) so a linear model can fit curves, and chain it all in a pipeline.",
      minutes: 22,
      blocks: [
        py("Categories and text become numbers", src`
from sklearn.feature_extraction import DictVectorizer
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

flats = [{"price": 85, "rooms": 2, "city": "Pune"},
         {"price": 60, "rooms": 1, "city": "Patna"},
         {"price": 140, "rooms": 3, "city": "Delhi"}]
vec = DictVectorizer(sparse=False)                      # one-hot for strings, numbers pass through
print(vec.fit_transform(flats))
print(vec.get_feature_names_out().tolist())

reviews = ["great food fast delivery", "late delivery cold food", "great taste great price"]
counts = CountVectorizer()
print(counts.fit_transform(reviews).toarray())          # bag of words
print(counts.get_feature_names_out().tolist())
tfidf = TfidfVectorizer().fit(reviews)
print({w: round(float(v), 2) for w, v in zip(tfidf.get_feature_names_out(), tfidf.idf_)})   # rare words weigh more
`, "[[  0.   0.   1.  85.   2.]\n [  0.   1.   0.  60.   1.]\n [  1.   0.   0. 140.   3.]]\n['city=Delhi', 'city=Patna', 'city=Pune', 'price', 'rooms']\n[[0 1 1 1 1 0 0 0]\n [1 1 0 1 0 1 0 0]\n [0 0 0 0 2 0 1 1]]\n['cold', 'delivery', 'fast', 'food', 'great', 'late', 'price', 'taste']\n{'cold': 1.69, 'delivery': 1.29, 'fast': 1.69, 'food': 1.29, 'great': 1.29, 'late': 1.69, 'price': 1.69, 'taste': 1.69}"),
        py("Derived and polynomial features let a line bend", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 60)
y = 3 + 4 * x - 0.4 * x ** 2 + rng.normal(0, 1, 60)      # a curved relationship
X = x.reshape(-1, 1)

line = LinearRegression().fit(X, y)
curve = make_pipeline(PolynomialFeatures(degree=2, include_bias=False), LinearRegression()).fit(X, y)
print("straight line R²:", round(line.score(X, y), 3))
print("with x² feature R²:", round(curve.score(X, y), 3))
print("new features for x=3:", PolynomialFeatures(2, include_bias=False).fit_transform([[3]]).tolist())
`, "straight line R²: 0.008\nwith x² feature R²: 0.918\nnew features for x=3: [[3.0, 9.0]]"),
        { t: "table", head: ["Raw data", "Feature ideas"], rows: [
          ["Category (city, device)", "One-hot; target encoding for many categories (carefully, inside CV)"],
          ["Text", "Word counts, TF-IDF, n-grams, embeddings"],
          ["Dates", "Day of week, month, holiday flag, days since an event"],
          ["Two related numbers", "Ratios (late orders / orders), differences, per-capita values"],
          ["Curved relationships", "Polynomial terms, logs, splines, bins"],
          ["Missing values", "Impute + a \"was missing\" indicator (`SimpleImputer(add_indicator=True)`)"],
          ["Images", "Pixels, HOG features, or a pre-trained CNN's embeddings"],
        ] },
        { t: "analogy", text: "Feature engineering is a good translator between the real world and the model: the model can't read \"Delhi\" or \"cold food\", and doesn't know that weekends matter, until you translate them into numbers that carry that meaning." },
        { t: "trap", text: "Every learned transformation (vocabulary, scaling, target encoding) must be fitted on training data only, inside a pipeline, or test information leaks in. And high-degree polynomial features overfit quickly: tune the degree with a validation curve." },
        { t: "trick", text: "**Categories → one-hot. Text → TF-IDF. Dates → parts. Curves → polynomial/log. All inside a pipeline.**" },
        { t: "exam", items: ["What is feature engineering? Give examples.", "One-hot vs label encoding?", "Bag of words vs TF-IDF?", "How can a linear model fit a curve?", "Why must feature engineering be inside cross-validation?"] },
        { t: "recap", items: ["DictVectorizer / OneHotEncoder for categories", "CountVectorizer / TfidfVectorizer for text", "Derived features: ratios, date parts, indicators", "PolynomialFeatures lets linear models bend", "Fit transformations on training data only"] },
      ],
      quiz: [
        { q: "TF-IDF gives the highest weight to words that are…", options: ["Frequent in a document but rare overall", "Common everywhere", "Short", "Stop-words"], answer: 0, explain: "Distinctive words." },
        { q: "PolynomialFeatures(2) on x=3 (no bias) gives…", options: ["[3, 9]", "[1, 3, 9]", "[9]", "[3, 6]"], answer: 0, explain: "x and x²." },
        { q: "Why add a \"was missing\" indicator?", options: ["Missingness itself can be informative", "To delete rows", "To scale data", "It's required by sklearn"], answer: 0, explain: "E.g. an empty income field." },
        { q: "Label encoding (Patna=0, Pune=1, Delhi=2) is risky for linear models because…", options: ["It invents an order and distances between cities", "It's too slow", "It uses strings", "It creates too many columns"], answer: 0, explain: "Use one-hot instead." },
      ],
    },
    {
      id: "svm",
      title: "Support vector machines",
      oneLine: "An SVM finds the boundary with the widest margin between classes; only the closest points (the support vectors) decide it. C controls how many margin violations are allowed, and kernels (like RBF) let SVMs draw curved boundaries by implicitly mapping data into higher dimensions.",
      minutes: 20,
      blocks: [
        { t: "diagram", text: "   ○   ○                        ○ = class A, ● = class B\n ○   ○  ┊ ║ ┊    ●   ●\n   ○    ┊ ║ ┊  ●   ●   ●        ║ = decision boundary\n  ○  ○  ┊ ║ ┊     ●             ┊ = margin edges\n        ↑     ↑\n  support vectors: the points on the margin edges decide the boundary" },
        py("Linear vs RBF kernels, and the effect of C", src`
from sklearn.datasets import make_circles, make_moons
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X_c, y_c = make_circles(n_samples=400, factor=0.4, noise=0.08, random_state=0)   # a ring around a blob
for kernel in ["linear", "rbf"]:
    acc = cross_val_score(make_pipeline(StandardScaler(), SVC(kernel=kernel)), X_c, y_c, cv=5).mean()
    print(f"circles, {kernel:<6} kernel: accuracy {acc:.3f}")

X_m, y_m = make_moons(n_samples=400, noise=0.25, random_state=0)
for C in [0.01, 1, 100]:
    model = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=C)).fit(X_m, y_m)
    acc = cross_val_score(make_pipeline(StandardScaler(), SVC(kernel="rbf", C=C)), X_m, y_m, cv=5).mean()
    print(f"moons, C={C:<5}: support vectors {model[-1].n_support_.sum():>3}, CV accuracy {acc:.3f}")
`, "circles, linear kernel: accuracy 0.540\ncircles, rbf    kernel: accuracy 1.000\nmoons, C=0.01 : support vectors 400, CV accuracy 0.878\nmoons, C=1    : support vectors 112, CV accuracy 0.917\nmoons, C=100  : support vectors  72, CV accuracy 0.922"),
        { t: "table", head: ["Setting", "Small value", "Large value"], rows: [["C", "Wide, soft margin; many support vectors; may underfit", "Narrow, strict margin; fewer support vectors; may overfit"], ["gamma (RBF)", "Smooth, broad boundary", "Wiggly boundary around individual points"], ["kernel", "\"linear\": straight boundaries, fast on text", "\"rbf\": curved boundaries, the default"]] },
        { t: "analogy", text: "An SVM draws the widest possible road between two villages; only the houses at the road's edge (support vectors) decide where it goes. The kernel trick is like viewing the map from a hill: two groups mixed on flat ground can be separated cleanly when you add height." },
        { t: "trap", text: "SVMs need **scaled** features, and they get slow on large datasets (training time grows faster than the number of rows): for hundreds of thousands of rows, use `LinearSVC`, logistic regression or gradient boosting. Tune C and gamma together with a grid search." },
        { t: "trick", text: "**Widest margin; support vectors decide; scale features; C = strictness; RBF kernel for curves.**" },
        { t: "exam", items: ["What is a support vector machine?", "What are support vectors?", "What does C control?", "What is the kernel trick?", "When would you not use an SVM?"] },
        { t: "recap", items: ["SVM = maximum-margin boundary", "Only support vectors affect the boundary", "C trades margin width against errors", "Kernels (RBF) give non-linear boundaries", "Scale features; slow on very large data"] },
      ],
      quiz: [
        { q: "Which points determine an SVM's boundary?", options: ["The support vectors closest to it", "All points equally", "The farthest points", "The class means"], answer: 0, explain: "Points far from the margin don't matter." },
        { q: "A linear kernel on data shaped like a ring around a blob will likely…", options: ["Perform poorly", "Be perfect", "Fail to run", "Need no scaling"], answer: 0, explain: "A straight line can't separate a ring." },
        { q: "Increasing C usually…", options: ["Makes the margin stricter (risk of overfitting)", "Widens the margin", "Changes the kernel", "Removes scaling"], answer: 0, explain: "Fewer violations allowed." },
        { q: "The kernel trick lets SVMs…", options: ["Draw curved boundaries without computing new features explicitly", "Train without data", "Skip scaling", "Do clustering"], answer: 0, explain: "Implicit higher-dimensional mapping." },
      ],
    },
    {
      id: "manifold-learning",
      title: "Manifold learning: Isomap and t-SNE",
      oneLine: "PCA can only find flat (linear) structure. Manifold learning methods like Isomap and t-SNE find curved structure: they place points in 2-D so that neighbours in the original high-dimensional space stay neighbours. They're mainly for visualisation and exploration.",
      minutes: 18,
      blocks: [
        py("Unrolling a Swiss roll, and mapping digits", src`
import numpy as np
from scipy.stats import spearmanr
from sklearn.datasets import load_digits, make_swiss_roll
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, Isomap
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

X, t = make_swiss_roll(n_samples=1000, noise=0.05, random_state=0)   # a 2-D sheet rolled up in 3-D
for name, model in [("PCA", PCA(2)), ("Isomap", Isomap(n_neighbors=10, n_components=2))]:
    emb = model.fit_transform(X)
    rho = max(abs(spearmanr(emb[:, i], t).statistic) for i in range(2))
    print(f"{name:<6}: how well the 2-D map preserves position along the roll = {rho:.2f}")

digits = load_digits()
emb = TSNE(n_components=2, perplexity=30, random_state=0, init="pca").fit_transform(digits.data)
knn = cross_val_score(KNeighborsClassifier(5), emb, digits.target, cv=5).mean()
print(f"t-SNE map of 64-pixel digits: neighbours in the 2-D map share a label {knn:.0%} of the time")
`, "PCA   : how well the 2-D map preserves position along the roll = 0.20\nIsomap: how well the 2-D map preserves position along the roll = 1.00\nt-SNE map of 64-pixel digits: neighbours in the 2-D map share a label 98% of the time"),
        { t: "p", text: "PCA flattens the Swiss roll by squashing it, mixing points from different layers. Isomap follows the sheet's surface (distances along neighbours) and unrolls it, so position along the roll is preserved far better. On digits, t-SNE places images of the same digit in tight clusters in just two dimensions." },
        { t: "table", head: ["Method", "Keeps", "Use for"], rows: [["PCA", "Global linear structure (variance)", "Compression, preprocessing, quick plots"], ["Isomap", "Distances along the surface", "Curved structure, smooth manifolds"], ["t-SNE", "Local neighbourhoods", "Visualising clusters in high-dimensional data"], ["UMAP (umap-learn)", "Local + more global structure, faster", "Large datasets, embeddings"]] },
        { t: "analogy", text: "PCA is photographing a rolled-up carpet from above: layers overlap. Isomap unrolls the carpet on the floor first. t-SNE is a party organiser who seats friends next to each other: it gets groups right, but the distance between two tables means little." },
        { t: "trap", text: "t-SNE plots are easy to over-read: cluster sizes and the distances between clusters are not meaningful, results change with perplexity and the random seed, and it can't transform new points. Use it to explore, then confirm findings with proper models." },
        { t: "trick", text: "**Linear → PCA. Curved surface → Isomap. Cluster picture → t-SNE/UMAP (explore only).**" },
        { t: "exam", items: ["PCA vs t-SNE?", "What is a manifold?", "Why shouldn't you interpret distances between t-SNE clusters?", "When would you use Isomap?", "What is perplexity in t-SNE?"] },
        { t: "recap", items: ["Manifold learning finds curved low-dimensional structure", "Isomap preserves distances along neighbours", "t-SNE preserves local neighbourhoods; great pictures", "t-SNE distances between clusters aren't meaningful", "PCA first, manifold methods for exploration"] },
      ],
      quiz: [
        { q: "Which method can unroll a Swiss roll?", options: ["Isomap", "PCA", "Linear regression", "k-means"], answer: 0, explain: "It follows the surface." },
        { q: "t-SNE is mainly used for…", options: ["Visualising high-dimensional data", "Making predictions", "Scaling features", "Hypothesis tests"], answer: 0, explain: "Exploration, not modelling." },
        { q: "In a t-SNE plot, the distance between two clusters…", options: ["Isn't reliably meaningful", "Is the true distance", "Equals the correlation", "Shows the cluster size"], answer: 0, explain: "Only local structure is kept." },
        { q: "PCA can only capture…", options: ["Linear structure", "Curved structure", "Categorical data", "Time series"], answer: 0, explain: "It finds linear directions." },
      ],
    },
    {
      id: "gmm-kde",
      title: "Gaussian mixture models and kernel density estimation",
      oneLine: "A Gaussian mixture model describes data as a blend of several bell-shaped clusters, giving each point a probability of belonging to each one, and can generate new samples. Kernel density estimation (KDE) builds a smooth density by placing a small bump on every data point; it's used for smooth histograms and anomaly detection.",
      minutes: 20,
      blocks: [
        py("Soft clustering with a Gaussian mixture", src`
import numpy as np
from sklearn.mixture import GaussianMixture

rng = np.random.default_rng(0)
heights = np.concatenate([rng.normal(152, 6, 400), rng.normal(170, 7, 600)]).reshape(-1, 1)   # two groups mixed

for k in [1, 2, 3]:
    print(f"k={k}: BIC {GaussianMixture(k, random_state=0).fit(heights).bic(heights):8.1f}")

gmm = GaussianMixture(2, random_state=0).fit(heights)
order = np.argsort(gmm.means_.ravel())
print("means:", gmm.means_.ravel()[order].round(1), " weights:", gmm.weights_[order].round(2))
probs = gmm.predict_proba([[150], [161], [175]])[:, order]
print("P(group) for 150, 161, 175 cm:", probs.round(2).tolist())
new_samples, _ = gmm.sample(5)                         # a generative model: make new data
print("5 generated heights:", new_samples.ravel().round(0).tolist())
`, "k=1: BIC   7621.5\nk=2: BIC   7547.3\nk=3: BIC   7569.8\nmeans: [152.4 170.2]  weights: [0.43 0.57]\nP(group) for 150, 161, 175 cm: [[0.99, 0.01], [0.56, 0.44], [0.0, 1.0]]\n5 generated heights: [175.0, 180.0, 156.0, 161.0, 147.0]"),
        py("Kernel density estimation and anomaly scores", src`
import numpy as np
from sklearn.neighbors import KernelDensity

rng = np.random.default_rng(1)
amounts = np.concatenate([rng.normal(500, 80, 950), rng.normal(1500, 150, 50)]).reshape(-1, 1)   # card spends (₹)

kde = KernelDensity(kernel="gaussian", bandwidth=60).fit(amounts)
grid = np.linspace(0, 2200, 12).reshape(-1, 1)
density = np.exp(kde.score_samples(grid))
for x, d in zip(grid.ravel(), density):
    print(f"₹{x:>6.0f} {'#' * int(d * 25_000)}")

for amount in [520, 1500, 3000]:
    print(f"₹{amount}: log-density {kde.score_samples([[amount]])[0]:.1f}")   # very low = unusual
`, "₹     0\n₹   200 #\n₹   400 ###########################################################\n₹   600 ######################################################\n₹   800\n₹  1000\n₹  1200\n₹  1400 ###\n₹  1600 ##\n₹  1800\n₹  2000\n₹  2200\n₹520: log-density -5.6\n₹1500: log-density -9.1\n₹3000: log-density -199.1", "The density has a big peak around ₹500 and a small one around ₹1,500. A ₹3,000 spend sits where there's almost no density: an anomaly worth checking. The bandwidth controls smoothness (tune it with cross-validation, for example GridSearchCV on bandwidth)."),
        { t: "table", head: ["", "k-means", "Gaussian mixture", "KDE"], rows: [["Output", "Hard cluster labels", "Probabilities per cluster", "A smooth density"], ["Cluster shape", "Round, similar size", "Ellipses of any size and orientation", "No clusters, any shape"], ["Generates new data?", "No", "Yes (sample)", "Yes (sample)"], ["Choosing complexity", "Elbow / silhouette", "BIC / AIC", "Bandwidth by cross-validation"]] },
        { t: "analogy", text: "A Gaussian mixture is a chef who says a dish is \"70% North Indian, 30% South Indian\" rather than forcing one label. KDE is pouring a little sand on every data point: where many points are close, the sand piles into hills (high density)." },
        { t: "trap", text: "GMM results depend on the starting point, so use several initialisations (`n_init`) and a seed. With many dimensions, full covariance matrices need lots of data (try `covariance_type=\"diag\"`). In KDE, too small a bandwidth makes spiky noise and too large blurs real peaks." },
        { t: "trick", text: "**GMM = soft clusters + BIC + sampling. KDE = smooth density; low density = anomaly.**" },
        { t: "exam", items: ["k-means vs Gaussian mixture model?", "How do you choose the number of GMM components?", "What is kernel density estimation? What is bandwidth?", "How can density estimates detect anomalies?", "What is a generative model?"] },
        { t: "recap", items: ["GMM: mixture of Gaussians, soft assignments", "Choose components with BIC (lower is better)", "GMMs can sample new data", "KDE: a smooth density from bumps on each point", "Bandwidth controls smoothness; low density flags anomalies"] },
      ],
      quiz: [
        { q: "What does a GMM give that k-means doesn't?", options: ["Probabilities of belonging to each cluster", "Faster training always", "Labels for training", "A decision tree"], answer: 0, explain: "Soft clustering." },
        { q: "With BIC, the best number of components has…", options: ["The lowest BIC", "The highest BIC", "BIC = 0", "The most components"], answer: 0, explain: "BIC penalises complexity." },
        { q: "In KDE, a very large bandwidth…", options: ["Over-smooths and hides peaks", "Makes spiky noise", "Has no effect", "Removes outliers"], answer: 0, explain: "Too small makes spikes." },
        { q: "A transaction in a region of very low density is…", options: ["A potential anomaly", "Certainly fraud", "The most common", "A cluster centre"], answer: 0, explain: "Worth checking, not proof." },
      ],
    },
  ],
};
