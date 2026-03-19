import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView } from 'react-native';

interface UseScrollAnimationOptions {
  threshold?: number; // Porcentagem do elemento que deve estar visível (0-1)
  duration?: number; // Duração da animação em ms
  delay?: number; // Delay antes de iniciar a animação em ms
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.3, // 30% do elemento deve estar visível
    duration = 800,
    delay = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Função para executar animação
  const animateTo = (toVisible: boolean) => {
    // Cancelar animação anterior se existir
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const timer = setTimeout(() => {
      animationRef.current = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: toVisible ? 1 : 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: toVisible ? 0 : 50,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]);
      
      animationRef.current.start();
    }, toVisible ? delay : 0);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = animateTo(isVisible);
    return cleanup;
  }, [isVisible, duration, delay, fadeAnim, slideAnim]);

  useEffect(() => {
    // Usar Intersection Observer se disponível (navegador)
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const shouldBeVisible = entry.isIntersecting;
            if (shouldBeVisible !== isVisible) {
              setIsVisible(shouldBeVisible);
            }
          });
        },
        {
          threshold,
          rootMargin: '0px 0px -50px 0px' // Trigger um pouco antes do elemento ficar totalmente visível
        }
      );

      observerRef.current = observer;

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    } else {
      // Fallback para React Native puro - assumir que está visível após um delay
      setTimeout(() => {
        if (!isVisible) {
          setIsVisible(true);
        }
      }, 1000);
    }
  }, [threshold, isVisible]);

  const onLayout = (event: any) => {
    if (!elementRef.current) return;

    // Conectar o observer ao elemento quando ele for montado (web)
    if (observerRef.current && elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
  };

  return {
    elementRef,
    fadeAnim,
    slideAnim,
    onLayout,
    isVisible
  };
};
