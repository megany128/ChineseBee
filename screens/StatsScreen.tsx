import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, Text, View } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
import { push, ref, set, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

export default function StatsScreen({ route, navigation }: any) {
  const auth = getAuth();
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
        strokeWidth: 2, // optional
      },
    ],
    legend: ['Rainy Days'], // optional
  };

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const [vocabSize, setVocabSize] = useState(0);
  const [mastered, setMastered] = useState(0);

  // CHARTS:
  // activity per day (monday - sunday)
  // comparison of question type success rates

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      let allCards: any = Object.values(cardItems);
      let masteredCards = allCards.filter((obj: any) => {
        return obj.timesCorrect / obj.timesReviewed > 0.7;
      });

      setVocabSize(allCards.length());
      setMastered(masteredCards.length);
    });
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.navigation}>
          <Text style={styles.header}>STATS</Text>
        </View>
        <View style={{ marginHorizontal: 40 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'transparent',
              width: 340,
              justifyContent: 'space-between',
              alignSelf: 'center',
              marginVertical: 10,
              marginTop: 20,
            }}
          >
            <View style={styles.cardsStudied}>
              <Text style={styles.bigText}>{vocabSize}</Text>
              <Text style={styles.subtitle}>cards in vocab</Text>
            </View>
            <View style={styles.cardsMastered}>
              <Text style={styles.bigText}>{mastered}</Text>
              <Text style={styles.subtitle}>cards mastered</Text>
            </View>
          </View>

          {/* <LineChart
            data={data}
            width={340}
            height={220}
            chartConfig={chartConfig}
          /> */}
        </View>
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
});
