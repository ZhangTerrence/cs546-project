setTheme();

const removeFriendButtons = document.getElementsByClassName(
  "friends__remove-buttons"
);
const sendFriendRequestButton = document.getElementById(
  "friends__request-button"
);
const acceptFriendRequestButtons = document.getElementsByClassName(
  "friends__accept-buttons"
);
const rejectFriendRequestButtons = document.getElementsByClassName(
  "friends__reject-buttons"
);

const createFriendsListElement = (friendId, friendUsername) => {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = friendId;

  const a = document.createElement("a");
  a.href = `/user/${friendId}`;
  a.innerText = friendUsername;

  const button = document.createElement("button");
  button.innerText = "Remove";
  button.classList.add("friends__remove-button");
  button.addEventListener("click", async (e) => await removeFriend(e, button));

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
};

const removeFriend = async (e, button) => {
  try {
    e.preventDefault();

    const friendId = button.form.id;

    showLoader();
    const response = await fetch("/api/user/friend", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        friendId: friendId
      })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully removed friend.");
      button.form.remove();
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const responsebody = await response.json();
      printMessage(responsebody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

const sendFriendRequest = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

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
      e.target.form.reset();
      if (response.status === 201) {
        const responseBody = await response.json();
        document.getElementById(responseBody.data.id).remove();
        document
          .getElementById("friends__friends-list")
          .appendChild(
            createFriendsListElement(
              responseBody.data.id,
              responseBody.data.username
            )
          );
      }
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

const acceptFriendRequest = async (e, button) => {
  try {
    e.preventDefault();

    const requesterId = button.form.id;

    showLoader();
    const response = await fetch("/api/user/friend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requesterId: requesterId
      })
    });
    const requestBody = await response.json();

    hideLoader();
    if (response.ok) {
      printMessage("Successfully accepted friend request.");
      button.form.remove();
      console.log(document.getElementById("friends__friends-list"));
      document
        .getElementById("friends__friends-list")
        .appendChild(
          createFriendsListElement(
            requestBody.data.id,
            requestBody.data.username
          )
        );
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      printMessage(requestBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

const rejectFriendRequest = async (e, button) => {
  try {
    e.preventDefault();

    const requesterId = button.form.id;

    showLoader();
    const response = await fetch("/api/user/friend/reject", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requesterId: requesterId
      })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully rejected friend request.");
      button.form.remove();
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

if (removeFriendButtons) {
  Array.from(removeFriendButtons).forEach((button) => {
    button.addEventListener(
      "click",
      async (e) => await removeFriend(e, button)
    );
  });
}

if (sendFriendRequestButton) {
  sendFriendRequestButton.addEventListener(
    "click",
    async (e) => await sendFriendRequest(e)
  );
}

if (acceptFriendRequestButtons) {
  Array.from(acceptFriendRequestButtons).forEach((button) => {
    button.addEventListener(
      "click",
      async (e) => await acceptFriendRequest(e, button)
    );
  });
}

if (rejectFriendRequestButtons) {
  Array.from(rejectFriendRequestButtons).forEach((button) =>
    button.addEventListener(
      "click",
      async (e) => await rejectFriendRequest(e, button)
    )
  );
}
