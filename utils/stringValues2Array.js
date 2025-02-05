// Transforms strings like '{"list","upload","delete"}' to arrays
export const stringValues2Array = (value) => {
  if (Array.isArray(value)) {
    return value; // If it's already an array, return it as is
  }

  if (typeof value !== "string") {
    throw new Error("The input value must be a string or an array.");
  }

  // Validate general format (structure with braces and double quotes separated by commas)
  const isValidFormat = /^\{("[^"]*"(,\s*)?)+\}$/.test(value);
  if (!isValidFormat) {
    throw new Error(
      'The string does not have the expected format. It must be in the form: {"item1","item2","item3"}.',
    );
  }

  // Convert to a valid JSON array
  return JSON.parse(
    value
      .replace(/{/g, "[") // Replace opening braces with square brackets
      .replace(/}/g, "]"), // Replace closing braces with square brackets
  );
};

export default stringValues2Array;
