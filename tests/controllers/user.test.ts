import request from 'supertest';
import app from '../../index';
import User, { IUser } from '../../model/users.model';
import { userId, token } from '../setup';
import { Types } from "mongoose";


describe('User API', () => {
    it('should get all users', async () => {
        await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .get('/user')
            .set('Authorization', token);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2); // Includes the mock user created in setup
    });

    it('should return 500 if an error occurs during getAllUsers', async () => {
        const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(User, 'find').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .get('/user')
            .set('Authorization', token);

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to get users');

        mockError.mockRestore();
        jest.restoreAllMocks();
    });

    it('should fetch a user by ID', async () => {
        const user = await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .get(`/user/${user._id}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(user._id.toString());
        expect(res.body.username).toBe('testing');
    });

    it('should return 404 for a non-existent user', async () => {
        const fakeId = new Types.ObjectId();

        const res = await request(app)
            .get(`/user/${fakeId}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('User not found');
    });

    it('should return 500 if an error occurs during getUserById', async () => {
        const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
        const originalFindById = User.findById.bind(User);
        let callCount = 0;
        jest.spyOn(User, 'findById').mockImplementation((...args) => {
            callCount++;
            if (callCount === 1) {
                return originalFindById(...args);
            }
            throw new Error('Database error');
        });

        const res = await request(app)
            .get(`/user/${userId}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to get user');

        mockError.mockRestore();
        jest.restoreAllMocks();
    });

    it('should update a user with valid fields', async () => {
        const user = await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .put(`/user/${user._id}`)
            .set('Authorization', token)
            .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User updated successfully');
    });

    it('should return 400 when trying to update username', async () => {
        const user = await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .put(`/user/${user._id}`)
            .set('Authorization', token)
            .send({
                username: 'newusername',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Updating username or email is not allowed');
    });

    it('should return 400 when trying to update email', async () => {
        const user = await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .put(`/user/${user._id}`)
            .set('Authorization', token)
            .send({
                email: 'newemail@example.com',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Updating username or email is not allowed');
    });

    it('should return 404 for updating a non-existent user', async () => {
        const fakeId = new Types.ObjectId();

        const res = await request(app)
            .put(`/user/${fakeId}`)
            .set('Authorization', token)
            .send({});

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('User not found');
    });

    it('should return 500 if an error occurs during updateUser', async () => {
        const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(User, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .put(`/user/${userId}`)
            .set('Authorization', token)
            .send({});

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to update user');

        mockError.mockRestore();
        jest.restoreAllMocks();
    });

    it('should delete a user', async () => {
        const user = await User.create({
            username: 'testing',
            email: 'testing@example.com',
            password: 'hashedpassword',
        });

        const res = await request(app)
            .delete(`/user/${user._id}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User deleted successfully');

        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
    });

    it('should return 404 for deleting a non-existent user', async () => {
        const fakeId = new Types.ObjectId();

        const res = await request(app)
            .delete(`/user/${fakeId}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('User not found');
    });

    it('should return 500 if an error occurs during deleteUser', async () => {
        const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(User, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .delete(`/user/${userId}`)
            .set('Authorization', token);

        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Failed to delete user');

        mockError.mockRestore();
        jest.restoreAllMocks();
    });
});
