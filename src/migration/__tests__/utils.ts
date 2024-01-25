import { defineMigration } from '../../types';

export const generateMigrationMocks = (nameList: string[]) => {
  return nameList.map((name) =>
    defineMigration({
      name,
      async up() {},
      async down() {},
    })
  );
};
