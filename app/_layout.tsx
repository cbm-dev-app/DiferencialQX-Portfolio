import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppThemeProvider } from '@/store/app-theme-store';
import { ExamAttemptProvider } from '@/store/exam-attempt-store';
export default function Layout() {
  return <AppThemeProvider><ExamAttemptProvider><Stack screenOptions={{headerShown:false}} /><StatusBar style="auto" /></ExamAttemptProvider></AppThemeProvider>;
}
