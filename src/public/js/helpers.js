const getFormRequestBody = (node) => {
  return Object.fromEntries(new FormData(node.form));
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

const asyncHandler = async (func, ...args) => {
  try {
    await func(...args);
  } catch (error) {
    printMessage(error.message);
  }
};
