(function storeTheme() {
  const theme = document.getElementById("theme")
    ? document.getElementById("theme").innerText
    : "light";

  if (theme !== "light" && theme !== "dark") {
    localStorage.setItem("userTheme", "light");
  } else {
    localStorage.setItem("userTheme", theme);
  }

  setTheme();
})();

const deleteButton = document.getElementById("profile__delete-icon");
const sendFriendRequestButton = document.getElementById(
  "profile__request-button"
);

const deleteUser = async (e) => {
  try {
    e.preventDefault();

    showLoader();
    const response = await fetch("/api/user", {
      method: "DELETE"
    });

    hideLoader();
    if (response.ok) {
      window.location.replace("/");
    } else {
      const responseBody = await response.json();
      throw new Error(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

const sendFriendRequest = async (e) => {
  try {
    e.preventDefault();

    const targetUser = document.getElementById("profile__username").innerText;
    const requestBody = {
      username: targetUser
    };

    showLoader();
    const response = await fetch("/api/user/friend/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully sent friend request.");
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

if (deleteButton) {
  deleteButton.addEventListener("click", async (e) => await deleteUser(e));
}

if (sendFriendRequestButton) {
  sendFriendRequestButton.addEventListener(
    "click",
    async (e) => await sendFriendRequest(e)
  );
}
