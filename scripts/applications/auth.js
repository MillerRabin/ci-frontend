import loader from '/scripts/loader.js';
import messages from '/scripts/services/messages.js'
import raintechAuth from '/scripts/services/raintechAuth.js'

loader.application('auth', [async () => {
    function init() {
        return {
            dialog: null,
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
        vm.email = '';
        vm.password = '';
        vm.newPassword = '';
        vm.confirmPassword = '';
        vm.errors = {};
        vm.agree = true;
        vm.dialog.showModal();
        vm.tab = tab;
        messages.send('popup.show');
    }

    function hide(vm) {
        vm.dialog.close();
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
            loginDialog: function () {
               show(this, 0);
            },
            signupDialog: function () {
                show(this, 1);
            },
            closeDialog: function () {
                hide(this);
            },
            restore: async function () {
                this.errors = {};
                try {
                    await raintechAuth.restore({ email: this.email });
                } catch (e) {
                    this.errors = e;
                }

            },
            signup: function () {
                return raintechAuth.signup({
                    email: this.email,
                    password: this.newPassword
                });
            },
            login: function () {
                return raintechAuth.login({
                    loginOrEmail: this.email,
                    password: this.password
                });
            }
        },
        mounted: function () {
            this.dialog = this.$el.querySelector('dialog');
        }
    });
    return res;
}]);

