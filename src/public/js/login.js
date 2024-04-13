const loginButton = document.getElementById("login__button");

const login = async (e) => {
  e.preventDefault();

  const requestBody = getFormRequestBody(loginButton);

  for (const [key, value] of Object.entries(requestBody)) {
    requestBody[key] = validateString(value, key);
  }

  showLoader();
  const response = await fetch("/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  const json = await response.json();

  hideLoader();
  if (response.ok) {
    window.location.replace(json.data.url);
  } else {
    throw new Error(json.error);
  }
};

loginButton.addEventListener("click", async (e) => asyncHandler(login, e));
