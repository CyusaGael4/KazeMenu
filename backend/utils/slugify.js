const crypto = require('crypto');

const slugify = (value) => {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

const uniqueSlug = async (Restaurant, base) => {
  const root = slugify(base) || 'restaurant';
  let slug = root;
  let suffix = 0;
  while (await Restaurant.exists({ slug })) {
    suffix += 1;
    slug = `${root}-${suffix}`;
  }
  // ensure unpredictability for empty base
  if (suffix === 0 && !base) {
    slug = `${root}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return slug;
};

module.exports = { slugify, uniqueSlug };
