import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native';
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
  const [filteredCards, setFilteredCards] = useState([]);
  const [cardArray, setCardArray]: any = useState({});

  const [search, setSearch] = useState('');

  const cardKeys = Object.keys(filteredCards);

  var arrayholder: any = [];

  const Card = ({ cardItem, id }: any) => {
    return (
      pinyin(cardItem['chinese'], {removeTone: true}),
      <View>
        <Pressable
          onPress={
            () => console.log('card clicked')
            // navigation.navigate('CardInfoScreen', {
            //   english: cardItem['english'],
            //   chinese: cardItem['chinese'],
            //   tag: cardItem['tag'],
            //   key: cardItem['key'],
            // })
          }
        >
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
                  onPress={() =>
                    set(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
                      chinese: cardItem['chinese'],
                      english: cardItem['english'],
                      tag: cardItem['tag'],
                      starred: !cardItem['starred'],
                      key: cardItem['key']
                    })
                  }
                >
                  <Icon
                    name={cardItem['starred'] ? 'star' : 'staro'}
                    size={25}
                    color="#FFCB44"
                    style={{ marginTop: 8, marginRight: 10 }}
                  />
                </TouchableOpacity>
                {cardItem['tag'] ? 
                  <TouchableOpacity style={styles.tag}>
                    <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>{cardItem['tag']}</Text>
                  </TouchableOpacity>
                :
                <View></View>
                }
                
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

      setCardArray(Object.values(cardItems));
      setFilteredCards(Object.values(cardItems));
    });
  }, []);

  const searchCards = (text: string) => {
    setSearch(text)

    setFilteredCards(cardArray.filter((obj: { english: string; chinese: string }) => {
      return obj.english.toLowerCase().includes(text) || obj.chinese.includes(text) || pinyin(obj.chinese, {removeTone: true}).toLowerCase().includes(text) || pinyin(obj.chinese, {removeTone: true, removeSpace: true}).toLowerCase().includes(text);
    }))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <Text style={styles.header}>CARDS</Text>
      </View>
      <View style={{backgroundColor: 'transparent', zIndex: 1000}}>
        <TextInput
          style={styles.searchBar}
          value={search}
          placeholder='search'
          underlineColorAndroid='transparent'
          onChangeText={(text) => searchCards(text)}
          textAlign='left'
          placeholderTextColor='#C4C4C4'
          autoCapitalize='none'
          autoComplete='off'
          autoCorrect={false}
        />
      </View>
      <ScrollView
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {cardKeys.length > 0 ? (
          cardKeys.map((cardKey) => <Card key={cardKey} id={cardKey} cardItem={filteredCards[cardKey as keyof typeof cards]} />)
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
    backgroundColor: 'transparent'
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
    marginTop: -5
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
    marginRight: 10
  },
  searchBar: {
    height: 40,
    width: 350,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    marginLeft: 30,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    zIndex: 2
  }
});
