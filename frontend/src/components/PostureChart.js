import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PostureChart = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Posture Score',
        data: [82, 88, 85, 92, 95, 87, 90],
        borderColor: '#8B5CF6',
        backgroundColor: isDark 
          ? 'rgba(139, 92, 246, 0.1)' 
          : 'rgba(139, 92, 246, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#8B5CF6',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 4,
        borderWidth: 4,
        shadowColor: 'rgba(139, 92, 246, 0.5)',
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 10,
      },
      {
        label: 'Risk Level',
        data: [18, 12, 15, 8, 5, 13, 10],
        borderColor: '#EC4899',
        backgroundColor: isDark 
          ? 'rgba(236, 72, 153, 0.1)' 
          : 'rgba(236, 72, 153, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#EC4899',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 4,
        borderWidth: 4,
        shadowColor: 'rgba(236, 72, 153, 0.5)',
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 10,
      },
      {
        label: 'Activity Level',
        data: [75, 82, 78, 88, 92, 85, 89],
        borderColor: '#06B6D4',
        backgroundColor: isDark 
          ? 'rgba(6, 182, 212, 0.1)' 
          : 'rgba(6, 182, 212, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#06B6D4',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 4,
        borderWidth: 4,
        shadowColor: 'rgba(6, 182, 212, 0.5)',
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 25,
          font: {
            size: 14,
            weight: '600',
            family: 'Inter, sans-serif',
          },
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            labels.forEach((label, index) => {
              const colors = ['#8B5CF6', '#EC4899', '#06B6D4'];
              label.fillStyle = colors[index];
              label.strokeStyle = colors[index];
              label.pointStyle = 'circle';
            });
            
            return labels;
          },
        },
      },
      tooltip: {
        backgroundColor: isDark 
          ? 'rgba(26, 26, 46, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: isDark 
          ? 'rgba(139, 92, 246, 0.5)' 
          : 'rgba(124, 58, 237, 0.3)',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 16,
        titleFont: {
          size: 16,
          weight: '700',
          family: 'Inter, sans-serif',
        },
        bodyFont: {
          size: 14,
          weight: '500',
          family: 'Inter, sans-serif',
        },
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = label === 'Risk Level' ? '%' : label === 'Posture Score' ? '%' : '%';
            return `${label}: ${value}${unit}`;
          },
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
              borderRadius: 4,
            };
          },
        },
        external: function(context) {
          const tooltip = context.tooltip;
          if (tooltip.opacity === 0) return;
          
          // Add glow effect
          const canvas = context.chart.canvas;
          const ctx = canvas.getContext('2d');
          ctx.shadowColor = isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(124, 58, 237, 0.3)';
          ctx.shadowBlur = 20;
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark 
            ? 'rgba(139, 92, 246, 0.1)' 
            : 'rgba(124, 58, 237, 0.08)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, sans-serif',
          },
          padding: 12,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDark 
            ? 'rgba(139, 92, 246, 0.1)' 
            : 'rgba(124, 58, 237, 0.08)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, sans-serif',
          },
          padding: 12,
          callback: function(value) {
            return value + '%';
          },
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 4,
        hoverRadius: 12,
      },
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: (context) => {
        return context.dataIndex * 100;
      },
    },
    onHover: (event, activeElements, chart) => {
      event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
  };

  return (
    <div 
      style={{ 
        height: '400px', 
        width: '100%',
        position: 'relative',
        background: isDark 
          ? 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.02) 0%, transparent 70%)',
        borderRadius: '16px',
        padding: '20px',
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default PostureChart;