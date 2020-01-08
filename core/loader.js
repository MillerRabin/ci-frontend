const loader = {};

loader.globalContentLoaded = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => {
        resolve();
    });
});

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

export default loader;