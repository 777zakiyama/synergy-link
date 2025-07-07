import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useRoute, RouteProp } from '@react-navigation/native';
import { sendMessage, setupMessageListener, auth } from '../services/firebase';
import { User, ChatMessage } from '../services/types';
import { showErrorAlert } from '../utils/errorHandler';

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
  const theme = useTheme();

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
        showErrorAlert('エラー', 'メッセージの送信に失敗しました');
      }
    }
  }, [matchId]);

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

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


export default ChatScreen;
