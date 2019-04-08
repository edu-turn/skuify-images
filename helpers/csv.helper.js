const fs = require('fs-extra');
const parse = require('csv-parse')
const axios = require('axios');

const IMAGE_REGEX = /.(gif|jpg|jpeg|tiff|png)/g;
const { CSV_REGEX } = require('./env.helper');
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

// TODO: This is super jank
function prepareCsvResults(file) {
  return file
    .map(line => {
      const hasImage = line.find(item => item.match(IMAGE_REGEX));
      if (!hasImage) { return []; }
      line[0] = line[0].replace(/\//g, '_').replace(/[^\x00-\x7F]/g, '');
      const res = line.filter((item, index) => {
        if (index === 0) { return true; }
        const matches = (item.match(IMAGE_REGEX) || []).length;
        return matches === 1 ? true : false;
      });
      return res;
    })
    .filter(line => line && line.length ? true : false);
}

async function downloadCsvImagesFromFiles(files) {
  console.info(`Downloading images ${files.length} files`);
  return await Promise.all(files.map(file => downloadCsvImages(file)));
}

// TODO: This assumes the first item is not an image but a SKU. Do not do this
async function downloadCsvImages(file) {
  console.info(`Downloading ${file.length} lines`);
  let successes = 0;
  for (const index in file) {
    const line = file[index];
    if (line && line.length) {
      const sku = line[0];
      try {
        const dir = `${process.cwd()}/dist/${sku}`;
        if (!(await fs.exists(dir))) { await fs.mkdir(dir); }
        line.shift();
        const images = await downloadImages(line);
        await writeImages(images, sku, dir);
        successes += 1;
      } catch(err) {
        console.error('Error saving SKU: ', sku);
      }
    }
  }
  console.info('Succesfully downloaded ', successes);
}

async function writeImages(images, sku, imageDir) {
  console.log(`Downloading ${images.length} for sku ${sku}`);
  return await Promise.all(images.map((image, index) => writeImage(image, `${imageDir}/${sku}${index + 1}.jpg`)));
}

async function downloadImages(line) {
  return (await Promise.all(line.map(item => downloadImage(item)))).filter(item => !!item);
}

async function downloadImage(image) {
  try {
    const res = await axios.get(image, { responseType: 'arraybuffer' });
    return res.data ? new Buffer.from(res.data, 'binary') : undefined;
  } catch (err) {
    console.log(`Error downloading image - ${err.status ? err.status : ''}: ${image}`, err.data);
  }
}

async function writeCSVResultFile() {
  const allItems = await fs.readdir(`${process.cwd()}/dist`);
  const res = [];
  let maxLength = 0;
  for (const item of allItems) {
    const itemPath = `${process.cwd()}/dist/${item}`;
    const stat = await fs.lstat(itemPath);
    if(!stat.isFile()) {
      const images = await fs.readdir(itemPath);
      if (images.length > maxLength) { maxLength = images.length; }
      res.push([ item, ...images ]);
    }
  }
  const header = ['SKU'];
  for(let i = 0; i <= maxLength; i++) { header.push('Image'); }
  res.unshift(header);
  const csv = `${res.map(item => `${item.join(',')}\n`).join('')}`;
  const csvPath = `${process.cwd()}/dist/output.csv`;
  await fs.writeFile(csvPath, csv);
  console.log(`CSV created - ${csvPath}`);
}

module.exports = {
  getAllCsvFiles,
  downloadCsvImagesFromFiles,
  readCsvFiles,
  writeCSVResultFile
};
