import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

module {
  // Types from previous version
  type OldReporter = {
    id : Nat;
    name : Text;
    beat : Text;
    email : Text;
    active : Bool;
    createdAt : Int;
  };

  type OldEdition = {
    id : Nat;
    date : Text;
    title : Text;
    notes : Text;
    storyIds : [Nat];
    status : Text;
    createdAt : Int;
  };

  type OldStory = {
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

  type OldScheduleEntry = {
    id : Nat;
    timeSlot : Text;
    storyId : ?Nat;
    entryTitle : Text;
    notes : Text;
    date : Text;
    createdAt : Int;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    nextStoryId : Nat;
    nextScheduleId : Nat;
    stories : Map.Map<Nat, OldStory>;
    scheduleEntries : Map.Map<Nat, OldScheduleEntry>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // Types for current version (identical in this case)
  type NewReporter = OldReporter;
  type NewEdition = OldEdition;
  type NewStory = OldStory;
  type NewScheduleEntry = OldScheduleEntry;
  type NewUserProfile = OldUserProfile;

  type NewActor = {
    nextStoryId : Nat;
    nextScheduleId : Nat;
    nextReporterId : Nat;
    nextEditionId : Nat;
    stories : Map.Map<Nat, NewStory>;
    scheduleEntries : Map.Map<Nat, NewScheduleEntry>;
    reporters : Map.Map<Nat, NewReporter>;
    editions : Map.Map<Nat, NewEdition>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  // Migration function: Add nextReporterId, nextEditionId, empty reporters/editions maps
  public func run(old : OldActor) : NewActor {
    {
      old with
      nextReporterId = 1;
      nextEditionId = 1;
      reporters = Map.empty<Nat, NewReporter>();
      editions = Map.empty<Nat, NewEdition>();
    };
  };
};
