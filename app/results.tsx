import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttemptReviewContent } from '@/components/attempt-review-content';
import { fetchAttemptReview, getRequiredUserId, type AttemptReview } from '@/lib/attempts-service';
import { useAppTheme } from '@/store/app-theme-store';
import { useExamAttemptStore } from '@/store/exam-attempt-store';

export default function ResultsScreen() {
  const { isDark } = useAppTheme();
  const colors = {
    bg: isDark ? '#0B1411' : '#F4F8F6',
    card: isDark ? '#12261E' : '#FFFFFF',
    textSecondary: isDark ? '#98C9AE' : '#1B5E20',
    border: isDark ? '#2F6F4B' : '#1B5E20',
  };

  const router = useRouter();
  const params = useLocalSearchParams<{ attemptId?: string }>();
  const attemptId = useMemo(() => (typeof params.attemptId === 'string' ? params.attemptId : ''), [params.attemptId]);
  const { lastSubmittedReview, resetExam } = useExamAttemptStore();

  const [review, setReview] = useState<AttemptReview | null>(
    lastSubmittedReview && (!attemptId || lastSubmittedReview.attempt.attemptId === attemptId) ? lastSubmittedReview : null,
  );
  const [isLoading, setIsLoading] = useState(review === null && attemptId.length > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lastSubmittedReview && (!attemptId || lastSubmittedReview.attempt.attemptId === attemptId)) {
      setReview(lastSubmittedReview);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!attemptId) {
      setReview(null);
      setError('No hay un resultado reciente disponible.');
      setIsLoading(false);
      return;
    }

    const loadReview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = getRequiredUserId();
        const result = await fetchAttemptReview(attemptId, userId);

        if (!result) {
          setError('No se encontró el resultado solicitado.');
          setReview(null);
          setIsLoading(false);
          return;
        }

        setReview(result);
      } catch (loadError) {
        console.error('[results] failed to load review', loadError);
        setError('No se pudo cargar el resultado.');
        setReview(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadReview();
  }, [attemptId, lastSubmittedReview]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centeredContainer, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
        <ActivityIndicator color="#1B5E20" />
      </SafeAreaView>
    );
  }

  if (error || !review) {
    return (
      <SafeAreaView style={[styles.centeredContainer, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
        <Text style={styles.errorText}>{error ?? 'Resultado no disponible.'}</Text>
        <Pressable
          style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => {
            resetExam();
            router.replace('/' as any);
          }}>
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Volver al menú principal</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <AttemptReviewContent
        review={review}
        heading="Resumen del examen"
        actions={
          <>
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.replace('/attempts' as any)}>
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Ver historial de exámenes</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.border }]}
              onPress={() => {
                resetExam();
                router.replace('/' as any);
              }}>
              <Text style={styles.primaryButtonText}>Volver al menú principal</Text>
            </Pressable>
          </>
        }
        footerActions={
          <>
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.replace('/attempts' as any)}>
              <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Ver historial de exámenes</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.border }]}
              onPress={() => {
                resetExam();
                router.replace('/' as any);
              }}>
              <Text style={styles.primaryButtonText}>Volver al menú principal</Text>
            </Pressable>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8F6',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F8F6',
    padding: 16,
    gap: 12,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B5E20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#C62828',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
