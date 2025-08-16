import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './prisma';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  company: string;
  score: number;
  prizeLevel: string | null;
  questionsAnswered: number;
  correctAnswers: number;
  won: boolean;
}

interface GameUpdate {
  gameId: string;
  playerId: string;
  status: string;
}

interface NewPlayerEvent {
  name: string | undefined;
  company: string | null | undefined;
  timestamp: Date;
}

interface PrizeWonEvent {
  type: string;
  gameId: string;
  timestamp: Date;
}

export interface ServerToClientEvents {
  leaderboardUpdate: (data: LeaderboardEntry[]) => void;
  gameUpdate: (data: GameUpdate) => void;
  newPlayer: (data: NewPlayerEvent) => void;
  prizeWon: (data: PrizeWonEvent) => void;
}

export interface ClientToServerEvents {
  joinLeaderboard: () => void;
  leaveLeaderboard: () => void;
  gameStarted: (playerId: string) => void;
  gameEnded: (gameId: string, score: number) => void;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  if (!io) {
    io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinLeaderboard', async () => {
        socket.join('leaderboard');
        // Send initial leaderboard data
        const leaderboard = await getLatestLeaderboard();
        socket.emit('leaderboardUpdate', leaderboard);
      });

      socket.on('leaveLeaderboard', () => {
        socket.leave('leaderboard');
      });

      socket.on('gameStarted', async (playerId) => {
        // Notify all clients that a new game has started
        const player = await prisma.player.findUnique({
          where: { id: playerId },
          select: { firstName: true, company: true }
        });
        
        io?.emit('newPlayer', {
          name: player?.firstName,
          company: player?.company,
          timestamp: new Date()
        });
      });

      socket.on('gameEnded', async (gameId, score) => {
        // Update leaderboard and notify all clients
        const updatedLeaderboard = await getLatestLeaderboard();
        io?.to('leaderboard').emit('leaderboardUpdate', updatedLeaderboard);

        // Check if it's a high score
        if (score >= 1000000) {
          io?.emit('prizeWon', {
            type: 'BUILDONAIRE',
            gameId,
            timestamp: new Date()
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return io;
}

async function getLatestLeaderboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const topGames = await prisma.game.findMany({
    where: {
      endedAt: {
        gte: today,
      },
      status: {
        in: ['COMPLETED', 'WON'],
      },
    },
    orderBy: [
      { finalScore: 'desc' },
      { correctAnswers: 'desc' },
      { endedAt: 'asc' },
    ],
    take: 10,
    include: {
      player: {
        select: {
          firstName: true,
          lastName: true,
          company: true,
        },
      },
    },
  });

  return topGames.map((game, index) => ({
    rank: index + 1,
    playerName: `${game.player.firstName} ${game.player.lastName.charAt(0)}.`,
    company: game.player.company || 'Independent',
    score: game.finalScore,
    prizeLevel: game.prizeLevel,
    questionsAnswered: game.questionsAnswered,
    correctAnswers: game.correctAnswers,
    won: game.status === 'WON',
  }));
}

export function getSocket() {
  return io;
}