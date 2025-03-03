import React, { useState } from "react";
import { Button, Text, View, StyleSheet } from "react-native";

// Define the interface for the component props
export interface SpeechToTextProps {
  onTranscriptChange?: (transcript: string) => void;
  buttonStartTitle?: string;
  buttonStopTitle?: string;
  showTranscript?: boolean;
}

// Native implementation for Expo Go
export default function SpeechToText({
  onTranscriptChange,
  buttonStartTitle = "Start",
  buttonStopTitle = "Stop",
  showTranscript = true,
}: SpeechToTextProps) {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // For native, we'll use a placeholder implementation since expo-speech-recognition
  // might not be fully supported in Expo Go
  const handleStart = async () => {
    setRecognizing(true);
    // Placeholder for actual implementation
    // In a real implementation, you would integrate with a native speech recognition API

    // Simulate speech recognition with a timeout
    setTimeout(() => {
      const mockTranscript = "This is a simulated transcript for native platforms.";
      setTranscript(mockTranscript);
      if (onTranscriptChange) {
        onTranscriptChange(mockTranscript);
      }
      setRecognizing(false);
    }, 2000);
  };

  const handleStop = () => {
    setRecognizing(false);
  };

  return (
    <View style={styles.container}>
      {!recognizing ? (
        <Button title={buttonStartTitle} onPress={handleStart} />
      ) : (
        <Button title={buttonStopTitle} onPress={handleStop} />
      )}

      {showTranscript && transcript ? (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
  },
  transcriptContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  transcriptText: {
    fontSize: 16,
  },
});