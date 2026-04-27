import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import ticketApi from '../../api/ticketApi';
import { useAuth } from '../../context/AuthContext';

export default function CommentSection({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      const response = await ticketApi.getComments(ticketId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await ticketApi.addComment(ticketId, {
        userId: user.id,
        message: newComment
      });
      setNewComment('');
      fetchComments(); // Refresh list
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to send comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
      <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={20} className="text-indigo-400" />
        Discussion & Updates
      </h3>

      {/* Comment List */}
      <div className="space-y-4" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div 
              key={index} 
              className="animate-slide-up"
              style={{ 
                padding: '16px', 
                background: comment.userId === user.id ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginLeft: comment.userId === user.id ? '40px' : '0',
                marginRight: comment.userId === user.id ? '0' : '40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} />
                  {comment.userId === user.id 
                    ? `You (${user.campusId})` 
                    : (comment.userFullName ? `${comment.userFullName} (${comment.userCampusId})` : `User ID: ${comment.userId.substring(0, 8)}...`)}
                </span>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{comment.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment or update..."
          style={{
            width: '100%',
            padding: '16px 60px 16px 16px',
            background: '#FFFFFF',
            border: '1.5px solid rgba(140, 0, 0, 0.1)',
            borderRadius: '16px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            resize: 'none',
            minHeight: '120px',
            outline: 'none',
            transition: 'all 0.3s var(--ease-out)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
            e.target.style.boxShadow = '0 10px 25px rgba(140, 0, 0, 0.05)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(140, 0, 0, 0.1)';
            e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)';
            e.target.style.transform = 'translateY(0)';
          }}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            padding: '10px',
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            opacity: !newComment.trim() ? 0.5 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {loading ? (
            <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
}
