const signupButton = document.getElementById("signupButton");

signupButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const formData = new FormData(signupButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formObject)
  });
  const data = await response.json();

  if (response.status === 201) {
    window.location.replace(data.success);
  } else {
    window.alert(data.error);
  }
});
