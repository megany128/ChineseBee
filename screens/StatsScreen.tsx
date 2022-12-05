import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, Alert } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

// displays user's stats
export default function StatsScreen({ navigation }: any) {
  const auth = getAuth();

  const [vocabSize, setVocabSize] = useState(0);
  const [masteredCards, setMasteredCards] = useState(0);
  const [learningCards, setLearningCards] = useState(0);
  const [strugglingCards, setStrugglingCards] = useState(0);
  const [newCards, setNewCards] = useState(0);

  const [readingSuccess, setReadingSuccess]: any = useState(0);
  const [listeningSuccess, setListeningSuccess]: any = useState(0);
  const [typingSuccess, setTypingSuccess]: any = useState(0);
  const [writingSuccess, setWritingSuccess]: any = useState(0);

  const [userType, setUserType] = useState('student');
  const classCode = useRef('');
  const classDecks = useRef(0);
  const [myStudents, setMyStudents]: any = useState([]);

  const cardMastery = [
    {
      name: 'mastered',
      cards: masteredCards,
      color: '#FFCB44',
      legendFontColor: '#FFCB44',
      legendFontSize: 15,
    },
    {
      name: 'learning',
      cards: learningCards,
      color: '#FEB1C3',
      legendFontColor: '#FEB1C3',
      legendFontSize: 15,
    },
    {
      name: 'struggling',
      cards: strugglingCards,
      color: '#94BAF4',
      legendFontColor: '#94BAF4',
      legendFontSize: 15,
    },
    {
      name: 'new',
      cards: newCards,
      color: '#C4C4C4',
      legendFontColor: '#C4C4C4',
      legendFontSize: 15,
    },
  ];

  const questionTypes = {
    labels: ['Reading', 'Listening', 'Typing', 'Writing'],
    datasets: [
      {
        data: [100 * readingSuccess, 100 * listeningSuccess, 100 * typingSuccess, 100 * writingSuccess],
      },
    ],
  };

  // gets stats for student/teacher
  useEffect(() => {
    onValue(ref(db, '/userRoles'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userRoles = { ...data };

      setUserType(userRoles[auth.currentUser!.uid]);

      console.log('user type is', userRoles[auth.currentUser!.uid]);

      if (userRoles[auth.currentUser!.uid] === 'student') {
        return onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let user = { ...data };

          if (user.cards) {
            let allCards: any = Object.values(user.cards);
            let masteredCardsTemp = allCards.filter((obj: any) => {
              return obj.timesCorrect / obj.timesReviewed > 0.7;
            });

            let learningCardsTemp = allCards.filter((obj: any) => {
              return obj.timesCorrect / obj.timesReviewed > 0.4 && obj.timesCorrect / obj.timesReviewed < 0.7;
            });

            let strugglingCardsTemp = allCards.filter((obj: any) => {
              return obj.timesCorrect / obj.timesReviewed > 0 && obj.timesCorrect / obj.timesReviewed < 0.4;
            });

            let newCardsTemp = allCards.filter((obj: any) => {
              return obj.timesCorrect / obj.timesReviewed === 0;
            });

            setVocabSize(allCards.length);
            setMasteredCards(masteredCardsTemp.length);
            setLearningCards(learningCardsTemp.length);
            setStrugglingCards(strugglingCardsTemp.length);
            setNewCards(newCardsTemp.length);

            if (user.totalReadingETOC + user.totalReadingCTOE > 0)
              setReadingSuccess(
                (user.correctReadingETOC + user.correctReadingCTOE) / (user.totalReadingETOC + user.totalReadingCTOE)
              );
            if (user.totalListeningCTOC + user.totalListeningCTOE > 0)
              setListeningSuccess(
                (user.correctListeningCTOC + user.correctListeningCTOE) /
                  (user.totalListeningCTOC + user.totalListeningCTOE)
              );
            if (user.totalTypingETOC > 0) setTypingSuccess(user.correctTypingETOC / user.totalTypingETOC);
            if (user.totalHandwritingETOC > 0)
              setWritingSuccess(user.correctHandwritingETOC / user.totalHandwritingETOC);

            console.log('reading success rate:', readingSuccess);
            console.log('listening success rate:', listeningSuccess);
            console.log('typing success rate:', typingSuccess);
            console.log('handwriting success rate:', writingSuccess);
          }
        });
      } else {
        // get class code
        onValue(ref(db, '/teachers/' + auth.currentUser?.uid), async (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let user = { ...data };
          classCode.current = user.classCode;
          if (user.decks) {
            let decks = Object.values(user.decks);
            classDecks.current = decks.length;
          }

          // average of class' stats
          return onValue(ref(db, '/students/'), async (querySnapShot) => {
            let data = querySnapShot.val() || {};
            let students = { ...data };

            if (students) {
              console.log('current class code is', user.classCode);
              let allStudents: any = Object.values(students);
              allStudents = allStudents.filter((student: any) => {
                return student.classCode === user.classCode;
              });
              setMyStudents(allStudents);

              console.log('students are', allStudents);

              let correctReading = 0;
              let correctListening = 0;
              let correctTyping = 0;
              let correctWriting = 0;

              let totalReading = 0;
              let totalListening = 0;
              let totalTyping = 0;
              let totalWriting = 0;

              for (let student = 0; student < allStudents.length; student++) {
                let studentStats = allStudents[student];

                correctWriting += studentStats.correctHandwritingETOC;
                correctListening += studentStats.correctListeningCTOC + studentStats.correctListeningCTOE;
                correctReading += studentStats.correctReadingCTOE + studentStats.correctReadingETOC;
                correctTyping += studentStats.correctTypingETOC;

                totalWriting += studentStats.totalHandwritingETOC;
                totalListening += studentStats.totalListeningCTOC + studentStats.totalListeningCTOE;
                totalReading += studentStats.totalReadingCTOE + studentStats.totalReadingETOC;
                totalTyping += studentStats.totalTypingETOC;
              }

              if (totalWriting > 0) setWritingSuccess(correctWriting / totalWriting);
              if (totalListening > 0) setListeningSuccess(correctListening / totalListening);
              if (totalReading > 0) setReadingSuccess(correctReading / totalReading);
              if (totalTyping > 0) setTypingSuccess(correctTyping / totalTyping);
            }
          });
        });
      }
    });
  }, []);

  // checks if user has enough cards for stats to be generated
  useEffect(() => {
    const willFocusSubscription = navigation.addListener('focus', async () => {
      if (userType === 'student') {
        return onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let user = { ...data };

          if (user.cards) {
            let allCards: any = Object.values(user.cards);
            if (allCards.length === 0) {
              Alert.alert(
                'Wait a moment!',
                'You have no cards! Stats will not be available until you add cards to your vocab.',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Add cards',
                    onPress: () => {
                      navigation.navigate('Cards');
                    },
                  },
                ]
              );
            }
          }
        });
      }
    });

    return willFocusSubscription;
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ width: 400 }} showsVerticalScrollIndicator={false}>
          <View style={styles.navigation}>
            <Text style={styles.header}>{userType === 'student' ? 'STATS' : 'CLASS STATS'}</Text>
          </View>

          <View style={{ marginHorizontal: 40 }}>
            <Text style={styles.sectionTitle}>{userType === 'student' ? 'VOCAB' : 'CLASS'}</Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'transparent',
                width: 340,
                justifyContent: 'space-between',
                alignSelf: 'center',
                marginVertical: 10,
                marginTop: 20,
                marginLeft: 10,
              }}
            >
              <View style={styles.cardsStudied}>
                <Text style={styles.bigText}>{userType === 'student' ? vocabSize : myStudents.length}</Text>
                <Text style={styles.subtitle}>{userType === 'student' ? 'cards in vocab' : 'students in class'}</Text>
              </View>
              <View style={styles.cardsMastered}>
                <Text style={styles.bigText}>{userType === 'student' ? masteredCards : classDecks.current}</Text>
                <Text style={styles.subtitle}>{userType === 'student' ? 'cards mastered' : 'class decks'}</Text>
              </View>
            </View>

            {userType === 'student' && (
              <View>
                <Text style={styles.sectionTitle}>MASTERY</Text>
                <PieChart
                  style={{ marginTop: 10 }}
                  data={cardMastery}
                  width={340}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor={'cards'}
                  backgroundColor={'transparent'}
                  paddingLeft="10"
                />
              </View>
            )}

            {/* question type mastery */}
            <Text style={styles.sectionTitle}>QUESTION TYPE MASTERY</Text>
            <BarChart
              style={{ marginTop: 10, backgroundColor: 'transparent' }}
              data={questionTypes}
              width={340}
              height={200}
              yAxisLabel=""
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                decimalPlaces: 0,
                backgroundColor: 'white',
                backgroundGradientFrom: 'white',
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: 'transparent',
                backgroundGradientToOpacity: 0,
              }}
              yAxisSuffix="%"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
    backgroundColor: 'transparent',
  },
  cardsStudied: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FEB1C3',
  },
  cardsMastered: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#94BAF4',
  },
  bigText: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
  },
});
