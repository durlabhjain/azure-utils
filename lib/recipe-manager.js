import fs from 'fs-extra';
import template from '../template.js';
import path from 'path';
import { fileURLToPath } from 'url';

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

    generate(tags, contents) {
        contents = contents || this.contents;
        for(const content of contents) {
            console.log(template.replaceTags(content, tags, { keepMissingTags: true }));
        }
    }
}

export default RecipeManager;