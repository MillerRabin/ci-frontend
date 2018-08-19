const path = require('path');
const util = require('util');
const fs = require('fs');
const pug = require('pug');

const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

exports.checkDirectories = async (fileName) => {
    const paths = fileName.split(path.sep);
    const absPath = fileName.startsWith(path.sep) ? path.sep : '';
    let base = absPath + paths[0];
    for (let i = 1; i <  paths.length - 1; i++) {
        base = path.join(base, paths[i]);
        try {
            await mkdir(base);
        } catch(e) {}
    }
};

exports.writeHtml = async (config, item) => {
    async function compile(source, target, params) {
        console.log('render file ' + target);
        const html = pug.renderFile(source, params);
        await exports.checkDirectories(target);
        try {
            await writeFile(target, html);
        } catch (err) {
            console.log(err);
        }
    }

    function compilePage(config, item) {
        if (item.templatePage == null) return;
        const template = path.resolve(config.directory, item.templatePage);
        const destination = path.resolve(config.directory, item.templateUrl);
        return compile(template, destination, { config: config, item: item });
    }

    const template = path.resolve(config.directory, item.template);
    const destination = path.resolve(config.directory, item.destination);
    await compilePage(config, item);
    if (item.resolve != null)
        await item.resolve(config, item);
    return await compile(template, destination, { config: config, item: item });
};
