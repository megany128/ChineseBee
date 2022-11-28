import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackScreenProps } from '../types';
import { push, ref, limitToLast, query, onValue, update, orderByChild } from 'firebase/database';
import { db, storage } from '../config/firebase';
import moment from 'moment';
import Modal from 'react-native-modal';
import Entypo from 'react-native-vector-icons/Entypo';
import DropDownPicker from 'react-native-dropdown-picker';

moment().format();

export default function AddDeck({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [name, setName]: any = useState('');

  const [error, setError] = useState(String);

  // gets the key of the last card created
  const getKey = () => {
    var cardRef = query(ref(db, '/teachers/' + auth.currentUser?.uid + '/decks/'), orderByChild('createdAt'));
    cardRef = query(cardRef, limitToLast(1));
    let key = '';
    onValue(cardRef, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let card = { ...data };
      console.log('card is', card);
      key = Object.keys(card)[0];
    });
    return key;
  };

  // adds a card with data from the text inputs
  const addDeck = () => {
    console.log('click');

    // error checking
    if (name === '') {
      setError('Deck name missing!');
    } else {
      setError('');

      // adds a card to the database
      push(ref(db, '/teachers/' + auth.currentUser?.uid + '/decks'), {
        name: name,
        createdAt: moment().valueOf(),
      });

      // adds the card's key as a field
      const key = getKey();
      update(ref(db, '/teachers/' + auth.currentUser?.uid + '/decks/' + key), {
        key,
      });

      Alert.alert('Success', 'Deck added', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>ADD CLASS DECK</Text>
      </View>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ marginTop: 20, flex: 1 }}>
          <Input
            inputContainerStyle={styles.inputStyle}
            placeholder="Deck name"
            containerStyle={styles.control}
            value={name}
            onChangeText={(text) => setName(text)}
            autoCompleteType=""
            style={styles.inputText}
          />
          <View style={{ alignSelf: 'center' }}>
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={() => addDeck()}>
              <Text style={styles.buttonText}>ADD +</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  control: {
    marginTop: 10,
    borderColor: '#C4C4C4',
    marginLeft: 20,
    width: 380,
  },
  inputText: {
    marginLeft: 20,
  },
  inputStyle: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    height: 50,
  },
  button: {
    borderRadius: 30,
    backgroundColor: '#FFCB44',
    width: 105,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    alignSelf: 'center',
  },
  error: {
    color: '#D54826FF',
    marginBottom: 20,
  },
  modalView: {
    height: '15%',
    marginTop: 'auto',
    backgroundColor: '#FFCB44',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    width: 360,
    alignSelf: 'center',
  },
});
