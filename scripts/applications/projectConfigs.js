import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';
import location from '/scripts/services/location.js';

loader.application('projectConfigs', [async () => {
    function init() {
        return {
            editorHash: editorHash,
            defaults: defaults,
            active: null
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
        }
    });
    return res;
}]);

