const BaseStorage = require("./BaseStorage");

class MemoryStorage extends BaseStorage {
    constructor() {
        super();
        this.storage = new Map();
    }

    setItem(key, value) {
        this.storage.set(key, value);
    }

    getItem(key) {
        return this.storage.get(key) || null
    }

    removeItem(key) {
        this.storage.delete(key);
    }

    clear() {
        this.storage.clear();
    }
}

module.exports = MemoryStorage;