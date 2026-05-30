export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: "NEPALI" | "FOREIGN" | "ADMIN";
  iat?: number;
  exp?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: "NEPALI" | "FOREIGN" | "ADMIN";
  nationality: string | null;
  walletAddress: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  phone: string | null;
};

export type TripWithRoute = {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  guide: { id: string; name: string; avatarUrl: string | null };
  route: {
    id: string;
    name: string;
    region: string;
    durationDays: number;
    difficulty: string;
    waypoints: { name: string; order: number; estimatedHours: number }[];
  };
};

export type MatchWithTrips = {
  id: string;
  status: string;
  createdAt: Date;
  departedAt: Date | null;
  completedAt: Date | null;
  guideTrip: TripWithRoute;
  trekkerTrip: TripWithRoute;
  waypointProgresses: {
    waypointId: string;
    waypoint: { name: string; order: number };
    confirmedAt: Date | null;
  }[];
};
