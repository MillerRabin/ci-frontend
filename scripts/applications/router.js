import loader from '/scripts/loader.js';
import '/scripts/applications/frontpage.js';
import '/scripts/applications/changePassword.js';

loader.application('router', ['frontpage', 'changePassword', async (frontpage, changePassword) => {
    const routes = [
        { path: '/', component: frontpage.Constructor },
        { path: '/changePassword.html', component: changePassword.Constructor }
    ];

    return new VueRouter({
        mode: 'history',
        routes: routes
    });
}]);
