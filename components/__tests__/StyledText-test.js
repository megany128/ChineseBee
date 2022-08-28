import * as React from 'react';
import renderer from 'react-test-renderer';

import { SFProText } from '../StyledText';

it(`renders correctly`, () => {
  const tree = renderer.create(<SFProText>Snapshot test!</SFProText>).toJSON();

  expect(tree).toMatchSnapshot();
});
