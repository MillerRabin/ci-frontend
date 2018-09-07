import loader from '/scripts/loader.js';
import '/scripts/applications/router.js';
import '/scripts/applications/auth.js';
import raintechAuth from '/scripts/services/raintechAuth.js';
import projects from '/scripts/services/projects.js';

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
                    await projects.create({
                        project_name: this.project_name
                    });
                    this.disabled = false;
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