import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../screens/SignInScreen';
import SignUpVendorScreen from '../screens/SignUpVendorScreen';
import SignUpVisitorScreen from '../screens/SignUpVisitorScreen';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF8F3' },
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="Sign In" component={SignInScreen} />
        <Stack.Screen name="SignUpVendorScreen" component={SignUpVendorScreen} />
        <Stack.Screen name="SignUpVisitorScreen" component={SignUpVisitorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
