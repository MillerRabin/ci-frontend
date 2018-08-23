import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';
import postgres from '/scripts/services/postgres.js';

async function get() {
    await raintechAuth.check();
    const rData = await loader.json('/api/projects/get', {
        method: 'POST',
        data: {
            certificate: raintechAuth.currentUser.certificate
        }
    });
    return postgres.toArray(rData);
}

export default {
    get: get
}