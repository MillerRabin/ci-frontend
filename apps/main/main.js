import loader from '/node_modules/async-content-loader/main.js';
import router from '/node_modules/es-class-router/main.js';
import routeTables from './routeTables.js';
import raintechAuth from '/apps/raintechAuth/raintechAuth.js';
import projects from '/apps/projects/projects.js';
import projectList from '/apps/ProjectList/ProjectList.js';
import Header from '../Header/Header.js'

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
        mounted:
    });

    return data;
}]);*/

async function init(main) {
    try {
        await raintechAuth.check();
        main.loaded = true;
    } catch (e) {
        main.loaded = false;
    }

    raintechAuth.onUserChanged((user) => {
        if (user == null) {
            main.loaded = false;
            return;
        }
        main.loaded = true;
    });
}

async function render(main) {
    router.mount = main.mount.querySelector('#Router');
    router.routes = routeTables;
    const headerM = main.mount.querySelector('#Header_Container');
    main._header = new Header(headerM);
    await init(main);
}

class Main {
    constructor(mount) {
        router.application = this;
        this._mount = mount;
        this._dialog = this._mount.querySelector('dialog');
        this._header = null;
        render(this);
    }

    get mount() {
        return this._mount;
    }

    get loaded() {
        return this._mount.classList.contains('loaded');
    }

    set loaded(value) {
        if (value) {
            this._mount.classList.add('loaded');
            return;
        }
        this._mount.classList.remove('loaded');
    }

    get header() {
        return this._header;
    }
}

loader.globalContentLoaded.then(() => {
    const mount = window.document.getElementById('CI');
    new Main(mount);
});