import { useState } from 'react';

interface ContactModalProps {
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  formatDatePT: (date: string) => string;
  onClose: () => void;
}

export default function ContactModal({ checkIn, checkOut, totalPrice, formatDatePT, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message, checkIn, checkOut, totalPrice }),
      });

      if (!res.ok) throw new Error('Falha ao enviar');
      setSuccess(true);
      setTimeout(onClose, 3000);
    } catch {
      setError('Não foi possível enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-izumi-pink focus:outline-none text-sm transition-colors';
  const labelCls = 'block text-sm font-semibold text-izumi-dark mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-izumi-dark">Solicitar Reserva</h2>
            <p className="text-sm text-gray-500 mt-0.5">Chácara Izumi</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h3 className="text-lg font-bold text-izumi-dark mb-2">Interesse enviado!</h3>
            <p className="text-gray-500 text-sm">O proprietário entrará em contato em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Resumo do período */}
            <div className="bg-izumi-cream rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entrada</span>
                <span className="font-semibold text-izumi-dark">{formatDatePT(checkIn)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saída</span>
                <span className="font-semibold text-izumi-dark">{formatDatePT(checkOut)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-izumi-pink/20">
                <span className="text-gray-500">Total estimado</span>
                <span className="font-bold text-izumi-pink text-base">R$ {totalPrice.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Campos */}
            <div>
              <label className={labelCls}>Nome completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Mensagem <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte um pouco sobre o evento, número de pessoas..."
                rows={3}
                className={inputCls + ' resize-none'}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-izumi-pink text-white font-semibold hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm shadow-md"
              >
                {loading ? 'Enviando...' : 'Enviar Interesse'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
