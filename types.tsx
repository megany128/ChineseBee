/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  AddScreen: undefined;
  StartTestScreen: undefined;
  DailyStudyScreen: undefined;
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
  CardInfoScreen: undefined;
  EditScreen: undefined;
  SearchByTagScreen: undefined;
  ProfileScreen: undefined;
  VerifyAccountScreen: undefined;
  TestScreen: undefined;
  TestResultsScreen: undefined;
  SharedDecksScreen: undefined;
  DeckInfoScreen: undefined;
  StudentInfoScreen: undefined;
  ClassDeckInfoScreen: undefined;
  AddDeck: undefined;
  CardInfoScreenTeacher: undefined;
  AddCardTeacher: undefined;
  EditTeacher: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootTabParamList = {
  Cards: undefined;
  Home: undefined;
  Stats: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
