import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from '@google/genai';

interface AuditReport {
  findingType: string;
  narrative: string;
  facts: string;
  evidence: string;
  impact: string;
  solution: string;
  seniorNotes: string;
}

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [object, setObject] = useState('');
  const [reference, setReference] = useState('');

  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('gemini-api-key', newKey);
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Harap masukkan Gemini API Key Anda.');
      return;
    }

    if (!problem || !location || !object || !reference) {
      setError('Harap isi semua kolom untuk menghasilkan temuan.');
      return;
    }
    setError('');
    setLoading(true);
    setAuditReport(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = `Anda adalah PLOR Audit Senior, auditor berpengalaman dalam audit mutu internal ISO 9001:2015. Tugas Anda adalah mengubah draft temuan audit dalam format PLOR (Problem, Location, Objective, Reference) menjadi laporan audit profesional yang lengkap dan terstruktur.

# Instruksi Lengkap
1.  **Analisis Input**: Baca data PLOR yang diberikan.
2.  **Tentukan Jenis Temuan**: Berdasarkan tingkat keparahan, klasifikasikan temuan sebagai "Mayor", "Minor", atau "Observasi".
3.  **Pilih Klausul ISO**: Pilih satu klausul ISO 9001:2015 yang paling relevan dengan masalah yang diidentifikasi.
4.  **Tulis Narasi PLOR**: Buat satu paragraf narasi yang utuh. Gabungkan informasi dari 'Problem', 'Location', dan 'Objective'. Di dalam narasi ini, sebutkan secara eksplisit **Reference internal** yang dilanggar dan **klausul ISO 9001:2015** yang relevan yang telah Anda pilih.
5.  **Buat Analisis Detail**: Tuliskan analisis terpisah untuk poin-poin berikut:
    *   **Fakta**: Apa yang sebenarnya terjadi.
    *   **Bukti**: Bagaimana Anda tahu ini terjadi (misalnya, wawancara, dokumen).
    *   **Dampak**: Apa konsekuensi dari masalah ini.
    *   **Solusi**: Rekomendasi perbaikan yang konkret.
6.  **Tulis Catatan Asisten Temuan**: Buat paragraf penjelasan mendalam yang mencakup:
    *   Justifikasi mengapa temuan dikategorikan sebagai Mayor/Minor/Observasi.
    *   Alasan pemilihan klausul ISO spesifik tersebut.
    *   Penjelasan bagaimana Reference internal yang ada seharusnya mencegah masalah ini.

# Data Input dari Auditor
- **Problem/Kondisi:** ${problem}
- **Lokasi:** ${location}
- **Objek:** ${object}
- **Referensi yang Dilanggar:** ${reference}

# Format Output
Pastikan output adalah objek JSON yang valid sesuai dengan skema yang diminta, di mana setiap field adalah string teks yang lengkap dan profesional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              findingType: { type: Type.STRING, description: 'Jenis Temuan: "Mayor", "Minor", atau "Observasi".' },
              narrative: { type: Type.STRING, description: 'Paragraf narasi PLOR utuh dengan Reference internal + klausul ISO.' },
              facts: { type: Type.STRING, description: 'Analisis Fakta.' },
              evidence: { type: Type.STRING, description: 'Analisis Bukti.' },
              impact: { type: Type.STRING, description: 'Analisis Dampak.' },
              solution: { type: Type.STRING, description: 'Analisis Solusi.' },
              seniorNotes: { type: Type.STRING, description: 'Penjelasan mendalam dari Catatan Asisten Temuan.' }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setAuditReport(data);

    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menghasilkan temuan. Pastikan API Key Anda valid. AI mungkin memberikan respons yang tidak valid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!auditReport) return;
    const reportText = `Jenis Temuan: ${auditReport.findingType}\n\n${auditReport.narrative}\n\n---\n\nFakta: ${auditReport.facts}\nBukti: ${auditReport.evidence}\nDampak: ${auditReport.impact}\nSolusi: ${auditReport.solution}\n\n---\n\nCatatan Asisten Temuan:\n${auditReport.seniorNotes}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <h1>Generator Temuan Audit (PLOR)</h1>
      <p className="developer-credit">Developed By Dede Hery Suryana</p>
      <p className="description">
        Masukkan detail temuan Anda pada kolom di bawah ini. Asisten Temuan akan membuat laporan audit yang komprehensif.
      </p>

      <div className="form-group api-key-group">
        <label htmlFor="api-key">Gemini API Key</label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Masukkan API Key Anda di sini"
        />
        <p className="api-key-description">
          Dapatkan API Key Anda dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>. Kunci Anda disimpan di browser Anda.
        </p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="problem">Problem / Kondisi</label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Contoh: Ditemukan adanya selisih persediaan barang antara catatan pembukuan dengan hasil stock opname."
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Lokasi</label>
          <textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: Gudang utama perusahaan di Jakarta Pusat."
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="object">Objek</label>
          <textarea
            id="object"
            value={object}
            onChange={(e) => setObject(e.target.value)}
            placeholder="Contoh: Persediaan barang jadi jenis produk A."
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reference">Referensi yang Dilanggar</label>
          <textarea
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Contoh: Prosedur Pengendalian Stok No. PRO-GUD-001, Revisi 2."
            rows={3}
          />
        </div>
      </div>

      <button
        className="generate-button"
        onClick={handleGenerate}
        disabled={loading}
        aria-busy={loading}
      >
        {loading && <div className="spinner"></div>}
        {loading ? 'Menghasilkan...' : 'Generate Temuan'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {auditReport && (
        <div className="result-container" aria-live="polite">
          <div className="result-header">
            <h2>Laporan Temuan Audit</h2>
            <button onClick={handleCopy} className={`copy-button ${copied ? 'copied' : ''}`}>
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
          <div className="report-content">
            <p className="finding-type"><strong>Jenis Temuan:</strong> {auditReport.findingType}</p>
            <p>{auditReport.narrative}</p>
            <hr />
            <div className="analysis-section">
              <p><strong>Fakta:</strong> {auditReport.facts}</p>
              <p><strong>Bukti:</strong> {auditReport.evidence}</p>
              <p><strong>Dampak:</strong> {auditReport.impact}</p>
              <p><strong>Solusi:</strong> {auditReport.solution}</p>
            </div>
            <hr />
            <div className="notes-section">
              <h3>Catatan Asisten Temuan</h3>
              <p>{auditReport.seniorNotes}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);