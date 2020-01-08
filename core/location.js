import safe from '/core/safe.js';

function getSearch() {
    const search = window.location.search;
    const tokens = search.split(/[&?]+/g);
    const args = {};
    for (let token of tokens) {
        if (token == '') continue;
        const val = token.split('=');
        const [key, value] = val;
        if (safe.isEmpty(key)) continue;
        if (safe.isEmpty(value)) continue;
        args[key] = window.decodeURIComponent(value);
    }
    return args;
}

export default {
    getSearch: getSearch
}