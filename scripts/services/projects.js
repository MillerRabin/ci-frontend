import loader from '/scripts/loader.js'
import raintechAuth from '/scripts/services/raintechAuth.js';

async function get() {
    await raintechAuth.check();
    return await loader.json('/api/projects/get', {
        method: 'POST',
        data: {
            certificate: raintechAuth.currentUser.certificate
        }
    });
}

export default {
    get: get
}