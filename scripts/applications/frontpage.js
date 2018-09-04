import loader from '/scripts/loader.js';
import '/scripts/applications/projectList.js';
import '/scripts/applications/projectConfigs.js';
import '/scripts/applications/projectLogs.js';
import location from '/scripts/services/location.js';

loader.application('frontpage', ['projectList', 'projectConfigs', 'projectLogs', async () => {
    function init() {
        return {
            showConfigs: false
        }
    }

    function showConfigs(vm) {
        const search = location.getSearch();
        vm.showConfigs = (search.project != null);
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
        mounted: function () {
            showConfigs(this);
        }
    });
    return res;
}]);

