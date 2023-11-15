const sample = require('./sample');
//import {sum} from './sample';

test('Add 1 + 2 = 3', () => {
    expect(sample(1,2)).toBe(3);
})

test('Add 5 + 3 = 8', () => {
    expect(sample(5,3)).toBe(8);
})