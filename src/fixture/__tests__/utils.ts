import { defineFixture } from '../../types';

export const generateFixtureMocks = (nameList: string[]) => {
  return nameList.map((name) =>
    defineFixture({
      name,
      async load() {},
      dependsOn() {
        return [];
      },
    })
  );
};
