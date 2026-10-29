import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";

import { KACHIZAKA as G } from "../marks/kachizaka-geometry";
import { markA11y, type NativeMarkProps, useMarkMotion } from "./mark-motion";
import { useSvgId, useTheme } from "./theme";

/**
 * The Kachizaka mark for React Native — the geometry of the web mark (marks/kachizaka-geometry.ts), "the podium": three
 * steps, the winner in gold, the others in cobalt, under a gold diamond. The orbit and the ball turn, the diamond
 * breathes; still when the system reduces motion.
 *
 * @deprecated Paused product (2026-10-25); removed in the next major.
 */
export function KachizakaMark({ size = 48, animated = true, title, neutral }: NativeMarkProps) {
  const { theme } = useTheme();
  const { Animated, layer, spinStyle, pulseStyle } = useMarkMotion(size, animated, G.motion.spin * 1000);
  const id = useSvgId("kcm");
  const viewBox = size < 48 ? G.croppedViewBox : G.viewBox;
  const stroke = neutral ?? theme.textMuted;
  return (
    <View style={{ width: size, height: size }} {...markA11y(title)}>
      <Svg viewBox={viewBox} style={layer}>
        <Defs>
          <RadialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={G.glow.color} stopOpacity={G.glow.opacity} />
            <Stop offset="100%" stopColor={G.glow.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {size >= 48 ? <Circle cx={G.center} cy={G.center} r={190} fill={`url(#${id}g)`} /> : null /* cropped: the halo would show its square */}
        <Circle cx={G.center} cy={G.center} r={G.ring.r} stroke={stroke} strokeWidth={G.ring.width} opacity={0.35} fill="none" />
        <Path d={G.steps.second} fill={G.cobalt} />
        <Path d={G.steps.first} fill={G.gold} />
        <Path d={G.steps.third} fill={G.cobalt} />
      </Svg>
      <Animated.View style={[layer, spinStyle]}>
        <Svg viewBox={viewBox} style={layer}>
          <Circle cx={G.center} cy={G.center} r={G.orbit.r} stroke={stroke} strokeWidth={G.orbit.width} strokeDasharray={G.orbit.dash} opacity={0.6} fill="none" />
          <Circle cx={G.ball.at[0]} cy={G.ball.at[1]} r={G.ball.r} fill={G.gold} />
        </Svg>
      </Animated.View>
      <Animated.View style={[layer, pulseStyle]}>
        <Svg viewBox={viewBox} style={layer}>
          <Path d={G.node.d} fill={G.gold} stroke={G.gold} strokeWidth={G.node.soften} strokeLinejoin="round" />
          <Path d={G.node.light} fill={G.highlight} />
        </Svg>
      </Animated.View>
    </View>
  );
}
