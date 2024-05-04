resetTheme();

const loginButton = document.getElementById("login__submit-button");

function isValidPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

const login = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(loginButton);

    for (const [key, value] of Object.entries(requestBody)) {
      const string = validateString(value, key);

      if (key === "username") {
        if (
          !/^[a-z0-9]+$/i.test(string) ||
          string.length < 3 ||
          string.length > 20
        ) {
          throw new Error("Username must be 3-20 alphanumeric characters.");
        }
      }

      if (key === "password") {
        if (!isValidPassword(string)) {
          throw new Error(
            "Password must be at least 8 characters long, include at least one uppercase letter, and one special character."
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
