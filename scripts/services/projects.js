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

const defCredentials = {
    host: 'your deploy host',
    user: 'deploy user',
    password: 'your pass'
};

const defInit = [
    'git clone your-project.git /path/to/your/project',
    'cd /path/to/your/project/your-project',
    'git pull origin production',
    '{"cwd":"/other/path","command": "other-path-command"}'
];

const defTest = [
    'cd /path/to/your/project/your-project'
];

const defDeploy = [
    'git reset --hard HEAD',
    'git pull origin production',
    '{"cwd":"/other/path","command": "other-path-command"}'
];

const defReload = [
    'sudo systemctl reload youservice'
];

const defDirectory = {
    cwd: '/path/to/your/project'
};

const defCredentialsStr = objectToString(defCredentials);
const defDirectoryStr = objectToString(defDirectory);
const defInitStr = commandsToString(defInit);
const defTestStr = commandsToString(defTest);
const defDeployStr = commandsToString(defDeploy);
const defReloadStr = commandsToString(defReload);

function getValidConfigs(configs, defs) {
    const res = {};
    if (configs == null) {
        res['main'] = defs;
        return res;
    }
    if (Array.isArray(configs)) {
        res['main'] = configs;
        return res;
    }

    return configs;
}

function mapConfigs(configs, iterateFunc, defs) {
    const res = {};
    const conf = getValidConfigs(configs, defs);
    for (let key in conf) {
        if (!conf.hasOwnProperty(key)) continue;
        if (typeof(conf[key]) == 'string') {
            res[key] = conf[key];
            continue;
        }
        res[key] = iterateFunc(conf[key]);
    }
    return res;
}

function objectFromString(configs, defs) {
    return mapConfigs(configs, (str) => {
        const lines = str.split('\n');
        const obj = {};
        for (let line of lines) {
            const [key, value] = line.split(':');
            if (value == null) continue;
            obj[key.trim()] = value.trim();
        }
        return obj;
    }, defs);
}

function objectToString(obj) {
    const res = [];
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        res.push(`${key}: ${obj[key]}`);
    }
    return res.join('\n');
}

function configObjectToString(configs, defs) {
    return mapConfigs(configs, objectToString, defs);
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

function configCommandsToString(configs, defs) {
    return mapConfigs(configs, commandsToString, defs);
}

function stringToCommands(configs, defs) {
    return mapConfigs(configs, (str) => {
        const commands = str.split('\n');
        const res = [];
        for (let cmd of commands) {
            try {
                res.push(JSON.parse(cmd));
            } catch (e) {
                res.push(cmd);
            }
        }
    }, defs);
}

const projectHash = {};
function formatProject(item) {
    projectHash[item.id] = item;
    item.init = configCommandsToString(item.init, defInit);
    item.test = configCommandsToString(item.test, defTest);
    item.deploy = configCommandsToString(item.deploy, defDeploy);
    item.reload = configCommandsToString(item.reload, defReload);
    item.server_credentials = configObjectToString(item.server_credentials, defCredentials);
    item.directory = configObjectToString(item.directory, defDirectory);
    return item;
}

async function get(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    const rData = await loader.json('/api/projects/get', {
        method: 'POST',
        data: sData
    });
    return postgres.toArray(rData, formatProject);
}

async function update(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate }, data);
    sData.init = stringToCommands(sData.init, defInitStr);
    sData.test = stringToCommands(sData.test, defTestStr);
    sData.deploy = stringToCommands(sData.deploy, defDeployStr);
    sData.reload = stringToCommands(sData.reload, defReloadStr);
    sData.server_credentials = objectFromString(sData.server_credentials, defCredentialsStr);
    sData.directory = objectFromString(sData.directory, defDirectoryStr);

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
    const rData = await loader.json('/api/projects', {
        method: 'POST',
        data: sData
    });
    const item = rData.rows[0];
    return formatProject(item);
}

async function remove(data) {
    const currentUser = await raintechAuth.check();
    const sData = Object.assign({ certificate: currentUser.certificate }, data);
    await loader.json('/api/projects', {
        method: 'DELETE',
        data: sData
    });
}

function createConfig() {

}

function deleteConfig() {

}

export default {
    get: get,
    update: update,
    execute: execute,
    create: create,
    delete: remove,
    createConfig: createConfig,
    deleteConfig: deleteConfig,
    hash: projectHash,
    Exception: ProjectException
}