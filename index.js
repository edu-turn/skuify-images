const fs = require('fs-extra');
const sharp = require('sharp');

const RESIZE_IMAGE = process.env.RESIZE_IMAGE | true;
const RESIZE_IMAGE_WIDTH = process.env.RESIZE_IMAGE_WIDTH | 2000;
const IMAGE_REGEX = /\.(gif|jpg|jpeg|tiff|png)$/i;
const SKU_REGEX = /([A-Z]{2}\d{2}[A-Z]{2})|([A-Z]{2}\d{2,4}-\w{2,4})/ig;

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
  const images = await getDirectoryImages(dir);
  const imageProms = images.map((image, index) => {
    return copyCompressImage(image, dir, index)
      .catch(err => console.log())
  });
  return Promise.all(imageProms);
}

async function copyCompressImage(imageName, dir, index) {
  let imageBuffer;
  const imagePath = `${__dirname}/src/${dir}/${imageName}`;
  const newImagePath = `${__dirname}/dist/${dir}/${dir}${index}.jpg`;
  if (RESIZE_IMAGE) { 
    imageBuffer = await sharp(imagePath)
    .resize(RESIZE_IMAGE_WIDTH)
    .toBuffer();
  } else {
    imageBuffer = await sharp(imagePath).toBuffer();
  }
  await fs.writeFile(newImagePath, imageBuffer);
  console.log('completed writing new image', newImagePath);
  return;
}

async function getDirectoryImages(dir) {
  const dirContents = await fs.readdir(`${__dirname}/src/${dir}`);
  return dirContents.filter(file => file.match(IMAGE_REGEX));
}

getAllImageDirectories()
  .then(res => createDistDirs(res))
  .then(res => copyRenameCompressImagesAll(res))
  .catch(err => console.error(err));
