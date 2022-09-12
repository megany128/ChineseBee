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
import * as Progress from 'react-native-progress';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {  
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
    <LinearGradient colors={['rgba(255,203,68,0.2)', 'rgba(255,255,255,0.3)']} style={styles.container}>
      <SafeAreaView>
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
          <Text style={styles.greeting}>你好,</Text>
          <Text style={[styles.greeting, { color: '#FFCB44' }]}>{name}</Text>
          <Text style={styles.greeting}>!</Text>
        </View>

        {/* TODO: customise */}
        <TouchableOpacity style={styles.todaysRevision}>
          <Text style={styles.revisionText}>今天的复习</Text>
          <Progress.Bar progress={0.3} height={10} width={310} color={'#FFE299'} borderWidth={0} unfilledColor={'white'} style={styles.progressBar}/>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'center' }}>
          <TouchableOpacity style={[styles.wordOfTheDay, { marginRight: 50 }]}>
            <Text style={styles.wordOfTheDayText}>中文</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.wordOfTheDay}>
            <Text style={styles.idiomOfTheDayText}>四脚{'\n'}朝天</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.stats}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', flexDirection: 'row'}}>
            <View style={{flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50}}>
              {/* TODO: customise */}
              <Text style={styles.cardsStudied}>20</Text>
              <Text style={{textAlign: 'center', fontWeight: '600'}}>cards{'\n'}studied</Text>
            </View>
            <View style={{flexDirection: 'column', backgroundColor: 'transparent', marginRight: 50}}>
              {/* TODO: customise */}
              <Text style={styles.minutesLearning}>10</Text>
              <Text style={{textAlign: 'center', fontWeight: '600'}}>minutes{'\n'}learning</Text>
            </View>
            <View style={{flexDirection: 'column', backgroundColor: 'transparent'}}>
              {/* TODO: customise */}
              <Text style={styles.streak}>5</Text>
              <Text style={{textAlign: 'center', fontWeight: '600'}}>day{'\n'}streak</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.quickActionsHeader}>QUICK ACTIONS</Text>
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
      {/* <View style={{ position: 'absolute', bottom: 30, backgroundColor: 'transparent' }}>
        <Button title="Sign Out" onPress={() => signOut(auth)} />
      </View> */}
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
  todaysRevision: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 0,
    backgroundColor: '#FFCB44'
  },
  wordOfTheDay: {
    flexDirection: 'column',
    width: 150,
    height: 150,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    
  },
  wordOfTheDayText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FEB1C3',
    textAlign: 'center'
  },
  idiomOfTheDayText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#94BAF4',
    textAlign: 'center'
  },
  revisionText: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    marginLeft: 20,
    marginTop: 20
  },
  progressBar: {
    marginLeft: 20,
    marginTop: 15
  },
  stats: {
    flexDirection: 'column',
    width: 350,
    height: 120,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 30,
    zIndex: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#C4C4C4'
  },
  cardsStudied: {
    color: '#FFCB44',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center'
  },
  minutesLearning: {
    color: '#94BAF4',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center'
  },
  streak: {
    color: '#FEB1C3',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center'
  },
  quickActionsHeader: {
    marginBottom: 30,
    fontWeight: '700',
    fontSize: 20
  }
});
