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

  const response = await fetch("/user", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bio,
      darkMode
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function createFriendRequest(e) {
  e.preventDefault();

  const formData = new FormData(createFriendRequestButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/user/friend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formObject)
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function removeFriend(e, button) {
  e.preventDefault();

  const userId = button.form.id;

  const response = await fetch("/user/friend", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);
    button.form.remove();
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function acceptFriendRequest(e, button) {
  e.preventDefault();

  const userId = button.form.id;

  const response = await fetch("/user/friendRequest/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);

    button.form.remove();

    document
      .getElementById("friendsList")
      .appendChild(createFriendsListElement(data.data.id, data.data.username));
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function rejectFriendRequest(e, button) {
  e.preventDefault();

  const userId = button.form.id;

  const response = await fetch("/user/friendRequest/reject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);
    button.form.remove();
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function deleteUser(e) {
  e.preventDefault();

  const response = await fetch("/user", {
    method: "DELETE"
  });
  const data = await response.json();

  if (response.status === 200) {
    window.location.replace("/");
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
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
