'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, StatusBar, FlatList,
} from 'react-native';
import { Colors, Shadows } from '../../constants/Colors';
import { MOCK } from '../../lib/api';

const DEMO_MESSAGES: Record<string, { id: string; text: string; mine: boolean; time: string }[]> = {
  'th-001': [
    { id: '1', text: 'Hi Emma, any updates on the kitchen?', mine: false, time: '10:02 AM' },
    { id: '2', text: 'Hey Marcus! Yes — demo is fully done, starting tile layout today.', mine: true, time: '10:15 AM' },
    { id: '3', text: 'Great! The escrow is funded and ready when you hit Phase 2.', mine: false, time: '10:16 AM' },
    { id: '4', text: 'Perfect. I'll send progress photos this afternoon.', mine: true, time: '10:20 AM' },
    { id: '5', text: 'Sounds great, see you Tuesday', mine: false, time: '10:22 AM' },
  ],
  'th-002': [
    { id: '1', text: 'Emma, the tile samples look perfect!', mine: false, time: '9:30 AM' },
    { id: '2', text: 'Glad you love them! Should I proceed with the full order?', mine: true, time: '9:35 AM' },
    { id: '3', text: 'Yes please, go ahead', mine: false, time: '9:37 AM' },
  ],
  'th-003': [
    { id: '1', text: 'Deck looks amazing Emma, thank you so much!', mine: false, time: 'Yesterday' },
    { id: '2', text: 'My pleasure! It was a great project.', mine: true, time: 'Yesterday' },
    { id: '3', text: 'Payment released, thank you!', mine: false, time: 'Yesterday' },
    { id: '4', text: 'Received, thanks Robert! Left you a 5-star review ⭐', mine: true, time: 'Yesterday' },
  ],
};

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: { text: string; mine: boolean; time: string } }) {
  return (
    <View style={[styles.bubbleRow, msg.mine && styles.bubbleRowMine]}>
      {!msg.mine && <View style={styles.bubbleAvatar} />}
      <View style={[styles.bubble, msg.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, msg.mine && styles.bubbleTextMine]}>{msg.text}</Text>
        <Text style={[styles.bubbleTime, msg.mine && styles.bubbleTimeMine]}>{msg.time}</Text>
      </View>
    </View>
  );
}

// ── Thread row ────────────────────────────────────────────────────────────────
function ThreadRow({ thread, onPress }: { thread: typeof MOCK.threads[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.threadRow, Shadows.card]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{thread.avatar}</Text>
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadHeaderRow}>
          <Text style={styles.threadName}>{thread.with}</Text>
          <Text style={styles.threadTime}>{thread.time}</Text>
        </View>
        <Text style={styles.threadLast} numberOfLines={1}>{thread.last}</Text>
      </View>
      {thread.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{thread.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Chat view ─────────────────────────────────────────────────────────────────
function ChatView({ thread, onBack }: { thread: typeof MOCK.threads[0]; onBack: () => void }) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState(DEMO_MESSAGES[thread.id] || []);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM');
    setMessages(prev => [...prev, { id: String(Date.now()), text: text.trim(), mine: true, time }]);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={styles.screen}>
      {/* Chat header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAvatarSmall}>
          <Text style={styles.chatAvatarText}>{thread.avatar}</Text>
        </View>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatName}>{thread.with}</Text>
          <Text style={styles.chatStatus}>🟢 Online</Text>
        </View>
        <TouchableOpacity style={styles.escrowChip}>
          <Text style={styles.escrowChipText}>🔐 Escrow</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chatDateDivider}>
          <Text style={styles.chatDateText}>Today</Text>
        </View>
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            placeholder="Message..."
            placeholderTextColor={Colors.text.faint}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
            onPress={sendMessage}
          >
            <Text style={[styles.sendIcon, text.trim() && styles.sendIconActive]}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Main Messages Screen ──────────────────────────────────────────────────────
export default function MessagesScreen() {
  const [activeThread, setActiveThread] = useState<typeof MOCK.threads[0] | null>(null);
  const [search, setSearch] = useState('');

  if (activeThread) {
    return <ChatView thread={activeThread} onBack={() => setActiveThread(null)} />;
  }

  const filtered = MOCK.threads.filter(t =>
    t.with.toLowerCase().includes(search.toLowerCase()) ||
    t.last.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy.deepest} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.unreadTotal}>
          <Text style={styles.unreadTotalText}>{MOCK.threads.reduce((s, t) => s + t.unread, 0)}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.text.faint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Thread list */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map(t => (
          <ThreadRow key={t.id} thread={t} onPress={() => setActiveThread(t)} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySub}>Apply to a job or start a project to begin messaging</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:            { flex: 1, backgroundColor: Colors.navy.deepest },
  header:            { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:       { color: Colors.text.white, fontSize: 26, fontWeight: '800', flex: 1 },
  unreadTotal:       { backgroundColor: Colors.gold.main, borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadTotalText:   { color: Colors.navy.deepest, fontSize: 12, fontWeight: '800' },
  searchBar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.navy.card, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.navy.border },
  searchIcon:        { fontSize: 16, marginRight: 8 },
  searchInput:       { flex: 1, color: Colors.text.white, fontSize: 15 },
  listContent:       { paddingHorizontal: 16, paddingBottom: 100 },
  threadRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.navy.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.navy.border },
  avatarCircle:      { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.navy.hover, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: Colors.gold.dim, position: 'relative' },
  avatarText:        { color: Colors.gold.text, fontSize: 14, fontWeight: '700' },
  onlineDot:         { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.status.active, borderWidth: 2, borderColor: Colors.navy.card },
  threadInfo:        { flex: 1 },
  threadHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  threadName:        { color: Colors.text.white, fontSize: 15, fontWeight: '600' },
  threadTime:        { color: Colors.text.faint, fontSize: 11 },
  threadLast:        { color: Colors.text.muted, fontSize: 13 },
  unreadBadge:       { backgroundColor: Colors.gold.main, borderRadius: 11, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, marginLeft: 8 },
  unreadText:        { color: Colors.navy.deepest, fontSize: 11, fontWeight: '800' },
  emptyState:        { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:         { fontSize: 48, marginBottom: 12 },
  emptyTitle:        { color: Colors.text.white, fontSize: 18, fontWeight: '700' },
  emptySub:          { color: Colors.text.muted, fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },

  // Chat view
  chatHeader:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.navy.border, gap: 10 },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.navy.card, alignItems: 'center', justifyContent: 'center' },
  backArrow:         { color: Colors.gold.text, fontSize: 20, fontWeight: '700' },
  chatAvatarSmall:   { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.navy.hover, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.gold.dim },
  chatAvatarText:    { color: Colors.gold.text, fontSize: 12, fontWeight: '700' },
  chatHeaderInfo:    { flex: 1 },
  chatName:          { color: Colors.text.white, fontSize: 15, fontWeight: '700' },
  chatStatus:        { color: Colors.text.muted, fontSize: 11 },
  escrowChip:        { backgroundColor: Colors.status.active + '22', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.status.active + '66' },
  escrowChipText:    { color: Colors.status.active, fontSize: 11, fontWeight: '600' },
  chatScroll:        { flex: 1 },
  chatScrollContent: { padding: 16, paddingBottom: 8 },
  chatDateDivider:   { alignItems: 'center', marginBottom: 16 },
  chatDateText:      { color: Colors.text.faint, fontSize: 12, backgroundColor: Colors.navy.card, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  bubbleRow:         { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  bubbleRowMine:     { justifyContent: 'flex-end' },
  bubbleAvatar:      { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.navy.hover, marginRight: 8 },
  bubble:            { maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleTheirs:      { backgroundColor: Colors.navy.card, borderWidth: 1, borderColor: Colors.navy.border, borderBottomLeftRadius: 4 },
  bubbleMine:        { backgroundColor: Colors.gold.main, borderBottomRightRadius: 4 },
  bubbleText:        { color: Colors.text.white, fontSize: 14, lineHeight: 20 },
  bubbleTextMine:    { color: Colors.navy.deepest },
  bubbleTime:        { color: Colors.text.faint, fontSize: 10, marginTop: 4, textAlign: 'right' },
  bubbleTimeMine:    { color: Colors.navy.mid + 'aa' },
  inputBar:          { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: Colors.navy.border, backgroundColor: Colors.navy.deep, gap: 8 },
  attachBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.navy.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.navy.border },
  chatInput:         { flex: 1, backgroundColor: Colors.navy.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: Colors.text.white, fontSize: 15, borderWidth: 1, borderColor: Colors.navy.border, maxHeight: 100 },
  sendBtn:           { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.navy.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.navy.border },
  sendBtnActive:     { backgroundColor: Colors.gold.main, borderColor: Colors.gold.main },
  sendIcon:          { color: Colors.text.muted, fontSize: 18, fontWeight: '700' },
  sendIconActive:    { color: Colors.navy.deepest },
});
