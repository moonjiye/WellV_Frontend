import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useLayoutEffect,
} from "react";
import MedicineApi from "../api/MedicineApi";
import Common from "../utils/Common";
import { useApiRequest } from "../hooks/useApiRequest";
import { useNavigate, useLocation } from "react-router-dom";

const SearchContext = createContext();

const initialState = {
  email: "",
  typeList: {},
  checkBoxStates: {},
  comboBoxId: "",
  openComboBoxes: {},
  searchType: "통합",
  originType: "",
  searchQuery: "",
  page: 1,
  size: 10,
  searchResults: [],
  totalCount:  9999999,
  
};

const searchReducer = (state, action) => {
  switch (action.type) {
    case "SET_EMAIL":
      if (state.email === action.payload) {
        return state;
      }
      return { ...state, email: action.payload};
    case "SET_TYPE_LIST":
      if (state.typeList === action.payload) {
        return state;
      }
      return { ...state, typeList: action.payload };
    case "TOGGLE_COMBOBOX":
      return {
        ...state,
        openComboBox:
          state.openComboBox === action.payload ? null : action.payload,
      };
    case "SET_CHECKBOX_STATES":
      return {
        ...state,
        checkBoxStates: {
          ...state.checkBoxStates,
          [action.payload.comboBoxId]: {
            ...(state.checkBoxStates[action.payload.comboBoxId] || {}),
            [action.payload.checkBoxId]: action.payload.isChecked,
          },
        },
      };
    case "RESET_COMBOBOX":
      return {
        ...state,
        checkBoxStates: { ...state.checkBoxStates, [action.payload]: {} },
      };
    case "SET_SEARCH_TYPE":
      if (state.searchType === action.payload) {
        return state;
      }
      return { ...state, searchType: action.payload };
    case "SET_ORIGIN_TYPE":
      if (state.originType === action.payload) {
        return state;
      }
      return { ...state, originType: action.payload };
    case "SET_SEARCH_QUERY":
      if (state.searchQuery === action.payload) {
        return state;
      }
      return { ...state, searchQuery: action.payload };
      case "SET_PAGE":
        if (state.page === action.payload) {
          return state; 
        }
        return { ...state, page: action.payload };
    case "SET_SIZE":
        if (state.size === action.payload) {
          return state;
        }
      return { ...state, size: action.payload };
    case "SET_TOTAL_COUNT":
      return { ...state, totalCount: action.payload };
    case "SET_SEARCH_RESULTS":
      if (state.searchResults === action.payload) {
        return state;
      }
      return {
        ...state,
        searchResults: action.payload,
      };
    default:
      return state;
  }
};

export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: listByTypeData } = useApiRequest(MedicineApi.getListByType); // API 요청을 위한 커스텀 훅 사용

  useLayoutEffect(() => {
    try {
      if (listByTypeData) {
        dispatch({ type: "SET_TYPE_LIST", payload: listByTypeData });
      }
    } catch (error) {
      console.error("An error occurred while setting type list:", error);
    }
  }, [listByTypeData]);

  useLayoutEffect(() => {
    actions.fetchTotalCount();
  }, []);
  // 이전 검색 원복로직
  useEffect(() => {
    // 컴포넌트가 마운트되었을 때 URL의 쿼리 스트링을 파싱하여 검색 조건 복원
    const searchParams = Object.fromEntries(
      new URLSearchParams(location.search)
    );
    // 여기서는 searchParams 객체를 직접 performSearch 함수에 전달.
    // performSearch 함수 내에서 overrideParams를 처리하는 로직을 확인.
    actions.performSearch(searchParams);
    console.log(searchParams);
  }, [location.search]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get('page') || '1'; // 기본값을 제공
    const size = searchParams.get('size') || '10'; // 기본값을 제공
    const searchType = searchParams.get('searchType') || '통합'; // 기본값 설정
    const searchQuery = searchParams.get('searchQuery') || ''; // 기본값 설정

    actions.setSearchType(searchType);
    actions.setSearchQuery(searchQuery);
    
    // 상태 업데이트 함수 호출
    actions.setPage(page);
    actions.setSize(size);
  }, []);

    // 최초에 컨텍스트내 영역에 진입시 랜더링 되기 실행되는 email 정보 받아오기 함수
    useEffect(() => {
      const fetchEmail = async () => {
        try {
          const response = await Common.TakenToken();
          // console.log(response.data);
          actions.setEmail(response.data);
        } catch (error) {
          console.log("이메일 조회 실패 : " + error);
        }
      };
      fetchEmail();
    }, []);




  const actions = {
    setEmail: (email) => dispatch({ type: "SET_EMAIL", payload: email}),
    // 검색 필터 영역
    toggleComboBox: (comboBoxId) =>
      dispatch({ type: "TOGGLE_COMBOBOX", payload: comboBoxId }),
    handleCheckboxChange: (comboBoxId, checkBoxId, isChecked) =>
      dispatch({
        type: "SET_CHECKBOX_STATES",
        payload: { comboBoxId, checkBoxId, isChecked },
      }),
    resetComboBox: (comboBoxId) =>
      dispatch({ type: "RESET_COMBOBOX", payload: comboBoxId }),
    setSearchType: (searchType) =>
      dispatch({ type: "SET_SEARCH_TYPE", payload: searchType }),
    setOriginType: (originType) =>
      dispatch({ type: "SET_ORIGIN_TYPE", payload: originType }),
    setSearchQuery: (query) =>
      dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
    // 최초의 페이지 랜더링시 엘라스틱서치 서버의 총 문서수를 가져오는 액션
    fetchTotalCount: async () => {
      try {
        const totalCount = await MedicineApi.getTotalCount();
        dispatch({
          type: "SET_TOTAL_COUNT",
          payload: totalCount,
        });
      } catch (error) {
        console.error("Failed to fetch total count:", error);
        // Handle error as needed, e.g., set an error state or show an error message
      }
    },
    setSize: (size) => dispatch({ type: "SET_SIZE", payload: size }),
    setPage: (page) => dispatch({ type: "SET_PAGE", payload: page}),

    // 다수의 필터를 통해 "검색" 클릭시 실행되는 액션
    performSearch: async (overrideParams = {}) => {
      try {
      // 검색 파라미터가 함수 인자로 전달되었다면, 이를 사용합니다.
      // 전달되지 않았다면, 현재 상태(state)에서 파라미터를 구성합니다.
      const {
        searchQuery, // 사용자가 입력한 검색 쿼리
        checkBoxStates, // 체크박스의 상태를 나타내는 객체
        searchType, // 선택된 검색 유형 (예: "통합")
        originType, // 선택된 원산지 유형
        page, // 현재 페이지 번호
        size, // 페이지당 결과 수
      } = state;
    
      // 선택된 체크박스에 따라 검색 기능을 파라미터로 구성합니다.
      let functionalities = [null];
      Object.entries(checkBoxStates).forEach(([key, value]) => {
        Object.entries(value).forEach(([functionality, isChecked]) => {
          if (isChecked) { // 체크된 상태라면 functionalities 배열에 추가
            functionalities.push(functionality);
          }
        });
      });
    
      // functionalities 배열을 쉼표로 구분된 문자열로 변환합니다.
      const functionalitiesParam = functionalities.join(",");
    
      // 최종 검색 파라미터를 구성합니다.
      const params = {
        query: searchQuery,
        functionalities: functionalitiesParam,
        filter: searchType,
        originType: originType,
        page : page,
        size: size,
        ...overrideParams, // overrideParams에 값이 있으면, 해당 값을 사용하여 파라미터를 오버라이드합니다.
      };
    
      // 현재 URL의 쿼리 스트링에서 검색 조건을 업데이트하기 위해 사용합니다.
      const currentSearchParams = new URLSearchParams(location.search);
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          currentSearchParams.set(key, params[key]); // 새로운 검색 조건을 URL 쿼리 스트링에 설정합니다.
        }
      });
    
      // API를 호출하여 검색 결과를 가져옵니다.
      const response = await MedicineApi.getSearchResults(params);
      dispatch({
        type: "SET_SEARCH_RESULTS",
        payload: response, // 검색 결과를 상태에 저장합니다.
      });
    
      // overrideParams에 'query'가 포함되어 있다면, 검색 쿼리 상태를 업데이트합니다.
      if (overrideParams.hasOwnProperty('query')) {
        dispatch({ type: "SET_SEARCH_QUERY", payload: overrideParams.query });
      }
    
      // URL 쿼리 스트링을 업데이트합니다. 이는 사용자가 페이지를 새로 고침하거나 URL을 공유할 때 검색 상태를 유지하기 위함입니다.
      if (Object.keys(overrideParams).length === 0) {
        const query = currentSearchParams.toString();
        navigate(`?${query}`); // 현재 검색 조건으로 URL을 업데이트합니다.
      }
    } catch (error) {
      console.error("An error occurred during search:", error);
    }
    },
  };

  return (
    <SearchContext.Provider value={{ state, actions }}>
      
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
