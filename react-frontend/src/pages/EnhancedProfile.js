import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Clock, Download, MessageSquare, Upload, BarChart3, TrendingUp, Activity, Settings, Bell, Lock, Eye, Edit2, Save, X, Award, Target, Zap, Globe, Waves, Droplets, Thermometer, MapPin, Star, History, FileText, Image as ImageIcon } from 'lucide-react';

const ImprovedProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Dr. Marina Rodriguez',
    username: 'marina_ocean',
    email: 'marina.rodriguez@oceanlab.com',
    role: 'Senior Researcher',
    bio: 'Marine biologist specializing in ocean temperature patterns and climate change impacts on marine ecosystems.',
    location: 'Woods Hole, MA',
    joinDate: '2023-01-15',
    lastActive: new Date().toISOString()
  });
  const [stats, setStats] = useState({
    downloads: 147,
    chats: 89,
    uploads: 34,
    dataPoints: 325847,
    sessions: 56,
    quality: 96.8,
    achievements: 12
  });
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
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
        ctx.fill();

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  const recentActivity = [
    { id: 1, type: 'download', title: 'Downloaded Temperature Dataset', time: '2 hours ago', icon: <Download size={16} />, color: '#06b6d4' },
    { id: 2, type: 'chat', title: 'AI Analysis Session', time: '5 hours ago', icon: <MessageSquare size={16} />, color: '#14b8a6' },
    { id: 3, type: 'upload', title: 'Uploaded Salinity Data', time: '1 day ago', icon: <Upload size={16} />, color: '#f59e0b' },
    { id: 4, type: 'analysis', title: 'Generated Depth Profile', time: '2 days ago', icon: <BarChart3 size={16} />, color: '#8b5cf6' },
    { id: 5, type: 'download', title: 'Exported Global Map Data', time: '3 days ago', icon: <Globe size={16} />, color: '#ec4899' }
  ];

  const achievements = [
    { id: 1, title: 'Data Explorer', desc: 'Downloaded 100+ datasets', icon: <Download size={20} />, color: '#06b6d4', unlocked: true },
    { id: 2, title: 'Chat Master', desc: 'Completed 50 AI sessions', icon: <MessageSquare size={20} />, color: '#14b8a6', unlocked: true },
    { id: 3, title: 'Quality Contributor', desc: 'Maintained 95%+ data quality', icon: <Award size={20} />, color: '#f59e0b', unlocked: true },
    { id: 4, title: 'Ocean Pioneer', desc: 'Explored all ocean regions', icon: <Waves size={20} />, color: '#8b5cf6', unlocked: true },
    { id: 5, title: 'Research Pro', desc: '1000+ data points analyzed', icon: <Target size={20} />, color: '#ec4899', unlocked: false },
    { id: 6, title: 'Global Mapper', desc: 'Created 20+ visualizations', icon: <MapPin size={20} />, color: '#3b82f6', unlocked: false }
  ];

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: '20px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = `0 12px 30px ${color}40`;
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = `${color}30`;
    }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color, fontSize: '5rem' }}>
        {icon}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            padding: '0.75rem',
            background: `${color}20`,
            borderRadius: '12px',
            color,
            display: 'flex'
          }}>
            {icon}
          </div>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: '#22c55e',
              fontWeight: 600
            }}>
              <TrendingUp size={14} />
              +{trend}%
            </div>
          )}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
    </div>
  );

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
        opacity: 0.3,
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
            <Waves size={200} color="#06b6d4" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 8px 32px rgba(6, 182, 212, 0.5)',
              border: '4px solid rgba(255, 255, 255, 0.2)'
            }}>
              {profileData.fullName.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  margin: 0
                }}>
                  {editMode ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        color: '#e2e8f0',
                        fontSize: '2rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    />
                  ) : profileData.fullName}
                </h1>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '20px',
                  color: '#06b6d4',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {profileData.role}
                </div>
              </div>
              <p style={{
                color: '#94a3b8',
                fontSize: '1rem',
                margin: '0.5rem 0',
                maxWidth: '600px'
              }}>
                {editMode ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={2}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      color: '#e2e8f0',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                ) : profileData.bio}
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '0.875rem' }}>{profileData.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: '0.875rem' }}>{profileData.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <Calendar size={16} />
                  <span style={{ fontSize: '0.875rem' }}>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '12px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.4)';
                    }}
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '12px',
                      color: '#06b6d4',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <button
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '12px',
                      color: '#06b6d4',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Settings size={20} />
                  </button>
                </>
              )}
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
          <StatCard icon={<Download size={24} />} label="Total Downloads" value={stats.downloads} trend="15" color="#06b6d4" />
          <StatCard icon={<MessageSquare size={24} />} label="AI Sessions" value={stats.chats} trend="23" color="#14b8a6" />
          <StatCard icon={<Upload size={24} />} label="Data Uploads" value={stats.uploads} trend="8" color="#f59e0b" />
          <StatCard icon={<BarChart3 size={24} />} label="Data Points" value={stats.dataPoints.toLocaleString()} trend="12" color="#8b5cf6" />
          <StatCard icon={<Activity size={24} />} label="Active Sessions" value={stats.sessions} trend="18" color="#ec4899" />
          <StatCard icon={<Star size={24} />} label="Data Quality" value={`${stats.quality}%`} trend="2" color="#3b82f6" />
          <StatCard icon={<Award size={24} />} label="Achievements" value={stats.achievements} trend="" color="#22c55e" />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          padding: '0.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: <User size={18} /> },
            { id: 'activity', label: 'Activity', icon: <History size={18} /> },
            { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%)'
                  : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(6, 182, 212, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Recent Activity */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Activity size={24} color="#06b6d4" />
                Recent Activity
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = activity.color;
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      padding: '0.75rem',
                      background: `${activity.color}20`,
                      border: `1px solid ${activity.color}40`,
                      borderRadius: '10px',
                      color: activity.color,
                      display: 'flex'
                    }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {activity.title}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '20px',
                padding: '1.5rem'
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
                  Quick Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>This Week</span>
                    <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: '1.25rem' }}>+28</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>This Month</span>
                    <span style={{ color: '#14b8a6', fontWeight: 700, fontSize: '1.25rem' }}>+142</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>All Time</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.25rem' }}>{stats.downloads + stats.chats + stats.uploads}</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  marginBottom: '1rem'
                }}>
                  Top Regions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { name: 'North Atlantic', value: 45, color: '#06b6d4' },
                    { name: 'Pacific Ocean', value: 30, color: '#14b8a6' },
                    { name: 'Indian Ocean', value: 25, color: '#8b5cf6' }
                  ].map((region, idx) => (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{region.name}</span>
                        <span style={{ color: region.color, fontWeight: 600 }}>{region.value}%</span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${region.value}%`,
                          background: `linear-gradient(90deg, ${region.color} 0%, ${region.color}80 100%)`,
                          borderRadius: '4px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#e2e8f0',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <History size={24} color="#06b6d4" />
              Complete Activity Log
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {recentActivity.concat(recentActivity).map((activity, idx) => (
                <div
                  key={`${activity.id}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = activity.color;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    padding: '1rem',
                    background: `${activity.color}20`,
                    border: `1px solid ${activity.color}40`,
                    borderRadius: '12px',
                    color: activity.color,
                    display: 'flex'
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.25rem', fontSize: '1rem' }}>
                      {activity.title}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {activity.time}
                    </div>
                  </div>
                  <button style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px',
                    color: '#06b6d4',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)'}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Award size={24} color="#06b6d4" />
                Achievements
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                Unlock achievements by using NeptuneAI and exploring ocean data
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    style={{
                      padding: '1.5rem',
                      background: achievement.unlocked 
                        ? `linear-gradient(135deg, ${achievement.color}15 0%, ${achievement.color}05 100%)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: achievement.unlocked
                        ? `1px solid ${achievement.color}30`
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: achievement.unlocked ? 1 : 0.5,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (achievement.unlocked) {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = `0 12px 30px ${achievement.color}40`;
                        e.currentTarget.style.borderColor = achievement.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = achievement.unlocked ? `${achievement.color}30` : 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    {achievement.unlocked && (
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '32px',
                        height: '32px',
                        background: `${achievement.color}30`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: achievement.color
                      }}>
                        <Star size={16} fill="currentColor" />
                      </div>
                    )}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: achievement.unlocked
                        ? `${achievement.color}20`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: achievement.unlocked
                        ? `2px solid ${achievement.color}40`
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: achievement.unlocked ? achievement.color : '#64748b',
                      marginBottom: '1rem'
                    }}>
                      {achievement.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: achievement.unlocked ? '#e2e8f0' : '#64748b',
                      marginBottom: '0.5rem'
                    }}>
                      {achievement.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: achievement.unlocked ? '#94a3b8' : '#475569'
                    }}>
                      {achievement.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#8b5cf6',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Target size={20} />
                Next Milestones
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: '100 Downloads', current: 47, target: 100, color: '#06b6d4' },
                  { name: '100 AI Sessions', current: 89, target: 100, color: '#14b8a6' },
                  { name: '50 Uploads', current: 34, target: 50, color: '#f59e0b' }
                ].map((milestone, idx) => (
                  <div key={idx}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600 }}>
                        {milestone.name}
                      </span>
                      <span style={{ color: milestone.color, fontWeight: 700 }}>
                        {milestone.current}/{milestone.target}
                      </span>
                    </div>
                    <div style={{
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(milestone.current / milestone.target) * 100}%`,
                        background: `linear-gradient(90deg, ${milestone.color} 0%, ${milestone.color}80 100%)`,
                        borderRadius: '6px',
                        transition: 'width 1s ease',
                        boxShadow: `0 0 10px ${milestone.color}60`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Settings size={24} color="#06b6d4" />
                Account Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: <User size={20} />, label: 'Profile Information', desc: 'Update your profile details', color: '#06b6d4' },
                  { icon: <Lock size={20} />, label: 'Password & Security', desc: 'Manage your password', color: '#14b8a6' },
                  { icon: <Bell size={20} />, label: 'Notifications', desc: 'Configure notification preferences', color: '#f59e0b' },
                  { icon: <Eye size={20} />, label: 'Privacy', desc: 'Control your privacy settings', color: '#8b5cf6' }
                ].map((setting, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = setting.color;
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      padding: '0.75rem',
                      background: `${setting.color}20`,
                      border: `1px solid ${setting.color}40`,
                      borderRadius: '10px',
                      color: setting.color,
                      display: 'flex'
                    }}>
                      {setting.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {setting.label}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {setting.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Zap size={24} color="#06b6d4" />
                Preferences
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { label: 'Email Notifications', checked: true },
                  { label: 'Data Export Alerts', checked: true },
                  { label: 'Weekly Reports', checked: false },
                  { label: 'AI Insights', checked: true },
                  { label: 'System Updates', checked: true }
                ].map((pref, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px'
                    }}
                  >
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{pref.label}</span>
                    <div
                      style={{
                        width: '48px',
                        height: '26px',
                        background: pref.checked ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '13px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.3s ease'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: pref.checked ? '25px' : '3px',
                        transition: 'left 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default ImprovedProfile;