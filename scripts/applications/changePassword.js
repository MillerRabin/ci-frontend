import loader from '/scripts/loader.js';
import raintechAuth from '/scripts/services/raintechAuth.js';

loader.application('changePassword', [async () => {
    await loader.createVueTemplate({ path: '/pages/changePassword.html', id: 'ChangePassword-Template' });
    const res = {};
    res.data =  {
        email: '',
        errors: {},
        newPassword: '',
        confirmPassword: '',
        cert: null
    };
    try {
        res.data.cert = await raintechAuth.check();
    } catch (e) {
        res.data.cert = null;
        res.data.errors = e;
    }


    res.Constructor = Vue.component('changePassword', {
        template: '#ChangePassword-Template',
        data: function () {
            return res.data;
        },
        methods: {
            change: function () {

            }
        }
    });
    return res;
}]);

