'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useWallet } from '@/lib/context/WalletContext';
import { useSocket } from '@/lib/context/SocketContext';
import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Import modular components
import {
  MessageHeader,
  MessagesList,
  MessageInput,
  ConversationsList,
  LoadingState,
  Conversation,
} from '@/components/messages';

// Import custom hooks
import {
  useConversations,
  useMessages,
  useMessageSender,
  useMediaUpload,
  useTypingIndicator,
  useSocketEvents,
  useDirectMessage,
  useConversationManager,
} from './hooks';

// Import utilities
import { formatTime } from './utils';

export default function MessagesPageContent() {
  const { user } = useWallet();
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const targetUsername = searchParams?.get('user');

  // Conversations management
  const {
    conversations,
    isLoading,
    fetchConversations,
    updateConversationLastMessage,
  } = useConversations(user?.id);

  // Conversation selection management
  const {
    selectedChat,
    selectConversation: selectChat,
    clearSelection,
  } = useConversationManager(socket, isConnected);

  // Messages management
  const {
    messages,
    fetchMessages,
    addMessage,
    replaceMessage,
    removeMessage,
    clearMessages,
  } = useMessages();

  // Message sending
  const { newMessage, setNewMessage, sendMessage: sendMessageRequest } = useMessageSender();

  // Media upload
  const {
    mediaUrls,
    isUploading,
    handleImageUpload,
    removeImage,
    clearMedia,
  } = useMediaUpload();

  // Typing indicator
  const {
    typingUsers,
    setTypingUsers,
    handleTyping,
    clearTypingUsers,
  } = useTypingIndicator(socket, selectedChat, user?.id);

  // Direct message handling
  const { isCreatingConversation } = useDirectMessage({
    userId: user?.id,
    targetUsername,
    conversations,
    onSelectConversation: handleSelectConversation,
    onConversationsRefresh: fetchConversations,
  });

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  // Handle new message from socket
  const handleNewMessage = useCallback((message: any) => {
    addMessage(message);
    updateConversationLastMessage(message);
  }, [addMessage, updateConversationLastMessage]);

  // Handle typing indicator from socket
  const handleTypingChange = useCallback((userId: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      if (isTyping) {
        return prev.includes(userId) ? prev : [...prev, userId];
      } else {
        return prev.filter(id => id !== userId);
      }
    });
  }, [setTypingUsers]);

  // Socket events
  useSocketEvents({
    socket,
    user,
    selectedChat,
    onNewMessage: handleNewMessage,
    onTypingChange: handleTypingChange,
  });

  // Handle conversation selection
  function handleSelectConversation(conversation: Conversation) {
    clearTypingUsers();
    clearMessages();
    selectChat(conversation);
    fetchMessages(conversation.id, user!.id, socket, isConnected);
  }

  // Handle message send
  async function handleSendMessage() {
    if (!selectedChat || !user || (!newMessage.trim() && mediaUrls.length === 0)) return;

    const tempMessage = await sendMessageRequest({
      conversationId: selectedChat,
      user,
      content: newMessage.trim(),
      mediaUrls,
      onSuccess: replaceMessage,
      onError: removeMessage,
      onUpdateConversation: updateConversationLastMessage,
    });

    if (tempMessage) {
      addMessage(tempMessage);
      setNewMessage('');
      clearMedia();
    }
  }

  if (isLoading || isCreatingConversation) {
    return (
      <MainLayout>
        <LoadingState 
          message={isCreatingConversation ? 'Starting conversation...' : 'Loading messages...'}
        />
      </MainLayout>
    );
  }

  if (selectedChat) {
    const currentConversation = conversations.find(c => c.id === selectedChat);
    const otherUser = currentConversation?.otherUser || 
      currentConversation?.participants.find(p => p.id !== user?.id);

    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
          <MessageHeader
            otherUser={otherUser}
            isConnected={isConnected}
            typingUsers={typingUsers}
            onBack={clearSelection}
          />

          <MessagesList
            messages={messages}
            currentUser={user}
            otherUser={otherUser}
            typingUsers={typingUsers}
            onFormatTime={formatTime}
          />

          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            mediaUrls={mediaUrls}
            onRemoveImage={removeImage}
            onImageUpload={handleImageUpload}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            isUploading={isUploading}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ConversationsList
        conversations={conversations}
        currentUser={user}
        onSelectConversation={handleSelectConversation}
        onFormatTime={formatTime}
      />
    </MainLayout>
  );
}
