import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  backgroundContainer: {
    width: '100%',
    height: 350, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundContainerMobile: {
    height: 500,
    flexDirection: 'column',
    paddingVertical: 20,
  },
  backgroundContainerTablet: {
    height: 400,
  },
  
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    width: '90%', 
    paddingHorizontal: 60,
  },
  contentWrapperMobile: {
    flexDirection: 'column',
    width: '95%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  contentWrapperTablet: {
    width: '95%',
    paddingHorizontal: 40,
  },
  leftContent: {
    flex: 1,
    paddingRight: 20, 
  },
  leftContentMobile: {
    flex: 0,
    paddingRight: 0,
    paddingBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  leftContentTablet: {
    paddingRight: 15,
  },
  titleContainer: {
    marginBottom: 18,
  },
  titleContainerMobile: {
    marginBottom: 15,
    alignItems: 'center',
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionContainerMobile: {
    marginBottom: 15,
    alignItems: 'center',
  },
  rightContent: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContentMobile: {
    flex: 0,
    marginTop: 0,
  },
  rightContentTablet: {
    flex: 0.5,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainerMobile: {
    marginTop: 0,
  },
  imageContainerTablet: {
    marginRight: 50,
  },
  arImage: {
    width: 600,
    height: 400,
    maxWidth: '100%',
    marginRight: 150,
  },
  arImageMobile: {
    width: 200,
    height: 100,
    marginRight: 0,
  },
  arImageTablet: {
    width: 300,
    height: 280,
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF', 
    marginBottom: 0,
    lineHeight: 45,
    maxWidth: '100%',
  },
  mainTitleMobile: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 0,
    maxWidth: '90%',
  },
  mainTitleTablet: {
    fontSize: 25,
    lineHeight: 38,
    maxWidth: '95%',
  },
  highlightText: {
    color: '#7dd3fc',
  },
  descriptionText: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 0,
    lineHeight: 22,
  },
  descriptionTextMobile: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 0,
  },
  descriptionTextTablet: {
    fontSize: 17,
    lineHeight: 20,
  },
  callToActionText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 20,
  },
  
  button: {
    backgroundColor: '#4adbffff', 
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 8,
    alignSelf: 'flex-start',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 15,
  },
  buttonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonTablet: {
    paddingVertical: 11,
    paddingHorizontal: 60,
  },
  buttonText: {
    color: '#091a35ff',
    fontSize: 19,
    fontWeight: 'bold',
  },
  buttonTextMobile: {
    fontSize: 14,
  },
  buttonTextTablet: {
    fontSize: 19,
  },
});

export default styles;