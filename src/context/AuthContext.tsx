import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../server/firebase';

//파이어베이스 로그인 Context API 코드
const Context = createContext({});

interface UserType {
  user: any;
  isLogin: boolean;
}

const AuthProvider = ({ children }: any) => {
  //로그인 상태 확인하기
  const initialState = {
    user: null,
    isLogin: false,
  };
  const [user, setUser] = useState<UserType>(initialState);

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((userState) => {
      //첫 렌더링 시 유저 로그인 상태를 확인
      setUser({
        isLogin: userState ? true : false,
        user: userState,
      });
      return subscribe;
    });
  }, []);

  return <Context.Provider value={{ user, setUser }}>{children}</Context.Provider>;
};

export const AuthContext = () => useContext(Context);
export default AuthProvider;
