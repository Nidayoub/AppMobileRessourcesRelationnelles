import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Comment } from '../data/resources';

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string, text: string) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply,
  depth = 0 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const maxDepth = 2;

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <View style={[styles.container, { marginLeft: depth * 16 }]}>
      <View style={styles.commentHeader}>
        <Text style={styles.author}>{comment.author}</Text>
        <Text style={styles.date}>{comment.date}</Text>
      </View>
      
      <Text style={styles.commentText}>{comment.text}</Text>
      
      {depth < maxDepth && onReply && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => setShowReplyInput(!showReplyInput)}
          >
            <MaterialIcons name="reply" size={16} color="#757575" />
            <Text style={styles.replyButtonText}>Répondre</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {showReplyInput && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Votre réponse..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <View style={styles.replyActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowReplyInput(false);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sendButton, !replyText.trim() && styles.disabledButton]}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <Text style={[styles.sendButtonText, !replyText.trim() && styles.disabledButtonText]}>
                Répondre
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
              depth={depth + 1} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  commentText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  replyContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  replyInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    fontSize: 14,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#757575',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  sendButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#F5F5F5',
  },
  repliesContainer: {
    marginTop: 8,
  },
});

export default CommentItem; 