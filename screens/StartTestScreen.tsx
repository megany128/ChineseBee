import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input, CheckBox } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackScreenProps } from '../types';
import { Dropdown } from 'react-native-element-dropdown';

export default function StartTestScreen({ navigation }: RootStackScreenProps<'StartTestScreen'>) {
  // initialises current user & auth
  const { user } = useAuthentication();
  const auth = getAuth();

  const [value, setValue] = React.useState({
    numberOfQuestions: '',
    tag: '',
    starredCards: false,
    englishToChineseReading: false,
    chineseToEnglishReading: false,
    englishToChineseListening: false,
    chineseToEnglishListening: false,
  });

  // variations of question numbers the user can choose
  const questionNumbers = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '15', value: '15' },
    { label: '20', value: '20' },
    { label: '25', value: '25' },
    { label: '30', value: '30' },
  ];

  const [isFocus, setIsFocus] = React.useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return <Text style={[styles.dropdownLabel, isFocus && { color: 'blue' }]}>Dropdown label</Text>;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={40} />
        </TouchableOpacity>
        <Text style={styles.header}>START TEST</Text>
      </View>
      <View style={{ marginTop: 20, flex: 1 }}>
        <Dropdown
          style={[isFocus && { borderColor: 'blue' }]}
          // placeholderStyle={styles.placeholderStyle}
          // selectedTextStyle={styles.selectedTextStyle}
          // inputSearchStyle={styles.inputSearchStyle}
          // iconStyle={styles.iconStyle}
          data={questionNumbers}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Number of questions' : '...'}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setValue({
              numberOfQuestions: value.numberOfQuestions,
              tag: item.value,
              starredCards: value.starredCards,
              englishToChineseReading: value.englishToChineseReading,
              chineseToEnglishReading: value.chineseToEnglishReading,
              englishToChineseListening: value.englishToChineseListening,
              chineseToEnglishListening: value.chineseToEnglishListening,
            });
            setIsFocus(false);
          }}
        />
        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="Number of questions"
          containerStyle={styles.control}
          value={value.numberOfQuestions}
          onChangeText={(text) => setValue({ ...value, numberOfQuestions: text })}
          autoCompleteType=""
          style={styles.inputText}
        />
        <Input
          // TODO: add text detection: https://blog.logrocket.com/build-text-detector-react-native/
          inputContainerStyle={styles.inputStyle}
          placeholder="Deck"
          containerStyle={styles.control}
          value={value.tag}
          onChangeText={(text) => setValue({ ...value, tag: text })}
          autoCompleteType=""
          style={styles.inputText}
        />
        <CheckBox
          title="Starred cards only"
          checked={value.starredCards}
          containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30, width: 380 }}
          textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
          checkedColor="#C4C4C4"
          onPress={() =>
            setValue({
              numberOfQuestions: value.numberOfQuestions,
              tag: value.tag,
              starredCards: !value.starredCards,
              englishToChineseReading: value.englishToChineseReading,
              chineseToEnglishReading: value.chineseToEnglishReading,
              englishToChineseListening: value.englishToChineseListening,
              chineseToEnglishListening: value.chineseToEnglishListening,
            })
          }
        />

        <Text style={styles.header2}>Type of questions</Text>

        <View>
          <CheckBox
            title="English → Chinese (reading)"
            checked={value.englishToChineseReading}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30, width: 380 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() =>
              setValue({
                numberOfQuestions: value.numberOfQuestions,
                tag: value.tag,
                starredCards: value.starredCards,
                englishToChineseReading: !value.englishToChineseReading,
                chineseToEnglishReading: value.chineseToEnglishReading,
                englishToChineseListening: value.englishToChineseListening,
                chineseToEnglishListening: value.chineseToEnglishListening,
              })
            }
          />

          <CheckBox
            title="Chinese → English (reading)"
            checked={value.chineseToEnglishReading}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30, width: 380 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() =>
              setValue({
                numberOfQuestions: value.numberOfQuestions,
                tag: value.tag,
                starredCards: value.starredCards,
                englishToChineseReading: value.englishToChineseReading,
                chineseToEnglishReading: !value.chineseToEnglishReading,
                englishToChineseListening: value.englishToChineseListening,
                chineseToEnglishListening: value.chineseToEnglishListening,
              })
            }
          />

          <CheckBox
            title="English → Chinese (listening)"
            checked={value.englishToChineseListening}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30, width: 380 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() =>
              setValue({
                numberOfQuestions: value.numberOfQuestions,
                tag: value.tag,
                starredCards: value.starredCards,
                englishToChineseReading: value.englishToChineseReading,
                chineseToEnglishReading: value.chineseToEnglishReading,
                englishToChineseListening: !value.englishToChineseListening,
                chineseToEnglishListening: value.chineseToEnglishListening,
              })
            }
          />

          <CheckBox
            title="Chinese → English (listening)"
            checked={value.chineseToEnglishListening}
            containerStyle={{ backgroundColor: 'white', borderWidth: 0, marginLeft: 30, width: 380 }}
            textStyle={{ fontWeight: '400', color: '#C4C4C4' }}
            checkedColor="#C4C4C4"
            onPress={() =>
              setValue({
                numberOfQuestions: value.numberOfQuestions,
                tag: value.tag,
                starredCards: value.starredCards,
                englishToChineseReading: value.englishToChineseReading,
                chineseToEnglishReading: value.chineseToEnglishReading,
                englishToChineseListening: value.englishToChineseListening,
                chineseToEnglishListening: !value.chineseToEnglishListening,
              })
            }
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
    alignItems: 'flex-start',
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
    marginTop: 20,
    marginBottom: 10,
  },
  navigation: {
    marginLeft: 20,
    marginTop: 20,
    flexDirection: 'row',
  },
  control: {
    marginTop: 10,
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
  dropdownLabel: {},
});
