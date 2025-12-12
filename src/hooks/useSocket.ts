import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// 백엔드 게임 상태 타입 (서버에서 전송되는 형식)
export interface ServerGameState {
  canvas: {
    width: number;
    height: number;
  };
  ball: {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
  };
  paddle1: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
  };
  paddle2: {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
  };
  winningScore: number;
  winner: 'player1' | 'player2' | null;
  isPlaying: boolean;
}

export interface MatchInfo {
  roomId: string;
  playerNumber: 1 | 2;
  opponent: {
    username: string;
    avatar: string;
  };
}

export interface GameResult {
  winner: 'player1' | 'player2';
  finalScore: {
    player1: number;
    player2: number;
  };
}

export type MatchStatus = 'idle' | 'waiting' | 'matched' | 'playing' | 'ended';

interface UseSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

interface UserData {
  username: string;
  avatar?: string;
}

export function useSocket(userData: UserData | null, options: UseSocketOptions = {}) {
  const { serverUrl = 'http://localhost:3000', autoConnect = true } = options; // autoConnect 기본값 true로 변경

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle');
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Socket 연결 설정
  useEffect(() => {
    // userData가 없으면 연결하지 않음 (단, autoConnect가 true면 연결 시도)
    if (!userData && !autoConnect) {
      console.log('⚠️ Skipping connection: no userData');
      return;
    }

    console.log('🔌 Connecting to WebSocket server...', { 
      serverUrl, 
      hasUserData: !!userData,
      autoConnect 
    });
    
    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'], // transports 옵션 추가
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      setIsConnected(true);
      setError(null);
      
      // 연결 성공 시 userData가 있으면 서버에 등록
      if (userData) {
        console.log('👤 Registering user:', userData.username);
        newSocket.emit('user:register', userData);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('👋 Disconnected from server:', reason);
      setIsConnected(false);
      if (matchStatus === 'playing') {
        setMatchStatus('ended');
        setError('Disconnected from server');
      }
    });

    // 큐 참가 확인
    newSocket.on('queue:joined', (data: { position: number }) => {
      console.log('🎮 Joined queue at position:', data.position);
      setMatchStatus('waiting');
    });

    // 매칭 완료
    newSocket.on('game:matched', (data: MatchInfo) => {
      console.log('🎯 Matched with opponent:', data.opponent.username);
      setMatchStatus('matched');
      setMatchInfo(data);
    });

    // 게임 상태 업데이트
    newSocket.on('game:update', (state: ServerGameState) => {
      setGameState(state);

      // matchStatus를 state와 동기화
      if (state.isPlaying && state.winner === null) {
        setMatchStatus('playing');
      } else if (state.winner !== null) {
        // 승자가 있으면 게임 종료 상태로 변경
        // (하지만 game:end 이벤트에서 처리하므로 여기서는 생략)
      }
    });

    // 게임 종료
    newSocket.on('game:end', (result: GameResult) => {
      console.log('🏁 Game ended. Winner:', result.winner);
      setGameResult(result);
      setMatchStatus('ended');
      setGameState(null); // 게임 상태 초기화
    });

    // 상대방 연결 해제
    newSocket.on('game:opponent-disconnected', () => {
      console.log('👋 Opponent disconnected');
      setError('Opponent disconnected');
      setMatchStatus('ended');
      setGameState(null);
    });

    // 큐 이탈
    newSocket.on('queue:left', () => {
      console.log('🚪 Left queue');
      setMatchStatus('idle');
    });

    // 에러 처리
    newSocket.on('error', (errorMsg: string) => {
      console.error('❌ Server error:', errorMsg);
      setError(errorMsg);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing socket connection');
      newSocket.disconnect();
    };
  }, [serverUrl, autoConnect, userData]);

  // userData가 변경될 때마다 서버에 등록
  useEffect(() => {
    if (socket && userData && isConnected) {
      console.log('👤 Updating user data on server:', userData.username);
      socket.emit('user:register', userData);
    }
  }, [socket, userData, isConnected]);

  // 매치메이킹 큐 참가
  const joinQueue = useCallback(() => {
    if (!socket || !userData) {
      setError('Not connected or no user data');
      console.error('Cannot join queue: no socket or user data');
      return;
    }

    if (!isConnected) {
      setError('Socket not connected');
      console.error('Cannot join queue: socket not connected');
      return;
    }

    console.log('👤 Joining matchmaking queue as:', userData.username);
    socket.emit('queue:join', userData);
    setMatchStatus('waiting');
  }, [socket, userData, isConnected]);

  // 패들 이동 - 키 상태 전송
  const movePaddle = useCallback(
    (direction: 'up' | 'down', isPressed: boolean = true) => {
      if (!socket || matchStatus !== 'playing') {
        return;
      }

      // Send key state (pressed/released)
      const eventName = isPressed ? 'paddle:keydown' : 'paddle:keyup';
      socket.emit(eventName, { direction });
    },
    [socket, matchStatus]
  );

  // 게임 재시작 (다시 큐에 참가)
  const rematch = useCallback(() => {
    console.log('🔄 Rematching...');
    setGameState(null);
    setMatchInfo(null);
    setGameResult(null);
    setError(null);
    setMatchStatus('idle');
  }, []);

  // 큐에서 나가기
  const leaveQueue = useCallback(() => {
    if (socket && isConnected) {
      console.log('🚪 Leaving queue');
      socket.emit('queue:leave');
    }
    setMatchStatus('idle');
    setGameState(null);
    setMatchInfo(null);
    setGameResult(null);
    setError(null);
  }, [socket, isConnected]);

  return {
    // 상태
    socket,
    gameState,
    matchStatus,
    matchInfo,
    gameResult,
    error,
    isConnected,

    // 액션
    joinQueue,
    movePaddle,
    rematch,
    leaveQueue,
  };
}