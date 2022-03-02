const MAX_LENGTH = 22;

export function truncateLongNames(name: string, maxLength = MAX_LENGTH): string {
    return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
}

