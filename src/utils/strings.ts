const MAX_LENGTH = 22;

export function truncateLongNames(name: string, maxLength = MAX_LENGTH): string {
    return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
}

// Replace whitespace and parenthesis with underscores and make lowercase
//
// Note this function is used to generate the translation keys for the exercise categories
// etc. so they can be used as keys in the translation files. Don't change the implementation
// of this function without updating its counterpart in extract-i18n.py
export function makeServerKey(name: string): string {
    return name.toLowerCase()
        .replace(/\s/g, '_')
        .replace('(', '_')
        .replace(')', '_')
        .replace('-', '_');
}
// Returns the key used for the translation of the given exercise data
export function getTranslationKey(name: string): string {
    return `server.${makeServerKey(name)}`;
}