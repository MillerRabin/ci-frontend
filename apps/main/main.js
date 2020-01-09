import loader from '/node_modules/async-content-loader/main.js';
import router from '/node_modules/es-class-router/main.js';
import routeTables from './routeTables.js';
import '/apps/Auth/Auth.js';
import raintechAuth from '/apps/raintechAuth/raintechAuth.js';
import projects from '/apps/projects/projects.js';
import projectList from '/apps/ProjectList/ProjectList.js';

/*    const data = {
        loaded: false,
        dialog: null,
        project_name: '',
        disabled: false,
        errors: {}
    };

    function show(vm) {
        vm.project_name = '';
        Vue.set(vm, 'errors', {});
        vm.dialog.showModal();
    }

    function hide(vm) {
        vm.dialog.close();
    }

    data.application = new Vue({
        el: '#CI',
        router: router,
        data: data,
        methods: {
            showDialog: function () {
                show(this);
            },
            closeDialog: function () {
                hide(this);
            },
            create: async function () {
                this.errors = {};
                this.disabled = true;
                try {
                    const newProject = await projects.create({
                        project_name: this.project_name
                    });
                    this.disabled = false;
                    this.closeDialog();
                    projectList.reload();
                    this.$router.push({ path: `/?project=${newProject.id}` });

                } catch (e) {
                    console.log(e);
                    this.errors = e;
                    this.disabled = false;
                }
            }

        },
        mounted: async function () {
            try {
                this.dialog = this.$el.querySelector('dialog');
                await raintechAuth.check();
                this.loaded = true;
            } catch (e) {
                this.loaded = false;
            }

            raintechAuth.onUserChanged((user) => {
                if (user == null) {
                    this.loaded = false;
                    return;
                }
                this.loaded = true;
            });
        }
    });

    return data;
}]);*/

async function render(main) {
    router.mount = main.mount.querySelector('#Router');
    router.routes = routeTables;
}

class Main {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }
}

loader.globalContentLoaded.then(() => {
   new Main(window.document.body);
});