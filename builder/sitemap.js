const fs = require('fs');
const path = require('path');
const moment = require('moment');

function getModTime(config, item) {
    if (item.templateUrl == null)  return new Date();
    let filename = path.resolve(config.directory, item.templateUrl).replace(/\\/g, '/');
    let lastmod = null;
    let stat = null;
    try {
        stat = fs.statSync(filename);
        lastmod = stat.mtime;
    }
    catch(e) {
        lastmod = new Date();
    }
    return lastmod;
}

exports.getModTime = (directory, item) => {
    return moment(getModTime({ directory: directory }, item)).format('YYYY-MM-DD');
};