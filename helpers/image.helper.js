const fs = require('fs-extra');
const sharp = require('sharp');

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

module.exports = { copyCompressImage };
