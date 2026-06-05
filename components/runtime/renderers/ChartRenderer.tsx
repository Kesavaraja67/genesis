"use client";
// components/runtime/renderers/ChartRenderer.tsx
// Fetches live records from the runtime API and renders them as a chart

import React, { useState, useEffect, useCallback } from "react";
import { UIComponent } from "@/lib/config/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { ComponentRenderProps } from "../FallbackComponent";

const CHART_COLORS = ["#4a6c6f", "#846075", "#5a9e7a", "#b8935a", "#4a6c9e", "#9e6a4a"];

export interface ChartRendererProps extends ComponentRenderProps {
  config: UIComponent;
  data?: unknown;
}

export function ChartRenderer({ config, appId }: ChartRendererProps) {
  const modelName = config.model ?? "";
  const chartType = (config.props?.chartType as string) || "bar";
  const xAxisField = (config.props?.xAxis as string) || "createdAt";
  const yAxisField = (config.props?.yAxis as string) || "id";
  const color = (config.props?.color as string) || "#4a6c6f";
  const groupBy = config.props?.groupBy as string | undefined;

  const [rawRecords, setRawRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!modelName || !appId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/runtime/${appId}/${modelName}?limit=200`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRawRecords(data.data ?? []);
    } catch {
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [appId, modelName]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      await Promise.resolve(); // avoid sync setState warning
      if (!ignore) void fetchData();
    };
    run();
    return () => { ignore = true; };
  }, [fetchData]);

  // Transform raw records into chart data
  const chartData = React.useMemo(() => {
    if (!rawRecords.length) return [];

    if (groupBy) {
      // Group by a field and count
      const groups: Record<string, number> = {};
      for (const rec of rawRecords) {
        const key = String(rec[groupBy] ?? "Unknown");
        groups[key] = (groups[key] ?? 0) + 1;
      }
      return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }

    // Use records directly
    return rawRecords.map((rec, i) => ({
      ...rec,
      _index: i + 1,
      // Shorten createdAt to a date string for readability
      ...(rec.createdAt
        ? { createdAt: String(rec.createdAt).slice(0, 10) }
        : {}),
    }));
  }, [rawRecords, groupBy]);

  const effectiveX = groupBy ? "name" : xAxisField;
  const effectiveY = groupBy ? "value" : yAxisField;

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#12121a",
      borderColor: "#1e1e2e",
      borderRadius: "8px",
      fontSize: "12px",
    },
    itemStyle: { color: "#e2e8f0" },
    labelStyle: { color: "#94a3b8" },
  };

  const renderChart = () => {
    if (chartType === "pie" || chartType === "donut") {
      return (
        <PieChart>
          <Pie
            data={chartData as Record<string, unknown>[]}
            dataKey={effectiveY}
            nameKey={effectiveX}
            cx="50%"
            cy="50%"
            innerRadius={chartType === "donut" ? "55%" : 0}
            outerRadius="70%"
            label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Legend formatter={(value) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{value}</span>} />
          <Tooltip {...tooltipStyle} />
        </PieChart>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps} data={chartData as Record<string, unknown>[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey={effectiveX} stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey={effectiveY}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps} data={chartData as Record<string, unknown>[]}>
            <defs>
              <linearGradient id={`chart-grad-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey={effectiveX} stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey={effectiveY}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#chart-grad-${config.id})`}
            />
          </AreaChart>
        );
      case "bar":
      default:
        return (
          <BarChart {...commonProps} data={chartData as Record<string, unknown>[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis dataKey={effectiveX} stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis stroke="#2a2a3e" tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey={effectiveY} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      {config.title && (
        <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
          {config.title}
        </h3>
      )}
      <div style={{ height: "260px", width: "100%" }}>
        {loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: "8px" }} />
          </div>
        ) : error ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "13px" }}>{error}</span>
            <button
              onClick={fetchData}
              style={{
                background: "transparent",
                border: "1px solid #2a2a3e",
                borderRadius: "6px",
                color: "#94a3b8",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Retry
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              fontSize: "13px",
            }}
          >
            No data available — add records to {modelName || "this model"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
