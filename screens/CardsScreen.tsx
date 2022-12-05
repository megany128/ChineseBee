import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { ref, onValue, orderByChild, query, update } from 'firebase/database';
import { db } from '../config/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

var pinyin = require('chinese-to-pinyin');

// displays student's cards
export default function CardsScreen({ navigation }: any) {
  const auth = getAuth();
  const [refreshing, setRefreshing] = useState(true);

  const [cards, setCards] = useState({});
  const [filteredCards, setFilteredCards] = useState([]);
  const [cardArray, setCardArray]: any = useState({});

  const [search, setSearch] = useState('');

  const cardKeys = Object.keys(filteredCards);

  const [starredFilter, setStarredFilter] = useState(false);
  const [sortStyle, setSortStyle] = useState(0);

  const userType = useRef('');
  const classCode = useRef('');
  const [classDecks, setClassDecks] = useState([]);
  const [filteredClassDecks, setFilteredClassDecks] = useState([]);

  // creates a Card component
  const Card = ({ cardItem, starredInitial }: any) => {
    const [starred, setStarred] = useState(starredInitial);

    return (
      <View style={{ backgroundColor: 'transparent' }}>
        <TouchableOpacity onPress={() => navigation.navigate('CardInfoScreen', { card: cardItem, myCard: true })}>
          <View style={styles.cardContainer}>
            <View style={{ flexDirection: 'column', backgroundColor: 'transparent' }}>
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
                backgroundColor: 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    updateStarred(cardItem);
                  }}
                >
                  <Icon
                    name={starred ? 'star' : 'staro'}
                    size={25}
                    color="#FFCB44"
                    style={{ marginTop: 8, marginRight: 10 }}
                  />
                </TouchableOpacity>
                {cardItem['tag'] ? (
                  <TouchableOpacity
                    style={styles.tag}
                    onPress={() => navigation.navigate('SearchByTagScreen', cardItem['tag'])}
                  >
                    <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                      {cardItem['tag']}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // toggles a card's starred status
  const updateStarred = (cardItem: any) => {
    if (cardItem['starred'] && starredFilter === true) {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: !cardItem['starred'],
      });
      getStarred(starredFilter);
      setFilteredCards(
        filteredCards.filter((obj: any) => {
          return !(obj.key === cardItem['key']);
        })
      );
    } else if (cardItem['starred']) {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: !cardItem['starred'],
      });
    } else {
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + cardItem['key']), {
        starred: !cardItem['starred'],
      });
      getStarred(starredFilter);
      loadNewData();
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
      setCards(cardItems);
      if (cardItems) {
        let newArray: any = Object.values(cardItems).reverse();

        // uses state to set cardArray and filteredCards to the reverse of this data
        setCardArray(newArray);
        setFilteredCards(newArray);
        setRefreshing(false);
      }
    });
  };

  // checks if user is teacher and if so, gets class code and decks
  useEffect(() => {
    onValue(ref(db, '/userRoles'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userRoles = { ...data };

      userType.current = userRoles[auth.currentUser!.uid];

      if (userRoles[auth.currentUser!.uid] === 'teacher') {
        return onValue(ref(db, '/teachers/' + auth.currentUser?.uid), async (querySnapShot) => {
          let data = querySnapShot.val() || [];
          let user = { ...data };

          classCode.current = user.classCode;

          if (user.decks) {
            let decks: any = Object.values(user.decks);

            setClassDecks(decks);
            setFilteredClassDecks(decks);
          }
        });
      }
    });
  }, []);

  // loads new data on render
  useEffect(() => {
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

  // searches Cards using search term and sets filteredCards to search results
  const searchDecks = (text: string) => {
    // sets the search term to the current search box input
    setSearch(text);

    // applies the search: sets filteredCards to Cards in cardArray that contain the search term
    // since Card is an object, checks if any of the english, chinese, and pinyin properties include the search term
    setFilteredClassDecks(
      classDecks.filter((obj: { name: string }) => {
        return (
          obj.name.toLowerCase().includes(text) ||
          pinyin(obj.name, { removeTone: true }).toLowerCase().includes(text) ||
          pinyin(obj.name, { removeTone: true, removeSpace: true }).toLowerCase().includes(text)
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
        console.log('sorting by time created');

        setFilteredCards(
          cardArray.sort(function (obj1: any, obj2: any) {
            return obj2.createdAt - obj1.createdAt;
          })
        );
        getStarred(starredFilter);
        break;
      // sorts by descending mastery, then applies the starred filter and the search (within getStarred)
      case 1:
        console.log('sorting by descending mastery');
        setFilteredCards(
          cardArray.sort(function (obj1: any, obj2: any) {
            return (
              (obj2.timesReviewed > 0 ? obj2.timesCorrect / obj2.timesReviewed : -1) -
              (obj1.timesReviewed > 0 ? obj1.timesCorrect / obj1.timesReviewed : -1)
            );
          })
        );
        getStarred(starredFilter);
        break;
      // sorts by ascending mastery, then applies the starred filter and the search (within getStarred)
      case 2:
        console.log('sorting by ascending mastery');
        setFilteredCards(
          cardArray.sort(function (obj1: any, obj2: any) {
            return (
              (obj1.timesReviewed > 0 ? obj1.timesCorrect / obj1.timesReviewed : -1) -
              (obj2.timesReviewed > 0 ? obj2.timesCorrect / obj2.timesReviewed : -1)
            );
          })
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

  // creates a Deck component
  const Deck = ({ deckItem }: any) => {
    return (
      <View style={{ backgroundColor: 'transparent' }}>
        <TouchableOpacity onPress={() => navigation.navigate('ClassDeckInfoScreen', { deck: deckItem })}>
          <View style={styles.cardContainer}>
            <Text style={styles.deckName}>{deckItem['name']}</Text>
            <View
              style={{
                width: 270,
                height: 100,
                alignItems: 'flex-end',
                justifyContent: 'center',
                alignContent: 'flex-end',
                flex: 1,
                marginRight: 10,
                backgroundColor: 'transparent',
              }}
            >
              <Ionicons name="chevron-forward" size={40} color="#C4C4C4" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* navigation section */}
      <View style={styles.navigation}>
        <Text style={styles.header}>{userType.current === 'student' ? 'CARDS' : 'CLASS DECKS'}</Text>
      </View>

      {/* student view */}
      {userType.current === 'student' ? (
        <View style={{ backgroundColor: 'transparent' }}>
          {/* search bar, sort, and star filter */}
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

          {/* list of cards */}
          <FlatList
            style={styles.cardList}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
            data={cardKeys}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Card
                id={item}
                cardItem={filteredCards[item as keyof typeof cards]}
                starredInitial={filteredCards[item as keyof typeof cards]['starred' as keyof typeof cards]}
              />
            )}
            ListEmptyComponent={() =>
              !starredFilter ? (
                <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No cards yet!</Text>
              ) : !search ? (
                <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No favourited cards!</Text>
              ) : null
            }
          />

          {/* add card */}
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddScreen', { tagParam: '' })}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', alignSelf: 'center' }}>ADD +</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // teacher view
        <View>
          {/* search bar */}
          <TextInput
            style={[styles.searchBar, { width: 350 }]}
            value={search}
            placeholder="search"
            underlineColorAndroid="transparent"
            onChangeText={(text) => searchDecks(text)}
            textAlign="left"
            placeholderTextColor="#C4C4C4"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
          />

          {/* list of decks */}
          <FlatList
            style={styles.cardList}
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
            data={filteredClassDecks}
            keyExtractor={(item: any) => item.key}
            renderItem={({ item }: any) => <Deck deckItem={item} />}
            ListEmptyComponent={() => <Text style={{ marginLeft: 30, paddingBottom: 15 }}>No results...</Text>}
          />

          {/* add card */}
          <TouchableOpacity style={[styles.addButton, { bottom: 80 }]} onPress={() => navigation.navigate('AddDeck')}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', alignSelf: 'center' }}>ADD +</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  navigation: {
    marginLeft: 30,
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
    marginLeft: 5,
  },
  cardList: {
    alignSelf: 'center',
    zIndex: 1,
    marginTop: -5,
    marginBottom: 50,
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
    bottom: 80,
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
    paddingHorizontal: 15,
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
  deckName: {
    fontWeight: '700',
    marginLeft: 20,
    alignSelf: 'center',
    fontSize: 18,
  },
});
