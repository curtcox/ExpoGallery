import { oneButtonAlert } from '@/utils/alerts';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';

import Markdown from 'react-native-markdown-display';

const copy = `
[This is a link!](https://github.com/iamacup/react-native-markdown-display/)
You can also use custom rules.
`;

const onLinkPress = (url: string) => {
    if (url) {
      oneButtonAlert(`Link: ${url}`);
      return false;
    }

    // return true to open with `Linking.openURL
    // return false to handle it yourself
    return true
  }

const App: () => React.ReactNode = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}
        >
          <Markdown
             onLinkPress={onLinkPress}
          >
            {copy}
          </Markdown>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;