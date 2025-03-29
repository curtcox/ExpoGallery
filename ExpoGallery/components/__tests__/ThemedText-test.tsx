import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  act(() => {
    /* trigger any updates */
  });
  expect(tree.toJSON()).toMatchSnapshot();
});
