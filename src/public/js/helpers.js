function setTheme() {
  const theme = localStorage.getItem("userTheme") ?? "light";

  if (theme !== "light" && theme !== "dark") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function resetTheme() {
  localStorage.removeItem("userTheme");
}

const getFormRequestBody = (node) => {
  const requestBody = Object.fromEntries(new FormData(node.form));

  for (const [key, value] of Object.entries(requestBody)) {
    if (typeof value === "string" && key !== "description" && key !== "bio") {
      requestBody[key] = validateString(value, key);
    }
  }

  return requestBody;
};

const validateString = (_variable, _variableName) => {
  if (!_variable) {
    throw new Error(`Missing ${_variableName} field.`);
  }

  if (typeof _variable !== "string") {
    throw new Error(`Expected a string for ${_variableName}.`);
  }

  const variable = _variable.trim();
  if (variable.length === 0) {
    throw new Error(`Expected a nonempty string for ${_variableName}.`);
  }

  return variable;
};
