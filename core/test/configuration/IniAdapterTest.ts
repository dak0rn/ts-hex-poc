import test from 'ava';
import { IniAdapter } from '@core/configuration/IniAdapter';
import sinon from 'sinon';
import fs from 'fs';
import ini from 'ini';

let sandbox: sinon.SinonSandbox;

test.beforeEach(function () {
    sandbox = sinon.createSandbox();
});

test.afterEach(function () {
    sandbox.restore();
});

test.serial('IniAdapter.system reads the provided file and parses it', t => {
    t.plan(6);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    t.notThrows(ia.system.bind(ia));
    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);

    t.is(fsStub.getCall(0).args[0], 'thisfieldoesnotsurelynotexist');
    t.deepEqual(fsStub.getCall(0).args[1], { encoding: 'utf-8' });

    t.is(iniStub.getCall(0).args[0], 'banana=true');
});

test.serial('IniAdapter.application reads the provided file and parses it', t => {
    t.plan(6);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    t.notThrows(ia.application.bind(ia));
    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);

    t.is(fsStub.getCall(0).args[0], 'thisfieldoesnotsurelynotexist');
    t.deepEqual(fsStub.getCall(0).args[1], { encoding: 'utf-8' });

    t.is(iniStub.getCall(0).args[0], 'banana=true');
});

test.serial('IniAdapter.system reads the provided file only once', t => {
    t.plan(2);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    ia.system();
    ia.system();

    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);
});

test.serial('IniAdapter.application reads the provided file only once', t => {
    t.plan(2);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    ia.application();
    ia.application();

    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);
});

test.serial('IniAdapter.application combined with IniAdapter.system reads the provided file only once', t => {
    t.plan(2);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    ia.application();
    ia.system();

    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);
});

test.serial('IniAdapter.system combined with IniAdapter.application reads the provided file only once', t => {
    t.plan(2);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns('banana=true');
    const iniStub = sandbox.stub(ini, 'parse').returns({});

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    ia.system();
    ia.application();

    t.is(fsStub.callCount, 1);
    t.is(iniStub.callCount, 1);
});

test.serial('IniAdapter.system returns a SystemConfiguration with the correct values', t => {
    t.plan(1);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns(`
[system]
works = true
    `);

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    const sc = ia.system();

    t.true(sc.get('works'));
});

test.serial('IniAdapter.application returns an ApplicationConfiguration with the correct values', t => {
    t.plan(1);

    const fsStub = sandbox.stub(fs, 'readFileSync').returns(`
[banana]
works = true
    `);

    const ia = new IniAdapter('thisfieldoesnotsurelynotexist');

    const sc = ia.application();

    t.true(sc.get('banana.works'));
});
