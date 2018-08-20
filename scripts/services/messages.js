const vm = new Vue();

function send(message, params) {
    return vm.$emit(message, params);
}

function on(message, callback) {
    return vm.$on(message, callback)
}

export default {
    send: send,
    on: on,
    vm: vm
};
