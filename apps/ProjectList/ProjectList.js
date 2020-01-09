import loader from '/node_modules/async-content-loader/main.js';
import projects from '/apps/projects/projects.js';
import location from '/node_modules/location-browser/main.js';
import raintechAuth from '/apps/raintechAuth/raintechAuth.js';
import messages from '/node_modules/browser-messages/main.js';


/*    function setActive(vm) {
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


function reload() {
    messages.send('projects.reload');
}*/

const gTemplateP = loader.request(`/apps/ProjectList/ProjectList.html`);

async function render(projectList) {
    const template = await gTemplateP;
    projectList._mount.innerHTML = template.text;
}


export default class ProjectList {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }
}

