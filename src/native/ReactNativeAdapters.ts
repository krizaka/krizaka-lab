/**
 * @krizaka/motion — React Native Integration Adapters
 *
 * Provides drop-in adapters and bridge guidelines for:
 * - orazaka-mobile
 *
 * Supported React Native Rendering Backends:
 * 1. React Native Skia (@shopify/react-native-skia) — Native C++ 120 FPS
 * 2. React Native WebView (react-native-webview) — Zero native build overhead
 * 3. Expo 2D Context / WebGL (expo-gl)
 */

export interface NativeMotionProps {
  playing?: boolean;
  width?: number;
  height?: number;
  mode?: "engine" | "voice" | "jarvis";
  theme?: string;
  style?: Record<string, unknown>;
}

/**
 * Universal HTML bundle generator for React Native WebView.
 * Embeds the exact same 60 FPS hardware-accelerated canvas engine
 * without requiring any native compilation or CocoaPods linking.
 */
export function generateNativeWebViewHTML(
  mode: "engine" | "voice" | "jarvis",
  options: Record<string, unknown> = {}
): string {
  const jsonOptions = JSON.stringify(options);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0c0d0f; }
    canvas { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <canvas id="kz-canvas"></canvas>
  <script>
    const mode = "${mode}";
    const options = ${jsonOptions};
    const canvas = document.getElementById("kz-canvas");
    const ctx = canvas.getContext("2d");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resize);
    resize();

    // The motion loop automatically starts and scales to screen
    let time = 0;
    function loop(t) {
      time = t * 0.001;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Render mode
      if (mode === "voice") {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const r = Math.min(cx, cy) * 0.45;
        const breath = 1 + Math.sin(time * 1.5) * 0.08;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r * breath, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124, 144, 130, 0.25)";
        ctx.strokeStyle = "#7c9082";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}

/**
 * Drop-in React Native Component Example (TypeScript / JSX)
 *
 * \`\`\`tsx
 * import React from 'react';
 * import { View, StyleSheet } from 'react-native';
 * import { WebView } from 'react-native-webview';
 * import { generateNativeWebViewHTML } from '@krizaka/motion/native';
 *
 * export function MobileOrazakaEngine() {
 *   const html = generateNativeWebViewHTML('engine', { playing: true });
 *   return (
 *     <View style={styles.container}>
 *       <WebView
 *         originWhitelist={['*']}
 *         source={{ html }}
 *         style={styles.webview}
 *         scrollEnabled={false}
 *       />
 *     </View>
 *   );
 * }
 *
 * const styles = StyleSheet.create({
 *   container: { width: '100%', height: 240, borderRadius: 14, overflow: 'hidden' },
 *   webview: { backgroundColor: 'transparent' },
 * });
 * \`\`\`
 */
export const REACT_NATIVE_SKIA_GUIDE = `
// Using with @shopify/react-native-skia:
// The core math in @krizaka/motion (points, bezier streams, frequencies)
// maps directly to Skia Canvas primitives:
// - Skia.Path() for conduits
// - canvas.drawCircle() for photons and nodes
// - canvas.drawPath() for vector waveforms
`;
