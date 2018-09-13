import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import location from '/scripts/services/location.js';
import raintechAuth from '/scripts/services/raintechAuth.js';
import projectList from '/scripts/applications/projectList.js';
import safe from '/scripts/services/safe.js';

loader.application('projectConfigs', [async () => {
    function init() {
        return {
            editorHash: editorHash,
            defaults: defaults,
            active: null,
            message: null,
            disabled: false,
            removeDialog: null,
            configurationDialog: null,
            deleteMessage: '',
            configurationName: '',
            errors: {}
        }
    }

    function getConfigs(project) {
        return Object.keys(project.project_data);
    }

    async function getProject(vm) {
        const query = location.getSearch();
        if (query.project == null) return null;
        const pData = await projects.get({ id: query.project });
        Vue.set(vm, 'active', query.project);
        const cp = pData[0];
        const configs = getConfigs(cp);
        if (vm.editorHash[cp.id] == null)
            Vue.set(vm.editorHash, cp.id, Object.assign({ currentConfig: configs[0], configs: configs }, cp));
        vm.defaults[cp.id] = Object.assign({}, cp);
    }

    function getDefaults(vm) {
        const index = (vm.active == null) ? location.getSearch().project : vm.active;
        if (index == null) return null;
        return vm.defaults[index];
    }

    await loader.createVueTemplate({ path: '/pages/projectConfigs.html', id: 'ProjectConfigs-Template' });
    const res = {};
    const editorHash = {};
    const defaults = {};

    res.Constructor = Vue.component('projectConfigs', {
        template: '#ProjectConfigs-Template',
        methods: {
            update: async function () {
                this.disabled = true;
                try {
                    this.message = await projects.update(this.current);
                    this.disabled = false;
                } catch (e) {
                    console.log(e);
                    this.disabled = false;
                }

            },
            execute: async function () {
                this.disabled = true;
                try {
                    this.message = await projects.execute(this.current);
                    this.disabled = false;
                } catch (e) {
                    console.log(e);
                    this.disabled = false;
                }
            },
            remove: async function () {
                Vue.set(this, 'errors', {});
                this.disabled = true;
                try {
                    this.message = await projects.delete(this.current);
                    this.disabled = false;
                    projectList.reload();
                    this.hideRemoveDialog();
                    this.$router.push({path: '/', params: {} });
                } catch (e) {
                    console.log(e);
                    Vue.set(this, 'errors', e);
                    this.disabled = false;
                }
            },
            showRemoveDialog: function () {
                const defs = getDefaults(this);
                this.deleteMessage = defs.project_name;
                this.removeDialog.showModal();
            },
            hideDialog: function () {
                this.removeDialog.close();
                this.configurationDialog.close();
            },
            cancel: function () {

            },
            newConfigurationDialog: function () {
                this.configurationName = '';
                this.configurationDialog.showModal();
            },
            newConfiguration: function () {
                Vue.set(this,'errors', {});
                this.disabled = true;
                try {
                    projects.createConfig(this.current, this.configurationName);
                    this.current.configs = getConfigs(this.current);
                    this.hideDialog();
                } catch (e) {
                    Vue.set(this,'errors', e);
                }
                this.disabled = false;
            },
            setActiveTab: function (tab) {
                this.current.currentConfig = tab;
            }
        },
        computed: {
            current: function () {
                if (this.active == null) return null;
                return this.editorHash[this.active];
            },
            currentData: function () {
                if (this.current == null) return null;
                return current.project_data[current.currentConfig];
            }
        },
        watch:{
            $route (){
                getProject(this);
            }
        },
        data: function () {
            return init();
        },
        mounted: function () {
            this.removeDialog = this.$el.querySelector('.removeDialog');
            this.configurationDialog = this.$el.querySelector('.configurationDialog');
            raintechAuth.onUserChanged(() => {
                getProject(this);
            });
        }
    });
    return res;
}]);

