import loader from '/node_modules/async-content-loader/main.js';
import location from '/node_modules/location-browser/main.js';
import raintechAuth from '/apps/raintechAuth/raintechAuth.js';

const gTemplateP = loader.request(`/apps/Frontpage/Frontpage.html`);

function init() {
    return {
        showConfigs: false,
        showError: false,
        loaded: false
    }
}

function showConfigs(vm) {
    const search = location.getSearch();
    vm.showConfigs = (search.project != null);
}

async function checkUser(vm) {
    try {
        await raintechAuth.check();
        vm.showError = false;
    } catch (e) {
        vm.showError = true;
    }
    vm.loaded = true;
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
    methods: {
        login: function () {
            auth.login();
        },
        signup: function () {
            auth.signup();
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

async function render(frontpage) {
    const template = await gTemplateP;
    frontpage._mount.innerHTML = template.text;
    checkUser(frontpage);
}

export default class Frontpage {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }

    get loaded() {
        this._mount.classList.contains('show');
    }

    set loaded(value) {
        if (value) {
            this._mount.classList.add('show');
            return;
        }
        this._mount.classList.remove('show');
    }
}

