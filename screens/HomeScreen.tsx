import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Text, View } from '../components/Themed';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import { RootTabScreenProps } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { db } from '../config/firebase';
import { push, ref, set, onValue } from 'firebase/database';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  console.log('home screen test')
  
  const { user } = useAuthentication();
  const auth = getAuth();

  const [name, setName] = useState(String);

  useEffect(() => {
    return onValue(ref(db, '/students/' + auth.currentUser?.uid), (querySnapShot) => {
      let data = querySnapShot.val() || [];
      let name = { ...data };
      setName(name.name);
    });
  }, []);

  return (
    <LinearGradient colors={['rgba(255,203,68,0.3)', 'rgba(255,255,255,0)']} style={styles.container}>
      <SafeAreaView>
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
          <Text style={styles.greeting}>你好,</Text>
          <Text style={[styles.greeting, { color: '#FFCB44' }]}>{name}</Text>
          <Text style={styles.greeting}>!</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              backgroundColor: '#FFCB44',
              borderRadius: 50,
              marginHorizontal: 10,
            }}
            onPress={() => navigation.navigate('AddScreen')}
          >
            <Icon name="plus" size={60} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              backgroundColor: '#94BAF4',
              borderRadius: 50,
              marginHorizontal: 10,
            }}
            onPress={() => navigation.navigate('StartTestScreen')}
          >
            <Icon2 name="book-open" size={50} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              backgroundColor: '#FEB1C3',
              borderRadius: 50,
              marginHorizontal: 10,
            }}
          >
            <Icon2 name="clock" size={60} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={{ position: 'absolute', bottom: 30, backgroundColor: 'transparent' }}>
        <Button title="Sign Out" onPress={() => signOut(auth)} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    marginVertical: 20,
    marginLeft: 10,
  },
  quickActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
