'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
} from 'lightweight-charts';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Bar } from '@/lib/types';

// ---------------------------------------------------------------------------
// Interval options
// ---------------------------------------------------------------------------

const INTERVALS = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1wk' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
] as const;

// ---------------------------------------------------------------------------
// Helper: convert Bar[] to lightweight-charts data format
// ---------------------------------------------------------------------------

function toCandlestickData(bars: Bar[]) {
  return bars.map((bar) => ({
    time: bar.time.slice(0, 10) as string, // YYYY-MM-DD
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }));
}

function toVolumeData(bars: Bar[]) {
  return bars.map((bar) => ({
    time: bar.time.slice(0, 10) as string,
    value: bar.volume,
    color: bar.close >= bar.open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
  }));
}

// ---------------------------------------------------------------------------
// Chart options (shared between init and data updates)
// ---------------------------------------------------------------------------

function getChartOptions(width: number) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: '#09090b' },
      textColor: '#a1a1aa',
      fontSize: 12,
    },
    grid: {
      vertLines: { color: '#1e293b' },
      horzLines: { color: '#1e293b' },
    },
    width,
    height: 400,
    crosshair: {
      vertLine: { color: '#3b82f6', width: 1 as const, style: 2 },
      horzLine: { color: '#3b82f6', width: 1 as const, style: 2 },
    },
    rightPriceScale: {
      borderColor: '#27272a',
    },
    timeScale: {
      borderColor: '#27272a',
      timeVisible: false,
    },
  } as const;
}

// ---------------------------------------------------------------------------
// PriceChart component
// ---------------------------------------------------------------------------

interface PriceChartProps {
  symbol: string;
  interval?: string;
}

export function PriceChart({ symbol, interval: initialInterval = '1d' }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [interval, setInterval] = useState(initialInterval);

  // Fetch bar data
  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ['market', 'bars', symbol, interval],
    queryFn: () => api.market.bars(symbol, interval, 200),
    enabled: !!symbol,
  });

  // Create chart on mount, clean up on unmount
  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(
      containerRef.current,
      getChartOptions(containerRef.current.clientWidth),
    );

    chartRef.current = chart;
  }, []);

  // Initialize chart on mount
  useEffect(() => {
    initChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  // Update data when bars change
  useEffect(() => {
    if (!chartRef.current || !bars || bars.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Recreate chart to clear old series
    chartRef.current.remove();

    const chart = createChart(container, getChartOptions(container.clientWidth));
    chartRef.current = chart;

    // Add candlestick series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeries.setData(toCandlestickData(bars));

    // Add volume histogram series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(toVolumeData(bars));

    // Fit content
    chart.timeScale().fitContent();
  }, [bars]);

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      {/* Interval selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-zinc-400 mr-2">Interval:</span>
        {INTERVALS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setInterval(opt.value)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              interval === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        )}
        <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
      </div>
    </div>
  );
}
