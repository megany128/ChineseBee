import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Button, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import { RootTabScreenProps } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { db } from '../config/firebase';
import { push, ref, set, onValue, update } from 'firebase/database';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlipCard from 'react-native-flip-card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

var isPast = require('date-fns/isPast');
var format = require('date-fns/format');

const { utcToZonedTime } = require('date-fns-tz');

export default function HomeScreen({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [name, setName] = useState(String);
  const [progress, setProgress] = useState(0);

  const [cardsStudied, setCardsStudied] = useState(0);
  const [minutesLearning, setMinutesLearning] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);

  const [allCards, setAllCards]: any = useState([]);

  const todaysRevision = useRef();

  // TODO: modal to set this
  const newCardLimit = 5;
  const reviewLimit = 5;

  // shuffles cards in an array through recursion
  const shuffleCards: any = (array: []) => {
    let shuffledArray: [] = [];
    if (!array.length) return shuffledArray;

    let index = Math.floor(Math.random() * array.length);
    shuffledArray.push(array[index]);
    let slicedArray = array.slice(0, index).concat(array.slice(index + 1));

    return shuffledArray.concat(shuffleCards(slicedArray));
  };

  const generateTodaysRevision = () => {
    console.log('\nGENERATING TODAYS REVISION...\n');
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      let allCards: any = Object.values(cardItems);
      setAllCards(Object.values(cardItems));

      // gets cards that are not new but are due this session
      // TODO: fix bug - sometimes one card is there twice
      let reviewArray = allCards.filter((obj: { dueDate: number; timesReviewed: number }) => {
        return obj.dueDate === 0 && obj.timesReviewed > 0;
      });

      // gets cards that are new
      let newCardArray = allCards.filter((obj: { timesReviewed: number }) => {
        return obj.timesReviewed === 0;
      });

      // sets today's revision to review cards and new cards randomised
      let combinedCards: any = [...reviewArray.slice(0, reviewLimit), ...newCardArray.slice(0, newCardLimit)];
      let todaysRevisionTemp: any = [...shuffleCards(combinedCards)];
      todaysRevision.current = todaysRevisionTemp;

      console.log('REVIEW ARRAY');
      console.log('============');
      for (let i = 0; i < reviewArray.length; i++) {
        console.log('card' + (i + 1) + ':');
        console.log(
          reviewArray[i].chinese +
            ' / ' +
            reviewArray[i].english +
            ' / due: ' +
            reviewArray[i].dueDate +
            ' / times reviewed: ' +
            reviewArray[i].timesReviewed
        );
      }
      console.log(' ');
      console.log('NEW CARD ARRAY');
      console.log('==============');
      for (let i = 0; i < newCardArray.length; i++) {
        console.log('card' + (i + 1) + ':');
        console.log(
          newCardArray[i].chinese +
            ' / ' +
            newCardArray[i].english +
            ' / due: ' +
            newCardArray[i].dueDate +
            ' / times reviewed: ' +
            newCardArray[i].timesReviewed
        );
      }

      console.log(' ');
      console.log('FULL ARRAY');
      console.log('==========');
      for (let i = 0; i < todaysRevisionTemp.length; i++) {
        console.log('card' + (i + 1) + ':');
        console.log(
          todaysRevisionTemp[i].chinese +
            ' / ' +
            todaysRevisionTemp[i].english +
            ' / ' +
            (todaysRevisionTemp[i].timesReviewed === 0 ? 'new' : 'revision')
        );
      }
    });
  };

  // TODO: only generate new cards when last time opened was in the past
  useEffect(() => {
    generateTodaysRevision();
  }, []);

  const getStats = async () => {
    let cardsStudiedTemp = parseInt((await AsyncStorage.getItem('cardsStudied')) || '0');
    let minutesLearningTemp = parseInt((await AsyncStorage.getItem('minutesLearning')) || '0');

    // TODO: use firebase instead since user shld be able to access over multiple devices
    let lastTimeOpened = await AsyncStorage.getItem('lastTimeOpened');
    let streak = JSON.parse((await AsyncStorage.getItem('dayStreak')) || '0') + 1;
    console.log(lastTimeOpened);
    if (lastTimeOpened) {
      console.log(
        'last time opened:',
        format(utcToZonedTime(new Date(JSON.parse(lastTimeOpened)), 'Asia/Singapore'), 'dd/MM/yy hh:mm')
      );
      if (isPast(utcToZonedTime(new Date(lastTimeOpened), 'Asia/Singapore'))) {
        console.log('first time opening today');
        AsyncStorage.setItem('dailyStudyProgress', '0');
        AsyncStorage.setItem('dayStreak', JSON.stringify(streak));
        AsyncStorage.setItem('minutesLearning', '0');

        generateTodaysRevision();

        return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), async (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let cardItems = { ...data };

          let allCards: any = Object.values(cardItems);

          for (let i = 0; i < allCards.length; i++) {
            update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + allCards[i].key), {
              dueDate: allCards[i].dueDate - 1,
            });
          }
        });
        // TODO: for every card in the db, decrease duedate by 1
      }
    } else {
      console.log('first time opening');
      AsyncStorage.setItem('dailyStudyProgress', '0');
      AsyncStorage.setItem('dayStreak', '1');

      generateTodaysRevision();
    }
    console.log('already opened today');
    console.log('set time opened to:', format(utcToZonedTime(new Date(), 'Asia/Singapore'), 'dd/MM/yy hh:mm'));
    AsyncStorage.setItem('lastTimeOpened', JSON.stringify(Date.now()));

    setCardsStudied(cardsStudiedTemp);
    setMinutesLearning(minutesLearningTemp);
    setDayStreak(streak);
  };

  useEffect(() => {
    getStats();
    const willFocusSubscription = navigation.addListener('focus', () => {
      console.log('getting stats');
      getStats();
    });

    return willFocusSubscription;
  }, []);

  useEffect(() => {
    console.log('use effect');
    console.log(auth.currentUser?.uid);
    return onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let name = { ...data };
      setName(name.name);

      // TODO: generate daily review list here instead

      let dailyStudyProgress = (await AsyncStorage.getItem('dailyStudyProgress')) || '0';
      setProgress(parseFloat(dailyStudyProgress));
    });
  }, []);

  return (
    <LinearGradient colors={['rgba(255,203,68,0.2)', 'rgba(255,255,255,0.3)']} style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'transparent',
              justifyContent: 'space-between',
              width: 370,
              alignSelf: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
              <Text style={styles.greeting}>你好,</Text>
              <Text style={[styles.greeting, { color: '#FFCB44' }]}>{name}</Text>
              <Text style={styles.greeting}>!</Text>
            </View>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => navigation.navigate('ProfileScreen')}>
              <Ionicons name="person-circle-outline" size={35} style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>

          {/* TODO: little bee at end of progress bar */}
          <TouchableOpacity
            style={styles.todaysRevision}
            onPress={() =>
              navigation.navigate('DailyStudyScreen', { todaysRevision: todaysRevision.current, allCards: allCards })
            }
          >
            <Text style={styles.revisionText}>今天的复习</Text>
            <Progress.Bar
              progress={progress}
              height={10}
              width={310}
              color={'#FFE299'}
              borderWidth={0}
              unfilledColor={'white'}
              style={styles.progressBar}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              backgroundColor: 'transparent',
              width: 380,
              justifyContent: 'space-between',
              alignSelf: 'center',
              marginVertical: 10,
            }}
          >
            <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
              {/* Face Side */}
              {/* TODO: add indicator 'word of the day' and 'idiom of the day'*/}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.wordOfTheDayText}>中文</Text>
              </View>
              {/* Back Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.wordOfTheDayText}>Chinese</Text>
              </View>
            </FlipCard>

            <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
              {/* Face Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.idiomOfTheDayText}>四脚{'\n'}朝天</Text>
              </View>
              {/* Back Side */}
              <View style={styles.wordOfTheDay}>
                <Text style={styles.idiomOfTheDayText}>Chinese</Text>
              </View>
            </FlipCard>
          </View>

          <TouchableOpacity style={styles.stats}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}
            >
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50 }}>
                {/* TODO: customise */}
                <Text style={styles.cardsStudied}>{cardsStudied}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>cards{'\n'}studied</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50 }}>
                {/* TODO: customise */}
                <Text style={styles.minutesLearning}>{minutesLearning}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>minutes{'\n'}learning</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent' }}>
                {/* TODO: customise */}
                <Text style={styles.streak}>{dayStreak}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>day{'\n'}streak</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.quickActionsHeader}>QUICK ACTIONS</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#FFCB44',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
              onPress={() => navigation.navigate('AddScreen')}
            >
              <Icon name="plus" size={60} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#94BAF4',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
              onPress={() => navigation.navigate('StartTestScreen')}
            >
              <Ionicons name="school-outline" size={60} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#FEB1C3',
                borderRadius: 50,
                marginHorizontal: 10,
              }}
              onPress={() => navigation.navigate('SharedDecksScreen')}
            >
              <MaterialCommunityIcons name="cards-outline" size={60} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginVertical: 20,
    marginLeft: 10,
  },
  quickActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  todaysRevision: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 10,
    zIndex: 0,
    backgroundColor: '#FFCB44',
    alignSelf: 'center',
  },
  wordOfTheDay: {
    width: 160,
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  wordOfTheDayText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FEB1C3',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  idiomOfTheDayText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#94BAF4',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  revisionText: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    marginLeft: 20,
    marginTop: 20,
  },
  progressBar: {
    marginLeft: 20,
    marginTop: 15,
  },
  stats: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    alignSelf: 'center',
  },
  cardsStudied: {
    color: '#FFCB44',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  minutesLearning: {
    color: '#94BAF4',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  streak: {
    color: '#FEB1C3',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionsHeader: {
    marginBottom: 30,
    fontWeight: '700',
    fontSize: 20,
    marginLeft: 20,
  },
});
