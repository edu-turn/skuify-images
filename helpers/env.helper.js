function getEnvBool(key, defaultVal = true) {
  return process.env[key] === 'false' || process.env[key] === false ? false : defaultVal; 
}

function getEnvInt(key) {
  const val = parseInt(process.env[key], 10);
  return isNaN(val) ? undefined : val;
}

function getEnvRegex(key) {
  const val = process.env[key];
  return val instanceof RegExp ? val : undefined;
}

module.exports = {
  getEnvBool,
  getEnvInt,
  getEnvRegex
};
