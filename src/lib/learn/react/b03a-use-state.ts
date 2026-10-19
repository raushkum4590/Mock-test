import type { Lesson } from "../types";

/** The detailed useState lesson (React module 5). */
export const USE_STATE_LESSON: Lesson = {
      id: "use-state",
      title: "useState: remembering values",
      oneLine: "useState gives a component a memory: a value plus a function to change it. When you change the value with that function, React redraws the component with the new value.",
      minutes: 18,
      blocks: [
        { t: "h", text: "Step 1: The problem. Why doesn't a normal variable work?" },
        { t: "p", text: "Let's try to build a click counter using a **normal variable**. Press **Try it Yourself**, click **+1** a few times, and watch both the screen and the console." },
        { t: "code", lang: "jsx", tryIt: "react", title: "❌ A counter that doesn't work", code: "function BrokenCounter() {\n  let count = 0;                  // a normal variable\n\n  function handleClick() {\n    count = count + 1;\n    console.log(\"count is now\", count);\n  }\n\n  return (\n    <div>\n      <h2>You clicked {count} times</h2>\n      <button onClick={handleClick}>+1</button>\n    </div>\n  );\n}\n\nrender(<BrokenCounter />);", note: "The console says 1, 2, 3… but the screen is stuck at **0**." },
        { t: "p", text: "There are **two reasons** this doesn't work:" },
        { t: "points", items: ["1. **React doesn't know the variable changed.** Changing a normal variable doesn't tell React to redraw anything, so the screen never updates.", "2. **Even if React redrew, the value would reset.** To redraw a component, React calls the function again from the first line. `let count = 0` runs again and puts it straight back to 0."] },
        { t: "analogy", text: "A component function has no memory. Every time React draws it, it starts fresh from the first line, like someone who forgets everything each morning. **useState is a diary that React keeps for the component.** Each time the function runs, it reads the latest value from the diary instead of starting from zero." },

        { t: "h", text: "Step 2: The fix. Use useState" },
        { t: "code", lang: "jsx", tryIt: "react", title: "✅ A counter that works", code: "function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>You clicked {count} times</h2>\n      <button onClick={() => setCount(count + 1)}>+1</button>{\" \"}\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}\n\nrender(<Counter />);", note: "In your own project, first write `import { useState } from \"react\";` at the top of the file. In Try it Yourself it's already loaded." },
        { t: "p", text: "Only one line really changed: `let count = 0` became `const [count, setCount] = useState(0)`. And instead of `count = count + 1`, we now call `setCount(count + 1)`." },

        { t: "h", text: "Step 3: Understanding that one line, piece by piece" },
        { t: "code", lang: "jsx", code: "const [count, setCount] = useState(0);" },
        { t: "table", head: ["Piece", "What it means in plain words"], rows: [
          ["`useState(0)`", "\"React, please remember a value for this component. Start it at **0**.\""],
          ["`count`", "The **current value**. Read it to show it on screen: `{count}`."],
          ["`setCount`", "The **only correct way to change** the value. It saves the new value **and** tells React to redraw."],
          ["`[ , ]`", "useState gives back **two things** in an array. The square brackets unpack them into two names (array destructuring)."],
          ["`const`", "You never change `count` yourself with `=`. React hands you a fresh value on every render."],
        ] },
        { t: "p", text: "You can choose any names. The habit is `[something, setSomething]`, for example `[name, setName]`, `[isOpen, setIsOpen]`, `[items, setItems]`." },

        { t: "h", text: "Step 4: What exactly happens when you click?" },
        { t: "example", title: "Clicking +1 two times", steps: [
          "**First render.** React calls `Counter()`. `useState(0)` has nothing saved yet, so it saves **0** and gives `count = 0`. The screen shows \"You clicked 0 times\".",
          "**You click +1.** The button runs `setCount(count + 1)`, which is `setCount(1)`. This tells React: \"save **1**, then redraw Counter.\"",
          "**Second render.** React calls `Counter()` again from the top. This time `useState(0)` **ignores the 0**, because it already has a saved value, and gives `count = 1`.",
          "**The screen updates.** The JSX now says \"You clicked 1 times\". React compares the new result with the old one and changes only that text on the page.",
          "**You click again.** `setCount(2)` → React redraws → `count = 2` → the screen shows 2. And so on, every click.",
        ], answer: "The starting value (0) is used only once, on the first render. After that, React remembers the latest value for you." },
        { t: "diagram", text: "  ┌────────────────────────────────────────────────────────────┐\n  │                                                            │\n  ▼                                                            │\n RENDER: Counter() runs,  ──▶  screen shows   ──▶  user clicks +1\n useState gives count          \"count\"                │\n  ▲                                                    ▼\n  │                                           setCount(count + 1)\n  │                                           React saves new value\n  └───────────────── React redraws the component ◀───┘", caption: "The state loop: render → click → setCount → React saves → render again" },

        { t: "h", text: "Step 5: More examples of state" },
        { t: "p", text: "State can hold **any** kind of value. Here's a **true/false** value: each button remembers whether it's liked. Notice that every LikeButton has its **own** state." },
        { t: "code", lang: "jsx", tryIt: "react", title: "true / false state", code: "function LikeButton() {\n  const [liked, setLiked] = useState(false);     // starts as false\n\n  return (\n    <button onClick={() => setLiked(!liked)} style={{ fontSize: 20 }}>\n      {liked ? \"❤️ Liked\" : \"🤍 Like\"}\n    </button>\n  );\n}\n\nrender(\n  <>\n    <LikeButton /> <LikeButton /> <LikeButton />\n  </>\n);", note: "`!liked` means \"the opposite of liked\": true becomes false, and false becomes true." },
        { t: "p", text: "Here's **text** state. Every key you type calls `setName`, so the greeting updates as you type." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Text state", code: "function Greeting() {\n  const [name, setName] = useState(\"\");          // starts as empty text\n\n  return (\n    <div>\n      <input\n        value={name}\n        onChange={e => setName(e.target.value)}\n        placeholder=\"Type your name\"\n      />\n      <h3>{name ? `Hello, ${name}! 👋` : \"Hello, stranger!\"}</h3>\n      <p>Your name has {name.length} letters.</p>\n    </div>\n  );\n}\n\nrender(<Greeting />);" },
        { t: "p", text: "A component can have **several** pieces of state. Here quantity is a number and size is text, and the total is **calculated** from them, so it doesn't need its own state." },
        { t: "code", lang: "jsx", tryIt: "react", title: "Several states in one component", code: "function TShirtOrder() {\n  const [quantity, setQuantity] = useState(1);\n  const [size, setSize] = useState(\"M\");\n  const price = 499;\n  const total = quantity * price;               // calculated, not stored\n\n  return (\n    <div>\n      <h3>👕 T-shirt: ₹{price}</h3>\n      <p>\n        Size:{\" \"}\n        {[\"S\", \"M\", \"L\"].map(s => (\n          <button key={s} onClick={() => setSize(s)} style={{ fontWeight: size === s ? 700 : 400 }}>{s}</button>\n        ))}\n      </p>\n      <p>\n        Quantity:{\" \"}\n        <button onClick={() => setQuantity(quantity - 1)} disabled={quantity === 1}>−</button>\n        {\" \"}{quantity}{\" \"}\n        <button onClick={() => setQuantity(quantity + 1)}>+</button>\n      </p>\n      <h3>Total: ₹{total} for {quantity} × size {size}</h3>\n    </div>\n  );\n}\n\nrender(<TShirtOrder />);" },

        { t: "h", text: "Step 6: Why does the console show the old value?" },
        { t: "p", text: "Run this, click once, and look at the console." },
        { t: "code", lang: "jsx", tryIt: "react", title: "The new value arrives on the next render", code: "function Demo() {\n  const [count, setCount] = useState(0);\n\n  function handleClick() {\n    setCount(count + 1);\n    console.log(\"Right after setCount, count is still:\", count);\n  }\n\n  console.log(\"Rendering with count =\", count);\n  return <button onClick={handleClick}>Clicked {count} times</button>;\n}\n\nrender(<Demo />);" },
        { t: "p", text: "`setCount` **doesn't change** the `count` variable on the spot. It **asks React for a new render**. During this click, `count` still has the old value. The new value appears when React runs the component again (you'll see \"Rendering with count = 1\")." },
        { t: "p", text: "That's why, when the new value **depends on the old one**, the safest way is to pass a function, called an **updater**: `setCount(c => c + 1)`. React gives `c` the very latest value." },
        { t: "code", lang: "jsx", tryIt: "react", title: "+3 in one click: wrong way vs right way", code: "function Counter() {\n  const [count, setCount] = useState(0);\n\n  function addThreeWrong() {\n    setCount(count + 1);     // count is 0 here…\n    setCount(count + 1);     // …still 0\n    setCount(count + 1);     // …still 0, so the result is 1\n  }\n\n  function addThreeRight() {\n    setCount(c => c + 1);    // c = 0 → 1\n    setCount(c => c + 1);    // c = 1 → 2\n    setCount(c => c + 1);    // c = 2 → 3\n  }\n\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={addThreeWrong}>+3 (wrong way)</button>{\" \"}\n      <button onClick={addThreeRight}>+3 (right way)</button>\n    </div>\n  );\n}\n\nrender(<Counter />);" },

        { t: "h", text: "useState cheat sheet" },
        { t: "table", head: ["You want to remember…", "Write", "Change it with"], rows: [
          ["A number", "`const [count, setCount] = useState(0)`", "`setCount(count + 1)` or `setCount(c => c + 1)`"],
          ["Text", "`const [name, setName] = useState(\"\")`", "`setName(e.target.value)`"],
          ["Yes / no", "`const [isOpen, setIsOpen] = useState(false)`", "`setIsOpen(!isOpen)`"],
          ["A list", "`const [items, setItems] = useState([])`", "`setItems([...items, newItem])` (next lesson)"],
          ["An object", "`const [user, setUser] = useState({ name: \"\" })`", "`setUser({ ...user, name: \"Asha\" })` (next lesson)"],
        ] },
        { t: "trap", text: "Three common mistakes: (1) changing state directly with `count = count + 1` (React won't notice, so always use the setter); (2) writing `onClick={setCount(count + 1)}` without `() =>`, which runs during render and causes an endless loop (write `onClick={() => setCount(count + 1)}`); (3) expecting `count` to be new on the very next line after `setCount`." },
        { t: "trick", text: "**[value, setValue] = useState(start).** Read with value, change with setValue, and React redraws." },
        { t: "exam", items: ["What is state? (Data a component remembers that can change over time.)", "What does useState return? (An array of two things: the current value and a setter function.)", "Why not use a normal variable? (It resets every time the component runs, and changing it doesn't make React redraw.)", "Is the state update immediate? (No. The new value appears on the next render.)", "When should you use setCount(c => c + 1)? (When the new value depends on the old value.)"] },
        { t: "recap", items: ["A normal variable resets on every render and doesn't update the screen", "const [value, setValue] = useState(start) gives memory plus a way to change it", "setValue saves the new value and React redraws the component", "The start value is only used on the first render", "The new value appears on the next render; use setX(x => …) when it depends on the old value"] },
      ],
      quiz: [
        { q: "What does useState(0) return?", options: ["[current value, setter function]", "Just 0", "A promise", "An object"], answer: 0, explain: "Destructure it: const [n, setN] = useState(0)." },
        { q: "Which correctly increases count?", options: ["setCount(count + 1)", "count = count + 1", "count++", "useState(count + 1)"], answer: 0, explain: "Only the setter triggers a re-render." },
        { q: "Two <Counter /> components on one page…", options: ["Each have their own count", "Share one count", "Crash", "Can't both use useState"], answer: 0, explain: "State belongs to each instance." },
        { q: "What happens after calling the setter?", options: ["React re-renders the component", "The page reloads", "Nothing", "The state is deleted"], answer: 0, explain: "That's how the screen updates." },
        { q: "Why doesn't let count = 0; count++ update the screen?", options: ["React isn't told to redraw, and the variable resets to 0 every time the component runs", "let can't hold numbers", "The browser blocks it", "count++ is invalid JavaScript"], answer: 0, explain: "State fixes both problems." },
        { q: "count is 0. A click runs setCount(c => c + 1) three times. What is count after the re-render?", options: ["3", "1", "0", "Error"], answer: 0, explain: "Each updater gets the latest value: 0→1→2→3." },
      ],
    };
