import DOMComponent from '@/components/SampleDOMComponent';

export default function Example() {
  return (
    // This is a DOM component. It re-exports a wrapped `react-native-webview` behind the scenes.
    <DOMComponent name="Europa" />
  );
}
