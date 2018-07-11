import loader from '/scripts/loader.js';

loader.application('auth', [async () => {
    function init() {
        return {
            isVisible: false,
            tab: 0,
            email: '',
            password: '',
            newPassword: '',
            confirmPassword: '',
            errors: {},
            agree: true
        }
    }

    await loader.createVueTemplate({ path: '/pages/auth.html', id: 'Auth-Template' });
    const res = {};
    res.Constructor = Vue.component('auth', {
        template: '#Auth-Template',
        data: function () {
            return init();
        },
        methods: {
            login: function () {
                this.isVisible = true;
                this.tab = 0;
            },
            signup: function () {
                this.isVisible = true;
                this.tab = 1;
            }
        }
    });
    return res;
}]);

