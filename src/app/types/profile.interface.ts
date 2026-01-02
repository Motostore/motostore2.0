export interface Profile {
    username: string;
    name: string;
    identificationCard: string;
  }

export interface ProfileContext {
    profile : Profile;
  }