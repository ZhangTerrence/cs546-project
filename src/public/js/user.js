// DOM Selectors

const updateUserButton = document.getElementById("updateUserButton");
const createFriendRequestButton = document.getElementById(
  "createFriendRequestButton"
);
const removeFriendButtons = document.getElementsByClassName(
  "removeFriendButtons"
);
const acceptFriendRequestButtons = document.getElementsByClassName(
  "acceptFriendRequestButtons"
);
const rejectFriendRequestButtons = document.getElementsByClassName(
  "rejectFriendRequestButtons"
);
const deleteUserButton = document.getElementById("deleteUserButton");

// IIFE Functions

(function setRadio() {
  const darkRadio = document.getElementById("darkRadio");
  const lightRadio = document.getElementById("lightRadio");

  if (darkRadio && lightRadio) {
    const darkMode = document.getElementById("darkMode").innerText;

    if (darkMode === "true") {
      darkRadio.checked = true;
      lightRadio.checked = false;
    } else {
      darkRadio.checked = false;
      lightRadio.checked = true;
    }
  }
})();

// Helper functions

function createFriendsListElement(userId, username) {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = userId;

  const a = document.createElement("a");
  a.href = `/user/${userId}`;
  a.innerText = username;

  const button = document.createElement("button");
  button.innerText = "Remove";
  button.classList.add("removeFriendButtons");
  button.addEventListener("click", (e) => removeFriend(e, button));

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
}

async function updateUser(e) {
  e.preventDefault();

  const bio = document.getElementById("bio").value;
  const darkMode = document.getElementById("darkRadio").checked;

  try {
    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bio: bio,
        darkMode: darkMode
      })
    });

    if (response.ok) {
      window.alert("Successfully updated user.");
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      const json = await response.json();
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function createFriendRequest(e) {
  e.preventDefault();

  const body = Object.fromEntries(new FormData(createFriendRequestButton.form));

  try {
    const response = await fetch("/api/user/friend/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      window.alert("Successfully sent friend request.");
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      const data = await response.json();
      console.log(data.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function removeFriend(e, button) {
  e.preventDefault();

  const friendId = button.form.id;

  try {
    const response = await fetch("/api/user/friend/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        friendId: friendId
      })
    });

    if (response.ok) {
      window.alert("Successfully removed friend.");
      button.form.remove();
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      const json = await response.json();
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function acceptFriendRequest(e, button) {
  e.preventDefault();

  const requesterId = button.form.id;

  try {
    const response = await fetch("/api/user/friend/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requesterId: requesterId
      })
    });
    const json = await response.json();

    if (response.ok) {
      window.alert("Successfully accepted friend request.");

      button.form.remove();
      document
        .getElementById("friendsList")
        .appendChild(
          createFriendsListElement(json.data.id, json.data.username)
        );
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function rejectFriendRequest(e, button) {
  e.preventDefault();

  const requesterId = button.form.id;

  try {
    const response = await fetch("/user/friendRequest/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requesterId: requesterId
      })
    });

    if (response.ok) {
      window.alert("Successfully rejected friend request.");
      button.form.remove();
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      const json = await response.json();
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteUser(e) {
  e.preventDefault();

  try {
    const response = await fetch("/api/user", {
      method: "DELETE"
    });

    if (response.ok) {
      window.location.replace("/");
    } else {
      if (response.statusText === "Unauthorized") {
        window.location.replace("/login");
        return;
      }
      const json = await response.json();
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

// Event Listeners

if (updateUserButton) {
  updateUserButton.addEventListener("click", (e) => updateUser(e));
}

if (createFriendRequestButton) {
  createFriendRequestButton.addEventListener("click", (e) =>
    createFriendRequest(e)
  );
}

if (removeFriendButtons) {
  Array.from(removeFriendButtons).forEach((button) => {
    button.addEventListener("click", (e) => removeFriend(e, button));
  });
}

if (acceptFriendRequestButtons) {
  Array.from(acceptFriendRequestButtons).forEach((button) => {
    button.addEventListener("click", (e) => acceptFriendRequest(e, button));
  });
}

if (rejectFriendRequestButtons) {
  Array.from(rejectFriendRequestButtons).forEach((button) =>
    button.addEventListener("click", (e) => rejectFriendRequest(e, button))
  );
}

if (deleteUserButton) {
  deleteUserButton.addEventListener("click", (e) => deleteUser(e));
}
