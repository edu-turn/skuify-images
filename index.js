const fs = require('fs-extra');
const sharp = require('sharp');

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

function logEnd() {
  const endDate = new Date();
  console.log(`${endDate} - Operation complete in ${endDate.getTime() - startDate.getTime()}`);
}

async function getAllImageDirectories() {
  try {
    const allContents = await fs.readdir(__dirname + '/src');
    return allContents.filter(item => isImageDirectory(item))
  } catch(err) {
    console.error('Error getting src', err);
  }
}

function isImageDirectory(item) {
  return item.includes('.') ? false : 
    item.match(SKU_REGEX) ? true :
    false;
}

async function createDistDirs(items) {
  await fs.mkdir(`${__dirname}/dist`).catch(err => {});
  for(item in items) {
    item = items[item];
    if (item) {
      await fs.mkdir(`${__dirname}/dist/${item}`).catch(err => { });
    }
  }
  return items;
}

async function copyRenameCompressImagesAll(items) {
  // const imageProms = items.map(item => {
  //   return copyRenameCompressImagesDir(item)
  //     .catch(err => console.error(`Unable to copy images in dir ${item}`, err));
  // });
  // return await Promise.all(imageProms);
  // TODO: Batch requests in groups of 5 to 10 directories
  for(item in items) {
    item = items[item];
    console.log(`Starting images for ${__dirname}/dist/${item}`);
    await copyRenameCompressImagesDir(item);
    console.log(`Complete images for ${__dirname}/dist/${item}`);
  }
}

async function copyRenameCompressImagesDir(dir) {
  const images = await getDirectoryImages(`${__dirname}/src/${dir}`);
  const imageProms = images.map((image, index) => {
    return copyCompressImage(image, dir, index)
      .catch(err => console.log())
  });
  return Promise.all(imageProms);
}

async function copyCompressImage(imageName, dir, index) {
  let imageBuffer;
  const imagePath = `${__dirname}/src/${dir}/${imageName}`;
  let newImagePath = `${__dirname}/dist/`;
  newImagePath += DIR_MODE ? dir : '';
  const newImageName = CHANGE_IMG_NAME ? `${dir}${index}.jpg` : `${imageName}`;
  const newImage = `${newImagePath}/${newImageName}`;
  if (RESIZE_IMAGE) { 
    imageBuffer = await sharp(imagePath)
    .resize(RESIZE_IMAGE_WIDTH)
    .toBuffer();
  } else {
    imageBuffer = await sharp(imagePath).toBuffer();
  }
  await fs.writeFile(newImage, imageBuffer);
  console.log('completed writing new image', newImage);
  return;
}

async function getDirectoryImages(dir) {
  const dirContents = await fs.readdir(dir);
  return getImages(dirContents);
}

function getImages(items) {
  return items.filter(file => file.match(IMAGE_REGEX));
}
