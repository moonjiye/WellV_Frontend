import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import CommunityAxiosApi from "../../api/CommunityAxios";
import { useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaRegCommentDots } from "react-icons/fa";
import { ReactComponent as Down } from "../../assets/imgs/communityImges/Down.svg";

import {
  MiddleButton,
  SmallButton,
} from "../../styles/styledComponents/StyledComponents";
import MemberApi from "../../api/MemberApi";
import Common from "../../utils/Common";

const CommentContainer = styled.div`
  position: relative;
`;

const LargeInput = styled.textarea`
  width: 100%;
  height: 15vh;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
  resize: none;
  border: 1px solid #c4c4c4;
  margin-bottom: 20px;
  @media (max-width: 1024px) {
    height: 10vh;
  }
`;

const FormContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CommentForm = styled.form`
  margin-top: 20px;
`;
const CommentBox = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const CommentNickname = styled.p`
  color: #2446da;
  font-weight: 600;
`;
const HeadText = styled.div`
  justify-content: flex-start;
  align-items: center;
  display: flex;
  font-size: 0.8rem;
  word-break: break-word;
  margin-left: 8px;
`;
const CommentContent = styled.div`
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.9);
  resize: none;
  border: 1px solid #c4c4c4;
  margin-bottom: 5px;
  width: 100%;
`;

const CommentItem = styled.div`
  display: flex;
  flex-direction: column;
`;
const Day = styled.div`
  display: flex;
  font-size: 0.6rem;
`;

const Box = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
`;
const Box1 = styled.div`
  display: flex;
  flex-direction: column;
`;
const Box2 = styled.div`
  display: flex;
  justify-content: space-between;
  margin-right: 5px;
  margin-bottom: 5px;
`;
const Box3 = styled.div`
  display: flex;
  flex-direction: column;
`;
const Box4 = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 40vh;
`;
const Box5 = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
const Dropdown = styled.select`
  width: 10em;
  height: 2em;
  padding: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 16px;
  position: sticky;
  top: 0;
  &:focus {
    outline: none;
    border-color: #90caf9;
  }
`;
// const CommentButton = styled.div`
//   display: flex;
//   align-items: flex-end;
//   cursor: pointer;
// `;
// const RotatedDown = styled(Down)`
//   transition: transform 0.3s ease-in-out;
//   transform: ${(props) =>
//     props.isRotated ? "rotate(180deg)" : "rotate(0deg)"};
// `;

const PostRoom = () => {
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);
  const [currentCommentPage, setCurrentCommentPage] = useState(0);
  const [totalComment, setTotalComment] = useState(0);
  const [sortType, setSortType] = useState("");
  const [nickName1, setNickName1] = useState("");
  // const [showPostRoom, setShowPostRoom] = useState(false); // PostRoom 표시 여부 상태
  const [totalCommentPages, setTotalCommentPages] = useState(0);
  const { id } = useParams();

  // 댓글 페이지당 보여질 댓글 수
  const commentsPerPage = 5;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // 댓글 정보 가져오기
        const commentResponse = await CommunityAxiosApi.commentList(
          id,
          sortType,
          currentCommentPage,
          commentsPerPage
        );
        setComments(commentResponse.data);
        // setSortType(sortType);
        setCurrentCommentPage(currentCommentPage);

        const totalCommentsResponse = await CommunityAxiosApi.getTotalComments(
          id
        );
        const totalComments = totalCommentsResponse.data;
        setTotalComment(totalComments);
        setTotalCommentPages(Math.ceil(totalComments / commentsPerPage));
      } catch (error) {
        console.error("Error fetching post and comments:");
      }
    };
    fetchComments();
  }, [id, sortType, currentCommentPage, totalComment]);

  useEffect(() => {
    // 현재 사용자의 닉네임을 가져와 nickName1 상태를 업데이트
    const fetchMemberDetail = async () => {
      try {
        const memberDetail = await MemberApi.getMemberDetail();
        setNickName1(memberDetail.data.nickName);
      } catch (error) {
        console.error("Error fetching member detail:", error);
      }
    };
    fetchMemberDetail();
  }, []); // 빈 배열로 전달하여 한 번만 실행되도록 설정

  const deleteComment = async (commentId) => {
    console.log(commentId);
    try {
      const response = await CommunityAxiosApi.commentDelete(commentId);
      if (response.data === true) {
        alert("댓글이 삭제되었습니다.");
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== commentId)
        );
        // 댓글이 삭제되었으므로 총 댓글 수를 다시 가져와서 업데이트합니다.
        const totalCommentsResponse = await CommunityAxiosApi.getTotalComments(
          id
        );
        setTotalComment(totalCommentsResponse.data);
      } else {
        alert("댓글 삭제 실패하였습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      // 여기에 오류 처리를 추가합니다.
    }
  };
  const CommentWrite = async () => {
    try {
      const response = await MemberApi.getMemberDetail();
      console.log(response.data);
      const email = response.data.email;
      const commentDto = {
        communityId: id,
        email: email,
        content: content,
      };
      // 댓글 등록 API 호출
      const commentResponse = await CommunityAxiosApi.commentRegister(
        commentDto
      );
      console.log(commentResponse.data);
      if (commentResponse.status === 200) {
        alert("댓글이 등록되었습니다.");
        setContent("");
        const totalCommentsResponse = await CommunityAxiosApi.getTotalComments(
          id
        );
        setTotalComment(totalCommentsResponse.data);
      } else {
        alert("댓글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 등록 오류:", error);
      alert("댓글이 등록되지 않았습니다.");
    }
  };
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    CommentWrite();
  };

  return (
    <Box4>
      <FormContainer>
        <p>
          <FaRegCommentDots /> {totalComment}
        </p>
      </FormContainer>
      <Box3>
        <CommentContainer>
          <Dropdown onChange={(selected) => setSortType(selected.target.value)}>
            {["최신순", "등록순"].map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Dropdown>
          <CommentItem>
            {comments &&
              comments.map((comment, communityId) => (
                <CommentBox key={communityId}>
                  <CommentContent>
                    <Box1>
                      <Box>
                        <CommentNickname>{comment.nickName}</CommentNickname>
                        &nbsp;
                        <Day>{Common.timeFromNow(comment.regDate)}</Day>
                      </Box>
                      <Box2>
                        <HeadText>{comment.content}</HeadText>
                        {comment.nickName === nickName1 && (
                          <SmallButton
                            onClick={() => deleteComment(comment.commentId)}
                          >
                            삭제
                          </SmallButton>
                        )}
                      </Box2>
                    </Box1>
                  </CommentContent>
                </CommentBox>
              ))}
          </CommentItem>
          <Box5>
            {currentCommentPage > 0 && (
              <SmallButton
                onClick={() => setCurrentCommentPage(currentCommentPage - 1)}
              >
                <IoIosArrowBack />
              </SmallButton>
            )}
            {currentCommentPage + 1 < totalCommentPages && (
              <SmallButton
                onClick={() => setCurrentCommentPage(currentCommentPage + 1)}
              >
                <IoIosArrowForward />
              </SmallButton>
            )}
          </Box5>
        </CommentContainer>

        <CommentForm onSubmit={handleCommentSubmit}>
          <LargeInput
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <MiddleButton type="submit">댓글 작성</MiddleButton>
        </CommentForm>
      </Box3>
    </Box4>
  );
};

export default PostRoom;
