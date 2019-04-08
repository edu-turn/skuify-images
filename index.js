const { getAllCsvFiles, readCsvFiles, downloadCsvImagesFromFiles } = require('./helpers/csv.helper');
const { CSV_MODE, DIR_MODE } = require('./helpers/env.helper');
const {
  getAllImageDirectories,
  isImageDirectory,
  copyRenameCompressImagesAll,
  copyRenameCompressImagesDir,
  getDirectoryImages,
  getImages
} = require('./helpers/image.helper');
const { createDistDirs } = require('./helpers/file.helper');

const startDate = new Date();
console.log(`${startDate} - Starting operation`);
if (DIR_MODE) {
  getAllImageDirectories()
    .then(res => createDistDirs(res))
    .then(res => copyRenameCompressImagesAll(res))
    .then(() => logEnd())
    .catch(err => console.error(err));
} else if (CSV_MODE) {
  createDistDirs([])
    .then(() => getAllCsvFiles())
    .then(res => readCsvFiles(res))
    .then(res => downloadCsvImagesFromFiles(res))
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
