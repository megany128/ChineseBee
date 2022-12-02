import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { CheckBox } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export default function StartTestScreen({ route, navigation }: any) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [tags, setTags]: any = useState([]);
  const [starredCards, setStarredCards] = useState(false);
  const [readingETOC, setReadingETOC] = useState(false);
  const [readingCTOE, setReadingCTOE] = useState(false);
  const [listeningCTOC, setListeningCTOC] = useState(false);
  const [listeningCTOE, setListeningCTOE] = useState(false);
  const [typingETOC, setTypingETOC] = useState(false);
  const [handwritingETOC, setHandwritingETOC] = useState(false);

  const [error, setError] = useState('');

  const [allCards, setAllCards]: any = useState([]);
  const [testCards, setTestCards]: any = useState([]);

  // variations of question numbers the user can choose
  const [questionNumberOptions, setQuestionNumberOptions] = useState([
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '15', value: '15' },
    { label: '20', value: '20' },
    { label: '25', value: '25' },
    { label: '30', value: '30' },
  ]);

  // TODO: (later) add option for mastery (mastered, learning, struggling)
  const [tagOptions, setTagOptions]: any = useState([]);

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

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let cardItems = { ...data };
      setAllCards(Object.values(cardItems));
    });
  }, []);

  // shuffles cards in an array through recursion
  const shuffleCards: any = (array: []) => {
    let shuffledArray: [] = [];
    if (!array.length) return shuffledArray;

    let index = Math.floor(Math.random() * array.length);
    shuffledArray.push(array[index]);
    let slicedArray = array.slice(0, index).concat(array.slice(index + 1));

    return shuffledArray.concat(shuffleCards(slicedArray));
  };

  const generateTest = () => {
    console.log('\nGENERATING TEST');
    console.log('===============');
    console.log('number of questions:', numberOfQuestions);
    console.log('starred cards only:', starredCards);
    console.log('tags:', tags.length > 0 ? tags : 'none');
    if (numberOfQuestions === '') {
      setError('Please specify number of questions');
    } else if (!readingETOC && !readingCTOE && !listeningCTOC && !listeningCTOE && !typingETOC && !handwritingETOC) {
      setError('Please select at least one question type');
    } else {
      let testCardArray = starredCards
        ? allCards.filter((obj: { starred: boolean }) => {
            return obj.starred === true;
          })
        : allCards;

      console.log('after star filter:', testCardArray.length);

      testCardArray =
        tags.length > 0
          ? testCardArray.filter((obj: { tag: string }) => {
              return tags.includes(obj.tag);
            })
          : testCardArray;

      console.log('after tags:', testCardArray.length);

      testCardArray = shuffleCards(testCardArray).slice(0, numberOfQuestions);
      console.log('after randomising + selecting ' + numberOfQuestions + ' cards: ' + testCardArray.length);

      console.log(' ');
      for (let i = 0; i < testCardArray.length; i++) {
        console.log('card' + (i + 1) + ':');
        console.log(
          testCardArray[i].chinese +
            ' / ' +
            testCardArray[i].english +
            ' / ' +
            (testCardArray[i].starred ? 'starred' : 'not starred') +
            (testCardArray[i].tag ? ' / ' + testCardArray[i].tag : '')
        );
      }
      navigation.navigate('TestScreen', {
        allCards: allCards,
        cards: testCardArray,
        readingETOC: readingETOC,
        readingCTOE: readingCTOE,
        listeningCTOC: listeningCTOC,
        listeningCTOE: listeningCTOE,
        typingETOC: typingETOC,
        handwritingETOC: handwritingETOC,
      });
    }
  };

  useEffect(() => {
    const willFocusSubscription = navigation.addListener('focus', async () => {
      onValue(ref(db, '/students/' + auth.currentUser?.uid), async (querySnapShot) => {
        let data = querySnapShot.val() || {};
        let user = { ...data };

        if (!user.cards || Object.values(user.cards).length < 5) {
          Alert.alert('Wait a moment!', "You don't have enough cards! Add at least 5 cards to your vocab.", [
            {
              text: 'Add cards',
              onPress: () => {
                navigation.navigate('Cards');
              },
            },
          ]);
        }
      });
    });

    return willFocusSubscription;
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
          multiple={true}
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
            title="Listening (Chinese → Chinese)"
            checked={listeningCTOC}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() => setListeningCTOC(!listeningCTOC)}
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

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={{ alignSelf: 'center' }}>
          <TouchableOpacity style={styles.button} onPress={() => generateTest()}>
            <Text style={styles.buttonText}>START TEST! →</Text>
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
  error: {
    color: '#D54826FF',
    marginVertical: 20,
    marginLeft: 30,
  },
});
