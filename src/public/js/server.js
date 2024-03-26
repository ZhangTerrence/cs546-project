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

  const response = await fetch("/server/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      serverId
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);

    document.getElementById("queriedServers").innerHTML = "";
    serverSearchbar.value = "";

    document
      .getElementById("serversList")
      .appendChild(createServerListElement(serverId, serverName));
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function findServerByName(e) {
  const response = await fetch(`/server/queryName/${e.currentTarget.value}`, {
    method: "GET"
  });
  const data = await response.json();

  if (response.status === 200) {
    const queriedServers = document.getElementById("queriedServers");

    queriedServers.innerHTML = "";

    data.success.forEach((server) => {
      queriedServers.appendChild(createQueriedServerListElement(server));
    });
  } else {
    window.alert(data.error);
  }
}

async function createServer(e) {
  e.preventDefault();

  const formData = new FormData(createServerButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/server", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formObject)
  });
  const data = await response.json();

  if (response.status === 201) {
    window.location.replace(data.success);
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
  }
}

async function leaveServer(e, button) {
  e.preventDefault();

  const url = window.location.pathname;
  const serverId = url.substring(url.lastIndexOf("/") + 1);

  const response = await fetch("/server/leave", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      serverId
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

async function kickUser(e, button) {
  e.preventDefault();

  const userId = button.form.id;
  const url = window.location.pathname;
  const serverId = url.substring(url.lastIndexOf("/") + 1);

  const response = await fetch("/server/blacklist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      serverId
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

async function deleteServer(e) {
  e.preventDefault();

  const url = window.location.pathname;
  const serverId = url.substring(url.lastIndexOf("/") + 1);

  const response = await fetch("/server", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      serverId
    })
  });
  const data = await response.json();

  if (response.status === 200) {
    window.alert(data.success);
    window.location.replace("/");
  } else if (response.status === 401) {
    window.location.replace(data.error);
  } else {
    window.alert(data.error);
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
