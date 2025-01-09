//YYYY-MM-DD 포매터
export const getYYYYMMDD = (datetime: number) => {
  if (datetime) {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1, 두 자리로 포맷
    const day = String(date.getDate()).padStart(2, '0'); // 두 자리로 포맷
    //const hours = String(date.getHours()).padStart(2, "0");
    //const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedTime = `${year}-${month}-${day}`;
    return formattedTime;
  }
};
