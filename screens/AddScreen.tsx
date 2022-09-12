import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackScreenProps } from '../types';
import { push, ref, limitToLast, query, onValue, update } from 'firebase/database';
import { db, storage } from '../config/firebase';

export default function AddScreen({ navigation }: RootStackScreenProps<'AddScreen'>) {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [value, setValue] = React.useState({
    english: '',
    chinese: '',
    tag: '',
  });

  const [error, setError] = useState(String);

  const getKey = () => {
    var cardRef = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), limitToLast(1));
    let key = ''
    onValue(cardRef, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let card = { ...data };
      key = Object.keys(card)[0]
    });
    return key;
  }

  const addCard = () => {
    console.log('click');

    if (value.english === '') {
      setError('English definition missing!');
    }
    else if (value.chinese === '') {
      setError('Chinese definition missing!');
    }
    else {
      setError('')
      console.log(value.english + ' / ' + value.chinese)
      push(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), {
        english: value.english,
        chinese: value.chinese,
        tag: value.tag,
        starred: false,
      });
  
      const key = getKey();
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + key), {
        key
      });
  
      Alert.alert('Card created!');
  
      setValue({
        english: '',
        chinese: '',
        tag: '',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>ADD CARD</Text>
      </View>
      <View style={{ marginTop: 20, flex: 1 }}>
        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="English"
          containerStyle={styles.control}
          value={value.english}
          onChangeText={(text) => setValue({ ...value, english: text })}
          autoCompleteType=""
          style={styles.inputText}
        />
        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="Chinese"
          containerStyle={styles.control}
          value={value.chinese}
          onChangeText={(text) => setValue({ ...value, chinese: text })}
          autoCompleteType=""
          style={styles.inputText}
        />

        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="Tag"
          containerStyle={styles.control}
          value={value.tag}
          onChangeText={(text) => setValue({ ...value, tag: text })}
          autoCompleteType=""
          style={styles.inputText}
        />

        {/* TODO: add tag selector */}
        <View style={{ alignSelf: 'center' }}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => addCard()}>
            <Text style={styles.buttonText}>ADD +</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    color: 'red',
    marginBottom: 20
  }
});
