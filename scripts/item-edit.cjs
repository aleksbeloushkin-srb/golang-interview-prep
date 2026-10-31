// Edit cards/quiz/simulators items in data/*.js one JSON block at a time.
// A block is "  {\n    \"id\": \"<id>\", … \n  }"; it is replaced only after the original round-trips.
const fs = require("fs");
const ROOT = require("path").join(__dirname, "..", "data") + "/";

function blocks(src) {
  const out = {};
  const re = /\n  \{\n    "?id"?: "([a-z]+\d+)",/g;
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + 1;
    const end = src.indexOf("\n  }", start) + "\n  }".length;
    out[m[1]] = { start, end, text: src.slice(start, end) };
  }
  return out;
}

const indent = obj => "  " + JSON.stringify(obj, null, 2).split("\n").join("\n  ");

function editItems(file, edits) {
  const path = ROOT + file;
  let src = fs.readFileSync(path, "utf8");
  for (const id of Object.keys(edits)) {
    const b = blocks(src)[id];
    if (!b) throw Error("no block " + id);
    // A few older items are JS object literals (unquoted keys): they are rewritten as JSON once.
    let obj;
    try {
      obj = JSON.parse(b.text);
      if (indent(obj) !== b.text) throw Error("round-trip differs for " + id);
    } catch (e) {
      if (e.message.startsWith("round-trip")) throw e;
      obj = require("vm").runInNewContext("(" + b.text + ")");
      obj = JSON.parse(JSON.stringify(obj));
      console.log(`${id}: JS literal → JSON`);
    }
    const next = edits[id](obj) || obj;
    src = src.slice(0, b.start) + indent(next) + src.slice(b.end);
  }
  fs.writeFileSync(path, src);
}

// Replace exactly one occurrence of `from` in obj[key] (string or array of strings).
function swap(obj, key, from, to) {
  const v = obj[key];
  if (Array.isArray(v)) {
    const hits = v.map((s, i) => [s, i]).filter(([s]) => s.includes(from));
    if (hits.length !== 1) throw Error(`${obj.id}.${key}: ${hits.length} items contain «${from.slice(0, 40)}»`);
    v[hits[0][1]] = v[hits[0][1]].replace(from, to);
  } else {
    if (typeof v !== "string" || v.split(from).length !== 2) throw Error(`${obj.id}.${key}: «${from.slice(0, 40)}» not found once`);
    obj[key] = v.replace(from, to);
  }
}

module.exports = { editItems, blocks, indent, swap };
