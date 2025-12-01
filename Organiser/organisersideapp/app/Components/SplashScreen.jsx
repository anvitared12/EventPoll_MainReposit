import React, {useEffect, useRef} from 'react';
import {Animated, Text, View, Image} from 'react-native';
import {router} from 'expo-router'

const FadeInView = props => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View 
      style={{
        ...props.style,
        opacity: fadeAnim, 
      }}>
      {props.children}
    </Animated.View>
  );
};

const SplashScreen = () => {
  useEffect(()=>{
    const timer = setTimeout(()=>{
      router.replace('/Authentication/Sign-up')
    },4000);
    return () => clearTimeout(timer);
  },[]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <FadeInView
        style={{
          width: 250,
          height: 50,
          alignItems:'center',
          justifyContent:'center'
        }}>
        <Image source={require('../../assets/images/logo2.png')} style={{ width: 80, height: 120 }} />

        <Text style={{ fontSize: 30, textAlign: 'center', margin: 10, fontFamily: 'Courier-Prime'}}>Event Poll</Text>
        
        <Text style={{fontSize:14, textAlign:'center',fontFamily:'Courier-Prime'}}>A live event experience tracker</Text>
      </FadeInView>
    </View>
  );
};

export default SplashScreen;