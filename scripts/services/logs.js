import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';

async function get(data) {
    await raintechAuth.check();
    const sData = Object.assign({ certificate: raintechAuth.currentUser.certificate}, data);
    const rData = await loader.json('/api/logs', {
        method: 'POST',
        data: sData
    });
    return postgres.toArray(rData);
}

export default {
    get: get
}