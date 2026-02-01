import {
  generateSeoTitles,
  generateDescription,
  suggestCategories,
  suggestPrice,
  honestyChecker,
  antiSpamChecker
} from './src/logic.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
}

console.log('Running tests...');

// Test SEO Titles
const titles = generateSeoTitles('Felpa Nike nera');
assert(titles.length === 3, 'Should generate 3 titles');
assert(titles[0] === 'Felpa Nike nera', 'First title should match input');

// Test Description
const desc = generateDescription({ title: 'Felpa', description: 'Usata poco', useEmoji: true });
assert(desc.includes('✨'), 'Should include emoji when useEmoji is true');
assert(desc.includes('Usata poco'), 'Should include original description');

// Test Categories
const cats = suggestCategories('Felpa Nike');
assert(cats[0].path.includes('Felpe'), 'Should suggest Felpe category for "Felpa"');

// Test Pricing
const price = suggestPrice('Felpa');
assert(price.final === 35, 'Should suggest correct final price');

// Test Honesty Checker
const warning = honestyChecker({ title: 'Nuovo', description: 'Ha un difetto', useEmoji: false });
assert(warning !== null, 'Should return warning for inconsistency');

// Test Anti-spam
const clean = antiSpamChecker('Sconto!!!! Sconto sconto');
assert(clean === 'Sconto! Sconto', 'Should clean excessive punctuation and repetition');

console.log('All tests passed!');
