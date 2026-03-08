import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Edition {
    id: bigint;
    status: string;
    title: string;
    date: string;
    createdAt: bigint;
    notes: string;
    storyIds: Array<bigint>;
}
export interface ScheduleEntry {
    id: bigint;
    date: string;
    storyId?: bigint;
    createdAt: bigint;
    notes: string;
    timeSlot: string;
    entryTitle: string;
}
export interface Reporter {
    id: bigint;
    active: boolean;
    beat: string;
    name: string;
    createdAt: bigint;
    email: string;
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
export interface DashboardSummary {
    totalEditions: bigint;
    pitchCount: bigint;
    inProgressCount: bigint;
    killedCount: bigint;
    overdueCount: bigint;
    assignedCount: bigint;
    publishedCount: bigint;
    reviewCount: bigint;
    totalReporters: bigint;
    totalStories: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEdition(date: string, title: string, notes: string, storyIds: Array<bigint>, status: string): Promise<bigint>;
    createReporter(name: string, beat: string, email: string, active: boolean): Promise<bigint>;
    createScheduleEntry(timeSlot: string, storyId: bigint | null, entryTitle: string, notes: string, date: string): Promise<bigint>;
    createStory(title: string, section: string, reporter: string, status: string, priority: string, deadline: bigint | null, notes: string): Promise<bigint>;
    deleteEdition(id: bigint): Promise<boolean>;
    deleteReporter(id: bigint): Promise<boolean>;
    deleteScheduleEntry(id: bigint): Promise<boolean>;
    deleteStory(id: bigint): Promise<boolean>;
    getActiveReporters(): Promise<Array<Reporter>>;
    getAllEditions(): Promise<Array<Edition>>;
    getAllReporters(): Promise<Array<Reporter>>;
    getAllStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getEdition(id: bigint): Promise<Edition | null>;
    getRecentStories(limit: bigint): Promise<Array<Story>>;
    getReporter(id: bigint): Promise<Reporter | null>;
    getScheduleEntriesByDate(date: string): Promise<Array<ScheduleEntry>>;
    getStoriesByReporter(reporter: string): Promise<Array<Story>>;
    getStoriesByStatus(status: string): Promise<Array<Story>>;
    getStory(id: bigint): Promise<Story | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEdition(id: bigint, date: string, title: string, notes: string, storyIds: Array<bigint>, status: string): Promise<boolean>;
    updateReporter(id: bigint, name: string, beat: string, email: string, active: boolean): Promise<boolean>;
    updateScheduleEntry(id: bigint, timeSlot: string, storyId: bigint | null, entryTitle: string, notes: string, date: string): Promise<boolean>;
    updateStory(id: bigint, title: string, section: string, reporter: string, status: string, priority: string, deadline: bigint | null, notes: string): Promise<boolean>;
}
