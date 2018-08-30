import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import messages from '/scripts/services/messages.js';
import location from '/scripts/services/location.js';

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
            messages.on('user.changed', () => {
                get(this);
            })
        }
    });
    return res;
}]);

