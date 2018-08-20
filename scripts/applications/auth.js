import loader from '/scripts/loader.js';
import messages from '/scripts/services/messages.js'
import raintechAuth from '/scripts/services/raintechAuth.js'

loader.application('auth', [async () => {
    function getUser() {
        if (raintechAuth.currentUser.certificate == null) return null;
        const fullName = raintechAuth.currentUser.login;
        return {
            fullName: fullName
        }
    }


    function init() {
        return {
            dialog: null,
            tab: 0,
            email: '',
            password: '',
            newPassword: '',
            confirmPassword: '',
            errors: {},
            agree: true,
            currentUser: getUser(),
            loaded: false,
            showProfile: false,
            message: null
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
                    const rData = await raintechAuth.restore({ email: this.email });
                    this.message = rData.message;
                } catch (e) {
                    this.message = null;
                    this.errors = e;
                }

            },
            signup: function () {
                return raintechAuth.signup({
                    email: this.email,
                    password: this.newPassword
                });
            },
            login: async function () {
                try {
                    await raintechAuth.login({
                        loginOrEmail: this.email,
                        password: this.password
                    });
                    this.closeDialog();
                } catch (e) {
                    this.errors = e;
                }
            },
            logout: async function () {
                await raintechAuth.logout();
                this.showProfile = false;
            },
            setTab: function (index) {
                this.tab = index;
                this.errors = {};
            }
        },
        mounted: async function () {
            this.dialog = this.$el.querySelector('dialog');
            try {
                await raintechAuth.check();
                this.currentUser = getUser();
            } catch (e) {}
            this.loaded = true;

            messages.on('user.changed', () => {
                this.currentUser = getUser();
            });
        }
    });
    return res;
}]);

