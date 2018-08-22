import loader from '/scripts/loader.js';
import projects from '/scripts/services/projects.js';

loader.application('projectList', [async () => {
    function init() {
        return {}
    }

    try {
        const prj = await projects.get();
        console.log(prj);
    } catch (e) {
        console.log(e);
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

