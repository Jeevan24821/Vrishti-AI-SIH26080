import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles, Send, Bot, User, HelpCircle, MapPin, Check,
  Thermometer, Droplets, Wind, ShieldAlert, AlertTriangle,
  ChevronDown, ChevronUp, FileText, Layers, RefreshCw,
  Building, Sprout, Mountain, Truck, Map, BarChart3, Cpu,
  Activity, Sliders, Shield, ArrowRight, Database
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';
import { Header } from '../components/Header';
import { useForecast } from '../context/ForecastContext';
import { evaluateAIAdvisor } from '../services/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { formatDisplayDate, formatDisplayLocation } from '../utils/dateFormatter';

interface RecommendedActionItem {
  destination: string;
  label: string;
  reason?: string;
  icon?: string;
  context?: any;
}

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  headline_answer?: string;
  headline_text?: string;
  advisory_note?: string;
  expected_rain_mm?: number;
  rain_val_display?: string;
  rain_chance_text?: string;
  intensity_label?: string;
  forecast_period?: string;
  warning_level?: string;
  flood_risk_level?: string;
  forecast?: any;
  location?: any;
  follow_up_question?: string;
  similar_questions?: string[];
  debug_trace?: any;
  why_this_answer?: string;
  model_evidence?: string;
  conversational_summary?: any;
  evaluation?: any;
  recommended_actions?: RecommendedActionItem[];
  timestamp: string;
}

const cleanPlainText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
};

const CATEGORY_TABS = [
  { id: 'general', label: 'General Weather', icon: Sparkles },
  { id: 'construction', label: 'Construction', icon: Building },
  { id: 'agriculture', label: 'Farming', icon: Sprout },
  { id: 'landslide', label: 'Hill Travel', icon: Mountain },
  { id: 'urban_flood', label: 'City Drainage', icon: Droplets },
  { id: 'transport', label: 'Highways', icon: Truck },
];

const EXAMPLE_CHIPS = [
  { category: '🌧️ Weather', query: 'How is the weather in Bengaluru Urban today?' },
  { category: '🌊 Flood', query: 'Is there floods in Panaji today?' },
  { category: '🚗 Highway', query: 'Will rain affect driving in Bengaluru tomorrow?' },
  { category: '⛰️ Hill Safety', query: 'Is it safe to travel to Wayanad tomorrow because of rain?' },
  { category: '🌾 Farming', query: 'Is it suitable for harvesting in Palakkad tomorrow?' },
  { category: '🏗️ Building', query: 'Can I pour concrete in Mysuru tomorrow?' },
];

export const AIAssistantScreen: React.FC = () => {
  const { selectedStation, selectedDate, stationMetadata, setSelectedStation, setSelectedState, setSelectedDate } = useForecast();
  const navigation = useNavigation<any>();
  const [conversationContext, setConversationContext] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);


  const initialLocation = formatDisplayLocation(stationMetadata);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **VRISHTI AI Meteorological Copilot**.\n\nCurrently monitoring **${initialLocation}** for cycle **${formatDisplayDate(selectedDate, null)}**.\n\nAsk me about rainfall forecasts, flood safety, regime transitions, heavy rain probabilities, or construction and travel conditions across Goa, Karnataka, and Kerala.`,
      intent: 'WELCOME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSending) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await evaluateAIAdvisor(
        query,
        selectedStation ? String(selectedStation) : undefined,
        selectedDate,
        activeCategory !== 'general' ? activeCategory : undefined,
        conversationContext
      );

      if (res.context) {
        setConversationContext(res.context);
      }

      const botMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.conversational_response || 'No response generated.',
        intent: res.intent,
        headline_answer: res.headline_answer,
        headline_text: res.headline_text,
        advisory_note: res.advisory_note,
        expected_rain_mm: res.expected_rain_mm,
        rain_val_display: res.rain_val_display,
        rain_chance_text: res.rain_chance_text,
        intensity_label: res.intensity_label,
        forecast_period: res.forecast_period,
        warning_level: res.warning_level,
        flood_risk_level: res.flood_risk_level,
        forecast: res.forecast,
        location: res.location,
        follow_up_question: res.follow_up_question,
        similar_questions: res.similar_questions,
        debug_trace: res.debug_trace,
        why_this_answer: res.why_this_answer || res.conversational_summary?.why_this_answer || res.evaluation?.engineering_agronomic_rationale,
        model_evidence: res.model_evidence || res.conversational_summary?.model_evidence,
        conversational_summary: res.conversational_summary,
        evaluation: res.evaluation,
        recommended_actions: res.recommended_actions || res.recommendedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Unable to process request: ${err?.message || 'Server connection error. Please verify backend status.'}`,
        intent: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleExecuteAction = (action: RecommendedActionItem) => {
    const dest = action.destination?.toLowerCase();
    const ctx = action.context || {};
    // Update ForecastContext with any provided context
    if (ctx.state) setSelectedState(ctx.state);
    if (ctx.station_id) setSelectedStation(ctx.station_id);
    if (ctx.date) setSelectedDate(ctx.date);
    // Navigate to correct screen
    if (dest === 'map' || dest === 'forecast') {
      navigation.navigate('MainTabs', { screen: 'Map', params: ctx });
    } else if (dest === 'verification') {
      navigation.navigate('MainTabs', { screen: 'Verification', params: ctx });
    } else if (dest === 'regime') {
      navigation.navigate('MainTabs', { screen: 'Regimes', params: ctx });
    } else if (dest === 'sandbox') {
      navigation.navigate('ModelSandbox', ctx);
    } else if (dest === 'feature_importance') {
      navigation.navigate('FeatureImportance', ctx);
    } else if (dest === 'calibration') {
      navigation.navigate('Calibration', ctx);
    } else if (dest === 'ablation') {
      navigation.navigate('ModelAblation', ctx);
    } else if (dest === 'audit' || dest === 'provenance') {
      navigation.navigate('ScientificAudit', ctx);
    } else {
      navigation.navigate('MainTabs', { screen: 'Forecast', params: ctx });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Header />

      {/* Citizen Header Banner (Desktop Adaptive Command Header) */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconWrap}>
            <Sparkles size={18} color="#38bdf8" />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>
              Ask VRISHTI anything about weather or safety
            </Text>
            <Text style={styles.bannerSub}>
              Conversational AI Weather Assistant & Work Safety Advisor for Goa, Kerala & Karnataka
            </Text>
          </View>
        </View>

        {/* District Active Bar */}
        <View style={styles.districtActiveBar}>
          <MapPin size={12} color="#10b981" />
          <Text style={styles.districtActiveText} numberOfLines={1}>
            Location: <Text style={{ color: '#ffffff', fontWeight: '800' }}>{initialLocation}</Text> ({formatDisplayDate(selectedDate, null)})
          </Text>
        </View>
      </View>

      {/* Category Tabs Bar */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(tab.id)}
              >
                <Icon size={12} color={isActive ? '#ffffff' : '#94a3b8'} />
                <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          if (isUser) {
            return (
              <View key={msg.id} style={styles.userBubbleContainer}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                  <Text style={styles.userTime}>{msg.timestamp}</Text>
                </View>
              </View>
            );
          }

          // Assistant Bubble with Rich Meteorological Cards
          const hasHeadline = !!msg.headline_text;
          const isTraceOpen = expandedTraceId === msg.id;
          const isTechOpen = expandedTechId === msg.id;

          return (
            <View key={msg.id} style={styles.assistantCard}>
              {/* Card Top: Avatar, Name & Intent Pill */}
              <View style={styles.assistantHeader}>
                <View style={styles.assistantHeaderLeft}>
                  <View style={styles.botAvatar}>
                    <Bot size={15} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.botName}>VRISHTI AI ASSISTANT</Text>
                    <Text style={styles.botTime}>{msg.timestamp}</Text>
                  </View>
                </View>
                {msg.intent && (
                  <View style={[
                    styles.intentBadge,
                    msg.intent === 'ERROR' && { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }
                  ]}>
                    <Text style={[
                      styles.intentBadgeText,
                      msg.intent === 'ERROR' && { color: '#f87171' }
                    ]}>
                      {msg.intent === 'ERROR' ? 'SYSTEM NOTICE' : 'METEOROLOGICAL GUIDANCE'}
                    </Text>
                  </View>
                )}
              </View>

              {/* 1. Headline Assessment Card (YES / NO / CURRENT) */}
              {hasHeadline && (
                <View style={[
                  styles.headlineBanner,
                  msg.headline_answer === 'YES' && (msg.expected_rain_mm || 0) >= 15.6
                    ? styles.headlineBannerRed
                    : msg.headline_answer === 'YES'
                      ? styles.headlineBannerBlue
                      : styles.headlineBannerGreen
                ]}>
                  <View style={styles.headlineTop}>
                    <Sparkles size={13} color="#818cf8" />
                    <Text style={styles.headlineSource}>VRISHTI AI FORECAST ASSESSMENT</Text>
                  </View>
                  <Text style={styles.headlineTitle}>{cleanPlainText(msg.headline_text)}</Text>
                  {msg.advisory_note && (
                    <Text style={styles.headlineNote}>{cleanPlainText(msg.advisory_note)}</Text>
                  )}
                </View>
              )}

              {/* 2. Key Metrics Grid (Expected Rain, Chance of Rain, Period) */}
              {hasHeadline && (
                <View style={styles.kpiRow}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiCardLabel}>🌧️ Expected Rain</Text>
                    <Text style={styles.kpiCardVal}>
                      {msg.rain_val_display || `${msg.expected_rain_mm || 0} mm`}
                    </Text>
                    <Text style={styles.kpiCardSub}>{msg.intensity_label || '6h accumulation'}</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiCardLabel}>🎯 Rain Chance</Text>
                    <Text style={[styles.kpiCardVal, { color: '#34d399' }]}>
                      {msg.rain_chance_text || 'Reliable'}
                    </Text>
                    <Text style={styles.kpiCardSub}>AI Exceedance</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiCardLabel}>⏱️ Period</Text>
                    <Text style={[styles.kpiCardVal, { color: '#fbbf24', fontSize: 13 }]}>
                      {msg.forecast_period || 'Today'}
                    </Text>
                    <Text style={styles.kpiCardSub}>{msg.location?.forecast_date || selectedDate}</Text>
                  </View>
                </View>
              )}

              {/* 3. Meteorological Telemetry Row */}
              {msg.forecast && (
                <View style={styles.telemetryGrid}>
                  {msg.forecast.temperature_2m_c !== undefined && (
                    <View style={styles.telemetryItem}>
                      <Text style={styles.telemetryLabel}>🌡️ Temp</Text>
                      <Text style={styles.telemetryVal}>{msg.forecast.temperature_2m_c}°C</Text>
                    </View>
                  )}
                  {msg.forecast.relative_humidity_pct !== undefined && (
                    <View style={styles.telemetryItem}>
                      <Text style={styles.telemetryLabel}>💧 Humidity</Text>
                      <Text style={styles.telemetryVal}>{msg.forecast.relative_humidity_pct}%</Text>
                    </View>
                  )}
                  {msg.forecast.wind_speed_10m_kmh !== undefined && (
                    <View style={styles.telemetryItem}>
                      <Text style={styles.telemetryLabel}>💨 Wind</Text>
                      <Text style={styles.telemetryVal}>{msg.forecast.wind_speed_10m_kmh} km/h</Text>
                    </View>
                  )}
                  {msg.warning_level && (
                    <View style={styles.telemetryItem}>
                      <Text style={styles.telemetryLabel}>⚠️ Alert</Text>
                      <Text style={[
                        styles.telemetryVal,
                        msg.warning_level === 'WARNING' && { color: '#f87171' },
                        msg.warning_level === 'WATCH' && { color: '#fbbf24' },
                        msg.warning_level === 'NORMAL' && { color: '#34d399' },
                      ]}>
                        {msg.warning_level}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 3b. Actual Model Evidence & Why This Answer Cards */}
              {(msg.model_evidence || msg.why_this_answer) && (
                <View style={styles.evidenceRow}>
                  {msg.model_evidence && (
                    <View style={styles.evidenceCard}>
                      <Text style={styles.evidenceLabel}>Actual Model Evidence:</Text>
                      <Text style={styles.evidenceText}>{cleanPlainText(msg.model_evidence)}</Text>
                    </View>
                  )}
                  {msg.why_this_answer && (
                    <View style={styles.evidenceCard}>
                      <Text style={styles.whyLabel}>Why This Answer?</Text>
                      <Text style={styles.evidenceText}>{cleanPlainText(msg.why_this_answer)}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 4. Rich Formatted Markdown Response Body (NO RAW ASTERISKS) */}
              <View style={styles.markdownBody}>
                <MarkdownRenderer content={msg.text} textColor="#f1f5f9" />
              </View>

              {/* 5. Follow-Up Question & Action Chips */}
              {msg.follow_up_question && (
                <View style={styles.followUpCard}>
                  <View style={styles.followUpHeader}>
                    <HelpCircle size={13} color="#818cf8" />
                    <Text style={styles.followUpText}>{msg.follow_up_question}</Text>
                  </View>
                  <View style={styles.actionChipsRow}>
                    {[
                      { label: '🏗️ Concrete Pouring', query: `Can I pour concrete in ${msg.location?.district_name || 'here'} tomorrow?` },
                      { label: '🌾 Crop Harvesting', query: `Is it suitable for harvesting in ${msg.location?.district_name || 'here'} tomorrow?` },
                      { label: '⛰️ Hill Travel', query: `Is it safe to drive in the hills in ${msg.location?.district_name || 'here'}?` },
                      { label: '🚗 Highway Drive', query: `Is highway driving safe in ${msg.location?.district_name || 'here'}?` },
                    ].map((chip, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.actionChip}
                        onPress={() => handleSend(chip.query)}
                      >
                        <Text style={styles.actionChipText}>{chip.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* 6. Collapsible Technical Details */}
              {msg.forecast && (
                <View style={styles.techSection}>
                  <TouchableOpacity
                    style={styles.techToggle}
                    onPress={() => setExpandedTechId(isTechOpen ? null : msg.id)}
                  >
                    <FileText size={12} color="#94a3b8" />
                    <Text style={styles.techToggleText}>
                      {isTechOpen ? 'Hide Model Details' : 'Show Technical Model Details'}
                    </Text>
                    {isTechOpen ? <ChevronUp size={12} color="#94a3b8" /> : <ChevronDown size={12} color="#94a3b8" />}
                  </TouchableOpacity>

                  {isTechOpen && (
                    <View style={styles.techContent}>
                      <View style={styles.techGrid}>
                        <View style={styles.techBox}>
                          <Text style={styles.techBoxLabel}>Raw NWP Baseline</Text>
                          <Text style={styles.techBoxVal}>{msg.forecast.raw_nwp_rain_6h_mm ?? 0.0} mm</Text>
                        </View>
                        <View style={styles.techBox}>
                          <Text style={styles.techBoxLabel}>VRISHTI AI Corrected</Text>
                          <Text style={[styles.techBoxVal, { color: '#818cf8' }]}>{msg.forecast.ai_corrected_rain_6h_mm ?? msg.expected_rain_mm} mm</Text>
                        </View>
                        <View style={styles.techBox}>
                          <Text style={styles.techBoxLabel}>Predicted Bias</Text>
                          <Text style={[styles.techBoxVal, { color: '#38bdf8' }]}>
                            {msg.forecast.predicted_bias_mm >= 0 ? '+' : ''}{msg.forecast.predicted_bias_mm ?? 0.0} mm
                          </Text>
                        </View>
                        <View style={styles.techBox}>
                          <Text style={styles.techBoxLabel}>Weather Regime</Text>
                          <Text style={[styles.techBoxVal, { color: '#fbbf24', fontSize: 11 }]}>{msg.forecast.predicted_regime_name || 'Standard Flow'}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* 7. Dev Debug Trace Footer (14 Telemetry Fields) */}
              {msg.debug_trace && (
                <View style={styles.traceFooter}>
                  <TouchableOpacity
                    style={styles.traceToggle}
                    onPress={() => setExpandedTraceId(isTraceOpen ? null : msg.id)}
                  >
                    <View style={styles.traceToggleLeft}>
                      <Sparkles size={11} color="#818cf8" />
                      <Text style={styles.traceToggleText}>
                        VRISHTI Intelligence Trace • {msg.debug_trace.detectedDistrict || 'Detected'} • {msg.debug_trace.latencyMs || 15}ms
                      </Text>
                    </View>
                    {isTraceOpen ? <ChevronUp size={11} color="#64748b" /> : <ChevronDown size={11} color="#64748b" />}
                  </TouchableOpacity>

                  {isTraceOpen && (
                    <View style={styles.traceExpanded}>
                      {[
                        { k: 'submittedQuery', v: msg.debug_trace.submittedQuery },
                        { k: 'detectedIntent', v: msg.debug_trace.detectedIntent },
                        { k: 'confidence', v: msg.debug_trace.confidence !== undefined ? `${Math.round((msg.debug_trace.confidence || 0.95) * 100)}%` : '95%' },
                        { k: 'detectedState', v: msg.debug_trace.detectedState },
                        { k: 'detectedDistrict', v: msg.debug_trace.detectedDistrict },
                        { k: 'resolvedLocation', v: msg.debug_trace.resolvedLocation },
                        { k: 'resolvedDate', v: msg.debug_trace.resolvedDate },
                        { k: 'resolvedTimeRange', v: msg.debug_trace.resolvedTimeRange || 'today' },
                        { k: 'weatherVariable', v: msg.debug_trace.weatherVariable || msg.debug_trace.detectedWeatherVariable || 'rainfall' },
                        { k: 'detectedSector', v: msg.debug_trace.detectedSector || 'General Weather' },
                        { k: 'selectedSector', v: msg.debug_trace.selectedSector || 'General Weather' },
                        { k: 'dataSource', v: msg.debug_trace.dataSource || 'VRISHTI ML Pipeline' },
                        { k: 'requestStatus', v: msg.debug_trace.requestStatus || 'SUCCESS (200)' },
                        { k: 'latencyMs', v: `${msg.debug_trace.latencyMs || 15} ms` },
                      ].map((item, idx) => (
                        <View key={idx} style={styles.traceItem}>
                          <Text style={styles.traceKey}>{item.k}:</Text>
                          <Text style={styles.traceVal} numberOfLines={1}>{String(item.v || '')}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* 8. Recommended VRISHTI Module Actions */}
              {msg.recommended_actions && msg.recommended_actions.length > 0 && (
                <View style={styles.actionsPanel}>
                  <View style={styles.actionsPanelHeader}>
                    <Activity size={12} color="#818cf8" />
                    <Text style={styles.actionsPanelTitle}>EXPLORE IN VRISHTI</Text>
                  </View>
                  {msg.recommended_actions.map((action, idx) => {
                    const dest = action.destination?.toLowerCase();
                    let IconComp: any = ArrowRight;
                    if (dest === 'map' || dest === 'forecast') IconComp = Map;
                    else if (dest === 'verification' || dest === 'audit') IconComp = Shield;
                    else if (dest === 'regime') IconComp = Layers;
                    else if (dest === 'sandbox') IconComp = Sliders;
                    else if (dest === 'feature_importance') IconComp = BarChart3;
                    else if (dest === 'calibration') IconComp = Activity;
                    else if (dest === 'ablation') IconComp = Cpu;
                    else if (dest === 'provenance') IconComp = Database;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.actionCard}
                        onPress={() => handleExecuteAction(action)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.actionCardLeft}>
                          <View style={styles.actionIconWrap}>
                            <IconComp size={14} color="#38bdf8" />
                          </View>
                          <View style={styles.actionCardText}>
                            <Text style={styles.actionCardLabel}>{action.label}</Text>
                            {action.reason ? (
                              <Text style={styles.actionCardReason} numberOfLines={2}>{action.reason}</Text>
                            ) : null}
                          </View>
                        </View>
                        <ArrowRight size={14} color="#38bdf8" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {isSending && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#818cf8" />
            <Text style={styles.loadingText}>VRISHTI AI is evaluating meteorological models...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested Questions Quick Horizontal Carousel */}
      <View style={styles.suggestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsList}
        >
          {EXAMPLE_CHIPS.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleSend(chip.query)}
              disabled={isSending}
            >
              <Text style={styles.suggestionChipCategory}>{chip.category}: </Text>
              <Text style={styles.suggestionChipText}>{chip.query}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Chat Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about rain, floods, highways..."
            placeholderTextColor="#64748b"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.7}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Send size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },

  // Banner
  bannerCard: {
    backgroundColor: '#0b1220',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#ffffff',
  },
  bannerSub: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#94a3b8',
    marginTop: 1,
  },
  districtActiveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  districtActiveText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#34d399',
  },

  // Category Tabs
  categoryScrollWrap: {
    backgroundColor: '#070c18',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 6,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryTabActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  categoryTabText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '700',
    color: '#94a3b8',
  },
  categoryTabTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },

  // Message Scroll
  messageScroll: {
    flex: 1,
  },
  messageContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },

  // User Bubble
  userBubbleContainer: {
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: '#4f46e5',
    borderRadius: RADIUS.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  userText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 20,
  },
  userTime: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
  },

  // Assistant Card
  assistantCard: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
    paddingBottom: 8,
  },
  assistantHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#818cf8',
    letterSpacing: 0.5,
  },
  botTime: {
    fontSize: 9,
    color: '#64748b',
  },
  intentBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  intentBadgeText: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#818cf8',
  },

  // 1. Headline Banner
  headlineBanner: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 6,
  },
  headlineBannerGreen: {
    backgroundColor: 'rgba(6, 78, 59, 0.4)',
    borderColor: '#10b981',
  },
  headlineBannerBlue: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderColor: '#38bdf8',
  },
  headlineBannerRed: {
    backgroundColor: 'rgba(136, 19, 55, 0.4)',
    borderColor: '#f43f5e',
  },
  headlineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headlineSource: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  headlineTitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 22,
  },
  headlineNote: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontWeight: '600',
    color: '#e2e8f0',
    lineHeight: 18,
  },

  // 2. KPI Row
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#080d19',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.md,
    padding: 8,
    gap: 2,
  },
  kpiCardLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  kpiCardVal: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '900',
    color: '#ffffff',
  },
  kpiCardSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },

  // 3. Telemetry Grid
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  telemetryItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  telemetryLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#94a3b8',
  },
  telemetryVal: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#ffffff',
  },

  // 3b. Evidence & Why Cards
  evidenceRow: {
    gap: 6,
    marginVertical: 4,
  },
  evidenceCard: {
    backgroundColor: '#080d19',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 3,
  },
  evidenceLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#818cf8',
    textTransform: 'uppercase',
  },
  whyLabel: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#34d399',
    textTransform: 'uppercase',
  },
  evidenceText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#e2e8f0',
    lineHeight: 16,
  },

  // 4. Markdown Body
  markdownBody: {
    paddingVertical: 2,
  },

  // 5. Follow-Up
  followUpCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 6,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  followUpText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#c7d2fe',
    flex: 1,
  },
  actionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionChipText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#c7d2fe',
  },

  // 6. Tech Section
  techSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 6,
  },
  techToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  techToggleText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#94a3b8',
    flex: 1,
    marginLeft: 6,
  },
  techContent: {
    marginTop: 6,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techBox: {
    width: '48.5%',
    backgroundColor: '#080d19',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.sm,
    padding: 6,
    gap: 2,
  },
  techBoxLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
  },
  techBoxVal: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontWeight: '800',
    color: '#ffffff',
  },

  // 7. Trace Footer
  traceFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
    paddingTop: 6,
  },
  traceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  traceToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  traceToggleText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#64748b',
  },
  traceExpanded: {
    backgroundColor: '#080d19',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 8,
    marginTop: 6,
    gap: 3,
  },
  traceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  traceKey: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#64748b',
  },
  traceVal: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#34d399',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },

  // Loading
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#c7d2fe',
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: '#080d19',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 6,
  },
  suggestionsList: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  suggestionChipCategory: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#818cf8',
  },
  suggestionChipText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#94a3b8',
  },

  // Input
  inputContainer: {
    backgroundColor: '#0b1220',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#334155',
    paddingLeft: SPACING.md,
    paddingRight: 4,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#ffffff',
    height: '100%',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },

  // Recommended Actions Panel
  actionsPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(14, 30, 54, 0.85)',
    overflow: 'hidden',
  },
  actionsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.15)',
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  actionsPanelTitle: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.08)',
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardText: {
    flex: 1,
  },
  actionCardLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#e2e8f0',
  },
  actionCardReason: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 13,
  },
});
