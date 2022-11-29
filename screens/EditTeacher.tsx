import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Input } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { ref, update, onValue } from 'firebase/database';
import { db } from '../config/firebase';
import moment from 'moment';
import isChinese from 'is-chinese';

moment().format();

export default function EditTeacher({ route, navigation }: any) {
  // initialises current user & auth
  const auth = getAuth();

  const [modalVisible, setModalVisible] = useState(false);

  const { card, deck } = route.params;

  const [cardInfo, setCardInfo] = useState(card);

  const [english, setEnglish]: any = useState(card.english);
  const [chinese, setChinese]: any = useState(card.chinese);

  const [error, setError] = useState(String);

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => setModalVisible(false), 700);
    }
  });

  // adds a card with data from the text inputs
  const updateCard = () => {
    console.log('click');

    // error checking
    if (english === '') {
      setError('English definition missing!');
    } else if (chinese === '') {
      setError('Chinese definition missing!');
    } else if (!isChinese(chinese)) {
      setError('Please make sure the Chinese definition only contains Chinese characters');
    } else {
      setError('');
      console.log(english + ' / ' + chinese);

      // updates card in database
      update(ref(db, '/teachers/' + auth.currentUser?.uid + '/decks/' + deck['key'] + '/cards/' + card.key), {
        english: english,
        chinese: chinese,
      }).then(() => {
        onValue(
          ref(db, '/teachers/' + auth.currentUser?.uid + '/decks/' + deck['key'] + '/cards/' + card.key),
          async (querySnapShot) => {
            let data = querySnapShot.val() || [];
            let cardTemp = { ...data };

            navigation.pop(1);
            navigation.navigate('CardInfoScreenTeacher', { card: cardTemp, deck: deck });
          }
        );
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={40} />
          </TouchableOpacity>
          <Text style={styles.header}>EDIT CARD</Text>
        </View>
        <View style={{ marginTop: 20, flex: 1 }}>
          <Input
            inputContainerStyle={styles.inputStyle}
            placeholder="Chinese"
            containerStyle={styles.control}
            value={chinese}
            onChangeText={(text) => setChinese(text)}
            autoCompleteType=""
            style={styles.inputText}
          />

          <Input
            inputContainerStyle={styles.inputStyle}
            placeholder="English"
            containerStyle={styles.control}
            value={english}
            onChangeText={(text) => setEnglish(text)}
            autoCompleteType=""
            style={styles.inputText}
          />

          <View style={{ alignSelf: 'center' }}>
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={() => updateCard()}>
              <Text style={styles.buttonText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  },
  control: {
    marginTop: 10,
    borderColor: '#C4C4C4',
    marginLeft: 20,
    width: 380,
  },
  inputText: {
    marginHorizontal: 20,
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
    width: 90,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    alignSelf: 'center',
  },
  error: {
    color: '#D54826FF',
    marginVertical: 20,
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    width: 360,
    alignSelf: 'center',
  },
});
