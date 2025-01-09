import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createWorldcup from './worldcup/createWorldcup';
import popCategory from './worldcup/popCategory';

//월드컵 생성
const createWorldcupReducers = combineReducers({
  createWorldcupReducer: createWorldcup,
});
//인기 카테고리 순위
const popCategoryReducers = combineReducers({
  popCategoryReducer: popCategory,
});

const store = configureStore({
  reducer: {
    createWorldcupReducers: createWorldcupReducers,
    popCategoryReducers: popCategoryReducers,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type dispatch = typeof store.dispatch;

export default store;
