const CSV_MODE = getEnvBool('CSV_MODE');
const DIR_MODE = getEnvBool('DIR_MODE');
const CHANGE_IMG_NAME = getEnvBool('CHANGE_IMG_NAME');
const RESIZE_IMAGE = getEnvBool('RESIZE_IMAGE', true);
const RESIZE_IMAGE_WIDTH = getEnvInt('RESIZE_IMAGE_WIDTH') || 2000;
const IMAGE_REGEX = getEnvRegex('IMAGE_REGEX') || /\.(gif|jpg|jpeg|tiff|png)$/i;
const CSV_REGEX = getEnvRegex('CSV_REGEX') || /\.(csv)$/i;
const SKU_REGEX = getEnvRegex('SKU_REGEX') || /([A-Z]{2}\d{2}[A-Z]{2})|([A-Z]{2}\d{2,4}-\w{2,4})/ig;

if (CSV_MODE && DIR_MODE) {
  throw new Error('Cannot have both DIR mode and CSV mode enabled.');
}

const options = {
  CSV_MODE,
  DIR_MODE, 
  CHANGE_IMG_NAME, 
  RESIZE_IMAGE, 
  RESIZE_IMAGE_WIDTH,
  CSV_REGEX,
  IMAGE_REGEX, 
  SKU_REGEX 
};

console.log('Using options', options);

function getEnvBool(key, defaultVal = false) {
  return !process.env[key] ? defaultVal :
    process.env[key] === 'false' || process.env[key] === false ? false :
    true;
}

function getEnvInt(key) {
  const val = parseInt(process.env[key], 10);
  return isNaN(val) ? undefined : val;
}

function getEnvRegex(key) {
  const val = process.env[key];
  return val instanceof RegExp ? val : undefined;
}

module.exports = options;
