import loader from '/scripts/loader.js';
import config from '/scripts/services/config.js';

function login(data) {
    return loader.json(config.authPath + '/api/users/login/bypassword', {
        method: 'POST',
        data: data
    });
}

function signup(data) {
    return loader.json(config.authPath + '/api/users/signup/bypassword', {
        method: 'POST',
        data: data
    });
}

export default {
    login: login,
    signup: signup
};
