const fs = require('fs-extra');
const parse = require('csv-parse')
const axios = require('axios');

const { CSV_REGEX, IMAGE_REGEX } = require('./env.helper');
const { writeImage } = require('./image.helper');

async function getAllCsvFiles() {
  const dirContents = await fs.readdir(`${process.cwd()}/src`);
  return getCsvFiles(dirContents);
}

function getCsvFiles(items) {
  return items.filter(file => file.match(CSV_REGEX));
}

async function readCsvFiles(files) {
  return await Promise.all(files.map(file => readCsvFile(`${process.cwd()}/src/${file}`)));
}

async function readCsvFile(file) {
  const fileString = await fs.readFile(file);
  const res = await new Promise((res, rej) => {
    parse(fileString, (err, output) => {
      if (err) { rej(err); }
      res(output);
    })
  });
  return prepareCsvResults(res);
}

function prepareCsvResults(file) {
  return file.filter(line => {
    const ret = line.find(item => item.match(IMAGE_REGEX));
    return ret ? line.filter(item => item && item !== '') : false;
  });
}

async function downloadCsvImagesFromFiles(files) {
  return await Promise.all(files.map(file => downloadCsvImages(file)));
}

// TODO: This assumes the first item is not an image but a SKU. Do not do this
async function downloadCsvImages(file) {
  for (const index in file) {
    const line = file[index];
    if (line && line.length) {
      const sku = line[0];
      const dir = `${process.cwd()}/dist/${sku}`;
      if (!(await fs.exists(dir))) { await fs.mkdir(dir); }
      line.shift();
      const images = await downloadImages(line);
      await writeImages(images, sku, dir);
    }
  }
}

async function writeImages(images, sku, imageDir) {
  return await Promise.all(images.map((image, index) => writeImage(image, `${imageDir}/${sku}${index+1}.jpg`)));
}

async function downloadImages(line) {
  return (await Promise.all(line.map(item => downloadImage(item)))).filter(item => !!item);
}

async function downloadImage(image) {
  try {
    const res = await axios.get(image, { responseType: 'arraybuffer' });
    return res.data ? new Buffer(res.data, 'binary') : undefined;
  } catch(err) {
    console.log(`Error downloading image - ${err.status ? err.status : ''}: ${image}`, err.data);
  }
}

module.exports = {
  getAllCsvFiles,
  readCsvFiles,
  downloadCsvImagesFromFiles
};
