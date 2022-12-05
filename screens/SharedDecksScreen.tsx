import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';

import { ref, onValue, query } from 'firebase/database';
import { db } from '../config/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';

// allows students to view share decks and class decks
export default function SharedDecksScreen({ navigation }: any) {
  const auth = getAuth();
  const [sharedDecks, setSharedDecks] = useState([]);
  const [classDecks, setClassDecks]: any = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const classCode = useRef('');
  const teacherID = useRef('');

  // loads new data on render
  useEffect(() => {
    loadNewData();
  }, []);

  // loads shared decks
  const loadNewData = () => {
    const data = query(ref(db, '/sharedCards'));
    setRefreshing(true);
    onValue(data, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let deckItems = { ...data };

      // uses state to set cards to the data just retrieved
      let decks: any = Object.values(deckItems);
      setSharedDecks(decks);

      console.log('all decks new:', decks);
      setRefreshing(false);
    });

    // loads class decks
    onValue(ref(db, '/students/' + auth?.currentUser?.uid), (querySnapShot) => {
      let data2 = querySnapShot.val() || {};
      let userData = { ...data2 };

      classCode.current = userData.classCode;

      onValue(ref(db, '/classCodes/'), (querySnapShot) => {
        let data3 = querySnapShot.val() || {};
        let user: any = { ...data3 };

        let classCodeTemp = userData.classCode;
        let teacher = user[classCodeTemp];
        teacherID.current = teacher;

        onValue(ref(db, '/teachers/' + teacher + '/decks'), (querySnapShot) => {
          let data4 = querySnapShot.val() || {};
          let decks = Object.values(data4);
          setClassDecks(decks);
        });
      });
    });
  };

  // Deck component
  const Deck = ({ deck, classDeck, teacherUID }: any) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('DeckInfoScreen', {
              deck: deck,
              classDeck: classDeck,
              teacherUID: teacherUID,
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
      {/* navigation section */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>SHARED DECKS</Text>
      </View>

      {/* list of shared decks */}
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
        numColumns={2}
        style={[styles.cardList, { maxHeight: (sharedDecks.length / 2) * 170 }]}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        data={sharedDecks}
        keyExtractor={(item) => item['key']}
        renderItem={({ item }) => <Deck deck={item} classDeck={false} teacherUID={''} />}
        ListEmptyComponent={() => <Text>There are no shared decks yet...</Text>}
      />

      {/* list of class decks */}
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          marginLeft: 30,
          marginTop: 20,
        }}
      >
        CLASS DECKS
      </Text>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNewData} />}
        numColumns={2}
        style={styles.cardList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        data={classDecks}
        keyExtractor={(item) => item['key']}
        renderItem={({ item }) => <Deck deck={item} classDeck={true} teacherUID={teacherID.current} />}
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
