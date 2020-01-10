import loader from '/node_modules/async-content-loader/main.js';
import location from '/node_modules/location-browser/main.js';
import router from '/node_modules/es-class-router/main.js';

const gTemplateP = loader.request(`/apps/Frontpage/Frontpage.html`);

function showConfigs(vm) {
    const search = location.getSearch();
    vm.showConfigs = (search.project != null);
}


/*const res = {};
res.Constructor = Vue.component('frontpage', {
    template: '#FrontPage-Template',
    data: init,
    watch:{
        $route (to){
            showConfigs(this);
        }
    },
    mounted: function () {
        showConfigs(this);
        checkUser(this);
        raintechAuth.onUserChanged(() => {
            checkUser(this);
        });
    }
});*/

function enableLoginSignup(frontpage) {
    const login = frontpage.mount.querySelector('.info .login');
    const auth = router.application.header.auth;
    login.onclick = function () {
        router.application.header.auth.login();
    };
    const signup = frontpage.mount.querySelector('.info .signup');
    signup.onclick = function () {
        router.application.header.auth.signup();
    };
}

async function render(frontpage) {
    const template = await gTemplateP;
    frontpage._mount.innerHTML = template.text;
    enableLoginSignup(frontpage);
}

export default class Frontpage {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }
}

