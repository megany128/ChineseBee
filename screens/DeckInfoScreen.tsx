import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Pressable,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { ref, push, onValue, limitToLast, query, update } from 'firebase/database';
import { db } from '../config/firebase';

var pinyin = require('chinese-to-pinyin');

moment().format();

export default function DeckInfoScreen({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [cards, setCards] = useState({});
  const [cardArray, setCardArray]: any = useState({});

  const cardKeys = Object.keys(cardArray);

  const { deck } = route.params;

  // creates a Card component
  const Card = ({ cardItem, id }: any) => {
    return (
      <View>
        <Pressable onPress={() => navigation.navigate('CardInfoScreen', cardItem)}>
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
                alignContent: 'flex-end',
                flex: 1,
                marginRight: 20,
                marginTop: 20,
              }}
            >
              <View style={styles.tag}>
                <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                  {deck['name']}
                </Text>
              </View>
              {/* <TouchableOpacity style={styles.addToVocabListSmall} onPress={() => alert('Add to vocab list?')}>
                <AntDesign name='plus' size={20} color='#FFCB44'/>
              </TouchableOpacity> */}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const loadNewData = () => {
    // gets cards ordered by createdAt
    const orderedData = query(ref(db, '/sharedCards/' + deck['key'] + '/cards'));
    return onValue(orderedData, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      // uses state to set cards to the data just retrieved
      setCards(Object.values(cardItems));

      let newArray: any = Object.values(cardItems).reverse();

      setCardArray(newArray);
    });
  };

  // gets cards from database when screen loads
  useEffect(() => {
    loadNewData();
  }, []);

  // gets the key of the last card created
  const getKey = () => {
    var cardRef = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), limitToLast(1));
    let key = '';
    onValue(cardRef, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let card = { ...data };
      key = Object.keys(card)[0];
    });
    return key;
  };

  const addCardsToVocab = () => {
    for (let i = 0; i < cardArray.length; i++) {
      console.log(cardArray[i]['english']);
      push(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), {
        english: cardArray[i]['english'],
        chinese: cardArray[i]['chinese'],
        tag: deck['name'],
        starred: false,
        createdAt: moment().valueOf(),
        timesCorrect: 0,
        timesReviewed: 0,
        dueDate: 0,
        idiom: cardArray[i]['idiom'],
      });
      update(ref(db, '/students/' + auth.currentUser?.uid + '/tags'), {
        [deck['name']]: '',
      });
      const key = getKey();
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + key), {
        key,
      });
    }
    Alert.alert('Success', 'Cards added', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon3 name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>{deck['name']}</Text>
      </View>
      <TouchableOpacity style={styles.addToVocabList} onPress={() => addCardsToVocab()}>
        <Text style={{ color: '#FFCB44', fontWeight: '600' }}>ADD CARDS TO VOCAB LIST</Text>
      </TouchableOpacity>
      <FlatList
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        data={cardKeys}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Card id={item} cardItem={cardArray[item as keyof typeof cards]} />}
        ListEmptyComponent={() => <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No cards in this deck!</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  button: {
    marginTop: 10,
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
  cardList: {
    alignSelf: 'center',
    zIndex: 1,
    marginTop: -5,
  },
  contentContainerStyle: {
    padding: 24,
    backgroundColor: 'transparent',
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
  },
  addToVocabList: {
    marginHorizontal: 30,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    width: 350,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCB44',
    alignItems: 'center',
  },
  addToVocabListSmall: {
    borderColor: '#FFCB44',
    borderRadius: 20,
    borderWidth: 1,
    width: 25,
    height: 25,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});