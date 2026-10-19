import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA modules 8–9: trees and heaps. */
export const DSA08_TREES: LearnModule = {
  id: "trees",
  title: "Trees",
  titleHi: "ट्री",
  blurb: "Binary trees from zero: the three depth-first traversals, level-order (BFS), height, and the binary search tree.",
  lessons: [
    {
      id: "tree-traversals",
      title: "Binary tree and its traversals",
      oneLine: "A binary tree is a set of nodes where each node has at most two children: left and right. Preorder, inorder and postorder visit every node with three lines of recursion. Only the order of the lines changes.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Tree words" },
        { t: "diagram", text: "            1        ← root (the top, no parent)\n          /   \\\n         2     3     ← 2 and 3 are children of 1\n        / \\     \\\n       4   5     6   ← leaves (no children)\n\nedge = a link between parent and child\nheight = number of levels = 3" },
        { t: "table", head: ["Word", "Meaning"], rows: [["Root", "The top node (1)"], ["Parent / child", "1 is the parent of 2; 2 is a child of 1"], ["Leaf", "A node with no children (4, 5, 6)"], ["Subtree", "A node plus everything below it (2, 4, 5)"], ["Height", "Number of levels from the root to the deepest leaf"]] },
        { t: "analogy", text: "A family tree, upside down: the grandparent is at the top (root), children below, grandchildren below them. Folders on your computer are a tree too: a folder (node) contains sub-folders (children)." },
        { t: "h", text: "Step 2: Three ways to walk the tree (depth-first)" },
        { t: "table", head: ["Traversal", "Order", "Memory word", "Result for the tree above"], rows: [
          ["Preorder", "**Node**, left, right", "\"pre\" = node first", "1 2 4 5 3 6"],
          ["Inorder", "Left, **node**, right", "\"in\" = node in the middle", "4 2 5 1 3 6"],
          ["Postorder", "Left, right, **node**", "\"post\" = node last", "4 5 2 6 3 1"],
        ] },
        multi("Build a tree and print all three traversals", {
          python: src`
class Node:
    def __init__(self, data):
        self.data = data
        self.left = None           # left child
        self.right = None          # right child

def preorder(node, out):
    if node is None:               # empty subtree: nothing to do
        return
    out.append(node.data)          # 1. node
    preorder(node.left, out)       # 2. left subtree
    preorder(node.right, out)      # 3. right subtree

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)        # 1. left
    out.append(node.data)          # 2. node
    inorder(node.right, out)       # 3. right

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)      # 1. left
    postorder(node.right, out)     # 2. right
    out.append(node.data)          # 3. node

root = Node(1)                     # build the tree from the picture
root.left = Node(2)
root.right = Node(3)
root.left.left = Node(4)
root.left.right = Node(5)
root.right.right = Node(6)

for name, walk in [("Preorder", preorder), ("Inorder", inorder), ("Postorder", postorder)]:
    out = []
    walk(root, out)
    print(name + ":", *out)
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *left;     // left child
    struct Node *right;    // right child
};

struct Node *new_node(int data) {
    struct Node *n = malloc(sizeof(struct Node));
    n->data = data;
    n->left = n->right = NULL;     // no children yet
    return n;
}

void preorder(struct Node *node) {
    if (node == NULL) return;      // empty subtree: nothing to do
    printf(" %d", node->data);     // 1. node
    preorder(node->left);          // 2. left
    preorder(node->right);         // 3. right
}

void inorder(struct Node *node) {
    if (node == NULL) return;
    inorder(node->left);           // 1. left
    printf(" %d", node->data);     // 2. node
    inorder(node->right);          // 3. right
}

void postorder(struct Node *node) {
    if (node == NULL) return;
    postorder(node->left);         // 1. left
    postorder(node->right);        // 2. right
    printf(" %d", node->data);     // 3. node
}

void free_tree(struct Node *node) {    // free children first (postorder!)
    if (node == NULL) return;
    free_tree(node->left);
    free_tree(node->right);
    free(node);
}

int main(void) {
    struct Node *root = new_node(1);   // build the tree from the picture
    root->left = new_node(2);
    root->right = new_node(3);
    root->left->left = new_node(4);
    root->left->right = new_node(5);
    root->right->right = new_node(6);

    printf("Preorder:");  preorder(root);  printf("\n");
    printf("Inorder:");   inorder(root);   printf("\n");
    printf("Postorder:"); postorder(root); printf("\n");
    free_tree(root);
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left = nullptr;      // left child
    Node* right = nullptr;     // right child
    Node(int d) : data(d) {}
};

void preorder(Node* node) {
    if (!node) return;             // empty subtree
    cout << " " << node->data;     // 1. node
    preorder(node->left);          // 2. left
    preorder(node->right);         // 3. right
}

void inorder(Node* node) {
    if (!node) return;
    inorder(node->left);           // 1. left
    cout << " " << node->data;     // 2. node
    inorder(node->right);          // 3. right
}

void postorder(Node* node) {
    if (!node) return;
    postorder(node->left);         // 1. left
    postorder(node->right);        // 2. right
    cout << " " << node->data;     // 3. node
}

void freeTree(Node* node) {        // delete children first
    if (!node) return;
    freeTree(node->left);
    freeTree(node->right);
    delete node;
}

int main() {
    Node* root = new Node(1);      // build the tree from the picture
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->right = new Node(6);

    cout << "Preorder:";  preorder(root);  cout << endl;
    cout << "Inorder:";   inorder(root);   cout << endl;
    cout << "Postorder:"; postorder(root); cout << endl;
    freeTree(root);
    return 0;
}
`,
          java: src`
public class Main {
    static class Node {
        int data;
        Node left, right;          // children (null = none)
        Node(int d) { data = d; }
    }

    static void preorder(Node node, StringBuilder out) {
        if (node == null) return;              // empty subtree
        out.append(" ").append(node.data);     // 1. node
        preorder(node.left, out);              // 2. left
        preorder(node.right, out);             // 3. right
    }

    static void inorder(Node node, StringBuilder out) {
        if (node == null) return;
        inorder(node.left, out);               // 1. left
        out.append(" ").append(node.data);     // 2. node
        inorder(node.right, out);              // 3. right
    }

    static void postorder(Node node, StringBuilder out) {
        if (node == null) return;
        postorder(node.left, out);             // 1. left
        postorder(node.right, out);            // 2. right
        out.append(" ").append(node.data);     // 3. node
    }

    public static void main(String[] args) {
        Node root = new Node(1);               // build the tree from the picture
        root.left = new Node(2);
        root.right = new Node(3);
        root.left.left = new Node(4);
        root.left.right = new Node(5);
        root.right.right = new Node(6);

        StringBuilder pre = new StringBuilder("Preorder:");
        preorder(root, pre);
        System.out.println(pre);
        StringBuilder in = new StringBuilder("Inorder:");
        inorder(root, in);
        System.out.println(in);
        StringBuilder post = new StringBuilder("Postorder:");
        postorder(root, post);
        System.out.println(post);
    }
}
`,
          javascript: src`
class Node {
  constructor(data) {
    this.data = data;
    this.left = null;    // left child
    this.right = null;   // right child
  }
}

function preorder(node, out) {
  if (node === null) return;     // empty subtree
  out.push(node.data);           // 1. node
  preorder(node.left, out);      // 2. left
  preorder(node.right, out);     // 3. right
}

function inorder(node, out) {
  if (node === null) return;
  inorder(node.left, out);       // 1. left
  out.push(node.data);           // 2. node
  inorder(node.right, out);      // 3. right
}

function postorder(node, out) {
  if (node === null) return;
  postorder(node.left, out);     // 1. left
  postorder(node.right, out);    // 2. right
  out.push(node.data);           // 3. node
}

const root = new Node(1);        // build the tree from the picture
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.right = new Node(6);

for (const [name, walk] of [["Preorder", preorder], ["Inorder", inorder], ["Postorder", postorder]]) {
  const out = [];
  walk(root, out);
  console.log(name + ": " + out.join(" "));
}
`,
        }, "Preorder: 1 2 4 5 3 6\nInorder: 4 2 5 1 3 6\nPostorder: 4 5 2 6 3 1"),
        { t: "example", title: "Inorder, step by step", steps: [
          "At 1: first go left to 2.",
          "At 2: first go left to 4. 4 has no left → **print 4**, no right → back to 2.",
          "Left of 2 done → **print 2** → go right to 5 → **print 5** → back to 1.",
          "Left of 1 done → **print 1** → go right to 3.",
          "3 has no left → **print 3** → go right to 6 → **print 6**.",
        ], answer: "4 2 5 1 3 6" },
        { t: "trap", text: "Every recursive tree function **must** start with the base case `if node is None: return`. Without it, the program crashes when it reaches a missing child. Also remember: inorder gives sorted output **only for a BST** (lesson 3), not for any tree." },
        { t: "trick", text: "**Pre = node first, In = node in the middle, Post = node last. Left always comes before right.**" },
        { t: "exam", items: ["Write preorder, inorder and postorder (recursive and iterative using a stack).", "Given preorder and inorder, build the tree.", "Mirror (invert) a binary tree.", "Check if two trees are identical.", "Why does deleting a tree use postorder? (Children must be freed before the parent.)"] },
        { t: "recap", items: ["Binary tree: each node has at most 2 children", "Preorder: N L R · Inorder: L N R · Postorder: L R N", "Each traversal visits every node once: O(n)", "Base case: an empty node returns immediately"] },
      ],
      quiz: [
        { q: "Inorder visits nodes in which order?", options: ["Left, node, right", "Node, left, right", "Left, right, node", "Level by level"], answer: 0, explain: "The node is in the middle." },
        { q: "A node with no children is called a…", options: ["Leaf", "Root", "Parent", "Edge"], answer: 0, explain: "Leaves are at the bottom." },
        { q: "Preorder of: root A, left B, right C?", options: ["A B C", "B A C", "B C A", "C B A"], answer: 0, explain: "Node first." },
        { q: "Time to visit every node of a tree with n nodes?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 0, explain: "Each node is visited once." },
        { q: "Postorder of: root A, left B, right C?", options: ["B C A", "A B C", "B A C", "C A B"], answer: 0, explain: "Node last." },
      ],
    },
    {
      id: "level-order",
      title: "Level-order traversal and height",
      oneLine: "Level-order (breadth-first) visits the tree row by row using a queue. Height is found with one line of recursion: 1 + the taller of the two subtrees.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Row by row with a queue" },
        { t: "points", items: ["Put the root in a queue.", "While the queue isn't empty: note how many nodes are in it right now. That count is one whole level.", "Take out exactly that many nodes, print them, and add their children to the back of the queue.", "The children form the next level."] },
        { t: "diagram", text: "Queue over time:\n[1]          → print level 0: 1,     add 2, 3\n[2, 3]       → print level 1: 2 3,   add 4, 5, 6\n[4, 5, 6]    → print level 2: 4 5 6, no children\n[]           → done" },
        { t: "h", text: "Step 2: Height, nodes and leaves with recursion" },
        { t: "formula", items: [["height(empty)", "0"], ["height(node)", "1 + max(height(left), height(right))"]] },
        multi("Level order, height, count nodes and leaves", {
          python: src`
from collections import deque

class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

def level_order(root):
    queue = deque([root])
    level = 0
    while queue:
        size = len(queue)               # nodes in this level
        row = []
        for _ in range(size):
            node = queue.popleft()      # take from the front
            row.append(node.data)
            if node.left:
                queue.append(node.left)   # children go to the back
            if node.right:
                queue.append(node.right)
        print("Level " + str(level) + ":", *row)
        level += 1

def height(node):
    if node is None:
        return 0                        # empty tree has height 0
    return 1 + max(height(node.left), height(node.right))

def count_nodes(node):
    if node is None:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)

def count_leaves(node):
    if node is None:
        return 0
    if node.left is None and node.right is None:
        return 1                        # a leaf counts as 1
    return count_leaves(node.left) + count_leaves(node.right)

root = Node(1)
root.left, root.right = Node(2), Node(3)
root.left.left, root.left.right = Node(4), Node(5)
root.right.right = Node(6)

level_order(root)
print("Height:", height(root))
print("Nodes:", count_nodes(root))
print("Leaves:", count_leaves(root))
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *left, *right; };

struct Node *new_node(int d) {
    struct Node *n = malloc(sizeof(struct Node));
    n->data = d;
    n->left = n->right = NULL;
    return n;
}

void level_order(struct Node *root) {
    struct Node *queue[100];            // simple array queue
    int front = 0, back = 0, level = 0;
    queue[back++] = root;
    while (front < back) {
        int size = back - front;        // nodes in this level
        printf("Level %d:", level);
        for (int i = 0; i < size; i++) {
            struct Node *node = queue[front++];      // take from the front
            printf(" %d", node->data);
            if (node->left) queue[back++] = node->left;    // children to the back
            if (node->right) queue[back++] = node->right;
        }
        printf("\n");
        level++;
    }
}

int height(struct Node *node) {
    if (node == NULL) return 0;         // empty tree has height 0
    int lh = height(node->left), rh = height(node->right);
    return 1 + (lh > rh ? lh : rh);
}

int count_nodes(struct Node *node) {
    if (node == NULL) return 0;
    return 1 + count_nodes(node->left) + count_nodes(node->right);
}

int count_leaves(struct Node *node) {
    if (node == NULL) return 0;
    if (node->left == NULL && node->right == NULL) return 1;   // a leaf
    return count_leaves(node->left) + count_leaves(node->right);
}

void free_tree(struct Node *node) {
    if (!node) return;
    free_tree(node->left);
    free_tree(node->right);
    free(node);
}

int main(void) {
    struct Node *root = new_node(1);
    root->left = new_node(2);
    root->right = new_node(3);
    root->left->left = new_node(4);
    root->left->right = new_node(5);
    root->right->right = new_node(6);

    level_order(root);
    printf("Height: %d\n", height(root));
    printf("Nodes: %d\n", count_nodes(root));
    printf("Leaves: %d\n", count_leaves(root));
    free_tree(root);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <queue>
#include <algorithm>
using namespace std;

struct Node {
    int data;
    Node *left = nullptr, *right = nullptr;
    Node(int d) : data(d) {}
};

void levelOrder(Node* root) {
    queue<Node*> q;
    q.push(root);
    int level = 0;
    while (!q.empty()) {
        int size = q.size();             // nodes in this level
        cout << "Level " << level << ":";
        for (int i = 0; i < size; i++) {
            Node* node = q.front();      // take from the front
            q.pop();
            cout << " " << node->data;
            if (node->left) q.push(node->left);     // children to the back
            if (node->right) q.push(node->right);
        }
        cout << endl;
        level++;
    }
}

int height(Node* node) {
    if (!node) return 0;                 // empty tree has height 0
    return 1 + max(height(node->left), height(node->right));
}

int countNodes(Node* node) {
    if (!node) return 0;
    return 1 + countNodes(node->left) + countNodes(node->right);
}

int countLeaves(Node* node) {
    if (!node) return 0;
    if (!node->left && !node->right) return 1;   // a leaf
    return countLeaves(node->left) + countLeaves(node->right);
}

int main() {
    Node* root = new Node(1);
    root->left = new Node(2);
    root->right = new Node(3);
    root->left->left = new Node(4);
    root->left->right = new Node(5);
    root->right->right = new Node(6);

    levelOrder(root);
    cout << "Height: " << height(root) << endl;
    cout << "Nodes: " << countNodes(root) << endl;
    cout << "Leaves: " << countLeaves(root) << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayDeque;
import java.util.Queue;

public class Main {
    static class Node { int data; Node left, right; Node(int d) { data = d; } }

    static void levelOrder(Node root) {
        Queue<Node> queue = new ArrayDeque<>();
        queue.offer(root);
        int level = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();                 // nodes in this level
            StringBuilder row = new StringBuilder("Level " + level + ":");
            for (int i = 0; i < size; i++) {
                Node node = queue.poll();            // take from the front
                row.append(" ").append(node.data);
                if (node.left != null) queue.offer(node.left);    // children to the back
                if (node.right != null) queue.offer(node.right);
            }
            System.out.println(row);
            level++;
        }
    }

    static int height(Node node) {
        if (node == null) return 0;                  // empty tree has height 0
        return 1 + Math.max(height(node.left), height(node.right));
    }

    static int countNodes(Node node) {
        if (node == null) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    static int countLeaves(Node node) {
        if (node == null) return 0;
        if (node.left == null && node.right == null) return 1;   // a leaf
        return countLeaves(node.left) + countLeaves(node.right);
    }

    public static void main(String[] args) {
        Node root = new Node(1);
        root.left = new Node(2);
        root.right = new Node(3);
        root.left.left = new Node(4);
        root.left.right = new Node(5);
        root.right.right = new Node(6);

        levelOrder(root);
        System.out.println("Height: " + height(root));
        System.out.println("Nodes: " + countNodes(root));
        System.out.println("Leaves: " + countLeaves(root));
    }
}
`,
          javascript: src`
class Node {
  constructor(d) { this.data = d; this.left = null; this.right = null; }
}

function levelOrder(root) {
  const queue = [root];
  let head = 0;                          // index of the front (faster than shift)
  let level = 0;
  while (head < queue.length) {
    const size = queue.length - head;    // nodes in this level
    const row = [];
    for (let i = 0; i < size; i++) {
      const node = queue[head++];        // take from the front
      row.push(node.data);
      if (node.left) queue.push(node.left);     // children to the back
      if (node.right) queue.push(node.right);
    }
    console.log("Level " + level + ": " + row.join(" "));
    level++;
  }
}

function height(node) {
  if (node === null) return 0;           // empty tree has height 0
  return 1 + Math.max(height(node.left), height(node.right));
}

function countNodes(node) {
  if (node === null) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function countLeaves(node) {
  if (node === null) return 0;
  if (node.left === null && node.right === null) return 1;   // a leaf
  return countLeaves(node.left) + countLeaves(node.right);
}

const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.right = new Node(6);

levelOrder(root);
console.log("Height: " + height(root));
console.log("Nodes: " + countNodes(root));
console.log("Leaves: " + countLeaves(root));
`,
        }, "Level 0: 1\nLevel 1: 2 3\nLevel 2: 4 5 6\nHeight: 3\nNodes: 6\nLeaves: 3"),
        { t: "table", head: ["Call", "Left height", "Right height", "Returns"], rows: [
          ["height(4), height(5), height(6)", "0", "0", "1 each (leaves)"],
          ["height(2)", "1 (node 4)", "1 (node 5)", "1 + 1 = 2"],
          ["height(3)", "0 (empty)", "1 (node 6)", "1 + 1 = 2"],
          ["height(1)", "2", "2", "1 + 2 = **3**"],
        ], caption: "Height works from the bottom up" },
        { t: "trap", text: "Some books count height in **edges** (a single node has height 0), others in **nodes** (a single node has height 1). We count nodes here. In an interview, say which one you're using. In level order, save `size` **before** the inner loop: the queue grows while you add children." },
        { t: "trick", text: "**Level order = queue. Height = 1 + max(left, right).**" },
        { t: "exam", items: ["Level-order traversal.", "Height (maximum depth) of a binary tree.", "Left view / right view of a tree.", "Zigzag level order.", "Diameter of a binary tree.", "Check if a tree is balanced."] },
        { t: "recap", items: ["Level order uses a queue: O(n)", "Save the queue size to process one level at a time", "height = 1 + max(height(left), height(right)); empty = 0", "Count nodes: 1 + left + right; a leaf has no children"] },
      ],
      quiz: [
        { q: "Level-order traversal uses a…", options: ["Queue", "Stack", "Hash map", "Heap"], answer: 0, explain: "First in, first out keeps the rows in order." },
        { q: "Height of a single node (counting nodes)?", options: ["1", "0", "2", "Undefined"], answer: 0, explain: "1 + max(0, 0)." },
        { q: "Why save the queue size before the inner loop?", options: ["The queue grows as children are added", "To make it faster", "To sort it", "It isn't needed"], answer: 0, explain: "The size marks where one level ends." },
        { q: "Leaves in a tree where root 1 has children 2 and 3, and 2 has child 4?", options: ["2", "1", "3", "4"], answer: 0, explain: "Nodes 4 and 3." },
      ],
    },
    {
      id: "bst",
      title: "Binary search tree (BST)",
      oneLine: "In a BST every value on the left is smaller and every value on the right is bigger. So search, insert and min/max follow a single path down, like binary search: O(log n) when the tree is balanced.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: The BST rule" },
        { t: "diagram", text: "Insert 50, 30, 70, 20, 40, 60, 80:\n\n              50\n            /    \\\n          30      70\n         /  \\    /  \\\n       20   40  60   80\n\nleft of 50: all smaller   right of 50: all bigger" },
        { t: "p", text: "To insert: start at the root, go **left if smaller, right if bigger**, and put the new node in the first empty place. Search works the same way. And an **inorder** traversal of a BST prints the values **sorted**." },
        { t: "analogy", text: "Guessing a number with \"higher or lower\" hints. Each answer throws away half the possibilities, like binary search, but stored as a tree so you can also insert quickly." },
        multi("BST insert, search, min, max and sorted output", {
          python: src`
class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

def insert(node, value):
    if node is None:                    # found the empty spot
        return Node(value)
    if value < node.data:
        node.left = insert(node.left, value)     # smaller: go left
    else:
        node.right = insert(node.right, value)   # bigger: go right
    return node

def search(root, value):
    steps, cur = 0, root
    while cur is not None:
        steps += 1                      # one comparison
        if value == cur.data:
            return steps
        cur = cur.left if value < cur.data else cur.right
    return -1                           # fell off the tree: not found

def inorder(node, out):
    if node:
        inorder(node.left, out)
        out.append(node.data)
        inorder(node.right, out)

def find_min(node):
    while node.left:                    # keep going left
        node = node.left
    return node.data

def find_max(node):
    while node.right:                   # keep going right
        node = node.right
    return node.data

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)

out = []
inorder(root, out)
print("Inorder (sorted):", *out)
print("Search 60: found after", search(root, 60), "comparisons")
print("Search 65:", "not found" if search(root, 65) == -1 else "found")
print("Min: " + str(find_min(root)) + ", Max: " + str(find_max(root)))
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *left, *right; };

struct Node *insert(struct Node *node, int value) {
    if (node == NULL) {                         // found the empty spot
        struct Node *n = malloc(sizeof(struct Node));
        n->data = value;
        n->left = n->right = NULL;
        return n;
    }
    if (value < node->data) node->left = insert(node->left, value);    // go left
    else node->right = insert(node->right, value);                     // go right
    return node;
}

int search(struct Node *root, int value) {
    int steps = 0;
    struct Node *cur = root;
    while (cur != NULL) {
        steps++;                                // one comparison
        if (value == cur->data) return steps;
        cur = (value < cur->data) ? cur->left : cur->right;
    }
    return -1;                                  // not found
}

void inorder(struct Node *node) {
    if (!node) return;
    inorder(node->left);
    printf(" %d", node->data);
    inorder(node->right);
}

int find_min(struct Node *node) { while (node->left) node = node->left; return node->data; }
int find_max(struct Node *node) { while (node->right) node = node->right; return node->data; }

void free_tree(struct Node *node) {
    if (!node) return;
    free_tree(node->left);
    free_tree(node->right);
    free(node);
}

int main(void) {
    int values[] = {50, 30, 70, 20, 40, 60, 80};
    struct Node *root = NULL;
    for (int i = 0; i < 7; i++) root = insert(root, values[i]);

    printf("Inorder (sorted):"); inorder(root); printf("\n");
    printf("Search 60: found after %d comparisons\n", search(root, 60));
    printf("Search 65: %s\n", search(root, 65) == -1 ? "not found" : "found");
    printf("Min: %d, Max: %d\n", find_min(root), find_max(root));
    free_tree(root);
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node *left = nullptr, *right = nullptr;
    Node(int d) : data(d) {}
};

Node* insert(Node* node, int value) {
    if (!node) return new Node(value);                     // empty spot
    if (value < node->data) node->left = insert(node->left, value);   // go left
    else node->right = insert(node->right, value);                    // go right
    return node;
}

int search(Node* root, int value) {
    int steps = 0;
    for (Node* cur = root; cur; cur = (value < cur->data) ? cur->left : cur->right) {
        steps++;                                           // one comparison
        if (value == cur->data) return steps;
    }
    return -1;                                             // not found
}

void inorder(Node* node) {
    if (!node) return;
    inorder(node->left);
    cout << " " << node->data;
    inorder(node->right);
}

int findMin(Node* node) { while (node->left) node = node->left; return node->data; }
int findMax(Node* node) { while (node->right) node = node->right; return node->data; }

int main() {
    Node* root = nullptr;
    for (int v : {50, 30, 70, 20, 40, 60, 80}) root = insert(root, v);

    cout << "Inorder (sorted):"; inorder(root); cout << endl;
    cout << "Search 60: found after " << search(root, 60) << " comparisons" << endl;
    cout << "Search 65: " << (search(root, 65) == -1 ? "not found" : "found") << endl;
    cout << "Min: " << findMin(root) << ", Max: " << findMax(root) << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static class Node { int data; Node left, right; Node(int d) { data = d; } }

    static Node insert(Node node, int value) {
        if (node == null) return new Node(value);                       // empty spot
        if (value < node.data) node.left = insert(node.left, value);    // go left
        else node.right = insert(node.right, value);                    // go right
        return node;
    }

    static int search(Node root, int value) {
        int steps = 0;
        Node cur = root;
        while (cur != null) {
            steps++;                                                    // one comparison
            if (value == cur.data) return steps;
            cur = (value < cur.data) ? cur.left : cur.right;
        }
        return -1;                                                      // not found
    }

    static void inorder(Node node, StringBuilder out) {
        if (node == null) return;
        inorder(node.left, out);
        out.append(" ").append(node.data);
        inorder(node.right, out);
    }

    static int findMin(Node node) { while (node.left != null) node = node.left; return node.data; }
    static int findMax(Node node) { while (node.right != null) node = node.right; return node.data; }

    public static void main(String[] args) {
        Node root = null;
        for (int v : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, v);

        StringBuilder out = new StringBuilder("Inorder (sorted):");
        inorder(root, out);
        System.out.println(out);
        System.out.println("Search 60: found after " + search(root, 60) + " comparisons");
        System.out.println("Search 65: " + (search(root, 65) == -1 ? "not found" : "found"));
        System.out.println("Min: " + findMin(root) + ", Max: " + findMax(root));
    }
}
`,
          javascript: src`
class Node {
  constructor(d) { this.data = d; this.left = null; this.right = null; }
}

function insert(node, value) {
  if (node === null) return new Node(value);                        // empty spot
  if (value < node.data) node.left = insert(node.left, value);      // go left
  else node.right = insert(node.right, value);                      // go right
  return node;
}

function search(root, value) {
  let steps = 0, cur = root;
  while (cur !== null) {
    steps++;                                                        // one comparison
    if (value === cur.data) return steps;
    cur = value < cur.data ? cur.left : cur.right;
  }
  return -1;                                                        // not found
}

function inorder(node, out) {
  if (node === null) return;
  inorder(node.left, out);
  out.push(node.data);
  inorder(node.right, out);
}

function findMin(node) { while (node.left) node = node.left; return node.data; }
function findMax(node) { while (node.right) node = node.right; return node.data; }

let root = null;
for (const v of [50, 30, 70, 20, 40, 60, 80]) root = insert(root, v);

const out = [];
inorder(root, out);
console.log("Inorder (sorted): " + out.join(" "));
console.log("Search 60: found after " + search(root, 60) + " comparisons");
console.log("Search 65: " + (search(root, 65) === -1 ? "not found" : "found"));
console.log("Min: " + findMin(root) + ", Max: " + findMax(root));
`,
        }, "Inorder (sorted): 20 30 40 50 60 70 80\nSearch 60: found after 3 comparisons\nSearch 65: not found\nMin: 20, Max: 80"),
        { t: "table", head: ["Step", "At node", "Compare 65", "Go"], rows: [
          ["1", "50", "65 > 50", "right"],
          ["2", "70", "65 < 70", "left"],
          ["3", "60", "65 > 60", "right → empty"],
          ["", "", "", "**not found** after only 3 checks out of 7 nodes"],
        ], caption: "Dry run: search 65" },
        { t: "table", head: ["Operation", "Balanced BST", "Skewed BST (worst)"], rows: [["Search", "O(log n)", "O(n)"], ["Insert", "O(log n)", "O(n)"], ["Min / max", "O(log n)", "O(n)"], ["Inorder (sorted list)", "O(n)", "O(n)"]] },
        { t: "trap", text: "Inserting **already sorted** values (10, 20, 30, 40…) makes every node go right: the tree becomes a long chain (skewed), and search is O(n), no better than a list. Self-balancing trees (AVL, Red-Black) fix this; that's what Java's TreeMap and C++'s std::map use." },
        { t: "trick", text: "**Smaller → left, bigger → right. Inorder of a BST = sorted.**" },
        { t: "exam", items: ["Insert, search and delete in a BST (deletion has 3 cases: leaf, one child, two children).", "Check if a binary tree is a valid BST.", "Find the k-th smallest element in a BST.", "Lowest common ancestor in a BST.", "Why can a BST become O(n)? How do AVL trees fix it?"] },
        { t: "recap", items: ["BST: left < node < right, for every node", "Search and insert follow one path: O(height)", "Balanced: O(log n); skewed: O(n)", "Inorder traversal prints a BST in sorted order", "Min = leftmost node; max = rightmost node"] },
      ],
      quiz: [
        { q: "In a BST, where do values smaller than the root go?", options: ["Left subtree", "Right subtree", "Anywhere", "The root"], answer: 0, explain: "Smaller → left." },
        { q: "Inorder traversal of a BST gives…", options: ["Sorted order", "Reverse order", "Level order", "Random order"], answer: 0, explain: "Left (smaller), node, right (bigger)." },
        { q: "Search time in a balanced BST?", options: ["O(log n)", "O(n)", "O(1)", "O(n²)"], answer: 0, explain: "Each step halves the remaining tree." },
        { q: "Inserting 1, 2, 3, 4, 5 in order makes the BST…", options: ["Skewed (a chain)", "Perfectly balanced", "Empty", "A heap"], answer: 0, explain: "Every node goes to the right." },
        { q: "The minimum value in a BST is at…", options: ["The leftmost node", "The root", "The rightmost node", "Any leaf"], answer: 0, explain: "Keep going left." },
      ],
    },
  ],
};

export const DSA09_HEAPS: LearnModule = {
  id: "heaps",
  title: "Heaps and priority queues",
  titleHi: "हीप और प्रायोरिटी क्यू",
  blurb: "A tree stored inside an array that always gives you the smallest (or largest) item in O(1): build a min-heap from scratch, then find the k largest items.",
  lessons: [
    {
      id: "min-heap",
      title: "Min-heap from scratch",
      oneLine: "A min-heap is a complete binary tree where every parent is smaller than its children, so the smallest item is always at the top. It's stored in a plain array: the children of index i are at 2i+1 and 2i+2.",
      minutes: 22,
      blocks: [
        { t: "h", text: "Step 1: A tree inside an array" },
        { t: "diagram", text: "Heap array: [1, 3, 2, 5, 9, 8]\nindex:       0  1  2  3  4  5\n\n             1   (i=0)\n           /   \\\n      (1) 3     2 (2)\n         / \\   /\n    (3) 5  9  8 (5)\n          (4)\n\nchildren of i: 2i+1 and 2i+2      parent of i: (i-1)/2 (rounded down)" },
        { t: "table", head: ["Operation", "How", "Time"], rows: [["peek (smallest)", "Read index 0", "O(1)"], ["push", "Add at the end, then **sift up**: swap with the parent while smaller", "O(log n)"], ["pop (smallest)", "Take index 0, move the last item to the top, then **sift down**: swap with the smaller child while bigger", "O(log n)"]] },
        { t: "analogy", text: "A hospital emergency room: patients don't wait first-come-first-served. The most urgent one is always treated next. A heap is that waiting room: it doesn't keep everyone sorted, it just always knows who's most urgent." },
        { t: "h", text: "Step 2: Build it" },
        multi("Min-heap: push, sift up, pop, sift down", {
          python: src`
class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        self.a.append(x)                    # 1. add at the end
        i = len(self.a) - 1
        while i > 0:                        # 2. sift up
            parent = (i - 1) // 2
            if self.a[i] >= self.a[parent]:
                break                       # parent is smaller: heap is fine
            self.a[i], self.a[parent] = self.a[parent], self.a[i]
            i = parent

    def pop(self):
        top = self.a[0]                     # the smallest item
        last = self.a.pop()                 # remove the last item
        if self.a:
            self.a[0] = last                # move it to the top
            i, n = 0, len(self.a)
            while True:                     # sift down
                left, right = 2 * i + 1, 2 * i + 2
                smallest = i
                if left < n and self.a[left] < self.a[smallest]:
                    smallest = left
                if right < n and self.a[right] < self.a[smallest]:
                    smallest = right
                if smallest == i:
                    break                   # both children are bigger: done
                self.a[i], self.a[smallest] = self.a[smallest], self.a[i]
                i = smallest
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
print("Heap array:", *h.a)
print("Popped in order:", *[h.pop() for _ in range(6)])
`,
          c: src`
#include <stdio.h>

int heap[100];
int size = 0;

void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

void push(int x) {
    heap[size] = x;                     // 1. add at the end
    int i = size++;
    while (i > 0) {                     // 2. sift up
        int parent = (i - 1) / 2;
        if (heap[i] >= heap[parent]) break;    // parent is smaller: fine
        swap(&heap[i], &heap[parent]);
        i = parent;
    }
}

int pop(void) {
    int top = heap[0];                  // the smallest item
    heap[0] = heap[--size];             // move the last item to the top
    int i = 0;
    while (1) {                         // sift down
        int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;       // both children are bigger: done
        swap(&heap[i], &heap[smallest]);
        i = smallest;
    }
    return top;
}

int main(void) {
    int values[] = {5, 3, 8, 1, 9, 2};
    for (int i = 0; i < 6; i++) push(values[i]);

    printf("Heap array:");
    for (int i = 0; i < size; i++) printf(" %d", heap[i]);
    printf("\n");

    printf("Popped in order:");
    while (size > 0) printf(" %d", pop());
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

class MinHeap {
public:
    vector<int> a;

    void push(int x) {
        a.push_back(x);                       // 1. add at the end
        int i = a.size() - 1;
        while (i > 0) {                       // 2. sift up
            int parent = (i - 1) / 2;
            if (a[i] >= a[parent]) break;     // parent is smaller: fine
            swap(a[i], a[parent]);
            i = parent;
        }
    }

    int pop() {
        int top = a[0];                       // the smallest item
        a[0] = a.back();                      // move the last item to the top
        a.pop_back();
        int i = 0, n = a.size();
        while (true) {                        // sift down
            int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
            if (left < n && a[left] < a[smallest]) smallest = left;
            if (right < n && a[right] < a[smallest]) smallest = right;
            if (smallest == i) break;         // both children are bigger
            swap(a[i], a[smallest]);
            i = smallest;
        }
        return top;
    }
};

int main() {
    MinHeap h;
    for (int x : {5, 3, 8, 1, 9, 2}) h.push(x);

    cout << "Heap array:";
    for (int x : h.a) cout << " " << x;
    cout << endl;

    cout << "Popped in order:";
    while (!h.a.empty()) cout << " " << h.pop();
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<Integer> a = new ArrayList<>();

    static void swap(int i, int j) { int t = a.get(i); a.set(i, a.get(j)); a.set(j, t); }

    static void push(int x) {
        a.add(x);                                 // 1. add at the end
        int i = a.size() - 1;
        while (i > 0) {                           // 2. sift up
            int parent = (i - 1) / 2;
            if (a.get(i) >= a.get(parent)) break; // parent is smaller: fine
            swap(i, parent);
            i = parent;
        }
    }

    static int pop() {
        int top = a.get(0);                       // the smallest item
        int last = a.remove(a.size() - 1);        // remove the last item
        if (!a.isEmpty()) {
            a.set(0, last);                       // move it to the top
            int i = 0, n = a.size();
            while (true) {                        // sift down
                int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
                if (left < n && a.get(left) < a.get(smallest)) smallest = left;
                if (right < n && a.get(right) < a.get(smallest)) smallest = right;
                if (smallest == i) break;         // both children are bigger
                swap(i, smallest);
                i = smallest;
            }
        }
        return top;
    }

    public static void main(String[] args) {
        for (int x : new int[]{5, 3, 8, 1, 9, 2}) push(x);

        StringBuilder sb = new StringBuilder("Heap array:");
        for (int x : a) sb.append(" ").append(x);
        System.out.println(sb);

        StringBuilder popped = new StringBuilder("Popped in order:");
        while (!a.isEmpty()) popped.append(" ").append(pop());
        System.out.println(popped);
    }
}
`,
          javascript: src`
class MinHeap {
  constructor() { this.a = []; }

  push(x) {
    const a = this.a;
    a.push(x);                                // 1. add at the end
    let i = a.length - 1;
    while (i > 0) {                           // 2. sift up
      const parent = Math.floor((i - 1) / 2);
      if (a[i] >= a[parent]) break;           // parent is smaller: fine
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  pop() {
    const a = this.a;
    const top = a[0];                         // the smallest item
    const last = a.pop();                     // remove the last item
    if (a.length > 0) {
      a[0] = last;                            // move it to the top
      let i = 0;
      while (true) {                          // sift down
        const left = 2 * i + 1, right = 2 * i + 2;
        let smallest = i;
        if (left < a.length && a[left] < a[smallest]) smallest = left;
        if (right < a.length && a[right] < a[smallest]) smallest = right;
        if (smallest === i) break;            // both children are bigger
        [a[i], a[smallest]] = [a[smallest], a[i]];
        i = smallest;
      }
    }
    return top;
  }
}

const h = new MinHeap();
for (const x of [5, 3, 8, 1, 9, 2]) h.push(x);
console.log("Heap array: " + h.a.join(" "));
const popped = [];
while (h.a.length > 0) popped.push(h.pop());
console.log("Popped in order: " + popped.join(" "));
`,
        }, "Heap array: 1 3 2 5 9 8\nPopped in order: 1 2 3 5 8 9"),
        { t: "table", head: ["Push", "Added at", "Sift up swaps", "Array after"], rows: [
          ["5", "0", "–", "5"],
          ["3", "1", "3 < 5 → swap", "3 5"],
          ["8", "2", "8 > 3 → stop", "3 5 8"],
          ["1", "3", "1 < 5 swap, 1 < 3 swap", "1 3 8 5"],
          ["9", "4", "9 > 3 → stop", "1 3 8 5 9"],
          ["2", "5", "2 < 8 swap, 2 > 1 stop", "**1 3 2 5 9 8**"],
        ], caption: "Dry run of the pushes" },
        { t: "p", text: "Popping everything from a heap gives the items in sorted order. That's **heap sort**: O(n log n). Built-in heaps: Python `heapq`, C++ `priority_queue` (a max-heap by default), Java `PriorityQueue` (a min-heap by default). JavaScript has none, so you write a class like the one above." },
        { t: "trap", text: "A heap is **not sorted**: `[1, 3, 2, 5, 9, 8]` is a valid heap. Only the top is guaranteed to be the smallest. Searching a heap for an arbitrary value is O(n). And C++'s `priority_queue` gives the **largest** first unless you use `greater<int>`." },
        { t: "trick", text: "**Children 2i+1, 2i+2; parent (i−1)/2. Push → sift up. Pop → sift down.**" },
        { t: "exam", items: ["Implement a min-heap or max-heap.", "Heap sort, and its time complexity.", "Why is building a heap from an array O(n)?", "Heap vs BST: which is better for finding the min repeatedly?", "Merge k sorted lists using a heap."] },
        { t: "recap", items: ["Min-heap: every parent ≤ its children; smallest at index 0", "Stored in an array: children 2i+1 and 2i+2", "push and pop are O(log n); peek is O(1)", "A heap is a priority queue: always serve the most important item next"] },
      ],
      quiz: [
        { q: "Where is the smallest item in a min-heap?", options: ["Index 0 (the root)", "The last index", "The middle", "Anywhere"], answer: 0, explain: "The root is always the minimum." },
        { q: "The children of index 2 are at…", options: ["5 and 6", "3 and 4", "4 and 5", "1 and 2"], answer: 0, explain: "2·2+1 = 5, 2·2+2 = 6." },
        { q: "Time to pop from a heap?", options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"], answer: 0, explain: "Sift down follows one path of height log n." },
        { q: "Is [1, 3, 2, 5, 9, 8] sorted?", options: ["No, but it's a valid min-heap", "Yes", "It isn't a heap", "Only in Java"], answer: 0, explain: "A heap only guarantees parent ≤ children." },
      ],
    },
    {
      id: "k-largest",
      title: "Top-K with a heap",
      oneLine: "To find the k largest numbers, keep a min-heap of size k. Push each number, and if the heap gets bigger than k, pop the smallest. At the end, the heap holds the k largest, and its top is the k-th largest.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: Why a MIN-heap for the LARGEST?" },
        { t: "p", text: "The heap is a club with k seats. The top of the min-heap is the **weakest member**. When a new number comes, it joins; if the club has more than k members, the weakest is thrown out. Only the k strongest survive." },
        { t: "table", head: ["Approach", "Time", "Note"], rows: [["Sort, then take the last k", "O(n log n)", "Simple"], ["Min-heap of size k", "**O(n log k)**", "Faster when k is small; works on a stream of data"]] },
        multi("3 largest of [3, 1, 5, 12, 2, 11]", {
          python: src`
import heapq                            # Python's built-in min-heap

def k_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)         # join the club
        if len(heap) > k:
            heapq.heappop(heap)         # too many: remove the smallest
    return heap

heap = k_largest([3, 1, 5, 12, 2, 11], 3)
print("3rd largest:", heap[0])          # the top is the k-th largest
result = [heapq.heappop(heap) for _ in range(len(heap))]
print("3 largest:", *result)
`,
          c: src`
#include <stdio.h>

int heap[100], size = 0;               // a small min-heap (see the previous lesson)

void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

void push(int x) {
    int i = size++;
    heap[i] = x;
    while (i > 0 && heap[i] < heap[(i - 1) / 2]) {     // sift up
        swap(&heap[i], &heap[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

int pop(void) {
    int top = heap[0];
    heap[0] = heap[--size];
    int i = 0;
    while (1) {                                         // sift down
        int l = 2 * i + 1, r = 2 * i + 2, s = i;
        if (l < size && heap[l] < heap[s]) s = l;
        if (r < size && heap[r] < heap[s]) s = r;
        if (s == i) break;
        swap(&heap[i], &heap[s]);
        i = s;
    }
    return top;
}

int main(void) {
    int nums[] = {3, 1, 5, 12, 2, 11};
    int k = 3;
    for (int i = 0; i < 6; i++) {
        push(nums[i]);                 // join the club
        if (size > k) pop();           // too many: remove the smallest
    }
    printf("3rd largest: %d\n", heap[0]);   // the top is the k-th largest
    printf("3 largest:");
    while (size > 0) printf(" %d", pop());
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <queue>
#include <functional>
using namespace std;

int main() {
    vector<int> nums = {3, 1, 5, 12, 2, 11};
    int k = 3;
    priority_queue<int, vector<int>, greater<int>> heap;   // greater = MIN-heap

    for (int x : nums) {
        heap.push(x);                  // join the club
        if ((int)heap.size() > k) heap.pop();   // too many: remove the smallest
    }

    cout << "3rd largest: " << heap.top() << endl;   // the top is the k-th largest
    cout << "3 largest:";
    while (!heap.empty()) { cout << " " << heap.top(); heap.pop(); }
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        int[] nums = {3, 1, 5, 12, 2, 11};
        int k = 3;
        PriorityQueue<Integer> heap = new PriorityQueue<>();   // a MIN-heap by default

        for (int x : nums) {
            heap.offer(x);                     // join the club
            if (heap.size() > k) heap.poll();  // too many: remove the smallest
        }

        System.out.println("3rd largest: " + heap.peek());   // the top is the k-th largest
        StringBuilder sb = new StringBuilder("3 largest:");
        while (!heap.isEmpty()) sb.append(" ").append(heap.poll());
        System.out.println(sb);
    }
}
`,
          javascript: src`
// JavaScript has no built-in heap, so here's a compact one
class MinHeap {
  constructor() { this.a = []; }
  size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0 && a[i] < a[Math.floor((i - 1) / 2)]) {   // sift up
      const p = Math.floor((i - 1) / 2);
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {                                        // sift down
        const l = 2 * i + 1, r = 2 * i + 2;
        let s = i;
        if (l < a.length && a[l] < a[s]) s = l;
        if (r < a.length && a[r] < a[s]) s = r;
        if (s === i) break;
        [a[i], a[s]] = [a[s], a[i]];
        i = s;
      }
    }
    return top;
  }
}

const nums = [3, 1, 5, 12, 2, 11];
const k = 3;
const heap = new MinHeap();
for (const x of nums) {
  heap.push(x);                    // join the club
  if (heap.size() > k) heap.pop(); // too many: remove the smallest
}
console.log("3rd largest: " + heap.peek());   // the top is the k-th largest
const result = [];
while (heap.size() > 0) result.push(heap.pop());
console.log("3 largest: " + result.join(" "));
`,
        }, "3rd largest: 5\n3 largest: 5 11 12"),
        { t: "table", head: ["x", "Push", "Size > 3?", "Heap after (sorted for reading)"], rows: [
          ["3", "3", "no", "3"],
          ["1", "1", "no", "1 3"],
          ["5", "5", "no", "1 3 5"],
          ["12", "12", "yes → pop 1", "3 5 12"],
          ["2", "2", "yes → pop 2", "3 5 12"],
          ["11", "11", "yes → pop 3", "**5 11 12**"],
        ] },
        { t: "trap", text: "For the k **largest**, use a **min**-heap (to throw out the smallest). For the k **smallest**, use a **max**-heap. Mixing these up is the classic mistake. In Python, a max-heap is made by pushing negative numbers: `heappush(h, -x)`." },
        { t: "trick", text: "**k largest → min-heap of size k. k smallest → max-heap of size k.**" },
        { t: "exam", items: ["K-th largest element in an array.", "Top k frequent elements (hash map + heap).", "K closest points to the origin.", "Find the median of a data stream (two heaps).", "Merge k sorted arrays."] },
        { t: "recap", items: ["Keep a min-heap of size k; pop whenever it exceeds k", "At the end, the heap = the k largest; its top = the k-th largest", "O(n log k) time, O(k) space", "Python heapq, C++ priority_queue with greater<int>, Java PriorityQueue"] },
      ],
      quiz: [
        { q: "To find the k largest numbers, use a…", options: ["Min-heap of size k", "Max-heap of size n", "Stack", "Sorted list only"], answer: 0, explain: "The min-heap throws out the smallest." },
        { q: "After processing, the top of that heap is…", options: ["The k-th largest", "The largest", "The smallest overall", "The median"], answer: 0, explain: "It's the weakest of the top k." },
        { q: "Time complexity?", options: ["O(n log k)", "O(n²)", "O(k)", "O(log n)"], answer: 0, explain: "n pushes on a heap of size k." },
        { q: "C++ priority_queue<int> by default is a…", options: ["Max-heap", "Min-heap", "Stack", "Queue"], answer: 0, explain: "Use greater<int> for a min-heap." },
      ],
    },
  ],
};
