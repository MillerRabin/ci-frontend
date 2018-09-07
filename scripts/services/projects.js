import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';
import safe from '/scripts/services/safe.js';

class ProjectException extends Error {
    constructor(object) {
        super();
        Object.assign(this, object);
    }
}

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

function commandsToString(commands) {
    const res = [];
    for (let cmd of commands) {
        if (typeof(cmd) == 'object') {
            res.push(JSON.stringify(cmd));
            continue;
        }
        res.push(cmd);
    }
    return res.join('\n');
}

function stringToCommands(str) {
    const commands = str.split('\n');
    const res = [];
    for (let cmd of commands) {
        try {
            res.push(JSON.parse(cmd));
        } catch (e) {
            res.push(cmd);
        }
    }
    return res;
}

const projectHash = {};
async function get(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    const rData = await loader.json('/api/projects/get', {
        method: 'POST',
        data: sData
    });
    return postgres.toArray(rData, (item) => {
        projectHash[item.id] = item;
        item.init = (item.init == null) ? '' : commandsToString(item.init);
        item.test = (item.test == null) ? '' : commandsToString(item.test);
        item.deploy = (item.deploy == null) ? '' : commandsToString(item.deploy);
        item.reload = (item.reload == null) ? '' : commandsToString(item.reload);
        item.credentials = objectToString(item.credentials);
        return item;
    });
}

async function update(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    if (typeof(sData.init) == 'string') sData.init = stringToCommands(sData.init);
    if (typeof(sData.test) == 'string') sData.test = stringToCommands(sData.test);
    if (typeof(sData.deploy) == 'string') sData.deploy = stringToCommands(sData.deploy);
    if (typeof(sData.reload) == 'string') sData.reload = stringToCommands(sData.reload);
    if (typeof(sData.credentials) == 'string') sData.credentials = objectFromString(sData.credentials);

    await loader.json('/api/projects', {
        method: 'PUT',
        data: sData
    });
    return 'Update success';
}

async function execute(data) {
    await update(data);
    const currentUser = await raintechAuth.check();
    const sData = { id: data.id, certificate: currentUser.certificate };
    await loader.json('/api/git/manual', {
        method: 'POST',
        data: sData
    });
}

async function create(data) {
    const currentUser = await raintechAuth.check();
    if (safe.isEmpty(data.project_name )) throw new ProjectException({ project_name: 'Project name is empty'});
    const sData = Object.assign({ certificate: currentUser.certificate }, data);
    await loader.json('/api/projects', {
        method: 'POST',
        data: sData
    });
}

async function remove(data) {
    const currentUser = await raintechAuth.check();
    const sData = Object.assign({ certificate: currentUser.certificate }, data);
    await loader.json('/api/projects', {
        method: 'DELETE',
        data: sData
    });
}


export default {
    get: get,
    update: update,
    execute: execute,
    create: create,
    delete: remove,
    hash: projectHash,
    Exception: ProjectException
}