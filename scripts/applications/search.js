import loader from '/scripts/loader.js';

loader.application('search', [async () => {
    function init() {
        return {};
    }

    await loader.createVueTemplate({ path: '/pages/search.html', id: 'Search-Template' });
    const res = {};

    res.Constructor = Vue.component('search', {
        template: '#Search-Template',
        data: function () {
            return init;
        }
    });

    return res;
}]);

