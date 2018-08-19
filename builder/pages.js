const path = require('path');
const sitemap = require('./sitemap.js');
const mainConfig = require('./config.js');
const interfacePages = require('./pages/interface.js').pages;

let config = {
    directory: mainConfig.root,
    domain: 'https://raintech.su',
    utils: {
        getModTime: sitemap.getModTime
    },
    robots: {
        userAgent: '*',
        template: 'templates/robots.pug',
        destination: 'robots.txt'
    },
    sitemap: {
        template: 'templates/sitemap.pug',
        destination: 'sitemap.xml'
    },
    css: {
        sources: {
            root: path.resolve(mainConfig.root),
            desktop: path.resolve(mainConfig.root, 'styles-min', 'desktop.css'),
            mobile: path.resolve(mainConfig.root, 'styles-min', 'mobile.css'),
            path: path.resolve(mainConfig.root, 'styles'),
            enabled: mainConfig.production
        }
    },
    scripts: {
        libs: {
            relativeRoot: path.resolve(mainConfig.root),
            singleFile: path.resolve(mainConfig.root, 'scripts-min','libs.min.js'),
            compress: false,
            enabled: mainConfig.production
        },
        sources: {
            relativeRoot: path.resolve(mainConfig.root),
            singleFile: path.resolve(mainConfig.root, 'scripts-min', 'sources.min.js'),
            searchPath: path.resolve(mainConfig.root, 'scripts'),
            compress: true,
            enabled: mainConfig.production,
            es5: {
                enabled: true,
                singleFile: path.resolve(mainConfig.root, 'scripts-min', 'sourcesES5.min.js'),
                outputFolder: path.resolve(mainConfig.root, 'scriptsES5'),
            },
        }
    },
    materials: {
        path: path.resolve(mainConfig.root, 'static')
    },
    pages: []
};

exports.isApplication = (rpath) => {
    return (rpath.indexOf('application') != -1);
};

exports.isDefinitions = (rpath) => {
    return (rpath.indexOf('definitions') != -1);
};

exports.isGenerated = (rpath) => {
    return (rpath.indexOf('.gen.js') != -1);
};

exports.isLoader = (rpath) => {
    const hasLoader = (rpath.indexOf('loader.js') != -1);
    return hasLoader && !exports.isApplication(rpath);
};

exports.addFileToBundle = (fPath, bundle) => {
    const branch = config.scripts[bundle];
    if (branch.libraries == null) branch.libraries = {absolute: [], relative: []};
    branch.libraries.absolute.push(path.join(config.directory, fPath));
    branch.libraries.relative.push(fPath);
};

exports.addFileToBundle('node_modules/moment/min/moment-with-locales.min.js', 'libs');
exports.addFileToBundle('node_modules/vue/dist/vue.min.js', 'libs');
exports.addFileToBundle('node_modules/vue-router/dist/vue-router.min.js', 'libs');

exports.build = async () => {
    config.pages = config.pages.concat(
        interfacePages);
    return config;
};
