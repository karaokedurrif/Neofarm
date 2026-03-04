'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

/* ── Canned "AI" responses ────────────────────────── */
const RESPONSES: Record<string, string> = {
  hola: '¡Hola! 🌱 Soy Seedy, tu asistente avícola. ¿En qué puedo ayudarte hoy?',
  capón: 'El capón es un gallo castrado antes de la madurez sexual, criado en extensivo durante ~8 meses. Se comercializa como producto gourmet de Navidad, alcanzando 30-45€/kg en canal. ¿Quieres que te ayude con el plan de producción?',
  huevos: 'La producción eco de huevos requiere 4m² de parque por gallina (normativa UE). Con Castellana Negra espera ~200 huevos/año. Si quieres maximizar puesta, cruza con Plymouth Rock.',
  raza: 'Las razas autóctonas que trabajamos: Castellana Negra (CN), Prat Leonada (PL). Para cruces F1, Plymouth Rock (PR) es ideal por aportar masa corporal y rusticidad. Ve a /genetics para ver el pipeline.',
  alimentación: 'En extensivo eco: 60-70% pienso ecológico + 30-40% pastoreo. En finición de capones: épinette con mezcla de leche, harina y sebo durante 4-6 semanas. Ve a /nutrition para formular raciones.',
  genética: 'La genética en OvoSfera trabaja con cruces F1 (CN×PR, CN×PL+PR). La heterosis típica es +10-15% peso. Puedes simular cruces en /simulator y ver el pipeline completo en /genetics.',
  ayuda: '¡Claro! Puedo ayudarte con:\n• 🐔 Razas y genética\n• 🥚 Producción de huevos\n• 🍗 Producción de capones\n• 🌿 Alimentación y nutrición\n• 📊 Análisis de datos\n• 💰 Rentabilidad\n\nEscribe tu pregunta y haré lo que pueda.',
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return val;
  }
  return '🌱 Todavía estoy aprendiendo. En la próxima versión podré responder a eso consultando los datos de tu granja. Por ahora, explora los módulos del Hub: /aves, /genetics, /nutrition, /production…';
}

/* ══════════════════════════════════════════════════════ */
export default function SeedyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'seedy'; text: string }[]>([
    { role: 'seedy', text: '¡Hola! 🌱 Soy Seedy, el asistente IA de OvoSfera. Pregúntame lo que quieras sobre avicultura, genética, nutrición o gestión de tu granja.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'seedy', text: getResponse(text) }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Seedy IA"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 900,
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #22C55E, #10B981)',
            color: '#fff', fontSize: 28, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(34,197,94,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🌱
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 900,
          width: 360, height: 480, display: 'flex', flexDirection: 'column',
          background: 'var(--neutral-900)', border: '1px solid var(--neutral-700)',
          borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #22C55E, #10B981)', color: '#fff', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🌱</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>Seedy IA</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>Asistente avícola · v0.1</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4,
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '8px 12px', borderRadius: 12,
                background: m.role === 'user' ? 'var(--primary-500)' : 'var(--neutral-800)',
                color: m.role === 'user' ? '#fff' : 'var(--neutral-100)',
                fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div style={{
                alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 12,
                background: 'var(--neutral-800)', fontSize: 20, letterSpacing: 4,
              }}>
                ···
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 12px', borderTop: '1px solid var(--neutral-700)',
            display: 'flex', gap: 8, flexShrink: 0,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Pregunta a Seedy…"
              style={{
                flex: 1, background: 'var(--neutral-800)', border: '1px solid var(--neutral-600)',
                borderRadius: 10, padding: '8px 12px', color: 'var(--neutral-100)',
                fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={send} disabled={!input.trim()} style={{
              background: 'var(--primary-500)', border: 'none', borderRadius: 10,
              padding: '8px 12px', color: '#fff', cursor: 'pointer',
              opacity: input.trim() ? 1 : 0.5,
            }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
