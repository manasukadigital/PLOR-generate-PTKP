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

const LandingPage = ({ onApiKeySubmit }: { onApiKeySubmit: (key: string) => void }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      onApiKeySubmit(localApiKey.trim());
    }
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <h1>Selamat Datang di AI-PLOR</h1>
        <h2>Generator Temuan Audit PLOR Berbasis AI</h2>
        <p className="subtitle">Ubah draf temuan audit Anda menjadi laporan profesional berstandar ISO 9001:2015 dalam hitungan detik. Cerdas, cepat, dan akurat.</p>
      </header>

      <section className="api-gate">
        <h3>Masuk untuk Memulai</h3>
        <p>AI-PLOR menggunakan kekuatan AI untuk mengubah draf menjadi laporan profesional. Masukkan API Key Anda untuk memulai.</p>
        <form onSubmit={handleSubmit} className="api-key-form">
          <input
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            placeholder="Masukkan API Key Anda di sini"
            aria-label="API Key"
          />
          <button type="submit" className="generate-button">Mulai Menggunakan AI-PLOR</button>
        </form>
      </section>

      <section className="how-to-section">
        <h3>Cara Mendapatkan API Key</h3>
        <p className="api-key-security-note">API Key Anda disimpan dengan aman di browser Anda dan tidak pernah dikirim ke server kami.</p>
        <ol className="steps-list">
          <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</li>
          <li>Login menggunakan Akun Google Anda jika diminta.</li>
          <li>Klik tombol <strong>"Get API key"</strong>.</li>
          <li>Pada jendela yang muncul, klik <strong>"Create API key in new project"</strong>.</li>
          <li>Salin (copy) API Key yang baru saja dibuat.</li>
          <li>Tempel (paste) API Key tersebut ke dalam kolom di atas dan klik "Mulai".</li>
        </ol>
      </section>

      <section className="features">
        <h3>Fitur Unggulan</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Analisis AI Cerdas</h4>
            <p>Mengklasifikasikan temuan (Mayor, Minor, Observasi) dan memilih klausul ISO yang relevan secara otomatis.</p>
          </div>
          <div className="feature-card">
            <h4>Laporan Profesional</h4>
            <p>Menghasilkan narasi PLOR yang koheren, analisis fakta, bukti, dampak, dan solusi yang terstruktur.</p>
          </div>
          <div className="feature-card">
            <h4>Hemat Waktu & Tenaga</h4>
            <p>Fokus pada proses audit, biarkan AI menangani penulisan laporan yang membosankan dan berulang.</p>
          </div>
        </div>
      </section>
    </div>
  );
};


const AuditGenerator = ({ apiKey, onChangeApiKey }: { apiKey: string; onChangeApiKey: () => void }) => {
  const [problem, setProblem] = useState('');
  const [location, setLocation] = useState('');
  const [object, setObject] = useState('');
  const [reference, setReference] = useState('');

  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
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
      setError('Terjadi kesalahan. Pastikan API Key Anda valid dan coba lagi. AI mungkin memberikan respons yang tidak valid.');
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
    <div className="generator-container">
      <div className="generator-header">
        <h1>Generator Temuan Audit</h1>
        <button onClick={onChangeApiKey} className="change-key-button">Ganti API Key</button>
      </div>
      <p className="description">
        Masukkan detail temuan Anda pada kolom di bawah ini. Asisten Temuan akan membuat laporan audit yang komprehensif.
      </p>

      <div className="instructions-section">
          <h4>Langkah-Langkah Pengisian</h4>
          <ol className="instructions-list">
            <li>
              <strong>Problem / Kondisi:</strong> 
              Tuliskan ringkasan masalah atau ketidaksesuaian yang ditemukan secara <strong>umum</strong>. Ini adalah pernyataan tingkat tinggi tentang apa yang salah, atau gambaran besar dari kesenjangan antara kondisi aktual dan standar yang diharapkan. <br/>
              <em>Contoh: "Prosedur persetujuan untuk permintaan pembelian tidak diikuti secara konsisten." atau "Ditemukan selisih stok antara catatan sistem dan fisik barang."</em>
            </li>
            <li>
              <strong>Lokasi:</strong> 
              Sebutkan secara spesifik di mana masalah ini ditemukan. Semakin detail lokasinya, semakin jelas ruang lingkup masalahnya. Ini bisa berupa lokasi fisik, digital, atau proses. <br/>
              <em>Contoh Fisik: "Area Gudang Bahan Baku, Rak A5".<br/>Contoh Proses: "Proses rekrutmen karyawan baru".<br/>Contoh Digital: "Folder 'Arsip Kontrak 2023' di server bersama".</em>
            </li>
            <li>
              <strong>Objek:</strong> 
              Sebutkan secara <strong>rinci dan detail</strong> bukti-bukti spesifik yang mendukung 'Problem/Kondisi' yang umum tadi. Ini adalah data mentah temuan Anda yang tak terbantahkan. Cantumkan nomor dokumen, kode barang, atau data spesifik lainnya. <br/>
              <em>Contoh (melanjutkan contoh di atas): "Formulir Permintaan Pembelian No. PO-23-001, PO-23-005, dan PO-23-009 tidak memiliki tanda tangan Manajer Departemen." atau "Hasil stock opname per 31 Oktober 2023 untuk produk A (SKU: XYZ-001) menunjukkan selisih 15 unit."</em>
            </li>
            <li>
              <strong>Referensi yang Dilanggar:</strong> 
              Tuliskan standar, prosedur, atau kriteria yang menjadi acuan audit. Ini adalah "aturan main" yang seharusnya diikuti tetapi tidak dipatuhi. Sebutkan nama dokumen, nomor, revisi, dan klausul atau poin yang relevan. <br/>
              <em>Contoh: "SOP Pembelian Barang (SOP-PUR-01, Revisi 2, Poin 4.3) yang menyatakan bahwa setiap permintaan pembelian di atas Rp 1.000.000 harus disetujui oleh Manajer Departemen."</em>
            </li>
          </ol>
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
      <p className="developer-credit">Developed By Dede Hery Suryana</p>
    </div>
  );
};

const App = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('ai-plor-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('ai-plor-api-key', key);
  };
  
  const handleChangeApiKey = () => {
    setApiKey(null);
    localStorage.removeItem('ai-plor-api-key');
  };

  return (
    <main>
      {apiKey ? (
        <AuditGenerator apiKey={apiKey} onChangeApiKey={handleChangeApiKey} />
      ) : (
        <LandingPage onApiKeySubmit={handleApiKeySubmit} />
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