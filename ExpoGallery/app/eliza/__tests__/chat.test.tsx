import React from 'react';
import { render } from '@testing-library/react-native';
import { ReactTestRendererJSON } from 'react-test-renderer';
import { HighlightedText, getPriorityColor } from '../chat';

type TestResult = ReactTestRendererJSON | ReactTestRendererJSON[] | null;

// Type guard to ensure we have a valid result with children
const hasChildren = (result: TestResult): result is ReactTestRendererJSON & { children: any[] } => {
  return result !== null &&
         !Array.isArray(result) &&
         'children' in result &&
         Array.isArray(result.children);
};

describe('HighlightedText', () => {
  it('renders text without keywords', () => {
    const { getByText } = render(
      <HighlightedText text="Hello world" keywords={[]} />
    );
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('highlights single word matches', () => {
    const { toJSON } = render(
      <HighlightedText
        text="I work with computers"
        keywords={['computers']}
      />
    );
    const result = toJSON();
    if (!hasChildren(result)) throw new Error('Invalid test result structure');

    // Verify the text is split correctly and 'computers' has highlighting style
    expect(result.children[0].children).toEqual([
      { text: 'I work with ' },
      { text: 'computers', props: { style: expect.objectContaining({ backgroundColor: getPriorityColor(1) }) } }
    ]);
  });

  it('handles multiple keyword matches', () => {
    const { toJSON } = render(
      <HighlightedText
        text="I am very sad today"
        keywords={['am', 'sad']}
      />
    );
    const result = toJSON();
    if (!hasChildren(result)) throw new Error('Invalid test result structure');

    // Verify both 'am' and 'sad' are highlighted with correct priorities
    expect(result.children[0].children).toEqual([
      { text: 'I ' },
      { text: 'am', props: { style: expect.objectContaining({ backgroundColor: getPriorityColor(0) }) } },
      { text: ' very ' },
      { text: 'sad', props: { style: expect.objectContaining({ backgroundColor: getPriorityColor(2) }) } },
      { text: ' today' }
    ]);
  });

  it('handles singular/plural variations', () => {
    const cases = [
      {
        text: 'I work with computers',
        keyword: 'computer',
        expectedMatch: 'computers'
      },
      {
        text: 'My computer is fast',
        keyword: 'computers',
        expectedMatch: 'computer'
      }
    ];

    cases.forEach(({ text, keyword, expectedMatch }) => {
      const { toJSON } = render(
        <HighlightedText
          text={text}
          keywords={[keyword]}
        />
      );
      const result = toJSON();
      if (!hasChildren(result)) throw new Error('Invalid test result structure');

      // Find the highlighted segment
      const highlightedSegment = result.children[0].children.find(
        (child: any) => child.props?.style?.backgroundColor === getPriorityColor(1)
      );

      expect(highlightedSegment?.text).toBe(expectedMatch);
    });
  });

  it('prevents partial word matches', () => {
    const { toJSON } = render(
      <HighlightedText
        text="Tired am I today"
        keywords={['i']}
      />
    );
    const result = toJSON();
    if (!hasChildren(result)) throw new Error('Invalid test result structure');

    // Only standalone 'I' should be highlighted, not 'i' in 'Tired'
    const highlightedSegments = result.children[0].children.filter(
      (child: any) => child.props?.style?.backgroundColor === getPriorityColor(1)
    );

    expect(highlightedSegments).toHaveLength(1);
    expect(highlightedSegments[0].text).toBe('I');
  });

  it('handles overlapping keywords correctly', () => {
    const { toJSON } = render(
      <HighlightedText
        text="I am feeling very sad"
        keywords={['very sad', 'sad']}
      />
    );
    const result = toJSON();
    if (!hasChildren(result)) throw new Error('Invalid test result structure');

    // 'very sad' should be matched as one unit with priority 2
    const highlightedSegments = result.children[0].children.filter(
      (child: any) => child.props?.style?.backgroundColor
    );

    expect(highlightedSegments).toHaveLength(1);
    expect(highlightedSegments[0].text).toBe('very sad');
    expect(highlightedSegments[0].props.style.backgroundColor).toBe(getPriorityColor(2));
  });

  it('handles case-insensitive matching', () => {
    const { toJSON } = render(
      <HighlightedText
        text="I AM feeling SAD"
        keywords={['am', 'sad']}
      />
    );
    const result = toJSON();
    if (!hasChildren(result)) throw new Error('Invalid test result structure');

    const highlightedSegments = result.children[0].children.filter(
      (child: any) => child.props?.style?.backgroundColor
    );

    expect(highlightedSegments).toHaveLength(2);
    expect(highlightedSegments[0].text).toBe('AM');
    expect(highlightedSegments[1].text).toBe('SAD');
  });
});

describe('getPriorityColor', () => {
  it('returns correct colors for different priorities', () => {
    expect(getPriorityColor(0)).toBe('#ffcdd2');
    expect(getPriorityColor(1)).toBe('#fff9c4');
    expect(getPriorityColor(2)).toBe('#c8e6c9');
    expect(getPriorityColor(3)).toBe('#bbdefb');
    expect(getPriorityColor(4)).toBe('#e1bee7');
  });

  it('clamps priority to available colors', () => {
    expect(getPriorityColor(999)).toBe('#e1bee7'); // should use last color
  });
});