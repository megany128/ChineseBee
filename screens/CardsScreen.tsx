import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { RootTabScreenProps } from '../types';
import { ref, set, onValue, orderByChild, query } from 'firebase/database';
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

  const [starredFilter, setStarredFilter] = useState(false);
  const [sortStyle, setSortStyle] = useState(0);

  const Card = ({ cardItem, id }: any) => {
    return (
      pinyin(cardItem['chinese'], { removeTone: true }),
      (
        <View>
          <Pressable
            onPress={
              () => console.log('card clicked')
              // navigation.navigate('CardInfoScreen', {
              //   english: cardItem['english'],
              //   chinese: cardItem['chinese'],
              //   tag: cardItem['tag'],
              //   key: cardItem['key'],
              //   masteryLevel: cardItem['masteryLevel']
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
                      updateStarred(cardItem)
                    }
                  >
                    <Icon
                      name={cardItem['starred'] ? 'star' : 'staro'}
                      size={25}
                      color="#FFCB44"
                      style={{ marginTop: 8, marginRight: 10 }}
                    />
                  </TouchableOpacity>
                  {cardItem['tag'] ? (
                    <TouchableOpacity style={styles.tag}>
                      <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                        {cardItem['tag']}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View></View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      )
    );
  };

  const updateStarred = (cardItem: any) => {
    set(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
      chinese: cardItem['chinese'],
      english: cardItem['english'],
      tag: cardItem['tag'],
      starred: !cardItem['starred'],
      key: cardItem['key'],
      masteryLevel: cardItem['masteryLevel'],
      createdAt: cardItem['createdAt']
    })

    // TODO: fix bug: when item is unstarred after star filter is already on
    if (!cardItem['starred'] && starredFilter) {
      getStarred(starredFilter);
      console.log(cardArray)
    }
  }

  useEffect(() => {
    const orderedData = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), orderByChild('createdAt'));
    return onValue(orderedData, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };
      setCards(cardItems);
      arrayholder = cardItems;

      let newArray: any = Object.values(cardItems).reverse();

      setCardArray(newArray);
      setFilteredCards(newArray);
    });
  }, []);

  // TODO: fix bug: when searching, if you turn star filter on and off there's an issue
  const searchCards = (text: string) => {
    setSearch(text);

    setFilteredCards(
      cardArray.filter((obj: { english: string; chinese: string }) => {
        return (
          obj.english.toLowerCase().includes(text) ||
          obj.chinese.includes(text) ||
          pinyin(obj.chinese, { removeTone: true }).toLowerCase().includes(text) ||
          pinyin(obj.chinese, { removeTone: true, removeSpace: true }).toLowerCase().includes(text)
        );
      })
    );
  };

  const applyStarredFilter = () => {
    const newStarredFilter = !starredFilter;
    setStarredFilter(newStarredFilter);
    getStarred(newStarredFilter);
  };

  const getStarred = (newStarredFilter: boolean) => {
    if (newStarredFilter) {
      setFilteredCards(
        cardArray.filter((obj: { starred: any, english: string; chinese: string }) => {
          return obj.starred && (obj.english.toLowerCase().includes(search) ||
          obj.chinese.includes(search) ||
          pinyin(obj.chinese, { removeTone: true }).toLowerCase().includes(search) ||
          pinyin(obj.chinese, { removeTone: true, removeSpace: true }).toLowerCase().includes(search));
        })
      );
    } else {
      setFilteredCards(cardArray);
      searchCards(search);
    }
  }

  const applySort = () => {
    let newSort = 0;
    if (sortStyle < 2) {
      newSort = sortStyle + 1;
    }
    setSortStyle(newSort);

    switch(newSort) {
      case 0:
        setFilteredCards(
          cardArray.sort((obj1: { createdAt: number }, obj2: { createdAt: number }) => obj2.createdAt - obj1.createdAt)
        );
        getStarred(starredFilter);
        searchCards(search);
        break;
      case 1:
        setFilteredCards(
          cardArray.sort((obj1: { masteryLevel: number }, obj2: { masteryLevel: number }) => obj2.masteryLevel - obj1.masteryLevel)
        );
        getStarred(starredFilter);
        searchCards(search);
        break;
      case 2:
        setFilteredCards(
          cardArray.sort((obj1: { masteryLevel: number }, obj2: { masteryLevel: number }) => obj1.masteryLevel - obj2.masteryLevel)
        );
        getStarred(starredFilter);
        searchCards(search);
        break;
      default:
        break;
    }
  }

  const getSortIcon = () => {
    switch(sortStyle) {
      case 0:
        return 'sort';
      case 1:
        return 'sort-down';
      case 2:
        return 'sort-up';
      default:
        return ''
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <Text style={styles.header}>CARDS</Text>
      </View>
      <View style={{ backgroundColor: 'transparent', zIndex: 1000, flexDirection: 'row' }}>
        <TextInput
          style={styles.searchBar}
          value={search}
          placeholder="search"
          underlineColorAndroid="transparent"
          onChangeText={(text) => searchCards(text)}
          textAlign="left"
          placeholderTextColor="#C4C4C4"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.sortButton} onPress={() => applySort()}>
        <Icon2 name={getSortIcon()} size={20} color="#FFFFFF" style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.starButton} onPress={() => applyStarredFilter()}>
          <Icon name={starredFilter ? 'star' : 'staro'} size={20} color="#FFFFFF" style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {cardKeys.length > 0 ? (
          cardKeys.map((cardKey) => (
            <Card key={cardKey} id={cardKey} cardItem={filteredCards[cardKey as keyof typeof cards]} />
          ))
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
  starButton: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 30,
    height: 30,
    marginTop: 25,
    marginLeft: 10,
    justifyContent: 'center',
  },
  sortButton: {
    borderRadius: 30,
    backgroundColor: '#94BAF4',
    width: 30,
    height: 30,
    marginTop: 25,
    marginLeft: 10,
    justifyContent: 'center',
  },
  tag: {
    justifyContent: 'center',
    backgroundColor: '#FEB1C3',
    borderRadius: 20,
    width: 55,
    height: 25,
    marginTop: 10,
    marginRight: 10,
  },
  searchBar: {
    height: 40,
    width: 270,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    marginLeft: 30,
    backgroundColor: 'white',
    marginTop: 20,
    paddingLeft: 20,
    zIndex: 2,
  },
});
