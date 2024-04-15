const signupButton = document.getElementById("signup__submit-button");

const signup = async (e) => {
  e.preventDefault();

  const requestBody = getFormRequestBody(signupButton);

  for (const [key, value] of Object.entries(requestBody)) {
    const string = validateString(value, key);

    const minUsernameLength = 3;
    const maxUsernameLength = 20;
    const minPasswordLength = 3;
    const maxPasswordLength = 20;

    if (key === "username" || key === "password" || key === "repassword") {
      if (!/^[a-z0-9]+$/i.test(string)) {
        throw new Error(`Expected only alphanumeric characters for ${key}.`);
      }
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

    if (key === "password" || key === "repassword") {
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

  if (requestBody["password"] !== requestBody["repassword"]) {
    throw new Error("Passwords do not match.");
  }

  showLoader();
  const response = await fetch("/api/user", {
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
    throw new Error(responseBody.error);
  }
};

signupButton.addEventListener("click", async (e) => asyncHandler(signup, e));
