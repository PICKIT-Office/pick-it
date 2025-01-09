import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/Contents/contents.scss';
import Skeleton from '../components/WorldcupSkeleton/Skeleton';
import { WorldcupImage } from '../types/Worldcup';
import { useForm } from 'react-hook-form';
import { addSearchWordList } from '../server/updateStore';
import { getWorldCupList } from '../server/readStore';

function Contents() {
  //현재 페이지 쿼리 파라미터
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search);
  const queryOption = queryParam.get('keyword') ? queryParam.get('keyword') : queryParam.get('category');
  //네비게이터
  const navigate = useNavigate();
  //인기순, 최신순 필터 state
  const [filter, setFilter] = useState<'pop' | 'new'>('pop');
  //검색 키워드/카테고리 선택 드롭다운/상태
  const [dropdown, setDropdown] = useState<boolean>(false);
  const [searchOption, setSearchOption] = useState<'키워드' | '카테고리'>(
    queryParam.get('category') ? '카테고리' : '키워드',
  );
  //리액트 훅 폼
  const { handleSubmit, register } = useForm<{
    keyword: string;
  }>({ mode: 'onSubmit' });
  //검색 핸들러
  const searchHandler = async (search: { keyword: string }) => {
    await addSearchWordList(search.keyword);
    if (searchOption === '키워드') {
      navigate(`/contents?keyword=${search.keyword}`);
    } else {
      navigate(`/contents?category=${search.keyword}`);
    }
  };
  // 필터 이동 시 로딩 동작
  const [filterLoading, setFilterLoading] = useState<boolean>(true);
  //인터섹션 옵저버 훅
  const { ref, inView } = useInView();
  //리액트 쿼리 훅
  const {
    status,
    error,
    data: worldcupList,
    fetchNextPage, //다음 페이지 불러오기,
    isFetchingNextPage, //다음 페이지 불러오는 중
    refetch,
  } = useInfiniteQuery({
    queryKey: ['worldcup_list', location.search],
    queryFn: ({ pageParam }) => getWorldCupList(filter, queryOption, searchOption, { pageParam }), //getNextPageParam작성할 경우 pageParam값이 인자값으로 전달,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage, //fetchNextPage가 작동하면 nextPage로 pageParam값 증가
  });
  //ref에 닿으면 무한 스크롤 1회 작동
  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  //인기순, 최신순 필터 적용 시 refetch
  useEffect(() => {
    setFilterLoading(true);
    refetch();
    setTimeout(() => {
      setFilterLoading(false);
    }, 500);
  }, [filter]);

  //게시물이 올라오고 3일까지는 'new'태그가 붙도록 설정
  const currentDate = Date.now();
  const isNewCard = (createAt: number) => {
    //259200000 = 밀리초로 3일
    return currentDate - createAt < 259200000 ? true : false;
  };

  return (
    <section className='contents-container'>
      <div className='contents-top'>
        <div className='contents-top-filter'>
          <button onClick={() => setFilter('pop')} className={filter === 'pop' ? 'filter-selected' : 'filter-disabled'}>
            인기순
          </button>
          <button onClick={() => setFilter('new')} className={filter === 'new' ? 'filter-selected' : 'filter-disabled'}>
            최신순
          </button>
        </div>

        <form className='contents-top-search' onSubmit={handleSubmit(searchHandler)}>
          <div className='search-select'>
            {searchOption}
            <svg
              onClick={() => setDropdown((prev) => !prev)}
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
            </svg>
            {dropdown && (
              <div className='dropdown-option'>
                <div
                  onClick={() => {
                    setSearchOption('키워드');
                    setDropdown(false);
                  }}
                >
                  키워드
                </div>
                <div
                  onClick={() => {
                    setSearchOption('카테고리');
                    setDropdown(false);
                  }}
                >
                  카테고리
                </div>
              </div>
            )}
          </div>
          <input
            type='text'
            autoComplete='off'
            placeholder='월드컵 키워드 혹은 카테고리를 입력하여 검색하세요.'
            {...register('keyword', {
              required: true,
            })}
          />
          <button type='submit'>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
              />
            </svg>
          </button>
        </form>
      </div>

      <div>
        {status === 'pending' ? (
          <Skeleton />
        ) : status === 'error' ? (
          error.message
        ) : (
          worldcupList.pages.map((page, index) => (
            <div key={page.currentPage} className='contents-section'>
              {page.data.map((items) =>
                items ? (
                  <div className='contents-worldcup-card' key={items.worldcupId}>
                    {isNewCard(items.worldcupInfo.createAt) && <span className='new-tag'>NEW</span>}
                    <div>
                      <div className='card-thumbnail'>
                        <img
                          src={
                            items.worldcupInfo.worldcupImages.sort(
                              //파일인덱스 오름차순 정렬
                              (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                            )[items.worldcupInfo.thumbnail[0]].filePath //썸네일 인덱스에 지정된 파일경로
                          }
                          alt=''
                        />
                        <img
                          src={
                            items.worldcupInfo.worldcupImages.sort(
                              (a: WorldcupImage, b: WorldcupImage) => a.fileIndex - b.fileIndex,
                            )[items.worldcupInfo.thumbnail[1]].filePath
                          }
                          alt=''
                        />
                      </div>
                      <div className='worldcup-title'>
                        <h3>{items.worldcupInfo.worldcupTitle}</h3>
                      </div>
                      <div className='worldcup-description'>
                        <p>{items.worldcupInfo.worldcupDescription}</p>
                      </div>
                    </div>

                    <div>
                      <div className='card-view'>조회수: {items.worldcupInfo.view}회</div>
                      <div className='card-category'>
                        {items.worldcupInfo.category.map((text: string, index: number) => (
                          <span key={index}>#{text}</span>
                        ))}
                      </div>
                      <div className='card-link'>
                        <Link to={`/play-game/${items.worldcupId}`}>시작하기</Link>
                        <Link to={`/game-review/${items.worldcupId}`}>랭킹보기</Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='search-nothing' key={index}>
                    검색결과가 없습니다.
                  </div>
                ),
              )}
            </div>
          ))
        )}
        <div ref={ref}>{isFetchingNextPage && <Skeleton />}</div>
      </div>
      {filterLoading && (
        <div className='filter-loading'>
          <div className='loading-bar'>
            <div />
            <div />
            <div />
          </div>
          데이터를 불러오는 중입니다...
        </div>
      )}
    </section>
  );
}
export default Contents;
