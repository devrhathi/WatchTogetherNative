import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    // borderColor: 'red',
    // borderWidth: 4,
    display: 'flex',
  },

  videoContainer: {
    zIndex: 50,
  },

  videoControlsContainer: {
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 40,
  },

  videoSlider: {
    width: '70%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },

  videoSliderHorizontalLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'black',
  },

  videoSliderTrackerBox: {
    position: 'absolute',
    width: 10,
    height: '100%',
    backgroundColor: 'skyblue',
    zIndex: 10,
  },
});
