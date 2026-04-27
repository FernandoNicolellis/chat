const path = require("path");
const { spawn } = require("child_process");

const electronBinary = require("electron");
const projectRoot = path.resolve(__dirname, "..");
const env = { ...process.env };

// Ensure Electron starts in normal app mode, even if this shell is polluted.
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, ["."], {
  cwd: projectRoot,
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

