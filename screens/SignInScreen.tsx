import React from 'react';
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
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { StackScreenProps } from '@react-navigation/stack';

const auth = getAuth();

// sign in screen
const SignInScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const [value, setValue] = React.useState({
    email: '',
    password: '',
    error: '',
  });

  // navigates to sign up screen
  const onFooterLinkPress = () => {
    navigation.navigate('SignUpScreen');
  };

  // resets password
  const handlePasswordReset = (email: string) => {
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(function (user) {
          Alert.alert('Check your email for the password reset link!', 'If not in your inbox it may be in spam.');
        })
        .catch(function (e) {
          console.log(e);
        });
    } else {
      alert('Please enter a valid email to reset your password!');
      setValue({ ...value, error: 'Please enter a valid email.' });
    }
  };

  // signs in user
  async function signIn() {
    if (value.email === '' || value.password === '') {
      setValue({
        ...value,
        error: 'Email and password are mandatory.',
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, value.email, value.password);
    } catch (error: any) {
      // error handling
      console.log(error.message);
      if (error.message.includes('wrong-password')) {
        setValue({
          ...value,
          error: 'Wrong password',
        });
      } else if (error.message.includes('too-many-requests')) {
        setValue({
          ...value,
          error: 'Please wait a while before trying again',
        });
      } else if (error.message.includes('user-not-found')) {
        setValue({
          ...value,
          error: 'Account does not exist. Please make sure your email address is correct',
        });
      } else {
        setValue({
          ...value,
          error: error.message,
        });
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>log in</Text>
          {value.error && <Text style={styles.error}>{value.error}</Text>}

          {/* email input */}
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

          {/* password input */}
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

          <TouchableOpacity style={styles.button} onPress={() => signIn()}>
            <Text style={styles.buttonTitle}>LOG IN →</Text>
          </TouchableOpacity>

          <View style={styles.footerView}>
            <Text style={styles.footerText}>don't have an account? </Text>
            <TouchableOpacity onPress={onFooterLinkPress}>
              <Text style={styles.footerLink}>sign up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => handlePasswordReset(value.email)}>
            <Text style={{ fontSize: 16, color: '#94BAF4', marginTop: 30, fontWeight: '600', fontStyle: 'italic' }}>
              reset password
            </Text>
          </TouchableOpacity>
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
    backgroundColor: '#FEB1C3',
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
    color: '#FEB1C3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#D54826FF',
    marginBottom: 20,
  },
});

export default SignInScreen;
