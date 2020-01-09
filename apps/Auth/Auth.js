import loader from '/node_modules/async-content-loader/main.js';
import raintechAuth from '/apps/raintechAuth/raintechAuth.js';

const gTemplateP = loader.request(`/apps/Auth/Auth.html`);

function getUser() {
    if (raintechAuth.currentUser.certificate == null) return null;
    let fullName = raintechAuth.currentUser.login;
    fullName = (fullName == null) ? raintechAuth.currentUser.email : fullName;
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
        message: null,
        disabled: false,
        rememberLinkSent: false
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
}

function hide(vm) {
    vm.dialog.close();
}

/*
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
                this.disabled = true;
                try {
                    const rData = await raintechAuth.restore({ email: this.email });
                    this.message = rData.message;
                    this.disabled = false;
                    this.rememberLinkSent = true;
                } catch (e) {
                    this.message = null;
                    this.errors = e;
                    this.disabled = false;
                }

            },
            signup: async function () {
                this.disabled = true;
                try {
                    this.errors = {};
                    if (this.newPassword == '') throw new raintechAuth.Exception({ newPassword: 'The password is empty' });
                    if (this.confirmPassword != this.newPassword) throw new raintechAuth.Exception({ confirmPassword: 'The passwords does not match' });
                    if (!this.agree) throw new raintechAuth.Exception({ confirmPassword: 'Agree with terms of service or leave' });
                    await raintechAuth.signup({
                        email: this.email,
                        newPassword: this.newPassword
                    });
                    this.disabled = false;
                    this.closeDialog();
                } catch (e) {
                    this.errors = e;
                    this.disabled = false;
                }
            },
            login: async function () {
                try {
                    this.disabled = true;
                    await raintechAuth.login({
                        loginOrEmail: this.email,
                        password: this.password
                    });
                    this.disabled = false;
                    this.closeDialog();
                } catch (e) {
                    this.disabled = false;
                    this.errors = e;
                }
            },
            logout: async function () {
                this.disabled = true;
                await raintechAuth.logout();
                this.showProfile = false;
                this.disabled = false;
            },
            setTab: function (index) {
                this.tab = index;
                this.errors = {};
            }
        },
        mounted: async function () {
            this.dialog = this.$el.querySelector('dialog');
            res.login = () => {
                this.loginDialog();
            };
            res.signup = () => {
                this.signupDialog();
            };
            try {
                await raintechAuth.check();
                this.currentUser = getUser();
            } catch (e) {
                if (e instanceof raintechAuth.Exception)
                    this.loginDialog();
            }
            this.loaded = true;

            raintechAuth.onUserChanged(() => {
                this.currentUser = getUser();
            });
        }
    });
    return res;
*/

async function render(auth) {
    const template = await gTemplateP;
    auth._mount.innerHTML = template.text;
}

export default class Auth {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }
}