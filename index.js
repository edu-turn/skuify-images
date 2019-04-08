const { } = require('./helpers/csv.helper');
const { getEnvBool, getEnvInt, getEnvRegex } = require('./helpers/env.helper');
const {
  getAllImageDirectories,
  isImageDirectory,
  createDistDirs,
  copyRenameCompressImagesAll,
  copyRenameCompressImagesDir,
  getDirectoryImages,
  getImages
} = require('./helpers/image.helper');

const DIR_MODE = getEnvBool('DIR_MODE');
const CHANGE_IMG_NAME = getEnvBool('CHANGE_IMG_NAME');
const RESIZE_IMAGE = getEnvBool('RESIZE_IMAGE');
const RESIZE_IMAGE_WIDTH = getEnvInt('RESIZE_IMAGE_WIDTH') || 2000;
const IMAGE_REGEX = getEnvRegex('IMAGE_REGEX') || /\.(gif|jpg|jpeg|tiff|png)$/i;
const SKU_REGEX = getEnvRegex('SKU_REGEX') || /([A-Z]{2}\d{2}[A-Z]{2})|([A-Z]{2}\d{2,4}-\w{2,4})/ig;

console.log('Using options', { DIR_MODE, CHANGE_IMG_NAME, RESIZE_IMAGE, RESIZE_IMAGE_WIDTH, IMAGE_REGEX, SKU_REGEX });

const startDate = new Date();
console.log(`${startDate} - Starting operation`);
if (DIR_MODE) {
  getAllImageDirectories()
    .then(res => createDistDirs(res))
    .then(res => copyRenameCompressImagesAll(res))
    .then(() => logEnd())
    .catch(err => console.error(err));
} else {
  createDistDirs([])
    .then(() => copyRenameCompressImagesDir(''))
    .then(() => logEnd())
    .catch(err => console.log(err))
}

function logEnd() {
  const endDate = new Date();
  console.log(`${endDate} - Operation complete in ${endDate.getTime() - startDate.getTime()}`);
}
