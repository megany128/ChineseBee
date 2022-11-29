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
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';

moment().format();

export default function EditScreen({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();
  var hanzi = require('hanzi');

  const [modalVisible, setModalVisible] = useState(false);

  const card: any = route.params;

  const [english, setEnglish]: any = useState(card.english);
  const [chinese, setChinese]: any = useState(card.chinese);
  const [tag, setTag]: any = useState(card.tag);

  const [tagOptions, setTagOptions]: any = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [error, setError] = useState(String);

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

  // adds a card with data from the text inputs
  const updateCard = () => {
    console.log('click');

    // error checking
    if (english === '') {
      setError('English definition missing!');
    } else if (chinese === '') {
      setError('Chinese definition missing!');
    } else {
      setError('');
      console.log(english + ' / ' + chinese);

      // updates card in database
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key), {
        english: english,
        chinese: chinese,
        tag: tag,
      });

      card.english = english;
      card.chinese = chinese;
      card.tag = tag;

      navigation.pop(1);
      navigation.navigate('CardInfoScreen', {card: card, myCard: true});
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
