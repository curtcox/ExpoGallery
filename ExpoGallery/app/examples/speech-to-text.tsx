import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import SpeechToText from "@/components/SpeechToText";

export default function Example() {
  const [transcript, setTranscript] = useState("");

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech to Text Example</Text>

      <SpeechToText
        onTranscriptChange={handleTranscriptChange}
        buttonStartTitle="Start Recording"
        buttonStopTitle="Stop Recording"
        showTranscript={false}
      />

      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptLabel}>Transcript:</Text>
        <Text style={styles.transcriptText}>{transcript || "No transcript yet. Press Start to begin recording."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  transcriptContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  }
});