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

const friendsList = document.getElementById("friendsList");

createServerButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const formData = new FormData(createServerButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/server/create", {
    method: "post",
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
    method: "post",
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
      method: "delete",
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

    const userId = button.form.id;

    const response = await fetch("/user/friendRequest/accept", {
      method: "post",
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
      method: "post",
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
