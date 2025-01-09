import React, { useRef, useState } from 'react';
import { specialLetters } from '../../../Utils/regExp';
import { useNavigate } from 'react-router-dom';
import { nickNameCheck } from '../../../server/readStore';
import { setMyNickName } from '../../../server/updateStore';

function EditNickName(props: { userId: string; userName: string }) {
  //네비게이션
  const navigate = useNavigate();
  //값이 비어있을 경우 자동 focus를 위한 ref
  const textRef = useRef<HTMLInputElement>(null);
  //텍스트 온체인지에 할당할 상태
  const [newNickName, setNewNickName] = useState<string>();
  //에러 문구 상태
  const [errorMessage, setErrorMessage] = useState('');
  //변경할 닉네임 텍스트 온체인지 이벤트 상태 할당
  const nickNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickName(event.target.value);
  };
  //핸들러 동작 시 로딩
  const [editLoading, setEditLoding] = useState<boolean>(false);
  //변경할 닉네임 핸들러
  const nickNameHandler = async () => {
    setEditLoding(true);
    if (newNickName) {
      if (newNickName.match(specialLetters)) {
        setErrorMessage('특수문자는 사용할 수 없습니다.');
        setEditLoding(false);
        return;
      } else if (newNickName.length < 2 || newNickName.length > 16) {
        setErrorMessage('닉네임은 최소 2글자, 최대 16글자 입니다.');
        setEditLoding(false);
        return;
      }
      await nickNameCheck(newNickName).then((res) =>
        setMyNickName(props.userId, res).then((result) =>
          result === 'success' ? navigate('/mypage') : setErrorMessage('중복된 닉네임 입니다.'),
        ),
      );
      setEditLoding(false);
    } else {
      //newNickName값이 비어있을 경우 자동 포커스
      textRef.current && textRef.current.focus();
      setEditLoding(false);
    }
  };
  return (
    <div className='edit-section edit-info'>
      <h1>닉네임 변경하기</h1>
      <table>
        <tbody>
          <tr>
            <td>현재 닉네임</td>
            <td>
              <input type='text' readOnly className='readonly-text' defaultValue={props.userName} />
            </td>
          </tr>
          <tr>
            <td>변경할 닉네임</td>
            <td>
              <input type='text' className='change-text' onChange={nickNameChange} ref={textRef} />
            </td>
          </tr>
        </tbody>
      </table>
      {errorMessage.length > 0 && <p>{errorMessage}</p>}
      <button onClick={nickNameHandler} disabled={editLoading}>
        {editLoading ? '로딩중...' : '변경하기'}
      </button>
    </div>
  );
}

export default EditNickName;
