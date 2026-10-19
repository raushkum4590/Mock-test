import type { LearnModule } from "../types";

/** React for beginners, modules 3–4: JSX, components, props and styling. */
export const RB03_JSX: LearnModule = {
  id: "jsx",
  title: "JSX",
  titleHi: "जेएसएक्स",
  blurb: "Write HTML-like code inside JavaScript: rules, expressions, conditions and lists.",
  lessons: [
    {
      id: "jsx-rules",
      title: "JSX rules",
      oneLine: "JSX looks like HTML but follows a few JavaScript rules: return one parent element, write className instead of class, and close every tag.",
      minutes: 13,
      blocks: [
        { t: "h", text: "Step 1: What is JSX?" },
        { t: "p", text: "**JSX** lets you write HTML-like code inside JavaScript. It's what components return. Browsers don't understand JSX directly, so a tool (Vite uses a compiler for this) turns it into normal JavaScript before it runs." },
        { t: "code", lang: "jsx", code: "// What you write (JSX)\nconst heading = <h1 className=\"title\">Hello</h1>;\n\n// What it becomes (plain JavaScript)\nconst heading2 = React.createElement(\"h1\", { className: \"title\" }, \"Hello\");" },
        { t: "p", text: "You'll never write the second form yourself. It's just good to know that JSX is JavaScript underneath, which explains its rules." },
        { t: "code", lang: "jsx", tryIt: "react", title: "JSX in action", code: "function ProfileCard() {\n  return (\n    <div className=\"card\">\n      <span style={{ fontSize: 40 }}>👩‍💻</span>\n      <h2>Asha Verma</h2>\n      <p>Frontend Developer</p>\n      <br />\n      <button>Follow</button>\n    </div>\n  );\n}\n\nrender(<ProfileCard />);" },

        { t: "h", text: "Step 2: The five JSX rules" },
        { t: "table", head: ["Rule", "❌ Wrong", "✅ Right", "Why"], rows: [
          ["1. Return **one** parent element", "`return <h1/><p/>`", "`return <div><h1/><p/></div>`", "A function can return only one thing"],
          ["2. Use `className`, not `class`", "`<div class=\"box\">`", "`<div className=\"box\">`", "`class` is a reserved word in JavaScript"],
          ["3. Close every tag", "`<img src=\"a.png\">`, `<br>`", "`<img src=\"a.png\" />`, `<br />`", "JSX is stricter than HTML"],
          ["4. Attributes in camelCase", "`onclick`, `tabindex`", "`onClick`, `tabIndex`", "They become JavaScript property names"],
          ["5. `style` is an object", "`style=\"color:red\"`", "`style={{ color: \"red\" }}`", "Styles are JavaScript objects in React"],
        ] },

        { t: "h", text: "Step 3: Rule 1 in detail: one parent, or a fragment" },
        { t: "p", text: "If you need two elements side by side and don't want an extra `<div>`, use a **fragment**: an empty tag `<> </>`. It groups elements without adding anything to the page." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Fragment <> </>", code: "function Info() {\n  return (\n    <>\n      <h3>Title</h3>\n      <p>Two elements, and no extra wrapper div on the page.</p>\n    </>\n  );\n}\n\nrender(<Info />);" },

        { t: "h", text: "Step 4: Rule 5 in detail: why style uses {{ }}" },
        { t: "example", title: "Reading style={{ color: \"red\", fontSize: 20 }}", steps: [
          "The **outer** `{ }` means \"JavaScript starts here\" (you'll learn this in the next lesson).",
          "The **inner** `{ }` is a normal JavaScript **object**: { color: \"red\", fontSize: 20 }.",
          "CSS names with dashes become camelCase: `font-size` → `fontSize`, `background-color` → `backgroundColor`.",
          "Numbers become pixels automatically: `fontSize: 20` means 20px.",
        ], answer: "Two curly braces = JavaScript containing an object." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Inline styles", code: "function Badge() {\n  return (\n    <span style={{ backgroundColor: \"#04aa6d\", color: \"white\", padding: \"4px 12px\", borderRadius: 999, fontSize: 14 }}>\n      New\n    </span>\n  );\n}\n\nrender(<Badge />);" },
        { t: "analogy", text: "JSX is like writing a letter in your own shorthand. The compiler is the assistant who rewrites it neatly in proper JavaScript before sending it. The shorthand has a few rules so the assistant can understand you." },
        { t: "trap", text: "Most beginner JSX errors come from returning two elements side by side (\"Adjacent JSX elements must be wrapped in an enclosing tag\"). Wrap them in a `<div>` or a fragment `<>…</>`. Also, if you return JSX on several lines, put it inside `( )` after `return`." },
        { t: "trick", text: "**One parent, className, close every tag, camelCase, style={{ }}.**" },
        { t: "exam", items: ["What is JSX? (A syntax extension that looks like HTML and compiles to React.createElement calls.)", "Why className instead of class? (class is a reserved word in JavaScript.)", "What is a React Fragment? (A wrapper, written <></>, that adds no extra DOM node.)", "Can browsers read JSX directly? (No, it's compiled to JavaScript first.)"] },
        { t: "recap", items: ["JSX = HTML-like syntax that becomes JavaScript", "Return one parent element (or a fragment <>…</>)", "className, camelCase attributes, close all tags", "style takes an object: style={{ color: \"red\" }}"] },
      ],
      quiz: [
        { q: "Which attribute sets a CSS class in JSX?", options: ["className", "class", "cssClass", "styleName"], answer: 0, explain: "class is reserved in JavaScript." },
        { q: "Which is correct JSX for an image?", options: ["<img src=\"a.png\" />", "<img src=\"a.png\">", "<img>a.png</img>", "<image src=a.png>"], answer: 0, explain: "Self-closing tags need the slash." },
        { q: "How do you return two elements without adding a div?", options: ["Wrap them in a fragment <>…</>", "Separate them with a comma", "Use two return statements", "It's impossible"], answer: 0, explain: "Fragments add no extra HTML." },
        { q: "Which is the correct inline style in JSX?", options: ["style={{ color: \"red\" }}", "style=\"color: red\"", "style={color: red}", "css=\"red\""], answer: 0, explain: "Outer braces for JavaScript, inner braces for the object." },
        { q: "background-color in a JSX style object is written as:", options: ["backgroundColor", "background-color", "BackgroundColor", "bgColor"], answer: 0, explain: "CSS names become camelCase." },
      ],
    },
    {
      id: "jsx-expressions",
      title: "JavaScript inside JSX with { }",
      oneLine: "Curly braces { } open a window from JSX into JavaScript: put any value or expression inside, such as variables, maths or function calls.",
      minutes: 11,
      blocks: [
        { t: "h", text: "Step 1: The problem: showing data, not fixed text" },
        { t: "p", text: "`<h2>Hi, I'm Ravi</h2>` always says Ravi. But real apps show **data**: the logged-in user's name, today's date, a price. To show a JavaScript value inside JSX, wrap it in **curly braces**." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Curly braces", code: "function Profile() {\n  const name = \"Ravi\";\n  const age = 21;\n  const skills = [\"HTML\", \"CSS\", \"React\"];\n\n  return (\n    <div>\n      <h2>Hi, I'm {name}</h2>\n      <p>Next year I'll be {age + 1}.</p>\n      <p>Skills: {skills.join(\", \")}</p>\n      <p>I know {skills.length} skills.</p>\n      <p>Name in capitals: {name.toUpperCase()}</p>\n    </div>\n  );\n}\n\nrender(<Profile />);" },

        { t: "h", text: "Step 2: What can go inside { }?" },
        { t: "p", text: "Any **expression**, meaning any piece of JavaScript that produces a **value**." },
        { t: "table", head: ["✅ Allowed (gives a value)", "Example", "❌ Not allowed (a statement)"], rows: [
          ["A variable", "`{name}`", "`if (x) { … }`"],
          ["Maths", "`{price * 2}`", "`for (let i…) { … }`"],
          ["A function call", "`{name.toUpperCase()}`", "`let total = 5`"],
          ["A ternary (short if)", "`{age >= 18 ? \"Adult\" : \"Minor\"}`", "`switch (…)`"],
          ["An array of elements", "`{items.map(i => <li>{i}</li>)}`", "`function f() {}` declarations"],
        ] },
        { t: "p", text: "Need an `if` or a loop? Do it **above** the `return` in normal JavaScript, then show the result with `{ }`." },

        { t: "h", text: "Step 3: Braces in attributes too" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Attributes can use { }", code: "function Avatar() {\n  const size = 80;\n  const name = \"Ravi Kumar\";\n  const initials = name.split(\" \").map(word => word[0]).join(\"\");\n\n  return (\n    <div\n      title={name}\n      style={{ width: size, height: size, borderRadius: \"50%\", background: \"#04aa6d\", color: \"white\", display: \"grid\", placeItems: \"center\", fontSize: size / 3 }}\n    >\n      {initials}\n    </div>\n  );\n}\n\nrender(<Avatar />);" },
        { t: "example", title: "How {initials} becomes \"RK\"", steps: [
          "`name.split(\" \")` breaks \"Ravi Kumar\" into [\"Ravi\", \"Kumar\"].",
          "`.map(word => word[0])` takes the first letter of each: [\"R\", \"K\"].",
          "`.join(\"\")` glues them together: \"RK\".",
          "`{initials}` in the JSX shows \"RK\" on the screen.",
        ], answer: "Calculate in JavaScript above the return, then show the result with { }." },
        { t: "analogy", text: "JSX is a printed form, and `{ }` is a blank box on the form. JavaScript writes the current value into each box every time the component is drawn." },
        { t: "trap", text: "Use quotes for fixed text and braces for values: `width=\"100\"` gives the text \"100\", while `width={100}` gives the number 100. And `{ }` can't show a plain object: `{user}` fails (\"Objects are not valid as a React child\"). Show its parts instead: `{user.name}`." },
        { t: "trick", text: "**Quotes = fixed text. Braces = JavaScript value.**" },
        { t: "exam", items: ["How do you embed JavaScript in JSX? (With curly braces { }.)", "Can you use if statements inside JSX? (Not directly. Use a ternary, &&, or an if above the return.)", "Why does rendering an object fail? (React can render strings, numbers and elements, but not plain objects.)"] },
        { t: "recap", items: ["{ } = a window into JavaScript inside JSX", "Any expression works: variables, maths, function calls, ternaries", "No if/for statements inside { } (use them above the return)", "Attributes take { } too: src={url} width={100}"] },
      ],
      quiz: [
        { q: "What does <p>{2 + 3}</p> show?", options: ["5", "2 + 3", "{2 + 3}", "23"], answer: 0, explain: "The expression is calculated." },
        { q: "Which can go inside JSX curly braces?", options: ["user.name.toUpperCase()", "if (x) { }", "for (let i…)", "let a = 1"], answer: 0, explain: "Only expressions that produce a value." },
        { q: "How do you set an image's source from a variable called url?", options: ["<img src={url} />", "<img src=\"url\" />", "<img src=${url} />", "<img {url} />"], answer: 0, explain: "Braces read the variable." },
        { q: "const user = { name: \"Asha\" }; Which shows Asha?", options: ["{user.name}", "{user}", "\"user.name\"", "{name.user}"], answer: 0, explain: "Plain objects can't be shown directly." },
        { q: "Where should you write an if statement for a component?", options: ["Above the return statement", "Inside { } in the JSX", "In the CSS file", "You can't use if in React"], answer: 0, explain: "Then show the result with { }." },
      ],
    },
    {
      id: "conditional-rendering",
      title: "Showing things conditionally",
      oneLine: "Show or hide parts of the UI depending on your data: use the ternary ( ? : ) for this-or-that, && for show-or-nothing, and an early return for completely different screens.",
      minutes: 13,
      blocks: [
        { t: "h", text: "Step 1: The problem" },
        { t: "p", text: "Real apps show different things in different situations: \"Log in\" or \"Welcome back\", a loading spinner or the data, \"Cart is empty\" or the cart list. You can't write `if` inside JSX, so React developers use three patterns." },

        { t: "h", text: "Step 2: Pattern 1: the ternary (this OR that)" },
        { t: "code", lang: "jsx", code: "condition ? showThisIfTrue : showThisIfFalse" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Ternary", code: "function LoginStatus({ isLoggedIn }) {\n  return (\n    <p>\n      {isLoggedIn ? \"Welcome back! 👋\" : \"Please log in.\"}\n    </p>\n  );\n}\n\nrender(\n  <>\n    <LoginStatus isLoggedIn={true} />\n    <LoginStatus isLoggedIn={false} />\n  </>\n);" },
        { t: "p", text: "Read `isLoggedIn ? A : B` as: \"Is the user logged in? If **yes**, show A. If **no**, show B.\" (`isLoggedIn` here is a **prop**: data passed into the component. You'll learn props in the next module.)" },

        { t: "h", text: "Step 3: Pattern 2: && (show it OR nothing)" },
        { t: "code", lang: "jsx", tryIt: "react", title: "&&", code: "function Cart({ items }) {\n  return (\n    <div>\n      <h3>Your cart</h3>\n      {items.length > 0 && <p>You have {items.length} items 🛒</p>}\n      {items.length === 0 && <p>Your cart is empty.</p>}\n    </div>\n  );\n}\n\nrender(\n  <>\n    <Cart items={[\"Pen\", \"Book\"]} />\n    <Cart items={[]} />\n  </>\n);" },
        { t: "example", title: "How {items.length > 0 && <p>…</p>} works", steps: [
          "JavaScript first checks the left side: is items.length > 0?",
          "If it's **true**, `&&` gives back the right side (the `<p>`), and React shows it.",
          "If it's **false**, `&&` stops and gives back `false`, and React shows **nothing** for false.",
        ], answer: "&& = \"if this is true, show that; otherwise show nothing\"." },

        { t: "h", text: "Step 4: Pattern 3: early return (completely different screen)" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Early return", code: "function Profile({ user }) {\n  if (!user) {\n    return <p>Loading… ⏳</p>;      // stop here and show this instead\n  }\n\n  return (\n    <div>\n      <h2>Hello, {user.name}</h2>\n      <p>📍 {user.city}</p>\n    </div>\n  );\n}\n\nrender(\n  <>\n    <Profile user={null} />\n    <Profile user={{ name: \"Asha\", city: \"Pune\" }} />\n  </>\n);" },
        { t: "table", head: ["You want…", "Use", "Example"], rows: [["Show A **or** B", "Ternary `? :`", "`{isOpen ? <Close /> : <Open />}`"], ["Show A **or nothing**", "`&&`", "`{error && <p>{error}</p>}`"], ["A totally different screen", "`if` + early return", "`if (loading) return <Spinner />;`"]] },
        { t: "analogy", text: "A ternary is a two-way road sign: left or right. `&&` is a door that only opens when the condition is true. An early return is a \"Closed\" sign at the shop entrance: you don't go in at all." },
        { t: "trap", text: "`{count && <p>New!</p>}` shows a **0** on the screen when count is 0, because 0 is falsy, so && returns 0, and React prints numbers. Always compare: `{count > 0 && <p>New!</p>}`." },
        { t: "trick", text: "**? : for either-or, && for show-or-hide, return early for a different screen.**" },
        { t: "exam", items: ["How do you do conditional rendering in React? (Ternary, &&, or an early return.)", "Why can {count && <X />} print 0? (0 is falsy, && returns it, and React renders numbers.)", "How do you show nothing? (Return null, or let && evaluate to false.)"] },
        { t: "recap", items: ["cond ? A : B shows one of two things", "cond && A shows A or nothing", "if + early return for loading or empty screens", "Use count > 0 &&, never count && alone"] },
      ],
      quiz: [
        { q: "{isAdmin ? <Admin /> : <User />} shows…", options: ["Admin if isAdmin is true, otherwise User", "Both components", "Neither", "Only Admin"], answer: 0, explain: "The ternary picks one." },
        { q: "{hasError && <p>Error!</p>} when hasError is false shows:", options: ["Nothing", "false", "Error!", "0"], answer: 0, explain: "React skips false." },
        { q: "With count = 0, what does {count && <b>New</b>} show?", options: ["0", "Nothing", "New", "false"], answer: 0, explain: "Use count > 0 && … instead." },
        { q: "Which can you NOT write directly inside JSX braces?", options: ["An if statement", "A ternary", "&&", "A variable"], answer: 0, explain: "Use if before the return instead." },
        { q: "How do you show a loading message instead of the whole component?", options: ["if (loading) return <p>Loading…</p>;", "{loading}", "loading && return", "<if loading>"], answer: 0, explain: "An early return." },
      ],
    },
    {
      id: "lists-keys",
      title: "Lists and keys",
      oneLine: "Turn an array of data into a list on screen with map, and give each item a unique key so React can keep track of it.",
      minutes: 13,
      blocks: [
        { t: "h", text: "Step 1: The problem: showing a list from data" },
        { t: "p", text: "Real data comes as arrays: students, products, messages. You don't want to write `<li>` 50 times by hand. Instead, use **map** (from the JavaScript module) to turn each item into JSX." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Rendering a list", code: "const students = [\n  { id: 1, name: \"Asha\", marks: 91 },\n  { id: 2, name: \"Ravi\", marks: 78 },\n  { id: 3, name: \"Meena\", marks: 85 },\n];\n\nfunction StudentList() {\n  return (\n    <ul>\n      {students.map(student => (\n        <li key={student.id}>\n          {student.name}: {student.marks} marks\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nrender(<StudentList />);" },
        { t: "example", title: "What students.map(…) does here", steps: [
          "map takes the first student {id: 1, name: \"Asha\", …} and returns `<li key={1}>Asha: 91 marks</li>`.",
          "Then the second → `<li key={2}>Ravi: 78 marks</li>`, and the third → Meena's `<li>`.",
          "map gives back an **array of three `<li>` elements**.",
          "Inside `{ }`, React shows every element in that array, one after another inside the `<ul>`.",
        ], answer: "Data array → map → array of elements → shown on screen." },

        { t: "h", text: "Step 2: What is key, and why is it needed?" },
        { t: "p", text: "Every item in a list needs a `key` prop with a value that is **unique** in that list, usually an id from your data. When the list changes (an item is added, removed or moved), React uses the keys to know **which item is which**, so it updates only what changed." },
        { t: "analogy", text: "Keys are like roll numbers in a class. If students change seats, the teacher still knows who's who by their roll number. Without roll numbers, the teacher can only say \"the student in seat 3\", and gets confused when people move." },
        { t: "p", text: "If you forget the key, the list still shows, but React prints a warning in the console: \"Each child in a list should have a unique key prop\"." },

        { t: "h", text: "Step 3: filter then map" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Only show products in stock", code: "const products = [\n  { id: \"p1\", name: \"Laptop\", price: 55000, inStock: true },\n  { id: \"p2\", name: \"Mouse\", price: 499, inStock: false },\n  { id: \"p3\", name: \"Keyboard\", price: 1299, inStock: true },\n];\n\nfunction InStock() {\n  const available = products.filter(p => p.inStock);     // 1. keep some\n\n  return (\n    <ul>\n      {available.map(p => (                               // 2. turn into <li>\n        <li key={p.id}>\n          {p.name} · ₹{p.price.toLocaleString(\"en-IN\")}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nrender(<InStock />);" },

        { t: "h", text: "Step 4: Lists of components" },
        { t: "code", lang: "jsx", tryIt: "react", title: "map to a component", code: "function ProductCard({ name, price }) {\n  return (\n    <div style={{ border: \"1px solid #ddd\", borderRadius: 8, padding: 10, marginBottom: 6 }}>\n      <b>{name}</b> · ₹{price}\n    </div>\n  );\n}\n\nconst products = [\n  { id: 1, name: \"Pen\", price: 20 },\n  { id: 2, name: \"Notebook\", price: 60 },\n  { id: 3, name: \"Bag\", price: 799 },\n];\n\nfunction App() {\n  return (\n    <div>\n      {products.map(p => (\n        <ProductCard key={p.id} name={p.name} price={p.price} />\n      ))}\n    </div>\n  );\n}\n\nrender(<App />);", note: "The key goes on the outermost element returned by map, here `<ProductCard>`." },
        { t: "trap", text: "Avoid `key={index}` when items can be added, removed or re-ordered. When the list changes, the positions change, so React mixes up which item is which (for example, keeping the wrong text in an input box). Use a real id from your data. Also: keys must be unique **among siblings**, not across the whole app." },
        { t: "trick", text: "**map makes the list, key names each item.**" },
        { t: "exam", items: ["What is the key prop and why is it needed? (It helps React identify which items changed, were added or were removed.)", "Why not use the array index as a key? (It breaks when items are reordered or removed.)", "Do keys need to be globally unique? (No, only among siblings in the same list.)", "Where do you put the key? (On the top element returned inside map.)"] },
        { t: "recap", items: ["array.map(item => <li key={item.id}>…</li>)", "Keys must be unique among siblings", "Prefer ids from your data over the index", "filter first, then map, to show only some items"] },
      ],
      quiz: [
        { q: "Which method is used to render a list in JSX?", options: ["map", "forEach", "push", "join"], answer: 0, explain: "map returns an array of elements." },
        { q: "What should a list item's key usually be?", options: ["A unique id from the data", "Math.random()", "The same value for every item", "Nothing"], answer: 0, explain: "Stable and unique." },
        { q: "Why is key={index} risky?", options: ["Items can get mixed up when the list changes order", "It's slower to type", "Index isn't a number", "React doesn't allow numbers"], answer: 0, explain: "The index changes when items move." },
        { q: "Keys must be unique…", options: ["Among siblings in the same list", "Across the whole app", "Across all websites", "Only in production"], answer: 0, explain: "Two different lists can reuse the same keys." },
        { q: "What happens if you forget the key?", options: ["The list shows, but React warns in the console", "The app crashes", "Nothing is shown", "The page reloads"], answer: 0, explain: "Always add one." },
      ],
    },
  ],
};

export const RB04_COMPONENTS: LearnModule = {
  id: "components",
  title: "Components and props",
  titleHi: "कंपोनेंट और प्रॉप्स",
  blurb: "Pass data into components with props, nest them with children, and style them.",
  lessons: [
    {
      id: "props",
      title: "Props: passing data to components",
      oneLine: "Props are the inputs of a component. The parent passes them like HTML attributes, and the child reads them, so one component can show different data each time.",
      minutes: 15,
      blocks: [
        { t: "h", text: "Step 1: The problem: every card looks the same" },
        { t: "p", text: "Earlier we used `<ProductCard />` three times, but all three showed the same headphones. A card component is only useful if each card can show **different** data. That's what **props** are for." },
        { t: "code", lang: "jsx", tryIt: "react", title: "❌ Without props: every card is identical", code: "function ProductCard() {\n  return <p>🎧 Headphones · ₹1999</p>;\n}\n\nrender(\n  <>\n    <ProductCard />\n    <ProductCard />\n  </>\n);" },

        { t: "h", text: "Step 2: Passing props" },
        { t: "code", lang: "jsx", tryIt: "react", title: "✅ With props: same component, different data", code: "function ProductCard({ name, price, emoji }) {\n  return (\n    <div style={{ border: \"1px solid #ddd\", borderRadius: 8, padding: 12, marginBottom: 8 }}>\n      <h3>{emoji} {name}</h3>\n      <p>₹{price}</p>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <>\n      <ProductCard name=\"Headphones\" price={1999} emoji=\"🎧\" />\n      <ProductCard name=\"Watch\" price={2999} emoji=\"⌚\" />\n      <ProductCard name=\"Backpack\" price={1499} emoji=\"🎒\" />\n    </>\n  );\n}\n\nrender(<App />);" },
        { t: "example", title: "What happens for <ProductCard name=\"Watch\" price={2999} emoji=\"⌚\" />", steps: [
          "React collects the attributes into **one object**: { name: \"Watch\", price: 2999, emoji: \"⌚\" }. This object is called **props**.",
          "React calls `ProductCard(props)` with that object.",
          "`function ProductCard({ name, price, emoji })` **destructures** the object, so name = \"Watch\", price = 2999 and emoji = \"⌚\".",
          "The JSX uses them: `<h3>⌚ Watch</h3>` and `<p>₹2999</p>`.",
          "The next `<ProductCard …>` gets its own props object with different values.",
        ], answer: "Props = the attributes you write, delivered to the component as one object." },

        { t: "h", text: "Step 3: The two ways to read props" },
        { t: "code", lang: "jsx", code: "// 1. Using the props object\nfunction ProductCard(props) {\n  return <h3>{props.name}: ₹{props.price}</h3>;\n}\n\n// 2. Destructuring (most common)\nfunction ProductCard({ name, price }) {\n  return <h3>{name}: ₹{price}</h3>;\n}" },
        { t: "table", head: ["Passing…", "Write", "Notes"], rows: [["Text", "`name=\"Watch\"`", "Quotes"], ["Number", "`price={2999}`", "Braces (`price=\"2999\"` would be text)"], ["Boolean", "`inStock={true}` or just `inStock`", "Writing the name alone means true"], ["Array / object", "`tags={[\"new\", \"sale\"]}`", "Braces"], ["Function", "`onBuy={handleBuy}`", "Braces: used for events (later lessons)"]] },

        { t: "h", text: "Step 4: Default values" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Default values for props", code: "function Button({ label = \"Click me\", color = \"#04aa6d\" }) {\n  return (\n    <button style={{ background: color, color: \"white\", border: 0, padding: \"8px 16px\", borderRadius: 6 }}>\n      {label}\n    </button>\n  );\n}\n\nrender(\n  <>\n    <Button />{\" \"}\n    <Button label=\"Delete\" color=\"crimson\" />{\" \"}\n    <Button label=\"Save\" />\n  </>\n);", note: "If a prop isn't passed, the default after `=` is used." },
        { t: "analogy", text: "A component is a coffee machine, and props are the buttons you press: size, sugar, milk. Same machine, a different coffee each time. The coffee machine can't press its own buttons, and in the same way a component can't change its own props." },
        { t: "trap", text: "Props are **read-only**. Never write `props.name = \"x\"` or `name = \"x\"` inside a child. Props belong to the parent. If a value needs to change over time, that's **state** (module 5)." },
        { t: "trick", text: "**Props go down, like water flowing from parent to child.**" },
        { t: "exam", items: ["What are props? (Inputs passed from a parent component to a child.)", "Are props mutable? (No, they are read-only.)", "Difference between props and state? (Props come from the parent; state is managed inside the component.)", "How do you give a prop a default value? (A default in destructuring: ({ size = 10 }).)"] },
        { t: "recap", items: ["Props = inputs to a component, passed like attributes", "Parent: <Card title=\"Hi\" count={3} />", "Child: function Card({ title, count })", "Text in quotes, everything else in { }", "Props are read-only; defaults with ({ x = 1 })"] },
      ],
      quiz: [
        { q: "How does a parent pass the number 5 as a prop called count?", options: ["<Box count={5} />", "<Box count=\"5\" /> only", "<Box {count: 5} />", "<Box>count=5</Box>"], answer: 0, explain: "Numbers go in braces." },
        { q: "Can a child component change its props?", options: ["No, props are read-only", "Yes, anytime", "Only numbers", "Only in class components"], answer: 0, explain: "Use state for changing values." },
        { q: "function Card({ title }) { … } What is this?", options: ["Destructuring the props object", "Creating state", "Importing a file", "A loop"], answer: 0, explain: "It takes title out of props." },
        { q: "Props flow…", options: ["From parent to child", "From child to parent", "Between siblings automatically", "From the server only"], answer: 0, explain: "One-way data flow." },
        { q: "In <Card title=\"Hi\" />, what does Card receive?", options: ["A props object: { title: \"Hi\" }", "Just the string \"Hi\"", "Nothing", "An array"], answer: 0, explain: "All attributes arrive in one object." },
      ],
    },
    {
      id: "children",
      title: "children: components that wrap content",
      oneLine: "Whatever you put between a component's opening and closing tags arrives as the special children prop, which lets you build reusable wrappers like cards and layouts.",
      minutes: 10,
      blocks: [
        { t: "h", text: "Step 1: The problem" },
        { t: "p", text: "You want a nice bordered **Card** for different content: sometimes a paragraph, sometimes a list, sometimes a form. Passing all that through normal props would be awkward. Instead, you put the content **between the tags**, just like HTML." },
        { t: "code", lang: "jsx", code: "<Card title=\"About me\">\n  <p>Anything you put here…</p>     ← this is children\n</Card>" },

        { t: "h", text: "Step 2: Using children" },
        { t: "code", lang: "jsx", tryIt: "react", title: "A reusable Card wrapper", code: "function Card({ title, children }) {\n  return (\n    <section style={{ border: \"2px solid #04aa6d\", borderRadius: 10, padding: 12, marginBottom: 10 }}>\n      <h3 style={{ marginTop: 0 }}>{title}</h3>\n      {children}\n    </section>\n  );\n}\n\nrender(\n  <>\n    <Card title=\"About me\">\n      <p>I'm learning React to become a frontend developer.</p>\n    </Card>\n\n    <Card title=\"Skills\">\n      <ul>\n        <li>HTML</li>\n        <li>CSS</li>\n        <li>JavaScript</li>\n      </ul>\n    </Card>\n  </>\n);" },
        { t: "example", title: "What happens with <Card title=\"Skills\"><ul>…</ul></Card>", steps: [
          "React gives Card a props object: { title: \"Skills\", children: <ul>…</ul> }.",
          "Card draws its green border and the `<h3>` with the title.",
          "`{children}` says \"put whatever was between my tags right here\", so the list appears inside the border.",
        ], answer: "children = the content between the opening and closing tags." },

        { t: "h", text: "Step 3: A real use: page layout" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Layout with children", code: "function Layout({ children }) {\n  return (\n    <div>\n      <header style={{ background: \"#282a35\", color: \"white\", padding: 10 }}>🛍️ My Shop</header>\n      <main style={{ padding: 10, minHeight: 80 }}>{children}</main>\n      <footer style={{ borderTop: \"1px solid #ddd\", padding: 10 }}>© 2026</footer>\n    </div>\n  );\n}\n\nrender(\n  <Layout>\n    <h2>Home page</h2>\n    <p>Every page can reuse the same header and footer.</p>\n  </Layout>\n);" },
        { t: "analogy", text: "A component with `children` is a gift box. The box (border, title, header) is always the same, and you put a different present inside each time." },
        { t: "trap", text: "If you forget to write `{children}` inside the component, whatever you put between the tags simply won't show. There's no error, it just disappears." },
        { t: "exam", items: ["What is props.children? (The content between a component's opening and closing tags.)", "Give a use case for children. (Layouts, cards, modals, buttons with icons.)"] },
        { t: "recap", items: ["<Card>content</Card> → the content arrives as children", "Show it with {children} wherever you want it", "Great for wrappers: cards, layouts, modals", "children works alongside other props"] },
      ],
      quiz: [
        { q: "In <Box><p>Hi</p></Box>, how does Box get the <p>?", options: ["As the children prop", "As props.content", "Through state", "It can't"], answer: 0, explain: "React passes it as children." },
        { q: "What happens if Box never renders {children}?", options: ["The content between the tags isn't shown", "React shows it anyway", "The app crashes", "It's shown twice"], answer: 0, explain: "You decide where children appear." },
        { q: "Which is a good use of children?", options: ["A reusable Modal or Card wrapper", "Storing a counter", "Fetching data", "Routing"], answer: 0, explain: "Wrappers that hold any content." },
        { q: "Can a component use both children and other props?", options: ["Yes", "No", "Only in TypeScript", "Only with fragments"], answer: 0, explain: "For example ({ title, children })." },
      ],
    },
    {
      id: "styling",
      title: "Styling React components",
      oneLine: "Style components with CSS classes (className), inline style objects, CSS Modules, or a utility framework like Tailwind, and change styles based on data.",
      minutes: 12,
      blocks: [
        { t: "h", text: "Step 1: Option 1: a CSS file + className" },
        { t: "p", text: "The most familiar way: write normal CSS in a `.css` file, import it, and use `className` (not `class`)." },
        { t: "code", lang: "jsx", code: "/* Button.css */\n.btn { padding: 8px 16px; border-radius: 6px; border: 0; }\n.btn-primary { background: #04aa6d; color: white; }\n\n// Button.jsx\nimport \"./Button.css\";\n\nexport default function Button({ primary, children }) {\n  return <button className={primary ? \"btn btn-primary\" : \"btn\"}>{children}</button>;\n}" },
        { t: "p", text: "Notice `className={primary ? \"btn btn-primary\" : \"btn\"}`: the class **changes based on a prop**. That's how you make active tabs, error inputs and dark mode." },

        { t: "h", text: "Step 2: Option 2: inline style objects" },
        { t: "code", lang: "jsx", tryIt: "react", title: "Styles that depend on data", code: "function Badge({ status }) {\n  const colors = { online: \"#04aa6d\", away: \"#f59e0b\", offline: \"#9ca3af\" };\n\n  return (\n    <span style={{ background: colors[status], color: \"white\", padding: \"2px 10px\", borderRadius: 999, marginRight: 6 }}>\n      {status}\n    </span>\n  );\n}\n\nrender(\n  <>\n    <Badge status=\"online\" />\n    <Badge status=\"away\" />\n    <Badge status=\"offline\" />\n  </>\n);" },
        { t: "example", title: "How the colour is chosen", steps: [
          "`colors` is an object mapping each status to a colour.",
          "For `<Badge status=\"away\" />`, `colors[status]` means `colors[\"away\"]`, which is \"#f59e0b\" (orange).",
          "That value goes into `background`, so each badge gets its own colour from the same code.",
        ], answer: "Use data to pick styles instead of writing separate components." },

        { t: "h", text: "Step 3: Options 3 and 4: CSS Modules and Tailwind" },
        { t: "table", head: ["Way", "Example", "Good for"], rows: [
          ["CSS file + className", "`className=\"btn\"`", "Simple projects"],
          ["Inline style object", "`style={{ color: \"red\" }}`", "Values that change at runtime"],
          ["CSS Modules", "`import s from \"./Btn.module.css\"; className={s.btn}`", "Avoiding class-name clashes between components"],
          ["Tailwind CSS", "`className=\"px-4 py-2 bg-green-600 text-white rounded\"`", "Very common in jobs today; fast to build with"],
        ] },
        { t: "trap", text: "Inline style names are camelCase and the values are strings or numbers: `{ backgroundColor: \"red\", fontSize: 16 }`, not `background-color: red`. And for several classes, use one string with spaces: `className=\"btn active\"`." },
        { t: "trick", text: "**Static look → CSS class. Look that depends on data → className={cond ? …} or style={{ }}.**" },
        { t: "exam", items: ["What are the ways to style React components?", "What are CSS Modules? (CSS files whose class names are scoped to one component.)", "How do you apply a class conditionally? (className={active ? \"tab active\" : \"tab\"}.)"] },
        { t: "recap", items: ["className for CSS classes (never class)", "style={{ camelCase: value }} for inline styles", "Change classes or styles based on props and state", "CSS Modules scope classes; Tailwind is popular in jobs"] },
      ],
      quiz: [
        { q: "Which inline style is correct?", options: ["style={{ fontSize: 18 }}", "style={{ font-size: 18 }}", "style=\"font-size:18\"", "style={fontSize: 18}"], answer: 0, explain: "camelCase, inside an object." },
        { q: "How do you add the CSS classes btn and active?", options: ["className=\"btn active\"", "class=\"btn active\"", "className={[btn, active]}", "classes=\"btn, active\""], answer: 0, explain: "Space-separated in one string." },
        { q: "What problem do CSS Modules solve?", options: ["Class names clashing between components", "Slow internet", "Missing images", "JavaScript errors"], answer: 0, explain: "Each class is scoped to its component." },
        { q: "How do you give a tab the class \"active\" only when selected is true?", options: ["className={selected ? \"tab active\" : \"tab\"}", "className=\"tab selected\"", "if (selected) class=\"active\"", "style=\"active\""], answer: 0, explain: "A ternary picks the class string." },
      ],
    },
  ],
};
