import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Pressable,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ref, onValue, orderByChild, query, update } from 'firebase/database';
import { db } from '../config/firebase';

var pinyin = require('chinese-to-pinyin');

// allows students to search all cards under a certain tag
export default function SearchByTagScreen({ route, navigation }: any) {
  const auth = getAuth();
  const [refreshing, setRefreshing] = useState(true);

  const [cards, setCards] = useState({});
  const [filteredCards, setFilteredCards] = useState([]);
  const [cardArray, setCardArray]: any = useState({});

  const [search, setSearch] = useState('');

  const cardKeys = Object.keys(filteredCards);

  const [starredFilter, setStarredFilter] = useState(false);
  const [sortStyle, setSortStyle] = useState(0);

  const tagSearch = route.params;

  // creates a Card component
  const Card = ({ cardItem, id }: any) => {
    return (
      <View>
        <Pressable onPress={() => navigation.navigate('CardInfoScreen', { card: cardItem, myCard: true })}>
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
                <TouchableOpacity onPress={() => updateStarred(cardItem)}>
                  <AntDesign
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
    );
  };

  // TODO: applying starred doesn't happen immediately
  // toggles a card's starred status
  const updateStarred = (cardItem: any) => {
    if (cardItem['starred'] && starredFilter === true) {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: false,
      });
      getStarred(starredFilter);

      setFilteredCards(
        filteredCards.filter((obj: any) => {
          return !(obj.key === cardItem['key']);
        })
      );
    } else if (cardItem['starred']) {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: false,
      });
    } else {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: true,
      });
      getStarred(starredFilter);
    }
  };

  // loads new data
  const loadNewData = () => {
    setRefreshing(true);
    // gets cards ordered by createdAt
    const orderedData = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), orderByChild('createdAt'));
    return onValue(orderedData, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };

      // uses state to set cards to the data just retrieved
      setCards(
        Object.values(cardItems).filter((item: any) => {
          return item.tag === tagSearch;
        })
      );

      let newArray: any = Object.values(cardItems)
        .filter((item: any) => {
          return item.tag === tagSearch;
        })
        .reverse();

      // uses state to set cardArray and filteredCards to the reverse of this data
      setCardArray(newArray);
      setFilteredCards(newArray);
      setRefreshing(false);
    });
  };

  // gets cards from database when screen loads
  useEffect(() => {
    console.log('tag is', JSON.stringify(tagSearch));
    loadNewData();
  }, []);

  // searches Cards using search term and sets filteredCards to search results
  const searchCards = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
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

  // applies the starred filter
  const applyStarredFilter = () => {
    // sets the new filter to the opposite of what it was previously
    const newStarredFilter = !starredFilter;
    setStarredFilter(newStarredFilter);

    // filters cards based on starred
    getStarred(newStarredFilter);
  };

  // gets all cards that match the starred filter (while still matching the search term)
  const getStarred = (newStarredFilter: boolean) => {
    // if starred is true, filters cardArray by starred and then applies the search
    if (newStarredFilter) {
      setFilteredCards(
        cardArray.filter((obj: { starred: any; english: string; chinese: string }) => {
          return (
            obj.starred &&
            (obj.english.toLowerCase().includes(search) ||
              obj.chinese.includes(search) ||
              pinyin(obj.chinese, { removeTone: true }).toLowerCase().includes(search) ||
              pinyin(obj.chinese, { removeTone: true, removeSpace: true }).toLowerCase().includes(search))
          );
        })
      );
    }
    // if starred is false, ignores the starred filter and only applies the search
    else {
      setFilteredCards(cardArray);
      searchCards(search);
    }
  };

  // sorts cards by mastery
  const applySort = () => {
    // sets the new sort type
    let newSort = 0;
    if (sortStyle < 2) {
      newSort = sortStyle + 1;
    }
    setSortStyle(newSort);

    // checks which sort is currently applied
    switch (newSort) {
      // sorts by time created, then applies the starred filter and the search (within getStarred)
      case 0:
        setFilteredCards(
          cardArray.sort((obj1: { createdAt: number }, obj2: { createdAt: number }) => obj2.createdAt - obj1.createdAt)
        );
        getStarred(starredFilter);
        break;
      // sorts by descending mastery, then applies the starred filter and the search (within getStarred)
      case 1:
        setFilteredCards(
          cardArray.sort(
            (
              obj1: { timesReviewed: number; timesCorrect: number },
              obj2: { timesReviewed: number; timesCorrect: number }
            ) => obj2.timesCorrect / obj2.timesReviewed - obj1.timesCorrect / obj1.timesReviewed
          )
        );
        getStarred(starredFilter);
        break;
      // sorts by ascending mastery, then applies the starred filter and the search (within getStarred)
      case 2:
        setFilteredCards(
          cardArray.sort(
            (
              obj1: { timesReviewed: number; timesCorrect: number },
              obj2: { timesReviewed: number; timesCorrect: number }
            ) => obj2.timesCorrect / obj2.timesReviewed - obj1.timesCorrect / obj1.timesReviewed
          )
        );
        getStarred(starredFilter);
        break;
      default:
        break;
    }
  };

  // returns the correct icon based on the sort
  const getSortIcon = () => {
    switch (sortStyle) {
      case 0:
        return 'sort';
      case 1:
        return 'sort-down';
      case 2:
        return 'sort-up';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* navigation section */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>{tagSearch}</Text>
      </View>

      {/* search, sort, and starred filter */}
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
          <FontAwesome name={getSortIcon()} size={20} color="#FFFFFF" style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.starButton} onPress={() => applyStarredFilter()}>
          <AntDesign
            name={starredFilter ? 'star' : 'staro'}
            size={20}
            color="#FFFFFF"
            style={{ alignSelf: 'center' }}
          />
        </TouchableOpacity>
      </View>

      {/* list of cards with specified tag */}
      <FlatList
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
        data={cardKeys}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Card id={item} cardItem={filteredCards[item as keyof typeof cards]} />}
        ListEmptyComponent={() =>
          !starredFilter ? (
            <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No cards yet!</Text>
          ) : !search ? (
            <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No favourited cards!</Text>
          ) : null
        }
      />

      {/* add card */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddScreen', { tagParam: tagSearch })}
      >
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
    bottom: 45,
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
    height: 25,
    marginTop: 10,
    marginRight: 10,
    paddingHorizontal: 15,
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
