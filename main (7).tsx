import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine,
} from 'recharts';
import { SimulationResponse } from './types';

export default function App() {
  const [accessionId, setAccessionId] = useState<string>('');
  const [dnaConcentration, setDnaConcentration] = useState<number>(5e-5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResponse | null>(null);

  const handleSimulate = async () => {
    if (!accessionId.trim()) {
      setError('Введите NCBI Accession ID');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accession_id: accessionId.trim(),
          dna_concentration: dnaConcentration,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail ?? 'Ошибка получения данных с сервера');
      }
      const data: SimulationResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Симулятор термического поведения ДНК
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Численный расчёт температуры плавления по модели ближайшего соседа
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Параметры расчёта
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NCBI Accession ID
              </label>
              <input
                type="text"
                value={accessionId}
                onChange={(e) => setAccessionId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSimulate()}
                placeholder="например, U49845"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Концентрация ДНК (M)
              </label>
              <input
                type="number"
                value={dnaConcentration}
                onChange={(e) => setDnaConcentration(parseFloat(e.target.value))}
                step="0.00001"
                min="0.000001"
                placeholder="0.00005"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-400 mt-1">По умолчанию: 0.00005 (5×10⁻⁵ M)</p>
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Загрузка данных из NCBI...
                </>
              ) : (
                'Рассчитать'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            <span className="font-semibold">Ошибка: </span>{error}
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Длина цепи
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {result.length.toLocaleString('ru-RU')}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">п.н.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  GC-состав
                </p>
                <p className="text-3xl font-bold text-gray-900">{result.gc_percent}</p>
                <p className="text-sm text-gray-500 mt-0.5">%</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm text-center bg-blue-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">
                  Температура плавления T<sub>m</sub>
                </p>
                <p className="text-3xl font-bold text-blue-700">{result.tm_celsius}</p>
                <p className="text-sm text-blue-500 mt-0.5">°C</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Кривая плавления
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Accession: <span className="font-mono text-gray-600">{result.accession_id}</span>
                &nbsp;·&nbsp;Красная линия — T<sub>m</sub> = {result.tm_celsius} °C
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={result.curve} margin={{ top: 5, right: 20, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="temperature"
                    label={{
                      value: 'Температура (°C)',
                      position: 'insideBottomRight',
                      offset: -5,
                      style: { fontSize: 12, fill: '#9ca3af' },
                    }}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    label={{
                      value: 'Доля расплетенных цепей',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      style: { fontSize: 12, fill: '#9ca3af' },
                    }}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(4), 'Доля расплетенных']}
                    labelFormatter={(label) => `Температура: ${label} °C`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fraction_unfolded"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <ReferenceLine
                    x={result.tm_celsius}
                    stroke="red"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Tm = ${result.tm_celsius}°C`,
                      position: 'top',
                      style: { fontSize: 11, fill: 'red' },
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
