import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';

import { ref, onValue, query } from 'firebase/database';
import { db } from '../config/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SharedDecksScreen({ route, navigation }: any) {
  const auth = getAuth();
  const [allDecks, setAllDecks] = useState([]);
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    loadNewData();
  }, []);

  const loadNewData = () => {
    const data = query(ref(db, '/sharedCards'));
    setRefreshing(true);
    return onValue(data, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let deckItems = { ...data };

      // uses state to set cards to the data just retrieved
      let decks: any = Object.values(deckItems);
      setAllDecks(decks);

      console.log('all decks new:', decks);
      setRefreshing(false);
    });
  };

  const Deck = ({ deck }: any) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('DeckInfoScreen', {
              deck: deck,
            })
          }
        >
          <View style={styles.deckContainer}>
            <Text style={styles.deckText}>{deck['name']}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>CLASS DECKS</Text>
      </View>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
        numColumns={2}
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        data={allDecks}
        keyExtractor={(item) => item['key']}
        renderItem={({ item }) => <Deck deck={item} />}
        ListEmptyComponent={() => <Text>Your teacher hasn't added any class decks yet...</Text>}
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
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 20,
  },
  navigation: {
    marginLeft: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardList: {
    alignSelf: 'center',
    zIndex: 1,
    marginTop: 10,
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  contentContainerStyle: {
    backgroundColor: 'transparent',
    width: 350,
  },
  deckContainer: {
    flexDirection: 'row',
    width: 165,
    height: 150,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 0,
    marginRight: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    backgroundColor: 'transparent',
  },
  deckText: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 10,
  },
});
