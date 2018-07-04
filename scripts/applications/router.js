import loader from '/scripts/loader.js';
import '/scripts/applications/frontpage.js';

loader.application('router', ['frontpage', async (frontpage) => {
    const routes = [
        { path: '/', component: frontpage.Constructor }
    ];

    return new VueRouter({
        mode: 'history',
        routes: routes
    });
}]);
