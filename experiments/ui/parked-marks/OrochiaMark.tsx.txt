import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G as Group, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

import { OROCHIA as G } from "../marks/orochia-geometry";
import { type NativeMarkProps } from "./mark-motion";
import { useTheme } from "./theme";

const CENTER = G.offset + 180;

/**
 * The Orochia mark for React Native — the same geometry as the web mark (marks/orochia-geometry.ts), drawn with
 * react-native-svg. Three layers so that the motion runs on the native driver: the orbit turns, the eye and the flame
 * breathe, the serpent stays still.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function OrochiaMark({ size = 48, animated = true, title, neutral: neutralProp }: NativeMarkProps) {
  const { theme } = useTheme();
  const neutral = neutralProp ?? theme.textMuted;
  const [spin] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!animated) return;
    let loops: Animated.CompositeAnimation[] = [];
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      loops = [
        Animated.loop(Animated.timing(spin, { toValue: 1, duration: 30_000, easing: Easing.linear, useNativeDriver: true })),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
      ];
      loops.forEach((l) => l.start());
    });
    return () => {
      cancelled = true;
      loops.forEach((l) => l.stop());
    };
  }, [animated, spin, pulse]);

  const viewBox = size < 48 ? G.croppedViewBox : G.viewBox;
  const layer = { position: "absolute" as const, width: size, height: size };
  const a11y = title ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel: title } : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  const bodyGradient = (
    <LinearGradient id="body" gradientUnits="userSpaceOnUse" x1={G.body.x1 + G.offset} y1={G.body.y1 + G.offset} x2={G.body.x2 + G.offset} y2={G.body.y2 + G.offset}>
      {G.body.stops.map(([offset, color]) => (
        <Stop key={offset} offset={offset} stopColor={color} />
      ))}
    </LinearGradient>
  );

  return (
    <View style={{ width: size, height: size }} {...a11y}>
      <Svg viewBox={viewBox} style={layer}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={G.glow.color} stopOpacity={G.glow.opacity} />
            <Stop offset="100%" stopColor={G.glow.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={CENTER} cy={CENTER} r={170} fill="url(#glow)" />
        <Circle cx={CENTER} cy={CENTER} r={G.ring.r} stroke={neutral} strokeWidth={G.ring.width} opacity={0.35} fill="none" />
      </Svg>
      <Animated.View style={[layer, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}>
        <Svg viewBox={viewBox} style={layer}>
          <Circle cx={CENTER} cy={CENTER} r={G.orbit.r} stroke={neutral} strokeWidth={G.orbit.width} strokeDasharray={G.orbit.dash} opacity={0.6} fill="none" />
        </Svg>
      </Animated.View>
      <Svg viewBox={viewBox} style={layer}>
        <Defs>{bodyGradient}</Defs>
        <Group transform={`translate(${G.offset} ${G.offset})`}>
          <Path d={G.arc} stroke="url(#body)" strokeWidth={22} strokeLinecap="round" fill="none" />
          <Path d={G.arc} stroke={G.scales.color} strokeOpacity={G.scales.opacity} strokeWidth={G.scales.width} strokeLinecap="round" strokeDasharray={G.scales.dash} fill="none" />
          <Path d={G.neck} stroke="url(#body)" strokeWidth={14} strokeLinecap="round" fill="none" />
          <Path d={G.tail} stroke="url(#body)" strokeWidth={6} strokeLinecap="round" fill="none" />
          <Ellipse cx={G.head.cx} cy={G.head.cy} rx={G.head.rx} ry={G.head.ry} rotation={G.head.rotate} origin={`${G.head.cx}, ${G.head.cy}`} fill="url(#body)" />
          <Path d={G.tongue.d} stroke={G.tongue.color} strokeWidth={3} strokeLinecap="round" fill="none" />
        </Group>
      </Svg>
      <Animated.View style={[layer, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }]}>
        <Svg viewBox={viewBox} style={layer}>
          <Defs>
            <LinearGradient id="flame" x1="50%" y1="100%" x2="50%" y2="0%">
              {G.flameGradient.stops.map(([offset, color]) => (
                <Stop key={offset} offset={offset} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <Group transform={`translate(${G.offset} ${G.offset})`}>
            <Circle cx={G.eye.cx} cy={G.eye.cy} r={G.eye.r} fill={G.eye.color} />
            <Path d={G.flame.d} transform={`translate(${G.flame.translate[0]} ${G.flame.translate[1]}) scale(${G.flame.scale})`} fill="url(#flame)" />
          </Group>
        </Svg>
      </Animated.View>
    </View>
  );
}
