import './config/firebase';
import React from 'react';
import RootNavigation from './navigation';
import { ThemeProvider } from 'react-native-elements';
import './config/firebase';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Toast from 'react-native-toast-message';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const toastConfig = {
    correctToast: ({ props }: any) => (
      <View style={styles.correctView}>
        <View
          style={{
            borderRadius: 100,
            backgroundColor: 'white',
            width: 65,
            height: 65,
            marginLeft: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Entypo name="check" size={35} color="#FEB1C3" />
        </View>
        <View style={{ flexDirection: 'column', marginLeft: 20 }}>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>{props.chinese}</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{props.pinyin}</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{props.english}</Text>
        </View>
      </View>
    ),
    incorrectToast: ({ props }: any) => (
      <View style={styles.wrongView}>
        <View
          style={{
            borderRadius: 100,
            backgroundColor: 'white',
            width: 65,
            height: 65,
            marginLeft: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Entypo name="cross" size={35} color="#94BAF4" />
        </View>
        <View style={{ flexDirection: 'column', marginLeft: 20 }}>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>{props.chinese}</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{props.pinyin}</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{props.english}</Text>
        </View>
      </View>
    ),
    addToast: () => (
      <View style={styles.addView}>
        <View
          style={{
            borderRadius: 100,
            backgroundColor: 'white',
            width: 65,
            height: 65,
            marginLeft: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Entypo name="check" size={35} color="#FFCB44" />
        </View>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 18, textAlignVertical: 'center', marginLeft: 20 }}>
          Card added!
        </Text>
      </View>
    ),
  };

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ThemeProvider>
        <RootNavigation />
        <Toast position="bottom" bottomOffset={40} visibilityTime={1000} config={toastConfig} />
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  correctView: {
    width: 380,
    height: 100,
    backgroundColor: '#FEB1C3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrongView: {
    width: 380,
    height: 100,
    marginTop: 'auto',
    backgroundColor: '#94BAF4',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addView: {
    width: 380,
    height: 100,
    marginTop: 'auto',
    backgroundColor: '#FFCB44',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
