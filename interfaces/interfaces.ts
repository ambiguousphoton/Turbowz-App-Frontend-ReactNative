export interface VideoCardInterface {
    VideoID: number; 
    UploaderName: string; 
    UploaderHandle: string;
    UploaderID?: number;
    Title: string; 
    Views: number;
    VideoURL: string; 
    Date: string;
}

export interface VideoDetailsInterface{
    VideoID: number;
    Uploader_Name: string;
    Uploader_ID: number;
    Uploader_Handle: string;
    Title: string;
    Views: number;
    Video_Info: string;
    Luvs: number;
    Upload_Time: string;
    Already_Luved: boolean;
}


export interface UserSignUpInterface {
  user_handle: string;
  user_profile_name: string;
  userDescription: string;
  fromLocation: string;
  userDateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  password: string;
}


export interface UserSignInInterface {
  user_handle: string;
  password: string;
}

export interface  CommentInterface{
  Commenter_Name : string;
  Comment_id: number;
  Commenter_id: number;
  Parent_video_id: number;
  Comment_text: string;
  Comment_date: string;
  Commenter_Handle: string;
}


export interface UserDataInterface {
  UserID: number;
  UserHandle: string;
  UserProfileName: string;
  UserDescription: string;
  FromLocation: string;
  Gender: string;
};


export interface EcoDataInterface{
  Eco_Text: string
  Eco_Id: number
  Eco_Url: string
  Images_Count: number
  Created_At: string
  View_Count: number
  Comment_Count: number
  Luv_Count: number
  Uploader_Name: string
  Uploader_Handle: string
  Uploader_ID: number
  Save_Count: number
  Already_Luved: boolean
}


export interface MessageData{
  Message_ID: number
  Message_Text: string
  Source_ID: number
  Destination_ID: number
  Source_Sent_Time: string
  links : string
  Destination_Receive_Time: string
  Room_ID: string
}