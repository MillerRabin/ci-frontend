import loader from '/core/loader.js';
import '/apps/router/router.js';
import '/apps/auth/auth.js';
import raintechAuth from '/node_modules/raintech-auth-client/main.js';
import projects from '/apps/projects/projects.js';
import projectList from '/apps/projectList/projectList.js';

loader.application('Main', ['router', 'auth', async (router) => {
    const data = {
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
}]);