import loader from '/scripts/loader.js';
import config from '/scripts/services/config.js';
import safe from '/scripts/services/safe.js';
import location from '/scripts/services/location.js';

const currentUser = {};

class RaintechAuthException extends Error {
    constructor(object) {
        super();
        Object.assign(this, object);
    }
}

function saveCertificate(cert) {
    window.localStorage['raintech-auth'] = cert;
}

function clearCurrentUser() {
    for (let key in currentUser) {
        if (!currentUser.hasOwnProperty(key)) continue;
        delete currentUser[key];
    }
}

function rewriteCurrentUser(data) {
    clearCurrentUser();
    for (let key in data.user) {
        if (!data.user.hasOwnProperty(key)) continue;
        currentUser[key] = data.user[key];
    }
    currentUser.certificate = data.certificate;
}

async function getCurrentUser() {
    if (currentUser.certificate != null) return currentUser.certificate;
    const search = location.getSearch();
    const cert = (safe.isEmpty(search.cert)) ? window.localStorage['raintech-auth'] : search.cert;
    if (cert == null) {
        clearCurrentUser();
        return;
    }
    await login({ certificate: cert});
    return currentUser;
}

function clearCertificate() {
    return window.localStorage.removeItem('raintech-auth');
}

async function login(data) {
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/login/bypassword', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData;
}

async function logout() {
    const rData = await loader.json(config.authPath + '/api/users/logout', {
        method: 'GET'
    });
    clearCertificate();
    clearCurrentUser();
    return rData;
}

async function signup(data) {
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData =  await loader.json(config.authPath + '/api/users/signup/bypassword', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData
}

async function restore(data) {
    if (safe.isEmpty(data.email)) throw { email: 'Please, specify your email' };
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/changepassword/byemail', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData
}

async function update(data) {
    const sData = Object.assign(data);
    sData.referer = config.referer;
    sData.certificate = getCertificate();
    return await loader.json(config.authPath + '/api/users', {
        method: 'PUT',
        data: sData
    });
}

async function check() {
    const cert = await getCurrentUser();
    if (cert == null) throw new RaintechAuthException({ text: 'User is not authorized'});
    return cert;
}

export default {
    login: login,
    logout: logout,
    signup: signup,
    restore: restore,
    check: check,
    update: update,
    currentUser: currentUser
};
