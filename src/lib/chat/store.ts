import { create } from 'zustand'
import type { ChatMessage, ChatSuggestion } from './types'

interface ChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingMessageId: string | null
  inputValue: string
  suggestions: ChatSuggestion[]
  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  startStreaming: (messageId: string) => void
  appendStreamChunk: (messageId: string, chunk: string) => void
  completeStreaming: (messageId: string) => void
  setInput: (value: string) => void
  setSuggestions: (suggestions: ChatSuggestion[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  inputValue: '',
  suggestions: [],

  addMessage: (message) => set((s) => ({
    messages: [...s.messages, message],
  })),

  updateMessage: (id, updates) => set((s) => ({
    messages: s.messages.map((m) => m.id === id ? { ...m, ...updates } : m),
  })),

  startStreaming: (messageId) => set({
    isStreaming: true, streamingMessageId: messageId,
  }),

  appendStreamChunk: (messageId, chunk) => set((s) => ({
    messages: s.messages.map((m) =>
      m.id === messageId ? { ...m, content: m.content + chunk } : m
    ),
  })),

  completeStreaming: (messageId) => set((s) => ({
    isStreaming: false, streamingMessageId: null,
    messages: s.messages.map((m) =>
      m.id === messageId ? { ...m, isStreaming: false } : m
    ),
  })),

  setInput: (value) => set({ inputValue: value }),

  setSuggestions: (suggestions) => set({ suggestions }),

  clearMessages: () => set({
    messages: [], isStreaming: false, streamingMessageId: null, inputValue: '',
  }),
}))
