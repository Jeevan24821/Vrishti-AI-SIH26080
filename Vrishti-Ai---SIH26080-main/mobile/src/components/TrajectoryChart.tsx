import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

interface TrajectoryChartProps {
  nwp: number;
  ai: number;
  obs: number | null;
  accumulationHorizon?: '6h' | '12h' | '24h';
  cutoff?: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  nwp,
  ai,
  obs,
  accumulationHorizon = '6h',
  cutoff = 25,
}) => {
  const mult = accumulationHorizon === '6h' ? 1.0 : accumulationHorizon === '12h' ? 2.0 : 4.0;
  const screenWidth = Dimensions.get('window').width - 48; // padding
  const height = 180;
  const paddingBottom = 28;
  const paddingTop = 20;
  const paddingLeft = 36;
  const paddingRight = 16;

  const chartWidth = screenWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const periods = [
    { time: '00:00', nwp: Number((nwp * mult * 0.95).toFixed(1)), ai: Number((ai * mult * 0.92).toFixed(1)), obs: obs !== null ? Number((obs * mult * 0.96).toFixed(1)) : null },
    { time: '06:00', nwp: Number((nwp * mult * 1.15).toFixed(1)), ai: Number((ai * mult * 1.08).toFixed(1)), obs: obs !== null ? Number((obs * mult * 1.04).toFixed(1)) : null },
    { time: '12:00', nwp: Number((nwp * mult * 0.90).toFixed(1)), ai: Number((ai * mult * 0.95).toFixed(1)), obs: obs !== null ? Number((obs * mult * 0.98).toFixed(1)) : null },
    { time: '18:00', nwp: Number((nwp * mult * 1.25).toFixed(1)), ai: Number((ai * mult * 1.12).toFixed(1)), obs: obs !== null ? Number((obs * mult * 1.10).toFixed(1)) : null },
  ];

  const maxVal = Math.max(
    cutoff + 5,
    ...periods.map(p => Math.max(p.nwp, p.ai, p.obs || 0))
  );

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  const groupWidth = chartWidth / periods.length;
  const barWidth = 14;

  const cutoffY = getY(cutoff);

  return (
    <View style={styles.container}>
      <Svg width={screenWidth} height={height}>
        <Defs>
          <LinearGradient id="aiBarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="nwpBarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#64748b" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
          </LinearGradient>
          <LinearGradient id="obsBarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#059669" stopOpacity="1" />
            <Stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => {
          const y = getY(val);
          return (
            <React.Fragment key={idx}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={screenWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 4}
                fill="#64748b"
                fontSize={10}
                fontWeight="700"
                textAnchor="end"
              >
                {Math.round(val)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Cutoff Reference Line */}
        {cutoffY >= paddingTop && cutoffY <= paddingTop + chartHeight && (
          <>
            <Line
              x1={paddingLeft}
              y1={cutoffY}
              x2={screenWidth - paddingRight}
              y2={cutoffY}
              stroke="#dc2626"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <SvgText
              x={screenWidth - paddingRight}
              y={cutoffY - 4}
              fill="#dc2626"
              fontSize={9}
              fontWeight="900"
              textAnchor="end"
            >
              {`Cutoff >${cutoff}mm`}
            </SvgText>
          </>
        )}

        {/* Bars for each time period */}
        {periods.map((p, idx) => {
          const groupCenterX = paddingLeft + idx * groupWidth + groupWidth / 2;
          const hasObs = p.obs !== null;

          // Bar positions
          const nwpX = hasObs ? groupCenterX - barWidth * 1.5 - 2 : groupCenterX - barWidth - 2;
          const aiX = hasObs ? groupCenterX - barWidth / 2 : groupCenterX + 2;
          const obsX = groupCenterX + barWidth / 2 + 2;

          const nwpHeight = (p.nwp / maxVal) * chartHeight;
          const aiHeight = (p.ai / maxVal) * chartHeight;
          const obsHeight = hasObs ? ((p.obs || 0) / maxVal) * chartHeight : 0;

          return (
            <React.Fragment key={idx}>
              {/* NWP Bar */}
              <Rect
                x={nwpX}
                y={getY(p.nwp)}
                width={barWidth}
                height={Math.max(2, nwpHeight)}
                rx={4}
                fill="url(#nwpBarGrad)"
              />

              {/* AI Bar */}
              <Rect
                x={aiX}
                y={getY(p.ai)}
                width={barWidth}
                height={Math.max(2, aiHeight)}
                rx={4}
                fill="url(#aiBarGrad)"
              />

              {/* Obs Bar */}
              {hasObs && (
                <Rect
                  x={obsX}
                  y={getY(p.obs!)}
                  width={barWidth}
                  height={Math.max(2, obsHeight)}
                  rx={4}
                  fill="url(#obsBarGrad)"
                />
              )}

              {/* Time Label */}
              <SvgText
                x={groupCenterX}
                y={height - 8}
                fill="#0f172a"
                fontSize={11}
                fontWeight="800"
                textAnchor="middle"
              >
                {p.time}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend Matching Desktop */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#94a3b8' }]} />
          <Text style={styles.legendText}>Raw NWP</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#4f46e5' }]} />
          <Text style={[styles.legendText, { color: '#4f46e5', fontWeight: '800' }]}>Vrishti AI Corrected</Text>
        </View>
        {obs !== null && (
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#059669' }]} />
            <Text style={[styles.legendText, { color: '#059669' }]}>Observed Rain</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '700',
    color: '#334155',
  },
});
