import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AttemptReview } from '@/lib/attempts-service';
import { useAppTheme } from '@/store/app-theme-store';

type AttemptReviewContentProps = {
  review: AttemptReview;
  heading?: string;
  actions?: ReactNode;
  footerActions?: ReactNode;
};

function formatDate(date: Date | null): string {
  if (!date) {
    return 'Sin fecha';
  }

  return date.toLocaleString();
}

export function AttemptReviewContent({
  review,
  heading = 'Resultado',
  actions,
  footerActions,
}: AttemptReviewContentProps) {
  const { isDark } = useAppTheme();
  const colors = {
    bg: isDark ? '#0B1411' : '#F4F8F6',
    card: isDark ? '#12261E' : '#FFFFFF',
    textPrimary: isDark ? '#E6F3ED' : '#0F3D2E',
    textSecondary: isDark ? '#98C9AE' : '#1B5E20',
    border: isDark ? '#2F6F4B' : '#1B5E20',
    borderSoft: isDark ? '#214635' : '#DDE8E1',
    accentSoft: isDark ? '#163128' : '#EAF5EE',
    accentStrong: '#2E7D32',
    mutedSurface: isDark ? '#1A3228' : '#F7FAF8',
  };
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{heading}</Text>
        <Text style={styles.bigScore}>{review.attempt.percentage}%</Text>
        <Text style={[styles.summaryLead, { color: colors.textSecondary }]}>
          Correctas: {review.attempt.totalCorrect} | Incorrectas: {review.attempt.totalIncorrect}
        </Text>
        <View style={styles.metricGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Casos</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{review.attempt.examSize}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Aciertos</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{review.attempt.totalCorrect}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Errores</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{review.attempt.totalIncorrect}</Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDate(review.attempt.createdAt)}</Text>
      </View>

      {actions ? <View style={styles.actionsBlock}>{actions}</View> : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Desglose por caso</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Revisa tus respuestas, la opcion correcta y la referencia obligatoria.
        </Text>
      </View>

      {review.cases.map((caseItem, caseIndex) => (
        <View key={caseItem.caseId} style={[styles.caseCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
          <View style={styles.caseTitleRow}>
            <Text style={[styles.caseIndexBadge, { color: colors.accentStrong, backgroundColor: colors.accentSoft }]}>
              Caso {caseIndex + 1}
            </Text>
            <Text style={[styles.caseScorePill, { color: colors.textSecondary, backgroundColor: colors.mutedSurface }]}>
              {caseItem.correctCount}/{caseItem.totalQuestions}
            </Text>
          </View>
          <Text style={[styles.caseTitle, { color: colors.textPrimary }]}>
            {caseItem.tema}
            {caseItem.subtema ? ` - ${caseItem.subtema}` : ''}
          </Text>
          <Text
            style={[
              styles.caseBody,
              {
                color: isDark ? '#DDEEE4' : '#0F3D2E',
                backgroundColor: isDark ? '#163128' : '#F8FCF9',
              },
            ]}>
            {caseItem.caso}
          </Text>

          <Text style={[styles.caseMeta, { color: isDark ? '#A9D8BE' : '#1B5E20' }]}>
            Aciertos del caso: {caseItem.correctCount}/{caseItem.totalQuestions}
          </Text>

          {caseItem.questions.map((question) => (
            <View key={question.questionId} style={styles.questionRow}>
              <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                {question.numero}. {question.pregunta}
              </Text>
              <View style={styles.optionsBox}>
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const optionText =
                    letter === 'A'
                      ? question.opcion_a
                      : letter === 'B'
                        ? question.opcion_b
                        : letter === 'C'
                          ? question.opcion_c
                          : question.opcion_d;

                  const isCorrectOption = question.correctAnswer === letter;
                  const isUserOption = question.userAnswer === letter;
                  const isUserAndCorrect = isCorrectOption && isUserOption;
                  const marker = isUserAndCorrect
                    ? '  <- Tu respuesta (correcta)'
                    : isCorrectOption
                      ? '  <- Respuesta correcta'
                      : isUserOption
                        ? '  <- Tu respuesta'
                        : '';
                  const optionBg = isUserAndCorrect
                    ? '#D6F0DC'
                    : isUserOption && !isCorrectOption
                      ? '#FDE2E4'
                      : isCorrectOption
                        ? '#E8F5E9'
                        : isDark
                          ? '#1A3228'
                          : '#F7FAF8';
                  const optionColor = isUserOption && !isCorrectOption
                    ? '#C62828'
                    : isCorrectOption
                      ? '#0F3D2E'
                      : isDark
                        ? '#DDEEE4'
                        : '#0F3D2E';
                  const optionBorderColor = isUserAndCorrect
                    ? '#2E7D32'
                    : isUserOption && !isCorrectOption
                      ? '#C62828'
                      : isCorrectOption
                        ? '#81C784'
                        : isDark
                          ? '#2F6F4B'
                          : '#DDE8E1';

                  return (
                    <Text
                      key={`${question.questionId}-${letter}`}
                      style={[
                        styles.optionText,
                        {
                          backgroundColor: optionBg,
                          color: optionColor,
                          borderColor: optionBorderColor,
                          borderWidth: 1,
                        },
                        (isCorrectOption || isUserOption) && styles.optionEmphasis,
                      ]}>
                      {letter}. {optionText}
                      {marker}
                    </Text>
                  );
                })}
              </View>
              {question.isCorrect ? (
                <Text style={[styles.answerText, styles.correctText]}>Seleccionaste la respuesta correcta.</Text>
              ) : (
                <Text style={[styles.answerText, styles.incorrectText]}>
                  Tu respuesta: {question.userAnswer ?? '-'} | Respuesta correcta: {question.correctAnswer}
                </Text>
              )}
            </View>
          ))}

          <View style={[styles.referenceBox, { backgroundColor: isDark ? '#163128' : '#EAF5EE' }]}>
            <Text style={[styles.referenceTitle, { color: colors.textSecondary }]}>Referencia</Text>
            <Text style={[styles.referenceText, { color: isDark ? '#DDEEE4' : '#0F3D2E' }]}>{caseItem.referencia}</Text>
          </View>
        </View>
      ))}

      {footerActions ? <View style={styles.footerActions}>{footerActions}</View> : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8F6',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 34,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    color: '#0F3D2E',
    fontSize: 24,
    fontWeight: '700',
  },
  bigScore: {
    color: '#2E7D32',
    fontSize: 44,
    fontWeight: '800',
  },
  summaryLead: {
    color: '#1B5E20',
    fontSize: 15,
    textAlign: 'center',
  },
  metricGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: '#1B5E20',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    gap: 4,
    paddingHorizontal: 2,
  },
  actionsBlock: {
    gap: 10,
  },
  footerActions: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  caseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  caseIndexBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  caseScorePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  caseTitle: {
    color: '#0F3D2E',
    fontSize: 16,
    fontWeight: '700',
  },
  caseMeta: {
    color: '#1B5E20',
    fontSize: 13,
    fontWeight: '600',
  },
  caseBody: {
    fontSize: 14,
    lineHeight: 20,
    borderRadius: 10,
    padding: 10,
  },
  questionRow: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#E7EEE9',
    paddingTop: 8,
  },
  optionsBox: {
    gap: 4,
    marginTop: 4,
  },
  optionText: {
    fontSize: 13,
    color: '#0F3D2E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#F7FAF8',
  },
  optionEmphasis: {
    fontWeight: '700',
  },
  questionText: {
    color: '#0F3D2E',
    fontSize: 14,
  },
  answerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  correctText: {
    color: '#2E7D32',
  },
  incorrectText: {
    color: '#C62828',
  },
  referenceBox: {
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  referenceTitle: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
  },
  referenceText: {
    color: '#0F3D2E',
    fontSize: 13,
  },
});
