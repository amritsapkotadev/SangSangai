import api from './api';

export interface TripGuide {
  id: string;
  name: string;
  avatarUrl: string | null;
  nationality?: string | null;
}

export interface TripRoute {
  id: string;
  name: string;
  region: string;
  durationDays: number;
  difficulty: string;
  imageUrl?: string | null;
  waypoints: {
    id: string;
    name: string;
    order: number;
    estimatedHours: number;
  }[];
}

export interface TripData {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  guide: TripGuide;
  route: TripRoute;
  trekkerId?: string | null;
}

export interface MatchWaypointProgress {
  waypointId: string;
  waypoint: {
    name: string;
    order: number;
    estimatedHours: number;
  };
  confirmedAt: string | null;
}

export interface MatchTrip {
  id: string;
  guide?: TripGuide;
  trekker?: TripGuide | null;
  route: { name: string; region: string };
}

export interface MatchData {
  id: string;
  status: string;
  createdAt: string;
  departedAt: string | null;
  completedAt: string | null;
  guideTrip: MatchTrip;
  trekkerTrip: MatchTrip;
  waypointProgresses: MatchWaypointProgress[];
}

export async function fetchOpenTrips(params?: {
  region?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TripData[]> {
  const searchParams = new URLSearchParams();
  if (params?.region) searchParams.set('region', params.region);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const qs = searchParams.toString();
  const res = await api.get(`/api/trips/matches${qs ? `?${qs}` : ''}`);
  return res.data.data;
}

export async function createTrip(data: {
  routeId: string;
  startDate: string;
  endDate: string;
}): Promise<TripData> {
  const res = await api.post('/api/trips', data);
  return res.data.data;
}

export async function fetchMyMatches(): Promise<MatchData[]> {
  const res = await api.get('/api/matches');
  return res.data.data;
}

export async function createMatch(guideTripId: string, trekkerTripId: string): Promise<MatchData> {
  const res = await api.post('/api/matches', { guideTripId, trekkerTripId });
  return res.data.data;
}

export async function acceptMatch(id: string): Promise<void> {
  await api.put(`/api/matches/${id}/accept`);
}

export async function departMatch(id: string): Promise<void> {
  await api.put(`/api/matches/${id}/depart`);
}

export async function completeMatch(id: string): Promise<{
  match: MatchData;
  sangPointsMinted: number;
  transactionHash: string | null;
}> {
  const res = await api.put(`/api/matches/${id}/complete`);
  return res.data.data;
}

export async function confirmWaypoint(waypointId: string, matchId: string): Promise<void> {
  await api.post(`/api/waypoints/${waypointId}/confirm`, { matchId });
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  avatarUrl: string | null;
  role: string;
}

export async function fetchUserProfile(id: string): Promise<UserProfile> {
  const res = await api.get(`/api/users/${id}`);
  return res.data.data;
}

export interface RouteData {
  id: string;
  name: string;
  description: string;
  region: string;
  durationDays: number;
  difficulty: string;
  imageUrl: string | null;
  waypoints: {
    id: string;
    name: string;
    order: number;
    estimatedHours: number;
  }[];
}

export async function fetchRoutes(name?: string): Promise<RouteData[]> {
  const qs = name ? `?name=${encodeURIComponent(name)}` : '';
  const res = await api.get(`/api/routes${qs}`);
  return res.data.data;
}
