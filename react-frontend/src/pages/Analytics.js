import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Download, Filter, MapPin, Droplets, Thermometer, Activity, Globe, BarChart3, PieChart as PieChartIcon, Clock, Waves } from 'lucide-react';

const OceanAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    region: 'All',
    year: '2024',
    tempRange: [0, 30],
    salinityRange: [0, 40]
  });
  const canvasRef = useRef(null);

  // Generate rich ocean data
  const generateOceanData = () => {
    const regions = ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const timeSeriesData = months.map((month, i) => ({
      month,
      temperature: 15 + Math.sin(i * Math.PI / 6) * 8 + Math.random() * 2,
      salinity: 35 + Math.sin(i * Math.PI / 6) * 1.5 + Math.random() * 0.5,
      pressure: 1000 + Math.sin(i * Math.PI / 6) * 50 + Math.random() * 20,
      phLevel: 7.8 + Math.random() * 0.4,
      oxygen: 6 + Math.random() * 2
    }));

    const depthData = Array.from({ length: 20 }, (_, i) => ({
      depth: i * 250,
      temperature: 25 - (i * 1.2) + Math.random() * 2,
      salinity: 35 + Math.sin(i * 0.3) * 0.8,
      pressure: i * 25 + Math.random() * 10,
      density: 1025 + i * 0.5
    }));

    const regionData = regions.map(region => ({
      region,
      avgTemp: 10 + Math.random() * 15,
      avgSalinity: 33 + Math.random() * 4,
      dataPoints: 5000 + Math.floor(Math.random() * 5000),
      stations: 10 + Math.floor(Math.random() * 20)
    }));

    const correlationData = Array.from({ length: 100 }, () => ({
      temperature: 5 + Math.random() * 25,
      salinity: 30 + Math.random() * 10,
      depth: Math.random() * 5000,
      oxygen: 4 + Math.random() * 4
    }));

    const radarData = [
      { metric: 'Temperature', value: 85, fullMark: 100 },
      { metric: 'Salinity', value: 92, fullMark: 100 },
      { metric: 'Pressure', value: 78, fullMark: 100 },
      { metric: 'pH Level', value: 88, fullMark: 100 },
      { metric: 'Oxygen', value: 75, fullMark: 100 },
      { metric: 'Current', value: 82, fullMark: 100 }
    ];

    return { timeSeriesData, depthData, regionData, correlationData, radarData };
  };

  const data = generateOceanData();

  // 3D Globe Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let rotation = 0;
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width / 2,
      y: Math.random() * canvas.height / 2,
      z: Math.random() * 200 - 100,
      size: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 60 + 180}, 70%, 60%)`
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 25, 47, 0.1)';
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

      rotation += 0.002;
      const centerX = canvas.width / 4;
      const centerY = canvas.height / 4;
      const radius = 80;

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw latitude lines
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        const y = centerY + (i * radius / 3);
        const width = Math.sqrt(radius * radius - (i * radius / 3) * (i * radius / 3));
        ctx.ellipse(centerX, y, width, width * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitude lines
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI / 4) + rotation;
        ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(angle)), radius, Math.PI / 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Animate particles
      particles.forEach(p => {
        const rotatedX = p.x - centerX;
        const rotatedZ = p.z;
        const newX = rotatedX * Math.cos(rotation) - rotatedZ * Math.sin(rotation);
        const newZ = rotatedX * Math.sin(rotation) + rotatedZ * Math.cos(rotation);
        
        const scale = 200 / (200 + newZ);
        const x2d = newX * scale + centerX;
        const y2d = p.y * scale + centerY / 2;

        if (newZ > -100) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const StatCard = ({ title, value, unit, icon: Icon, trend, change, gradient }) => (
    <div className={`stat-card ${gradient}`}>
      <div className="stat-header">
        <div className="stat-icon">
          <Icon size={24} />
        </div>
        <div className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change}</span>
        </div>
      </div>
      <div className="stat-value">
        {value}<span className="stat-unit">{unit}</span>
      </div>
      <div className="stat-title">{title}</div>
    </div>
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: #e2e8f0;
          overflow-x: hidden;
        }

        .dashboard {
          min-height: 100vh;
          padding: 2rem;
          position: relative;
        }

        .dashboard::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .dashboard > * {
          position: relative;
          z-index: 1;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #22d3ee 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: #94a3b8;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .icon-btn {
          padding: 0.75rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #06b6d4;
        }

        .icon-btn:hover {
          background: rgba(6, 182, 212, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          opacity: 0.5;
          z-index: -1;
        }

        .gradient-blue {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.1) 100%);
        }

        .gradient-red {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.1) 100%);
        }

        .gradient-teal {
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(13, 148, 136, 0.1) 100%);
        }

        .gradient-purple {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .trend-up {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .trend-down {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-unit {
          font-size: 1.5rem;
          color: #94a3b8;
          margin-left: 0.25rem;
        }

        .stat-title {
          color: #cbd5e1;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          flex: 1;
          padding: 1rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }

        .tab.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .chart-card.full {
          grid-column: span 12;
        }

        .chart-card.half {
          grid-column: span 6;
        }

        .chart-card.third {
          grid-column: span 4;
        }

        .chart-card.two-third {
          grid-column: span 8;
        }

        @media (max-width: 768px) {
          .chart-card.half,
          .chart-card.third,
          .chart-card.two-third {
            grid-column: span 12;
          }
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .chart-icon {
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.15);
          border-radius: 10px;
          color: #06b6d4;
          display: flex;
        }

        .globe-canvas {
          width: 100%;
          height: 400px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.2);
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .filter-group label {
          display: block;
          color: #cbd5e1;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-group select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: 1rem;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 25, 47, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(6, 182, 212, 0.3);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .recharts-wrapper {
          font-family: inherit !important;
        }

        .recharts-cartesian-axis-tick-value {
          fill: #94a3b8 !important;
        }

        .recharts-legend-item-text {
          color: #cbd5e1 !important;
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      <div className="header">
        <div className="header-content">
          <h1>🌊 Ocean Analytics 3D</h1>
          <p>Real-time ocean data visualization and insights</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleRefresh}>
            <RefreshCw size={20} />
          </button>
          <button className="icon-btn">
            <Download size={20} />
          </button>
          <button className="icon-btn">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Records"
          value="125,847"
          unit=""
          icon={BarChart3}
          trend="up"
          change="+12.5%"
          gradient="gradient-blue"
        />
        <StatCard
          title="Avg Temperature"
          value="15.2"
          unit="°C"
          icon={Thermometer}
          trend="up"
          change="+0.3°C"
          gradient="gradient-red"
        />
        <StatCard
          title="Avg Salinity"
          value="35.1"
          unit="PSU"
          icon={Droplets}
          trend="down"
          change="-0.1"
          gradient="gradient-teal"
        />
        <StatCard
          title="Active Stations"
          value="248"
          unit=""
          icon={Activity}
          trend="up"
          change="+18"
          gradient="gradient-purple"
        />
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Globe size={18} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'depth' ? 'active' : ''}`}
          onClick={() => setActiveTab('depth')}
        >
          <Waves size={18} />
          Depth Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'regions' ? 'active' : ''}`}
          onClick={() => setActiveTab('regions')}
        >
          <MapPin size={18} />
          Regions
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={18} />
          Timeline
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="charts-grid">
          <div className="chart-card two-third">
            <div className="chart-header">
              <div className="chart-icon">
                <Globe size={20} />
              </div>
              <h3>3D Ocean Globe Visualization</h3>
            </div>
            <canvas ref={canvasRef} className="globe-canvas" />
          </div>

          <div className="chart-card third">
            <div className="chart-header">
              <div className="chart-icon">
                <Activity size={20} />
              </div>
              <h3>Performance Metrics</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={data.radarData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" />
                <Radar name="Current" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Thermometer size={20} />
              </div>
              <h3>Temperature vs Salinity</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" stroke="#94a3b8" />
                <YAxis type="number" dataKey="salinity" name="Salinity" unit="PSU" stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Scatter data={data.correlationData} fill="#14b8a6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <PieChartIcon size={20} />
              </div>
              <h3>Regional Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.regionData}
                  dataKey="dataPoints"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#06b6d4', '#0ea5e9', '#14b8a6', '#22d3ee', '#67e8f9'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'depth' && (
        <div className="charts-grid">
          <div className="chart-card full">
            <div className="chart-header">
              <div className="chart-icon">
                <Waves size={20} />
              </div>
              <h3>Depth Profile Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.depthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} name="Temperature (°C)" />
                <Line type="monotone" dataKey="salinity" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} name="Salinity (PSU)" />
                <Line type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="Pressure (dbar)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Thermometer size={20} />
              </div>
              <h3>Temperature Gradient</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.depthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="depth" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Area type="monotone" dataKey="temperature" stroke="#ec4899" fill="rgba(236, 72, 153, 0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Droplets size={20} />
              </div>
              <h3>Salinity Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.depthData.filter((_, i) => i % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="depth" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Bar dataKey="salinity" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'regions' && (
        <div className="charts-grid">
          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <MapPin size={20} />
              </div>
              <h3>Regional Statistics</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="region" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
                <Bar dataKey="avgTemp" fill="#ec4899" radius={[8, 8, 0, 0]} name="Avg Temperature" />
                <Bar dataKey="avgSalinity" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Avg Salinity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Activity size={20} />
              </div>
              <h3>Data Points by Region</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis type="category" dataKey="region" stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Bar dataKey="dataPoints" fill="#14b8a6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full">
            <div className="chart-header">
              <div className="chart-icon">
                <Globe size={20} />
              </div>
              <h3>Station Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="region" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Area type="monotone" dataKey="stations" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="charts-grid">
          <div className="chart-card full">
            <div className="chart-header">
              <div className="chart-icon">
                <Clock size={20} />
              </div>
              <h3>Multi-Parameter Timeline</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} name="Temperature (°C)" />
                <Line type="monotone" dataKey="salinity" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} name="Salinity (PSU)" />
                <Line type="monotone" dataKey="phLevel" stroke="#14b8a6" strokeWidth={3} dot={{ r: 5 }} name="pH Level" />
                <Line type="monotone" dataKey="oxygen" stroke="#22d3ee" strokeWidth={3} dot={{ r: 5 }} name="Oxygen (mg/L)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Thermometer size={20} />
              </div>
              <h3>Temperature Trends</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Area type="monotone" dataKey="temperature" stroke="#ec4899" fill="rgba(236, 72, 153, 0.4)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card half">
            <div className="chart-header">
              <div className="chart-icon">
                <Waves size={20} />
              </div>
              <h3>Pressure Variations</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }} 
                />
                <Bar dataKey="pressure" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Region</label>
          <select 
            value={filters.region} 
            onChange={(e) => setFilters({...filters, region: e.target.value})}
          >
            <option value="All">All Regions</option>
            <option value="Atlantic">Atlantic Ocean</option>
            <option value="Pacific">Pacific Ocean</option>
            <option value="Indian">Indian Ocean</option>
            <option value="Arctic">Arctic Ocean</option>
            <option value="Southern">Southern Ocean</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Year</label>
          <select 
            value={filters.year} 
            onChange={(e) => setFilters({...filters, year: e.target.value})}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Data Quality</label>
          <select>
            <option value="all">All Data</option>
            <option value="high">High Quality (≥95%)</option>
            <option value="medium">Medium Quality (80-95%)</option>
            <option value="low">Low Quality (&lt;80%)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Depth Range</label>
          <select>
            <option value="all">All Depths</option>
            <option value="surface">Surface (0-200m)</option>
            <option value="intermediate">Intermediate (200-1000m)</option>
            <option value="deep">Deep (1000-4000m)</option>
            <option value="abyssal">Abyssal (&gt;4000m)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OceanAnalyticsDashboard