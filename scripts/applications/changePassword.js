import loader from '/scripts/loader.js';
import raintechAuth from '/scripts/services/raintechAuth.js';

loader.application('changePassword', [async () => {
    await loader.createVueTemplate({ path: '/pages/changePassword.html', id: 'ChangePassword-Template' });
    const res = {};
    const emptyPass = 'Password is empty';
    res.data =  {
        email: '',
        errors: { newPassword: emptyPass},
        newPassword: '',
        confirmPassword: '',
        cert: null,
        disabled: true,
        isOk: true,
        changed: false
    };

    res.Constructor = Vue.component('changePassword', {
        template: '#ChangePassword-Template',
        data: function () {
            return res.data;
        },
        watch: {
            newPassword: function () {
                if (this.newPassword == '') {
                    this.disabled = true;
                    this.errors = {newPassword: emptyPass};
                    return;
                }
                this.errors = {};
            },
            confirmPassword: function () {
                if (this.confirmPassword != this.newPassword) {
                    this.errors = { confirmPassword: 'The passwords does not match'};
                    this.disabled = true;
                    return
                }
                this.errors = {};
                this.disabled = false;
            },
        },
        methods: {
            change: async function () {
                this.disabled = true;
                try {
                    await raintechAuth.update({ newPassword: this.newPassword, confirmPassword: this.confirmPassword });
                    this.disabled = false;
                    this.changed = true;
                } catch (e) {
                    this.errors = e;
                    this.disabled = false;
                }
            }
        },
        mounted: async function () {
            try {
                this.cert = await raintechAuth.check();
            } catch (e) {
                this.cert = null;
                this.errors = e;
                this.isOk = false;
            }
        }
    });
    return res;
}]);

