import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../../index';
import Post, { IPost } from '../../model/posts.model';
import Comment, { IComment } from '../../model/comments.model';
import { token, userId } from '../setup';

let postId: Types.ObjectId, commentId: Types.ObjectId;

beforeEach(async () => {
  const post = new Post<Partial<IPost>>({
    title: 'Test Post',
    content: 'Test Content',
    senderId: userId,
  });
  await post.save();
  postId = post._id as Types.ObjectId;
});

describe('Comment Routes', () => {
  it('should get all comments for a post', async () => {
    const comment = new Comment<Partial<IComment>>({
      content: 'Test Comment',
      author: userId,
      postId,
    });
    await comment.save();
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
   const res = await request(app).get(`/comment/post/${postId.toString()}`).set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]._id).toBe(comment._id.toString());
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
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
  });

  it('should get a specific comment by ID', async () => {
    const comment = new Comment<Partial<IComment>>({
      content: 'Specific Comment',
      author: userId,
      postId,
    });
    await comment.save();

    const res = await request(app)
        .get(`/post/${postId}/comment/${comment._id}`)
        .set('Authorization', token);

    expect(res.statusCode).toBe(200);
   expect(res.body).toHaveProperty('_id', comment._id.toString());
    expect(res.body.content).toBe('Specific Comment');
  });

  it('should return 404 when getting a non-existent comment', async () => {
    const fakeCommentId = new mongoose.Types.ObjectId();

    const res = await request(app)
        .get(`/post/${postId}/comment/${fakeCommentId}`)
        .set('Authorization', token);
    console.log("BODY:", res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Comment not found');
  });

  it('should return 500 if an error occurs during getting a specific comments', async () => {
    jest.spyOn(Comment, 'findById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const comment = new Comment<Partial<IComment>>({
      content: 'Specific Comment',
      author: userId,
      postId,
    });
    await comment.save();

    const res = await request(app)
        .get(`/post/${postId}/comment/${comment._id}`)
        .set('Authorization', token);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
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

  it('should return 500 if an error occurs during creating a new  comments', async () => {
    jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
        .post(`/post/${postId}/comment`)
        .set('Authorization', token)
        .send({
          content: 'New Comment',
          author: userId.toString(),
        });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
  });

  it('should update an existing comment', async () => {
    const comment = new Comment<Partial<IComment>>({
      content: 'Old Comment',
      author: userId,
      postId,
    });
    await comment.save();

    const res = await request(app)
        .put(`/post/${postId}/comment/${comment._id}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', comment._id.toString());
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

  it('should return 500 if an error occurs during updating a comments', async () => {
    jest.spyOn(Comment, 'findByIdAndUpdate').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const comment = new Comment<Partial<IComment>>({
      content: 'Old Comment',
      author: userId,
      postId,
    });
    await comment.save();

    const res = await request(app)
        .put(`/post/${postId}/comment/${comment._id}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
  });

  it('should return 404 when deleting a comment with post not found', async () => {
    const fakePostId = new mongoose.Types.ObjectId();
    const fakeCommentId = new mongoose.Types.ObjectId();
    const res = await request(app)
        .delete(`/post/${fakePostId}/comment/${fakeCommentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated content for non-existent comment' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Post not found');
  });

  it('should return 404 when deleting a non existing comment', async () => {
    const fakeCommentId = new mongoose.Types.ObjectId();

    const res = await request(app)
        .delete(`/post/${postId}/comment/${fakeCommentId}`)
        .set('Authorization', token)
        .send({ content: 'Updated content for non-existent comment' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Comment not found');
  });

  it('should return 500 if an error occurs during deleting a comments', async () => {
    jest.spyOn(Comment, 'findByIdAndDelete').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const comment = new Comment<Partial<IComment>>({
      content: 'Old Comment',
      author: userId,
      postId,
    });
    await comment.save();

    const res = await request(app)
        .delete(`/post/${postId}/comment/${comment._id}`)
        .set('Authorization', token)
        .send({ content: 'Updated Comment' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
  });

  it('should return 404 when deleting all comments of a post', async () => {
    const fakePostId = new mongoose.Types.ObjectId();

    const res = await request(app)
        .delete(`/post/${fakePostId}/comment`)
        .set('Authorization', token);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Post not found');
  });

  it('should return 500 if an error occurs during deleting a comments', async () => {
    jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
        .delete(`/post/${postId}/comment`)
        .set('Authorization', token);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Database error');

    jest.restoreAllMocks();
  });

});