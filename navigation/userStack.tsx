import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { RootTabParamList, RootTabScreenProps } from '../types';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import CardsScreen from '../screens/CardsScreen';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import AddScreen from '../screens/AddScreen';
import StartTestScreen from '../screens/StartTestScreen';
import DailyStudyScreen from '../screens/DailyStudyScreen';
import CardInfoScreen from '../screens/CardInfoScreen';
import EditScreen from '../screens/EditScreen';
import SearchByTagScreen from '../screens/SearchByTagScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VerifyAccountScreen from '../screens/VerifyAccountScreen';
import TestScreen from '../screens/TestScreen';

const Stack = createStackNavigator();

const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarInactiveTintColor: '#C4C4C4',
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}
    >
      <BottomTab.Screen
        name="Cards"
        component={CardsScreen}
        options={({ navigation }: RootTabScreenProps<'Cards'>) => ({
          title: 'Cards',
          tabBarIcon: ({ color }) => <TabBarIcon name="cards" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="information"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon3 name="home" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <TabBarIcon2 name="graph" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

export default function UserStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Modal" component={ModalScreen} />
        </Stack.Group>
        <Stack.Screen name="CardInfoScreen" component={CardInfoScreen} />
        <Stack.Screen name="AddScreen" component={AddScreen} />
        <Stack.Screen name="EditScreen" component={EditScreen} />
        <Stack.Screen name="StartTestScreen" component={StartTestScreen} />
        <Stack.Screen name="DailyStudyScreen" component={DailyStudyScreen} />
        <Stack.Screen name="SearchByTagScreen" component={SearchByTagScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="VerifyAccountScreen" component={VerifyAccountScreen} />
        <Stack.Screen name="TestScreen" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: { name: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }) {
  return <MaterialCommunityIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarIcon2(props: { name: React.ComponentProps<typeof Octicons>['name']; color: string }) {
  return <Octicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarIcon3(props: { name: React.ComponentProps<typeof Entypo>['name']; color: string }) {
  return <Entypo size={30} style={{ marginBottom: -3 }} {...props} />;
}
