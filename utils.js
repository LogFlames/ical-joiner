export function listItems(items) {
    if (!Array.isArray(items) || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} och ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} och ${items[items.length - 1]}`;
}