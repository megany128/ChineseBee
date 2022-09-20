import { RootStackScreenProps } from '../types';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { Input } from 'react-native-elements';
import { getAuth, signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { push, ref, limitToLast, query, onValue, update } from 'firebase/database';
import { db, storage } from '../config/firebase';
import moment from 'moment';
import * as Progress from 'react-native-progress';

var pinyin = require('chinese-to-pinyin');

moment().format(); 

export default function DailyStudyScreen({ navigation }: RootStackScreenProps<'DailyStudyScreen'>)
{
    // initialises current user & auth
    const { user } = useAuthentication();
    const auth = getAuth();

    const [progress, setProgress] = useState(0.1);
    const [todaysRevision, setTodaysRevision]: any = useState([])

    // gets cards from database when screen loads and creates array of cards to revise
    useEffect(() => {
        return onValue(ref(db, '/students/' + auth.currentUser?.uid + '/cards'), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let cardItems = { ...data };

          let reviewArray: any = Object.values(cardItems);
          let newCardArray: any = Object.values(cardItems); 

          // gets cards that are not new but are due this session
          reviewArray = reviewArray.filter((obj: { dueDate: number; masteryLevel: number }) => {
            return (
              obj.dueDate === 0 && obj.masteryLevel != 0
            );
          })

          // gets cards that are new
          // TODO: set limit based on settings
          newCardArray = newCardArray.filter((obj: { masteryLevel: number }) => {
            return (
              obj.masteryLevel === 0
            );
          })

          // sets today's revision to review cards and new cards randomised
          let todaysRevisonArray: any = [...reviewArray, ...newCardArray]
            setTodaysRevision(
              [...randomiseCards(todaysRevisonArray)]
            )
        });
      }, []);

      // randomises cards in an array
      const randomiseCards = (array: []) => {
        let i = array.length - 1;
        for (i; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
      }

    let cardNum = 0;

    // renders each question
    const renderQuestions = () => {
        for (cardNum; cardNum < todaysRevision.length;) {
            return(
                <Question key={todaysRevision[cardNum]} card={todaysRevision[cardNum]}></Question>
            )
        }
    }

    // Question class
    const Question = (card: any) => {
        // if it is a new card, simply allow the student to learn it without being quizzed
        if (card.card.masteryLevel === 0) {
            return(
                <TouchableOpacity onPress={() => updateCardNum()}>
                    <Text style={styles.newCard}>{card.card.chinese}</Text>
                    <Text>{pinyin(card.card.chinese)}</Text>
                    <Text>{card.card.english}</Text>
                </TouchableOpacity>
            )
        }
        // if it is not a new card, display one of the following options:
        else {
            return(
                <Text>{card.card.chinese}</Text>
            )
        }
    }

    // move to the next question
    const updateCardNum = () => {
        cardNum++;
        console.log(cardNum)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="md-close-outline" size={40} />
        </TouchableOpacity>
        <Progress.Bar
            progress={progress}
            height={10}
            width={300}
            color={'#FFCB44'}
            borderWidth={0}
            unfilledColor={'#FFE299'}
            style={styles.progressBar}
          />
      </View>
      {renderQuestions()}
          <View>
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
      navigation: {
        marginLeft: 20,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center'
      },
      progressBar: {
        marginLeft: 20,
        height: 10,
      },
      newCard: {
        fontSize: 40,
        fontWeight: '600'
      }
  });
  