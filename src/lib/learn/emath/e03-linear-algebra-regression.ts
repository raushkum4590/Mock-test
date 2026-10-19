import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Essential Math for Data Science, chapters 4–6: linear algebra, linear regression, logistic regression. */
export const EM05_LINEAR_ALGEBRA: LearnModule = {
  id: "linear-algebra",
  title: "Linear algebra",
  titleHi: "लीनियर अलजेब्रा",
  blurb: "See matrices as transformations of space: vectors, span and linear dependence; basis vectors and matrix-vector multiplication; matrix multiplication as combining transformations; determinants; special matrices; solving systems of equations; and eigenvectors and eigenvalues.",
  lessons: [
    {
      id: "vectors-span",
      title: "Vectors, span and linear dependence",
      oneLine: "A vector is an arrow with a direction and a length, stored as a list of numbers. Add vectors tip to tail, scale them by multiplying. The span of some vectors is every point you can reach by combining them; if one vector adds no new direction, the set is linearly dependent.",
      minutes: 18,
      blocks: [
        py("Adding, scaling and checking dependence", src`
import numpy as np

v = np.array([3, 2])
w = np.array([2, -1])
print("v + w =", v + w, "| 2v =", 2 * v, "| -0.5w =", -0.5 * w)
print("length of v:", round(float(np.linalg.norm(v)), 3))

independent = np.array([[3, 2], [2, -1]])          # columns point in different directions
dependent = np.array([[2, 4], [1, 2]])             # second column = 2 × first column
for name, m in [("independent", independent), ("dependent", dependent)]:
    print(f"{name:<12} determinant {np.linalg.det(m):6.2f}   rank {np.linalg.matrix_rank(m)}")
`, "v + w = [5 1] | 2v = [6 4] | -0.5w = [-1.   0.5]\nlength of v: 3.606\nindependent  determinant  -7.00   rank 2\ndependent    determinant   0.00   rank 1"),
        { t: "table", head: ["Idea", "Meaning", "Data-science use"], rows: [["Vector", "Ordered numbers / an arrow", "One data row, one set of weights"], ["Linear combination", "a·v + b·w", "A prediction: Σ weight × feature"], ["Span", "All points reachable by combinations", "What a set of features can express"], ["Linear dependence", "One vector is a combination of others", "Redundant features (multicollinearity)"], ["Rank", "Number of independent directions", "How much real information the columns hold"]] },
        { t: "analogy", text: "Two vectors pointing in different directions are like being allowed to walk north-east and east: by combining them you can reach any spot on the map (they span the plane). If the second direction is just \"twice as far north-east\", you're stuck on one line: they're dependent." },
        { t: "trap", text: "Dependent columns break many algorithms: the matrix can't be inverted and regression coefficients become unstable or undefined. In data, this happens with duplicated features (price in ₹ and in $) or the dummy-variable trap. Check the rank or the determinant." },
        { t: "trick", text: "**Different directions → independent → full rank → det ≠ 0. Same line → dependent → det = 0.**" },
        { t: "exam", items: ["What is a vector?", "What is the span of a set of vectors?", "What does linear dependence mean? Why is it a problem in regression?", "What is the rank of a matrix?"] },
        { t: "recap", items: ["Vectors add tip to tail and scale by multiplication", "Linear combinations reach the span", "Dependent vectors add no new direction", "det = 0 or rank < columns → dependent", "Redundant features = dependence"] },
      ],
      quiz: [
        { q: "[1, 2] + [3, 4] = ?", options: ["[4, 6]", "[3, 8]", "[2, 2]", "10"], answer: 0, explain: "Element by element." },
        { q: "Are [1, 2] and [2, 4] linearly independent?", options: ["No, one is 2× the other", "Yes", "Only in 3-D", "Can't tell"], answer: 0, explain: "Same direction." },
        { q: "A square matrix with dependent columns has determinant…", options: ["0", "1", "Negative", "Infinite"], answer: 0, explain: "It squashes space flat." },
        { q: "Two features that are exact copies cause…", options: ["Linear dependence (multicollinearity)", "Better models", "Higher rank", "Nothing"], answer: 0, explain: "Drop one of them." },
      ],
    },
    {
      id: "transformations",
      title: "Linear transformations and matrix multiplication",
      oneLine: "A matrix is a transformation: its columns say where the basis vectors î = [1, 0] and ĵ = [0, 1] land. Multiplying a matrix by a vector moves that vector accordingly. Multiplying two matrices combines two transformations into one (order matters).",
      minutes: 20,
      blocks: [
        py("Matrices move space", src`
import numpy as np

v = np.array([1, 2])
stretch = np.array([[2, 0],                  # î → [2, 0], ĵ → [0, 1]: stretch x by 2
                    [0, 1]])
rotate90 = np.array([[0, -1],                # î → [0, 1], ĵ → [-1, 0]: rotate 90° anticlockwise
                     [1, 0]])
shear = np.array([[1, 1],                    # ĵ → [1, 1]: slant
                  [0, 1]])
for name, m in [("stretch", stretch), ("rotate 90°", rotate90), ("shear", shear)]:
    print(f"{name:<11} {v} → {m @ v}")

combined = rotate90 @ shear                  # first shear, THEN rotate (read right to left)
print("rotate after shear:", combined @ v, "| step by step:", rotate90 @ (shear @ v))
print("shear after rotate:", (shear @ rotate90) @ v, "→ order matters")
`, "stretch     [1 2] → [2 2]\nrotate 90°  [1 2] → [-2  1]\nshear       [1 2] → [3 2]\nrotate after shear: [-2  3] | step by step: [-2  3]\nshear after rotate: [-1  1] → order matters"),
        { t: "formula", items: [["Matrix × vector", "[[a, b], [c, d]] · [x, y] = x·[a, c] + y·[b, d]  (a combination of the columns)"], ["Matrix × matrix", "(A·B)v = A(Bv): apply B first, then A"], ["Shapes", "(m × k)·(k × n) → (m × n)"]] },
        { t: "p", text: "Every layer of a neural network is \"multiply by a weight matrix, then bend with an activation\"; PCA is a rotation; scaling features is a stretch. Thinking of matrices as transformations makes all of these less mysterious." },
        { t: "analogy", text: "A matrix is a recipe for moving a grid drawn on rubber: it tells you where the two arrows î and ĵ end up, and every other point follows along. Doing two recipes one after the other is the same as one combined recipe: the matrix product." },
        { t: "trap", text: "`*` multiplies element by element in NumPy; use `@` for matrix multiplication. And A @ B ≠ B @ A in general: the rightmost matrix acts first." },
        { t: "trick", text: "**Columns = where î and ĵ land. A @ B = do B, then A.**" },
        { t: "exam", items: ["What is a linear transformation?", "What do the columns of a matrix represent?", "Why is matrix multiplication not commutative?", "How are linear transformations used in neural networks and PCA?"] },
        { t: "recap", items: ["A matrix moves the basis vectors; everything follows", "Matrix × vector = combination of columns", "Matrix × matrix = combined transformation", "Order matters: rightmost acts first", "Use @, not *, in NumPy"] },
      ],
      quiz: [
        { q: "[[2, 0], [0, 3]] @ [1, 1] = ?", options: ["[2, 3]", "[3, 2]", "[1, 1]", "[2, 0]"], answer: 0, explain: "Stretch x by 2, y by 3." },
        { q: "The first column of a 2×2 matrix shows…", options: ["Where î = [1, 0] lands", "Where ĵ lands", "The determinant", "The inverse"], answer: 0, explain: "The second column is ĵ." },
        { q: "(A @ B) @ v applies…", options: ["B first, then A", "A first, then B", "Both at once, any order", "Neither"], answer: 0, explain: "Right to left." },
        { q: "In NumPy, matrix multiplication is…", options: ["@", "*", "x", "**"], answer: 0, explain: "* is element-wise." },
      ],
    },
    {
      id: "determinants-special",
      title: "Determinants and special matrices",
      oneLine: "The determinant is how much a transformation scales area (or volume): 2 means areas double, 0 means space is squashed flat (no inverse), negative means it's flipped. Special matrices (identity, inverse, diagonal, triangular, sparse) have shortcuts that make computation faster.",
      minutes: 16,
      blocks: [
        py("Determinants and special matrices", src`
import numpy as np
from scipy import sparse

A = np.array([[3, 1], [0, 2]])
print("det A:", round(float(np.linalg.det(A)), 2), "→ areas scale by 6")
print("det of a flip:", round(float(np.linalg.det(np.array([[0, 1], [1, 0]]))), 2))
print("det of a squash:", round(float(np.linalg.det(np.array([[1, 2], [2, 4]]))), 2))

I = np.eye(2)
A_inv = np.linalg.inv(A)
print("A @ A⁻¹ = I:", np.allclose(A @ A_inv, I))
print("inverse:", A_inv.round(3).tolist())
print("diagonal matrix:", np.diag([2, 5]).tolist())
print("upper triangular:", np.triu(np.arange(1, 10).reshape(3, 3)).tolist())

ratings = sparse.random(10_000, 5_000, density=0.001, random_state=0, format="csr")   # mostly zeros
print("non-zeros stored:", ratings.nnz, "of", 10_000 * 5_000, "cells")
`, "det A: 6.0 → areas scale by 6\ndet of a flip: -1.0\ndet of a squash: 0.0\nA @ A⁻¹ = I: True\ninverse: [[0.333, -0.167], [0.0, 0.5]]\ndiagonal matrix: [[2, 0], [0, 5]]\nupper triangular: [[1, 2, 3], [0, 5, 6], [0, 0, 9]]\nnon-zeros stored: 50000 of 50000000 cells"),
        { t: "table", head: ["Matrix", "Property", "Why it matters"], rows: [["Identity I", "1s on the diagonal; A·I = A", "The \"do nothing\" transformation"], ["Inverse A⁻¹", "A·A⁻¹ = I (only if det ≠ 0)", "Undo a transformation; solve equations"], ["Diagonal", "Non-zero only on the diagonal", "Pure stretching; trivial to invert"], ["Triangular", "Zeros above (or below) the diagonal", "Fast solving (used inside solvers)"], ["Sparse", "Mostly zeros", "User–item ratings, text: store only non-zeros"]] },
        { t: "analogy", text: "The determinant is the zoom factor on a photocopier: 2 doubles every shape's area, 0.5 halves it, and 0 squashes the page into a line, after which you can't recover the original (no inverse)." },
        { t: "trap", text: "A determinant very close to 0 (like 1e-15) usually means the matrix is singular but floating-point noise hides it: inverting it gives huge, meaningless numbers. Prefer `np.linalg.solve` or least-squares solvers to explicit inverses." },
        { t: "trick", text: "**det = area scale; det 0 → no inverse. Sparse data → scipy.sparse.**" },
        { t: "exam", items: ["What does the determinant represent?", "When does a matrix have no inverse?", "What is a sparse matrix and where does it appear?", "Why avoid computing inverses directly?"] },
        { t: "recap", items: ["det = scaling of area/volume", "det 0 → singular, no inverse", "Negative det → orientation flipped", "Identity, inverse, diagonal, triangular, sparse", "Use solve(), not inv(), in practice"] },
      ],
      quiz: [
        { q: "det [[2, 0], [0, 3]] = ?", options: ["6", "5", "0", "1"], answer: 0, explain: "Product of the diagonal." },
        { q: "A matrix with det 0…", options: ["Has no inverse", "Is the identity", "Doubles areas", "Is always sparse"], answer: 0, explain: "It squashes space flat." },
        { q: "A user × movie ratings table with mostly empty cells is best stored as…", options: ["A sparse matrix", "A dense array", "A string", "A diagonal matrix"], answer: 0, explain: "Store only the non-zeros." },
        { q: "A @ np.linalg.inv(A) equals…", options: ["The identity matrix", "A", "Zero", "A²"], answer: 0, explain: "By definition." },
      ],
    },
    {
      id: "systems-eigen",
      title: "Systems of equations, eigenvectors and eigenvalues",
      oneLine: "Many problems are systems of linear equations, written A·x = b and solved with an inverse or (better) a solver. An eigenvector is a direction a transformation only stretches, never turns; its eigenvalue is the stretch factor. Eigen-decomposition powers PCA and many algorithms.",
      minutes: 22,
      blocks: [
        py("Solving a system three ways", src`
import numpy as np
import sympy as sp

# 4x + 2y + 4z = 44,  5x + 3y + 7z = 56,  9x + 3y + 6z = 72
A = np.array([[4, 2, 4], [5, 3, 7], [9, 3, 6]])
b = np.array([44, 56, 72])
print("inverse method:", (np.linalg.inv(A) @ b).round(6))
print("np.linalg.solve:", np.linalg.solve(A, b).round(6))
x, y, z = sp.symbols("x y z")
print("SymPy (exact):", sp.solve([4*x + 2*y + 4*z - 44, 5*x + 3*y + 7*z - 56, 9*x + 3*y + 6*z - 72], [x, y, z]))
`, "inverse method: [ 2. 34. -8.]\nnp.linalg.solve: [ 2. 34. -8.]\nSymPy (exact): {x: 2, y: 34, z: -8}"),
        py("Eigenvectors: directions that only stretch", src`
import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 2.0]])
values, vectors = np.linalg.eigh(A)               # eigh: for symmetric matrices, real results
order = np.argsort(values)[::-1]
values, vectors = values[order], vectors[:, order]
print("eigenvalues:", values.round(3).tolist())
for lam, v in zip(values, vectors.T):
    print(f"A @ {v.round(3).tolist()} = {(A @ v).round(3).tolist()}  =  {lam:.0f} × the same vector")

rebuilt = vectors @ np.diag(values) @ np.linalg.inv(vectors)     # A = Q Λ Q⁻¹
print("rebuilt from its eigen-parts:", np.allclose(rebuilt, A))

rng = np.random.default_rng(0)                                    # the link to PCA
data = rng.multivariate_normal([0, 0], [[3, 2], [2, 3]], 2000)
cov_values, cov_vectors = np.linalg.eigh(np.cov(data.T))
print("share of variance on the main direction:", round(float(cov_values.max() / cov_values.sum()), 2))
`, "eigenvalues: [3.0, 1.0]\nA @ [0.707, 0.707] = [2.121, 2.121]  =  3 × the same vector\nA @ [-0.707, 0.707] = [-0.707, 0.707]  =  1 × the same vector\nrebuilt from its eigen-parts: True\nshare of variance on the main direction: 0.84"),
        { t: "p", text: "The eigenvectors of A point along the diagonals: [1, 1] gets stretched 3×, and [1, −1] stays the same length (eigenvalue 1). For a covariance matrix, the top eigenvector is the direction of greatest spread: that is exactly PCA's first principal component." },
        { t: "analogy", text: "Spin a globe: every point moves except those on the axis. The axis is an eigenvector of the rotation. For a stretching transformation, eigenvectors are the directions that only get longer or shorter, never pointed somewhere new." },
        { t: "trap", text: "Eigenvectors are only defined up to scale and sign ([1, 1] and [−0.707, −0.707] are the same direction), so don't compare them across libraries by raw numbers. For symmetric matrices (like covariance), use `np.linalg.eigh`, which is faster and more stable." },
        { t: "trick", text: "**Solve A·x = b with np.linalg.solve. Eigenvector: A·v = λ·v. Covariance eigenvectors = PCA.**" },
        { t: "exam", items: ["How do you solve a system of linear equations with matrices?", "What are eigenvectors and eigenvalues?", "What is eigen-decomposition?", "How are eigenvectors used in PCA?", "eig vs eigh?"] },
        { t: "recap", items: ["A·x = b: x = A⁻¹b, better np.linalg.solve", "SymPy gives exact solutions", "A·v = λ·v defines eigenpairs", "A = QΛQ⁻¹ rebuilds the matrix", "Covariance eigenvectors are the principal components"] },
      ],
      quiz: [
        { q: "For A·v = λ·v, v is…", options: ["An eigenvector", "The determinant", "The inverse", "A basis change"], answer: 0, explain: "λ is its eigenvalue." },
        { q: "Best NumPy function to solve A·x = b?", options: ["np.linalg.solve(A, b)", "np.linalg.inv(b) @ A", "A * b", "np.dot(b, A)"], answer: 0, explain: "Faster and more stable than inverting." },
        { q: "The first principal component is…", options: ["The top eigenvector of the covariance matrix", "The mean", "The largest feature", "A random direction"], answer: 0, explain: "The direction of greatest variance." },
        { q: "Eigenvalue 1 means the eigenvector…", options: ["Keeps its length", "Doubles", "Flips", "Disappears"], answer: 0, explain: "Stretch factor 1." },
      ],
    },
  ],
};

export const EM06_LINEAR_REGRESSION: LearnModule = {
  id: "linear-regression",
  title: "Linear regression",
  titleHi: "लीनियर रिग्रेशन",
  blurb: "Fit a line through data three ways (closed-form formulas, matrix decomposition, gradient descent), understand residuals, overfitting and stochastic gradient descent, then judge the line: correlation, statistical significance, R², standard error, prediction intervals, train/test splits and multiple regression.",
  lessons: [
    {
      id: "fit-and-residuals",
      title: "A basic linear regression, residuals and squared errors",
      oneLine: "Linear regression fits y = m·x + b through data. Each residual is the vertical gap between a point and the line; the best line minimises the sum of squared residuals. Squaring makes all errors positive and punishes big misses more.",
      minutes: 18,
      blocks: [
        py("Experience vs salary", src`
import numpy as np
from scipy.stats import linregress
from sklearn.linear_model import LinearRegression

years = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
salary = np.array([3.2, 4.1, 4.6, 5.9, 6.3, 7.4, 7.9, 9.1, 9.6, 10.8])   # ₹ lakh per year

fit = linregress(years, salary)
print(f"SciPy:   salary = {fit.slope:.3f} × years + {fit.intercept:.3f}")
model = LinearRegression().fit(years.reshape(-1, 1), salary)
print(f"sklearn: salary = {model.coef_[0]:.3f} × years + {model.intercept_:.3f}")

predicted = fit.slope * years + fit.intercept
residuals = salary - predicted
print("residuals:", residuals.round(2).tolist())
print("sum of residuals:", round(float(residuals.sum()), 6), "| sum of squared residuals:", round(float((residuals ** 2).sum()), 4))
print("prediction for 12 years:", round(fit.slope * 12 + fit.intercept, 2), "lakh")
`, "SciPy:   salary = 0.827 × years + 2.340\nsklearn: salary = 0.827 × years + 2.340\nresiduals: [0.03, 0.11, -0.22, 0.25, -0.18, 0.1, -0.23, 0.14, -0.19, 0.19]\nsum of residuals: -0.0 | sum of squared residuals: 0.3076\nprediction for 12 years: 12.27 lakh"),
        { t: "p", text: "Residuals of a least-squares line always add up to (essentially) zero: points above and below balance out. That's why we square them: the **sum of squared errors** is what the best line makes as small as possible." },
        { t: "analogy", text: "The regression line is a tightrope through a crowd of points; each residual is the length of a rope from a person to the tightrope. Least squares positions the tightrope so the total \"pull\" (squared rope lengths) is smallest." },
        { t: "trap", text: "Don't extrapolate far: a line fitted on 1–10 years of experience says little about 40 years. And a good fit doesn't mean causation: experience may stand in for skills, role or city." },
        { t: "trick", text: "**Residual = actual − predicted. Best line = minimum Σ residual².**" },
        { t: "exam", items: ["What is a residual?", "Why square the residuals?", "What does least squares minimise?", "Why don't we minimise the plain sum of residuals?"] },
        { t: "recap", items: ["y = m·x + b", "Residual = actual − predicted", "Residuals sum to ~0 for the least-squares line", "Minimise the sum of squared residuals", "scipy.stats.linregress and sklearn LinearRegression agree"] },
      ],
      quiz: [
        { q: "Actual 7, predicted 5.5. Residual?", options: ["1.5", "−1.5", "12.5", "2.25"], answer: 0, explain: "Actual − predicted." },
        { q: "Least squares minimises…", options: ["The sum of squared residuals", "The sum of residuals", "The slope", "The number of points"], answer: 0, explain: "Squares can't cancel out." },
        { q: "The residuals of a least-squares line sum to about…", options: ["0", "1", "The slope", "n"], answer: 0, explain: "Above and below balance." },
        { q: "Using a line fitted on ages 20–40 to predict age 80 is…", options: ["Risky extrapolation", "Always fine", "Interpolation", "Required"], answer: 0, explain: "Outside the data's range." },
      ],
    },
    {
      id: "best-fit-three-ways",
      title: "Finding the best line: formulas, matrices and gradient descent",
      oneLine: "Three routes reach the same line: closed-form formulas for slope and intercept, matrix methods that solve (XᵀX)β = Xᵀy (with an inverse or, more stably, a QR decomposition), and gradient descent, which walks downhill on the error. Stochastic gradient descent uses one random point (or a small batch) per step.",
      minutes: 24,
      blocks: [
        py("The same line, four ways", src`
import numpy as np

years = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
salary = np.array([3.2, 4.1, 4.6, 5.9, 6.3, 7.4, 7.9, 9.1, 9.6, 10.8])
n = len(years)

# 1) Closed-form formulas
m = (n * np.sum(years * salary) - years.sum() * salary.sum()) / (n * np.sum(years ** 2) - years.sum() ** 2)
b = salary.mean() - m * years.mean()
print(f"formulas:        m={m:.4f} b={b:.4f}")

# 2) Inverse matrix: β = (XᵀX)⁻¹ Xᵀ y
X = np.column_stack([years, np.ones(n)])
beta = np.linalg.inv(X.T @ X) @ X.T @ salary
print(f"inverse matrix:  m={beta[0]:.4f} b={beta[1]:.4f}")

# 3) QR decomposition (more numerically stable)
Q, R = np.linalg.qr(X)
beta_qr = np.linalg.solve(R, Q.T @ salary)
print(f"QR:              m={beta_qr[0]:.4f} b={beta_qr[1]:.4f}")

# 4) Gradient descent on the sum of squared errors
m_gd = b_gd = 0.0
lr = 0.001
for _ in range(100_000):
    error = (m_gd * years + b_gd) - salary
    m_gd -= lr * 2 * np.sum(error * years)              # ∂SSE/∂m
    b_gd -= lr * 2 * np.sum(error)                      # ∂SSE/∂b
print(f"gradient descent: m={m_gd:.4f} b={b_gd:.4f}")
`, "formulas:        m=0.8273 b=2.3400\ninverse matrix:  m=0.8273 b=2.3400\nQR:              m=0.8273 b=2.3400\ngradient descent: m=0.8273 b=2.3400"),
        py("Stochastic gradient descent", src`
import numpy as np

rng = np.random.default_rng(0)
years = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
salary = np.array([3.2, 4.1, 4.6, 5.9, 6.3, 7.4, 7.9, 9.1, 9.6, 10.8])

m = b = 0.0
lr = 0.002
for step in range(1, 60_001):
    i = rng.integers(len(years))                        # one random point per step
    error = (m * years[i] + b) - salary[i]
    m -= lr * 2 * error * years[i]
    b -= lr * 2 * error
    if step in (10, 1000, 60_000):
        print(f"step {step:>6}: m={m:.3f} b={b:.3f}")
`, "step     10: m=0.838 b=0.152\nstep   1000: m=0.953 b=1.378\nstep  60000: m=0.827 b=2.341"),
        { t: "table", head: ["Method", "Pros", "Cons"], rows: [["Closed-form formulas", "Instant, exact", "Only for simple cases"], ["Matrix (inverse / QR)", "Exact for many features; QR is stable", "Slow for millions of features; inverse can be unstable"], ["Gradient descent", "Works for any differentiable model and huge data", "Needs a learning rate and many steps"], ["Stochastic GD", "Cheap steps, scales to massive data, used in deep learning", "Noisy path; ends near (not exactly at) the minimum"]] },
        { t: "analogy", text: "Closed-form is looking up the answer in a table. The matrix method is solving the equation on paper. Gradient descent is walking downhill in the fog, one careful step at a time. SGD is the same walk, but you only feel the slope under one foot each step: faster, a bit wobbly." },
        { t: "trap", text: "Gradient descent with too large a learning rate diverges (the numbers blow up); too small and it crawls. Scale features first so one learning rate suits all weights. And never invert XᵀX when features are nearly dependent: use QR / lstsq / a library." },
        { t: "trick", text: "**Same answer, different roads: formulas, (XᵀX)⁻¹Xᵀy or QR, gradient descent, SGD.**" },
        { t: "exam", items: ["How can you fit a linear regression without gradient descent?", "Why is QR decomposition preferred over the inverse?", "Explain gradient descent for linear regression.", "Batch vs stochastic gradient descent?", "What happens with a learning rate that's too large?"] },
        { t: "recap", items: ["Closed-form formulas for simple regression", "Normal equations: β = (XᵀX)⁻¹Xᵀy", "QR is the stable matrix route", "Gradient descent follows −∂SSE/∂m, −∂SSE/∂b", "SGD: one random point per step"] },
      ],
      quiz: [
        { q: "In β = (XᵀX)⁻¹Xᵀy, the column of 1s in X gives…", options: ["The intercept", "The slope", "The residuals", "The learning rate"], answer: 0, explain: "It multiplies b." },
        { q: "Gradient descent updates m by…", options: ["Subtracting learning rate × ∂error/∂m", "Adding the error", "Setting it to 0", "Dividing by n"], answer: 0, explain: "Step against the slope." },
        { q: "SGD uses, per step…", options: ["One random point (or small batch)", "All points", "No data", "Only the first point"], answer: 0, explain: "Cheap, noisy steps." },
        { q: "Why prefer QR over inverting XᵀX?", options: ["Better numerical stability", "It's the only exact method", "It needs no data", "It's always faster for 1 feature"], answer: 0, explain: "Avoids amplifying rounding errors." },
      ],
    },
    {
      id: "significance-r2-intervals",
      title: "Correlation, significance, R², standard error and prediction intervals",
      oneLine: "How good is the line? The correlation r measures the strength of the linear relationship, and a t-test says whether it could be chance. R² is the share of variation explained, the standard error of the estimate is the typical prediction error, and a prediction interval gives a range for a new individual value.",
      minutes: 22,
      blocks: [
        py("Judging the regression", src`
import numpy as np
from scipy import stats

years = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
salary = np.array([3.2, 4.1, 4.6, 5.9, 6.3, 7.4, 7.9, 9.1, 9.6, 10.8])
n = len(years)

r = np.corrcoef(years, salary)[0, 1]
t_stat = r / np.sqrt((1 - r ** 2) / (n - 2))               # is r different from 0?
p_value = 2 * stats.t.sf(abs(t_stat), df=n - 2)
print(f"r = {r:.4f}, t = {t_stat:.2f}, p = {p_value:.2e}")

fit = stats.linregress(years, salary)
pred = fit.slope * years + fit.intercept
r2 = 1 - np.sum((salary - pred) ** 2) / np.sum((salary - salary.mean()) ** 2)
se_est = np.sqrt(np.sum((salary - pred) ** 2) / (n - 2))   # standard error of the estimate
print(f"R² = {r2:.4f} (= r² {r ** 2:.4f}), standard error of estimate = {se_est:.3f} lakh")

x0 = 12                                                    # a new person with 12 years
t_crit = stats.t.ppf(0.975, df=n - 2)
margin = t_crit * se_est * np.sqrt(1 + 1 / n + (x0 - years.mean()) ** 2 / np.sum((years - years.mean()) ** 2))
y0 = fit.slope * x0 + fit.intercept
print(f"95% prediction interval at {x0} years: {y0 - margin:.2f} to {y0 + margin:.2f} lakh")
`, "r = 0.9973, t = 38.32, p = 2.36e-10\nR² = 0.9946 (= r² 0.9946), standard error of estimate = 0.196 lakh\n95% prediction interval at 12 years: 11.69 to 12.84 lakh"),
        { t: "table", head: ["Measure", "Answers", "Here"], rows: [["r", "How strong and which direction?", "Very strong, positive"], ["p-value for r", "Could this correlation be chance?", "Essentially no"], ["R²", "Share of salary variation explained", "About 99%"], ["Standard error of estimate", "Typical size of a prediction error", "A few tenths of a lakh"], ["Prediction interval", "Range for ONE new person's value", "Wider further from the data's centre"]] },
        { t: "analogy", text: "R² tells you how much of the up-and-down of salaries the line explains. The standard error is how far off the line individual people typically are. A prediction interval is the honest answer to \"what will this new person earn?\": a range, not a single number." },
        { t: "trap", text: "A tiny p-value with lots of data can come with a useless R² (statistically significant but practically weak). R² near 1 on 10 tidy points isn't typical of real data. Prediction intervals assume errors are roughly normal with constant spread; check the residuals." },
        { t: "trick", text: "**r → strength, p → is it real, R² → share explained, SE → typical error, PI → range for one new value.**" },
        { t: "exam", items: ["How do you test whether a correlation is significant?", "What is R²? How does it relate to r?", "What is the standard error of the estimate?", "Prediction interval vs confidence interval?", "Why do prediction intervals widen away from the mean of x?"] },
        { t: "recap", items: ["r: strength/direction; t-test with n − 2 df", "R² = 1 − SSE/SST (= r² for one feature)", "SE of estimate = √(SSE / (n − 2))", "Prediction interval uses t × SE × √(1 + 1/n + …)", "Intervals widen far from the data's centre"] },
      ],
      quiz: [
        { q: "With one feature, R² equals…", options: ["r²", "r", "2r", "1 − r"], answer: 0, explain: "The squared correlation." },
        { q: "The correlation t-test uses how many degrees of freedom?", options: ["n − 2", "n", "n − 1", "2"], answer: 0, explain: "Two parameters were estimated." },
        { q: "A prediction interval is for…", options: ["One new individual value", "The mean only", "The slope", "The residuals"], answer: 0, explain: "So it's wider than a CI for the mean." },
        { q: "Prediction intervals are narrowest…", options: ["Near the mean of x", "At the extremes", "Everywhere equal", "At x = 0"], answer: 0, explain: "The (x0 − x̄)² term grows away from the centre." },
      ],
    },
    {
      id: "overfitting-train-test-multiple",
      title: "Overfitting, train/test splits and multiple regression",
      oneLine: "A model that hugs every training point (overfitting) predicts new data badly. Holding out a test set, or rotating it with k-fold cross-validation, measures real performance. Multiple linear regression uses several features at once: y = b + m₁x₁ + m₂x₂ + …",
      minutes: 20,
      blocks: [
        py("Overfitting, cross-validation and two features", src`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

rng = np.random.default_rng(1)
x = rng.uniform(0, 10, 30).reshape(-1, 1)
y = 2 * x.ravel() + 5 + rng.normal(0, 3, 30)            # truly a straight line + noise
X_tr, X_te, y_tr, y_te = train_test_split(x, y, test_size=0.5, random_state=0)   # only 15 training points
for degree in [1, 12]:
    model = make_pipeline(PolynomialFeatures(degree), StandardScaler(), LinearRegression()).fit(X_tr, y_tr)
    print(f"degree {degree}: train R² {model.score(X_tr, y_tr):.3f}   test R² {model.score(X_te, y_te):.3f}")

folds = KFold(3, shuffle=True, random_state=7)
print("3-fold CV R² of the line:", cross_val_score(LinearRegression(), x, y, cv=folds).round(3).tolist())

age = rng.uniform(1, 30, 200)                            # multiple regression: flat price from two features
area = rng.uniform(500, 2000, 200)
price = 20 + 0.05 * area - 0.8 * age + rng.normal(0, 5, 200)
multi = LinearRegression().fit(np.column_stack([area, age]), price)
print(f"price = {multi.intercept_:.2f} + {multi.coef_[0]:.4f} × area + ({multi.coef_[1]:.3f}) × age")
`, "degree 1: train R² 0.834   test R² 0.768\ndegree 12: train R² 0.906   test R² 0.308\n3-fold CV R² of the line: [0.839, 0.922, 0.721]\nprice = 20.66 + 0.0493 × area + (-0.779) × age"),
        { t: "p", text: "The degree-12 curve beats the line on the training data but loses on the test data: it fitted the noise. Cross-validation repeats the train/test check on several splits to make the estimate more reliable. In the multiple regression, each coefficient is the effect of one feature with the other held fixed, recovering roughly 0.05 per sq ft and −0.8 per year of age." },
        { t: "analogy", text: "Overfitting is a student who memorised the answer key: perfect in practice, lost in the real exam. The test set is the real exam; cross-validation is several mock exams." },
        { t: "trap", text: "Never tune a model on the test set and then report that score. Shuffle before splitting if rows are ordered. In multiple regression, correlated features make individual coefficients unstable even when predictions are fine." },
        { t: "trick", text: "**Judge on unseen data. Simple until proven otherwise. Each coefficient = effect with others held fixed.**" },
        { t: "exam", items: ["What is overfitting? How do you detect it?", "Why split into train and test sets?", "What is k-fold cross-validation?", "How do you interpret coefficients in multiple regression?", "What is multicollinearity?"] },
        { t: "recap", items: ["Flexible models can fit noise", "Train/test split measures real performance", "k-fold CV gives a more stable estimate", "Multiple regression: several features at once", "Coefficients: effects holding other features fixed"] },
      ],
      quiz: [
        { q: "Train R² 0.99, test R² 0.40. This is…", options: ["Overfitting", "Underfitting", "A perfect model", "Impossible"], answer: 0, explain: "It memorised the noise." },
        { q: "In 3-fold CV, each row is used for testing…", options: ["Once", "Three times", "Never", "Twice"], answer: 0, explain: "And for training twice." },
        { q: "price = 20 + 0.05·area − 0.8·age. Effect of 10 more years of age?", options: ["−8", "−0.8", "+8", "0.5"], answer: 0, explain: "10 × −0.8, area held fixed." },
        { q: "Why shuffle before splitting?", options: ["Ordered rows would make train and test differ systematically", "It speeds up training", "sklearn requires it", "To remove outliers"], answer: 0, explain: "Fair, representative splits." },
      ],
    },
  ],
};

export const EM07_LOGISTIC_REGRESSION: LearnModule = {
  id: "logistic-regression",
  title: "Logistic regression and classification",
  titleHi: "लॉजिस्टिक रिग्रेशन और क्लासिफ़िकेशन",
  blurb: "Predict probabilities for yes/no outcomes: the logistic function, fitting by maximum likelihood and gradient descent, multivariable models and log-odds, pseudo-R² and p-values, then evaluation with confusion matrices, Bayes' theorem, ROC/AUC and class imbalance.",
  lessons: [
    {
      id: "logistic-mle",
      title: "The logistic function and fitting by maximum likelihood",
      oneLine: "The logistic (sigmoid) function squashes any number into a probability between 0 and 1: p = 1 / (1 + e^−(b₀ + b₁x)). The best b₀ and b₁ are those that make the observed outcomes most likely (maximum likelihood), found with gradient descent.",
      minutes: 22,
      blocks: [
        py("Will a patient recover? Two ways to fit", src`
import numpy as np
from sklearn.linear_model import LogisticRegression

dose = np.array([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8])   # mg
recovered = np.array([0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1])

sk = LogisticRegression(C=1e9).fit(dose.reshape(-1, 1), recovered)          # C huge ≈ no regularisation
print(f"sklearn:          b0={sk.intercept_[0]:.3f} b1={sk.coef_[0, 0]:.3f}")

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

b0 = b1 = 0.0
for _ in range(200_000):                                   # gradient ASCENT on the log-likelihood
    p = sigmoid(b0 + b1 * dose)
    b0 += 0.01 * np.sum(recovered - p)
    b1 += 0.01 * np.sum((recovered - p) * dose)
print(f"gradient ascent:  b0={b0:.3f} b1={b1:.3f}")

for d in [2, 4.5, 7]:
    print(f"dose {d} mg → P(recover) = {sigmoid(b0 + b1 * d):.3f}")
p = sigmoid(b0 + b1 * dose)
log_likelihood = np.sum(recovered * np.log(p) + (1 - recovered) * np.log(1 - p))
print("log-likelihood of the fitted curve:", round(float(log_likelihood), 4))
`, "sklearn:          b0=-5.291 b1=1.246\ngradient ascent:  b0=-5.291 b1=1.246\ndose 2 mg → P(recover) = 0.057\ndose 4.5 mg → P(recover) = 0.579\ndose 7 mg → P(recover) = 0.969\nlog-likelihood of the fitted curve: -5.0755"),
        { t: "formula", items: [["Logistic function", "p = 1 / (1 + e^(−(b₀ + b₁x)))"], ["Likelihood of one point", "p if it recovered, (1 − p) if not"], ["Log-likelihood", "Σ [y·ln p + (1 − y)·ln(1 − p)]: maximise it"], ["Gradient", "∂/∂b₀ = Σ(y − p), ∂/∂b₁ = Σ(y − p)·x"]] },
        { t: "analogy", text: "Maximum likelihood is choosing the S-curve that would have been least surprised by what actually happened: high probabilities where people recovered, low where they didn't." },
        { t: "trap", text: "scikit-learn regularises logistic regression by default (C=1.0), which shrinks coefficients; to match the textbook maximum-likelihood fit, use a very large C or `penalty=None`. If the classes are perfectly separable, the coefficients grow without bound." },
        { t: "trick", text: "**Sigmoid turns a line into a probability. Fit by maximising Σ y ln p + (1 − y) ln(1 − p).**" },
        { t: "exam", items: ["What is the logistic function?", "What is maximum likelihood estimation?", "Write the log-likelihood for logistic regression.", "Why does sklearn's default fit differ from the textbook fit?", "What happens with perfectly separable data?"] },
        { t: "recap", items: ["p = sigmoid(b₀ + b₁x) ∈ (0, 1)", "Maximise the log-likelihood", "Gradient: Σ(y − p)·x", "Matches sklearn with no/weak regularisation", "Predict probabilities, then pick a threshold"] },
      ],
      quiz: [
        { q: "sigmoid(0) = ?", options: ["0.5", "0", "1", "e"], answer: 0, explain: "1 / (1 + 1)." },
        { q: "Maximum likelihood chooses parameters that…", options: ["Make the observed data most probable", "Minimise the slope", "Maximise residuals", "Set p = 0.5 always"], answer: 0, explain: "Least surprise." },
        { q: "A point with y = 0 contributes which term to the log-likelihood?", options: ["ln(1 − p)", "ln p", "p", "0"], answer: 0, explain: "The probability of not recovering." },
        { q: "sklearn's LogisticRegression by default applies…", options: ["L2 regularisation (C=1.0)", "No regularisation", "Lasso only", "Dropout"], answer: 0, explain: "Use penalty=None for the plain MLE." },
      ],
    },
    {
      id: "multivariable-logodds-significance",
      title: "Multivariable logistic regression, log-odds, R² and p-values",
      oneLine: "With several inputs, logistic regression adds them up on the log-odds scale. Each coefficient is the change in log-odds per unit, and e^coefficient is the odds ratio. McFadden's pseudo-R² compares the model's log-likelihood with a no-feature model, and a chi-square test gives the p-value.",
      minutes: 22,
      blocks: [
        py("Employee attrition with three features", src`
import numpy as np
from scipy.stats import chi2
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(4)
n = 400
sex = rng.integers(0, 2, n)                         # 0/1 indicator
age = rng.uniform(21, 60, n)
promotions = rng.poisson(1.5, n)
log_odds = 1.5 - 0.06 * (age - 35) - 0.9 * promotions + 0.2 * sex
left = (rng.random(n) < 1 / (1 + np.exp(-log_odds))).astype(int)
X = np.column_stack([sex, age, promotions])

model = LogisticRegression(penalty=None, max_iter=5000).fit(X, left)
for name, c in zip(["sex", "age", "promotions"], model.coef_[0]):
    print(f"{name:<11} coef {c:7.3f}   odds ratio {np.exp(c):.3f}")

p = model.predict_proba(X)[:, 1]
ll_fit = np.sum(left * np.log(p) + (1 - left) * np.log(1 - p))
p0 = left.mean()                                    # the no-feature model: everyone gets the base rate
ll_null = np.sum(left * np.log(p0) + (1 - left) * np.log(1 - p0))
pseudo_r2 = 1 - ll_fit / ll_null                    # McFadden's R²
lr_stat = 2 * (ll_fit - ll_null)
p_value = chi2.sf(lr_stat, df=X.shape[1])
print(f"McFadden R² = {pseudo_r2:.3f}, likelihood-ratio χ² = {lr_stat:.1f}, p = {p_value:.2e}")
`, "sex         coef   0.395   odds ratio 1.484\nage         coef  -0.065   odds ratio 0.938\npromotions  coef  -0.906   odds ratio 0.404\nMcFadden R² = 0.196, likelihood-ratio χ² = 108.7, p = 2.14e-23"),
        { t: "table", head: ["Scale", "Formula", "Reading a coefficient"], rows: [["Log-odds", "ln(p / (1 − p)) = b₀ + b₁x₁ + …", "Each unit adds b to the log-odds"], ["Odds", "p / (1 − p) = e^(b₀ + …)", "Each unit multiplies the odds by e^b"], ["Probability", "p = 1 / (1 + e^−(…))", "The effect depends on where you start"]] },
        { t: "p", text: "Each extra promotion multiplies the odds of leaving by the odds ratio printed for promotions (well below 1: promotions keep people), and each extra year of age also lowers the odds a little. A McFadden R² of 0.2–0.4 already indicates a good fit; it isn't on the same scale as linear-regression R²." },
        { t: "analogy", text: "Log-odds are like a points table: each feature adds or removes points, and the sigmoid converts the final score into a probability. The odds ratio says \"each promotion multiplies your chances of leaving by 0.4\", for example." },
        { t: "trap", text: "Odds ratios aren't probability changes: doubling the odds from 1:99 barely changes the probability (1% → 2%), but from 1:1 it moves 50% → 67%. Compare features fairly by standardising them, and don't read pseudo-R² like ordinary R²." },
        { t: "trick", text: "**Coefficient → log-odds per unit; e^coef → odds ratio. McFadden R² = 1 − LL_model / LL_null.**" },
        { t: "exam", items: ["How do you interpret a logistic regression coefficient?", "What are odds ratios?", "What is McFadden's pseudo-R²?", "How do you test whether a logistic model is significant? (Likelihood-ratio chi-square test.)", "Why isn't pseudo-R² comparable to linear R²?"] },
        { t: "recap", items: ["Features add up on the log-odds scale", "e^coef = odds ratio per unit", "McFadden R² compares with the intercept-only model", "LR test: 2(LL_model − LL_null) ~ χ²(features)", "Probability effects depend on the baseline"] },
      ],
      quiz: [
        { q: "A coefficient of ln(2) ≈ 0.693 means each unit…", options: ["Doubles the odds", "Doubles the probability", "Adds 0.693 to p", "Halves the odds"], answer: 0, explain: "e^0.693 = 2." },
        { q: "An odds ratio below 1 means the feature…", options: ["Lowers the odds of the outcome", "Raises them", "Has no effect", "Is categorical"], answer: 0, explain: "It shrinks the odds." },
        { q: "McFadden's R² compares the model's log-likelihood with…", options: ["A model with no features", "A perfect model", "Linear regression", "The test set"], answer: 0, explain: "1 − LL_model / LL_null." },
        { q: "The likelihood-ratio test statistic follows a…", options: ["Chi-square distribution", "Normal distribution always", "Uniform distribution", "Beta distribution"], answer: 0, explain: "df = number of features." },
      ],
    },
    {
      id: "classification-evaluation",
      title: "Confusion matrices, Bayes, ROC/AUC and class imbalance",
      oneLine: "Evaluate a classifier on test data with a confusion matrix (true/false positives and negatives), precision, recall and accuracy. Bayes' theorem explains why precision drops when positives are rare. The ROC curve and its AUC summarise performance across all thresholds.",
      minutes: 22,
      blocks: [
        py("Evaluating a classifier", src`
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(10)
n = 1000
x1, x2 = rng.normal(size=n), rng.normal(size=n)
y = (rng.random(n) < 1 / (1 + np.exp(-(-1 + 1.5 * x1 - x2)))).astype(int)
X = np.column_stack([x1, x2])
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

model = LogisticRegression().fit(X_tr, y_tr)
prob = model.predict_proba(X_te)[:, 1]
pred = (prob >= 0.5).astype(int)
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
print(f"accuracy {(tp + tn) / len(y_te):.3f}  precision {precision_score(y_te, pred):.3f}  recall {recall_score(y_te, pred):.3f}")

fpr, tpr, thresholds = roc_curve(y_te, prob)
print("AUC:", round(roc_auc_score(y_te, prob), 3))
for target in [0.1, 0.2]:                          # the best recall we can get for a given false-alarm rate
    i = np.searchsorted(fpr, target)
    print(f"at {target:.0%} false-positive rate → recall {tpr[i]:.2f} (threshold {thresholds[i]:.2f})")

# Bayes: the same test, but positives are rare
sens, spec = recall_score(y_te, pred), tn / (tn + fp)
for prevalence in [0.3, 0.05, 0.01]:
    ppv = sens * prevalence / (sens * prevalence + (1 - spec) * (1 - prevalence))
    print(f"if {prevalence:.0%} are positive, precision would be {ppv:.2f}")
`, "TP=52 FP=19 FN=49 TN=180\naccuracy 0.773  precision 0.732  recall 0.515\nAUC: 0.834\nat 10% false-positive rate → recall 0.52 (threshold 0.49)\nat 20% false-positive rate → recall 0.69 (threshold 0.35)\nif 30% are positive, precision would be 0.70\nif 5% are positive, precision would be 0.22\nif 1% are positive, precision would be 0.05"),
        { t: "p", text: "The same sensitivity and specificity give very different precision depending on how common positives are: with rare positives, false alarms from the huge negative group swamp the true hits (Bayes' theorem again). That's the core of the **class imbalance** problem: accuracy looks great while the model is nearly useless for the rare class." },
        { t: "table", head: ["Imbalance fix", "How"], rows: [["Pick better metrics", "Precision, recall, F1, PR-AUC instead of accuracy"], ["Move the threshold", "Choose it from the ROC/PR curve and business costs"], ["Weight the classes", "`class_weight=\"balanced\"`"], ["Resample", "Oversample the rare class or undersample the common one (training data only)"], ["Get more rare examples", "Often the best fix"]] },
        { t: "analogy", text: "The ROC curve shows every possible security setting of an airport scanner: stricter settings catch more threats (recall) but stop more innocent travellers (false positives). AUC summarises the scanner's quality across all settings." },
        { t: "trap", text: "A model that always says \"no\" is 99% accurate when 1% are positive. Always look at the confusion matrix and recall for the rare class. And evaluate on the test set, not on the data the model was trained on." },
        { t: "trick", text: "**Confusion matrix first. Precision depends on prevalence (Bayes). ROC/AUC for all thresholds.**" },
        { t: "exam", items: ["Explain a confusion matrix, precision and recall.", "Why can accuracy be misleading?", "How does prevalence affect precision?", "What is the ROC curve? What does AUC mean?", "How do you handle class imbalance?"] },
        { t: "recap", items: ["TP, FP, FN, TN on the test set", "Precision = TP/(TP+FP), recall = TP/(TP+FN)", "Rare positives → lower precision (Bayes)", "ROC: recall vs false-positive rate; AUC summarises", "Imbalance: better metrics, thresholds, weights, resampling"] },
      ],
      quiz: [
        { q: "TP=40, FN=10. Recall?", options: ["0.8", "0.2", "0.25", "4"], answer: 0, explain: "40 / 50." },
        { q: "Keeping sensitivity and specificity fixed, rarer positives make precision…", options: ["Lower", "Higher", "Unchanged", "Exactly 50%"], answer: 0, explain: "False positives dominate." },
        { q: "AUC = 0.5 means…", options: ["No better than random ranking", "Perfect", "50% accuracy", "Half the data is positive"], answer: 0, explain: "The diagonal line." },
        { q: "Which is NOT a fix for class imbalance?", options: ["Judging only by accuracy", "class_weight=\"balanced\"", "Moving the threshold", "Oversampling the training data"], answer: 0, explain: "Accuracy hides the problem." },
      ],
    },
  ],
};
