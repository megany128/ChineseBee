import { StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from '../components/Themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as Speech from 'expo-speech';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ref, onValue, remove, query, update } from 'firebase/database';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

var pinyin = require('chinese-to-pinyin');

// allows student to view info about a card
export default function CardInfoScreen({ route, navigation }: any) {
  const auth = getAuth();
  const { card, myCard } = route.params;
  const [starred, setStarred] = useState(card.starred);

  // checks whether card is starred or not
  useEffect(() => {
    const data = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key));
    return onValue(data, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItem = { ...data };

      setStarred(cardItem.starred);
    });
  }, []);

  // gets mastery level of card (correct/total)
  const getMastery = () => {
    if (card.timesReviewed > 0) {
      let successRate = card.timesCorrect / card.timesReviewed;
      if (successRate < 0.4) {
        return 'Struggling';
      } else if (successRate < 0.7) {
        return 'Learning';
      } else {
        return 'Mastered';
      }
    } else {
      return 'New';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* top view with navigation and quick actions */}
      <View style={{ justifyContent: 'flex-start', backgroundColor: 'transparent' }}>
        <View
          style={{
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            alignSelf: 'flex-start',
            flexDirection: 'row',
            height: 60,
            marginHorizontal: 20,
            alignItems: 'center',
            width: Dimensions.get('window').width - 40,
          }}
        >
          <TouchableOpacity style={{ marginRight: 5 }} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={40} color="white" />
          </TouchableOpacity>
          {myCard && (
            <View
              style={{
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={() => navigation.navigate('EditScreen', card)}>
                <FontAwesome5 name="pen" size={25} style={{ marginRight: 20 }} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key), { starred: !starred })
                }
              >
                <AntDesign name={starred ? 'star' : 'staro'} size={30} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* info about card */}
        <View style={{ backgroundColor: 'white', height: 1000 }}>
          <View style={{ backgroundColor: 'transparent', marginHorizontal: 30, marginTop: 30 }}>
            <View style={{ backgroundColor: 'transparent', flexDirection: 'row' }}>
              <Text style={styles.chinese}>{card.chinese}</Text>
              {card.tag ? (
                <TouchableOpacity style={styles.tag} onPress={() => navigation.navigate('SearchByTagScreen', card.tag)}>
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                    {card.tag}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {card.idiom ? (
                <View style={[styles.tag, { backgroundColor: '#94BAF4' }]}>
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>Idiom</Text>
                </View>
              ) : null}
            </View>
            <View style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.pinyin}>{pinyin(card.chinese)}</Text>
              <TouchableOpacity
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 15,
                }}
                onPress={() => Speech.speak(card.chinese, { language: 'zh-CN' })}
              >
                <FontAwesome name="volume-up" size={20} color="#C4C4C4" />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Definition</Text>
            <Text>{card.english}</Text>

            <Text style={styles.title}>Mastery Level</Text>
            <Text>{getMastery()}</Text>

            {/* delete card */}
            {myCard && (
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  Alert.alert('Delete Card', 'Are you sure? This is irreversible', [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        remove(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key));
                        navigation.goBack();
                      },
                    },
                  ])
                }
              >
                <Text style={styles.buttonText}>DELETE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCB44',
  },
  chinese: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  pinyin: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 5,
  },
  button: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 105,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    alignSelf: 'center',
  },
  tag: {
    justifyContent: 'center',
    backgroundColor: '#FEB1C3',
    borderRadius: 20,
    height: 25,
    marginTop: 10,
    marginLeft: 20,
    paddingHorizontal: 15,
  },
});
