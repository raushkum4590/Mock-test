/**
 * "Try it Yourself" runtime: builds the HTML for a sandboxed iframe that runs a
 * lesson example. The site CSP allows only same-origin and inline scripts and
 * no eval, so React (from /vendor/tryit) and the compiled example are inlined
 * into the iframe's srcdoc. The iframe is sandboxed without allow-same-origin,
 * so example code can't touch this site's cookies or storage. Output reaches
 * the editor through postMessage.
 */

export type TryItMode = "react" | "js";

/** Files in public/vendor/tryit, inlined in this order for React examples. */
export const TRYIT_VENDOR_FILES = ["react", "react-dom", "react-dom-server", "remix-router", "react-router", "react-router-dom"];

/** Message posted from the iframe to the editor. */
export type TryItMessage = { __tryit: true; level: "log" | "info" | "warn" | "error"; text: string };

export const HOOK_NAMES = [
  "useState", "useEffect", "useRef", "useReducer", "useContext", "createContext", "useMemo", "useCallback", "useLayoutEffect",
  "memo", "Fragment", "lazy", "Suspense", "useId", "useTransition", "startTransition", "useDeferredValue", "Component", "forwardRef",
];

/** Strips import/export lines: React and the hooks are already global inside the iframe. */
export function prepareReactSource(src: string) {
  return src
    .replace(/^[ \t]*import\s[^;\n]*?from\s*["'][^"']+["'];?[ \t]*$/gm, "")
    .replace(/^[ \t]*export\s+default\s+(?=(function|class)\b)/gm, "")
    .replace(/^[ \t]*export\s+(?=(const|let|var|function|class)\b)/gm, "");
}

// Runs first in every frame: console capture, error reporting and a mock of the GitHub API
// (real network requests are blocked by the site's connect-src policy).
const BOOT = String.raw`(function () {
  function fmt(v, depth, seen, top) {
    var t = typeof v;
    if (t === "string") return top ? v : "'" + v + "'";
    if (t === "number" || t === "boolean" || v === null || t === "undefined") return Object.is(v, -0) ? "-0" : String(v);
    if (t === "bigint") return v + "n";
    if (t === "symbol") return v.toString();
    if (t === "function") return /^class[\s{]/.test(Function.prototype.toString.call(v)) ? "[class " + (v.name || "(anonymous)") + "]" : "[Function: " + (v.name || "(anonymous)") + "]";
    if (v.$$typeof === Symbol.for("react.element")) return "<" + (typeof v.type === "string" ? v.type : (v.type && (v.type.displayName || v.type.name)) || "Component") + " /> (React element)";
    if (v instanceof Node) return v.nodeType === 1 ? "<" + v.tagName.toLowerCase() + ">" : v.nodeName;
    if (v instanceof Error) return v.name + ": " + v.message;
    if (seen.indexOf(v) >= 0) return "[Circular]";
    if (depth > 2) return Array.isArray(v) ? "[Array]" : "[Object]";
    seen.push(v);
    try {
      var f = function (x) { return fmt(x, depth + 1, seen, false); };
      if (Array.isArray(v)) return v.length ? "[ " + v.map(f).join(", ") + " ]" : "[]";
      if (v instanceof Map) return "Map(" + v.size + ") {" + (v.size ? " " + Array.from(v).map(function (e) { return f(e[0]) + " => " + f(e[1]); }).join(", ") + " " : "") + "}";
      if (v instanceof Set) return "Set(" + v.size + ") {" + (v.size ? " " + Array.from(v).map(f).join(", ") + " " : "") + "}";
      if (v instanceof Date) return isNaN(v) ? "Invalid Date" : v.toISOString();
      if (v instanceof RegExp) return String(v);
      if (v instanceof Promise) return "Promise { … }";
      if (ArrayBuffer.isView(v) && !(v instanceof DataView)) return v.constructor.name + "(" + v.length + ") [ " + Array.from(v).join(", ") + " ]";
      var proto = Object.getPrototypeOf(v);
      var name = proto && proto !== Object.prototype && proto.constructor && proto.constructor.name ? proto.constructor.name + " " : "";
      var keys = Object.keys(v);
      return name + (keys.length ? "{ " + keys.map(function (k) { return (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'") + ": " + f(v[k]); }).join(", ") + " }" : "{}");
    } catch (e) { return "[unprintable]"; } finally { seen.pop(); }
  }
  function send(level, args) {
    var text = args.map(function (a) { return fmt(a, 0, [], true); }).join(" ");
    parent.postMessage({ __tryit: true, level: level, text: text }, "*");
  }
  ["log", "info", "warn", "error", "debug"].forEach(function (k) {
    console[k] = function () { send(k === "debug" ? "log" : k, [].slice.call(arguments)); };
  });
  console.table = function (d) { send("log", [d]); };
  console.dir = function (d) { send("log", [d]); };
  var timers = {}, counts = {};
  console.time = function (l) { timers[l || "default"] = performance.now(); };
  console.timeEnd = function (l) { l = l || "default"; send("log", [l + ": " + (performance.now() - timers[l]).toFixed(3) + "ms"]); };
  console.count = function (l) { l = l || "default"; counts[l] = (counts[l] || 0) + 1; send("log", [l + ": " + counts[l]]); };
  console.assert = function (c) { if (!c) send("error", ["Assertion failed" + (arguments.length > 1 ? ": " + [].slice.call(arguments, 1).join(" ") : "")]); };
  console.group = function () { if (arguments.length) send("log", [].slice.call(arguments)); };
  console.groupEnd = function () {};
  window.__tryitError = function (e) { send("error", ["Uncaught " + (e && e.name ? e.name + ": " + e.message : String(e))]); };
  window.onerror = function (msg, src, line, col, err) { window.__tryitError(err || msg); return true; };
  window.addEventListener("unhandledrejection", function (e) { var r = e.reason; send("error", ["Uncaught (in promise) " + (r && r.message ? r.name + ": " + r.message : String(r))]); });
  window.alert = function (m) { send("info", ["[alert] " + m]); };
  window.prompt = function () { return null; };
  window.confirm = function () { return false; };

  var USERS = {
    moonhighway: { name: "Moon Highway", location: "Tahoe City, CA", public_repos: 52, followers: 1200 },
    "asha-codes": { name: "Asha Verma", location: "Pune, India", public_repos: 31, followers: 410 },
    "ravi-dev": { name: "Ravi Kumar", location: "Patna, India", public_repos: 18, followers: 97 }
  };
  function avatar(login) {
    var h = 0; for (var i = 0; i < login.length; i++) h = (h * 31 + login.charCodeAt(i)) % 360;
    return "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="hsl(' + h + ',55%,42%)"/><text x="48" y="61" font-family="sans-serif" font-size="36" font-weight="700" fill="white" text-anchor="middle">' + login.slice(0, 2).toUpperCase() + "</text></svg>");
  }
  window.fetch = function (input, opts) {
    var url = String((input && input.url) || input), signal = opts && opts.signal;
    return new Promise(function (resolve, reject) {
      var abort = function () { return new DOMException("The operation was aborted.", "AbortError"); };
      if (signal && signal.aborted) return reject(abort());
      if (!/^https:\/\/api\.github\.com\//.test(url)) {
        setTimeout(function () { reject(new TypeError("Failed to fetch: real network requests are blocked here. Use https://api.github.com/users/<login> (a built-in mock with moonhighway, asha-codes and ravi-dev).")); }, 150);
        return;
      }
      var m = url.match(/^https:\/\/api\.github\.com\/users\/([^/?#]+)(\/repos)?\/?(\?.*)?$/);
      var timer = setTimeout(function () {
        var login = m ? decodeURIComponent(m[1]).toLowerCase() : "", u = USERS[login], status = 200, body;
        if (!m || !u) { status = 404; body = { message: "Not Found" }; }
        else if (m[2]) body = ["website", "react-notes", "todo-app", "star-rating", "color-organizer"].map(function (r, i) { return { name: login + "-" + r, stars: (login.length * 13 + i * 29) % 300 }; });
        else body = Object.assign({ login: login, avatar_url: avatar(login) }, u);
        var txt = JSON.stringify(body);
        resolve({ ok: status < 400, status: status, statusText: status === 200 ? "OK" : "Not Found", url: url,
          headers: { get: function (k) { return k.toLowerCase() === "content-type" ? "application/json; charset=utf-8" : null; } },
          json: function () { return Promise.resolve(JSON.parse(txt)); }, text: function () { return Promise.resolve(txt); } });
      }, 450 + Math.random() * 450);
      if (signal) signal.addEventListener("abort", function () { clearTimeout(timer); reject(abort()); });
    });
  };
})();`;

// Runs after the React files: hooks as globals, render(), preview and hydrateRoot.
const REACT_BOOT = String.raw`(function () {
  var R = window.React;
  __HOOKS__.forEach(function (h) { window[h] = R[h]; });
  var mountNode = document.getElementById("root");
  window.preview = mountNode;
  var Boundary = class extends R.Component {
    constructor(p) { super(p); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error: error }; }
    componentDidCatch(error) { console.error("Render error: " + error.message); }
    render() {
      var e = this.state.error;
      return e ? R.createElement("pre", { style: { color: "#b42318", background: "#fde8e8", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap" } }, e.name + ": " + e.message) : this.props.children;
    }
  };
  var root = null;
  window.render = function (el) {
    if (!root) root = ReactDOM.createRoot(mountNode);
    root.render(R.createElement(Boundary, null, el));
  };
  window.hydrateRoot = function (container, el) { return ReactDOM.hydrateRoot(container, el); };
  // tiny Testing-Library-style helpers
  var tick = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); };
  window.tick = tick;
  window.mount = function (el) {
    var c = document.createElement("div");
    c.style.display = "none";
    document.body.appendChild(c);
    var r = ReactDOM.createRoot(c);
    ReactDOM.flushSync(function () { r.render(el); });
    return c;
  };
  window.click = function (node) {
    if (!node) return Promise.reject(new Error("click(): element not found"));
    ReactDOM.flushSync(function () { node.click(); });
    return tick();
  };
  window.type = function (input, value) {
    if (!input) return Promise.reject(new Error("type(): input not found"));
    var proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(input, value);
    ReactDOM.flushSync(function () { input.dispatchEvent(new Event("input", { bubbles: true })); });
    return tick();
  };
  window.button = function (c, label) { return Array.from(c.querySelectorAll("button")).find(function (b) { return b.textContent.trim() === label; }) || null; };
  window.text = function (c) { return c.textContent.trim(); };
})();`;

const FRAME_CSS = `body{margin:16px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.5;color:#111827;background:#fff}
button{font:inherit;font-size:14px;padding:4px 10px;margin:2px 0;border:1px solid #b8bfd0;border-radius:6px;background:#f4f6fa;cursor:pointer}
button:hover{background:#e7ebf3}input{font:inherit;padding:4px 8px;border:1px solid #b8bfd0;border-radius:6px}
h1,h2,h3{margin:.3em 0}a{color:#0b66d6}pre{white-space:pre-wrap}`;

const safeInline = (s: string) => s.replace(/<\/script/gi, "<\\/script");

/** The complete srcdoc for one run. `compiled` is already plain JavaScript (JSX compiled for React mode). */
export function buildTryItDocument({ mode, compiled, vendor }: { mode: TryItMode; compiled: string; vendor: string }) {
  const react = mode === "react"
    ? `<script>${safeInline(vendor)}</script><script>${safeInline(REACT_BOOT.replace("__HOOKS__", JSON.stringify(HOOK_NAMES)))}</script>`
    : "";
  // A function wrapper lets examples redeclare names like useState without clashing with the globals.
  const user = `<script>try{(function(){\n${safeInline(compiled)}\n})();}catch(e){__tryitError(e);}</script>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${FRAME_CSS}</style></head><body><div id="root"></div><script>${safeInline(BOOT)}</script>${react}${user}</body></html>`;
}
