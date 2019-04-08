const fs = require('fs-extra');

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

async function getDirectoryImages(dir) {
  const dirContents = await fs.readdir(dir);
  return getImages(dirContents);
}

function getImages(items) {
  return items.filter(file => file.match(IMAGE_REGEX));
}

module.exports = {
  getAllImageDirectories,
  isImageDirectory,
  createDistDirs,
  copyRenameCompressImagesAll,
  copyRenameCompressImagesDir,
  getDirectoryImages,
  getImages
};
