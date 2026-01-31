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

  describe('GET /comment', () => {
    it('should get all comments', async () => {
      const res = await request(app)
        .get('/comment')
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 if an error occurs during getting all comments', async () => {
      jest.spyOn(Comment, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .get('/comment')
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      jest.restoreAllMocks();
    });
  });

  describe('GET /comment/post/:postId', () => {
    it('should get all comments for a post', async () => {
      const res = await request(app)
        .get(`/comment/post/${postId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 when getting comments for a non-existent post', async () => {
      const fakePostId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/comment/post/${fakePostId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Post not found');
    });

    it('should return 500 if an error occurs during getting all comments', async () => {
      jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .get(`/comment/post/${postId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      jest.restoreAllMocks();
    });
  });

  describe('GET /comment/:id', () => {
    it('should get a specific comment by ID', async () => {
      const res = await request(app)
        .get(`/comment/${commentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', commentId);
      expect(res.body.content).toBe('Test comment');
    });

    it('should return 404 when getting a non-existent comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/comment/${fakeCommentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });

    it('should return 500 if an error occurs during getting a specific comments', async () => {
      jest.spyOn(Comment, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .get(`/comment/${commentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');

      jest.restoreAllMocks();
    });
  });

  describe('POST /comment and /comment/post/:postId', () => {
    // Keeping existing POST tests but also could test generic POST /comment
    it('should create a new comment via nested route', async () => {
      const res = await request(app)
        .post(`/comment/post/${postId}`)
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

    it('should create a new comment via flat route', async () => {
      const res = await request(app)
        .post(`/comment`)
        .set('Authorization', token)
        .send({
          postId: postId,
          content: 'Flat Test Comment',
          author: userId.toString(),
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe('Flat Test Comment');
    });

    it('should return 400 when author is missing', async () => {
      const res = await request(app)
        .post(`/comment/post/${postId}`)
        .set('Authorization', token)
        .send({
          postId,
          content: 'Comment without author'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Author is required');
    });

    it('should return 404 when creating a comment for a non-existent post', async () => {
      const fakePostId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/comment/post/${fakePostId}`)
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
        .post(`/comment/post/${postId}`)
        .send({
          content: 'New comment',
          author: userId.toString()
        });

      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if an error occurs during creating a new comment', async () => {
      jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .post(`/comment/post/${postId}`)
        .set('Authorization', token)
        .send({
          content: 'New Comment',
          author: userId.toString(),
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');

      jest.restoreAllMocks();
    });
  });

  describe('PUT /comment/:id', () => {
    it('should update an existing comment', async () => {
      const res = await request(app)
        .put(`/comment/${commentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', commentId);
      expect(res.body.content).toBe('Updated Comment');
    });

    it('should return 404 when updating a non-existent comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/comment/${fakeCommentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated content for non-existent comment' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });

    it('should return 403 when updating a comment without authentication', async () => {
      const res = await request(app)
        .put(`/comment/${commentId}`)
        .send({ content: 'Updated content' });

      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if an error occurs during updating a comment', async () => {
      jest.spyOn(Comment, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put(`/comment/${commentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');
      jest.restoreAllMocks();
    });
  });

  describe('DELETE /comment/:id', () => {
    it('should delete a comment', async () => {
      const commentToDelete = await Comment.create({
        content: 'Comment to Delete',
        author: userId,
        postId,
      });
      await Post.findByIdAndUpdate(postId, { $push: { comments: commentToDelete._id } });
      const res = await request(app)
        .delete(`/comment/${commentToDelete._id}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Comment deleted successfully');

      const deletedComment = await Comment.findById(commentToDelete._id);
      expect(deletedComment).toBeNull();
    });

    it('should return 404 when deleting a non existing comment', async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/comment/${fakeCommentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Comment not found');
    });

    it('should return 403 when deleting a comment without authentication', async () => {
      const res = await request(app)
        .delete(`/comment/${commentId}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if an error occurs during deleting all comments', async () => {
      jest.spyOn(Comment, 'findByIdAndDelete').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .delete(`/comment/${commentId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');
      jest.restoreAllMocks();
    });
  });
});