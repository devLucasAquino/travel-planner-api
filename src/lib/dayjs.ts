import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';


dayjs.extend(localizedFormat);
dayjs.locale('pt-br');

export { dayjs }