/**
 * @format
 */

import {useThemeColorsDark} from '../../src/hooks/useThemeColors';

describe('App', () => {
  it('renders without crashing', () => {
    expect(useThemeColorsDark()).toBe("Dark")
  });
})