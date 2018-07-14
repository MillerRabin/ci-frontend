import loader from '/scripts/loader.js';
import messages from '/scripts/services/messages.js';
import '/scripts/applications/router.js';
import '/scripts/applications/auth.js';

loader.application('Main', ['router', 'auth', async (router) => {
    const data = {
        disabled: false
    };

    const app = new Vue({
        el: '#CI',
        router: router,
        data: data
    });

    messages.on('popup.show', () => {
       app.disabled = true;
    });

    messages.on('popup.close', () => {
        app.disabled = false;
    });

    return app;
}]);