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
            rmDialog: null,
            rmConfigurationDialog: null,
            configurationDialog: null,
            renameDialog: null,
            deleteMessage: '',
            configurationName: '',
            errors: {}
        }
    }

    function mapConfigs(configs, iterateFunc) {
        function iterateConfigs(configs) {
            const res = {};
            for (let key in configs) {
                if (!configs.hasOwnProperty(key)) continue;
                res[key] = iterateFunc(configs[key], key);
            }
            return res;
        }

        const res = [];
        for (let conf of configs) {
            if (conf == null) continue;
            if (safe.isEmpty(conf.name)) continue;
            if (typeof(conf) == 'string') {
                res.push(conf);
                continue;
            }
            res.push(iterateConfigs(conf));

        }
        return res;
    }

    function objectToString(obj) {
        const res = [];
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            res.push(`${key}: ${obj[key]}`);
        }
        return res.join('\n');
    }

    function commandsToString(commands) {
        const res = [];
        if (typeof(commands) == 'string') return commands;
        if (!Array.isArray(commands)) return objectToString(commands);
        for (let cmd of commands) {
            if (typeof(cmd) == 'object') {
                res.push(JSON.stringify(cmd));
                continue;
            }
            res.push(cmd);
        }
        return res.join('\n');
    }

    function stringToObject(str) {
        const obj = {};
        const lines = str.split('\n');
        for (let line of lines) {
            const [key, value] = line.split(':');
            if (value == null) continue;
            obj[key.trim()] = value.trim();
        }
        return obj;
    }

    function configCommandsToString(projectData) {
        return mapConfigs(projectData, commandsToString);
    }

    function configStringToCommands(projectData, objects, strings) {
        return mapConfigs(projectData, (text, key) => {
            if (safe.isEmpty(text)) return null;
            if (strings.includes(key))
                return text;
            if (objects.includes(key))
                return stringToObject(text);
            const res = [];
            const commands = text.split('\n');

            for (let cmd of commands) {
                try {
                    res.push(JSON.parse(cmd));
                } catch (e) {
                    res.push(cmd);
                }
            }
            return res;
        });
    }

    function createEditor(currentProject) {
        const projectData = configCommandsToString(currentProject.project_data);
        const editor = Object.assign({}, currentProject);
        editor.project_data = projectData;
        editor.currentConfig = projectData[0];
        return editor;
    }

    function applyEditor(vm, currentProject) {
        const projectData = configStringToCommands(currentProject.project_data, ['credentials'], ['name', 'directory']);
        const defs = vm.defaults[vm.active];
        defs.project_data = projectData;
        defs.branch = currentProject.branch;
        defs.project_name = currentProject.project_name;
        return defs;
    }

    async function getProject(vm) {
        const query = location.getSearch();
        if (query.project == null) return null;
        const pData = await projects.get({ id: query.project });
        Vue.set(vm, 'active', query.project);
        const cp = pData[0];
        const editor = createEditor(cp);
        if (vm.editorHash[cp.id] == null)
            Vue.set(vm.editorHash, cp.id, editor);
        vm.defaults[cp.id] = cp;
    }

    await loader.createVueTemplate({ path: '/pages/projectConfigs.html', id: 'ProjectConfigs-Template' });
    const res = {};
    const editorHash = {};
    const defaults = {};

    res.Constructor = Vue.component('projectConfigs', {
        template: '#ProjectConfigs-Template',
        methods: {
            update: async function () {
                Vue.set(this, 'errors', {});
                this.message = '';
                this.disabled = true;
                try {
                    const project = applyEditor(this, this.current);
                    this.message = await projects.update(project);
                    this.disabled = false;
                } catch (e) {
                    console.log(e);
                    Vue.set(this, 'errors', e);
                    this.disabled = false;
                }

            },
            execute: async function () {
                Vue.set(this, 'errors', {});
                this.message = '';
                this.disabled = true;
                try {
                    const project = applyEditor(this, this.current);
                    this.message = await projects.execute(project);
                    this.disabled = false;
                } catch (e) {
                    Vue.set(this, 'errors', e);
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
                    this.hideDialog();
                    this.$router.push({path: '/', params: {} });
                } catch (e) {
                    console.log(e);
                    Vue.set(this, 'errors', e);
                    this.disabled = false;
                }
            },
            removeDialog: function () {
                const defs = this.defaults[this.active];
                this.deleteMessage = defs.project_name;
                this.rmDialog.showModal();
            },
            removeConfigurationDialog: function () {
                this.deleteMessage = this.current.currentConfig.name;
                this.rmConfigurationDialog.showModal();
            },
            removeConfiguration: function () {
                Vue.set(this,'errors', {});
                this.disabled = true;
                try {
                    const currentTab = this.current.currentConfig;
                    projects.removeConfig(this.current, currentTab.name);
                    this.hideDialog();
                } catch (e) {
                    Vue.set(this,'errors', e);
                }
                this.disabled = false;
            },
            hideDialog: function () {
                this.rmDialog.close();
                this.rmConfigurationDialog.close();
                this.configurationDialog.close();
                this.renameDialog.close();
            },
            cancel: function () {
                const defaults = this.defaults[this.active];
                const editor = createEditor(defaults);
                Vue.set(this.editorHash, defaults.id, editor);
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
                    this.hideDialog();
                } catch (e) {
                    Vue.set(this,'errors', e);
                }
                this.disabled = false;
            },
            renameConfigurationDialog: function () {
                this.configurationName = '';
                this.renameDialog.showModal();
            },
            renameConfiguration: function () {
                Vue.set(this,'errors', {});
                this.disabled = true;
                try {
                    const currentTab = this.current.currentConfig;
                    projects.renameConfig(currentTab, this.configurationName);
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
            this.rmDialog = this.$el.querySelector('.removeDialog');
            this.configurationDialog = this.$el.querySelector('.configurationDialog');
            this.renameDialog = this.$el.querySelector('.renameDialog');
            this.rmConfigurationDialog = this.$el.querySelector('.removeConfigurationDialog');
            raintechAuth.onUserChanged(() => {
                getProject(this);
            });
        }
    });
    return res;
}]);

