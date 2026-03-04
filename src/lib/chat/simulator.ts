import { useChatStore } from './store'
import type { ChatMessage, ChatArtifact, ChatActionButton } from './types'

let msgCounter = 0
export function nextMsgId(): string {
  return `msg-${++msgCounter}-${Date.now()}`
}

/**
 * Simulates LLM streaming by revealing text character-by-character.
 * Returns a cleanup function to cancel.
 */
export function streamResponse(opts: {
  text: string
  artifacts?: ChatArtifact[]
  actions?: ChatActionButton[]
  charDelay?: number
  onComplete?: () => void
}): () => void {
  const { text, artifacts, actions, charDelay = 25, onComplete } = opts
  const store = useChatStore.getState()
  const id = nextMsgId()

  const message: ChatMessage = {
    id, role: 'assistant', content: '', timestamp: new Date().toISOString(),
    isStreaming: true, artifacts: undefined, actions: undefined,
  }
  store.addMessage(message)
  store.startStreaming(id)

  let charIndex = 0
  const interval = setInterval(() => {
    if (charIndex < text.length) {
      // Send 2-3 chars at a time for natural feel
      const chunkSize = Math.min(2 + Math.floor(Math.random() * 2), text.length - charIndex)
      const chunk = text.slice(charIndex, charIndex + chunkSize)
      store.appendStreamChunk(id, chunk)
      charIndex += chunkSize
    } else {
      clearInterval(interval)
      // Attach artifacts and actions after text completes
      store.updateMessage(id, { artifacts, actions })
      store.completeStreaming(id)
      onComplete?.()
    }
  }, charDelay)

  return () => {
    clearInterval(interval)
    store.updateMessage(id, {
      content: text, artifacts, actions, isStreaming: false,
    })
    store.completeStreaming(id)
  }
}

/** Add a user message to the store and return its id */
export function addUserMessage(content: string): string {
  const id = nextMsgId()
  useChatStore.getState().addMessage({
    id, role: 'user', content, timestamp: new Date().toISOString(),
  })
  return id
}

/** Add a system/assistant message instantly (no streaming) */
export function addAssistantMessage(
  content: string,
  artifacts?: ChatArtifact[],
  actions?: ChatActionButton[]
): string {
  const id = nextMsgId()
  useChatStore.getState().addMessage({
    id, role: 'assistant', content, timestamp: new Date().toISOString(),
    artifacts, actions,
  })
  return id
}
