import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat64 "mo:core/Nat64";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type Story = {
    id : Nat;
    title : Text;
    section : Text;
    reporter : Text;
    status : Text;
    priority : Text;
    deadline : ?Int;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type ScheduleEntry = {
    id : Nat;
    timeSlot : Text;
    storyId : ?Nat;
    entryTitle : Text;
    notes : Text;
    date : Text;
    createdAt : Int;
  };

  public type DashboardSummary = {
    totalStories : Nat;
    pitchCount : Nat;
    assignedCount : Nat;
    inProgressCount : Nat;
    reviewCount : Nat;
    publishedCount : Nat;
    killedCount : Nat;
    overdueCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module Story {
    public func compare(story1 : Story, story2 : Story) : Order.Order {
      Nat.compare(story1.id, story2.id);
    };
  };

  module ScheduleEntry {
    public func compare(entry1 : ScheduleEntry, entry2 : ScheduleEntry) : Order.Order {
      Nat.compare(entry1.id, entry2.id);
    };
  };

  // Storage
  var nextStoryId = 1;
  var nextScheduleId = 1;

  let stories = Map.empty<Nat, Story>();
  let scheduleEntries = Map.empty<Nat, ScheduleEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Story CRUD
  public shared ({ caller }) func createStory(
    title : Text,
    section : Text,
    reporter : Text,
    status : Text,
    priority : Text,
    deadline : ?Int,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    let now = Time.now();
    let story : Story = {
      id = nextStoryId;
      title;
      section;
      reporter;
      status;
      priority;
      deadline;
      notes;
      createdAt = now;
      updatedAt = now;
    };

    stories.add(nextStoryId, story);
    nextStoryId += 1;
    story.id;
  };

  public shared ({ caller }) func updateStory(
    id : Nat,
    title : Text,
    section : Text,
    reporter : Text,
    status : Text,
    priority : Text,
    deadline : ?Int,
    notes : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update stories");
    };

    switch (stories.get(id)) {
      case (null) { Runtime.trap("Story not found") };
      case (?existing) {
        let updatedStory : Story = {
          id;
          title;
          section;
          reporter;
          status;
          priority;
          deadline;
          notes;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        stories.add(id, updatedStory);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteStory(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete stories");
    };

    switch (stories.get(id)) {
      case (null) { Runtime.trap("Story not found") };
      case (?_) {
        stories.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getStory(id : Nat) : async ?Story {
    stories.get(id);
  };

  public query ({ caller }) func getAllStories() : async [Story] {
    stories.values().toArray().sort();
  };

  public query ({ caller }) func getStoriesByStatus(status : Text) : async [Story] {
    stories.values().toArray().sort().filter(
      func(story) {
        story.status == status;
      }
    );
  };

  // Schedule CRUD
  public shared ({ caller }) func createScheduleEntry(
    timeSlot : Text,
    storyId : ?Nat,
    entryTitle : Text,
    notes : Text,
    date : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create schedule entries");
    };

    let now = Time.now();
    let entry : ScheduleEntry = {
      id = nextScheduleId;
      timeSlot;
      storyId;
      entryTitle;
      notes;
      date;
      createdAt = now;
    };

    scheduleEntries.add(nextScheduleId, entry);
    nextScheduleId += 1;
    entry.id;
  };

  public shared ({ caller }) func updateScheduleEntry(
    id : Nat,
    timeSlot : Text,
    storyId : ?Nat,
    entryTitle : Text,
    notes : Text,
    date : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update schedule entries");
    };

    switch (scheduleEntries.get(id)) {
      case (null) { Runtime.trap("Schedule entry not found") };
      case (?existing) {
        let updatedEntry : ScheduleEntry = {
          id;
          timeSlot;
          storyId;
          entryTitle;
          notes;
          date;
          createdAt = existing.createdAt;
        };
        scheduleEntries.add(id, updatedEntry);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteScheduleEntry(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete schedule entries");
    };
    switch (scheduleEntries.get(id)) {
      case (null) { Runtime.trap("Schedule entry not found") };
      case (?_) {
        scheduleEntries.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getScheduleEntriesByDate(date : Text) : async [ScheduleEntry] {
    scheduleEntries.values().toArray().sort().filter(
      func(entry) {
        entry.date == date;
      }
    );
  };

  // Dashboard Summary
  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    let allStories = stories.values().toArray();
    let now = Time.now();

    var pitchCount = 0;
    var assignedCount = 0;
    var inProgressCount = 0;
    var reviewCount = 0;
    var publishedCount = 0;
    var killedCount = 0;
    var overdueCount = 0;

    for (story in allStories.vals()) {
      switch (story.status) {
        case ("Pitch") { pitchCount += 1 };
        case ("Assigned") { assignedCount += 1 };
        case ("InProgress") { inProgressCount += 1 };
        case ("Review") { reviewCount += 1 };
        case ("Published") { publishedCount += 1 };
        case ("Killed") { killedCount += 1 };
        case (_) {};
      };

      switch (story.deadline) {
        case (?deadline) {
          if (deadline < now and story.status != "Published" and story.status != "Killed") {
            overdueCount += 1;
          };
        };
        case (null) {};
      };
    };

    {
      totalStories = allStories.size();
      pitchCount;
      assignedCount;
      inProgressCount;
      reviewCount;
      publishedCount;
      killedCount;
      overdueCount;
    };
  };
};
