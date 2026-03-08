import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Specify the data migration function in with-clause
(with migration = Migration.run)
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

  public type Reporter = {
    id : Nat;
    name : Text;
    beat : Text;
    email : Text;
    active : Bool;
    createdAt : Int;
  };

  public type Edition = {
    id : Nat;
    date : Text;
    title : Text;
    notes : Text;
    storyIds : [Nat];
    status : Text;
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
    totalReporters : Nat;
    totalEditions : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Sorting modules
  module Story {
    public func compare(a : Story, b : Story) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module ScheduleEntry {
    public func compare(a : ScheduleEntry, b : ScheduleEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Reporter {
    public func compare(a : Reporter, b : Reporter) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Edition {
    public func compare(a : Edition, b : Edition) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Storage
  var nextStoryId = 1;
  var nextScheduleId = 1;
  var nextReporterId = 1;
  var nextEditionId = 1;

  let stories = Map.empty<Nat, Story>();
  let scheduleEntries = Map.empty<Nat, ScheduleEntry>();
  let reporters = Map.empty<Nat, Reporter>();
  let editions = Map.empty<Nat, Edition>();
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

  public query ({ caller }) func getStoriesByReporter(reporter : Text) : async [Story] {
    stories.values().toArray().sort().filter(
      func(story) {
        story.reporter == reporter;
      }
    );
  };

  public query ({ caller }) func getRecentStories(limit : Nat) : async [Story] {
    let sorted = stories.values().toArray().sort(
      func(a, b) {
        Int.compare(b.updatedAt, a.updatedAt);
      }
    );
    let size = sorted.size();
    if (size <= limit) { sorted } else {
      Array.tabulate<Story>(limit, func(i) { sorted[i] });
    };
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

  // Reporter CRUD
  public shared ({ caller }) func createReporter(
    name : Text,
    beat : Text,
    email : Text,
    active : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create reporters");
    };

    let now = Time.now();
    let reporter : Reporter = {
      id = nextReporterId;
      name;
      beat;
      email;
      active;
      createdAt = now;
    };

    reporters.add(nextReporterId, reporter);
    nextReporterId += 1;
    reporter.id;
  };

  public shared ({ caller }) func updateReporter(
    id : Nat,
    name : Text,
    beat : Text,
    email : Text,
    active : Bool,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update reporters");
    };

    switch (reporters.get(id)) {
      case (null) { Runtime.trap("Reporter not found") };
      case (?existing) {
        let updatedReporter : Reporter = {
          id;
          name;
          beat;
          email;
          active;
          createdAt = existing.createdAt;
        };
        reporters.add(id, updatedReporter);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteReporter(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete reporters");
    };
    switch (reporters.get(id)) {
      case (null) { Runtime.trap("Reporter not found") };
      case (?_) {
        reporters.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getReporter(id : Nat) : async ?Reporter {
    reporters.get(id);
  };

  public query ({ caller }) func getAllReporters() : async [Reporter] {
    reporters.values().toArray().sort();
  };

  public query ({ caller }) func getActiveReporters() : async [Reporter] {
    reporters.values().toArray().sort().filter(
      func(reporter) {
        reporter.active;
      }
    );
  };

  // Edition CRUD
  public shared ({ caller }) func createEdition(
    date : Text,
    title : Text,
    notes : Text,
    storyIds : [Nat],
    status : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create editions");
    };

    let now = Time.now();
    let edition : Edition = {
      id = nextEditionId;
      date;
      title;
      notes;
      storyIds;
      status;
      createdAt = now;
    };

    editions.add(nextEditionId, edition);
    nextEditionId += 1;
    edition.id;
  };

  public shared ({ caller }) func updateEdition(
    id : Nat,
    date : Text,
    title : Text,
    notes : Text,
    storyIds : [Nat],
    status : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update editions");
    };

    switch (editions.get(id)) {
      case (null) { Runtime.trap("Edition not found") };
      case (?existing) {
        let updatedEdition : Edition = {
          id;
          date;
          title;
          notes;
          storyIds;
          status;
          createdAt = existing.createdAt;
        };
        editions.add(id, updatedEdition);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteEdition(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete editions");
    };
    switch (editions.get(id)) {
      case (null) { Runtime.trap("Edition not found") };
      case (?_) {
        editions.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getEdition(id : Nat) : async ?Edition {
    editions.get(id);
  };

  public query ({ caller }) func getAllEditions() : async [Edition] {
    editions.values().toArray().sort();
  };

  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    let allStories = stories.values().toArray();
    let pitchStories = allStories.filter(
      func(story) {
        story.status == "Pitch";
      }
    );

    let assignedStories = allStories.filter(
      func(story) {
        story.status == "Assigned";
      }
    );

    let inProgressStories = allStories.filter(
      func(story) {
        story.status == "InProgress";
      }
    );

    let reviewStories = allStories.filter(
      func(story) {
        story.status == "Review";
      }
    );

    let publishedStories = allStories.filter(
      func(story) {
        story.status == "Published";
      }
    );

    let killedStories = allStories.filter(
      func(story) {
        story.status == "Killed";
      }
    );

    let overdueStories = allStories.filter(
      func(story) {
        switch (story.deadline) {
          case (?deadline) {
            deadline < Time.now() and story.status != "Published" and story.status != "Killed";
          };
          case (null) { false };
        };
      }
    );

    {
      totalStories = allStories.size();
      pitchCount = pitchStories.size();
      assignedCount = assignedStories.size();
      inProgressCount = inProgressStories.size();
      reviewCount = reviewStories.size();
      publishedCount = publishedStories.size();
      killedCount = killedStories.size();
      overdueCount = overdueStories.size();
      totalReporters = reporters.size();
      totalEditions = editions.size();
    };
  };
};
