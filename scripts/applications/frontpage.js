import loader from '/scripts/loader.js';
loader.application('frontpage', [async () => {
    await loader.createVueTemplate({ path: '/pages/frontpage.html', id: 'FrontPage-Template' });
    const data =  {};
    const res = {};
    res.Constructor = Vue.component('frontpage', {
        template: '#FrontPage-Template',
        data: function () {
            return data;
        }
    });
    return res;
}]);

