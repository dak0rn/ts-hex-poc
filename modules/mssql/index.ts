import { MSSQL } from './MSSQL';

export default {
    getClass(): { new (...args: any[]): any } {
        return MSSQL;
    }
};
