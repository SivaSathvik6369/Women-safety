import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { api } from '../services/api';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am Aegis AI Safety Assistant. How can I guide or assist you today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const sendQuery = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text.trim());
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: res.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Aegis Safety Bot active. In danger? Press SOS or shake your phone to notify contacts.'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble
              ]}
            >
              <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.botBubble, { paddingVertical: 14 }]}>
              <ActivityIndicator color="#FF4A6B" size="small" />
            </View>
          )}
        </ScrollView>

        {/* Quick Help Shortcuts */}
        <View style={styles.shortcutsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => sendQuery('Find nearest police station in India')}
            >
              <Text style={styles.shortcutText}>👮 Police Station</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => sendQuery('First aid guide for injuries')}
            >
              <Text style={styles.shortcutText}>🩹 First Aid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => sendQuery('Legal safety rights for women in India')}
            >
              <Text style={styles.shortcutText}>⚖️ Legal Rights</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shortcutBtn}
              onPress={() => sendQuery('Self defense tactics')}
            >
              <Text style={styles.shortcutText}>🥋 Self Defense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about security, laws, guidance..."
            placeholderTextColor="#8E8E9E"
            onSubmitEditing={() => sendQuery(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendQuery(inputText)}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#FF4A6B',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#1E1E2C',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 0.5,
    borderColor: '#2F2F45',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: '#E2E2E6',
    fontSize: 14,
    lineHeight: 20,
  },
  shortcutsRow: {
    paddingVertical: 10,
    backgroundColor: '#0F0F1A',
    borderTopWidth: 0.5,
    borderTopColor: '#2F2F45',
  },
  shortcutBtn: {
    backgroundColor: '#1E1E2C',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#3E3E5C',
  },
  shortcutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E1E2C',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2F2F45',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    marginRight: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  sendButton: {
    backgroundColor: '#FF4A6B',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
