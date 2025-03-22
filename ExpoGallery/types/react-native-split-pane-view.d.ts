declare module 'react-native-split-pane-view' {
  import { ViewProps } from 'react-native';
  import React from 'react';

  export interface SplitViewProps extends ViewProps {
    split?: 'vertical' | 'horizontal';
    defaultSplitSize?: number;
    minSplitSize?: number;
    maxSplitSize?: number;
    onSplitSizeChange?: (size: number) => void;
  }

  const SplitView: React.FC<SplitViewProps>;
  export default SplitView;
}