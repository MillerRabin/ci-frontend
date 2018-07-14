import loader from '/scripts/loader.js';
import messages from '/scripts/services/messages.js'

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

    function show(vm, tab = 0) {
        vm.isVisible = true;
        vm.tab = tab;
        messages.send('popup.show');
    }

    function hide(vm) {
        vm.isVisible = false;
        messages.send('popup.close');
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
               show(this, 0);
            },
            signup: function () {
                show(this, 1);
            },
            close: function () {
                hide(this);
            },
            restore: function () {

            }
        }
    });
    return res;
}]);

