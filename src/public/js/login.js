resetTheme();

const loginButton = document.getElementById("login__submit-button");

const login = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(loginButton);

    for (const [key, value] of Object.entries(requestBody)) {
      const string = validateString(value, key);

      const minUsernameLength = 3;
      const maxUsernameLength = 20;
      const minPasswordLength = 3;
      const maxPasswordLength = 20;

      if (!/^[a-z0-9]+$/i.test(string)) {
        throw new Error(`Expected only alphanumeric characters for ${key}.`);
      }

      if (key === "username") {
        if (
          string.length < minUsernameLength ||
          string.length > maxUsernameLength
        ) {
          throw new Error(
            `Expected between ${minUsernameLength} and ${maxUsernameLength} characters without whitespace for username.`
          );
        }
      }

      if (key === "password") {
        if (
          string.length < minPasswordLength ||
          string.length > maxPasswordLength
        ) {
          throw new Error(
            `Expected between ${minPasswordLength} and ${maxPasswordLength} characters without whitespace for username.`
          );
        }
      }

      requestBody[key] = string;
    }

    showLoader();
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const responseBody = await response.json();

    hideLoader();
    if (response.ok) {
      window.location.replace(responseBody.data.url);
    } else {
      printMessage(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

loginButton.addEventListener("click", async (e) => await login(e));
