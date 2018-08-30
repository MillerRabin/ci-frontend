import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';

function printObject(obj) {
    const res = [];
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        res.push(`${key}: ${obj[key]}`);
    }
    return res.join('\n');
}

async function get(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    const rData = await loader.json('/api/projects/get', {
        method: 'POST',
        data: sData
    });
    return postgres.toArray(rData, (item) => {
        item.init = (item.init == null) ? '' : item.init.join('\n');
        item.test = (item.test == null) ? '' : item.test.join('\n');
        item.deploy = (item.deploy == null) ? '' : item.deploy.join('\n');
        item.reload = (item.reload == null) ? '' : item.reload.join('\n');
        item.credentials = printObject(item.credentials);
        return item;
    });
}

async function update(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    await loader.json('/api/projects', {
        method: 'PUT',
        data: sData
    });
    return 'Update success';
}

export default {
    get: get,
    update: update
}