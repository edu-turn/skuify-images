const fs = require('fs-extra');

const { IMAGE_REGEX, SKU_REGEX } = require('./env.helper');

async function createDistDirs(items) {
  await fs.mkdir(`${process.cwd()}/dist`).catch(err => {});
  for(item in items) {
    item = items[item];
    if (item) {
      await fs.mkdir(`${process.cwd()}/dist/${item}`).catch(err => { });
    }
  }
  return items;
}

module.exports = { createDistDirs };
