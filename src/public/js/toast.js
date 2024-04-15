const toastBackground = document.getElementById("toast__background");
const toastBox = document.getElementById("toast__box");
const toastMessage = document.getElementById("toast__message");
const toastCloseButton = document.getElementById("toast__close-button");

const printMessage = (message) => {
  toastMessage.innerText = message;
  toastBackground.style.visibility = "visible";
  toastBox.classList.add("toast--active");
};

const closeMessage = () => {
  toastMessage.innerText = "";
  toastBackground.style.visibility = "hidden";
  toastBox.classList.remove("toast--active");
};

toastBackground.addEventListener("click", (e) => {
  if (e.currentTarget === e.target) {
    closeMessage();
  }
});

toastCloseButton.addEventListener("click", (e) => {
  e.preventDefault();
  closeMessage();
});
