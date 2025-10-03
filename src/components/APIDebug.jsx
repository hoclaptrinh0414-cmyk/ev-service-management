// src/components/APIDebug.jsx - COPY TOÀN BỘ FILE NÀY
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const APIDebug = () => {
  const [logs, setLogs] = useState([]);
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testUsername, setTestUsername] = useState('admin');
  const [testPassword, setTestPassword] = useState('Admin@123');

  useEffect(() => {
    const envUrl = process.env.REACT_APP_API_URL;
    setApiUrl(envUrl || 'NOT LOADED');
    
    addLog('info', '🔧 Environment Variables Check', {
      'REACT_APP_API_URL': envUrl || '❌ NOT FOUND',
      'REACT_APP_APP_URL': process.env.REACT_APP_APP_URL || 'NOT SET',
      'NODE_ENV': process.env.NODE_ENV
    });

    if (!envUrl || envUrl === 'NOT LOADED') {
      addLog('error', '❌ .env FILE NOT LOADED!', {
        problem: '.env file không được load',
        solution: [
          '1. Đảm bảo .env ở cùng cấp package.json',
          '2. RESTART React app (Ctrl+C và npm start)',
          '3. Không có dấu cách sau dấu = trong .env'
        ]
      });
    }
  }, []);

  const addLog = (type, message, data = null) => {
    const log = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [log, ...prev]);
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} [${log.timestamp}] ${message}`, data || '');
  };

  const testNgrokConnection = async () => {
    setLoading(true);
    addLog('info', '🧪 TEST 1: Kiểm tra kết nối ngrok...');

    try {
      const baseUrl = apiUrl.replace('/api', '');
      addLog('info', `Đang ping: ${baseUrl}`);

      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      addLog('success', `✅ Ngrok hoạt động! Status: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        url: baseUrl
      });

    } catch (error) {
      addLog('error', '❌ KHÔNG THỂ KẾT NỐI NGROK!', {
        error: error.message,
        possibleReasons: [
          '1. Ngrok đã hết hạn (URL thay đổi mỗi lần restart)',
          '2. Backend không chạy',
          '3. URL trong .env sai'
        ],
        solution: [
          '1. Chạy lại: ngrok http 5000',
          '2. Copy URL mới',
          '3. Paste vào .env',
          '4. RESTART React'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    addLog('info', '🧪 TEST 2: Kiểm tra CORS...');

    try {
      const response = await fetch(apiUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (corsHeaders['Access-Control-Allow-Origin']) {
        addLog('success', '✅ CORS được cấu hình đúng!', corsHeaders);
      } else {
        addLog('warning', '⚠️ CORS chưa config', {
          headers: corsHeaders,
          note: 'Backend cần enable CORS'
        });
      }

    } catch (error) {
      addLog('error', '❌ CORS test failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLoginDirect = async () => {
    setLoading(true);
    addLog('info', '🧪 TEST 3: Test login endpoint TRỰC TIẾP...');
    addLog('info', `Username: ${testUsername}, Password: ${testPassword}`);

    const loginUrl = `${apiUrl}/auth/login`;
    addLog('info', `POST ${loginUrl}`);

    try {
      const requestBody = {
        username: testUsername,
        password: testPassword
      };

      addLog('info', 'Request body:', requestBody);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      addLog('info', `Response status: ${response.status} ${response.statusText}`);

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        addLog('info', 'Response data:', responseData);
      } else {
        const text = await response.text();
        responseData = text;
        addLog('warning', 'Response không phải JSON:', text.substring(0, 200));
      }

      if (response.ok) {
        addLog('success', '✅ LOGIN THÀNH CÔNG!', {
          status: response.status,
          hasToken: !!(responseData.token || responseData.data?.token),
          hasUser: !!(responseData.user || responseData.data?.user),
          data: responseData
        });
      } else {
        addLog('error', '❌ Login failed', {
          status: response.status,
          message: responseData.message || 'Unknown error',
          data: responseData
        });
      }

    } catch (error) {
      addLog('error', '❌ REQUEST KHÔNG GỬI ĐI!', {
        error: error.message,
        name: error.name,
        diagnosis: error.message === 'Failed to fetch' ? 
          'Network error - Backend không accessible' :
          'JavaScript error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testLoginWithService = async () => {
    setLoading(true);
    addLog('info', '🧪 TEST 4: Test login QUA API SERVICE...');

    try {
      const { authAPI } = await import('../services/api');
      
      const result = await authAPI.login({
        username: testUsername,
        password: testPassword
      });

      addLog('success', '✅ API SERVICE hoạt động!', result);

    } catch (error) {
      addLog('error', '❌ API SERVICE lỗi', {
        message: error.message,
        response: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  const copyLogsToClipboard = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}\n${log.data ? JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logsText);
    addLog('success', '📋 Logs copied!');
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h3 className="mb-0">🔧 API Debug Tool</h3>
            </div>
            <div className="card-body">
              
              <div className="alert alert-info mb-3">
                <h5>📡 API Configuration</h5>
                <div className="row">
                  <div className="col-md-6">
                    <strong>API URL từ .env:</strong>
                    <div className="input-group mt-2">
                      <input 
                        type="text" 
                        className="form-control font-monospace" 
                        value={apiUrl} 
                        readOnly 
                        style={{ 
                          backgroundColor: apiUrl === 'NOT LOADED' ? '#f8d7da' : '#d4edda',
                          color: apiUrl === 'NOT LOADED' ? '#721c24' : '#155724'
                        }}
                      />
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigator.clipboard.writeText(apiUrl)}
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>Test Credentials:</strong>
                    <div className="row mt-2">
                      <div className="col-6">
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="Username"
                          value={testUsername}
                          onChange={(e) => setTestUsername(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="Password"
                          value={testPassword}
                          onChange={(e) => setTestPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-3">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={testNgrokConnection}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : '🌐 '}
                    Test 1: Ngrok
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-warning w-100"
                    onClick={testCORS}
                    disabled={loading}
                  >
                    🔒 Test 2: CORS
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-success w-100"
                    onClick={testLoginDirect}
                    disabled={loading}
                  >
                    🎯 Test 3: Direct Login
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-info w-100"
                    onClick={testLoginWithService}
                    disabled={loading}
                  >
                    ⚙️ Test 4: API Service
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <button className="btn btn-secondary btn-sm me-2" onClick={clearLogs}>
                  <i className="bi bi-trash"></i> Clear
                </button>
                <button className="btn btn-secondary btn-sm" onClick={copyLogsToClipboard}>
                  <i className="bi bi-clipboard"></i> Copy Logs
                </button>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">📊 Debug Logs ({logs.length})</h5>
            </div>
            <div className="card-body p-0">
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: '4rem' }}></i>
                    <p className="mt-3">Chưa có logs. Click test buttons.</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {logs.map(log => (
                      <div 
                        key={log.id}
                        className={`list-group-item ${
                          log.type === 'success' ? 'list-group-item-success' :
                          log.type === 'error' ? 'list-group-item-danger' :
                          log.type === 'warning' ? 'list-group-item-warning' :
                          ''
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <span className="me-2" style={{ fontSize: '1.2rem' }}>
                                {log.type === 'success' ? '✅' :
                                 log.type === 'error' ? '❌' :
                                 log.type === 'warning' ? '⚠️' : 'ℹ️'}
                              </span>
                              <strong>{log.message}</strong>
                            </div>
                            {log.data && (
                              <pre 
                                className="mb-0 p-2 bg-light border rounded"
                                style={{ 
                                  fontSize: '0.85rem',
                                  maxHeight: '300px',
                                  overflow: 'auto'
                                }}
                              >
                                {typeof log.data === 'object' 
                                  ? JSON.stringify(log.data, null, 2)
                                  : log.data}
                              </pre>
                            )}
                          </div>
                          <small className="text-muted ms-3">{log.timestamp}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card mt-4 shadow-sm">
            <div className="card-header bg-warning">
              <h5 className="mb-0">💡 Common Issues</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>❌ "Failed to fetch"</h6>
                  <ul className="small">
                    <li>Backend không chạy → <code>dotnet run</code></li>
                    <li>Ngrok expired → Lấy URL mới, update .env</li>
                    <li>CORS chưa config</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>⚠️ ".env NOT LOADED"</h6>
                  <ul className="small">
                    <li>.env sai vị trí → Cùng cấp package.json</li>
                    <li>Chưa RESTART → Ctrl+C và npm start</li>
                  </ul>     
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default APIDebug;