import type { LearnModule } from "../types";
import { multi, src } from "./helpers";

/** DSA modules 5–7: linked lists, stacks and queues, hashing. */
export const DSA05_LINKED_LISTS: LearnModule = {
  id: "linked-lists",
  title: "Linked lists",
  titleHi: "लिंक्ड लिस्ट",
  blurb: "Nodes connected by pointers: build a list, insert, delete, reverse, and the fast-and-slow pointer trick.",
  lessons: [
    {
      id: "linked-list-basics",
      title: "Linked list: nodes and pointers",
      oneLine: "A linked list is a chain of nodes. Each node holds data and a pointer (link) to the next node. Adding at the front is O(1), with no shifting like arrays.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Array vs linked list" },
        { t: "diagram", text: "Array (side by side):        [10][20][30]\n\nLinked list (scattered, connected by links):\n\n head\n  │\n  ▼\n┌────┬───┐    ┌────┬───┐    ┌────┬──────┐\n│ 10 │ ●─┼──▶ │ 20 │ ●─┼──▶ │ 30 │ NULL │\n└────┴───┘    └────┴───┘    └────┴──────┘\n data  next" },
        { t: "table", head: ["", "Array", "Linked list"], rows: [["Get the i-th item", "O(1), jump straight there", "O(n), walk from the head"], ["Insert at the front", "O(n), shift everything", "**O(1)**, just change links"], ["Size", "Fixed (or resized by copying)", "Grows one node at a time"], ["Memory", "Compact", "Extra space for each next pointer"]] },
        { t: "p", text: "The last node points to **nothing**: `None` in Python, `NULL` in C, `nullptr` in C++, `null` in Java and JavaScript. We print it as NULL in every version." },
        { t: "analogy", text: "A linked list is a treasure hunt: each clue (node) has a prize (data) and tells you where the next clue is (next). To reach clue 5, you must follow clues 1, 2, 3 and 4 first. Adding a new first clue is easy: write it and point it at the old first clue." },
        { t: "h", text: "Step 2: Build a list, insert at head and tail" },
        multi("Create, insert and print a linked list", {
          python: src`
class Node:
    def __init__(self, data):
        self.data = data          # the value stored in this node
        self.next = None          # link to the next node (None = no next node yet)

def insert_at_head(head, data):
    node = Node(data)
    node.next = head              # new node points to the old first node
    return node                   # the new node is the new head

def insert_at_tail(head, data):
    node = Node(data)
    if head is None:              # empty list: the new node is the whole list
        return node
    cur = head
    while cur.next is not None:   # walk to the last node
        cur = cur.next
    cur.next = node               # link the last node to the new one
    return head

def print_list(head):
    parts = []
    cur = head
    while cur is not None:        # visit every node
        parts.append(str(cur.data))
        cur = cur.next            # move along the link
    print(" -> ".join(parts + ["NULL"]))

def length(head):
    count, cur = 0, head
    while cur is not None:
        count += 1
        cur = cur.next
    return count

head = None                       # an empty list
for x in [10, 20, 30]:
    head = insert_at_tail(head, x)
print_list(head)
head = insert_at_head(head, 5)
print_list(head)
print("Length:", length(head))
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;                 // the value stored in this node
    struct Node *next;        // pointer to the next node (NULL = none)
};

struct Node *new_node(int data) {
    struct Node *node = malloc(sizeof(struct Node));   // ask for memory
    node->data = data;
    node->next = NULL;
    return node;
}

struct Node *insert_at_head(struct Node *head, int data) {
    struct Node *node = new_node(data);
    node->next = head;        // new node points to the old first node
    return node;              // new node is the new head
}

struct Node *insert_at_tail(struct Node *head, int data) {
    struct Node *node = new_node(data);
    if (head == NULL) return node;          // empty list
    struct Node *cur = head;
    while (cur->next != NULL) cur = cur->next;   // walk to the last node
    cur->next = node;                       // link it to the new node
    return head;
}

void print_list(struct Node *head) {
    for (struct Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->data);        // visit every node
    }
    printf("NULL\n");
}

int length(struct Node *head) {
    int count = 0;
    for (struct Node *cur = head; cur != NULL; cur = cur->next) count++;
    return count;
}

int main(void) {
    struct Node *head = NULL;               // an empty list
    head = insert_at_tail(head, 10);
    head = insert_at_tail(head, 20);
    head = insert_at_tail(head, 30);
    print_list(head);
    head = insert_at_head(head, 5);
    print_list(head);
    printf("Length: %d\n", length(head));

    while (head != NULL) {                  // free the memory when done
        struct Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}
`,
          cpp: src`
#include <iostream>
using namespace std;

struct Node {
    int data;                    // the value stored in this node
    Node* next;                  // pointer to the next node
    Node(int d) : data(d), next(nullptr) {}
};

Node* insertAtHead(Node* head, int data) {
    Node* node = new Node(data);
    node->next = head;           // new node points to the old first node
    return node;                 // new node is the new head
}

Node* insertAtTail(Node* head, int data) {
    Node* node = new Node(data);
    if (head == nullptr) return node;        // empty list
    Node* cur = head;
    while (cur->next != nullptr) cur = cur->next;   // walk to the last node
    cur->next = node;                        // link it to the new node
    return head;
}

void printList(Node* head) {
    for (Node* cur = head; cur != nullptr; cur = cur->next) cout << cur->data << " -> ";
    cout << "NULL" << endl;
}

int length(Node* head) {
    int count = 0;
    for (Node* cur = head; cur != nullptr; cur = cur->next) count++;
    return count;
}

int main() {
    Node* head = nullptr;                    // an empty list
    for (int x : {10, 20, 30}) head = insertAtTail(head, x);
    printList(head);
    head = insertAtHead(head, 5);
    printList(head);
    cout << "Length: " << length(head) << endl;

    while (head != nullptr) {                // free the memory
        Node* next = head->next;
        delete head;
        head = next;
    }
    return 0;
}
`,
          java: src`
public class Main {
    static class Node {
        int data;          // the value stored in this node
        Node next;         // link to the next node (null = none)
        Node(int data) { this.data = data; }
    }

    static Node insertAtHead(Node head, int data) {
        Node node = new Node(data);
        node.next = head;          // new node points to the old first node
        return node;               // new node is the new head
    }

    static Node insertAtTail(Node head, int data) {
        Node node = new Node(data);
        if (head == null) return node;           // empty list
        Node cur = head;
        while (cur.next != null) cur = cur.next; // walk to the last node
        cur.next = node;                         // link it to the new node
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.data).append(" -> ");
        System.out.println(sb + "NULL");
    }

    static int length(Node head) {
        int count = 0;
        for (Node cur = head; cur != null; cur = cur.next) count++;
        return count;
    }

    public static void main(String[] args) {
        Node head = null;                        // an empty list
        for (int x : new int[]{10, 20, 30}) head = insertAtTail(head, x);
        printList(head);
        head = insertAtHead(head, 5);
        printList(head);
        System.out.println("Length: " + length(head));
    }
}
`,
          javascript: src`
class Node {
  constructor(data) {
    this.data = data;    // the value stored in this node
    this.next = null;    // link to the next node (null = none)
  }
}

function insertAtHead(head, data) {
  const node = new Node(data);
  node.next = head;      // new node points to the old first node
  return node;           // new node is the new head
}

function insertAtTail(head, data) {
  const node = new Node(data);
  if (head === null) return node;          // empty list
  let cur = head;
  while (cur.next !== null) cur = cur.next; // walk to the last node
  cur.next = node;                         // link it to the new node
  return head;
}

function printList(head) {
  let line = "";
  for (let cur = head; cur !== null; cur = cur.next) line += cur.data + " -> ";
  console.log(line + "NULL");
}

function length(head) {
  let count = 0;
  for (let cur = head; cur !== null; cur = cur.next) count++;
  return count;
}

let head = null;                           // an empty list
for (const x of [10, 20, 30]) head = insertAtTail(head, x);
printList(head);
head = insertAtHead(head, 5);
printList(head);
console.log("Length: " + length(head));
`,
        }, "10 -> 20 -> 30 -> NULL\n5 -> 10 -> 20 -> 30 -> NULL\nLength: 4"),
        { t: "example", title: "insert_at_head(head, 5), step by step", steps: [
          "Before: head → 10 → 20 → 30 → NULL.",
          "Create a new node 5 whose next is empty.",
          "Set `node.next = head`: now 5 → 10 → 20 → 30.",
          "Return the new node as the new head. No other node was touched: O(1).",
        ], answer: "Inserting at the head only changes one link." },
        { t: "trap", text: "Always check for an **empty list** (`head == NULL`) before using `head.next`, or the program crashes with a null pointer error. And never lose the head: walk with a separate variable `cur`, not with head itself. In C and C++, free the nodes when you're done." },
        { t: "trick", text: "**Walk a list with: cur = head; while cur != NULL: …; cur = cur.next.**" },
        { t: "exam", items: ["What is a linked list? How is it different from an array?", "Insert at the head, the tail and a given position.", "Find the length of a linked list.", "Singly vs doubly linked list? (Doubly has a prev pointer too.)", "Why is accessing the k-th element O(n)?"] },
        { t: "recap", items: ["A node = data + a pointer to the next node", "head points to the first node; the last node points to NULL", "Insert at the head: O(1); at the tail: O(n) (walk to the end)", "Traverse with cur = cur.next until NULL"] },
      ],
      quiz: [
        { q: "What does each node of a singly linked list contain?", options: ["Data and a pointer to the next node", "Only data", "Two pointers only", "An index"], answer: 0, explain: "A doubly linked list also has prev." },
        { q: "Time to insert at the head of a linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explain: "Only one link changes." },
        { q: "Time to access the 5th element?", options: ["O(n)", "O(1)", "O(log n)", "Impossible"], answer: 0, explain: "You must walk from the head." },
        { q: "The last node's next pointer is…", options: ["NULL (None/null)", "The head", "0", "Itself"], answer: 0, explain: "It marks the end of the list." },
      ],
    },
    {
      id: "delete-reverse",
      title: "Deleting and reversing a linked list",
      oneLine: "To delete a node, make the previous node skip over it. To reverse a list, walk through it once and turn every arrow around, using three pointers: prev, cur and next.",
      minutes: 20,
      blocks: [
        { t: "h", text: "Step 1: Delete by skipping" },
        { t: "diagram", text: "Delete 3:\n\n1 → 2 → 3 → 4 → 5          prev = node 2, cur = node 3\n        └──────┘\n1 → 2 ─────→ 4 → 5          prev.next = cur.next" },
        { t: "h", text: "Step 2: Reverse by turning the arrows" },
        { t: "diagram", text: "Before:  NULL   1 → 2 → 3 → NULL\n\nEach step:  next = cur.next      (remember where to go)\n            cur.next = prev      (turn the arrow back)\n            prev = cur           (move prev forward)\n            cur = next           (move cur forward)\n\nAfter:   NULL ← 1 ← 2 ← 3      (prev is the new head)" },
        multi("Delete a value and reverse the list", {
          python: src`
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def build(values):                  # make a list from an array
    head = None
    for v in reversed(values):
        node = Node(v)
        node.next = head
        head = node
    return head

def to_text(head):
    parts, cur = [], head
    while cur:
        parts.append(str(cur.data))
        cur = cur.next
    return " -> ".join(parts + ["NULL"])

def delete_value(head, value):
    if head is None:
        return None
    if head.data == value:          # deleting the first node
        return head.next
    prev, cur = head, head.next
    while cur is not None:
        if cur.data == value:
            prev.next = cur.next    # skip over cur
            break
        prev, cur = cur, cur.next
    return head

def reverse(head):
    prev, cur = None, head
    while cur is not None:
        nxt = cur.next              # 1. remember the next node
        cur.next = prev             # 2. turn the arrow back
        prev = cur                  # 3. move prev forward
        cur = nxt                   # 4. move cur forward
    return prev                     # prev is the new head

head = build([1, 2, 3, 4, 5])
print("Original:", to_text(head))
head = delete_value(head, 3)
print("After deleting 3:", to_text(head))
head = reverse(head)
print("Reversed:", to_text(head))
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *next; };

struct Node *build(int values[], int n) {     // make a list from an array
    struct Node *head = NULL;
    for (int i = n - 1; i >= 0; i--) {
        struct Node *node = malloc(sizeof(struct Node));
        node->data = values[i];
        node->next = head;
        head = node;
    }
    return head;
}

void print_list(const char *label, struct Node *head) {
    printf("%s ", label);
    for (struct Node *cur = head; cur; cur = cur->next) printf("%d -> ", cur->data);
    printf("NULL\n");
}

struct Node *delete_value(struct Node *head, int value) {
    if (head == NULL) return NULL;
    if (head->data == value) {               // deleting the first node
        struct Node *rest = head->next;
        free(head);
        return rest;
    }
    struct Node *prev = head, *cur = head->next;
    while (cur != NULL) {
        if (cur->data == value) {
            prev->next = cur->next;          // skip over cur
            free(cur);
            break;
        }
        prev = cur;
        cur = cur->next;
    }
    return head;
}

struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        struct Node *next = cur->next;   // 1. remember the next node
        cur->next = prev;                // 2. turn the arrow back
        prev = cur;                      // 3. move prev forward
        cur = next;                      // 4. move cur forward
    }
    return prev;                         // prev is the new head
}

int main(void) {
    int values[] = {1, 2, 3, 4, 5};
    struct Node *head = build(values, 5);
    print_list("Original:", head);
    head = delete_value(head, 3);
    print_list("After deleting 3:", head);
    head = reverse(head);
    print_list("Reversed:", head);
    while (head) { struct Node *n = head->next; free(head); head = n; }
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

struct Node { int data; Node* next; Node(int d) : data(d), next(nullptr) {} };

Node* build(const vector<int>& values) {        // make a list from an array
    Node* head = nullptr;
    for (int i = (int)values.size() - 1; i >= 0; i--) {
        Node* node = new Node(values[i]);
        node->next = head;
        head = node;
    }
    return head;
}

void printList(const string& label, Node* head) {
    cout << label << " ";
    for (Node* cur = head; cur; cur = cur->next) cout << cur->data << " -> ";
    cout << "NULL" << endl;
}

Node* deleteValue(Node* head, int value) {
    if (!head) return nullptr;
    if (head->data == value) {                  // deleting the first node
        Node* rest = head->next;
        delete head;
        return rest;
    }
    Node *prev = head, *cur = head->next;
    while (cur) {
        if (cur->data == value) {
            prev->next = cur->next;             // skip over cur
            delete cur;
            break;
        }
        prev = cur;
        cur = cur->next;
    }
    return head;
}

Node* reverse(Node* head) {
    Node *prev = nullptr, *cur = head;
    while (cur) {
        Node* next = cur->next;   // 1. remember the next node
        cur->next = prev;         // 2. turn the arrow back
        prev = cur;               // 3. move prev forward
        cur = next;               // 4. move cur forward
    }
    return prev;                  // prev is the new head
}

int main() {
    Node* head = build({1, 2, 3, 4, 5});
    printList("Original:", head);
    head = deleteValue(head, 3);
    printList("After deleting 3:", head);
    head = reverse(head);
    printList("Reversed:", head);
    while (head) { Node* n = head->next; delete head; head = n; }
    return 0;
}
`,
          java: src`
public class Main {
    static class Node { int data; Node next; Node(int d) { data = d; } }

    static Node build(int[] values) {               // make a list from an array
        Node head = null;
        for (int i = values.length - 1; i >= 0; i--) {
            Node node = new Node(values[i]);
            node.next = head;
            head = node;
        }
        return head;
    }

    static void printList(String label, Node head) {
        StringBuilder sb = new StringBuilder(label + " ");
        for (Node cur = head; cur != null; cur = cur.next) sb.append(cur.data).append(" -> ");
        System.out.println(sb + "NULL");
    }

    static Node deleteValue(Node head, int value) {
        if (head == null) return null;
        if (head.data == value) return head.next;   // deleting the first node
        Node prev = head, cur = head.next;
        while (cur != null) {
            if (cur.data == value) {
                prev.next = cur.next;               // skip over cur
                break;
            }
            prev = cur;
            cur = cur.next;
        }
        return head;
    }

    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) {
            Node next = cur.next;   // 1. remember the next node
            cur.next = prev;        // 2. turn the arrow back
            prev = cur;             // 3. move prev forward
            cur = next;             // 4. move cur forward
        }
        return prev;                // prev is the new head
    }

    public static void main(String[] args) {
        Node head = build(new int[]{1, 2, 3, 4, 5});
        printList("Original:", head);
        head = deleteValue(head, 3);
        printList("After deleting 3:", head);
        head = reverse(head);
        printList("Reversed:", head);
    }
}
`,
          javascript: src`
class Node { constructor(d) { this.data = d; this.next = null; } }

function build(values) {                     // make a list from an array
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) {
    const node = new Node(values[i]);
    node.next = head;
    head = node;
  }
  return head;
}

function printList(label, head) {
  let line = label + " ";
  for (let cur = head; cur !== null; cur = cur.next) line += cur.data + " -> ";
  console.log(line + "NULL");
}

function deleteValue(head, value) {
  if (head === null) return null;
  if (head.data === value) return head.next; // deleting the first node
  let prev = head, cur = head.next;
  while (cur !== null) {
    if (cur.data === value) {
      prev.next = cur.next;                  // skip over cur
      break;
    }
    prev = cur;
    cur = cur.next;
  }
  return head;
}

function reverse(head) {
  let prev = null, cur = head;
  while (cur !== null) {
    const next = cur.next;   // 1. remember the next node
    cur.next = prev;         // 2. turn the arrow back
    prev = cur;              // 3. move prev forward
    cur = next;              // 4. move cur forward
  }
  return prev;               // prev is the new head
}

let head = build([1, 2, 3, 4, 5]);
printList("Original:", head);
head = deleteValue(head, 3);
printList("After deleting 3:", head);
head = reverse(head);
printList("Reversed:", head);
`,
        }, "Original: 1 -> 2 -> 3 -> 4 -> 5 -> NULL\nAfter deleting 3: 1 -> 2 -> 4 -> 5 -> NULL\nReversed: 5 -> 4 -> 2 -> 1 -> NULL"),
        { t: "h", text: "Step 3: Dry run of reverse on 1 → 2 → 4" },
        { t: "table", head: ["Step", "prev", "cur", "next", "Arrow turned", "Reversed part"], rows: [
          ["start", "NULL", "1", "–", "–", "(none)"],
          ["1", "1", "2", "2", "1 → NULL", "1"],
          ["2", "2", "4", "4", "2 → 1", "2 → 1"],
          ["3", "4", "NULL", "NULL", "4 → 2", "4 → 2 → 1"],
        ], caption: "cur is NULL → stop. prev (4) is the new head. O(n) time, O(1) space." },
        { t: "trap", text: "In reverse, **save `next` before** changing `cur.next`. Otherwise you lose the rest of the list. In delete, handle the **head** separately: there's no previous node, so just return head.next." },
        { t: "trick", text: "**Reverse = save next, point back, step prev, step cur.**" },
        { t: "exam", items: ["Reverse a linked list (iterative and recursive). One of the most asked questions!", "Delete a node with a given value.", "Delete the n-th node from the end (two pointers, n apart).", "Merge two sorted linked lists.", "Remove duplicates from a sorted list."] },
        { t: "recap", items: ["Delete: prev.next = cur.next (handle the head separately)", "Reverse: next = cur.next; cur.next = prev; prev = cur; cur = next", "Both are O(n) time and O(1) extra space", "Always check for an empty list"] },
      ],
      quiz: [
        { q: "To delete node cur, you set…", options: ["prev.next = cur.next", "cur.next = prev", "cur = NULL", "head = cur"], answer: 0, explain: "The previous node skips over cur." },
        { q: "When reversing, why save next first?", options: ["Changing cur.next would lose the rest of the list", "To make it faster", "It's required syntax", "To delete nodes"], answer: 0, explain: "You need to know where to go next." },
        { q: "After reversing, the new head is…", options: ["prev", "cur", "The old head", "NULL"], answer: 0, explain: "cur becomes NULL; prev is the last node visited." },
        { q: "Time and extra space to reverse a list iteratively?", options: ["O(n) time, O(1) space", "O(n²) time, O(1) space", "O(n) time, O(n) space", "O(1) time"], answer: 0, explain: "One pass, three pointers." },
      ],
    },
    {
      id: "fast-slow",
      title: "Fast and slow pointers",
      oneLine: "Move one pointer one step at a time and another two steps at a time. When the fast one reaches the end, the slow one is in the middle; if they ever meet, the list has a cycle.",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "p", text: "Two runners on a track: the hare runs twice as fast as the tortoise. On a straight road, when the hare finishes, the tortoise is halfway. On a circular track, the hare eventually laps the tortoise and they meet." },
        { t: "diagram", text: "Middle:   1 → 2 → 3 → 4 → 5 → NULL\n          slow: 1, 2, 3\n          fast: 1, 3, 5 (end) → slow is at 3 = middle\n\nCycle:    1 → 2 → 3 → 4 → 5\n                  ↑_______|     5 points back to 3: fast and slow will meet" },
        multi("Middle node and cycle detection", {
          python: src`
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def build(values):
    head = None
    for v in reversed(values):
        node = Node(v)
        node.next = head
        head = node
    return head

def middle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next            # 1 step
        fast = fast.next.next       # 2 steps
    return slow.data                # slow is in the middle

def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:            # they met: there is a loop
            return True
    return False                    # fast reached the end: no loop

head = build([1, 2, 3, 4, 5])
print("Middle:", middle(head))
print("Has cycle (normal list):", "true" if has_cycle(head) else "false")

tail = head
while tail.next:                    # find the last node (5)
    tail = tail.next
tail.next = head.next.next          # make 5 point back to 3: a cycle
print("Has cycle (looped list):", "true" if has_cycle(head) else "false")
`,
          c: src`
#include <stdio.h>
#include <stdlib.h>

struct Node { int data; struct Node *next; };

struct Node *build(int values[], int n) {
    struct Node *head = NULL;
    for (int i = n - 1; i >= 0; i--) {
        struct Node *node = malloc(sizeof(struct Node));
        node->data = values[i];
        node->next = head;
        head = node;
    }
    return head;
}

int middle(struct Node *head) {
    struct Node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;            // 1 step
        fast = fast->next->next;      // 2 steps
    }
    return slow->data;                // slow is in the middle
}

int has_cycle(struct Node *head) {
    struct Node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;   // they met: a loop
    }
    return 0;                         // reached the end: no loop
}

int main(void) {
    int values[] = {1, 2, 3, 4, 5};
    struct Node *head = build(values, 5);
    printf("Middle: %d\n", middle(head));
    printf("Has cycle (normal list): %s\n", has_cycle(head) ? "true" : "false");

    struct Node *tail = head;
    while (tail->next) tail = tail->next;   // find the last node (5)
    tail->next = head->next->next;          // make 5 point back to 3
    printf("Has cycle (looped list): %s\n", has_cycle(head) ? "true" : "false");
    return 0;   // (memory isn't freed here because the list now loops forever)
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

struct Node { int data; Node* next; Node(int d) : data(d), next(nullptr) {} };

Node* build(const vector<int>& values) {
    Node* head = nullptr;
    for (int i = (int)values.size() - 1; i >= 0; i--) {
        Node* node = new Node(values[i]);
        node->next = head;
        head = node;
    }
    return head;
}

int middle(Node* head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;            // 1 step
        fast = fast->next->next;      // 2 steps
    }
    return slow->data;                // slow is in the middle
}

bool hasCycle(Node* head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;   // they met: a loop
    }
    return false;                        // reached the end
}

int main() {
    Node* head = build({1, 2, 3, 4, 5});
    cout << "Middle: " << middle(head) << endl;
    cout << "Has cycle (normal list): " << (hasCycle(head) ? "true" : "false") << endl;

    Node* tail = head;
    while (tail->next) tail = tail->next;   // find the last node (5)
    tail->next = head->next->next;          // make 5 point back to 3
    cout << "Has cycle (looped list): " << (hasCycle(head) ? "true" : "false") << endl;
    return 0;
}
`,
          java: src`
public class Main {
    static class Node { int data; Node next; Node(int d) { data = d; } }

    static Node build(int[] values) {
        Node head = null;
        for (int i = values.length - 1; i >= 0; i--) {
            Node node = new Node(values[i]);
            node.next = head;
            head = node;
        }
        return head;
    }

    static int middle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;            // 1 step
            fast = fast.next.next;       // 2 steps
        }
        return slow.data;                // slow is in the middle
    }

    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;   // they met: a loop
        }
        return false;                        // reached the end
    }

    public static void main(String[] args) {
        Node head = build(new int[]{1, 2, 3, 4, 5});
        System.out.println("Middle: " + middle(head));
        System.out.println("Has cycle (normal list): " + hasCycle(head));

        Node tail = head;
        while (tail.next != null) tail = tail.next;   // find the last node (5)
        tail.next = head.next.next;                   // make 5 point back to 3
        System.out.println("Has cycle (looped list): " + hasCycle(head));
    }
}
`,
          javascript: src`
class Node { constructor(d) { this.data = d; this.next = null; } }

function build(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) {
    const node = new Node(values[i]);
    node.next = head;
    head = node;
  }
  return head;
}

function middle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;            // 1 step
    fast = fast.next.next;       // 2 steps
  }
  return slow.data;              // slow is in the middle
}

function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;   // they met: a loop
  }
  return false;                       // reached the end
}

const head = build([1, 2, 3, 4, 5]);
console.log("Middle: " + middle(head));
console.log("Has cycle (normal list): " + hasCycle(head));

let tail = head;
while (tail.next !== null) tail = tail.next;   // find the last node (5)
tail.next = head.next.next;                    // make 5 point back to 3
console.log("Has cycle (looped list): " + hasCycle(head));
`,
        }, "Middle: 3\nHas cycle (normal list): false\nHas cycle (looped list): true"),
        { t: "table", head: ["Round", "slow", "fast", "Notes"], rows: [["start", "1", "1", ""], ["1", "2", "3", ""], ["2", "3", "5", "fast.next is NULL → stop. Middle = 3"]], caption: "Middle of 1 → 2 → 3 → 4 → 5" },
        { t: "trap", text: "The loop condition must check `fast != NULL && fast.next != NULL` **in that order**. If fast is NULL, reading fast.next crashes. Compare **nodes** (`slow is fast`), not values: two different nodes can hold the same value." },
        { t: "trick", text: "**Slow 1 step, fast 2 steps: fast at the end → slow in the middle; they meet → cycle.**" },
        { t: "exam", items: ["Find the middle of a linked list in one pass.", "Detect a cycle (Floyd's tortoise and hare).", "Find where the cycle starts.", "Check if a linked list is a palindrome.", "Find the n-th node from the end."] },
        { t: "recap", items: ["slow moves 1 step, fast moves 2", "When fast reaches the end, slow is in the middle", "If slow and fast meet, there's a cycle (Floyd's algorithm)", "O(n) time, O(1) space"] },
      ],
      quiz: [
        { q: "In the fast/slow technique, fast moves…", options: ["2 steps at a time", "1 step at a time", "3 steps", "Backwards"], answer: 0, explain: "Twice as fast as slow." },
        { q: "If fast and slow ever point to the same node, the list…", options: ["Has a cycle", "Is sorted", "Is empty", "Has an even length"], answer: 0, explain: "Only a loop lets fast catch slow." },
        { q: "Extra space used by Floyd's cycle detection?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explain: "Just two pointers." },
        { q: "Why check fast != NULL before fast.next?", options: ["Reading .next of NULL would crash", "It's faster", "To find the middle", "It isn't needed"], answer: 0, explain: "Order matters in the condition." },
      ],
    },
  ],
};

export const DSA06_STACKS_QUEUES: LearnModule = {
  id: "stacks-queues",
  title: "Stacks and queues",
  titleHi: "स्टैक और क्यू",
  blurb: "LIFO and FIFO: build a stack and a circular queue from arrays, check balanced brackets, and solve \"next greater element\" with a monotonic stack.",
  lessons: [
    {
      id: "stack",
      title: "Stack (LIFO) and balanced brackets",
      oneLine: "A stack is Last In, First Out: you only add (push) and remove (pop) at the top, like a pile of plates. Both operations are O(1).",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Push and pop" },
        { t: "diagram", text: "push 10, push 20, push 30:        pop → returns 30:\n\n   │ 30 │ ← top                      │    │\n   │ 20 │                            │ 20 │ ← top\n   │ 10 │                            │ 10 │\n   └────┘                            └────┘" },
        { t: "table", head: ["Operation", "Does", "Time"], rows: [["`push(x)`", "Put x on top", "O(1)"], ["`pop()`", "Remove and return the top", "O(1)"], ["`peek()` / `top()`", "Look at the top without removing it", "O(1)"], ["`isEmpty()`", "Is the stack empty?", "O(1)"]] },
        { t: "analogy", text: "A stack of plates in a canteen: you put a clean plate on top, and you take a plate from the top. The plate you put last is the first one you take: LIFO." },
        { t: "h", text: "Step 2: Balanced brackets, the classic stack problem" },
        { t: "p", text: "Is `{[()]}` balanced? Read left to right: **push** every opening bracket. For a closing bracket, the top of the stack must be its matching opening bracket, so **pop** it. At the end, the stack must be empty." },
        multi("Array stack + balanced brackets", {
          python: src`
class Stack:
    def __init__(self):
        self.items = []            # the top is the END of the list
    def push(self, x):
        self.items.append(x)       # add on top
    def pop(self):
        return self.items.pop()    # remove from the top
    def peek(self):
        return self.items[-1]      # look at the top
    def is_empty(self):
        return len(self.items) == 0

s = Stack()
for x in [10, 20, 30]:
    s.push(x)
print("Top:", s.peek())
print("Popped:", s.pop())
print("Top now:", s.peek())

def is_balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}   # closing -> its opening
    st = Stack()
    for ch in text:
        if ch in "([{":                # opening: push it
            st.push(ch)
        else:                          # closing: must match the top
            if st.is_empty() or st.pop() != pairs[ch]:
                return False
    return st.is_empty()               # leftovers mean unclosed brackets

for t in ["{[()]}", "([)]", "(("]:
    print(t, "balanced:", "true" if is_balanced(t) else "false")
`,
          c: src`
#include <stdio.h>

#define MAX 100
int stack[MAX];       // the stack's storage
int top = -1;         // index of the top item (-1 = empty)

void push(int x) { stack[++top] = x; }        // move top up, then store
int pop(void)    { return stack[top--]; }      // read, then move top down
int peek(void)   { return stack[top]; }
int is_empty(void) { return top == -1; }

int is_balanced(const char *text) {
    char st[MAX];             // a separate stack of characters
    int t = -1;
    for (int i = 0; text[i] != '\0'; i++) {
        char ch = text[i];
        if (ch == '(' || ch == '[' || ch == '{') {
            st[++t] = ch;     // opening: push it
        } else {              // closing: must match the top
            if (t == -1) return 0;
            char open = st[t--];
            if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{'))
                return 0;
        }
    }
    return t == -1;           // must be empty at the end
}

int main(void) {
    push(10); push(20); push(30);
    printf("Top: %d\n", peek());
    printf("Popped: %d\n", pop());
    printf("Top now: %d\n", peek());

    const char *tests[] = {"{[()]}", "([)]", "(("};
    for (int i = 0; i < 3; i++) {
        printf("%s balanced: %s\n", tests[i], is_balanced(tests[i]) ? "true" : "false");
    }
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(const string& text) {
    stack<char> st;                       // C++ has a ready-made stack
    for (char ch : text) {
        if (ch == '(' || ch == '[' || ch == '{') {
            st.push(ch);                  // opening: push it
        } else {                          // closing: must match the top
            if (st.empty()) return false;
            char open = st.top();
            st.pop();
            if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{'))
                return false;
        }
    }
    return st.empty();                    // must be empty at the end
}

int main() {
    stack<int> s;
    s.push(10); s.push(20); s.push(30);
    cout << "Top: " << s.top() << endl;
    int popped = s.top(); s.pop();        // pop() in C++ returns nothing, so read top first
    cout << "Popped: " << popped << endl;
    cout << "Top now: " << s.top() << endl;

    for (string t : {"{[()]}", "([)]", "(("}) {
        cout << t << " balanced: " << (isBalanced(t) ? "true" : "false") << endl;
    }
    return 0;
}
`,
          java: src`
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static boolean isBalanced(String text) {
        Deque<Character> st = new ArrayDeque<>();   // Java's recommended stack
        for (char ch : text.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                st.push(ch);                        // opening: push it
            } else {                                // closing: must match the top
                if (st.isEmpty()) return false;
                char open = st.pop();
                if ((ch == ')' && open != '(') || (ch == ']' && open != '[') || (ch == '}' && open != '{'))
                    return false;
            }
        }
        return st.isEmpty();                        // must be empty at the end
    }

    public static void main(String[] args) {
        Deque<Integer> s = new ArrayDeque<>();
        s.push(10); s.push(20); s.push(30);
        System.out.println("Top: " + s.peek());
        System.out.println("Popped: " + s.pop());
        System.out.println("Top now: " + s.peek());

        for (String t : new String[]{"{[()]}", "([)]", "(("}) {
            System.out.println(t + " balanced: " + isBalanced(t));
        }
    }
}
`,
          javascript: src`
class Stack {
  constructor() { this.items = []; }       // the top is the END of the array
  push(x) { this.items.push(x); }          // add on top
  pop() { return this.items.pop(); }       // remove from the top
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}

const s = new Stack();
for (const x of [10, 20, 30]) s.push(x);
console.log("Top: " + s.peek());
console.log("Popped: " + s.pop());
console.log("Top now: " + s.peek());

function isBalanced(text) {
  const pairs = { ")": "(", "]": "[", "}": "{" };   // closing -> opening
  const st = new Stack();
  for (const ch of text) {
    if ("([{".includes(ch)) st.push(ch);            // opening: push it
    else if (st.isEmpty() || st.pop() !== pairs[ch]) return false;   // must match
  }
  return st.isEmpty();                              // must be empty at the end
}

for (const t of ["{[()]}", "([)]", "(("]) {
  console.log(t + " balanced: " + isBalanced(t));
}
`,
        }, "Top: 30\nPopped: 30\nTop now: 20\n{[()]} balanced: true\n([)] balanced: false\n(( balanced: false"),
        { t: "table", head: ["Char", "Action", "Stack after (bottom → top)"], rows: [
          ["{", "push", "{"], ["[", "push", "{ ["], ["(", "push", "{ [ ("], [")", "pop ( ✓ matches", "{ ["], ["]", "pop [ ✓", "{"], ["}", "pop { ✓", "(empty) → **balanced**"],
        ], caption: "Dry run of {[()]}" },
        { t: "trap", text: "Popping from an **empty** stack is an error (stack underflow). Always check `isEmpty()` first, like when the text starts with `)`. In C++, `pop()` returns nothing: read `top()` first, then `pop()`." },
        { t: "trick", text: "**Opening → push. Closing → pop and match. End → must be empty.**" },
        { t: "exam", items: ["Implement a stack using an array or a linked list.", "Balanced parentheses.", "Evaluate a postfix expression.", "Implement a stack using two queues.", "Min stack: get the minimum in O(1)."] },
        { t: "recap", items: ["Stack = LIFO: push and pop at the top, O(1)", "Real uses: undo, back button, function calls (the call stack)", "Balanced brackets: push openings, pop and match closings", "Check for empty before popping"] },
      ],
      quiz: [
        { q: "Stack order is…", options: ["LIFO (Last In, First Out)", "FIFO", "Random", "Sorted"], answer: 0, explain: "Like a pile of plates." },
        { q: "push 1, push 2, push 3, pop. What's returned?", options: ["3", "1", "2", "None"], answer: 0, explain: "The last one pushed." },
        { q: "Is \"(]\" balanced?", options: ["No", "Yes", "Only in C", "Depends on length"], answer: 0, explain: "] doesn't match (." },
        { q: "Popping from an empty stack is called…", options: ["Stack underflow", "Stack overflow", "Garbage collection", "Recursion"], answer: 0, explain: "Overflow means pushing onto a full stack." },
      ],
    },
    {
      id: "queue",
      title: "Queue (FIFO) and the circular queue",
      oneLine: "A queue is First In, First Out: add at the rear, remove from the front, like a line at a ticket counter. A circular queue reuses array slots by wrapping around with %.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Enqueue and dequeue" },
        { t: "diagram", text: "enqueue 10, 20, 30:     front → [10][20][30] ← rear\ndequeue → returns 10:   front → [20][30] ← rear" },
        { t: "analogy", text: "A queue at a railway ticket counter: people join at the back (enqueue) and the person at the front is served first (dequeue). First come, first served: FIFO." },
        { t: "h", text: "Step 2: Why a circular queue?" },
        { t: "p", text: "With a plain array, after a few dequeues the front slots are empty but wasted. A **circular queue** treats the array as a ring: when the rear reaches the end, it wraps around to index 0 using `(index + 1) % capacity`." },
        { t: "diagram", text: "capacity 4, after enqueue 10 20 30, dequeue, enqueue 40 50:\n\nindex:   0    1    2    3\n       [50] [20] [30] [40]\n         ↑    ↑\n       rear  front        rear wrapped around to 0" },
        multi("Circular queue", {
          python: src`
class CircularQueue:
    def __init__(self, capacity):
        self.data = [0] * capacity
        self.capacity = capacity
        self.front = 0          # index of the first item
        self.count = 0          # how many items are stored

    def is_full(self):
        return self.count == self.capacity

    def enqueue(self, x):
        if self.is_full():
            print("Queue is full, cannot add", x)
            return
        rear = (self.front + self.count) % self.capacity   # the slot after the last item, wrapping
        self.data[rear] = x
        self.count += 1

    def dequeue(self):
        x = self.data[self.front]
        self.front = (self.front + 1) % self.capacity      # move the front forward, wrapping
        self.count -= 1
        return x

    def items(self):            # items from front to rear
        return [self.data[(self.front + i) % self.capacity] for i in range(self.count)]

q = CircularQueue(4)
for x in [10, 20, 30]:
    q.enqueue(x)
print("Dequeued:", q.dequeue())
q.enqueue(40)
q.enqueue(50)
print("Queue:", *q.items())
print("Full:", "true" if q.is_full() else "false")
q.enqueue(60)
`,
          c: src`
#include <stdio.h>

#define CAP 4
int data[CAP];
int front = 0;   // index of the first item
int count = 0;   // how many items are stored

int is_full(void) { return count == CAP; }

void enqueue(int x) {
    if (is_full()) {
        printf("Queue is full, cannot add %d\n", x);
        return;
    }
    int rear = (front + count) % CAP;   // the slot after the last item, wrapping
    data[rear] = x;
    count++;
}

int dequeue(void) {
    int x = data[front];
    front = (front + 1) % CAP;          // move the front forward, wrapping
    count--;
    return x;
}

int main(void) {
    enqueue(10); enqueue(20); enqueue(30);
    printf("Dequeued: %d\n", dequeue());
    enqueue(40); enqueue(50);
    printf("Queue:");
    for (int i = 0; i < count; i++) printf(" %d", data[(front + i) % CAP]);
    printf("\n");
    printf("Full: %s\n", is_full() ? "true" : "false");
    enqueue(60);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

class CircularQueue {
    vector<int> data;
    int front = 0, count = 0;          // first item's index, number of items
public:
    CircularQueue(int capacity) : data(capacity) {}
    bool isFull() const { return count == (int)data.size(); }

    void enqueue(int x) {
        if (isFull()) { cout << "Queue is full, cannot add " << x << endl; return; }
        int rear = (front + count) % data.size();   // slot after the last, wrapping
        data[rear] = x;
        count++;
    }

    int dequeue() {
        int x = data[front];
        front = (front + 1) % data.size();          // move front forward, wrapping
        count--;
        return x;
    }

    void print() const {
        cout << "Queue:";
        for (int i = 0; i < count; i++) cout << " " << data[(front + i) % data.size()];
        cout << endl;
    }
};

int main() {
    CircularQueue q(4);
    for (int x : {10, 20, 30}) q.enqueue(x);
    cout << "Dequeued: " << q.dequeue() << endl;
    q.enqueue(40);
    q.enqueue(50);
    q.print();
    cout << "Full: " << (q.isFull() ? "true" : "false") << endl;
    q.enqueue(60);
    return 0;
}
`,
          java: src`
public class Main {
    static class CircularQueue {
        int[] data;
        int front = 0, count = 0;     // first item's index, number of items

        CircularQueue(int capacity) { data = new int[capacity]; }

        boolean isFull() { return count == data.length; }

        void enqueue(int x) {
            if (isFull()) { System.out.println("Queue is full, cannot add " + x); return; }
            int rear = (front + count) % data.length;   // slot after the last, wrapping
            data[rear] = x;
            count++;
        }

        int dequeue() {
            int x = data[front];
            front = (front + 1) % data.length;          // move front forward, wrapping
            count--;
            return x;
        }

        String items() {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < count; i++) sb.append(" ").append(data[(front + i) % data.length]);
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(4);
        for (int x : new int[]{10, 20, 30}) q.enqueue(x);
        System.out.println("Dequeued: " + q.dequeue());
        q.enqueue(40);
        q.enqueue(50);
        System.out.println("Queue:" + q.items());
        System.out.println("Full: " + q.isFull());
        q.enqueue(60);
    }
}
`,
          javascript: src`
class CircularQueue {
  constructor(capacity) {
    this.data = new Array(capacity).fill(0);
    this.capacity = capacity;
    this.front = 0;     // index of the first item
    this.count = 0;     // how many items are stored
  }
  isFull() { return this.count === this.capacity; }
  enqueue(x) {
    if (this.isFull()) { console.log("Queue is full, cannot add " + x); return; }
    const rear = (this.front + this.count) % this.capacity;   // slot after the last, wrapping
    this.data[rear] = x;
    this.count++;
  }
  dequeue() {
    const x = this.data[this.front];
    this.front = (this.front + 1) % this.capacity;            // move front forward, wrapping
    this.count--;
    return x;
  }
  items() {
    const out = [];
    for (let i = 0; i < this.count; i++) out.push(this.data[(this.front + i) % this.capacity]);
    return out;
  }
}

const q = new CircularQueue(4);
for (const x of [10, 20, 30]) q.enqueue(x);
console.log("Dequeued: " + q.dequeue());
q.enqueue(40);
q.enqueue(50);
console.log("Queue: " + q.items().join(" "));
console.log("Full: " + q.isFull());
q.enqueue(60);
`,
        }, "Dequeued: 10\nQueue: 20 30 40 50\nFull: true\nQueue is full, cannot add 60"),
        { t: "table", head: ["Action", "front", "count", "Slots [0][1][2][3]"], rows: [
          ["enqueue 10, 20, 30", "0", "3", "[10][20][30][ ]"],
          ["dequeue → 10", "1", "2", "[ ][20][30][ ]"],
          ["enqueue 40 (rear = (1+2)%4 = 3)", "1", "3", "[ ][20][30][40]"],
          ["enqueue 50 (rear = (1+3)%4 = **0**, wraps!)", "1", "4", "[50][20][30][40]"],
        ] },
        { t: "p", text: "Built-in queues: Python `collections.deque`, C++ `std::queue`, Java `ArrayDeque` (with `offer` and `poll`), JavaScript: an array with `push` and `shift` (shift is O(n), so use a proper queue for big data)." },
        { t: "trap", text: "Using a Python list's `pop(0)` or JavaScript's `shift()` as a queue looks simple, but each one is **O(n)**, because everything shifts. For BFS on big graphs, use `collections.deque` (Python) or an index-based queue." },
        { t: "trick", text: "**Wrap around with (index + 1) % capacity.**" },
        { t: "exam", items: ["Implement a queue using an array, and a circular queue.", "Implement a queue using two stacks.", "Stack vs queue: real-life examples.", "What is a deque? (Double-ended queue: add or remove at both ends.)", "What is a priority queue? (The Heaps module.)"] },
        { t: "recap", items: ["Queue = FIFO: enqueue at the rear, dequeue at the front", "A circular queue reuses slots with % capacity", "Track front and count (or front and rear)", "Queues power BFS, scheduling and buffering"] },
      ],
      quiz: [
        { q: "Queue order is…", options: ["FIFO (First In, First Out)", "LIFO", "Sorted", "Random"], answer: 0, explain: "Like a ticket line." },
        { q: "enqueue 1, 2, 3, then dequeue. What's returned?", options: ["1", "3", "2", "None"], answer: 0, explain: "The first one in." },
        { q: "In a circular queue of capacity 4, the slot after index 3 is…", options: ["0", "4", "3", "-1"], answer: 0, explain: "(3 + 1) % 4 = 0." },
        { q: "Why is list.pop(0) a slow queue in Python?", options: ["Every remaining item shifts: O(n)", "It deletes the whole list", "It's random", "It isn't slow"], answer: 0, explain: "Use collections.deque instead." },
      ],
    },
    {
      id: "monotonic-stack",
      title: "Monotonic stack: next greater element",
      oneLine: "For each item, find the next bigger item to its right. Instead of checking every pair, O(n²), keep a stack of items still waiting for their answer. Each item is pushed and popped once: O(n).",
      minutes: 16,
      blocks: [
        { t: "h", text: "Step 1: The problem" },
        { t: "p", text: "For `[4, 5, 2, 25, 7]`: the next greater of 4 is 5; of 5 is 25; of 2 is 25; of 25, nothing (−1); of 7, nothing (−1). Answer: `5 25 25 -1 -1`." },
        { t: "h", text: "Step 2: The stack idea" },
        { t: "points", items: ["Keep a stack of **indexes still waiting** for a bigger number.", "For each new number: while it's **bigger than the number at the top** of the stack, that top item has found its answer, so pop it and record the answer.", "Then push the new number's index (it's now waiting).", "Anything left on the stack at the end never found a bigger number: −1."] },
        multi("Next greater element", {
          python: src`
a = [4, 5, 2, 25, 7]
result = [-1] * len(a)          # default: no greater element
stack = []                      # indexes still waiting for an answer

for i in range(len(a)):
    while stack and a[i] > a[stack[-1]]:   # a[i] answers everything smaller on top
        waiting = stack.pop()
        result[waiting] = a[i]
    stack.append(i)             # a[i] now waits for its own answer

print("Next greater:", *result)
`,
          c: src`
#include <stdio.h>

int main(void) {
    int a[] = {4, 5, 2, 25, 7};
    int n = 5;
    int result[5], stack[5], top = -1;   // stack holds indexes still waiting

    for (int i = 0; i < n; i++) result[i] = -1;   // default: none

    for (int i = 0; i < n; i++) {
        while (top >= 0 && a[i] > a[stack[top]]) {   // a[i] answers smaller tops
            int waiting = stack[top--];
            result[waiting] = a[i];
        }
        stack[++top] = i;                // a[i] now waits
    }

    printf("Next greater:");
    for (int i = 0; i < n; i++) printf(" %d", result[i]);
    printf("\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    vector<int> a = {4, 5, 2, 25, 7};
    vector<int> result(a.size(), -1);    // default: none
    stack<int> st;                       // indexes still waiting

    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[i] > a[st.top()]) {   // a[i] answers smaller tops
            result[st.top()] = a[i];
            st.pop();
        }
        st.push(i);                      // a[i] now waits
    }

    cout << "Next greater:";
    for (int r : result) cout << " " << r;
    cout << endl;
    return 0;
}
`,
          java: src`
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        int[] a = {4, 5, 2, 25, 7};
        int[] result = new int[a.length];
        Arrays.fill(result, -1);                  // default: none
        Deque<Integer> stack = new ArrayDeque<>(); // indexes still waiting

        for (int i = 0; i < a.length; i++) {
            while (!stack.isEmpty() && a[i] > a[stack.peek()]) {   // answers smaller tops
                result[stack.pop()] = a[i];
            }
            stack.push(i);                        // a[i] now waits
        }

        StringBuilder sb = new StringBuilder("Next greater:");
        for (int r : result) sb.append(" ").append(r);
        System.out.println(sb);
    }
}
`,
          javascript: src`
const a = [4, 5, 2, 25, 7];
const result = new Array(a.length).fill(-1);   // default: none
const stack = [];                              // indexes still waiting

for (let i = 0; i < a.length; i++) {
  while (stack.length > 0 && a[i] > a[stack[stack.length - 1]]) {   // answers smaller tops
    const waiting = stack.pop();
    result[waiting] = a[i];
  }
  stack.push(i);                               // a[i] now waits
}

console.log("Next greater: " + result.join(" "));
`,
        }, "Next greater: 5 25 25 -1 -1"),
        { t: "table", head: ["i", "a[i]", "Pops (answers found)", "Stack after (values)"], rows: [
          ["0", "4", "–", "4"],
          ["1", "5", "4 → 5", "5"],
          ["2", "2", "– (2 < 5)", "5 2"],
          ["3", "25", "2 → 25, 5 → 25", "25"],
          ["4", "7", "– (7 < 25)", "25 7"],
          ["end", "", "25 and 7 never answered → −1", ""],
        ] },
        { t: "p", text: "The stack's values always **decrease** from bottom to top, which is why it's called a **monotonic stack**." },
        { t: "trap", text: "Store **indexes** in the stack, not values, so you know where to write each answer (and so duplicates work). Each index is pushed once and popped at most once, so even with the inner while loop the total work is O(n)." },
        { t: "trick", text: "**A new bigger number answers everyone smaller waiting on top of the stack.**" },
        { t: "exam", items: ["Next greater element.", "Daily temperatures (days until a warmer day).", "Stock span problem.", "Largest rectangle in a histogram (advanced)."] },
        { t: "recap", items: ["Monotonic stack = a stack kept in increasing or decreasing order", "Store indexes of items waiting for an answer", "When a bigger item arrives, pop and answer", "O(n) total: each item is pushed and popped once"] },
      ],
      quiz: [
        { q: "Next greater element of [3, 1, 4]?", options: ["4 4 -1", "-1 4 -1", "1 4 -1", "4 -1 -1"], answer: 0, explain: "3 → 4, 1 → 4, 4 → none." },
        { q: "Time complexity with a monotonic stack?", options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], answer: 0, explain: "Each index is pushed and popped once." },
        { q: "What should the stack store?", options: ["Indexes of items still waiting", "Only the answers", "Sorted values", "Nothing"], answer: 0, explain: "So you know where to write each answer." },
        { q: "Items left on the stack at the end get…", options: ["-1 (no greater element)", "0", "Their own value", "An error"], answer: 0, explain: "Nothing bigger came after them." },
      ],
    },
  ],
};

export const DSA07_HASHING: LearnModule = {
  id: "hashing",
  title: "Hashing",
  titleHi: "हैशिंग",
  blurb: "How hash tables give O(1) lookups: hash functions, collisions and linear probing built from scratch, then the hash-map tricks behind two-sum and counting.",
  lessons: [
    {
      id: "hash-table",
      title: "Hash tables from scratch",
      oneLine: "A hash function turns a key into an array index, so you can store and find items in O(1) on average. When two keys land on the same slot (a collision), linear probing tries the next slot.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The idea" },
        { t: "p", text: "Searching an unsorted array is O(n). What if we could **calculate** where an item lives? A **hash function** does that: `index = key % size`. For size 10, key 25 goes to slot 5, and key 7 goes to slot 7." },
        { t: "analogy", text: "A hostel with room numbers: the warden says \"your room = your roll number % 100\". To find a student, you don't knock on every door; you calculate the room. If two students get the same room (a collision), the second takes the next free room." },
        { t: "h", text: "Step 2: Collisions and linear probing" },
        { t: "diagram", text: "size 10, insert 15, 25, 7, 35:\n\n15 % 10 = 5 → slot 5\n25 % 10 = 5 → taken → try 6 → slot 6\n 7 % 10 = 7 → slot 7\n35 % 10 = 5 → taken, 6 taken, 7 taken → slot 8\n\nslot:  0  1  2  3  4   5   6   7   8   9\n       -  -  -  -  -  15  25   7  35   -" },
        multi("Hash table with linear probing", {
          python: src`
SIZE = 10
EMPTY = None
table = [EMPTY] * SIZE

def insert(key):
    i = key % SIZE                    # the hash function
    while table[i] is not EMPTY:      # collision: try the next slot
        i = (i + 1) % SIZE            # wrap around at the end
    table[i] = key

def search(key):
    i = key % SIZE
    while table[i] is not EMPTY:      # walk until an empty slot
        if table[i] == key:
            return i                  # found
        i = (i + 1) % SIZE
    return -1                         # hit an empty slot: not in the table

for k in [15, 25, 7, 35]:
    insert(k)

for i in range(SIZE):
    if table[i] is not EMPTY:
        print(str(i) + ":", table[i])
print("Search 35: slot", search(35))
print("Search 45:", "not found" if search(45) == -1 else "found")
`,
          c: src`
#include <stdio.h>

#define SIZE 10
#define EMPTY -1
int table[SIZE];

void insert(int key) {
    int i = key % SIZE;                   // the hash function
    while (table[i] != EMPTY) {           // collision: try the next slot
        i = (i + 1) % SIZE;               // wrap around at the end
    }
    table[i] = key;
}

int search(int key) {
    int i = key % SIZE;
    while (table[i] != EMPTY) {           // walk until an empty slot
        if (table[i] == key) return i;    // found
        i = (i + 1) % SIZE;
    }
    return -1;                            // not in the table
}

int main(void) {
    for (int i = 0; i < SIZE; i++) table[i] = EMPTY;
    int keys[] = {15, 25, 7, 35};
    for (int k = 0; k < 4; k++) insert(keys[k]);

    for (int i = 0; i < SIZE; i++) {
        if (table[i] != EMPTY) printf("%d: %d\n", i, table[i]);
    }
    printf("Search 35: slot %d\n", search(35));
    printf("Search 45: %s\n", search(45) == -1 ? "not found" : "found");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
using namespace std;

const int SIZE = 10, EMPTY = -1;
vector<int> table(SIZE, EMPTY);

void insertKey(int key) {
    int i = key % SIZE;                  // the hash function
    while (table[i] != EMPTY) i = (i + 1) % SIZE;   // collision: next slot
    table[i] = key;
}

int search(int key) {
    int i = key % SIZE;
    while (table[i] != EMPTY) {          // walk until an empty slot
        if (table[i] == key) return i;   // found
        i = (i + 1) % SIZE;
    }
    return -1;                           // not in the table
}

int main() {
    for (int k : {15, 25, 7, 35}) insertKey(k);
    for (int i = 0; i < SIZE; i++)
        if (table[i] != EMPTY) cout << i << ": " << table[i] << endl;
    cout << "Search 35: slot " << search(35) << endl;
    cout << "Search 45: " << (search(45) == -1 ? "not found" : "found") << endl;
    return 0;
}
`,
          java: src`
import java.util.Arrays;

public class Main {
    static final int SIZE = 10, EMPTY = -1;
    static int[] table = new int[SIZE];

    static void insert(int key) {
        int i = key % SIZE;                       // the hash function
        while (table[i] != EMPTY) i = (i + 1) % SIZE;   // collision: next slot
        table[i] = key;
    }

    static int search(int key) {
        int i = key % SIZE;
        while (table[i] != EMPTY) {               // walk until an empty slot
            if (table[i] == key) return i;        // found
            i = (i + 1) % SIZE;
        }
        return -1;                                // not in the table
    }

    public static void main(String[] args) {
        Arrays.fill(table, EMPTY);
        for (int k : new int[]{15, 25, 7, 35}) insert(k);
        for (int i = 0; i < SIZE; i++)
            if (table[i] != EMPTY) System.out.println(i + ": " + table[i]);
        System.out.println("Search 35: slot " + search(35));
        System.out.println("Search 45: " + (search(45) == -1 ? "not found" : "found"));
    }
}
`,
          javascript: src`
const SIZE = 10, EMPTY = null;
const table = new Array(SIZE).fill(EMPTY);

function insert(key) {
  let i = key % SIZE;                     // the hash function
  while (table[i] !== EMPTY) i = (i + 1) % SIZE;   // collision: next slot
  table[i] = key;
}

function search(key) {
  let i = key % SIZE;
  while (table[i] !== EMPTY) {            // walk until an empty slot
    if (table[i] === key) return i;       // found
    i = (i + 1) % SIZE;
  }
  return -1;                              // not in the table
}

for (const k of [15, 25, 7, 35]) insert(k);
for (let i = 0; i < SIZE; i++) {
  if (table[i] !== EMPTY) console.log(i + ": " + table[i]);
}
console.log("Search 35: slot " + search(35));
console.log("Search 45: " + (search(45) === -1 ? "not found" : "found"));
`,
        }, "5: 15\n6: 25\n7: 7\n8: 35\nSearch 35: slot 8\nSearch 45: not found"),
        { t: "table", head: ["Collision strategy", "How", "Used by"], rows: [["Linear probing", "Try the next slot, then the next…", "Simple tables (above)"], ["Chaining", "Each slot holds a small list of keys", "Java HashMap, C++ unordered_map"]] },
        { t: "table", head: ["Operation", "Average", "Worst (many collisions)"], rows: [["Insert", "O(1)", "O(n)"], ["Search", "O(1)", "O(n)"], ["Delete", "O(1)", "O(n)"]] },
        { t: "trap", text: "A table that's almost full has long probe chains and becomes slow, and a completely full table loops forever in the code above. Real hash tables **resize** (usually double) when they're about 70% full (the load factor)." },
        { t: "trick", text: "**Hash → slot. Taken? Try the next one (wrap with %).**" },
        { t: "exam", items: ["What is hashing? What is a hash function?", "What is a collision, and how do you handle it? (Chaining, open addressing / probing.)", "What is the load factor?", "Why is a hash table O(1) on average but O(n) in the worst case?"] },
        { t: "recap", items: ["A hash function turns a key into an index (key % size)", "Collision = two keys, same slot", "Linear probing tries the next slots; chaining keeps a list per slot", "Average O(1); resize when the table gets too full"] },
      ],
      quiz: [
        { q: "With size 10, where does key 47 go first?", options: ["Slot 7", "Slot 4", "Slot 47", "Slot 0"], answer: 0, explain: "47 % 10 = 7." },
        { q: "What is a collision?", options: ["Two keys hashing to the same slot", "A full array", "A deleted key", "A wrong key"], answer: 0, explain: "It must be resolved." },
        { q: "Average time to search a hash table?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: 0, explain: "With a good hash function and resizing." },
        { q: "Linear probing handles a collision by…", options: ["Trying the next slot", "Deleting the old key", "Sorting the table", "Stopping"], answer: 0, explain: "Wrapping around with %." },
      ],
    },
    {
      id: "hash-maps",
      title: "Hash maps in practice: two-sum and counting",
      oneLine: "A hash map stores key → value pairs with O(1) lookups. It turns many O(n²) \"check every pair\" problems into one O(n) pass: remember what you've seen, and look it up instantly.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: Built-in hash maps" },
        { t: "table", head: ["Language", "Hash map", "Put", "Get / check"], rows: [
          ["Python", "`dict`", "`m[key] = value`", "`m[key]`, `key in m`"],
          ["C++", "`unordered_map<int,int>`", "`m[key] = value`", "`m.count(key)`, `m[key]`"],
          ["Java", "`HashMap<Integer,Integer>`", "`m.put(key, value)`", "`m.containsKey(key)`, `m.get(key)`"],
          ["JavaScript", "`Map`", "`m.set(key, value)`", "`m.has(key)`, `m.get(key)`"],
          ["C", "none built in", "write your own (previous lesson)", ""],
        ] },
        { t: "h", text: "Step 2: Two-sum (unsorted array)" },
        { t: "p", text: "Find two numbers that add up to the target. For each number x, the **partner** we need is `target − x`. Have we **seen** that partner already? A hash map remembers every number we've passed and its index." },
        multi("Two-sum with a hash map", {
          python: src`
def two_sum(nums, target):
    seen = {}                          # number -> its index
    for i, x in enumerate(nums):
        need = target - x              # the partner we're looking for
        if need in seen:               # O(1) lookup
            return seen[need], i
        seen[x] = i                    # remember this number for later
    return None

print("Two sum:", *two_sum([2, 7, 11, 15], 9))
print("Two sum:", *two_sum([3, 2, 4], 6))
`,
          c: src`
#include <stdio.h>

// C has no built-in map, so we use a small hash table (linear probing)
#define SIZE 101
int keys[SIZE], vals[SIZE], used[SIZE];

void map_clear(void) { for (int i = 0; i < SIZE; i++) used[i] = 0; }

void map_put(int key, int val) {
    int i = ((key % SIZE) + SIZE) % SIZE;            // hash (works for negatives too)
    while (used[i] && keys[i] != key) i = (i + 1) % SIZE;
    used[i] = 1; keys[i] = key; vals[i] = val;
}

int map_get(int key) {                               // returns -1 if missing
    int i = ((key % SIZE) + SIZE) % SIZE;
    while (used[i]) {
        if (keys[i] == key) return vals[i];
        i = (i + 1) % SIZE;
    }
    return -1;
}

void two_sum(int nums[], int n, int target) {
    map_clear();
    for (int i = 0; i < n; i++) {
        int need = target - nums[i];                 // the partner we need
        int j = map_get(need);
        if (j != -1) {                               // seen before
            printf("Two sum: %d %d\n", j, i);
            return;
        }
        map_put(nums[i], i);                         // remember this number
    }
}

int main(void) {
    int a[] = {2, 7, 11, 15};
    int b[] = {3, 2, 4};
    two_sum(a, 4, 9);
    two_sum(b, 3, 6);
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

pair<int, int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;              // number -> its index
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];           // the partner we need
        if (seen.count(need)) return {seen[need], i};   // O(1) lookup
        seen[nums[i]] = i;                     // remember this number
    }
    return {-1, -1};
}

int main() {
    auto r1 = twoSum({2, 7, 11, 15}, 9);
    cout << "Two sum: " << r1.first << " " << r1.second << endl;
    auto r2 = twoSum({3, 2, 4}, 6);
    cout << "Two sum: " << r2.first << " " << r2.second << endl;
    return 0;
}
`,
          java: src`
import java.util.HashMap;
import java.util.Map;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();   // number -> its index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];                // the partner we need
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);                       // remember this number
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] r1 = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println("Two sum: " + r1[0] + " " + r1[1]);
        int[] r2 = twoSum(new int[]{3, 2, 4}, 6);
        System.out.println("Two sum: " + r2[0] + " " + r2[1]);
    }
}
`,
          javascript: src`
function twoSum(nums, target) {
  const seen = new Map();                 // number -> its index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];        // the partner we need
    if (seen.has(need)) return [seen.get(need), i];   // O(1) lookup
    seen.set(nums[i], i);                 // remember this number
  }
  return [-1, -1];
}

console.log("Two sum: " + twoSum([2, 7, 11, 15], 9).join(" "));
console.log("Two sum: " + twoSum([3, 2, 4], 6).join(" "));
`,
        }, "Two sum: 0 1\nTwo sum: 1 2"),
        { t: "table", head: ["i", "x", "need = 6 − x", "need in seen?", "seen after"], rows: [
          ["0", "3", "3", "No (empty)", "{3: 0}"],
          ["1", "2", "4", "No", "{3: 0, 2: 1}"],
          ["2", "4", "2", "**Yes, at index 1**", "→ answer 1 2"],
        ], caption: "Dry run of two-sum on [3, 2, 4], target 6. Note: we check before adding, so 3 isn't paired with itself." },
        { t: "h", text: "Step 3: Counting with a map: first non-repeating character" },
        multi("First non-repeating character", {
          python: src`
def first_unique(s):
    count = {}
    for ch in s:                       # pass 1: count every character
        count[ch] = count.get(ch, 0) + 1
    for ch in s:                       # pass 2: first one with count 1
        if count[ch] == 1:
            return ch
    return "none"

print("First unique in swiss:", first_unique("swiss"))
print("First unique in aabb:", first_unique("aabb"))
`,
          c: src`
#include <stdio.h>

char first_unique(const char *s) {
    int count[256] = {0};                  // one counter per possible character
    for (int i = 0; s[i]; i++) count[(unsigned char)s[i]]++;   // pass 1: count
    for (int i = 0; s[i]; i++)
        if (count[(unsigned char)s[i]] == 1) return s[i];      // pass 2: first with 1
    return 0;                              // none
}

int main(void) {
    char c1 = first_unique("swiss"), c2 = first_unique("aabb");
    if (c1) printf("First unique in swiss: %c\n", c1); else printf("First unique in swiss: none\n");
    if (c2) printf("First unique in aabb: %c\n", c2); else printf("First unique in aabb: none\n");
    return 0;
}
`,
          cpp: src`
#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

string firstUnique(const string& s) {
    unordered_map<char, int> count;
    for (char ch : s) count[ch]++;                 // pass 1: count
    for (char ch : s)
        if (count[ch] == 1) return string(1, ch);  // pass 2: first with count 1
    return "none";
}

int main() {
    cout << "First unique in swiss: " << firstUnique("swiss") << endl;
    cout << "First unique in aabb: " << firstUnique("aabb") << endl;
    return 0;
}
`,
          java: src`
import java.util.HashMap;
import java.util.Map;

public class Main {
    static String firstUnique(String s) {
        Map<Character, Integer> count = new HashMap<>();
        for (char ch : s.toCharArray()) count.put(ch, count.getOrDefault(ch, 0) + 1);   // pass 1
        for (char ch : s.toCharArray())
            if (count.get(ch) == 1) return String.valueOf(ch);   // pass 2
        return "none";
    }

    public static void main(String[] args) {
        System.out.println("First unique in swiss: " + firstUnique("swiss"));
        System.out.println("First unique in aabb: " + firstUnique("aabb"));
    }
}
`,
          javascript: src`
function firstUnique(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1);   // pass 1: count
  for (const ch of s) if (count.get(ch) === 1) return ch;        // pass 2
  return "none";
}

console.log("First unique in swiss: " + firstUnique("swiss"));
console.log("First unique in aabb: " + firstUnique("aabb"));
`,
        }, "First unique in swiss: w\nFirst unique in aabb: none"),
        { t: "trap", text: "In two-sum, check `need in seen` **before** adding the current number, otherwise a number can pair with itself (for example 3 + 3 = 6 using one 3). And don't rely on the order of a hash map's keys when printing: it isn't guaranteed to be sorted." },
        { t: "trick", text: "**\"Have I seen what I need?\" → hash map.**" },
        { t: "exam", items: ["Two-sum (unsorted).", "Check for duplicates in an array.", "Group anagrams.", "Longest consecutive sequence.", "Subarray sum equals k (prefix sums + a hash map)."] },
        { t: "recap", items: ["A hash map stores key → value with O(1) average lookups", "Two-sum: for each x, look up target − x, then store x", "Counting: map[ch] = map.get(ch, 0) + 1", "Turns many O(n²) pair problems into O(n)"] },
      ],
      quiz: [
        { q: "Two-sum with a hash map runs in…", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 0, explain: "One pass with O(1) lookups." },
        { q: "For x = 7 and target 9, which number do we look up?", options: ["2", "7", "9", "16"], answer: 0, explain: "target − x." },
        { q: "First non-repeating character of \"aabbc\"?", options: ["c", "a", "b", "none"], answer: 0, explain: "Only c appears once." },
        { q: "Which language has no built-in hash map?", options: ["C", "Python", "Java", "JavaScript"], answer: 0, explain: "You implement one yourself." },
      ],
    },
  ],
};
