import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import location from '/scripts/services/location.js';
import raintechAuth from '/scripts/services/raintechAuth.js';

loader.application('projectList', [async () => {
    function setActive(vm) {
        const search = location.getSearch();
        vm.active = search.project;
    }

    function init(obj) {
        return {
            projects: obj.projects,
            errors: obj.errors,
            active: null
        }
    }

    async function get(vm) {
        vm.errors = null;
        try {
            vm.projects = await projects.get();
            vm.errors = null;
        } catch (e) {
            vm.projects = null;
            vm.errors = e;
        }
    }

    const initObj = {};
    await get(initObj);
    await loader.createVueTemplate({ path: '/pages/projectList.html', id: 'ProjectList-Template' });
    const res = {};
    res.Constructor = Vue.component('projectList', {
        template: '#ProjectList-Template',
        data: function () {
            const obj = init(initObj);
            setActive(obj);
            return obj;
        },
        watch:{
            $route (to){
                setActive(this);
            }
        },
        mounted: function () {
            raintechAuth.onUserChanged(() => {
                get(this);
            })
        }
    });
    return res;
}]);

