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

function enableLoginSignup(auth) {
    const login = auth.mount.querySelector('.panel.buttons');
    login.onclick = function () {
        auth.login();
    };

    const signup = auth.mount.querySelector('.panel.buttons');
    signup.onclick = function () {
        auth.signup();
    };
}

function clearInputs(auth) {
    const inputs = auth.mount.querySelectorAll('label input');
    for (const input of inputs)
        input.value = '';
}

function clearErrors(auth) {
    const errors = auth.mount.querySelectorAll('label span.error');
    for (const error of errors) {
        error.innerHTML = '';
        error.classList.remove('show');
    }
}

function setErrors(auth, selector, error) {
    if (error.message != null) {
        auth.fields[selector].email.error.innerHTML = error.message;
        auth.fields[selector].email.input.focus();
    }

    if (error.text != null) {
        auth.fields[selector].email.error.innerHTML = error.text;
        auth.fields[selector].email.input.focus();
    }
}

function setElementsDisabled(auth, selector, value) {
    const elems = auth.mount.querySelectorAll(selector);
    for(const elem of elems)
        elem.disabled = value;
}

function show(auth, tab = 'login') {
    clearInputs(auth);
    clearErrors(auth);
    auth._dialog.showModal();
    auth.tab = tab;
}

function hide(vm) {
    vm._dialog.close();
}

async function signup() {
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
}

async function login(auth) {
    try {
        clearErrors(auth);
        auth.disabled = true;
        await raintechAuth.login({
            loginOrEmail: auth.fields.login.email.input.value,
            password: auth.fields.login.password.input.value
        });
        auth.disabled = false;
        auth.close();
    } catch (e) {
        auth.disabled = false;
        setErrors(auth, 'login', e);
    }
}

async function logout() {
    this.disabled = true;
    await raintechAuth.logout();
    this.showProfile = false;
    this.disabled = false;
}

async function init(auth) {
    try {
        await raintechAuth.check();
        this.currentUser = getUser();
    } catch (e) {
        if (e instanceof raintechAuth.Exception)
            auth.login();
    }
    
    raintechAuth.onUserChanged(() => {
        this.currentUser = getUser();
    });
}

function getField(auth, selector) {
    const input = auth.mount.querySelector(`${selector} input`);
    const error = auth.mount.querySelector(`${selector} span.error`);
    return { input, error };
}

function buildFieldStruct(auth) {
    const login = {
        email: getField(auth, '.login label.email'),
        password: getField(auth, '.login label.password'),
        message: auth._dialog.querySelector('.message')
    };

    const signup = {
        email: getField(auth, '.signup label.email'),
        password: getField(auth, '.signup label.password'),
        confirmPassword: getField(auth, '.signup label.confirmPassword')
    };

    auth.fields = { login, signup};
}

function enableTabs(auth) {
    function setTab() {
        auth.tab = this.getAttribute('data-tag');
    }

    const tabs = auth.mount.querySelectorAll('.tabs .tab');
    for (const tab of tabs)
        tab.onclick = setTab;
}

function enableClose(auth) {
    const close = auth.mount.querySelector('button.close');
    close.onclick = function () {
        auth.close();
    };
}

function enableLoginSubmit(auth) {
    const loginForm = auth._dialog.querySelector('form.login');
    loginForm.onsubmit = function (event) {
        login(auth);
        event.preventDefault();
    };
}

async function render(auth) {
    const template = await gTemplateP;
    auth._mount.innerHTML = template.text;
    auth._dialog = auth._mount.querySelector('dialog');
    buildFieldStruct(auth);
    enableTabs(auth);
    enableLoginSignup(auth);
    enableClose(auth);
    enableLoginSubmit(auth);
    init(auth);
}

async function restore(auth) {
    auth.errors = {};
    auth.disabled = true;
    try {
        const rData = await raintechAuth.restore({ email: auth.email });
        auth.message = rData.message;
        auth.disabled = false;
        auth.rememberLinkSent = true;
    } catch (e) {
        auth.message = null;
        setErrors('login', e);
        auth.disabled = false;
    }
}

function setDisabled(auth, value) {
    setElementsDisabled(auth, 'input', value);
    setElementsDisabled(auth, 'button', value);
}

export default class Auth {
    constructor(mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }

    login() {
        show(this, 'login');
    }

    signup() {
        show(this, 'signup');
    }
    
    close() {
        hide(this);
    }
    
    async restore() {
        return await restore(this);
    }

    get tab() {
        return this._dialog.className;
    }

    set tab(value) {
        this._dialog.className = value;
        setTimeout(() => {
            this.fields[value].email.input.focus();
        }, 50);
    }

    set disabled(value) {
        setDisabled(this, value);
    }
}