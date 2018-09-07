import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import location from '/scripts/services/location.js';
import raintechAuth from '/scripts/services/raintechAuth.js';

loader.application('projectConfigs', [async () => {
    function init() {
        return {
            editorHash: editorHash,
            defaults: defaults,
            active: null,
            message: null,
            disabled: false
        }
    }

    const editorHash = {};
    const defaults = {};

    async function getProject(vm) {
        const query = location.getSearch();
        if (query.project == null) return null;
        Vue.set(vm, 'active', query.project);
        const pData = await projects.get({ id: query.project });
        const cp = pData[0];
        if (vm.editorHash[cp.id] == null)
            Vue.set(vm.editorHash, cp.id, cp);
        vm.defaults[cp.id] = Object.assign({}, cp);
    }

    await loader.createVueTemplate({ path: '/pages/projectConfigs.html', id: 'ProjectConfigs-Template' });
    const res = {};
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
                this.disabled = true;
                try {
                    this.message = await projects.delete(this.current);
                    this.disabled = false;
                } catch (e) {
                    console.log(e);
                    this.disabled = false;
                }
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
            getProject(this);
            raintechAuth.onUserChanged(() => {
                getProject(this);
            });

        }
    });
    return res;
}]);

