import Frontpage from '../Frontpage/Frontpage.js';
import ChangePassword from '../ChangePassword/ChangePassword.js';
import messages from '../messages/messages.service.js';

let activeComponent = null;

const gRouter = {
    activeRoute: null,
    push: changeState,
    back: back,
    on: {
        change: onChangeRoute
    },
    off: {
        change: offChangeRoute
    }
};

const gMount = window.document.getElementById('Router');

const routes = [
    { name: 'frontpage', path: '/', Constructor: Frontpage },
    { name: 'change-password', path: '/changePassword.html', Constructor: ChangePassword }
];

function onChangeRoute(callback) {
    messages.on('router.change', callback)
}

function offChangeRoute(callback) {
    messages.off('router.change', callback)
}

function splitPath(path) {
    const pathItems = path.split('/');
    const res = [];
    for (let item of pathItems) {
        const iarr = item.split(':');
        const rItem = { path: item };
        if (iarr.length == 1) {
            rItem.reg = item;
            res.push(rItem);
            continue;
        }
        rItem.paramName = iarr[1];
        rItem.reg = '(.+)';
        res.push(rItem);
    }
    return res;
}

function getLink(href) {
    const origin = window.location.origin;
    const larr = href.split(origin);
    if (larr.length > 1)
        return larr[1];
    return href;
}

function buildPath(pathItems) {
    const reg = [];
    const params = [];

    for (let item of pathItems) {
        reg.push(item.reg);
        if (item.paramName == null) continue;
        params.push(item.paramName);
    }

    return {
        reg: new RegExp('^' + reg.join('/') + '$', 'i'),
        params: params
    }
}

function createRegPath(path) {
    const pathItems = splitPath(path);
    return buildPath(pathItems);
}

function pathToReg(routes) {
    for (let route of routes)
        route.pathReg = createRegPath(route.path);
}

function matchParameters(route, path) {
    const pathReg = route.pathReg;
    const match = pathReg.reg.exec(path);
    if (match == null) return null;
    const tRoute = Object.assign({ params: [] }, route);
    tRoute.link = path;
    for (let i = 0; i < pathReg.params.length; i++) {
        const rObj = {};
        const name = pathReg.params[i];
        rObj[name] = match[i + 1];
        tRoute.params.push(rObj);
    }
    return tRoute;
}

function matchRoute(routes, path) {
    const link = getLink(path);
    for (let route of routes) {
        const match = matchParameters(route, link);
        if (match == null) continue;
        if (match.Constructor == null) continue;
        return match;
    }
    return null;
}

function pushState(route) {
    window.history.pushState({ link: route.link }, route.name, route.link);
}

function back() {
    return window.history.back();
}

function changeRoute(event) {
    const route = applyRoute(routes, event.target.href);
    pushState(route);
    return false;
}

window.onpopstate = async function (event) {
    const state = event.state;
    const link = ((state == null) || (state.link == null)) ? window.location.href : state.link;
    applyRoute(routes, link);
};

function buildLink(route) {
    const npaths = [];
    const paths = route.path.split('/');
    for (let path of paths) {
        const [,vname] = path.split(':');
        if (vname == null) {
            npaths.push(path);
            continue;
        }
        const par = (route.params[vname] != null) ? route.params[vname] : path;
        npaths.push(par);
    }
    return npaths.join('/');
}

function changeState(routeParams) {
    let route = null;
    if (routeParams.name != null) {
        route = routes.find(r => r.name == routeParams.name);
        if (route == null) return null;
        const tRoute = Object.assign({ params: routeParams.params }, route);
        if (!routeParams.params.noMount)
            setNewRoute(tRoute);
        tRoute.link = buildLink(tRoute);
        pushState(tRoute);
        return tRoute;
    }

    if (routeParams.path != null) {
        const route = matchRoute(routes, routeParams.path);
        setNewRoute(route);
        const tRoute = Object.assign({ params: routeParams.params, path: routeParams.path }, (route == null) ? {} : route) ;
        tRoute.link = buildLink(tRoute);
        pushState(tRoute);
        return tRoute;
    }

    return null;
}

function setNewRoute(route) {
    if (activeComponent != null)
        activeComponent.unmount();
    gRouter.activeRoute = route;
    if (route != null) {
        activeComponent = new route.Constructor(gMount, route);
    }
    messages.send('router.change', { router: gRouter, route });
    return true;
}

function applyRoute(routes, path) {
    const route = matchRoute(routes, path);
    setNewRoute(route);
    return route;
}

class RouteLink extends HTMLAnchorElement {
    connectedCallback() {
        this.classList.add('route-link');
        this.onclick = changeRoute;
    }
}

customElements.define('route-link', RouteLink, { extends: 'a' });

pathToReg(routes);
applyRoute(routes, window.location.href);

export default gRouter;
