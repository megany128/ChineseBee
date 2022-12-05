import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, update, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import * as Progress from 'react-native-progress';
import { Input } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Toast from 'react-native-toast-message';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

var pinyin = require('chinese-to-pinyin');

// tests student on list of cards
export default function TestScreen({ route, navigation }: any) {
  const auth = getAuth();

  const [progress, setProgress] = useState(0);
  const { allCards, cards, readingETOC, readingCTOE, listeningCTOC, listeningCTOE, typingETOC, handwritingETOC } =
    route.params;

  const correctCards: any = useRef([]);
  const incorrectCards: any = useRef([]);
  const wrongAnswerIndexes: any = useRef([]);

  const correctReadingETOC = useRef(0);
  const actualCorrectReadingETOC = useRef(0);
  const totalReadingETOC = useRef(0);
  const actualTotalReadingETOC = useRef(0);

  const correctReadingCTOE = useRef(0);
  const actualCorrectReadingCTOE = useRef(0);
  const totalReadingCTOE = useRef(0);
  const actualTotalReadingCTOE = useRef(0);

  const correctListeningCTOC = useRef(0);
  const actualCorrectListeningCTOC = useRef(0);
  const totalListeningCTOC = useRef(0);
  const actualTotalListeningCTOC = useRef(0);

  const correctListeningCTOE = useRef(0);
  const actualCorrectListeningCTOE = useRef(0);
  const totalListeningCTOE = useRef(0);
  const actualTotalListeningCTOE = useRef(0);

  const correctTypingETOC = useRef(0);
  const actualCorrectTypingETOC = useRef(0);
  const totalTypingETOC = useRef(0);
  const actualTotalTypingETOC = useRef(0);

  const correctHandwritingETOC = useRef(0);
  const actualCorrectHandwritingETOC = useRef(0);
  const totalHandwritingETOC = useRef(0);
  const actualTotalHandwritingETOC = useRef(0);

  const [cardNum, setCardNum] = useState(0);

  const answers: any = useRef([]);
  const correctAnswerOption: any = useRef(0);

  const newQuestion = useRef(true);
  const correct = useRef(false);

  const [writingQuestion, setWritingQuestion] = useState(0);
  const [typingQuestion, setTypingQuestion] = useState(false);

  const timeOpened = new Date();

  const [value, setValue] = React.useState({
    typingAnswer: '',
  });

  // resets all counters
  useEffect(() => {
    correctCards.current = [];
    incorrectCards.current = [];

    correctReadingETOC.current = 0;
    totalReadingETOC.current = 0;

    correctReadingCTOE.current = 0;
    totalReadingCTOE.current = 0;

    correctListeningCTOC.current = 0;
    totalListeningCTOC.current = 0;

    correctListeningCTOE.current = 0;
    totalListeningCTOE.current = 0;

    correctTypingETOC.current = 0;
    totalTypingETOC.current = 0;

    correctHandwritingETOC.current = 0;
    totalHandwritingETOC.current = 0;
  }, []);

  // gets student's current stats
  useEffect(() => {
    onValue(ref(db, '/students/' + auth.currentUser?.uid), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userData = { ...data };

      actualCorrectReadingETOC.current = userData.correctReadingETOC;
      actualTotalReadingETOC.current = userData.totalReadingETOC;

      actualCorrectReadingCTOE.current = userData.correctReadingCTOE;
      actualTotalReadingCTOE.current = userData.totalReadingCTOE;

      actualCorrectListeningCTOC.current = userData.correctListeningCTOC;
      actualTotalListeningCTOC.current = userData.totalListeningCTOC;

      actualCorrectListeningCTOE.current = userData.correctListeningCTOE;
      actualTotalListeningCTOE.current = userData.totalListeningCTOE;

      actualCorrectTypingETOC.current = userData.correctTypingETOC;
      actualTotalTypingETOC.current = userData.totalTypingETOC;

      actualCorrectHandwritingETOC.current = userData.correctHandwritingETOC;
      actualTotalHandwritingETOC.current = userData.totalHandwritingETOC;
    });
  }, []);

  // gets cards from database when screen loads and creates array of cards to revise
  useEffect(() => {
    answers.current = [];
    console.log('\nTEST SCREEN');
    for (let card = 0; card < cards.length; card++) {
      console.log('card' + (card + 1) + ':');
      console.log(cards[card].chinese + ' / ' + cards[card].english);
    }
  }, []);

  // shows toast based on whether answer is right or wrong
  const showToast = (card: any, right: boolean) => {
    Toast.show({
      type: right ? 'correctToast' : 'incorrectToast',
      props: { english: card.english, chinese: card.chinese, pinyin: pinyin(card.chinese) },
      onHide: () => hideToast(card, right),
    });
  };

  // shuffles cards in an array using recursion
  const shuffleCards: any = (array: []) => {
    let shuffledArray: [] = [];
    if (!array.length) return shuffledArray;

    let index = Math.floor(Math.random() * array.length);
    shuffledArray.push(array[index]);
    let slicedArray = array.slice(0, index).concat(array.slice(index + 1));

    return shuffledArray.concat(shuffleCards(slicedArray));
  };

  // hides toast and moves to the next card
  const hideToast = (card: any, right: boolean) => {
    newQuestion.current = true;
    if (right) {
      console.log('correct');
      let newCorrectCards = [...correctCards.current, card];
      correctCards.current = newCorrectCards;
    } else {
      console.log('wrong');
      let newIncorrectCards = [...incorrectCards.current, card];
      incorrectCards.current = newIncorrectCards;
    }
    updateCardNum(card, correct.current);
    setValue({ typingAnswer: '' });
  };

  // renders each question
  const renderQuestions = () => {
    for (cardNum; cardNum < cards.length; ) {
      return (
        <View>
          <Question key={cards[cardNum]} card={cards[cardNum]} />
          {typingQuestion && (
            <Input
              inputContainerStyle={styles.inputStyle}
              containerStyle={styles.control}
              value={value.typingAnswer}
              onChangeText={(text) => setValue({ ...value, typingAnswer: text })}
              style={styles.inputText}
              autoFocus={true}
              blurOnSubmit={true}
              autoCompleteType=""
              onSubmitEditing={() => {
                value.typingAnswer === cards[cardNum]['chinese']
                  ? ((correct.current = true),
                    (correctTypingETOC.current += 1),
                    (totalTypingETOC.current += 1),
                    showToast(cards[cardNum], true),
                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      correctTypingETOC: correctTypingETOC.current + actualCorrectTypingETOC.current,
                      totalTypingETOC: totalTypingETOC.current + actualTotalTypingETOC.current,
                    }))
                  : ((correct.current = false),
                    (totalTypingETOC.current += 1),
                    showToast(cards[cardNum], false),
                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      totalTypingETOC: totalTypingETOC.current + actualTotalTypingETOC.current,
                    }));
              }}
            />
          )}
        </View>
      );
    }

    return (
      <View
        style={{ justifyContent: 'center', alignContent: 'center', flex: 1, alignItems: 'center', marginBottom: 120 }}
      >
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: '#FFCB44',
            borderRadius: 200,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 52, color: 'white', fontWeight: '800' }}>{correctCards.current.length}</Text>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: '600' }}>out of {cards.length}</Text>
        </View>

        {/* shows test results */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ textAlign: 'center', fontSize: 36, fontWeight: '700' }}>good job!</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('TestResultsScreen', {
                correctCards: correctCards.current,
                incorrectCards: incorrectCards.current,
                correctReadingETOC: correctReadingETOC.current,
                totalReadingETOC: totalReadingETOC.current,
                correctReadingCTOE: correctReadingCTOE.current,
                totalReadingCTOE: totalReadingCTOE.current,
                correctListeningCTOC: correctListeningCTOC.current,
                totalListeningCTOC: totalListeningCTOC.current,
                correctListeningCTOE: correctListeningCTOE.current,
                totalListeningCTOE: totalListeningCTOE.current,
                correctTypingETOC: correctTypingETOC.current,
                totalTypingETOC: totalTypingETOC.current,
                correctHandwritingETOC: correctHandwritingETOC.current,
                totalHandwritingETOC: totalHandwritingETOC.current,
              })
            }
          >
            <Text style={styles.buttonText}>RESULTS →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // sets new question on render
  useEffect(() => {
    newQuestion.current = true;
  }, []);

  // generates random answers for a question
  const generateRandomAnswers = (type: string, card: any, cardType: string) => {
    // if it's a new question, generate new answers
    if (newQuestion.current) {
      // generates correct answer option (1 - 4)
      correctAnswerOption.current = Math.floor(Math.random() * 4) + 1;

      // generates random cards for wrong answers

      console.log('correct card is' + card.english + card.chinese);
      let i = 0;
      for (i; i < 3; i++) {
        console.log('allCards.length:', allCards.length);
        // for the first wrong answer, keeps on generating a random number until it does not share an english/chinese
        // translation with the correct answer
        if (i === 0) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            if (card.english != allCards[randomNum]['english'] && card.chinese != allCards[randomNum]['chinese']) {
              wrongAnswerIndexes.current[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              // adds wrong answer to list of wrong answers
              answers.current = [...answers.current, allCards[randomNum]];
            } else {
              console.log(allCards[randomNum]['english'] + ' already has a match');
            }
          }
        }
        // for the second wrong answer, keeps on generating a random number until it does not share an english/chinese
        // translation with the correct answer or the first wrong answer
        if (i === 1) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            if (
              card.english != allCards[randomNum]['english'] &&
              card.chinese != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes.current[0]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes.current[0]]['chinese'] != allCards[randomNum]['chinese']
            ) {
              wrongAnswerIndexes.current[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              // adds wrong answer to list of wrong answers
              answers.current = [...answers.current, allCards[randomNum]];
            } else {
              console.log(allCards[randomNum]['english'] + ' already has a match');
            }
          }
        }
        // for the third wrong answer, keeps on generating a random number until it does not share an english/chinese
        // translation with the correct answer or the first/second wrong answer
        if (i === 2) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            console.log('first card is', allCards[wrongAnswerIndexes.current[0]]['english']);
            console.log('first card is', allCards[wrongAnswerIndexes.current[0]]['chinese']);
            console.log('second card is', allCards[wrongAnswerIndexes.current[1]]['english']);
            console.log('second card is', allCards[wrongAnswerIndexes.current[1]]['chinese']);
            console.log("allCards[randomNum]['english'] is", allCards[randomNum]['english']);
            console.log("allCards[randomNum]['chinese'] is", allCards[randomNum]['chinese']);
            if (
              card.english != allCards[randomNum]['english'] &&
              card.chinese != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes.current[0]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes.current[0]]['chinese'] != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes.current[1]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes.current[1]]['chinese'] != allCards[randomNum]['chinese']
            ) {
              wrongAnswerIndexes.current[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              // adds wrong answer to list of wrong answers
              answers.current = [...answers.current, allCards[randomNum]];
            } else {
              console.log(allCards[randomNum]['english'] + ' already has a match');
            }
          }
        }
      }
      console.log('final answers are', answers.current);

      // once list of answers has been generated, sets newQuestion to false to prevent the answers from constantly regenerating
      // with each rerender
      newQuestion.current = false;
      // TODO: (later) solution for when not enough cards match the criteria
    }
    let answerOption = [0, 1, 2, 3];
    if (answerOption.length > 0) {
      // renders each answer in turn
      return answerOption.map((j) => (
        <View key={j}>
          {/* if the current answer is the correct answer option, renders the correct answer */}
          {/* else, renders the wrong answer with the same index if before the correct answer or the index shifted down by 1
               if after the correct answer */}
          {j === correctAnswerOption.current - 1 ? (
            <TouchableOpacity
              style={styles.answerChoiceBox}
              onPress={() => {
                console.log('correct');
                correct.current = true;
                showToast(card, true);

                switch (cardType) {
                  case 'ReadingETOC':
                    correctReadingETOC.current += 1;
                    totalReadingETOC.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      correctReadingETOC: correctReadingETOC.current + actualCorrectReadingETOC.current,
                      totalReadingETOC: totalReadingETOC.current + actualTotalReadingETOC.current,
                    });
                    break;
                  case 'ReadingCTOE':
                    correctReadingCTOE.current += 1;
                    totalReadingCTOE.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      correctReadingCTOE: correctReadingCTOE.current + actualCorrectReadingCTOE.current,
                      totalReadingCTOE: totalReadingCTOE.current + actualTotalReadingCTOE.current,
                    });
                    break;
                  case 'ListeningCTOC':
                    correctListeningCTOC.current += 1;
                    totalListeningCTOC.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      correctListeningCTOC: correctListeningCTOC.current + actualCorrectListeningCTOC.current,
                      totalListeningCTOC: totalListeningCTOC.current + actualTotalListeningCTOC.current,
                    });
                    break;
                  case 'ListeningCTOE':
                    correctListeningCTOE.current += 1;
                    totalListeningCTOE.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      correctListeningCTOE: correctListeningCTOE.current + actualCorrectListeningCTOE.current,
                      totalListeningCTOE: totalListeningCTOE.current + actualTotalListeningCTOE.current,
                    });
                    break;
                  default:
                    break;
                }
              }}
            >
              <Text style={styles.answerChoice}>{type === 'english' ? card.english : card.chinese}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.answerChoiceBox}
              onPress={() => {
                console.log('wrong');
                correct.current = false;
                showToast(card, false);

                switch (cardType) {
                  case 'ReadingETOC':
                    totalReadingETOC.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      totalReadingETOC: totalReadingETOC.current + actualTotalReadingETOC.current,
                    });
                    break;
                  case 'ReadingCTOE':
                    totalReadingCTOE.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      totalReadingCTOE: totalReadingCTOE.current + actualTotalReadingCTOE.current,
                    });
                    break;
                  case 'ListeningCTOC':
                    totalListeningCTOC.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      totalListeningCTOC: totalListeningCTOC.current + actualTotalListeningCTOC.current,
                    });
                    break;
                  case 'ListeningCTOE':
                    totalListeningCTOE.current += 1;

                    update(ref(db, '/students/' + auth.currentUser?.uid), {
                      totalListeningCTOE: totalListeningCTOE.current + actualTotalListeningCTOE.current,
                    });
                    break;
                  default:
                    break;
                }
              }}
            >
              <Text style={styles.answerChoice}>
                {j >= correctAnswerOption.current ? answers.current![j - 1][type] : answers.current![j][type]}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ));
    } else {
      return null;
    }
  };

  // Writing (English -> Chinese)
  const HandwritingETOC = (character: any) => {
    console.log(character.card);

    const INJECTED_JAVASCRIPT =
      `
      var writer = HanziWriter.create('grid-background-target', '` +
      character.card +
      `', {
            width: 500,
            height: 500,
            showCharacter: false,
            showOutline: false,
            padding: 5,
            showHintAfterMisses: 3,
            highlightOnComplete: true,
            highlightColor: '#FFCB44',
            strokeAnimationSpeed: 2,
            leniency: 1
          });
          writer.quiz({
            onMistake: function(strokeData) {
              console.log('Oh no! you made a mistake on stroke ' + strokeData.strokeNum);
              console.log("You've made " + strokeData.mistakesOnStroke + " mistakes on this stroke so far");
              console.log("You've made " + strokeData.totalMistakes + " total mistakes on this quiz");
              console.log("There are " + strokeData.strokesRemaining + " strokes remaining in this character");
            },
            onCorrectStroke: function(strokeData) {
              console.log('Yes!!! You got stroke ' + strokeData.strokeNum + ' correct!');
              console.log('You made ' + strokeData.mistakesOnStroke + ' mistakes on this stroke');
              console.log("You've made " + strokeData.totalMistakes + ' total mistakes on this quiz');
              console.log('There are ' + strokeData.strokesRemaining + ' strokes remaining in this character');
            },
            onComplete: function(summaryData) {
              console.log('You did it! You finished drawing ' + summaryData.character);
              console.log('You made ' + summaryData.totalMistakes + ' total mistakes on this quiz');
              window.ReactNativeWebView.postMessage(summaryData.totalMistakes)
            }
          });
      `;

    const html = `
      <script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.2/dist/hanzi-writer.min.js"></script>
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" id="grid-background-target">
        <line x1="0" y1="0" x2="500" y2="500" stroke="#DDD" />
        <line x1="500" y1="0" x2="0" y2="500" stroke="#DDD" />
        <line x1="250" y1="0" x2="250" y2="500" stroke="#DDD" />
        <line x1="0" y1="250" x2="500" y2="250" stroke="#DDD" />
      </svg>
    `;

    // TODO: update visibility of button based on results
    return (
      <View style={{ flex: 1 }}>
        <WebView
          scrollEnabled={false}
          mixedContentMode="always"
          originWhiteList={['*']}
          source={{ html: html }}
          style={{ flex: 1, width: 550, marginLeft: 275, marginTop: 25 }}
          javaScriptEnabled={true}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={(event) => {
            console.log('number of mistakes: ' + event.nativeEvent.data);
            let mistakes = JSON.parse(event.nativeEvent.data);
            if (mistakes < 3) {
              correct.current = true;
              correctHandwritingETOC.current = correctHandwritingETOC.current + 1;
              totalHandwritingETOC.current = totalHandwritingETOC.current + 1;

              update(ref(db, '/students/' + auth.currentUser?.uid), {
                correctHandwritingETOC: correctHandwritingETOC.current + actualCorrectHandwritingETOC.current,
                totalHandwritingETOC: totalHandwritingETOC.current + actualTotalHandwritingETOC.current,
              });
            } else {
              correct.current = false;
              totalHandwritingETOC.current = totalHandwritingETOC.current + 1;

              update(ref(db, '/students/' + auth.currentUser?.uid), {
                totalHandwritingETOC: totalHandwritingETOC.current + actualTotalHandwritingETOC.current,
              });
            }
          }}
        />
      </View>
    );
    return null;
  };

  // Typing (English -> Chinese)
  const TypingETOC = (card: any) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 100 }}>
          <Text style={styles.typingCard}>{card.card.english}</Text>
          <Text style={styles.instructions}>English → Chinese</Text>
        </View>
      </View>
    );
  };

  // Reading (Chinese -> English)
  const ReadingCTOE = (card: any) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 100 }}>
          <Text style={styles.newCard}>{card.card.chinese}</Text>
          <Text style={styles.instructions}>Chinese → English</Text>
          <View style={styles.answers}>{generateRandomAnswers('english', card.card, 'ReadingCTOE')}</View>
        </View>
      </View>
    );
  };

  // Reading (English -> Chinese)
  const ReadingETOC = (card: any) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 100 }}>
          <Text style={styles.newCard}>{card.card.english}</Text>
          <Text style={styles.instructions}>English → Chinese</Text>
          <View style={styles.answers}>{generateRandomAnswers('chinese', card.card, 'ReadingETOC')}</View>
        </View>
      </View>
    );
  };

  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const ListeningCTOC = (card: any) => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 50, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              width: 150,
              height: 150,
              borderRadius: 250,
              backgroundColor: '#FFCB44',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => Speech.speak(card.card.chinese, { language: 'zh-CN' })}
          >
            <FontAwesome name="volume-up" size={60} color="white" />
          </TouchableOpacity>
          <Text style={[styles.instructions, { marginTop: 40 }]}>Chinese → Chinese</Text>
          <View style={[styles.answers, { marginTop: 20 }]}>
            {generateRandomAnswers('chinese', card.card, 'ListeningCTOC')}
          </View>
        </View>
      </View>
    );
  };

  const ListeningCTOE = (card: any) => {
    console.log('chinese:', card.card.chinese);
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 50, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              width: 150,
              height: 150,
              borderRadius: 250,
              backgroundColor: '#FFCB44',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => Speech.speak(card.card.chinese, { language: 'zh-CN' })}
          >
            <FontAwesome name="volume-up" size={60} color="white" />
          </TouchableOpacity>
          <Text style={[styles.instructions, { marginTop: 40 }]}>Chinese → English</Text>
          <View style={[styles.answers, { marginTop: 20 }]}>
            {generateRandomAnswers('english', card.card, 'ListeningCTOE')}
          </View>
        </View>
      </View>
    );
  };

  // Question const
  const Question = (card: any) => {
    let timesReviewed = card.card.timesReviewed;
    let cardType: any = '';
    console.log('card type:', cardType);
    let type = 0;

    let possibleQuestionTypes = [
      readingETOC ? 'ReadingETOC' : null,
      readingCTOE ? 'ReadingCTOE' : null,
      listeningCTOC ? 'ListeningCTOC' : null,
      listeningCTOE ? 'ListeningCTOE' : null,
      typingETOC ? 'TypingETOC' : null,
      handwritingETOC ? 'HandwritingETOC' : null,
    ];
    possibleQuestionTypes = possibleQuestionTypes.filter((item) => {
      return item != null;
    });

    type = randomInt(0, possibleQuestionTypes.length - 1);
    cardType = possibleQuestionTypes[type];
    console.log('card type is', cardType);

    // generates a question type based on number of times reviewed
    if (cardType === 'ListeningCTOC') {
      setTypingQuestion(false);
      return <ListeningCTOC key={cards[cardNum]} card={cards[cardNum]} />;
    } else if (cardType === 'ReadingCTOE') {
      setTypingQuestion(false);
      return <ReadingCTOE key={cards[cardNum]} card={cards[cardNum]} />;
    } else if (cardType === 'ListeningCTOE') {
      setTypingQuestion(false);
      return <ListeningCTOE key={cards[cardNum]} card={cards[cardNum]} />;
    } else if (cardType === 'ReadingETOC') {
      setTypingQuestion(false);
      return <ReadingETOC key={cards[cardNum]} card={cards[cardNum]} />;
    } else if (cardType === 'TypingETOC') {
      setTypingQuestion(true);
      return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <TypingETOC key={cards[cardNum]} card={cards[cardNum]} />
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (cardType === 'HandwritingETOC') {
      setTypingQuestion(false);
      return (
        <View style={{ flex: 1 }}>
          <Text style={[styles.typingCard, { marginTop: 25 }]}>{cards[cardNum].english}</Text>
          <Text style={[styles.instructions, { marginBottom: 25 }]}>English → Chinese</Text>
          <HandwritingETOC key={cards[cardNum]} card={cards[cardNum].chinese.charAt(writingQuestion)} />
          {writingQuestion < cards[cardNum].chinese.length - 1 ? (
            <View>
              <TouchableOpacity
                style={{
                  marginBottom: 230,
                  width: 40,
                  backgroundColor: '#FFCB44',
                  borderRadius: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
                onPress={() => setWritingQuestion(writingQuestion + 1)}
              >
                <Text style={styles.nextCardText}>→</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: '#C4C4C4',
                  fontSize: 18,
                  textAlign: 'center',
                  position: 'absolute',
                  bottom: 150,
                  width: 340,
                  left: 240,
                }}
              >
                Once you've finished writing the current character, tap the button to progress!
              </Text>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                style={[{ marginBottom: 230 }, styles.nextCard]}
                onPress={() => showToast(cards[cardNum], correct.current)}
              >
                <Text style={styles.nextCardText}>NEXT CARD!</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: '#C4C4C4',
                  fontSize: 18,
                  textAlign: 'center',
                  position: 'absolute',
                  bottom: 150,
                  width: 340,
                  left: 240,
                }}
              >
                Once you've finished writing the current character, tap the button to progress!
              </Text>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  // move to the next question
  const updateCardNum = async (card: any, right: boolean) => {
    // TODO: fix 'right' for writing question
    const newTimesCorrect = right ? card.timesCorrect + 1 : card.timesCorrect;

    update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key), {
      timesCorrect: newTimesCorrect,
      timesReviewed: card.timesReviewed + 1,
    });

    console.log('moving to next question');
    let currentCardsStudied = parseInt((await AsyncStorage.getItem('cardsStudied')) || '0');
    AsyncStorage.setItem('cardsStudied', JSON.stringify(currentCardsStudied + 1));
    setWritingQuestion(0);

    let cardNumber = cardNum + 1;
    setCardNum(cardNumber);
    console.log('new card: ' + cardNum);
    setProgress(cardNumber / cards.length);
  };

  const exitTest = async () => {
    const exitTime = new Date();
    console.log('time opened:', timeOpened.getTime());
    console.log('time exited:', exitTime.getTime());
    const minutesLearning = JSON.parse((await AsyncStorage.getItem('minutesLearning')) || '0');
    const extraMinutesLearning = (exitTime.getTime() - timeOpened.getTime()) / 60000;
    console.log('minutes:', extraMinutesLearning);
    AsyncStorage.setItem('minutesLearning', JSON.stringify(minutesLearning + extraMinutesLearning));
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => exitTest()}>
          <Ionicons name="md-close-outline" size={40} />
        </TouchableOpacity>
        <Progress.Bar
          progress={progress}
          height={10}
          width={300}
          color={'#FFCB44'}
          borderWidth={0}
          unfilledColor={'#FFE299'}
          style={styles.progressBar}
        />
      </View>
      <View style={{ alignSelf: 'center' }}>{renderQuestions()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
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
    alignItems: 'center',
  },
  progressBar: {
    marginLeft: 20,
    height: 10,
  },
  newCard: {
    fontSize: 60,
    fontWeight: '600',
    textAlign: 'center',
  },
  typingCard: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  newCardSubtitle: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 10,
  },
  newCardSubtitle2: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 120,
  },
  nextCard: {
    backgroundColor: '#FFCB44',
    borderRadius: 40,
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 120,
  },
  nextCardText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '800',
  },
  tag: {
    justifyContent: 'center',
    backgroundColor: '#FEB1C3',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 25,
    marginTop: 10,
  },
  newCardIndicator: {
    justifyContent: 'center',
    backgroundColor: '#94BAF4',
    borderRadius: 20,
    width: 80,
    height: 25,
    marginLeft: 10,
  },
  instructions: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: '#C4C4C4',
    marginTop: 10,
  },
  answerChoiceBox: {
    borderWidth: 1,
    borderRadius: 20,
    height: 70,
    width: 310,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  answerChoice: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  answers: {
    marginTop: 60,
    height: 200,
  },
  control: {
    marginTop: 50,
    borderColor: '#C4C4C4',
    marginHorizontal: 20,
    width: 360,
  },
  inputText: {
    marginLeft: 20,
  },
  inputStyle: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    height: 50,
  },
  button: {
    borderRadius: 30,
    backgroundColor: '#FEB1C3',
    width: 140,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    alignSelf: 'center',
  },
});
