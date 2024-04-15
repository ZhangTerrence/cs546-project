const theme = document.getElementById("theme").innerText;

(function setTheme() {
  if (!theme) {
    printMessage("Unable to set theme.");
    return;
  }

  if (theme !== "light" || theme !== "dark") {
    printMessage("Unknown theme.");
    return;
  }

  if (theme === "light") {
    document.getElementById("light").hidden = false;
    document.getElementById("dark").hidden = true;
  } else {
    document.getElementById("light").hidden = true;
    document.getElementById("dark").hidden = false;
  }
})();
