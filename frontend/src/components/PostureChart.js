import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PostureChart = ({ data, type = 'weekly' }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Build labels and datasets from real data or fall back to placeholders
  let labels, scoreData, goodPctData;

  if (type === 'weekly' && Array.isArray(data) && data.length > 0) {
    labels = data.map(d => d.date?.slice(5) ?? ''); // MM-DD
    scoreData = data.map(d => d.postureScore);
    goodPctData = data.map(d => d.goodPct);
  } else if (type === 'hourly' && Array.isArray(data) && data.length > 0) {
    labels = data.map(d => d.hour);
    scoreData = data.map(d => d.postureScore);
    goodPctData = data.map(d => d.goodPct);
  } else {
    // Fallback placeholder
    labels = type === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : [];
    scoreData = type === 'weekly' ? [null, null, null, null, null, null, null] : [];
    goodPctData = scoreData;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Posture Score',
        data: scoreData,
        borderColor: '#8B5CF6',
        backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#8B5CF6', pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3, pointRadius: 6, borderWidth: 3,
      },
      {
        label: 'Good Posture %',
        data: goodPctData,
        borderColor: '#10B981',
        backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#10B981', pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3, pointRadius: 6, borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: theme.palette.text.primary, usePointStyle: true, padding: 20, font: { size: 13, weight: '600' } },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: 'rgba(139,92,246,0.3)',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.08)' },
        ticks: { color: theme.palette.text.secondary, font: { size: 12, weight: '600' } },
        border: { display: false },
      },
      y: {
        beginAtZero: true, max: 100,
        grid: { color: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.08)' },
        ticks: { color: theme.palette.text.secondary, font: { size: 12 }, callback: v => v + '%' },
        border: { display: false },
      },
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' },
  };

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '16px', padding: '10px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PostureChart;
