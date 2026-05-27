'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  apiGetMessages,
  apiGetThreads,
  apiSendMessage,
} from '@/lib/api';

type Thread = {
  id: string;
  name: string;
  initials: string;
  last: string;
  time: string;
  unread: number;
  job?: string;
  online?: boolean;
  recipientId?: string;
};

type Message = {
  id?: string;
  from: 'me' | 'them';
  text: string;
  time: string;
};

export default function MessagesPage() {
  const [threads, setThreads] =
    useState<Thread[]>([]);

  const [active, setActive] =
    useState<string>('');

  const [messages, setMessages] =
    useState<
      Record<string, Message[]>
    >({});

  const [input, setInput] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState('');

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const activeThread = useMemo(
    () =>
      threads.find(
        (t) => t.id === active
      ),
    [threads, active]
  );

  const currentMessages =
    messages[active] ?? [];

  /* =========================================================
     LOAD THREADS
  ========================================================= */

  useEffect(() => {
    async function loadThreads() {
      setLoading(true);

      const res =
        await apiGetThreads();

      if (
        res.status === 'error'
      ) {
        setError(
          res.error ??
            'Failed to load messages'
        );

        setLoading(false);

        return;
      }

      const mapped =
        (res.data ?? []).map(
          (t: any) => ({
            id: t.id,
            name:
              t.name ??
              'Unknown User',
            initials:
              t.initials ??
              'VT',
            last:
              t.last ??
              'No messages yet',
            time:
              t.time ??
              '',
            unread:
              t.unread ?? 0,
            job: t.job,
            online:
              t.online ??
              false,
            recipientId:
              t.recipient_id,
          })
        );

      setThreads(mapped);

      if (mapped.length > 0) {
        setActive(mapped[0].id);
      }

      setLoading(false);
    }

    loadThreads();
  }, []);

  /* =========================================================
     LOAD MESSAGES
  ========================================================= */

  useEffect(() => {
    if (!active) return;

    async function loadMessages() {
      const res =
        await apiGetMessages(
          active
        );

      if (
        res.status === 'error'
      ) {
        return;
      }

      const mapped: Message[] =
        (res.data ?? []).map(
          (m: any): Message => ({
            id: m.id,
            from:
              m.sender === 'me'
                ? 'me'
                : 'them',
            text:
              m.content ??
              '',
            time:
              m.time ??
              '',
          })
        );

      setMessages((prev) => ({
        ...prev,
        [active]: mapped,
      }));
    }

    loadMessages();
  }, [active]);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
      }
    );
  }, [currentMessages]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function send() {
    if (!input.trim()) return;

    if (!activeThread) return;

    const content =
      input.trim();

    const optimistic: Message =
      {
        from: 'me',
        text: content,
        time: 'Just now',
      };

    setMessages((prev) => ({
      ...prev,
      [active]: [
        ...(prev[active] ??
          []),
        optimistic,
      ],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === active
          ? {
              ...t,
              last: content,
              time: 'Just now',
            }
          : t
      )
    );

    setInput('');

    setSending(true);

    const res =
      await apiSendMessage(
        active,
        activeThread.recipientId ??
          '',
        content
      );

    setSending(false);

    if (
      res.status === 'error'
    ) {
      console.error(
        res.error
      );
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          padding: '2rem',
        }}
      >
        Loading messages...
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          color:
            'var(--danger)',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        height:
          'calc(100vh - 140px)',
        display: 'flex',
        flexDirection:
          'column',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          marginBottom: '1rem',
        }}
      >
        <h2
          style={{
            fontFamily:
              'var(--font-display)',
            fontSize: 24,
            marginBottom: 4,
          }}
        >
          Messages
        </h2>

        <p
          style={{
            fontSize: 13,
            color:
              'var(--muted)',
          }}
        >
          {threads.reduce(
            (s, t) =>
              s + t.unread,
            0
          )}{' '}
          unread messages
        </p>
      </div>

      {/* LAYOUT */}

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns:
            '320px 1fr',
          border:
            '1px solid var(--border-2)',
          borderRadius:
            'var(--radius-lg)',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* SIDEBAR */}

        <div
          style={{
            borderRight:
              '1px solid var(--border)',
            overflowY: 'auto',
            background:
              'rgba(1,12,38,0.5)',
          }}
        >
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() =>
                setActive(t.id)
              }
              style={{
                padding:
                  '14px 16px',
                cursor: 'pointer',
                borderBottom:
                  '1px solid var(--border)',
                background:
                  active === t.id
                    ? 'rgba(6,182,212,0.08)'
                    : 'transparent',
                borderLeft:
                  active === t.id
                    ? '3px solid var(--cyan)'
                    : '3px solid transparent',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius:
                        '50%',
                      background:
                        'linear-gradient(135deg,var(--navy-3),var(--cyan))',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      fontWeight: 600,
                    }}
                  >
                    {t.initials}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <span>
                      {t.name}
                    </span>

                    <span
                      style={{
                        fontSize: 10,
                        color:
                          'var(--muted)',
                      }}
                    >
                      {t.time}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color:
                        'var(--muted)',
                      overflow:
                        'hidden',
                      textOverflow:
                        'ellipsis',
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {t.last}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHAT */}

        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            minHeight: 0,
            background:
              'rgba(2,15,46,0.4)',
          }}
        >
          {/* CHAT HEADER */}

          <div
            style={{
              padding:
                '14px 20px',
              borderBottom:
                '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {activeThread?.name}
            </div>

            <div
              style={{
                fontSize: 11,
                color:
                  'var(--muted)',
              }}
            >
              {activeThread?.job}
            </div>
          </div>

          {/* MESSAGES */}

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding:
                '1.25rem',
              display: 'flex',
              flexDirection:
                'column',
              gap: 10,
            }}
          >
            {currentMessages.map(
              (m, i) => (
                <div
                  key={i}
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      m.from ===
                      'me'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth:
                        '70%',
                      padding:
                        '10px 14px',
                      borderRadius:
                        m.from ===
                        'me'
                          ? '14px 14px 4px 14px'
                          : '14px 14px 14px 4px',
                      background:
                        m.from ===
                        'me'
                          ? 'linear-gradient(135deg,var(--cyan),var(--cyan-2))'
                          : 'rgba(255,255,255,0.06)',
                      border:
                        m.from ===
                        'me'
                          ? 'none'
                          : '1px solid var(--border)',
                      color:
                        m.from ===
                        'me'
                          ? 'var(--navy)'
                          : 'var(--white)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {m.text}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 4,
                        opacity: 0.7,
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              )
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}

          <div
            style={{
              padding: '1rem',
              borderTop:
                '1px solid var(--border)',
              display: 'flex',
              gap: 10,
            }}
          >
            <input
              className="v-input"
              style={{
                flex: 1,
              }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={(e) =>
                e.key ===
                  'Enter' &&
                send()
              }
            />

            <button
              className="btn btn-cyan"
              onClick={send}
              disabled={
                !input.trim() ||
                sending
              }
            >
              {sending
                ? 'Sending...'
                : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}