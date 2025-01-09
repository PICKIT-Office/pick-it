import { ICharts } from '../types/Banner';

export const categoryCounts = (array: string[]) => {
  //reduce메소드를 사용하여 배열 순회하여 새로운 배열을 반환
  const categoryCounter: ICharts[] = array
    .reduce<ICharts[]>((acc, word) => {
      // 이미 해당 단어가 존재하는지 확인
      const existWord = acc.find((item) => item.name === word);
      //이미 존재하는 데이터 값일 경우 카운트 + 1
      if (existWord) {
        existWord.count += 1;
      } else {
        // 존재하지 않으면 새 객체를 추가
        acc.push({ name: word, count: 1 });
      }
      return acc;
    }, [])
    //카운트 내림차순 정렬 후 7개 데이터만 추출
    .sort((a, b) => b.count - a.count);

  return categoryCounter;
};
