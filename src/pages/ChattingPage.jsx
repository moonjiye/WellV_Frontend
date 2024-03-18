import { useEffect, useState } from "react";
import { ChatHeader } from "../components/chattingPage/ChatHeader";
import ChatList from "../components/chattingPage/ChatList";
import Chatting from "../components/chattingPage/Chatting";
import FriendsList from "../components/chattingPage/FriendsList";
import Common from "../utils/Common";

const ChattingPage = (props) => {
  const { modalOpen } = props;
  const [state, setState] = useState("CHAT");
  const [chatNum, setChatNum] = useState("");
  const [userId, setUserId] = useState("");
  const selected = (sel) => {
    setState(sel);
  };
  const chatNumed = (sel) => {
    setChatNum(sel);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await Common.TakenId();
        setUserId(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData(); // 함수 호출
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 렌

  return (
    <>
      <ChatHeader setState={selected} modal={modalOpen}>
        {state === "CHAT" && (
          <ChatList
            setState={selected}
            userId={userId}
            setChatNum={chatNumed}
            state={state}
          />
        )}
        {state === "FRIENDS" && (
          <FriendsList
            setState={selected}
            userId={userId}
            setChatNum={chatNumed}
          />
        )}
        {state === "CHATTING" && <Chatting roomId={chatNum} userId={userId} />}
      </ChatHeader>
      {/* <FriendBox userId={4} /> */}
    </>
  );
};

export default ChattingPage;
