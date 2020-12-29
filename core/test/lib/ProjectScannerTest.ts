import { SystemConfiguration } from '@core/configuration/SystemConfiguration';
import { ProjectScanner } from '@core/lib/ProjectScanner';
import test from 'ava';
import glob from 'glob';
import sinon from 'sinon';

test('ProjectScanner.constructor sets correct defaults', t => {
    t.plan(2);

    const sc = {} as SystemConfiguration;

    class MockProjectScanner extends ProjectScanner {
        constructor() {
            super(sc);

            t.is(this.conf, sc);
            // Does not work:
            // t.is(this.loader, require);
            t.is(this.glob, glob.sync);
        }
    }

    new MockProjectScanner();
});

test('ProjectScanner.scanAndLoad retrieves a list of files and loads them', t => {
    t.plan(20);

    const sc = {
        projectFolders(): string[] {
            return ['/tmp/a', '/tmp/h', '/tmp/abc/def'];
        }
    } as SystemConfiguration;

    function testbed(step: number): { dir: string; files: string[] } {
        let dir: string;
        let files: string[];

        switch (step) {
            case 0:
                dir = '/tmp/a';
                files = ['file.ts', 'file2.ts', 'file3.ts'];
                break;
            case 1:
                dir = '/tmp/h';
                files = ['ello.ts', 'ola.ts', 'allo.ts'];
                break;
            case 2:
                dir = '/tmp/abc/def';
                files = ['one coconut', 'two cononuts', 'three cononuts'];
                break;
            default:
                throw new Error('Requested testbed too often');
        }

        return { files, dir };
    }

    let loadCategory = 0;
    let loadFile = 0;
    function load(path: string): any {
        // 1 test per file name + 1 per group

        // We have three cases per folder
        // If we'd ran into the fourth, the path should have "changed"
        if (loadFile > 2) {
            const prevTestbed = testbed(loadCategory);

            t.false(path.startsWith(prevTestbed.dir));

            loadFile = 0;
            loadCategory++;
        }

        const { files, dir } = testbed(loadCategory);
        const expected = files[loadFile++];

        t.is(path, `${dir}/${expected}`);
    }

    let globIdx = 0;
    function glob(path: string, options: any): string[] {
        // 2 tests per group

        const { files, dir } = testbed(globIdx++);

        t.is(options.cwd, dir);
        t.true(options.absolute);
        t.is(path, `**/*.ts`);

        return files.map(f => `${dir}/${f}`);
    }

    class MockProjectScanner extends ProjectScanner {
        constructor() {
            super(sc);

            this.glob = glob;
            this.loader = load;
        }
    }

    const mock = new MockProjectScanner();
    mock.scanAndLoad();
});

/// ProjectScanner.create

test('ProjectScanner.create creates a new ProjectScanner', t => {
    t.plan(1);

    const sc = {} as SystemConfiguration;

    const sut = ProjectScanner.create(sc);

    t.is(sut.configuration, sc);
});
