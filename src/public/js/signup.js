const signupButton = document.getElementById("signupButton");

signupButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const body = Object.fromEntries(new FormData(signupButton.form));

  try {
    const response = await fetch("/api/user/signup", {
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
      console.log(json.error);
    }
  } catch (error) {
    console.log(error);
  }
});
