import loader from '/core/loader.js';
import '/apps/projectList/projectList.js';
import '/apps/projectConfigs/projectConfigs.js';
import '/apps/projectLogs/projectLogs.js';
import '/apps/auth/auth.js';
import location from '/core/location.js';
import raintechAuth from '/node_modules/raintech-auth-client/main.js';

loader.application('frontpage', ['auth', 'projectList', 'projectConfigs', 'projectLogs', async (auth) => {
    function init() {
        return {
            showConfigs: false,
            showError: false,
            loaded: false
        }
    }

    function showConfigs(vm) {
        const search = location.getSearch();
        vm.showConfigs = (search.project != null);
    }

    async function checkUser(vm) {
        try {
            await raintechAuth.check();
            vm.showError = false;
        } catch (e) {
            vm.showError = true;
        }
        vm.loaded = true;
    }

    await loader.createVueTemplate({ path: '/pages/frontpage.html', id: 'FrontPage-Template' });
    const res = {};
    res.Constructor = Vue.component('frontpage', {
        template: '#FrontPage-Template',
        data: init,
        watch:{
            $route (to){
                showConfigs(this);
            }
        },
        methods: {
            login: function () {
                auth.login();
            },
            signup: function () {
                auth.signup();
            }
        },
        mounted: function () {
            showConfigs(this);
            checkUser(this);
            raintechAuth.onUserChanged(() => {
                checkUser(this);
            });
        }
    });
    return res;
}]);

