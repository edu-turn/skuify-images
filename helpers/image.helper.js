const fs = require('fs-extra');
const sharp = require('sharp');

const { DIR_MODE, CHANGE_IMG_NAME, RESIZE_IMAGE, IMAGE_REGEX, RESIZE_IMAGE_WIDTH } = require('./env.helper');

async function getAllImageDirectories() {
  try {
    const allContents = await fs.readdir(process.cwd() + '/src');
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

async function copyRenameCompressImagesAll(items) {
  // const imageProms = items.map(item => {
  //   return copyRenameCompressImagesDir(item)
  //     .catch(err => console.error(`Unable to copy images in dir ${item}`, err));
  // });
  // return await Promise.all(imageProms);
  // TODO: Batch requests in groups of 5 to 10 directories
  for(item in items) {
    item = items[item];
    console.log(`Starting images for ${process.cwd()}/dist/${item}`);
    await copyRenameCompressImagesDir(item);
    console.log(`Complete images for ${process.cwd()}/dist/${item}`);
  }
}

async function copyRenameCompressImagesDir(dir) {
  const images = await getDirectoryImages(`${process.cwd()}/src/${dir}`);
  const imageProms = images.map((image, index) => {
    return copyCompressImage(image, dir, index)
      .catch(err => console.log())
  });
  return Promise.all(imageProms);
}

async function getDirectoryImages(dir) {
  const dirContents = await fs.readdir(dir);
  return getImages(dirContents);
}

function getImages(items) {
  return items.filter(file => file.match(IMAGE_REGEX));
}

async function copyCompressImage(imageName, dir, index) {
  let imageBuffer;
  const imagePath = `${process.cwd()}/src/${dir}/${imageName}`;
  let newImagePath = `${process.cwd()}/dist/`;
  newImagePath += DIR_MODE ? dir : '';
  const newImageName = CHANGE_IMG_NAME ? `${dir}${index}.jpg` : `${imageName}`;
  const newImage = `${newImagePath}/${newImageName}`;
  const image = await fs.readFile(imagePath);
  await writeImage(image, newImage);
  console.log('completed writing new image', newImage);
}

async function writeImage(image, imagePath) {
  if (RESIZE_IMAGE) {
    imageBuffer = await sharp(image)
    .resize(RESIZE_IMAGE_WIDTH)
    .toBuffer();
  } else {
    imageBuffer = await sharp(image).toBuffer();
  }
  await fs.writeFile(imagePath, imageBuffer);
}


module.exports = {
  copyCompressImage,
  copyRenameCompressImagesAll,
  copyRenameCompressImagesDir,
  isImageDirectory,
  getAllImageDirectories,
  getDirectoryImages,
  getImages,
  writeImage
};
