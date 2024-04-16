// DOM Selectors

const deleteChannelButtons = document.getElementsByClassName(
  "deleteChannelButtons"
);
const createChannelButton = document.getElementById("createChannelButton");

// Helper Functions

async function deleteChannel(e, button) {
  e.preventDefault();

  const channelId = button.form.id;

  try {
    const response = await fetch("/api/channel", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channelId: channelId
      })
    });

    if (response.ok) {
      window.alert("Successfully deleted channel.");
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

async function createChannel(e) {
  e.preventDefault();

  const body = Object.fromEntries(new FormData(createChannelButton.form));

  try {
    const response = await fetch("/api/channel", {
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

// Event Listeners

if (deleteChannelButtons) {
  Array.from(deleteChannelButtons).forEach((button) =>
    button.addEventListener("click", (e) => deleteChannel(e, button))
  );
}

if (createChannelButton) {
  createChannelButton.addEventListener("click", (e) => createChannel(e));
}
