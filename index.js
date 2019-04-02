const fs = require('fs-extra');

const SKU_REGEX = /[A-Z1-9-]{6}/ig;

async function getAllImageDirectories() {
  try {
    const allContents = await fs.readdir(__dirname + '/src');
    return allContents.filter(item => isImageDirectory(item))
  } catch(err) {
    console.error('Error getting')
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
    await fs.mkdir(`${__dirname}/dist/${item}`).catch(err => { });
  }
  return items;
}

getAllImageDirectories()
  .then(res => createDistDirs(res))
  .then(res => console.log(res))
  .catch(err => console.error(err));

