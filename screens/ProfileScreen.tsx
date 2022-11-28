import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { getAuth, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { onValue, ref, update, set } from 'firebase/database';
import { db } from '../config/firebase';
import { Text, View } from '../components/Themed';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }: any) {
  const auth = getAuth();
  const userType = useRef('');

  const [value, setValue] = React.useState({
    email: '',
    error: '',
    name: '',
    classCode: '',
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    onValue(ref(db, '/userRoles'), async (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let userRoles = { ...data };

      userType.current = userRoles[auth.currentUser!.uid];

      if (userRoles[auth.currentUser!.uid] === 'student') {
        return await onValue(ref(db, '/students/' + auth?.currentUser?.uid), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let userData = { ...data };

          setValue({
            ...value,
            name: userData.name,
            email: auth?.currentUser?.email!,
            classCode: userData.classCode,
          });
        });
      } else {
        return await onValue(ref(db, '/teachers/' + auth?.currentUser?.uid), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let userData = { ...data };

          setValue({
            ...value,
            name: userData.name,
            email: auth?.currentUser?.email!,
          });
        });
      }
    });
  };

  const handlePasswordReset = (email: string) => {
    sendPasswordResetEmail(auth, email)
      .then(function (user) {
        Alert.alert('Check your email for the password reset link!', 'If not in your inbox it may be in spam.');
      })
      .catch(function (e) {
        console.log(e);
      });
  };

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView style={styles.container} horizontal={false}>
        <View style={styles.container}>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={40} />
            </TouchableOpacity>
            <Text style={styles.header}>PROFILE</Text>
          </View>
          <View style={{ backgroundColor: 'transparent' }}>
            <View style={{ backgroundColor: 'transparent' }}>
              {value.error && <Text style={styles.error}>{value.error}</Text>}
              <Text style={{ marginLeft: 30, marginBottom: 10, fontWeight: '700', color: '#2A3242', marginTop: 30 }}>
                Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="name"
                placeholderTextColor="#C4C4C4"
                onChangeText={(text) => setValue({ ...value, name: text })}
                value={value.name}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                defaultValue={auth?.currentUser?.displayName!}
                onSubmitEditing={({ nativeEvent }) => {
                  console.log(nativeEvent.text);
                  if (nativeEvent.text === '') {
                    setValue({
                      ...value,
                      error: 'Name is mandatory',
                    });
                    return;
                  }
                  try {
                    updateProfile(auth.currentUser!, { displayName: nativeEvent.text.trim() });
                    {
                      userType.current === 'student'
                        ? update(ref(db, '/students/' + auth.currentUser?.uid), {
                            name: nativeEvent.text.trim(),
                          })
                        : update(ref(db, '/teachers/' + auth.currentUser?.uid), {
                            name: nativeEvent.text.trim(),
                          });
                    }

                    getData();
                  } catch (error: any) {
                    setValue({
                      ...value,
                      error: error.message,
                    });
                  }
                }}
                onBlur={({ nativeEvent }) => {
                  console.log(nativeEvent.text);
                  if (nativeEvent.text === '') {
                    setValue({
                      ...value,
                      error: 'Name is mandatory',
                    });
                    return;
                  }
                  try {
                    updateProfile(auth.currentUser!, { displayName: nativeEvent.text.trim() });
                    {
                      userType.current === 'student'
                        ? update(ref(db, '/students/' + auth.currentUser?.uid), {
                            name: nativeEvent.text.trim(),
                          })
                        : update(ref(db, '/teachers/' + auth.currentUser?.uid), {
                            name: nativeEvent.text.trim(),
                          });
                    }
                    getData();
                  } catch (error: any) {
                    setValue({
                      ...value,
                      error: error.message,
                    });
                  }
                }}
              />
              <View
                style={{
                  marginVertical: 10,
                  marginHorizontal: 30,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontWeight: '700', color: '#2A3242' }}>Email</Text>
                <TouchableOpacity onPress={() => handlePasswordReset(value.email)}>
                  <Text style={{ color: '#FABF48', fontWeight: '600', fontStyle: 'italic' }}>Reset password</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="email"
                placeholderTextColor="#C4C4C4"
                onChangeText={(text) => setValue({ ...value, email: text })}
                value={value.email}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                defaultValue={auth?.currentUser?.email!}
                editable={false}
              />
            </View>
            {userType.current === 'student' && (
              <View>
                <Text style={{ marginLeft: 30, marginBottom: 10, fontWeight: '700', color: '#2A3242', marginTop: 10 }}>
                  Class Code
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="class code"
                  placeholderTextColor="#C4C4C4"
                  onChangeText={(text) => setValue({ ...value, classCode: text })}
                  value={value.classCode}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  defaultValue={auth?.currentUser?.displayName!}
                  onSubmitEditing={({ nativeEvent }) => {
                    console.log(nativeEvent.text);
                    try {
                      update(ref(db, '/students/' + auth.currentUser?.uid), {
                        classCode: nativeEvent.text.trim(),
                      });
                      getData();
                    } catch (error: any) {
                      setValue({
                        ...value,
                        error: error.message,
                      });
                    }
                  }}
                  onBlur={({ nativeEvent }) => {
                    console.log(nativeEvent.text);
                    try {
                      update(ref(db, '/students/' + auth.currentUser?.uid), {
                        classCode: nativeEvent.text.trim(),
                      });
                      getData();
                    } catch (error: any) {
                      setValue({
                        ...value,
                        error: error.message,
                      });
                    }
                  }}
                />
              </View>
            )}
            <View
              style={{
                marginLeft: 30,
                marginRight: 30,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: 'black',
                  height: 48,
                  width: '38%',
                  borderRadius: 20,
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => signOut(auth)}
              >
                <Text style={styles.buttonTitle}>SIGN OUT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#D54826FF',
                  height: 48,
                  width: '55%',
                  borderRadius: 20,
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
                onPress={() =>
                  navigation.navigate('VerifyAccountScreen', {
                    type: 'delete account',
                  })
                }
              >
                <Text style={styles.buttonTitle}>DELETE ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
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
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  button: {
    backgroundColor: '#2A3242',
    marginHorizontal: 30,
    marginTop: 20,
    height: 48,
    width: 140,
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
  error: {
    color: '#D54826FF',
    marginLeft: 30,
    marginTop: 20,
  },
});
