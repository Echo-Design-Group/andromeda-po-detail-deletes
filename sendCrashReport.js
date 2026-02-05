const { sendErrorReport } = require("./functions/errorReporting.js");
const { type } = require("./config.js");

(async () => {
  try {
    const errors = [
      {
        err: "Node process crashed (likely OOM).",
      },
    ];

    await sendErrorReport(errors, type);
    process.exit(0);
  } catch (e) {
    // If reporting fails, at least exit non-zero
    console.error("Failed to send crash report:", e);
    process.exit(1);
  }
})();
