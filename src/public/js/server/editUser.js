setTheme();

const updateUserButton = document.getElementById("edit__update-button");

const updateUser = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    const urlTokens = window.location.pathname.split("/");
    const serverId = urlTokens[2];
    const userId = urlTokens[urlTokens.length - 1];

    showLoader();
    const response = await fetch("/api/server/edit/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...requestBody,
        serverId: serverId,
        userId: userId
      })
    });

    hideLoader();
    if (response.ok) {
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
