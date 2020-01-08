import loader from '/core/loader.js'
import raintechAuth from '/node_modules/raintech-auth-client/main.js';
import postgres from '/apps/postgres/postgres.js';
import safe from '/core/safe.js';

class ProjectException extends Error {
    constructor(object) {
        super();
        Object.assign(this, object);
    }
}

const defConfig = {
    name: 'main'
};

const projectHash = {};
function formatProject(item) {
    projectHash[item.id] = item;
    if (item.project_data == null) item.project_data = [defConfig];
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