const fs = require('fs');
const path = require('path');

exports.pages = [{
    template: 'templates/pages/frontpage.pug',
    destination: 'index.html',
    alias: '/',
    priority: 0.8,
    freq: 'weekly',
    templates: [{
        id: 'Frontpage-Template',
        body: fs.readFileSync(path.resolve(__dirname, '../../pages/frontpage.html'))
    }]
}, {
    template: 'templates/pages/changePassword.pug',
    destination: 'changePassword.html',
    alias: '/',
    priority: 0.8,
    freq: 'weekly',
    templates: [{
        id: 'ChangePassword-Template',
        body: fs.readFileSync(path.resolve(__dirname, '../../pages/changePassword.html'))
    }]
}];

