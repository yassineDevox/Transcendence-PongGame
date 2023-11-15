import { useEffect, useRef, useState } from "react";
import { ConversationProps } from "..";
import {
  Message,
  groupIcon,
  chatRooms,
  More,
  Send,
  Options,
} from "./tools/Assets";
import { ChatType, useChatStore } from "../Controllers/RoomChatControllers";

import { ChatPlaceHolder, ConfirmationModal } from "./RoomChatHelpers";
import { KeyboardEvent } from "react";
import { createNewRoomCall, leaveRoomCall } from "../Services/ChatServices";
import toast from "react-hot-toast";
import { useModalStore } from "../Controllers/LayoutControllers";
import {
  getRoomMessagesCall,
  sendMessageCall,
} from "../Services/MessagesServices";

import { useUserStore } from "../../../Stores/stores";
import { formatTime } from "./tools/utils";
import { useSocketStore } from "../Services/SocketsServices";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

export interface ChatPaceHolderProps {
  username: string;
  message: string;
  time?: string;
  isMe: boolean;
  isRead: boolean;
  userImage: string;
  id: string;
  secondUserId: string;
  bio?: string;
}

export const CurrentUserMessage = ({
  message,
  time,
  senderId,
  avatar,
  isFailed,
}: Message) => {
  const currentUser = useUserStore((state) => state);

  return senderId === currentUser.id ? (
    <div className="chat chat-end p-2 pl-5 ">
      <div className="chat-header p-1">
        <time className="text-gray-400 font-poppins text-xs font-light leading-normal">
          {formatTime(time)}
        </time>
      </div>
      <div
        className={` max-w-max chat-bubble ${
          isFailed === true ? "bg-red-500" : "bg-purple-500"
        }  text-white whitespace-normal break-words text-sm md:text-base w-[60%] inline-block  `}
      >
        {message}
      </div>
      <div
        className={`chat-footer p-1 ${
          isFailed ? "text-red-500" : "text-gray-400"
        }  font-poppins text-xs font-light leading-normal`}
      >
        {isFailed ? "Failed" : "Delivered"}
      </div>
    </div>
  ) : (
    <div className="chat chat-start p-3 pr-5">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={avatar?.medium} alt="" />
        </div>
      </div>
      <div className="chat-header p-1">
        <time className="text-gray-400 font-poppins text-xs font-light leading-normal">
          {formatTime(time)}
        </time>
      </div>

      <div className="max-w-max chat-bubble whitespace-normal text-sm md:text-base   break-words w-[60%] inline-block">
        {message}
      </div>
    </div>
  );
};

export const ConversationHeader: React.FC<ConversationProps> = ({
  onRemoveUserPreview,
}) => {
  const navigate = useNavigate();
  const LayoutState = useModalStore((state) => state);
  const ChatState = useChatStore((state) => state);
  const SelectedChat = useChatStore((state) => state.selectedChatID);
  const toggleChatRooms = useChatStore((state) => state.toggleChatRooms);
  const currentUser = useChatStore((state) => state.currentDmUser);
  const selectedChatType = useChatStore((state) => state.selectedChatType);
  const socketStore = useSocketStore();

  const currentRoom = chatRooms.find((room) => room.id === SelectedChat);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnline, SetOnline] = useState(false);

  const handleOnline = (userId: string) => {
    currentUser.secondUserId === userId && SetOnline(true);
    ChatState.addOnlineFriend(userId);

    console.log("user online", userId);
  };
  const handleOffline = (userId: string) => {
    currentUser.secondUserId === userId && SetOnline(false);
    ChatState.removeOnlineFriend(userId);
  };
  const handleConfirmation = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    SetOnline(false);

    socketStore.socket.on("friendOffline", handleOffline);
    socketStore.socket.on("friendOnline", handleOnline);

    return () => {
      socketStore.socket.off("friendOffline", handleOffline);
      socketStore.socket.off("friendOnline", handleOnline);
    };
    // eslint-disable-next-line
  }, [ChatState.selectedChatID]);

  return (
    <>
      <div className="flex flex-row justify-between bg-[#1A1C26] p-3 border-b-2  border-black  ">
        <div className="flex flex-row ">
          <div className="flex items-center justify-center h-full mr-4 lg:hidden">
            <button className="w-6 h-10" onClick={() => toggleChatRooms()}>
              <img alt="options" src={Options} />
            </button>
          </div>

          <div className="pr-1">
            <button
              onClick={async () => {
                if (ChatState.selectedChatType === ChatType.Chat) {
                  navigate(`/profile/${currentUser.secondUserId}`);
                }
              }}
            >
              <img
                className="w-12 rounded-full "
                alt=""
                src={
                  selectedChatType === ChatType.Chat
                    ? currentUser?.avatar.large
                    : groupIcon
                }
              />
            </button>
          </div>
          <div className="flex flex-col pl-2 ">
            <p className="text-white font-poppins text-base font-medium leading-normal">
              {selectedChatType === ChatType.Chat
                ? currentUser?.name
                : currentRoom?.isOwner
                ? currentRoom.name + " ♚"
                : currentRoom?.name}
            </p>
            {selectedChatType === ChatType.Chat ? (
              <p
                className={`${
                  isOnline ? "text-green-500" : "text-red-500"
                } font-poppins text-sm font-medium leading-normal`}
              >
                {isOnline ? "online" : "offline"}
              </p>
            ) : (
              <p className="text-gray-500 font-poppins text-sm font-medium leading-normal">
                {currentRoom?.membersCount} members
              </p>
            )}
          </div>
        </div>
        {selectedChatType === ChatType.Chat ? (
          <div className="dropdown">
            <label tabIndex={0} className="">
              <summary className="list-none p-3 cursor-pointer ">
                <img src={More} alt="More" />
              </summary>
            </label>
            <ul
              tabIndex={0}
              className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 absolute  right-full  "
            >
              <li>
                <span className="hover:bg-[#7940CF]">Block</span>
              </li>
              <li>
                <span className="hover:bg-[#7940CF]">
                  invite for a Pong Game
                </span>
              </li>
              <li
                onClick={() => {
                  LayoutState.setShowPreviewCard(!LayoutState.showPreviewCard);
                  onRemoveUserPreview();
                }}
                className="hidden md:block"
              >
                <span className="hover:bg-[#7940CF]">
                  {LayoutState.showPreviewCard === false
                    ? "Show User Info"
                    : "hide User Info"}
                </span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="dropdown">
            <label tabIndex={0} className="">
              <summary className="list-none p-3 cursor-pointer ">
                <img src={More} alt="More" />
              </summary>
            </label>
            <ul
              tabIndex={0}
              className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 absolute  right-full  "
            >
              {(currentRoom?.isAdmin === true ||
                currentRoom?.isOwner === true) && (
                <div className="icons-row flex flex-col  ">
                  <a
                    onClick={() => {
                      LayoutState.setShowSettingsModal(
                        !LayoutState.showSettingsModal
                      );
                    }}
                    href="#my_modal_9"
                    className=""
                  >
                    <li>
                      <span className="hover:bg-[#7940CF]">
                        Edit Room Settings
                      </span>
                    </li>
                  </a>
                  <a
                    onClick={() => {
                      LayoutState.setShowAddUsersModal(
                        !LayoutState.showAddUsersModal
                      );
                    }}
                    href="#my_modal_6"
                    className=""
                  >
                    <li>
                      <span className="hover:bg-[#7940CF]">Add Users</span>
                    </li>
                  </a>
                </div>
              )}

              <li
                onClick={() => {
                  LayoutState.setShowPreviewCard(!LayoutState.showPreviewCard);
                  onRemoveUserPreview();
                }}
                className="hidden md:block"
              >
                <span className="hover:bg-[#7940CF]">
                  {LayoutState.showPreviewCard === false
                    ? "Show Room Info"
                    : "hide Room Info"}
                </span>
              </li>
              {currentRoom?.isOwner === false && (
                <div>
                  <li
                    onClick={async () => {
                      ChatState.setIsLoading(true);
                      await leaveRoomCall(currentRoom?.id as string).then(
                        (res) => {
                          ChatState.setIsLoading(false);
                          if (res?.status === 200 || res?.status === 201) {
                            toast.success("Room Left Successfully");
                            // ChatState.changeChatType(ChatType.Chat);
                            ChatState.deleteRoom(currentRoom?.id as string);
                          }
                        }
                      );
                    }}
                  >
                    <span className="hover:bg-[#7940CF]">leave The Room</span>
                  </li>
                </div>
              )}
            </ul>
            <ConfirmationModal
              isOpen={isModalOpen}
              onConfirm={handleConfirmation}
            />
          </div>
        )}
      </div>
    </>
  );
};

export const Conversation = ({ onRemoveUserPreview }: ConversationProps) => {
  const chatState = useChatStore();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const socketStore = useSocketStore();
  const scrollToBottom = () => {
    // if (messageContainerRef.current) {
    //   const container = messageContainerRef.current;
    //   container.scrollTo({
    //     top: container.scrollHeight,
    //     behavior: "smooth",
    //   });
    // }
  };

  const [inputValue, setInputValue] = useState("");
  const [FailToSendMessage, setFail] = useState(false);
  const [IsLoading, setLoading] = useState(false);
  const currentUser = useUserStore((state) => state);
  const handleMessage = (message: {
    id: string;
    avatar: {
      thumbnail: string;
      medium: string;
      large: string;
    };
    content: string;
    time: string;
    roomId: string;
    authorId: string;
  }) => {
    console.log(message);
    if (message.roomId === chatState.selectedChatID) {
      const NewMessage: Message = {
        avatar: message.avatar,
        senderId: message.authorId,
        message: message.content,
        time: message.time,
      };
      chatState.pushMessage(NewMessage);
      // Update latest message in rooms
      for (const room of chatState.recentRooms) {
        if (room.id !== message.roomId) continue;
        // Update latest message
        room.last_message = {
          content: message.content,
          createdAt: message.time,
        };
      }
      chatState.fillRecentRooms(chatState.recentRooms);
      // Update latest message in dms
      for (const dm of chatState.recentDms) {
        if (dm.id !== message.roomId) continue;
        // Update latest message
        dm.last_message = {
          content: message.content,
          createdAt: message.time,
        };
      }
      chatState.fillRecentDms(chatState.recentDms);
      scrollToBottom();
    }
  };

  const handleLeave = (event: { roomId: string; type: string }) => {
    if (chatState.selectedChatID === event.roomId && event.type === "kick") {
      chatState.deleteRoom(event.roomId);
    }
  };

  const handleInputChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFail(false);
    setInputValue(e.target.value);
  };

  const [ref, inView] = useInView();
  const [EndOfFetching, setEndOfFetching] = useState(false);
  useEffect(() => {
    scrollToBottom();
  }, [chatState.currentMessages?.length, IsLoading]);

  useEffect(() => {
    // setLoading(true);

    socketStore.socket.emit("joinRoom", {
      memberId: currentUser.id,
      roomId: chatState.selectedChatID,
    });
    //
    socketStore.socket.emit("PingOnline", {
      friendId: chatState.currentDmUser.secondUserId,
    });

    // const handle
    socketStore.socket.on("roomDeparture", handleLeave);
    socketStore.socket.on("message", handleMessage);

    const fetch = async () => {
      const offset = chatState.currentMessages?.length ?? 0;
      // setLoading(true);
      chatState.selectedChatID !== "1" &&
        getRoomMessagesCall(chatState.selectedChatID, offset, 7)
          .then((res) => {
            if (res?.status !== 200 && res?.status !== 201) {
            } else {
              const messages: Message[] = [];
              res.data.forEach(
                (message: {
                  id: string;
                  avatar: {
                    thumbnail: string;
                    medium: string;
                    large: string;
                  };
                  content: string;
                  time: string;
                  roomId: string;
                  authorId: string;
                }) => {
                  messages.push({
                    id: message.id,
                    avatar: message.avatar,
                    senderId: message.authorId,
                    message: message.content,
                    time: message.time,
                  });
                }
              );
              if (res.data.length > 0) {
                chatState.fillCurrentMessages([
                  ...messages.reverse(),
                  ...(chatState.currentMessages?.reverse() ?? []),
                ]);
              } else {
                setEndOfFetching(true);
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
    };

    if (!EndOfFetching && inView) {
      fetch();
    }

    return () => {
      socketStore.socket.off("message", handleMessage);
      socketStore.socket.emit("roomDeparture", {
        roomId: chatState.selectedChatID,
        memberId: currentUser.id,
        type: "out",
      });
    };
    // eslint-disable-next-line
  }, [chatState.selectedChatID, inView]);

  const sendMessage = async () => {
    if (inputValue.length === 0) return;
    await sendMessageCall(chatState.selectedChatID, inputValue).then((res) => {
      setInputValue("");
      if (res?.status !== 200 && res?.status !== 201) {
        setFail(true);
        chatState.selectedChatType === ChatType.Room
          ? toast.error("you are not authorized to send messages in this room")
          : toast.error("you are blocked from sending messages to this user");
        chatState.setMessageAsFailed(res?.data.id);
      } else {
      }
    });
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await sendMessage().then(() => scrollToBottom());
    }
  };

  return (
    <div className="flex flex-col h-[99%] ">
      <ConversationHeader onRemoveUserPreview={onRemoveUserPreview} />
      <div
        className="flex-grow overflow-y-auto no-scrollbar "
        ref={messageContainerRef}
      >
        <div
          ref={ref}
          className="flex justify-center items-center h-2 py-2
                                "
        >
          <span className="text-xs font-light font-poppins text-gray-400">
            {EndOfFetching ? "No more Rooms" : "Loading..."}
          </span>
        </div>
        {IsLoading === false ? (
          (chatState.currentMessages?.length as number) > 0 ? (
            chatState.currentMessages?.map((message) => (
              <CurrentUserMessage
                key={message.id || Math.random().toString(36)}
                isFailed={message.isFailed}
                avatar={message.avatar}
                message={message.message}
                time={message.time}
                senderId={message.senderId}
                isRead={message.isRead}
              />
            ))
          ) : (
            <ChatPlaceHolder message="No Messages Yet!, Send The First" />
          )
        ) : (
          <div className=" text-center justify-center p-2 flex flex-col  items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </div>

      <div className=" bottom-2   ">
        <div className="">
          <div className="flex flex-row  m-5 justify-evenly ">
            <div className="flex flex-row w-full justify-center ">
              <input
                value={inputValue}
                onKeyDown={handleKeyPress}
                onChange={handleInputChange}
                type="text"
                placeholder="Type Message "
                className={`input w-full ${
                  FailToSendMessage && " border-2 border-red-400 "
                } shadow-md max-w-lg bg-[#1A1C26]  placeholder:text-gray-400 placeholder:text-xs md:placeholder:text-base font-poppins text-base font-normal leading-normal `}
              />

              <button
                onClick={async () => {
                  await sendMessage().then(() => scrollToBottom());
                }}
                className="btn  ml-4 btn-square  bg-[#8C67F6] hover:bg-green-600"
              >
                <img src={Send} alt="" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
