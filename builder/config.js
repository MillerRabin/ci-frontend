const path = require('path');

if (exports.production == null)
    exports.production = (process.argv[2] != 'debug');

exports.root = path.resolve(path.join(__dirname, '..'));
exports.serverPath = exports.production ? 'https://raintech.su:8090' : 'http://localhost:8090';

exports.useHttp2 = false;

exports.materials = {
    load: true,
    build: true
};

if (exports.babel == null) {
    exports.babel = {
        presets: [
            [ 'env', {
                targets: {
                    browsers: ["last 1 versions", "safari >= 10", "ie 11"]
                }
            }]
        ]
    }
}