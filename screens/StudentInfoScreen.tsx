import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

// allows teacher to see stats of specific student
export default function StudentInfoScreen({ route, navigation }: any) {
  const auth = getAuth();

  const student = route.params;

  const [vocabSize, setVocabSize] = useState(0);
  const [masteredCards, setMasteredCards] = useState(0);
  const [learningCards, setLearningCards] = useState(0);
  const [strugglingCards, setStrugglingCards] = useState(0);
  const [newCards, setNewCards] = useState(0);

  const readingSuccess = useRef(0);
  const listeningSuccess = useRef(0);
  const typingSuccess = useRef(0);
  const writingSuccess = useRef(0);

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
        data: [
          100 * readingSuccess.current,
          100 * listeningSuccess.current,
          100 * typingSuccess.current,
          100 * writingSuccess.current,
        ],
      },
    ],
  };

  // gets student's stats
  useEffect(() => {
    return onValue(ref(db, '/students/' + student.uid), async (querySnapShot) => {
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
          readingSuccess.current =
            (user.correctReadingETOC + user.correctReadingCTOE) / (user.totalReadingETOC + user.totalReadingCTOE);
        if (user.totalListeningCTOC + user.totalListeningCTOE > 0)
          listeningSuccess.current =
            (user.correctListeningCTOC + user.correctListeningCTOE) /
            (user.totalListeningCTOC + user.totalListeningCTOE);
        if (user.totalTypingETOC > 0) typingSuccess.current = user.correctTypingETOC / user.totalTypingETOC;
        if (user.totalHandwritingETOC > 0)
          writingSuccess.current = user.correctHandwritingETOC / user.totalHandwritingETOC;

        console.log('reading success rate:', readingSuccess.current);
        console.log('listening success rate:', listeningSuccess.current);
        console.log('typing success rate:', typingSuccess.current);
        console.log('handwriting success rate:', writingSuccess.current);
      } else {
        Alert.alert('Oh no!', user.name + ' has not added any cards to their vocab yet!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ width: 400 }} showsVerticalScrollIndicator={false}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={40} />
            </TouchableOpacity>
            <Text style={styles.header}>{student.name.toUpperCase()}'S STATS</Text>
          </View>
          <View style={{ marginHorizontal: 40 }}>
            <Text style={styles.sectionTitle}>VOCAB</Text>
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
                <Text style={styles.bigText}>{vocabSize}</Text>
                <Text style={styles.subtitle}>cards in vocab</Text>
              </View>

              <View style={styles.cardsMastered}>
                <Text style={styles.bigText}>{masteredCards}</Text>
                <Text style={styles.subtitle}>cards mastered</Text>
              </View>
            </View>

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

            <Text style={styles.sectionTitle}>QUESTION TYPE MASTERY</Text>
            <BarChart
              style={{ marginTop: 10, backgroundColor: 'transparent' }}
              data={questionTypes}
              width={340}
              height={250}
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
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
});
