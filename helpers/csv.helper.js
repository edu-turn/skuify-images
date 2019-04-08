const fs = require('fs-extra');

const { CSV_REGEX } = require('./env.helper');

async function getAllCsvFiles() {
  const dirContents = await fs.readdir(`${process.cwd()}/src`);
  return getCsvFiles(dirContents);
}

function getCsvFiles(items) {
  return items.filter(file => file.match(CSV_REGEX));
}

module.exports = {
  getAllCsvFiles
};
