import loader from '/scripts/loader.js';
import '/scripts/applications/router.js';

loader.application('Main', ['router', async (router) => {
    const data = {
        isFload: false
    };

    return new Vue({
        el: '#CI',
        router: router,
        data: data
    });
}]);