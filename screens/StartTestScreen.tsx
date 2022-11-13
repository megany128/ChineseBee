import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input, CheckBox } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackScreenProps } from '../types';
import DropDownPicker from 'react-native-dropdown-picker';
import { push, ref, set, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export default function StartTestScreen({ navigation }: RootStackScreenProps<'StartTestScreen'>) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [tags, setTags] = useState([]);
  const [starredCards, setStarredCards] = useState(false);
  const [readingETOC, setReadingETOC] = useState(false);
  const [readingCTOE, setReadingCTOE] = useState(false);
  const [listeningETOC, setListeningETOC] = useState(false);
  const [listeningCTOE, setListeningCTOE] = useState(false);
  const [typingETOC, setTypingETOC] = useState(false);
  const [handwritingETOC, setHandwritingETOC] = useState(false);

  // variations of question numbers the user can choose
  const [questionNumberOptions, setQuestionNumberOptions] = useState([
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '15', value: '15' },
    { label: '20', value: '20' },
    { label: '25', value: '25' },
    { label: '30', value: '30' },
  ]);

  const [tagOptions, setTagOptions]: any = useState([]);

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/tags'), async (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let tags = { ...data };

      let tagOptionsTemp: any = Object.keys(tags);
      for (let tag = 0; tag < tagOptionsTemp.length; tag++) {
        tagOptionsTemp[tag] = { label: tagOptionsTemp[tag], value: tagOptionsTemp[tag] };
      }

      setTagOptions(tagOptionsTemp);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>START TEST</Text>
      </View>
      <View style={{ marginTop: 20, flex: 1 }}>
        <DropDownPicker
          open={dropdown1Open}
          value={numberOfQuestions}
          items={questionNumberOptions}
          setOpen={setDropdown1Open}
          setValue={setNumberOfQuestions}
          setItems={setQuestionNumberOptions}
          placeholder="Number of questions"
          style={styles.inputStyle}
          containerStyle={styles.control}
          textStyle={styles.inputText}
          dropDownContainerStyle={styles.dropdownStyle}
          placeholderStyle={{
            fontWeight: '400',
            color: '#C4C4C4',
          }}
          zIndex={3000}
          zIndexInverse={1000}
        />

        <DropDownPicker
          open={dropdown2Open}
          searchable={true}
          value={tags}
          items={tagOptions}
          setOpen={setDropdown2Open}
          setValue={setTags}
          setItems={setTagOptions}
          placeholder="Tags (Optional)"
          style={styles.inputStyle}
          containerStyle={styles.control}
          textStyle={styles.inputText}
          dropDownContainerStyle={styles.dropdownStyle}
          placeholderStyle={{
            fontWeight: '400',
            color: '#C4C4C4',
          }}
          zIndex={2000}
          zIndexInverse={2000}
          itemSeparatorStyle={{ borderColor: 'red' }}
          multiple={true}
          mode="BADGE"
          badgeDotColors={['#FFCB44', '#FEB1C3', '#94BAF4']}
          badgeColors={['#F1F1F1']}
          searchPlaceholder="Search tags..."
          searchContainerStyle={{
            borderBottomColor: '#C4C4C4',
          }}
          searchPlaceholderTextColor="#C4C4C4"
          searchTextInputStyle={{
            borderRadius: 20,
            borderColor: '#C4C4C4',
          }}
          badgeStyle={{
            borderRadius: 20,
          }}
        />

        <CheckBox
          title="Starred cards only"
          checked={starredCards}
          containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
          textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
          checkedColor="#C4C4C4"
          onPress={() => setStarredCards(!starredCards)}
        />

        <Text style={styles.header2}>Question Types</Text>

        <View style={{ justifyContent: 'space-evenly' }}>
          <CheckBox
            title="Reading (English → Chinese)"
            checked={readingETOC}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setReadingETOC(!readingETOC)}
          />

          <CheckBox
            title="Reading (Chinese → English)"
            checked={readingCTOE}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setReadingCTOE(!readingCTOE)}
          />

          <CheckBox
            title="Listening (English → Chinese)"
            checked={listeningETOC}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setListeningETOC(!listeningETOC)}
          />

          <CheckBox
            title="Listening (Chinese → English)"
            checked={listeningCTOE}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setListeningCTOE(!listeningCTOE)}
          />

          <CheckBox
            title="Typing (English → Chinese)"
            checked={typingETOC}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setTypingETOC(!typingETOC)}
          />

          <CheckBox
            title="Handwriting (English → Chinese)"
            checked={handwritingETOC}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setHandwritingETOC(!handwritingETOC)}
          />
        </View>

        <View style={{ alignSelf: 'center' }}>
          <TouchableOpacity style={styles.button} onPress={() => console.log('click')}>
            <Text style={styles.buttonText}>LET'S GO! →</Text>
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
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 20,
  },
  header2: {
    color: '#FFCB44',
    marginLeft: 30,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
  },
  navigation: {
    marginLeft: 20,
    marginTop: 20,
    flexDirection: 'row',
  },
  control: {
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  inputText: {
    marginHorizontal: 10,
  },
  inputStyle: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    height: 50,
    width: 360,
    alignSelf: 'center',
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    width: 360,
    alignSelf: 'center',
  },
  button: {
    borderRadius: 30,
    width: 140,
    height: 50,
    backgroundColor: '#FFCB44',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    alignSelf: 'center',
    fontWeight: '800',
  },
});
