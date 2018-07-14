const vm = new Vue();

function send(message, params) {
    vm.$emit(message, params);
}

function on(message, callback) {
    vm.$on(message, callback)
}

export default {
    send: send,
    on: on,
    vm: vm
};
