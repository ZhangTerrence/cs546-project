// DOM Selectors

const serverSearchbar = document.getElementById("serverSearchbar");
const createServerButton = document.getElementById("createServerButton");
const leaveServerButtons =
  document.getElementsByClassName("leaveServerButtons");
const kickUserButtons = document.getElementsByClassName("kickUserButtons");
const deleteServerButton = document.getElementById("deleteServerButton");
const leaveServerButton = document.getElementById("leaveServerButton");

// Helper Functions

function createServerListElement(serverId, serverName) {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = serverId;

  const a = document.createElement("a");
  a.href = `/server/${serverId}`;
  a.innerText = serverName;

  const button = document.createElement("button");
  button.innerText = "Leave";
  button.classList.add("leaveServerButtons");
  button.addEventListener("click", (e) => leaveServer(e, button));

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
}

function createQueriedServerListElement(server) {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = server.id;

  const a = document.createElement("a");
  a.innerText = server.name;
  a.href = `/server/${server._id}`;

  const button = document.createElement("button");
  button.innerText = "Join";
  button.classList.add("joinServerButtons");
  button.addEventListener("click", (e) =>
    joinServer(e, server._id, server.name)
  );

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
}

async function joinServer(e, serverId, serverName) {
  e.preventDefault();

  try {
    const response = await fetch("/api/server/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: serverId
      })
    });

    if (response.ok) {
      window.alert("Successfully joined server.");

      document.getElementById("queriedServers").innerHTML = "";
      serverSearchbar.value = "";
      document
        .getElementById("serversList")
        .appendChild(createServerListElement(serverId, serverName));
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

async function findServerByName(e) {
  try {
    const response = await fetch(`/api/server/${e.currentTarget.value}`, {
      method: "GET"
    });
    const json = await response.json();

    if (response.status === 200) {
      const queriedServers = document.getElementById("queriedServers");
      queriedServers.innerHTML = "";
      json.data.servers.forEach((server) => {
        queriedServers.appendChild(createQueriedServerListElement(server));
      });
    } else {
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
}

async function createServer(e) {
  e.preventDefault();

  const body = Object.fromEntries(new FormData(createServerButton.form));

  try {
    const response = await fetch("/api/server", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();

    if (response.ok) {
      window.location.replace(json.data.url);
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

async function leaveServer(e, button) {
  e.preventDefault();

  const url = window.location.pathname;

  try {
    let serverId;

    if (url.substring(url.lastIndexOf("/") + 1) === "") {
      serverId = url.substring(url.lastIndexOf("/") + 1);
    } else if (button.form) {
      serverId = button.form.id;
    }

    const response = await fetch("/api/server/leave", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: serverId
      })
    });

    if (response.ok) {
      window.alert("Successfully left server.");

      if (button.form) {
        button.form.remove();
      }
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

async function kickUser(e, button) {
  e.preventDefault();

  const userId = button.form.id;
  const url = window.location.pathname;
  const serverId = url.substring(url.lastIndexOf("/") + 1);

  try {
    const response = await fetch("/api/server/kick", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        serverId: serverId
      })
    });

    if (response.ok) {
      window.alert("Successfully kicked user.");
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

async function deleteServer(e) {
  e.preventDefault();

  const url = window.location.pathname;
  const serverId = url.substring(url.lastIndexOf("/") + 1);

  try {
    const response = await fetch("/api/server", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: serverId
      })
    });

    if (response.ok) {
      window.alert("Successfully deleted server.");
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

if (serverSearchbar) {
  serverSearchbar.addEventListener("keyup", (e) => findServerByName(e));
}

if (createServerButton) {
  createServerButton.addEventListener("click", (e) => createServer(e));
}

if (leaveServerButtons) {
  Array.from(leaveServerButtons).forEach((button) =>
    button.addEventListener("click", (e) => leaveServer(e, button))
  );
}

if (kickUserButtons) {
  Array.from(kickUserButtons).forEach((button) =>
    button.addEventListener("click", (e) => kickUser(e, button))
  );
}

if (deleteServerButton) {
  deleteServerButton.addEventListener("click", (e) => deleteServer(e));
}

if (leaveServerButton) {
  leaveServerButton.addEventListener("click", (e) =>
    leaveServer(e, leaveServerButton)
  );
}
