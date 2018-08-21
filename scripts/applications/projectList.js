import loader from '/scripts/loader.js';

loader.application('projectList', [async () => {
    function init() {
        return {}
    }

    await loader.createVueTemplate({ path: '/pages/projectList.html', id: 'ProjectList-Template' });
    const res = {};
    res.Constructor = Vue.component('projectList', {
        template: '#ProjectList-Template',
        data: function () {
            return init();
        }
    });
    return res;
}]);

