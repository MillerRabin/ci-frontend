function clearChilds(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function className(obj) {
    const res = [];
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        if (val)
            res.push(key);
    }
    return res.join(' ');
}

export default {
    clearChilds,
    'class': className
}