import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Root: {
        screens: {
          Cards: {
            screens: {
              CardsScreen: 'cards',
            },
          },
          Home: {
            screens: {
              HomeScreen: 'home',
            },
          },
          Stats: {
            screens: {
              StatsScreen: 'stats',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};

export default linking;
