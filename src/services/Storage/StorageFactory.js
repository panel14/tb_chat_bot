require('dotenv').config();
const MemoryStorage = require('./MemoryStorage');

class StorageFactory {

    constructor() {
        if (StorageFactory.instance) {
            return StorageFactory.instance;
        }

        this.memoryStorage = new MemoryStorage();
        StorageFactory.instance = this
    }

    static getInstance() {
        if (!StorageFactory.instance) {
            StorageFactory.instance = new StorageFactory();
        }
        return StorageFactory.instance;  
    }

    getStorage() {
        switch (process.env.STORAGE_TYPE) {
            case 'redis':
                return null;
            case 'file':
                return null;
            case 'memory':
                return this.memoryStorage;
        }
    }
}

module.exports = StorageFactory.getInstance().getStorage();