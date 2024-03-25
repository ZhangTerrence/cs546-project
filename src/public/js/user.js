const updateUserButton = document.getElementById("updateUserButton");
const createServerButton = document.getElementById("createServerButton");
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

(function setRadio() {
  const darkMode = document.getElementById("darkMode").innerText;

  if (darkMode === "true") {
    document.getElementById("darkRadio").checked = true;
    document.getElementById("lightRadio").checked = false;
  } else {
    document.getElementById("darkRadio").checked = false;
    document.getElementById("lightRadio").checked = true;
  }
})();

updateUserButton.addEventListener("click", async (e) => {
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
  } else {
    window.alert(data.error);
  }
});

createServerButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const formData = new FormData(createServerButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/server/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formObject)
  });
  const data = await response.json();

  if (response.status === 201) {
    window.location.replace(data.success);
  } else {
    window.alert(data.error);
  }
});

createFriendRequestButton.addEventListener("click", async (e) => {
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
  } else {
    window.alert(data.error);
  }
});

Array.from(removeFriendButtons).forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const userId = button.form.id;

    const response = await fetch("/user/friend", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: userId
      })
    });
    const data = await response.json();

    if (response.status === 200) {
      window.alert(data.success);
      button.form.remove();
    } else {
      window.alert(data.error);
    }
  });
});

Array.from(acceptFriendRequestButtons).forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const friendsList = document.getElementById("friendsList");
    const userId = button.form.id;

    const response = await fetch("/user/friendRequest/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: userId
      })
    });
    const data = await response.json();

    if (response.status === 200) {
      window.alert(data.success);
      button.form.remove();

      const outerNode = document.createElement("li");
      const innerNode = document.createElement("a");
      innerNode.href = `/user/${data.data.id}`;
      innerNode.innerText = data.data.username;
      outerNode.appendChild(innerNode);
      friendsList.appendChild(outerNode);
    } else {
      window.alert(data.error);
    }
  });
});

Array.from(rejectFriendRequestButtons).forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const userId = button.form.id;

    const response = await fetch("/user/friendRequest/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: userId
      })
    });
    const data = await response.json();

    if (response.status === 200) {
      window.alert(data.success);
      button.form.remove();
    } else {
      window.alert(data.error);
    }
  });
});

deleteUserButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const response = await fetch("/user", {
    method: "DELETE"
  });
  const data = await response.json();

  if (response.status === 200) {
    window.location.replace("/");
  } else {
    window.alert(data.error);
  }
});
