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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { push, ref, limitToLast, query, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';
import DropDownPicker from 'react-native-dropdown-picker';
import isChinese from 'is-chinese';
import Toast from 'react-native-toast-message';

moment().format();

export default function AddScreen({ route, navigation }: any) {
  // initialises current user & auth
  const auth = getAuth();

  const [tagOptions, setTagOptions]: any = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [idiomOptions, setIdiomOptions]: any = useState([]);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);

  const [english, setEnglish]: any = useState('');
  const [chinese, setChinese]: any = useState('');
  const [idiom, setIdiom]: any = useState('');

  const { tagParam } = route.params;
  const [tag, setTag]: any = useState(tagParam && tagParam.length > 0 ? tagParam : null);

  const [error, setError] = useState(String);

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/tags'), async (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let tags = { ...data };

      let tagOptionsTemp1: any = Object.keys(tags);
      let tagOptionsTemp2 = [];
      for (let tag = 1; tag < tagOptionsTemp1.length + 1; tag++) {
        tagOptionsTemp2[tag] = { label: tagOptionsTemp1[tag - 1], value: tagOptionsTemp1[tag - 1] };
      }
      tagOptionsTemp2[0] = { label: '', value: '' };
      setTagOptions(tagOptionsTemp2);

      setIdiomOptions([
        {
          label: 'Idiom',
          value: true,
        },
        {
          label: 'Phrase/Word',
          value: false,
        },
      ]);
    });
  }, []);

  // gets the key of the last card created
  const getKey = () => {
    var cardRef = query(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), limitToLast(1));
    let key = '';
    onValue(cardRef, (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let card = { ...data };
      key = Object.keys(card)[0];
    });
    return key;
  };

  // adds a card with data from the text inputs
  const addCard = () => {
    console.log('click');

    // error checking
    if (english === '') {
      setError('English definition missing!');
    } else if (chinese === '') {
      setError('Chinese definition missing!');
    } else if (!isChinese(chinese)) {
      setError('Please make sure the Chinese definition only contains Chinese characters');
    } else if (idiom === '') {
      setError('Please indicate if the Card is an idiom or a phrase/word');
    } else {
      setError('');
      console.log(english + ' / ' + chinese);

      // adds a card to the database
      push(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), {
        english: english,
        chinese: chinese,
        tag: tag,
        starred: false,
        createdAt: moment().valueOf(),
        timesCorrect: 0,
        timesReviewed: 0,
        dueDate: 0,
        idiom: idiom,
      });

      // TODO: (later) add to IOTDCards and WOTDCards

      // adds the card's key as a field
      const key = getKey();
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + key), {
        key,
      });

      // resets the text inputs
      setEnglish('');
      setChinese('');
      setTag(route.params ? route.params : '');
      setIdiom(null);

      Keyboard.dismiss();

      Toast.show({
        type: 'addToast',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>ADD CARD</Text>
      </View>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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

          <DropDownPicker
            open={dropdownOpen2}
            value={idiom}
            items={idiomOptions}
            setOpen={setDropdownOpen2}
            setValue={setIdiom}
            setItems={setIdiomOptions}
            placeholder="Idiom or phrase/word?"
            style={[styles.inputStyle, { width: 360, marginLeft: 10 }]}
            containerStyle={[styles.control, { marginHorizontal: 20 }]}
            textStyle={styles.inputText}
            dropDownContainerStyle={styles.dropdownStyle}
            placeholderStyle={{
              fontWeight: '400',
              color: '#C4C4C4',
            }}
            zIndex={2000}
            zIndexInverse={2000}
            itemSeparatorStyle={{ borderColor: 'red' }}
          />

          <DropDownPicker
            open={dropdownOpen}
            searchable={true}
            value={tag}
            items={tagOptions}
            setOpen={setDropdownOpen}
            setValue={setTag}
            setItems={setTagOptions}
            placeholder="Tags (Optional)"
            style={[styles.inputStyle, { width: 360, marginLeft: 10, marginTop: 20 }]}
            containerStyle={[styles.control, { marginHorizontal: 20 }]}
            textStyle={styles.inputText}
            dropDownContainerStyle={[styles.dropdownStyle, { marginTop: 20 }]}
            placeholderStyle={{
              fontWeight: '400',
              color: '#C4C4C4',
            }}
            zIndex={1000}
            zIndexInverse={1000}
            itemSeparatorStyle={{ borderColor: 'red' }}
            searchPlaceholder="Search tags or type to add a new tag..."
            searchContainerStyle={{
              borderBottomColor: '#C4C4C4',
            }}
            searchPlaceholderTextColor="#C4C4C4"
            searchTextInputStyle={{
              borderRadius: 20,
              borderColor: '#C4C4C4',
            }}
            addCustomItem={true}
          />

          <View style={{ alignSelf: 'center', marginTop: 30 }}>
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.button} onPress={() => addCard()}>
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
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    width: 360,
    alignSelf: 'center',
  },
});
