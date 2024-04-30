(function setDefaults() {
  const theme = localStorage.getItem("userTheme") ?? "light";

  if (theme !== "light" && theme !== "dark") {
    document.getElementById("theme").value = "light";
  } else {
    document.getElementById("theme").value = theme;
  }

  setTheme();
})();


const updateUserButton = document.getElementById("edit__update-button");

const updateUser = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    if (requestBody["username"] && (requestBody["username"].length < 3 || requestBody["username"].length > 20)) {
      throw new Error("Username must be between 3 and 20 characters.");
    }

    if (requestBody["theme"] !== "light" && requestBody["theme"] !== "dark") {
      throw new Error("Invalid theme.");
    }

    if (requestBody["bio"] && requestBody["bio"].length > 255) {
      throw new Error("Bio must be less than 255 characters.");
    }

    showLoader();
    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    hideLoader();
    if (response.ok) {
      document.getElementById("edit__username").innerText =
        `Editing ${requestBody["username"]}'s Profile`;
      localStorage.setItem("userTheme", requestBody["theme"]);
      setTheme();
      printMessage("Successfully updated user.");
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const responseBody = await response.json();
      printMessage(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

if (updateUserButton) {
  updateUserButton.addEventListener("click", async (e) => await updateUser(e));
}
