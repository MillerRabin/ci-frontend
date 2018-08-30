import loader from '/scripts/loader.js';

loader.application('breadcrumbs', [async () => {
    function init() {
        return {};
    }

    await loader.createVueTemplate({ path: '/pages/breadcrumbs.html', id: 'Breadcrumbs-Template' });
    const res = {};
    res.Constructor = Vue.component('breadcrumbs', {
        template: '#Breadcrumbs-Template',
        data: function () {
            return init;
        }
    });

    return res;
}]);
