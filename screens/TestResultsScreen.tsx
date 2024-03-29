import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Pressable, FlatList, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { db } from '../config/firebase';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

var pinyin = require('chinese-to-pinyin');

// TODO: (later) when tap on card info and toggle starred, navigating back doesnt update it
// allows student to see their test results
export default function TestResultsScreen({ route, navigation }: any) {
  const {
    correctCards,
    incorrectCards,
    correctReadingETOC,
    totalReadingETOC,
    correctReadingCTOE,
    totalReadingCTOE,
    correctListeningCTOC,
    totalListeningCTOC,
    correctListeningCTOE,
    totalListeningCTOE,
    correctTypingETOC,
    totalTypingETOC,
    correctHandwritingETOC,
    totalHandwritingETOC,
  } = route.params;
  const auth = getAuth();
  console.log('correct listening:', correctListeningCTOC);

  const updateStarred = (cardItem: any) => {
    update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem.key), {
      starred: !cardItem.starred,
    });
  };

  // creates a Card component
  const Card = ({ cardItem }: any) => {
    console.log('card is', cardItem);
    const [starred, setStarred] = useState(cardItem.starred);
    return (
      <View>
        <Pressable onPress={() => navigation.navigate('CardInfoScreen', { card: cardItem, myCard: true })}>
          <View style={styles.cardContainer}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.chinese}>{cardItem['chinese']}</Text>
              <Text style={styles.pinyin}>{pinyin(cardItem['chinese'])}</Text>
              <Text style={styles.english}>{cardItem['english']}</Text>
            </View>
            <View
              style={{
                width: 270,
                height: 100,
                alignItems: 'flex-end',
                marginTop: 10,
                alignContent: 'flex-end',
                flex: 1,
                marginRight: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    setStarred(!starred);
                    updateStarred(cardItem);
                  }}
                >
                  <AntDesign
                    name={starred ? 'star' : 'staro'}
                    size={25}
                    color="#FFCB44"
                    style={{ marginTop: 8, marginRight: 10 }}
                  />
                </TouchableOpacity>
                {cardItem['tag'] ? (
                  <TouchableOpacity
                    style={styles.tag}
                    onPress={() => navigation.navigate('SearchByTagScreen', cardItem['tag'])}
                  >
                    <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                      {cardItem['tag']}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="md-close-outline" size={40} />
          </TouchableOpacity>
          <Text style={styles.header}>TEST RESULTS</Text>
        </View>

        <View style={{ marginHorizontal: 30, marginTop: 20 }}>
          {/* list of correct cards */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.header2}>Correct</Text>
            <Text style={styles.header2}>{correctCards.length}</Text>
          </View>

          <FlatList
            snapToAlignment="start"
            decelerationRate={'fast'}
            snapToInterval={370}
            contentContainerStyle={styles.contentContainerStyle}
            showsHorizontalScrollIndicator={false}
            data={correctCards}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => <Card cardItem={item} />}
            ListEmptyComponent={() => <Text>None correct</Text>}
            horizontal={true}
          />

          {/* list of incorrect cards */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.header2}>Incorrect</Text>
            <Text style={styles.header2}>{incorrectCards.length}</Text>
          </View>

          <FlatList
            snapToAlignment="start"
            decelerationRate={'fast'}
            snapToInterval={370}
            contentContainerStyle={styles.contentContainerStyle}
            showsHorizontalScrollIndicator={false}
            data={incorrectCards}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => <Card cardItem={item} />}
            ListEmptyComponent={() => <Text>None incorrect</Text>}
            horizontal={true}
          />

          {/* question type breakdown */}
          <Text style={styles.header2}>Question Type Breakdown</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 20, backgroundColor: '#FEB1C3' }} />
              <Text style={{ marginLeft: 10, color: '#FEB1C3', fontWeight: '600' }}>CORRECT</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
              <View style={{ width: 10, height: 10, borderRadius: 20, backgroundColor: '#94BAF4' }} />
              <Text style={{ marginLeft: 10, color: '#94BAF4', fontWeight: '600' }}>INCORRECT</Text>
            </View>
          </View>

          {totalReadingETOC > 0 || totalReadingETOC ? <Text style={styles.header3}>READING</Text> : null}

          {totalReadingETOC > 0 ? (
            <View>
              <Text style={styles.header4}>English → Chinese</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctReadingETOC / totalReadingETOC),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor: parseInt(totalReadingETOC) - parseInt(correctReadingETOC) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalReadingETOC) - parseInt(correctReadingETOC) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius: parseInt(totalReadingETOC) - parseInt(correctReadingETOC) === 0 ? 20 : 0,
                    borderBottomRightRadius: parseInt(totalReadingETOC) - parseInt(correctReadingETOC) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctReadingETOC}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctReadingETOC / totalReadingETOC),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctReadingETOC === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctReadingETOC === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalReadingETOC - correctReadingETOC}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {totalReadingCTOE > 0 ? (
            <View>
              <Text style={styles.header4}>Chinese → English</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctReadingCTOE / totalReadingCTOE),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor: parseInt(totalReadingCTOE) - parseInt(correctReadingCTOE) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalReadingCTOE) - parseInt(correctReadingCTOE) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius: parseInt(totalReadingCTOE) - parseInt(correctReadingCTOE) === 0 ? 20 : 0,
                    borderBottomRightRadius: parseInt(totalReadingCTOE) - parseInt(correctReadingCTOE) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctReadingCTOE}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctReadingCTOE / totalReadingCTOE),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctReadingCTOE === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctReadingCTOE === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalReadingCTOE - correctReadingCTOE}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {totalListeningCTOC > 0 || totalListeningCTOE ? <Text style={styles.header3}>LISTENING</Text> : null}

          {totalListeningCTOC > 0 ? (
            <View>
              <Text style={styles.header4}>Chinese → Chinese</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctListeningCTOC / totalListeningCTOC),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor: parseInt(totalListeningCTOC) - parseInt(correctListeningCTOC) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalListeningCTOC) - parseInt(correctListeningCTOC) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius: parseInt(totalListeningCTOC) - parseInt(correctListeningCTOC) === 0 ? 20 : 0,
                    borderBottomRightRadius:
                      parseInt(totalListeningCTOC) - parseInt(correctListeningCTOC) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctListeningCTOC}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctListeningCTOC / totalListeningCTOC),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctListeningCTOC === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctListeningCTOC === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalListeningCTOC - correctListeningCTOC}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {totalListeningCTOE > 0 ? (
            <View>
              <Text style={styles.header4}>Chinese → English</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctListeningCTOE / totalListeningCTOE),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor: parseInt(totalListeningCTOE) - parseInt(correctListeningCTOE) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalListeningCTOE) - parseInt(correctListeningCTOE) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius: parseInt(totalListeningCTOE) - parseInt(correctListeningCTOE) === 0 ? 20 : 0,
                    borderBottomRightRadius:
                      parseInt(totalListeningCTOE) - parseInt(correctListeningCTOE) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctListeningCTOE}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctListeningCTOE / totalListeningCTOE),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctListeningCTOE === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctListeningCTOE === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalListeningCTOE - correctListeningCTOE}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {totalHandwritingETOC > 0 ? (
            <View>
              <Text style={styles.header3}>WRITING</Text>
              <Text style={styles.header4}>English → Chinese</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctHandwritingETOC / totalHandwritingETOC),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor:
                      parseInt(totalHandwritingETOC) - parseInt(correctHandwritingETOC) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalHandwritingETOC) - parseInt(correctHandwritingETOC) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius:
                      parseInt(totalHandwritingETOC) - parseInt(correctHandwritingETOC) === 0 ? 20 : 0,
                    borderBottomRightRadius:
                      parseInt(totalHandwritingETOC) - parseInt(correctHandwritingETOC) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctHandwritingETOC}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctHandwritingETOC / totalHandwritingETOC),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctHandwritingETOC === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctHandwritingETOC === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalHandwritingETOC - correctHandwritingETOC}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {totalTypingETOC > 0 ? (
            <View>
              <Text style={styles.header3}>TYPING</Text>
              <Text style={styles.header4}>English → Chinese</Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: '#FEB1C3',
                    width: 350 * (correctTypingETOC / totalTypingETOC),
                    height: 20,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    alignSelf: 'center',
                    borderRightColor: parseInt(totalTypingETOC) - parseInt(correctTypingETOC) > 0 ? 'white' : '',
                    borderRightWidth: parseInt(totalTypingETOC) - parseInt(correctTypingETOC) > 0 ? 3 : 0,
                    justifyContent: 'center',
                    borderTopRightRadius: parseInt(totalTypingETOC) - parseInt(correctTypingETOC) === 0 ? 20 : 0,
                    borderBottomRightRadius: parseInt(totalTypingETOC) - parseInt(correctTypingETOC) === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{correctTypingETOC}</Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#94BAF4',
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    width: 350 * (1 - correctTypingETOC / totalTypingETOC),
                    height: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    borderTopLeftRadius: correctTypingETOC === 0 ? 20 : 0,
                    borderBottomLeftRadius: correctTypingETOC === 0 ? 20 : 0,
                  }}
                >
                  <Text style={styles.noOfQuestions}>{totalTypingETOC - correctTypingETOC}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 20,
  },
  navigation: {
    marginLeft: 20,
    marginTop: 20,
    flexDirection: 'row',
  },
  header2: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    marginRight: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    width: 350,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
    borderColor: '#C4C4C4',
    zIndex: 0,
    marginRight: 20,
  },
  contentContainerStyle: {
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  chinese: {
    fontWeight: '900',
    marginLeft: 20,
    marginTop: 20,
  },
  pinyin: {
    fontWeight: '500',
    marginLeft: 20,
    marginTop: 5,
  },
  english: {
    fontWeight: '500',
    marginLeft: 20,
    marginTop: 5,
  },
  tag: {
    justifyContent: 'center',
    backgroundColor: '#FEB1C3',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 25,
    marginTop: 10,
    marginRight: 10,
  },
  header3: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  header4: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  noOfQuestions: {
    marginHorizontal: 10,
    color: 'white',
    fontSize: 12,
  },
});
