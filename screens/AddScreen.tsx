import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackScreenProps } from '../types';
import { push, ref, limitToLast, query, onValue, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import moment from 'moment';
import Modal from 'react-native-modal';
import Icon2 from 'react-native-vector-icons/Entypo';
import DropDownPicker from 'react-native-dropdown-picker';

moment().format();

export default function AddScreen({ navigation, route }: RootStackScreenProps<'AddScreen'>) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();
  var hanzi = require('hanzi');

  const [modalVisible, setModalVisible] = useState(false);

  const [tagOptions, setTagOptions]: any = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [english, setEnglish]: any = useState('');
  const [chinese, setChinese]: any = useState('');
  const [tag, setTag]: any = useState(route.params);

  const [error, setError] = useState(String);

  // TODO: move this to later
  useEffect(() => {
    hanzi.start();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => setModalVisible(false), 700);
    }
  });

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
    } else {
      setError('');
      console.log(english + ' / ' + chinese);

      // adds a card to the database
      push(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), {
        english: english,
        chinese: chinese,
        tag: tag,
        starred: false,
        masteryLevel: 0,
        createdAt: moment().valueOf(),
        timesReviewed: 0,
      });

      // adds the card's key as a field
      const key = getKey();
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + key), {
        key,
      });

      // resets the text inputs
      setEnglish('')
      setChinese('')
      setTag(route.params ? route.params : '')

      setModalVisible(true);
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
          placeholder="Chinese"
          containerStyle={styles.control}
          value={chinese}
          onChangeText={(text) => setChinese(text)}
          autoCompleteType=""
          style={styles.inputText}
          // TODO: allow user to choose from list of premade definitions
          // onBlur={() =>
          //   setValue({...value, english: hanzi.definitionLookup(chinese)[0].definition})
          // }
        />

        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="English"
          containerStyle={styles.control}
          value={english}
          onChangeText={(text) => setEnglish(text)}
          autoCompleteType=""
          style={styles.inputText}
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

        {/* TODO: add tag selector */}
        <View style={{ alignSelf: 'center' }}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => addCard()}>
            <Text style={styles.buttonText}>ADD +</Text>
          </TouchableOpacity>
        </View>

        <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} style={{ margin: 0 }}>
          <View style={styles.modalView}>
            <View
              style={{
                borderRadius: 100,
                backgroundColor: 'white',
                width: 65,
                height: 65,
                marginLeft: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon2 name="check" size={35} color="#FFCB44" />
            </View>
            <Text
              style={{ color: 'white', fontWeight: '600', fontSize: 18, textAlignVertical: 'center', marginLeft: 20 }}
            >
              Card added!
            </Text>
          </View>
        </Modal>
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
    marginVertical: 20,
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
