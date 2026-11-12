import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchUserAttempts, getRequiredUserId } from '@/lib/attempts-service';
import { useAppTheme } from '@/store/app-theme-store';

type AttemptRow = {
  attemptId: string;
  examSize: 5 | 10 | 25;
  percentage: number;
  totalCorrect: number;
  totalIncorrect: number;
  createdAt: Date | null;
};

function formatDate(date: Date | null): string {
  if (!date) {
    return 'Sin fecha';
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AttemptsScreen() {
  const { isDark } = useAppTheme();
  const colors = {
    bg: isDark ? '#0B1411' : '#F4F8F6',
    card: isDark ? '#12261E' : '#FFFFFF',
    textPrimary: isDark ? '#E6F3ED' : '#0F3D2E',
    textSecondary: isDark ? '#98C9AE' : '#1B5E20',
    border: isDark ? '#2F6F4B' : '#1B5E20',
    borderSoft: isDark ? '#214635' : '#DDE8E1',
    badge: '#2E7D32',
    white: '#FFFFFF',
    error: '#F97070',
    accentSoft: isDark ? '#163128' : '#EAF5EE',
    heroGlow: isDark ? 'rgba(46,125,50,0.18)' : 'rgba(46,125,50,0.10)',
  };

  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttempts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getRequiredUserId();
      const result = await fetchUserAttempts(userId);
      setAttempts(result);
    } catch (loadError) {
      console.error('[attempts] failed to load attempts', loadError);
      setError('No se pudo cargar el historial. Verifica sesión activa.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAttempts();
    }, [loadAttempts]),
  );

  const metrics = useMemo(() => {
    const total = attempts.length;
    const best = attempts.reduce((max, attempt) => Math.max(max, attempt.percentage), 0);
    const average = total > 0 ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / total) : 0;

    return {
      total,
      best,
      average,
    };
  }, [attempts]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.heroGlow, { backgroundColor: colors.heroGlow }]} />
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
          <Text style={[styles.eyebrow, { color: colors.badge }]}>Historial de exámenes</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Historial de exámenes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Revisa tu progreso, abre cualquier examen previo y consulta tu desempeño reciente.
          </Text>

          <View style={styles.metricGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Exámenes</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{metrics.total}</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Mejor score</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{metrics.best}%</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Promedio</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{metrics.average}%</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.border }]}
          onPress={() => router.replace('/' as any)}>
          <Text style={styles.primaryButtonText}>Volver al menú principal</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#1B5E20" />
          </View>
        ) : null}

        {error ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {!isLoading && !error && attempts.length === 0 ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aún no hay exámenes guardados</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Completa tu primer examen para empezar a construir tu historial.
            </Text>
          </View>
        ) : null}

        {!isLoading &&
          !error &&
          attempts.map((attempt, index) => (
            <Pressable
              key={attempt.attemptId}
              onPress={() =>
                router.push({ pathname: '/attempt/[attemptId]', params: { attemptId: attempt.attemptId } } as any)
              }
              style={[styles.attemptCard, { backgroundColor: colors.card, borderColor: colors.borderSoft }]}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.casePill, { color: colors.badge, backgroundColor: colors.accentSoft }]}>
                  Intento {index + 1}
                </Text>
                <Text style={[styles.scoreBadge, { backgroundColor: colors.badge, color: colors.white }]}>
                  {attempt.percentage}%
                </Text>
              </View>

              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Examen de {attempt.examSize} casos</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                Correctas: {attempt.totalCorrect} | Incorrectas: {attempt.totalIncorrect}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{formatDate(attempt.createdAt)}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8F6',
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  metricGrid: {
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
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  centered: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  messageCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '700',
  },
  attemptCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  casePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
