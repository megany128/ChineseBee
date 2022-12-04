import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Text, View, Alert } from 'react-native';
import { getAuth, EmailAuthProvider, deleteUser, reauthenticateWithCredential } from 'firebase/auth';
import { db } from '../config/firebase';
import { ref, remove } from 'firebase/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

// allows user to verify their account before deletion
export default function VerifyAccountScreen({ navigation }: any) {
  const auth = getAuth();
  const [error, setError] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

  // verifies user's email on render
  useEffect(() => {
    setVerifyEmail(auth?.currentUser?.email!);
  }, []);

  // verifies account
  const verifyAccount = () => {
    const provider = EmailAuthProvider;
    const authCredential = provider.credential(verifyEmail, verifyPassword);
    return authCredential;
  };

  // deletes account
  const deleteAccount = async () => {
    // TODO: (later) delete from class list as well
    Alert.alert('Are you sure?', 'This is irreversible!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete Account',
        onPress: async () => {
          try {
            const authCredential = await verifyAccount();

            try {
              await reauthenticateWithCredential(auth?.currentUser!, authCredential);
              try {
                remove(ref(db, '/students/' + auth?.currentUser?.uid));
                remove(ref(db, '/teachers/' + auth?.currentUser?.uid));
                remove(ref(db, '/userRoles/' + auth?.currentUser?.uid));
                await deleteUser(auth?.currentUser!)
                  .then(() => {
                    console.log('Successfully deleted user');
                    Alert.alert('Your account has been deleted');
                  })
                  .catch((error) => {
                    setError(error.message);
                    console.log('error:', error.message);
                  });
              } catch (error: any) {
                // error handling
                if (error.message.includes('wrong-password')) {
                  setError('Wrong password');
                } else if (error.message.includes('too-many-requests')) {
                  setError('Please wait a while before trying again');
                } else if (error.message.includes('user-mismatch')) {
                  setError('Please make sure your email address is correct');
                } else if (error.message.includes('internal-error')) {
                  setError('Please enter both your email and password');
                } else {
                  setError(error.message);
                }
                console.log('error:', error.message);
              }
            } catch (error: any) {
              // error handling
              if (error.message.includes('wrong-password')) {
                setError('Wrong password');
              } else if (error.message.includes('too-many-requests')) {
                setError('Please wait a while before trying again');
              } else if (error.message.includes('user-mismatch')) {
                setError('Please make sure your email address is correct');
              } else if (error.message.includes('internal-error')) {
                setError('Please enter both your email and password');
              } else {
                setError(error.message);
              }
              console.log('error:', error.message);
            }
          } catch (error: any) {
            // error handling
            if (error.message.includes('wrong-password')) {
              setError('Wrong password');
            } else if (error.message.includes('too-many-requests')) {
              setError('Please wait a while before trying again');
            } else if (error.message.includes('user-mismatch')) {
              setError('Please make sure your email address is correct');
            } else if (error.message.includes('internal-error')) {
              setError('Please enter both your email and password');
            } else {
              setError(error.message);
            }
            console.log('error:', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={40} />
          </TouchableOpacity>
          <Text style={styles.header}>DELETE ACCOUNT</Text>
        </View>

        <Text style={{ color: '#2A3242', fontWeight: '500', marginTop: 20, marginLeft: 10 }}>
          Please sign in again to delete your account
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
        {/* email input */}
        <TextInput
          style={[styles.input, { width: '90%', marginLeft: 10, marginTop: 20 }]}
          placeholder="email address"
          placeholderTextColor="#FABF48"
          onChangeText={(text) => setVerifyEmail(text)}
          value={verifyEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          editable={false}
        />

        {/* password input */}
        <TextInput
          style={[styles.input, { width: '90%', marginLeft: 10, marginTop: 20 }]}
          placeholderTextColor="#C4C4C4"
          secureTextEntry
          placeholder="password"
          onChangeText={(text) => setVerifyPassword(text)}
          value={verifyPassword}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />

        {/* deletes account */}
        <TouchableOpacity
          style={{
            backgroundColor: '#D54826FF',
            height: 48,
            width: 220,
            borderRadius: 20,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}
          onPress={() => deleteAccount()}
        >
          <Text style={styles.buttonTitle}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
    marginLeft: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 20,
  },
  input: {
    height: 48,
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
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#D54826FF',
    marginLeft: 10,
    marginTop: 20,
  },
  navigation: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
