window.loader.service('postgres', [async () => {
    const PG_TIME = 1184;
    moment.locale('ru');

    function findColumn(data, column) {
        for (let i = 0; i < data.fields.length; i++) {
            const field = data.fields[i];
            if (field.name == column) return i;
        }
        return null;
    }

    function getData(data, index, column) {
        const colIndex = findColumn(data, column);
        return data.rows[index][colIndex];
    }

    function convert(field, data) {
        if (field.type == PG_TIME)
            return moment(data);
        return data;
    }

    function toArray(response, onItem) {
        return response.rows.map((row, index) => {
            const data = response.fields.reduce((initValue, field, index) => {
                initValue[field.name] = convert(field, row[index]);
                return initValue;
            }, {});
            if (onItem != null) {
                const result = onItem(data, response, index);
                if (result !== undefined) return result;
            }
            return data;
        });
    }

    function toHash(response, key = 'id', onItem) {
        return response.rows.reduce((rowHash, row) => {
            const data = response.fields.reduce((colHash, field, index) => {
                colHash[field.name] = convert(field, row[index]);
                return colHash;
            }, {});
            const keyValue = data[key];
            if (keyValue === undefined) throw new Error('The value of field ' + key + ' is undefined');
            rowHash[keyValue] = data;
            if (onItem != null) {
                const result = onItem(data, row);
                if (result !== undefined) rowHash[keyValue] = data;
            }
            return rowHash;
        }, {});
    }

    return {
        getData: getData,
        toArray: toArray,
        toHash: toHash,
    }
}]);
