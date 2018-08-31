import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';

function objectToString(obj) {
    const res = [];
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        res.push(`${key}: ${obj[key]}`);
    }
    return res.join('\n');
}

function objectFromString(str) {
    const lines = str.split('\n');
    const obj = {};
    for (let line of lines) {
        const [key, value] = line.split(':');
        obj[key.trim()] = value.trim();
    }
    return obj;
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
        item.credentials = objectToString(item.credentials);
        return item;
    });
}

async function update(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    if (typeof(sData.init) == 'string') sData.init = sData.init.split('\n');
    if (typeof(sData.test) == 'string') sData.test = sData.test.split('\n');
    if (typeof(sData.deploy) == 'string') sData.deploy = sData.deploy.split('\n');
    if (typeof(sData.reload) == 'string') sData.reload = sData.reload.split('\n');
    if (typeof(sData.credentials) == 'string') sData.credentials = objectFromString(sData.credentials);

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