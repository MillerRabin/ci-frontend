import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import location from '/scripts/services/location.js';
import raintechAuth from '/scripts/services/raintechAuth.js';
import messages from '/scripts/services/messages.js';

loader.application('projectList', [async () => {
    function setActive(vm) {
        const search = location.getSearch();
        vm.active = search.project;
    }

    function init() {
        return {
            projects: [],
            errors: {},
            active: null
        }
    }

    async function get(vm) {
        vm.errors = null;
        try {
            Vue.set(vm, 'projects', await projects.get());
            Vue.set(vm, 'errors',  null);
        } catch (e) {
            Vue.set(vm, 'projects', null);
            Vue.set(vm, 'errors',  e);
        }
    }


    await loader.createVueTemplate({ path: '/pages/projectList.html', id: 'ProjectList-Template' });
    const Constructor = Vue.component('projectList', {
        template: '#ProjectList-Template',
        data: function () {
            const obj = init();
            setActive(obj);
            return obj;
        },
        watch:{
            $route (){
                setActive(this);
            }
        },
        mounted: function () {
            const reload = async () => {
                await get(this);
            };
            reload();
            raintechAuth.onUserChanged(reload);
            messages.on('projects.reload', reload);
        }
    });

    return {
        Constructor: Constructor,
    };
}]);

function reload() {
    messages.send('projects.reload');
}

export default {
    reload: reload
}


