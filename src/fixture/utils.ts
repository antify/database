import {join} from 'pathe';
import {DatabaseConfiguration} from '../types';

export const getAbsoluteFixturesDirs = (
    databaseConfig: DatabaseConfiguration,
    projectRootDir: string
): string[] => {
    let fixturesDir = databaseConfig?.fixturesDir;

    if (!fixturesDir) {
        // fixturesDir = `fixtures/${databaseConfig.name}`;
        return []
    }

    if (!Array.isArray(fixturesDir)) {
        fixturesDir = [fixturesDir];
    }

    return fixturesDir.map((dir) => join(projectRootDir, dir));
};
