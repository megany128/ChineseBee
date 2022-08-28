import { Text, TextProps } from './Themed';

export function SFProText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'sf-pro' }]} />;
}
