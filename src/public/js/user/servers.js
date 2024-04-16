setTheme();

const createServerButton = document.getElementById("servers__create-button");
const serverSearchbar = document.getElementById("servers__searchbar");
const serverSearchButton = document.getElementById("servers__search-button");
const leaveServerButtons = document.getElementsByClassName(
  "servers__leave-buttons"
);

function createServerListElement(serverId, serverName) {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = serverId;

  const a = document.createElement("a");
  a.href = `/server/${serverId}`;
  a.innerText = serverName;

  const button = document.createElement("button");
  button.innerText = "Leave";
  button.classList.add("servers__leave-button");
  button.addEventListener(
    "click",
    async (e) => await asyncHandler(leaveServer, e, button)
  );

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
}

function createQueriedServerListElement(server) {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = server._id;

  const a = document.createElement("a");
  a.innerText = server.name;
  a.href = `/server/${server._id}`;

  const button = document.createElement("button");
  button.innerText = "Join";
  button.classList.add("servers__join-button");
  button.addEventListener(
    "click",
    async (e) => await asyncHandler(joinServer, e, server._id, server.name)
  );

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
}

const createServer = async (e) => {
  e.preventDefault();

  const requestBody = getFormRequestBody(e.target);

  const response = await fetch("/api/server", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  const responseBody = await response.json();

  if (response.ok) {
    e.target.form.reset();
    window.location.replace(responseBody.data.url);
  } else {
    if (response.statusText === "Unauthorized") {
      window.location.replace("/login");
      return;
    }
    printMessage(responseBody.error);
  }
};

const findServersByName = async (e) => {
  const response = await fetch(`/api/server/${e.currentTarget.value}`, {
    method: "GET"
  });
  const responseBody = await response.json();

  if (response.ok) {
    const queriedServers = document.getElementById("servers__search-results");
    queriedServers.innerHTML = "";
    responseBody.data.servers.forEach((server) => {
      queriedServers.appendChild(createQueriedServerListElement(server));
    });
  } else {
    printMessage(responseBody.error);
  }
};

const joinServer = async (e, serverId, serverName) => {
  e.preventDefault();

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
    printMessage("Successfully joined server.");
    document.getElementById("servers__search-results").innerHTML = "";
    serverSearchbar.value = "";
    document
      .getElementById("servers_server-list")
      .appendChild(createServerListElement(serverId, serverName));
  } else {
    if (response.statusText === "Unauthorized") {
      window.location.replace("/login");
      return;
    }
    const responseBody = await response.json();
    printMessage(responseBody.error);
  }
};

const leaveServer = async (e, button) => {
  e.preventDefault();

  const url = window.location.pathname;

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
    printMessage("Successfully left server.");
    if (button.form) {
      button.form.remove();
    }
  } else {
    if (response.statusText === "Unauthorized") {
      window.location.replace("/login");
      return;
    }
    const responseBody = await response.json();
    printMessage(responseBody.error);
  }
};

if (createServerButton) {
  createServerButton.addEventListener(
    "click",
    async (e) => await asyncHandler(createServer, e)
  );
}

if (serverSearchbar) {
  serverSearchbar.addEventListener(
    "keyup",
    async (e) => await asyncHandler(findServersByName, e)
  );
}

if (serverSearchButton) {
  serverSearchButton.addEventListener(
    "click",
    async (e) => await asyncHandler(findServersByName, e)
  );
}

if (leaveServerButtons) {
  Array.from(leaveServerButtons).forEach((button) =>
    button.addEventListener("click", (e) => leaveServer(e, button))
  );
}
