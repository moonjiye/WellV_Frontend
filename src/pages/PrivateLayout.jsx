import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import styled from "styled-components";
import Common from "../utils/Common";

const OutScreen = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: white;
  z-index: 10000;
  top: 0;
  left: 0;
  display: ${(props) => (props.onScreen ? "block" : "none")};
`;
// 접근 제한 컴포넌트
const PrivateLayout = () => {
  const navigate = useNavigate();
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const LoginStatus = async () => {
      const accessToken = Common.getAccessToken();
      try {
        const res = await Common.IsLogin();
        console.log(res);
        if (res.data === true) {
          console.log("환영합니다^^ 로그인중입니다!");
          setOnScreen(false);
        }
      } catch (e) {
        console.log(e);
        if (e.response.status === 401) {
          console.log(e.response.status);
          try {
            console.log("재발급시작!!!");
            const res = await Common.handleUnauthorized();
            if (res === false) {
              alert("로그인을해주세요");
              navigate("/login");
            }
            const newToken = Common.getAccessToken();
            console.log(newToken);
            if (newToken !== accessToken) {
              const token = await Common.IsLogin();
              if (token.data === true) {
                console.log("환영합니다^^ 로그인중입니다!");
              } else {
                alert("로그인 해주세요!");
                navigate("/login");
              }
            }
          } catch (e) {
            console.log(e);
            alert("로그인을 해주세요");
            console.log("안됨;");
            navigate("/login");
          }
        } else {
          alert("로그인을 해주세요");
          console.log("여기서안되?");
          navigate("/login");
        }
      }
    };
    LoginStatus();
  }, []);

  return (
    <>
      <OutScreen onScreen={onScreen} />
      <Outlet />
    </>
  );
};

export default PrivateLayout;
