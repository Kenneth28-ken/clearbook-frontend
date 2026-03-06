import React, { useState, useRef } from 'react';

interface MigrationModalProps {
  onClose: () => void;
  onImport: (products: any[]) => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({ onClose, onImport }) => {
  const [textInput, setTextInput] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeHeader = (h: string) => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (['name', 'item', 'product', 'title', 'description'].includes(lower)) return 'name';
    if (['price', 'sell', 'sellingprice', 'retail', 'amount'].includes(lower)) return 'price';
    if (['cost', 'buy', 'buyingprice', 'purchase'].includes(lower)) return 'costPrice';
    if (['stock', 'qty', 'quantity', 'count', 'inventory'].includes(lower)) return 'stock';
    if (['barcode', 'sku', 'upc', 'ean', 'code', 'id'].includes(lower)) return 'barcode';
    if (['category', 'group', 'department', 'type'].includes(lower)) return 'category';
    return null;
  };

  const parseData = (content: string) => {
    try {
      // Try JSON first
      const json = JSON.parse(content);
      if (Array.isArray(json)) {
        return json.map(item => ({
          name: item.name || item.title || item.product || 'Unknown',
          price: parseFloat(item.price || item.sellingPrice || 0),
          costPrice: parseFloat(item.costPrice || item.buyingPrice || 0),
          stock: parseInt(item.stock || item.quantity || 0),
          category: item.category || 'Uncategorized',
          barcode: item.barcode || item.sku || '',
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now()
        })).filter(i => i.name && !isNaN(i.price));
      }
    } catch (e) {
      // Not JSON, try CSV/TSV
    }

    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];

    // Detect delimiter
    const firstLine = lines[0];
    const delimiters = [',', '\t', ';', '|'];
    let bestDelim = ',';
    let maxCols = 0;

    delimiters.forEach(d => {
      const cols = firstLine.split(d).length;
      if (cols > maxCols) {
        maxCols = cols;
        bestDelim = d;
      }
    });

    // Parse Headers
    const headers = firstLine.split(bestDelim).map(h => normalizeHeader(h.trim()));
    
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle quotes for CSV
      let values: string[] = [];
      if (bestDelim === ',') {
         values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || lines[i].split(',').map(v => v.trim());
      } else {
         values = lines[i].split(bestDelim).map(v => v.trim());
      }

      if (values.length < 2) continue;

      const item: any = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        category: 'Uncategorized',
        stock: 0,
        costPrice: 0,
        barcode: ''
      };

      let hasName = false;
      let hasPrice = false;

      headers.forEach((h, idx) => {
        if (h && values[idx]) {
          if (h === 'price' || h === 'costPrice') {
             item[h] = parseFloat(values[idx].replace(/[^0-9.]/g, '')) || 0;
             if (h === 'price') hasPrice = true;
          } else if (h === 'stock') {
             item[h] = parseInt(values[idx].replace(/[^0-9]/g, '')) || 0;
          } else {
             item[h] = values[idx];
             if (h === 'name') hasName = true;
          }
        }
      });

      // Fallback if no headers matched but we have columns
      if (!hasName && values[0]) { item.name = values[0]; hasName = true; }
      if (!hasPrice && values[1]) { item.price = parseFloat(values[1]) || 0; hasPrice = true; }

      if (hasName) results.push(item);
    }

    return results;
  };

  const handleProcess = () => {
    const data = parseData(textInput);
    if (data.length === 0) {
      alert("Could not parse data. Please ensure you have headers like 'Name', 'Price', etc.");
      return;
    }
    setParsedData(data);
    setStep('PREVIEW');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTextInput(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Migration Assistant</h2>
            <p className="text-blue-100 text-sm font-medium">Universal Data Importer</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'INPUT' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                  <h3 className="font-black text-blue-900 uppercase mb-2">Option 1: Upload File</h3>
                  <p className="text-xs text-blue-600 mb-4">Supports CSV, JSON, TXT, Excel (saved as CSV)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.json,.txt"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {fileName || "Select File..."}
                  </button>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
                  <h3 className="font-black text-purple-900 uppercase mb-2">Option 2: Copy & Paste</h3>
                  <p className="text-xs text-purple-600 mb-4">Paste directly from Excel, Google Sheets, or another app</p>
                  <div className="h-12 flex items-center text-purple-400 text-sm italic">
                    Paste data below...
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-400 tracking-widest mb-2">Data Preview / Paste Area</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full h-64 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-xs focus:border-blue-500 outline-none resize-none"
                  placeholder="Name, Price, Category, Stock&#10;Burger, 1500, Food, 50&#10;Coke, 300, Drinks, 100..."
                ></textarea>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-gray-900 uppercase">Preview: {parsedData.length} Items Found</h3>
                <button onClick={() => setStep('INPUT')} className="text-sm text-gray-500 hover:text-gray-900 underline">Back to Input</button>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Barcode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedData.slice(0, 50).map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3">{item.price}</td>
                        <td className="p-3 text-gray-500">{item.category}</td>
                        <td className="p-3 text-gray-500">{item.stock}</td>
                        <td className="p-3 font-mono text-xs text-gray-400">{item.barcode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 border-t">
                    ...and {parsedData.length - 50} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          {step === 'INPUT' ? (
            <button 
              onClick={handleProcess}
              disabled={!textInput.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              Analyze Data
            </button>
          ) : (
            <button 
              onClick={() => { onImport(parsedData); onClose(); }}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-green-500 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Complete Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationModal;
