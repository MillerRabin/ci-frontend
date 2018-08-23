import loader from '/scripts/loader.js';

loader.application('projectConfigs', [async () => {
    function init() {
        return {}
    }

    await loader.createVueTemplate({ path: '/pages/projectConfigs.html', id: 'ProjectConfigs-Template' });
    const res = {};
    res.Constructor = Vue.component('projectConfigs', {
        template: '#ProjectConfigs-Template',
        data: function () {
            return init();
        }
    });
    return res;
}]);

