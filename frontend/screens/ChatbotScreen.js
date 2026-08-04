import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am Aegis AI Safety Assistant. How can I guide or help you today?' }
  ]);
  const [inputText, setInputText] = useState('');

  const sendQuery = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: messages.length + 1, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate response call to AI Service Chatbot
    setTimeout(() => {
      let response = "I'm checking emergency guidelines for you. Please let me know if you need to dispatch SOS.";
      const query = text.toLowerCase();
      
      if (query.includes('police')) {
        response = "The nearest police station is at 12th Avenue, Main Block (450m). Dial 112 for direct dispatch.";
      } else if (query.includes('first aid') || query.includes('bleed') || query.includes('hurt')) {
        response = "Apply firm pressure to the wound. Keep the area elevated. Call ambulance services at 102/108.";
      } else if (query.includes('law') || query.includes('rights')) {
        response = "Under Section 354 IPC, women have the right to file Zero FIR from any police station. Legal help is free.";
      }

      const botMsg = { id: messages.length + 2, sender: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Messages Stream */}
        <ScrollView contentContainerStyle={styles.messagesContainer}>
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
        </ScrollView>

        {/* Quick Help Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity style={styles.shortcutBtn} onPress={() => sendQuery("Find nearest police station")}>
            <Text style={styles.shortcutText}>👮 Police Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutBtn} onPress={() => sendQuery("First aid guide")}>
            <Text style={styles.shortcutText}>🩹 First Aid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutBtn} onPress={() => sendQuery("Legal rights information")}>
            <Text style={styles.shortcutText}>⚖️ Legal Rights</Text>
          </TouchableOpacity>
        </View>

        {/* Typing Bar */}
        <View style={styles.inputBar}>
          <TextInput 
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about security, laws, navigation..."
            placeholderTextColor="#8E8E9E"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendQuery(inputText)}>
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
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 15,
    padding: 12,
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
  },
  botText: {
    color: '#E2E2E6',
    fontSize: 14,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#0F0F1A',
    borderTopWidth: 0.5,
    borderTopColor: '#2F2F45',
  },
  shortcutBtn: {
    backgroundColor: '#1E1E2C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#3E3E5C',
  },
  shortcutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E1E2C',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    marginRight: 10,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#FF4A6B',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
