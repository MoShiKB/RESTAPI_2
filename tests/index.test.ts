import mongoose from 'mongoose';
import request from 'supertest';
import app, { startServer } from '../index';``

describe('Main Server Tests', () => {
    it('should successfully connect to database and start server', async () => {
        const mockConnect = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce(mongoose);
        const mockListen = jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
            if (callback) callback();
            return {} as any;
        });
        const mockLog = jest.spyOn(console, 'log').mockImplementation();

        await startServer();

        expect(mockConnect).toHaveBeenCalledWith(process.env.DATABASE_URL);
        expect(mockLog).toHaveBeenCalledWith('Connected to Database');
        expect(mockListen).toHaveBeenCalled();

        mockConnect.mockRestore();
        mockListen.mockRestore();
        mockLog.mockRestore();
    });

    it('should handle database connection error and exit', async () => {
        const dbError = new Error('Database connection failed');
        const mockConnect = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(dbError);
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
        const mockError = jest.spyOn(console, 'error').mockImplementation();

        await startServer();

        expect(mockConnect).toHaveBeenCalledWith(process.env.DATABASE_URL);
        expect(mockError).toHaveBeenCalledWith('DB connect error:', dbError);
        expect(mockExit).toHaveBeenCalledWith(1);

        mockConnect.mockRestore();
        mockExit.mockRestore();
        mockError.mockRestore();
    });
});
