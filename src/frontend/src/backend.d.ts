import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScheduleEntry {
    id: bigint;
    date: string;
    storyId?: bigint;
    createdAt: bigint;
    notes: string;
    timeSlot: string;
    entryTitle: string;
}
export interface DashboardSummary {
    pitchCount: bigint;
    inProgressCount: bigint;
    killedCount: bigint;
    overdueCount: bigint;
    assignedCount: bigint;
    publishedCount: bigint;
    reviewCount: bigint;
    totalStories: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Story {
    id: bigint;
    status: string;
    title: string;
    createdAt: bigint;
    section: string;
    deadline?: bigint;
    updatedAt: bigint;
    notes: string;
    priority: string;
    reporter: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createScheduleEntry(timeSlot: string, storyId: bigint | null, entryTitle: string, notes: string, date: string): Promise<bigint>;
    createStory(title: string, section: string, reporter: string, status: string, priority: string, deadline: bigint | null, notes: string): Promise<bigint>;
    deleteScheduleEntry(id: bigint): Promise<boolean>;
    deleteStory(id: bigint): Promise<boolean>;
    getAllStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getScheduleEntriesByDate(date: string): Promise<Array<ScheduleEntry>>;
    getStoriesByStatus(status: string): Promise<Array<Story>>;
    getStory(id: bigint): Promise<Story | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateScheduleEntry(id: bigint, timeSlot: string, storyId: bigint | null, entryTitle: string, notes: string, date: string): Promise<boolean>;
    updateStory(id: bigint, title: string, section: string, reporter: string, status: string, priority: string, deadline: bigint | null, notes: string): Promise<boolean>;
}
