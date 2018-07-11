import loader from '/scripts/loader.js';
import '/scripts/applications/router.js';
import '/scripts/applications/auth.js';

loader.application('Main', ['router', 'auth', async (router) => {
    const data = {
        isFloat: false
    };

    return new Vue({
        el: '#CI',
        router: router,
        data: data
    });
}]);