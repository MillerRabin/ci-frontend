import loader from '/scripts/loader.js';
import '/scripts/applications/projectList.js';

loader.application('frontpage', ['projectList', async () => {
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

