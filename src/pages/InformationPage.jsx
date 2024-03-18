import InfoCategory from "../components/InfoPage/InfoCategory";
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  Main,
  Container,
  Section,
} from "../styles/Layouts";
import FoodClass from "../components/InfoPage/FoodClass";
import ExerciseClass from "../components/InfoPage/ExerciseClass";
import FoodSearch from "../components/InfoPage/FoodSearch";
import ExerciseSearch from "../components/InfoPage/ExerciseSearch";
import FoodInfo from "../components/InfoPage/FoodInfo";
import ExerciseInfo from "../components/InfoPage/ExerciseInfo";
import InfoApi from "../api/InfoApi";
import { useInView } from "react-intersection-observer";
import { SendToMobileOutlined } from "@mui/icons-material";

const InformationPage = () => {
  const [isExInfo, setIsExInfo] = useState(false);
  const [getFoodKeyword, setGetFoodKeyword] = useState("");
  const [getExerciseKeyword, setGetExerciseKeyword] = useState("");
  const [getFoodClass1, setGetFoodClass1] = useState("");
  const [getFoodClass2, setGetFoodClass2] = useState("");
  const [getExerciseClass1, setGetExerciseClass1] = useState("");
  const [getExerciseClass2, setGetExerciseClass2] = useState("");
  const [foodData, setFoodData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const foodLoaderRef = useRef(null);
  const [foodPage, setFoodPage] = useState(0); // 현재 페이지
  const exerciseLoaderRef = useRef(null);
  const [exercisePage, setExercisePage] = useState(0);

  const handleDataFromChild = useCallback((data) => {
    setIsExInfo(data);
    console.log(data);
  }, []);

  const handleDataFromChild1 = useCallback((data) => {
    setGetFoodKeyword(data);
    console.warn(data);
  }, []);

  const handleDataFromChild2 = useCallback((data1) => {
    setGetFoodClass1(data1);
    console.warn(data1);
  }, []);

  const handleDataFromChild3 = useCallback((data2) => {
    setGetFoodClass2(data2);
    console.log(data2);
  }, []);

  const handleDataFromChild4 = useCallback((data) => {
    setGetExerciseKeyword(data);
    console.warn(data);
  }, []);

  const handleDataFromChild5 = useCallback((data1) => {
    setGetExerciseClass1(data1);
    console.warn(data1);
  }, []);

  const handleDataFromChild6 = useCallback((data2) => {
    setGetExerciseClass2(data2);
    console.warn(data2);
  }, []);

  const FoodInsert = async () => {
    try {
      const resp = await InfoApi.FoodInsert();
      if (resp.status === 200) {
        console.log("음식 정보 삽입 성공");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ExerciseInsert = async () => {
    try {
      const resp = await InfoApi.ExerciseInsert();
      if (resp.status === 200) {
        console.log("운동 정보 삽입 성공");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleObserver = (objects) => {
      const target = objects[0];
      if (target.isIntersecting) {
        // isExInfo 상태에 따라 음식 또는 운동 페이지를 증가시킵니다.
        if (!isExInfo) {
          setFoodPage((prevPage) => prevPage + 1);
        } else {
          setExercisePage((prevPage) => prevPage + 1);
        }
        console.log("페이지 로딩");
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: "5%",
      threshold: 1.0,
    };

    const foodObserver = new IntersectionObserver(
      handleObserver,
      observerOptions
    );
    const exerciseObserver = new IntersectionObserver(
      handleObserver,
      observerOptions
    );

    if (!isExInfo && foodLoaderRef.current) {
      foodObserver.observe(foodLoaderRef.current);
    } else if (isExInfo && exerciseLoaderRef.current) {
      exerciseObserver.observe(exerciseLoaderRef.current);
    }

    return () => {
      foodObserver.disconnect();
      exerciseObserver.disconnect();
    };
  }, [isExInfo, foodLoaderRef, exerciseLoaderRef]);

  // 음식 페이지 무한스크롤
  useEffect(() => {
    // isExInfo가 false일 때만 음식 정보를 불러옵니다.
    if (!isExInfo) {
      const FoodSearch = async () => {
        const size = 12;
        let resp;
        // 검색어가 존재하는 경우에만 새로운 데이터를 가져옵니다.
        if (getFoodKeyword || getFoodClass1 || getFoodClass2) {
          resp = await InfoApi.FoodSearch(
            getFoodKeyword,
            getFoodClass1,
            getFoodClass2,
            foodPage,
            size
          );
        } else {
          // 검색어가 없는 경우에는 모든 데이터를 가져옵니다.
          resp = await InfoApi.FoodSearch("", "", "", foodPage, size);
        }
        setFoodData((prevData) => [...prevData, ...resp]); // 이전 데이터와 새로운 데이터를 합칩니다.
      };
      FoodSearch();
    }
  }, [getFoodKeyword, getFoodClass1, getFoodClass2, foodPage, isExInfo]);

  useEffect(() => {
    setFoodPage(0); // 검색어나 분류가 변경될 때마다 페이지를 초기화합니다.
    setFoodData([]); // 검색어나 분류가 변경될 때마다 이전 데이터를 삭제합니다.
    console.warn("비워라 음싞!!!!!");
  }, [getFoodKeyword, getFoodClass1, getFoodClass2, isExInfo]);

  // 운동페이지 무한스크롤
  useEffect(() => {
    // isExInfo가 true일 때만 운동 정보를 불러옵니다.
    if (isExInfo) {
      const ExerciseSearch = async () => {
        const size = 12;
        let resp;
        // 검색어가 존재하는 경우에만 새로운 데이터를 가져옵니다.
        if (getExerciseKeyword || getExerciseClass1 || getExerciseClass2) {
          resp = await InfoApi.ExerciseSearch(
            getExerciseKeyword,
            getExerciseClass1,
            getExerciseClass2,
            exercisePage,
            size
          );
        } else {
          // 검색어가 없는 경우에는 모든 데이터를 가져옵니다.
          resp = await InfoApi.ExerciseSearch("", "", "", exercisePage, size);
        }
        setExerciseData((prevData) => [...prevData, ...resp]); // 이전 데이터와 새로운 데이터를 합칩니다.
      };
      ExerciseSearch();
    }
  }, [
    isExInfo,
    exercisePage,
    getExerciseClass1,
    getExerciseClass2,
    getExerciseKeyword,
  ]);

  useEffect(() => {
    setExercisePage(0); // 검색어나 분류가 변경될 때마다 페이지를 초기화합니다.
    setExerciseData([]); // 검색어나 분류가 변경될 때마다 이전 데이터를 삭제합니다.
    console.warn("비워라 운동!!!!!");
  }, [getExerciseKeyword, getExerciseClass1, getExerciseClass2, isExInfo]);

  return (
    <>
      <Main $height="auto" $shadow="none">
        <Container $align="center" $height="auto" $shadow="none">
          <Section
            $justify="center"
            $height="auto"
            style={{ marginBottom: "2rem", marginTop: "2rem" }}
          >
            <InfoCategory setdata={handleDataFromChild} />
          </Section>
          <Section
            $justify="center"
            $height="auto"
            style={{ marginBottom: "1rem" }}
          >
            {isExInfo ? (
              <ExerciseClass
                setdata1={handleDataFromChild5}
                setdata2={handleDataFromChild6}
              />
            ) : (
              <FoodClass
                setdata1={handleDataFromChild2}
                setdata2={handleDataFromChild3}
              />
            )}
          </Section>
          <Section
            $justify="center"
            $height="auto"
            style={{ marginBottom: "1.5rem" }}
          >
            {isExInfo ? (
              <ExerciseSearch setdata={handleDataFromChild4} />
            ) : (
              <FoodSearch setdata={handleDataFromChild1} />
            )}
          </Section>
          <Section $justify="center" $height="auto">
            {isExInfo ? (
              <ExerciseInfo exerciseData={exerciseData} />
            ) : (
              <FoodInfo foodData={foodData} />
            )}
          </Section>
        </Container>
        {isExInfo ? (
          <div
            ref={exerciseLoaderRef}
            style={{ height: "100px", border: "1px solid black" }}
          />
        ) : (
          <div
            ref={foodLoaderRef}
            style={{ height: "100px", border: "1px solid blue" }}
          />
        )}
      </Main>
    </>
  );
};
export default InformationPage;
