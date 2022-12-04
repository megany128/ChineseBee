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
import { ref, onValue, update } from 'firebase/database';
import { db } from '../config/firebase';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import isChinese from 'is-chinese';

moment().format();

// allows student to edit card
export default function EditScreen({ route, navigation }: any) {
  const auth = getAuth();

  const card: any = route.params;

  const [english, setEnglish]: any = useState(card.english);
  const [chinese, setChinese]: any = useState(card.chinese);
  const [tag, setTag]: any = useState(card.tag ? card.tag : null);
  const [idiom, setIdiom]: any = useState(card.idiom);

  const [tagOptions, setTagOptions]: any = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [idiomOptions, setIdiomOptions]: any = useState([
    {
      label: 'Idiom',
      value: true,
    },
    {
      label: 'Phrase/Word',
      value: false,
    },
  ]);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);

  const [error, setError] = useState(String);

  // sets tag options based on the current user's existing tags
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
    } else if (!isChinese(chinese)) {
      setError('Please make sure the Chinese definition only contains Chinese characters');
    } else if (idiom === '') {
      setError('Please indicate if the Card is an idiom or a phrase/word');
    } else {
      setError('');
      console.log(english + ' / ' + chinese);

      // updates card in database
      update(ref(db, '/students/' + auth.currentUser?.uid + '/cards/' + card.key), {
        english: english,
        chinese: chinese,
        tag: tag,
        idiom: idiom,
      });

      card.english = english;
      card.chinese = chinese;
      card.tag = tag;
      card.idiom = idiom;

      console.log('idiom is', idiom);
      console.log('tag is', tag);

      navigation.pop(1);
      navigation.navigate('CardInfoScreen', { card: card, myCard: true });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        {/* navigation section*/}
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={40} />
          </TouchableOpacity>
          <Text style={styles.header}>EDIT CARD</Text>
        </View>

        <View style={{ marginTop: 20, flex: 1 }}>
          {/* chinese meaning input*/}
          <Input
            inputContainerStyle={styles.inputStyle}
            placeholder="Chinese"
            containerStyle={styles.control}
            value={chinese}
            onChangeText={(text) => setChinese(text)}
            autoCompleteType=""
            style={styles.inputText}
          />

          {/* english meaning input*/}
          <Input
            inputContainerStyle={styles.inputStyle}
            placeholder="English"
            containerStyle={styles.control}
            value={english}
            onChangeText={(text) => setEnglish(text)}
            autoCompleteType=""
            style={styles.inputText}
          />

          {/* dropdown picker for idiom or phrase/word */}
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

          {/* dropdown picker for tag */}
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

          {/* save changes */}
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
    marginTop: 20,
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
