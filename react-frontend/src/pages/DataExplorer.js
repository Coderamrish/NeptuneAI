import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie } from 'recharts';
import { Search, Filter, Download, RefreshCw, MapPin, Thermometer, Droplets, Activity, TrendingUp, TrendingDown, Waves, Navigation, Globe, BarChart3, Settings, Eye, EyeOff, Calendar, Clock, AlertCircle, CheckCircle, Zap, Wind, Compass, Anchor, Map as MapIcon } from 'lucide-react';

const AdvancedDataExplorer = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({ records: 0, temp: 0, salinity: 0, stations: 0 });
  const canvasRef = useRef(null);
  
  const [filters, setFilters] = useState({
    search: '',
    region: 'All',
    year: '2024',
    tempRange: [0, 30],
    salinityRange: [30, 40],
    depthRange: [0, 5000],
    quality: 'All'
  });

  useEffect(() => {
    generateEnhancedData();
    animateCanvas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  useEffect(() => {
    // Animate stats
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        records: Math.min(prev.records + 1000, filteredData.length),
        temp: Math.min(prev.temp + 0.5, calculateAverage('temperature')),
        salinity: Math.min(prev.salinity + 0.5, calculateAverage('salinity')),
        stations: Math.min(prev.stations + 1, new Set(filteredData.map(d => d.station_id)).size)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [filteredData]);

  const generateEnhancedData = () => {
    const regions = ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'];
    const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
    
    const sampleData = Array.from({ length: 2000 }, (_, i) => ({
      id: i + 1,
      station_id: `ST-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      latitude: -80 + Math.random() * 160,
      longitude: -180 + Math.random() * 360,
      temperature: 2 + Math.random() * 28,
      salinity: 30 + Math.random() * 10,
      pressure: Math.random() * 1000,
      depth: Math.random() * 5000,
      ph: 7.5 + Math.random() * 1,
      oxygen: 4 + Math.random() * 4,
      chlorophyll: Math.random() * 10,
      turbidity: Math.random() * 5,
      currentSpeed: Math.random() * 3,
      waveHeight: Math.random() * 5,
      region: regions[Math.floor(Math.random() * regions.length)],
      year: 2020 + Math.floor(Math.random() * 5),
      quality: qualities[Math.floor(Math.random() * qualities.length)],
    }));
    
    setData(sampleData);
    setFilteredData(sampleData);
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.station_id.toLowerCase().includes(searchLower) ||
        item.region.toLowerCase().includes(searchLower)
      );
    }

    if (filters.region !== 'All') {
      filtered = filtered.filter(item => item.region === filters.region);
    }

    if (filters.year !== 'All') {
      filtered = filtered.filter(item => item.year === parseInt(filters.year));
    }

    if (filters.quality !== 'All') {
      filtered = filtered.filter(item => item.quality === filters.quality);
    }

    filtered = filtered.filter(item => 
      item.temperature >= filters.tempRange[0] && 
      item.temperature <= filters.tempRange[1] &&
      item.salinity >= filters.salinityRange[0] && 
      item.salinity <= filters.salinityRange[1] &&
      item.depth >= filters.depthRange[0] && 
      item.depth <= filters.depthRange[1]
    );

    setFilteredData(filtered);
  };

  const calculateAverage = (field) => {
    if (filteredData.length === 0) return 0;
    return filteredData.reduce((sum, d) => sum + d[field], 0) / filteredData.length;
  };

  const animateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width / 2,
      y: Math.random() * canvas.height / 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 25, 47, 0.1)';
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width / 2) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height / 2) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.6})`;
        ctx.fill();

        // Draw connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  const getRegionData = () => {
    const regions = {};
    filteredData.forEach(d => {
      if (!regions[d.region]) {
        regions[d.region] = { count: 0, avgTemp: 0, avgSalinity: 0 };
      }
      regions[d.region].count++;
      regions[d.region].avgTemp += d.temperature;
      regions[d.region].avgSalinity += d.salinity;
    });

    return Object.entries(regions).map(([region, stats]) => ({
      region,
      count: stats.count,
      avgTemp: (stats.avgTemp / stats.count).toFixed(1),
      avgSalinity: (stats.avgSalinity / stats.count).toFixed(1),
    }));
  };

  const getDepthProfile = () => {
    const depths = [0, 500, 1000, 2000, 3000, 4000, 5000];
    return depths.map(depth => {
      const inRange = filteredData.filter(d => 
        d.depth >= depth && d.depth < depth + 500
      );
      return {
        depth: `${depth}m`,
        temperature: inRange.length > 0 ? (inRange.reduce((s, d) => s + d.temperature, 0) / inRange.length).toFixed(1) : 0,
        salinity: inRange.length > 0 ? (inRange.reduce((s, d) => s + d.salinity, 0) / inRange.length).toFixed(1) : 0,
        count: inRange.length
      };
    });
  };

  const getTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => {
      const monthData = filteredData.filter(d => new Date(d.timestamp).getMonth() === i);
      return {
        month,
        temperature: monthData.length > 0 ? (monthData.reduce((s, d) => s + d.temperature, 0) / monthData.length).toFixed(1) : 0,
        salinity: monthData.length > 0 ? (monthData.reduce((s, d) => s + d.salinity, 0) / monthData.length).toFixed(1) : 0,
        records: monthData.length
      };
    });
  };

  const getQualityDistribution = () => {
    const qualities = {};
    filteredData.forEach(d => {
      qualities[d.quality] = (qualities[d.quality] || 0) + 1;
    });
    return Object.entries(qualities).map(([quality, count]) => ({
      quality,
      count,
      percentage: ((count / filteredData.length) * 100).toFixed(1)
    }));
  };

  const COLORS = ['#06b6d4', '#0ea5e9', '#14b8a6', '#22d3ee', '#67e8f9'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(6, 182, 212, 0.3);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(6, 182, 212, 0.3);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: none;
          background: rgba(6, 182, 212, 0.2);
          color: #06b6d4;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .btn:hover {
          background: rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
        }

        .btn-primary {
          background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%);
        }

        .input {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          width: 100%;
          transition: all 0.3s ease;
        }

        .input:focus {
          outline: none;
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
        }

        .select {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          cursor: pointer;
          width: 100%;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }

        .tab.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(20, 184, 166, 0.3) 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
        }

        .map-marker {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .map-marker:hover {
          transform: scale(1.2);
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.5);
          border: none;
        }

        .grid {
          display: grid;
          gap: 1.5rem;
        }

        .grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .grid-4 {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .recharts-wrapper {
          font-family: inherit !important;
        }

        .background-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.3;
          z-index: 0;
        }

        .content {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <canvas ref={canvasRef} className="background-canvas" />

      <div className="content">
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🌊 Advanced Data Explorer
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                Comprehensive ocean data analysis and visualization platform
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={18} />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button className="btn" onClick={generateEnhancedData}>
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="btn btn-primary">
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '12px' }}>
                <BarChart3 size={28} color="#06b6d4" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4caf50' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>+12.5%</span>
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {animatedStats.records.toLocaleString()}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Records</p>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.05) 100%)', borderColor: 'rgba(236, 72, 153, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '12px' }}>
                <Thermometer size={28} color="#ec4899" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4caf50' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>+0.3°C</span>
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {animatedStats.temp.toFixed(1)}°C
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Avg Temperature</p>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 100%)', borderColor: 'rgba(20, 184, 166, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(20, 184, 166, 0.2)', borderRadius: '12px' }}>
                <Droplets size={28} color="#14b8a6" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f44336' }}>
                <TrendingDown size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>-0.1</span>
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {animatedStats.salinity.toFixed(1)} PSU
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Avg Salinity</p>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px' }}>
                <MapPin size={28} color="#a855f7" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4caf50' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>+5</span>
              </div>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {animatedStats.stations}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Active Stations</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={24} color="#06b6d4" />
              Advanced Filters
            </h3>
            <div className="grid grid-3">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Search Stations
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by station ID or region..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Region
                </label>
                <select 
                  className="select"
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

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Year
                </label>
                <select 
                  className="select"
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                >
                  <option value="All">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Data Quality
                </label>
                <select 
                  className="select"
                  value={filters.quality}
                  onChange={(e) => setFilters({...filters, quality: e.target.value})}
                >
                  <option value="All">All Quality Levels</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Temperature: {filters.tempRange[0]}°C - {filters.tempRange[1]}°C
                </label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="30"
                  value={filters.tempRange[1]}
                  onChange={(e) => setFilters({...filters, tempRange: [filters.tempRange[0], parseInt(e.target.value)]})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                  Salinity: {filters.salinityRange[0]} - {filters.salinityRange[1]} PSU
                </label>
                <input
                  type="range"
                  className="slider"
                  min="30"
                  max="40"
                  value={filters.salinityRange[1]}
                  onChange={(e) => setFilters({...filters, salinityRange: [filters.salinityRange[0], parseInt(e.target.value)]})}
                />
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
          <button 
            className={`tab ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <Globe size={18} />
            Overview
          </button>
          <button 
            className={`tab ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={18} />
            Map View
          </button>
          <button 
            className={`tab ${viewMode === 'analysis' ? 'active' : ''}`}
            onClick={() => setViewMode('analysis')}
          >
            <Activity size={18} />
            Analysis
          </button>
          <button 
            className={`tab ${viewMode === 'depth' ? 'active' : ''}`}
            onClick={() => setViewMode('depth')}
          >
            <Anchor size={18} />
            Depth Profile
          </button>
        </div>

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ height: '500px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={24} color="#06b6d4" />
                Global Temperature Distribution
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    type="number" 
                    dataKey="longitude" 
                    name="Longitude" 
                    domain={[-180, 180]}
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="latitude" 
                    name="Latitude" 
                    domain={[-90, 90]}
                    stroke="#94a3b8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Scatter 
                    data={filteredData.slice(0, 200)} 
                    fill="#06b6d4"
                    onClick={(data) => setSelectedStation(data)}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="grid" style={{ gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} color="#14b8a6" />
                  Data Quality
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getQualityDistribution()}
                      dataKey="count"
                      nameKey="quality"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {getQualityDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} color="#a855f7" />
                  Regional Stats
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {getRegionData().slice(0, 5).map((region, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{region.region}</span>
                        <span style={{ color: '#06b6d4' }}>{region.count} records</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        Temp: {region.avgTemp}°C | Salinity: {region.avgSalinity} PSU
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={24} color="#ec4899" />
                Monthly Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getTimeSeriesData()}>
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
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ec4899" 
                    fill="rgba(236, 72, 153, 0.3)" 
                    name="Temperature (°C)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="salinity" 
                    stroke="#14b8a6" 
                    fill="rgba(20, 184, 166, 0.3)" 
                    name="Salinity (PSU)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="grid" style={{ gap: '1.5rem' }}>
            <div className="card" style={{ height: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapIcon size={24} color="#06b6d4" />
                  Interactive Station Map
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="pulse" style={{ width: '12px', height: '12px', background: '#4caf50', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Live Data</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    type="number" 
                    dataKey="longitude" 
                    name="Longitude" 
                    domain={[-180, 180]}
                    stroke="#94a3b8"
                    label={{ value: 'Longitude', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="latitude" 
                    name="Latitude" 
                    domain={[-90, 90]}
                    stroke="#94a3b8"
                    label={{ value: 'Latitude', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ padding: '1rem' }}>
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{data.station_id}</p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Region: {data.region}</p>
                            <p style={{ fontSize: '0.875rem', color: '#ec4899' }}>Temp: {data.temperature.toFixed(1)}°C</p>
                            <p style={{ fontSize: '0.875rem', color: '#14b8a6' }}>Salinity: {data.salinity.toFixed(1)} PSU</p>
                            <p style={{ fontSize: '0.875rem', color: '#a855f7' }}>Depth: {data.depth.toFixed(0)}m</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    data={filteredData.slice(0, 300)} 
                    fill="#06b6d4"
                    className="map-marker"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {selectedStation && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Selected Station: {selectedStation.station_id}
                </h3>
                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Thermometer size={20} color="#ec4899" />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Temperature</span>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStation.temperature.toFixed(1)}°C</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Droplets size={20} color="#14b8a6" />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Salinity</span>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStation.salinity.toFixed(1)} PSU</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Anchor size={20} color="#a855f7" />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Depth</span>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStation.depth.toFixed(0)}m</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Activity size={20} color="#06b6d4" />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Quality</span>
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStation.quality}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis View */}
        {viewMode === 'analysis' && (
          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Thermometer size={24} color="#ec4899" />
                Temperature vs Salinity
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    type="number" 
                    dataKey="temperature" 
                    name="Temperature" 
                    unit="°C"
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="salinity" 
                    name="Salinity" 
                    unit=" PSU"
                    stroke="#94a3b8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Scatter data={filteredData.slice(0, 200)} fill="#ec4899" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Waves size={24} color="#14b8a6" />
                Temperature Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getTimeSeriesData()}>
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
                  <Bar dataKey="temperature" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={24} color="#06b6d4" />
                Regional Comparison
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={getRegionData()} layout="vertical">
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
                  <Legend />
                  <Bar dataKey="count" fill="#06b6d4" name="Record Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={24} color="#a855f7" />
                Data Collection Volume
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getTimeSeriesData()}>
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
                  <Line 
                    type="monotone" 
                    dataKey="records" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Depth Profile View */}
        {viewMode === 'depth' && (
          <div className="grid">
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Anchor size={24} color="#06b6d4" />
                Depth Profile Analysis
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getDepthProfile()}>
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
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ec4899" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Temperature (°C)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="salinity" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Salinity (PSU)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Thermometer size={20} color="#ec4899" />
                  Temperature by Depth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getDepthProfile()}>
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
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#ec4899" 
                      fill="rgba(236, 72, 153, 0.3)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={20} color="#14b8a6" />
                  Salinity by Depth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getDepthProfile()}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDataExplorer;