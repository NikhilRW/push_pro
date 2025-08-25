import AsyncStorage from '@react-native-async-storage/async-storage';

export const incrementTimesAppOpened = async () => {
  const timesOpened = await AsyncStorage.getItem('timesOpened');
  if (timesOpened === null) {
    await AsyncStorage.setItem('timesOpened', '1');
  } else {
    let timesOpenedNum = parseInt(timesOpened, 10);
    console.log(timesOpenedNum);
    timesOpenedNum++;
    await AsyncStorage.setItem('timesOpened', timesOpenedNum.toString());
  }
};

export const checkTimesAppOpenedPassedLimit = async () => {
  const timesOpened = await AsyncStorage.getItem('timesOpened');
  if (timesOpened === null) {
    return false;
  } else {
    const timesOpenedNum = parseInt(timesOpened, 10);
    return timesOpenedNum >= 3;
  }
};
