import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import UserStack from './userStack';
import AuthStack from './authStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAuthentication();

  // if logged in, render UserStack. else, render AuthStack
  return user ? <UserStack /> : <AuthStack />;
}
