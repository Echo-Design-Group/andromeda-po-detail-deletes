// oom-test.js
console.log("Forcing an OOM...");

const junk = [];
let i = 0;

while (true) {
  // Allocate ~10MB per loop (strings are relatively heavy)
  junk.push("x".repeat(10 * 1024 * 1024));
  i++;
  if (i % 10 === 0) console.log(`Allocated ~${i * 10} MB so far...`);
}
