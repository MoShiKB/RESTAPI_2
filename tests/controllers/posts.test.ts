import request from 'supertest';
import { Types } from 'mongoose';
import app from '../../index';
import Post, { IPost } from '../../model/posts.model';
import { token, userId} from '../setup';

describe('Post API', () => {
  describe('POST /post', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', token)
        .send({
          title: 'My new Post',
          content: 'This is the content of my first post!',
          senderId: userId.toString(),
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('My new Post');
    });
    it('should return 400 when senderId is missing', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', token)
        .send({ title: 'Test', content: 'Test content' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('senderId is required');
    });
    it('should return 400 for invalid senderId format', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', token)
        .send({
          title: 'Test Post',
          content: 'Test content',
          senderId: 'invalid-id'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid senderId');
    });
    it('should return 500 for invalid post data (empty title)', async () => {
      const res = await request(app)
        .post('/post')
        .set('Authorization', token)
        .send({ title: '', senderId: userId.toString() });
      expect(res.statusCode).toBe(500);
    });

    it('should return 500 if an error occurs during creating a post', async () => {
      jest.spyOn(Post, 'create').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const res = await request(app)
        .post('/post')
        .set('Authorization', token)
        .send({
          title: 'Test Post',
          content: 'Test content',
          senderId: userId.toString()
        });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to create post');
      jest.restoreAllMocks();
    });
  });
  describe('GET /post', () => {
    it('should get all posts', async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        senderId: new Types.ObjectId(userId),
      });
      const res = await request(app)
        .get('/post')
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
        });

    it('should get all posts by sender', async () => {
      const post = await Post.create({
        title: 'Sender Test Post',
        content: 'Test Content',
        senderId: new Types.ObjectId(userId),
      });
      const res = await request(app)
        .get(`/post?sender=${userId.toString()}`)
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].senderId.toString()).toBe(userId.toString());
    });

    it('should return 400 for invalid sender id format', async () => {
      const res = await request(app)
        .get('/post?sender=invalid-id')
        .set('Authorization', token);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid sender id');
    });
    it('should return 500 if an error occurs during getting all posts', async () => {
      jest.spyOn(Post, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const res = await request(app)
        .get('/post')
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to get posts');
      jest.restoreAllMocks();
    });
  });
  describe('GET /post/:id', () => {
    it('should get post by ID', async () => {
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        senderId: new Types.ObjectId(userId),
      });
      const res = await request(app)
        .get(`/post/${post._id}`)
        .set('Authorization', token);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(post.title);
    });

    it('should return 404 for a non-existent post', async () => {
      const fakeId = new Types.ObjectId();
      const res = await request(app)
        .get(`/post/${fakeId}`)
        .set('Authorization', token);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 500 if an error occurs during getting post by ID', async () => {
      jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .get(`/post/${new Types.ObjectId()}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to get post by ID');
      jest.restoreAllMocks();
    });
  });
  describe('PUT /post/:id', () => {
    it('should update a post', async () => {
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original Content',
        senderId: new Types.ObjectId(userId),
      });

      const res = await request(app)
        .put(`/post/${post._id}`)
        .set('Authorization', token)
        .send({ title: 'Updated Title', content: 'Updated Content' });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('should return 404 for updating a non-existent post', async () => {
      const fakeId = new Types.ObjectId();

      const res = await request(app)
        .put(`/post/${fakeId}`)
        .set('Authorization', token)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 500 if an error occurs during updating a post', async () => {
      jest.spyOn(Post, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        senderId: new Types.ObjectId(userId),
      });
      const res = await request(app)
        .put(`/post/${post._id}`)
        .set('Authorization', token)
        .send({ title: 'Updated Title' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to update post');
      jest.restoreAllMocks();
    });
  });
  describe('DELETE /post/:id', () => {
    it('should delete a post', async () => {
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'Content to Delete',
        senderId: new Types.ObjectId(userId),
      });
      
      const res = await request(app)
        .delete(`/post/${post._id}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Post deleted successfully');

      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for deleting a non-existent post', async () => {
      const fakeId = new Types.ObjectId();
      const res = await request(app)
        .delete(`/post/${fakeId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });
    it('should return 500 if an error occurs during deleting a post', async () => {
      jest.spyOn(Post, 'findByIdAndDelete').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const post = await Post.create({
        title: 'Test Post',
        content: 'Test Content',
        senderId: new Types.ObjectId(userId),
      });
      const res = await request(app)
        .delete(`/post/${post._id}`)
        .set('Authorization', token);
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to delete post');
      jest.restoreAllMocks();
    });
  });
});