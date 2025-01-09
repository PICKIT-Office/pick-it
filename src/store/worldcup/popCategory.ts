import { createSlice } from '@reduxjs/toolkit';

const initialState: string[] = [];

const popCategorySlice = createSlice({
  name: 'popCategory',
  initialState,
  reducers: {
    // 클라이언트에서 인기 카테고리 배열을 전달받아 전역 상태 업데이트
    updateCategory: (state, action) => {
      action.payload.forEach((category: string) => {
        state.push(category);
      });
    },
  },
});

export default popCategorySlice.reducer;
export const { updateCategory } = popCategorySlice.actions;
