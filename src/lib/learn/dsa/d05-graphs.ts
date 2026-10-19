import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA module 10: graphs. */
export const DSA10_GRAPHS: LearnModule = {
  id: "graphs",
  title: "Graphs",
  titleHi: "ग्राफ",
  blurb: "Cities and roads, friends and follows: store a graph, explore it with BFS and DFS, find shortest paths with Dijkstra, order tasks with topological sort, and group items with union-find.",
  lessons: [
    {
      id: "graph-basics",
      title: "What is a graph? Storing it in memory",
      oneLine: "A graph is a set of vertices (points) joined by edges (lines). You store it either as an adjacency matrix (a 2D grid of 0s and 1s) or an adjacency list (each vertex keeps a list of its neighbours).",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Graph words" },
        { t: "diagram", text: "    0 ─── 1\n    │     │\n    2 ─── 3 ─── 4\n\nvertices: 0 1 2 3 4      edges: 0-1, 0-2, 1-3, 2-3, 3-4" },
        { t: "table", head: ["Word", "Meaning", "Example"], rows: [
          ["Vertex (node)", "A point", "A city, a person"],
          ["Edge", "A link between two vertices", "A road, a friendship"],
          ["Undirected", "The edge works both ways", "Facebook friends"],
          ["Directed", "The edge has a direction (u → v)", "Instagram follow, a one-way road"],
          ["Weighted", "Each edge has a cost", "Road length in km"],
          ["Degree", "Number of edges at a vertex", "Vertex 3 has degree 3"],
        ] },
        { t: "analogy", text: "A metro map: stations are vertices, tracks between stations are edges. A tree is just a special graph with no loops; a graph can have loops (cycles), many paths between two places, and even separate unconnected parts." },
        { t: "h", text: "Step 2: Matrix vs list" },
        multi("Adjacency matrix and adjacency list", {
          python: src`
n = 5
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)]

matrix = [[0] * n for _ in range(n)]   # n x n grid of zeros
adj = [[] for _ in range(n)]           # one empty list per vertex

for u, v in edges:
    matrix[u][v] = 1                   # mark the edge
    matrix[v][u] = 1                   # undirected: both ways
    adj[u].append(v)                   # v is a neighbour of u
    adj[v].append(u)                   # and u is a neighbour of v

print("Adjacency matrix:")
for row in matrix:
    print(*row)
print("Adjacency list:")
for u in range(n):
    print(str(u) + ":", *adj[u])
print("Degree of 3:", len(adj[3]))
print("Edge 1-2 exists:", "true" if matrix[1][2] == 1 else "false")
`,
          c: src`
#include <stdio.h>

#define N 5

int main(void) {
    int edges[5][2] = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
    int matrix[N][N] = {0};    // n x n grid of zeros
    int adj[N][N];             // adj[u][0..deg[u]-1] = neighbours of u
    int deg[N] = {0};          // how many neighbours each vertex has

    for (int i = 0; i < 5; i++) {
        int u = edges[i][0], v = edges[i][1];
        matrix[u][v] = 1;      // mark the edge
        matrix[v][u] = 1;      // undirected: both ways
        adj[u][deg[u]++] = v;  // v is a neighbour of u
        adj[v][deg[v]++] = u;  // u is a neighbour of v
    }

    printf("Adjacency matrix:\n");
    for (int u = 0; u < N; u++) {
        printf("%d", matrix[u][0]);
        for (int v = 1; v < N; v++) printf(" %d", matrix[u][v]);
        printf("\n");
    }
    printf("Adjacency list:\n");
    for (int u = 0; u < N; u++) {
        printf("%d:", u);
        for (int k = 0; k < deg[u]; k++) printf(" %d", adj[u][k]);
        printf("\n");
    }
    printf("Degree of 3: %d\n", deg[3]);
    printf("Edge 1-2 exists: %s\n", matrix[1][2] == 1 ? "true" : "false");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 5;
    vector<pair<int, int>> edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
    vector<vector<int>> matrix(n, vector<int>(n, 0));   // n x n zeros
    vector<vector<int>> adj(n);                         // one list per vertex

    for (auto [u, v] : edges) {
        matrix[u][v] = matrix[v][u] = 1;   // undirected: both ways
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    cout << "Adjacency matrix:" << endl;
    for (auto& row : matrix) {
        for (int v = 0; v < n; v++) cout << (v ? " " : "") << row[v];
        cout << endl;
    }
    cout << "Adjacency list:" << endl;
    for (int u = 0; u < n; u++) {
        cout << u << ":";
        for (int v : adj[u]) cout << " " << v;
        cout << endl;
    }
    cout << "Degree of 3: " << adj[3].size() << endl;
    cout << "Edge 1-2 exists: " << (matrix[1][2] == 1 ? "true" : "false") << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        int[][] matrix = new int[n][n];                 // n x n zeros
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());   // one list per vertex

        for (int[] e : edges) {
            int u = e[0], v = e[1];
            matrix[u][v] = 1;                           // mark the edge
            matrix[v][u] = 1;                           // undirected: both ways
            adj.get(u).add(v);
            adj.get(v).add(u);
        }

        System.out.println("Adjacency matrix:");
        for (int[] row : matrix) {
            StringBuilder sb = new StringBuilder();
            for (int v = 0; v < n; v++) sb.append(v > 0 ? " " : "").append(row[v]);
            System.out.println(sb);
        }
        System.out.println("Adjacency list:");
        for (int u = 0; u < n; u++) {
            StringBuilder sb = new StringBuilder(u + ":");
            for (int v : adj.get(u)) sb.append(" ").append(v);
            System.out.println(sb);
        }
        System.out.println("Degree of 3: " + adj.get(3).size());
        System.out.println("Edge 1-2 exists: " + (matrix[1][2] == 1));
    }
}
`,
          javascript: src`
const n = 5;
const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];

const matrix = Array.from({ length: n }, () => new Array(n).fill(0));   // n x n zeros
const adj = Array.from({ length: n }, () => []);                        // one list per vertex

for (const [u, v] of edges) {
  matrix[u][v] = 1;          // mark the edge
  matrix[v][u] = 1;          // undirected: both ways
  adj[u].push(v);
  adj[v].push(u);
}

console.log("Adjacency matrix:");
for (const row of matrix) console.log(row.join(" "));
console.log("Adjacency list:");
for (let u = 0; u < n; u++) console.log(u + ": " + adj[u].join(" "));
console.log("Degree of 3: " + adj[3].length);
console.log("Edge 1-2 exists: " + (matrix[1][2] === 1));
`,
        }, "Adjacency matrix:\n0 1 1 0 0\n1 0 0 1 0\n1 0 0 1 0\n0 1 1 0 1\n0 0 0 1 0\nAdjacency list:\n0: 1 2\n1: 0 3\n2: 0 3\n3: 1 2 4\n4: 3\nDegree of 3: 3\nEdge 1-2 exists: false"),
        { t: "table", head: ["", "Adjacency matrix", "Adjacency list"], rows: [
          ["Space", "O(V²), even with few edges", "**O(V + E)**"],
          ["Is u–v an edge?", "**O(1)**: matrix[u][v]", "O(degree of u)"],
          ["Visit all neighbours of u", "O(V)", "**O(degree of u)**"],
          ["Best for", "Small or dense graphs", "Most real graphs (sparse) and interviews"],
        ], caption: "V = number of vertices, E = number of edges" },
        { t: "trap", text: "For an **undirected** graph, add every edge **twice** (u → v and v → u). Forgetting the second direction is the most common graph bug. For a directed graph, add it only once." },
        { t: "trick", text: "**Default to an adjacency list. Use a matrix only when you need O(1) \"is there an edge?\" checks on a small graph.**" },
        { t: "exam", items: ["What is a graph? Directed vs undirected, weighted vs unweighted.", "Adjacency matrix vs adjacency list: space and time.", "What is a cycle? A connected graph?", "Tree vs graph. (A tree is a connected graph with no cycles and V − 1 edges.)"] },
        { t: "recap", items: ["Graph = vertices + edges", "Matrix: V × V grid, O(V²) space, O(1) edge check", "List: each vertex keeps its neighbours, O(V + E) space", "Undirected edges are stored in both directions"] },
      ],
      quiz: [
        { q: "Space used by an adjacency list?", options: ["O(V + E)", "O(V²)", "O(E²)", "O(1)"], answer: 0, explain: "One entry per vertex plus per edge end." },
        { q: "Fastest way to check if an edge u–v exists?", options: ["Adjacency matrix: O(1)", "Adjacency list: O(1)", "Sort the edges", "BFS"], answer: 0, explain: "Just read matrix[u][v]." },
        { q: "An Instagram follow is best modelled as a…", options: ["Directed edge", "Undirected edge", "Weighted vertex", "Tree"], answer: 0, explain: "A follows B doesn't mean B follows A." },
        { q: "In an undirected graph, edge 2–5 is stored as…", options: ["2 → 5 and 5 → 2", "Only 2 → 5", "Only 5 → 2", "Not stored"], answer: 0, explain: "Both directions." },
      ],
    },
    {
      id: "bfs-dfs",
      title: "BFS and DFS",
      oneLine: "BFS explores a graph in rings, nearest first, using a queue; it also finds the fewest edges to every vertex. DFS goes as deep as possible down one path before backing up, using recursion (or a stack). Both need a visited array so you never loop forever.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Two ways to explore" },
        { t: "diagram", text: "    0 ─── 1\n    │     │\n    2 ─── 3 ─── 4\n\nBFS from 0 (ripples in water):   0 → 1 2 → 3 → 4\nDFS from 0 (walk a maze):        0 → 1 → 3 → 2 (dead end, back up) → 4" },
        { t: "table", head: ["", "BFS (breadth-first)", "DFS (depth-first)"], rows: [
          ["Uses", "A queue", "Recursion (a stack)"],
          ["Order", "Level by level, nearest first", "Deep first, then backtrack"],
          ["Finds", "Fewest edges from the start (unweighted shortest path)", "Paths, cycles, connected parts, topological order"],
          ["Time", "O(V + E)", "O(V + E)"],
        ] },
        { t: "analogy", text: "BFS is a rumour at school: you tell your friends, they tell theirs, spreading one circle at a time. DFS is exploring a maze with one hand on the wall: follow one corridor to its end, then come back and try the next turn." },
        multi("BFS (with distances) and DFS", {
          python: src`
from collections import deque

n = 5
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)]
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

def bfs(start):
    visited = [False] * n
    dist = [0] * n                    # edges from start
    order = []
    queue = deque([start])
    visited[start] = True             # mark when ADDED to the queue
    while queue:
        u = queue.popleft()           # nearest unprocessed vertex
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                dist[v] = dist[u] + 1     # one more edge than u
                queue.append(v)
    return order, dist

def dfs(u, visited, order):
    visited[u] = True
    order.append(u)
    for v in adj[u]:
        if not visited[v]:
            dfs(v, visited, order)    # go deeper first

order, dist = bfs(0)
print("BFS from 0:", *order)
print("Fewest edges from 0 to 4:", dist[4])
order = []
dfs(0, [False] * n, order)
print("DFS from 0:", *order)
`,
          c: src`
#include <stdio.h>

#define N 5
int adj[N][N], deg[N];

void add_edge(int u, int v) {          // undirected: both ways
    adj[u][deg[u]++] = v;
    adj[v][deg[v]++] = u;
}

void dfs(int u, int visited[]) {
    visited[u] = 1;
    printf(" %d", u);
    for (int k = 0; k < deg[u]; k++) {
        int v = adj[u][k];
        if (!visited[v]) dfs(v, visited);   // go deeper first
    }
}

int main(void) {
    add_edge(0, 1); add_edge(0, 2); add_edge(1, 3); add_edge(2, 3); add_edge(3, 4);

    int visited[N] = {0}, dist[N] = {0};
    int queue[N], front = 0, back = 0;
    queue[back++] = 0;
    visited[0] = 1;                    // mark when ADDED to the queue
    printf("BFS from 0:");
    while (front < back) {
        int u = queue[front++];        // nearest unprocessed vertex
        printf(" %d", u);
        for (int k = 0; k < deg[u]; k++) {
            int v = adj[u][k];
            if (!visited[v]) {
                visited[v] = 1;
                dist[v] = dist[u] + 1; // one more edge than u
                queue[back++] = v;
            }
        }
    }
    printf("\n");
    printf("Fewest edges from 0 to 4: %d\n", dist[4]);

    int seen[N] = {0};
    printf("DFS from 0:");
    dfs(0, seen);
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<vector<int>> adj(5);

void dfs(int u, vector<bool>& visited) {
    visited[u] = true;
    cout << " " << u;
    for (int v : adj[u])
        if (!visited[v]) dfs(v, visited);   // go deeper first
}

int main() {
    int n = 5;
    for (auto [u, v] : vector<pair<int, int>>{{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}}) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<bool> visited(n, false);
    vector<int> dist(n, 0);
    queue<int> q;
    q.push(0);
    visited[0] = true;                 // mark when ADDED to the queue
    cout << "BFS from 0:";
    while (!q.empty()) {
        int u = q.front(); q.pop();    // nearest unprocessed vertex
        cout << " " << u;
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                dist[v] = dist[u] + 1; // one more edge than u
                q.push(v);
            }
        }
    }
    cout << endl;
    cout << "Fewest edges from 0 to 4: " << dist[4] << endl;

    vector<bool> seen(n, false);
    cout << "DFS from 0:";
    dfs(0, seen);
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class Main {
    static List<List<Integer>> adj = new ArrayList<>();

    static void dfs(int u, boolean[] visited, StringBuilder out) {
        visited[u] = true;
        out.append(" ").append(u);
        for (int v : adj.get(u))
            if (!visited[v]) dfs(v, visited, out);   // go deeper first
    }

    public static void main(String[] args) {
        int n = 5;
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }

        boolean[] visited = new boolean[n];
        int[] dist = new int[n];
        Queue<Integer> q = new ArrayDeque<>();
        q.offer(0);
        visited[0] = true;                     // mark when ADDED to the queue
        StringBuilder bfs = new StringBuilder("BFS from 0:");
        while (!q.isEmpty()) {
            int u = q.poll();                  // nearest unprocessed vertex
            bfs.append(" ").append(u);
            for (int v : adj.get(u)) {
                if (!visited[v]) {
                    visited[v] = true;
                    dist[v] = dist[u] + 1;     // one more edge than u
                    q.offer(v);
                }
            }
        }
        System.out.println(bfs);
        System.out.println("Fewest edges from 0 to 4: " + dist[4]);

        StringBuilder dfsOut = new StringBuilder("DFS from 0:");
        dfs(0, new boolean[n], dfsOut);
        System.out.println(dfsOut);
    }
}
`,
          javascript: src`
const n = 5;
const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
const adj = Array.from({ length: n }, () => []);
for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

function bfs(start) {
  const visited = new Array(n).fill(false);
  const dist = new Array(n).fill(0);     // edges from start
  const order = [];
  const queue = [start];
  let head = 0;
  visited[start] = true;                 // mark when ADDED to the queue
  while (head < queue.length) {
    const u = queue[head++];             // nearest unprocessed vertex
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true;
        dist[v] = dist[u] + 1;           // one more edge than u
        queue.push(v);
      }
    }
  }
  return { order, dist };
}

function dfs(u, visited, order) {
  visited[u] = true;
  order.push(u);
  for (const v of adj[u]) {
    if (!visited[v]) dfs(v, visited, order);   // go deeper first
  }
}

const result = bfs(0);
console.log("BFS from 0: " + result.order.join(" "));
console.log("Fewest edges from 0 to 4: " + result.dist[4]);
const order = [];
dfs(0, new Array(n).fill(false), order);
console.log("DFS from 0: " + order.join(" "));
`,
        }, "BFS from 0: 0 1 2 3 4\nFewest edges from 0 to 4: 3\nDFS from 0: 0 1 3 2 4"),
        { t: "table", head: ["Take out", "Neighbours", "Newly added (dist)", "Queue after"], rows: [
          ["0", "1, 2", "1 (1), 2 (1)", "1 2"],
          ["1", "0, 3", "3 (2)", "2 3"],
          ["2", "0, 3", "– (both visited)", "3"],
          ["3", "1, 2, 4", "4 (3)", "4"],
          ["4", "3", "–", "(empty) → done"],
        ], caption: "BFS dry run from 0" },
        { t: "trap", text: "Without a **visited** array, BFS and DFS walk around a cycle (0 → 1 → 3 → 2 → 0 → …) forever. In BFS, mark a vertex visited **when you add it to the queue**, not when you take it out; otherwise the same vertex can be added several times." },
        { t: "trick", text: "**BFS = queue = nearest first = shortest path (unweighted). DFS = recursion = go deep.**" },
        { t: "exam", items: ["BFS and DFS of a graph, and their time complexity.", "Count connected components (run DFS from every unvisited vertex).", "Number of islands in a grid (DFS/BFS on a 2D grid).", "Detect a cycle in an undirected graph.", "Shortest path in an unweighted graph or a maze (BFS)."] },
        { t: "recap", items: ["BFS: queue, level by level, gives the fewest edges", "DFS: recursion, deep first, then backtrack", "Both: O(V + E) with an adjacency list", "Always keep a visited array"] },
      ],
      quiz: [
        { q: "Which traversal finds the fewest edges from the start?", options: ["BFS", "DFS", "Inorder", "Neither"], answer: 0, explain: "BFS visits nearest vertices first." },
        { q: "BFS uses a…", options: ["Queue", "Stack", "Heap", "Hash map only"], answer: 0, explain: "First in, first out keeps the rings in order." },
        { q: "Why do we need a visited array?", options: ["To avoid looping forever around cycles", "To sort vertices", "To store weights", "It's optional in graphs"], answer: 0, explain: "Graphs can have cycles, unlike trees." },
        { q: "Time complexity of BFS/DFS with an adjacency list?", options: ["O(V + E)", "O(V²)", "O(E log V)", "O(1)"], answer: 0, explain: "Each vertex and edge is handled once." },
      ],
    },
    {
      id: "dijkstra",
      title: "Shortest path with weights: Dijkstra",
      oneLine: "When edges have different lengths, BFS isn't enough. Dijkstra's algorithm repeatedly picks the closest unfinished vertex and tries to shorten the distance to each of its neighbours (relaxation).",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: Why BFS fails here" },
        { t: "diagram", text: "        4\n   0 ─────── 1\n   │ ╲       │\n 1 │   ╲ 2   │ 1\n   │     ╲   │\n   2 ─────── 3 ─── 4\n        5        3\n\nedges: 0-1 (4), 0-2 (1), 2-1 (2), 1-3 (1), 2-3 (5), 3-4 (3)\n\n0 → 1 directly costs 4, but 0 → 2 → 1 costs 1 + 2 = 3: fewer km, more edges." },
        { t: "h", text: "Step 2: The algorithm" },
        { t: "points", items: ["Set dist[start] = 0 and every other distance to ∞ (infinity).", "Pick the **unfinished vertex with the smallest dist**. Its distance is now final.", "**Relax** each neighbour v: if dist[u] + weight(u, v) < dist[v], update dist[v] and remember parent[v] = u.", "Repeat until every vertex is finished. Follow parent[] backwards to get the actual path."] },
        { t: "analogy", text: "Google Maps from your house: first fix the nearest place you can reach for sure, then use it as a stepping stone to check if any further place gets cheaper through it. Closest first, always." },
        multi("Dijkstra (simple O(V²) version) with the path", {
          python: src`
INF = 10**9                            # "infinity": bigger than any real distance
n = 5
w = [[0] * n for _ in range(n)]        # w[u][v] = weight, 0 = no edge
for u, v, cost in [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5), (3, 4, 3)]:
    w[u][v] = w[v][u] = cost           # undirected

dist = [INF] * n
parent = [-1] * n
done = [False] * n
dist[0] = 0                            # start at vertex 0

for _ in range(n):
    u = -1
    for i in range(n):                 # pick the closest unfinished vertex
        if not done[i] and (u == -1 or dist[i] < dist[u]):
            u = i
    if dist[u] == INF:
        break                          # the rest can't be reached
    done[u] = True                     # its distance is final now
    for v in range(n):                 # relax every neighbour
        if w[u][v] > 0 and dist[u] + w[u][v] < dist[v]:
            dist[v] = dist[u] + w[u][v]
            parent[v] = u

print("Shortest distances from 0:")
for v in range(n):
    print(str(v) + ":", dist[v])

path, v = [], 4
while v != -1:                         # walk back from 4 using parent[]
    path.append(v)
    v = parent[v]
path.reverse()
print("Path to 4:", " -> ".join(str(x) for x in path))
`,
          c: src`
#include <stdio.h>

#define N 5
#define INF 1000000000                 // "infinity"

int main(void) {
    int w[N][N] = {0};                 // w[u][v] = weight, 0 = no edge
    int e[6][3] = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}, {3, 4, 3}};
    for (int i = 0; i < 6; i++) {
        w[e[i][0]][e[i][1]] = e[i][2];
        w[e[i][1]][e[i][0]] = e[i][2]; // undirected
    }

    int dist[N], parent[N], done[N];
    for (int i = 0; i < N; i++) { dist[i] = INF; parent[i] = -1; done[i] = 0; }
    dist[0] = 0;                       // start at vertex 0

    for (int round = 0; round < N; round++) {
        int u = -1;
        for (int i = 0; i < N; i++)    // pick the closest unfinished vertex
            if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
        if (dist[u] == INF) break;     // the rest can't be reached
        done[u] = 1;                   // its distance is final now
        for (int v = 0; v < N; v++) {  // relax every neighbour
            if (w[u][v] > 0 && dist[u] + w[u][v] < dist[v]) {
                dist[v] = dist[u] + w[u][v];
                parent[v] = u;
            }
        }
    }

    printf("Shortest distances from 0:\n");
    for (int v = 0; v < N; v++) printf("%d: %d\n", v, dist[v]);

    int path[N], len = 0;
    for (int v = 4; v != -1; v = parent[v]) path[len++] = v;   // walk back
    printf("Path to 4: ");
    for (int i = len - 1; i >= 0; i--) printf(i ? "%d -> " : "%d\n", path[i]);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    const int INF = 1000000000;        // "infinity"
    int n = 5;
    vector<vector<int>> w(n, vector<int>(n, 0));   // 0 = no edge
    int e[6][3] = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}, {3, 4, 3}};
    for (auto& x : e) w[x[0]][x[1]] = w[x[1]][x[0]] = x[2];   // undirected

    vector<int> dist(n, INF), parent(n, -1);
    vector<bool> done(n, false);
    dist[0] = 0;                       // start at vertex 0

    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++)    // pick the closest unfinished vertex
            if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
        if (dist[u] == INF) break;     // the rest can't be reached
        done[u] = true;                // its distance is final now
        for (int v = 0; v < n; v++) {  // relax every neighbour
            if (w[u][v] > 0 && dist[u] + w[u][v] < dist[v]) {
                dist[v] = dist[u] + w[u][v];
                parent[v] = u;
            }
        }
    }

    cout << "Shortest distances from 0:" << endl;
    for (int v = 0; v < n; v++) cout << v << ": " << dist[v] << endl;

    vector<int> path;
    for (int v = 4; v != -1; v = parent[v]) path.push_back(v);   // walk back
    reverse(path.begin(), path.end());
    cout << "Path to 4: ";
    for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << path[i];
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        final int INF = 1_000_000_000;              // "infinity"
        int n = 5;
        int[][] w = new int[n][n];                  // 0 = no edge
        int[][] e = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}, {3, 4, 3}};
        for (int[] x : e) { w[x[0]][x[1]] = x[2]; w[x[1]][x[0]] = x[2]; }   // undirected

        int[] dist = new int[n], parent = new int[n];
        boolean[] done = new boolean[n];
        Arrays.fill(dist, INF);
        Arrays.fill(parent, -1);
        dist[0] = 0;                                // start at vertex 0

        for (int round = 0; round < n; round++) {
            int u = -1;
            for (int i = 0; i < n; i++)             // pick the closest unfinished vertex
                if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
            if (dist[u] == INF) break;              // the rest can't be reached
            done[u] = true;                         // its distance is final now
            for (int v = 0; v < n; v++) {           // relax every neighbour
                if (w[u][v] > 0 && dist[u] + w[u][v] < dist[v]) {
                    dist[v] = dist[u] + w[u][v];
                    parent[v] = u;
                }
            }
        }

        System.out.println("Shortest distances from 0:");
        for (int v = 0; v < n; v++) System.out.println(v + ": " + dist[v]);

        List<String> path = new ArrayList<>();
        for (int v = 4; v != -1; v = parent[v]) path.add(String.valueOf(v));   // walk back
        Collections.reverse(path);
        System.out.println("Path to 4: " + String.join(" -> ", path));
    }
}
`,
          javascript: src`
const INF = 1e9;                         // "infinity"
const n = 5;
const w = Array.from({ length: n }, () => new Array(n).fill(0));   // 0 = no edge
for (const [u, v, cost] of [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]]) {
  w[u][v] = cost;
  w[v][u] = cost;                        // undirected
}

const dist = new Array(n).fill(INF);
const parent = new Array(n).fill(-1);
const done = new Array(n).fill(false);
dist[0] = 0;                             // start at vertex 0

for (let round = 0; round < n; round++) {
  let u = -1;
  for (let i = 0; i < n; i++) {          // pick the closest unfinished vertex
    if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
  }
  if (dist[u] === INF) break;            // the rest can't be reached
  done[u] = true;                        // its distance is final now
  for (let v = 0; v < n; v++) {          // relax every neighbour
    if (w[u][v] > 0 && dist[u] + w[u][v] < dist[v]) {
      dist[v] = dist[u] + w[u][v];
      parent[v] = u;
    }
  }
}

console.log("Shortest distances from 0:");
for (let v = 0; v < n; v++) console.log(v + ": " + dist[v]);

const path = [];
for (let v = 4; v !== -1; v = parent[v]) path.push(v);   // walk back
console.log("Path to 4: " + path.reverse().join(" -> "));
`,
        }, "Shortest distances from 0:\n0: 0\n1: 3\n2: 1\n3: 4\n4: 7\nPath to 4: 0 -> 2 -> 1 -> 3 -> 4"),
        { t: "table", head: ["Pick (final)", "Relax", "dist [0, 1, 2, 3, 4]"], rows: [
          ["–", "start", "[0, ∞, ∞, ∞, ∞]"],
          ["0 (0)", "1 → 4, 2 → 1", "[0, 4, 1, ∞, ∞]"],
          ["2 (1)", "1 → 1+2 = **3** (better than 4), 3 → 1+5 = 6", "[0, 3, 1, 6, ∞]"],
          ["1 (3)", "3 → 3+1 = **4** (better than 6)", "[0, 3, 1, 4, ∞]"],
          ["3 (4)", "4 → 4+3 = 7", "[0, 3, 1, 4, 7]"],
          ["4 (7)", "–", "done"],
        ], caption: "Dijkstra dry run from 0" },
        { t: "table", head: ["Version", "Time", "When"], rows: [["Array scan (above)", "O(V²)", "Small or dense graphs; easiest to learn"], ["Min-heap / priority queue", "O((V + E) log V)", "Big sparse graphs (the interview version)"]] },
        { t: "trap", text: "Dijkstra **does not work with negative edge weights**: a vertex marked final could later get cheaper. Use Bellman-Ford for negative weights. And for an **unweighted** graph, plain BFS is simpler and faster." },
        { t: "trick", text: "**Pick the closest unfinished vertex → mark it final → relax its neighbours. Repeat.**" },
        { t: "exam", items: ["Dijkstra's algorithm with a priority queue.", "Why doesn't Dijkstra handle negative weights? (Bellman-Ford does.)", "Network delay time.", "Cheapest flights within k stops.", "Shortest path in a binary maze (BFS)."] },
        { t: "recap", items: ["Weighted shortest path: Dijkstra", "dist[start] = 0, others ∞; pick the closest unfinished vertex", "Relax: if dist[u] + w < dist[v], update dist[v] and parent[v]", "O(V²) simple, O((V + E) log V) with a heap; no negative weights"] },
      ],
      quiz: [
        { q: "Dijkstra always picks next…", options: ["The closest unfinished vertex", "The vertex with most edges", "A random vertex", "The farthest vertex"], answer: 0, explain: "Its distance can then be fixed for good." },
        { q: "\"Relaxing\" an edge u → v means…", options: ["Updating dist[v] if going through u is shorter", "Deleting the edge", "Doubling its weight", "Marking v visited"], answer: 0, explain: "dist[u] + w < dist[v]." },
        { q: "Dijkstra fails with…", options: ["Negative edge weights", "Undirected graphs", "Big graphs", "Weights of 1"], answer: 0, explain: "Use Bellman-Ford instead." },
        { q: "Time of Dijkstra with a min-heap?", options: ["O((V + E) log V)", "O(V + E)", "O(V³)", "O(2^V)"], answer: 0, explain: "Each relaxation may push to the heap." },
      ],
    },
    {
      id: "topological-sort",
      title: "Topological sort: doing tasks in order",
      oneLine: "In a directed graph with no cycles (a DAG), a topological order lists every task after all the tasks it depends on. Kahn's algorithm repeatedly takes a task with no remaining prerequisites.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Prerequisites" },
        { t: "diagram", text: "edge u → v means \"do u before v\"\n\n 5 ──▶ 2 ──▶ 3 ──▶ 1\n │                ▲\n ▼                │\n 0 ◀── 4 ─────────┘\n\nedges: 5→2, 5→0, 4→0, 4→1, 2→3, 3→1" },
        { t: "p", text: "The **indegree** of a vertex is the number of arrows coming into it: how many prerequisites it still has. A task with indegree 0 can be done right now." },
        { t: "analogy", text: "Getting dressed: socks before shoes, shirt before tie. You can't put on shoes until your socks are on. A topological order is any valid dressing sequence. College course prerequisites work the same way." },
        { t: "h", text: "Step 2: Kahn's algorithm" },
        { t: "points", items: ["Count the indegree of every vertex.", "Put every vertex with indegree 0 in a queue.", "Take one out, add it to the answer, and \"remove\" its outgoing arrows: decrease each neighbour's indegree.", "When a neighbour's indegree reaches 0, add it to the queue.", "If the answer has fewer than V vertices, the graph has a **cycle** (no valid order)."] },
        multi("Kahn's algorithm", {
          python: src`
from collections import deque

n = 6
edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]   # u -> v: do u before v

adj = [[] for _ in range(n)]
indegree = [0] * n                    # prerequisites still pending
for u, v in edges:
    adj[u].append(v)
    indegree[v] += 1

queue = deque(i for i in range(n) if indegree[i] == 0)   # ready right now
order = []
while queue:
    u = queue.popleft()
    order.append(u)                   # do task u
    for v in adj[u]:
        indegree[v] -= 1              # one prerequisite of v is done
        if indegree[v] == 0:
            queue.append(v)           # v is ready now

print("Topological order:", *order)
print("Has cycle:", "true" if len(order) < n else "false")
`,
          c: src`
#include <stdio.h>

#define N 6

int main(void) {
    int edges[6][2] = {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}};   // u -> v
    int adj[N][N], deg[N] = {0};      // deg = number of outgoing edges
    int indegree[N] = {0};            // prerequisites still pending

    for (int i = 0; i < 6; i++) {
        int u = edges[i][0], v = edges[i][1];
        adj[u][deg[u]++] = v;
        indegree[v]++;
    }

    int queue[N], front = 0, back = 0;
    for (int i = 0; i < N; i++)
        if (indegree[i] == 0) queue[back++] = i;   // ready right now

    int count = 0;
    printf("Topological order:");
    while (front < back) {
        int u = queue[front++];
        printf(" %d", u);             // do task u
        count++;
        for (int k = 0; k < deg[u]; k++) {
            int v = adj[u][k];
            if (--indegree[v] == 0) queue[back++] = v;   // v is ready now
        }
    }
    printf("\n");
    printf("Has cycle: %s\n", count < N ? "true" : "false");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 6;
    vector<pair<int, int>> edges = {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}};
    vector<vector<int>> adj(n);
    vector<int> indegree(n, 0);       // prerequisites still pending
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        indegree[v]++;
    }

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (indegree[i] == 0) q.push(i);   // ready right now

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);           // do task u
        for (int v : adj[u])
            if (--indegree[v] == 0) q.push(v);   // v is ready now
    }

    cout << "Topological order:";
    for (int u : order) cout << " " << u;
    cout << endl;
    cout << "Has cycle: " << ((int)order.size() < n ? "true" : "false") << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        int n = 6;
        int[][] edges = {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}};   // u -> v
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[n];                 // prerequisites still pending
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            indegree[e[1]]++;
        }

        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++)
            if (indegree[i] == 0) q.offer(i);        // ready right now

        StringBuilder sb = new StringBuilder("Topological order:");
        int count = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            sb.append(" ").append(u);                // do task u
            count++;
            for (int v : adj.get(u))
                if (--indegree[v] == 0) q.offer(v);  // v is ready now
        }
        System.out.println(sb);
        System.out.println("Has cycle: " + (count < n));
    }
}
`,
          javascript: src`
const n = 6;
const edges = [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]];   // u -> v
const adj = Array.from({ length: n }, () => []);
const indegree = new Array(n).fill(0);     // prerequisites still pending
for (const [u, v] of edges) {
  adj[u].push(v);
  indegree[v]++;
}

const queue = [];
for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);   // ready right now

const order = [];
let head = 0;
while (head < queue.length) {
  const u = queue[head++];
  order.push(u);                           // do task u
  for (const v of adj[u]) {
    indegree[v]--;                         // one prerequisite done
    if (indegree[v] === 0) queue.push(v);  // v is ready now
  }
}

console.log("Topological order: " + order.join(" "));
console.log("Has cycle: " + (order.length < n));
`,
        }, "Topological order: 4 5 2 0 3 1\nHas cycle: false"),
        { t: "table", head: ["Take", "Decrease indegree of", "Becomes ready", "Queue after"], rows: [
          ["(start)", "", "4, 5 (indegree 0)", "4 5"],
          ["4", "0 (2→1), 1 (2→1)", "–", "5"],
          ["5", "2 (1→0), 0 (1→0)", "2, 0", "2 0"],
          ["2", "3 (1→0)", "3", "0 3"],
          ["0", "–", "–", "3"],
          ["3", "1 (1→0)", "1", "1"],
          ["1", "–", "–", "(empty)"],
        ], caption: "Answer: 4 5 2 0 3 1. (Other valid orders exist, like 5 4 2 3 1 0.)" },
        { t: "trap", text: "Topological sort only exists for a **DAG** (Directed Acyclic Graph). If tasks depend on each other in a circle (A needs B, B needs A), no order is possible, and Kahn's algorithm ends with fewer than V vertices. There can be **many** valid orders, so don't panic if yours differs from the book's." },
        { t: "trick", text: "**Indegree 0 → ready → queue. Take one, cut its arrows, repeat.**" },
        { t: "exam", items: ["Course schedule: can you finish all courses? (Cycle detection in a directed graph.)", "Course schedule II: return a valid order.", "Topological sort using DFS (reverse postorder).", "Alien dictionary (advanced)."] },
        { t: "recap", items: ["Only for DAGs: directed, no cycles", "Indegree = number of incoming arrows", "Kahn: queue the indegree-0 vertices, remove arrows, repeat", "Fewer than V in the result → a cycle. O(V + E)"] },
      ],
      quiz: [
        { q: "Topological sort works on…", options: ["Directed acyclic graphs (DAGs)", "Any graph", "Undirected graphs", "Trees only"], answer: 0, explain: "A cycle makes ordering impossible." },
        { q: "Kahn's algorithm starts with vertices whose indegree is…", options: ["0", "1", "The largest", "Equal to V"], answer: 0, explain: "No prerequisites left." },
        { q: "If the result has fewer than V vertices, the graph…", options: ["Has a cycle", "Is a tree", "Is disconnected", "Is weighted"], answer: 0, explain: "Vertices in a cycle never reach indegree 0." },
        { q: "Is the topological order always unique?", options: ["No, there can be many", "Yes, always", "Only for trees", "Only with weights"], answer: 0, explain: "Any order respecting the arrows is valid." },
      ],
    },
    {
      id: "union-find",
      title: "Union-find (disjoint sets)",
      oneLine: "Union-find keeps track of groups. find(x) tells you the leader of x's group; union(a, b) merges two groups. With path compression, both are almost O(1). It's used to detect cycles and in Kruskal's minimum spanning tree.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Every group has a leader" },
        { t: "p", text: "Each item points to a **parent**. Follow parents up until an item points to itself: that's the group's **leader (root)**. Two items are in the same group if they have the same leader." },
        { t: "diagram", text: "Start: everyone is their own leader\nparent: [0, 1, 2, 3, 4]\n\nunion(0,1): 0's leader joins 1     →  0 → 1\nunion(1,2): 1's leader joins 2     →  0 → 1 → 2\nunion(3,4):                        →  3 → 4\n\nGroups: {0, 1, 2} with leader 2, and {3, 4} with leader 4" },
        { t: "analogy", text: "Kingdoms: every person reports to a boss, who reports to a boss… up to the king. Two people are in the same kingdom if they have the same king. When two kingdoms merge, one king simply starts reporting to the other." },
        multi("Union-find with path compression", {
          python: src`
n = 5
parent = list(range(n))               # everyone starts as their own leader

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])   # path compression: point straight at the leader
    return parent[x]

def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False                  # already in the same group
    parent[ra] = rb                   # one leader joins the other
    return True

union(0, 1)
union(1, 2)
union(3, 4)

print("0 and 2 connected:", "true" if find(0) == find(2) else "false")
print("0 and 3 connected:", "true" if find(0) == find(3) else "false")
groups = sum(1 for i in range(n) if find(i) == i)    # count the leaders
print("Groups:", groups)
print("Edge 2-0 makes a cycle:", "true" if not union(2, 0) else "false")
`,
          c: src`
#include <stdio.h>

#define N 5
int parent[N];

int find(int x) {
    if (parent[x] != x)
        parent[x] = find(parent[x]);   // path compression
    return parent[x];
}

int unite(int a, int b) {              // "union" is a C keyword, so we say unite
    int ra = find(a), rb = find(b);
    if (ra == rb) return 0;            // already in the same group
    parent[ra] = rb;                   // one leader joins the other
    return 1;
}

int main(void) {
    for (int i = 0; i < N; i++) parent[i] = i;   // everyone is their own leader

    unite(0, 1);
    unite(1, 2);
    unite(3, 4);

    printf("0 and 2 connected: %s\n", find(0) == find(2) ? "true" : "false");
    printf("0 and 3 connected: %s\n", find(0) == find(3) ? "true" : "false");
    int groups = 0;
    for (int i = 0; i < N; i++) if (find(i) == i) groups++;   // count the leaders
    printf("Groups: %d\n", groups);
    printf("Edge 2-0 makes a cycle: %s\n", !unite(2, 0) ? "true" : "false");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

vector<int> parent(5);

int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
    return parent[x];
}

bool unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;        // already in the same group
    parent[ra] = rb;                   // one leader joins the other
    return true;
}

int main() {
    iota(parent.begin(), parent.end(), 0);   // parent = 0, 1, 2, 3, 4

    unite(0, 1);
    unite(1, 2);
    unite(3, 4);

    cout << "0 and 2 connected: " << (find(0) == find(2) ? "true" : "false") << endl;
    cout << "0 and 3 connected: " << (find(0) == find(3) ? "true" : "false") << endl;
    int groups = 0;
    for (int i = 0; i < 5; i++) if (find(i) == i) groups++;   // count the leaders
    cout << "Groups: " << groups << endl;
    cout << "Edge 2-0 makes a cycle: " << (!unite(2, 0) ? "true" : "false") << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static int[] parent = new int[5];

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    static boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                        // already in the same group
        parent[ra] = rb;                                   // one leader joins the other
        return true;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) parent[i] = i;         // everyone is their own leader

        union(0, 1);
        union(1, 2);
        union(3, 4);

        System.out.println("0 and 2 connected: " + (find(0) == find(2)));
        System.out.println("0 and 3 connected: " + (find(0) == find(3)));
        int groups = 0;
        for (int i = 0; i < 5; i++) if (find(i) == i) groups++;   // count the leaders
        System.out.println("Groups: " + groups);
        System.out.println("Edge 2-0 makes a cycle: " + !union(2, 0));
    }
}
`,
          javascript: src`
const n = 5;
const parent = Array.from({ length: n }, (_, i) => i);   // everyone is their own leader

function find(x) {
  if (parent[x] !== x) parent[x] = find(parent[x]);      // path compression
  return parent[x];
}

function union(a, b) {
  const ra = find(a), rb = find(b);
  if (ra === rb) return false;           // already in the same group
  parent[ra] = rb;                       // one leader joins the other
  return true;
}

union(0, 1);
union(1, 2);
union(3, 4);

console.log("0 and 2 connected: " + (find(0) === find(2)));
console.log("0 and 3 connected: " + (find(0) === find(3)));
let groups = 0;
for (let i = 0; i < n; i++) if (find(i) === i) groups++;  // count the leaders
console.log("Groups: " + groups);
console.log("Edge 2-0 makes a cycle: " + !union(2, 0));
`,
        }, "0 and 2 connected: true\n0 and 3 connected: false\nGroups: 2\nEdge 2-0 makes a cycle: true"),
        { t: "table", head: ["Call", "parent before", "What happens", "parent after"], rows: [
          ["union(0, 1)", "[0, 1, 2, 3, 4]", "leaders 0 and 1 differ → parent[0] = 1", "[1, 1, 2, 3, 4]"],
          ["union(1, 2)", "[1, 1, 2, 3, 4]", "leaders 1 and 2 → parent[1] = 2", "[1, 2, 2, 3, 4]"],
          ["union(3, 4)", "[1, 2, 2, 3, 4]", "leaders 3 and 4 → parent[3] = 4", "[1, 2, 2, 4, 4]"],
          ["find(0)", "[1, 2, 2, 4, 4]", "0 → 1 → 2 (leader); compress: parent[0] = 2", "[2, 2, 2, 4, 4]"],
        ] },
        { t: "trap", text: "Without **path compression** (and union by size or rank), the parent chains can become long lists and find() becomes O(n). With both tricks, each operation is almost O(1) (inverse Ackermann time, α(n), which is under 5 for any real input). Also: union-find works for **undirected** cycle detection only." },
        { t: "trick", text: "**Same leader → same group. Union of two items that already share a leader → that edge makes a cycle.**" },
        { t: "exam", items: ["Implement union-find with path compression and union by rank.", "Detect a cycle in an undirected graph.", "Number of provinces / connected components.", "Kruskal's minimum spanning tree (sort edges + union-find).", "Redundant connection."] },
        { t: "recap", items: ["parent[] array; a leader points to itself", "find(x): follow parents to the leader (compress the path)", "union(a, b): attach one leader to the other", "Same leader → connected; union fails → cycle"] },
      ],
      quiz: [
        { q: "find(x) returns…", options: ["The leader (root) of x's group", "x's index", "The group size", "The next item"], answer: 0, explain: "Follow parents to the top." },
        { q: "union(a, b) returns false when…", options: ["a and b are already in the same group", "a is bigger than b", "b is a leader", "Never"], answer: 0, explain: "For an edge, that means a cycle." },
        { q: "Path compression makes find…", options: ["Nearly O(1)", "O(n²)", "Slower", "Recursive only"], answer: 0, explain: "Every visited item points straight to the leader." },
        { q: "Which algorithm uses union-find?", options: ["Kruskal's minimum spanning tree", "Binary search", "Bubble sort", "KMP"], answer: 0, explain: "It checks if an edge would make a cycle." },
      ],
    },
  ],
};
