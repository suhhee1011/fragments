const MongoDB = require('../../src/model/data/memory/index');

describe('memory-db', () => {
  test('readFragment returns what we writeFragment into the dbtest', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 'Suhhee' };
    await MongoDB.writeFragment(fragment);
    const result = await MongoDB.readFragment('a', 'b');
    expect(result).toEqual(fragment);
  });
  test('readFragmentData returns what we writeFragmentData into the dbtest', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 'Suhhee' };
    await MongoDB.writeFragmentData(fragment.ownerId, fragment.id, fragment.value);
    const result = await MongoDB.readFragmentData('a', 'b');
    expect(result).toEqual(fragment.value);
  });

  test('readFragment with incorrect secondaryKey returns nothing', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 'Suhhee' };
    await MongoDB.writeFragment(fragment);
    const result = await MongoDB.readFragment('a', 'c');
    expect(result).toEqual(undefined);
  });

  test('readFragmentData with incorrect secondaryKey returns nothing', async () => {
    const fragment = { ownerId: 'a', id: 'b', value: 'Suhhee' };
    await MongoDB.writeFragmentData(fragment.ownerId, fragment.id, fragment.value);
    const result = await MongoDB.readFragmentData('a', 'c');
    expect(result).toEqual(undefined);
  });
});
