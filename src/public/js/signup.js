resetTheme();

const signupButton = document.getElementById("signup__submit-button");

function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function isValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

const signup = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(signupButton);

    for (const [key, value] of Object.entries(requestBody)) {
      const string = validateString(value, key);

      if (key === "username") {
        if (!/^[a-z0-9]+$/i.test(string) || string.length < 3 || string.length > 20) {
          throw new Error("Username must be 3-20 alphanumeric characters.");
        }
      }

      if (key === "email" && !isValidEmail(string)) {
        throw new Error("Invalid email.");
      }

      if ((key === "password" || key === "repassword") && !isValidPassword(string)) {
        throw new Error("Password must be at least 8 characters long, include at least one uppercase letter, and one special character.");
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
      printMessage(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

signupButton.addEventListener("click", async (e) => await signup(e));
