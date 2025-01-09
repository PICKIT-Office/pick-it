import { getYYYYMMDD } from './getYYYYMMDD';

//상대 시간 포맷
export const compareTime = (millisecond: number) => {
  const minute = Math.floor((Number(Date.now()) - Number(millisecond)) / 60000);
  const hour = Math.floor(minute / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 31);
  const year = Math.floor(month / 12);
  if (minute < 5) {
    return '방금 전';
  } else if (minute < 60) {
    return minute + '분 전';
  } else if (hour < 24) {
    return hour + '시간 전';
  } else if (day < 31) {
    return day + '일 전';
  } else if (month < 12) {
    return month + '달 전';
  } else if (month > 12) {
    return year + '년 전';
  } else {
    return getYYYYMMDD(millisecond);
  }
};
