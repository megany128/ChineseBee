import React, { useEffect } from 'react';
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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>sign up</Text>
          {value.error && <Text style={styles.error}>{value.error}</Text>}
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
});

export default SignUpScreen;
