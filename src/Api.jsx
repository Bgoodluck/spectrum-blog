


// import { VideoSDKMeeting } from "@videosdk.live/rtc-js-prebuilt";

export const authToken = import.meta.env.VITE_VIDEOSDK_TOKEN;



export const createMeeting = async ({ token }) => {
  try {
    const res = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    
    if (!res.ok) {
      throw new Error(`Failed to create meeting: ${res.status}`);
    }
    
    const { roomId } = await res.json();
    return roomId;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};


export const fetchHlsDownstreamUrl = async ({ meetingId, token }) => {
  try {
    const response = await fetch(
      `https://api.videosdk.live/v2/hls/${meetingId}`,
      {
        method: "GET",
        headers: {
          authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.downstreamUrl;
  } catch (error) {
    console.error("Error fetching HLS URL:", error);
    throw error;
  }
};