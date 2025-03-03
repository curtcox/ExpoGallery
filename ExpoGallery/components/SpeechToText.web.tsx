import React, { useState, useEffect } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

// Re-export the interface from the native component
export interface SpeechToTextProps {
  onTranscriptChange?: (transcript: string) => void;
  buttonStartTitle?: string;
  buttonStopTitle?: string;
  showTranscript?: boolean;
}

// Web implementation using Web Speech API via expo-speech-recognition
export default function SpeechToText({
  onTranscriptChange,
  buttonStartTitle = "Start",
  buttonStopTitle = "Stop",
  showTranscript = true,
}: SpeechToTextProps) {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    const newTranscript = event.results[0]?.transcript || "";
    setTranscript(newTranscript);
    if (onTranscriptChange) {
      onTranscriptChange(newTranscript);
    }
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        console.warn("Permissions not granted", result);
        return;
      }
      // Start speech recognition
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
      });
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  };

  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
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