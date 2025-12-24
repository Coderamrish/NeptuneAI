import React, { useState, useRef, useEffect } from 'react';
import { CloudUpload, FileText, CheckCircle, AlertCircle, X, Upload, Zap, Database, BarChart3, TrendingUp, Waves, Globe, Activity } from 'lucide-react';

const EnhancedUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    animateBackground();
  }, []);

  const animateBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.5})`;
        ctx.fill();

        particles.forEach((p2, j) => {
          if (i !== j) {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (selectedFiles) => {
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(Math.floor(((i + progress / 100) / files.length) * 100));
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress } : f
        ));
      }

      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
      ));

      setUploadedFiles(prev => [...prev, {
        id: file.id,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        status: 'success',
      }]);
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setFiles([]);
      setUploadProgress(0);
    }, 500);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('csv') || type.includes('excel')) return '📊';
    if (type.includes('json')) return '🔧';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  const stats = [
    { label: 'Total Uploaded', value: uploadedFiles.length, icon: Database, color: '#06b6d4', gradient: 'from-cyan-500 to-blue-500' },
    { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: '#14b8a6', gradient: 'from-teal-500 to-emerald-500' },
    { label: 'Processing', value: uploading ? files.length : '0', icon: Activity, color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
    { label: 'Storage Used', value: '2.4 GB', icon: BarChart3, color: '#8b5cf6', gradient: 'from-purple-500 to-violet-500' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.4,
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <CloudUpload size={40} />
                Upload Ocean Data
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                Upload and manage your ocean research datasets with ease
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Waves size={24} color="#06b6d4" />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#06b6d4' }}>
                  {uploadedFiles.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Files Uploaded
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.boxShadow = `0 12px 40px ${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  background: `${stat.color}20`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Upload Area */}
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                background: dragActive 
                  ? 'rgba(6, 182, 212, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: dragActive 
                  ? '2px dashed #06b6d4' 
                  : '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '2rem',
                animation: 'fadeIn 0.6s ease-out',
                boxShadow: dragActive ? '0 12px 40px rgba(6, 182, 212, 0.3)' : 'none'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: dragActive ? 'pulse 1s ease-in-out infinite' : 'none'
              }}>
                <CloudUpload size={50} color="#06b6d4" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '0.75rem'
              }}>
                {dragActive ? 'Drop files here' : 'Drag & Drop Files'}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}>
                or click to browse from your computer
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.3)';
                }}
              >
                <Upload size={20} />
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.json,.xlsx,.xls,.geojson,.kml,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <p style={{
                color: '#64748b',
                fontSize: '0.875rem',
                marginTop: '1rem'
              }}>
                Supports: CSV, JSON, Excel, GeoJSON, KML (Max 100MB per file)
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Zap size={20} color="#06b6d4" />
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Uploading files...</span>
                  </div>
                  <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: '1.25rem' }}>
                    {uploadProgress}%
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #06b6d4 0%, #0ea5e9 100%)',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                  }} />
                </div>
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>
                    Selected Files ({files.length})
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setFiles([])}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      }}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      style={{
                        padding: '0.5rem 1.5rem',
                        background: uploading 
                          ? 'rgba(148, 163, 184, 0.2)' 
                          : 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: uploading ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = uploading ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.3)';
                      }}
                    >
                      <Upload size={16} />
                      Upload All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {files.map((file, idx) => (
                    <div
                      key={file.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        animation: `slideUp 0.3s ease-out ${idx * 0.05}s both`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <div style={{ fontSize: '2rem' }}>
                        {getFileIcon(file.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#e2e8f0',
                          fontWeight: 600,
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                          {formatFileSize(file.size)}
                        </div>
                        {file.status === 'uploading' && (
                          <div style={{
                            marginTop: '0.5rem',
                            height: '4px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, #06b6d4 0%, #0ea5e9 100%)',
                              width: `${file.progress}%`,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {file.status === 'success' && (
                          <CheckCircle size={24} color="#14b8a6" />
                        )}
                        {file.status === 'uploading' && (
                          <div className="spinner" />
                        )}
                        {file.status === 'pending' && (
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            }}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Recent Uploads */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '1.5rem',
              animation: 'slideRight 0.5s ease-out'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={20} color="#14b8a6" />
                Recent Uploads
              </h3>
              
              {uploadedFiles.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 0',
                  color: '#64748b'
                }}>
                  No files uploaded yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {uploadedFiles.slice(0, 10).map((file, idx) => (
                    <div
                      key={file.id}
                      style={{
                        padding: '0.875rem',
                        background: 'rgba(20, 184, 166, 0.1)',
                        border: '1px solid rgba(20, 184, 166, 0.2)',
                        borderRadius: '10px',
                        animation: `slideUp 0.3s ease-out ${idx * 0.05}s both`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ fontSize: '1.5rem' }}>
                          {getFileIcon(file.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: '#e2e8f0',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {file.name}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8'
                          }}>
                            {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleString()}
                          </div>
                        </div>
                        <CheckCircle size={16} color="#14b8a6" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Types */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '1.5rem',
              animation: 'slideRight 0.5s ease-out 0.1s both'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={20} color="#06b6d4" />
                Supported Formats
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { icon: '📊', name: 'CSV Files', desc: 'Comma-separated values', color: '#06b6d4' },
                  { icon: '🔧', name: 'JSON', desc: 'JavaScript Object Notation', color: '#14b8a6' },
                  { icon: '📈', name: 'Excel', desc: 'XLSX, XLS spreadsheets', color: '#8b5cf6' },
                  { icon: '🗺️', name: 'GeoJSON', desc: 'Geographic data format', color: '#ec4899' },
                  { icon: '📍', name: 'KML', desc: 'Keyhole Markup Language', color: '#f59e0b' }
                ].map((format, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.875rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = format.color;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      fontSize: '1.75rem',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${format.color}20`,
                      borderRadius: '10px'
                    }}>
                      {format.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.125rem'
                      }}>
                        {format.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8'
                      }}>
                        {format.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '20px',
              padding: '1.5rem',
              animation: 'slideRight 0.5s ease-out 0.2s both'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#06b6d4',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Zap size={20} />
                Pro Tips
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Compress large files before uploading',
                  'Use descriptive file names',
                  'Validate data format beforehand',
                  'Maximum file size: 100MB'
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#cbd5e1'
                    }}
                  >
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#06b6d4',
                      flexShrink: 0
                    }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

export default EnhancedUpload;