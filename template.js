const defaultTemplate = /\${((\w+)\.)?(\w+)}/g;

/**
 * @description Replaces the given tags in the given source with the given values.
 * @param {string} source The source to replace the tags in.
 * @param {object} values The values to replace the tags with.
 * @param {object} options template - Regex to use for matching tags, keepMissingTags - Whether to keep tags that are not replaced.
 * @returns {string} The source with the tags replaced.
 * @example
 * // Replaces all tags in the given source with the given values.
 * console.log(template("${firstName} ${lastName}", { firstName: "John", lastName: "Doe" }));
 * // -> "John Doe"
 * // Two level tags are supported.
 * console.log(template("${user.firstName} ${user.lastName}", { user: { firstName: "John", lastName: "Doe" } }));
 * // -> "John Doe"
 **/
const replaceTags = function (source, tags, { template = defaultTemplate, keepMissingTags = false } = {}) {
    if (!source || !tags) {
        return source;
    }

    return source.replace(template, function (match, g1, g2, g3) {
        const container = g2 ? tags[g2] || {} : tags;
        return container[g3] === undefined ? (keepMissingTags ? match : "") : container[g3];
    });
};

export default {
    replaceTags
};