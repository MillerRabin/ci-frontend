function send(message, params) {
    const event = new CustomEvent(message, { detail: params });
    window.document.dispatchEvent(event);
}

function on(message, callback) {
    window.document.addEventListener(message, callback);
}

function off(message, callback) {
    window.document.removeEventListener(message, callback);
}

export default {
    send, on, off
}

