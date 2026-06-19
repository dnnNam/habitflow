declare module '@react-native-community/datetimepicker' {
  import type { ComponentType } from 'react';

  type DateTimePickerEvent = {
    type: 'set' | 'dismissed' | string;
  };

  type DateTimePickerProps = {
    value: Date;
    mode?: 'date' | 'time' | 'datetime' | 'countdown';
    display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
    is24Hour?: boolean;
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
  };

  const DateTimePicker: ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
