import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

interface MarkdownRendererProps {
  content: string;
  style?: any;
  textColor?: string;
}

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
}

function parseInlineFormatting(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Regex to match bold (**text**), code (`text`), or link ([text](url))
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.substring(lastIndex, match.index) });
    }

    if (match[2]) {
      // Bold: **text**
      segments.push({ text: match[2], bold: true });
    } else if (match[3]) {
      // Inline code: `text`
      segments.push({ text: match[3], code: true });
    } else if (match[4] && match[5]) {
      // Link: [text](url)
      segments.push({ text: match[4], link: match[5] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.substring(lastIndex) });
  }

  return segments;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  style,
  textColor = '#f1f5f9',
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block start / end
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        renderedElements.push(
          <View key={`code-${codeKey++}`} style={styles.codeBlock}>
            <Text style={styles.codeText}>{codeText}</Text>
          </View>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty line
    if (!trimmed) {
      renderedElements.push(<View key={`spacer-${i}`} style={styles.lineSpacer} />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.substring(4);
      renderedElements.push(
        <Text key={`h3-${i}`} style={[styles.h3, { color: textColor }]}>
          {renderInline(headingText, textColor)}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.substring(3);
      renderedElements.push(
        <Text key={`h2-${i}`} style={[styles.h2, { color: textColor }]}>
          {renderInline(headingText, textColor)}
        </Text>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.substring(2);
      renderedElements.push(
        <Text key={`h1-${i}`} style={[styles.h1, { color: textColor }]}>
          {renderInline(headingText, textColor)}
        </Text>
      );
      continue;
    }

    // Bullet points (•, *, -)
    const bulletMatch = trimmed.match(/^([•\*\-]\s+)(.*)$/);
    if (bulletMatch) {
      const bulletContent = bulletMatch[2];
      renderedElements.push(
        <View key={`bullet-${i}`} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, { color: COLORS.primary }]}>•</Text>
          <Text style={[styles.bulletText, { color: textColor }]}>
            {renderInline(bulletContent, textColor)}
          </Text>
        </View>
      );
      continue;
    }

    // Numbered lists (1. , 2. )
    const numMatch = trimmed.match(/^(\d+\.\s+)(.*)$/);
    if (numMatch) {
      const numLabel = numMatch[1];
      const numContent = numMatch[2];
      renderedElements.push(
        <View key={`num-${i}`} style={styles.bulletRow}>
          <Text style={[styles.numLabel, { color: COLORS.primary }]}>{numLabel}</Text>
          <Text style={[styles.bulletText, { color: textColor }]}>
            {renderInline(numContent, textColor)}
          </Text>
        </View>
      );
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <Text key={`p-${i}`} style={[styles.paragraph, { color: textColor }]}>
        {renderInline(rawLine, textColor)}
      </Text>
    );
  }

  // Handle unclosed code block if any
  if (inCodeBlock && codeBuffer.length > 0) {
    renderedElements.push(
      <View key={`code-end-${codeKey}`} style={styles.codeBlock}>
        <Text style={styles.codeText}>{codeBuffer.join('\n')}</Text>
      </View>
    );
  }

  return <View style={[styles.container, style]}>{renderedElements}</View>;
};

function renderInline(text: string, baseColor: string): React.ReactNode {
  const segments = parseInlineFormatting(text);
  return segments.map((seg, idx) => {
    if (seg.link) {
      return (
        <Text
          key={idx}
          style={styles.link}
          onPress={() => Linking.openURL(seg.link!).catch(() => {})}
        >
          {seg.text}
        </Text>
      );
    }
    if (seg.bold) {
      return (
        <Text key={idx} style={[styles.bold, { color: baseColor === '#020617' ? '#0f172a' : '#ffffff' }]}>
          {seg.text}
        </Text>
      );
    }
    if (seg.code) {
      return (
        <Text key={idx} style={styles.inlineCode}>
          {seg.text}
        </Text>
      );
    }
    if (seg.italic) {
      return (
        <Text key={idx} style={styles.italic}>
          {seg.text}
        </Text>
      );
    }
    return (
      <Text key={idx} style={{ color: baseColor }}>
        {seg.text}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  h1: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: 8,
    marginBottom: 6,
  },
  h2: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: 8,
    marginBottom: 4,
  },
  h3: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    marginTop: 6,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
    fontWeight: '900',
  },
  numLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  codeBlock: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: 6,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#94a3b8',
  },
  lineSpacer: {
    height: 6,
  },
});
