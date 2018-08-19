import loader from '/scripts/loader.js';
import config from '/scripts/services/config.js';
import safe from '/scripts/services/safe.js';
import location from '/scripts/services/location.js';


class RaintechAuthException extends Error {
    constructor(object) {
        super();
        Object.assign(this, object);
    }
}

function saveCertificate(cert) {
    window.localStorage['raintech-auth'] = cert;
}

async function login(data) {
    data.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/login/bypassword', {
        method: 'POST',
        data: data
    });
    saveCertificate(rData.certificate);
    return rData;
}

async function signup(data) {
    data.referer = config.referer;
    const rData =  await loader.json(config.authPath + '/api/users/signup/bypassword', {
        method: 'POST',
        data: data
    });
    saveCertificate(rData.certificate);
    return rData
}

async function restore(data) {
    if (safe.isEmpty(data.email)) throw { email: 'Please, specify your email' };
    data.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/changepassword/byemail', {
        method: 'POST',
        data: data
    });
    saveCertificate(rData.certificate);
    return rData
}

async function update(data) {
    data.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/changepassword/byemail', {
        method: 'POST',
        data: data
    });
    saveCertificate(rData.certificate);
    return rData
}

async function check() {
    const search = location.getSearch();
    if (!safe.isEmpty(search.cert)) {
        return await login({ certificate: search.cert});
    }
    const cert = (safe.isEmpty(search.cert)) ? window.localStorage['raintech-auth'] : search.cert;
    if (cert == null) throw new RaintechAuthException({ text: 'User is not authorized'});
    return cert;
}

export default {
    login: login,
    signup: signup,
    restore: restore,
    check: check,
    update: update
};
