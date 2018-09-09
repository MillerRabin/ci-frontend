const loader = {};

loader.enableDynamicContent = window.location.hostname == 'localhost';

loader.globalContentLoaded = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => {
        resolve();
    });
});

function isFunction(functionToCheck) {
    let getType = {};
    if (functionToCheck == null) return false;
    let type = getType.toString.call(functionToCheck);
    return (type == '[object Function]') || (type == '[object AsyncFunction]');
}

function isArray(value) {
    return (value instanceof Array)
}

loader.loadLibrary = (module) => {
    return new Promise((resolve, reject) => {
        if ((module.exists != null) && (module.exists())) return resolve();
        let head = document.getElementsByTagName('head').item(0);
        let script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', module.path);
        if (module.id != null) script.id = module.id;
        head.appendChild(script);
        script.onload = () => {
            return resolve(script);
        };

        script.onerror = (err) => {
            return reject(err)
        }
    });
};

loader.request = (path, options = {}) => {
    return new Promise((resolve, reject) => {
        const XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        const xhr = new XHR();
        const method = (options.method == null) ? 'GET' : options.method;
        if ((method == 'GET') && (options.data != null)) {
            const query = [];
            for (const key in options.data) {
                if (!options.data.hasOwnProperty(key)) continue;
                query.push(`${key}=${options.data[key]}`);
            }
            path += '?' + query.join('&');
        }
        xhr.open(method, path, true);

        xhr.onload = (event) => {
            let xhr = event.currentTarget;
            if (xhr.status >= 400)
                return reject({ code: xhr.status, text: xhr.responseText });
            return resolve({ code: xhr.status, text: xhr.responseText });
        };

        xhr.onerror = (event) => {
            let xhr = event.currentTarget;
            reject({ code: xhr.status, text: xhr.responseText })
        };

        if (options.headers != null) {
            for (let hKey in options.headers) {
                if (options.headers.hasOwnProperty(hKey)) {
                    let line = options.headers[hKey];
                    xhr.setRequestHeader(hKey, line);
                }
            }
        }

        if (options.params != null) {
            for (let pKey in options.params)
                if (options.params.hasOwnProperty(pKey))
                    xhr[pKey] = options.params[pKey];
        }

        xhr.send(options.data);
    });
};

loader.json = async function(url, options) {
    let data = Object.assign({}, options);
    if (data.headers == null)
        data.headers = { 'Content-Type': 'application/json; charset=UTF-8' };

    if ((data.data) &&
        (data.method == 'POST') || (data.method == 'PUT') ||
        (data.method == 'DELETE')) {
        data.data = JSON.stringify(data.data);
        if (data.headers['Content-Encoding'] == null)
            data.headers['Content-Encoding'] = 'identity';
    }

    try {
        let result = await this.request(url, data);
        return JSON.parse(result.text);
    } catch(err) {
        let msg = { error: 'There was a technical failure. Please try again in a few minutes.' };
        if (err.text == null) return msg;
        try {
            msg = JSON.parse(err.text);
        }
        catch(e) {
            throw msg;
        }
        throw msg;
    }
};

async function loadVueTemplates(modules) {
    let promises = [];
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        promises.push(window.loader.createVueTemplate(module));
    }
    await Promise.all(promises);
}

function loadModule(module) {
    let func = (module.type == null) ? loader.loadLibrary(module) :
        (module.type == 'vueTemplate') ? loadVueTemplate(module) :
            null;
    if (func == null) return Promise.reject({ text: 'Unknown module type'});
    return func;
}

async function loadModules(modules) {
    let promises = [];
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        promises.push(loadModule(module));
    }
    return await Promise.all(promises);
}

loader.loadBundles = async (bundles) => {
    for (let key in bundles) {
        if (!bundles.hasOwnProperty(key)) continue;
        let modules = bundles[key];
        let opts = key.split(':');
        let [ mname, event ] = opts;
        if (event == 'onload')
            await loader.globalContentLoaded;
        console.time('bundle ' + mname);
        let func = (event == 'vue') ? loadVueTemplates(modules) :
            loadModules(modules);
        await func;
        console.timeEnd('bundle ' + mname);
    }
};

loader.loadContent = async (path, id) => {
    let data = await loader.request(path);
    let elem = window.document.getElementById(id);
    if (elem == null) throw new Error('Element with id ' + id + ' is not found');
    elem.innerHTML = data.text;
};

loader.createVueTemplate = async (module) => {
    await loader.globalContentLoaded;
    let head = document.getElementsByTagName('head').item(0);
    let script = window.document.getElementById(module.id);
    if (script == null) {
        script = document.createElement('script');
        script.setAttribute('type', 'text/x-template');
        script.setAttribute('id', module.id);
        head.appendChild(script);
    }
    let data = await loader.request(module.path);
    script.innerHTML = '\n' + data.text;
    return script;
};

function createLoader() {
    let result = { loader: {}};
    result.loader.promise = new Promise ((resolve, reject) => {
        result.loader.resolve = resolve;
        result.loader.reject = reject;
    });
    return result;
}

async function resolveDeps(deps, app) {
    let args = [];
    for (let i = 0; i < deps.length - 1; i++) {
        let dep = deps[i];
        args.push(await loader.wait(dep));
    }
    let func = deps[deps.length - 1];
    if (!isFunction(func)) throw new Error('The last argument must be function');
    return func.apply(app, args);
}

let applications = {};
let apps = {};

loader.getApps = () => {
    return apps;
};

async function moduleLoader(module, deps, type = 'module') {
    if (module == null) throw new Error(type + ' is not defined');
    if (applications[module] == null) applications[module] = createLoader();
    if (deps == null) return applications[module].loader.promise;

    let app = applications[module];
    let res = null;
    if (isFunction(deps)) res = await deps(app);
    if (isArray(deps)) res = await resolveDeps(deps, app);
    app.results = res;
    if (app.loader.timer != null) clearTimeout(app.loader.timer);
    app.loader.resolve(res);
    return app;
}

loader.module = async (module, deps) => {
    await loader.globalContentLoaded;
    return await moduleLoader(module, deps);
};

loader.service = async (service, deps) => {
    return await moduleLoader(service, deps, 'service');
};

loader.application = async (module, deps) => {
    await loader.globalContentLoaded;
    apps[module] = await moduleLoader(module, deps, 'application');
    return apps[module];
};

loader.wait = async (module, timeout = 10000) => {
    if (module == null) throw new Error('module is not defined');
    if (applications[module] == null) applications[module] = createLoader();
    applications[module].loader.timer = setTimeout(() => {
        applications[module].loader.reject(new Error(`${ module } waiting time is out`));
    }, timeout);
    return applications[module].loader.promise;
};


export default loader;