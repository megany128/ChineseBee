import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Text, View } from '../components/Themed';
import Icon from 'react-native-vector-icons/AntDesign';
import { RootTabScreenProps } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { db } from '../config/firebase';
import { query, ref, set, onValue, update } from 'firebase/database';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlipCard from 'react-native-flip-card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

var isPast = require('date-fns/isPast');
var format = require('date-fns/format');
var pinyin = require('chinese-to-pinyin');
var voucher_codes = require('voucher-code-generator');

const { utcToZonedTime } = require('date-fns-tz');

export default function HomeScreen({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [name, setName] = useState(String);
  const userType = useRef('');
  const [progress, setProgress] = useState(0);

  const [cardsStudied, setCardsStudied] = useState(0);
  const [minutesLearning, setMinutesLearning] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);

  const [allCards, setAllCards]: any = useState([]);

  const WOTDCards: any = useRef([]);
  const IOTDCards: any = useRef([]);

  const todaysRevision = useRef();

  // TODO: modal to set this
  const newCardLimit = 5;
  const reviewLimit = 5;

  const classCode = useRef('');
  const [myStudents, setMyStudents]: any = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredStudents, setFilteredStudents]: any = useState([]);

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
    onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      let allCardsTemp: any = Object.values(cardItems);
      setAllCards(allCardsTemp);
      WOTDCards.current = allCardsTemp.filter((obj: any) => {
        return !obj.idiom;
      });

      IOTDCards.current = allCardsTemp.filter((obj: any) => {
        return obj.idiom;
      });

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

    const data = query(ref(db, '/sharedCards'));
    return onValue(data, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let deckItems = { ...data };

      // uses state to set cards to the data just retrieved
      let decks: any = Object.values(deckItems);

      for (let deck = 0; deck < decks.length; deck++) {
        if (decks[deck].cards) {
          let cards: any = Object.values(decks[deck].cards);
          for (let card = 0; card < cards.length; card++) {
            if (cards[card].idiom) {
              console.log('iotd candidate', cards[card]);
              IOTDCards.current = [...IOTDCards.current, cards[card]];
            } else {
              console.log('wotd candidate', cards[card]);
              WOTDCards.current = [...WOTDCards.current, cards[card]];
            }
          }
        }
      }
      IOTDCards.current = shuffleCards(IOTDCards.current);
      WOTDCards.current = shuffleCards(WOTDCards.current);
    });
  };

  // TODO: only generate new cards when last time opened was in the past
  useEffect(() => {
    onValue(ref(db, '/userRoles'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userRoles = { ...data };

      userType.current = userRoles[auth.currentUser!.uid];
    });
  }, []);

  useEffect(() => {
    generateTodaysRevision();
  }, []);

  // TODO: fix - doesn't reset at midnight
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
    if (userType.current === 'student') {
      getStats();
      const willFocusSubscription = navigation.addListener('focus', () => {
        console.log('getting stats');
        getStats();
      });

      return willFocusSubscription;
    } else {
      loadNewUserData();
    }
  }, []);

  const loadNewUserData = () => {
    setRefreshing(true);
    onValue(ref(db, '/teachers/' + auth.currentUser?.uid), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let user = { ...data };
      classCode.current = user.classCode;
      console.log('classcode:', classCode.current);
      if (!user.classCode) {
        console.log('classcode2:', classCode.current);
        let unique = false;
        let newCode = [''];
        while (!unique) {
          console.log('generating referral code');
          newCode = voucher_codes.generate({
            length: 6,
            count: 1,
          });
          unique = true;
          onValue(ref(db, '/teachers'), (querySnapShot) => {
            let data = querySnapShot.val() || {};
            let userData = { ...data };

            Object.values(userData).map((teacher: any) => {
              if (teacher.classCode === newCode[0] && teacher.uid != auth.currentUser?.uid) {
                console.log('matching:', teacher.name);
                unique = false;
              }
            });
          });
          console.log(unique);
          console.log('classcode:', classCode.current);
          if (unique && !classCode.current) {
            update(ref(db, '/teachers/' + auth.currentUser?.uid), {
              classCode: newCode[0],
            });

            update(ref(db, '/classCodes/'), {
              [newCode[0]]: auth.currentUser?.uid,
            });
          }
        }
      }
    });

    return onValue(ref(db, '/students/'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let students = { ...data };

      let allStudents: any = Object.values(students);
      allStudents = allStudents.filter((student: any) => {
        return student.classCode === classCode.current;
      });
      setMyStudents(allStudents);
      setFilteredStudents(allStudents);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let user = { ...data };
      setName(user.name);

      let dailyStudyProgress = (await AsyncStorage.getItem('dailyStudyProgress')) || '0';
      setProgress(parseFloat(dailyStudyProgress));
    });
  }, []);

  // searches Students using search term and sets filteredCards to search results
  const searchStudents = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredStudents(
      myStudents.filter((obj: { name: string }) => {
        return (
          obj.name.toLowerCase().includes(text) ||
          pinyin(obj.name, { removeTone: true }).toLowerCase().includes(text) ||
          pinyin(obj.name, { removeTone: true, removeSpace: true }).toLowerCase().includes(text)
        );
      })
    );
  };

  // creates a Student component
  const Student = ({ studentItem, id }: any) => {
    return (
      <View style={{ backgroundColor: 'transparent' }}>
        <TouchableOpacity onPress={() => navigation.navigate('StudentInfoScreen', studentItem)}>
          <View style={styles.cardContainer}>
            <Text style={styles.studentName}>{studentItem['name']}</Text>
            <View
              style={{
                width: 270,
                height: 100,
                alignItems: 'flex-end',
                justifyContent: 'center',
                alignContent: 'flex-end',
                flex: 1,
                marginRight: 10,
                backgroundColor: 'transparent',
              }}
            >
              <Ionicons name="chevron-forward" size={40} color="#C4C4C4" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return userType.current === 'student' ? (
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
            }}
          >
            {WOTDCards.current && (
              <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
                <View style={styles.card}>
                  <Text style={styles.WOTDChn}>{WOTDCards.current[0].chinese}</Text>
                  <Text
                    style={{ alignSelf: 'center', position: 'absolute', bottom: 10, fontSize: 12, color: '#C4C4C4' }}
                  >
                    WORD OF THE DAY
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.WOTDEng}>{pinyin(WOTDCards.current[0].chinese)}</Text>
                  <Text style={styles.definition}>{WOTDCards.current[0].english}</Text>
                  <Text
                    style={{ alignSelf: 'center', position: 'absolute', bottom: 10, fontSize: 12, color: '#C4C4C4' }}
                  >
                    WORD OF THE DAY
                  </Text>
                </View>
              </FlipCard>
            )}
            {IOTDCards.current && (
              <FlipCard flipHorizontal={true} flipVertical={false} friction={10}>
                <View style={styles.card}>
                  <Text style={styles.IOTDChn}>{IOTDCards.current[0].chinese}</Text>
                  <Text
                    style={{ alignSelf: 'center', position: 'absolute', bottom: 10, fontSize: 12, color: '#C4C4C4' }}
                  >
                    IDIOM OF THE DAY
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.IOTDEng}>{pinyin(IOTDCards.current[0].chinese)}</Text>
                  <Text style={styles.definition}>{IOTDCards.current[0].english}</Text>
                  <Text
                    style={{ alignSelf: 'center', position: 'absolute', bottom: 10, fontSize: 12, color: '#C4C4C4' }}
                  >
                    IDIOM OF THE DAY
                  </Text>
                </View>
              </FlipCard>
            )}
          </View>

          <View style={styles.stats}>
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
                <Text style={styles.cardsStudied}>{cardsStudied}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>cards{'\n'}studied</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50 }}>
                <Text style={styles.minutesLearning}>{minutesLearning}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>minutes{'\n'}learning</Text>
              </View>
              <View style={{ flexDirection: 'column', backgroundColor: 'transparent' }}>
                <Text style={styles.streak}>{dayStreak}</Text>
                <Text style={{ textAlign: 'center', fontWeight: '600' }}>day{'\n'}streak</Text>
              </View>
            </View>
          </View>

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
  ) : (
    <LinearGradient colors={['rgba(255,203,68,0.2)', 'rgba(255,255,255,0.3)']} style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView>
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
          <View style={{ backgroundColor: 'transparent', width: 360 }}>
            <Text style={[styles.title, { marginTop: 0 }]}>CLASS CODE</Text>
            <Text style={styles.classCode}>{classCode.current}</Text>
            <Text style={styles.title}>STUDENTS</Text>
            <TextInput
              style={styles.searchBar}
              value={search}
              placeholder="search"
              underlineColorAndroid="transparent"
              onChangeText={(text: any) => searchStudents(text)}
              textAlign="left"
              placeholderTextColor="#C4C4C4"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
            />
            <FlatList
              style={styles.cardList}
              contentContainerStyle={styles.contentContainerStyle}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewUserData} />}
              data={filteredStudents}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => <Student studentItem={item} />}
              ListEmptyComponent={() => (
                <Text>{search ? 'No results' : 'No students yet! Invite them to your class using the class code'}</Text>
              )}
            />
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
  card: {
    width: 160,
    height: 190,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  WOTDEng: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FEB1C3',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: 10,
  },
  WOTDChn: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FEB1C3',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: 10,
  },
  IOTDEng: {
    fontSize: 24,
    fontWeight: '600',
    color: '#94BAF4',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: 10,
  },
  IOTDChn: {
    fontSize: 48,
    fontWeight: '800',
    color: '#94BAF4',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: 10,
  },
  definition: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: 10,
    marginTop: 10,
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
    zIndex: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    alignSelf: 'center',
    marginTop: 20,
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
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 10,
  },
  classCode: {
    fontSize: 24,
    fontWeight: '400',
    marginLeft: 10,
  },
  cardList: {
    alignSelf: 'center',
    zIndex: 1,
    marginTop: -5,
  },
  contentContainerStyle: {
    backgroundColor: 'transparent',
    marginTop: 20,
    marginLeft: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    width: 350,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
    borderColor: '#C4C4C4',
    marginVertical: 10,
    zIndex: 0,
  },
  studentName: {
    fontWeight: '700',
    marginLeft: 20,
    alignSelf: 'center',
    fontSize: 18,
  },
  searchBar: {
    height: 40,
    width: 350,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    marginLeft: 10,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    zIndex: 2,
  },
});
