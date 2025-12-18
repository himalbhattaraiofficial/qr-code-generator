import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Mail, MessageSquare, Link, User, FileText, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const App = () => {
  const [category, setCategory] = useState('URL');
  const [qrData, setQrData] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(200);
  const [qrStyle, setQrStyle] = useState('square');
  const [logo, setLogo] = useState(null);
  const [generatedQR, setGeneratedQR] = useState('');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form states for different categories
  const [formData, setFormData] = useState({
    url: '',
    ssid: '',
    password: '',
    security: 'WPA',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    text: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    smsNumber: '',
    smsMessage: ''
  });

  const categories = [
    { id: 'URL', icon: Link, label: 'URL' },
    { id: 'WiFi', icon: Wifi, label: 'WiFi' },
    { id: 'Contact', icon: User, label: 'Contact' },
    { id: 'Text', icon: FileText, label: 'Text' },
    { id: 'Email', icon: Mail, label: 'Email' },
    { id: 'SMS', icon: MessageSquare, label: 'SMS' }
  ];

  const generateQRData = () => {
    switch (category) {
      case 'URL':
        return formData.url;
      case 'WiFi':
        return `WIFI:T:${formData.security};S:${formData.ssid};P:${formData.password};;`;
      case 'Contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName} ${formData.lastName}\nTEL:${formData.phone}\nEMAIL:${formData.email}\nEND:VCARD`;
      case 'Text':
        return formData.text;
      case 'Email':
        return `mailto:${formData.emailTo}?subject=${encodeURIComponent(formData.emailSubject)}&body=${encodeURIComponent(formData.emailBody)}`;
      case 'SMS':
        return `sms:${formData.smsNumber}?body=${encodeURIComponent(formData.smsMessage)}`;
      default:
        return '';
    }
  };

  const generateQRCode = async () => {
    const data = generateQRData();
    if (!data) return;

    try {
      const QRCode = (await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm')).default;

      const canvas = canvasRef.current;
      const options = {
        width: qrSize,
        margin: 1,
        color: {
          dark: qrColor,
          light: bgColor
        }
      };

      await QRCode.toCanvas(canvas, data, options);

      if (logo) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          const logoSize = qrSize * 0.2;
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;

          ctx.fillStyle = bgColor;
          ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
          ctx.drawImage(img, x, y, logoSize, logoSize);

          setGeneratedQR(canvas.toDataURL());
        };
        img.src = logo;
      } else {
        setGeneratedQR(canvas.toDataURL());
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = generatedQR;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      url: '',
      ssid: '',
      password: '',
      security: 'WPA',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      text: '',
      emailTo: '',
      emailSubject: '',
      emailBody: '',
      smsNumber: '',
      smsMessage: ''
    });
    setLogo(null);
    setQrSize(200)
    setGeneratedQR('');
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0C0910' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">QR Code Generator</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Input Section */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setCategory(id); resetForm(); }}
                    className={`flex items-center justify-center gap-2 p-4 cursor-pointer rounded-lg transition-all ${category === id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form Fields */}
            <div className="space-y-4 mb-6">
              {category === 'URL' && (
                <div>
                  <label className="block text-gray-300 mb-2">URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {category === 'WiFi' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">Network Name (SSID)</label>
                    <input
                      type="text"
                      placeholder="MyWiFi"
                      value={formData.ssid}
                      onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Password</label>
                    <input
                      type="text"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Security</label>
                    <select
                      value={formData.security}
                      onChange={(e) => setFormData({ ...formData, security: e.target.value })}
                      className="selectStyle w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None</option>
                    </select>
                  </div>
                </>
              )}

              {category === 'Contact' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {category === 'Text' && (
                <div>
                  <label className="block text-gray-300 mb-2">Text Content</label>
                  <textarea
                    placeholder="Enter your text message"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              )}

              {category === 'Email' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">Recipient Email</label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={formData.emailTo}
                      onChange={(e) => setFormData({ ...formData, emailTo: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      placeholder="Email Subject"
                      value={formData.emailSubject}
                      onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Message</label>
                    <textarea
                      placeholder="Email message"
                      value={formData.emailBody}
                      onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {category === 'SMS' && (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.smsNumber}
                      onChange={(e) => setFormData({ ...formData, smsNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Message</label>
                    <textarea
                      placeholder="SMS message"
                      value={formData.smsMessage}
                      onChange={(e) => setFormData({ ...formData, smsMessage: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Customization Section */}
            <div className="border-t border-gray-700 pt-6 space-y-4">
              <button
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                className="p-2 flex items-center gap-1.5 text-lg font-semibold rounded-xl text-white mb-4 cursor-pointer hover:bg-gray-600 transition"
              >
                <span>Customize QR Code</span>
                {isCustomizeOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isCustomizeOpen ? 'max-h-150 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Add Logo (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload size={18} />
                      {logo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">QR Color</label>
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Background</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Size: {qrSize}px</label>
                    <input type="range"
                      min="150"
                      max="500"
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className='flex items-center justify-between gap-2 mt-4'>
                <button
                  onClick={generateQRCode}
                  className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition"
                >
                  Generate QR Code
                </button>

                <button
                  onClick={resetForm}
                  className="p-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg cursor-pointer transition"
                >
                  Reset
                </button>
              </div>

            </div>
          </div>

          {/* Right Panel - Preview Section */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">QR Code Preview</h3>
            <div className="flex flex-col items-center justify-center min-h-100 bg-gray-800 rounded-lg p-8">
              {generatedQR ? (
                <div className="flex flex-col items-center gap-6">
                  <img
                    src={generatedQR}
                    alt="Generated QR Code"
                    className="rounded-lg shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <button
                    onClick={downloadQR}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg cursor-pointer transition"
                  >
                    <Download size={20} />
                    Download QR Code
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-52 h-52 sm:w-64 sm:h-64 bg-gray-700 rounded-lg flex items-center justify-center mb-4">

                    <div className="text-gray-500">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-lg text-center">Your QR code will appear here</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-center text-sm sm:text-base">
  Fill in the details and click "Generate QR Code"
</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;