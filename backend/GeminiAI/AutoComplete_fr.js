const editor = document.getElementById("editor");
const suggestionBox = document.getElementById("suggestion");
let timeout = null;

editor.addEventListener("input", () => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    const code = editor.value.trim();
    if (code.length === 0) {
      suggestionBox.textContent = "Start typing to get suggestions...";
      return;
    }

    suggestionBox.textContent = "Thinking... 💭";

    try {
      const res = await fetch("http://localhost:3000/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      suggestionBox.textContent = data.suggestion
        ? data.suggestion
        : "No suggestion found.";
    } catch (error) {
      suggestionBox.textContent = "Error fetching suggestion.";
    }
  }, 1000); // waits for user to stop typing for 1 sec
});