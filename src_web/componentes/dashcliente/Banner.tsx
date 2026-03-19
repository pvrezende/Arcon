import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';
import bannerDesktop from '../../assets/bannerDesktop.png';
import bannerMobile from '../../assets/bannerMobile.png';

interface BannerProps {
  screenWidth: number;
}

const Banner: React.FC<BannerProps> = ({ screenWidth }) => {
  const bannerSource = screenWidth < 600 ? bannerMobile : bannerDesktop;

  return (
    <Image
      source={bannerSource}
      style={[styles.banner, screenWidth >= 600 && styles.bannerDesktopStyle]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  banner: { 
    width: "100%",
  },
  bannerDesktopStyle: { 
    aspectRatio: 21 / 4,
    maxHeight: 300,
  },
});

export default Banner;