import fs from 'fs-extra';

class ConfigManager {
    constructor({ basePath = '.' } = {}) {
        this.basePath = basePath;
    }

    load() {
        const { basePath } = this;
        let config = {};

        const configFiles = ['config'];

        for (const configFile of configFiles) {
            const configFilename = `${basePath}/${configFile}.json`;
            if (fs.existsSync(configFilename)) {
                Object.assign(config, fs.readJsonSync(configFilename));
            }
        }
        this.config = config;
    }

    save() {
        const { config, basePath } = this;
        if(fs.pathExistsSync(basePath)) {
            fs.writeJsonSync(`${basePath}/config.override.json`, config, { spaces: 2 });
            return true;
        }
        return false;
    }
}

export default ConfigManager;