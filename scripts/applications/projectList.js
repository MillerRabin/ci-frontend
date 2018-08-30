import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import messages from '/scripts/services/messages.js';

loader.application('projectList', [async () => {
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
            return init(initObj);
        },
        mounted: function () {
            messages.on('user.changed', () => {
                get(this);
            })
        }
    });
    return res;
}]);

