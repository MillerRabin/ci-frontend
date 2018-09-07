import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';
import projects from '/scripts/services/projects.js';

function getBranchFromRepository(item) {
    const push = (item.event_data.request == null) ? item.event_data.push : item.event_data.request.push;
    if (push == null) return null;
    const pushChanges = push.changes[0];
    if (pushChanges == null) return null;
    return pushChanges.new.name;
}

function getBranchFromProject(item) {
    const project = item.event_data.project;
    if (project == null) return null;
    return project.branch;
}

function getProjectFromHash(id) {
    const project = projects.hash[id];
    if (project == null) return null;
    return project.project_name;
}

async function get(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate}, data);
    const rData = await loader.json('/api/logs', {
        method: 'POST',
        data: sData
    });
    return postgres.toArray(rData, (item) => {
        if (item.event_data == null) {
            item.project_name = 'not specified';
            item.branch = 'not specified';
            return;
        }
        const repository = (item.event_data.request != null) ? item.event_data.request.repository : item.event_data.repository;
        item.project_name = (repository != null) ? repository.full_name :
                            (item.event_data.project != null) ? item.event_data.project.project_name :
                            (item.event_data.id != null) ? getProjectFromHash(item.event_data.id) : null;
        let branch = getBranchFromRepository(item);
        branch = (branch == null) ? getBranchFromProject(item) : branch;
        branch = (branch == null) ? 'not specified' : branch;
        item.branch = branch;
    });
}

export default {
    get: get
}