import moment from "moment";
import axios from "axios";
import "moment/locale/ko"; // 한글 로컬라이제이션
moment.locale("ko"); // 한글 설정 적용
const Common = {
  WEELV_DOMAIN: "http://localhost:8111",
  SOCKET_URL: "ws://localhost:8111/ws/chat",
  truncateText: (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  },
  timeFromNow: (timestamp) => {
    return moment(timestamp).fromNow();
  },
  formatDate: (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Adds leading 0 if needed
    const day = ("0" + date.getDate()).slice(-2);
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}/${month}/${day} ${hour}:${minute}:${seconds}`;
  },
  //토큰 게터 세터
  getAccessToken: () => {
    return localStorage.getItem("accessToken");
  },
  setAccessToken: (token) => {
    localStorage.setItem("accessToken", token);
  },
  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },
  setRefreshToken: (token) => {
    localStorage.setItem("refreshToken", token);
  },

  // 헤더
  tokenHeader: () => {
    const accessToken = Common.getAccessToken();
    // console.log("헤더 토큰 : " + accessToken);
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
  },

  // 401 에러 처리 함수 (토큰 리프래쉬토큰 재발급)
  handleUnauthorized: async () => {
    console.log("에세스토큰 재발급");
    const accessToken = Common.getAccessToken();
    const refreshToken = Common.getRefreshToken();
    console.log("refreshToken : " + refreshToken);
    console.log("재발행 전 : " + accessToken);
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const res = await axios.post(
        `${Common.WEELV_DOMAIN}/auth/refresh`,
        refreshToken,
        config
      );
      console.log(res.data);
      console.log("토큰 재발급 완료!!");
      Common.setAccessToken(res.data);
      return true;
    } catch (err) {
      console.log("재발급 err : " + err);
      return false;
    }
  },

  //토큰에서 이메일 뽑기 (String email)
  TakenToken: async () => {
    const accessToken = Common.getAccessToken();
    try {
      return await axios.get(Common.WEELV_DOMAIN + `/member/takenEmail`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      });
    } catch (e) {
      if (e.response.status === 401) {
        await Common.handleUnauthorized();
        const newToken = Common.getAccessToken();
        if (newToken !== accessToken) {
          return await axios.get(Common.WEELV_DOMAIN + `/member/takenEmail`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + newToken,
            },
          });
        }
      }
    }
  },
  //토큰에서 아아디 뽑기 (Long Id)
  TakenId: async () => {
    const accessToken = Common.getAccessToken();
    try {
      return await axios.get(Common.WEELV_DOMAIN + `/member/takenId`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      });
    } catch (e) {
      if (e.response.status === 401) {
        await Common.handleUnauthorized();
        const newToken = Common.getAccessToken();
        if (newToken !== accessToken) {
          return await axios.get(Common.WEELV_DOMAIN + `/member/takenId`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + newToken,
            },
          });
        }
      }
    }
  },

  //토큰으로 로그인여부 확인 (Buloan)
  IsLogin: async () => {
    const accessToken = Common.getAccessToken();
    return await axios.get(
      Common.WEELV_DOMAIN + `/member/isLogin/${accessToken}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      }
    );
  },
};

export default Common;

// 유즈이펙트 Axios시 사용 : 변경해줄꺼 보이지?
// useEffect(() => {
//////////////////요부분부터/////////////////////////////
//   const accessToken = Common.getAccessToken();
//////////////////요부분까지/////////////////////////////
//   const getCategories = async () => {
//     try {
//       const rsp = await AxiosApi.cateList();
//       console.log(rsp.data);
//       setCategories(rsp.data);
//     } catch (e) {
//////////////////요부분부터/////////////////////////////
//       if (e.response.status === 401) {
//         await Common.handleUnauthorized();
//         const newToken = Common.getAccessToken();
//         if (newToken !== accessToken) {
//           const rsp = await AxiosApi.cateList();
//           console.log(rsp.data);
//           setCategories(rsp.data);
//////////////////요부분까지/////////////////////////////
//         }
//       }
//     }
//   };
//   getCategories();
// }, []);

// 함수형 Axios사용 : 클릭할때 쓰는 함수 변경해줘야함
// const handleSubmit = async () => {
//////////////////요부분부터/////////////////////////////
//   const accessToken = Common.getAccessToken();
//////////////////요부분까지/////////////////////////////
//   try {
//     const rsp = await AxiosApi.boardWrite(
//       title,
//       selectedCategory,
//       content,
//       url
//     );
//     if (rsp.data === true) {
//       alert("글쓰기 성공");
//       navigate("/Boards");
//     } else {
//       alert("글쓰기 실패");
//     }
//   } catch (e) {
//////////////////요부분부터/////////////////////////////
//     if (e.response.status === 401) {
//       await Common.handleUnauthorized();
//       const newToken = Common.getAccessToken();
//       if (newToken !== accessToken) {
//         const rsp = await AxiosApi.boardWrite(
//           title,
//           selectedCategory,
//           content,
//           url
//         );
//         if (rsp.data === true) {
//           alert("글쓰기 성공");
//           navigate("/Boards");
//         } else {
//           alert("글쓰기 실패");
//         }
//////////////////요부분까지/////////////////////////////
//       }
//     }
//   }
// };

// Axios API 적용시  : 상단의 엑세스 토큰 받아서 헤더에 뿌려주셈
// memberGetInfo: async () => {
//////////////////요부분부터/////////////////////////////
//   const accessToken = Common.getAccessToken();
//////////////////요부분까지/////////////////////////////
//   return await axios.get(Common.KH_DOMAIN + `/users/info/`,
//////////////////요부분부터/////////////////////////////
//     {headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + accessToken,
//     },
//////////////////요부분까지/////////////////////////////
//   });
// },
