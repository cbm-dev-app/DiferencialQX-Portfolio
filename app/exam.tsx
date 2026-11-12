import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/store/app-theme-store';
import { useExamAttemptStore } from '@/store/exam-attempt-store';
import type { OptionValue } from '@/types/exam';

const OPTION_KEYS: OptionValue[] = ['A', 'B', 'C', 'D'];

function getOptionText(
  optionKey: OptionValue,
  question: {
    opcion_a: string;
    opcion_b: string;
    opcion_c: string;
    opcion_d: string;
  },
) {
  switch (optionKey) {
    case 'A':
      return question.opcion_a;
    case 'B':
      return question.opcion_b;
    case 'C':
      return question.opcion_c;
    case 'D':
      return question.opcion_d;
    default:
      return '';
  }
}

export default function ExamScreen() {
  const { isDark } = useAppTheme();
  const colors = {
    bg: isDark ? '#0B1411' : '#F4F8F6',
    card: isDark ? '#12261E' : '#FFFFFF',
    textPrimary: isDark ? '#E6F3ED' : '#0F3D2E',
    textSecondary: isDark ? '#98C9AE' : '#1B5E20',
    border: isDark ? '#2F6F4B' : '#1B5E20',
    borderSoft: isDark ? '#214635' : '#DDE8E1',
    selected: '#2E7D32',
    primaryBtn: isDark ? '#1E5D43' : '#0F3D2E',
    white: '#FFFFFF',
    error: '#F97070',
    mutedSurface: isDark ? '#163128' : '#F8FCF9',
  };

  const router = useRouter();
  const navigation = useNavigation();
  const questionsScrollRef = useRef<ScrollView | null>(null);
  const allowNavigationRef = useRef(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    state,
    currentCase,
    selectAnswer,
    submitCurrentCase,
    submitExam,
    resetExam,
    canSubmitCurrentCase,
    canSubmitExam,
  } = useExamAttemptStore();

  useFocusEffect(
    useCallback(() => {
      if (state.status !== 'in_progress') {
        return () => {};
      }

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      const navListener = navigation.addListener('beforeRemove', (event) => {
        if (allowNavigationRef.current) {
          return;
        }

        event.preventDefault();
      });

      return () => {
        subscription.remove();
        navListener();
      };
    }, [navigation, state.status]),
  );

  useEffect(() => {
    questionsScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [state.currentCaseIndex]);

  const totalCases = state.cases.length;
  const currentCaseSubmitted = currentCase ? state.caseSubmitted[currentCase.caseId] === true : false;
  const isLastCase = currentCase ? state.currentCaseIndex === totalCases - 1 : false;
  const answeredCount = currentCase
    ? currentCase.questions.filter((question) => state.answers[`${currentCase.caseId}:${question.questionId}`] !== undefined).length
    : 0;
  const progressRatio = currentCase ? answeredCount / currentCase.questions.length : 0;
  const actionLabel = isLastCase ? (isSubmittingExam ? 'Guardando...' : 'Enviar examen') : 'Enviar caso';
  const actionDisabled = isLastCase ? !canSubmitExam || isSubmittingExam : !canSubmitCurrentCase;

  const handleSubmitExam = async () => {
    if (isSubmittingExam) {
      return;
    }

    setIsSubmittingExam(true);
    setSubmitError(null);

    try {
      const attemptId = await submitExam();
      if (!attemptId) {
        setSubmitError('No se pudo guardar el intento.');
        setIsSubmittingExam(false);
        return;
      }

      allowNavigationRef.current = true;
      router.replace({ pathname: '/results', params: { attemptId } } as any);
    } catch (error) {
      console.error('[exam] submit failed', error);
      setSubmitError('Error guardando intento. Verifica sesión activa.');
      setIsSubmittingExam(false);
    }
  };

  const handleExitExam = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Salir del examen? Se perderá el intento sin terminar.')) {
        allowNavigationRef.current = true;
        resetExam();
        router.replace('/');
      }
      return;
    }
    Alert.alert('Salir del examen', 'Al salir del examen sin terminarlo no se guardará el intento.', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          allowNavigationRef.current = true;
          resetExam();
          router.replace('/' as any);
        },
      },
    ]);
  };

  if (state.status === 'idle' || !currentCase) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No hay examen en progreso.</Text>
          <Pressable
            onPress={() => router.replace('/')}
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Volver al inicio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (state.status === 'submitted') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Examen enviado.</Text>
          <Pressable
            onPress={() => router.replace('/attempts' as any)}
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Ver historial</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.caseShell, { backgroundColor: colors.bg, borderBottomColor: colors.borderSoft }]}>
          <View style={[styles.caseCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
            <View style={styles.caseTopActions}>
              <Pressable
                onPress={handleExitExam}
                style={[styles.exitExamButton, { borderColor: colors.borderSoft, backgroundColor: colors.card }]}>
                <Text style={[styles.exitExamText, { color: colors.textSecondary }]}>Salir del examen</Text>
              </Pressable>
            </View>
            <View style={styles.caseHeaderRow}>
              <View style={styles.caseHeaderCopy}>
                <Text style={[styles.caseMeta, { color: colors.textSecondary }]}>
                  Caso {state.currentCaseIndex + 1} de {totalCases}
                </Text>
                <Text style={[styles.caseHeaderSubcopy, { color: colors.textSecondary }]}>
                  {answeredCount} de {currentCase.questions.length} preguntas respondidas
                </Text>
              </View>
              <Text style={[styles.progressPill, { backgroundColor: colors.mutedSurface, color: colors.textSecondary }]}>
                {currentCase.questions.length} preguntas
              </Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.mutedSurface }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.selected, width: `${progressRatio * 100}%` }]} />
            </View>

            <Text style={[styles.caseTitle, { color: colors.textPrimary }]}>
              {currentCase.tema}
            </Text>

            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={[styles.caseBodyScroll, { backgroundColor: colors.mutedSurface }]}>
              <Text style={[styles.caseBody, { color: colors.textPrimary }]}>{currentCase.caso}</Text>
            </ScrollView>
          </View>
        </View>

        <ScrollView
          ref={questionsScrollRef}
          style={styles.questionsScroll}
          contentContainerStyle={styles.questionsContent}
          showsVerticalScrollIndicator={false}>
          {currentCase.questions.map((question) => {
            const answerKey = `${currentCase.caseId}:${question.questionId}`;
            const selected = state.answers[answerKey];

            return (
              <View key={question.questionId} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionBadge, { color: colors.selected, backgroundColor: colors.mutedSurface }]}>
                    Pregunta {question.numero}
                  </Text>
                </View>
                <Text style={[styles.questionTitle, { color: colors.textPrimary }]}>
                  {question.pregunta}
                </Text>

                <View style={styles.optionsGroup}>
                  {OPTION_KEYS.map((optionKey) => {
                    const isSelected = selected === optionKey;

                    return (
                      <Pressable
                        key={optionKey}
                        accessibilityRole="button"
                        accessibilityLabel={`Pregunta ${question.numero}, opción ${optionKey}`}
                        accessibilityState={{ selected: isSelected, disabled: currentCaseSubmitted }}
                        disabled={currentCaseSubmitted}
                        onPress={() => selectAnswer(currentCase.caseId, question.questionId, optionKey)}
                        style={[
                          styles.optionButton,
                          { borderColor: colors.border, backgroundColor: colors.card },
                          isSelected && [
                            styles.optionButtonSelected,
                            { backgroundColor: colors.selected, borderColor: colors.selected },
                          ],
                        ]}>
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.textSecondary },
                            isSelected && [styles.optionTextSelected, { color: colors.white }],
                          ]}>
                          {optionKey}. {getOptionText(optionKey, question)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {submitError ? <Text style={[styles.errorText, { color: colors.error }]}>{submitError}</Text> : null}
        </ScrollView>

        <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.borderSoft }]}>
          <Pressable
            onPress={isLastCase ? handleSubmitExam : submitCurrentCase}
            accessibilityRole="button"
            disabled={actionDisabled}
            style={[
              styles.primaryButton,
              styles.actionButton,
              { backgroundColor: colors.primaryBtn },
              actionDisabled && styles.buttonDisabled,
            ]}>
            <Text style={[styles.primaryButtonText, { color: colors.white }]}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  caseShell: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  caseCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  caseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  caseTopActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  exitExamButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  exitExamText: {
    fontSize: 11,
    fontWeight: '700',
  },
  caseHeaderCopy: {
    gap: 2,
    flex: 1,
  },
  caseMeta: {
    fontWeight: '700',
    fontSize: 13,
  },
  caseHeaderSubcopy: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  caseTitle: {
    fontWeight: '700',
    fontSize: 20,
  },
  caseBodyScroll: {
    maxHeight: 184,
    borderRadius: 12,
  },
  caseBody: {
    fontSize: 15,
    lineHeight: 22,
    padding: 12,
  },
  questionsScroll: {
    flex: 1,
  },
  questionsContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 12,
  },
  questionCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  questionHeader: {
    flexDirection: 'row',
  },
  questionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionsGroup: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  actionButton: {
    marginTop: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
