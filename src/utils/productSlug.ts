export function toProductSlug(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductSlug(product: { slug?: string; name: string; id: string }): string {
  return product.slug || toProductSlug(product.name) || product.id;
}
