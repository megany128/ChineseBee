import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable, Button, TouchableOpacity } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/AntDesign';
import { RootTabScreenProps } from '../types';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';

var pinyin = require('chinese-to-pinyin');

export default function CardsScreen({ navigation }: RootTabScreenProps<'Cards'>) {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [cards, setCards] = useState({});
  const [value, setValue] = useState(String);

  const cardKeys = Object.keys(cards);

  var arrayholder: any = [];

  const Card = ({ cardItem: { english, chinese, tag, starred }, id }: any) => {
    const [starState, setStarState] = useState(false);
    return (
      <View>
        <Pressable
          onPress={
            () => console.log('card clicked')
            // navigation.navigate('CardInfoScreen', {
            //   english: english,
            //   chinese: chinese,
            //   tag: tag
            // })
          }
        >
          <View style={styles.cardContainer}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.chinese}>{chinese}</Text>
              <Text style={styles.pinyin}>{pinyin(chinese)}</Text>
              <Text style={styles.english}>{english}</Text>
            </View>
            <View
              style={{
                width: 270,
                height: 100,
                alignItems: 'flex-end',
                marginTop: 10,
                alignContent: 'flex-end',
                flex: 1,
                marginRight: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() =>
                    set(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + id), {
                      chinese: chinese,
                      english: english,
                      tag: tag,
                      starred: !starred,
                    })
                  }
                >
                  <Icon
                    name={starred ? 'star' : 'staro'}
                    size={25}
                    color="#FFCB44"
                    style={{ marginTop: 8, marginRight: 10 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tag}>
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>{tag}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };
      setCards(cardItems);
      arrayholder = cardItems;
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <Text style={styles.header}>CARDS</Text>
      </View>
      <View></View>
      <ScrollView
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {cardKeys.length > 0 ? (
          cardKeys.map((cardKey) => <Card key={cardKey} id={cardKey} cardItem={cards[cardKey as keyof typeof cards]} />)
        ) : (
          <Text>No cards</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddScreen')}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', alignSelf: 'center' }}>ADD +</Text>
      </TouchableOpacity>
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
  },
  cardContainer: {
    flexDirection: 'row',
    width: 350,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
    borderColor: '#C4C4C4',
    marginVertical: 15,
    zIndex: 0,
  },
  cardList: {
    alignSelf: 'center',
    zIndex: 1,
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
  addButton: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    zIndex: 1,
    elevation: 1,
    width: 105,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  tag: {
    justifyContent: 'center',
    backgroundColor: '#FEB1C3',
    borderRadius: 20,
    width: 55,
    height: 25,
    marginTop: 10,
  },
});
