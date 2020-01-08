const lTable = {
    'ru-RU': {
        interface: 'ru',
        speechRecognizer: 'ru-RU'
    },
    'en-US': {
        interface: 'en',
        speechRecognizer: 'en-US'
    }
};

function get() {
    let loc = window.localStorage.getItem('localization');
    if (loc == null) loc = window.navigator.language;
    return (lTable[loc] != null) ? lTable[loc] : lTable['en-US'];
}

function set(localization) {
    let loc = lTable[localization];
    if (loc == null) loc = 'en-US';
    window.localStorage.setItem('localization', localization);
    return loc;
}

function getText(lang, contextText) {
    if (typeof(contextText) == 'string') return contextText;
    let text = contextText[lang.interface];
    if (text != null) return text;
    const vals = Object.values(contextText);
    return vals[0];
}


export default {
    get: get,
    set: set,
    getText: getText
}