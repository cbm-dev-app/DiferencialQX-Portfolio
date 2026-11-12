import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectDemoCases } from '@/data/demo-cases';
import { useExamAttemptStore } from '@/store/exam-attempt-store';
import { useAppTheme } from '@/store/app-theme-store';
import type { ExamSize } from '@/types/exam';
export default function Home() {
  const [size,setSize]=useState<ExamSize>(5);
  const {startExam}=useExamAttemptStore();
  const {isDark,toggleTheme}=useAppTheme();
  const ink=isDark?'#E6F3ED':'#0F3D2E';
  const paper=isDark?'#12261E':'#FFFFFF';
  return <SafeAreaView style={{flex:1,backgroundColor:isDark?'#0B1411':'#F4F8F6'}}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.top}><Text style={[styles.brand,{color:ink}]}>DIFERENCIAL QX</Text><Pressable accessibilityRole="button" onPress={toggleTheme}><Text style={{color:ink}}>Cambiar tema</Text></Pressable></View>
      <View style={[styles.hero,{backgroundColor:paper}]}>
        <Text style={styles.eyebrow}>PORTFOLIO · DEMO INTERACTIVA</Text>
        <Text style={[styles.title,{color:ink}]}>Un caso.
Todo el contexto.</Text>
        <Text style={[styles.copy,{color:ink}]}>Explora una experiencia de práctica organizada por casos: responde, revisa tus resultados y consulta el historial de la sesión.</Text>
        <View style={styles.notice}><Text style={{color:'#0F3D2E',lineHeight:21}}>Ejemplos sintéticos, sin contenido clínico. No requiere cuenta. Los intentos se borran al recargar.</Text></View>
      </View>
      <View style={[styles.card,{backgroundColor:paper}]}>
        <Text style={[styles.heading,{color:ink}]}>Configura tu práctica</Text>
        <Text style={{color:ink}}>Selecciona el número de casos</Text>
        <View style={styles.row}>{([5,10,25] as ExamSize[]).map(n=><Pressable key={n} accessibilityRole="button" accessibilityState={{selected:size===n}} onPress={()=>setSize(n)} style={[styles.choice,{backgroundColor:size===n?'#0F3D2E':paper}]}><Text style={{color:size===n?'#FFFFFF':ink,fontSize:22,fontWeight:'700'}}>{n}</Text><Text style={{color:size===n?'#FFFFFF':ink}}>casos</Text></Pressable>)}</View>
        <Pressable accessibilityRole="button" style={styles.primary} onPress={()=>{if(startExam(selectDemoCases(size),size)) router.replace('/exam');}}><Text style={styles.primaryText}>Iniciar demo</Text></Pressable>
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={()=>router.push('/attempts')}><Text style={{color:ink,fontWeight:'600'}}>Ver historial de la sesión</Text></Pressable>
      </View>
      <Text style={[styles.footer,{color:ink}]}>React Native · Expo Router · TypeScript
Diseñado para conservar el contexto de cada caso.</Text>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({content:{padding:24,gap:22,width:'100%',maxWidth:780,alignSelf:'center'},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},brand:{fontWeight:'800',fontSize:13,letterSpacing:1},hero:{borderRadius:24,padding:28,gap:20},eyebrow:{color:'#2E7D32',fontSize:11,fontWeight:'800',letterSpacing:1},title:{fontSize:42,lineHeight:46,fontWeight:'800',letterSpacing:-1.5},copy:{fontSize:16,lineHeight:25},notice:{backgroundColor:'#EAF5EE',padding:16,borderRadius:12},card:{borderRadius:24,padding:24,gap:18},heading:{fontSize:22,fontWeight:'700'},row:{flexDirection:'row',gap:12},choice:{flex:1,borderWidth:1,borderColor:'#91B69F',borderRadius:14,padding:16,alignItems:'center',gap:4},primary:{backgroundColor:'#0F3D2E',padding:17,borderRadius:14,alignItems:'center'},primaryText:{color:'#FFFFFF',fontSize:16,fontWeight:'700'},secondary:{padding:8,alignItems:'center'},footer:{textAlign:'center',fontSize:12,lineHeight:20}});
