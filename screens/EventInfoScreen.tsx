import { StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ref as ref_db, onValue } from 'firebase/database';
import { db, storage } from '../config/firebase';
import { Text, View } from '../components/Themed';
import { ref as ref_storage, getDownloadURL } from 'firebase/storage';
import Image from 'react-native-image-progress';
import { Icon } from 'react-native-elements'

export default function EventInfoScreen({ route, navigation }: any) {
  const { eventID, month, day, location, avail, imgUrl, name } = route.params;
  const [vendorList, setVendorList] = useState({});
  const [vendorInfo, setVendorInfo] = useState({});

  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  useEffect(() => {
    return onValue(ref_db(db, '/events/' + eventID + '/' + 'vendors'), (querySnapShot) => {
      let data = querySnapShot.val() || {};
      let vendorList = { ...data };
      setVendorList(vendorList);

      Object.keys(vendorList).map((vendorKey: any) =>
        onValue(ref_db(db, '/users/' + vendorKey), (querySnapShot) => {
          let data = querySnapShot.val() || {};
          let info = { ...data };
          let updatedValue = {};
          updatedValue = { [vendorKey]: info };
          setVendorInfo((vendorInfo) => ({ ...vendorInfo, ...updatedValue }));
        })
      );
    });
  }, []);

  const VendorItem = ({ eventID, id }: any) => {
    const name = vendorInfo[id as keyof typeof vendorInfo]['name' as keyof typeof vendorInfo];

    const [imgUrl1, setImgUrl1] = useState<string | undefined>(undefined);
    const ref1 = ref_storage(storage, eventID + id + '_1.png');

    const [imgUrl2, setImgUrl2] = useState<string | undefined>(undefined);
    const ref2 = ref_storage(storage, eventID + id + '_2.png');

    const [imgUrl3, setImgUrl3] = useState<string | undefined>(undefined);
    const ref3 = ref_storage(storage, eventID + id + '_3.png');

    getDownloadURL(ref1)
      .then((url) => {
        setImgUrl1(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    getDownloadURL(ref2)
      .then((url) => {
        setImgUrl2(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    getDownloadURL(ref3)
      .then((url) => {
        setImgUrl3(url);
      })
      .catch((error) => {
        console.log('error:' + error);
      });

    return (
      <View style={styles.eventDetailsContainer}>
        <View style = {{flexDirection:'row', width: 340, borderRadius:20, backgroundColor:'red'}}>
          <Text style={styles.vendorName}>{name}</Text>
          <Icon
          name='instagram'
          type='ant-design'
          color='#575FCC'
          style={{justifyContent:'flex-end', flex:1, alignSelf:'flex-end', backgroundColor:'blue' }}
        />
        </View>
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: imgUrl1 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
          <Image source={{ uri: imgUrl2 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
          <Image source={{ uri: imgUrl3 }} style={styles.vendorImage} imageStyle={{ borderRadius: 20 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F3' }}>
      <View style={styles.image}>
        <Image
          source={{ uri: imgUrl }}
          style={{
            flex: 1,
            width: undefined,
            height: undefined
          }}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.date}>
          {monthNames[month]} {day}
        </Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>{location}</Text>

        <ScrollView
          style={styles.eventList}
          contentContainerStyle={styles.contentContainerStyle}
          directionalLockEnabled={true}
          horizontal={false}
        >
          {Object.keys(vendorList).map((vendorKey) => (
            <View key={vendorKey} style={{backgroundColor:'#FFF8F3'}}>
                <VendorItem eventID={eventID} id={vendorKey} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 40,
    marginLeft: 40,
    backgroundColor: '#FFF8F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    height: 200,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2A3242',
  },
  name: {
    fontSize: 40,
    color: '#575FCC',
    fontWeight: '500',
    marginBottom: 10,
  },
  location: {
    color: '#FABF48',
    fontSize: 16,
    fontWeight: '700',
  },
  eventDetailsContainer: {
    width: 350,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#C4C4C4'
  },
  contentContainerStyle: { 
},
  eventList: {
    marginTop: 20,
  },
  eventImageContainer: {
    width: 85,
    height: 85,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  vendorName: {
    fontSize: 16,
    color: '#2A3242',
    marginTop: 25,
    fontWeight: '500',
    marginLeft: 30,
    justifyContent: 'flex-start'
  },
  vendorImage: {
    width: 85,
    height: 85,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'red'
  },
});
