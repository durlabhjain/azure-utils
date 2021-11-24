import fs from 'fs-extra';
import template from '../template.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';

const runner = util.promisify(exec);
let log = (err, stdout, stderr) => console.log(stdout || stderr || err);

const root = path.join(fileURLToPath(import.meta.url), '../../');

class RecipeManager {
    contents = {}

    async loadRecipes(recipes) {
        const contents = [];

        for (const recipe of recipes) {
            const recipe_path = `${root}recipes/${recipe}.txt`;
            const content = await fs.readFile(recipe_path, 'utf8');
            contents.push(content);
        }
        this.contents = contents;
    }

    extractTags() {
        const { contents } = this;
        const tags = [], regex = template.defaultTemplate;
        for (const content of contents) {
            let result;
            do {
                result = regex.exec(content);
                if (result) {
                    if (!tags.includes(result[3])) {
                        tags.push(result[3]);
                    }
                }
            } while (result);
        }
        return tags;
    }

    async generate({ tags, contents, run = true } = {}) {
        contents = contents || this.contents;
        for(const content of contents) {
            const lines = template.replaceTags(content, tags, { keepMissingTags: true }).split('\n');
            for(const line of lines) {
                console.info(line);
                if (run && !line.startsWith('#') && line.length > 1) {
                    await runner(line, log);
                }
            }
        }
    }
}

export default RecipeManager;