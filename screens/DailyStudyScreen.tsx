import { RootStackScreenProps } from '../types';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { set, ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import moment from 'moment';
import * as Progress from 'react-native-progress';
import Icon2 from 'react-native-vector-icons/Entypo';
import { Input, Button } from 'react-native-elements';

var pinyin = require('chinese-to-pinyin');

moment().format();

export default function DailyStudyScreen({ navigation }: RootStackScreenProps<'DailyStudyScreen'>) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  // TODO: save progress when you leave daily review
  const [progress, setProgress] = useState(0);
  const [todaysRevision, setTodaysRevision]: any = useState([]);
  const [allCards, setAllCards]: any = useState([]);
  const [cardNum, setCardNum] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  const answers: any = useRef([]);
  const correctAnswerOption: any = useRef(0);

  const newQuestion = useRef(true);
  const correct = useRef(false);

  const [typingQuestion, setTypingQuestion] = useState(false);

  const [value, setValue] = React.useState({
    typingAnswer: '',
  });
  // gets cards from database when screen loads and creates array of cards to revise
  useEffect(() => {
    answers.current = [];
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      let reviewArray: any = Object.values(cardItems);
      let newCardArray: any = Object.values(cardItems);
      setAllCards(Object.values(cardItems));

      // gets cards that are not new but are due this session
      // TODO: set limit based on settings
      // TODO: fix bug - sometimes one card is there twice
      reviewArray = reviewArray.filter((obj: { dueDate: number; masteryLevel: number }) => {
        return obj.dueDate === 0 && obj.masteryLevel != 0;
      });

      // gets cards that are new
      // TODO: set limit based on settings
      newCardArray = newCardArray.filter((obj: { masteryLevel: number }) => {
        return obj.masteryLevel === 0;
      });

      // sets today's revision to review cards and new cards randomised
      let todaysRevisonArray: any = [...reviewArray, ...newCardArray];
      setTodaysRevision([...randomiseCards(todaysRevisonArray)]);
    });
  }, []);

  // randomises cards in an array
  // TODO: change to recursive
  const randomiseCards = (array: []) => {
    let i = array.length - 1;
    for (i; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };

  const hideModal = (card: any) => {
    setModalVisible(false);
    newQuestion.current = true;
    if (correct.current) {
      console.log('correct');
      updateCardNum(card, true);
    } else {
      console.log('wrong');
      updateCardNum(card, false);
    }
    setValue({ typingAnswer: '' });
  };

  // renders each question
  // TODO: fix bug - sometimes the correct answer is there twice
  const renderQuestions = () => {
    for (cardNum; cardNum < todaysRevision.length; ) {
      return (
        <View>
          {/* TODO: change to Question */}
          <Question key={todaysRevision[cardNum]} card={todaysRevision[cardNum]} />
          {typingQuestion && 
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
              value.typingAnswer === todaysRevision[cardNum]['chinese']
                ? ((correct.current = true), setModalVisible(true))
                : ((correct.current = false), setModalVisible(true));
            }}
          />
          }
          
          {/* TODO: dismiss modal after timeout
          setTimeout(() => xxxx, 100) */}
          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => hideModal(todaysRevision[cardNum])}
            style={{ margin: 0 }}
          >
            {correct.current === true ? (
              <View style={styles.correctModalView}>
                <View
                  style={{
                    borderRadius: 100,
                    backgroundColor: 'white',
                    width: 65,
                    height: 65,
                    marginLeft: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon2 name="check" size={35} color="#FEB1C3" />
                </View>
                <View style={{ flexDirection: 'column', marginLeft: 20 }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
                    {todaysRevision[cardNum]['chinese']}
                  </Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {pinyin(todaysRevision[cardNum]['chinese'])}
                  </Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {todaysRevision[cardNum]['english']}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.wrongModalView}>
                <View
                  style={{
                    borderRadius: 100,
                    backgroundColor: 'white',
                    width: 65,
                    height: 65,
                    marginLeft: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon2 name="cross" size={35} color="#94BAF4" />
                </View>
                <View style={{ flexDirection: 'column', marginLeft: 20 }}>
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>
                    {todaysRevision[cardNum]['chinese']}
                  </Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {pinyin(todaysRevision[cardNum]['chinese'])}
                  </Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {todaysRevision[cardNum]['english']}
                  </Text>
                </View>
              </View>
            )}
          </Modal>
        </View>
      );
    }
    return <Text>daily review complete!</Text>;
  };

  const generateRandomAnswers = (type: string, card: any) => {
    if (newQuestion.current) {
      // generate correct answer option
      correctAnswerOption.current = Math.floor(Math.random() * 4) + 1;

      let wrongAnswerIndexes: any = [];
      // generate random cards for wrong answers
      let i = 0;
      for (i; i < 3; i++) {
        if (i === 0) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            if (card.english != allCards[randomNum]['english'] && card.chinese != allCards[randomNum]['chinese']) {
              wrongAnswerIndexes[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              answers.current = [...answers.current, allCards[randomNum]];
            }
          }
        }
        if (i === 1) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            if (
              card.english != allCards[randomNum]['english'] &&
              card.chinese != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes[0]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes[0]]['chinese'] != allCards[randomNum]['chinese']
            ) {
              wrongAnswerIndexes[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              answers.current = [...answers.current, allCards[randomNum]];
            }
          }
        }
        if (i === 2) {
          let valid = false;
          while (!valid) {
            let randomNum = Math.floor(Math.random() * (allCards.length - 1));
            if (
              card.english != allCards[randomNum]['english'] &&
              card.chinese != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes[0]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes[0]]['chinese'] != allCards[randomNum]['chinese'] &&
              allCards[wrongAnswerIndexes[1]]['english'] != allCards[randomNum]['english'] &&
              allCards[wrongAnswerIndexes[1]]['chinese'] != allCards[randomNum]['chinese']
            ) {
              wrongAnswerIndexes[i] = randomNum;
              valid = true;
              console.log('i = ' + i + ' and card is ' + JSON.stringify(allCards[randomNum]));
              answers.current = [...answers.current, allCards[randomNum]];
            }
          }
        }
      }
      newQuestion.current = false;
      // TODO: solution for when not enough cards match the criteria
    }
    let answerOption = [0, 1, 2, 3];
    console.log('correct answer is', correctAnswerOption.current);
    if (answerOption.length > 0) {
      return answerOption.map(
        (j) => (
          console.log('j: ', j),
          (
            <View key={j}>
              {j === correctAnswerOption.current - 1 ? (
                <TouchableOpacity
                  style={styles.answerChoiceBox}
                  onPress={() => ((correct.current = true), setModalVisible(true))}
                >
                  <Text style={styles.answerChoice}>{type === 'english' ? card.english : card.chinese}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.answerChoiceBox}
                  onPress={() => ((correct.current = false), setModalVisible(true))}
                >
                  <Text style={styles.answerChoice}>
                    {j >= correctAnswerOption.current ? answers.current![j - 1][type] : answers.current![j][type]}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        )
      );
    } else {
      return <Text>test</Text>;
    }
  };

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
          <View style={styles.answers}>{generateRandomAnswers('english', card.card)}</View>
        </View>
      </View>
    );
  };

  // New card
  const NewCard = (card: any) => {
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: 350, marginTop: 10 }}>
          <View style={styles.newCardIndicator}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>new card</Text>
          </View>
          {card.card.tag && (
            <View style={styles.tag}>
              <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                {card.card.tag}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 140 }}>
          <Text style={styles.newCard}>{card.card.chinese}</Text>
          <Text style={styles.newCardSubtitle}>{pinyin(card.card.chinese)}</Text>
          <Text style={styles.newCardSubtitle2}>{card.card.english}</Text>
          <TouchableOpacity style={styles.nextCard} onPress={() => updateCardNum(card.card, true)}>
            <Text style={styles.nextCardText}>NEXT CARD!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Question const
  const Question = (card: any) => {
    // if it is a new card, simply allow the student to learn it without being quizzed
    return (
      <View>
        {
          // TODO: show mastery level
          card.card.timesReviewed === 0 ? (
            setTypingQuestion(false),
            <NewCard key={todaysRevision[cardNum]} card={todaysRevision[cardNum]} />
          ) : // formats: typing (english -> chinese) [only after 4 reviews], multi-choice (chinese -> english),
          // listening (chinese -> english), listening (chinese -> chinese)
          // TODO: if between 1 - 3 reviews: random of all, excluding typing
          card.card.timesReviewed > 0 && card.card.timesReviewed < 4 ? (
            setTypingQuestion(false),
            // <TouchableOpacity onPress={() => updateCardNum(card.card, true)}>
            <ReadingCTOE key={todaysRevision[cardNum]} card={todaysRevision[cardNum]} />
          ) : (
            // </TouchableOpacity>
            // TODO: if after 4 reviews: random of all, including typing
            // <TouchableOpacity onPress={() => updateCardNum(card.card, true)}>
            setTypingQuestion(true),
            <View>
              <TypingETOC key={todaysRevision[cardNum]} card={todaysRevision[cardNum]} />
            </View>
            // </TouchableOpacity>
          )
        }
      </View>
    );
  };

  // move to the next question
  const updateCardNum = (card: any, right: boolean) => {
    setCardNum(cardNum + 1);
    console.log('new card: ' + cardNum);
    setProgress((cardNum + 1) / todaysRevision.length);
    set(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key), {
      chinese: card.chinese,
      english: card.english,
      tag: card.tag,
      starred: card.starred,
      key: card.key,
      masteryLevel: card.masteryLevel,
      createdAt: card.createdAt,
      timesReviewed: card.timesReviewed + 1,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="md-close-outline" size={40} />
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
    width: 55,
    height: 25,
    marginLeft: 10,
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
  correctModalView: {
    height: '15%',
    marginTop: 'auto',
    backgroundColor: '#FEB1C3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrongModalView: {
    height: '15%',
    marginTop: 'auto',
    backgroundColor: '#94BAF4',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  control: {
    marginTop: 50,
    borderColor: '#C4C4C4',
    marginLeft: 20,
    width: 380,
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
});
