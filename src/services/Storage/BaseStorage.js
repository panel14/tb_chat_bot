class BaseStorage {
    setItem(key, value) {
        throw new Error('Not implemented');
    }

    getItem(key) {
        throw new Error('Not implemented');
    }

    removeItem(key) {
        throw new Error('Not implemented');
    }

    clear() {
        throw new Error('Not implemented');
    }
}

module.exports = BaseStorage;