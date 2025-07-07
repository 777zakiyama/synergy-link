import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useRoute, RouteProp } from '@react-navigation/native';
import { sendMessage, setupMessageListener, auth } from '../services/firebase';
import { User, ChatMessage } from '../services/types';

type ChatScreenRouteProp = RouteProp<{
  Chat: {
    matchId: string;
    partner: User & { uid: string };
  };
}, 'Chat'>;

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const route = useRoute<ChatScreenRouteProp>();
  const { matchId } = route.params;

  useEffect(() => {
    const unsubscribe = setupMessageListener(matchId, (firebaseMessages: ChatMessage[]) => {
      const giftedChatMessages: IMessage[] = firebaseMessages.map(msg => ({
        _id: msg._id,
        text: msg.text,
        createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(),
        user: {
          _id: msg.user._id,
          name: msg.user.name,
          avatar: msg.user.avatar,
        },
      }));
      
      setMessages(giftedChatMessages);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [matchId]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const message = newMessages[0];
    if (message && message.text) {
      try {
        await sendMessage(matchId, message.text);
      } catch (error) {
        console.log('Send message error:', error);
      }
    }
  }, [matchId]);

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: currentUser.uid,
        }}
        placeholder="メッセージを入力..."
        showUserAvatar
        renderUsernameOnMessage
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ChatScreen;
