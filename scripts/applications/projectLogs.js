import loader from '/scripts/loader.js';

loader.application('projectLogs', [async () => {
    function init() {
        return {}
    }

    await loader.createVueTemplate({ path: '/pages/projectLogs.html', id: 'ProjectLogs-Template' });
    const res = {};
    res.Constructor = Vue.component('projectLogs', {
        template: '#ProjectLogs-Template',
        data: function () {
            return init();
        }
    });
    return res;
}]);

