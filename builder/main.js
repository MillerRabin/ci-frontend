const fs = require('fs').promises;
const path = require('path');
const pug = require('pug');
const uglifycss = require('uglifycss');
const recursive = require('recursive-readdir');
const pages = require('./pages.js');
const builder = require('./builder.js');

async function writeRobots(config) {
    const template = path.resolve(config.directory, config.robots.template );
    const destination = path.resolve(config.directory, config.robots.destination );
    const routes = pug.renderFile(template, config);
    await fs.writeFile(destination, routes);
    return routes;
}

async function writeSitemap(config) {
    const template = path.resolve(config.directory, config.sitemap.template );
    const destination = path.resolve(config.directory, config.sitemap.destination );
    const routes = pug.renderFile(template, config);
    await fs.writeFile(destination, routes);
    return routes;
}

async function write(path, data) {
    await builder.checkDirectories(path);
    await fs.writeFile(path, data);
}

async function buildCssBundles(config) {
    const bundles = [];
    for (let key in config.css) {
        if (!config.css.hasOwnProperty(key)) continue;
        const bundle = config.css[key];
        const files = await buildCss(bundle);
        if (files != null) bundles.push(files);
    }
    return bundles;
}

async function buildCss(bundle) {
    function search(isMobile) {
        function ignore(file, stats) {
            if (stats.isDirectory()) return false;
            const fp = path.parse(file);
            if (fp.ext != '.css') return true;
            const mobile = file.match('mobile');
            let predicate = (mobile != null);
            if (isMobile) predicate = (mobile == null);
            return predicate;
        }

        return new Promise((resolve, reject) => {
            recursive(bundle.path, [ignore], function (err, files) {
                if (err != null) return reject(err);
                const relFiles = [];
                for (let i = 0; i < files.length; i++)
                    relFiles.push(files[i].substring(bundle.root.length + 1).replace(/\\/g, '/'));
                return resolve({absolute: files, relative: relFiles});
            });
        });
    }


    const data = await Promise.all([search(false), search(true)]);
    if (bundle.libraries == null) {
        bundle.libraries = {
            absolute: [],
            relative: []
        }
    }
    const afiles  = bundle.libraries.absolute.concat(data[0].absolute);
    const rfiles = bundle.libraries.relative.concat(data[0].relative);
    if (!bundle.enabled)
        return { desktopFiles: rfiles, mobileFiles: data[1].relative};

    const desktopCss = uglifycss.processFiles(afiles, { maxLineLen: 0 });
    const mobileCss = uglifycss.processFiles(data[1].absolute, { maxLineLen: 0 });

    await Promise.all([write(bundle.desktop, desktopCss), write(bundle.mobile, mobileCss)]);
    return {
        desktopFiles: [bundle.desktop.substring(bundle.root.length + 1).replace(/\\/g, '/')],
        mobileFiles: [bundle.mobile.substring(bundle.root.length + 1).replace(/\\/g, '/')]
    };
}

exports.build = async () => {
    const lp = [];
    const config = await pages.build();

    lp.push(buildCssBundles(config).then((files) => {
        config.css.files = files;
        const promises = [];
        for (let i = 0; i < config.pages.length; i++) {
            if (!config.pages[i].noRender)
                promises.push(builder.writeHtml(config, config.pages[i]));
        }

        return Promise.all(promises);
    }));

    await Promise.all(lp);
    await Promise.all([writeRobots(config), writeSitemap(config)]);
};

exports.build();