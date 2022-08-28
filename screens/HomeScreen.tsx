import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Pressable, Button } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';
import { db, storage } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import { eachMonthOfInterval, addMonths, getMonth, getYear } from 'date-fns';
import { StackScreenProps } from '@react-navigation/stack';
import Image from 'react-native-image-progress';
import { useLinkBuilder } from '@react-navigation/native';

const HomeScreen: React.FC<StackScreenProps<any>> = ({ navigation }) => {
  const { user } = useAuthentication();
  const auth = getAuth();

  const [events, setEvents] = useState({});
  const [value, setValue] = useState(String);

  const eventKeys = Object.keys(events);
  console.log(eventKeys);

  const today = new Date();
  const months = eachMonthOfInterval({
    start: today,
    end: addMonths(today, 6),
  });

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  var arrayholder: any = [];

  const EventItem = ({ eventItem: { location, date, name, avail }, id, month }: any) => {
    const [imgUrl, setImgUrl] = useState<string | undefined>(undefined);
    const ref = ref_storage(storage, id + '.png');

    getDownloadURL(ref)
      .then((url) => {
        setImgUrl(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    return (
      <View>
        <Pressable
          onPress={() =>
            navigation.navigate('EventInfoScreen', {
              imgUrl: imgUrl,
              eventID: id,
              month: month,
              day: date.day,
              location: location,
              avail: avail,
              name: name,
            })
          }
        >
          <View style={styles.eventImageContainer}>
            <Image
              source={{ uri: imgUrl }}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              style={{
                flex: 1,
                width: undefined,
                height: undefined,
              }}
            />
          </View>
          <View style={styles.eventDetailsContainer}>
            <Text style={styles.eventDate}>{date.day}</Text>
            <Text style={styles.eventName}>{name}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  useEffect(() => {
    return onValue(ref(db, '/events'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let eventItems = { ...data };
      setEvents(eventItems);
      arrayholder = eventItems;
    });
  }, []);

  function searchFilterFunction(text: string) {
    setValue(text);

    const newData = arrayholder.filter((item: any) => {
      const itemData = `${item.name.toUpperCase()} ${item.location.toUpperCase()} `;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    setEvents(newData);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>events</Text>
      <SearchBar
        placeholder="Type Here..."
        lightTheme
        round
        value={value}
        onChangeText={(text) => searchFilterFunction(text)}
        autoCorrect={false}
      />
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {months.map((monthKey) => (
          <View key={monthKey.toString()}>
            <Text style={styles.monthHeader}>
              {monthNames[getMonth(monthKey)]} '{getYear(monthKey) % 100}
            </Text>
            <View>
              {eventKeys.length > 0 ? (
                eventKeys.map((eventKey) =>
                  events[eventKey as keyof typeof events]['date']['month'] == getMonth(monthKey) &&
                  events[eventKey as keyof typeof events]['date']['year'] == getYear(monthKey) ? (
                    <EventItem
                      key={eventKey}
                      id={eventKey}
                      eventItem={events[eventKey as keyof typeof events]}
                      month={getMonth(monthKey) + 1}
                    />
                  ) : null
                )
              ) : (
                <Text>No events</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <Button title="Sign Out" onPress={() => signOut(auth)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {},
  container: {
    flex: 1,
  },
  eventList: {
    flex: 1,
    alignSelf: 'center',
  },
  title: {
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginTop: 30,
    fontSize: 48,
    color: '#575FCC',
    fontWeight: '500',
  },
  monthHeader: {
    alignSelf: 'flex-start',
    marginVertical: 15,
    fontSize: 36,
    color: '#FABF48',
    fontWeight: '500',
  },
  contentContainerStyle: {
    padding: 24,
  },
  eventImageContainer: {
    width: 350,
    height: 120,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  eventDetailsContainer: {
    width: 350,
    height: 50,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontWeight: '800',
    fontSize: 20,
    marginLeft: 20,
    color: '#2A3242',
  },
  eventName: {
    fontSize: 20,
    marginLeft: 20,
    color: '#2A3242',
    fontWeight: '500',
  },
});

export default HomeScreen;
