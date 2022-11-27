import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { StackScreenProps } from '@react-navigation/stack';
import { db } from '../config/firebase';
import { ref, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth();
const SignUpScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const [value, setValue] = React.useState({
    name: '',
    email: '',
    password: '',
    error: '',
  });

  const [userType, setUserType] = useState('student');

  const onFooterLinkPress = () => {
    navigation.navigate('SignInScreen');
  };

  async function signUp() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory',
      });
      return;
    }

    if (value.name === '') {
      setValue({
        ...value,
        error: 'Name is mandatory',
      });
      return;
    }

    if (userType === 'student') {
      AsyncStorage.setItem('userType', 'student');
      await createUserWithEmailAndPassword(auth, value.email.trim(), value.password.trim())
        .then(async (data) => {
          // TODO: use firebase for this instead of asyncstorage since progress should be carried over multiple devices
          AsyncStorage.setItem('dailyStudyProgress', '0');
          AsyncStorage.setItem('cardsStudied', '0');
          AsyncStorage.setItem('minutesLearning', '0');
          AsyncStorage.setItem('dayStreak', '0');
          await updateProfile(auth.currentUser!, {
            displayName: value.name.trim(),
          });
          set(ref(db, '/students/' + data.user.uid), {
            name: value.name.trim(),
            uid: data.user.uid,
            type: 'student',

            correctReadingETOC: 0,
            totalReadingETOC: 0,

            correctReadingCTOE: 0,
            totalReadingCTOE: 0,

            correctListeningCTOC: 0,
            totalListeningCTOC: 0,

            correctListeningCTOE: 0,
            totalListeningCTOE: 0,

            correctTypingETOC: 0,
            totalTypingETOC: 0,

            correctHandwritingETOC: 0,
            totalHandwritingETOC: 0,
          });
        })
        .catch((error) => {
          if (error.message.includes('email-already-in-use')) {
            setValue({
              ...value,
              error: 'Email already in use',
            });
          } else if (error.message.includes('weak-password')) {
            setValue({
              ...value,
              error: 'Password must be at least 6 characters',
            });
          } else if (error.message.includes('invalid-email')) {
            setValue({
              ...value,
              error: 'Please enter a valid email',
            });
          } else {
            setValue({
              ...value,
              error: error.message,
            });
            return;
          }
        });
    } else {
      AsyncStorage.setItem('userType', 'teacher');
      await createUserWithEmailAndPassword(auth, value.email.trim(), value.password.trim())
        .then(async (data) => {
          await updateProfile(auth.currentUser!, {
            displayName: value.name.trim(),
          });
          set(ref(db, '/teachers/' + data.user.uid), {
            name: value.name.trim(),
            uid: data.user.uid,
            type: 'teacher',
          });
        })
        .catch((error) => {
          if (error.message.includes('email-already-in-use')) {
            setValue({
              ...value,
              error: 'Email already in use',
            });
          } else if (error.message.includes('weak-password')) {
            setValue({
              ...value,
              error: 'Password must be at least 6 characters',
            });
          } else if (error.message.includes('invalid-email')) {
            setValue({
              ...value,
              error: 'Please enter a valid email',
            });
          } else {
            setValue({
              ...value,
              error: error.message,
            });
            return;
          }
        });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>sign up</Text>
          {value.error && <Text style={styles.error}>{value.error}</Text>}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: 320,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setUserType('student')}
              style={userType === 'student' ? styles.selectedButton : styles.unselectedButton}
            >
              <Text style={userType === 'student' ? styles.selectedText : styles.unselectedText}>student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUserType('teacher')}
              style={userType === 'teacher' ? styles.selectedButton : styles.unselectedButton}
            >
              <Text style={userType === 'teacher' ? styles.selectedText : styles.unselectedText}>teacher</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="name"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, name: text })}
            value={value.name}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="email address"
            placeholderTextColor="#C4C4C4"
            onChangeText={(text) => setValue({ ...value, email: text })}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value.email}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#C4C4C4"
            secureTextEntry
            placeholder="password"
            onChangeText={(text) => setValue({ ...value, password: text })}
            value={value.password}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={() => signUp()}>
            <Text style={styles.buttonTitle}>SIGN UP →</Text>
          </TouchableOpacity>
          <View style={styles.footerView}>
            <Text style={styles.footerText}>don't have an account? </Text>
            <TouchableOpacity onPress={onFooterLinkPress}>
              <Text style={styles.footerLink}>log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    marginBottom: 20,
    fontSize: 48,
    color: '#FFCB44',
    fontWeight: '500',
  },
  input: {
    height: 48,
    width: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  button: {
    backgroundColor: '#94BAF4',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    width: 120,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerView: {
    alignItems: 'center',
    marginTop: 30,
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 16,
    color: '#C4C4C4',
  },
  footerLink: {
    color: '#94BAF4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#D54826FF',
    marginLeft: 30,
    marginBottom: 20,
  },
  selectedButton: {
    backgroundColor: '#FEB1C3',
    width: 150,
    paddingVertical: 10,
    borderRadius: 20,
  },
  unselectedButton: {
    backgroundColor: 'transparent',
    width: 150,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEB1C3',
  },
  selectedText: {
    color: 'white',
    textAlign: 'center',
  },
  unselectedText: {
    color: '#FEB1C3',
    textAlign: 'center',
  },
});

export default SignUpScreen;
