import { createSlice } from '@reduxjs/toolkit';
import { CreateWorldCup } from '../../types/Worldcup';

const initialState: CreateWorldCup = {
  worldcupTitle: '',
  worldcupDescription: '',
  tournamentRange: 0,
  category: [],
  pageStep: 1,
};

const createWorldcupSlice = createSlice({
  name: 'createWorldcup',
  initialState,
  reducers: {
    // step1 클라이언트에서 사용자 입력값을 넘겨받은 후 월드컵 제목, 설명 데이터 업데이트
    updateStep1: (state, action) => {
      state.worldcupTitle = action.payload.worldCupTitle;
      state.worldcupDescription = action.payload.worldcupDescription;
    },
    // step1 입력값의 올바른 저장을 확인 후 다음 pageStep값을 2로 증가시키는 함수
    scrollStep2: (state, action) => {
      if (state.worldcupTitle !== '' && state.worldcupDescription !== '') {
        state.pageStep = action.payload;
      }
    },
    // step2 클라이언트에서 사용자 입력값을 넘겨받은 후 토너먼트, 카테고리 배열 업데이트
    updateStep2: (state, action) => {
      state.tournamentRange = action.payload.tournamentRange;
      state.category = action.payload.category;
    },
    // step2 입력값의 올바른 저장을 확인 후 다음 pageStep값을 3으로 증가시키는 함수
    scrollStep3: (state, action) => {
      if (state.tournamentRange > 0 && state.category.length > 0) {
        state.pageStep = action.payload;
      }
    },
    // 월드컵 생성이 끝나면 초기값으로 되돌리기
    getReset: () => initialState,
  },
});

export default createWorldcupSlice.reducer;
export const { updateStep1, scrollStep2, updateStep2, scrollStep3, getReset } = createWorldcupSlice.actions;
