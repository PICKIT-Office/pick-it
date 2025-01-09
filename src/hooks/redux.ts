import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { dispatch, RootState } from '../store/store';

export const useAppDispatch = () => useDispatch<dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
