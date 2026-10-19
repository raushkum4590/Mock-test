import type { LearnModule } from "../types";
import { py, src } from "../python/helpers";

/** Data science from scratch, modules 13–16: clustering, NLP, networks and recommenders, SQL/MapReduce and career. */
export const DS13_CLUSTERING: LearnModule = {
  id: "clustering",
  title: "Clustering",
  titleHi: "क्लस्टरिंग",
  blurb: "Find groups in unlabelled data: write k-means from scratch, choose k with the elbow method, and build bottom-up hierarchical clustering that records every merge.",
  lessons: [
    {
      id: "k-means",
      title: "k-means from scratch",
      oneLine: "k-means places k centres, assigns every point to its nearest centre, moves each centre to the average of its points, and repeats until no point changes cluster. The total squared distance to the centres (the error) drops as k grows; the \"elbow\" suggests a good k.",
      minutes: 22,
      blocks: [
        py("Where should 3 study centres go?", src`
import math
import random

random.seed(4)
towns = [(2, 3), (8, 8), (14, 2)]                       # three real groups of students
points = [(x + random.gauss(0, 1.2), y + random.gauss(0, 1.2)) for x, y in towns for _ in range(40)]

def distance(a, b):
    return math.dist(a, b)

def mean_point(cluster):
    return tuple(sum(c) / len(cluster) for c in zip(*cluster))

def k_means(points, k, seed=0):
    centres = random.Random(seed).sample(points, k)     # start at k random points
    assignment = None
    while True:
        new = [min(range(k), key=lambda i: distance(p, centres[i])) for p in points]
        if new == assignment:                           # nothing changed → done
            return centres, assignment
        assignment = new
        for i in range(k):                              # move each centre to its points' average
            members = [p for p, a in zip(points, assignment) if a == i]
            if members:
                centres[i] = mean_point(members)

def total_error(points, centres, assignment):
    return sum(distance(p, centres[a]) ** 2 for p, a in zip(points, assignment))

def best_k_means(points, k, tries=10):              # several random starts, keep the best
    runs = [k_means(points, k, seed) for seed in range(tries)]
    return min(runs, key=lambda run: total_error(points, *run))

centres, assignment = best_k_means(points, 3)
print("centres:", sorted((round(x, 1), round(y, 1)) for x, y in centres))

for k in range(1, 7):                                   # the elbow method
    c, a = best_k_means(points, k)
    print(f"k={k}: total squared error {total_error(points, c, a):8.1f}")
`, "centres: [(2.2, 2.9), (8.3, 8.2), (14.2, 1.8)]\nk=1: total squared error   4144.1\nk=2: total squared error   1625.1\nk=3: total squared error    299.8\nk=4: total squared error    243.9\nk=5: total squared error    205.4\nk=6: total squared error    187.1"),
        { t: "p", text: "With the best of 10 random starts, the centres land near the three towns where students were generated (a single unlucky start can put two centres in one town; that's why we restart). The error falls sharply up to k = 3 and only slowly after: that bend is the **elbow**, suggesting 3 clusters." },
        { t: "table", head: ["Round", "Assign", "Update"], rows: [["1", "Each point joins the nearest random starting centre", "Each centre moves to the mean of its points"], ["2", "Some points switch to a nearer centre", "Centres move again"], ["…", "Fewer and fewer points switch", "Smaller moves"], ["Last", "No point switches", "Stop"]] },
        { t: "analogy", text: "Opening 3 tea stalls at a fair: put them anywhere, let each visitor go to the nearest stall, then move each stall to the middle of its customers. Repeat, and the stalls settle in the middle of the natural crowds." },
        { t: "trap", text: "k-means depends on the starting centres: run it several times with different seeds and keep the result with the lowest error. Scale features first, and remember it assumes roughly round, similar-sized clusters." },
        { t: "trick", text: "**Assign to nearest → move to mean → repeat until stable. Elbow to choose k.**" },
        { t: "exam", items: ["Implement k-means.", "How do you choose k?", "Why can k-means give different results on different runs?", "What does k-means assume about cluster shapes?"] },
        { t: "recap", items: ["k centres; assign points to the nearest", "Move centres to the mean of their points", "Stop when assignments don't change", "Total squared error falls with k; look for the elbow", "Several random starts; scale features"] },
      ],
      quiz: [
        { q: "After assigning points, each centre moves to…", options: ["The mean of its points", "A random point", "The farthest point", "The origin"], answer: 0, explain: "That's the \"means\" in k-means." },
        { q: "k-means stops when…", options: ["No point changes cluster", "k reaches 10", "The error is 0", "After one round"], answer: 0, explain: "The assignment has converged." },
        { q: "The elbow method looks at…", options: ["How total error drops as k increases", "The number of features", "Accuracy", "p-values"], answer: 0, explain: "Pick k where gains flatten." },
        { q: "k-means is…", options: ["Unsupervised", "Supervised", "A regression", "A hypothesis test"], answer: 0, explain: "No labels are used." },
      ],
    },
    {
      id: "hierarchical",
      title: "Bottom-up hierarchical clustering",
      oneLine: "Start with every point as its own cluster and repeatedly merge the two closest clusters, recording the distance of each merge. To get k clusters, undo the last k − 1 merges. You don't have to choose k in advance.",
      minutes: 16,
      blocks: [
        py("Merging clusters step by step", src`
def cluster_distance(a, b, linkage=min):
    return linkage(abs(x - y) for x in a for y in b)   # single linkage: closest pair

def hierarchical(points, linkage=min):
    clusters = [[p] for p in points]
    merges = []
    while len(clusters) > 1:
        pairs = [(cluster_distance(clusters[i], clusters[j], linkage), i, j)
                 for i in range(len(clusters)) for j in range(i + 1, len(clusters))]
        d, i, j = min(pairs)                            # the closest two clusters
        merged = clusters[i] + clusters[j]
        merges.append((d, sorted(merged)))
        clusters = [c for k, c in enumerate(clusters) if k not in (i, j)] + [merged]
    return merges

ages = [21, 22, 24, 35, 37, 39, 52, 55, 58]
for d, members in hierarchical(ages):
    print(f"merge at distance {d:>2}: {members}")
`, "merge at distance  1: [21, 22]\nmerge at distance  2: [21, 22, 24]\nmerge at distance  2: [35, 37]\nmerge at distance  2: [35, 37, 39]\nmerge at distance  3: [52, 55]\nmerge at distance  3: [52, 55, 58]\nmerge at distance 11: [21, 22, 24, 35, 37, 39]\nmerge at distance 13: [21, 22, 24, 35, 37, 39, 52, 55, 58]"),
        { t: "p", text: "Reading from the bottom: the last merges happen at large distances, so cutting there gives well-separated groups. Undoing the last 2 merges gives 3 groups: the twenties, the late thirties, and the fifties." },
        { t: "table", head: ["Linkage", "Distance between clusters", "Tends to make"], rows: [["Single (min)", "Closest pair", "Long chains"], ["Complete (max)", "Farthest pair", "Compact, round clusters"], ["Average", "Average of all pairs", "A balance"]] },
        { t: "analogy", text: "Like forming teams for a school event: first best friends pair up, then pairs join friendly pairs, then those groups merge into houses. Stop merging at the level of detail you need." },
        { t: "trap", text: "This simple version compares every pair of clusters at every step, which is very slow for large data (libraries like SciPy are far faster, but it's still best for thousands of points, not millions). Single linkage can chain unrelated groups together through a line of in-between points." },
        { t: "trick", text: "**Merge the closest two, record the distance, repeat. Cut where merge distances jump.**" },
        { t: "exam", items: ["How does agglomerative clustering work?", "Single vs complete linkage?", "How do you get k clusters from the merge history?", "Hierarchical vs k-means?"] },
        { t: "recap", items: ["Start with singletons", "Merge the two closest clusters repeatedly", "Linkage defines cluster distance", "The merge history is a dendrogram", "Cut it to get any number of clusters"] },
      ],
      quiz: [
        { q: "Agglomerative clustering begins with…", options: ["Every point as its own cluster", "One big cluster", "k random centres", "Labels"], answer: 0, explain: "Then it merges." },
        { q: "Single linkage measures cluster distance by…", options: ["The closest pair of points", "The farthest pair", "The centres", "The cluster sizes"], answer: 0, explain: "min over pairs." },
        { q: "To get 3 clusters from n points, you undo the last…", options: ["2 merges", "3 merges", "n merges", "1 merge"], answer: 0, explain: "k − 1 merges." },
        { q: "A big jump in merge distance suggests…", options: ["A natural place to cut", "An error", "Too few points", "Overfitting"], answer: 0, explain: "Separate groups are being forced together." },
      ],
    },
  ],
};

export const DS14_NLP: LearnModule = {
  id: "nlp",
  title: "Natural language processing",
  titleHi: "नेचुरल लैंग्वेज प्रोसेसिंग",
  blurb: "Teach computers to work with text: tokenize and count words, generate sentences with n-gram models, and build a tiny search engine with TF-IDF and cosine similarity.",
  lessons: [
    {
      id: "words-ngrams",
      title: "Counting words and n-gram language models",
      oneLine: "Text becomes data by tokenising it into words. Word counts (minus stop-words) show what a text is about. An n-gram model records which words follow which, and can generate new text that sounds like the original by repeatedly picking a likely next word: a tiny ancestor of today's language models.",
      minutes: 20,
      blocks: [
        py("Word frequencies", src`
import re
from collections import Counter

reviews = """The delivery was fast and the food was hot. Great taste, fast delivery!
The food was cold and the delivery was late. Taste was okay.
Fast delivery, great packaging, and the biryani was amazing."""

STOP = {"the", "was", "and", "a", "an", "is"}
words = re.findall(r"[a-z']+", reviews.lower())             # tokenise
counts = Counter(w for w in words if w not in STOP)
print("tokens:", len(words))
print(counts.most_common(5))
`, "tokens: 34\n[('delivery', 4), ('fast', 3), ('food', 2), ('great', 2), ('taste', 2)]"),
        { t: "h", text: "Bigrams: what comes next?" },
        py("Generating text with a bigram model", src`
import random
import re
from collections import defaultdict

text = ("data science is fun . data science needs statistics . statistics needs practice . "
        "practice makes data science easy . python makes data science fun .")
words = text.split()

transitions = defaultdict(list)                          # word → list of words seen after it
for current, nxt in zip(words, words[1:]):
    transitions[current].append(nxt)
print("after 'data':", transitions["data"])
print("after 'needs':", transitions["needs"])

def generate(start, length, seed):
    rng = random.Random(seed)
    out = [start]
    while len(out) < length and out[-1] != ".":
        out.append(rng.choice(transitions[out[-1]]))      # frequent followers are picked more often
    return " ".join(out)

for seed in range(3):
    print(generate("python", 12, seed))
`, "after 'data': ['science', 'science', 'science', 'science']\nafter 'needs': ['statistics', 'practice']\npython makes data science easy .\npython makes data science is fun .\npython makes data science easy ."),
        { t: "p", text: "Each next word is chosen in proportion to how often it followed the current word. With bigrams (pairs), sentences are locally sensible but wander; trigrams (looking at the last two words) make better sentences but need far more text. Modern large language models are, at heart, very sophisticated next-word predictors trained on huge amounts of text." },
        { t: "analogy", text: "A bigram model is a parrot that only remembers which word usually comes after the word it just said. It can sound fluent for a few words, but it has no idea what the whole sentence means." },
        { t: "trap", text: "Tokenising is harder than it looks: \"don't\", \"₹1,499\", \"New Delhi\", emojis and Hindi–English mixed text all need decisions. Removing stop-words helps word counts but hurts tasks where small words matter (\"not good\" ≠ \"good\")." },
        { t: "trick", text: "**Tokenise → (remove stop-words) → count. n-gram: record followers, sample the next word.**" },
        { t: "exam", items: ["What is tokenisation?", "What are stop-words? When should you keep them?", "What is an n-gram model?", "How are n-grams related to modern language models?"] },
        { t: "recap", items: ["Tokenise text into words (regex or a tokenizer)", "Counter for word frequencies; drop stop-words for topics", "Bigram model: word → list of next words", "Generate by repeatedly sampling a follower", "Bigger n = better text, more data needed"] },
      ],
      quiz: [
        { q: "Splitting text into words is called…", options: ["Tokenisation", "Stemming", "Clustering", "Parsing JSON"], answer: 0, explain: "The first step of NLP." },
        { q: "A bigram is…", options: ["A pair of consecutive words", "A two-letter word", "Two documents", "A big word"], answer: 0, explain: "Trigrams are three words." },
        { q: "Why might you keep stop-words in sentiment analysis?", options: ["\"not\" changes the meaning", "They're the most important words always", "They speed it up", "You must never remove them"], answer: 0, explain: "\"not good\" vs \"good\"." },
        { q: "An n-gram generator picks the next word…", options: ["Based on which words followed the previous word(s)", "Alphabetically", "At random from the dictionary", "By sentence length"], answer: 0, explain: "In proportion to past counts." },
      ],
    },
    {
      id: "tf-idf-search",
      title: "TF-IDF and a tiny search engine",
      oneLine: "TF-IDF scores how important a word is to a document: frequent in this document (term frequency) but rare across all documents (inverse document frequency). Turning documents into TF-IDF vectors and comparing them with cosine similarity gives a simple, effective search engine.",
      minutes: 20,
      blocks: [
        { t: "formula", items: [["Term frequency", "tf(word, doc) = count of word in doc / words in doc"], ["Inverse document frequency", "idf(word) = log(number of docs / docs containing word)"], ["TF-IDF", "tf × idf: high for words common here but rare elsewhere"]] },
        py("Search with TF-IDF and cosine similarity", src`
import math
import re
from collections import Counter

docs = {
    "python-basics": "python lists loops and functions for beginners",
    "pandas-guide": "pandas dataframes in python for data analysis",
    "sql-guide": "sql queries joins and group by for data analysis",
    "ml-intro": "machine learning models regression and classification in python",
    "stats-intro": "statistics mean median variance and hypothesis tests",
}

def tokens(text):
    return re.findall(r"[a-z]+", text.lower())

doc_tokens = {name: tokens(text) for name, text in docs.items()}
n_docs = len(docs)
doc_freq = Counter(word for words in doc_tokens.values() for word in set(words))
idf = {w: math.log(n_docs / df) for w, df in doc_freq.items()}

def tfidf(words):
    counts = Counter(words)
    return {w: counts[w] / len(words) * idf.get(w, 0) for w in counts}

def cosine(a, b):
    dot = sum(a[w] * b.get(w, 0) for w in a)
    norm = math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values()))
    return dot / norm if norm else 0.0

vectors = {name: tfidf(words) for name, words in doc_tokens.items()}
print("idf of 'python':", round(idf["python"], 3), " idf of 'joins':", round(idf["joins"], 3))

for query in ["data analysis with python", "hypothesis tests"]:
    q = tfidf(tokens(query))
    ranked = sorted(vectors, key=lambda name: cosine(q, vectors[name]), reverse=True)
    print(f"{query!r}: {[(n, round(cosine(q, vectors[n]), 2)) for n in ranked[:3]]}")
`, "idf of 'python': 0.511  idf of 'joins': 1.609\n'data analysis with python': [('pandas-guide', 0.49), ('sql-guide', 0.31), ('python-basics', 0.06)]\n'hypothesis tests': [('stats-intro', 0.58), ('python-basics', 0.0), ('pandas-guide', 0.0)]"),
        { t: "p", text: "Common words like \"python\" (in 3 of 5 documents) get a low IDF; rare ones like \"joins\" a high IDF. The query is compared with every document as a vector, and documents sharing its rarer, more specific words rank highest. Search engines, document deduplication and \"related articles\" all started with this idea." },
        { t: "analogy", text: "In a cricket commentary archive, the word \"ball\" appears everywhere, so it tells you nothing about which match an article covers. The word \"Eden Gardens\" appears in only a few, so it's a strong clue. IDF is exactly this \"how rare is the clue\" weight." },
        { t: "trap", text: "TF-IDF matches words, not meanings: \"car\" and \"automobile\" share nothing. Modern systems add **word embeddings** (vectors where similar meanings are close) or transformer models. Still, TF-IDF is a strong, fast baseline that you should try first." },
        { t: "trick", text: "**TF = how often here. IDF = how rare everywhere. Score = TF × IDF. Rank by cosine similarity.**" },
        { t: "exam", items: ["Explain TF-IDF.", "Why use IDF?", "How would you build a simple search engine?", "Bag-of-words vs word embeddings?", "Why cosine similarity for documents?"] },
        { t: "recap", items: ["TF = word share in a document", "IDF = log(N / docs containing the word)", "TF-IDF vectors represent documents", "Cosine similarity ranks documents for a query", "Embeddings capture meaning beyond exact words"] },
      ],
      quiz: [
        { q: "A word that appears in every document has IDF…", options: ["0", "1", "Very high", "Negative"], answer: 0, explain: "log(N / N) = 0." },
        { q: "TF-IDF is high for words that are…", options: ["Frequent in this document, rare elsewhere", "Rare everywhere", "Common everywhere", "Stop-words"], answer: 0, explain: "Distinctive words." },
        { q: "Why cosine similarity for documents?", options: ["It ignores document length and compares direction", "It's the only option", "It counts characters", "It requires the same length"], answer: 0, explain: "Long and short documents can still match." },
        { q: "\"car\" vs \"automobile\" in TF-IDF are…", options: ["Unrelated words", "Identical", "Synonyms automatically", "Stop-words"], answer: 0, explain: "Embeddings fix this." },
      ],
    },
  ],
};

export const DS15_NETWORKS_RECOMMENDERS: LearnModule = {
  id: "networks-recommenders",
  title: "Network analysis and recommender systems",
  titleHi: "नेटवर्क विश्लेषण और रिकमेंडर सिस्टम",
  blurb: "Who matters in a network? Compute betweenness centrality, eigenvector centrality and PageRank. Then recommend things people will like: popularity, user-based and item-based collaborative filtering.",
  lessons: [
    {
      id: "centrality-pagerank",
      title: "Centrality and PageRank",
      oneLine: "Degree counts connections. Betweenness centrality measures how often someone lies on the shortest paths between others (a bridge). Eigenvector centrality says you're important if your friends are important; PageRank is its version for directed links, the idea that started Google.",
      minutes: 24,
      blocks: [
        py("Betweenness and eigenvector centrality", src`
import math
from collections import deque, defaultdict

names = ["Asha", "Ravi", "Zoya", "Imran", "Neha", "Kabir", "Meera", "Arjun", "Sara", "Dev"]
edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 3), (3, 4), (4, 5), (5, 6), (5, 7), (6, 8), (7, 8), (8, 9)]
friends = defaultdict(list)
for a, b in edges:
    friends[a].append(b)
    friends[b].append(a)
n = len(names)

def shortest_paths(source):
    """All shortest paths from source to every node (BFS keeping every predecessor)."""
    paths = {source: [[source]]}
    dist = {source: 0}
    queue = deque([source])
    while queue:
        u = queue.popleft()
        for v in friends[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                queue.append(v)
                paths[v] = []
            if dist[v] == dist[u] + 1:
                paths[v] += [p + [v] for p in paths[u]]
    return paths

betweenness = [0.0] * n
for s in range(n):
    for t, ps in shortest_paths(s).items():
        if t <= s:
            continue
        for p in ps:
            for middle in p[1:-1]:
                betweenness[middle] += 1 / len(ps)        # share the credit among equal paths

print("betweenness:", sorted(((round(b, 1), names[i]) for i, b in enumerate(betweenness)), reverse=True)[:4])

x = [1.0] * n                                              # eigenvector centrality: power iteration
for _ in range(200):
    x = [sum(x[j] for j in friends[i]) for i in range(n)]
    norm = math.sqrt(sum(v * v for v in x))
    x = [v / norm for v in x]
print("eigenvector:", sorted(((round(v, 3), names[i]) for i, v in enumerate(x)), reverse=True)[:4])
`, "betweenness: [(20.5, 'Kabir'), (20.0, 'Neha'), (18.0, 'Imran'), (8.5, 'Sara')]\neigenvector: [(0.515, 'Zoya'), (0.515, 'Ravi'), (0.473, 'Imran'), (0.386, 'Asha')]"),
        { t: "p", text: "**Imran, Neha and Kabir** have only 2–3 friends each, but almost every path between the two halves of the network goes through them: they're the bridges, so their betweenness is highest. Eigenvector centrality instead favours people inside the tightly connected group, whose friends are well connected too." },
        py("PageRank for directed links", src`
endorsements = {          # who endorses (links to) whom
    "Asha": ["Ravi", "Zoya"], "Ravi": ["Zoya"], "Zoya": ["Asha"],
    "Imran": ["Zoya"], "Neha": ["Zoya", "Imran"], "Dev": ["Neha"],
}
people = sorted(set(endorsements) | {p for targets in endorsements.values() for p in targets})
damping = 0.85
rank = {p: 1 / len(people) for p in people}

for _ in range(100):
    new = {p: (1 - damping) / len(people) for p in people}     # a random jump to anyone
    for source, targets in endorsements.items():
        for target in targets:
            new[target] += damping * rank[source] / len(targets)  # share your rank among your links
    rank = new

for person, score in sorted(rank.items(), key=lambda kv: -kv[1]):
    print(f"{person:<6} {score:.3f}")
`, "Zoya   0.372\nAsha   0.342\nRavi   0.170\nNeha   0.046\nImran  0.045\nDev    0.025"),
        { t: "p", text: "Zoya is endorsed by many people, including well-ranked ones, so she ranks highest. Dev, whom nobody endorses, gets only the small \"random jump\" share. An endorsement from a highly ranked person is worth more than one from someone obscure, which is exactly how Google first ranked web pages." },
        { t: "analogy", text: "Betweenness is the friend who introduces people across groups: remove them and two groups stop talking. Eigenvector centrality and PageRank are reputation: a recommendation letter from a famous professor counts more than one from a stranger." },
        { t: "trap", text: "This all-paths betweenness is fine for small networks but explodes on big ones; libraries like NetworkX use Brandes' algorithm. PageRank needs the damping (random jump) term, or rank can get trapped in dead ends and loops." },
        { t: "trick", text: "**Degree = connections. Betweenness = bridges. Eigenvector/PageRank = connected to important people.**" },
        { t: "exam", items: ["What is betweenness centrality?", "What is eigenvector centrality?", "Explain PageRank simply. What is the damping factor?", "Where is network analysis used? (Social networks, fraud rings, logistics, influencers.)"] },
        { t: "recap", items: ["Degree: number of links", "Betweenness: share of shortest paths through a node", "Eigenvector centrality: power iteration on the adjacency", "PageRank: rank flows along links, damping 0.85", "Use NetworkX for real graphs"] },
      ],
      quiz: [
        { q: "High betweenness centrality means a person…", options: ["Lies on many shortest paths between others", "Has the most friends", "Joined first", "Has no friends"], answer: 0, explain: "A bridge between groups." },
        { q: "In PageRank, a link from a highly ranked page is worth…", options: ["More than a link from a low-ranked page", "The same", "Less", "Nothing"], answer: 0, explain: "Rank flows along links." },
        { q: "The damping factor models…", options: ["A surfer sometimes jumping to a random page", "Slow internet", "Page size", "Link colour"], answer: 0, explain: "Usually 0.85." },
        { q: "Eigenvector centrality is computed by…", options: ["Repeatedly summing neighbours' scores and normalising", "Counting edges once", "Sorting names", "A t-test"], answer: 0, explain: "Power iteration." },
      ],
    },
    {
      id: "recommenders",
      title: "Recommender systems",
      oneLine: "Recommend what's popular (easy, not personal), what similar users like (user-based collaborative filtering), or items similar to what you already like (item-based). Similarity between interest vectors is measured with cosine similarity.",
      minutes: 22,
      blocks: [
        py("Popular, user-based and item-based recommendations", src`
import math
from collections import Counter, defaultdict

likes = {
    "Asha":  ["python", "statistics", "ml", "pandas"],
    "Ravi":  ["python", "sql", "pandas"],
    "Zoya":  ["statistics", "ml", "r", "deep learning"],
    "Imran": ["sql", "excel", "power bi"],
    "Neha":  ["python", "ml", "deep learning"],
    "Kabir": ["excel", "power bi", "sql"],
}
topics = sorted({t for ts in likes.values() for t in ts})

def vector(user):                                  # 1 if the user likes the topic, else 0
    return [1 if t in likes[user] else 0 for t in topics]

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(a)) * math.sqrt(sum(b))) if dot else 0.0

# 1) Popularity
popular = Counter(t for ts in likes.values() for t in ts).most_common()
print("popular for Neha:", [t for t, _ in popular if t not in likes["Neha"]][:3])

# 2) User-based: what do people like me like?
def user_based(user):
    scores = defaultdict(float)
    for other in likes:
        if other != user:
            sim = cosine(vector(user), vector(other))
            for t in likes[other]:
                if t not in likes[user]:
                    scores[t] += sim
    return sorted(scores.items(), key=lambda kv: -kv[1])[:3]
print("user-based for Neha:", [(t, round(s, 2)) for t, s in user_based("Neha")])

# 3) Item-based: topics liked by the same people as my topics
def topic_vector(topic):
    return [1 if topic in likes[u] else 0 for u in likes]

def item_based(user):
    scores = defaultdict(float)
    for mine in likes[user]:
        for t in topics:
            if t not in likes[user]:
                scores[t] += cosine(topic_vector(mine), topic_vector(t))
    return sorted(scores.items(), key=lambda kv: -kv[1])[:3]
print("item-based for Neha:", [(t, round(s, 2)) for t, s in item_based("Neha")])
`, "popular for Neha: ['sql', 'statistics', 'pandas']\nuser-based for Neha: [('statistics', 1.15), ('pandas', 0.91), ('r', 0.58)]\nitem-based for Neha: [('statistics', 1.72), ('r', 1.28), ('pandas', 1.22)]"),
        { t: "table", head: ["Method", "Idea", "Strength", "Weakness"], rows: [
          ["Popularity", "Recommend the most liked items", "Simple; good for new users", "Same for everyone"],
          ["User-based CF", "Find similar users, suggest what they like", "Personal", "Slow and sparse with millions of users"],
          ["Item-based CF", "Suggest items liked by the same people as your items", "Stable, scales well (\"customers who bought this also bought…\")", "Needs interaction history"],
          ["Matrix factorisation / embeddings", "Learn hidden taste factors for users and items", "Powers modern streaming and e-commerce", "More complex; needs lots of data"],
        ] },
        { t: "analogy", text: "User-based: \"people with taste like yours loved this film\". Item-based: \"if you liked this biryani place, you'll like that one, because the same people go to both\". Popularity: \"everyone in town is going to this new café\"." },
        { t: "trap", text: "New users and new items have no history (the **cold-start** problem): fall back to popularity or content features. Recommenders can also trap people in a bubble of the same kind of items; mixing in some variety (exploration) helps." },
        { t: "trick", text: "**Popularity → user-based (similar people) → item-based (similar items). Cosine similarity throughout.**" },
        { t: "exam", items: ["How would you build a recommender system?", "User-based vs item-based collaborative filtering?", "What is the cold-start problem?", "How do you evaluate a recommender? (Hold out some likes, check precision@k or recall@k.)", "What is matrix factorisation?"] },
        { t: "recap", items: ["Represent likes as 0/1 vectors", "Popularity: count likes", "User-based: weight others' likes by user similarity", "Item-based: weight items by co-liked similarity", "Handle cold start with popularity or content"] },
      ],
      quiz: [
        { q: "\"Customers who bought this also bought…\" is…", options: ["Item-based collaborative filtering", "Popularity only", "Clustering", "Regression"], answer: 0, explain: "Items liked by the same people." },
        { q: "The cold-start problem affects…", options: ["New users and new items", "Old users", "Popular items", "Only the database"], answer: 0, explain: "They have no history." },
        { q: "Cosine similarity of [1, 0, 1] and [1, 0, 1]?", options: ["1", "0", "0.5", "2"], answer: 0, explain: "Identical direction." },
        { q: "A weakness of popularity-based recommendations?", options: ["Everyone gets the same suggestions", "They need lots of computation", "They can't run on new users", "They're always wrong"], answer: 0, explain: "Not personalised." },
      ],
    },
  ],
};

export const DS16_SCALE_CAREER: LearnModule = {
  id: "scale-career",
  title: "Databases, MapReduce and your career",
  titleHi: "डेटाबेस, MapReduce और करियर",
  blurb: "Query data with SQL using Python's built-in sqlite3, process big data with the MapReduce pattern built from scratch, then plan your path: tools to learn next, projects to build and interview questions to practise.",
  lessons: [
    {
      id: "sql",
      title: "SQL with sqlite3",
      oneLine: "Most company data lives in databases, and SQL is how you ask it questions: SELECT columns FROM a table WHERE rows match, GROUP BY to summarise, JOIN to combine tables. Python's built-in sqlite3 lets you practise real SQL with no setup.",
      minutes: 26,
      blocks: [
        py("Tables, SELECT, WHERE, GROUP BY and JOIN", src`
import sqlite3

db = sqlite3.connect(":memory:")                 # a temporary database in memory
db.executescript("""
CREATE TABLE users  (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, amount REAL, ordered_on TEXT);
INSERT INTO users VALUES (1, 'Asha', 'Patna'), (2, 'Ravi', 'Pune'), (3, 'Zoya', 'Patna'), (4, 'Imran', 'Delhi');
INSERT INTO orders VALUES
  (1, 1, 450, '2026-10-01'), (2, 1, 300, '2026-10-05'), (3, 2, 820, '2026-10-02'),
  (4, 3, 150, '2026-10-03'), (5, 2, 610, '2026-10-07'), (6, 1, 990, '2026-10-09');
""")

def show(sql, params=()):
    for row in db.execute(sql, params):
        print("  ", row)

print("Users in Patna:")
show("SELECT name FROM users WHERE city = ? ORDER BY name", ("Patna",))   # ? = safe parameter

print("Spend per user (JOIN + GROUP BY):")
show("""SELECT u.name, COUNT(o.id) AS orders, SUM(o.amount) AS total
        FROM users u LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id ORDER BY total DESC""")

print("Cities with total spend over 1000 (HAVING):")
show("""SELECT u.city, SUM(o.amount) AS total FROM users u JOIN orders o ON o.user_id = u.id
        GROUP BY u.city HAVING total > 1000""")

print("Orders above the average order (subquery):")
show("SELECT id, amount FROM orders WHERE amount > (SELECT AVG(amount) FROM orders)")
`, "Users in Patna:\n   ('Asha',)\n   ('Zoya',)\nSpend per user (JOIN + GROUP BY):\n   ('Asha', 3, 1740.0)\n   ('Ravi', 2, 1430.0)\n   ('Zoya', 1, 150.0)\n   ('Imran', 0, None)\nCities with total spend over 1000 (HAVING):\n   ('Patna', 1890.0)\n   ('Pune', 1430.0)\nOrders above the average order (subquery):\n   (3, 820.0)\n   (5, 610.0)\n   (6, 990.0)"),
        { t: "table", head: ["Clause", "Does", "Order it runs in"], rows: [["FROM / JOIN", "Pick and combine tables", "1"], ["WHERE", "Filter rows", "2"], ["GROUP BY", "Make groups", "3"], ["HAVING", "Filter groups", "4"], ["SELECT", "Choose and compute columns", "5"], ["ORDER BY / LIMIT", "Sort and cut", "6"]] },
        { t: "p", text: "Notice the **LEFT JOIN**: Imran has no orders but still appears (with a count of 0 and an empty total). An inner JOIN would drop him. **Indexes** (`CREATE INDEX idx_orders_user ON orders(user_id)`) make lookups on a column fast, at the cost of slower inserts." },
        { t: "analogy", text: "A database is a well-organised library, and SQL is the librarian's request form: \"bring me (SELECT) the titles, from the fiction section (FROM), published after 2020 (WHERE), grouped by author (GROUP BY)\". You describe what you want; the database works out how to fetch it." },
        { t: "trap", text: "Never build SQL by gluing strings with user input (`\"... WHERE name = '\" + name + \"'\"`): that's **SQL injection**. Use parameters (`?`). Also, WHERE can't use aggregates like SUM; filter groups with HAVING." },
        { t: "trick", text: "**FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Always use ? parameters.**" },
        { t: "exam", items: ["WHERE vs HAVING?", "INNER JOIN vs LEFT JOIN?", "What is an index? Pros and cons?", "What is SQL injection and how do you prevent it?", "Write a query for the top 3 customers by total spend.", "What are window functions? (ROW_NUMBER, RANK, running totals: learn them next.)"] },
        { t: "recap", items: ["SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY", "JOIN combines tables; LEFT JOIN keeps unmatched rows", "Aggregates: COUNT, SUM, AVG, MIN, MAX", "Indexes speed up lookups", "Parameters (?) prevent SQL injection"] },
      ],
      quiz: [
        { q: "Which filters groups after GROUP BY?", options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"], answer: 0, explain: "WHERE filters rows before grouping." },
        { q: "A user with no orders appears in…", options: ["A LEFT JOIN from users to orders", "An inner JOIN", "Neither", "Only with GROUP BY"], answer: 0, explain: "LEFT JOIN keeps all users." },
        { q: "How do you prevent SQL injection?", options: ["Use query parameters (?)", "Use uppercase SQL", "Use more indexes", "Use ORDER BY"], answer: 0, explain: "Never paste user input into SQL." },
        { q: "SELECT COUNT(*) FROM orders returns…", options: ["The number of rows in orders", "The sum of amounts", "The first row", "The column names"], answer: 0, explain: "An aggregate over all rows." },
      ],
    },
    {
      id: "mapreduce",
      title: "MapReduce: processing big data in parallel",
      oneLine: "When data is too big for one computer, MapReduce splits the work: a map step turns each record into (key, value) pairs on many machines in parallel, a shuffle groups the pairs by key, and a reduce step combines each group. Hadoop and Spark are built on this idea.",
      minutes: 18,
      blocks: [
        { t: "diagram", text: "documents ──▶ MAP (in parallel)     ──▶ SHUFFLE (group by key) ──▶ REDUCE (per key)\n\"data is big\"   (data,1) (is,1) (big,1)    data: [1, 1]               data: 2\n\"big data\"      (big,1) (data,1)           is:   [1]                  is:   1\n                                           big:  [1, 1]               big:  2" },
        py("A general map_reduce, from scratch", src`
from collections import defaultdict

def map_reduce(records, mapper, reducer):
    shuffled = defaultdict(list)
    for record in records:                       # MAP (each record independently → parallelisable)
        for key, value in mapper(record):
            shuffled[key].append(value)          # SHUFFLE (group values by key)
    return {key: reducer(key, values) for key, values in shuffled.items()}   # REDUCE

# 1) Word count
docs = ["data science is fun", "big data is big", "science needs data"]
word_count = map_reduce(docs,
                        mapper=lambda doc: [(w, 1) for w in doc.split()],
                        reducer=lambda word, ones: sum(ones))
print(sorted(word_count.items(), key=lambda kv: (-kv[1], kv[0]))[:4])

# 2) Average order value per city
orders = [("Patna", 450), ("Pune", 820), ("Patna", 300), ("Delhi", 640), ("Pune", 610)]
average = map_reduce(orders,
                     mapper=lambda order: [(order[0], order[1])],
                     reducer=lambda city, amounts: round(sum(amounts) / len(amounts), 1))
print(average)

# 3) Number of distinct users per day
events = [("mon", "asha"), ("mon", "ravi"), ("mon", "asha"), ("tue", "zoya")]
distinct = map_reduce(events, mapper=lambda e: [e], reducer=lambda day, users: len(set(users)))
print(distinct)
`, "[('data', 3), ('big', 2), ('is', 2), ('science', 2)]\n{'Patna': 375.0, 'Pune': 715.0, 'Delhi': 640.0}\n{'mon': 2, 'tue': 1}"),
        { t: "p", text: "The mapper only ever sees one record, and the reducer only sees one key's values. That's what makes it scale: thousands of machines can each map a slice of the data, then each reducer handles a few keys. Today, **Apache Spark** (PySpark) runs this kind of pipeline with a friendlier, DataFrame-style API." },
        { t: "analogy", text: "Counting votes in a national election: every booth counts its own ballots (map), the counts are sent to the right constituency office (shuffle), and each office adds up its booths (reduce). No single person counts every vote." },
        { t: "trap", text: "Don't reach for big-data tools too early: data that fits in memory (even a few GB) is faster and simpler with pandas or SQL. The shuffle step moves data across the network and is usually the slowest part, so mappers should emit as little as possible." },
        { t: "trick", text: "**Map: record → (key, value). Shuffle: group by key. Reduce: combine each group.**" },
        { t: "exam", items: ["Explain MapReduce with word count.", "Why does MapReduce scale?", "What is the shuffle phase?", "Hadoop vs Spark?", "When should you NOT use big-data tools?"] },
        { t: "recap", items: ["Map emits (key, value) pairs per record", "Shuffle groups values by key", "Reduce combines each key's values", "Each step parallelises across machines", "Spark is the modern standard"] },
      ],
      quiz: [
        { q: "In word count, the mapper emits…", options: ["(word, 1) for each word", "The total count", "Sorted words", "Documents"], answer: 0, explain: "Reducers add them up." },
        { q: "The shuffle step…", options: ["Groups all values with the same key", "Randomises rows", "Deletes duplicates", "Sorts documents by length"], answer: 0, explain: "So each reducer gets one key's values." },
        { q: "Why can MapReduce run on many machines?", options: ["Mappers and reducers work on independent pieces", "It uses one big computer", "It avoids data", "It only works on small data"], answer: 0, explain: "Embarrassingly parallel steps." },
        { q: "For a 2 GB CSV on your laptop, you should usually use…", options: ["pandas or SQL", "A Hadoop cluster", "MapReduce by hand", "Nothing"], answer: 0, explain: "Big-data tools add overhead." },
      ],
    },
    {
      id: "go-forth",
      title: "Go forth: tools, projects and interviews",
      oneLine: "You've built the core of data science by hand. Next, learn the industry tools that do it fast (NumPy, pandas, scikit-learn, SQL, a deep-learning framework), build projects with real data, and practise explaining your work, because that's what interviews test.",
      minutes: 15,
      blocks: [
        { t: "h", text: "From scratch → libraries" },
        { t: "table", head: ["You built", "Industry tool"], rows: [
          ["Vectors and matrices", "NumPy (`np.array`, `@`)"],
          ["Lists of dicts, group by", "pandas (`DataFrame`, `groupby`)"],
          ["Charts in text", "matplotlib, seaborn, Plotly"],
          ["Statistics, tests", "SciPy, statsmodels"],
          ["k-NN, naive Bayes, regression, trees, forests, k-means", "scikit-learn"],
          ["Neural networks and backprop", "PyTorch, TensorFlow/Keras"],
          ["n-grams, TF-IDF", "scikit-learn's TfidfVectorizer, spaCy, Hugging Face transformers"],
          ["Centrality, PageRank", "NetworkX"],
          ["sqlite3", "PostgreSQL, MySQL, BigQuery, Snowflake"],
          ["map_reduce", "Apache Spark (PySpark)"],
        ] },
        { t: "h", text: "Projects that get interviews" },
        { t: "points", items: [
          "**End-to-end prediction:** churn or loan default with EDA, a baseline, a better model, proper evaluation and a business recommendation.",
          "**A/B test analysis:** design, sample size, results, and a clear go/no-go decision.",
          "**NLP:** sentiment analysis or topic grouping of product reviews in Hindi/English.",
          "**SQL dashboard:** questions answered with SQL on a public dataset, visualised in Power BI or Streamlit.",
          "**Your own data:** cricket stats, train delays, prices from your city. Unique projects stand out.",
          "Put each on GitHub with a README: problem, data, approach, results, how to run it.",
        ] },
        { t: "h", text: "Interview quick-fire" },
        { t: "table", head: ["Question", "Answer in one line"], rows: [
          ["How does k-NN work?", "Find the k nearest labelled points and take a majority vote; scale features first"],
          ["Why is naive Bayes \"naive\"?", "It assumes features are independent given the class"],
          ["Explain gradient descent.", "Repeatedly step against the gradient of the loss, sized by the learning rate"],
          ["Overfitting: detect and fix?", "Train ≫ test score; simpler model, more data, regularisation, cross-validation"],
          ["Precision vs recall?", "Correct among flagged vs caught among actual positives"],
          ["What does a decision tree split on?", "The question that most reduces entropy (or Gini impurity)"],
          ["Why do random forests work?", "Many decorrelated trees vote, so their errors cancel"],
          ["What is backpropagation?", "The chain rule applied backwards to get every weight's gradient"],
          ["How does k-means work?", "Assign to nearest centre, move centres to means, repeat"],
          ["What is TF-IDF?", "Word frequency in a document × how rare the word is across documents"],
          ["Explain PageRank.", "Importance flows along links; links from important pages count more"],
          ["WHERE vs HAVING?", "Filter rows before grouping vs filter groups after"],
          ["What is MapReduce?", "Map to (key, value), shuffle by key, reduce each group, in parallel"],
          ["What is Bayes' theorem used for?", "Updating a probability with evidence: P(A|B) = P(B|A)P(A)/P(B)"],
          ["What is a p-value?", "Probability of data at least this extreme if the null hypothesis were true"],
        ] },
        { t: "h", text: "A 12-week plan" },
        { t: "table", head: ["Weeks", "Focus"], rows: [["1–3", "NumPy, pandas, matplotlib on real datasets (Kaggle, data.gov.in)"], ["4–5", "SQL every day: joins, group by, window functions"], ["6–8", "scikit-learn: pipelines, cross-validation, two portfolio projects"], ["9–10", "One specialisation: NLP, deep learning (PyTorch) or analytics (Power BI/Tableau)"], ["11–12", "Polish GitHub, resume and LinkedIn; mock interviews; apply"]] },
        { t: "analogy", text: "You've learned to cook every dish from raw ingredients. Now you can use the restaurant kitchen's machines (libraries) confidently, because you know what each machine does inside and can tell when it's doing something wrong." },
        { t: "trap", text: "Don't collect certificates instead of building. One project with messy real data, honest evaluation and a clear write-up is worth more than ten course completions. And keep practising SQL: it appears in almost every data interview." },
        { t: "trick", text: "**Libraries for speed, from-scratch knowledge for understanding, projects for proof.**" },
        { t: "exam", items: ["Walk me through a project end to end.", "Which algorithm would you choose for problem X, and why?", "How would you explain your model to a non-technical manager?", "What would you do in your first 30 days as a data scientist here?"] },
        { t: "recap", items: ["Learn NumPy, pandas, scikit-learn, SQL, one DL framework", "Build 2–4 projects with real data and clear READMEs", "Practise explaining algorithms in one line", "SQL is tested almost everywhere", "Keep learning: data science changes every year"] },
      ],
      quiz: [
        { q: "Which library implements k-NN, trees and k-means for you?", options: ["scikit-learn", "requests", "sqlite3", "re"], answer: 0, explain: "The standard ML toolkit." },
        { q: "Which skill appears in almost every data interview?", options: ["SQL", "Assembly language", "Photoshop", "Excel macros only"], answer: 0, explain: "Practise it daily." },
        { q: "What makes a portfolio project stand out?", options: ["Real data, honest evaluation and a clear write-up", "Lots of certificates", "The longest code", "Only accuracy numbers"], answer: 0, explain: "Show your thinking." },
        { q: "PyTorch and TensorFlow are used for…", options: ["Deep learning (neural networks)", "SQL databases", "Web scraping", "Spreadsheets"], answer: 0, explain: "They automate backpropagation." },
      ],
    },
  ],
};
