const editor = document.getElementById("editor");
const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");
const debugBox = document.getElementById("debug");

runBtn.addEventListener("click", async () => {
  const code = editor.value.trim();
  if (!code) {
    output.textContent = "Please write some code first!";
    return;
  }

  try {
    // Run the code safely inside a try-catch block
    const result = eval(code);
    output.textContent = `✅ Output: ${result !== undefined ? result : "(no output)"}`;
    debugBox.textContent = "No errors detected.";
  } catch (error) {
    // Show error message
    output.textContent = `❌ Error: ${error.message}`;
    debugBox.textContent = "Analyzing error... 🧠";

    // Send error + code to backend for AI explanation
    try {
      const res = await fetch("http://localhost:3000/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorMessage: error.message, code })
      });

      const data = await res.json();
      debugBox.textContent = data.suggestion || "No suggestion available.";
    } catch {
      debugBox.textContent = "AI explanation failed.";
    }
  }
});