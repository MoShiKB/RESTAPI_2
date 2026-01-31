import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index';
import Post from '../../model/posts.model';
import Comment from '../../model/comments.model';
import { token, userId } from '../setup';

describe('Comment Routes', () => {
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    const post = await Post.create({
      content: 'Test post for comments',
      senderId: userId
    });
    postId = post._id.toString();

    const comment = await Comment.create({
      postId: post._id,
      author: userId,
      content: 'Test comment'
    });
    commentId = comment._id.toString();
  });

  describe('GET /post/:postId/comment', () => {
    it('should get all comments for a post', async () => {
      const res = await request(app)
        .get(`/post/${postId}/comment`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 when getting comments for a non-existent post', async () => {
      const fakePostId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/post/${fakePostId}/comment`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 500 if an error occurs during getting all comments', async () => {
      jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .get(`/post/${postId}/comment`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /:postId/comment/:id', () => {
    it('should get a specific comment by ID', async () => {
      const res = await request(app)
        .get(`/post/${postId}/comment/${commentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', commentId);
      expect(res.body.content).toBe('Test comment');
    });

    it('should return 404 when getting a non-existent comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/post/${postId}/comment/${fakeCommentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });
  });

  describe('POST /post/:postId/comment', () => {
    it('should create a new comment', async () => {
      const res = await request(app)
        .post(`/post/${postId}/comment`)
        .set('Authorization', token)
        .send({
          content: 'New Test Comment',
          author: userId.toString(),
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.content).toBe('New Test Comment');
      expect(res.body.author.toString()).toBe(userId.toString());
    });

    it('should create a comment using authenticated user when author is missing', async () => {
      const res = await request(app)
        .post(`/post/${postId}/comment`)
        .set('Authorization', token)
        .send({
          content: 'Comment without author'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe('Comment without author');
      expect(res.body.author).toBeDefined();
    });

    it('should return 404 when creating a comment for a non-existent post', async () => {
      const fakePostId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/post/${fakePostId}/comment`)
        .set('Authorization', token)
        .send({
          content: 'Comment for non-existent post',
          author: userId.toString(),
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 403 when creating a comment without authentication', async () => {
      const res = await request(app)
        .post(`/post/${postId}/comment`)
        .send({
          content: 'New comment',
          author: userId.toString()
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /post/:postId/comment/:id', () => {
    it('should update an existing comment', async () => {
      const res = await request(app)
        .put(`/post/${postId}/comment/${commentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', commentId);
      expect(res.body.content).toBe('Updated Comment');
    });

    it('should return 404 when updating a non-existent comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/post/${postId}/comment/${fakeCommentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated content for non-existent comment' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });
  });

  describe('DELETE /post/:postId/comment/:id', () => {
    it('should delete a comment', async () => {
      const commentToDelete = await Comment.create({
        content: 'Comment to Delete',
        author: userId,
        postId,
      });
      await Post.findByIdAndUpdate(postId, { $push: { comments: commentToDelete._id } });
      const res = await request(app)
        .delete(`/post/${postId}/comment/${commentToDelete._id}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Comment deleted successfully');

      const deletedComment = await Comment.findById(commentToDelete._id);
      expect(deletedComment).toBeNull();
    });

    it('should return 404 when deleting a non existing comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/post/${postId}/comment/${fakeCommentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });

    it('should return 500 if an error occurs during deletion', async () => {
      jest.spyOn(Comment, 'findByIdAndDelete').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .delete(`/post/${postId}/comment/${commentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');
    });
  });

  describe('Database Error Scenarios', () => {
    it('GET /:id should return 500 on db error', async () => {
      jest.spyOn(Comment, 'findById').mockImplementationOnce(() => {
        throw new Error('DB Error');
      });
      const res = await request(app)
        .get(`/post/${postId}/comment/${commentId}`)
        .set('Authorization', token);
      expect(res.statusCode).toBe(500);
    });

    it('PUT /:id should return 500 on db error', async () => {
      jest.spyOn(Comment, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('DB Error');
      });
      const res = await request(app)
        .put(`/post/${postId}/comment/${commentId}`)
        .set('Authorization', token)
        .send({ content: 'Update' });
      expect(res.statusCode).toBe(500);
    });

    it('POST / should return 500 on db error', async () => {
      jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
        throw new Error('DB Error');
      });
      const res = await request(app)
        .post(`/post/${postId}/comment`)
        .set('Authorization', token)
        .send({ content: 'Fail' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('Direct Controller Tests - Create Comment', () => {
    it('should return 400 if author is missing and request user is missing', async () => {
      const req: any = {
        body: { content: 'No author' },
        params: { postId },
        user: undefined
      };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const commentsController = require('../../controller/comments.controller').default;
      await commentsController.createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Author is required' });
    });
  });
});