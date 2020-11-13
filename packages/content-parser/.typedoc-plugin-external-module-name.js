module.exports = function customMappingFunction(explicit, implicit, path, reflection, context) {
  const package = implicit.split("/type")[0];
  return `${package}`;
}
