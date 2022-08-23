import './config/firebase';
import React from 'react';
import RootNavigation from './navigation';
import { ThemeProvider } from 'react-native-elements';
import './config/firebase';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (<ThemeProvider>
      <RootNavigation/>
    </ThemeProvider>
    );
  }
}
