const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const formData = new FormData(loginButton.form);
  const formObject = Object.fromEntries(formData);

  const response = await fetch("/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formObject)
  });
  const data = await response.json();

  if (response.status === 200) {
    window.location.replace(data.success);
  } else {
    window.alert(data.error);
  }
});
