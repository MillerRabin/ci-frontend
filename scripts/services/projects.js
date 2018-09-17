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

/*const defCredentials = {
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
};*/

/*const defCredentialsStr = objectToString(defCredentials);
const defDirectoryStr = objectToString(defDirectory);
const defInitStr = commandsToString(defInit);
const defTestStr = commandsToString(defTest);
const defDeployStr = commandsToString(defDeploy);
const defReloadStr = commandsToString(defReload);*/

const projectHash = {};
function formatProject(item) {
    projectHash[item.id] = item;
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
    const res = await loader.json('/api/git/manual', {
        method: 'POST',
        data: sData
    });
    return res.message;
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

function createConfig(project, name) {
    if (safe.isEmpty(name)) throw new ProjectException({ message: 'Configuration name can`t be empty'});
    const eConfig = project.project_data.find(v => v.name == name);
    if (eConfig != null) throw new ProjectException({ message: `Configuration ${name} already exists`});
    project.project_data.push({
       name: name,
       credentials: '',
       directory: '',
       test: '',
       init: '',
       deploy: '',
       reload: ''
    });
}

function renameConfig(config, name) {
    if (safe.isEmpty(name)) throw new ProjectException({ message: 'Configuration name can`t be empty'});
    config.name = name;
}

function removeConfig(project, name) {
    if (safe.isEmpty(name)) throw new ProjectException({ message: 'Configuration name can`t be empty'});
    if (project.project_data.length == 1) throw new ProjectException({ message: "You can't delete single configuration"});
    const eConfigIndex = project.project_data.findIndex(v => v.name == name);
    if (eConfigIndex == -1) throw new ProjectException({ message: "Invalid configuration name"});
    project.project_data.slice(eConfigIndex, 1);
    return eConfigIndex;
}

export default {
    get: get,
    update: update,
    execute: execute,
    create: create,
    renameConfig: renameConfig,
    removeConfig: removeConfig,
    delete: remove,
    hash: projectHash,
    createConfig: createConfig,
    Exception: ProjectException
}